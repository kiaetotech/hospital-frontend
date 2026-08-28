import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-7d0f.up.railway.app';
const ADMIN_KEY = 'admin_secret_key_2024';

// Get token from localStorage
const getToken = () => localStorage.getItem('adminToken');

// Create axios instance for admin routes
const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
  headers: { 
    'Content-Type': 'application/json',
    'X-Admin-Key': ADMIN_KEY
  }
});

// Add token to requests
adminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// ADMIN - AUTH
// ============================================

export const adminAuth = {
  login: (adminKey) => adminApi.post('/login', { adminKey }),
  getOverview: () => adminApi.get('/overview'),
  getDashboard: () => adminApi.get('/dashboard')
};

// ============================================
// ADMIN - HOSPITALS
// ============================================

export const adminHospitals = {
  getAll: (params) => adminApi.get('/hospitals', { params }),
  getById: (id) => adminApi.get(`/hospitals/${id}`),
  verify: (id, data) => adminApi.put(`/hospitals/${id}/verify`, data),
  reject: (id, data) => adminApi.put(`/hospitals/${id}/reject`, data),
  updateSubscription: (id, data) => adminApi.put(`/hospitals/${id}/subscription`, data),
  toggleStatus: (id) => adminApi.put(`/hospitals/${id}/toggle-status`),
  getStats: () => adminApi.get('/hospitals-stats')
};

// ============================================
// ADMIN - AMBULANCE
// ============================================

export const adminAmbulance = {
  getAll: (params) => adminApi.get('/ambulance', { params }),
  getBookings: (params) => adminApi.get('/bookings', { params: { ...params, bookingType: 'ambulance' } }),
  getSettlements: (params) => adminApi.get('/settlements', { params }),
  approveSettlement: (id) => adminApi.put(`/settlements/${id}/settle`),
  rejectSettlement: (id, data) => adminApi.put(`/settlements/${id}/reject`, data)
};

// ============================================
// ADMIN - USERS
// ============================================

export const adminUsers = {
  getAll: (params) => adminApi.get('/users', { params }),
  getById: (id) => adminApi.get(`/users/${id}`),
  updateStatus: (id, data) => adminApi.put(`/users/${id}/status`, data)
};

// ============================================
// ADMIN - BOOKINGS
// ============================================

export const adminBookings = {
  getAll: (params) => adminApi.get('/bookings', { params }),
  getById: (id) => adminApi.get(`/bookings/${id}`),
  cancel: (id, data) => adminApi.put(`/bookings/${id}/cancel`, data)
};

// ============================================
// ADMIN - TRANSACTIONS
// ============================================

export const adminTransactions = {
  getAll: (params) => adminApi.get('/transactions', { params }),
  getById: (id) => adminApi.get(`/transactions/${id}`),
  refund: (id, data) => adminApi.post(`/transactions/${id}/refund`, data)
};

// ============================================
// ADMIN - COMPLAINTS
// ============================================

export const adminComplaints = {
  getAll: (params) => adminApi.get('/complaints', { params }),
  updateStatus: (id, data) => adminApi.put(`/complaints/${id}/status`, data)
};

// ============================================
// ADMIN - CANCELLATION POLICY
// ============================================

export const adminCancellationPolicy = {
  get: () => adminApi.get('/cancellation-policy'),
  update: (data) => adminApi.put('/cancellation-policy', data)
};

// ============================================
// ADMIN - REVENUE
// ============================================

export const adminRevenue = {
  getOverview: (params) => adminApi.get('/revenue', { params }),
  getDaily: (params) => adminApi.get('/revenue/daily', { params }),
  getCommissionConfigs: () => adminApi.get('/commission-configs'),
  getCommissionConfig: (serviceType) => adminApi.get(`/commission-config/${serviceType}`),
  createCommissionConfig: (data) => adminApi.post('/commission-config', data),
  updateCommissionConfig: (id, data) => adminApi.put(`/commission-config/${id}`, data)
};

// ============================================
// ADMIN - PROVIDERS
// ============================================

export const adminProviders = {
  getPending: () => adminApi.get('/providers/pending'),
  getAll: () => adminApi.get('/providers'),
  verify: (id, data) => adminApi.put(`/providers/${id}/verify`, data),
  delete: (id) => adminApi.delete(`/providers/${id}`),
  getStats: () => adminApi.get('/stats')
};

// ============================================
// INSURANCE ADMIN
// ============================================

const insuranceAdminApi = axios.create({
  baseURL: `${API_URL}/api/insurance-admin`,
  headers: { 'Content-Type': 'application/json' }
});

insuranceAdminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const insuranceAdmin = {
  getCompanies: (params) => insuranceAdminApi.get('/companies', { params }),
  getCompanyById: (id) => insuranceAdminApi.get(`/companies/${id}`),
  verifyCompany: (id, data) => insuranceAdminApi.put(`/companies/${id}/verify`, data),
  getPendingSettlements: () => insuranceAdminApi.get('/settlements/pending'),
  processSettlement: (data) => insuranceAdminApi.post('/settlements/process', data),
  getSummaryReport: () => insuranceAdminApi.get('/reports/summary'),
  getSalesReport: (params) => insuranceAdminApi.get('/reports/sales', { params }),
  getCommissionReport: (params) => insuranceAdminApi.get('/reports/commission', { params })
};

// ============================================
// CORPORATE ADMIN
// ============================================

const corporateAdminApi = axios.create({
  baseURL: `${API_URL}/api/corporate`,
  headers: { 'Content-Type': 'application/json' }
});

corporateAdminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const corporateAdmin = {
  getStats: () => corporateAdminApi.get('/stats'),
  getPendingPlans: () => corporateAdminApi.get('/admin/pending'),
  getAllPlans: (params) => corporateAdminApi.get('/admin/all', { params }),
  verifyPlan: (id, data) => corporateAdminApi.put(`/admin/verify/${id}`, data),
  deletePlan: (id) => corporateAdminApi.delete(`/admin/${id}`)
};

// ============================================
// MENTAL HEALTH ADMIN
// ============================================

const mentalHealthAdminApi = axios.create({
  baseURL: `${API_URL}/api/mentalhealth/admin`,
  headers: { 'Content-Type': 'application/json' }
});

mentalHealthAdminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const mentalHealthAdmin = {
  getTherapists: (params) => mentalHealthAdminApi.get('/therapists', { params }),
  getTherapistById: (id) => mentalHealthAdminApi.get(`/therapists/${id}`),
  verifyTherapist: (id, data) => mentalHealthAdminApi.put(`/therapists/${id}/verify`, data),
  suspendTherapist: (id, data) => mentalHealthAdminApi.put(`/therapists/${id}/suspend`, data),
  deleteTherapist: (id) => mentalHealthAdminApi.delete(`/therapists/${id}`),
  getBookings: (params) => mentalHealthAdminApi.get('/bookings', { params }),
  getScreenings: (params) => mentalHealthAdminApi.get('/screenings', { params }),
  getDashboard: () => mentalHealthAdminApi.get('/dashboard')
};

// ============================================
// ONLINE DOCTOR ADMIN
// ============================================

const onlineDoctorAdminApi = axios.create({
  baseURL: `${API_URL}/api/online-doctor`,
  headers: { 'Content-Type': 'application/json' }
});

onlineDoctorAdminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const onlineDoctorAdmin = {
  getDoctors: () => onlineDoctorAdminApi.get('/admin/doctors'),
  getPendingDoctors: () => onlineDoctorAdminApi.get('/admin/doctors/pending'),
  verifyDoctor: (id, data) => onlineDoctorAdminApi.put(`/admin/doctor/${id}/verify`, data)
};

// ============================================
// AYURVEDA ADMIN
// ============================================

const ayurvedaAdminApi = axios.create({
  baseURL: `${API_URL}/api/ayurveda`,
  headers: { 'Content-Type': 'application/json' }
});

export const ayurvedaAdmin = {
  getPendingDoctors: () => ayurvedaAdminApi.get('/admin/pending-doctors'),
  verifyDoctor: (id, data) => ayurvedaAdminApi.put(`/admin/verify-doctor/${id}`, data)
};

// ============================================
// HOMEOPATHY ADMIN
// ============================================

const homeopathyAdminApi = axios.create({
  baseURL: `${API_URL}/api/homeopathy`,
  headers: { 'Content-Type': 'application/json' }
});

export const homeopathyAdmin = {
  getPendingDoctors: () => homeopathyAdminApi.get('/admin/pending-doctors'),
  verifyDoctor: (id, data) => homeopathyAdminApi.put(`/admin/verify-doctor/${id}`, data),
  getPendingCenters: () => homeopathyAdminApi.get('/admin/pending-centers'),
  verifyCenter: (id, data) => homeopathyAdminApi.put(`/admin/verify-center/${id}`, data),
  getPendingPharmacies: () => homeopathyAdminApi.get('/admin/pending-pharmacies'),
  verifyPharmacy: (id, data) => homeopathyAdminApi.put(`/admin/verify-pharmacy/${id}`, data)
};

// ============================================
// DIAGNOSTICS ADMIN
// ============================================

const diagnosticsAdminApi = axios.create({
  baseURL: `${API_URL}/api/diagnostics`,
  headers: { 'Content-Type': 'application/json' }
});

export const diagnosticsAdmin = {
  getProviderStats: () => diagnosticsAdminApi.get('/provider/stats')
};

// ============================================
// CAREGIVERS ADMIN
// ============================================

const caregiverAdminApi = axios.create({
  baseURL: `${API_URL}/api/caregivers`,
  headers: { 'Content-Type': 'application/json' }
});

export const caregiverAdmin = {
  getAll: (params) => caregiverAdminApi.get('/', { params })
};

// ============================================
// LENDER ADMIN (Preserved)
// ============================================

const lenderAdminApi = axios.create({
  baseURL: `${API_URL}/api/admin/lenders`,
  headers: { 
    'Content-Type': 'application/json',
    'X-Admin-Key': ADMIN_KEY
  }
});

lenderAdminApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminLenders = {
  getPending: () => lenderAdminApi.get('/pending'),
  getAll: (params) => lenderAdminApi.get('/', { params }),
  getById: (id) => lenderAdminApi.get(`/${id}`),
  verify: (id, data) => lenderAdminApi.put(`/${id}/verify`, data),
  suspend: (id, data) => lenderAdminApi.put(`/${id}/suspend`, data),
  delete: (id) => lenderAdminApi.delete(`/${id}`),
  getStats: () => lenderAdminApi.get('/stats/overview')
};

export default adminApi;