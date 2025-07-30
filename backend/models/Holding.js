const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Holding',
  tableName: 'holdings',
  columns: {
    holding_id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    symbol: {
      type: 'varchar',
      length: 10,
    },
    quantity: {
      type: 'int',
    },
    avg_buy_price: {
      type: 'decimal',
      precision: 10,
      scale: 2,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
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
}
});
