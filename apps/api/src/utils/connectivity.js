// Structured "Connectivity" rows on property + project listings. Keys match
// CONNECTIVITY_TYPES in the web app's listingOptions.js.
const CONNECTIVITY_KEYS = new Set(['metro', 'airport', 'highway', 'railway', 'school', 'hospital', 'mall', 'market', 'park', 'busStand']);

export const CONNECTIVITY_LABELS = {
  metro: 'Metro', airport: 'Airport', highway: 'Highway', railway: 'Railway station',
  school: 'School', hospital: 'Hospital', mall: 'Mall',
  market: 'Market', park: 'Public park', busStand: 'Bus stand',
};

/**
 * Keeps only well-formed rows with a known type and a name, trimming lengths.
 * Accepts an array or its JSON string (multipart project submissions).
 */
export const sanitizeConnectivity = (value) => {
  let rows = value;
  if (typeof rows === 'string') {
    try { rows = JSON.parse(rows); } catch { return []; }
  }
  if (!Array.isArray(rows)) return [];
  return rows
    .filter(r => r && CONNECTIVITY_KEYS.has(r.type) && typeof r.name === 'string' && r.name.trim())
    .map(r => ({
      type: r.type,
      name: r.name.trim().slice(0, 80),
      distance: typeof r.distance === 'string' ? r.distance.trim().slice(0, 20) : '',
    }));
};

// "Metro: Pari Chowk Metro (2 km)" lines for AI prompts.
export const connectivityFactLines = (rows) =>
  sanitizeConnectivity(rows).map(c => `${CONNECTIVITY_LABELS[c.type]}: ${c.name}${c.distance ? ` (${c.distance})` : ''}`);
