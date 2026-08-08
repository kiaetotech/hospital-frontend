import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-f1b1.up.railway.app';

const providerApi = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

providerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('providerToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

providerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('providerToken');
      localStorage.removeItem('providerType');
    }
    return Promise.reject(error);
  }
);

export const hospitalApi = {
  register: (data) => providerApi.post('/hospitals/provider/register', data),
  login: (data) => providerApi.post('/hospitals/provider/login', data),
  logout: () => providerApi.post('/hospitals/provider/logout'),
  verify: () => providerApi.get('/hospitals/provider/verify'),
  getProfile: () => providerApi.get('/hospitals/provider/profile'),
  updateProfile: (data) => providerApi.put('/hospitals/provider/profile', data),
  getDoctors: () => providerApi.get('/hospitals/provider/doctors'),
  addDoctor: (data) => providerApi.post('/hospitals/provider/doctors', data),
  updateDoctor: (id, data) => providerApi.put(`/hospitals/provider/doctors/${id}`, data),
  deleteDoctor: (id) => providerApi.delete(`/hospitals/provider/doctors/${id}`),
  getRooms: () => providerApi.get('/hospitals/provider/rooms'),
  addRoom: (data) => providerApi.post('/hospitals/provider/rooms', data),
  updateRoom: (id, data) => providerApi.put(`/hospitals/provider/rooms/${id}`, data),
  deleteRoom: (id) => providerApi.delete(`/hospitals/provider/rooms/${id}`),
  getSlots: () => providerApi.get('/hospitals/provider/slots'),
  addSlot: (data) => providerApi.post('/hospitals/provider/slots', data),
  updateSlot: (id, data) => providerApi.put(`/hospitals/provider/slots/${id}`, data),
  deleteSlot: (id) => providerApi.delete(`/hospitals/provider/slots/${id}`),
  getBookings: (params) => providerApi.get('/hospitals/provider/bookings', { params }),
  updateBookingStatus: (id, data) => providerApi.put(`/hospitals/provider/bookings/${id}`, data),
  getReports: (params) => providerApi.get('/hospitals/provider/reports', { params }),
  exportReport: (params) => providerApi.get('/hospitals/provider/reports/export', { params, responseType: 'blob' }),
  getPatients: (params) => providerApi.get('/hospitals/provider/patients', { params }),
  getPatient: (id) => providerApi.get(`/hospitals/provider/patients/${id}`),
  getStats: () => providerApi.get('/hospitals/provider/stats'),
  updateBedStatus: (data) => providerApi.put('/hospitals/provider/bed-status', data),
  getBedStatus: () => providerApi.get('/hospitals/provider/bed-status'),
  whatsappBedUpdate: (data) => providerApi.post('/hospitals/provider/whatsapp-update', data),
  getSchemes: () => providerApi.get('/hospitals/provider/schemes'),
  updateSchemes: (data) => providerApi.put('/hospitals/provider/schemes', data),
  getInsurance: () => providerApi.get('/hospitals/provider/insurance'),
  updateInsurance: (data) => providerApi.put('/hospitals/provider/insurance', data),
  getFacilities: () => providerApi.get('/hospitals/provider/facilities'),
  updateFacilities: (data) => providerApi.put('/hospitals/provider/facilities', data),
  uploadDoctorsExcel: (formData) => providerApi.post('/hospitals/provider/upload-doctors', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadHospitalDataExcel: (formData) => providerApi.post('/hospitals/provider/upload-data', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  downloadDoctorTemplate: () => providerApi.get('/hospitals/provider/template/download', { responseType: 'blob' }),
  getDashboardStats: () => providerApi.get('/hospitals/provider/dashboard/stats'),
  getAnalytics: (params) => providerApi.get('/hospitals/provider/analytics', { params }),
  getOPDSchedule: () => providerApi.get('/hospitals/provider/opd-schedule'),
  updateOPDSchedule: (data) => providerApi.put('/hospitals/provider/opd-schedule', data),
  updatePricing: (data) => providerApi.put('/hospitals/provider/pricing', data),
  getPackages: () => providerApi.get('/hospitals/provider/packages'),
  addPackage: (data) => providerApi.post('/hospitals/provider/packages', data),
  updatePackage: (id, data) => providerApi.put(`/hospitals/provider/packages/${id}`, data),
  deletePackage: (id) => providerApi.delete(`/hospitals/provider/packages/${id}`),
  getOffers: () => providerApi.get('/hospitals/provider/offers'),
  addOffer: (data) => providerApi.post('/hospitals/provider/offers', data),
  updateOffer: (id, data) => providerApi.put(`/hospitals/provider/offers/${id}`, data),
  deleteOffer: (id) => providerApi.delete(`/hospitals/provider/offers/${id}`),
  getActivityScore: () => providerApi.get('/hospitals/provider/activity-score'),
  getNotifications: () => providerApi.get('/hospitals/provider/notifications'),
  markNotificationRead: (id) => providerApi.put(`/hospitals/provider/notifications/${id}/read`)
};

export const ambulanceApi = {
  register: (data) => providerApi.post('/ambulance/register', data),
  login: (data) => providerApi.post('/ambulance/login', data),
  logout: () => providerApi.post('/ambulance/logout'),
  verify: () => providerApi.get('/ambulance/auth/verify'),
  getProfile: () => providerApi.get('/ambulance/profile'),
  updateProfile: (data) => providerApi.put('/ambulance/profile', data),
  updateLocation: (data) => providerApi.put('/ambulance/location', data),
  getVehicles: () => providerApi.get('/ambulance/vehicles'),
  addVehicle: (data) => providerApi.post('/ambulance/vehicles', data),
  updateVehicle: (id, data) => providerApi.put(`/ambulance/vehicles/${id}`, data),
  deleteVehicle: (id) => providerApi.delete(`/ambulance/vehicles/${id}`),
  getDrivers: () => providerApi.get('/ambulance/drivers'),
  addDriver: (data) => providerApi.post('/ambulance/drivers', data),
  updateDriver: (id, data) => providerApi.put(`/ambulance/drivers/${id}`, data),
  deleteDriver: (id) => providerApi.delete(`/ambulance/drivers/${id}`),
  getBookings: (params) => providerApi.get('/ambulance/bookings', { params }),
  updateBookingStatus: (id, data) => providerApi.put(`/ambulance/bookings/${id}`, data),
  getReports: (params) => providerApi.get('/ambulance/reports', { params }),
  getStats: () => providerApi.get('/ambulance/stats')
};

export const caregiverApi = {
  register: (data) => providerApi.post('/caregivers/register', data),
  login: (data) => providerApi.post('/caregivers/login', data),
  logout: () => providerApi.post('/caregivers/logout'),
  verify: () => providerApi.get('/caregivers/auth/verify'),
  getProfile: () => providerApi.get('/caregivers/profile'),
  updateProfile: (data) => providerApi.put('/caregivers/profile', data),
  getServices: () => providerApi.get('/caregivers/services'),
  addService: (data) => providerApi.post('/caregivers/services', data),
  updateService: (id, data) => providerApi.put(`/caregivers/services/${id}`, data),
  deleteService: (id) => providerApi.delete(`/caregivers/services/${id}`),
  getBookings: (params) => providerApi.get('/caregivers/bookings', { params }),
  updateBookingStatus: (id, data) => providerApi.put(`/caregivers/bookings/${id}`, data),
  getReports: (params) => providerApi.get('/caregivers/reports', { params }),
  getStats: () => providerApi.get('/caregivers/stats')
};

export const diagnosticsApi = {
  register: (data) => providerApi.post('/diagnostics/register', data),
  login: (data) => providerApi.post('/diagnostics/login', data),
  logout: () => providerApi.post('/diagnostics/logout'),
  verify: () => providerApi.get('/diagnostics/auth/verify'),
  getProfile: () => providerApi.get('/diagnostics/profile'),
  updateProfile: (data) => providerApi.put('/diagnostics/profile', data),
  getTests: () => providerApi.get('/diagnostics/tests'),
  addTest: (data) => providerApi.post('/diagnostics/tests', data),
  updateTest: (id, data) => providerApi.put(`/diagnostics/tests/${id}`, data),
  deleteTest: (id) => providerApi.delete(`/diagnostics/tests/${id}`),
  getPackages: () => providerApi.get('/diagnostics/packages'),
  addPackage: (data) => providerApi.post('/diagnostics/packages', data),
  updatePackage: (id, data) => providerApi.put(`/diagnostics/packages/${id}`, data),
  deletePackage: (id) => providerApi.delete(`/diagnostics/packages/${id}`),
  getBookings: (params) => providerApi.get('/diagnostics/bookings', { params }),
  updateBookingStatus: (id, data) => providerApi.put(`/diagnostics/bookings/${id}`, data),
  updateReport: (id, data) => providerApi.put(`/diagnostics/reports/${id}`, data),
  getReports: (params) => providerApi.get('/diagnostics/reports', { params }),
  getStats: () => providerApi.get('/diagnostics/stats')
};

export const lenderApi = {
  register: (data) => providerApi.post('/lender/register', data),
  login: (data) => providerApi.post('/lender/login', data),
  logout: () => providerApi.post('/lender/logout'),
  verify: () => providerApi.get('/lender/auth/verify'),
  getProfile: () => providerApi.get('/lender/profile'),
  updateProfile: (data) => providerApi.put('/lender/profile', data),
  getProducts: () => providerApi.get('/lender/products'),
  addProduct: (data) => providerApi.post('/lender/products', data),
  updateProduct: (id, data) => providerApi.put(`/lender/products/${id}`, data),
  deleteProduct: (id) => providerApi.delete(`/lender/products/${id}`),
  getApplications: (params) => providerApi.get('/lender/applications', { params }),
  updateApplicationStatus: (id, data) => providerApi.put(`/lender/applications/${id}`, data),
  getReports: (params) => providerApi.get('/lender/reports', { params }),
  getStats: () => providerApi.get('/lender/stats')
};

export const insuranceApi = {
  register: (data) => providerApi.post('/insurance/company/register', data),
  login: (data) => providerApi.post('/insurance/company/login', data),
  logout: () => providerApi.post('/insurance/company/logout'),
  verify: () => providerApi.get('/insurance/company/auth/verify'),
  getProfile: () => providerApi.get('/insurance/company/profile'),
  updateProfile: (data) => providerApi.put('/insurance/company/profile', data),
  getPlans: () => providerApi.get('/insurance/company/plans'),
  addPlan: (data) => providerApi.post('/insurance/company/plans', data),
  updatePlan: (id, data) => providerApi.put(`/insurance/company/plans/${id}`, data),
  deletePlan: (id) => providerApi.delete(`/insurance/company/plans/${id}`),
  getPolicies: (params) => providerApi.get('/insurance/company/policies', { params }),
  getClaims: (params) => providerApi.get('/insurance/company/claims', { params }),
  updateClaimStatus: (id, data) => providerApi.put(`/insurance/company/claims/${id}`, data),
  getSettlements: (params) => providerApi.get('/insurance/company/settlements', { params }),
  getReports: (params) => providerApi.get('/insurance/company/reports', { params }),
  getStats: () => providerApi.get('/insurance/company/stats')
};

export const providerAuth = {
  login: (type, data) => {
    switch(type) {
      case 'hospital': return hospitalApi.login(data);
      case 'ambulance': return ambulanceApi.login(data);
      case 'caregiver': return caregiverApi.login(data);
      case 'diagnostics': return diagnosticsApi.login(data);
      case 'lender': return lenderApi.login(data);
      case 'insurance': return insuranceApi.login(data);
      default: throw new Error('Invalid provider type');
    }
  },
  logout: (type) => {
    localStorage.removeItem('providerToken');
    localStorage.removeItem('providerType');
    localStorage.removeItem('providerId');
  },
  verify: (type) => {
    switch(type) {
      case 'hospital': return hospitalApi.verify();
      case 'ambulance': return ambulanceApi.verify();
      case 'caregiver': return caregiverApi.verify();
      case 'diagnostics': return diagnosticsApi.verify();
      case 'lender': return lenderApi.verify();
      case 'insurance': return insuranceApi.verify();
      default: throw new Error('Invalid provider type');
    }
  },
  getType: () => localStorage.getItem('providerType'),
  getToken: () => localStorage.getItem('providerToken'),
  isAuthenticated: () => !!localStorage.getItem('providerToken')
};