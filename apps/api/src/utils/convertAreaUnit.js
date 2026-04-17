/**
 * Convert area from one unit to another
 * Supported units: sqft, sqm, sqyd, acre
 * @param {number} value - The area value to convert
 * @param {string} fromUnit - Source unit (sqft, sqm, sqyd, acre)
 * @param {string} toUnit - Target unit (sqft, sqm, sqyd, acre)
 * @returns {number} Converted area value
 */
export function convertAreaUnit(value, fromUnit, toUnit) {
  if (!value || value <= 0) {
    return value;
  }

  if (fromUnit === toUnit) {
    return value;
  }

  // Conversion factors to sqft (base unit)
  const toSqft = {
    sqft: 1,
    sqm: 10.764, // 1 sqm = 10.764 sqft
    sqyd: 9, // 1 sqyd = 9 sqft
    acre: 43560, // 1 acre = 43560 sqft
  };

  // Convert from source unit to sqft
  const valueInSqft = value * toSqft[fromUnit];

  // Convert from sqft to target unit
  const convertedValue = valueInSqft / toSqft[toUnit];

  return Math.round(convertedValue * 100) / 100; // Round to 2 decimal places
}