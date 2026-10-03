import logger from './logger.js';

// English number-words used to spell out digits (e.g. "nine eight two ...")
const DIGIT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'oh', 'double', 'triple'];

/**
 * Fast, synchronous, regex-based redaction. Runs unconditionally (no network
 * call), so contact info is still stripped even if the AI layer below is
 * unavailable or misconfigured.
 *
 * Catches:
 *  - 10-digit Indian mobile numbers, optionally prefixed with +91/91, with
 *    arbitrary spaces/dots/dashes between digits (e.g. "98 91 11 78 76").
 *  - The same number spelled out in words (e.g. "nine eight nine one one ...").
 */
function regexSanitize(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text;

  // Digits with up to 2 separator characters between each one.
  const spacedDigits = /(?:\+?91[-.\s]{0,2})?[6-9](?:[-.\s]{0,2}\d){9}/g;
  out = out.replace(spacedDigits, '[HIDDEN]');

  // 10+ digit-words in a row (allows "double"/"triple" fillers in between).
  const wordRun = new RegExp(`\\b(?:${DIGIT_WORDS.join('|')})(?:[\\s-]+(?:${DIGIT_WORDS.join('|')})){9,}\\b`, 'gi');
  out = out.replace(wordRun, '[HIDDEN]');

  return out;
}

/**
 * Sends the given free-text fields to Claude in a single batched call, asking
 * it to redact any contact info (phone numbers in any disguised form, emails)
 * while leaving everything else untouched. Returns null (caller keeps the
 * regex-sanitized version) if the AI key is missing or the call fails —
 * this layer is a best-effort enhancement, never a hard dependency.
 */
async function aiModerateFields(fields) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const entries = Object.entries(fields).filter(([, v]) => v && String(v).trim());
  if (!apiKey || entries.length === 0) return null;

  const prompt = `You are a content-safety filter for an Indian real estate listing platform. The fields below were submitted by a user. Contact details (phone numbers, WhatsApp numbers, email addresses) must ONLY be collected through the platform's dedicated contact fields — they must NEVER appear inside this free text, in ANY form: plain digits, digits separated by spaces/dots/dashes, spelled out in words ("nine eight two..."), letter-substituted digits (O for 0, l/I for 1), or split across sentences.

For each field, return the exact same text but with any phone number / email / contact detail found (in any disguised form) replaced with the literal marker [HIDDEN]. Do not rewrite, paraphrase, or otherwise change anything else — preserve all other content and formatting exactly. If a field has no contact info, return it completely unchanged.

Respond with ONLY a raw JSON object (no markdown, no code fences, no explanation) mapping each field name below to its cleaned string.

${entries.map(([k, v]) => `### ${k}\n${v}`).join('\n\n')}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('AI contact moderation call failed', { status: response.status, body: errText });
      return null;
    }

    const data = await response.json();
    const raw = data?.content?.[0]?.text?.trim();
    if (!raw) return null;

    const jsonStr = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    logger.error('AI contact moderation error', { message: err.message });
    return null;
  }
}

/**
 * Moderates a set of free-text fields for hidden/disguised contact info.
 * Regex sanitization always runs first (fast, free, no external dependency);
 * the AI layer then runs on top to catch cleverer disguises (spelled-out
 * numbers etc.) that regex can't reliably match. Silently redacts — never
 * throws or blocks the caller's flow.
 *
 * @param {Object<string,string>} fields - e.g. { description, currentAddress }
 * @returns {Promise<Object<string,string>>} same keys, sanitized values
 */
export async function moderateFreeTextFields(fields) {
  const regexResult = {};
  for (const [key, value] of Object.entries(fields)) {
    regexResult[key] = regexSanitize(value);
  }

  const aiResult = await aiModerateFields(regexResult);
  if (aiResult) {
    for (const key of Object.keys(fields)) {
      if (typeof aiResult[key] === 'string') regexResult[key] = aiResult[key];
    }
  }

  return regexResult;
}
