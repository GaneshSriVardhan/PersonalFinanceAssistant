// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'https://personal-finance-assistant-umber.vercel.app/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createTransaction = async (data) => {
  await api.post('/transactions', data);
};

export const listTransactions = async ({ startDate, endDate, page, limit, type }) => {
  const response = await api.get('/transactions', {
    params: { startDate, endDate, page, limit, type }
  });
  return response.data;
};

export const getTotals = async ({ startDate, endDate }) => {
  const response = await api.get('/transactions/totals', {
    params: { startDate, endDate }
  });
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getUser = async () => {
  const response = await api.get('/auth/getUser');
  return response.data;
};

export const createTransactionBatch = async (transactions) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    'https://personal-finance-assistant-umber.vercel.app/api/v1/transactions/batch',
    { transactions },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    }
  );
  return response.data;
};

