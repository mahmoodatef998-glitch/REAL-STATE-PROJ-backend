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
    const frontendUrl = CONFIG.FRONTEND_URL ?
        CONFIG.FRONTEND_URL.trim().replace(/\/$/, '') :
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
        origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) {
                return callback(null, true);
            }

            // Clean common patterns
            const cleanOrigin = origin.trim().replace(/\/$/, '');
            const cleanFrontend = frontendUrl ? frontendUrl.trim().replace(/\/$/, '') : '';

            // 1. Check exact match or starts with (for sub-paths if misconfigured)
            if (cleanFrontend && (cleanOrigin === cleanFrontend || cleanOrigin.startsWith(cleanFrontend))) {
                logger.debug(`CORS allowed (exact/prefix): ${origin}`);
                return callback(null, true);
            }

            // 2. Allow localhost and common dev ports
            const isLocal = cleanOrigin.includes('localhost') || cleanOrigin.includes('127.0.0.1');
            if (isLocal) {
                logger.debug(`CORS allowed (local): ${origin}`);
                return callback(null, true);
            }

            // 3. Allow Vercel preview deployments
            // Pattern: real-state-proj-[random].vercel.app or similar
            if (cleanOrigin.includes('vercel.app') && (cleanOrigin.includes('real-state') || cleanOrigin.includes('al-rabei'))) {
                logger.info(`CORS allowed (Vercel preview): ${origin}`);
                return callback(null, true);
            }

            // In development mode, be more permissive if none of the above matched
            if (!CONFIG.isProduction) {
                logger.debug(`CORS allowed (dev mode - permissive): ${origin}`);
                return callback(null, true);
            }

            // If we're here and in production, block it
            logger.warn(`CORS blocked (production): ${origin}`);
            return callback(new Error('Not allowed by CORS'));
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
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
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
        logger.info(`CORS preflight OPTIONS: ${req.path} from: ${origin}`);
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
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(200);
}
