const request = require('supertest');
const app = require('../app');
const knex = require('../config/database');

beforeAll(async () => {
  await knex.migrate.latest();
  await knex.seed.run();
});

afterAll(async () => {
  await knex.destroy();
});

describe('Transaction API Endpoints', () => {
  describe('GET /api/transactions', () => {
    it('should return all transactions', async () => {
      const res = await request(app).get('/api/transactions');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('GET /api/transactions/by-category', () => {
    it('should return spending by category', async () => {
      const res = await request(app).get('/api/transactions/by-category');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty('category');
      expect(res.body[0]).toHaveProperty('amount');
      expect(res.body[0]).toHaveProperty('transactionCount');
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const newTransaction = {
        amount: 100,
        category: 'Shopping',
        type: 'expense',
        description: 'Test transaction'
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(newTransaction);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.amount).toBe(newTransaction.amount);
    });

    it('should prevent duplicate transactions with idempotency key', async () => {
      const newTransaction = {
        amount: 100,
        category: 'Shopping',
        type: 'expense',
        description: 'Test transaction'
      };

      const idempotencyKey = 'test-key-123';

      // First request
      const res1 = await request(app)
        .post('/api/transactions')
        .set('idempotency-key', idempotencyKey)
        .send(newTransaction);

      // Second request with same idempotency key
      const res2 = await request(app)
        .post('/api/transactions')
        .set('idempotency-key', idempotencyKey)
        .send(newTransaction);

      expect(res1.body.id).toBe(res2.body.id);
    });

    it('should validate input data', async () => {
      const invalidTransaction = {
        amount: -100, // Invalid negative amount
        category: 'Shopping',
        type: 'invalid_type', // Invalid type
        description: 'Test transaction'
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(invalidTransaction);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/transactions/refund/:transactionId', () => {
    it('should process a refund for valid transaction', async () => {
      // First create a transaction to refund
      const transaction = await request(app)
        .post('/api/transactions')
        .send({
          amount: 100,
          category: 'Shopping',
          type: 'expense',
          description: 'Refundable transaction'
        });

      const refundRes = await request(app)
        .post(`/api/transactions/refund/${transaction.body.id}`);

      expect(refundRes.statusCode).toBe(200);
      expect(refundRes.body.type).toBe('refund');
      expect(refundRes.body.amount).toBe(100);
    });

    it('should prevent refunding already refunded transactions', async () => {
      // First create a transaction
      const transaction = await request(app)
        .post('/api/transactions')
        .send({
          amount: 100,
          category: 'Shopping',
          type: 'expense',
          description: 'Refundable transaction'
        });

      // First refund
      await request(app).post(`/api/transactions/refund/${transaction.body.id}`);

      // Second refund attempt
      const secondRefundRes = await request(app)
        .post(`/api/transactions/refund/${transaction.body.id}`);

      expect(secondRefundRes.statusCode).toBe(400);
      expect(secondRefundRes.body.error).toBe('Transaction already refunded');
    });
  });
});
