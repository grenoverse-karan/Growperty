import { useState, useCallback } from 'react';

export const usePropertyFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateForm = useCallback((formData) => {
    const newErrors = {};

    // Required fields
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.propertyType) newErrors.propertyType = 'Property Type is required';
    if (!formData.totalArea || Number(formData.totalArea) <= 0) newErrors.totalArea = 'Valid Total Area is required';
    if (!formData.expectedPrice || Number(formData.expectedPrice) <= 0) newErrors.expectedPrice = 'Valid Expected Price is required';
    
    const needsBhk = ['Flat/Apartment', 'Independent House', 'Villa', 'Penthouse'].includes(formData.propertyType);
    if (needsBhk && !formData.bhk) newErrors.bhk = 'BHK is required';

    const needsFloor = ['Flat/Apartment', 'Penthouse', 'Commercial'].includes(formData.propertyType);
    if (needsFloor) {
      if (!formData.floorNumber || Number(formData.floorNumber) < 0) newErrors.floorNumber = 'Valid Floor Number is required';
      if (!formData.totalFloors || Number(formData.totalFloors) <= 0) newErrors.totalFloors = 'Valid Total Floors is required';
    }

    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the Terms & Conditions';

    // Phone number validation
    if (formData.mobileNumber) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.mobileNumber.replace(/\D/g, ''))) {
        newErrors.mobileNumber = 'Valid 10-digit mobile number is required';
      }
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, []);

  const detectPhoneInDescription = useCallback((description) => {
    if (!description) return false;
    const phoneRegex = /\b[6-9]\d{9}\b/g;
    return phoneRegex.test(description);
  }, []);

  return { errors, setErrors, validateForm, detectPhoneInDescription };
};