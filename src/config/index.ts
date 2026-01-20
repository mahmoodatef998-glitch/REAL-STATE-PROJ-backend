/**
 * Configuration Management
 * Loads and validates all environment variables
 * Ensures critical variables are set before server starts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const configPaths = [
    path.join(__dirname, '../../config.env'),
    path.join(__dirname, '../../.env'),
    './config.env',
    './.env'
];

let envLoaded = false;
for (const configPath of configPaths) {
    const result = dotenv.config({ path: configPath });
    if (!result.error) {
        envLoaded = true;
        break;
    }
}

if (!envLoaded) {
    dotenv.config();
}


const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

// ============ CRITICAL VALIDATION ============
const validateConfig = (): void => {
    const errors: string[] = [];

    // JWT_SECRET validation
    if (!process.env.JWT_SECRET) {
        if (isProduction) {
            errors.push('❌ JWT_SECRET is required in production');
        } else {
            console.warn('⚠️  JWT_SECRET not set - using development fallback');
        }
    } else if (process.env.JWT_SECRET.length < 32) {
        errors.push('❌ JWT_SECRET must be at least 32 characters');
    }

    // DATABASE_URL validation
    if (!process.env.DATABASE_URL) {
        errors.push('❌ DATABASE_URL is required');
    } else if (!process.env.DATABASE_URL.includes('postgresql://')) {
        if (!process.env.DATABASE_URL.includes('sqlite://')) {
            console.warn('⚠️  DATABASE_URL should use postgresql:// for production');
        }
    }

    // NODE_ENV validation
    if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
        errors.push('❌ NODE_ENV must be: development, production, or test');
    }

    // FRONTEND_URL validation
    if (!process.env.FRONTEND_URL) {
        console.warn('⚠️  FRONTEND_URL not set - using default');
    }

    // In production, throw errors
    if (isProduction && errors.length > 0) {
        console.error('\n🚨 PRODUCTION CONFIG ERRORS:\n');
        errors.forEach(err => console.error(err));
        console.error('\n');
        process.exit(1);
    } else if (errors.length > 0) {
        console.warn('\n⚠️  CONFIG WARNINGS:\n');
        errors.forEach(err => console.warn(err));
        console.warn('\n');
    }
};

// Validate on load
validateConfig();

/**
 * Helper: Get CORS origins based on environment
 */
function getCORSOrigins(): string[] {
    const origins = [];

    if (process.env.CORS_ORIGINS) {
        origins.push(...process.env.CORS_ORIGINS.split(',').map(url => url.trim()));
    }

    if (process.env.FRONTEND_URL) {
        origins.push(process.env.FRONTEND_URL.trim());
    }

    // Default development origins
    if (!isProduction) {
        origins.push('http://localhost:3000', 'http://localhost:3001');
    }

    // Always include a few common patterns for your project to avoid lockouts
    origins.push('https://real-state-proj.vercel.app');

    return [...new Set(origins)]; // Remove duplicates
}

export const CONFIG = {
    // Server Configuration
    PORT: process.env.PORT || 3050,
    NODE_ENV: process.env.NODE_ENV || 'development',
    isDevelopment,
    isProduction,

    // Frontend Configuration
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

    // JWT Secret
    JWT_SECRET: process.env.JWT_SECRET || (isDevelopment ? 'DEV-ONLY-SECRET-CHANGE-IN-PRODUCTION-' + Date.now() : ''),

    // Database (Prisma + PostgreSQL)
    DATABASE_URL: process.env.DATABASE_URL,

    // CORS Origins - Smart Configuration
    CORS_ORIGINS: getCORSOrigins(),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isProduction ? '50' : '100')),

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || (isProduction ? 'warn' : 'info'),

    // File Upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(','),
};
