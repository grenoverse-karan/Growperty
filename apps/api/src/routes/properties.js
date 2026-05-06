import express from 'express';
import Property from '../models/Property.js';
import logger from '../utils/logger.js';

const router = express.Router();

const requiredFields = [
  'owner_id', 'propertyType', 'city', 'sector', 'houseNo',
  'totalPrice', 'totalArea', 'areaUnit', 'areaType',
  'email', 'mobileNumber', 'ownerType', 'name',
];

function validateRequiredFields(data) {
  for (const field of requiredFields) {
    const value = data[field];
    if (value === null || value === undefined || String(value).trim() === '') {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// =====================
// POST / — Create property
// =====================
router.post('/', async (req, res) => {
  logger.info('POST /api/properties received');

  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ success: false, message: 'Request body must be JSON' });
  }

  try {
    validateRequiredFields(data);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const property = new Property({
    ...data,
    status: 'pending',
  });

  const saved = await property.save();
  logger.info('Property created', { id: saved._id });

  return res.status(201).json({
    success: true,
    propertyId: saved._id.toString(),
    message: 'Property listed successfully',
  });
});

// =====================
// GET / — List properties
// =====================
router.get('/', async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  const filter = req.query.status ? { status: req.query.status } : {};

  const [docs, totalItems] = await Promise.all([
    Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Property.countDocuments(filter),
  ]);

  const items = docs.map(p => ({ ...p, id: p._id.toString() }));

  return res.status(200).json({
    items,
    page,
    perPage: limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  });
});

// =====================
// GET /:id — Get single property
// =====================
router.get('/:id', async (req, res) => {
  const property = await Property.findById(req.params.id).lean();
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }
  return res.status(200).json({ ...property, id: property._id.toString() });
});

// =====================
// PUT /:id — Update property
// =====================
router.put('/:id', async (req, res) => {
  const data = { ...req.body };
  delete data._id;
  delete data.createdAt;
  delete data.updatedAt;

  const updated = await Property.findByIdAndUpdate(
    req.params.id,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  logger.info('Property updated', { id: req.params.id });
  return res.status(200).json({ success: true, propertyId: updated._id.toString() });
});

// =====================
// DELETE /:id — Delete property
// =====================
router.delete('/:id', async (req, res) => {
  const deleted = await Property.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }
  logger.info('Property deleted', { id: req.params.id });
  return res.status(200).json({ success: true, message: 'Property deleted successfully' });
});

export default router;
