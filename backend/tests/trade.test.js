const request = require('supertest');
const app = require('../app');

describe('Trade Controller', () => {
  let user_id, portfolio_id;

  beforeAll(async () => {
    const login = await request(app).post('/auth/login').send({ username: 'testuser', password: '123456' });
    user_id = login.body.user.id;

    const portfolio = await request(app).post('/portfolio').send({
      user_id,
      name: 'Trade Portfolio',
      symbol: 'AAPL',
      quantity: 2,
      price: 100
    });
    portfolio_id = portfolio.body.portfolio.id;
  });

  it('should buy stock', async () => {
    const res = await request(app).post('/trade/buy').send({
      portfolio_id,
      symbol: 'AAPL',
      quantity: 1,
      price: 100
    });
    expect(res.statusCode).toBe(200);
  });

  it('should sell stock', async () => {
    const res = await request(app).post('/trade/sell').send({
      portfolio_id,
      symbol: 'AAPL',
      quantity: 1
    });
    expect(res.statusCode).toBe(200);
  });

  it('should charge balance', async () => {
    const res = await request(app).post('/trade/charge').send({
      user_id,
      amount: 1000
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('new_balance');
  });
});
