const request = require('supertest');
const app = require('../app');

describe('Pie Chart Controller', () => {
  let user_id;

  beforeAll(async () => {
    // 登录并创建测试用户组合
    const res = await request(app).post('/auth/login').send({ username: 'testuser', password: '123456' });
    user_id = res.body.user.id;

    // 创建一个投资组合（若已存在可以跳过）
    await request(app).post('/portfolio').send({
      user_id,
      name: 'PieChart Portfolio',
      symbol: 'AAPL',
      quantity: 2,
      price: 100
    });
  });

  it('should return portfolio pie chart data', async () => {
    const res = await request(app).get(`/piechart/${user_id}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('symbol');
      expect(res.body[0]).toHaveProperty('market_value');
    }
  });

  it('should return empty array for user without holdings', async () => {
    const userRes = await request(app).post('/auth/register').send({
      username: 'noholduser',
      password: 'abc123'
    });
    const newUserId = userRes.body.user.id;

    const res = await request(app).get(`/piechart/${newUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
