const request = require('supertest');
const app = require('../app');

describe('Auth Controller', () => {
  const testUser = { username: 'testuser', password: '123456' };

  it('should register a new user', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty('id');
  });

  it('should not register an existing user', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.statusCode).toBe(400);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/auth/login').send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/auth/login').send({ ...testUser, password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });
});

