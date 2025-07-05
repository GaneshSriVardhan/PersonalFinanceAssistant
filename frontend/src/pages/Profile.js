import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const Profile = () => {
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
        setError('Error fetching profile: ' + error.message);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin h-5 w-5 border-t-2 border-indigo-400 rounded-full"></div>
      </div>
    );
  }

  return (
    <Layout user={user} className="center">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent mb-6">
        Profile
      </h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="bg-gray-800 p-6 rounded-lg items-center shadow-lg max-w-md mx-auto">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {user.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
        <p className="text-gray-300"><strong>Name:</strong> {user.name || 'N/A'}</p>        
        <p className="text-gray-300"><strong>Email:</strong> {user.email}</p>
      </div>
    </Layout>
  );
};

export default Profile;