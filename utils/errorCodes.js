/**
 * Centralized Error Codes and Messages
 * Provides consistent error handling across the application
 */

const ERROR_CODES = {
  // Authentication Errors (1000-1999)
  AUTH_TOKEN_MISSING: {
    code: 'AUTH_TOKEN_MISSING',
    status: 401,
    message: 'Access token is required'
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_TOKEN_INVALID',
    status: 401,
    message: 'Invalid authentication token'
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    status: 401,
    message: 'Authentication token has expired'
  },
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_INVALID_CREDENTIALS',
    status: 401,
    message: 'Invalid email or password'
  },
  AUTH_USER_NOT_FOUND: {
    code: 'AUTH_USER_NOT_FOUND',
    status: 404,
    message: 'User account not found'
  },
  AUTH_ACCOUNT_PENDING: {
    code: 'AUTH_ACCOUNT_PENDING',
    status: 403,
    message: 'Account is pending approval'
  },
  AUTH_ACCOUNT_REJECTED: {
    code: 'AUTH_ACCOUNT_REJECTED',
    status: 403,
    message: 'Account has been rejected'
  },

  // Authorization Errors (2000-2999)
  AUTHZ_INSUFFICIENT_PERMISSIONS: {
    code: 'AUTHZ_INSUFFICIENT_PERMISSIONS',
    status: 403,
    message: 'Insufficient permissions for this action'
  },
  AUTHZ_ACCESS_DENIED: {
    code: 'AUTHZ_ACCESS_DENIED',
    status: 403,
    message: 'Access denied'
  },

  // Validation Errors (3000-3999)
  VALIDATION_FAILED: {
    code: 'VALIDATION_FAILED',
    status: 400,
    message: 'Validation failed'
  },
  VALIDATION_MISSING_FIELD: {
    code: 'VALIDATION_MISSING_FIELD',
    status: 400,
    message: 'Required field is missing'
  },
  VALIDATION_INVALID_FORMAT: {
    code: 'VALIDATION_INVALID_FORMAT',
    status: 400,
    message: 'Invalid data format'
  },

  // Resource Errors (4000-4999)
  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    status: 404,
    message: 'Resource not found'
  },
  RESOURCE_ALREADY_EXISTS: {
    code: 'RESOURCE_ALREADY_EXISTS',
    status: 409,
    message: 'Resource already exists'
  },
  RESOURCE_CONFLICT: {
    code: 'RESOURCE_CONFLICT',
    status: 409,
    message: 'Resource conflict'
  },

  // Database Errors (5000-5999)
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    status: 500,
    message: 'Database operation failed'
  },
  DATABASE_CONNECTION_ERROR: {
    code: 'DATABASE_CONNECTION_ERROR',
    status: 503,
    message: 'Database connection failed'
  },

  // File Upload Errors (6000-6999)
  FILE_TOO_LARGE: {
    code: 'FILE_TOO_LARGE',
    status: 413,
    message: 'File size exceeds maximum limit'
  },
  FILE_INVALID_TYPE: {
    code: 'FILE_INVALID_TYPE',
    status: 415,
    message: 'Invalid file type'
  },
  FILE_UPLOAD_FAILED: {
    code: 'FILE_UPLOAD_FAILED',
    status: 500,
    message: 'File upload failed'
  },

  // Server Errors (9000-9999)
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    status: 500,
    message: 'Internal server error'
  },
  SERVER_CONFIG_ERROR: {
    code: 'SERVER_CONFIG_ERROR',
    status: 500,
    message: 'Server configuration error'
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    status: 503,
    message: 'Service temporarily unavailable'
  }
};

/**
 * Create an API Error
 * @param {Object} errorCode - Error code object from ERROR_CODES
 * @param {string} customMessage - Optional custom message
 * @param {Object} details - Optional additional details
 */
class APIError extends Error {
  constructor(errorCode, customMessage = null, details = null) {
    super(customMessage || errorCode.message);
    this.name = 'APIError';
    this.code = errorCode.code;
    this.status = errorCode.status;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  ERROR_CODES,
  APIError
};


