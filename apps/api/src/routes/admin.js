import express from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import verifyAdminToken from '../middleware/verifyAdminToken.js';
import Property from '../models/Property.js';

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

export default router;