const axios = require('axios');

const transactions = [
  {
    amount: 3000,
    category: 'Salary',
    description: 'Monthly Salary',
    type: 'income',
    date: Date.now()
  },
  {
    amount: 150,
    category: 'Utilities',
    description: 'Electricity Bill',
    type: 'expense',
    date: Date.now() - 86400000 // yesterday
  },
  {
    amount: 75,
    category: 'Groceries',
    description: 'Weekly Groceries',
    type: 'expense',
    date: Date.now() - 172800000 // 2 days ago
  },
  {
    amount: 1000,
    category: 'Bonus',
    description: 'Performance Bonus',
    type: 'income',
    date: Date.now() - 259200000 // 3 days ago
  },
  {
    amount: 200,
    category: 'Entertainment',
    description: 'Movie and Dinner',
    type: 'expense',
    date: Date.now() - 345600000 // 4 days ago
  }
];

async function addTransactions() {
  for (const transaction of transactions) {
    try {
      const response = await axios.post('http://localhost:3001/api/transactions', transaction);
      console.log(`Added transaction: ${transaction.description}`);
    } catch (error) {
      console.error(`Error adding transaction ${transaction.description}:`, error.message);
    }
  }
}

addTransactions();
