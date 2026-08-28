import express from 'express';
import BuyerRequirement from '../models/BuyerRequirement.js';
import ChannelPartner from '../models/ChannelPartner.js';
import CPVisitor from '../models/CPVisitor.js';
import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { connectMongoDB } from '../utils/mongodb.js';
import logger from '../utils/logger.js';
import { sendTemplateAsync } from '../utils/whatsappTemplates.js';

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.userId = verifyToken(auth.slice(7)).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authenticateAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyToken(auth.slice(7));
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

function formatIndianPrice(n) {
  if (!n || isNaN(n)) return '-';
  const num = Number(n);
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(2).replace(/\.?0+$/, '')} Lac`;
  return `₹${num.toLocaleString('en-IN')}`;
}

const router = express.Router();

// POST /requirements
router.post('/', async (req, res) => {
  try {
    await connectMongoDB();
    const { cpPublicId, refToken, visitorToken, ...body } = req.body || {};

    // Resolve the sitewide referral cookie pair to a validated cpId for lead credit
    let cpId = '';
    if (cpPublicId && refToken) {
      try {
        const cp = await ChannelPartner.findOne({ cpPublicId, refToken, status: 'approved' }).select('_id').lean();
        if (cp) cpId = cp._id.toString();
      } catch { /* non-blocking */ }
    }

    const doc = await BuyerRequirement.create({ ...body, ...(cpId && { cpId }), cpVisitorToken: visitorToken || '' });
    logger.info('[Requirements] New requirement saved', { id: doc._id, phone: doc.buyerPhone });

    // Escalate the linked CPVisitor tracking record to 'inquiry' and notify the CP
    if (visitorToken) {
      CPVisitor.recordInquiry(visitorToken, { name: doc.buyerName, phone: doc.buyerPhone, stage: 'inquiry' })
        .then(async (visitor) => {
          if (!visitor) return;
          const rank = await CPVisitor.countDocuments({ cpId: visitor.cpId, firstVisit: { $lt: visitor.firstVisit } });
          const label = [doc.propertyType, doc.city].filter(Boolean).join(' in ') || 'a property';
          await ChannelPartner.findByIdAndUpdate(visitor.cpId, {
            $push: { activities: { type: 'visitor_inquiry', message: `Visitor #${rank + 1} submitted an inquiry — ${label}`, createdAt: new Date() } },
          });
        })
        .catch(err => logger.warn('[CPVisitor] recordInquiry (requirement) failed', { error: err.message }));
    }

    // WhatsApp confirmation to buyer
    if (doc.buyerPhone) {
      const size = doc.preferredBhk || '-';
      const area = (doc.areas?.length ? doc.areas[0] : doc.buyerAddress) || '-';
      const maxBudget = doc.maxBudget ? formatIndianPrice(doc.maxBudget) : '-';
      sendTemplateAsync(doc.buyerPhone, 'requirement_submitted', {
        userName:     doc.buyerName || 'there',
        size,
        propertyType: doc.propertyType || '-',
        area,
        city:         doc.city || doc.buyerCity || '-',
        maxBudget,
      });
    }

    return res.status(201).json({ success: true, id: doc._id });
  } catch (err) {
    logger.error('[Requirements] Save error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /requirements/public — public buyer listings (no contact info exposed)
router.get('/public', async (req, res) => {
  try {
    await connectMongoDB();
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const filter = { status: 'active' };
    if (req.query.city)         filter.city         = req.query.city;
    if (req.query.propertyType) filter.propertyType = req.query.propertyType;
    if (req.query.preferredBhk) filter.preferredBhk = req.query.preferredBhk;

    const items = await BuyerRequirement.find(filter, {
      buyerName: 1, propertyType: 1, propertySubType: 1,
      preferredBhk: 1, city: 1, buyerAddress: 1,
      minBudget: 1, maxBudget: 1, specialRequirements: 1, dealBreakers: 1,
      createdAt: 1,
      // buyerPhone and buyerEmail intentionally excluded
    }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    return res.json({ items, page });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /requirements/mine — requirements posted by the logged-in user (matched by their phone)
router.get('/mine', authenticate, async (req, res) => {
  try {
    await connectMongoDB();
    const user = await User.findById(req.userId).select('phone').lean();
    if (!user?.phone) return res.json({ items: [] });

    const last10 = user.phone.replace(/\D/g, '').slice(-10);
    const items = await BuyerRequirement.find({ buyerPhone: new RegExp(last10 + '$') })
      .sort({ createdAt: -1 }).lean();
    return res.json({ items: items.map(r => ({ ...r, id: r._id.toString() })) });
  } catch (err) {
    logger.error('[Requirements] /mine error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /requirements (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    await connectMongoDB();
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;
    const [items, total] = await Promise.all([
      BuyerRequirement.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BuyerRequirement.countDocuments(),
    ]);
    return res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /requirements/:id (admin) — lead temperature, featured/boost, unlist/relist
const PATCHABLE_FIELDS = {
  leadTemperature: (v) => v === null || ['Hot', 'Warm', 'Cold'].includes(v),
  featured:        (v) => typeof v === 'boolean',
  status:          (v) => ['active', 'unlisted'].includes(v),
};

router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    await connectMongoDB();
    const update = {};
    for (const [field, isValid] of Object.entries(PATCHABLE_FIELDS)) {
      if (field in req.body) {
        if (!isValid(req.body[field])) {
          return res.status(400).json({ success: false, error: `Invalid value for ${field}` });
        }
        update[field] = req.body[field];
      }
    }
    if (!Object.keys(update).length) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    const doc = await BuyerRequirement.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!doc) return res.status(404).json({ success: false, error: 'Requirement not found' });

    logger.info('[Requirements] Admin update', { id: req.params.id, update });
    return res.json({ success: true, item: doc });
  } catch (err) {
    logger.error('[Requirements] PATCH error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /requirements/:id (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await connectMongoDB();
    const doc = await BuyerRequirement.findByIdAndDelete(req.params.id).lean();
    if (!doc) return res.status(404).json({ success: false, error: 'Requirement not found' });

    logger.info('[Requirements] Admin delete', { id: req.params.id });
    return res.json({ success: true });
  } catch (err) {
    logger.error('[Requirements] DELETE error', { error: err.message });
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
