import express from 'express';
import propertiesRouter from './properties.js';
import adminRouter from './admin.js';
import whatsappRouter from './whatsapp.js';

export default function routes() {
  const router = express.Router();

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Mount routes
  router.use('/properties', propertiesRouter);
  router.use('/admin', adminRouter);
  router.use('/whatsapp', whatsappRouter);

  return router;
}