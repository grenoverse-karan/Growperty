import 'dotenv/config';
import logger from './logger.js';

const WHATSAPP_TOKEN = (process.env.WHATSAPP_TOKEN || '').trim();
const PHONE_NUMBER_ID = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
const API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// ── Template definitions ──────────────────────────────────────────
// Each entry maps a templateName → { name, language, buildComponents(params) }
// Add new templates here as the business grows.
const TEMPLATES = {
  // Triggered on new WhatsApp user registration
  // params: { userName }
  sign_up: {
    name: 'sign_up',
    language: 'en',
    buildComponents: ({ userName }) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: String(userName) },
        ],
      },
    ],
  },

  // Triggered when a buyer submits an inquiry / callback request
  // params: { userName }
  reply_callback: {
    name: 'reply_callback',
    language: 'en',
    buildComponents: ({ userName }) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: String(userName) },
        ],
      },
    ],
  },

  // Triggered when a buyer shows interest in a property
  // params: { userName, propertyTitle }
  interested_reply: {
    name: 'interested_reply',
    language: 'en',
    buildComponents: ({ userName, propertyTitle }) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: String(userName) },
          { type: 'text', text: String(propertyTitle) },
        ],
      },
    ],
  },

  // Triggered when a property matching buyer criteria goes live
  // params: { recipientName, propertyType, city, price, propertyLink }
  property_alert: {
    name: 'property_alert',
    language: 'en',
    buildComponents: ({ recipientName, propertyType, city, price, propertyLink }) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: String(recipientName) },
          { type: 'text', text: String(propertyType) },
          { type: 'text', text: String(city) },
          { type: 'text', text: String(price) },
          { type: 'text', text: String(propertyLink) },
        ],
      },
    ],
  },

  // Standard Meta hello_world template — no dynamic params
  hello_world: {
    name: 'hello_world',
    language: 'en_US',
    buildComponents: () => [],
  },

  // Meta sample / test template — one body param
  // params: { name }
  test_template: {
    name: 'test_template',
    language: 'en',
    buildComponents: ({ name = 'there' }) => [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: String(name) },
        ],
      },
    ],
  },
};

// ── Phone normalizer ──────────────────────────────────────────────
function normalizePhone(phone) {
  const digits = phone.toString().replace(/\D/g, '');
  return digits.startsWith('91') && digits.length === 12
    ? digits
    : digits.length === 10
    ? `91${digits}`
    : digits;
}

// ── Sleep helper ──────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Core sender (single attempt) ─────────────────────────────────
async function sendOnce(to, templateName, parameters) {
  const tpl = TEMPLATES[templateName];
  if (!tpl) throw new Error(`Unknown template: "${templateName}"`);

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: tpl.name,
      language: { code: tpl.language },
      components: tpl.buildComponents(parameters),
    },
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    const errMsg = json?.error?.message || `HTTP ${res.status}`;
    throw new Error(errMsg);
  }

  return json?.messages?.[0]?.id ?? null;
}

// ── Public API ────────────────────────────────────────────────────

/**
 * Send a WhatsApp template message with retry logic.
 *
 * @param {string|number} recipientPhone  - 10-digit or full international number
 * @param {string}        templateName   - Key from TEMPLATES map (e.g. "sign_up")
 * @param {Object}        parameters     - Dynamic values required by the template
 * @returns {Promise<{ success: boolean, messageId: string|null, error: string|null }>}
 *
 * @example
 * const result = await sendTemplateMessage('9891117876', 'sign_up', {
 *   userName: 'Karan',
 *   websiteLink: 'https://growperty.com',
 * });
 */
export async function sendTemplateMessage(recipientPhone, templateName, parameters = {}) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    logger.warn('[WA Template] Credentials missing — skipping', { templateName });
    return { success: false, messageId: null, error: 'WhatsApp credentials not configured' };
  }

  const to = normalizePhone(recipientPhone);
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const messageId = await sendOnce(to, templateName, parameters);

      logger.info('[WA Template] Sent', { templateName, to, messageId, attempt });
      return { success: true, messageId, error: null };
    } catch (err) {
      lastError = err.message;
      logger.warn(`[WA Template] Attempt ${attempt}/${RETRY_ATTEMPTS} failed`, {
        templateName,
        to,
        error: lastError,
      });

      if (attempt < RETRY_ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  logger.error('[WA Template] All retries exhausted', { templateName, to, error: lastError });
  return { success: false, messageId: null, error: lastError };
}

/**
 * Fire-and-forget wrapper — sends without blocking the caller.
 * Logs failures but never throws.
 */
export function sendTemplateAsync(recipientPhone, templateName, parameters = {}) {
  setImmediate(() => {
    sendTemplateMessage(recipientPhone, templateName, parameters).catch((err) => {
      logger.error('[WA Template] Async send error', { error: err.message });
    });
  });
}
