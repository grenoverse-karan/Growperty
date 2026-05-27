import express from 'express';
import Property from '../models/Property.js';
import logger from '../utils/logger.js';
import { verifyToken } from '../utils/jwt.js';
import { sendTemplateAsync } from '../utils/whatsappTemplates.js';

const router = express.Router();

const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(auth.slice(7));
      req.userId = payload.sub;
    } catch { /* ignore invalid token */ }
  }
  next();
};

const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Login required to list a property.' });
  try {
    const payload = verifyToken(auth.slice(7));
    req.userId = payload.sub || payload.email || 'admin';
    req.isAdmin = payload.role === 'admin';
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
};

const requiredFields = [
  'owner_id', 'propertyType', 'city', 'sector', 'houseNo',
  'totalPrice', 'totalArea', 'areaUnit', 'areaType',
  'mobileNumber', 'ownerType', 'name',
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
router.post('/', requireAuth, async (req, res) => {
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
    status: data.listedBy === 'admin' ? (data.status || 'approved') : 'pending',
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

  // Notify property owner via WhatsApp when admin explicitly approves their listing
  if (data.status === 'approved' && updated.mobileNumber) {
    const ownerName = updated.name || 'there';
    const propertyType = updated.propertyType || 'Property';
    const city = updated.city || '';
    const price = updated.totalPrice
      ? `₹${Number(updated.totalPrice).toLocaleString('en-IN')}`
      : 'contact for price';
    const propertyLink = `https://growperty.com/property/${updated._id}`;

    sendTemplateAsync(updated.mobileNumber, 'property_alert', {
      recipientName: ownerName,
      propertyType,
      city,
      price,
      propertyLink,
    });
    logger.info('[WA] property_alert queued', { id: req.params.id, phone: updated.mobileNumber });
  }

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
