import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import TransactionForm from '../components/TransactionForm';

const AddTransaction = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/auth/getUser', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUser(response.data);
      } catch (error) {
        setError('Error fetching user: ' + error.message);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  return (
    <Layout user={user}>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent mb-6">
        Add Transaction
      </h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="max-w-md mx-auto">
        <TransactionForm />
      </div>
    </Layout>
  );
};

export default AddTransaction;