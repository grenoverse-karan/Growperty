import 'dotenv/config';
import logger from './logger.js';

const WHATSAPP_TOKEN = (process.env.WHATSAPP_TOKEN || '').trim();
const PHONE_NUMBER_ID = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
const API_URL = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// ── Param sanitizer ───────────────────────────────────────────────
// Meta rejects empty strings, newlines/tabs, and >4 consecutive spaces.
const txt = (v, fallback = '-') => {
  const s = (v === null || v === undefined ? '' : String(v))
    .replace(/[\n\t]+/g, ' ')
    .replace(/ {4,}/g, '   ')
    .trim();
  return s === '' ? fallback : s;
};

// Build a single "body" component from an ordered list of values.
const body = (...vals) => [
  { type: 'body', parameters: vals.map((v) => ({ type: 'text', text: txt(v) })) },
];

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
  // No dynamic parameters — static template
  reply_callback: {
    name: 'reply_callback',
    language: 'en',
    buildComponents: () => [],
  },

  // Triggered when a buyer shows interest in a property — static, no params
  interested_reply: {
    name: 'interested_reply',
    language: 'en',
    buildComponents: () => [],
  },

  // Triggered when a property matching buyer criteria goes live
  // {{1}} userName {{2}} bhk {{3}} propertyType {{4}} area {{5}} city
  // {{6}} price {{7}} priceType {{8}} highlights {{9}} listingUrl {{10}} possessionStatus
  property_alert: {
    name: 'property_alert',
    language: 'en',
    buildComponents: ({ userName, bhk, propertyType, area, city, price, priceType, highlights, listingUrl, possessionStatus }) =>
      body(userName, bhk, propertyType, area, city, price, priceType, highlights, listingUrl, possessionStatus),
  },

  // Listing submitted — awaiting admin review.  {{1}} userName
  under_review: {
    name: 'under_review',
    language: 'en',
    buildComponents: ({ userName }) => body(userName),
  },

  // Listing approved.  {{1}} userName {{2}} propertyUrl
  property_approved: {
    name: 'property_approved',
    language: 'en',
    buildComponents: ({ userName, propertyUrl }) => body(userName, propertyUrl),
  },

  // Listing rejected.  {{1}} userName {{2}} reason {{3}} teamContact
  property_rejected: {
    name: 'property_rejected',
    language: 'en',
    buildComponents: ({ userName, reason, teamContact }) => body(userName, reason, teamContact),
  },

  // Seller asked to reply with a visit time.  {{1}} teamContact
  seller_reply_visit_time: {
    name: 'seller_reply_visit_time',
    language: 'en',
    buildComponents: ({ teamContact }) => body(teamContact),
  },

  // Visit confirmation — seller's "Any Time" preference.
  // {{1}} userName {{2}} bhk {{3}} propertyType {{4}} houseNo {{5}} tower
  // {{6}} society {{7}} sector {{8}} city {{9}} visitDate {{10}} visitTime
  seller_visit_confirmation: {
    name: 'seller_visit_confirmation',
    language: 'en',
    buildComponents: ({ userName, bhk, propertyType, houseNo, tower, society, sector, city, visitDate, visitTime }) =>
      body(userName, bhk, propertyType, houseNo, tower, society, sector, city, visitDate, visitTime),
  },

  // Visit confirmation — seller's "Fixed Time" preference (same 10 params).
  seller_fixedslot_visit_confirmation: {
    name: 'seller_fixedslot_visit_confirmation',
    language: 'en',
    buildComponents: ({ userName, bhk, propertyType, houseNo, tower, society, sector, city, visitDate, visitTime }) =>
      body(userName, bhk, propertyType, houseNo, tower, society, sector, city, visitDate, visitTime),
  },

  // Visit confirmation — seller's "Flexible Time" preference (same 10 params).
  seller_flexibleslot_visit_confirmation: {
    name: 'seller_flexibleslot_visit_confirmation',
    language: 'en',
    buildComponents: ({ userName, bhk, propertyType, houseNo, tower, society, sector, city, visitDate, visitTime }) =>
      body(userName, bhk, propertyType, houseNo, tower, society, sector, city, visitDate, visitTime),
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
async function sendOnce(to, templateName, parameters, attempt) {
  const tpl = TEMPLATES[templateName];
  if (!tpl) throw new Error(`Unknown template: "${templateName}"`);

  const components = tpl.buildComponents(parameters);
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: tpl.name,
      language: { code: tpl.language },
      components,
    },
  };

  logger.info(`[WA] → API call`, {
    attempt,
    url: API_URL,
    template: tpl.name,
    language: tpl.language,
    to,
    components: JSON.stringify(components),
  });

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  console.log('📡 Full WhatsApp API response:', JSON.stringify({ statusCode: res.status, body: json, error: json?.error ?? null }));

  logger.info(`[WA] ← API response`, {
    attempt,
    template: tpl.name,
    to,
    status: res.status,
    ok: res.ok,
    body: JSON.stringify(json),
  });

  if (!res.ok) {
    const errMsg = json?.error?.message || `HTTP ${res.status}`;
    logger.error(`[WA] API error`, {
      template: tpl.name,
      to,
      status: res.status,
      errorCode: json?.error?.code,
      errorType: json?.error?.type,
      errorMessage: errMsg,
      fullError: JSON.stringify(json?.error),
    });
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
  console.log('📱 sendTemplateMessage called | template:', templateName, '| phone:', recipientPhone, '| params:', JSON.stringify(parameters));
  logger.info(`[WA] sendTemplateMessage called`, { templateName, recipientPhone, parameters });

  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.log('🔴 MISSING CREDENTIALS — hasToken:', !!WHATSAPP_TOKEN, '| hasPhoneNumberId:', !!PHONE_NUMBER_ID);
    logger.error('[WA] MISSING CREDENTIALS — WHATSAPP_TOKEN or PHONE_NUMBER_ID not set', {
      hasToken: !!WHATSAPP_TOKEN,
      hasPhoneNumberId: !!PHONE_NUMBER_ID,
      templateName,
    });
    return { success: false, messageId: null, error: 'WhatsApp credentials not configured' };
  }

  if (!TEMPLATES[templateName]) {
    logger.error(`[WA] Unknown template name: "${templateName}"`, {
      availableTemplates: Object.keys(TEMPLATES),
    });
    return { success: false, messageId: null, error: `Unknown template: "${templateName}"` };
  }

  const to = normalizePhone(recipientPhone);
  logger.info(`[WA] Normalized phone`, { raw: recipientPhone, normalized: to });

  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const messageId = await sendOnce(to, templateName, parameters, attempt);
      logger.info(`[WA] ✅ Success`, { templateName, to, messageId, attempt });
      return { success: true, messageId, error: null };
    } catch (err) {
      lastError = err.message;
      logger.warn(`[WA] ❌ Attempt ${attempt}/${RETRY_ATTEMPTS} failed`, {
        templateName,
        to,
        error: lastError,
      });
      if (attempt < RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY_MS * attempt;
        logger.info(`[WA] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  logger.error('[WA] All retries exhausted', { templateName, to, error: lastError });
  return { success: false, messageId: null, error: lastError };
}

/**
 * Fire-and-forget wrapper — sends without blocking the caller.
 * Logs failures but never throws.
 */
export function sendTemplateAsync(recipientPhone, templateName, parameters = {}) {
  logger.info(`[WA] sendTemplateAsync queued`, { templateName, recipientPhone });
  setImmediate(async () => {
    const result = await sendTemplateMessage(recipientPhone, templateName, parameters).catch((err) => {
      logger.error('[WA] sendTemplateAsync uncaught error', { error: err.message });
      return { success: false, error: err.message };
    });
    if (!result.success) {
      logger.error('[WA] sendTemplateAsync final failure', { templateName, recipientPhone, error: result.error });
    }
  });
}
