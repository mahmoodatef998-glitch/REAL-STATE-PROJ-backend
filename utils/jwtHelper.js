/**
 * JWT Helper - Centralized JWT Secret Management
 * Simplifies JWT_SECRET handling across the application
 */

let cachedSecret = null;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Get JWT Secret with proper validation
 * @returns {string} JWT Secret
 * @throws {Error} If JWT_SECRET is not configured
 */
function getJWTSecret() {
  // Return cached secret if available
  if (cachedSecret) {
    return cachedSecret;
  }

  // Try to get secret from environment variables
  let secret = process.env.JWT_SECRET || global.JWT_SECRET;

  // Clean up the secret (remove quotes and whitespace)
  if (secret) {
    secret = secret.trim().replace(/^["']|["']$/g, '');
  }

  // Validate secret
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production environment');
    }
    
    // Development fallback
    console.warn('⚠️  WARNING: JWT_SECRET not found. Using development fallback.');
    secret = `DEV-FALLBACK-SECRET-${Date.now()}-DO-NOT-USE-IN-PRODUCTION`;
  }

  // Validate secret length
  if (secret.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET is too short. Should be at least 32 characters.');
  }

  // Cache the secret
  cachedSecret = secret;
  global.JWT_SECRET = secret;

  return secret;
}

/**
 * Clear cached secret (useful for testing)
 */
function clearCache() {
  cachedSecret = null;
}

function generateAccessToken(user) {
  const secret = getJWTSecret();
  const payload = { id: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, secret, { expiresIn: '15m' });
}

function verifyAccessToken(token) {
  const secret = getJWTSecret();
  return jwt.verify(token, secret);
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

module.exports = {
  getJWTSecret,
  clearCache,
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken
};


