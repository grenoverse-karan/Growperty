import 'dotenv/config';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Middleware to verify JWT token from Authorization header
 * Extracts Bearer token, verifies signature and expiration
 * Attaches decoded data to req.admin
 * Returns 401 if invalid/expired/missing
 */
export default function verifyAdminToken(req, res, next) {
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
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    logger.info(`Token verified for admin: ${decoded.email}`);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token expired');
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token signature');
      return res.status(401).json({ error: 'Invalid token' });
    }
    logger.warn('Token verification failed', { error: error.message });
    return res.status(401).json({ error: 'Token verification failed' });
  }
}