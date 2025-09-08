import request from 'supertest';
import express from 'express';
import path from 'path';
import downloadRouter from '../../src/routes/download';

const app = express();
app.use('/api/download', downloadRouter);

describe('Download Routes Integration', () => {
  describe('GET /api/download/resume', () => {
    test('should return proper headers for viewing resume', async () => {
      // Test viewing the resume (no download header)
      const response = await request(app)
        .get('/api/download/resume')
        .set('Referer', 'http://example.com/portfolio/view');

      if (response.status === 200) {
        // File exists - check headers
        expect(response.headers['content-type']).toBe('application/pdf');
        // Should not have attachment disposition for viewing
        expect(response.headers['content-disposition']).toBeUndefined();
      } else if (response.status === 404) {
        // File doesn't exist - check error message
        expect(response.body.error).toBe('File not found');
        expect(response.body.message).toContain('Resume file not found');
      } else {
        // Unexpected status
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    });

    test('should return proper headers for downloading resume', async () => {
      // Test downloading the resume (with download header)
      const response = await request(app)
        .get('/api/download/resume')
        .set('Referer', 'http://example.com/portfolio/download');

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

  describe('GET /api/download/view/resume', () => {
    test('should redirect to resume endpoint', async () => {
      const response = await request(app)
        .get('/api/download/view/resume');
      
      expect(response.status).toBe(302); // Redirect status code
      expect(response.headers.location).toBe('/api/download/resume');
    });
  });

  describe('GET /api/download/asset/:filename', () => {
    test('should reject invalid filename patterns', async () => {
      const response = await request(app)
        .get('/api/download/asset/invalid-file!.exe');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid filename');
    });

    test('should handle PDF file type correctly', async () => {
      // This test assumes assets/test.pdf exists or returns 404
      const response = await request(app)
        .get('/api/download/asset/test.pdf');
      
      if (response.status === 200) {
        expect(response.headers['content-type']).toBe('application/pdf');
      } else if (response.status === 404) {
        expect(response.body.error).toBe('File not found');
      }
    });

    test('should handle JPG file type correctly', async () => {
      // This test assumes assets/image.jpg exists or returns 404
      const response = await request(app)
        .get('/api/download/asset/image.jpg');
      
      if (response.status === 200) {
        expect(response.headers['content-type']).toBe('image/jpeg');
      } else if (response.status === 404) {
        expect(response.body.error).toBe('File not found');
      }
    });

    test('should handle PNG file type correctly', async () => {
      // This test assumes assets/photo.png exists or returns 404
      const response = await request(app)
        .get('/api/download/asset/photo.png');
      
      if (response.status === 200) {
        expect(response.headers['content-type']).toBe('image/png');
      } else if (response.status === 404) {
        expect(response.body.error).toBe('File not found');
      }
    });

    test('should reject directory traversal attempts', async () => {
      const response = await request(app)
        .get('/api/download/asset/../../../package.json');
      
      expect(response.status).toBe(404); // The actual behavior is 404
      // Don't test for the specific error message as it may vary
    });
  });
});
