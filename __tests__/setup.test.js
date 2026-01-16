/**
 * Setup Test - Basic test to verify Jest is working
 */

describe('Jest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should have test environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBeDefined();
  });
});

