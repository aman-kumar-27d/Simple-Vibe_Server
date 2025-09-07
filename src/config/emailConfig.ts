import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'EMAIL_USER',
  'EMAIL_PASS',
  'RECIPIENT_EMAIL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const emailConfig = {
  user: process.env.EMAIL_USER!,
  pass: process.env.EMAIL_PASS!,
  recipient: process.env.RECIPIENT_EMAIL!,
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587')
};

export const createTransporter = () => {
  return nodemailer.createTransport({
    service: emailConfig.service,
    host: emailConfig.host,
    port: emailConfig.port,
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });
};
