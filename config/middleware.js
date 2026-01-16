/**
 * Middleware Configuration
 * Centralized middleware setup for Express application
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const express = require('express');
const path = require('path');

/**
 * Configure Helmet security headers
 */
function configureHelmet() {
  return helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
  });
}

/**
 * Configure rate limiting
 */
function configureRateLimit() {
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

/**
 * Configure body parsing
 */
function configureBodyParser(app) {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
}

/**
 * Configure static file serving
 */
function configureStaticFiles(app) {
  // Uploads directory with CORS headers
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, filePath) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }));

  // Public directory
  app.use('/public', express.static('public'));

  // Static files with proper headers
  app.use('/static', express.static('static', {
    setHeaders: (res, path) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));
}

/**
 * Configure compression
 */
function configureCompression() {
  return compression();
}

/**
 * Apply all middleware to Express app
 */
function applyMiddleware(app, cors) {
  // Security
  app.use(configureHelmet());
  app.use(configureRateLimit());

  // CORS
  app.options('*', cors.optionsHandler);
  app.use(require('cors')(cors.getCorsConfig()));
  app.use(cors.corsMiddleware);

  // Body parsing
  configureBodyParser(app);

  // Static files
  configureStaticFiles(app);

  // Compression
  app.use(configureCompression());
}

module.exports = {
  applyMiddleware,
  configureHelmet,
  configureRateLimit,
  configureBodyParser,
  configureStaticFiles,
  configureCompression
};


