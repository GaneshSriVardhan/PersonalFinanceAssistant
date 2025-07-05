// frontend/src/components/Layout.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ user, children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const profileLetter = user?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar (15%) */}
      <div className="w-[15%] bg-gray-900 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {profileLetter}
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <Link to="/profile" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500 transition duration-300">
            Profile
          </Link>
          <Link to="/dashboard" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500 transition duration-300">
            Dashboard
          </Link>
          <Link to="/add-transaction" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500 transition duration-300">
            Add Transaction
          </Link>
          <Link to="/income" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500 transition duration-300">
            Income
          </Link>
          <Link to="/expense" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-500 transition duration-300">
            Expense
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-500 transition duration-300 text-left"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content (85%) */}
      <div className="w-[85%] p-6">{children}</div>
    </div>
  );
};

export default Layout;