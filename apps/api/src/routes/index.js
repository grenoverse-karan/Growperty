import express from 'express';
import propertiesRouter from './properties.js';
import adminRouter from './admin.js';
import whatsappRouter from './whatsapp.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import visitRequestsRouter from './visitRequests.js';
import campaignsRouter from './campaigns.js';

export default function routes() {
  const router = express.Router();

  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.use('/auth', authRouter);
  router.use('/users', usersRouter);
  router.use('/properties', propertiesRouter);
  router.use('/admin', adminRouter);
  router.use('/whatsapp', whatsappRouter);
  router.use('/visit-requests', visitRequestsRouter);
  router.use('/campaigns', campaignsRouter);

  return router;
}