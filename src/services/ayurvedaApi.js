import api from './api';

const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall;
    return response;
  } catch (error) {
    console.log('API fallback:', error.message);
    return { data: { success: false, data: [] } };
  }
};

// ============================================
// DOCTOR APIs
// ============================================
export const getAyurvedaDoctors = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.specialization) params.append('specialization', filters.specialization);
  if (filters.experience) params.append('minExperience', filters.experience);
  if (filters.available) params.append('available', 'true');
  return safeApiCall(api.get(`/ayurveda/doctors?${params.toString()}`));
};

export const getAyurvedaDoctorById = (id) => safeApiCall(api.get(`/ayurveda/doctors/${id}`));
export const getFeaturedDoctors = () => safeApiCall(api.get('/ayurveda/doctors/featured'));

// ============================================
// LOCATION SEARCH APIs
// ============================================
export const searchDoctors = (params) => safeApiCall(api.get('/ayurveda/search', { params }));
export const getNearbyDoctors = (lat, lng, radius = 10) => safeApiCall(api.get('/ayurveda/nearby', { params: { lat, lng, radius } }));
export const getRecommendedDoctors = (lat, lng, symptoms) => safeApiCall(api.get('/ayurveda/recommend', { params: { lat, lng, symptoms } }));

// ============================================
// PANCHAKARMA APIs
// ============================================
export const getPanchakarmaCenters = (filters = {}) => safeApiCall(api.get('/ayurveda/centers', { params: filters }));
export const getPanchakarmaCenterById = (id) => safeApiCall(api.get(`/ayurveda/centers/${id}`));
export const getCenterPackages = (centerId) => safeApiCall(api.get(`/ayurveda/centers/${centerId}/packages`));

// ============================================
// 🆕 BOOKING APIs (UPDATED - NEW ENDPOINTS)
// ============================================

// Create booking (returns Razorpay order + OTP)
export const createBooking = (bookingData) => {
  return api.post('/ayurveda/bookings/create', bookingData);
};

// Verify payment (after Razorpay success)
export const verifyBookingPayment = (paymentData) => {
  return api.post('/ayurveda/bookings/verify-payment', paymentData);
};

// Verify OTP (confirm booking)
export const verifyBookingOtp = (bookingId, otp) => {
  return api.post('/ayurveda/bookings/verify-otp', { bookingId, otp });
};

// Resend OTP
export const resendBookingOtp = (bookingId) => {
  return api.post('/ayurveda/bookings/resend-otp', { bookingId });
};

// Get my bookings
export const getMyBookings = (params = {}) => {
  return safeApiCall(api.get('/ayurveda/bookings/my-bookings', { params }));
};

// Get booking details
export const getBookingDetails = (bookingId) => {
  return safeApiCall(api.get(`/ayurveda/bookings/${bookingId}`));
};

// Cancel booking
export const cancelBooking = (bookingId, reason) => {
  return api.put(`/ayurveda/bookings/${bookingId}/cancel`, { reason });
};

// Reschedule booking
export const rescheduleBooking = (bookingId, newDate, newSlot, reason) => {
  return api.put(`/ayurveda/bookings/${bookingId}/reschedule`, { newDate, newSlot, reason });
};

// Submit review
export const submitBookingReview = (bookingId, rating, comment) => {
  return api.post(`/ayurveda/bookings/${bookingId}/review`, { rating, comment });
};

// Doctor bookings
export const getDoctorBookings = (doctorId, params = {}) => {
  return safeApiCall(api.get(`/ayurveda/bookings/doctor/${doctorId}`, { params }));
};

// Center bookings
export const getCenterBookings = (centerId, params = {}) => {
  return safeApiCall(api.get(`/ayurveda/bookings/center/${centerId}`, { params }));
};

// Update booking status (doctor/center)
export const updateBookingStatus = (bookingId, action, prescription = null) => {
  return api.put(`/ayurveda/bookings/${bookingId}/status`, { action, prescription });
};

// ============================================
// 🆕 SETTLEMENT APIs (NEW)
// ============================================

// Get provider earnings
export const getProviderEarnings = (providerType, providerId) => {
  return safeApiCall(api.get(`/ayurveda/settlements/earnings/${providerType}/${providerId}`));
};

// Request settlement
export const requestSettlement = (providerType, providerId) => {
  return api.post('/ayurveda/settlements/request', { providerType, providerId });
};

// Get settlement history
export const getSettlementHistory = (providerType, providerId) => {
  return safeApiCall(api.get(`/ayurveda/settlements/history/${providerType}/${providerId}`));
};

// ============================================
// 🆕 PAYMENT APIs (UPDATED)
// ============================================

// Initiate payment (create Razorpay order)
export const initiatePayment = (bookingData) => {
  // This is now handled in createBooking
  return api.post('/payment/create-order', bookingData);
};

// Verify Razorpay payment
export const verifyRazorpayPayment = (paymentData) => {
  return api.post('/payment/verify', paymentData);
};

// ============================================
// PRAKRITI APIs
// ============================================
export const submitPrakritiResult = (resultData) => api.post('/ayurveda/prakriti', resultData);
export const getPrakritiHistory = (patientId) => api.get(`/ayurveda/prakriti/history/${patientId}`);

// ============================================
// 🆕 PRODUCT APIs
// ============================================
export const getAyurvedaProducts = (params = {}) => {
  return safeApiCall(api.get('/ayurveda/products', { params }));
};

export const getProductById = (productId) => {
  return safeApiCall(api.get(`/ayurveda/products/${productId}`));
};

export const getProductsByPrakriti = (prakritiType) => {
  return safeApiCall(api.get(`/ayurveda/products/prakriti/${prakritiType}`));
};

export const getSeasonalRecommendations = () => {
  return safeApiCall(api.get('/ayurveda/seasonal-recommendations'));
};