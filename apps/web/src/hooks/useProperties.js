import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

/**
 * Formats a price number using Indian numbering system
 * Examples: 500000 → '₹ 5,00,000', 5000000 → '₹ 50,00,000', 10000000 → '₹ 1,00,00,000'
 */
export const formatIndianPrice = (price) => {
  if (!price || isNaN(price)) return '₹ 0';

  const num = Math.floor(Number(price));
  const str = num.toString();

  let result = '';
  let count = 0;

  for (let i = str.length - 1; i >= 0; i--) {
    if (count === 3 || (count > 3 && (count - 3) % 2 === 0)) {
      result = ',' + result;
    }
    result = str[i] + result;
    count++;
  }

  return `₹ ${result}`;
};

export const useProperties = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async (status = 'approved') => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (status && status !== 'all') params.set('status', status);

      console.log(`[useProperties] Fetching properties with status: ${status}`);

      const response = await apiServerClient.fetch(`/properties?${params.toString()}`);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const records = data.items || [];

      console.log(`[useProperties] Fetched ${records.length} properties successfully.`);
      setProperties(records);
      return records;
    } catch (err) {
      console.error('[useProperties] Error fetching properties:', err);
      setError(err.message || 'Failed to fetch properties');
      toast.error('Failed to load properties. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterProperties = useCallback((filters) => {
    return properties.filter(property => {
      if (filters.location && filters.location !== 'all') {
        if (property.city !== filters.location && property.sector !== filters.location) {
          return false;
        }
      }

      if (filters.type && filters.type !== 'all') {
        if (property.propertyType !== filters.type) return false;
      }

      if (filters.bhk && filters.bhk !== 'all') {
        const normalizedFilterBhk = filters.bhk.replace(' ', '').toLowerCase();
        const normalizedPropBhk = (property.bhk || '').replace(' ', '').toLowerCase();
        if (normalizedFilterBhk !== normalizedPropBhk && !normalizedPropBhk.includes(normalizedFilterBhk)) {
          return false;
        }
      }

      if (filters.maxPrice && property.totalPrice > filters.maxPrice) return false;

      return true;
    });
  }, [properties]);

  return { properties, isLoading, error, fetchProperties, filterProperties };
};
