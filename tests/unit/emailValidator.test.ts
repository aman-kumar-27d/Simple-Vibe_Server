import { validateEmail } from '../../src/utils/emailValidator';

describe('Email Validator', () => {
  describe('Valid Emails', () => {
    const validEmails = [
      'john.doe@gmail.com',
      'user@company.co.uk',
      'test+tag@example.org',
      'user.name@domain-name.com',
      'test123@subdomain.example.com'
    ];

    test.each(validEmails)('should validate %s as valid', (email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Invalid Emails', () => {
    const invalidEmails = [
      { email: 'invalid-email', reason: 'missing @ symbol' },
      { email: 'user@', reason: 'missing domain' },
      { email: '@domain.com', reason: 'missing local part' },
      { email: 'user..name@domain.com', reason: 'consecutive dots' },
      { email: 'user@domain', reason: 'invalid domain' },
      { email: '', reason: 'empty string' }
    ];

    test.each(invalidEmails)('should reject $email ($reason)', ({ email }) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Disposable Email Detection', () => {
    const disposableEmails = [
      'test@10minutemail.com',
      'user@mailinator.com',
      'temp@guerrillamail.com',
      'throw@throwaway.email',
      'get@getairmail.com'
    ];

    test.each(disposableEmails)('should block disposable email %s', (email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Disposable email addresses are not allowed');
    });
  });

  describe('Domain Typo Detection', () => {
    const typoEmails = [
      { email: 'user@gmial.com', suggestion: 'gmail.com' },
      { email: 'test@yahooo.com', suggestion: 'yahoo.com' },
      { email: 'contact@hotmial.com', suggestion: 'hotmail.com' },
      { email: 'info@outlok.com', suggestion: 'outlook.com' }
    ];

    test.each(typoEmails)('should suggest $suggestion for $email', ({ email, suggestion }) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain(suggestion);
    });
  });

  describe('Email Length Validation', () => {
    test('should reject emails longer than 254 characters', () => {
      // Create a valid email that's too long
      const longEmail = 'test@' + 'a'.repeat(250) + '.com';
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too long');
    });
  });
});
