import axios from 'axios';

// ============================================
// AXIOS INSTANCE (PRESERVED)
// ============================================

const api = axios.create({
  baseURL: 'https://hospital-backend-production-8de3.up.railway.app/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// RESPONSE INTERCEPTOR (PRESERVED)
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH (PRESERVED)
// ============================================

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);

// ============================================
// 🆕 HOSPITALS - ENHANCED (UPDATED)
// ============================================

// Search with advanced filters
export const searchHospitals = (params) => api.get('/hospitals/search', { params });

// Get single hospital
export const getHospitalById = (id) => api.get(`/hospitals/${id}`);

// Get all hospitals (simple listing)
export const getHospitals = (params) => api.get('/hospitals', { params });

// Get hospital doctors
export const getHospitalDoctors = (hospitalId) => api.get(`/hospitals/${hospitalId}/doctors`);

// 🆕 Get doctors by specialization
export const getDoctorsBySpecialization = (hospitalId, specialization) => 
  api.get(`/hospitals/${hospitalId}/doctors`, { params: { specialization } });

// 🆕 Get hospital schemes
export const getHospitalSchemes = (hospitalId) => 
  api.get(`/hospitals/${hospitalId}/schemes`);

// 🆕 Get hospital facilities
export const getHospitalFacilities = (hospitalId) => 
  api.get(`/hospitals/${hospitalId}/facilities`);

// 🆕 Get hospital reviews
export const getHospitalReviews = (hospitalId, params) => 
  api.get(`/hospitals/${hospitalId}/reviews`, { params });

// 🆕 Get hospital bed status
export const getHospitalBedStatus = (hospitalId) => 
  api.get(`/hospitals/${hospitalId}/bed-status`);

// 🆕 Get nearby hospitals
export const getNearbyHospitals = (lat, lng, radius = 50) => 
  api.get('/hospitals/search', { params: { lat, lng, radius } });

// 🆕 Emergency search
export const emergencySearch = (params) => 
  api.get('/hospitals/search', { params: { ...params, emergency: 'true' } });

// 🆕 Filter by scheme
export const searchByScheme = (scheme, params = {}) => 
  api.get('/hospitals/search', { params: { ...params, scheme } });

// 🆕 Filter by insurance
export const searchByInsurance = (insurance, params = {}) => 
  api.get('/hospitals/search', { params: { ...params, insurance } });

// OPD Booking
export const bookOPD = (data) => api.post('/hospitals/book-opd', data);

// Admission Booking
export const bookAdmission = (data) => api.post('/hospitals/book-admission', data);

// ============================================
// 🆕 HOSPITAL PROVIDER FUNCTIONS (NEW)
// ============================================

// Update bed status (Web portal)
export const updateBedStatus = (hospitalId, data) => 
  api.put(`/hospitals/${hospitalId}/bed-status`, data);

// WhatsApp bed update
export const whatsappBedUpdate = (data) => 
  api.post('/hospitals/whatsapp-update', data);

// Upload doctors via Excel
export const uploadDoctorsExcel = (hospitalId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/hospitals/${hospitalId}/upload-doctors`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Upload hospital data via Excel (beds, pricing)
export const uploadHospitalDataExcel = (hospitalId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/hospitals/${hospitalId}/upload-data`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Download Excel template
export const downloadDoctorTemplate = () => 
  api.get('/hospitals/template/download', { responseType: 'blob' });

// Update hospital profile
export const updateHospitalProfile = (hospitalId, data) => 
  api.put(`/hospitals/${hospitalId}`, data);

// Update hospital schemes
export const updateHospitalSchemes = (hospitalId, data) => 
  api.put(`/hospitals/${hospitalId}/schemes`, data);

// Update hospital insurance
export const updateHospitalInsurance = (hospitalId, data) => 
  api.put(`/hospitals/${hospitalId}/insurance`, data);

// Update hospital facilities
export const updateHospitalFacilities = (hospitalId, data) => 
  api.put(`/hospitals/${hospitalId}/facilities`, data);

// Add single doctor
export const addDoctor = (hospitalId, data) => 
  api.post(`/hospitals/${hospitalId}/doctors`, data);

// Update doctor
export const updateDoctor = (hospitalId, doctorId, data) => 
  api.put(`/hospitals/${hospitalId}/doctors/${doctorId}`, data);

// Remove doctor
export const removeDoctor = (hospitalId, doctorId) => 
  api.delete(`/hospitals/${hospitalId}/doctors/${doctorId}`);

// Get hospital dashboard stats (provider)
export const getHospitalDashboardStats = () => 
  api.get('/hospitals/dashboard/stats');

// Get hospital bookings (provider)
export const getHospitalBookings = (params) => 
  api.get('/hospitals/bookings', { params });

// Get hospital analytics
export const getHospitalAnalytics = (params) => 
  api.get('/hospitals/analytics', { params });

// ============================================
// AMBULANCE (PRESERVED)
// ============================================

export const getAmbulances = (params) => api.get('/ambulance', { params });
export const bookAmbulance = (data) => api.post('/ambulance/book', data);
export const trackAmbulance = (bookingId) => api.get(`/ambulance/track/${bookingId}`);

// ============================================
// CAREGIVERS (PRESERVED)
// ============================================

export const getCaregivers = (params) => api.get('/caregivers', { params });
export const getCaregiverById = (id) => api.get(`/caregivers/${id}`);
export const bookCaregiver = (data) => api.post('/caregivers/book', data);

// ============================================
// DIAGNOSTICS (PRESERVED)
// ============================================

export const getDiagnostics = (params) => api.get('/diagnostics', { params });
export const getTests = (params) => api.get('/diagnostics/tests', { params });
export const getTestById = (id) => api.get(`/diagnostics/tests/${id}`);
export const getHealthPackages = (params) => api.get('/diagnostics/packages', { params });
export const getPackageById = (id) => api.get(`/diagnostics/packages/${id}`);
export const compareProviders = (testId, params) => api.get(`/diagnostics/compare/${testId}`, { params });
export const bookLabTest = (data) => api.post('/diagnostics/book', data);
export const getLabReports = (bookingId) => api.get(`/diagnostics/reports/${bookingId}`);
export const createCustomPackage = (data) => api.post('/diagnostics/custom-package', data);

// ============================================
// BOOKINGS (PRESERVED)
// ============================================

export const getMyBookings = (params) => api.get('/bookings/my-bookings', { params });
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const getBookingStatus = (id) => api.get(`/bookings/${id}/status`);

// ============================================
// PAYMENT (PRESERVED)
// ============================================

export const createPaymentOrder = (data) => api.post('/payment/create-order', data);
export const verifyPayment = (data) => api.post('/payment/verify', data);
export const getPaymentStatus = (orderId) => api.get(`/payment/status/${orderId}`);

// ============================================
// REVIEWS (PRESERVED)
// ============================================

export const getReviews = (params) => api.get('/reviews', { params });
export const createReview = (data) => api.post('/reviews', data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// ============================================
// ADMIN (PRESERVED)
// ============================================

export const getDashboardStats = () => api.get('/admin/stats');
export const getUsers = (params) => api.get('/admin/users', { params });
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// ============================================
// UPLOAD (PRESERVED)
// ============================================

export const uploadFile = (file, folder) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  return api.post('/upload', formData);
};
export const uploadMultipleFiles = (files, folder) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('folder', folder);
  return api.post('/upload/multiple', formData);
};

// ============================================
// AYURVEDA (PRESERVED)
// ============================================

export const getAyurvedaDoctors = (params) => api.get('/ayurveda/doctors', { params });
export const getAyurvedaDoctorById = (id) => api.get(`/ayurveda/doctors/${id}`);
export const getPanchakarmaCenters = (params) => api.get('/ayurveda/centers', { params });
export const getPanchakarmaCenterById = (id) => api.get(`/ayurveda/centers/${id}`);
export const bookAyurvedaConsultation = (data) => api.post('/ayurveda/book-consultation', data);
export const bookPanchakarmaPackage = (data) => api.post('/ayurveda/book-panchakarma', data);
export const getAyurvedaPrescription = (id) => api.get(`/ayurveda/prescriptions/${id}`);
export const submitAyurvedaPrescription = (data) => api.post('/ayurveda/prescriptions', data);
export const getAyurvedaReports = (params) => api.get('/ayurveda/reports', { params });
export const takePrakritiQuiz = (data) => api.post('/ayurveda/prakriti-quiz', data);
export const getPrakritiResult = (id) => api.get(`/ayurveda/prakriti-result/${id}`);

// ============================================
// HOMEOPATHY (PRESERVED)
// ============================================

export const getHomeopathyDoctors = (params) => api.get('/homeopathy/doctors', { params });
export const getHomeopathyDoctorById = (id) => api.get(`/homeopathy/doctors/${id}`);
export const getNaturopathyCenters = (params) => api.get('/homeopathy/naturopathy', { params });
export const getPharmacyProducts = (params) => api.get('/homeopathy/pharmacy', { params });
export const bookHomeopathyConsultation = (data) => api.post('/homeopathy/book-consultation', data);
export const orderHomeopathyMedicine = (data) => api.post('/homeopathy/order-medicine', data);
export const getHomeopathyPrescription = (id) => api.get(`/homeopathy/prescriptions/${id}`);

// ============================================
// INSURANCE (PRESERVED)
// ============================================

export const getInsurancePlans = (params) => api.get('/insurance/plans', { params });
export const getFeaturedPlans = () => api.get('/insurance/plans/featured');
export const getPopularPlans = () => api.get('/insurance/plans/popular');
export const getInsurancePlanById = (id) => api.get(`/insurance/plans/${id}`);
export const getInsuranceCompanies = () => api.get('/insurance/companies');
export const calculatePremium = (data) => api.post('/insurance/calculate-premium', data);
export const applyInsurance = (data) => api.post('/insurance/apply', data);
export const verifyInsurancePayment = (data) => api.post('/insurance/verify-payment', data);
export const getMyPolicies = () => api.get('/insurance/my-policies');
export const getPolicyById = (id) => api.get(`/insurance/my-policies/${id}`);
export const cancelPolicy = (id, data) => api.post(`/insurance/cancel-policy/${id}`, data);
export const downloadPolicy = (id) => api.get(`/insurance/download-policy/${id}`);
export const submitClaim = (data) => api.post('/insurance/claims', data);
export const getClaims = (policyId) => api.get(`/insurance/claims/${policyId}`);
export const getClaimById = (policyId, claimId) => api.get(`/insurance/claims/${policyId}/${claimId}`);
export const getInsuranceStats = () => api.get('/insurance/stats');

// ============================================
// OTP (PRESERVED)
// ============================================

export const sendOTP = (data) => api.post('/otp/send', data);
export const verifyOTP = (data) => api.post('/otp/verify', data);
export const resendOTP = (data) => api.post('/otp/resend', data);
export const getOTPStatus = (params) => api.get('/otp/status', { params });

// ============================================
// INSURANCE ADMIN (PRESERVED)
// ============================================

export const getInsuranceCompaniesAdmin = (params) => api.get('/insurance-admin/companies', { params });
export const verifyInsuranceCompany = (id, data) => api.put(`/insurance-admin/companies/${id}/verify`, data);
export const getInsuranceCompanyDetails = (id) => api.get(`/insurance-admin/companies/${id}`);
export const createInsurancePlan = (data) => api.post('/insurance-admin/plans', data);
export const updateInsurancePlan = (id, data) => api.put(`/insurance-admin/plans/${id}`, data);
export const toggleInsurancePlanStatus = (id) => api.patch(`/insurance-admin/plans/${id}/toggle-status`);
export const deleteInsurancePlan = (id) => api.delete(`/insurance-admin/plans/${id}`);
export const getPoliciesAdmin = (params) => api.get('/insurance-admin/policies', { params });
export const getPolicyDetailsAdmin = (id) => api.get(`/insurance-admin/policies/${id}`);
export const getPendingSettlements = () => api.get('/insurance-admin/settlements/pending');
export const processSettlements = (data) => api.post('/insurance-admin/settlements/process', data);
export const getSalesReport = (params) => api.get('/insurance-admin/reports/sales', { params });
export const getCommissionReport = (params) => api.get('/insurance-admin/reports/commission', { params });
export const getSummaryReport = () => api.get('/insurance-admin/reports/summary');

// ============================================
// LOAN (PRESERVED)
// ============================================

export const applyLoan = (data) => api.post('/loan/patient/apply', data);
export const getLoanApplications = (params) => api.get('/loan/patient/applications', { params });
export const getLoanApplicationById = (id) => api.get(`/loan/patient/applications/${id}`);
export const getLenderDashboard = () => api.get('/loan/lender/dashboard');
export const getLenderApplications = (params) => api.get('/loan/lender/applications', { params });
export const updateLenderApplication = (id, data) => api.put(`/loan/lender/applications/${id}`, data);
export const getAdminLoans = (params) => api.get('/loan/admin/loans', { params });
export const updateAdminLoan = (id, data) => api.put(`/loan/admin/loans/${id}`, data);

// ============================================
// LENDER (PRESERVED)
// ============================================

export const lenderLogin = (data) => api.post('/lender/auth/login', data);
export const lenderRegister = (data) => api.post('/lender/auth/register', data);
export const getLenderProfile = () => api.get('/lender/profile');
export const updateLenderProfile = (data) => api.put('/lender/profile', data);
export const getLenderStats = () => api.get('/lender/stats');

// ============================================
// PROVIDER (PRESERVED)
// ============================================

export const providerLogin = (data) => api.post('/provider-auth/login', data);
export const providerRegister = (data) => api.post('/provider-auth/register', data);
export const getProviderProfile = () => api.get('/provider-auth/profile');
export const updateProviderProfile = (data) => api.put('/provider-auth/profile', data);
export const getProviderStats = () => api.get('/provider-auth/stats');

// ============================================
// EXPORT DEFAULT (PRESERVED)
// ============================================

export default api;