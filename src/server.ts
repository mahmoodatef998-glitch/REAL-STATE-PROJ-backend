import app from './app';
import { CONFIG } from './config';
import { logger } from './utils/logger';

const PORT = CONFIG.PORT;

const startServer = async () => {
    try {
        const port = Number(process.env.PORT) || 3050;
        const host = '0.0.0.0';

        const server = app.listen(port, host, () => {
            logger.info(`✅ Server for AL RABEI Real Estate started!`);
            logger.info(`📌 Version: 1.0.1`);
            logger.info(`🌐 Listening on: http://${host}:${port}`);
            logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
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
