/**
 * Centralized Error Handler Middleware
 * Provides consistent error response format across all routes
 */

const logger = require('../utils/logger');
const { APIError } = require('../utils/errorCodes');

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error Handler Caught', {
    name: err.name,
    message: err.message,
    code: err.code,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous'
  });

  // Handle APIError (our custom errors)
  if (err instanceof APIError) {
    return res.status(err.status).json({
      success: false,
      error: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack
      })
    });
  }

  // Default error status and message
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'SERVER_ERROR';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
    code = 'VALIDATION_FAILED';
    details = err.errors || err.details;
  }

  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Authentication failed';
    code = 'AUTH_TOKEN_INVALID';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Authentication token has expired';
    code = 'AUTH_TOKEN_EXPIRED';
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
    code = 'VALIDATION_INVALID_FORMAT';
  }

  // Prisma/Database errors
  if (err.code?.startsWith('P')) {
    status = 500;
    message = 'Database operation failed';
    code = 'DATABASE_ERROR';
    
    // Hide sensitive database errors in production
    if (process.env.NODE_ENV === 'production') {
      message = 'An error occurred while processing your request';
    }
  }

  // Format error response
  const errorResponse = {
    success: false,
    error: message,
    code,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    })
  };

  res.status(status).json(errorResponse);
};

/**
 * Async error wrapper - catches errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'RESOURCE_NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler
};

