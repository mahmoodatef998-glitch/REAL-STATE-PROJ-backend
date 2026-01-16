const { body, validationResult } = require('express-validator');

// Property creation/update validation rules
exports.validateProperty = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description is too long'),
  
  body('type')
    .notEmpty().withMessage('Property type is required')
    .isIn(['villa', 'apartment', 'commercial', 'office', 'land']).withMessage('Invalid property type'),
  
  body('purpose')
    .notEmpty().withMessage('Purpose is required')
    .isIn(['sale', 'rent']).withMessage('Purpose must be either sale or rent'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 1 }).withMessage('Price must be a positive number'),
  
  body('area_sqft')
    .notEmpty().withMessage('Area is required')
    .isInt({ min: 1 }).withMessage('Area must be a positive integer'),
  
  body('bedrooms')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('Bedrooms must be between 0 and 50'),
  
  body('bathrooms')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('Bathrooms must be between 0 and 50'),
  
  body('emirate')
    .trim()
    .notEmpty().withMessage('Emirate is required')
    .isLength({ min: 2, max: 50 }).withMessage('Emirate name is invalid'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location is too long'),
  
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array')
    .custom((images) => {
      if (images.length > 20) {
        throw new Error('Maximum 20 images allowed');
      }
      return true;
    }),
  
  body('features')
    .optional()
    .isArray().withMessage('Features must be an array'),
  
  body('status')
    .optional()
    .isIn(['available', 'sold', 'rented']).withMessage('Invalid status'),
];

// Validation result handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

