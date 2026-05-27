import express from 'express';
import bcrypt from 'bcryptjs';
import _NextAuth from 'next-auth';
import _GoogleProvider from 'next-auth/providers/google';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { connectMongoDB } from '../utils/mongodb.js';

const NextAuth = _NextAuth.default ?? _NextAuth;
const GoogleProvider = _GoogleProvider.default ?? _GoogleProvider;

const router = express.Router();

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect() {
      return process.env.NEXTAUTH_URL || 'http://localhost:3000';
    },
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
  },
};

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

const nextAuthHandler = NextAuth(authOptions);

router.all('/*', (req, res) => {
  // NextAuth reads req.query.nextauth to determine which action to run
  // e.g. /signin/google → ['signin', 'google']
  req.query.nextauth = req.path.replace(/^\//, '').split('/').filter(Boolean);
  return nextAuthHandler(req, res);
});

export default router;
