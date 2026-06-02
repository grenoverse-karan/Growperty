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

// GET /campaigns/analytics?search=phone&page=1&limit=50
router.get('/analytics', async (req, res) => {
  await connectMongoDB();
  const search = req.query.search?.trim();
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = Math.min(100, parseInt(req.query.limit) || 50);
  const skip   = (page - 1) * limit;

  const searchFilter = search
    ? { phone: { $regex: search.replace(/\D/g, ''), $options: 'i' } }
    : {};

  const [total, sent, failed, replied, byTemplate, recipients, recipientTotal, dailyStats] = await Promise.all([
    CampaignLog.countDocuments({ status: 'sent' }),
    CampaignLog.countDocuments({ status: 'sent' }),
    CampaignLog.countDocuments({ status: 'failed' }),
    CampaignLog.countDocuments({ status: 'sent', replied: true }),
    CampaignLog.aggregate([
      { $group: { _id: '$templateName', sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } }, failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }, replied: { $sum: { $cond: ['$replied', 1, 0] } }, total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    CampaignLog.find(searchFilter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    CampaignLog.countDocuments(searchFilter),
    CampaignLog.aggregate([
      { $match: { status: 'sent' } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sent: { $sum: 1 },
          replied: { $sum: { $cond: ['$replied', 1, 0] } },
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]),
  ]);

  const grandTotal = sent + failed;
  return res.json({
    summary: {
      total: grandTotal,
      sent,
      failed,
      replied,
      successRate:  grandTotal ? Math.round((sent / grandTotal) * 100) : 0,
      replyRate:    sent ? Math.round((replied / sent) * 100) : 0,
    },
    byTemplate,
    recipients,
    recipientTotal,
    dailyStats: dailyStats.reverse(),
    page,
    totalPages: Math.ceil(recipientTotal / limit),
  });
});

// POST /campaigns/mark-reply — called from webhook when user taps Consent
router.post('/mark-reply', async (req, res) => {
  const { phone } = req.body || {};
  if (!phone) return res.status(400).json({ success: false });
  await connectMongoDB();
  // Mark the most recent sent campaign log for this phone as replied
  await CampaignLog.findOneAndUpdate(
    { phone: { $regex: phone.replace(/\D/g, '').slice(-10) }, status: 'sent', replied: false },
    { $set: { replied: true, repliedAt: new Date() } },
    { sort: { createdAt: -1 } }
  );
  return res.json({ success: true });
});

export default router;
