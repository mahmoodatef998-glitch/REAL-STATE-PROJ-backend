const express = require('express');
const Property = require('../models/Property');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  validateProperty, 
  handleValidationErrors 
} = require('../validators/propertyValidator');
const { tenantIsolation, checkTenantAccess, buildTenantWhere } = require('../middleware/tenantIsolation');
const UsageService = require('../services/usageService');
const Subscription = require('../models/Subscription');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
// File upload middleware: add size limits and file type filtering
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 20 }, // 5MB per file, up to 20 files
  fileFilter: function (req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Wrapper to run multer and handle errors + cleanup of partially uploaded files
const runUpload = (fieldName, maxCount) => (req, res, next) => {
  const handler = upload.array(fieldName, maxCount);
  handler(req, res, (err) => {
    if (err) {
      // Cleanup any uploaded files if an error occurred
      try {
        if (req.files && req.files.length) {
          req.files.forEach(f => {
            const filePath = path.join(__dirname, '../uploads', f.filename);
            try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
          });
        }
      } catch (cleanupErr) {
        console.error('Upload cleanup error:', cleanupErr);
      }
      return next(err);
    }
    next();
  });
};

const router = express.Router();

// Get new arrivals (latest properties) - must be before /:id route
router.get('/new-arrivals/:limit?', async (req, res) => {
  try {
    const limit = req.params.limit ? parseInt(req.params.limit) : 6;
    // Only show active properties in new arrivals
    const properties = await Property.getAll({ 
      limit, 
      sort: 'newest',
      status: 'active'
    });
    // Ensure owner info is included in response
    const propertiesData = properties.map(p => p.toJSON ? p.toJSON() : p);
    res.json({ properties: propertiesData });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all properties with filters (with tenant isolation)
router.get('/', tenantIsolation, async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      purpose: req.query.purpose,
      emirate: req.query.emirate,
      price_min: req.query.price_min ? parseInt(req.query.price_min) : undefined,
      price_max: req.query.price_max ? parseInt(req.query.price_max) : undefined,
      status: req.query.status,
      search: req.query.search,
      sort: req.query.sort,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      // Add tenant isolation
      companyId: req.tenantId
    };

    const properties = await Property.getAll(filters);
    const propertiesData = properties.map(p => p.toJSON ? p.toJSON() : p);
    res.json({ properties: propertiesData });
  } catch (error) {
    console.error('Get properties error:', error);
    next(error);
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Ensure owner info is included in response
    const propertyData = property.toJSON ? property.toJSON() : property;
    
    res.json({ property: propertyData });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new property (with image upload, usage limit check)
router.post('/', authenticateToken, requireRole(['admin', 'broker']), tenantIsolation, runUpload('images', 20), async (req, res, next) => {
  try {
    // Check usage limit if user has a company
    if (req.user.companyId) {
      const subscription = await Subscription.findByCompanyId(req.user.companyId);
      if (subscription) {
        const plan = await subscription.getPlan();
        const limitCheck = await UsageService.checkLimit(req.user.companyId, 'property', plan);
        
        if (!limitCheck.allowed) {
          return res.status(403).json({
            success: false,
            error: 'Properties limit reached',
            code: 'USAGE_LIMIT_REACHED',
            limit: limitCheck.limit,
            current: limitCheck.current
          });
        }
      }
    }

    const files = req.files || [];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const images = files.map(file => `${baseUrl}/uploads/${file.filename}`);
    const {
      title, description, type, purpose, price, area_sqft,
      bedrooms, bathrooms, emirate, location, features
    } = req.body;

    // If JSON string, parse features
    let parsedFeatures = features;
    if (typeof features === 'string') {
      try { parsedFeatures = JSON.parse(features); } catch { parsedFeatures = features.split(',').map(f => f.trim()).filter(Boolean); }
    }
    const propertyData = {
      title: title,
      description: description,
      type: type,
      purpose: purpose,
      price: parseInt(price),
      area_sqft: area_sqft ? parseInt(area_sqft) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      emirate: emirate,
      location: location,
      images: images,
      features: parsedFeatures,
      owner_id: req.user.id,
      company_id: req.user.companyId // Add company ID for tenant isolation
    };
    const property = await Property.create(propertyData);
    
    // Increment usage
    if (req.user.companyId) {
      await UsageService.increment(req.user.companyId, 'property');
    }
    
    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Create property error:', error);
    next(error);
  }
});

// Update property (with optional image upload, tenant access check)
router.put('/:id', authenticateToken, requireRole(['admin', 'broker']), tenantIsolation, checkTenantAccess, runUpload('images', 20), async (req, res, next) => {
  try {
    req.resourceType = 'property'; // Set for checkTenantAccess
    
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ 
        success: false,
        error: 'Property not found' 
      });
    }

    // Check if user is owner or admin (additional check)
    if (property.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    const files = req.files || [];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const {
      title, description, type, purpose, price, area_sqft,
      bedrooms, bathrooms, emirate, location, features, status,
      existingImages
    } = req.body;

    // If JSON string, parse features
    let parsedFeatures = features;
    if (typeof features === 'string') {
      try { parsedFeatures = JSON.parse(features); } catch { parsedFeatures = features.split(',').map(f => f.trim()).filter(Boolean); }
    }

    // Handle images: combine existing and new
    let images = property.images || [];
    
    // Parse existingImages if provided (can be string or array)
    let existingImageArray = [];
    if (existingImages) {
      if (typeof existingImages === 'string') {
        try {
          existingImageArray = JSON.parse(existingImages);
        } catch {
          existingImageArray = Array.isArray(existingImages) ? existingImages : [existingImages];
        }
      } else if (Array.isArray(existingImages)) {
        existingImageArray = existingImages;
      }
    }
    
    // If new files uploaded, add them
    if (files.length > 0) {
      const newImageUrls = files.map(file => `${baseUrl}/uploads/${file.filename}`);
      images = [...existingImageArray, ...newImageUrls];
    } else if (existingImageArray.length > 0) {
      // Only update existing images if provided
      images = existingImageArray;
    }
    // Otherwise keep current images

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type) updateData.type = type;
    if (purpose) updateData.purpose = purpose;
    if (price) updateData.price = parseInt(price);
    if (area_sqft) updateData.area_sqft = parseInt(area_sqft);
    if (bedrooms) updateData.bedrooms = parseInt(bedrooms);
    if (bathrooms) updateData.bathrooms = parseInt(bathrooms);
    if (emirate) updateData.emirate = emirate;
    if (location !== undefined) updateData.location = location;
    if (images) updateData.images = images;
    if (parsedFeatures) updateData.features = parsedFeatures;
    // Allow both admin and property owner (broker) to update status
    if (status) {
      // Validate status value
      const validStatuses = ['active', 'closed', 'sold', 'rented'];
      if (validStatuses.includes(status)) {
        updateData.status = status;
      }
    }

    await property.update(updateData);

    const updatedProperty = await Property.findById(req.params.id);

    res.json({
      success: true,
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Update property error:', error);
    next(error);
  }
});

// Delete property (with tenant access check and usage decrement)
router.delete('/:id', authenticateToken, tenantIsolation, async (req, res, next) => {
  try {
    req.resourceType = 'property'; // Set for checkTenantAccess
    
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ 
        success: false,
        error: 'Property not found' 
      });
    }

    // Check tenant access (unless super admin)
    if (!req.isSuperAdmin && property.companyId !== req.user.companyId) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    // Check if user is owner or admin
    if (property.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    await property.delete();

    // Decrement usage
    if (property.companyId) {
      await UsageService.decrement(property.companyId, 'property');
    }

    res.json({ 
      success: true,
      message: 'Property deleted successfully' 
    });
  } catch (error) {
    console.error('Delete property error:', error);
    next(error);
  }
});

// Get properties by owner
router.get('/owner/:ownerId', authenticateToken, async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    // Check if user is viewing their own properties or is admin
    if (ownerId !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const properties = await Property.getByOwner(ownerId);
    res.json({ properties });
  } catch (error) {
    console.error('Get owner properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
