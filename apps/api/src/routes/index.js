import express from 'express';
import propertiesRouter from './properties.js';
import projectsRouter from './projects.js';
import adminRouter from './admin.js';
import whatsappRouter from './whatsapp.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import visitRequestsRouter from './visitRequests.js';
import campaignsRouter from './campaigns.js';
import requirementsRouter from './requirements.js';
import analyticsRouter from './analytics.js';
import blogRouter from './blog.js';
import cpRouter from './cp.js';
import cpVisitorsRouter from './cpVisitors.js';
import aiRouter from './ai.js';
import ogRouter from './og.js';

export default function routes() {
  const router = express.Router();

  router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.use('/auth', authRouter);
  router.use('/users', usersRouter);
  router.use('/properties', propertiesRouter);
  router.use('/projects', projectsRouter);
  router.use('/admin', adminRouter);
  router.use('/cp', cpRouter);
  router.use('/cp-visitors', cpVisitorsRouter);
  router.use('/whatsapp', whatsappRouter);
  router.use('/visit-requests', visitRequestsRouter);
  router.use('/campaigns', campaignsRouter);
  router.use('/requirements', requirementsRouter);
  router.use('/analytics', analyticsRouter);
  router.use('/blog', blogRouter);
  router.use('/ai', aiRouter);
  router.use('/og', ogRouter);

  return router;
}