import { formatIndianPrice } from '@/hooks/useProperties.js';

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
      const areaLabel = isFixed
        ? (p.area ? `${p.area} ${p.areaUnit || ''}` : null)
        : (p.minArea && p.maxArea ? `${p.minArea} – ${p.maxArea} ${p.areaUnit || ''}` : null);
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
