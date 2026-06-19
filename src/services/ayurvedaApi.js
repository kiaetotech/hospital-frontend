import api from './api';

export const getAyurvedaDoctors = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.specialization) params.append('specialization', filters.specialization);
  if (filters.experience) params.append('minExperience', filters.experience);
  if (filters.available) params.append('available', 'true');
  
  return api.get(`/ayurveda/doctors?${params.toString()}`);
};

export const getAyurvedaDoctorById = (id) => {
  return api.get(`/ayurveda/doctors/${id}`);
};

export const getFeaturedDoctors = () => {
  return api.get('/ayurveda/doctors/featured');
};

export const getPanchakarmaCenters = (filters = {}) => {
  return api.get('/ayurveda/centers', { params: filters });
};

export const getPanchakarmaCenterById = (id) => {
  return api.get(`/ayurveda/centers/${id}`);
};

export const bookAyurvedaConsultation = (bookingData) => {
  return api.post('/ayurveda/bookings', bookingData);
};

export const submitPrakritiResult = (resultData) => {
  return api.post('/ayurveda/prakriti', resultData);
};