import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// In-memory storage (temporary)
let properties = [];
let propertyIdCounter = 1;

// Create property (Seller only)
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can list properties'
      });
    }

    const {
      title,
      description,
      price,
      location,
      city,
      propertyType,
      bhk,
      area,
      amenities,
      images
    } = req.body;

    // Validation
    if (!title || !price || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, price, and location are required'
      });
    }

    const newProperty = {
      id: propertyIdCounter++,
      sellerId: userId,
      title,
      description,
      price: parseFloat(price),
      location,
      city,
      propertyType,
      bhk,
      area,
      amenities: amenities || [],
      images: images || [],
      status: 'active',
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    properties.push(newProperty);

    res.status(201).json({
      success: true,
      message: 'Property listed successfully',
      data: newProperty
    });

  } catch (error) {
    console.error('Property creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property'
    });
  }
});

// Get all properties
router.get('/', async (req, res) => {
  try {
    const { city, propertyType, minPrice, maxPrice, bhk } = req.query;

    let filtered = [...properties];

    // Filters
    if (city) {
      filtered = filtered.filter(p => p.city?.toLowerCase() === city.toLowerCase());
    }
    if (propertyType) {
      filtered = filtered.filter(p => p.propertyType === propertyType);
    }
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    }
    if (bhk) {
      filtered = filtered.filter(p => p.bhk === parseInt(bhk));
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });

  } catch (error) {
    console.error('Fetch properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties'
    });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = properties.find(p => p.id === parseInt(req.params.id));

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Increment views
    property.views++;

    res.json({
      success: true,
      data: property
    });

  } catch (error) {
    console.error('Fetch property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property'
    });
  }
});

// Get my listings (Seller only)
router.get('/my/listings', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;

    const myProperties = properties.filter(p => p.sellerId === userId);

    res.json({
      success: true,
      count: myProperties.length,
      data: myProperties
    });

  } catch (error) {
    console.error('Fetch my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings'
    });
  }
});

// Update property
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const propertyId = parseInt(req.params.id);

    const property = properties.find(p => p.id === propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        property[key] = req.body[key];
      }
    });

    property.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property'
    });
  }
});

// Delete property
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.user;
    const propertyId = parseInt(req.params.id);

    const index = properties.findIndex(p => p.id === propertyId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (properties[index].sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    properties.splice(index, 1);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property'
    });
  }
});

export default router;