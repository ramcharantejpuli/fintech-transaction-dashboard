const express = require("express");
const transactionController = require("../controllers/transactionController");
const { validateTransaction } = require("../middleware/validation");

const router = express.Router();

router.get("/", transactionController.getAllTransactions);
router.get("/by-category", transactionController.getSpendingByCategory);

router.post("/", validateTransaction, transactionController.createTransaction);
router.post("/refund/:transactionId", transactionController.processRefund);

module.exports = router;
