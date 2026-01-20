/**
 * Logger Service
 * Centralized logging configuration
 */

import winston from 'winston';
import { CONFIG } from '../config';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom log format
const logFormat = printf((info) => {
    const { level, message, timestamp } = info;
    return `${timestamp} [${level}]: ${message}`;
});

export const logger = winston.createLogger({
    level: CONFIG.LOG_LEVEL,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json()
    ),
    transports: [
        // Console transport for all environments
        new winston.transports.Console({
            format: combine(
                colorize(),
                logFormat
            )
        }),
        // File transport for production (errors only)
        ...(CONFIG.isProduction ? [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' })
        ] : [])
    ]
});

// Create a stream for HTTP request logging (if used later)
export const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    }
};
