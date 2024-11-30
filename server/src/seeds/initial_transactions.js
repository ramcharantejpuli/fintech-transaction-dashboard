const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  // Clear existing entries
  await knex('transactions').del();

  // Insert seed data
  await knex('transactions').insert([
    {
      id: uuidv4(),
      amount: 89.99,
      category: 'Shopping',
      description: 'Amazon Purchase',
      type: 'expense',
      status: 'completed',
      date: new Date('2024-11-25').getTime()
    },
    {
      id: uuidv4(),
      amount: 500.00,
      category: 'Freelance',
      description: 'Web Development Project',
      type: 'income',
      status: 'completed',
      date: new Date('2024-10-31').getTime()
    },
    {
      id: uuidv4(),
      amount: 1000.00,
      category: 'Investment',
      description: 'Stock Market Investment',
      type: 'income',
      status: 'completed',
      date: new Date('2024-09-27').getTime()
    },
    {
      id: uuidv4(),
      amount: 50.00,
      category: 'Healthcare',
      description: 'Pharmacy',
      type: 'expense',
      status: 'completed',
      date: new Date('2024-09-13').getTime()
    }
  ]);
};
