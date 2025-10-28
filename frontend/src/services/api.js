import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://crowdfunding-qdrn.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for Render free tier wake-up
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Campaigns API
export const campaignsAPI = {
  getAll: () => api.get('/campaigns'),
  getById: (id) => api.get(`/campaigns/${id}`),
  getByUser: (userId) => api.get(`/campaigns/user/${userId}`),
  create: (campaignData) => api.post('/campaigns', campaignData),
  update: (id, campaignData) => api.put(`/campaigns/${id}`, campaignData),
  delete: (id) => api.delete(`/campaigns/${id}`),
};

// Pledges API
export const pledgesAPI = {
  create: (pledgeData) => api.post('/pledges', pledgeData),
  getByUser: (userId) => api.get(`/pledges/user/${userId}`),
  getByCampaign: (campaignId) => api.get(`/pledges/campaign/${campaignId}`),
  getUserStats: (userId) => api.get(`/pledges/user/${userId}/stats`),
};

// Transactions API
export const transactionsAPI = {
  getByUser: (userId) => api.get(`/transactions/user/${userId}`),
  getAll: () => api.get('/transactions/all'),
  getStats: () => api.get('/transactions/stats'),
  processExpired: () => api.post('/transactions/process-expired'),
};

export default api;
