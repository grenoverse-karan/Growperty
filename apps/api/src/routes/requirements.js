import express from 'express';
import BuyerRequirement from '../models/BuyerRequirement.js';
import { connectMongoDB } from '../utils/mongodb.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /requirements
router.post('/', async (req, res) => {
  try {
    await connectMongoDB();
    const doc = await BuyerRequirement.create(req.body);
    logger.info('[Requirements] New requirement saved', { id: doc._id, phone: doc.buyerPhone });
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

// GET /requirements (admin)
router.get('/', async (req, res) => {
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

export default router;
