// src/services/adminTaxesApi.js
import axios from 'axios';

const API_BASE = 'https://hospital-backend-production-e2cf.up.railway.app';
const ADMIN_KEY = 'admin_secret_key_2024_hospitalhub_production_secure';

const adminHeaders = () => ({
  'x-admin-key': ADMIN_KEY,
  'Content-Type': 'application/json',
});

// ============================================
// TDS APIs
// ============================================

export const listTdsRules = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return axios.get(`${API_BASE}/api/admin/taxes/tds${qs ? '?' + qs : ''}`, { headers: adminHeaders() });
};

export const createTdsRule = (data) =>
  axios.post(`${API_BASE}/api/admin/taxes/tds`, data, { headers: adminHeaders() });

export const updateTdsRule = (id, data) =>
  axios.put(`${API_BASE}/api/admin/taxes/tds/${id}`, data, { headers: adminHeaders() });

export const deactivateTdsRule = (id) =>
  axios.delete(`${API_BASE}/api/admin/taxes/tds/${id}`, { headers: adminHeaders() });

export const previewTds = (data) =>
  axios.post(`${API_BASE}/api/admin/taxes/tds/preview`, data, { headers: adminHeaders() });

// ============================================
// GST APIs
// ============================================

export const listGstRules = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return axios.get(`${API_BASE}/api/admin/taxes/gst${qs ? '?' + qs : ''}`, { headers: adminHeaders() });
};

export const createGstRule = (data) =>
  axios.post(`${API_BASE}/api/admin/taxes/gst`, data, { headers: adminHeaders() });

export const updateGstRule = (id, data) =>
  axios.put(`${API_BASE}/api/admin/taxes/gst/${id}`, data, { headers: adminHeaders() });

export const deactivateGstRule = (id) =>
  axios.delete(`${API_BASE}/api/admin/taxes/gst/${id}`, { headers: adminHeaders() });

export const previewGst = (data) =>
  axios.post(`${API_BASE}/api/admin/taxes/gst/preview`, data, { headers: adminHeaders() });

// ============================================
// SEED APIs
// ============================================

export const seedGstDefaults = () =>
  axios.post(`${API_BASE}/api/admin/taxes/seed/gst`, {}, { headers: adminHeaders() });

// ============================================
// SHARED CONSTANTS
// ============================================

export const SERVICE_TYPES = [
  'hospital_opd', 'hospital_admission', 'ambulance', 'ambulance_emergency',
  'ambulance_scheduled', 'labtest', 'health_package', 'caregiver',
  'ayurveda_consultation', 'ayurveda_panchakarma', 'ayurveda_online_doctor',
  'ayurveda_wellness_center', 'ayurveda_home_therapy', 'ayurveda_medicine',
  'ayurveda_product', 'ayurveda_corporate', 'homeopathy_consult',
  'homeopathy_medicine', 'insurance', 'online_consult', 'mental_health',
  'health_emi', 'corporate_health', 'platform_commission'
];

export const TDS_SECTIONS = ['194J', '194C', '194H', '194-O', '206AA', 'none'];
export const SCOPE_TYPES = ['global', 'state', 'city', 'provider'];
export const CHARGE_TO_OPTIONS = ['patient', 'platform', 'provider'];