export const sanitizePhoneNumbers = (text) => {
  if (!text) return text;
  
  // Remove phone numbers in various formats
  // Matches: +91-9876543210, +91 9876543210, 9876543210, etc.
  const phoneRegex = /(\+91[-\s]?)?[0-9]{10}/g;
  
  return text.replace(phoneRegex, '');
};

export const detectPhoneNumbers = (text) => {
  if (!text) return [];
  
  const phoneRegex = /(\+91[-\s]?)?[0-9]{10}/g;
  return text.match(phoneRegex) || [];
};

export const hasPhoneNumbers = (text) => {
  if (!text) return false;
  
  const phoneRegex = /(\+91[-\s]?)?[0-9]{10}/g;
  return phoneRegex.test(text);
};