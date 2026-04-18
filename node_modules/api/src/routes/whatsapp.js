import 'dotenv/config';
import express from 'express';
import logger from '../utils/logger.js';

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

  // Compare OTP
  if (userEnteredOtp !== storedData.otp) {
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

  // OTP is valid - delete from store and return success
  logger.info('OTP verified successfully', { phoneNumber: normalizedPhone });
  delete otpStore[normalizedPhone];

  return res.status(200).json({
    success: true,
    message: 'OTP Verified',
    redirectUrl: '/setup-profile',
  });
});

export default router;