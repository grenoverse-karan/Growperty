import { v2 as cloudinary } from 'cloudinary';
import logger from './logger.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a single in-memory file buffer to Cloudinary and resolves to its
 * secure URL. Used for project media (images, floor plans, brochure, video)
 * — these are too large to embed as base64 in a MongoDB document the way
 * property images are.
 */
export const uploadBufferToCloudinary = (buffer, { folder, resourceType = 'auto' }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err) {
          logger.error('Cloudinary upload failed', { message: err.message, folder });
          return reject(err);
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
