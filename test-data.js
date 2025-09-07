// Simple test to verify email validation
const testData = {
  validEmails: [
    'john.doe@gmail.com',
    'user@company.co.uk',
    'test+tag@example.org'
  ],
  invalidEmails: [
    'invalid-email',
    'user@',
    '@domain.com'
  ],
  disposableEmails: [
    'test@10minutemail.com',
    'user@mailinator.com',
    'temp@guerrillamail.com'
  ],
  typoEmails: [
    'user@gmial.com',
    'test@yahooo.com',
    'contact@hotmial.com'
  ]
};

console.log('📧 Email Validation Test Data Created!');
console.log('\\n🔗 Test URLs:');
console.log('- GET  http://localhost:5000/api/test');
console.log('- POST http://localhost:5000/api/validate-email');
console.log('- POST http://localhost:5000/api/contact');
console.log('- GET  http://localhost:5000/api/download/resume');

console.log('\\n📝 Example POST request for email validation:');
console.log(JSON.stringify({
  method: 'POST',
  url: 'http://localhost:5000/api/validate-email',
  headers: { 'Content-Type': 'application/json' },
  body: { email: 'test@gmial.com' }
}, null, 2));

console.log('\\n📝 Example POST request for contact form:');
console.log(JSON.stringify({
  method: 'POST',
  url: 'http://localhost:5000/api/contact',
  headers: { 'Content-Type': 'application/json' },
  body: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@gmail.com',
    message: 'This is a test message to check if the contact form works properly.'
  }
}, null, 2));

console.log('\\n✅ Server is ready for testing!');
console.log('💡 Use tools like Postman, curl, or your browser to test the endpoints.');

module.exports = testData;
