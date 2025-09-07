import express, { Request, Response } from 'express';
import contactRouter from './contact';
import emailRouter from './email';
import downloadRouter from './download';

const router = express.Router();

// Mount sub-routers
router.use('/contact', contactRouter);
router.use('/email', emailRouter);
router.use('/download', downloadRouter);

// Test endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'API routes are working!',
    endpoints: {
      contact: 'POST /api/contact (Rate limited: 3 requests per 15 minutes)',
      validateEmail: 'POST /api/email/validate',
      resume: 'GET /api/download/resume',
      test: 'GET /api/test'
    },
    features: {
      emailValidation: 'Enhanced email validation with disposable email detection',
      rateLimiting: 'Contact form protected with rate limiting',
      inputSanitization: 'All inputs are sanitized and validated',
      errorHandling: 'Comprehensive error handling and user feedback'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
