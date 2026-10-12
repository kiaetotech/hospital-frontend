// D:\hospital-frontend\src\services\insuranceMarketplaceApi.js
// ============================================
// INSURANCE MARKETPLACE API
// Public + patient-facing. Separate from providerApi.js.
// Uses patientToken (localStorage) when required.
// ============================================

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-production-e2cf.up.railway.app';

const api = axios.create({
  baseURL: `${API_URL}/api/insurance-marketplace`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('patientToken') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ============================================
// PUBLIC
// ============================================

export const getPlans = (params = {}) =>
  api.get('/plans', { params }).then((r) => r.data);

export const getPlanDetail = (id) =>
  api.get(`/plans/${id}`).then((r) => r.data);

export const comparePlans = (planIds = []) =>
  api.get('/compare', { params: { planIds: planIds.join(',') } }).then((r) => r.data);

export const getAddons = () =>
  api.get('/addons').then((r) => r.data);

export const getQuote = (payload) =>
  api.post('/quote', payload).then((r) => r.data);

// ============================================
// APPLY (patient auth required)
// ============================================

export const startApply = (planId) =>
  api.post('/apply', { planId }).then((r) => r.data);

export const getApply = (id) =>
  api.get(`/apply/${id}`).then((r) => r.data);

export const savePersonal = (id, data) =>
  api.put(`/apply/${id}/personal`, data).then((r) => r.data);

export const saveMembers = (id, data) =>
  api.put(`/apply/${id}/members`, data).then((r) => r.data);

export const saveMedical = (id, data) =>
  api.put(`/apply/${id}/medical`, data).then((r) => r.data);

export const saveNominee = (id, data) =>
  api.put(`/apply/${id}/nominee`, data).then((r) => r.data);

export const saveAddons = (id, data) =>
  api.put(`/apply/${id}/addons`, data).then((r) => r.data);

export const getReview = (id) =>
  api.get(`/apply/${id}/review`).then((r) => r.data);

export const confirmApply = (id) =>
  api.post(`/apply/${id}/confirm`).then((r) => r.data);

export default {
  getPlans, getPlanDetail, comparePlans, getAddons, getQuote,
  startApply, getApply, savePersonal, saveMembers, saveMedical,
  saveNominee, saveAddons, getReview, confirmApply,
};