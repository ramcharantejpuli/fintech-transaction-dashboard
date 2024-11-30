import React, { useEffect, useState } from 'react';
import SpendingChart from '../Charts/SpendingChart';
import { Transaction } from '../../types';
import { getTransactions } from '../../services/api';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await getTransactions();
        setTransactions(data);
        setError(null);
      } catch (err) {
        setError('Failed to load transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalBalance = transactions.reduce((sum, t) => 
    sum + (t.type === 'expense' ? -t.amount : t.amount), 0);

  const monthlySpending = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsGoal = 1000; // Example monthly savings goal
  const savingsProgress = Math.min(100, ((savingsGoal - monthlySpending) / savingsGoal) * 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Financial Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Total Balance</h2>
          <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalBalance)}
          </p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Monthly Spending</h2>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlySpending)}</p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">Savings Goal Progress</h2>
          <p className="text-2xl font-bold text-purple-600">{savingsProgress.toFixed(1)}%</p>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
            <div 
              className="h-2 rounded-full bg-purple-600" 
              style={{ width: `${savingsProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Spending by Category</h2>
          <SpendingChart />
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Recent Transactions</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading transactions...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{transaction.category}</p>
                    <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                  <p className={`font-semibold ${
                    transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;