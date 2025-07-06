// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', name: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://personal-finance-assistant-umber.vercel.app/api/v1/auth/register', formData);
      setMessage('Registration successful! Please check your email to verify.');
      setError('');
      setFormData({ email: '', name: '', password: '' });
      setTimeout(() => navigate('/verify-status'), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
      setMessage('');
    }
  };

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 1s ease-in' }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .shine {
            animation: shineEffect 2s infinite;
          }
          .shine-input:focus {
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
          }
          .shine-button {
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.7);
          }
          .shine-button:hover {
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.9);
          }
          @keyframes shineEffect {
            0% { text-shadow: 0 0 5px rgba(99, 102, 241, 0.5); }
            50% { text-shadow: 0 0 10px rgba(99, 102, 241, 0.8); }
            100% { text-shadow: 0 0 5px rgba(99, 102, 241, 0.5); }
          }
        `}
      </style>
      <div className="max-w-md w-full bg-gray-800 bg-opacity-95 rounded-lg shadow-lg p-8 transform transition duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent shine">
          Register
        </h2>
        {message && (
          <p className="text-center mb-4 text-green-400">{message}</p>
        )}
        {error && (
          <p className="text-center mb-4 text-red-400">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shine-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shine-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shine-input"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white p-3 rounded-md hover:bg-indigo-600 transition duration-300 transform hover:scale-105 shine-button"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;