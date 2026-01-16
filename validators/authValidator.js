const { body, validationResult } = require('express-validator');

// Register validation rules
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 100 }).withMessage('Password must be between 6 and 100 characters'),
  
  body('role')
    .optional()
    .isIn(['broker', 'client', 'admin']).withMessage('Invalid role'),
  
  body('phone')
    .optional()
    .custom((value, { req }) => {
      // Phone is required for brokers
      if (req.body.role === 'broker' && !value) {
        throw new Error('Phone number is required for brokers');
      }
      return true;
    })
    .isLength({ max: 20 }).withMessage('Phone number is too long'),
  
  body('whatsapp')
    .optional()
    .isLength({ max: 20 }).withMessage('WhatsApp number is too long'),
];

// Login validation rules
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 1 }).withMessage('Password is required'),
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

