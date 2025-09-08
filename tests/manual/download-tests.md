# Manual Test Cases for Download Routes

## Prerequisites
- Ensure the server is running (`npm run dev` or `npm start`)
- Ensure the resume PDF file exists at `assets/resume.pdf`
- Have a browser and Postman (or similar API testing tool) ready

## Test Case 1: View Resume in Browser
**Description**: Test viewing the resume in a browser
**Steps**:
1. Open a browser
2. Navigate to http://localhost:5000/api/download/resume
3. Do not use any links that include "download" in the path

**Expected Result**:
- The PDF should open and display in the browser
- No download dialog should appear

## Test Case 2: Download Resume
**Description**: Test downloading the resume file
**Steps**:
1. Open a browser
2. Create a link: `<a href="http://localhost:5000/api/download/resume">Download</a>`
3. Set up this link on a page with a URL that includes "/download" (e.g., http://localhost:3000/download)
4. Click the link

**Expected Result**:
- A download dialog should appear
- The file should download as "resume.pdf"

## Test Case 3: Asset Endpoint - Valid File
**Description**: Test retrieving a valid file via the asset endpoint
**Steps**:
1. Place a test image (e.g., test.jpg) in the assets folder
2. Open a browser
3. Navigate to http://localhost:5000/api/download/asset/test.jpg

**Expected Result**:
- The image should display in the browser
- The correct Content-Type header should be set

## Test Case 4: Asset Endpoint - Invalid Filename
**Description**: Test requesting a file with an invalid filename
**Steps**:
1. Open Postman
2. Send a GET request to http://localhost:5000/api/download/asset/invalid!@#.exe

**Expected Result**:
- Should return a 400 Bad Request status
- Response should contain an error message about invalid filename format

## Test Case 5: Asset Endpoint - Non-existent File
**Description**: Test requesting a valid filename that doesn't exist
**Steps**:
1. Open Postman
2. Send a GET request to http://localhost:5000/api/download/asset/nonexistent.pdf

**Expected Result**:
- Should return a 404 Not Found status
- Response should contain an error message about file not found

## Test Case 6: Security - Path Traversal Attempt
**Description**: Test that path traversal is prevented
**Steps**:
1. Open Postman
2. Send a GET request to http://localhost:5000/api/download/asset/../../../etc/passwd

**Expected Result**:
- Should return a 400 Bad Request status (invalid filename)
- Should not expose any system files

## Test Case 7: Redirect from /view/resume
**Description**: Test that the /view/resume endpoint redirects correctly
**Steps**:
1. Open a browser
2. Navigate to http://localhost:5000/api/download/view/resume

**Expected Result**:
- Should redirect to http://localhost:5000/api/download/resume
- The PDF should display in the browser

## Test Case 8: Error Handling - Server Error
**Description**: Test error handling when file operations fail
**Steps**:
1. Create a test that mocks a file system error during sendFile
2. Observe how the API responds

**Expected Result**:
- Should return a 500 Internal Server Error status
- Response should contain an appropriate error message
