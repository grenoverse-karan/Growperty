export const convertArea = (value, fromUnit, toUnit) => {
  if (!value || isNaN(value)) return 0;
  const val = parseFloat(value);
  if (fromUnit === toUnit) return val;

  // Convert to Sq.ft first
  let inSqFt = val;
  if (fromUnit === 'Sq.yd') inSqFt = val * 9;
  else if (fromUnit === 'Sq.m') inSqFt = val * 10.764;

  // Convert from Sq.ft to target
  if (toUnit === 'Sq.yd') return inSqFt / 9;
  if (toUnit === 'Sq.m') return inSqFt / 10.764;
  
  return inSqFt;
};

export const formatPriceDisplay = (price) => {
  if (price === null || price === undefined || price === '') return '';
  const num = Number(price);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

export const calculatePricePerUnit = (totalPrice, totalArea, areaUnit, priceUnit) => {
  if (!totalPrice || !totalArea || isNaN(totalPrice) || isNaN(totalArea) || totalArea <= 0) {
    return `₹ 0 per ${priceUnit}`;
  }
  
  const price = parseFloat(totalPrice);
  const area = parseFloat(totalArea);
  
  // Base price per current area unit
  let basePrice = price / area;
  
  // Convert price based on target unit
  if (areaUnit !== priceUnit) {
    if (areaUnit === 'Sq.ft' && priceUnit === 'Sq.yd') basePrice = basePrice * 9;
    else if (areaUnit === 'Sq.ft' && priceUnit === 'Sq.m') basePrice = basePrice * 10.764;
    else if (areaUnit === 'Sq.yd' && priceUnit === 'Sq.ft') basePrice = basePrice / 9;
    else if (areaUnit === 'Sq.yd' && priceUnit === 'Sq.m') basePrice = basePrice * 1.196;
    else if (areaUnit === 'Sq.m' && priceUnit === 'Sq.ft') basePrice = basePrice / 10.764;
    else if (areaUnit === 'Sq.m' && priceUnit === 'Sq.yd') basePrice = basePrice / 1.196;
  }
  
  const roundedPrice = Math.round(basePrice);
  return `₹ ${formatPriceDisplay(roundedPrice)} per ${priceUnit}`;
};