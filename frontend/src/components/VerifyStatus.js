import React from 'react';
import { useNavigate } from 'react-router-dom';

const VerifyStatus = () => {
  const navigate = useNavigate();

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
          @keyframes shineEffect {
            0% { text-shadow: 0 0 5px rgba(255, 0, 0, 0.5); }
            50% { text-shadow: 0 0 10px rgba(255, 0, 0, 0.8); }
            100% { text-shadow: 0 0 5px rgba(255, 0, 0, 0.5); }
          }
        `}
      </style>
      <div className="max-w-md w-full bg-gray-800 bg-opacity-95 rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-6 text-red-500 shine">Verify Status</h2>
        <p className="text-gray-300 mb-6">Please check your email to verify your account.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-red-600 text-white p-3 rounded-md hover:bg-red-700 transition duration-300 transform hover:scale-105"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyStatus;