import { Request, Response, NextFunction } from 'express';

/**
 * Maintenance mode middleware
 * Enable/disable with MAINTENANCE_MODE environment variable
 */
export const maintenanceMode = (req: Request, res: Response, next: NextFunction) => {
  // Skip maintenance mode for health checks
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }

  // Check if maintenance mode is enabled
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'The server is currently under maintenance. Please try again later.',
      estimatedDowntime: process.env.MAINTENANCE_DURATION || 'unknown'
    });
  }

  next();
};
