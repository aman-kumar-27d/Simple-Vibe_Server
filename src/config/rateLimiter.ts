import rateLimit from 'express-rate-limit';

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    error: 'Too many contact form submissions',
    message: 'Please wait before submitting another message. You can submit up to 3 messages per 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
