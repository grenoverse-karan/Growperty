import sharp from 'sharp';
import logger from './logger.js';

const THUMBNAIL_WIDTH = 480;
const THUMBNAIL_JPEG_QUALITY = 60;

/**
 * Shrinks a full-res image (data URI) down to a small JPEG thumbnail for use
 * in property list/card views. Listings were shipping their full first image
 * (some 700KB+ raw) on every /api/properties call — this keeps that endpoint
 * light regardless of what was originally uploaded.
 */
export const generateThumbnail = async (dataUri) => {
  if (!dataUri || typeof dataUri !== 'string') return null;
  const match = dataUri.match(/^data:image\/[a-zA-Z+.-]+;base64,(.+)$/);
  if (!match) return null;

  try {
    const inputBuffer = Buffer.from(match[1], 'base64');
    const outputBuffer = await sharp(inputBuffer)
      .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: THUMBNAIL_JPEG_QUALITY })
      .toBuffer();
    return `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
  } catch (err) {
    logger.error('Thumbnail generation failed', { message: err.message });
    return null;
  }
};
