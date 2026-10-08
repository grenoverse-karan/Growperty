import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import sharp from 'sharp';
import Property from '../models/Property.js';
import ChannelPartner from '../models/ChannelPartner.js';
import logger from '../utils/logger.js';
import { verifyToken } from '../utils/jwt.js';
import { sendTemplateMessage } from '../utils/whatsappTemplates.js';
import { notifyMatchingBuyers } from '../utils/matchBuyers.js';
import { generateThumbnail } from '../utils/imageThumbnail.js';
import { moderateFreeTextFields } from '../utils/contactModeration.js';
import { sanitizeConnectivity } from '../utils/connectivity.js';
import { scheduleAiReview } from '../utils/aiListingReview.js';
import { touchesReviewableContent } from '../utils/aiImageReview.js';

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

    const cleaned = await moderateFreeTextFields({
      description: data.description,
      currentAddress: data.currentAddress,
      nearbyFamousPlace: data.nearbyFamousPlace,
      offerTitle: data.offerTitle,
      offerDetails: data.offerDetails,
    });

    const property = new Property({
      ...data,
      ...cleaned,
      connectivity: sanitizeConnectivity(data.connectivity),
      status: data.listedBy === 'admin' ? (data.status || 'approved') : 'pending',
    });

    const saved = await property.save();
    logger.info('Property created', { id: saved._id });
    // Check the typed text right away. The web forms upload photos in a second
    // request (that upload triggers the full review); clients that send photos
    // inline get the full review now.
    if (!req.isAdmin && saved.status === 'pending') {
      scheduleAiReview(saved._id.toString(), { textOnly: !saved.images?.length });
    }

    // Notify lister based on status
    if (saved.mobileNumber) {
      const ownerName = saved.name || 'there';
      if (saved.status === 'pending') {
        await sendTemplateMessage(saved.mobileNumber, 'under_review', { userName: ownerName });
        logger.info('[WA] under_review sent', { id: saved._id, phone: saved.mobileNumber });
      } else if (saved.status === 'approved') {
        // Admin-listed property — goes live directly
        const propertyUrl = `https://www.growperty.com/property/${saved._id}`;
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
  propertyType: 1, propertySubType: 1, bhk: 1, rooms: 1, bathrooms: 1, balconies: 1,
  city: 1, sector: 1, houseNo: 1, landmark: 1, towerBlock: 1, facingType: 1, nearbyFamousPlace: 1,
  totalPrice: 1, totalArea: 1, areaUnit: 1,
  name: 1, mobileNumber: 1, email: 1,
  ownerType: 1, status: 1, listedBy: 1,
  possessionStatus: 1, furnishingType: 1, saleType: 1,
  visitTimeType: 1, visitFixedSlots: 1, visitFlexibleSlots: 1,
  offerTitle: 1, offerDetails: 1, offerValidTill: 1,
  createdAt: 1, updatedAt: 1, liveAt: 1,
  aiReviewReason: 1, aiReviewedAt: 1,
  thumbnail: 1,
  // Fallback for properties uploaded before thumbnails existed — dropped
  // once every doc has been backfilled (see scripts/backfillThumbnails.js).
  // Only read the full-size first image for old docs that have no thumbnail.
  // Always slicing it shipped ~10MB of full-size photos per list call (they
  // were then discarded in favour of the thumbnail) and took ~2.5s.
  images: { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ['$thumbnail', ''] } }, 0] }, '$$REMOVE', { $slice: ['$images', 1] }] },
  // Lets the admin list lazy-load the gallery via GET /:id/images/:index.
  imageCount: { $size: { $ifNull: ['$images', []] } },
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
      const q = req.query.q.trim();
      const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escape(q), 'i');
      const orClauses = [{ sector: regex }, { city: regex }, { landmark: regex }, { propertyType: regex }];

      // bhk is stored as "1 BHK" / "5+ BHK" (always a space before "BHK"),
      // so a query like "1bhk" or "1 bhk" never substring-matches it above
      // — match on the number instead so any spacing/casing works.
      const bhkMatch = q.match(/^(\d+\+?)\s*bhk$/i);
      if (bhkMatch) {
        orClauses.push({ bhk: new RegExp(`^${escape(bhkMatch[1])}\\s*bhk`, 'i') });
      }

      filter.$or = orClauses;
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
      // s-maxage caches at the CDN only; browsers get max-age=0 so they
      // revalidate every load (cheap 304 via ETag) and see edits — e.g. a
      // newly added offer — instead of a 5-min-stale local copy.
      res.set('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
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
// Name shown in "Listed by …" on the public page: the CP's name for CP
// listings, the seller's name for seller listings, nothing for admin listings.
const listedByNameFor = async (p) => {
  const source = p.listedBy || (p.ownerType === 'Admin' ? 'admin' : p.ownerType === 'CP' ? 'cp' : 'owner');
  if (source === 'cp') {
    const cp = p.cpId && mongoose.Types.ObjectId.isValid(p.cpId) ? await ChannelPartner.findById(p.cpId, { name: 1 }).lean() : null;
    return cp?.name || '';
  }
  return source === 'owner' ? (p.name || '') : '';
};

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
      return res.status(200).json({ ...property, id: property._id.toString(), listedByName: await listedByNameFor(property) });
    }

    const property = await Property.findById(req.params.id).lean();
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    return res.status(200).json({ ...property, id: property._id.toString(), listedByName: await listedByNameFor(property) });
  } catch (err) {
    logger.error('GET /api/properties/:id error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================
// POST /:id/track — Anonymous engagement counter (share / call / whatsapp / wishlist add / remove)
// Public on purpose (visitors aren't logged in). Whitelisted events only; the
// wishlist count can never drop below zero.
// =====================
const TRACK_EVENTS = {
  share: ['shareCount', 1], call: ['callCount', 1], whatsapp: ['whatsappCount', 1],
  wishlist_add: ['wishlistCount', 1], wishlist_remove: ['wishlistCount', -1],
};
router.post('/:id/track', async (req, res) => {
  try {
    const rule = TRACK_EVENTS[req.body?.event];
    if (!rule || !mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false });
    const [field, delta] = rule;
    const result = await Property.updateOne(
      { _id: req.params.id },
      [{ $set: { [field]: { $max: [0, { $add: [{ $ifNull: [`$${field}`, 0] }, delta] }] } } }],
      { updatePipeline: true }
    );
    if (!result.matchedCount) return res.status(404).json({ success: false });
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error('POST /api/properties/:id/track error', { message: err.message });
    return res.status(500).json({ success: false });
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

    // ?w=<px> — a resized JPEG for card sliders, so browsing a card's photos
    // doesn't pull the full-resolution originals. Short cache: the order of a
    // listing's photos can change under the same URL.
    const w = parseInt(req.query.w, 10);
    if (w) {
      const resized = await sharp(Buffer.from(base64Data, 'base64'))
        .rotate()
        .resize({ width: Math.min(1600, Math.max(160, w)), withoutEnlargement: true })
        .jpeg({ quality: 72, mozjpeg: true })
        .toBuffer();
      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      return res.send(resized);
    }

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
// Fields only an admin (or the system) may change through this route.
const OWNER_LOCKED_FIELDS = ['owner_id', 'cpId', 'listedBy', 'ownerType', 'liveAt', 'unlistedBy', 'aiReviewReason', 'aiReviewedAt',
  'shareCount', 'wishlistCount', 'callCount', 'whatsappCount', 'images', 'thumbnail'];
// Listers may only send these statuses: the edit form resets a listing to
// 'pending' for re-review, the unlist button sends 'unlisted'. Approving or
// rejecting is an admin action.
const OWNER_STATUSES = ['pending', 'unlisted'];

router.put('/:id', requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ success: false, message: 'Property not found' });
    const existing = await Property.findById(req.params.id, { owner_id: 1, status: 1 }).lean();
    if (!existing) return res.status(404).json({ success: false, message: 'Property not found' });
    // Same rule as the photo routes. Without it anyone could edit — or, now that
    // edited text is AI-reviewed, get rejected — somebody else's listing.
    if (!req.isAdmin && existing.owner_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this property' });
    }

    const data = { ...req.body };
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;
    if (!req.isAdmin) {
      OWNER_LOCKED_FIELDS.forEach(f => delete data[f]);
      delete data.rejectReason; delete data.rejectionReason;
      if (data.status !== undefined && (!OWNER_STATUSES.includes(data.status) || existing.status === 'sold')) delete data.status;
    }

    if (data.connectivity !== undefined) data.connectivity = sanitizeConnectivity(data.connectivity);
    // Remember who unlisted it (so a CP can't relist something an admin took
    // down) and clear the mark when the status moves elsewhere.
    if (data.status !== undefined) data.unlistedBy = data.status === 'unlisted' ? (req.isAdmin ? 'admin' : 'owner') : '';

    const textFields = {};
    if (data.description !== undefined) textFields.description = data.description;
    if (data.currentAddress !== undefined) textFields.currentAddress = data.currentAddress;
    if (data.nearbyFamousPlace !== undefined) textFields.nearbyFamousPlace = data.nearbyFamousPlace;
    if (data.offerTitle !== undefined) textFields.offerTitle = data.offerTitle;
    if (data.offerDetails !== undefined) textFields.offerDetails = data.offerDetails;
    if (Object.keys(textFields).length > 0) {
      Object.assign(data, await moderateFreeTextFields(textFields));
    }

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
        const propertyUrl = `https://www.growperty.com/property/${updated._id}`;
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

    // Re-check the text after a lister's edit. If it now fails, the listing is
    // rejected — even a live one. Admin edits are trusted; pure workflow updates
    // (e.g. unlisting) change no reviewable content and are skipped.
    if (!req.isAdmin && touchesReviewableContent(Object.keys(data))) {
      scheduleAiReview(req.params.id, { textOnly: true, onEdit: true });
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

    const existing = await Property.findById(req.params.id, { images: 1, owner_id: 1 }).lean();
    if (!existing) return res.status(404).json({ success: false, message: 'Property not found' });
    // Same rule as /images/arrange — also keeps strangers from triggering AI reviews on listings that aren't theirs.
    if (!req.isAdmin && existing.owner_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this property' });
    }
    const isFirstUpload = !existing.images?.length;

    const update = { $push: { images: { $each: base64Images } } };
    if (isFirstUpload) {
      const thumbnail = await generateThumbnail(base64Images[0]);
      if (thumbnail) update.$set = { thumbnail };
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Property not found' });

    logger.info('Images uploaded', { id: req.params.id, count: base64Images.length });
    // Photos arrive after the listing is created, so this is where they can be reviewed.
    // Admin uploads are trusted and skipped.
    if (!req.isAdmin) scheduleAiReview(req.params.id);
    return res.status(200).json({ success: true, imageCount: updated.images.length });
  } catch (err) {
    logger.error('POST /api/properties/:id/images error', { message: err.message });
    return res.status(500).json({ success: false, message: err.message });
  }
});

// =====================
// PUT /:id/images/arrange — Keep/reorder/delete existing images.
// Body: { order: [indexes into the current images array] }. The result is
// exactly those images in that order; anything left out is deleted.
// images[0] is the listing's display (cover) image, so the list thumbnail is
// regenerated from it. Called by the edit form after any new uploads.
// =====================
router.put('/:id/images/arrange', requireAuth, async (req, res) => {
  try {
    const { order } = req.body || {};
    if (!Array.isArray(order) || order.some(i => !Number.isInteger(i))) {
      return res.status(400).json({ success: false, message: 'order must be an array of image indexes' });
    }

    const existing = await Property.findById(req.params.id, { images: 1, owner_id: 1 }).lean();
    if (!existing) return res.status(404).json({ success: false, message: 'Property not found' });
    if (!req.isAdmin && existing.owner_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this property' });
    }

    const current = existing.images || [];
    if (order.some(i => i < 0 || i >= current.length) || new Set(order).size !== order.length) {
      return res.status(400).json({ success: false, message: 'Invalid image order' });
    }

    const images = order.map(i => current[i]);
    const thumbnail = images.length ? await generateThumbnail(images[0]) : null;
    const update = thumbnail ? { $set: { images, thumbnail } } : { $set: { images }, $unset: { thumbnail: 1 } };

    await Property.findByIdAndUpdate(req.params.id, update);
    logger.info('Images arranged', { id: req.params.id, kept: images.length, removed: current.length - images.length });
    return res.status(200).json({ success: true, imageCount: images.length });
  } catch (err) {
    logger.error('PUT /api/properties/:id/images/arrange error', { message: err.message });
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
