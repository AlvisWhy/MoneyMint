const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'metro.proxy.rlwy.net',
  port: 13199,
  username: 'root',
  password: 'hulNXjlFZEtDwUStgVHPTkfnRjYnLoEF',
  database: 'railway',
  synchronize: true,
  logging: true,
  entities: [
    require('./models/User'),
    require('./models/Transaction'),
    require('./models/Holding'),
    require('./models/Portfolio'), // 注意和文件名保持一致
  ],
});

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Data Source has been initialized and connected to DB!');
  })
  .catch((err) => {
    console.error('❌ Failed to initialize Data Source:', err);
  });

module.exports = AppDataSource;

