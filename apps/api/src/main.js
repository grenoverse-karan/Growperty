import app from './app.js';
import logger from './utils/logger.js';
import { connectMongoDB } from './utils/mongodb.js';

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
  logger.info('Interrupted');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received');
  await new Promise(resolve => setTimeout(resolve, 3000));
  logger.info('Exiting');
  process.exit();
});

const port = process.env.PORT || 3001;

connectMongoDB()
  .then(() => {
    app.listen(port, () => {
      logger.info(`API Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB, server not started:', err.message);
    process.exit(1);
  });