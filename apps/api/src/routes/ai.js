import express from 'express';
import logger from '../utils/logger.js';
import { geocodeAddress, getNearbyPlacesWithTravelTime, getSectorInfrastructureStats } from '../lib/googleMaps.js';
import { connectivityFactLines } from '../utils/connectivity.js';

const router = express.Router();

function buildAddressString({ city, sector, landmark }) {
  return [landmark, sector, city, 'India'].filter(Boolean).join(', ');
}

async function callClaude(prompt, apiKey, maxTokens = 500, model = 'claude-sonnet-4-5') {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    logger.error('Anthropic API error', { status: response.status, body: errText });
    return null;
  }

  const data = await response.json();
  return data?.content?.[0]?.text?.trim() || null;
}

// Backend-only (Google Places blocks browser calls via CORS). Called when the
// seller picks Zone/Sector in Section 6, to auto-fill Section 10's "Nearby
// Landmarks & Travel Time" field with real, verified places and drive time.
router.post('/nearby-places', async (req, res) => {
  try {
    const { city, zone, sector, landmark } = req.body || {};
    const resolvedCity = city || zone;
    if (!resolvedCity || !sector) {
      return res.status(400).json({ success: false, message: 'city (or zone) and sector are required', nearby: [] });
    }

    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!mapsApiKey) {
      return res.status(503).json({ success: false, message: 'Google Maps is not configured on the server', nearby: [] });
    }

    const address = buildAddressString({ city: resolvedCity, sector, landmark });
    const origin = await geocodeAddress(address, mapsApiKey);
    if (!origin) {
      return res.status(200).json({ success: true, coordinates: null, nearby: [] });
    }

    const nearby = await getNearbyPlacesWithTravelTime(origin, mapsApiKey);
    return res.status(200).json({ success: true, coordinates: origin, nearby });
  } catch (err) {
    logger.error('POST /api/ai/nearby-places error', { message: err.message });
    return res.status(500).json({ success: false, message: 'Server error fetching nearby places', nearby: [] });
  }
});

function buildPrompt(property) {
  const lines = [];
  lines.push(`Property type: ${property.bhk ? property.bhk + ' ' : ''}${property.propertyType}${property.propertySubType ? ` (${property.propertySubType})` : ''}`);
  if (property.totalArea) lines.push(`Area: ${property.totalArea} ${property.areaUnit || ''} (${property.areaType || 'area'})`);
  if (property.totalPrice) lines.push(`Price: ₹${Number(property.totalPrice).toLocaleString('en-IN')}`);
  if (property.bathrooms) lines.push(`Bathrooms: ${property.bathrooms}`);
  if (property.balconies) lines.push(`Balconies: ${property.balconies}`);
  lines.push(`Location: ${[property.landmark, property.sector, property.city].filter(Boolean).join(', ')}`);
  if (property.floorNumber != null && property.totalFloors) lines.push(`Floor: ${property.floorNumber} of ${property.totalFloors}`);
  if (property.possessionStatus) lines.push(`Possession: ${property.possessionStatus}`);
  if (property.furnishingType) lines.push(`Furnishing: ${property.furnishingType}`);
  if (property.ownershipType) lines.push(`Ownership: ${property.ownershipType}`);
  if (property.directionFacing) lines.push(`Facing: ${property.directionFacing}`);
  if (Array.isArray(property.facingType) && property.facingType.length) lines.push(`Facing type: ${property.facingType.join(', ')}`);
  if (property.carParking) lines.push(`Car parking: ${property.carParking}`);
  if (property.bikeParking) lines.push(`Bike parking: ${property.bikeParking}`);
  if (Array.isArray(property.amenities) && property.amenities.length) lines.push(`Amenities: ${property.amenities.join(', ')}`);
  if (Array.isArray(property.nearbyAmenities) && property.nearbyAmenities.length) lines.push(`Nearby facilities (seller-selected): ${property.nearbyAmenities.join(', ')}`);
  const propertyConnectivity = connectivityFactLines(property.connectivity);
  if (propertyConnectivity.length) lines.push(`Connectivity (as typed by the seller):\n${propertyConnectivity.join('\n')}`);
  if (property.nearbyFamousPlace?.trim()) lines.push(`Nearby famous place (as typed by the seller): ${property.nearbyFamousPlace.trim()}`);
  if (Array.isArray(property.bestFor) && property.bestFor.length) lines.push(`Best for: ${property.bestFor.join(', ')}`);
  if (property.plotType) lines.push(`Plot type: ${property.plotType}`);
  if (property.saleType) lines.push(`Sale type: ${property.saleType}`);
  if (property.priceNegotiable) lines.push(`Price negotiable: yes`);
  if (property.bankLoanAvailable) lines.push(`Bank loan available: ${property.bankLoanAvailable}`);

  if (property.visitTimeType === 'anytime') {
    lines.push(`Preferred visit time: Any time (10am–6pm)`);
  } else if (property.visitTimeType === 'fixed' && Array.isArray(property.visitFixedSlots) && property.visitFixedSlots.length) {
    lines.push(`Preferred visit time: Fixed slots — ${property.visitFixedSlots.join(', ')}`);
  } else if (property.visitTimeType === 'flexible' && Array.isArray(property.visitFlexibleSlots) && property.visitFlexibleSlots.length) {
    lines.push(`Preferred visit time: Flexible — ${property.visitFlexibleSlots.join(', ')}`);
  }

  return `You are writing a real estate listing description for an Indian property portal (Growperty.com, covering Greater Noida and Yamuna Expressway/YEIDA).

Using ONLY the facts below — do not invent amenities, prices, places, or any claim not listed — write a compelling, sales-oriented property description.

FACTS:
${lines.join('\n')}

Requirements:
- Start with a short, punchy headline-style first line (no markdown symbols, just plain bold-sounding text) summarizing the property.
- Naturally work in whatever is given above: property type, BHK/area, floor, facing, furnishing, top 2-3 amenities, price — using selling language throughout.
- Only mention nearby places if a "Connectivity" or "Nearby famous place" fact is present above (the seller typed it themselves), using exactly those names and distances — never invent, assume, or add any place, mall, hospital, metro station, or landmark on your own. If neither is present, do not mention nearby places at all.
- Do NOT assume or state anything that isn't explicitly given above.
- Close with a short call-to-action line inviting the reader to schedule a visit — mention the preferred visit time above if given.
- Total length: 80-120 words.
- Plain text only, no markdown headers or bullet symbols.`;
}

router.post('/generate-description', async (req, res) => {
  try {
    const property = req.body || {};
    if (!property.propertyType || !property.city || !property.sector) {
      return res.status(400).json({ success: false, message: 'propertyType, city, and sector are required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, message: 'AI description generation is not configured' });
    }

    const description = await callClaude(buildPrompt(property), apiKey);
    if (!description) {
      return res.status(502).json({ success: false, message: 'AI generation failed' });
    }

    return res.status(200).json({ success: true, description });
  } catch (err) {
    logger.error('POST /api/ai/generate-description error', { message: err.message });
    return res.status(500).json({ success: false, message: 'Server error generating description' });
  }
});

const formatInr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// Overall min/max price across every property type / BHK pricing block —
// same shape ProjectListingForm.jsx submits (fixed `price` or `minPrice`/`maxPrice`).
function projectPriceRange(pricing) {
  const prices = [];
  Object.values(pricing || {}).forEach(byBhk => {
    Object.values(byBhk || {}).forEach(p => {
      [p?.price, p?.minPrice, p?.maxPrice].forEach(v => { if (Number(v) > 0) prices.push(Number(v)); });
    });
  });
  if (!prices.length) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatInr(min) : `${formatInr(min)} – ${formatInr(max)}`;
}

function buildProjectPrompt(project) {
  const lines = [];
  lines.push(`Project: ${project.projectName}${project.builderName ? ` by ${project.builderName}` : ''}`);
  if (project.projectType) lines.push(`Project type: ${project.projectType}`);
  if (Array.isArray(project.propertyTypes) && project.propertyTypes.length) lines.push(`Property types: ${project.propertyTypes.join(', ')}`);
  if (Array.isArray(project.configurationAvailable) && project.configurationAvailable.length) lines.push(`Configurations: ${project.configurationAvailable.join(', ')}`);
  if (Number(project.landArea) > 0) lines.push(`Land area: ${project.landArea} ${project.landAreaUnit || 'Acres'}`);
  if (Number(project.totalTowers) > 0) lines.push(`Towers/blocks: ${project.totalTowers}`);
  if (project.totalFloors?.trim()) lines.push(`Floors: ${project.totalFloors.trim()}`);
  if (Number(project.totalUnits) > 0) lines.push(`Total units: ${project.totalUnits}`);
  if (Number(project.unitsAvailable) > 0) lines.push(`Units still available: ${project.unitsAvailable}`);
  if (Number(project.greenAreaPercent) > 0) lines.push(`Open/green area: ${project.greenAreaPercent}%`);
  const priceRange = projectPriceRange(project.propertyTypePricing);
  if (priceRange) lines.push(`Price range: ${priceRange}`);
  if (Array.isArray(project.paymentPlans) && project.paymentPlans.length) lines.push(`Payment plans: ${project.paymentPlans.join(', ')}`);
  if (project.projectStatus) lines.push(`Status: ${project.projectStatus}`);
  if (project.launchYear) lines.push(`Launch year: ${project.launchYear}`);
  if (project.expectedPossession) lines.push(`Expected possession: ${project.expectedPossession}`);
  if (project.reraNumber) lines.push(`RERA registered: ${project.reraNumber}`);
  else if (project.reraApplied) lines.push(`RERA: applied for`);
  lines.push(`Location: ${[project.societyName, project.landmark, project.sector, project.city].filter(Boolean).join(', ')}`);
  if (Array.isArray(project.amenities) && project.amenities.length) lines.push(`Amenities: ${project.amenities.join(', ')}`);
  const connectivity = connectivityFactLines(project.connectivity);
  if (connectivity.length) lines.push(`Connectivity (as given by the builder):\n${connectivity.join('\n')}`);
  if (project.nearbyFamousPlace?.trim()) lines.push(`Other nearby places (as given by the builder):\n${project.nearbyFamousPlace.trim()}`);
  if (Array.isArray(project.bestFor) && project.bestFor.length) lines.push(`Best for: ${project.bestFor.join(', ')}`);
  if (project.projectUSP?.trim()) lines.push(`Builder's highlights: ${project.projectUSP.trim()}`);

  return `You are writing a new-project description for an Indian real estate portal (Growperty.com, covering Greater Noida and Yamuna Expressway/YEIDA).

Using ONLY the facts below — do not invent amenities, prices, places, possession dates, approvals, or any claim not listed — write a compelling, sales-oriented description of this project.

FACTS:
${lines.join('\n')}

Requirements:
- Start with a short, punchy headline-style first line (plain text, no markdown symbols) naming the project.
- Naturally work in the builder, configurations, price range, status/possession, and top 3-4 amenities — using selling language throughout.
- Only mention nearby places if a "Connectivity" or "Other nearby places" fact is present above, and use exactly those names and distances/times — never add any other place.
- Do NOT assume or state anything that isn't explicitly given above.
- Close with a short call-to-action inviting the reader to enquire or book a site visit.
- Total length: 100-150 words.
- Plain text only, no markdown headers, bold markers, or bullet symbols.`;
}

router.post('/generate-project-description', async (req, res) => {
  try {
    const project = req.body || {};
    if (!project.projectName || !project.city || !project.sector) {
      return res.status(400).json({ success: false, message: 'projectName, city, and sector are required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, message: 'AI description generation is not configured' });
    }

    const raw = await callClaude(buildProjectPrompt(project), apiKey, 600);
    if (!raw) {
      return res.status(502).json({ success: false, message: 'AI generation failed' });
    }

    return res.status(200).json({ success: true, description: raw.replace(/\*\*/g, '').trim() });
  } catch (err) {
    logger.error('POST /api/ai/generate-project-description error', { message: err.message });
    return res.status(500).json({ success: false, message: 'Server error generating description' });
  }
});

const SECTOR_GUIDE_FAILURE_MESSAGE = 'Sector guide could not be generated. Please fill manually.';

function buildSectorGuidePrompt(city, sector, stats) {
  const { counts, metroStations, nearbyLandmarks } = stats;
  // A count of 0 becomes the literal word "limited" — handing the model a
  // non-numeric value for empty categories makes it structurally unable to
  // invent a specific number where there isn't one.
  const factLines = Object.values(counts).map(({ label, count, display }) =>
    `${label}: ${count === 0 ? 'limited (none found nearby)' : display}`
  );
  if (metroStations.length) factLines.push(`Metro stations nearby: ${metroStations.join(', ')}`);
  else factLines.push(`Metro stations nearby: limited (none found nearby)`);
  if (nearbyLandmarks.length) factLines.push(`Other nearby landmarks: ${nearbyLandmarks.join(', ')}`);

  return `You are writing a "Sector Guide" for an Indian real estate portal (Growperty.com) — a general information paragraph about the LOCATION and its social infrastructure, not about any specific property or unit.

Sector: ${sector}, ${city}

EXACT DATA (from Google Places API, real counts — not estimates):
${factLines.join('\n')}

Write a sector guide using ONLY these exact numbers provided. Do NOT add, increase, round, or assume any number beyond what is given above. A number written with "+" (e.g. "60+") must be written exactly that way, with the "+"; a number without "+" must be written without one. Do NOT invent any place name, bank brand, metro line name (e.g. "Aqua Line"), gated-entry count, or security detail that isn't explicitly given above. Where a category says "limited (none found nearby)", write "limited" for that category — do not turn it into any number, and do not skip mentioning it if it's natural to the flow.

Write ONE cohesive, buyer-friendly paragraph, 100-150 words, in a confident, informative real-estate tone. Plain text only — no title or heading line, no markdown (#, **, bullets). Start directly with the paragraph.`;
}

// Backend-only. Called when the seller picks Zone/Sector in Section 6, to
// auto-fill the new "Sector Guide" section with an AI-written paragraph
// grounded in real Google Places infrastructure counts. Never falls back to
// placeholder/hallucinated content on any failure — reports it plainly instead.
router.post('/sector-guide', async (req, res) => {
  const { city, zone, sector } = req.body || {};
  const resolvedCity = city || zone;
  if (!resolvedCity || !sector) {
    return res.status(400).json({ success: false, message: 'city (or zone) and sector are required' });
  }

  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!mapsApiKey || !anthropicKey) {
    return res.status(503).json({ success: false, message: SECTOR_GUIDE_FAILURE_MESSAGE });
  }

  try {
    const origin = await geocodeAddress(buildAddressString({ city: resolvedCity, sector }), mapsApiKey);
    if (!origin) {
      return res.status(200).json({ success: false, message: SECTOR_GUIDE_FAILURE_MESSAGE });
    }

    const stats = await getSectorInfrastructureStats(origin, mapsApiKey);
    // Haiku: this is a short rewrite of given facts, and the whole route
    // (paginated Places + AI) must finish inside Vercel's 10s limit.
    const raw = await callClaude(buildSectorGuidePrompt(resolvedCity, sector, stats), anthropicKey, 400, 'claude-haiku-4-5');
    // Drop any markdown heading line the model adds despite the prompt.
    const guide = raw?.split('\n').filter(line => !line.trim().startsWith('#')).join('\n').replace(/\*\*/g, '').trim();
    if (!guide) {
      return res.status(502).json({ success: false, message: SECTOR_GUIDE_FAILURE_MESSAGE });
    }

    return res.status(200).json({ success: true, guide, stats });
  } catch (err) {
    logger.error('POST /api/ai/sector-guide error', { message: err.message });
    return res.status(502).json({ success: false, message: SECTOR_GUIDE_FAILURE_MESSAGE });
  }
});

export default router;
