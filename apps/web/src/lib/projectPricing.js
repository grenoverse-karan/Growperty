import { formatIndianPrice } from '@/hooks/useProperties.js';

// Types with an area-type breakdown (ProjectListingForm.jsx's
// showAreaTypes: true — Flat/Apartment, Penthouse, Studio, Shop, Office)
// store area nested under areaByType[<area type>] instead of flat
// area/minArea/maxArea fields. Same priority order as that form's own
// calcPricePerSqft, extended with fallbacks since not every listing has
// Super Built-up filled in.
const AREA_TYPE_PRIORITY = ['Super Built-up Area', 'Built-up Area', 'Carpet Area'];

const resolveAreaFields = (p) => {
  for (const atype of AREA_TYPE_PRIORITY) {
    const block = p.areaByType?.[atype];
    if (block && (block.area || (block.minArea && block.maxArea))) return block;
  }
  return p; // types without a breakdown keep their area fields directly on p
};

// Scans the nested per-type/per-BHK pricing blob into flat rows and an
// overall min/max — same shape ProjectListingForm.jsx saves it in.
export const flattenPricing = (propertyTypePricing) => {
  const rows = [];
  let min = null;
  let max = null;
  for (const [type, byBhk] of Object.entries(propertyTypePricing || {})) {
    for (const [bhkKey, p] of Object.entries(byBhk || {})) {
      const isFixed = p.priceMode === 'fixed';
      const priceLabel = isFixed
        ? (p.price ? formatIndianPrice(Number(p.price)) : null)
        : (p.minPrice && p.maxPrice ? `${formatIndianPrice(Number(p.minPrice))} – ${formatIndianPrice(Number(p.maxPrice))}` : null);
      const areaFields = resolveAreaFields(p);
      const areaUnit = p.areaUnit || 'Sq.ft';
      const areaLabel = isFixed
        ? (areaFields.area ? `${areaFields.area} ${areaUnit}` : null)
        : (areaFields.minArea && areaFields.maxArea ? `${areaFields.minArea} – ${areaFields.maxArea} ${areaUnit}` : null);
      for (const n of (isFixed ? [Number(p.price)] : [Number(p.minPrice), Number(p.maxPrice)])) {
        if (!n) continue;
        if (min === null || n < min) min = n;
        if (max === null || n > max) max = n;
      }
      // Skip entries with no price at all — e.g. a leftover 'default' block
      // from before the form was split into per-BHK pricing.
      if (!priceLabel) continue;
      rows.push({ label: bhkKey === 'default' ? type : `${type} · ${bhkKey}`, priceLabel, areaLabel });
    }
  }
  return { rows, range: min && max ? { min, max } : null };
};
