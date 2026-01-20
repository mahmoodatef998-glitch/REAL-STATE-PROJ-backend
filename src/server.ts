import app from './app';
import { CONFIG } from './config';
import { logger } from './utils/logger';

const PORT = CONFIG.PORT;

const startServer = async () => {
    try {
        const server = app.listen(PORT, () => {
            logger.info('✅ Server started successfully!');
            logger.info(`🌐 Server running on port ${PORT}`);
            logger.info(`📱 Frontend URL: ${CONFIG.FRONTEND_URL}`);
            logger.info(`🔗 API URL: http://localhost:${PORT}`);
            logger.info(`🌐 Health Check: http://localhost:${PORT}/api/health`);
        });

        // Handle server errors
        server.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                logger.error(`❌ Port ${PORT} is already in use`);
                logger.error('💡 Try using a different port or stop the process using this port');
                process.exit(1);
            } else {
                logger.error('❌ Server error:', err);
                process.exit(1);
            }
        });

        // Graceful shutdown
        const shutdown = () => {
            try {
                server.close(() => {
                    logger.info('🛑 Server closed');
                    process.exit(0);
                });
            } catch (e) {
                process.exit(0);
            }
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
