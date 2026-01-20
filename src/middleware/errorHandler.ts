/**
 * Centralized Error Handler Middleware
 * Provides consistent error response format across all routes
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { APIError } from '../utils/errorCodes';
import { CONFIG } from '../config';

/**
 * Main error handler middleware
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Log the error
    logger.error('Error Handler Caught', {
        name: err.name,
        message: err.message,
        code: err.code,
        path: req.path,
        method: req.method,
        ip: req.ip,
        user: (req as any).user ? (req as any).user.id : 'anonymous'
    });

    // Handle APIError (our custom errors)
    if (err instanceof APIError) {
        return res.status(err.status).json({
            success: false,
            error: err.message,
            code: err.code,
            ...(err.details && { details: err.details }),
            ...(CONFIG.isDevelopment && {
                stack: err.stack
            })
        });
    }

    // Default error status and message
    let status = err.status || err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let code = err.code || 'SERVER_ERROR';
    let details = null;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation error';
        code = 'VALIDATION_FAILED';
        details = err.errors || err.details;
    }

    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        status = 401;
        message = 'Authentication failed';
        code = 'AUTH_TOKEN_INVALID';
    }

    if (err.name === 'TokenExpiredError') {
        status = 401;
        message = 'Authentication token has expired';
        code = 'AUTH_TOKEN_EXPIRED';
    }

    if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid ID format';
        code = 'VALIDATION_INVALID_FORMAT';
    }

    // Prisma/Database errors
    if (err.code?.startsWith('P')) {
        status = 500;
        message = 'Database operation failed';
        code = 'DATABASE_ERROR';

        // Hide sensitive database errors in production
        if (CONFIG.isProduction) {
            message = 'An error occurred while processing your request';
        }
    }

    // Format error response
    const errorResponse = {
        success: false,
        error: message,
        code,
        ...(details && { details }),
        ...(CONFIG.isDevelopment && {
            stack: err.stack,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        })
    };

    res.status(status).json(errorResponse);
};

/**
 * Async error wrapper - catches errors in async route handlers
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        code: 'RESOURCE_NOT_FOUND',
        path: req.originalUrl,
        method: req.method
    });
};
