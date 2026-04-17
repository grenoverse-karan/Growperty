
/**
 * Property Form Data Mapper & Sanitizer
 * Maps form data to PocketBase schema with validation and type conversion
 */

// Schema-based field mappings and validations
const PROPERTY_TYPES = ['Flat/Apartment', 'Independent House', 'Villa', 'Penthouse', 'Plot/Land', 'Commercial'];
const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
const AREA_UNITS = ['Sq.ft', 'Sq.yd', 'Sq.m'];
const AREA_TYPES = ['Carpet Area', 'Built-up Area', 'Super Built-up Area'];
const FURNISHING_TYPES = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];
const POSSESSION_STATUS = ['Ready to Move', 'Under Construction', 'Possession Soon'];
const OWNERSHIP_TYPES = ['Individual', 'Company', 'Joint'];
const PLOT_TYPES = ['Lease Hold', 'Free Hold', 'Kisan Kota'];
const PROPERTY_AGE = ['0-1 Year', '1-5 Years', '5-10 Years', '10+ Years'];

// Property types that require BHK
const BHK_REQUIRED_TYPES = ['Flat/Apartment', 'Independent House', 'Villa', 'Penthouse'];

// Property types that have floors
const FLOOR_APPLICABLE_TYPES = ['Flat/Apartment', 'Independent House', 'Villa', 'Penthouse', 'Commercial'];

/**
 * Validates email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizes and validates a single field value
 */
const sanitizeField = (fieldName, value, fieldType, constraints = {}) => {
  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    return { valid: true, value: undefined };
  }

  // Trim strings
  if (typeof value === 'string') {
    value = value.trim();
    if (value === '') {
      return { valid: true, value: undefined };
    }
  }

  // Type conversions and validations
  switch (fieldType) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) {
        return { valid: false, error: `${fieldName} must be a valid number` };
      }
      if (constraints.min !== undefined && num < constraints.min) {
        return { valid: false, error: `${fieldName} must be at least ${constraints.min}` };
      }
      if (constraints.max !== undefined && num > constraints.max) {
        return { valid: false, error: `${fieldName} must be at most ${constraints.max}` };
      }
      return { valid: true, value: num };

    case 'email':
      if (!isValidEmail(value)) {
        return { valid: false, error: `${fieldName} must be a valid email address` };
      }
      return { valid: true, value };

    case 'select':
      if (constraints.values && !constraints.values.includes(value)) {
        return { valid: false, error: `${fieldName} must be one of: ${constraints.values.join(', ')}` };
      }
      return { valid: true, value };

    case 'text':
      if (constraints.maxLength && value.length > constraints.maxLength) {
        return { valid: false, error: `${fieldName} must be at most ${constraints.maxLength} characters` };
      }
      return { valid: true, value };

    case 'json':
      // Ensure JSON fields are valid objects/arrays
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          return { valid: false, error: `${fieldName} must be valid JSON` };
        }
      }
      // Empty arrays/objects should be omitted
      if (Array.isArray(value) && value.length === 0) {
        return { valid: true, value: undefined };
      }
      if (typeof value === 'object' && Object.keys(value).length === 0) {
        return { valid: true, value: undefined };
      }
      return { valid: true, value };

    case 'bool':
      return { valid: true, value: Boolean(value) };

    default:
      return { valid: true, value };
  }
};

/**
 * Main sanitization function
 * @param {Object} formData - Raw form data
 * @param {string} propertyType - Property type to determine conditional fields
 * @returns {Object} { success: boolean, data?: Object, error?: string }
 */
export const sanitizePropertyFormData = (formData, propertyType) => {
  const errors = [];
  const sanitized = {};

  // Required fields validation
  const requiredFields = [
    { name: 'owner_id', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'propertyType', type: 'select', values: PROPERTY_TYPES },
    { name: 'sector', type: 'text' },
    { name: 'houseNo', type: 'text' },
    { name: 'totalPrice', type: 'number', min: 1 },
    { name: 'totalArea', type: 'number', min: 1 },
    { name: 'areaUnit', type: 'select', values: AREA_UNITS },
    { name: 'areaType', type: 'select', values: AREA_TYPES },
    { name: 'email', type: 'email' },
    { name: 'mobileNumber', type: 'text', maxLength: 20 },
    { name: 'ownerType', type: 'text' },
    { name: 'name', type: 'text' }
  ];

  // BHK is required for certain property types
  if (BHK_REQUIRED_TYPES.includes(propertyType)) {
    requiredFields.push({ name: 'bhk', type: 'select', values: BHK_OPTIONS });
  }

  // Validate required fields
  for (const field of requiredFields) {
    const value = formData[field.name];
    if (!value && value !== 0) {
      errors.push(`${field.name} is required`);
      continue;
    }

    const result = sanitizeField(field.name, value, field.type, {
      min: field.min,
      max: field.max,
      maxLength: field.maxLength,
      values: field.values
    });

    if (!result.valid) {
      errors.push(result.error);
    } else if (result.value !== undefined) {
      sanitized[field.name] = result.value;
    }
  }

  // Optional fields with conditional logic
  const optionalFields = [
    { name: 'propertySubType', type: 'text', condition: () => ['Commercial', 'Plot/Land'].includes(propertyType) },
    { name: 'landmark', type: 'text' },
    { name: 'description', type: 'text', maxLength: 5000 },
    { name: 'currentAddress', type: 'text', maxLength: 500 },
    { name: 'furnishingItems', type: 'json', condition: () => formData.furnishingType && formData.furnishingType !== 'Unfurnished' },
    { name: 'specialFeatures', type: 'json' },
    { name: 'ageOfProperty', type: 'select', values: PROPERTY_AGE },
    { name: 'possessionStatus', type: 'select', values: POSSESSION_STATUS },
    { name: 'ownershipType', type: 'select', values: OWNERSHIP_TYPES },
    { name: 'saleType', type: 'select', values: ['New', 'Resale'] },
    { name: 'carParking', type: 'number', min: 0 },
    { name: 'bikeParking', type: 'number', min: 0 },
    { name: 'visitTime', type: 'select', values: ['Working Time (9:00 AM - 7:00 PM)', 'Evening (5:00 PM - 9:00 PM)', 'Weekend', 'Anytime'] },
    { name: 'isResale', type: 'bool' },
    { name: 'furnishingType', type: 'select', values: FURNISHING_TYPES },
    { name: 'amenities', type: 'json' },
    { name: 'floorNo', type: 'text', maxLength: 50, condition: () => FLOOR_APPLICABLE_TYPES.includes(propertyType) },
    { name: 'totalFloors', type: 'number', condition: () => FLOOR_APPLICABLE_TYPES.includes(propertyType) },
    { name: 'plotType', type: 'select', values: PLOT_TYPES, condition: () => propertyType === 'Plot/Land' },
    { name: 'status', type: 'select', values: ['pending', 'approved', 'rejected', 'suspended'] },
    { name: 'bathrooms', type: 'number' },
    { name: 'balconies', type: 'number' },
    { name: 'floorNumber', type: 'number' },
    { name: 'pricePerUnit', type: 'number' },
    { name: 'propertyAge', type: 'text', maxLength: 100 },
    { name: 'bankLoanAvailable', type: 'text' },
    { name: 'nearbyAmenities', type: 'json' }
  ];

  // Process optional fields
  for (const field of optionalFields) {
    // Check condition if exists
    if (field.condition && !field.condition()) {
      continue;
    }

    const value = formData[field.name];
    if (value === null || value === undefined || value === '') {
      continue;
    }

    const result = sanitizeField(field.name, value, field.type, {
      min: field.min,
      max: field.max,
      maxLength: field.maxLength,
      values: field.values
    });

    if (!result.valid) {
      errors.push(result.error);
    } else if (result.value !== undefined) {
      sanitized[field.name] = result.value;
    }
  }

  // Return errors if any
  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join('; ')
    };
  }

  return {
    success: true,
    data: sanitized
  };
};

/**
 * Logs the property payload to console with formatting
 * @param {Object} payload - The sanitized payload
 * @param {string} label - Optional label for the log
 */
export const logPropertyPayload = (payload, label = 'PROPERTY_FORM_PAYLOAD') => {
  const timestamp = new Date().toISOString();
  const fieldCount = Object.keys(payload).length;
  
  console.group(`🔍 ${label}`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log(`📊 Field Count: ${fieldCount}`);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));
  console.groupEnd();
};

/**
 * Logs PocketBase errors with formatting
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 */
export const logPocketBaseError = (error, context = 'POCKETBASE_ERROR') => {
  const timestamp = new Date().toISOString();
  
  console.group(`❌ ${context}`);
  console.log(`⏰ Timestamp: ${timestamp}`);
  console.log('Error Message:', error.message);
  
  if (error.response?.data) {
    console.log('Server Response:', error.response.data);
    
    // Extract field-level errors
    const fieldErrors = error.response.data.data || error.response.data;
    if (fieldErrors && typeof fieldErrors === 'object') {
      console.log('Field Errors:');
      Object.entries(fieldErrors).forEach(([field, err]) => {
        console.log(`  - ${field}: ${err.message || err}`);
      });
    }
  }
  
  console.groupEnd();
};

/**
 * Extracts user-friendly error message from PocketBase error
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const extractPocketBaseErrorMessage = (error) => {
  if (!error.response?.data) {
    return error.message || 'Failed to submit property';
  }

  const serverErrors = error.response.data.data || error.response.data;
  
  if (serverErrors && typeof serverErrors === 'object') {
    const fieldErrors = Object.entries(serverErrors)
      .map(([field, err]) => `${field}: ${err.message || err}`)
      .join('; ');
    
    if (fieldErrors) {
      return `Validation Error: ${fieldErrors}`;
    }
  }

  return error.response.data.message || error.message || 'Failed to submit property';
};
