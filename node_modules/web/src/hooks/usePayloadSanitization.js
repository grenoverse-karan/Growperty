import { useCallback } from 'react';

export const usePayloadSanitization = () => {
  const sanitizePayload = useCallback((rawFormData) => {
    const payload = { ...rawFormData };

    // 1. Type Conversion
    const numericFields = ['totalArea', 'expectedPrice', 'floorNumber', 'totalFloors'];
    numericFields.forEach(field => {
      if (payload[field] !== undefined && payload[field] !== '') {
        payload[field] = Number(payload[field]);
      }
    });

    // 2. Clean Objects
    if (payload.furnishingItems) {
      const cleanFurnishing = Object.fromEntries(
        Object.entries(payload.furnishingItems).filter(([_, val]) => val > 0)
      );
      if (Object.keys(cleanFurnishing).length === 0) delete payload.furnishingItems;
      else payload.furnishingItems = cleanFurnishing;
    }

    ['carParking', 'bikeParking'].forEach(parkingType => {
      if (payload[parkingType]) {
        if (payload[parkingType].total === 0) {
          delete payload[parkingType];
        } else {
          payload[parkingType].total = Number(payload[parkingType].total);
          payload[parkingType].covered = Number(payload[parkingType].covered);
          payload[parkingType].open = Number(payload[parkingType].open);
        }
      }
    });

    // 3. Exclude Server Fields
    const excludeFields = ['status', 'owner_id', 'id', 'created', 'updated', 'termsAccepted'];
    excludeFields.forEach(field => delete payload[field]);

    // 4. Description Sanitization
    if (payload.description) {
      payload.description = payload.description
        .replace(/\b[6-9]\d{9}\b/g, '[HIDDEN]')
        .trim();
    }

    // Map expectedPrice to totalPrice for backend compatibility if needed
    if (payload.expectedPrice) {
      payload.totalPrice = payload.expectedPrice;
      payload.price = payload.expectedPrice;
    }

    return payload;
  }, []);

  return { sanitizePayload };
};