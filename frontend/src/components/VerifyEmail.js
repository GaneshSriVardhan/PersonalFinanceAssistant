import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [message, setMessage] = useState('Verifying...');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`REACT_APP_API_URL/api/v1/auth/verify-email?token=${token}`);
        setMessage(response.data.message);
        setTimeout(() => (window.location.href = '/login'), 3000); 
      } catch (error) {
        setMessage(error.response?.data?.error || 'Verification failed');
      }
    };
    if (token) verifyEmail();
  }, [token]);

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
        <h2 className="text-3xl font-bold mb-6 text-red-500 shine">Email Verification</h2>
        <p className="text-gray-300 mb-6">{message}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;