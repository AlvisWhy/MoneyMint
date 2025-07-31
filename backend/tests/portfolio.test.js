const request = require('supertest');
const app = require('../app');

describe('Portfolio Controller', () => {
  let user_id;
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/auth/login').send({ username: 'testuser', password: '123456' });
    token = res.body.token;
    user_id = res.body.user.id;
  });

  it('should create a portfolio and purchase stock', async () => {
    const res = await request(app)
      .post('/portfolio')
      .send({
        user_id,
        name: 'Test Portfolio',
        symbol: 'AAPL',
        quantity: 1,
        price: 100
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.portfolio).toHaveProperty('id');
  });

  it('should fetch user portfolios', async () => {
    const res = await request(app).get(`/portfolio/user/${user_id}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
