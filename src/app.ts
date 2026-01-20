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
import { getCorsConfig, corsMiddleware } from './config/cors';
import cookieParser from 'cookie-parser';

// Initialize express app
const app: Express = express();

// 1. GLOBAL CORS - MUST BE FIRST (to handle CORS before Helmet/Rate Limit)
const corsConfigValues = getCorsConfig();
app.use(require('cors')(corsConfigValues));
app.use(corsMiddleware);

// Apply other middleware
applyMiddleware(app);

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
