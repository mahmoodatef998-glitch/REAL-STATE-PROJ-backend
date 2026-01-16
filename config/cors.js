/**
 * CORS Configuration
 * Centralized Cross-Origin Resource Sharing setup
 */

const logger = require('../utils/logger');

/**
 * Get CORS configuration
 */
function getCorsConfig() {
  const frontendUrl = process.env.FRONTEND_URL ? 
    process.env.FRONTEND_URL.trim().replace(/\/$/, '') : 
    null;

  const devAllowed = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];

  return {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // In production, only allow configured frontend URL
      if (process.env.NODE_ENV === 'production') {
        if (frontendUrl && origin.startsWith(frontendUrl)) {
          logger.info(`CORS allowed (production): ${origin}`);
          return callback(null, true);
        }
        logger.warn(`CORS blocked (production): ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      }

      // In development, allow dev origins or frontendUrl
      if (devAllowed.includes(origin) || (frontendUrl && origin.startsWith(frontendUrl))) {
        logger.debug(`CORS allowed (development): ${origin}`);
        return callback(null, true);
      }
      
      // Relax in development - allow all origins
      logger.debug(`CORS allowed (dev mode - relaxed): ${origin}`);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With', 
      'Accept', 
      'Origin', 
      'Cache-Control'
    ],
    exposedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
    preflightContinue: false
  };
}

/**
 * Additional CORS middleware (fallback)
 */
function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  
  // Set CORS headers for all responses
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    logger.http(`CORS preflight OPTIONS: ${req.path} from: ${origin}`);
    return res.sendStatus(200);
  }
  
  next();
}

/**
 * OPTIONS handler for all routes
 */
function optionsHandler(req, res) {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
}

module.exports = {
  getCorsConfig,
  corsMiddleware,
  optionsHandler
};


