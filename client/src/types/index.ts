export interface Transaction {
  id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense' | 'refund';
  status?: 'completed' | 'refunded';
  date: string;
  description: string;
}

export interface SpendingByCategory {
  category: string;
  amount: number;
  transactionCount: number;
}
