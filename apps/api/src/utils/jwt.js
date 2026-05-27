import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

export const signToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, SECRET, { expiresIn: '30d' });

export const verifyToken = (token) => jwt.verify(token, SECRET);
