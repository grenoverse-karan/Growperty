import { PLATFORM_WHATSAPP } from '@/constants/contactInfo.js';
import { getActiveCpContact } from '@/lib/cpRef.js';

/**
 * Opens WhatsApp the same way everywhere on the site: the visitor's referring
 * Channel Partner if a CP-ref cookie is active, otherwise Growperty's own
 * number — always with a pre-filled message, never a blank chat.
 */
export const openWhatsApp = (message) => {
  const cp = getActiveCpContact();
  const number = cp ? `91${cp.cpPhone.replace(/\D/g, '').slice(-10)}` : PLATFORM_WHATSAPP;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  window.open(`https://wa.me/${number}${text}`, '_blank');
};
