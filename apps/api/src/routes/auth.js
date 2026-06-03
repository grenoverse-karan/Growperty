import express from 'express';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { connectMongoDB } from '../utils/mongodb.js';
import logger from '../utils/logger.js';

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL      = process.env.API_URL || process.env.NEXTAUTH_URL || 'http://localhost:3001';
const GOOGLE_REDIRECT_URI = `${API_URL}/api/auth/google/callback`;

// ── GET /api/auth/google/init — redirect to Google OAuth ─────────────
router.get('/google/init', (req, res) => {
  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// ── GET /api/auth/google/callback — exchange code, create user, issue JWT ─
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    logger.warn('[Google callback] OAuth error or missing code', { error });
    return res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  GOOGLE_REDIRECT_URI,
      grant_type:    'authorization_code',
    });
    const { access_token } = tokenRes.data;

    // 2. Get user info from Google
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const { email, name, picture, id: googleId } = profileRes.data;

    if (!email) {
      logger.warn('[Google callback] No email in Google profile');
      return res.redirect(`${FRONTEND_URL}/login?error=google_no_email`);
    }

    // 3. Upsert user in MongoDB
    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          email,
          name:     name || '',
          avatar:   picture || '',
          provider: 'google',
          role:     'buyer',
          googleId: googleId || '',
        },
      },
      { upsert: true, new: true }
    );

    // 4. Issue our JWT
    const jwt = signToken(user);
    const isProfileComplete = !!(user.name && user.city && user.phone);

    logger.info('[Google callback] User authenticated', { email, isProfileComplete });

    // 5. Redirect to frontend with token
    return res.redirect(
      `${FRONTEND_URL}/auth/google/success?token=${encodeURIComponent(jwt)}&complete=${isProfileComplete}`
    );
  } catch (e) {
    logger.error('[Google callback] Error', { error: e.message });
    return res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
});

// ── POST /api/auth/register ───────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  await connectMongoDB();
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name: name || '', role: role || 'buyer', provider: 'email' });
  const token = signToken(user);
  res.status(201).json({ token, user: { _id: user._id, email: user.email, name: user.name, city: user.city, role: user.role, provider: user.provider } });
});

// ── POST /api/auth/login ──────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  await connectMongoDB();
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ token, user: { _id: user._id, email: user.email, name: user.name, city: user.city, role: user.role, provider: user.provider } });
});

export default router;
