const Transaction = require('../models/Transaction');

exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, date, description } = req.body;
    if (!['Income', 'Expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be Income or Expense' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const transaction = new Transaction({
      type,
      amount: Number(amount),
      category,
      date: date || Date.now(),
      description,
      userId: req.user.id
    });

    await transaction.save();
    res.status(201).json({ message: 'Transaction created', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.listTransactions = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10, type, category } = req.query;
    const query = { userId: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) query.type = type;
    if (category) query.category = category;

    const transactions = await Transaction.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ date: -1 });

    const totalItems = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      totalItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getTotals = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    const query = { userId: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (type) query.type = type;

    const transactions = await Transaction.find(query);
    
    const totalIncome = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      totalIncome,
      totalExpense
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTransactionBatch = async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions)) {
      return res.status(400).json({ message: 'Transactions must be an array' });
    }

    const userId = req.user.id;

    const validTransactions = transactions.map(t => {
  // Convert date from DD-MM-YYYY → YYYY-MM-DD
  let parsedDate = t.date;
  if (typeof t.date === 'string' && t.date.includes('-')) {
    const [day, month, year] = t.date.split('-');
    parsedDate = new Date(`${year}-${month}-${day}`);
  }

  // Normalize type (case & plural-safe)
  let type = t.type?.trim().toLowerCase();
  if (type === 'income' || type === 'incomes') type = 'Income';
  else if (type === 'expense' || type === 'expenses') type = 'Expense';
  else type = 'Expense'; // default fallback

  return {
    type,
    amount: Number(t.amount),
    category: t.category,
    date: parsedDate,
    description: t.description || '',
    userId
  };
});

    await Transaction.insertMany(validTransactions);

    res.status(201).json({ message: 'Transactions saved', count: validTransactions.length });
  } catch (err) {
    console.error('Batch insert error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
