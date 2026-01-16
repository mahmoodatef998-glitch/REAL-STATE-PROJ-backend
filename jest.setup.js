// Jest setup file
// This file runs before each test

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.PORT = '0'; // Use random port for tests

// Suppress console logs during tests (optional)
// Uncomment if you want to suppress logs:
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
// };

