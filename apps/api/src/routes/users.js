import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { connectMongoDB } from '../utils/mongodb.js';
import { sendTemplateAsync } from '../utils/whatsappTemplates.js';

const router = express.Router();

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyToken(auth.slice(7));
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

router.get('/me', authenticate, async (req, res) => {
  await connectMongoDB();
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.patch('/me', authenticate, async (req, res) => {
  await connectMongoDB();
  const { name, city, role } = req.body;

  const existing = await User.findById(req.userId).select('name phone');
  if (!existing) return res.status(404).json({ error: 'User not found' });

  const hadNoName = !existing.name || existing.name.trim() === '';
  const settingName = name && name.trim() !== '';

  const update = {};
  if (name !== undefined) update.name = name.trim();
  if (city !== undefined) update.city = city.trim();
  if (role && ['buyer', 'seller'].includes(role)) update.role = role;

  const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-passwordHash');

  // Send sign_up welcome message the first time a user sets their name
  if (hadNoName && settingName && existing.phone) {
    sendTemplateAsync(existing.phone, 'sign_up', {
      userName: name.trim(),
    });
  }

  res.json(user);
});

router.delete('/me', authenticate, async (req, res) => {
  await connectMongoDB();
  await User.findByIdAndDelete(req.userId);
  res.json({ success: true });
});

export default router;
