import logger from '../utils/logger.js';

/**
 * Health check endpoint
 * Returns immediately without any external dependencies
 * Used for load balancer health checks and monitoring
 */
export default async (req, res) => {
  logger.info('Health check requested');
  res.status(200).json({
    status: 'ok',
  });
};