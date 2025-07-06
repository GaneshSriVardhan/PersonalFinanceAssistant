const express = require('express');
const router = express.Router();
const { createTransaction, listTransactions, getTotals, createTransactionBatch } = require('../controllers/transactionController');
const auth = require('../middleware/auth'); // Assuming you have authentication middleware
const Transaction = require('../models/Transaction');

// Create a transaction
router.post('/', auth, createTransaction);

// List transactions with pagination
router.get('/', auth, listTransactions);
router.get('/totals', auth, getTotals);

router.get('/categories', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const query = { userId: req.user.id };
    if (type) {
      query.type = type;
    }
    const categories = await Transaction.distinct('category', query);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.post('/batch', auth, createTransactionBatch);


module.exports = router;