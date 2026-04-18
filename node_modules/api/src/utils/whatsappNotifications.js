import 'dotenv/config';
import logger from './logger.js';

const WHATSAPP_TOKEN = (process.env.WHATSAPP_TOKEN || '').trim();
const WHATSAPP_PHONE_NUMBER_ID = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();

/**
 * Send WhatsApp notification asynchronously
 * Does not block the main response
 */
export async function sendWhatsAppNotification(phoneNumber, message) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    logger.warn('WhatsApp credentials missing - notification skipped');
    return;
  }

  try {
    // Normalize phone number
    let destinationNumber = phoneNumber.toString().replace(/\D/g, '');
    if (!destinationNumber.startsWith('91') && destinationNumber.length === 10) {
      destinationNumber = '91' + destinationNumber;
    }

    const metaUrl = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: destinationNumber,
        type: 'text',
        text: {
          body: message,
        },
      }),
    });

    const metaResponseBody = await response.json();

    if (!response.ok) {
      logger.error('WhatsApp notification failed', {
        status: response.status,
        phone: destinationNumber,
        error: metaResponseBody,
      });
      return false;
    }

    logger.info('WhatsApp notification sent successfully', {
      phone: destinationNumber,
      messageId: metaResponseBody.messages?.[0]?.id,
    });
    return true;
  } catch (error) {
    logger.error('Error sending WhatsApp notification', {
      error: error.message,
      phone: phoneNumber,
    });
    return false;
  }
}

/**
 * Send notification asynchronously without blocking response
 */
export function notifyAsync(phoneNumber, message) {
  // Use setImmediate to send notification after response is sent
  setImmediate(() => {
    sendWhatsAppNotification(phoneNumber, message).catch((error) => {
      logger.error('Async notification error:', error);
    });
  });
}