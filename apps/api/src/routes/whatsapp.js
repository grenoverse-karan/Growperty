import 'dotenv/config';
import express from 'express';
import logger from '../utils/logger.js';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { connectMongoDB } from '../utils/mongodb.js';
import { sendTemplateAsync } from '../utils/whatsappTemplates.js';

const router = express.Router();

// =====================
// OTP Storage & Configuration
// =====================
const otpStore = {};
const OTP_EXPIRY_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 3;

/**
 * Normalize phone number to 12-digit format with country code
 * @param {string} phoneNumber - Phone number to normalize
 * @returns {string} Normalized phone number (e.g., '919891117876')
 */
function normalizePhoneNumber(phoneNumber) {
  let normalized = phoneNumber.toString().replace(/\D/g, '');
  if (!normalized.startsWith('91') && normalized.length === 10) {
    normalized = '91' + normalized;
  }
  return normalized;
}

// =====================
// POST /send-otp - Send OTP via WhatsApp
// =====================
router.post('/send-otp', async (req, res) => {
  const whatsappToken = (process.env.WHATSAPP_TOKEN || '').trim();
  const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

  if (!whatsappToken || !phoneNumberId) {
    logger.warn('WhatsApp credentials missing');
    return res.status(503).json({
      success: false,
      message: 'WhatsApp service not configured',
    });
  }

  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    logger.warn('Phone number missing in send-otp request');
    return res.status(400).json({
      success: false,
      message: 'Phone number is required',
    });
  }

  const destinationNumber = normalizePhoneNumber(phoneNumber);
  logger.info('OTP send request', { phoneNumber: destinationNumber });

  // Generate 6-digit OTP
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with timestamp and attempts counter
  otpStore[destinationNumber] = {
    otp: generatedOtp,
    timestamp: Date.now(),
    attempts: 0,
  };

  logger.info('OTP generated and stored', {
    phoneNumber: destinationNumber,
    otp: generatedOtp,
  });

  // Send OTP via WhatsApp
  const metaUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  const response = await fetch(metaUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${whatsappToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: destinationNumber,
      type: 'template',
      template: {
        name: 'otp_login_growperty',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: generatedOtp }],
          },
          {
            type: 'button',
            sub_type: 'url',
            index: 0,
            parameters: [{ type: 'text', text: generatedOtp }],
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    logger.error('WhatsApp API error', {
      status: response.status,
      phoneNumber: destinationNumber,
      error: errorData,
    });
    throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
  }

  const metaResponseBody = await response.json();

  logger.info('OTP sent successfully via WhatsApp', {
    phoneNumber: destinationNumber,
    messageId: metaResponseBody.messages?.[0]?.id,
  });

  // Return success WITHOUT exposing OTP
  return res.status(200).json({
    success: true,
    message: 'OTP sent on WhatsApp',
  });
});

// =====================
// POST /verify-otp - Verify OTP
// =====================
router.post('/verify-otp', async (req, res) => {
  const { phoneNumber, userEnteredOtp } = req.body;

  if (!phoneNumber || !userEnteredOtp) {
    logger.warn('Missing phoneNumber or userEnteredOtp in verify-otp request');
    return res.status(400).json({
      success: false,
      message: 'Phone number and OTP are required',
    });
  }

  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  logger.info('OTP verification attempt', { phoneNumber: normalizedPhone });

  // Check if phone number exists in OTP store
  if (!otpStore[normalizedPhone]) {
    logger.warn('OTP not found for phone number', { phoneNumber: normalizedPhone });
    return res.status(400).json({
      success: false,
      message: 'No OTP found. Request a new one.',
    });
  }

  const storedData = otpStore[normalizedPhone];
  const currentTime = Date.now();
  const elapsedMinutes = (currentTime - storedData.timestamp) / (1000 * 60);

  // Check if OTP has expired
  if (elapsedMinutes > OTP_EXPIRY_MINUTES) {
    logger.warn('OTP expired', {
      phoneNumber: normalizedPhone,
      elapsedMinutes: elapsedMinutes.toFixed(2),
    });
    delete otpStore[normalizedPhone];
    return res.status(400).json({
      success: false,
      message: 'OTP expired. Request a new one.',
    });
  }

  // Check if max verification attempts exceeded
  if (storedData.attempts >= MAX_VERIFY_ATTEMPTS) {
    logger.warn('Max OTP verification attempts exceeded', {
      phoneNumber: normalizedPhone,
      attempts: storedData.attempts,
    });
    delete otpStore[normalizedPhone];
    return res.status(400).json({
      success: false,
      message: 'Too many attempts. Request a new OTP.',
    });
  }

  // Dev-only master OTP bypass — never active in production
  const isDevBypass = process.env.NODE_ENV !== 'production' && userEnteredOtp === '000000';
  if (isDevBypass) {
    logger.warn('DEV BYPASS: master OTP 000000 accepted', { phoneNumber: normalizedPhone });
  }

  // Compare OTP
  if (!isDevBypass && userEnteredOtp !== storedData.otp) {
    storedData.attempts += 1;
    const remainingAttempts = MAX_VERIFY_ATTEMPTS - storedData.attempts;

    logger.warn('Invalid OTP entered', {
      phoneNumber: normalizedPhone,
      attempts: storedData.attempts,
      remainingAttempts,
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid OTP',
    });
  }

  // OTP is valid - delete from store
  logger.info('OTP verified successfully', { phoneNumber: normalizedPhone });
  delete otpStore[normalizedPhone];

  // Upsert MongoDB user for this phone number
  await connectMongoDB();
  const existingUser = await User.findOne({ phone: normalizedPhone });
  const isNewUser = !existingUser;

  const user = existingUser ?? await User.create({
    phone: normalizedPhone,
    provider: 'whatsapp',
    role: 'buyer',
  });

  const token = signToken(user);
  const isProfileComplete = !!(user.name && user.city);

  return res.status(200).json({
    success: true,
    message: 'OTP Verified',
    token,
    user: { _id: user._id, phone: user.phone, name: user.name, city: user.city, role: user.role, provider: user.provider },
    isProfileComplete,
  });
});

// =====================
// GET /webhook — Meta webhook verification handshake
// =====================
router.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  logger.info('[WA Webhook] Verification request', { mode, token });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    logger.info('[WA Webhook] Verified successfully');
    return res.status(200).send(challenge);
  }
  logger.warn('[WA Webhook] Verification failed — token mismatch');
  return res.status(403).json({ error: 'Forbidden' });
});

// =====================
// POST /webhook — Receive incoming WhatsApp messages
// =====================
router.post('/webhook', async (req, res) => {
  // Always respond 200 immediately so Meta doesn't retry
  res.status(200).send('EVENT_RECEIVED');

  const body = req.body;
  if (body.object !== 'whatsapp_business_account') return;

  const changes = body.entry?.[0]?.changes?.[0]?.value;
  if (!changes) return;

  const messages = changes.messages;
  if (!messages?.length) return;

  for (const msg of messages) {
    const fromPhone = msg.from; // e.g. "919971007876"

    logger.info('[WA Webhook] Incoming message', {
      type: msg.type,
      from: fromPhone,
      id: msg.id,
    });

    // ── Quick reply button: "Request to Call Back" ──
    const isButtonReply =
      (msg.type === 'interactive' && msg.interactive?.type === 'button_reply') ||
      (msg.type === 'button');

    if (isButtonReply) {
      const buttonText =
        msg.interactive?.button_reply?.title ||
        msg.button?.text ||
        '';

      logger.info('[WA Webhook] Button tapped', { from: fromPhone, button: buttonText });

      if (buttonText.toLowerCase().includes('call back')) {
        await connectMongoDB();
        const user = await User.findOne({ phone: fromPhone }).select('name').lean();
        const userName = user?.name || 'there';

        logger.info('[WA Webhook] Triggering reply_callback', { fromPhone, userName });
        sendTemplateAsync(fromPhone, 'reply_callback', { userName });
      }
    }

    // ── Plain text "STOP" — unsubscribe signal (log only for now) ──
    if (msg.type === 'text' && msg.text?.body?.trim().toUpperCase() === 'STOP') {
      logger.info('[WA Webhook] STOP received — user wants to unsubscribe', { from: fromPhone });
    }
  }
});

export default router;