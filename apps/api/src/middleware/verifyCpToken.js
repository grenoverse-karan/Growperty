import 'dotenv/config';
import jwt from 'jsonwebtoken';
import ChannelPartner from '../models/ChannelPartner.js';
import { connectMongoDB } from '../utils/mongodb.js';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export default async function verifyCpToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid Authorization header format' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'cp') {
      return res.status(403).json({ error: 'Access denied: not a CP token' });
    }

    await connectMongoDB();
    const cp = await ChannelPartner.findById(decoded.sub).select('status bannedUntil access').lean();
    if (!cp) return res.status(401).json({ error: 'CP account not found' });

    if (cp.status === 'banned') {
      const isPermanent = !cp.bannedUntil;
      if (isPermanent || cp.bannedUntil > new Date()) {
        const msg = isPermanent
          ? 'Your account has been permanently banned.'
          : `Your account is suspended until ${cp.bannedUntil.toLocaleDateString('en-IN')}.`;
        return res.status(403).json({ error: msg, banned: true });
      }
      // Temp ban expired — restore to approved
      await ChannelPartner.findByIdAndUpdate(decoded.sub, { $set: { status: 'approved', bannedUntil: null } });
    }

    req.cp = { ...decoded, access: cp.access || {} };
    logger.info(`CP token verified: ${decoded.sub}`);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
