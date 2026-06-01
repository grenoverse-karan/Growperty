import express from 'express';
import logger from '../utils/logger.js';
import CampaignLog from '../models/CampaignLog.js';
import { connectMongoDB } from '../utils/mongodb.js';

const router = express.Router();

const WHATSAPP_TOKEN  = (process.env.WHATSAPP_TOKEN || '').trim();
const PHONE_NUMBER_ID = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
const IMAGE_URL = 'https://growperty-api.vercel.app/public/camp_temp_poster.jpg';

// POST /campaigns/send
router.post('/send', async (req, res) => {
  const { phone, templateName } = req.body || {};

  if (!phone || !templateName) {
    return res.status(400).json({ success: false, error: 'phone and templateName required' });
  }

  const ALLOWED = ['camp_property_alert'];
  if (!ALLOWED.includes(templateName)) {
    return res.status(400).json({ success: false, error: `Template "${templateName}" not allowed` });
  }

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    return res.status(500).json({ success: false, error: 'WhatsApp credentials not configured' });
  }

  const digits = String(phone).replace(/\D/g, '');
  const to = digits.length === 10 ? `91${digits}` : digits;

  const components = [
    { type: 'header', parameters: [{ type: 'image', image: { link: IMAGE_URL } }] },
  ];

  const msgBody = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      components,
    },
  };

  const apiUrl = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  const apiRes = await fetch(apiUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(msgBody),
  });
  const json = await apiRes.json();

  await connectMongoDB();
  if (!apiRes.ok) {
    const errMsg = json?.error?.message || `HTTP ${apiRes.status}`;
    await CampaignLog.create({ templateName, phone: to, status: 'failed', error: errMsg });
    logger.error('[Campaign] Meta error', { error: errMsg });
    return res.status(400).json({ success: false, error: errMsg });
  }

  const messageId = json?.messages?.[0]?.id;
  await CampaignLog.create({ templateName, phone: to, status: 'sent', messageId });
  logger.info('[Campaign] Sent', { phone: to, templateName, messageId });
  return res.status(200).json({ success: true, messageId });
});

// GET /campaigns/analytics
router.get('/analytics', async (req, res) => {
  await connectMongoDB();

  const [total, sent, failed, byTemplate, recent, dailyStats] = await Promise.all([
    CampaignLog.countDocuments(),
    CampaignLog.countDocuments({ status: 'sent' }),
    CampaignLog.countDocuments({ status: 'failed' }),
    CampaignLog.aggregate([
      { $group: { _id: '$templateName', sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } }, failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }, total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    CampaignLog.find().sort({ createdAt: -1 }).limit(20).lean(),
    CampaignLog.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } }, failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } } } },
      { $sort: { _id: -1 } },
      { $limit: 7 },
    ]),
  ]);

  return res.json({
    summary: { total, sent, failed, successRate: total ? Math.round((sent / total) * 100) : 0 },
    byTemplate,
    recent,
    dailyStats: dailyStats.reverse(),
  });
});

export default router;
