import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

/**
 * Formats a price number using Indian numbering system
 * Examples: 500000 → '₹ 5,00,000', 5000000 → '₹ 50,00,000', 10000000 → '₹ 1,00,00,000'
 * @param {number} price - The price to format
 * @returns {string} Formatted price with rupee symbol and Indian commas
 */
export const formatIndianPrice = (price) => {
  if (!price || isNaN(price)) return '₹ 0';
  
  const num = Math.floor(Number(price));
  const str = num.toString();
  
  // Apply Indian numbering system: XX,XX,XXX (from right: 3 digits, then pairs of 2)
  let result = '';
  let count = 0;
  
  for (let i = str.length - 1; i >= 0; i--) {
    // Add comma after first 3 digits from right, then every 2 digits
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
      console.log(`[useProperties] Fetching properties with status: ${status}`);
      
      let filterStr = '';
      if (status && status !== 'all') {
        filterStr = `status = "${status}"`;
      }

      const records = await pb.collection('properties').getFullList({
        filter: filterStr,
        sort: '-created',
        $autoCancel: false,
      });

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
      // Location filter
      if (filters.location && filters.location !== 'all') {
        if (property.city !== filters.location && property.sector !== filters.location) {
          return false;
        }
      }

      // Property Type filter
      if (filters.type && filters.type !== 'all') {
        if (property.propertyType !== filters.type) {
          return false;
        }
      }

      // BHK filter
      if (filters.bhk && filters.bhk !== 'all') {
        // Handle mapping between filter values and DB values
        const normalizedFilterBhk = filters.bhk.replace(' ', '').toLowerCase();
        const normalizedPropBhk = (property.bhk || '').replace(' ', '').toLowerCase();
        if (normalizedFilterBhk !== normalizedPropBhk && !normalizedPropBhk.includes(normalizedFilterBhk)) {
          return false;
        }
      }

      // Price filter
      if (filters.maxPrice && property.totalPrice > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }, [properties]);

  return {
    properties,
    isLoading,
    error,
    fetchProperties,
    filterProperties
  };
};