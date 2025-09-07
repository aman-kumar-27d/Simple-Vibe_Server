import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import validator from 'validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    error: 'Too many contact form submissions',
    message: 'Please wait before submitting another message. You can submit up to 3 messages per 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Disposable email domains (common ones)
const disposableEmailDomains = [
  '10minutemail.com', 'mailinator.com', 'guerrillamail.com', 'tempmail.org',
  'throwaway.email', 'temp-mail.org', 'getairmail.com', 'sharklasers.com'
];

// Enhanced email validation function
const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  // Basic format validation
  if (!validator.isEmail(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Normalize email
  const normalizedEmail = validator.normalizeEmail(email);
  if (!normalizedEmail) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check email length
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  // Extract domain
  const domain = email.split('@')[1].toLowerCase();

  // Check for disposable email domains
  if (disposableEmailDomains.includes(domain)) {
    return { 
      isValid: false, 
      error: 'Disposable email addresses are not allowed. Please use a permanent email address.' 
    };
  }

  // Check for common typos in major domains
  const commonDomainTypos: { [key: string]: string } = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };

  if (commonDomainTypos[domain]) {
    return { 
      isValid: false, 
      error: `Did you mean ${email.replace(domain, commonDomainTypos[domain])}?` 
    };
  }

  return { isValid: true };
};

// Contact form interface
interface ContactFormData {
  firstName: string;
  lastName?: string;
  email: string;
  message: string;
}

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Contact form endpoint
router.post('/contact', contactLimiter, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, message }: ContactFormData = req.body;

    // Validation
    if (!firstName || !email || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'firstName, email, and message are required fields'
      });
    }

    // Sanitize inputs
    const sanitizedFirstName = validator.trim(validator.escape(firstName));
    const sanitizedLastName = lastName ? validator.trim(validator.escape(lastName)) : '';
    const sanitizedEmail = validator.trim(email.toLowerCase());
    const sanitizedMessage = validator.trim(validator.escape(message));

    // Enhanced email validation
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        error: 'Invalid email address',
        message: emailValidation.error
      });
    }

    // Validate message length
    if (sanitizedMessage.length < 10) {
      return res.status(400).json({
        error: 'Message too short',
        message: 'Please provide a message with at least 10 characters'
      });
    }

    if (sanitizedMessage.length > 5000) {
      return res.status(400).json({
        error: 'Message too long',
        message: 'Please keep your message under 5000 characters'
      });
    }

    // Validate name length
    if (sanitizedFirstName.length < 2 || sanitizedFirstName.length > 50) {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'First name must be between 2 and 50 characters'
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER,
      subject: `Portfolio Contact Form - Message from ${sanitizedFirstName} ${sanitizedLastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${sanitizedFirstName} ${sanitizedLastName}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="color: #007bff; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #333;">${sanitizedMessage}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 10px; background: #e9ecef; border-radius: 5px;">
            <p style="margin: 0; font-size: 12px; color: #666;">
              This message was sent from your portfolio contact form on ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${sanitizedFirstName} ${sanitizedLastName}
        Email: ${sanitizedEmail}
        
        Message:
        ${sanitizedMessage}
        
        Sent on: ${new Date().toLocaleString()}
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully! Thank you for your message.'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

// Resume download endpoint
router.get('/download/resume', (req: Request, res: Response): void => {
  try {
    const resumePath = path.join(__dirname, '../../assets/resume.pdf');
    const fileName = 'MyName_Resume.pdf'; // You can customize this filename
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(resumePath)) {
      res.status(404).json({
        error: 'File not found',
        message: 'Resume file not found. Please contact the administrator.'
      });
      return;
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Send file
    res.sendFile(resumePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Download failed',
            message: 'An error occurred while downloading the file.'
          });
        }
      }
    });
    
  } catch (error) {
    console.error('Error in resume download:', error);
    res.status(500).json({
      error: 'Download failed',
      message: 'An error occurred while processing your download request.'
    });
  }
});

// Email validation test endpoint
router.post('/validate-email', (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Please provide an email address to validate'
      });
    }

    const sanitizedEmail = validator.trim(email.toLowerCase());
    const validation = validateEmail(sanitizedEmail);

    return res.json({
      email: sanitizedEmail,
      isValid: validation.isValid,
      message: validation.error || 'Email is valid',
      normalizedEmail: validator.normalizeEmail(sanitizedEmail)
    });

  } catch (error) {
    console.error('Error validating email:', error);
    return res.status(500).json({
      error: 'Validation failed',
      message: 'An error occurred while validating the email address.'
    });
  }
});

// Test endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'API routes are working!',
    endpoints: {
      contact: 'POST /api/contact (Rate limited: 3 requests per 15 minutes)',
      validateEmail: 'POST /api/validate-email',
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
