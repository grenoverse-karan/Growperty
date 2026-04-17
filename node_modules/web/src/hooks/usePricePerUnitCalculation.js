import { useMemo } from 'react';

export const usePricePerUnitCalculation = (totalPrice, totalArea, areaUnit) => {
  return useMemo(() => {
    const price = Number(totalPrice);
    const area = Number(totalArea);

    if (!price || !area || area <= 0) return 0;

    let pricePerSqFt = price / area;

    switch (areaUnit) {
      case 'Sq.yd':
        return Math.round(pricePerSqFt * 9);
      case 'Sq.m':
        return Math.round(pricePerSqFt * 10.764);
      case 'Sq.ft':
      default:
        return Math.round(pricePerSqFt);
    }
  }, [totalPrice, totalArea, areaUnit]);
};