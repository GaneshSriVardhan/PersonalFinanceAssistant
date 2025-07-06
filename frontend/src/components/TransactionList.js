import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

ChartJS.register(ArcElement, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

// Totals Pie Chart Component
const TotalsPieChart = ({ allTotals }) => {
  const data = {
    labels: ['Income', 'Expense', 'Balance'],
    datasets: [{
      label: 'Total Summary',
      data: [
        allTotals.income,
        allTotals.expense,
        allTotals.income - allTotals.expense
      ],
      backgroundColor: ['#10B981', '#EF4444', '#3B82F6'],
      borderColor: ['#10B981', '#EF4444', '#3B82F6'],
      borderWidth: 1
    }]
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Total Summary</h3>
      <div className="max-w-xs mx-auto">
        <Pie data={data} />
      </div>
    </div>
  );
};

// Transaction Line Chart Component
const TransactionLineChart = ({ transactions, type }) => {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const amounts = [];
  const dates = [];
  sortedTransactions.forEach(t => {
    if (t.type === type) {
      amounts.push(t.amount);
      dates.push(new Date(t.date).toLocaleDateString());
    }
  });

  const data = {
    labels: dates,
    datasets: [{
      label: `${type} Over Time`,
      data: amounts,
      borderColor: type === 'Income' ? '#10B981' : '#EF4444',
      backgroundColor: type === 'Income' ? '#10B981' : '#EF4444',
      fill: false
    }]
  };

  return (
    <div className="max-w-lg mx-auto mb-6">
      <h3 className="text-lg font-semibold mb-2" style={{ color: type === 'Income' ? '#10B981' : '#EF4444' }}>
        {type} Over Time
      </h3>
      <Line data={data} />
    </div>
  );
};

// All Transactions Component
const AllTransactions = ({ dateRange, allTotals, allTransactions, categories, allChartType, setAllChartType, downloadPDF, downloadCSV, downloadExcel }) => {
  const prepareChartData = (type) => {
    const dataByCategory = categories.reduce((acc, category) => {
      const total = allTransactions
        .filter(t => t.category === category && (!type || t.type === type))
        .reduce((sum, t) => sum + t.amount, 0);
      acc[category] = total;
      return acc;
    }, {});
    return {
      labels: Object.keys(dataByCategory).filter(category => dataByCategory[category] > 0),
      datasets: [{
        label: type || dateRange?.type || 'Transactions',
        data: Object.values(dataByCategory).filter(value => value > 0),
        backgroundColor: type === 'Income' ? ['#10B981', '#34D399', '#6EE7B7'] : ['#EF4444', '#F87171', '#FCA5A5'],
        borderColor: type === 'Income' ? ['#10B981', '#34D399', '#6EE7B7'] : ['#EF4444', '#F87171', '#FCA5A5'],
        borderWidth: 1
      }]
    };
  };

  const prepareBalanceChartData = () => {
    const sortedTransactions = [...allTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let balance = 0;
    const balances = [];
    const dates = [];
    sortedTransactions.forEach(t => {
      balance += t.type === 'Income' ? t.amount : -t.amount;
      balances.push(balance);
      dates.push(new Date(t.date).toLocaleDateString());
    });
    return {
      labels: dates,
      datasets: [{
        label: 'Cumulative Balance',
        data: balances,
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
        fill: false
      }]
    };
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">All {dateRange?.type || 'Transactions'}</h2>
      {dateRange?.type === 'Income' ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-green-500">Total Income (All Time)</h3>
          <p className="text-2xl text-green-500 font-medium">₹{allTotals.income.toFixed(2)}</p>
        </div>
      ) : dateRange?.type === 'Expense' ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-red-500">Total Expense (All Time)</h3>
          <p className="text-2xl text-red-500 font-medium">₹{allTotals.expense.toFixed(2)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-green-500">Total Income (All Time)</h3>
            <p className="text-2xl text-green-500 font-medium">₹{allTotals.income.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-500">Total Expense (All Time)</h3>
            <p className="text-2xl text-red-500 font-medium">₹{allTotals.expense.toFixed(2)}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Total Balance (All Time)</h3>
            <p className="text-2xl text-white font-medium">₹{(allTotals.income - allTotals.expense).toFixed(2)}</p>
          </div>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300">Chart Type</label>
        <select
          value={allChartType}
          onChange={(e) => setAllChartType(e.target.value)}
          className="mt-1 p-1 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:ring-indigo-500 focus:border-indigo-500 max-w-xs"
        >
          <option value="pie">Pie Chart</option>
          <option value="bar">Bar Graph</option>
        </select>
      </div>
      {dateRange?.type ? (
        <div className="max-w-lg mx-auto mb-4">
          <h3 className="text-lg font-semibold mb-2" style={{ color: dateRange?.type === 'Income' ? '#10B981' : '#EF4444' }}>
            {dateRange?.type} by Category
          </h3>
          {allChartType === 'pie' ? (
            <Pie data={prepareChartData(dateRange?.type)} />
          ) : (
            <Bar data={prepareChartData(dateRange?.type)} />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="max-w-lg mx-auto">
            <h3 className="text-lg font-semibold text-green-500 mb-2">Income by Category</h3>
            {allChartType === 'pie' ? (
              <Pie data={prepareChartData('Income')} />
            ) : (
              <Bar data={prepareChartData('Income')} />
            )}
          </div>
          <div className="max-w-lg mx-auto">
            <h3 className="text-lg font-semibold text-red-500 mb-2">Expense by Category</h3>
            {allChartType === 'pie' ? (
              <Pie data={prepareChartData('Expense')} />
            ) : (
              <Bar data={prepareChartData('Expense')} />
            )}
          </div>
        </div>
      )}
      {!dateRange?.type && (
        <div className="max-w-lg mx-auto mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Cumulative Balance Over Time</h3>
          <Line data={prepareBalanceChartData()} />
        </div>
      )}
      {(dateRange?.type === 'Income' || dateRange?.type === 'Expense') && (
        <TransactionLineChart transactions={allTransactions} type={dateRange?.type} />
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => downloadPDF(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Download All (PDF)
        </button>
        <button
          onClick={() => downloadCSV(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Download All (CSV)
        </button>
        <button
          onClick={() => downloadExcel(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Download All (Excel)
        </button>
      </div>
    </div>
  );
};

// Filtered Transactions Component
const FilteredTransactions = ({ dateRange, limit, categories, transactions, filteredTransactions, listedTotals, setStartDate, setEndDate, setSelectedCategory, setSortOrder, setFilteredChartType, filteredChartType, resetFilters, currentPage, setCurrentPage, totalPages, error, downloadPDF, downloadCSV, downloadExcel }) => {
  const prepareChartData = (type) => {
    const dataByCategory = categories.reduce((acc, category) => {
      const total = filteredTransactions
        .filter(t => t.category === category && (!type || t.type === type))
        .reduce((sum, t) => sum + t.amount, 0);
      acc[category] = total;
      return acc;
    }, {});
    return {
      labels: Object.keys(dataByCategory).filter(category => dataByCategory[category] > 0),
      datasets: [{
        label: type || dateRange?.type || 'Transactions',
        data: Object.values(dataByCategory).filter(value => value > 0),
        backgroundColor: type === 'Income' ? ['#10B981', '#34D399', '#6EE7B7'] : ['#EF4444', '#F87171', '#FCA5A5'],
        borderColor: type === 'Income' ? ['#10B981', '#34D399', '#6EE7B7'] : ['#EF4444', '#F87171', '#FCA5A5'],
        borderWidth: 1
      }]
    };
  };

  const formatAmount = (transaction) => {
    return (
      <span className={transaction.type === 'Income' ? 'text-green-500' : 'text-red-500'}>
        {`${transaction.type === 'Income' ? '+' : '-'} ₹${transaction.amount.toFixed(2)} ${transaction.type === 'Income' ? '↑' : '↓'}`}
      </span>
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      {error && <p className="text-red-400 font-medium mb-4">{error}</p>}
      <h2 className="text-xl font-semibold text-white mb-4">Filtered {dateRange?.type || 'Transactions'}</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Start Date</label>
          <input
            type="date"
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded-md text-white font-medium focus:ring-indigo-500 focus:border-indigo-500 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">End Date</label>
          <input
            type="date"
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded-md text-white font-medium focus:ring-indigo-500 focus:border-indigo-500 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Category</label>
          <select
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded-md text-white font-medium focus:ring-indigo-500 focus:border-indigo-500 w-full"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Sort By</label>
          <select
            onChange={(e) => setSortOrder(e.target.value)}
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded-md text-white font-medium focus:ring-indigo-500 focus:border-indigo-500 w-full"
          >
            <option value="normal">Date (Recent First)</option>
            <option value="high-to-low">Amount (High to Low)</option>
            <option value="low-to-high">Amount (Low to High)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Chart Type</label>
          <select
            value={filteredChartType}
            onChange={(e) => setFilteredChartType(e.target.value)}
            className="mt-1 p-2 bg-gray-800 border border-gray-600 rounded-md text-white font-medium focus:ring-indigo-500 focus:border-indigo-500 w-full"
          >
            <option value="pie">Pie Chart</option>
            <option value="bar">Bar Graph</option>
          </select>
        </div>
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Reset Filters
        </button>
      </div>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => downloadPDF(false)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Download Filtered (PDF)
        </button>
        <button
          onClick={() => downloadCSV(false)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Download Filtered (CSV)
        </button>
        <button
          onClick={() => downloadExcel(false)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Download Filtered (Excel)
        </button>
      </div>
      <div className="mb-4">
        {dateRange?.type === 'Income' ? (
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-green-500 font-medium">
              Total Income: ₹{listedTotals.income.toFixed(2)}
            </p>
          </div>
        ) : dateRange?.type === 'Expense' ? (
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-red-500 font-medium">
              Total Expense: ₹{listedTotals.expense.toFixed(2)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-green-500 font-medium">
                Total Income: ₹{listedTotals.income.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-red-500 font-medium">
                Total Expense: ₹{listedTotals.expense.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-white font-medium">
                Total Balance: ₹{(listedTotals.income - listedTotals.expense).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
      {transactions.length === 0 ? (
        <p className="text-gray-300 font-medium">No transactions found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="py-2 px-4 text-white font-semibold">Date</th>
                  <th className="py-2 px-4 text-white font-semibold">Category</th>
                  <th className="py-2 px-4 text-white font-semibold">Amount (in Rs)</th>
                  <th className="py-2 px-4 text-white font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-700">
                    <td className="py-2 px-4 text-gray-300 font-medium">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 text-gray-300 font-medium">{transaction.category}</td>
                    <td className="py-2 px-4">{formatAmount(transaction)}</td>
                    <td className="py-2 px-4 text-gray-300 font-medium">{transaction.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Previous
            </button>
            <span className="text-gray-300">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Next
            </button>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-white mb-2">Filtered {dateRange?.type || 'Transactions'} by Category</h3>
            {dateRange?.type ? (
              <div className="max-w-lg mx-auto">
                <h4 className="text-md font-semibold mb-2" style={{ color: dateRange?.type === 'Income' ? '#10B981' : '#EF4444' }}>
                  {dateRange?.type} by Category
                </h4>
                {filteredChartType === 'pie' ? (
                  <Pie data={prepareChartData(dateRange?.type)} />
                ) : (
                  <Bar data={prepareChartData(dateRange?.type)} />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="max-w-lg mx-auto">
                  <h4 className="text-md font-semibold text-green-500 mb-2">Income by Category</h4>
                  {filteredChartType === 'pie' ? (
                    <Pie data={prepareChartData('Income')} />
                  ) : (
                    <Bar data={prepareChartData('Income')} />
                  )}
                </div>
                <div className="max-w-lg mx-auto">
                  <h4 className="text-md font-semibold text-red-500 mb-2">Expense by Category</h4>
                  {filteredChartType === 'pie' ? (
                    <Pie data={prepareChartData('Expense')} />
                  ) : (
                    <Bar data={prepareChartData('Expense')} />
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Main TransactionList Component
const TransactionList = ({ dateRange, limit = 10 }) => {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('normal');
  const [startDate, setStartDate] = useState(dateRange?.startDate || '');
  const [endDate, setEndDate] = useState(dateRange?.endDate || '');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [listedTotals, setListedTotals] = useState({ income: 0, expense: 0 });
  const [allTotals, setAllTotals] = useState({ income: 0, expense: 0 });
  const [allChartType, setAllChartType] = useState('pie');
  const [filteredChartType, setFilteredChartType] = useState('pie');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const params = {};
        if (dateRange?.type) params.type = dateRange.type;
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/transactions/categories`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params
        });
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          setError('Invalid categories data received');
        }
      } catch (error) {
        setError('Error fetching categories: ' + error.message);
      }
    };
    fetchCategories();
  }, [dateRange?.type]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const params = { page: currentPage, limit };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (dateRange?.type) params.type = dateRange.type;
        if (selectedCategory) params.category = selectedCategory;
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/transactions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params
        });
        if (response.data && Array.isArray(response.data.transactions)) {
          let sortedTransactions = [...response.data.transactions];
          if (sortOrder === 'high-to-low') {
            sortedTransactions = sortedTransactions.sort((a, b) => b.amount - a.amount);
          } else if (sortOrder === 'low-to-high') {
            sortedTransactions = sortedTransactions.sort((a, b) => a.amount - b.amount);
          } else {
            sortedTransactions = sortedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
          }
          setTransactions(sortedTransactions);
          setTotalPages(response.data.totalPages);
          setError('');
        } else {
          setError('Invalid transactions data received');
          setTransactions([]);
        }
      } catch (error) {
        setError('Error fetching transactions: ' + error.message);
        setTransactions([]);
      }
    };

    const fetchFilteredTotalsAndChartData = async () => {
      try {
        const params = { page: 1, limit: Number.MAX_SAFE_INTEGER };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (dateRange?.type) params.type = dateRange.type;
        if (selectedCategory) params.category = selectedCategory;
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/transactions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params
        });
        if (response.data && Array.isArray(response.data.transactions)) {
          setFilteredTransactions(response.data.transactions);
          setListedTotals({
            income: response.data.transactions
              .filter(t => t.type === 'Income')
              .reduce((sum, t) => sum + t.amount, 0),
            expense: response.data.transactions
              .filter(t => t.type === 'Expense')
              .reduce((sum, t) => sum + t.amount, 0)
          });
        } else {
          setError('Invalid filtered transactions data received');
          setFilteredTransactions([]);
        }
      } catch (error) {
        setError('Error fetching filtered transactions: ' + error.message);
        setFilteredTransactions([]);
      }
    };

    fetchTransactions();
    fetchFilteredTotalsAndChartData();
  }, [startDate, endDate, dateRange?.type, selectedCategory, sortOrder, currentPage, limit]);

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        const params = {};
        if (dateRange?.type) params.type = dateRange.type;
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/transactions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params
        });
        if (response.data && Array.isArray(response.data.transactions)) {
          const sortedTransactions = response.data.transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
          setAllTransactions(sortedTransactions);
          setAllTotals({
            income: sortedTransactions
              .filter(t => t.type === 'Income')
              .reduce((sum, t) => sum + t.amount, 0),
            expense: sortedTransactions
              .filter(t => t.type === 'Expense')
              .reduce((sum, t) => sum + t.amount, 0)
          });
        } else {
          setError('Invalid all transactions data received');
        }
      } catch (error) {
        setError('Error fetching all transactions: ' + error.message);
      }
    };
    fetchAllTransactions();
  }, [dateRange?.type]);

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
    setSortOrder('normal');
    setAllChartType('pie');
    setFilteredChartType('pie');
    setCurrentPage(1);
  };

  const fetchAllFilteredTransactions = async () => {
    try {
      const params = { page: 1, limit: Number.MAX_SAFE_INTEGER };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (dateRange?.type) params.type = dateRange.type;
      if (selectedCategory) params.category = selectedCategory;
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params
      });
      if (response.data && Array.isArray(response.data.transactions)) {
        return response.data.transactions;
      }
      return [];
    } catch (error) {
      setError('Error fetching filtered transactions for download: ' + error.message);
      return [];
    }
  };

  const downloadPDF = async (useAll = false) => {
    const doc = new jsPDF();
    const dataSource = useAll ? allTransactions : await fetchAllFilteredTransactions();
    const totalIncome = dataSource
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = dataSource
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    doc.setFontSize(16);
    doc.text(dateRange?.type ? `${dateRange.type} Transactions` : 'All Transactions', 14, 20);
    doc.setFontSize(12);
    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Category', 'Amount (in Rs)', 'Type']],
      body: [
        ...dataSource.map(t => [
          new Date(t.date).toLocaleDateString(),
          t.category,
          `${t.type === 'Income' ? '+' : '-'} ₹${t.amount.toFixed(2)}`,
          t.type
        ]),
        ['', '', dateRange?.type === 'Income' ? 'Total Income' : dateRange?.type === 'Expense' ? 'Total Expense' : 'Total Balance', `₹${(dateRange?.type === 'Income' ? totalIncome : dateRange?.type === 'Expense' ? totalExpense : totalBalance).toFixed(2)}`]
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fontStyle: 'bold' }
    });
    doc.save(`${useAll ? 'all_' : ''}${dateRange?.type || 'transactions'}.pdf`);
  };

  const downloadCSV = async (useAll = false) => {
    const dataSource = useAll ? allTransactions : await fetchAllFilteredTransactions();
    const csvData = dataSource.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Category: t.category,
      'Amount (in Rs)': `${t.type === 'Income' ? '+' : '-'} ${t.amount.toFixed(2)}`,
      Type: t.type
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${useAll ? 'all_' : ''}${dateRange?.type || 'transactions'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = async (useAll = false) => {
    const dataSource = useAll ? allTransactions : await fetchAllFilteredTransactions();
    const wsData = dataSource.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.category,
      `${t.type === 'Income' ? '+' : '-'} ${t.amount.toFixed(2)}`,
      t.type
    ]);
    const ws = XLSX.utils.aoa_to_sheet([['Date', 'Category', 'Amount (in Rs)', 'Type'], ...wsData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `${useAll ? 'all_' : ''}${dateRange?.type || 'transactions'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <TotalsPieChart allTotals={allTotals} />
      <AllTransactions
        dateRange={dateRange}
        allTotals={allTotals}
        allTransactions={allTransactions}
        categories={categories}
        allChartType={allChartType}
        setAllChartType={setAllChartType}
        downloadPDF={downloadPDF}
        downloadCSV={downloadCSV}
        downloadExcel={downloadExcel}
      />
      <FilteredTransactions
        dateRange={dateRange}
        limit={limit}
        categories={categories}
        transactions={transactions}
        filteredTransactions={filteredTransactions}
        listedTotals={listedTotals}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setSelectedCategory={setSelectedCategory}
        setSortOrder={setSortOrder}
        setFilteredChartType={setFilteredChartType}
        filteredChartType={filteredChartType}
        resetFilters={resetFilters}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        error={error}
        downloadPDF={downloadPDF}
        downloadCSV={downloadCSV}
        downloadExcel={downloadExcel}
      />
    </div>
  );
};

export default TransactionList;