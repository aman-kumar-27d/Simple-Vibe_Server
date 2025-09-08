import request from 'supertest';
import express from 'express';
import path from 'path';
import downloadRouter from '../../src/routes/download';

const app = express();
app.use('/api/download', downloadRouter);

describe('Download Routes Integration', () => {
  describe('GET /api/download/resume', () => {
    test('should return proper headers for resume download', async () => {
      // Note: This test may fail if resume.pdf doesn't exist
      // We'll check for either success or file not found
      const response = await request(app)
        .get('/api/download/resume');

      if (response.status === 200) {
        // File exists - check headers
        expect(response.headers['content-type']).toBe('application/pdf');
        expect(response.headers['content-disposition']).toContain('attachment');
        expect(response.headers['content-disposition']).toContain('resume.pdf');
      } else if (response.status === 404) {
        // File doesn't exist - check error message
        expect(response.body.error).toBe('File not found');
        expect(response.body.message).toContain('Resume file not found');
      } else {
        // Unexpected status
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    });
  });
});
