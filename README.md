# Portfolio Backend Server

A robust, well-structured Node.js/Express backend server for portfolio websites with enhanced email verification, contact form handling, and comprehensive security features.

## 🏗️ Architecture Overview

This project follows a modular architecture with separation of concerns:

```
src/
├── config/           # Configuration files
│   ├── emailConfig.ts    # Email service configuration
│   └── rateLimiter.ts    # Rate limiting configuration
├── routes/           # API route handlers
│   ├── index.ts         # Main router with route mounting
│   ├── contact.ts       # Contact form handling
│   ├── email.ts         # Email validation endpoint
│   └── download.ts      # File download endpoints
├── types/            # TypeScript type definitions
│   └── index.ts         # Shared interfaces and types
├── utils/            # Utility functions
│   ├── emailValidator.ts # Email validation logic
│   └── sanitizer.ts     # Input sanitization utilities
├── middleware/       # Custom middleware (if needed)
└── server.ts         # Main application entry point
```

## Features

### 🔒 Enhanced Email Verification
- **Advanced Email Validation**: Uses the `validator` library for comprehensive email format checking
- **Disposable Email Detection**: Blocks common disposable email providers
- **Domain Typo Detection**: Suggests corrections for common email domain typos
- **Email Normalization**: Standardizes email formats for consistency

### 🛡️ Security Features
- **Rate Limiting**: Global rate limiting (100 requests/15min) and contact form specific limiting (3 requests/15min)
- **Input Sanitization**: All user inputs are sanitized and escaped to prevent XSS attacks
- **Helmet.js**: Adds various HTTP headers for security
- **CORS Protection**: Configurable cross-origin resource sharing
- **Request Size Limits**: Prevents large payload attacks

### 📧 Contact Form
- **Email Sending**: Uses Nodemailer with customizable email providers
- **HTML & Text Emails**: Beautiful HTML emails with text fallbacks
- **Comprehensive Validation**: Validates name length, message length, and email format
- **Error Handling**: Detailed error messages for better user experience

### 📄 File Serving
- **Resume Download**: Secure PDF download endpoint
- **Static Assets**: Serves files from the assets directory

## Installation

1. **Clone and Navigate**
   ```bash
   cd your-portfolio-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   Edit `.env` file with your settings:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   RECIPIENT_EMAIL=your-email@gmail.com
   ```

## Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_PASS`

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Contact Form
**POST** `/api/contact`
- Rate limited: 3 requests per 15 minutes per IP
- Body:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "message": "Your message here"
  }
  ```

### Email Validation
**POST** `/api/validate-email`
- Test email validation without sending
- Body:
  ```json
  {
    "email": "test@example.com"
  }
  ```

### Resume Download
**GET** `/api/download/resume`
- Downloads the resume PDF file
- File should be placed in `assets/resume.pdf`

### Health Check
**GET** `/api/test`
- Returns server status and available endpoints

## Email Validation Features

### ✅ What's Validated
- Email format and structure
- Email length (max 254 characters)
- Disposable email domains (blocked)
- Common domain typos (suggestions provided)
- Message length (10-5000 characters)
- Name length (2-50 characters)

### 🚫 Blocked Disposable Domains
- 10minutemail.com
- mailinator.com
- guerrillamail.com
- tempmail.org
- throwaway.email
- temp-mail.org
- getairmail.com
- sharklasers.com

### 🔧 Domain Typo Detection
Suggests corrections for common typos:
- gmial.com → gmail.com
- gmai.com → gmail.com
- yahooo.com → yahoo.com
- hotmial.com → hotmail.com
- outlok.com → outlook.com

## File Structure

```
src/
├── server.ts          # Main server file
└── routes/
    └── index.ts       # API routes with email validation

assets/
└── resume.pdf         # Your resume file

.env                   # Environment variables
.env.example          # Environment template
package.json          # Dependencies and scripts
tsconfig.json         # TypeScript configuration
```

## Security Considerations

1. **Keep your `.env` file secure** - never commit it to version control
2. **Use strong app passwords** for email authentication
3. **Regularly update dependencies** to patch security vulnerabilities
4. **Monitor rate limiting logs** for potential abuse
5. **Consider additional CAPTCHA** for production environments

## Error Handling

The server provides detailed error messages for:
- Missing required fields
- Invalid email formats
- Disposable email addresses
- Rate limit exceeded
- Server errors
- File not found errors

## Customization

### Adding More Disposable Domains
Edit the `disposableEmailDomains` array in `src/routes/index.ts`

### Adjusting Rate Limits
Modify the rate limiting configuration in:
- `contactLimiter` (contact form specific)
- `globalLimiter` (server-wide)

### Custom Email Templates
Update the HTML template in the `mailOptions` object

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up proper logging
4. Configure reverse proxy (nginx)
5. Use HTTPS in production
6. Consider using a dedicated email service (SendGrid, AWS SES)

## Troubleshooting

### Email Not Sending
- Check Gmail app password
- Verify `EMAIL_USER` and `EMAIL_PASS`
- Check firewall/network restrictions

### Rate Limiting Issues
- Clear browser cache
- Wait for rate limit window to reset
- Check IP address for development

### File Download Issues
- Ensure `assets/resume.pdf` exists
- Check file permissions
- Verify file path configuration

## Dependencies

### Core
- **express**: Web framework
- **nodemailer**: Email sending
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables

### Security
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **validator**: Input validation and sanitization

### Development
- **typescript**: Type safety
- **ts-node**: TypeScript execution
- **@types/***: TypeScript definitions

## License

This project is open source and available under the [MIT License](LICENSE).

## Features

- **Contact Form API**: Handles contact form submissions and sends emails via nodemailer
- **Resume Download**: Serves resume PDF file with download functionality
- **CORS Enabled**: Configured for cross-origin requests from frontend
- **TypeScript**: Full TypeScript support with proper type definitions
- **Environment Configuration**: Uses .env for sensitive configuration

## Project Structure

```
server/
├── src/
│   ├── server.ts          # Main server file
│   └── routes/
│       └── index.ts       # API routes
├── assets/
│   └── resume.pdf         # Resume file
├── package.json
├── tsconfig.json
└── .env                   # Environment variables
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure Environment Variables**
   Edit the `.env` file with your actual values:
   ```env
   PORT=5000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   RECIPIENT_EMAIL=your-email@gmail.com
   ```

3. **Add Your Resume**
   Place your resume PDF file at `server/assets/resume.pdf`

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### POST /api/contact
Accepts contact form submissions.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "Hello, this is a test message."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully! Thank you for your message."
}
```

### GET /api/download/resume
Downloads the resume PDF file.

**Response:** PDF file download

### GET /api/test
Test endpoint to verify API is working.

## Email Configuration

The server uses nodemailer to send emails. For Gmail:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password in your Google Account settings
3. Use the App Password in the `EMAIL_PASS` environment variable

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run clean` - Clean build directory

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `EMAIL_USER` | Email address for sending | Required |
| `EMAIL_PASS` | Email password/app password | Required |
| `EMAIL_SERVICE` | Email service provider | gmail |
| `EMAIL_HOST` | SMTP host | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | 587 |
| `RECIPIENT_EMAIL` | Email to receive contact forms | EMAIL_USER |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## License

MIT
