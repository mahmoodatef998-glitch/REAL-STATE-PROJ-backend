/**
 * Health Check Routes
 * Provides system health monitoring endpoints
 */

const express = require('express');
const { prisma } = require('../database/db');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/**
 * Basic health check
 * GET /api/health
 */
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AL RABEI Real Estate API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Detailed health check
 * GET /api/health/detailed
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  // Check database connection
  let dbStatus = 'down';
  let dbResponseTime = 0;
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbResponseTime = Date.now() - dbStart;
    dbStatus = 'up';
  } catch (error) {
    console.error('Database health check failed:', error.message);
  }

  // Check uploads directory
  const uploadsDir = path.join(__dirname, '../uploads');
  let uploadsStatus = 'up';
  try {
    fs.accessSync(uploadsDir, fs.constants.W_OK);
  } catch {
    uploadsStatus = 'down';
  }

  // System information
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const responseTime = Date.now() - startTime;
  const overallStatus = (dbStatus === 'up' && uploadsStatus === 'up') ? 'healthy' : 'degraded';

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: {
      seconds: Math.floor(uptime),
      human: formatUptime(uptime)
    },
    checks: {
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`
      },
      uploads: {
        status: uploadsStatus
      }
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
      }
    },
    responseTime: `${responseTime}ms`
  });
});

/**
 * Readiness check (for Kubernetes/Docker)
 * GET /api/health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness check (for Kubernetes/Docker)
 * GET /api/health/live
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

module.exports = router;


