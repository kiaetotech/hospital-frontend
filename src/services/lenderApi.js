import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-8de3.up.railway.app';

const lenderApi = axios.create({
  baseURL: `${API_URL}/api/lender/auth`,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
lenderApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('lenderToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// LENDER AUTHENTICATION
// ============================================

export const lenderAuth = {
  register: (data) => lenderApi.post('/register', data),
  login: (email, password) => lenderApi.post('/login', { email, password }),
  getProfile: () => lenderApi.get('/profile'),
  updateProfile: (data) => lenderApi.put('/profile', data)
};

// ============================================
// LENDER APPLICATIONS
// ============================================

export const lenderApplications = {
  getStats: () => {
    const token = localStorage.getItem('lenderToken');
    return axios.get(`${API_URL}/api/lender/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getAll: (params) => {
    const token = localStorage.getItem('lenderToken');
    return axios.get(`${API_URL}/api/lender/applications`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
  },
  getById: (id) => {
    const token = localStorage.getItem('lenderToken');
    return axios.get(`${API_URL}/api/lender/applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  updateStatus: (id, data) => {
    const token = localStorage.getItem('lenderToken');
    return axios.put(`${API_URL}/api/lender/applications/${id}/status`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  requestDocument: (id, data) => {
    const token = localStorage.getItem('lenderToken');
    return axios.post(`${API_URL}/api/lender/applications/${id}/request-document`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  disburse: (id, data) => {
    const token = localStorage.getItem('lenderToken');
    return axios.post(`${API_URL}/api/lender/applications/${id}/disburse`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

export default lenderApi;