import { Request, Response, NextFunction } from 'express';

// Add timestamp to Express Request interface
declare global {
  namespace Express {
    interface Request {
      timestamp?: Date;
    }
  }
}

/**
 * Request tracking middleware
 * Monitors suspicious patterns and logs potential security threats
 */
export const requestMonitoring = (req: Request, res: Response, next: NextFunction) => {
  // Track IP, user agent, and request details
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const requestMethod = req.method;
  const requestPath = req.originalUrl;
  
  // Add request timestamp
  req.timestamp = new Date();
  
  // Log suspicious patterns (SQL injection, XSS attempts, etc)
  const requestBody = JSON.stringify(req.body || {});
  const requestQuery = JSON.stringify(req.query || {});
  
  const suspiciousPatterns = [
    /(\b)((select|union|insert|delete|from|drop table|where|script)(\s))(\b)/i,
    /<script\b[^>]*>(.*?)<\/script>/i,
    /[<>]javascript:/i,
    /(\b)((admin|root|password|passwd|pwd)(\s))(\b)/i
  ];
  
  const bodyContainsSuspiciousPattern = suspiciousPatterns.some(pattern => 
    pattern.test(requestBody) || pattern.test(requestQuery)
  );
  
  if (bodyContainsSuspiciousPattern) {
    console.warn(`[SECURITY WARNING] Possible malicious request detected`);
    console.warn(`IP: ${clientIP}, Agent: ${userAgent}`);
    console.warn(`Method: ${requestMethod}, Path: ${requestPath}`);
    console.warn(`Body: ${requestBody.substring(0, 200)}${requestBody.length > 200 ? '...' : ''}`);
    console.warn(`Query: ${requestQuery.substring(0, 200)}${requestQuery.length > 200 ? '...' : ''}`);
    
    // Consider adding additional security measures here
    // such as blocking the request or adding the IP to a temporary blocklist
    
    // For now, we just log and continue
  }
  
  next();
};
