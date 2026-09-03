import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import Property from '../models/Property.js';
import logger from '../utils/logger.js';
import { verifyToken } from '../utils/jwt.js';
import { sendTemplateMessage } from '../utils/whatsappTemplates.js';
import { notifyMatchingBuyers } from '../utils/matchBuyers.js';
import { generateThumbnail } from '../utils/imageThumbnail.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 20 } });

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

// Admin listings don't have owner contact details
const ADMIN_OPTIONAL_FIELDS = new Set(['name', 'mobileNumber']);

function validateRequiredFields(data, isAdmin = false) {
  for (const field of requiredFields) {
    if (isAdmin && ADMIN_OPTIONAL_FIELDS.has(field)) continue;
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
    validateRequiredFields(data, req.isAdmin);

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
        notifyMatchingBuyers(saved);
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
// Fields returned on list endpoint. Images are handled separately via aggregation
// so MongoDB only returns the first image (thumbnail) — not all 16.
const LIST_AGG_PROJECT = {
  propertyType: 1, propertySubType: 1, bhk: 1, bathrooms: 1, balconies: 1,
  city: 1, sector: 1, houseNo: 1, landmark: 1, towerBlock: 1,
  totalPrice: 1, totalArea: 1, areaUnit: 1,
  name: 1, mobileNumber: 1, email: 1,
  ownerType: 1, status: 1, listedBy: 1,
  possessionStatus: 1, furnishingType: 1, saleType: 1,
  visitTimeType: 1, visitFixedSlots: 1, visitFlexibleSlots: 1,
  createdAt: 1, updatedAt: 1, liveAt: 1,
  thumbnail: 1,
  // Fallback for properties uploaded before thumbnails existed — dropped
  // once every doc has been backfilled (see scripts/backfillThumbnails.js).
  images: { $slice: ['$images', 1] },
};

router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, Math.min(1000, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;
    const filter = {};
    if (req.query.status) {
      const statuses = req.query.status.split(',').map(s => s.trim()).filter(Boolean);
      filter.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
    }
    if (req.query.city)   filter.city   = req.query.city;
    if (req.query.propertyType) filter.propertyType = req.query.propertyType;
    if (req.query.bhk)   filter.bhk = req.query.bhk;
    if (req.query.q) {
      const regex = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ sector: regex }, { city: regex }, { landmark: regex }, { propertyType: regex }];
    }

    let docs;
    if (req.query.withImages === 'true') {
      // Admin detail view — return all images. Collect ids via an aggregation
      // that $projects down to just _id/createdAt BEFORE $sort, so the sort
      // stage never touches the full image-heavy documents (which otherwise
      // blow past Mongo's 32MB in-memory sort limit) — then fetch full docs
      // for just that page of ids, preserving the sorted order.
      const idDocs = await Property.aggregate([
        { $match: filter },
        { $project: { createdAt: 1 } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
      const ids = idDocs.map(d => d._id);
      const fullDocs = await Property.find({ _id: { $in: ids } }).lean();
      const orderIndex = new Map(ids.map((id, i) => [id.toString(), i]));
      docs = fullDocs.sort((a, b) => orderIndex.get(a._id.toString()) - orderIndex.get(b._id.toString()));
    } else {
      // Public list — use aggregation so MongoDB only sends the first image (thumbnail)
      docs = await Property.aggregate([
        { $match: filter },
        { $project: LIST_AGG_PROJECT },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
    }

    const useThumbnails = req.query.withImages !== 'true';
    const items = docs.map(p => {
      const item = { ...p, id: p._id.toString() };
      if (useThumbnails) {
        if (item.thumbnail) item.images = [item.thumbnail];
        delete item.thumbnail;
      }
      return item;
    });

    // Cache public listings (approved and/or sold — both safe to expose) for
    // 5min at the CDN edge + 10min stale window; anything else (pending review
    // queues etc.) must stay fresh for admins.
    const requestedStatuses = req.query.status ? req.query.status.split(',').map(s => s.trim()) : [];
    const isPubliclySafe = requestedStatuses.length === 0 || requestedStatuses.every(s => ['approved', 'sold'].includes(s));
    if (isPubliclySafe) {
      res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
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
// `?thumbOnly=true` — used by the public details page: returns only the first
// image + an imageCount, computed in MongoDB (via $size/$slice) so the other
// images' bytes are never read off disk or sent over the wire. The rest of the
// gallery is fetched on demand via GET /:id/images/:index below. Properties
// with 10-16 full-res images were shipping 10MB+ JSON payloads on every detail
// page load — this was the actual cause of the ~10s "first open" slowness.
// Every other caller (admin, seller dashboard, edit forms, CP wishlist) omits
// the param and keeps getting the full images array, unchanged.
// =====================
router.get('/:id', async (req, res) => {
  try {
    if (req.query.thumbOnly === 'true') {
      const [property] = await Property.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
        { $addFields: {
            imageCount: { $size: { $ifNull: ['$images', []] } },
            images: { $slice: ['$images', 1] },
        } },
      ]);
      if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
      return res.status(200).json({ ...property, id: property._id.toString() });
    }

    const property = await Property.findById(req.params.id).lean();
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    return res.status(200).json({ ...property, id: property._id.toString() });
  } catch (err) {
    logger.error('GET /api/properties/:id error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================
// GET /:id/images/:index — Single full-res image, served as a real cacheable
// image resource (not embedded in JSON) so the browser can fetch/cache it
// independently and in parallel with other images.
// =====================
router.get('/:id/images/:index', async (req, res) => {
  try {
    const idx = parseInt(req.params.index, 10);
    if (Number.isNaN(idx) || idx < 0) {
      return res.status(400).json({ success: false, message: 'Invalid image index' });
    }

    const property = await Property.findById(req.params.id, { images: { $slice: [idx, 1] } }).lean();
    const dataUri = property?.images?.[0];
    if (!dataUri) return res.status(404).json({ success: false, message: 'Image not found' });

    const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/.exec(dataUri);
    if (!match) return res.status(500).json({ success: false, message: 'Corrupt image data' });

    const [, mimeType, base64Data] = match;
    res.set('Content-Type', mimeType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(Buffer.from(base64Data, 'base64'));
  } catch (err) {
    logger.error('GET /api/properties/:id/images/:index error', { message: err.message });
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
        notifyMatchingBuyers(updated);
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
// POST /:id/images — Upload images for a property (multipart/form-data)
// Bypasses the JSON body-size limit by accepting files directly.
// =====================
router.post('/:id/images', requireAuth, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'No images provided' });
    }

    const base64Images = req.files.map(f => {
      const b64 = f.buffer.toString('base64');
      return `data:${f.mimetype};base64,${b64}`;
    });

    const existing = await Property.findById(req.params.id, { images: 1 }).lean();
    if (!existing) return res.status(404).json({ success: false, message: 'Property not found' });
    const isFirstUpload = !existing.images?.length;

    const update = { $push: { images: { $each: base64Images } } };
    if (isFirstUpload) {
      const thumbnail = await generateThumbnail(base64Images[0]);
      if (thumbnail) update.$set = { thumbnail };
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Property not found' });

    logger.info('Images uploaded', { id: req.params.id, count: base64Images.length });
    return res.status(200).json({ success: true, imageCount: updated.images.length });
  } catch (err) {
    logger.error('POST /api/properties/:id/images error', { message: err.message });
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
