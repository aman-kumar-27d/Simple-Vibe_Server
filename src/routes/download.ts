import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Define the assets directory path explicitly
const assetsDirectory = path.resolve(__dirname, '../../assets');
const resumePath = path.join(assetsDirectory, 'resume.pdf');
const fileName = 'resume.pdf';

// Security function to ensure files are only accessed from the assets directory
function isPathSafe(filePath: string): boolean {
  const normalizedPath = path.normalize(filePath);
  return normalizedPath.startsWith(assetsDirectory);
}

// Combined endpoint for both viewing and downloading resume
router.get('/resume', (req: Request, res: Response): void => {
  try {
    // Verify the path is within the allowed directory
    if (!isPathSafe(resumePath)) {
      console.error('Security violation: Attempted to access file outside assets directory');
      res.status(403).json({
        error: 'Access denied',
        message: 'Security violation detected.'
      });
      return;
    }

    if (!fs.existsSync(resumePath)) {
      res.status(404).json({
        error: 'File not found',
        message: 'Resume file not found. Please contact the administrator.'
      });
      return;
    }

    // Set Content-Type header for PDF
    res.setHeader('Content-Type', 'application/pdf');
    
    // Check the referer to determine if it's a download or view request
    const referer = req.headers.referer || '';
    
    // If the request is coming from the download button, force download
    if (referer.includes('/download')) {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    }
    // Otherwise allow viewing in browser (no Content-Disposition header)
    
    // Use absolute path with sendFile
    res.sendFile(resumePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'File operation failed',
            message: 'An error occurred while processing your request.'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error in resume operation:', error);
    res.status(500).json({
      error: 'Operation failed',
      message: 'An error occurred while processing your request.'
    });
    return;
  }
});

// For backward compatibility - redirects to the main endpoint
router.get('/view/resume', (req: Request, res: Response) => {
  res.redirect('/api/download/resume');
});

// Generic file serving endpoint (if needed in the future)
router.get('/asset/:filename', (req: Request, res: Response): void => {
  try {
    const filename = req.params.filename;
    
    // Strict validation of filename parameter
    if (!/^[a-zA-Z0-9_-]+\.(pdf|jpg|png|jpeg)$/.test(filename)) {
      res.status(400).json({
        error: 'Invalid filename',
        message: 'The requested filename format is not allowed.'
      });
      return;
    }
    
    const filePath = path.join(assetsDirectory, filename);
    
    // Double-check path safety
    if (!isPathSafe(filePath)) {
      console.error('Security violation: Attempted to access file outside assets directory');
      res.status(403).json({
        error: 'Access denied',
        message: 'Security violation detected.'
      });
      return;
    }
    
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        error: 'File not found',
        message: 'The requested file was not found.'
      });
      return;
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    
    res.setHeader('Content-Type', contentType);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'File serving failed',
            message: 'An error occurred while serving the file.'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error serving asset:', error);
    res.status(500).json({
      error: 'File serving failed',
      message: 'An error occurred while processing your request.'
    });
    return;
  }
});

export default router;
