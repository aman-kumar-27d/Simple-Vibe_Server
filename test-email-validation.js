// Test script for email validation
// Run this with: node test-email-validation.js

const testEmails = [
  // Valid emails
  'john.doe@gmail.com',
  'user@company.co.uk',
  'test+tag@example.org',
  
  // Invalid format
  'invalid-email',
  'user@',
  '@domain.com',
  'user..name@domain.com',
  
  // Disposable emails (should be blocked)
  'test@10minutemail.com',
  'user@mailinator.com',
  'temp@guerrillamail.com',
  
  // Common typos (should suggest corrections)
  'user@gmial.com',
  'test@yahooo.com',
  'contact@hotmial.com',
  'info@outlok.com',
  
  // Edge cases
  'a'.repeat(250) + '@domain.com', // Too long
  'test@domain-with-very-long-name-that-might-cause-issues.com'
];

async function testEmailValidation() {
  const serverUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing Email Validation API\\n');
  console.log('=' .repeat(60));
  
  for (const email of testEmails) {
    try {
      const response = await fetch(`${serverUrl}/api/validate-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      console.log(`\\n📧 Email: ${email}`);
      console.log(`✅ Valid: ${result.isValid ? '✓' : '✗'}`);
      console.log(`💬 Message: ${result.message}`);
      if (result.normalizedEmail && result.normalizedEmail !== email) {
        console.log(`🔄 Normalized: ${result.normalizedEmail}`);
      }
      
    } catch (error) {
      console.log(`\\n❌ Error testing ${email}:`, error.message);
    }
  }
  
  console.log('\\n' + '=' .repeat(60));
  console.log('🎉 Email validation testing completed!');
}

// Test contact form with rate limiting
async function testContactForm() {
  const serverUrl = 'http://localhost:5000';
  
  console.log('\\n\\n📬 Testing Contact Form (Rate Limiting)\\n');
  console.log('=' .repeat(60));
  
  const testSubmissions = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      message: 'This is a test message to check if the contact form works properly.'
    },
    {
      firstName: 'Jane',
      email: 'jane@mailinator.com', // Disposable email
      message: 'This should be blocked due to disposable email.'
    },
    {
      firstName: 'Bob',
      email: 'bob@gmial.com', // Typo
      message: 'This should suggest email correction.'
    },
    {
      firstName: 'A', // Too short name
      email: 'short@name.com',
      message: 'Name too short test.'
    }
  ];
  
  for (let i = 0; i < testSubmissions.length; i++) {
    const submission = testSubmissions[i];
    
    try {
      console.log(`\\n📝 Test ${i + 1}: ${submission.firstName} - ${submission.email}`);
      
      const response = await fetch(`${serverUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission)
      });
      
      const result = await response.json();
      
      console.log(`📊 Status: ${response.status}`);
      console.log(`💬 Response: ${result.message || result.error}`);
      
      if (result.success) {
        console.log('✅ Email sent successfully!');
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
      
    } catch (error) {
      console.log(`❌ Network error:`, error.message);
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ or install node-fetch');
  console.log('💡 You can test the endpoints manually using a tool like Postman or curl');
  console.log('\\n📍 Test endpoints:');
  console.log('POST http://localhost:5000/api/validate-email');
  console.log('POST http://localhost:5000/api/contact');
  console.log('GET  http://localhost:5000/api/test');
} else {
  // Run tests
  testEmailValidation()
    .then(() => testContactForm())
    .catch(console.error);
}
