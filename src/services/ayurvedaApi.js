import api from './api';

// Helper to handle API errors and return empty data
const safeApiCall = async (apiCall) => {
  try {
    const response = await apiCall;
    return response;
  } catch (error) {
    console.log('API call failed, using fallback:', error.message);
    return { data: { success: false, data: [] } };
  }
};

export const getAyurvedaDoctors = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.specialization) params.append('specialization', filters.specialization);
  if (filters.experience) params.append('minExperience', filters.experience);
  if (filters.available) params.append('available', 'true');
  
  return safeApiCall(api.get(`/ayurveda/doctors?${params.toString()}`));
};

export const getAyurvedaDoctorById = (id) => {
  return safeApiCall(api.get(`/ayurveda/doctors/${id}`));
};

export const getFeaturedDoctors = () => {
  return safeApiCall(api.get('/ayurveda/doctors/featured'));
};

export const getPanchakarmaCenters = (filters = {}) => {
  return safeApiCall(api.get('/ayurveda/centers', { params: filters }));
};

export const getPanchakarmaCenterById = (id) => {
  return safeApiCall(api.get(`/ayurveda/centers/${id}`));
};

export const bookAyurvedaConsultation = (bookingData) => {
  return api.post('/ayurveda/bookings', bookingData);
};

export const submitPrakritiResult = (resultData) => {
  return api.post('/ayurveda/prakriti', resultData);
};