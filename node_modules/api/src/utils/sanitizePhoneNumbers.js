/**
 * Sanitize Indian phone numbers in text
 * Detects and replaces phone numbers matching pattern: (\+91[-\s]?)?[0-9]{10}
 * Handles formats: 9891117876, 98 9111 7876, +91 9891117876, +919891117876
 * @param {string} text - Text to sanitize
 * @returns {string} Text with phone numbers replaced by **********
 */
export function sanitizePhoneNumbers(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Pattern explanation:
  // (\+91[-\s]?)? - Optional: +91 with optional dash or space
  // [0-9]{10} - Exactly 10 digits
  const phonePattern = /(\+91[-\s]?)?[0-9]{10}/g;

  return text.replace(phonePattern, '**********');
}

/**
 * Detect if text contains phone numbers
 * @param {string} text - Text to check
 * @returns {boolean} True if phone numbers are detected
 */
export function detectPhoneNumbers(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const phonePattern = /(\+91[-\s]?)?[0-9]{10}/g;
  return phonePattern.test(text);
}