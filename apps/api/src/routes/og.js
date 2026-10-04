import express from 'express';
import mongoose from 'mongoose';
import sharp from 'sharp';
import Property from '../models/Property.js';
import Project from '../models/Project.js';
import logger from '../utils/logger.js';

// Link-preview support for WhatsApp / Facebook / Twitter crawlers. The web
// app's Vercel middleware (apps/web/middleware.js) calls these to build Open
// Graph tags — they must answer fast (crawlers give up after a few seconds),
// so neither endpoint ever ships the full base64 images array.
const router = express.Router();

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /og/property/:id — just the fields a preview needs (no images).
router.get('/property/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false });
    const [p] = await Property.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      { $project: {
          bhk: 1, rooms: 1, propertyType: 1, sector: 1, city: 1, landmark: 1,
          totalPrice: 1, totalArea: 1, areaUnit: 1, possessionStatus: 1, status: 1,
          bathrooms: 1, balconies: 1, furnishingType: 1, facingType: 1,
          offerTitle: 1, offerDetails: 1, updatedAt: 1, createdAt: 1,
          hasImage: { $gt: [{ $size: { $ifNull: ['$images', []] } }, 0] },
          imageCount: { $size: { $ifNull: ['$images', []] } },
      } },
    ]);
    if (!p) return res.status(404).json({ success: false });
    res.set('Cache-Control', 'public, max-age=0, s-maxage=300');
    return res.status(200).json(p);
  } catch (err) {
    logger.error('GET /api/og/property/:id error', { message: err.message });
    return res.status(500).json({ success: false });
  }
});

// GET /og/property/:id/image.jpg — the display image (images[0]) cropped to
// 1200×630 and compressed, as a real public JPEG for og:image. ?i=<n> serves
// images[n] uncropped instead (used for the property-page gallery in the
// server-rendered SEO HTML — see apps/web/middleware.js).
router.get('/property/:id/image.jpg', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).end();
    const index = Math.max(0, parseInt(req.query.i, 10) || 0);
    const p = await Property.findById(req.params.id, { images: { $slice: [index, 1] } }).lean();
    const match = /^data:image\/[a-zA-Z+.-]+;base64,(.+)$/.exec(p?.images?.[0] || '');
    if (!match) return res.status(404).end();
    if (req.query.i !== undefined) {
      const sharpened = await sharp(Buffer.from(match[1], 'base64'))
        .rotate()
        .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75, mozjpeg: true })
        .toBuffer();
      res.set('Content-Type', 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      return res.send(sharpened);
    }

    const jpeg = await sharp(Buffer.from(match[1], 'base64'))
      .rotate() // respect EXIF orientation from phone photos
      .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    // The middleware adds ?v=<updatedAt>, so a changed display image gets a new URL.
    res.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    return res.send(jpeg);
  } catch (err) {
    logger.error('GET /api/og/property/:id/image.jpg error', { message: err.message });
    return res.status(500).end();
  }
});

// Min/max across the nested per-type/per-BHK pricing blob — same source
// data as apps/web/src/lib/projectPricing.js's flattenPricing, trimmed to
// just the range a preview card needs.
function projectPriceRange(propertyTypePricing) {
  let min = null;
  let max = null;
  for (const byBhk of Object.values(propertyTypePricing || {})) {
    for (const p of Object.values(byBhk || {})) {
      const nums = p.priceMode === 'fixed' ? [Number(p.price)] : [Number(p.minPrice), Number(p.maxPrice)];
      for (const n of nums) {
        if (!n) continue;
        if (min === null || n < min) min = n;
        if (max === null || n > max) max = n;
      }
    }
  }
  return min && max ? { min, max } : null;
}

// Cloudinary URLs (project images) support on-the-fly transforms via the
// URL itself — no proxy/crop route needed the way property's base64 images
// require. Inserts a 1200×630 face/subject-aware crop right after /upload/.
function cloudinaryOgCrop(url) {
  if (!url) return null;
  return url.replace('/upload/', `/upload/c_fill,w_${OG_WIDTH},h_${OG_HEIGHT},g_auto,q_auto,f_jpg/`);
}

// GET /og/project/:id — mirrors /og/property/:id above. Project images are
// already public Cloudinary URLs (unlike Property's base64 blobs), so the
// image itself is just a cropped Cloudinary URL, not a separate endpoint.
router.get('/project/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ success: false });
    const p = await Project.findById(req.params.id, {
      projectName: 1, builderName: 1, projectType: 1, propertyTypes: 1, configurationAvailable: 1,
      sector: 1, city: 1, landmark: 1, societyName: 1, projectStatus: 1, status: 1,
      propertyTypePricing: 1, projectImages: 1, updatedAt: 1,
    }).lean();
    if (!p) return res.status(404).json({ success: false });
    const range = projectPriceRange(p.propertyTypePricing);
    res.set('Cache-Control', 'public, max-age=0, s-maxage=300');
    return res.status(200).json({
      projectName: p.projectName,
      builderName: p.builderName,
      projectType: p.projectType,
      propertyTypes: p.propertyTypes,
      configurationAvailable: p.configurationAvailable,
      sector: p.sector,
      city: p.city,
      landmark: p.landmark,
      societyName: p.societyName,
      projectStatus: p.projectStatus,
      status: p.status,
      priceMin: range?.min ?? null,
      priceMax: range?.max ?? null,
      image: cloudinaryOgCrop(p.projectImages?.[0]),
      updatedAt: p.updatedAt,
    });
  } catch (err) {
    logger.error('GET /api/og/project/:id error', { message: err.message });
    return res.status(500).json({ success: false });
  }
});

export default router;
