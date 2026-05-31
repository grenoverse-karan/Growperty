import express from 'express';
import { sendTemplateMessage } from '../utils/whatsappTemplates.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /campaigns/send — send a WhatsApp template to a single phone number
// Called per-number from the admin campaigns UI (frontend maps over an array)
router.post('/send', async (req, res) => {
  const { phone, templateName } = req.body || {};

  if (!phone || !templateName) {
    return res.status(400).json({ success: false, error: 'phone and templateName required' });
  }

  // Only allow campaign templates to be sent via this endpoint
  const ALLOWED = ['camp_property_alert'];
  if (!ALLOWED.includes(templateName)) {
    return res.status(400).json({ success: false, error: `Template "${templateName}" not allowed for campaigns` });
  }

  logger.info('[Campaign] Sending', { phone, templateName });
  const result = await sendTemplateMessage(phone, templateName, {});
  return res.status(result.success ? 200 : 500).json(result);
});

export default router;
