import { Request, Response, NextFunction } from 'express';

/**
 * Central error handling middleware
 * Provides consistent error responses and logging
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error details (consider using a proper logging library in production)
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.error('Error details:', err);

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'The request body contains invalid JSON format.'
    });
  }

  // Handle specific error types
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'The request body exceeds the size limit.'
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message || 'Something went wrong';

  return res.status(statusCode).json({ 
    error: statusCode === 500 ? 'Internal server error' : 'Request error',
    message: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
