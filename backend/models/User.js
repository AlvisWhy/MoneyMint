const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    user_id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    username: {
      type: 'varchar',
    },
    password_hash: {
      type: 'varchar',
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    balance: {
      type: 'decimal',
      precision: 15,
      scale: 2,
      default: 100000,
    },
  },
  relations: {
    portfolios: {
      type: 'one-to-many',
      target: 'Portfolio',
      inverseSide: 'user', // Portfolio 表里的 user 字段
    },
    holdings: {
      type: 'one-to-many',
      target: 'Holding',
      inverseSide: 'user', // Holding 表里的 user 字段
    }
  }
});
