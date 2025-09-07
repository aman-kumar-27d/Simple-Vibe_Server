import validator from 'validator';
import { ContactFormData, SanitizedContactData } from '../types';

export const sanitizeContactData = (data: ContactFormData): SanitizedContactData => {
  return {
    firstName: validator.trim(validator.escape(data.firstName)),
    lastName: data.lastName ? validator.trim(validator.escape(data.lastName)) : '',
    email: validator.trim(data.email.toLowerCase()),
    message: validator.trim(validator.escape(data.message))
  };
};

export const validateContactData = (data: ContactFormData): string[] => {
  const errors: string[] = [];

  if (!data.firstName || !data.email || !data.message) {
    errors.push('firstName, email, and message are required fields');
  }

  if (data.firstName && (data.firstName.length < 2 || data.firstName.length > 50)) {
    errors.push('First name must be between 2 and 50 characters');
  }

  if (data.message && data.message.length < 10) {
    errors.push('Please provide a message with at least 10 characters');
  }

  if (data.message && data.message.length > 5000) {
    errors.push('Please keep your message under 5000 characters');
  }

  return errors;
};
