const Transaction = require("../models/Transaction");
const { validationResult } = require("express-validator");
const knex = require("../config/database");

// Cache for idempotency
const processedTransactions = new Map();

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await knex("transactions")
      .select("*")
      .orderBy("date", "desc")
      .limit(50);

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

exports.getSpendingByCategory = async (req, res, next) => {
  try {
    const result = await knex("transactions")
      .select("category")
      .sum("amount as amount")
      .count("* as transactionCount")
      .where("type", "expense")
      .groupBy("category");

    res.json(result);
  } catch (error) {
    console.error("Error fetching spending by category:", error);
    res.status(500).json({ error: "Failed to fetch spending data" });
  }
};

exports.createTransaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, category, type, description } = req.body;
  const idempotencyKey = req.headers["idempotency-key"];

  if (idempotencyKey && processedTransactions.has(idempotencyKey)) {
    return res.json(processedTransactions.get(idempotencyKey));
  }

  const trx = await knex.transaction();

  try {
    // Validate category exists
    const categoryExists = await trx("categories")
      .where("name", category)
      .first();

    if (!categoryExists) {
      await trx.rollback();
      return res.status(400).json({ error: "Invalid category" });
    }

    const [transaction] = await trx("transactions")
      .insert({
        amount,
        category,
        type,
        description,
        date: new Date(),
      })
      .returning("*");

    await trx.commit();

    if (idempotencyKey) {
      processedTransactions.set(idempotencyKey, transaction);
      // Clear the cache after 24 hours
      setTimeout(() => {
        processedTransactions.delete(idempotencyKey);
      }, 24 * 60 * 60 * 1000);
    }

    res.status(201).json(transaction);
  } catch (error) {
    await trx.rollback();
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

exports.processRefund = async (req, res, next) => {
  const { transactionId } = req.params;
  const idempotencyKey = req.headers["idempotency-key"];

  if (idempotencyKey && processedTransactions.has(idempotencyKey)) {
    return res.json(processedTransactions.get(idempotencyKey));
  }

  const trx = await knex.transaction();

  try {
    // Find the original transaction
    const originalTransaction = await trx("transactions")
      .where("id", transactionId)
      .first();

    if (!originalTransaction) {
      await trx.rollback();
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (originalTransaction.type !== "expense") {
      await trx.rollback();
      return res.status(400).json({ error: "Can only refund expense transactions" });
    }

    if (originalTransaction.status === "refunded") {
      await trx.rollback();
      return res.status(400).json({ error: "Transaction already refunded" });
    }

    // Create refund transaction
    const [refundTransaction] = await trx("transactions")
      .insert({
        amount: originalTransaction.amount,
        category: originalTransaction.category,
        type: "refund",
        description: `Refund for transaction ${transactionId}`,
        date: new Date(),
      })
      .returning("*");

    // Update original transaction status
    await trx("transactions")
      .where("id", transactionId)
      .update({ status: "refunded" });

    await trx.commit();

    if (idempotencyKey) {
      processedTransactions.set(idempotencyKey, refundTransaction);
      setTimeout(() => {
        processedTransactions.delete(idempotencyKey);
      }, 24 * 60 * 60 * 1000);
    }

    res.json(refundTransaction);
  } catch (error) {
    await trx.rollback();
    console.error("Error processing refund:", error);
    res.status(500).json({ error: "Failed to process refund" });
  }
};
