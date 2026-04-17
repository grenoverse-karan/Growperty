import pb from '@/lib/pocketbaseClient';

// Comprehensive regex patterns for contact info
const PATTERNS = {
  phone: /(?:(?:\+|0{0,2})91[\s\-]*)?(?:\d[\s\-]*){10}/g,
  writtenPhone: /(?:zero|one|two|three|four|five|six|seven|eight|nine|shunya|ek|do|teen|char|paanch|che|saat|aath|nau|das)[\s\-]*/gi,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  url: /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/[^\s]*)/gi,
  social: /@(instagram|facebook|twitter|x|telegram|whatsapp|snapchat)[\w\.]*|#\w+/gi,
  keywords: /(call|whatsapp|contact|message|reach|dm|inbox|telegram|signal|viber|phone number|mobile number)[\s\w]*/gi,
  whatsappLink: /(wa\.me|whatsapp\.com)\/[^\s]+/gi
};

export const detectContactInfo = (text) => {
  if (!text) return [];
  const matches = [];
  
  Object.entries(PATTERNS).forEach(([type, regex]) => {
    const found = text.match(regex);
    if (found) {
      if (type === 'writtenPhone') {
        const words = found.join(' ').split(/[\s\-]+/);
        if (words.length >= 5) matches.push(...found);
      } else {
        matches.push(...found);
      }
    }
  });
  
  return [...new Set(matches)];
};

export const filterContactInfo = (text) => {
  if (!text) return text;
  let cleaned = text;
  
  Object.entries(PATTERNS).forEach(([type, regex]) => {
    if (type === 'writtenPhone') {
      cleaned = cleaned.replace(/(?:(?:zero|one|two|three|four|five|six|seven|eight|nine|shunya|ek|do|teen|char|paanch|che|saat|aath|nau|das)[\s\-]*){5,}/gi, '***');
    } else {
      cleaned = cleaned.replace(regex, '***');
    }
  });
  
  return cleaned;
};

export const filterDescription = (text) => {
  return filterContactInfo(text);
};

export const getContactWarning = () => {
  return 'Contact details are not allowed. Please use Growperty communication system.';
};

export const getFilteredAddress = (property) => {
  if (!property) return '';
  
  if (property.sector || property.locality || property.city) {
    const parts = [
      property.sector,
      property.locality,
      property.landmark ? `Near ${property.landmark}` : null,
      property.city
    ].filter(Boolean);
    return parts.join(', ');
  }
  
  return property.location || 'Location not specified';
};

export const logFilteredContent = async (listingId, fieldName, removedContent) => {
  try {
    await pb.collection('contentLogs').create({
      listingId,
      fieldName,
      removedContent: Array.isArray(removedContent) ? removedContent.join(', ') : removedContent,
      adminNotes: 'Auto-filtered during submission'
    }, { $autoCancel: false });
  } catch (error) {
    console.error('Failed to log filtered content:', error);
  }
};