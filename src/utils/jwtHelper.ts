/**
 * JWT Helper - Centralized JWT Secret Management
 * Simplifies JWT_SECRET handling across the application
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { CONFIG } from '../config';

let cachedSecret: string | null = null;

/**
 * Get JWT Secret with proper validation
 */
export function getJWTSecret(): string {
    // Return cached secret if available
    if (cachedSecret) {
        return cachedSecret;
    }

    // Try to get secret from environment variables or global
    let secret = CONFIG.JWT_SECRET;

    if (!secret) {
        if (typeof global !== 'undefined' && (global as any).JWT_SECRET) {
            secret = (global as any).JWT_SECRET;
        }
    }

    // Clean up the secret
    if (secret) {
        secret = secret.trim().replace(/^["']|["']$/g, '');
    }

    // Validate secret
    if (!secret) {
        if (CONFIG.isProduction) {
            throw new Error('JWT_SECRET is required in production environment');
        }

        // Development fallback
        console.warn('⚠️  WARNING: JWT_SECRET not found. Using development fallback.');
        secret = `DEV-FALLBACK-SECRET-STAY-CONSISTENT-DO-NOT-USE-IN-PRODUCTION`;
    }

    // Validate secret length
    if (secret.length < 32) {
        console.warn('⚠️  WARNING: JWT_SECRET is too short. Should be at least 32 characters.');
    }

    // Cache the secret
    cachedSecret = secret;
    if (typeof global !== 'undefined') (global as any).JWT_SECRET = secret;

    return secret;
}

/**
 * Clear cached secret (useful for testing)
 */
export function clearCache() {
    cachedSecret = null;
}

export function generateAccessToken(user: { id: number; email: string; role: string }) {
    const secret = getJWTSecret();
    const payload = { id: user.id, email: user.email, role: user.role };
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}

export function verifyAccessToken(token: string) {
    const secret = getJWTSecret();
    return jwt.verify(token, secret);
}

export function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}
