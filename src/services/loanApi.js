// D:\hospital-frontend\src\services\loanApi.js
import axios from 'axios';

const API_URL = 'https://hospital-backend-production-f1b1.up.railway.app/api';

const loanApi = axios.create({
  baseURL: `${API_URL}/loan`,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
loanApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('patientToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// PATIENT AUTHENTICATION
// ============================================

export const patientAuth = {
  sendOTP: (mobile) => loanApi.post('/patient/send-otp', { mobile }),
  verifyOTP: (mobile, otp, fullName, email) => 
    loanApi.post('/patient/verify-otp', { mobile, otp, fullName, email }),
  getProfile: () => loanApi.get('/patient/profile'),
  updateProfile: (data) => loanApi.put('/patient/profile', data)
};

// ============================================
// PATIENT LOAN APPLICATION
// ============================================

export const patientLoans = {
  // Get nearby lenders by location
  getNearbyLenders: (location) => loanApi.post('/patient/lenders/nearby', location),
  
  // Get all lenders (simple)
  getLenders: (params) => loanApi.get('/patient/lenders', { params }),
  
  // Submit loan application
  submitApplication: (data) => loanApi.post('/patient/applications', data),
  
  // Get all applications for patient
  getApplications: () => loanApi.get('/patient/applications'),
  
  // Get single application details
  getApplication: (applicationId) => loanApi.get(`/patient/applications/${applicationId}`),
  
  // Upload document
  uploadDocument: (applicationId, documentType, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    return loanApi.post(`/patient/applications/${applicationId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Upload final bill
  uploadFinalBill: (applicationId, finalBillUrl, finalBillAmount, hospitalFinalBillNumber) =>
    loanApi.post(`/patient/applications/${applicationId}/final-bill`, {
      finalBillUrl,
      finalBillAmount,
      hospitalFinalBillNumber
    }),
  
  // Cancel application
  cancelApplication: (applicationId) => loanApi.delete(`/patient/applications/${applicationId}`)
};

// ============================================
// LENDER AUTHENTICATION
// ============================================

export const lenderAuth = {
  register: (data) => loanApi.post('/lender/register', data),
  login: (email, password) => loanApi.post('/lender/login', { email, password }),
  getProfile: () => loanApi.get('/lender/profile'),
  updateProfile: (data) => loanApi.put('/lender/profile', data),
  
  // Branch management
  getBranches: () => loanApi.get('/lender/branches'),
  addBranch: (data) => loanApi.post('/lender/branches', data),
  updateBranch: (branchId, data) => loanApi.put(`/lender/branches/${branchId}`, data),
  deleteBranch: (branchId) => loanApi.delete(`/lender/branches/${branchId}`)
};

// Upload documents with FormData
uploadDocuments: (applicationId, formData) => {
  const token = localStorage.getItem('patientToken');
  return fetch(`${API_URL}/api/loan/patient/applications/${applicationId}/upload-documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
}

// ============================================
// LENDER DASHBOARD
// ============================================

export const lenderDashboard = {
  getStats: () => loanApi.get('/lender/stats'),
  getApplications: (params) => loanApi.get('/lender/applications', { params }),
  getBranchApplications: (branchId, params) => loanApi.get(`/lender/branch/${branchId}/applications`, { params }),
  getApplication: (applicationId) => loanApi.get(`/lender/applications/${applicationId}`),
  updateStatus: (applicationId, data) => loanApi.put(`/lender/applications/${applicationId}/status`, data),
  requestDocument: (applicationId, data) => loanApi.post(`/lender/applications/${applicationId}/request-document`, data),
  disburse: (applicationId, data) => loanApi.post(`/lender/applications/${applicationId}/disburse`, data),
  
  // Reports
  getDailyReport: (date) => loanApi.get('/lender/reports/daily', { params: { date } }),
  getMonthlyReport: (year, month) => loanApi.get('/lender/reports/monthly', { params: { year, month } }),
  getBranchReport: (branchId, startDate, endDate) => 
    loanApi.get(`/lender/reports/branch/${branchId}`, { params: { startDate, endDate } })
};

export default loanApi;
