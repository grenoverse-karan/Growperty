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
