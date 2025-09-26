// Jest setup file
import 'reflect-metadata';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'mongodb://localhost:27017/test-db';

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set timezone for consistent date testing
process.env.TZ = 'UTC';
