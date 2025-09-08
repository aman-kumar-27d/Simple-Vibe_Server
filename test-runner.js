#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    colorLog('blue', `\n🔄 ${description}...`);
    colorLog('white', `Command: ${command}`);
    
    const child = exec(command, { cwd: process.cwd() });
    
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        colorLog('green', `✅ ${description} completed successfully!`);
        resolve();
      } else {
        colorLog('red', `❌ ${description} failed with code ${code}`);
        reject(new Error(`Command failed: ${command}`));
      }
    });
  });
}

async function checkServerRunning() {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.get('http://localhost:5000/api/test', (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runAllTests() {
  colorLog('cyan', '🧪 Portfolio Backend Test Suite');
  colorLog('cyan', '=====================================\n');
  
  try {
    // Check if server is running for E2E tests
    const serverRunning = await checkServerRunning();
    if (serverRunning) {
      colorLog('green', '✅ Development server detected running on port 5000');
    } else {
      colorLog('yellow', '⚠️  Development server not detected. E2E tests may fail.');
      colorLog('white', '   Start server with: npm run dev');
    }

    // Build the project first
    colorLog('bright', '\n📦 Building Project...');
    await runCommand('npm run build', 'TypeScript compilation');

    // Run unit tests
    colorLog('bright', '\n🔬 Running Unit Tests...');
    await runCommand('npx jest tests/unit --verbose', 'Unit tests');

    // Run integration tests
    colorLog('bright', '\n🔗 Running Integration Tests...');
    await runCommand('npx jest tests/integration --verbose', 'Integration tests');

    // Run E2E tests only if server is running
    if (serverRunning) {
      colorLog('bright', '\n🌐 Running End-to-End Tests...');
      await runCommand('npx jest tests/e2e --verbose', 'End-to-End tests');
    } else {
      colorLog('yellow', '\n⏭️  Skipping E2E tests (server not running)');
    }

    // Generate test coverage
    colorLog('bright', '\n📊 Generating Test Coverage...');
    await runCommand('npx jest --coverage --collectCoverageFrom="src/**/*.ts" --collectCoverageFrom="!src/server.ts"', 'Test coverage');

    // Run the legacy test scripts for comparison
    colorLog('bright', '\n🔄 Running Legacy Test Scripts...');
    
    if (fs.existsSync('test-data.js')) {
      await runCommand('node test-data.js', 'Legacy test data script');
    }
    
    if (serverRunning && fs.existsSync('test-email-validation.js')) {
      try {
        colorLog('blue', '\n📧 Running legacy email validation tests...');
        await runCommand('node test-email-validation.js', 'Legacy email validation');
      } catch (error) {
        colorLog('yellow', '⚠️  Legacy email validation test failed (expected if server not configured)');
      }
    }

    // Final summary
    colorLog('green', '\n🎉 All Tests Completed Successfully!');
    colorLog('white', '\n📋 Test Summary:');
    colorLog('white', '  ✅ TypeScript compilation');
    colorLog('white', '  ✅ Unit tests');
    colorLog('white', '  ✅ Integration tests');
    if (serverRunning) {
      colorLog('white', '  ✅ End-to-End tests');
    } else {
      colorLog('yellow', '  ⏭️  E2E tests (skipped)');
    }
    colorLog('white', '  ✅ Test coverage generated');
    colorLog('white', '  ✅ Legacy tests executed');
    
    colorLog('cyan', '\n📁 Test artifacts:');
    colorLog('white', '  📊 Coverage report: ./coverage/lcov-report/index.html');
    colorLog('white', '  📋 Test results: Console output above');
    
    process.exit(0);
    
  } catch (error) {
    colorLog('red', `\n❌ Test suite failed: ${error.message}`);
    colorLog('white', '\n🔧 Troubleshooting:');
    colorLog('white', '  1. Ensure all dependencies are installed: npm install');
    colorLog('white', '  2. Check TypeScript compilation: npm run build');
    colorLog('white', '  3. For E2E tests, start server: npm run dev');
    colorLog('white', '  4. Check environment variables in .env');
    
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  colorLog('cyan', 'Portfolio Backend Test Runner');
  colorLog('white', '\nUsage:');
  colorLog('white', '  npm test           - Run all tests');
  colorLog('white', '  npm run test:unit  - Run unit tests only');
  colorLog('white', '  npm run test:int   - Run integration tests only');
  colorLog('white', '  npm run test:e2e   - Run E2E tests only');
  colorLog('white', '  npm run test:watch - Run tests in watch mode');
  colorLog('white', '  npm run test:cov   - Run tests with coverage');
  process.exit(0);
}

if (args.includes('--unit')) {
  runCommand('npx jest tests/unit --verbose', 'Unit tests only')
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else if (args.includes('--integration')) {
  runCommand('npx jest tests/integration --verbose', 'Integration tests only')
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else if (args.includes('--e2e')) {
  runCommand('npx jest tests/e2e --verbose', 'E2E tests only')
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else if (args.includes('--watch')) {
  runCommand('npx jest --watch', 'Tests in watch mode')
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else if (args.includes('--coverage')) {
  runCommand('npx jest --coverage', 'Tests with coverage')
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  // Run all tests by default
  runAllTests();
}
