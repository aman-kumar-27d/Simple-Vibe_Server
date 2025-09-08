import request from 'supertest';
import express from 'express';
import cors from 'cors';
import contactRouter from '../../src/routes/contact';

// Mock nodemailer for testing
jest.mock('../../src/config/emailConfig', () => ({
  emailConfig: {
    user: 'test@example.com',
    pass: 'testpass',
    recipient: 'recipient@example.com',
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587
  },
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-message-id' }))
  }))
}));

// Mock rate limiter for testing
jest.mock('../../src/config/rateLimiter', () => ({
  contactLimiter: (req: any, res: any, next: any) => next()
}));

// Helper function to create a fresh app for each test
function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/contact', contactRouter);
  return app;
}

describe('Contact Routes Integration', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/contact', () => {
    test('should accept valid contact form submission', async () => {
      const app = createTestApp();
      const validSubmission = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gmail.com',
        message: 'This is a test message with sufficient length for validation.'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(validSubmission)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Email sent successfully');
    });

    test('should reject submission with missing required fields', async () => {
      const app = createTestApp();
      const invalidSubmission = {
        firstName: '',
        email: '',
        message: ''
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidSubmission)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.message).toContain('required fields');
    });

    test('should reject submission with invalid email', async () => {
      const app = createTestApp();
      const invalidSubmission = {
        firstName: 'John',
        email: 'invalid-email',
        message: 'This is a valid message with sufficient length.'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidSubmission)
        .expect(400);

      expect(response.body.error).toBe('Invalid email address');
    });

    test('should reject submission with disposable email', async () => {
      const app = createTestApp();
      const invalidSubmission = {
        firstName: 'John',
        email: 'test@10minutemail.com',
        message: 'This is a valid message with sufficient length.'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidSubmission)
        .expect(400);

      expect(response.body.error).toBe('Invalid email address');
      expect(response.body.message).toContain('Disposable email addresses are not allowed');
    });

    test('should reject submission with message too short', async () => {
      const app = createTestApp();
      const invalidSubmission = {
        firstName: 'John',
        email: 'john@example.com',
        message: 'Short'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidSubmission)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.message).toContain('at least 10 characters');
    });

    test('should reject submission with name too short', async () => {
      const app = createTestApp();
      const invalidSubmission = {
        firstName: 'J',
        email: 'john@example.com',
        message: 'This is a valid message with sufficient length.'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidSubmission)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.message).toContain('between 2 and 50 characters');
    });
  });
});
