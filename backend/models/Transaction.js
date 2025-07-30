const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Transaction',
  tableName: 'transactions',
  columns: {
    txn_id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    symbol: {
      type: 'varchar',
      length: 10,
    },
    txn_type: {
      type: 'enum',
      enum: ['BUY', 'SELL'],
    },
    quantity: {
      type: 'int',
    },
    price_per_unit: {
      type: 'decimal',
      precision: 10,
      scale: 2,
    },
    txn_date: {
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
  portfolio: {
    type: 'many-to-one',
    target: 'Portfolio',
    joinColumn: { name: 'portfolio_id' },
    onDelete: 'CASCADE',
    eager: true,
  },
  },
});
