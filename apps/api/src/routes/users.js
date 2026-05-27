import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { connectMongoDB } from '../utils/mongodb.js';
import { sendTemplateAsync, sendTemplateMessage } from '../utils/whatsappTemplates.js';
import logger from '../utils/logger.js';

const router = express.Router();

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyToken(auth.slice(7));
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ── Admin: GET /users — list all users ───────────────────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res) => {
  await connectMongoDB();
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 50));
  const skip  = (page - 1) * limit;
  const search = req.query.search?.trim();

  const filter = search
    ? { $or: [
        { name:  { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ] }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
});

// ── Admin: DELETE /users/:id — delete one user ───────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  await connectMongoDB();
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'User not found' });
  logger.info('[Admin] User deleted', { id: req.params.id });
  res.json({ success: true });
});

// ── Admin: POST /users/bulk-delete — delete multiple users ───────────────────
router.post('/bulk-delete', authenticate, requireAdmin, async (req, res) => {
  await connectMongoDB();
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0)
    return res.status(400).json({ error: 'ids array required' });
  const result = await User.deleteMany({ _id: { $in: ids } });
  logger.info('[Admin] Bulk user delete', { count: result.deletedCount });
  res.json({ success: true, deleted: result.deletedCount });
});

router.get('/me', authenticate, async (req, res) => {
  await connectMongoDB();
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.patch('/me', authenticate, async (req, res) => {
  await connectMongoDB();
  const { name, city, role } = req.body;

  logger.info('[PATCH /users/me] Request received', { userId: req.userId, body: { name, city, role } });

  const existing = await User.findById(req.userId).select('name phone');
  if (!existing) {
    logger.warn('[PATCH /users/me] User not found', { userId: req.userId });
    return res.status(404).json({ error: 'User not found' });
  }

  const hadNoName = !existing.name || existing.name.trim() === '';
  const settingName = !!(name && name.trim() !== '');

  logger.info('[PATCH /users/me] sign_up trigger check', {
    userId: req.userId,
    existingName: existing.name || '(empty)',
    hadNoName,
    incomingName: name || '(not provided)',
    settingName,
    hasPhone: !!existing.phone,
    phone: existing.phone || '(none)',
    willTrigger: hadNoName && settingName && !!existing.phone,
  });

  const update = {};
  if (name !== undefined) update.name = name.trim();
  if (city !== undefined) update.city = city.trim();
  if (role && ['buyer', 'seller'].includes(role)) update.role = role;

  const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-passwordHash');
  logger.info('[PATCH /users/me] User updated in DB', { userId: req.userId, updatedFields: Object.keys(update) });

  // Send sign_up welcome message the first time a user sets their name
  if (hadNoName && settingName && existing.phone) {
    logger.info('[PATCH /users/me] Triggering sign_up WhatsApp template', {
      phone: existing.phone,
      userName: name.trim(),
    });

    const result = await sendTemplateMessage(existing.phone, 'sign_up', {
      userName: name.trim(),
    });

    logger.info('[PATCH /users/me] sign_up template result', {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
  } else {
    logger.info('[PATCH /users/me] sign_up NOT triggered', {
      reason: !hadNoName ? 'user already had a name' : !settingName ? 'no name in request' : 'no phone number',
    });
  }

  res.json(user);
});

router.delete('/me', authenticate, async (req, res) => {
  await connectMongoDB();
  await User.findByIdAndDelete(req.userId);
  res.json({ success: true });
});

export default router;
