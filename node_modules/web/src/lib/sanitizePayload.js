/**
 * Recursively sanitizes a payload object by removing null, undefined, empty strings,
 * empty objects, and empty arrays. Keeps 0 and false.
 * Specifically removes 'status' and 'owner_id'.
 * Converts specific fields to required formats.
 * 
 * @param {Object} payload - The payload to sanitize
 * @returns {Object} - The sanitized payload
 */
export const sanitizePayload = (payload) => {
  console.log('=== SANITIZE PAYLOAD - BEFORE ===');
  console.log(JSON.stringify(payload, null, 2));
  console.log('=== END BEFORE ===');

  if (payload === null || payload === undefined) return payload;
  if (typeof payload !== 'object') return payload;
  if (payload instanceof File || payload instanceof Blob || payload instanceof Date) return payload;

  if (Array.isArray(payload)) {
    const cleanedArray = payload
      .map(item => sanitizePayload(item))
      .filter(item => {
        if (item === null || item === undefined || item === '') return false;
        if (typeof item === 'object' && !Array.isArray(item) && Object.keys(item).length === 0) return false;
        if (Array.isArray(item) && item.length === 0) return false;
        return true;
      });
    return cleanedArray;
  }

  const cleanedObject = {};
  
  for (const [key, value] of Object.entries(payload)) {
    // Specifically remove status and owner_id - these should be set by backend
    if (key === 'status' || key === 'owner_id') {
      console.log(`[SANITIZE] Removing field: ${key} (backend-managed field)`);
      continue;
    }

    let processedValue = value;

    // Specific field conversions
    if (key === 'carParking' || key === 'bikeParking') {
      processedValue = parseInt(value, 10) || 0;
      console.log(`[SANITIZE] Converting ${key} to integer: ${processedValue}`);
    } else if (key === 'furnishingItems' && typeof value === 'object' && !Array.isArray(value)) {
      // Convert { "AC": 2, "Sofa": 1 } to [{ item: "AC", quantity: 2 }, { item: "Sofa", quantity: 1 }]
      processedValue = Object.entries(value).map(([item, quantity]) => ({
        item,
        quantity: parseInt(quantity, 10) || 1
      }));
      console.log(`[SANITIZE] Converting furnishingItems from object to array:`, processedValue);
    } else if (key === 'specialFeatures' && typeof value === 'object' && !Array.isArray(value)) {
      // Convert object to array of strings
      processedValue = Object.entries(value)
        .filter(([_, v]) => v !== null && v !== undefined && v !== '' && v !== false)
        .map(([k, v]) => {
          if (typeof v === 'object') return `${k}: ${JSON.stringify(v)}`;
          return `${k}: ${v}`;
        });
      console.log(`[SANITIZE] Converting specialFeatures from object to array:`, processedValue);
    } else if (key === 'amenities' && typeof value === 'object' && !Array.isArray(value)) {
      // If it's an object of booleans, convert to array of strings
      processedValue = Object.keys(value).filter(k => value[k]);
      console.log(`[SANITIZE] Converting amenities from object to array:`, processedValue);
    }

    const cleanedValue = sanitizePayload(processedValue);

    // Check for empty values to omit
    if (cleanedValue === null || cleanedValue === undefined || cleanedValue === '') {
      console.log(`[SANITIZE] Omitting empty field: ${key}`);
      continue;
    }
    
    // Check for empty objects/arrays
    if (typeof cleanedValue === 'object' && !(cleanedValue instanceof File) && !(cleanedValue instanceof Blob) && !(cleanedValue instanceof Date)) {
      if (Array.isArray(cleanedValue) && cleanedValue.length === 0) {
        console.log(`[SANITIZE] Omitting empty array: ${key}`);
        continue;
      }
      if (!Array.isArray(cleanedValue) && Object.keys(cleanedValue).length === 0) {
        console.log(`[SANITIZE] Omitting empty object: ${key}`);
        continue;
      }
    }

    cleanedObject[key] = cleanedValue;
  }

  console.log('=== SANITIZE PAYLOAD - AFTER ===');
  console.log(JSON.stringify(cleanedObject, null, 2));
  console.log('=== END AFTER ===');

  return cleanedObject;
};