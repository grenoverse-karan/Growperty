import express from 'express';
import mongoose from 'mongoose';
import sharp from 'sharp';
import Property from '../models/Property.js';
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

export default router;
