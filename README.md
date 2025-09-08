# Portfolio Backend Server

A robust, well-structured Node.js/Express backend server for portfolio websites with enhanced email verification, contact form handling, and comprehensive security features.

## 🏗️ Architecture Overview

This project follows a modular architecture with separation of concerns:

```
src/
├── config/           # Configuration files
│   ├── emailConfig.ts    # Email service configuration
│   └── rateLimiter.ts    # Rate limiting configuration
├── middleware/       # Custom middleware
│   ├── errorHandler.ts   # Centralized error handling
│   ├── maintenanceMode.ts # Maintenance mode middleware
│   └── requestMonitoring.ts # Security monitoring middleware
├── routes/           # API route handlers
│   ├── index.ts         # Main router with route mounting
│   ├── contact.ts       # Contact form handling
│   ├── email.ts         # Email validation endpoint
│   └── download.ts      # File download endpoints
├── types/            # TypeScript type definitions
│   └── index.ts         # Shared interfaces and types
├── utils/            # Utility functions
│   ├── emailValidator.ts # Email validation logic
│   ├── sanitizer.ts     # Input sanitization utilities
│   └── logger.ts        # Production-ready logging utility
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
- **Maintenance Mode**: Built-in maintenance mode for graceful updates and downtime
- **Request Monitoring**: Detection of suspicious patterns and potential security threats
- **Centralized Error Handling**: Consistent error responses and logging
- **Production Logging**: Advanced logging with level control and log rotation

### 📧 Contact Form
- **Email Sending**: Uses Nodemailer with customizable email providers
- **HTML & Text Emails**: Beautiful HTML emails with text fallbacks
- **Comprehensive Validation**: Validates name length, message length, and email format
- **Error Handling**: Detailed error messages for better user experience

### 📄 File Serving
- **Resume Download**: Smart PDF serving that adapts to view or download based on referer
- **In-Browser Viewing**: View PDFs directly in the browser without downloading
- **Forced Download**: Automatic download when accessed from download-related pages
- **Static Assets**: Securely serves files from the assets directory with path validation
- **Supported Formats**: PDF, JPG, PNG, and JPEG files

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

   # Maintenance Mode
   MAINTENANCE_MODE=false
   MAINTENANCE_DURATION=30 minutes

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   RECIPIENT_EMAIL=your-email@gmail.com
   
   # Security (optional)
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Logging (optional)
   LOG_LEVEL=info
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

### Contact Form Endpoints
**POST** `/api/contact`
- Route file: `routes/contact.ts`
- Description: Handles contact form submissions and sends emails
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
- Response:
  ```json
  {
    "success": true,
    "message": "Email sent successfully! Thank you for your message."
  }
  ```

### Email Validation Endpoints
**POST** `/api/email/validate`
- Route file: `routes/email.ts`
- Description: Tests email validation without sending
- Body:
  ```json
  {
    "email": "test@example.com"
  }
  ```
- Response:
  ```json
  {
    "valid": true,
    "message": "Email is valid"
  }
  ```

**POST** `/api/email/suggestion`
- Route file: `routes/email.ts`
- Description: Checks for typos in email domains and provides suggestions
- Body:
  ```json
  {
    "email": "test@gmial.com"
  }
  ```
- Response:
  ```json
  {
    "suggestion": "test@gmail.com",
    "message": "Did you mean test@gmail.com?"
  }
  ```

### Download Endpoints
**GET** `/api/download/resume`
- Route file: `routes/download.ts`
- Description: Smart endpoint that handles both viewing and downloading the resume PDF
- Behavior:
  - When accessed from a URL containing "/download": Forces download with Content-Disposition header
  - When accessed normally: Allows viewing in browser
- File should be placed in `assets/resume.pdf`
- Response: PDF file for viewing or downloading

**GET** `/api/download/view/resume`
- Route file: `routes/download.ts`
- Description: Redirects to the main resume endpoint (for backward compatibility)
- Response: Redirects to `/api/download/resume`

**GET** `/api/download/asset/:filename`
- Route file: `routes/download.ts`
- Description: Generic endpoint for serving files from the assets directory
- Security:
  - Path validation to prevent directory traversal
  - Filename validation to only allow alphanumeric filenames with approved extensions
- Supported file types: .pdf, .jpg, .jpeg, .png
- Example: `/api/download/asset/profile-photo.jpg`
- Response: Requested file with appropriate content type

### Health and Test Endpoints
**GET** `/api/health`
- Route file: `routes/index.ts`
- Description: Returns server status and version
- Response:
  ```json
  {
    "status": "running",
    "version": "1.0.0"
  }
  ```

**GET** `/api/test`
- Route file: `routes/index.ts`
- Description: Test endpoint to verify API is working
- Response:
  ```json
  {
    "message": "API is working correctly",
    "timestamp": "2025-09-08T12:34:56.789Z"
  }
  ```

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
├── server.ts                # Main server file
├── config/
│   ├── emailConfig.ts       # Email service configuration
│   └── rateLimiter.ts       # Rate limiting configuration
├── routes/
│   ├── index.ts             # Main router
│   ├── contact.ts           # Contact form endpoints
│   ├── email.ts             # Email validation endpoints
│   └── download.ts          # File download endpoints
├── types/
│   └── index.ts             # TypeScript type definitions
├── utils/
│   ├── emailValidator.ts    # Email validation logic
│   └── sanitizer.ts         # Input sanitization
└── middleware/              # Custom middleware

assets/
└── resume.pdf               # Your resume file

.env                         # Environment variables
.env.example                 # Environment template
package.json                 # Dependencies and scripts
tsconfig.json                # TypeScript configuration
```

## Security Considerations

1. **Keep your `.env` file secure** - never commit it to version control
2. **Use strong app passwords** for email authentication
3. **Regularly update dependencies** to patch security vulnerabilities
4. **Monitor rate limiting logs** for potential abuse
5. **Consider additional CAPTCHA** for production environments
6. **Path traversal protection** - prevents accessing files outside of designated directories
7. **Filename validation** - restricts file access to specific formats and safe characters

## Error Handling

The server provides detailed error messages for:
- Missing required fields
- Invalid email formats
- Disposable email addresses
- Rate limit exceeded
- Server errors
- File not found errors
- Path security violations
- Invalid filename formats

## Customization

### Adding More Disposable Domains
Edit the disposable domain list in `src/utils/emailValidator.ts`

### Adjusting Rate Limits
Modify the rate limiting configuration in `src/config/rateLimiter.ts`:
- `contactLimiter` (contact form specific)
- `globalLimiter` (server-wide)

### Custom Email Templates
Update the email templates in `src/config/emailConfig.ts`

### Adding Supported File Types
To add more supported file types for the asset endpoint, modify the regex pattern in `src/routes/download.ts`:
```typescript
// Current pattern: only allows pdf, jpg, png, jpeg
if (!/^[a-zA-Z0-9_-]+\.(pdf|jpg|png|jpeg)$/.test(filename)) {
  // ...
}
```

## Frontend Integration

### Using the Download Endpoints

#### Resume Viewing & Download

There are two ways to use the resume endpoint in your frontend:

1. **View Resume in Browser:**
```html
<!-- Link to view resume in browser -->
<a href="/api/download/resume" target="_blank">View Resume</a>
```

2. **Force Download:**
```html
<!-- Method 1: Using download attribute -->
<a href="/api/download/resume" download>Download Resume</a>

<!-- Method 2: Link from a page with "download" in the URL -->
<!-- When accessed from http://example.com/download -->
<a href="/api/download/resume">Download Resume</a>
```

#### Using the Asset Endpoint

For other files in your assets directory:

```html
<!-- Display an image -->
<img src="/api/download/asset/profile-photo.jpg" alt="Profile Photo">

<!-- Link to a PDF document -->
<a href="/api/download/asset/whitepaper.pdf">View Whitepaper</a>
```

### Implementation Tips

1. **Loading States:**
```javascript
const DownloadButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDownload = () => {
    setIsLoading(true);
    // Reset loading state after a delay
    setTimeout(() => setIsLoading(false), 2000);
    window.location.href = '/api/download/resume';
  };
  
  return (
    <button onClick={handleDownload} disabled={isLoading}>
      {isLoading ? 'Downloading...' : 'Download Resume'}
    </button>
  );
};
```

2. **Error Handling:**
```javascript
// Check if file exists before displaying download button
fetch('/api/download/resume', { method: 'HEAD' })
  .then(response => {
    if (!response.ok) {
      console.error('Resume file not available');
      // Handle missing file
    }
  });
```

## Production Deployment

For detailed production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up proper logging
4. Configure reverse proxy (nginx)
5. Use HTTPS in production
6. Consider using a dedicated email service (SendGrid, AWS SES)
7. Enable maintenance mode during updates

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
- Check that file extensions match supported types (.pdf, .jpg, .jpeg, .png)
- Make sure filenames only use alphanumeric characters, hyphens, and underscores

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
- **jest**: Testing framework

## Documentation
- **API Documentation**: See above for endpoint details
- **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Testing Documentation**: See [TESTING.md](TESTING.md)
- **Refactoring Summary**: See [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)

## License

This project is open source and available under the [MIT License](LICENSE).
