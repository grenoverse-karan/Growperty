import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import logger from '../utils/logger.js';
import verifyAdminToken from '../middleware/verifyAdminToken.js';
import Property from '../models/Property.js';
import ChannelPartner from '../models/ChannelPartner.js';
import VisitRequest from '../models/VisitRequest.js';
import { connectMongoDB } from '../utils/mongodb.js';

const router = express.Router();

// =====================
// POST /login - Authenticate admin
// =====================
router.post('/login', (req, res) => {
  console.log('[admin/login] Request received', { body: req.body });

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      console.log('[admin/login] Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const JWT_SECRET     = process.env.JWT_SECRET || 'growperty-jwt-secret';

    console.log('[admin/login] Env check — ADMIN_EMAIL set:', !!ADMIN_EMAIL, '| ADMIN_PASSWORD set:', !!ADMIN_PASSWORD);

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      logger.error('[admin/login] ADMIN_EMAIL or ADMIN_PASSWORD env vars are not set');
      return res.status(500).json({ error: 'Server misconfiguration: admin credentials not configured' });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      console.log('[admin/login] Credentials mismatch');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

    console.log('[admin/login] Login successful, token issued');
    logger.info('Admin login successful', { email });

    return res.status(200).json({ token, admin: { email } });
  } catch (err) {
    console.error('[admin/login] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================
// GET /me - Get current admin (protected)
// =====================
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.slice(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'growperty-jwt-secret';

    const payload = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ email: payload.email, role: payload.role });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// =====================
// GET /properties - List properties with pagination (protected)
// =====================
router.get('/properties', verifyAdminToken, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [docs, totalItems] = await Promise.all([
      Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Property.countDocuments(filter),
    ]);

    const items = docs.map(p => ({ ...p, id: p._id.toString() }));

    return res.status(200).json({ items, totalItems, page, perPage: limit, totalPages: Math.ceil(totalItems / limit) });
  } catch (err) {
    logger.error('Failed to fetch admin properties:', err.message);
    return res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// =====================
// PUT /properties/:id/status - Update property status (protected)
// =====================
router.put('/properties/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'rejected', 'suspended'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Property not found' });

    logger.info(`Property ${req.params.id} status → ${status}`);
    return res.status(200).json({ success: true, id: updated._id.toString(), status: updated.status });
  } catch (err) {
    logger.error('Failed to update property status:', err.message);
    return res.status(500).json({ error: 'Failed to update property status' });
  }
});

// =====================
// GET /stats - Dashboard statistics (protected)
// =====================
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todaysNew, totalPending, activeListings, suspendedAccounts] = await Promise.all([
      Property.countDocuments({ createdAt: { $gte: todayStart } }),
      Property.countDocuments({ status: 'pending' }),
      Property.countDocuments({ status: 'approved' }),
      Property.countDocuments({ status: 'suspended' }),
    ]);

    return res.status(200).json({ todaysNew, totalPending, activeListings, suspendedAccounts });
  } catch (err) {
    logger.error('Failed to fetch stats:', err.message);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// =====================
// GET /admin/channel-partners — List all CP applications (protected)
// =====================
router.get('/channel-partners', verifyAdminToken, async (req, res) => {
  try {
    await connectMongoDB();
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 50));
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [docs, total] = await Promise.all([
      ChannelPartner.find(filter).select('-passwordHash -activities').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ChannelPartner.countDocuments(filter),
    ]);

    const items = docs.map(cp => ({ ...cp, id: cp._id.toString() }));
    return res.status(200).json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    logger.error('[Admin] GET /channel-partners error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch channel partners' });
  }
});

// =====================
// GET /admin/channel-partners/:id — Get single CP with stats (protected)
// =====================
router.get('/channel-partners/:id', verifyAdminToken, async (req, res) => {
  try {
    await connectMongoDB();
    const cp = await ChannelPartner.findById(req.params.id).select('-passwordHash').lean();
    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });

    const [listings, visits] = await Promise.all([
      Property.find({ cpId: req.params.id }, { images: 0 }).sort({ createdAt: -1 }).limit(50).lean(),
      VisitRequest.find({
        propertyId: { $in: (await Property.find({ cpId: req.params.id }, { _id: 1 }).lean()).map(p => p._id.toString()) },
      }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);

    return res.status(200).json({
      cp: { ...cp, id: cp._id.toString() },
      listings: listings.map(p => ({ ...p, id: p._id.toString() })),
      visits: visits.map(v => ({ ...v, id: v._id.toString() })),
    });
  } catch (err) {
    logger.error('[Admin] GET /channel-partners/:id error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch channel partner' });
  }
});

// =====================
// PUT /admin/channel-partners/:id/approve — Approve CP and set password (protected)
// =====================
router.put('/channel-partners/:id/approve', verifyAdminToken, async (req, res) => {
  try {
    await connectMongoDB();
    const { password } = req.body || {};
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const shareToken = randomBytes(16).toString('hex');
    const cp = await ChannelPartner.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'approved', passwordHash, shareToken } },
      { new: true, runValidators: true }
    ).select('-passwordHash').lean();

    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });

    logger.info('[Admin] CP approved', { id: req.params.id });
    return res.status(200).json({ success: true, cp: { ...cp, id: cp._id.toString() } });
  } catch (err) {
    logger.error('[Admin] CP approve error', { error: err.message });
    return res.status(500).json({ error: 'Failed to approve channel partner' });
  }
});

// =====================
// PUT /admin/channel-partners/:id/reject — Reject CP (protected)
// =====================
router.put('/channel-partners/:id/reject', verifyAdminToken, async (req, res) => {
  try {
    await connectMongoDB();
    const cp = await ChannelPartner.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'rejected' } },
      { new: true }
    ).select('-passwordHash -activities').lean();

    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });

    logger.info('[Admin] CP rejected', { id: req.params.id });
    return res.status(200).json({ success: true, cp: { ...cp, id: cp._id.toString() } });
  } catch (err) {
    logger.error('[Admin] CP reject error', { error: err.message });
    return res.status(500).json({ error: 'Failed to reject channel partner' });
  }
});

// =====================
// PUT /admin/channel-partners/:id — Edit CP details (protected)
// =====================
router.put('/channel-partners/:id', verifyAdminToken, async (req, res) => {
  try {
    await connectMongoDB();
    const { name, phone, companyName, city, email } = req.body || {};
    const updates = {};
    if (name)        updates.name        = name.trim();
    if (email)       updates.email       = email.toLowerCase().trim();
    if (phone)       updates.phone       = phone;
    if (companyName !== undefined) updates.companyName = companyName?.trim() || '';
    if (city)        updates.city        = city.trim();

    const cp = await ChannelPartner.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash -activities').lean();

    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });

    logger.info('[Admin] CP updated', { id: req.params.id });
    return res.status(200).json({ success: true, cp: { ...cp, id: cp._id.toString() } });
  } catch (err) {
    logger.error('[Admin] CP edit error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update channel partner' });
  }
});

// =====================
// PUT /admin/channel-partners/:id/ban — Ban CP (protected)
// Body: { type: 'temporary'|'permanent', days?: number }
// =====================
router.put('/channel-partners/:id/ban', verifyAdminToken, async (req, res) => {
  try {
    await connectMongoDB();
    const { type, days } = req.body || {};
    if (!type || !['temporary', 'permanent'].includes(type)) {
      return res.status(400).json({ error: 'type must be "temporary" or "permanent"' });
    }
    if (type === 'temporary' && (!days || days < 1)) {
      return res.status(400).json({ error: 'days must be a positive number for temporary ban' });
    }

    const bannedUntil = type === 'temporary'
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      : null;

    const cp = await ChannelPartner.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'banned', bannedUntil } },
      { new: true }
    ).select('-passwordHash -activities').lean();

    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });

    logger.info('[Admin] CP banned', { id: req.params.id, type, days });
    return res.status(200).json({ success: true, cp: { ...cp, id: cp._id.toString() } });
  } catch (err) {
    logger.error('[Admin] CP ban error', { error: err.message });
    return res.status(500).json({ error: 'Failed to ban channel partner' });
  }
});

// =====================
// PUT /admin/channel-partners/:id/unban — Unban CP (protected)
// =====================
router.put('/channel-partners/:id/unban', verifyAdminToken, async (req, res) => {
  try {
    await connectMongoDB();
    const cp = await ChannelPartner.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'approved', bannedUntil: null } },
      { new: true }
    ).select('-passwordHash -activities').lean();

    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });

    logger.info('[Admin] CP unbanned', { id: req.params.id });
    return res.status(200).json({ success: true, cp: { ...cp, id: cp._id.toString() } });
  } catch (err) {
    logger.error('[Admin] CP unban error', { error: err.message });
    return res.status(500).json({ error: 'Failed to unban channel partner' });
  }
});

// =====================
// PUT /admin/channel-partners/:id/access — Update CP access flags (protected)
// Body: { canAddListings, canViewLeads, canViewVisits, canViewActivities }
// =====================
router.put('/channel-partners/:id/access', verifyAdminToken, async (req, res) => {
  try {
    await connectMongoDB();
    const { canAddListings, canViewLeads, canViewVisits, canViewActivities } = req.body || {};
    const accessUpdate = {};
    if (canAddListings    !== undefined) accessUpdate['access.canAddListings']    = Boolean(canAddListings);
    if (canViewLeads      !== undefined) accessUpdate['access.canViewLeads']      = Boolean(canViewLeads);
    if (canViewVisits     !== undefined) accessUpdate['access.canViewVisits']     = Boolean(canViewVisits);
    if (canViewActivities !== undefined) accessUpdate['access.canViewActivities'] = Boolean(canViewActivities);

    const cp = await ChannelPartner.findByIdAndUpdate(
      req.params.id,
      { $set: accessUpdate },
      { new: true }
    ).select('-passwordHash -activities').lean();

    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });

    logger.info('[Admin] CP access updated', { id: req.params.id });
    return res.status(200).json({ success: true, cp: { ...cp, id: cp._id.toString() } });
  } catch (err) {
    logger.error('[Admin] CP access update error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update access' });
  }
});

// =====================
// DELETE /admin/channel-partners/:id — Delete CP (protected)
// =====================
router.delete('/channel-partners/:id', verifyAdminToken, async (req, res) => {
  try {
    await connectMongoDB();
    const cp = await ChannelPartner.findByIdAndDelete(req.params.id).lean();
    if (!cp) return res.status(404).json({ error: 'Channel partner not found' });

    logger.info('[Admin] CP deleted', { id: req.params.id });
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error('[Admin] CP delete error', { error: err.message });
    return res.status(500).json({ error: 'Failed to delete channel partner' });
  }
});

export default router;