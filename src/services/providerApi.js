import axios from 'axios';

const ADMIN_KEY = 'admin_secret_key_2024_hospitalhub_production_secure';

// JWT-based admin header for insurance. Falls back to ADMIN_KEY for backward compat.
const insuranceAdminHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : { 'x-admin-key': ADMIN_KEY };
};

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2d5.up.railway.app';

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
  getStats: () => providerApi.get('/ambulance/stats'),
  getFinancialSummary: (params) => providerApi.get('/ambulance/financial-summary', { params }),
  requestSettlement: () => providerApi.post('/ambulance/settlements/request'),
  getActiveTrips: () => providerApi.get('/ambulance/active-trips'),
  getComplaints: () => providerApi.get('/ambulance/complaints'),
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
  // ============================================
  // AUTH & PROFILE (existing)
  // ============================================
  register: (data) => providerApi.post('/insurance/company/register', data),
  login: (data) => providerApi.post('/insurance/company/login', data),
  logout: () => providerApi.post('/insurance/company/logout'),
  verify: () => providerApi.get('/insurance/company/auth/verify'),
  getProfile: () => providerApi.get('/insurance/company/profile'),
  updateProfile: (data) => providerApi.put('/insurance/company/profile', data),

  // ============================================
  // PLANS (existing)
  // ============================================
  getPlans: () => providerApi.get('/insurance/company/plans'),
  addPlan: (data) => providerApi.post('/insurance/company/plans', data),
  updatePlan: (id, data) => providerApi.put(`/insurance/company/plans/${id}`, data),
  deletePlan: (id) => providerApi.delete(`/insurance/company/plans/${id}`),

  // ============================================
  // POLICIES (existing)
  // ============================================
  getPolicies: (params) => providerApi.get('/insurance/company/policies', { params }),

  // ============================================
  // CLAIMS (existing)
  // ============================================
  getClaims: (params) => providerApi.get('/insurance/company/claims', { params }),
  updateClaimStatus: (id, data) => providerApi.put(`/insurance/company/claims/${id}`, data),

  // ============================================
  // SETTLEMENTS & REPORTS (existing)
  // ============================================
  getSettlements: (params) => providerApi.get('/insurance/company/settlements', { params }),
  getReports: (params) => providerApi.get('/insurance/company/reports', { params }),
  getStats: () => providerApi.get('/insurance/company/dashboard'),

  // ============================================
  // COMPLAINTS (NEW)
  // ============================================
  getCompanyComplaints: (params) => providerApi.get('/insurance/company/complaints', { params }),
  getCompanyComplaint: (id) => providerApi.get(`/insurance/company/complaints/${id}`),
  respondToComplaint: (id, data) => providerApi.post(`/insurance/company/complaints/${id}/respond`, data),
  resolveComplaint: (id, data) => providerApi.post(`/insurance/company/complaints/${id}/resolve`, data),

  // ============================================
  // REVIEWS (NEW)
  // ============================================
  getCompanyReviews: (params) => providerApi.get('/insurance/company/reviews', { params }),
  respondToReview: (policyId, data) => providerApi.post(`/insurance/company/reviews/${policyId}/respond`, data),

  // ============================================
  // CORPORATE (NEW)
  // ============================================
  toggleCorporate: (data) => providerApi.post('/insurance/company/corporate/toggle', data),
  getCorporatePackages: () => providerApi.get('/insurance/company/corporate/packages'),
  getCorporateEnquiries: () => providerApi.get('/insurance/company/corporate/enquiries'),

  // ============================================
  // KYC (NEW)
  // ============================================
  getKyc: () => providerApi.get('/insurance/company/kyc'),
  submitKyc: (data) => providerApi.post('/insurance/company/kyc/submit', data),
  getSuspendedStatus: () => providerApi.get('/insurance/company/suspended-status'),

  // ============================================
  // ADVERTISING (NEW — insurer)
  // ============================================
  getAdWallet: () => providerApi.get('/insurance/company/ads/wallet'),
  topupAdWallet: (data) => providerApi.post('/insurance/company/ads/wallet/topup', data),
  getAdCampaigns: (params) => providerApi.get('/insurance/company/ads/campaigns', { params }),
  createAdCampaign: (data) => providerApi.post('/insurance/company/ads/campaigns', data),
  pauseAdCampaign: (id) => providerApi.post(`/insurance/company/ads/campaigns/${id}/pause`),
  resumeAdCampaign: (id) => providerApi.post(`/insurance/company/ads/campaigns/${id}/resume`),
  deleteAdCampaign: (id) => providerApi.delete(`/insurance/company/ads/campaigns/${id}`),
  getAdAnalytics: (params) => providerApi.get('/insurance/company/ads/analytics', { params }),

  // ============================================
  // ADMIN — OVERVIEW (NEW)
  // ============================================
  adminOverview: () => providerApi.get('/insurance/admin/overview', { headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — COMPANIES (NEW)
  // ============================================
  adminGetCompanies: (params) => providerApi.get('/insurance/admin/companies', { params, headers: insuranceAdminHeaders() }),
  adminApproveCompany: (id) => providerApi.post(`/insurance/admin/companies/${id}/approve`, {}, { headers: insuranceAdminHeaders() }),
  adminRejectCompany: (id, data) => providerApi.post(`/insurance/admin/companies/${id}/reject`, data, { headers: insuranceAdminHeaders() }),
  adminSuspendCompany: (id, data) => providerApi.post(`/insurance/admin/companies/${id}/suspend`, data, { headers: insuranceAdminHeaders() }),
  adminUnsuspendCompany: (id) => providerApi.post(`/insurance/admin/companies/${id}/unsuspend`, {}, { headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — PLANS (NEW)
  // ============================================
  adminGetPlans: (params) => providerApi.get('/insurance/admin/plans', { params, headers: insuranceAdminHeaders() }),
  adminApprovePlan: (id) => providerApi.post(`/insurance/admin/plans/${id}/approve`, {}, { headers: insuranceAdminHeaders() }),
  adminRejectPlan: (id, data) => providerApi.post(`/insurance/admin/plans/${id}/reject`, data, { headers: insuranceAdminHeaders() }),
  adminTogglePlan: (id) => providerApi.post(`/insurance/admin/plans/${id}/toggle`, {}, { headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — POLICIES (NEW)
  // ============================================
  adminGetPolicies: (params) => providerApi.get('/insurance/admin/policies', { params, headers: insuranceAdminHeaders() }),
  adminForceCancelPolicy: (id, data) => providerApi.post(`/insurance/admin/policies/${id}/force-cancel`, data, { headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — CLAIMS (NEW)
  // ============================================
  adminGetClaims: (params) => providerApi.get('/insurance/admin/claims', { params, headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — PENDING QUEUE (NEW)
  // ============================================
  adminGetPending: () => providerApi.get('/insurance/admin/pending', { headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — REVIEWS (NEW)
  // ============================================
  adminGetReviews: (params) => providerApi.get('/insurance/admin/reviews', { params, headers: insuranceAdminHeaders() }),
  adminFlagReview: (policyId, data) => providerApi.post(`/insurance/admin/reviews/${policyId}/flag`, data, { headers: insuranceAdminHeaders() }),
  adminHideReview: (policyId, data) => providerApi.post(`/insurance/admin/reviews/${policyId}/hide`, data, { headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — COMPLAINTS (NEW)
  // ============================================
  adminGetComplaints: (params) => providerApi.get('/insurance/admin/complaints', { params, headers: insuranceAdminHeaders() }),
  adminEscalateComplaint: (id, data) => providerApi.post(`/insurance/admin/complaints/${id}/escalate`, data, { headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — KYC (NEW)
  // ============================================
  adminGetKycPending: () => providerApi.get('/insurance/admin/kyc/pending', { headers: insuranceAdminHeaders() }),
  adminVerifyKyc: (companyId) => providerApi.post(`/insurance/admin/kyc/${companyId}/verify`, {}, { headers: insuranceAdminHeaders() }),
  adminRejectKyc: (companyId, data) => providerApi.post(`/insurance/admin/kyc/${companyId}/reject`, data, { headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — SUSPENDED (NEW)
  // ============================================
  adminGetSuspended: () => providerApi.get('/insurance/admin/suspended', { headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — CORPORATE (NEW)
  // ============================================
  adminGetCorporatePending: () => providerApi.get('/insurance/admin/corporate/pending', { headers: insuranceAdminHeaders() }),

  // ============================================
  // ADMIN — ADVERTISING (NEW)
  // ============================================
  adminGetAdCampaigns: (params) => providerApi.get('/insurance/admin/ads/campaigns', { params, headers: insuranceAdminHeaders() }),
  adminApproveAdCampaign: (id) => providerApi.post(`/insurance/admin/ads/campaigns/${id}/approve`, {}, { headers: insuranceAdminHeaders() }),
  adminRejectAdCampaign: (id, data) => providerApi.post(`/insurance/admin/ads/campaigns/${id}/reject`, data, { headers: insuranceAdminHeaders() }),
  adminPauseAdCampaign: (id) => providerApi.post(`/insurance/admin/ads/campaigns/${id}/pause`, {}, { headers: insuranceAdminHeaders() }),
  adminGetAdRevenue: (params) => providerApi.get('/insurance/admin/ads/revenue', { params, headers: insuranceAdminHeaders() })
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

