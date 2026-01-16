const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Load environment variables

// Try multiple paths for config.env
const configPaths = [
  path.join(__dirname, 'config.env'),
  path.join(__dirname, '.env'),
  './config.env',
  './.env'
];

let envLoaded = false;
let loadedPath = null;

for (const configPath of configPaths) {
  if (fs.existsSync(configPath)) {
    console.log('📂 Loading env from:', configPath);
    const result = require('dotenv').config({ path: configPath });
    if (result.error) {
      console.error('❌ Error loading env file:', result.error);
    } else {
      envLoaded = true;
      loadedPath = configPath;
      console.log('✅ Env file loaded successfully from:', configPath);
      break;
    }
  }
}

if (!envLoaded) {
  console.warn('⚠️  No config.env or .env file found. Creating default config.env...');
}

// Also try loading from process.env (if already set) - but don't override if already loaded
if (!envLoaded) {
  require('dotenv').config();
}

// Check for JWT_SECRET on startup
console.log('\n🔐 Security Configuration Check:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Environment mode
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Environment: ${isProduction ? '🔴 PRODUCTION' : '🟢 DEVELOPMENT'}`);

// JWT_SECRET validation
if (!process.env.JWT_SECRET) {
  if (isProduction) {
    console.error('\n❌ CRITICAL ERROR: JWT_SECRET is required in production!');
    console.error('   Set JWT_SECRET environment variable before deployment.');
    process.exit(1);
  }
  console.warn('⚠️  JWT_SECRET not configured - using development fallback');
  console.warn('   This is NOT SECURE for production!');
  process.env.JWT_SECRET = 'DEV-ONLY-SECRET-CHANGE-IN-PRODUCTION-' + Date.now();
} else {
  const secretLength = process.env.JWT_SECRET.trim().length;
  if (secretLength < 32) {
    console.warn(`⚠️  WARNING: JWT_SECRET is only ${secretLength} chars (recommended: 64+)`);
  } else {
    console.log(`✅ JWT_SECRET configured (${secretLength} characters)`);
  }
  process.env.JWT_SECRET = process.env.JWT_SECRET.trim().replace(/^["']|["']$/g, '');
}

// Make sure JWT_SECRET is globally available
if (process.env.JWT_SECRET) {
  global.JWT_SECRET = process.env.JWT_SECRET;
}

// Database validation
if (!process.env.DATABASE_URL) {
  if (isProduction) {
    console.error('\n❌ CRITICAL ERROR: DATABASE_URL is required!');
    process.exit(1);
  }
  console.warn('⚠️  DATABASE_URL not set');
} else {
  const dbType = process.env.DATABASE_URL.includes('postgresql') ? 'PostgreSQL' : 'Other';
  const hasSsl = process.env.DATABASE_URL.includes('ssl') || process.env.DATABASE_URL.includes('sslmode');
  console.log(`✅ Database: ${dbType}${isProduction && !hasSsl ? ' ⚠️ (SSL recommended)' : ''}`);
}

// CORS configuration
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log(`✅ Frontend URL: ${frontendUrl}`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Database is handled by Prisma (PostgreSQL)
const authRoutes = require('./routes/auth');
const propertiesRoutes = require('./routes/properties');
const usersRoutes = require('./routes/users');
const leadsRoutes = require('./routes/leads');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3050;

console.log('🚀 Starting Alrabie Real Estate Backend...');

// Security middleware - configure helmet to allow cross-origin for images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// Additional Helmet policies for production (HSTS + stricter CSP)
if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https:'],
      styleSrc: ["'self'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      frameAncestors: ["'self'"]
    }
  }));
} else {
  // Development-friendly CSP
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'data:', 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'http://localhost:3000', 'ws://localhost:3000']
    }
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Stricter limiter for auth endpoints to reduce brute-force risk
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs on auth
  message: { success: false, error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// CORS configuration - Enhanced for development and strict in production
// Handle OPTIONS requests first (before CORS middleware)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim().replace(/\/$/, '') : null;
    const devAllowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];

    // In production, only allow frontendUrl
    if (process.env.NODE_ENV === 'production') {
      if (frontendUrl && origin.startsWith(frontendUrl)) {
        return callback(null, true);
      }
      console.log('❌ CORS blocked (prod):', origin);
      return callback(new Error('Not allowed by CORS'));
    }

    // In development, allow dev origins or frontendUrl
    if (devAllowed.includes(origin) || (frontendUrl && origin.startsWith(frontendUrl))) {
      console.log('✅ CORS allowed:', origin);
      return callback(null, true);
    }
    
    // Relax in development - allow all origins
    console.log('⚠️  CORS allowed (dev mode):', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Additional CORS middleware for all routes (fallback)
app.use((req, res, next) => {
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
    console.log('✅ CORS preflight OPTIONS:', req.path, 'from:', origin);
    return res.sendStatus(200);
  }
  
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads and assets - with CORS
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for all requests to /uploads
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // Additional CORS headers (in case they're needed)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));
app.use('/public', express.static('public'));

// Serve static files with proper headers
app.use('/static', express.static('static', {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Compression middleware
app.use(compression());

// Cookie parser (used for refresh token cookie handling)
app.use(cookieParser());

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/deals', require('./routes/deals'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/reports', require('./routes/reports'));

// Default images endpoint for properties without images
app.get('/api/images/default/:type', (req, res) => {
  const { type } = req.params;
  const defaultImages = {
    villa: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
  };
  
  const imageUrl = defaultImages[type] || defaultImages.villa;
  res.json({ imageUrl });
});

// Test connection endpoint
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend is connected and working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Alrabie Real Estate API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('📊 Skipping SQLite init; using Prisma (PostgreSQL)...');

    const server = app.listen(PORT, () => {
      console.log('✅ Server started successfully!');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
      console.log('📋 Available endpoints:');
      console.log('   - GET  /api/health');
      console.log('   - POST /api/auth/login');
      console.log('   - POST /api/auth/register');
      console.log('   - GET  /api/properties');
      console.log('   - GET  /api/properties/new-arrivals');
      console.log('   - POST /api/leads');
      console.log('   - GET  /api/images/default/:type');
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('💡 Try using a different port or stop the process using this port');
        process.exit(1);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });

    // Graceful shutdown
    const shutdown = () => {
      try {
        server.close(() => {
          console.log('🛑 Server closed');
          process.exit(0);
        });
      } catch (e) {
        process.exit(0);
      }
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();