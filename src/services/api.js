import axios from 'axios';

// ============================================
// AXIOS INSTANCE
// ============================================

const api = axios.create({
  baseURL: 'https://hospital-backend-production-f1b1.up.railway.app/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('providerToken') || localStorage.getItem('doctorToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// RESPONSE INTERCEPTOR - FIXED
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      localStorage.removeItem('token');
      localStorage.removeItem('providerToken');
      localStorage.removeItem('doctorToken');
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH
// ============================================

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);

// ============================================
// HOSPITALS
// ============================================

export const searchHospitals = (params) => api.get('/hospitals/search', { params });
export const getHospitalById = (id) => api.get(`/hospitals/${id}`);
export const getHospitals = (params) => api.get('/hospitals', { params });
export const getHospitalDoctors = (hospitalId) => api.get(`/hospitals/${hospitalId}/doctors`);
export const getDoctorsBySpecialization = (hospitalId, specialization) => api.get(`/hospitals/${hospitalId}/doctors`, { params: { specialization } });
export const getHospitalSchemes = (hospitalId) => api.get(`/hospitals/${hospitalId}/schemes`);
export const getHospitalFacilities = (hospitalId) => api.get(`/hospitals/${hospitalId}/facilities`);
export const getHospitalReviews = (hospitalId, params) => api.get(`/hospitals/${hospitalId}/reviews`, { params });
export const getHospitalBedStatus = (hospitalId) => api.get(`/hospitals/${hospitalId}/bed-status`);
export const getNearbyHospitals = (lat, lng, radius = 50) => api.get('/hospitals/search', { params: { lat, lng, radius } });
export const emergencySearch = (params) => api.get('/hospitals/search', { params: { ...params, emergency: 'true' } });
export const searchByScheme = (scheme, params = {}) => api.get('/hospitals/search', { params: { ...params, scheme } });
export const searchByInsurance = (insurance, params = {}) => api.get('/hospitals/search', { params: { ...params, insurance } });
export const bookOPD = (data) => api.post('/hospitals/book-opd', data);
export const bookAdmission = (data) => api.post('/hospitals/book-admission', data);
export const updateBedStatus = (hospitalId, data) => api.put(`/hospitals/${hospitalId}/bed-status`, data);
export const whatsappBedUpdate = (data) => api.post('/hospitals/whatsapp-update', data);
export const uploadDoctorsExcel = (hospitalId, file) => { const f = new FormData(); f.append('file', file); return api.post(`/hospitals/${hospitalId}/upload-doctors`, f, { headers: { 'Content-Type': 'multipart/form-data' } }); };
export const uploadHospitalDataExcel = (hospitalId, file) => { const f = new FormData(); f.append('file', file); return api.post(`/hospitals/${hospitalId}/upload-data`, f, { headers: { 'Content-Type': 'multipart/form-data' } }); };
export const downloadDoctorTemplate = () => api.get('/hospitals/template/download', { responseType: 'blob' });
export const updateHospitalProfile = (hospitalId, data) => api.put(`/hospitals/${hospitalId}`, data);
export const updateHospitalSchemes = (hospitalId, data) => api.put(`/hospitals/${hospitalId}/schemes`, data);
export const updateHospitalInsurance = (hospitalId, data) => api.put(`/hospitals/${hospitalId}/insurance`, data);
export const updateHospitalFacilities = (hospitalId, data) => api.put(`/hospitals/${hospitalId}/facilities`, data);
export const addDoctor = (hospitalId, data) => api.post(`/hospitals/${hospitalId}/doctors`, data);
export const updateDoctor = (hospitalId, doctorId, data) => api.put(`/hospitals/${hospitalId}/doctors/${doctorId}`, data);
export const removeDoctor = (hospitalId, doctorId) => api.delete(`/hospitals/${hospitalId}/doctors/${doctorId}`);
export const getHospitalDashboardStats = () => api.get('/hospitals/dashboard/stats');
export const getHospitalBookings = (params) => api.get('/hospitals/bookings', { params });
export const getHospitalAnalytics = (params) => api.get('/hospitals/analytics', { params });
export const getBulkHospitalStatus = (hospitalIds) => api.post('/hospital-status/bulk', { hospitalIds });
export const reportHospitalWaitTime = (hospitalId, waitMinutes) => api.post(`/hospital-status/${hospitalId}/wait-time`, { waitMinutes });

// ============================================
// AMBULANCE
// ============================================

export const emergencyDispatch = (data) => api.post('/ambulance/emergency-dispatch', data);
export const acceptEmergency = (bookingId, data) => api.post(`/ambulance/accept-emergency/${bookingId}`, data);
export const ambulanceTripStart = (bookingId) => api.post(`/ambulance/trip-start/${bookingId}`);
export const ambulancePatientOnboard = (bookingId, data) => api.post(`/ambulance/patient-onboard/${bookingId}`, data);
export const ambulanceArrivedHospital = (bookingId, data) => api.post(`/ambulance/arrived-hospital/${bookingId}`, data);
export const ambulanceTripComplete = (bookingId, data) => api.post(`/ambulance/trip-complete/${bookingId}`, data);
export const ambulanceCancelEmergency = (bookingId, data) => api.post(`/ambulance/cancel-emergency/${bookingId}`, data);
export const ambulanceUpdateLocation = (data) => api.post('/ambulance/update-location', data);
export const getNearbyAmbulances = (params) => api.get('/ambulance/nearby-ambulances', { params });
export const getActiveEmergency = (bookingId) => api.get(`/ambulance/active-emergency/${bookingId}`);
export const getSurgeCheck = (params) => api.get('/ambulance/surge-check', { params });
export const scheduleTransport = (data) => api.post('/ambulance/schedule-transport', data);
export const getScheduledBookings = () => api.get('/ambulance/scheduled-bookings');
export const getAmbulanceBookings = (params) => api.get('/ambulance/my-bookings', { params });
export const getAmbulanceBookingById = (bookingId) => api.get(`/ambulance/booking/${bookingId}`);
export const getTripSheet = (bookingId) => api.get(`/ambulance/trip-sheet/${bookingId}`);
export const getDriverDashboard = () => api.get('/ambulance/driver/dashboard');
export const toggleDriverAvailability = (data) => api.post('/ambulance/driver/toggle-availability', data);
export const getDriverTripHistory = (params) => api.get('/ambulance/driver/trip-history', { params });
export const getAmbulanceFareEstimate = (params) => api.get('/ambulance/fare-estimate', { params });
export const getEmergencyContacts = () => api.get('/ambulance/emergency-contacts');
export const updateEmergencyContacts = (data) => api.post('/ambulance/emergency-contacts', data);
export const sendSOSSMS = (data) => api.post('/ambulance/send-sos-sms', data);
export const notifyHospital = (data) => api.post('/ambulance/notify-hospital', data);
export const getAmbulances = (params) => api.get('/ambulance', { params });
export const bookAmbulance = (data) => api.post('/ambulance/book', data);
export const trackAmbulance = (bookingId) => api.get(`/ambulance/track/${bookingId}`);

// ============================================
// CAREGIVERS
// ============================================

export const getCaregivers = (params) => api.get('/caregivers', { params });
export const getCaregiverById = (id) => api.get(`/caregivers/${id}`);
export const getAICaregiverMatch = (data) => api.post('/caregivers/ai-match', data);
export const getCaregiverSuggestions = (query) => api.get('/caregivers/suggestions', { params: { q: query } });
export const caregiverLogin = (data) => api.post('/caregivers/login', data);
export const caregiverRegister = (data) => api.post('/caregivers/profile', data);
export const getCaregiverProfile = () => api.get('/caregivers/profile/me');
export const updateCaregiverProfile = (data) => api.post('/caregivers/profile', data);
export const bookCaregiver = (data) => api.post('/caregivers/book', data);
export const getMyCaregiverBookings = () => api.get('/caregivers/my-bookings');
export const getCaregiverDashboard = () => api.get('/caregivers/dashboard/stats');
export const toggleCaregiverAvailability = (data) => api.put('/caregivers/availability', data);
export const checkinCaregiver = (bookingId, data) => api.post(`/caregivers/checkin/${bookingId}`, data);
export const checkoutCaregiver = (bookingId, data) => api.post(`/caregivers/checkout/${bookingId}`, data);
export const rateCaregiver = (bookingId, data) => api.post(`/caregivers/rate/${bookingId}`, data);

// ============================================
// DIAGNOSTICS
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
// BOOKINGS
// ============================================

export const getMyBookings = (params) => api.get('/bookings/my-bookings', { params });
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const getBookingStatus = (id) => api.get(`/bookings/${id}/status`);

// ============================================
// PAYMENT
// ============================================

export const createPaymentOrder = (data) => api.post('/payment/create-order', data);
export const verifyPayment = (data) => api.post('/payment/verify', data);
export const getPaymentStatus = (orderId) => api.get(`/payment/status/${orderId}`);

// ============================================
// REVIEWS
// ============================================

export const getReviews = (params) => api.get('/reviews', { params });
export const createReview = (data) => api.post('/reviews', data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// ============================================
// ADMIN
// ============================================

export const getDashboardStats = () => api.get('/admin/stats');
export const getUsers = (params) => api.get('/admin/users', { params });
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// ============================================
// UPLOAD
// ============================================

export const uploadFile = (file, folder) => { const f = new FormData(); f.append('file', file); f.append('folder', folder); return api.post('/upload', f); };
export const uploadMultipleFiles = (files, folder) => { const f = new FormData(); files.forEach(file => f.append('files', file)); f.append('folder', folder); return api.post('/upload/multiple', f); };

// ============================================
// AYURVEDA
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
// AYURVEDA PRODUCTS & PANCHAKARMA
// ============================================

export const getAyurvedaProducts = (params) => api.get('/ayurveda/products', { params });
export const getAyurvedaProductById = (id) => api.get(`/ayurveda/products/${id}`);
export const getProductsByPrakriti = (prakritiType) => api.get(`/ayurveda/products/prakriti/${prakritiType}`);
export const getPanchakarmaProgress = (bookingId) => api.get(`/ayurveda/panchakarma-progress/${bookingId}`);
export const updatePanchakarmaLog = (bookingId, data) => api.put(`/ayurveda/panchakarma-progress/${bookingId}`, data);
export const getSeasonalRecommendations = () => api.get('/ayurveda/seasonal-recommendations');

// ============================================
// HOMEOPATHY
// ============================================

export const getHomeopathyDoctors = (params) => api.get('/homeopathy/doctors', { params });
export const getHomeopathyDoctorById = (id) => api.get(`/homeopathy/doctors/${id}`);
export const getNaturopathyCenters = (params) => api.get('/homeopathy/naturopathy', { params });
export const getPharmacyProducts = (params) => api.get('/homeopathy/pharmacy', { params });
export const bookHomeopathyConsultation = (data) => api.post('/homeopathy/book-consultation', data);
export const orderHomeopathyMedicine = (data) => api.post('/homeopathy/order-medicine', data);
export const getHomeopathyPrescription = (id) => api.get(`/homeopathy/prescriptions/${id}`);

// ============================================
// INSURANCE
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
// OTP
// ============================================

export const sendOTP = (data) => api.post('/otp/send', data);
export const verifyOTP = (data) => api.post('/otp/verify', data);
export const resendOTP = (data) => api.post('/otp/resend', data);
export const getOTPStatus = (params) => api.get('/otp/status', { params });

// ============================================
// INSURANCE ADMIN
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
// LOAN
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
// LENDER
// ============================================

export const lenderLogin = (data) => api.post('/lender/auth/login', data);
export const lenderRegister = (data) => api.post('/lender/auth/register', data);
export const getLenderProfile = () => api.get('/lender/profile');
export const updateLenderProfile = (data) => api.put('/lender/profile', data);
export const getLenderStats = () => api.get('/lender/stats');

// ============================================
// PROVIDER
// ============================================

export const providerLogin = (data) => api.post('/provider-auth/login', data);
export const providerRegister = (data) => api.post('/provider-auth/register', data);
export const getProviderProfile = () => api.get('/provider-auth/profile');
export const updateProviderProfile = (data) => api.put('/provider-auth/profile', data);
export const getProviderStats = () => api.get('/provider-auth/stats');

// ============================================
// ONLINE DOCTOR
// ============================================

export const searchOnlineDoctors = (params) => api.get('/online-doctor/search', { params });
export const getFeaturedOnlineDoctors = () => api.get('/online-doctor/doctors/featured');
export const getOnlineDoctorById = (id) => api.get(`/online-doctor/doctor/${id}`);
export const getDoctorPricing = (doctorId, patientId) => api.get(`/online-doctor/${doctorId}/pricing${patientId ? `?patientId=${patientId}` : ''}`);
export const bookOnlineConsult = (data) => api.post('/online-doctor/book', data);
export const getOnlineConsultations = () => api.get('/online-doctor/my-bookings');
export const getOnlineConsultById = (id) => api.get(`/online-doctor/booking/${id}`);
export const cancelOnlineConsult = (id, reason) => api.put(`/online-doctor/booking/${id}/cancel`, { reason });
export const submitOnlineReview = (data) => api.post('/online-doctor/review', data);
export const onlineDoctorRegister = (data) => api.post('/online-doctor/doctor/register', data);
export const onlineDoctorLogin = (data) => api.post('/online-doctor/doctor/login', data);
export const getOnlineDoctorProfile = () => api.get('/online-doctor/doctor/profile');
export const updateOnlineDoctorProfile = (data) => api.put('/online-doctor/doctor/profile', data);
export const updateOnlineDoctorAvailability = (data) => api.put('/online-doctor/doctor/availability', data);
export const getOnlineDoctorDashboard = () => api.get('/online-doctor/doctor/dashboard');
export const getDoctorFeeSettings = () => api.get('/online-doctor/fee-settings');
export const updateDoctorFeeSettings = (data) => api.put('/online-doctor/fee-settings', data);
export const getPendingOnlineDoctors = () => api.get('/online-doctor/admin/doctors/pending');
export const getAllOnlineDoctors = () => api.get('/online-doctor/admin/doctors');
export const verifyOnlineDoctor = (id, data) => api.put(`/online-doctor/admin/doctor/${id}/verify`, data);
export const autoGenerateSlots = (data) => api.post('/online-doctor/doctor/auto-generate-slots', data);
export const getDoctorAnalytics = (params) => api.get('/online-doctor/doctor/analytics', { params });
export const sendConsultReminder = (data) => api.post('/online-doctor/send-reminder', data);
export const savePrescription = (data) => api.post('/online-doctor/prescription', data);
export const completeConsultation = (id) => api.put(`/online-doctor/booking/${id}/complete`);
export const doctorForgotPassword = (data) => api.post('/online-doctor/doctor/forgot-password', data);
export const doctorResetPassword = (token, data) => api.post(`/online-doctor/doctor/reset-password/${token}`, data);
export const doctorSendOTP = (data) => api.post('/online-doctor/doctor/send-otp', data);
export const doctorVerifyOTP = (data) => api.post('/online-doctor/doctor/verify-otp', data);

// ============================================
// CORPORATE
// ============================================

export const registerCompany = (data) => api.post('/corporate/company/register', data);
export const employeeBook = (data) => api.post('/corporate/employee/book', data);

export default api;
