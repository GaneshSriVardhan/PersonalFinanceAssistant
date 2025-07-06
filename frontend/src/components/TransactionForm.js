// frontend/src/components/TransactionForm.js
import React, { useState } from 'react';
import { createTransaction, createTransactionBatch } from '../services/api';

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    type: 'Expense',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTransactionBatch({
        ...formData,
        userId: localStorage.getItem('userId') // Dynamic user ID
      });
      setMessage('Transaction added successfully!');
      setError('');
      setFormData({
        type: 'Expense',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    } catch (error) {
      setError('Error adding transaction: ' + error.message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800 p-6 rounded-lg shadow-lg">
      <div>
        <label className="block text-sm font-medium text-gray-300">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="mt-1 p-2 w-full bg-gray-900 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Amount</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
          className="mt-1 p-2 w-full bg-gray-900 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          className="mt-1 p-2 w-full bg-gray-900 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
        >
         </input> 
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 p-2 w-full bg-gray-900 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300">Description (optional)</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 p-2 w-full bg-gray-900 border border-gray-600 rounded-md text-white focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          className="w-full bg-indigo-500 text-white p-2 rounded-md shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
        >
          Add Transaction
        </button>
      </div>
      {message && <p className="mt-4 text-green-400">{message}</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </form>
  );
};

export default TransactionForm;
