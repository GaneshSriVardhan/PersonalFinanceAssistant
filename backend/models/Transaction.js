const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // For multiple users
});

module.exports = mongoose.model('Transaction', transactionSchema);