import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Resume download endpoint
router.get('/resume', (req: Request, res: Response): void => {
  try {
    const resumePath = path.join(__dirname, '../../assets/resume.pdf');
    const fileName = 'resume.pdf';
    
    // Check if file exists
    if (!fs.existsSync(resumePath)) {
      res.status(404).json({
        error: 'File not found',
        message: 'Resume file not found. Please contact the administrator.'
      });
      return;
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Send file
    res.sendFile(resumePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Download failed',
            message: 'An error occurred while downloading the file.'
          });
        }
      }
    });
    
  } catch (error) {
    console.error('Error in resume download:', error);
    res.status(500).json({
      error: 'Download failed',
      message: 'An error occurred while processing your download request.'
    });
  }
});

export default router;
