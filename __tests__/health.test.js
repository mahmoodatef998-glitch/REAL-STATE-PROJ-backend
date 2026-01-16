const request = require('supertest');
const app = require('../server');

describe('Health endpoint', () => {
  it('returns OK with status and message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('message');
  });
});
