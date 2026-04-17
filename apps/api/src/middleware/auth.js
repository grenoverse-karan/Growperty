import 'dotenv/config';
import logger from '../utils/logger.js';
import pbClient from '../utils/pb.js';

/**
 * Middleware to verify Bearer token from Authorization header
 * Validates token by calling PocketBase /collections/admins/records/me endpoint
 * Attaches user data to req.user
 * Returns 401 if invalid/expired/missing
 */
export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn('Missing Authorization header');
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.warn('Invalid Authorization header format');
    return res.status(401).json({ error: 'Invalid Authorization header format' });
  }

  const token = parts[1];

  try {
    // Verify token by calling PocketBase /collections/admins/records/me
    const user = await pbClient.get('/collections/admins/records/me', {}, token);
    req.user = user;
    logger.info(`Token verified for user: ${user.email}`);
    next();
  } catch (error) {
    logger.warn('Token verification failed', { error: error.message });
    return res.status(401).json({ error: 'Unauthorized' });
  }
}