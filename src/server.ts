import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes/index';
import { maintenanceMode } from './middleware/maintenanceMode';
import { requestMonitoring } from './middleware/requestMonitoring';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
app.use(globalLimiter);

// Maintenance mode (must be before routes)
app.use(maintenanceMode);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security monitoring middleware
app.use(requestMonitoring);

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/', (req, res) => {
  const packageJson = require('../package.json');
  const uptime = process.uptime();
  
  // Format uptime
  const uptimeFormatted = () => {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor(((uptime % 86400) % 3600) / 60);
    const seconds = Math.floor(((uptime % 86400) % 3600) % 60);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  res.json({ 
    message: 'Portfolio Backend Server is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development',
    uptime: uptimeFormatted(),
    maintenance: process.env.MAINTENANCE_MODE === 'true'
  });
});

// Static files for assets
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Import centralized error handler
import { errorHandler } from './middleware/errorHandler';

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist on this server`
  });
});

// Export app for testing
export default app;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Access the server at: http://localhost:${PORT}`);
  });
}
