import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

const WHATSAPP_TOKEN   = (process.env.WHATSAPP_TOKEN || '').trim();
const PHONE_NUMBER_ID  = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
// WABA ID is the entry[0].id from webhook logs
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

  // Normalize phone to 12-digit
  const digits = String(phone).replace(/\D/g, '');
  const to = digits.length === 10 ? `91${digits}` : digits;

  // Header component with the campaign poster image
  const components = [
    { type: 'header', parameters: [{ type: 'image', image: { link: IMAGE_URL } }] },
  ];

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      ...(components.length > 0 && { components }),
    },
  };

  console.log('[Campaign] Sending to:', to, '| body:', JSON.stringify(body));
  logger.info('[Campaign] Sending', { phone: to, templateName });

  const apiUrl = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  const apiRes = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await apiRes.json();
  console.log('[Campaign] Meta response:', JSON.stringify(json));

  if (!apiRes.ok) {
    const errMsg = json?.error?.message || `HTTP ${apiRes.status}`;
    logger.error('[Campaign] Meta error', { error: errMsg });
    return res.status(400).json({ success: false, error: errMsg });
  }

  return res.status(200).json({ success: true, messageId: json?.messages?.[0]?.id });
});

export default router;
