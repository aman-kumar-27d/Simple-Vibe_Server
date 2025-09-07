import validator from 'validator';
import { EmailValidationResult } from '../types';

// Disposable email domains (common ones)
const disposableEmailDomains = [
  '10minutemail.com', 'mailinator.com', 'guerrillamail.com', 'tempmail.org',
  'throwaway.email', 'temp-mail.org', 'getairmail.com', 'sharklasers.com'
];

// Common domain typos
const commonDomainTypos: { [key: string]: string } = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com'
};

export const validateEmail = (email: string): EmailValidationResult => {
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
  if (commonDomainTypos[domain]) {
    return { 
      isValid: false, 
      error: `Did you mean ${email.replace(domain, commonDomainTypos[domain])}?` 
    };
  }

  return { isValid: true };
};
