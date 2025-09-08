import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'testpassword';
process.env.RECIPIENT_EMAIL = 'recipient@example.com';

// Increase Jest timeout for async operations
jest.setTimeout(10000);
