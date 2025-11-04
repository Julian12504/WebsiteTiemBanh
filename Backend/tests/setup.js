// Setup file for Jest
// This file runs before all tests

// Set test timeout
if (typeof jest !== 'undefined') {
  jest.setTimeout(10000);
}

// Mock environment variables if needed
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.NODE_ENV = 'test';
