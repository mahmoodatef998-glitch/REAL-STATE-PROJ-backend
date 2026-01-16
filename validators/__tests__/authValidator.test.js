/**
 * Auth Validator Tests
 * Tests for validation functions
 */

const { validationResult } = require('express-validator');
const { validateRegister, validateLogin } = require('../authValidator');

// Helper function to test validation
const testValidation = async (validators, data) => {
  const req = {
    body: data
  };
  const res = {};
  let validationErrors = [];

  // Run all validators
  for (const validator of validators) {
    await validator(req, res, () => {});
  }

  // Check validation result
  const errors = validationResult(req);
  return errors;
};

describe('Auth Validator - Register', () => {
  it('should pass with valid register data', async () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'client'
    };

    const errors = await testValidation(validateRegister, validData);
    expect(errors.isEmpty()).toBe(true);
  });

  it('should fail with missing name', async () => {
    const invalidData = {
      email: 'john@example.com',
      password: 'password123'
    };

    const errors = await testValidation(validateRegister, invalidData);
    expect(errors.isEmpty()).toBe(false);
    const nameErrors = errors.array().filter(e => e.path === 'name');
    expect(nameErrors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid email', async () => {
    const invalidData = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123'
    };

    const errors = await testValidation(validateRegister, invalidData);
    expect(errors.isEmpty()).toBe(false);
    const emailErrors = errors.array().filter(e => e.path === 'email');
    expect(emailErrors.length).toBeGreaterThan(0);
  });

  it('should fail with short password', async () => {
    const invalidData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: '123' // Too short
    };

    const errors = await testValidation(validateRegister, invalidData);
    expect(errors.isEmpty()).toBe(false);
    const passwordErrors = errors.array().filter(e => e.path === 'password');
    expect(passwordErrors.length).toBeGreaterThan(0);
  });
});

describe('Auth Validator - Login', () => {
  it('should pass with valid login data', async () => {
    const validData = {
      email: 'admin@alrabie.ae',
      password: 'admin123'
    };

    const errors = await testValidation(validateLogin, validData);
    expect(errors.isEmpty()).toBe(true);
  });

  it('should fail with missing email', async () => {
    const invalidData = {
      password: 'admin123'
    };

    const errors = await testValidation(validateLogin, invalidData);
    expect(errors.isEmpty()).toBe(false);
    const emailErrors = errors.array().filter(e => e.path === 'email');
    expect(emailErrors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid email format', async () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'admin123'
    };

    const errors = await testValidation(validateLogin, invalidData);
    expect(errors.isEmpty()).toBe(false);
    const emailErrors = errors.array().filter(e => e.path === 'email');
    expect(emailErrors.length).toBeGreaterThan(0);
  });

  it('should fail with missing password', async () => {
    const invalidData = {
      email: 'admin@alrabie.ae'
    };

    const errors = await testValidation(validateLogin, invalidData);
    expect(errors.isEmpty()).toBe(false);
    const passwordErrors = errors.array().filter(e => e.path === 'password');
    expect(passwordErrors.length).toBeGreaterThan(0);
  });
});
