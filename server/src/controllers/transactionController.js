const Transaction = require("../models/Transaction");
const { validationResult } = require("express-validator");
const db = require("../config/database");
const { v4: uuidv4 } = require('uuid');

// Cache for idempotency keys
const processedRequests = new Map();

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await db('transactions')
      .select('*')
      .orderBy('date', 'desc');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Get spending by category
exports.getSpendingByCategory = async (req, res) => {
  try {
    const spending = await db('transactions')
      .select('category')
      .sum('amount as amount')
      .count('* as transactionCount')
      .where('type', 'expense')
      .groupBy('category');
    res.json(spending);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spending by category' });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];

  // Check idempotency key cache
  if (idempotencyKey && processedRequests.has(idempotencyKey)) {
    return res.status(200).json(processedRequests.get(idempotencyKey));
  }

  try {
    const { amount, category, type, description } = req.body;

    // Validate required fields
    if (!amount || !category || !type || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Validate type
    if (!['income', 'expense', 'refund'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    const transaction = {
      id: uuidv4(),
      amount,
      category,
      type,
      description,
      date: Date.now(),
      status: 'completed'
    };

    await db('transactions').insert(transaction);

    // Store in idempotency cache if key provided
    if (idempotencyKey) {
      processedRequests.set(idempotencyKey, transaction);
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Process a refund
exports.processRefund = async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Find the original transaction
    const transaction = await db('transactions')
      .where('id', transactionId)
      .first();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status === 'refunded') {
      return res.status(400).json({ error: 'Transaction already refunded' });
    }

    if (transaction.type !== 'expense') {
      return res.status(400).json({ error: 'Can only refund expense transactions' });
    }

    // Create refund transaction
    const refundTransaction = {
      id: uuidv4(),
      amount: transaction.amount,
      category: transaction.category,
      type: 'refund',
      description: `Refund for transaction ${transactionId}`,
      date: Date.now(),
      status: 'completed'
    };

    // Update original transaction status
    await db('transactions')
      .where('id', transactionId)
      .update({ status: 'refunded' });

    // Insert refund transaction
    await db('transactions').insert(refundTransaction);

    res.json(refundTransaction);
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
};
