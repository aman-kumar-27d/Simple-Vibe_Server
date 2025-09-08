import { sanitizeContactData, validateContactData } from '../../src/utils/sanitizer';
import { ContactFormData } from '../../src/types';

describe('Sanitizer', () => {
  describe('sanitizeContactData', () => {
    test('should sanitize and escape input data', () => {
      const input: ContactFormData = {
        firstName: '  John<script>  ',
        lastName: '  Doe<img>  ',
        email: '  JOHN.DOE@GMAIL.COM  ',
        message: '  Hello <b>World</b>!  '
      };

      const result = sanitizeContactData(input);

      expect(result.firstName).toBe('John&lt;script&gt;');
      expect(result.lastName).toBe('Doe&lt;img&gt;');
      expect(result.email).toBe('john.doe@gmail.com');
      expect(result.message).toBe('Hello &lt;b&gt;World&lt;&#x2F;b&gt;!');
    });

    test('should handle optional lastName', () => {
      const input: ContactFormData = {
        firstName: 'John',
        email: 'john@example.com',
        message: 'Hello!'
      };

      const result = sanitizeContactData(input);

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('');
      expect(result.email).toBe('john@example.com');
      expect(result.message).toBe('Hello!');
    });
  });

  describe('validateContactData', () => {
    test('should pass valid contact data', () => {
      const validData: ContactFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        message: 'This is a valid message with enough characters.'
      };

      const errors = validateContactData(validData);
      expect(errors).toHaveLength(0);
    });

    test('should reject missing required fields', () => {
      const invalidData: ContactFormData = {
        firstName: '',
        email: '',
        message: ''
      };

      const errors = validateContactData(invalidData);
      expect(errors).toContain('firstName, email, and message are required fields');
    });

    test('should reject first name that is too short', () => {
      const invalidData: ContactFormData = {
        firstName: 'J',
        email: 'john@example.com',
        message: 'Valid message here.'
      };

      const errors = validateContactData(invalidData);
      expect(errors).toContain('First name must be between 2 and 50 characters');
    });

    test('should reject first name that is too long', () => {
      const invalidData: ContactFormData = {
        firstName: 'J'.repeat(51),
        email: 'john@example.com',
        message: 'Valid message here.'
      };

      const errors = validateContactData(invalidData);
      expect(errors).toContain('First name must be between 2 and 50 characters');
    });

    test('should reject message that is too short', () => {
      const invalidData: ContactFormData = {
        firstName: 'John',
        email: 'john@example.com',
        message: 'Short'
      };

      const errors = validateContactData(invalidData);
      expect(errors).toContain('Please provide a message with at least 10 characters');
    });

    test('should reject message that is too long', () => {
      const invalidData: ContactFormData = {
        firstName: 'John',
        email: 'john@example.com',
        message: 'A'.repeat(5001)
      };

      const errors = validateContactData(invalidData);
      expect(errors).toContain('Please keep your message under 5000 characters');
    });
  });
});
