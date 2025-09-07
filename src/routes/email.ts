import express, { Request, Response } from 'express';
import validator from 'validator';
import { validateEmail } from '../utils/emailValidator';

const router = express.Router();

// Email validation endpoint
router.post('/validate', (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        isValid: false,
        message: 'Please provide an email address to validate'
      });
    }

    const sanitizedEmail = validator.trim(email.toLowerCase());
    const validation = validateEmail(sanitizedEmail);

    return res.json({
      isValid: validation.isValid,
      message: validation.error || 'Email is valid'
    });

  } catch (error) {
    console.error('Error validating email:', error);
    return res.status(500).json({
      isValid: false,
      message: 'An error occurred while validating the email address.'
    });
  }
});

export default router;
