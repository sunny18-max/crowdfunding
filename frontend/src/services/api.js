import axios from 'axios';

// Base API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
  withCredentials: true, // Enable sending cookies with requests
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

// Wallet API
export const walletAPI = {
  getWallet: (userId) => api.get(`/wallet/${userId}`),
  addFunds: (userId, amount) => api.post(`/wallet/${userId}/add-funds`, { amount }),
  createPledge: (pledgeData) => api.post('/wallet/pledge', pledgeData)
};

// Transactions API
export const transactionsAPI = {
  getByUser: (userId) => api.get(`/wallet/${userId}/transactions`),
  getAll: () => api.get('/wallet/transactions'),
  getStats: () => api.get('/wallet/transactions/stats'),
  create: (transactionData) => api.post('/wallet/transactions', transactionData)
};

// Users API
export const usersAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  getUser: (userId) => api.get(`/users/${userId}`)
};

// Analytics API
export const analyticsAPI = {
  getPlatformStats: () => api.get('/analytics/platform-stats'),
  getTopCampaigns: (limit = 5) => api.get(`/analytics/top-campaigns?limit=${limit}`),
  getSuccessRates: () => api.get('/analytics/success-rates'),
  getPledgeStats: () => api.get('/analytics/pledge-stats'),
  getUserEngagement: () => api.get('/analytics/user-engagement'),
  getFundingTrends: (days = 30) => api.get(`/analytics/funding-trends?days=${days}`),
  getCampaignPerformance: (campaignId) => api.get(`/analytics/campaign-performance/${campaignId}`),
  predictCampaignSuccess: (campaignId) => api.get(`/analytics/predict/${campaignId}`)
};

export default api;
