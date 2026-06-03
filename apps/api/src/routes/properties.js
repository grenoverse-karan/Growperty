import express from 'express';
import Property from '../models/Property.js';
import logger from '../utils/logger.js';
import { verifyToken } from '../utils/jwt.js';
import { sendTemplateMessage } from '../utils/whatsappTemplates.js';

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

    const property = new Property({
      ...data,
      status: data.listedBy === 'admin' ? (data.status || 'approved') : 'pending',
    });

    const saved = await property.save();
    logger.info('Property created', { id: saved._id });

    // Notify lister based on status
    if (saved.mobileNumber) {
      const ownerName = saved.name || 'there';
      if (saved.status === 'pending') {
        await sendTemplateMessage(saved.mobileNumber, 'under_review', { userName: ownerName });
        logger.info('[WA] under_review sent', { id: saved._id, phone: saved.mobileNumber });
      } else if (saved.status === 'approved') {
        // Admin-listed property — goes live directly
        const propertyUrl = `https://growperty.com/property/${saved._id}`;
        await sendTemplateMessage(saved.mobileNumber, 'property_approved', { userName: ownerName, propertyUrl });
        logger.info('[WA] property_approved sent (admin listing)', { id: saved._id, phone: saved.mobileNumber });
      }
    }

    return res.status(201).json({
      success: true,
      propertyId: saved._id.toString(),
      message: 'Property listed successfully',
    });
  } catch (err) {
    logger.error('POST /api/properties error', { message: err.message, name: err.name });
    if (err.name === 'ValidationError') {
      const fields = Object.keys(err.errors).join(', ');
      return res.status(400).json({ success: false, message: `Validation failed: ${fields}` });
    }
    return res.status(500).json({ success: false, message: err.message || 'Something went wrong' });
  }
});

// =====================
// GET / — List properties
// =====================
// LIST_PROJECTION: only fields needed for the property card + admin table.
// Excludes large/unused fields (description, furnishingItems, amenities, etc.)
// and returns only the FIRST image to minimise payload size.
const LIST_PROJECTION = {
  propertyType: 1, propertySubType: 1, bhk: 1, bathrooms: 1, balconies: 1,
  city: 1, sector: 1, houseNo: 1, landmark: 1, towerBlock: 1,
  totalPrice: 1, totalArea: 1, areaUnit: 1,
  name: 1, mobileNumber: 1, email: 1,
  ownerType: 1, status: 1, listedBy: 1,
  possessionStatus: 1, furnishingType: 1, saleType: 1,
  visitTimeType: 1, visitFixedSlots: 1, visitFlexibleSlots: 1,
  createdAt: 1, updatedAt: 1, liveAt: 1,
  // Return only the first image — huge savings when images are base64
  images: { $slice: 1 },
};

router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(1000, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city)   filter.city   = req.query.city;

    // Admin pages that pass limit=1000 need full images; others get the slim projection
    const isAdminFetch = limit > 50;
    const projection = isAdminFetch ? {} : LIST_PROJECTION;

    const docs = await Property.find(filter, projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const items = docs.map(p => ({ ...p, id: p._id.toString() }));

    // Cache public approved listings for 30s; admin fetches are not cached
    if (!req.query.status || req.query.status === 'approved') {
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    } else {
      res.set('Cache-Control', 'no-store');
    }

    return res.status(200).json({ items, page, perPage: limit, totalItems: items.length });
  } catch (err) {
    logger.error('GET /api/properties error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================
// GET /:id — Get single property
// =====================
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).lean();
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    return res.status(200).json({ ...property, id: property._id.toString() });
  } catch (err) {
    logger.error('GET /api/properties/:id error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================
// PUT /:id — Update property
// =====================
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: 'Property not found' });

    logger.info('Property updated', { id: req.params.id });

    // Notify the lister on approval / rejection
    console.log('🏠 PUT /properties/:id — data.status:', data.status, '| mobileNumber:', updated.mobileNumber);
    if (updated.mobileNumber) {
      const ownerName = updated.name || 'there';
      if (data.status === 'approved') {
        const propertyUrl = `https://growperty.com/property/${updated._id}`;
        console.log('🟡 [property_approved] Sending WA to:', updated.mobileNumber);
        const waRes = await sendTemplateMessage(updated.mobileNumber, 'property_approved', { userName: ownerName, propertyUrl });
        console.log('🟢 [property_approved] WA result:', JSON.stringify(waRes));
        logger.info('[WA] property_approved sent', { id: req.params.id, phone: updated.mobileNumber });
      } else if (data.status === 'rejected') {
        const reason = data.rejectReason || data.rejectionReason || 'Not specified';
        console.log('🟡 [property_rejected] Sending WA to:', updated.mobileNumber);
        const waRes = await sendTemplateMessage(updated.mobileNumber, 'property_rejected', { userName: ownerName, reason, teamContact: '+91 9891117876' });
        console.log('🟢 [property_rejected] WA result:', JSON.stringify(waRes));
        logger.info('[WA] property_rejected sent', { id: req.params.id, phone: updated.mobileNumber });
      } else {
        console.log('⏭ [WA] No trigger — data.status is:', data.status);
      }
    } else {
      console.log('⏭ [WA] Skipped — no mobileNumber on property');
    }

    return res.status(200).json({ success: true, propertyId: updated._id.toString() });
  } catch (err) {
    logger.error('PUT /api/properties/:id error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================
// DELETE /:id — Delete property
// =====================
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Property not found' });
    logger.info('Property deleted', { id: req.params.id });
    return res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (err) {
    logger.error('DELETE /api/properties/:id error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
