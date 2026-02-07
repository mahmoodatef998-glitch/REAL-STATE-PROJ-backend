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
    const allowedOrigins = CONFIG.CORS_ORIGINS;

    return {
        origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
            // If no origin (like mobile apps or curl requests), allow it
            if (!origin) return callback(null, true);

            // If origin is in our allowed list, allow it
            if (allowedOrigins.indexOf(origin as string) !== -1 || !CONFIG.isProduction) {
                return callback(null, true);
            }

            // Fallback: allow known vercel domains (for previews)
            if (origin.endsWith('.vercel.app') || origin.includes('railway.app')) {
                return callback(null, true);
            }

            // For now, in production, let's still allow everything to debug the error
            // We can restrict this later
            callback(null, true);
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
            'X-Tenant-Id',
            'X-App-Version',
            'Cookie'
        ],
        exposedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'X-Backend-Version'],
        optionsSuccessStatus: 200,
        preflightContinue: false
    };
}

/**
 * Additional CORS middleware (fallback and header insurance)
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;

    // Set custom version header for tracking deployment
    res.setHeader('X-Backend-Version', '1.0.1');

    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Tenant-Id, X-App-Version');
        res.setHeader('Access-Control-Max-Age', '86400');
        return res.sendStatus(200);
    }

    next();
}

/**
 * OPTIONS handler for all routes
 */
export function optionsHandler(req: Request, res: Response) {
    const origin = req.headers.origin;
    res.set({
        'X-Backend-Version': '1.0.1',
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Tenant-Id, X-App-Version',
        'Access-Control-Max-Age': '86400'
    });
    res.sendStatus(200);
}
