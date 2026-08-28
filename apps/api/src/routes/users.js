import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import Property from '../models/Property.js';
import { verifyToken } from '../utils/jwt.js';
import { connectMongoDB } from '../utils/mongodb.js';
import { sendTemplateAsync, sendTemplateMessage } from '../utils/whatsappTemplates.js';
import logger from '../utils/logger.js';

const ROLES_OPTIONS = ['Seller', 'Buyer', 'Investor', 'Builder'];

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

// Self-delete — registered BEFORE the admin /:id route below so "me" is never
// matched as an :id param (Express matches route patterns in registration order).
router.delete('/me', authenticate, async (req, res) => {
  await connectMongoDB();
  await User.findByIdAndDelete(req.userId);
  res.json({ success: true });
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
  const { name, city, role, roles, source, email } = req.body;

  logger.info('[PATCH /users/me] Request received', { userId: req.userId, body: { name, city, role, roles, source, email } });

  const existing = await User.findById(req.userId).select('name phone provider whatsappOptIn');
  if (!existing) {
    logger.warn('[PATCH /users/me] User not found', { userId: req.userId });
    return res.status(404).json({ error: 'User not found' });
  }

  const hadNoName = !existing.name || existing.name.trim() === '';
  const settingName = !!(name && name.trim() !== '');

  const update = {};
  if (name !== undefined) update.name = name.trim();
  if (city !== undefined) update.city = city.trim();
  if (role && ['buyer', 'seller'].includes(role)) update.role = role;
  if (Array.isArray(roles)) update.roles = roles.filter(r => ROLES_OPTIONS.includes(r));

  if (email !== undefined) {
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail) {
      if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
        return res.status(400).json({ error: 'Enter a valid email address' });
      }
      const conflict = await User.findOne({ email: trimmedEmail, _id: { $ne: req.userId } }).lean();
      if (conflict) {
        return res.status(409).json({ error: 'This email is already linked to another account.' });
      }
      update.email = trimmedEmail;
    }
  }

  const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-passwordHash');
  logger.info('[PATCH /users/me] User updated in DB', { userId: req.userId, updatedFields: Object.keys(update) });

  // Send welcome on first-time profile completion (OTP signup or Google complete)
  const welcomeSources = ['otp_signup', 'google_complete'];
  const phoneForWelcome = existing.phone || (req.body.phone ? String(req.body.phone) : null);
  if (hadNoName && settingName && phoneForWelcome && welcomeSources.includes(source)) {
    logger.info('[PATCH /users/me] Sending welcome template', { phone: phoneForWelcome, userName: name.trim() });
    sendTemplateMessage(phoneForWelcome, 'welcome', { userName: name.trim() }).catch(() => {});
  }

  res.json(user);
});

// ── Change / set password ────────────────────────────────────────────────────
router.post('/me/change-password', authenticate, async (req, res) => {
  await connectMongoDB();
  const { currentPassword, newPassword } = req.body || {};

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.userId).select('passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Users who signed up via WhatsApp/Google never set a password — let them set one
  // without verifying a "current" password they never had.
  if (user.passwordHash) {
    if (!currentPassword) return res.status(400).json({ error: 'Current password is required' });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  logger.info('[POST /users/me/change-password] Password updated', { userId: req.userId });
  res.json({ success: true });
});

// ── Wishlist ──────────────────────────────────────────────────────────────
router.get('/me/wishlist', authenticate, async (req, res) => {
  await connectMongoDB();
  const wishlist = await Wishlist.findOne({ userId: req.userId }).lean();
  const ids = wishlist?.propertyIds || [];
  if (!ids.length) return res.json({ items: [] });

  const docs = await Property.find({ _id: { $in: ids } }, { images: { $slice: 1 } }).lean();
  const items = docs.map(p => ({ ...p, id: p._id.toString() }));
  res.json({ items });
});

router.post('/me/wishlist/:propertyId/toggle', authenticate, async (req, res) => {
  await connectMongoDB();
  const { propertyId } = req.params;

  let wishlist = await Wishlist.findOne({ userId: req.userId });
  if (!wishlist) wishlist = new Wishlist({ userId: req.userId, propertyIds: [] });

  const has = wishlist.propertyIds.includes(propertyId);
  wishlist.propertyIds = has
    ? wishlist.propertyIds.filter(id => id !== propertyId)
    : [...wishlist.propertyIds, propertyId];
  await wishlist.save();

  res.json({ success: true, wishlisted: !has });
});

export default router;
