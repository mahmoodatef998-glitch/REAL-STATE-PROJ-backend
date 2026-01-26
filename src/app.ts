import express, { Express } from 'express';
import path from 'path';
import { CONFIG } from './config';
import { applyMiddleware } from './config/middleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import propertiesRoutes from './routes/properties';
import dealsRoutes from './routes/deals';
import leadsRoutes from './routes/leads';
import companiesRoutes from './routes/companies';
import usersRoutes from './routes/users';
import reportsRoutes from './routes/reports';
import subscriptionsRoutes from './routes/subscriptions';
import activitiesRoutes from './routes/activities';
import { getCorsConfig, corsMiddleware } from './config/cors';
import cookieParser from 'cookie-parser';

import cors from 'cors';

// Initialize express app
const app: Express = express();

// Root diagnostic route - MUST be before any other middleware
app.get('/', (req, res) => {
    res.json({
        message: 'AL RABEI API is LIVE',
        version: '1.0.1',
        timestamp: new Date().toISOString()
    });
});

// 1. GLOBAL CORS - MUST BE FIRST
const corsConfigValues = getCorsConfig();
app.use(cors(corsConfigValues));
app.use(corsMiddleware);

// Apply other middleware
applyMiddleware(app);

// API Prefix Fallback Middleware
// If a request starts with common API routes but misses /api, redirect/rewrite it
app.use((req, res, next) => {
    const commonRoutes = ['/properties', '/auth', '/deals', '/leads', '/companies', '/users', '/reports', '/subscriptions', '/health', '/activities'];
    const matchingRoute = commonRoutes.find(route => req.url.startsWith(route));

    if (matchingRoute && !req.url.startsWith('/api/')) {
        console.log(`[Path Correction] Redirecting ${req.url} to /api${req.url}`);
        req.url = `/api${req.url}`;
    }
    next();
});

// Additional middleware not covered in applyMiddleware (if any specific order needed)
app.use(cookieParser());


// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/activities', activitiesRoutes);


// Default images endpoint (migrated from start-server.js)
app.get('/api/images/default/:type', (req, res) => {
    const { type } = req.params;
    const defaultImages: { [key: string]: string } = {
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

// Error handling (must be last)
app.use(errorHandler);
app.use('*', notFoundHandler);

export default app;
