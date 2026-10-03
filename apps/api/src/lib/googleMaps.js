import logger from '../utils/logger.js';

const NEARBY_CATEGORIES = [
  { label: 'Metro', type: 'subway_station', minReviews: 100, showName: true },
  { label: 'Mall', type: 'shopping_mall', minReviews: 100, showName: true },
  // A random supermarket/clinic/school's own name means nothing to a buyer —
  // show the generic "Nearest X" instead of e.g. "Tarana Musical Instruments Store".
  { label: 'Market', type: 'supermarket', minReviews: 100, showName: false },
  { label: 'School', type: 'school', minReviews: 100, showName: false },
  { label: 'Hospital', type: 'hospital', minReviews: 200, showName: false }, // chain hospitals only — stricter threshold
];

// Two well-known landmarks always shown regardless of category filtering —
// geocoded fresh each time (not hardcoded coordinates) so travel time stays accurate.
const DEFAULT_LANDMARKS = [
  { label: 'Pari Chowk', name: 'Pari Chowk', address: 'Pari Chowk, Greater Noida, India' },
  { label: 'Airport', name: 'Noida International Airport (Jewar)', address: 'Noida International Airport, Jewar, India' },
];

const SEARCH_RADIUS_METERS = 5000;
const MIN_RATING = 4.0;
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

// Fetch every candidate within the radius that clears the rating/review bar,
// then pick the CLOSEST one (straight-line) — not the most-reviewed one.
const findClosestInCategory = async (origin, category, apiKey) => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${origin.lat},${origin.lng}&radius=${SEARCH_RADIUS_METERS}&type=${category.type}&key=${apiKey}`;
  const data = await fetchJsonWithTimeout(url);
  if (data?.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    logger.error('Places Nearby Search error', { category: category.label, status: data.status, message: data.error_message });
  }
  const results = data?.results || [];

  const qualifying = results
    .filter(place =>
      place.geometry?.location &&
      (place.rating || 0) >= MIN_RATING &&
      (place.user_ratings_total || 0) >= category.minReviews
    )
    .map(place => ({
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      distanceKm: haversineKm(origin.lat, origin.lng, place.geometry.location.lat, place.geometry.location.lng),
    }));
  if (!qualifying.length) return null;

  qualifying.sort((a, b) => a.distanceKm - b.distanceKm);
  return qualifying[0];
};

/**
 * Finds the CLOSEST qualifying metro/mall/market/school/hospital within 5km
 * of `origin` (rating + review-volume filtered, one per category, chain
 * hospitals held to a stricter review threshold), PLUS two always-on named
 * landmarks (Pari Chowk, Jewar Airport), and resolves each one's real driving
 * TIME (not distance) via Distance Matrix.
 */
export const getNearbyPlacesWithTravelTime = async (origin, apiKey) => {
  const categoryEntries = [];
  await Promise.all(NEARBY_CATEGORIES.map(async (category) => {
    try {
      const place = await findClosestInCategory(origin, category, apiKey);
      if (!place) return;
      // Never surface a "Pari Chowk" variant as its own line — the default
      // Pari Chowk landmark below already covers it, so skip this category
      // entirely rather than showing a near-duplicate.
      if (/pari\s*chowk/i.test(place.name)) return;
      const displayName = category.showName ? place.name : `Nearest ${category.label}`;
      categoryEntries.push({ label: category.label, name: displayName, lat: place.lat, lng: place.lng, isDefault: false });
    } catch (err) {
      logger.error('Places nearby search failed', { category: category.label, message: err.message });
    }
  }));

  const defaultEntries = [];
  await Promise.all(DEFAULT_LANDMARKS.map(async (landmark) => {
    try {
      const loc = await geocodeAddress(landmark.address, apiKey);
      if (loc) defaultEntries.push({ label: landmark.label, name: landmark.name, lat: loc.lat, lng: loc.lng, isDefault: true });
    } catch (err) {
      logger.error('Default landmark geocoding failed', { landmark: landmark.label, message: err.message });
    }
  }));

  const entries = [...categoryEntries, ...defaultEntries];
  if (!entries.length) return [];

  const destinations = entries.map(e => `${e.lat},${e.lng}`).join('|');
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
    .map((entry, i) => {
      const el = matrixElements[i];
      if (!el || el.status !== 'OK') return null;
      const minutes = Math.round(el.duration.value / 60);
      return { label: entry.label, name: entry.name, minutes, isDefault: entry.isDefault };
    })
    .filter(Boolean)
    // Category places sorted nearest-first (by time); defaults (Pari Chowk/Airport) stay appended at the end.
    .sort((a, b) => (a.isDefault === b.isDefault ? a.minutes - b.minutes : a.isDefault ? 1 : -1));
};

// Counted (not named) infrastructure categories for the Sector Guide — a
// buyer cares how MANY schools/hospitals/etc. are around, not which specific
// unrated shop. Some categories combine multiple Google Place types (e.g.
// banks + ATMs) and are summed. Radius is per-category, matching how far a
// buyer would realistically consider each amenity type "nearby".
const SECTOR_COUNT_CATEGORIES = [
  // Google's `school`/`hospital` types include tiny tuition centres and
  // one-room clinics — only count established places buyers would recognise.
  { key: 'schools', label: 'Schools', types: ['school'], radius: 1500, minRating: 3.5, minReviews: 50 },
  { key: 'hospitals', label: 'Hospitals & Clinics', types: ['hospital'], radius: 1500, minRating: 3.5, minReviews: 50 },
  { key: 'markets', label: 'Markets & Supermarkets', types: ['supermarket', 'grocery_or_supermarket'], radius: 500 },
  { key: 'gyms', label: 'Gyms & Fitness Centers', types: ['gym'], radius: 1000 },
  { key: 'parks', label: 'Public Parks', types: ['park'], radius: 1000 },
  { key: 'temples', label: 'Temples & Religious Places', types: ['hindu_temple', 'mosque', 'church'], radius: 500 },
  { key: 'banks', label: 'Banks & ATMs', types: ['bank', 'atm'], radius: 500 },
  { key: 'restaurants', label: 'Restaurants & Cafes', types: ['restaurant', 'cafe'], radius: 500 },
];

const METRO_RADIUS_METERS = 3000;

// Legacy Nearby Search returns 20 per page (up to 3 pages). A
// next_page_token only becomes valid ~2s after it's issued; requesting it
// sooner returns INVALID_REQUEST, so that one status is retried after waiting.
// Capped at 2 pages (40): each extra page costs a mandatory 2s wait, and the
// whole request must finish inside Vercel's 10s function limit.
const PAGE_SIZE = 20;
const MAX_PAGES = 2;
const PAGE_TOKEN_DELAY_MS = 2000;
const PAGE_TOKEN_RETRIES = 3;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ZERO_RESULTS is a legitimate "nothing found" answer; anything else
// non-OK (REQUEST_DENIED, OVER_QUERY_LIMIT, INVALID_REQUEST, ...) means the
// API call itself failed — throw so the caller reports failure honestly
// instead of silently treating a broken key/billing issue as "0 nearby".
const nearbySearchPage = async (url, type, context, isTokenPage) => {
  for (let attempt = 0; ; attempt++) {
    const data = await fetchJsonWithTimeout(url);
    if (data?.status === 'ZERO_RESULTS') return { results: [], nextPageToken: null };
    if (data?.status === 'OK') return { results: data.results || [], nextPageToken: data.next_page_token || null };
    if (isTokenPage && data?.status === 'INVALID_REQUEST' && attempt < PAGE_TOKEN_RETRIES) {
      await sleep(PAGE_TOKEN_DELAY_MS);
      continue;
    }
    logger.error('Places Nearby Search error', { context, type, status: data?.status, message: data?.error_message });
    throw new Error(`Places Nearby Search failed for ${type}: ${data?.status || 'no response'}`);
  }
};

// Follows next_page_token through every available page. `capped` is true
// when Google still had a further page it wouldn't hand over (i.e. the
// page limit was hit) — the real number may be higher than counted.
const nearbySearchAllPages = async (origin, type, radius, apiKey, context) => {
  const firstUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${origin.lat},${origin.lng}&radius=${radius}&type=${type}&key=${apiKey}`;
  const results = [];
  let page = await nearbySearchPage(firstUrl, type, context, false);
  results.push(...page.results);

  let pages = 1;
  while (page.nextPageToken && pages < MAX_PAGES) {
    await sleep(PAGE_TOKEN_DELAY_MS);
    const tokenUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${encodeURIComponent(page.nextPageToken)}&key=${apiKey}`;
    page = await nearbySearchPage(tokenUrl, type, context, true);
    results.push(...page.results);
    pages++;
  }

  const capped = Boolean(page.nextPageToken) || (pages === MAX_PAGES && page.results.length === PAGE_SIZE);
  return { results, capped };
};

// Counts a category across all its place types, de-duplicated by place_id —
// a branch that's tagged both `bank` and `atm` must only count once.
const countCategory = async (origin, category, apiKey) => {
  const perType = await Promise.all(
    category.types.map(t => nearbySearchAllPages(origin, t, category.radius, apiKey, 'sector count'))
  );
  const placeIds = new Set();
  perType.forEach(({ results }) => results
    .filter(p => !category.minReviews ||
      ((p.rating || 0) >= category.minRating && (p.user_ratings_total || 0) >= category.minReviews))
    .forEach(p => placeIds.add(p.place_id || p.name)));
  return { count: placeIds.size, capped: perType.some(r => r.capped) };
};

const namesForType = async (origin, type, radius, apiKey) =>
  (await nearbySearchPage(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${origin.lat},${origin.lng}&radius=${radius}&type=${type}&key=${apiKey}`,
    type, 'sector names', false,
  )).results.map(p => p.name);

/**
 * Counts schools/hospitals/markets/gyms/parks/temples/banks/restaurants near
 * `origin` (paginated Nearby Search, de-duplicated, per-category radius),
 * names any metro stations and the nearest mall, and includes Pari Chowk as a
 * default landmark — the raw, verifiable material an AI Sector Guide is
 * grounded in. Each count carries `display`: the exact number, or "N+" only
 * when Google's result ceiling was hit and the true total may be higher.
 *
 * Throws if geocoding/Places is unreachable — callers must NOT fall back to
 * any placeholder/hallucinated content on failure.
 */
export const getSectorInfrastructureStats = async (origin, apiKey) => {
  // Every category, plus the metro/mall/landmark lookups, fire at once —
  // the only sequential waits are page-token delays within one search.
  const counts = {};
  const [, metroStations, malls, pariChowk] = await Promise.all([
    Promise.all(SECTOR_COUNT_CATEGORIES.map(async (category) => {
      const { count, capped } = await countCategory(origin, category, apiKey);
      counts[category.key] = { label: category.label, count, capped, display: capped ? `${count}+` : String(count) };
    })),
    namesForType(origin, 'subway_station', METRO_RADIUS_METERS, apiKey),
    namesForType(origin, 'shopping_mall', 3000, apiKey),
    geocodeAddress('Pari Chowk, Greater Noida, India', apiKey),
  ]);

  const nearbyLandmarks = [];
  if (malls[0]) nearbyLandmarks.push(malls[0]);
  if (pariChowk) nearbyLandmarks.push('Pari Chowk');

  return { counts, metroStations: metroStations.slice(0, 3), nearbyLandmarks };
};
