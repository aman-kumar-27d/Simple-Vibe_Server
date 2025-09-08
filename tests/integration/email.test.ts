import request from 'supertest';
import express from 'express';
import cors from 'cors';
import emailRouter from '../../src/routes/email';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/email', emailRouter);

describe('Email Routes Integration', () => {
  describe('POST /api/email/validate', () => {
    test('should validate a correct email', async () => {
      const response = await request(app)
        .post('/api/email/validate')
        .send({ email: 'john.doe@gmail.com' })
        .expect(200);

      expect(response.body).toEqual({
        isValid: true,
        message: 'Email is valid'
      });
    });

    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/email/validate')
        .send({ email: 'invalid-email' })
        .expect(200);

      expect(response.body).toEqual({
        isValid: false,
        message: 'Invalid email format'
      });
    });

    test('should reject disposable email', async () => {
      const response = await request(app)
        .post('/api/email/validate')
        .send({ email: 'test@10minutemail.com' })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.message).toContain('Disposable email addresses are not allowed');
    });

    test('should suggest correction for typo', async () => {
      const response = await request(app)
        .post('/api/email/validate')
        .send({ email: 'user@gmial.com' })
        .expect(200);

      expect(response.body.isValid).toBe(false);
      expect(response.body.message).toContain('gmail.com');
    });

    test('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/email/validate')
        .send({})
        .expect(400);

      expect(response.body.isValid).toBe(false);
      expect(response.body.message).toContain('Please provide an email address');
    });
  });
});
