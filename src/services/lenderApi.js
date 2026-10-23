import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';

const lenderApi = axios.create({
  baseURL: `${API_URL}/api/lender/auth`,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
lenderApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('lenderToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// LENDER AUTHENTICATION
// ============================================

export const lenderAuth = {
  register: (data) => lenderApi.post('/register', data),
  login: (email, password) => lenderApi.post('/login', { email, password }),
  getProfile: () => lenderApi.get('/profile'),
  updateProfile: (data) => lenderApi.put('/profile', data)
};

// ============================================
// LENDER APPLICATIONS
// ============================================

export const lenderApplications = {
  getStats: () => {
    const token = localStorage.getItem('lenderToken');
    return axios.get(`${API_URL}/api/lender/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getAll: (params) => {
    const token = localStorage.getItem('lenderToken');
    return axios.get(`${API_URL}/api/lender/applications`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
  },
  getById: (id) => {
    const token = localStorage.getItem('lenderToken');
    return axios.get(`${API_URL}/api/lender/applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  updateStatus: (id, data) => {
    const token = localStorage.getItem('lenderToken');
    return axios.put(`${API_URL}/api/lender/applications/${id}/status`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  requestDocument: (id, data) => {
    const token = localStorage.getItem('lenderToken');
    return axios.post(`${API_URL}/api/lender/applications/${id}/request-document`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  disburse: (id, data) => {
    const token = localStorage.getItem('lenderToken');
    return axios.post(`${API_URL}/api/lender/applications/${id}/disburse`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// ============================================
// LOAN V2 API — Task 18 additions
// ============================================

const LOAN_V2_BASE = `${API_URL}/api/loan/v2`;

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('lenderToken')}`,
});

// ─── Products ───
export const loanProducts = {
  list: () => axios.get(`${LOAN_V2_BASE}/products`, { headers: authHeader() }),
  get: (productId) => axios.get(`${LOAN_V2_BASE}/products/${productId}`, { headers: authHeader() }),
  create: (data) => axios.post(`${LOAN_V2_BASE}/products`, data, { headers: authHeader() }),
  update: (productId, data) => axios.put(`${LOAN_V2_BASE}/products/${productId}`, data, { headers: authHeader() }),
  activate: (productId) => axios.post(`${LOAN_V2_BASE}/products/${productId}/activate`, {}, { headers: authHeader() }),
  deactivate: (productId, data) => axios.post(`${LOAN_V2_BASE}/products/${productId}/deactivate`, data || {}, { headers: authHeader() }),
  version: (productId, data) => axios.post(`${LOAN_V2_BASE}/products/${productId}/version`, data || {}, { headers: authHeader() }),
};

// ─── Offers ───
export const loanOffers = {
  listByApplication: (applicationId) => axios.get(`${LOAN_V2_BASE}/offers/${applicationId}`, { headers: authHeader() }),
  issue: (data) => axios.post(`${LOAN_V2_BASE}/offers`, data, { headers: authHeader() }),
  version: (offerId, data) => axios.post(`${LOAN_V2_BASE}/offers/${offerId}/version`, data, { headers: authHeader() }),
  withdraw: (offerId, data) => axios.post(`${LOAN_V2_BASE}/offers/${offerId}/withdraw`, data, { headers: authHeader() }),
  expire: (offerId) => axios.post(`${LOAN_V2_BASE}/offers/${offerId}/expire`, {}, { headers: authHeader() }),
};

// ─── Agreements ───
export const loanAgreements = {
  listByApplication: (applicationId) => axios.get(`${LOAN_V2_BASE}/agreements/${applicationId}`, { headers: authHeader() }),
  initiate: (data) => axios.post(`${LOAN_V2_BASE}/agreements`, data, { headers: authHeader() }),
  cancel: (agreementId, data) => axios.post(`${LOAN_V2_BASE}/agreements/${agreementId}/cancel`, data, { headers: authHeader() }),
  getPdf: (agreementId) => axios.get(`${LOAN_V2_BASE}/agreements/${agreementId}/pdf`, { headers: authHeader() }),
};

// ─── Disbursements ───
export const loanDisbursements = {
  listByApplication: (applicationId) => axios.get(`${LOAN_V2_BASE}/disbursements/${applicationId}`, { headers: authHeader() }),
  get: (disbursementId) => axios.get(`${LOAN_V2_BASE}/disbursement/${disbursementId}`, { headers: authHeader() }),
  initiate: (data) => axios.post(`${LOAN_V2_BASE}/disbursements`, data, { headers: authHeader() }),
  confirm: (disbursementId, data) => axios.post(`${LOAN_V2_BASE}/disbursements/${disbursementId}/confirm`, data || {}, { headers: authHeader() }),
  reconcile: (disbursementId, data) => axios.post(`${LOAN_V2_BASE}/disbursements/${disbursementId}/reconcile`, data || {}, { headers: authHeader() }),
};

// ─── Repayment ───
export const loanRepayment = {
  listMandates: (applicationId) => axios.get(`${LOAN_V2_BASE}/repayment/${applicationId}`, { headers: authHeader() }),
  createMandate: (data) => axios.post(`${LOAN_V2_BASE}/repayment/mandate`, data, { headers: authHeader() }),
  activateMandate: (mandateId, data) => axios.post(`${LOAN_V2_BASE}/repayment/mandate/${mandateId}/activate`, data || {}, { headers: authHeader() }),
  cancelMandate: (mandateId, data) => axios.post(`${LOAN_V2_BASE}/repayment/mandate/${mandateId}/cancel`, data, { headers: authHeader() }),
  getSchedule: (applicationId) => axios.get(`${LOAN_V2_BASE}/repayment/${applicationId}/schedule`, { headers: authHeader() }),
};

// ─── Refunds ───
export const loanRefunds = {
  listByApplication: (applicationId) => axios.get(`${LOAN_V2_BASE}/refunds/${applicationId}`, { headers: authHeader() }),
  initiate: (data) => axios.post(`${LOAN_V2_BASE}/refunds`, data, { headers: authHeader() }),
  complete: (transactionId, data) => axios.post(`${LOAN_V2_BASE}/refunds/${transactionId}/complete`, data || {}, { headers: authHeader() }),
};

// ─── Reconciliation ───
export const loanReconciliation = {
  list: (params) => axios.get(`${LOAN_V2_BASE}/reconciliation`, { headers: authHeader(), params }),
  match: (data) => axios.post(`${LOAN_V2_BASE}/reconciliation/match`, data, { headers: authHeader() }),
};

// ─── Audit ───
export const loanAudit = {
  get: (applicationId) => axios.get(`${LOAN_V2_BASE}/audit/${applicationId}`, { headers: authHeader() }),
};

export default lenderApi;

