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

// Doctor APIs
export const getAyurvedaDoctors = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.specialization) params.append('specialization', filters.specialization);
  if (filters.experience) params.append('minExperience', filters.experience);
  if (filters.available) params.append('available', 'true');
  return safeApiCall(api.get(`/ayurveda/doctors?${params.toString()}`));
};

export const getAyurvedaDoctorById = (id) => safeApiCall(api.get(`/ayurveda/doctors/${id}`));
export const getFeaturedDoctors = () => safeApiCall(api.get('/ayurveda/doctors/featured'));

// 🆕 Location Search APIs
export const searchDoctors = (params) => safeApiCall(api.get('/ayurveda/search', { params }));
export const getNearbyDoctors = (lat, lng, radius = 10) => safeApiCall(api.get('/ayurveda/nearby', { params: { lat, lng, radius } }));
export const getRecommendedDoctors = (lat, lng, symptoms) => safeApiCall(api.get('/ayurveda/recommend', { params: { lat, lng, symptoms } }));

// 🆕 Panchakarma APIs
export const getPanchakarmaCenters = (filters = {}) => safeApiCall(api.get('/ayurveda/centers', { params: filters }));
export const getPanchakarmaCenterById = (id) => safeApiCall(api.get(`/ayurveda/centers/${id}`));
export const getCenterPackages = (centerId) => safeApiCall(api.get(`/ayurveda/centers/${centerId}/packages`));

// 🆕 Booking APIs
export const bookAyurvedaConsultation = (bookingData) => api.post('/ayurveda/bookings', bookingData);
export const bookPanchakarmaPackage = (bookingData) => api.post('/ayurveda/panchakarma-bookings', bookingData);

// 🆕 Payment APIs
export const initiatePayment = (paymentData) => api.post('/ayurveda/payments/initiate', paymentData);
export const verifyPayment = (paymentId) => api.post('/ayurveda/payments/verify', { paymentId });

// Prakriti APIs
export const submitPrakritiResult = (resultData) => api.post('/ayurveda/prakriti', resultData);
export const getPrakritiHistory = (patientId) => api.get(`/ayurveda/prakriti/history/${patientId}`);