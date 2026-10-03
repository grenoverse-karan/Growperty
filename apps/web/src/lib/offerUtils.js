// Festival → emoji, matched against the offer name (case-insensitive,
// first match wins). Custom names that match nothing fall back to 🎁.
const OFFER_EMOJIS = [
  [/diwali|deepawali/i, '🪔'],
  [/dhanteras/i, '🪙'],
  [/navratri|garba|durga/i, '🪔'],
  [/dussehra|dasara/i, '🏹'],
  [/holi/i, '🎨'],
  [/new\s*year/i, '🎉'],
  [/independence|republic/i, '🇮🇳'],
  [/christmas|xmas/i, '🎄'],
  [/eid/i, '🌙'],
  [/raksha|rakhi/i, '🪢'],
  [/ganesh/i, '🐘'],
  [/limited|flash|hurry/i, '⏰'],
  [/festival|festive/i, '🎊'],
];

export const getOfferEmoji = (title = '') =>
  OFFER_EMOJIS.find(([re]) => re.test(title))?.[1] || '🎁';

/**
 * The property's offer if it should be shown right now, else null — hidden
 * on sold listings and once the whole "valid till" day has passed.
 */
export const getActiveOffer = (property) => {
  if (!property || property.status === 'sold') return null;
  const title = property.offerTitle?.trim();
  const details = property.offerDetails?.trim();
  if (!title && !details) return null;

  const validTill = property.offerValidTill ? new Date(property.offerValidTill) : null;
  if (validTill && Date.now() > validTill.getTime() + 24 * 60 * 60 * 1000) return null;

  return { title, details, validTill, emoji: getOfferEmoji(title) };
};

/**
 * If the active offer is a percentage discount ("5% Off", "2.5% off"),
 * returns the effective price and saving; otherwise null. Only the displayed
 * price changes — the stored totalPrice (used by filters) is untouched.
 */
export const getOfferPricing = (offer, price) => {
  const match = offer?.details?.match(/(\d+(?:\.\d+)?)\s*%\s*off/i);
  const total = Number(price) || 0;
  if (!match || total <= 0) return null;
  const pct = Number(match[1]);
  if (!(pct > 0 && pct < 100)) return null;
  const saving = Math.round((total * pct) / 100);
  return { pct, saving, finalPrice: total - saving };
};

/**
 * Chip text for a non-% offer (a freebie like "Free Modular Kitchen"):
 * "Offer - Get Free Modular Kitchen". Null for % offers (those show
 * "Save ₹…" instead) or when there are no offer details.
 */
export const getOfferBenefitLabel = (offer) => {
  const details = offer?.details;
  if (!details || /\d\s*%\s*off/i.test(details)) return null;
  return `Offer - ${getOfferPhrase(details)}`;
};

/** "5% Off" → "Get 5% Off"; "No Brokerage" / "Get …" are left as-is. */
export const getOfferPhrase = (details) => {
  if (!details) return details;
  return /^(get|no)\b/i.test(details) ? details : `Get ${details}`;
};

/** One-line summary for strips/chips: "Navratri Offer · Get 5% Off". */
export const getOfferSummary = (offer) =>
  [offer?.title, getOfferPhrase(offer?.details)].filter(Boolean).join(' · ');
