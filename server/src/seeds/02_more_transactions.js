const { v4: uuidv4 } = require('uuid');

exports.seed = function(knex) {
  return knex('transactions').insert([
    {
      id: uuidv4(),
      amount: 3000,
      category: 'Salary',
      description: 'Monthly Salary',
      type: 'income',
      status: 'completed',
      date: Date.now(),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: uuidv4(),
      amount: 150,
      category: 'Utilities',
      description: 'Electricity Bill',
      type: 'expense',
      status: 'completed',
      date: Date.now() - 86400000,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: uuidv4(),
      amount: 75,
      category: 'Groceries',
      description: 'Weekly Groceries',
      type: 'expense',
      status: 'completed',
      date: Date.now() - 172800000,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: uuidv4(),
      amount: 1000,
      category: 'Bonus',
      description: 'Performance Bonus',
      type: 'income',
      status: 'completed',
      date: Date.now() - 259200000,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: uuidv4(),
      amount: 200,
      category: 'Entertainment',
      description: 'Movie and Dinner',
      type: 'expense',
      status: 'completed',
      date: Date.now() - 345600000,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};
