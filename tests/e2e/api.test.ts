import request from 'supertest';
import { Server } from 'http';
import app from '../../src/server';

describe('Full API E2E Tests', () => {
  let server: Server;
  const baseUrl = 'http://localhost:5001';

  beforeAll((done) => {
    server = app.listen(5001, () => {
      console.log('Test server running on port 5001');
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Health Check', () => {
    test('GET / should return server health', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toContain('Portfolio Backend Server is running');
      expect(response.body.status).toBe('healthy');
    });

    test('GET /api/test should return API information', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.body.message).toContain('API routes are working');
      expect(response.body.endpoints).toBeDefined();
      expect(response.body.features).toBeDefined();
    });
  });

  describe('Complete Email Validation Workflow', () => {
    test('should validate email and then handle contact form submission', async () => {
      // First, validate the email
      const emailValidation = await request(app)
        .post('/api/email/validate')
        .send({ email: 'john.doe@gmail.com' })
        .expect(200);

      expect(emailValidation.body.isValid).toBe(true);

      // Then, submit the contact form (now should succeed in test environment)
      const contactSubmission = await request(app)
        .post('/api/contact')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@gmail.com',
          message: 'This is a complete workflow test with sufficient message length.'
        })
        .expect(200); // Now succeeds with our mock email transporter

      expect(contactSubmission.body.success).toBe(true);
      expect(contactSubmission.body.message).toContain('Email sent successfully');
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body.error).toBe('Route not found');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/email/validate')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBeDefined();
    });
  });
});
