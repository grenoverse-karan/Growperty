import 'dotenv/config';
import express from 'express';
import logger from '../utils/logger.js';
import pbClient from '../utils/pb.js';

const router = express.Router();

// =====================
// POST /login - Authenticate admin
// =====================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.warn('Login attempt with missing credentials');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  logger.info('Admin login attempt', { email });

  // Authenticate with PocketBase
  const authResponse = await pbClient.post('/collections/users/auth-with-password', {
    identity: email,
    password,
  });

  logger.info('Admin login successful', { email });

  return res.status(200).json({
    token: authResponse.token,
    user: {
      id: authResponse.record?.id,
      email: authResponse.record?.email,
    },
  });
});

// =====================
// GET /me - Get current admin user (protected)
// =====================
router.get('/me', async (req, res) => {
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

  logger.info('GET /admin/me request', { token: token.substring(0, 10) + '...' });

  // Verify token by calling PocketBase
  const user = await pbClient.get('/collections/users/records', {}, token);

  logger.info('User verified', { userId: user.id });

  return res.status(200).json({
    id: user.id,
    email: user.email,
  });
});

export default router;