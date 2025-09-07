import express, { Request, Response } from 'express';
import { ContactFormData } from '../types';
import { contactLimiter } from '../config/rateLimiter';
import { createTransporter, emailConfig } from '../config/emailConfig';
import { validateEmail } from '../utils/emailValidator';
import { sanitizeContactData, validateContactData } from '../utils/sanitizer';

const router = express.Router();

// Contact form endpoint
router.post('/', contactLimiter, async (req: Request, res: Response) => {
  try {
    const contactData: ContactFormData = req.body;

    // Validate required fields
    const validationErrors = validateContactData(contactData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validationErrors.join(', ')
      });
    }

    // Sanitize inputs
    const sanitizedData = sanitizeContactData(contactData);

    // Enhanced email validation
    const emailValidation = validateEmail(sanitizedData.email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        error: 'Invalid email address',
        message: emailValidation.error
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: emailConfig.user,
      to: emailConfig.recipient,
      subject: `Portfolio Contact Form - Message from ${sanitizedData.firstName} ${sanitizedData.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${sanitizedData.firstName} ${sanitizedData.lastName}</p>
            <p><strong>Email:</strong> ${sanitizedData.email}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="color: #007bff; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #333;">${sanitizedData.message}</p>
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
        
        Name: ${sanitizedData.firstName} ${sanitizedData.lastName}
        Email: ${sanitizedData.email}
        
        Message:
        ${sanitizedData.message}
        
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

export default router;
