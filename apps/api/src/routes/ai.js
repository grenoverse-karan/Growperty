import express from 'express';
import logger from '../utils/logger.js';
import { geocodeAddress, getNearbyFacts } from '../lib/googleMaps.js';

const router = express.Router();

function buildAddressString(property) {
  return [property.landmark, property.sector, property.city, 'India'].filter(Boolean).join(', ');
}

function buildPrompt(property, nearby) {
  const lines = [];
  lines.push(`Property type: ${property.bhk ? property.bhk + ' ' : ''}${property.propertyType}${property.propertySubType ? ` (${property.propertySubType})` : ''}`);
  if (property.totalArea) lines.push(`Area: ${property.totalArea} ${property.areaUnit || ''} (${property.areaType || 'area'})`);
  if (property.totalPrice) lines.push(`Price: ₹${Number(property.totalPrice).toLocaleString('en-IN')}`);
  if (property.bathrooms) lines.push(`Bathrooms: ${property.bathrooms}`);
  if (property.balconies) lines.push(`Balconies: ${property.balconies}`);
  lines.push(`Location: ${[property.sector, property.city].filter(Boolean).join(', ')}`);
  if (property.floorNumber != null && property.totalFloors) lines.push(`Floor: ${property.floorNumber} of ${property.totalFloors}`);
  if (property.possessionStatus) lines.push(`Possession: ${property.possessionStatus}`);
  if (property.furnishingType) lines.push(`Furnishing: ${property.furnishingType}`);
  if (property.ownershipType) lines.push(`Ownership: ${property.ownershipType}`);
  if (property.directionFacing) lines.push(`Facing: ${property.directionFacing}`);
  if (Array.isArray(property.facingType) && property.facingType.length) lines.push(`Facing type: ${property.facingType.join(', ')}`);
  if (property.carParking) lines.push(`Car parking: ${property.carParking}`);
  if (property.bikeParking) lines.push(`Bike parking: ${property.bikeParking}`);
  if (Array.isArray(property.amenities) && property.amenities.length) lines.push(`Amenities: ${property.amenities.join(', ')}`);
  if (property.plotType) lines.push(`Plot type: ${property.plotType}`);
  if (property.saleType) lines.push(`Sale type: ${property.saleType}`);
  if (property.priceNegotiable) lines.push(`Price negotiable: yes`);
  if (property.bankLoanAvailable) lines.push(`Bank loan available: ${property.bankLoanAvailable}`);

  if (nearby && nearby.length) {
    lines.push(`Nearby (real road distance, verified via Google Maps): ${nearby.map(n => `${n.label} - ${n.name} (${n.distanceKm}km)`).join('; ')}`);
  }

  return `You are writing a real estate listing description for an Indian property portal (Growperty.com, covering Greater Noida, Noida, and Yamuna Expressway/YEIDA).

Using ONLY the facts below — do not invent amenities, prices, or claims not listed — write a compelling, informative property description.

FACTS:
${lines.join('\n')}

Requirements:
- Start with a short, punchy headline-style first line (no markdown symbols, just plain bold-sounding text) summarizing the property.
- Follow with 2-4 short paragraphs covering: the property itself (config, area, condition), the location (city/sector, plus the nearby facilities ONLY if given above, using their exact real distances), and a closing call-to-action line.
- Do NOT mention specific metro stations, distances to landmarks, or nearby facilities unless explicitly provided in the data above. Only describe what is factually given — never invent a distance or a name.
- Total length: 120-180 words.
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

    let nearby = [];
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (mapsApiKey) {
      try {
        const origin = await geocodeAddress(buildAddressString(property), mapsApiKey);
        if (origin) {
          nearby = await getNearbyFacts(origin, mapsApiKey);
        }
      } catch (err) {
        logger.error('Nearby-facts lookup failed, generating description without it', { message: err.message });
      }
    }

    const prompt = buildPrompt(property, nearby);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error('Anthropic API error', { status: response.status, body: errText });
      return res.status(502).json({ success: false, message: 'AI generation failed' });
    }

    const data = await response.json();
    const description = data?.content?.[0]?.text?.trim();
    if (!description) {
      return res.status(502).json({ success: false, message: 'AI generation returned no content' });
    }

    return res.status(200).json({ success: true, description });
  } catch (err) {
    logger.error('POST /api/ai/generate-description error', { message: err.message });
    return res.status(500).json({ success: false, message: 'Server error generating description' });
  }
});

export default router;
