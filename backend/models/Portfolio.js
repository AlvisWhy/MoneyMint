// models/Portfolio.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Portfolio',
  tableName: 'portfolios',
  columns: {
    portfolio_id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
      onDelete: 'CASCADE',
      eager: true,
    },
    holdings: {
      type: 'one-to-many',
      target: 'Holding',
      inverseSide: 'portfolio',
    },
  },
});