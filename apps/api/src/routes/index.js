import express from 'express';
import propertiesRouter from './properties.js';
import adminRouter from './admin.js';
import whatsappRouter from './whatsapp.js';
import authRouter from './authRoutes.js';

export default function routes() {
  const router = express.Router();

  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.use('/properties', propertiesRouter);
  router.use('/admin', adminRouter);
  router.use('/whatsapp', whatsappRouter);
  router.use('/auth', authRouter);
  
  return router;
}