const { body, validationResult } = require('express-validator');

exports.validateTransaction = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  body('type')
    .isIn(['income', 'expense', 'refund'])
    .withMessage('Type must be income, expense, or refund'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
