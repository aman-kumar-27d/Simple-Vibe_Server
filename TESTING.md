# Testing Guide - Portfolio Backend Server

## Overview
Comprehensive testing suite for the Portfolio Backend Server with unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── setup.ts              # Test configuration and environment setup
├── unit/                  # Unit tests for individual functions
│   ├── emailValidator.test.ts    # Email validation logic tests
│   └── sanitizer.test.ts         # Input sanitization tests
├── integration/           # Integration tests for route handlers
│   ├── email.test.ts             # Email route testing
│   ├── contact.test.ts           # Contact form route testing
│   └── download.test.ts          # Download route testing
└── e2e/                   # End-to-end tests
    └── api.test.ts               # Full API workflow tests
```

## Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test Types
```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # End-to-end tests only
npm run test:coverage      # Tests with coverage report
npm run test:watch         # Tests in watch mode
```

## Test Categories

### 🔬 Unit Tests
Test individual functions and utilities in isolation.

**Email Validator Tests:**
- ✅ Valid email formats
- ❌ Invalid email formats
- 🚫 Disposable email detection
- 🔧 Domain typo suggestions
- 📏 Email length validation

**Sanitizer Tests:**
- 🧹 Input sanitization and escaping
- ✅ Contact form data validation
- 📏 Field length validation

**Run unit tests:**
```bash
npm run test:unit
```

### 🔗 Integration Tests
Test route handlers and middleware integration.

**Email Route Tests:**
- POST `/api/email/validate` endpoint
- Request/response validation
- Error handling

**Contact Route Tests:**
- POST `/api/contact` endpoint
- Form validation
- Rate limiting
- Email sending (mocked)

**Download Route Tests:**
- GET `/api/download/resume` endpoint
- File serving
- Error handling

**Run integration tests:**
```bash
npm run test:integration
```

### 🌐 End-to-End Tests
Test complete API workflows and server behavior.

**Full API Tests:**
- Server startup and health checks
- Complete email validation workflow
- Error handling and 404 responses
- Security headers validation

**Prerequisites for E2E tests:**
- Server must be running on port 5000
- Start with: `npm run dev`

**Run E2E tests:**
```bash
npm run test:e2e
```

## Test Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests with the centralized runner |
| `npm run test:all` | Same as `npm test` |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:e2e` | Run end-to-end tests only |
| `npm run test:watch` | Run tests in watch mode (auto-rerun on changes) |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:quick` | Quick test run (unit tests only) |
| `npm run test:legacy` | Run legacy test scripts |

## Test Configuration

### Jest Configuration (`jest.config.json`)
```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testMatch": ["**/?(*.)+(spec|test).ts"],
  "collectCoverageFrom": ["src/**/*.ts", "!src/server.ts"],
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.ts"]
}
```

### Test Environment Setup (`tests/setup.ts`)
- Sets `NODE_ENV=test`
- Configures test-specific environment variables
- Increases Jest timeout for async operations

## Test Data and Scenarios

### Email Validation Test Cases
```javascript
// Valid emails
'john.doe@gmail.com'
'user@company.co.uk'
'test+tag@example.org'

// Invalid formats
'invalid-email'
'user@'
'@domain.com'

// Disposable emails (blocked)
'test@10minutemail.com'
'user@mailinator.com'

// Common typos (suggestions)
'user@gmial.com' → suggests 'gmail.com'
'test@yahooo.com' → suggests 'yahoo.com'
```

### Contact Form Test Cases
```javascript
// Valid submission
{
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  message: 'Valid message with sufficient length.'
}

// Invalid submissions
- Missing required fields
- Name too short/long
- Message too short/long
- Invalid email format
- Disposable email address
```

## Coverage Reports

### Generate Coverage Report
```bash
npm run test:coverage
```

**Coverage files generated:**
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI tools
- Console output with coverage summary

**Coverage targets:**
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test:unit
      - run: npm run test:integration
```

## Testing Best Practices

### 🎯 Unit Tests
- Test one function at a time
- Mock external dependencies
- Use descriptive test names
- Cover edge cases and error conditions

### 🔗 Integration Tests
- Test route handlers with real middleware
- Mock external services (email, file system)
- Test request/response cycles
- Verify error handling

### 🌐 E2E Tests
- Test complete user workflows
- Use real HTTP requests
- Test cross-cutting concerns (security, logging)
- Verify system behavior under load

### 📊 Coverage Guidelines
- Aim for high test coverage but focus on quality
- Prioritize testing critical business logic
- Don't skip error handling paths
- Test both happy path and edge cases

## Debugging Tests

### Run Tests with Debug Info
```bash
npm run test:unit -- --verbose
npm run test:integration -- --detectOpenHandles
npm run test:e2e -- --runInBand
```

### Common Issues and Solutions

**Tests hanging:**
- Check for unclosed connections
- Ensure proper async/await usage
- Use `--detectOpenHandles` flag

**Import errors:**
- Verify TypeScript compilation: `npm run build`
- Check Jest configuration
- Ensure all dependencies are installed

**E2E tests failing:**
- Ensure server is running: `npm run dev`
- Check port conflicts
- Verify environment variables

## Mock Strategy

### External Services Mocked
- **Nodemailer**: Email sending functionality
- **File System**: For download tests when files don't exist
- **Rate Limiting**: Relaxed limits for testing

### Example Mock Usage
```typescript
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn(() => Promise.resolve({ messageId: 'test-id' }))
  }))
}));
```

## Test Reports

### Console Output
- ✅ Pass/fail status for each test
- 📊 Coverage summary
- ⏱️ Execution time
- 🐛 Error details for failures

### HTML Coverage Report
Open `coverage/lcov-report/index.html` in your browser for:
- File-by-file coverage breakdown
- Line-by-line coverage highlighting
- Branch coverage visualization
- Uncovered code identification

## Legacy Test Support

The test runner also executes legacy test scripts for backward compatibility:
- `test-data.js` - Test data generation
- `test-email-validation.js` - Manual email validation testing

**Run legacy tests:**
```bash
npm run test:legacy
```

## Performance Testing

### Load Testing (Future Enhancement)
Consider adding performance tests for:
- Contact form submission under load
- Rate limiting effectiveness
- Email validation performance
- File download performance

### Suggested Tools
- **Artillery**: API load testing
- **Jest Performance**: Test execution time tracking
- **Clinic.js**: Node.js performance profiling

## Contributing to Tests

### Adding New Tests
1. Choose appropriate test category (unit/integration/e2e)
2. Follow existing naming conventions
3. Add descriptive test names and comments
4. Update this documentation

### Test Naming Convention
```typescript
describe('Feature/Component Name', () => {
  describe('Specific Functionality', () => {
    test('should behave in expected way when condition', () => {
      // Test implementation
    });
  });
});
```

### Pull Request Checklist
- [ ] All tests pass locally
- [ ] New features have corresponding tests
- [ ] Test coverage meets requirements
- [ ] Documentation updated if needed

---

**Happy Testing! 🧪✅**
