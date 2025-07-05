import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import VerifyStatus from './components/VerifyStatus';
import VerifyEmail from './components/VerifyEmail';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './pages/Dashboard';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import AddTransaction from './pages/AddTransaction';
import Income from './pages/Income';
import Expense from './pages/Expense';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-status" element={<VerifyStatus />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expense" element={<Expense />} />
        <Route path="/form" element={<TransactionForm />} />
        <Route path="/list" element={<TransactionList />} />
        <Route path="/api" element={<api />} />
      </Routes>
    </Router>
  );
}

export default App;