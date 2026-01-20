/**
 * Middleware Configuration
 * Centralized middleware setup for Express application
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import { CONFIG } from './index';
import * as corsConfig from './cors';

/**
 * Configure Helmet security headers
 */
export function configureHelmet() {
    return helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false
    });
}

/**
 * Configure rate limiting
 */
export function configureRateLimit() {
    return rateLimit({
        windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
        max: CONFIG.RATE_LIMIT_MAX_REQUESTS,
        message: {
            success: false,
            error: 'Too many requests from this IP, please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
        } as any, // Type cast to avoid TS error with custom message structure if needed
        standardHeaders: true,
        legacyHeaders: false,
    });
}

/**
 * Configure body parsing
 */
export function configureBodyParser(app: Express) {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
}

/**
 * Configure static file serving
 */
export function configureStaticFiles(app: Express) {
    // Uploads directory with CORS headers
    app.use('/uploads', (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });

    app.use('/uploads', express.static(path.join(__dirname, '../../uploads'), {
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
export function configureCompression() {
    return compression();
}

/**
 * Apply all middleware to Express app
 */
export function applyMiddleware(app: Express) {
    // Security
    app.use(configureHelmet());
    app.use(configureRateLimit());

    // CORS
    app.options('*', corsConfig.optionsHandler);
    app.use(cors(corsConfig.getCorsConfig()));
    app.use(corsConfig.corsMiddleware);

    // Body parsing
    configureBodyParser(app);

    // Static files
    configureStaticFiles(app);

    // Compression
    app.use(configureCompression());
}
