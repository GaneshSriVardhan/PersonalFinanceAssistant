// frontend/src/pages/HomePage.js
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  // Redirect to dashboard if logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="max-w-2xl text-center p-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent mb-4">
          Personal Finance Assistant
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6">
          Take control of your finances with ease! Track your income, expenses, and spending habits seamlessly. 
          Our app helps you manage your budget, visualize your financial health, and make informed decisions.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-indigo-500 text-white rounded-md shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-gray-700 text-white rounded-md shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;