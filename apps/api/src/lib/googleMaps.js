import logger from '../utils/logger.js';

const NEARBY_CATEGORIES = [
  { label: 'Metro', type: 'subway_station' },
  { label: 'Hospital', type: 'hospital' },
  { label: 'School', type: 'school' },
  { label: 'Mall', type: 'shopping_mall' },
];

const SEARCH_RADIUS_METERS = 5000;
const FETCH_TIMEOUT_MS = 5000;

const fetchJsonWithTimeout = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const geocodeAddress = async (address, apiKey) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=in&components=country:IN&key=${apiKey}`;
  const data = await fetchJsonWithTimeout(url);
  if (data?.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    logger.error('Geocoding API error', { status: data.status, message: data.error_message });
  }
  const loc = data?.results?.[0]?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng } : null;
};

// Nearby Search doesn't sort by distance under `radius` mode (only under
// `rankby=distance`, which forbids a radius cap) — so we fetch by radius
// and pick the closest result ourselves via straight-line distance.
const findNearestInCategory = async (origin, category, apiKey) => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${origin.lat},${origin.lng}&radius=${SEARCH_RADIUS_METERS}&type=${category.type}&key=${apiKey}`;
  const data = await fetchJsonWithTimeout(url);
  if (data?.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    logger.error('Places Nearby Search error', { category: category.label, status: data.status, message: data.error_message });
  }
  const results = data?.results || [];

  let nearest = null;
  let nearestKm = Infinity;
  for (const place of results) {
    const loc = place.geometry?.location;
    if (!loc) continue;
    const km = haversineKm(origin.lat, origin.lng, loc.lat, loc.lng);
    if (km < nearestKm) {
      nearestKm = km;
      nearest = { name: place.name, lat: loc.lat, lng: loc.lng };
    }
  }
  return nearest;
};

/**
 * Finds the nearest metro/hospital/school/mall around `origin` and resolves
 * their REAL road distance via Distance Matrix (not the straight-line figure
 * used above to pick which candidate is "nearest" — only the final returned
 * distanceKm comes from Distance Matrix).
 */
export const getNearbyFacts = async (origin, apiKey) => {
  const candidates = {};
  await Promise.all(NEARBY_CATEGORIES.map(async (category) => {
    try {
      candidates[category.label] = await findNearestInCategory(origin, category, apiKey);
    } catch (err) {
      logger.error('Places nearby search failed', { category: category.label, message: err.message });
      candidates[category.label] = null;
    }
  }));

  const entries = Object.entries(candidates).filter(([, place]) => place);
  if (!entries.length) return [];

  const destinations = entries.map(([, place]) => `${place.lat},${place.lng}`).join('|');
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destinations}&mode=driving&key=${apiKey}`;

  let matrixElements = [];
  try {
    const data = await fetchJsonWithTimeout(url);
    if (data?.status && data.status !== 'OK') {
      logger.error('Distance Matrix API error', { status: data.status, message: data.error_message });
    }
    matrixElements = data?.rows?.[0]?.elements || [];
  } catch (err) {
    logger.error('Distance Matrix request failed', { message: err.message });
    return [];
  }

  return entries
    .map(([label, place], i) => {
      const el = matrixElements[i];
      if (!el || el.status !== 'OK') return null;
      return { label, name: place.name, distanceKm: Math.round((el.distance.value / 1000) * 10) / 10 };
    })
    .filter(Boolean);
};
