import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import TransactionList from '../components/TransactionList';

const Expense = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/auth/getUser`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUser(userResponse.data);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  return (
    <Layout user={user}>
      <h1 className="text-3xl font-bold text-white mb-6">Expenses</h1>
      {error && <p className="text-red-400 font-medium mb-4">{error}</p>}
      <TransactionList dateRange={{ type: 'Expense' }} limit={10} />
    </Layout>
  );
};

export default Expense;