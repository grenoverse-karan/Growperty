import express from 'express';
import bcrypt from 'bcryptjs';
import _NextAuth from 'next-auth';
import _GoogleProvider from 'next-auth/providers/google';
import { getToken } from 'next-auth/jwt';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { connectMongoDB } from '../utils/mongodb.js';
import logger from '../utils/logger.js';

const NextAuth = _NextAuth.default ?? _NextAuth;
const GoogleProvider = _GoogleProvider.default ?? _GoogleProvider;

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.NEXTAUTH_URL || 'http://localhost:3001';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.email) {
        try {
          await connectMongoDB();
          await User.findOneAndUpdate(
            { email: user.email },
            {
              $setOnInsert: {
                email: user.email,
                name: user.name || '',
                avatar: user.image || '',
                provider: 'google',
                role: 'buyer',
                googleId: user.id || '',
              },
            },
            { upsert: true }
          );
        } catch (e) {
          logger.error('[Google signIn] DB upsert failed', { error: e.message });
        }
      }
      return true;
    },
    async redirect() {
      // After Google auth, go to our exchange endpoint to issue JWT
      return `${API_URL}/api/auth/google/exchange`;
    },
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
  },
};

// GET /api/auth/google/exchange
// Called after NextAuth OAuth completes — reads session, issues our JWT, redirects to frontend
router.get('/google/exchange', async (req, res) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      logger.warn('[Google exchange] No token/email in session');
      return res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
    }

    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email: token.email },
      {
        $setOnInsert: {
          email: token.email,
          name: token.name || '',
          avatar: token.picture || '',
          provider: 'google',
          role: 'buyer',
          googleId: token.sub || '',
        },
      },
      { upsert: true, new: true }
    );

    const jwt = signToken(user);
    const isProfileComplete = !!(user.name && user.city && user.phone);

    logger.info('[Google exchange] JWT issued', { email: user.email, isProfileComplete });
    return res.redirect(
      `${FRONTEND_URL}/auth/google/success?token=${encodeURIComponent(jwt)}&complete=${isProfileComplete}`
    );
  } catch (e) {
    logger.error('[Google exchange] Error', { error: e.message });
    return res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
});

router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  await connectMongoDB();
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already in use' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name: name || '', role: role || 'buyer', provider: 'email' });
  const jwtToken = signToken(user);
  res.status(201).json({ token: jwtToken, user: { _id: user._id, email: user.email, name: user.name, city: user.city, role: user.role, provider: user.provider } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  await connectMongoDB();
  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const jwtToken = signToken(user);
  res.json({ token: jwtToken, user: { _id: user._id, email: user.email, name: user.name, city: user.city, role: user.role, provider: user.provider } });
});

const nextAuthHandler = NextAuth(authOptions);

router.all('/*', (req, res) => {
  req.query.nextauth = req.path.replace(/^\//, '').split('/').filter(Boolean);
  return nextAuthHandler(req, res);
});

export default router;
