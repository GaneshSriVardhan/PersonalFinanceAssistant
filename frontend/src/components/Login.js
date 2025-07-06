// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('REACT_APP_API_URL/api/v1/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId); // Store userId
      setError('');
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent mb-4">
          Login
        </h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white p-3 rounded-md shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;