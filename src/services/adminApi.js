import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-7d0f.up.railway.app';
const ADMIN_KEY = 'admin_secret_key_2024';

const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin/lenders`,
  headers: { 
    'Content-Type': 'application/json',
    'X-Admin-Key': ADMIN_KEY
  }
});

// ============================================
// ADMIN - LENDER MANAGEMENT
// ============================================

export const adminLenders = {
  getPending: () => adminApi.get('/pending'),
  getAll: (params) => adminApi.get('/', { params }),
  getById: (id) => adminApi.get(`/${id}`),
  verify: (id, data) => adminApi.put(`/${id}/verify`, data),
  suspend: (id, data) => adminApi.put(`/${id}/suspend`, data),
  delete: (id) => adminApi.delete(`/${id}`),
  getStats: () => adminApi.get('/stats/overview')
};

// ============================================
// ADMIN - PLATFORM REPORTS
// ============================================

export const adminReports = {
  getApplications: (params) => {
    const token = localStorage.getItem('adminToken');
    return axios.get(`${API_URL}/api/admin/applications`, {
      headers: { 
        'X-Admin-Key': ADMIN_KEY,
        Authorization: `Bearer ${token}`
      },
      params
    });
  },
  getCommission: (params) => {
    const token = localStorage.getItem('adminToken');
    return axios.get(`${API_URL}/api/admin/reports/commission`, {
      headers: { 
        'X-Admin-Key': ADMIN_KEY,
        Authorization: `Bearer ${token}`
      },
      params
    });
  },
  payCommission: (data) => {
    const token = localStorage.getItem('adminToken');
    return axios.put(`${API_URL}/api/admin/commission/pay`, data, {
      headers: { 
        'X-Admin-Key': ADMIN_KEY,
        Authorization: `Bearer ${token}`
      }
    });
  }
};

export default adminApi;

