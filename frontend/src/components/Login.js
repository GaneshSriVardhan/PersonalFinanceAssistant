import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/v1/auth/login', formData);
      setMessage('Login successful!');
      localStorage.setItem('token', response.data.token); // Store token
      setTimeout(() => navigate('/dashboard'), 2000); // Redirect to dashboard
    } catch (error) {
      setMessage(error.response?.data?.error || 'Login failed');
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
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
          }
          .shine-button {
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
          }
          .shine-button:hover {
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.9);
          }
          @keyframes shineEffect {
            0% { text-shadow: 0 0 5px rgba(255, 0, 0, 0.5); }
            50% { text-shadow: 0 0 10px rgba(255, 0, 0, 0.8); }
            100% { text-shadow: 0 0 5px rgba(255, 0, 0, 0.5); }
          }
        `}
      </style>
      <div className="max-w-md w-full bg-gray-800 bg-opacity-95 rounded-lg shadow-lg p-8 transform transition duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-red-500 shine">Login</h2>
        {message && <p className="text-center mb-4 text-red-500">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 shine-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 shine-input"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white p-3 rounded-md hover:bg-red-700 transition duration-300 transform hover:scale-105 shine-button"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;