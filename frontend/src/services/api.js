import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/v1`;

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
  const response = await api.post('/transactions/batch', { transactions });
  return response.data;
};
