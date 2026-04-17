import 'dotenv/config';
import express from 'express';
import logger from '../utils/logger.js';
import pbClient from '../utils/pb.js';

const router = express.Router();

/**
 * Map frontend field names to PocketBase database field names
 */
const fieldMapping = {
  expectedPrice: 'totalPrice',
  houseNumber: 'houseNo',
  location: 'sector',
};

/**
 * Required fields for property creation
 * These fields MUST be present and non-empty
 */
const requiredFields = [
  'propertyType',
  'bhk',
  'sector',
  'houseNo',
  'totalArea',
  'areaUnit',
  'areaType',
  'totalPrice',
  'email',
  'mobileNumber',
  'ownerType',
  'name',
  'city',
];

/**
 * Validate required fields
 * @param {object} data - Form data
 * @throws {Error} If required field is missing or empty
 */
function validateRequiredFields(data) {
  for (const field of requiredFields) {
    const value = data[field];

    // Check if field exists and is not empty
    if (value === null || value === undefined || value === '') {
      throw new Error(`Missing required field: ${field}`);
    }

    // For string fields, check if it's just whitespace
    if (typeof value === 'string' && value.trim() === '') {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

/**
 * Map frontend field names to database schema
 * @param {object} data - Form data with frontend field names
 * @returns {object} Data with mapped field names
 */
function mapFieldNames(data) {
  const mapped = { ...data };

  for (const [frontendName, dbName] of Object.entries(fieldMapping)) {
    if (frontendName in mapped && frontendName !== dbName) {
      mapped[dbName] = mapped[frontendName];
      delete mapped[frontendName];
    }
  }

  return mapped;
}

/**
 * Sanitize property data
 * Remove fields that should not be set by client
 * @param {object} data - Form data
 * @returns {object} Sanitized data
 */
function sanitizeData(data) {
  const sanitized = { ...data };

  // Remove fields that should not be set by client
  delete sanitized.id;
  delete sanitized.created;
  delete sanitized.updated;
  delete sanitized.owner_id; // Will be set from auth
  delete sanitized.status; // Will be set to 'pending'

  return sanitized;
}

// =====================
// POST / - Create property with FormData (multipart/form-data)
// =====================
router.post('/', async (req, res) => {
  logger.info('POST /properties request received');

  // Get form data from request
  const formData = req.body;

  if (!formData || typeof formData !== 'object') {
    logger.warn('Invalid request body - not an object');
    throw new Error('Request body must be FormData');
  }

  logger.info('Form data received', {
    fields: Object.keys(formData).filter(k => !k.startsWith('file_')),
    fileCount: Object.keys(formData).filter(k => k.startsWith('file_')).length,
  });

  // Validate required fields
  validateRequiredFields(formData);
  logger.info('Required fields validated');

  // Map frontend field names to database schema
  const mappedData = mapFieldNames(formData);
  logger.info('Field names mapped to database schema');

  // Sanitize data (remove client-set fields)
  const sanitizedData = sanitizeData(mappedData);
  logger.info('Data sanitized');

  // Prepare data for PocketBase
  const propertyData = new FormData();

  // Add all text fields
  for (const [key, value] of Object.entries(sanitizedData)) {
    if (!key.startsWith('file_') && value !== null && value !== undefined) {
      // Handle arrays (amenities, furnishingItems, nearbyAmenities)
      if (Array.isArray(value)) {
        propertyData.append(key, JSON.stringify(value));
      } else {
        propertyData.append(key, String(value));
      }
    }
  }

  // Add file fields (images and videos)
  for (const [key, value] of Object.entries(formData)) {
    if (key.startsWith('file_') && value) {
      const fieldName = key.replace('file_', '');

      // Handle multiple files for the same field
      if (Array.isArray(value)) {
        // Validate file count
        if (fieldName === 'images' && value.length > 20) {
          throw new Error('Maximum 20 images allowed');
        }
        if (fieldName === 'videos' && value.length > 1) {
          throw new Error('Maximum 1 video allowed');
        }

        for (const file of value) {
          propertyData.append(fieldName, file);
        }
      } else {
        // Single file
        if (fieldName === 'videos') {
          propertyData.append(fieldName, value);
        } else if (fieldName === 'images') {
          propertyData.append(fieldName, value);
        }
      }
    }
  }

  // Set default status
  propertyData.append('status', 'pending');

  // Set owner_id from authenticated user if available
  if (req.user && req.user.id) {
    propertyData.append('owner_id', req.user.id);
    logger.info('Owner ID set from authenticated user', { userId: req.user.id });
  } else {
    logger.info('No authenticated user - owner_id left empty');
  }

  logger.info('Property data prepared for PocketBase');

  // Create property in PocketBase
  const createdProperty = await pbClient.post('/collections/properties/records', propertyData);

  logger.info('Property created successfully', { propertyId: createdProperty.id });

  return res.status(201).json({
    success: true,
    propertyId: createdProperty.id,
    message: 'Property listed successfully',
  });
});

// =====================
// GET / - List properties
// =====================
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));

  logger.info('GET /properties request received', { page, limit });

  const result = await pbClient.get('/collections/properties/records', {
    page,
    perPage: limit,
  });

  logger.info('Properties fetched successfully', {
    count: result.items?.length || 0,
    total: result.totalItems,
  });

  return res.status(200).json({
    items: result.items || [],
    page: result.page || 1,
    perPage: result.perPage || limit,
    totalItems: result.totalItems || 0,
    totalPages: result.totalPages || 0,
  });
});

// =====================
// GET /:id - Get single property
// =====================
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.warn('Property ID missing');
    throw new Error('Property ID is required');
  }

  logger.info('GET /properties/:id request received', { propertyId: id });

  const property = await pbClient.get(`/collections/properties/records/${id}`);

  logger.info('Property fetched successfully', { propertyId: id });

  return res.status(200).json(property);
});

// =====================
// PUT /:id - Update property
// =====================
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.warn('Property ID missing');
    throw new Error('Property ID is required');
  }

  const formData = req.body;

  if (!formData || typeof formData !== 'object') {
    logger.warn('Invalid request body');
    throw new Error('Request body must be FormData');
  }

  logger.info('PUT /properties/:id request received', { propertyId: id });

  // Map frontend field names to database schema
  const mappedData = mapFieldNames(formData);

  // Sanitize data
  const sanitizedData = sanitizeData(mappedData);

  // Prepare data for PocketBase
  const propertyData = new FormData();

  // Add all text fields
  for (const [key, value] of Object.entries(sanitizedData)) {
    if (!key.startsWith('file_') && value !== null && value !== undefined) {
      // Handle arrays
      if (Array.isArray(value)) {
        propertyData.append(key, JSON.stringify(value));
      } else {
        propertyData.append(key, String(value));
      }
    }
  }

  // Add file fields
  for (const [key, value] of Object.entries(formData)) {
    if (key.startsWith('file_') && value) {
      const fieldName = key.replace('file_', '');

      if (Array.isArray(value)) {
        // Validate file count
        if (fieldName === 'images' && value.length > 20) {
          throw new Error('Maximum 20 images allowed');
        }
        if (fieldName === 'videos' && value.length > 1) {
          throw new Error('Maximum 1 video allowed');
        }

        for (const file of value) {
          propertyData.append(fieldName, file);
        }
      } else {
        propertyData.append(fieldName, value);
      }
    }
  }

  logger.info('Property data prepared for update');

  // Update property in PocketBase
  const updatedProperty = await pbClient.patch(`/collections/properties/records/${id}`, propertyData);

  logger.info('Property updated successfully', { propertyId: id });

  return res.status(200).json({
    success: true,
    propertyId: updatedProperty.id,
    message: 'Property updated successfully',
  });
});

// =====================
// DELETE /:id - Delete property
// =====================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    logger.warn('Property ID missing');
    throw new Error('Property ID is required');
  }

  logger.info('DELETE /properties/:id request received', { propertyId: id });

  await pbClient.delete(`/collections/properties/records/${id}`);

  logger.info('Property deleted successfully', { propertyId: id });

  return res.status(200).json({
    success: true,
    propertyId: id,
    message: 'Property deleted successfully',
  });
});

export default router;