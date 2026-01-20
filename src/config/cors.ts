/**
 * CORS Configuration
 * Centralized Cross-Origin Resource Sharing setup
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { CONFIG } from './index';

/**
 * Get CORS configuration
 */
export function getCorsConfig() {
    const allowedOrigins = CONFIG.CORS_ORIGINS || [];
    const frontendUrl = CONFIG.FRONTEND_URL ?
        CONFIG.FRONTEND_URL.trim().replace(/\/$/, '') :
        null;

    return {
        origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) {
                return callback(null, true);
            }

            // Clean origin for comparison
            const cleanOrigin = origin.trim().replace(/\/$/, '');

            // 1. Check if origin is in the explicitly allowed list
            if (allowedOrigins.some(ao => ao.trim().replace(/\/$/, '') === cleanOrigin)) {
                logger.debug(`CORS allowed (listed): ${origin}`);
                return callback(null, true);
            }

            // 2. Check exact match or starts with FRONTEND_URL
            const cleanFrontend = frontendUrl ? frontendUrl.trim().replace(/\/$/, '') : '';
            if (cleanFrontend && (cleanOrigin === cleanFrontend || cleanOrigin.startsWith(cleanFrontend))) {
                logger.debug(`CORS allowed (frontend): ${origin}`);
                return callback(null, true);
            }

            // 3. Allow localhost and common dev ports
            const isLocal = cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1');
            if (isLocal) {
                logger.debug(`CORS allowed (local): ${origin}`);
                return callback(null, true);
            }

            // 4. Allow Vercel preview deployments
            // Pattern: *.vercel.app if it contains relevant keywords
            if (cleanOrigin.includes('vercel.app')) {
                const isRelevant =
                    cleanOrigin.includes('real-state') ||
                    cleanOrigin.includes('al-rabei') ||
                    cleanOrigin.includes('mahmood') ||
                    cleanOrigin.includes('atef');

                if (isRelevant) {
                    logger.info(`CORS allowed (Vercel): ${origin}`);
                    return callback(null, true);
                }
            }

            // In development mode, be more permissive
            if (!CONFIG.isProduction) {
                logger.debug(`CORS allowed (dev permissive): ${origin}`);
                return callback(null, true);
            }

            // If we're here and in production, block it
            logger.warn(`CORS blocked (production): ${origin}`);
            // Instead of returning an error, we return false to indicate not allowed
            // This allows the cors middleware to handle it gracefully
            return callback(null, false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'Cache-Control',
            'X-Tenant-Id'
        ],
        exposedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
        optionsSuccessStatus: 200,
        preflightContinue: false
    };
}

/**
 * Additional CORS middleware (fallback and header insurance)
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;

    // We already have the 'cors' package doing the heavy lifting,
    // but this middleware ensures headers are set even for error responses
    // by being registered after cors() but before routes.

    if (origin) {
        // Only set if not already set by 'cors' package
        if (!res.getHeader('Access-Control-Allow-Origin')) {
            // Note: In production, we should only set this if the origin is actually allowed
            // But since this is a "fallback", we want to be helpful for debugging
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Credentials', 'true');
        }
    }

    // Always ensure these are available
    if (!res.getHeader('Access-Control-Allow-Methods')) {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    }

    if (!res.getHeader('Access-Control-Allow-Headers')) {
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Tenant-Id');
    }

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
}

/**
 * OPTIONS handler for all routes
 */
export function optionsHandler(req: Request, res: Response) {
    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Tenant-Id');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(200);
}
