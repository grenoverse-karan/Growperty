import BuyerRequirement from '../models/BuyerRequirement.js';
import { sendTemplateAsync } from './whatsappTemplates.js';
import logger from './logger.js';
import { formatShortPrice } from './shortPrice.js';

function formatPrice(n) {
  if (!n || isNaN(n)) return '-';
  return formatShortPrice(n);
}

/**
 * Find active buyers whose requirements match the property and send them
 * the matching_property_alert WhatsApp template.
 * Called fire-and-forget — never throws.
 */
export async function notifyMatchingBuyers(property) {
  try {
    const filter = {
      status: 'active',
      whatsappAlerts: true,
    };

    // Must match city (case-insensitive)
    if (property.city) {
      filter.city = { $regex: new RegExp(`^${property.city.trim()}$`, 'i') };
    }

    // Match propertyType if buyer has specified one
    if (property.propertyType) {
      filter.$or = [
        { propertyType: { $exists: false } },
        { propertyType: '' },
        { propertyType: { $regex: new RegExp(property.propertyType, 'i') } },
      ];
    }

    const buyers = await BuyerRequirement.find(filter, {
      buyerName: 1, buyerPhone: 1, preferredBhk: 1,
      propertyType: 1, areas: 1, city: 1,
      minBudget: 1, maxBudget: 1,
    }).lean();

    const propertyPrice = Number(property.totalPrice || property.price || 0);
    const listingUrl = `https://www.growperty.com/property/${property._id}`;
    const propertyArea = property.sector || property.landmark || '-';
    const propertySize = property.bhk ? `${property.bhk} BHK` : (property.totalArea ? `${property.totalArea} ${property.areaUnit || ''}`.trim() : '-');

    let sent = 0;
    for (const buyer of buyers) {
      // Budget check — skip if property is over buyer's max budget
      if (buyer.maxBudget && propertyPrice && propertyPrice > buyer.maxBudget) continue;

      // BHK check — skip if buyer wants specific BHK and it doesn't match
      if (buyer.preferredBhk && property.bhk && buyer.preferredBhk !== property.bhk) continue;

      // Area check — skip if buyer listed areas and none overlap with property sector
      if (buyer.areas?.length && property.sector) {
        const sectorLower = property.sector.toLowerCase();
        const areaMatch = buyer.areas.some(a => sectorLower.includes(a.toLowerCase()) || a.toLowerCase().includes(sectorLower));
        if (!areaMatch) continue;
      }

      sendTemplateAsync(buyer.buyerPhone, 'matching_property_alert', {
        userName:     buyer.buyerName || 'there',
        size:         propertySize,
        propertyType: property.propertyType || '-',
        area:         propertyArea,
        city:         property.city || '-',
        price:        formatPrice(propertyPrice),
        listingUrl,
      });
      sent++;
    }

    logger.info('[MatchBuyers] Alerts sent', { propertyId: property._id, matched: buyers.length, sent });
  } catch (err) {
    logger.error('[MatchBuyers] Error', { error: err.message, propertyId: property._id });
  }
}
