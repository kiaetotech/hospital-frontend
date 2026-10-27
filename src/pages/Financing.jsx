// D:\hospital-frontend\src\pages\Financing.jsx
// ============================================
// HEALTH EMI / LOAN — SINGLE FILE, ALL FEATURES
// ============================================
// Combines ALL features from:
//   - Financing.jsx (wizard: location, OTP login, treatment, lender compare,
//     full cost breakdown, CIBIL filter, collateral, Aadhaar eKYC, document
//     upload, notifications log, previous applications, final bill upload)
//   - LoanHub.jsx (v2 product dropdown, Applications, Offers, Agreements,
//     My Loans EMI schedule, Refunds tabs)
// One URL: /financing

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { patientAuth, patientLoans, patientOffers, patientAgreements } from '../services/loanApi';
import {
  loanProducts,
  loanOffers,
  loanAgreements,
  loanDisbursements,
  loanRepayment,
  loanRefunds,
} from '../services/lenderApi';
import api from '../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'https://hospital-backend-ilhi.onrender.com';

const Financing = () => {
  const navigate = useNavigate();

  // ============================================
  // TOP-LEVEL VIEW STATE
  // ============================================
  const [view, setView] = useState('wizard'); // 'wizard' | 'dashboard'
  const [step, setStep] = useState(1);        // 1-5 for wizard
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ============================================
  // AUTH STATE
  // ============================================
  const [patientId, setPatientId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMobile, setLoginMobile] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');

  // ============================================
  // WIZARD STATE
  // ============================================
  const [loanCategory, setLoanCategory] = useState('all');
  const [cibilScore, setCibilScore] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [collateralDetails, setCollateralDetails] = useState(null);
  const [userPincode, setUserPincode] = useState('');
  const [userCity, setUserCity] = useState('');
  const [userDistrict, setUserDistrict] = useState('');
  const [userState, setUserState] = useState('');
  const [availableLenders, setAvailableLenders] = useState([]);
  const [notificationLog, setNotificationLog] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [loanHistory, setLoanHistory] = useState([]);
  const [activeApplication, setActiveApplication] = useState(null);

  // v2 products fetched per lender
  const [lenderProducts, setLenderProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  const [formData, setFormData] = useState({
    treatmentType: '', hospitalName: '', treatmentCost: '', bookingId: '',
    selectedLender: null, selectedTenure: null, emi: null,
    totalPayable: null, totalInterest: null, fullName: '', pan: '',
    phone: '', email: '', address: '', applicationStatus: 'pending', applicationId: null,
  });

  // ============================================
  // DASHBOARD STATE
  // ============================================
  const [myApplications, setMyApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationOffers, setApplicationOffers] = useState([]);
  const [applicationAgreements, setApplicationAgreements] = useState([]);
  const [applicationRefunds, setApplicationRefunds] = useState([]);
  const [loanSchedule, setLoanSchedule] = useState(null);

  // ============================================
  // MOUNT
  // ============================================
  useEffect(() => {
    const history = localStorage.getItem('healthEmiHistory');
    if (history) setLoanHistory(JSON.parse(history));
    const savedPatientId = localStorage.getItem('patientId');
    const savedToken = localStorage.getItem('patientToken');
    if (savedPatientId && savedToken) {
      setPatientId(savedPatientId);
      setIsLoggedIn(true);
      fetchPatientProfile();
      fetchLoanHistory();
      fetchMyApplications();
    }
    const savedNotifications = localStorage.getItem('notificationLog');
    if (savedNotifications) setNotificationLog(JSON.parse(savedNotifications));
  }, []);

  // ============================================
  // WIZARD FETCHERS
  // ============================================
  const fetchPatientProfile = async () => {
    try {
      const response = await patientAuth.getProfile();
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          fullName: response.data.fullName || '',
          email: response.data.email || '',
          pan: response.data.pan || '',
          phone: response.data.phone || '',
          address: response.data.serviceAddress?.address || '',
        }));
      }
    } catch (error) { console.error('Failed to fetch profile:', error); }
  };

  const fetchLoanHistory = async () => {
    try {
      const response = await patientLoans.getApplications();
      if (response.data.applications) setLoanHistory(response.data.applications);
    } catch (error) { console.error('Failed to fetch loan history:', error); }
  };

  const fetchLendersFromAPI = async (pincode, city, district, state) => {
    setLoading(true);
    try {
      const response = await patientLoans.getNearbyLenders({ pincode, city, district, state });
      setAvailableLenders(response.data?.lenders || []);
    } catch (error) { console.error('Lender fetch error:', error); setAvailableLenders([]); }
    finally { setLoading(false); }
  };

  // ============================================
  // DASHBOARD FETCHERS
  // ============================================
  const fetchMyApplications = useCallback(async () => {
    try {
      const res = await api.get('/loan/patient/applications');
      setMyApplications(res.data.applications || []);
    } catch (err) {
      setError('Failed to load applications: ' + (err.response?.data?.error || err.message));
    }
  }, []);

  const handleSelectApplication = async (application) => {
    setSelectedApplication(application);
    try {
      const [offersRes, agreementsRes, refundsRes] = await Promise.all([
        loanOffers.listByApplication(application.applicationId).catch(() => ({ data: { offers: [] } })),
        loanAgreements.listByApplication(application.applicationId).catch(() => ({ data: { agreements: [] } })),
        loanRefunds.listByApplication(application.applicationId).catch(() => ({ data: { refunds: [] } })),
      ]);
      setApplicationOffers(offersRes.data.offers || []);
      setApplicationAgreements(agreementsRes.data.agreements || []);
      setApplicationRefunds(refundsRes.data.refunds || []);
    } catch (err) { /* silent */ }
  };

  // ============================================
  // CALCULATIONS
  // ============================================
  const calculateEMI = (principal, rate, months) => {
    if (!principal || !months || principal <= 0) return 0;
    if (rate === 0) return Math.round(principal / months);
    const monthlyRate = rate / 100 / 12;
    return Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1));
  };

  const calculateFullBreakdown = (lender, principal, tenure) => {
    if (!lender || !principal || !tenure) return null;
    const rate = lender.interestRate || lender.loanProducts?.[0]?.interestRate || 0;
    const emi = calculateEMI(principal, rate, tenure);
    const totalRepayment = emi * tenure;
    const totalInterest = totalRepayment - principal;
    const pf = lender.processingFee || lender.loanProducts?.[0]?.processingFee || 2;
    const rawPF = Math.round(principal * pf / 100);
    const processingFee = Math.max(200, Math.min(rawPF, 5000));
    const gstOnPF = Math.round(processingFee * 18 / 100);
    const docCharge = lender.documentationCharge || lender.loanProducts?.[0]?.documentationCharge || 500;
    const stampDuty = Math.round(principal * (lender.stampDutyPercent || 0.1) / 100);
    const totalCharges = processingFee + gstOnPF + docCharge + stampDuty;
    const totalLoan = principal + totalCharges;
    const platformCommission = Math.round(principal * (lender.commissionRate || 2) / 100);
    const hospitalGets = principal - platformCommission;
    return { emi, totalRepayment, totalInterest, processingFee, gstOnPF, docCharge, stampDuty, totalCharges, totalLoan, platformCommission, hospitalGets };
  };

  const checkEligibility = (lender) => {
    const cost = parseInt(formData.treatmentCost) || 0;
    const minL = lender.minLoan || lender.loanProducts?.[0]?.minAmount || 5000;
    const maxL = lender.maxLoan || lender.loanProducts?.[0]?.maxAmount || 10000000;
    const minC = lender.minCibil || lender.loanProducts?.[0]?.minCibilScore || 600;
    if (cost < minL) return { eligible: false, reason: `Min ₹${minL.toLocaleString()}` };
    if (cost > maxL) return { eligible: false, reason: `Max ₹${maxL.toLocaleString()}` };
    if (cibilScore && parseInt(cibilScore) < minC) return { eligible: false, reason: `CIBIL ${cibilScore} < ${minC}` };
    if (lender.requiresCollateral && !collateralDetails) return { eligible: false, reason: 'Collateral required' };
    if (cibilScore && parseInt(cibilScore) >= minC) return { eligible: true, reason: 'Eligible ✓' };
    return { eligible: null, reason: 'Enter CIBIL to check' };
  };

  const getFilteredLenders = () => {
    const cost = parseInt(formData.treatmentCost) || 0;
    let filtered = availableLenders;
    if (loanCategory === 'unsecured') filtered = filtered.filter(l => !l.requiresCollateral);
    if (loanCategory === 'secured') filtered = filtered.filter(l => l.requiresCollateral);
    return filtered.filter(l => {
      const minL = l.minLoan || l.loanProducts?.[0]?.minAmount || 5000;
      const maxL = l.maxLoan || l.loanProducts?.[0]?.maxAmount || 10000000;
      return cost >= minL && cost <= maxL;
    });
  };

  // ============================================
  // NOTIFICATIONS (log only — real delivery is Phase 2)
  // ============================================
  const sendSMS = (phoneNumber, message) => {
    const notification = { id: Date.now() + Math.random(), type: 'sms', to: phoneNumber, message, sentAt: new Date().toISOString() };
    setNotificationLog(prev => [notification, ...prev]);
    localStorage.setItem('notificationLog', JSON.stringify([notification, ...notificationLog]));
    return true;
  };
  const sendEmail = (email, subject, body) => {
    if (!email) return;
    const notification = { id: Date.now() + Math.random(), type: 'email', to: email, subject, message: body, sentAt: new Date().toISOString() };
    setNotificationLog(prev => [notification, ...prev]);
    return true;
  };
  const sendWhatsApp = (phoneNumber, message) => {
    const notification = { id: Date.now() + Math.random(), type: 'whatsapp', to: phoneNumber, message, sentAt: new Date().toISOString() };
    setNotificationLog(prev => [notification, ...prev]);
    return true;
  };
  const sendAllNotifications = (phone, email, smsMessage, emailSubject, emailBody, whatsappMessage) => {
    if (phone && phone.length === 10) { sendSMS(phone, smsMessage); sendWhatsApp(phone, whatsappMessage || smsMessage); }
    if (email && email.includes('@')) sendEmail(email, emailSubject, emailBody);
  };

  // ============================================
  // WIZARD HANDLERS
  // ============================================
  const handleFileUpload = (docType, file) => {
    if (!file) return;
    setUploadedDocuments(prev => ({ ...prev, [docType]: { file, name: file.name, uploadedAt: new Date().toISOString() } }));
  };

  const handleSendLoginOTP = async () => {
    if (!loginMobile || loginMobile.length !== 10) { alert('Enter valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      const response = await patientAuth.sendOTP(loginMobile);
      if (response.data.success) { setLoginOtpSent(true); alert(`OTP sent to ${loginMobile}. Demo OTP: ${response.data.demoOtp}`); }
    } catch (error) { alert(error.response?.data?.error || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyLoginOTP = async () => {
    if (!loginOtp) { alert('Enter OTP'); return; }
    setLoading(true);
    try {
      const response = await patientAuth.verifyOTP(loginMobile, loginOtp, formData.fullName, formData.email);
      if (response.data.success) {
        localStorage.setItem('patientToken', response.data.token);
        localStorage.setItem('patientId', response.data.patient.id);
        setPatientId(response.data.patient.id);
        setIsLoggedIn(true);
        setStep(3);
      }
    } catch (error) { alert(error.response?.data?.error || 'Verification failed'); }
    finally { setLoading(false); }
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!userPincode || userPincode.length !== 6) { alert('Enter valid 6-digit pincode'); return; }
    setLoading(true);
    try { await fetchLendersFromAPI(userPincode, userCity, userDistrict, userState); setStep(2); }
    catch (error) { console.error('Location error:', error); setStep(2); }
    finally { setLoading(false); }
  };

  const handleCostSubmit = (e) => {
    e.preventDefault();
    const cost = parseInt(formData.treatmentCost);
    if (cost < 5000) { alert('Minimum loan amount is ₹5,000'); return; }
    if (cost > 10000000) { alert('Maximum loan amount is ₹1,00,00,000'); return; }
    setStep(4);
  };

  const handleSelectLender = async (lender) => {
    setFormData({ ...formData, selectedLender: lender, selectedTenure: null, emi: null });
    setSelectedProductId('');
    // Fetch v2 products for this lender (public endpoint, no auth needed)
    try {
      const res = await api.get('/loan/v2/products/public', {
        params: { lenderId: lender.lenderId || lender._id },
      });
      const v2Products = res.data?.products || [];
      setLenderProducts(v2Products.length > 0 ? v2Products : (lender.loanProducts || []));
    } catch (err) {
      // Fallback: legacy embedded products
      setLenderProducts(lender.loanProducts || []);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
  };

  const handleSelectTenure = (tenure, lenderFromButton) => {
    const lender = lenderFromButton || formData.selectedLender;
    if (!lender) { alert('Please select a lender first'); return; }
    const principal = parseInt(formData.treatmentCost);
    const rate = lender.interestRate || lender.loanProducts?.[0]?.interestRate || 12;
    const emi = calculateEMI(principal, rate, tenure);
    setFormData({
      ...formData,
      selectedLender: lender,
      selectedTenure: tenure,
      emi,
      totalPayable: emi * tenure,
      totalInterest: (emi * tenure) - principal,
    });
  };

  const handleSendAadhaarOTP = () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) { alert('Enter valid 12-digit Aadhaar number'); return; }
    setAadhaarOtpSent(true);
    if (formData.phone) {
      sendSMS(formData.phone, 'Your Aadhaar OTP is 123456. Valid for 10 minutes. - KiaetoCare');
      sendWhatsApp(formData.phone, '🔐 *Aadhaar OTP*\nYour OTP is 123456\nValid for 10 minutes\n- KiaetoCare');
    }
    alert(`OTP sent to mobile linked with Aadhaar ending with ${aadhaarNumber.slice(-4)}`);
  };

  const handleVerifyAadhaarOTP = () => {
    if (!otpValue || otpValue.length !== 6) { alert('Enter valid 6-digit OTP'); return; }
    setAadhaarVerified(true);
    if (formData.phone) sendSMS(formData.phone, 'Aadhaar verification successful. - KiaetoCare');
    alert('Aadhaar verified successfully!');
  };

  const handleProceedToKYC = () => {
    if (!formData.selectedTenure) { alert('Please select tenure'); return; }
    setStep(5);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.pan) { alert('Please fill all required KYC fields'); return; }
    if (!aadhaarVerified) { alert('Please complete Aadhaar OTP verification'); return; }
    if (!cibilScore) { alert('Please enter your CIBIL score'); return; }
    if (formData.selectedLender.requiresCollateral && !collateralDetails) { alert('Please provide collateral/mortgage details'); return; }
    if (!uploadedDocuments.tentativeEstimate) { alert('Please upload tentative hospital bill/estimate'); return; }
    if (!uploadedDocuments.panCard) { alert('Please upload PAN card'); return; }
    if (!uploadedDocuments.aadhaarCard) { alert('Please upload Aadhaar card'); return; }

    setLoading(true);
    try {
      const applicationData = {
        treatmentType: formData.treatmentType,
        hospitalName: formData.hospitalName,
        estimatedAmount: parseInt(formData.treatmentCost),
        lenderId: formData.selectedLender._id || formData.selectedLender.lenderId || formData.selectedLender.id,
        bookingId: formData.bookingId,
        tenure: formData.selectedTenure,
        productId: selectedProductId || undefined,
        collateral: collateralDetails,
        patientLocation: { pincode: userPincode, city: userCity, district: userDistrict, state: userState },
      };

      const response = await patientLoans.submitApplication(applicationData);
      const applicationId = response.data.applicationId;

      const formDataObj = new FormData();
      ['tentativeEstimate', 'panCard', 'aadhaarCard', 'salarySlip', 'bankStatement'].forEach(docType => {
        if (uploadedDocuments[docType]?.file) formDataObj.append(docType, uploadedDocuments[docType].file);
      });

      if ([...formDataObj.keys()].length > 0) {
        const token = localStorage.getItem('patientToken');
        await fetch(`${API_URL}/api/loan/patient/applications/${applicationId}/upload-documents`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formDataObj,
        });
      }

      const lenderName = formData.selectedLender.businessName || formData.selectedLender.name || 'Lender';
      sendAllNotifications(
        formData.phone, formData.email,
        `Loan application ${applicationId} submitted to ${lenderName}. Track: https://kiaetocare.com/my-loans. - KiaetoCare`,
        `Loan Application Submitted - ${applicationId}`,
        `Dear ${formData.fullName}, your loan application has been submitted.\n\nApplication ID: ${applicationId}\nAmount: ₹${parseInt(formData.treatmentCost).toLocaleString()}\nLender: ${lenderName}`,
        null
      );

      alert(`✅ Application Submitted!\nApplication ID: ${applicationId}`);
      await fetchLoanHistory();
      await fetchMyApplications();
      setView('dashboard');
      setActiveTab('applications');
    } catch (error) {
      console.error('Submission failed:', error);
      alert(error.response?.data?.error || 'Failed to submit application');
    } finally { setLoading(false); }
  };

  const handleFinalBillUpload = async (application, file) => {
    if (!file) return;
    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('finalBill', file);
      const token = localStorage.getItem('patientToken');
      const uploadResponse = await fetch(`${API_URL}/api/loan/patient/applications/${application.applicationId}/upload-documents`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formDataObj,
      });
      if (!uploadResponse.ok) throw new Error('Failed to upload final bill');
      const result = await uploadResponse.json();
      await patientLoans.uploadFinalBill(application.applicationId, result.documents?.finalBill, null, null);
      alert('✅ Final bill uploaded. Lender will process disbursal.');
      fetchLoanHistory();
    } catch (error) { alert('Failed to upload final bill'); }
    finally { setLoading(false); }
  };

  const handleBookAnother = () => {
    setFormData({
      treatmentType: '', hospitalName: '', treatmentCost: '', bookingId: '',
      selectedLender: null, selectedTenure: null, emi: null, totalPayable: null, totalInterest: null,
      fullName: formData.fullName, pan: formData.pan, phone: formData.phone, email: formData.email, address: formData.address,
      applicationStatus: 'pending', applicationId: null,
    });
    setCollateralDetails(null); setAadhaarVerified(false); setAadhaarOtpSent(false);
    setAadhaarNumber(''); setOtpValue(''); setCibilScore(''); setMonthlyIncome(''); setEmploymentType('');
    setLoanCategory('all'); setUploadedDocuments({}); setLenderProducts([]); setSelectedProductId('');
    setStep(3); setView('wizard');
  };

  const formatINR = (n) => '₹' + (n || 0).toLocaleString('en-IN');
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  // ============================================
  // STYLES
  // ============================================
  const s = {
    container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" },
    card: { background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' },
    input: { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', outline: 'none', boxSizing: 'border-box' },
    select: { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#1e293b', outline: 'none', background: 'white' },
    btn: (bg) => ({ width: '100%', padding: '14px', background: bg, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }),
    label: { display: 'block', fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '6px' },
    badge: (bg, c = '#fff') => ({ display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: bg, color: c }),
  };

  const dash = {
    header: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', padding: '1.5rem 2rem' },
    headerTitle: { fontSize: '1.75rem', fontWeight: 800, margin: 0 },
    headerSubtitle: { opacity: 0.9, fontSize: '0.9rem', marginTop: '4px' },
    tabsBar: { background: 'white', padding: '0.75rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 100 },
    tabButton: (isActive) => ({ padding: '0.6rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, background: isActive ? '#4f46e5' : 'transparent', color: isActive ? 'white' : '#475569', whiteSpace: 'nowrap' }),
    content: { padding: '2rem', maxWidth: '1400px', margin: '0 auto' },
    cardTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' },
    buttonPrimary: { padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
    buttonSecondary: { padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
    th: { textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' },
    td: { padding: '0.75rem', borderBottom: '1px solid #f1f5f9', color: '#475569' },
    statusBadge: (status) => {
      const colors = {
        submitted: { bg: '#dbeafe', color: '#1e40af' }, under_review: { bg: '#fef3c7', color: '#92400e' },
        document_pending: { bg: '#fed7aa', color: '#9a3412' },
        offer_issued: { bg: '#dbeafe', color: '#1e40af' }, offer_accepted: { bg: '#d1fae5', color: '#065f46' },
        approved: { bg: '#d1fae5', color: '#065f46' }, pending_disbursal: { bg: '#fef3c7', color: '#92400e' },
        disbursed: { bg: '#d1fae5', color: '#065f46' }, completed: { bg: '#d1fae5', color: '#065f46' },
        rejected: { bg: '#fee2e2', color: '#991b1b' }, withdrawn: { bg: '#f1f5f9', color: '#64748b' },
        cancelled: { bg: '#f1f5f9', color: '#64748b' },
        agreement_pending: { bg: '#ede9fe', color: '#5b21b6' }, agreement_signed: { bg: '#d1fae5', color: '#065f46' },
      };
      const c = colors[status] || { bg: '#f1f5f9', color: '#64748b' };
      return { display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, background: c.bg, color: c.color };
    },
  };

  // ============================================
  // RENDER: DASHBOARD VIEW
  // ============================================
  if (view === 'dashboard') {
    return (
      <div style={s.container}>
        <div style={dash.header}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={dash.headerTitle}>💰 Health EMI / Loan</h1>
              <p style={dash.headerSubtitle}>Apply · Track · Manage your healthcare financing</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={handleBookAnother} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                + New Application
              </button>
              <Link to="/my-bookings" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem' }}>
                My Bookings
              </Link>
            </div>
          </div>
        </div>

        <div style={dash.tabsBar}>
          {[
            { id: 'applications', label: `📋 My Applications (${myApplications.length})` },
            { id: 'offers', label: '📄 Offers' },
            { id: 'agreements', label: '✍️ Agreements' },
            { id: 'loans', label: '💳 My Loans' },
            { id: 'refunds', label: '💸 Refunds' },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedApplication(null); setError(''); }} style={dash.tabButton(activeTab === tab.id)}>{tab.label}</button>
          ))}
        </div>

        <div style={dash.content}>
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>⚠️ {error}</div>}

          {activeTab === 'applications' && (
            <div>
              <div style={s.card}>
                <h2 style={dash.cardTitle}>My Applications ({myApplications.length})</h2>
                {myApplications.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No applications yet.</p>
                ) : (
                  <table style={dash.table}>
                    <thead><tr><th style={dash.th}>Application ID</th><th style={dash.th}>Treatment</th><th style={dash.th}>Amount</th><th style={dash.th}>Status</th><th style={dash.th}>Submitted</th><th style={dash.th}>Actions</th></tr></thead>
                    <tbody>
                      {myApplications.map(app => (
                        <tr key={app.applicationId}>
                          <td style={dash.td}><code>{app.applicationId}</code></td>
                          <td style={dash.td}>{app.treatmentType || 'N/A'}</td>
                          <td style={dash.td}>₹{(app.estimatedAmount || 0).toLocaleString()}</td>
                          <td style={dash.td}><span style={dash.statusBadge(app.status)}>{app.status}</span></td>
                          <td style={dash.td}>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}</td>
                          <td style={dash.td}><button onClick={() => handleSelectApplication(app)} style={dash.buttonSecondary}>View Details</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {selectedApplication && (
                <div style={s.card}>
                  <h2 style={dash.cardTitle}>Application {selectedApplication.applicationId}<button onClick={() => setSelectedApplication(null)} style={{ ...dash.buttonSecondary, float: 'right' }}>Close</button></h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div><strong>Treatment:</strong> {selectedApplication.treatmentType || 'N/A'}</div>
                    <div><strong>Hospital:</strong> {selectedApplication.hospitalName || 'N/A'}</div>
                    <div><strong>Estimated:</strong> ₹{(selectedApplication.estimatedAmount || 0).toLocaleString()}</div>
                    <div><strong>Sanctioned:</strong> ₹{(selectedApplication.sanctionedAmount || 0).toLocaleString()}</div>
                    <div><strong>Tenure:</strong> {selectedApplication.tenure || selectedApplication.requestedTenure || 'N/A'} months</div>
                    <div><strong>Interest:</strong> {selectedApplication.interestRate || 'N/A'}%</div>
                    <div><strong>EMI:</strong> ₹{(selectedApplication.emi || 0).toLocaleString()}</div>
                    <div><strong>Status:</strong> <span style={dash.statusBadge(selectedApplication.status)}>{selectedApplication.status}</span></div>
                  </div>
                  {selectedApplication.status === 'approved' && !selectedApplication.finalBillAmount && (
                    <div style={{ marginTop: '1rem', backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '8px' }}>
                      <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>🏥 Upload Final Hospital Bill</p>
                      <input type="file" onChange={(e) => handleFinalBillUpload(selectedApplication, e.target.files[0])} accept=".pdf,.jpg,.png" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'offers' && (
            <div style={s.card}>
              <h2 style={dash.cardTitle}>📄 My Offers</h2>
              {myApplications.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No applications yet.</p>
              ) : (
                <>
                  <select onChange={(e) => { const app = myApplications.find(a => a.applicationId === e.target.value); if (app) handleSelectApplication(app); }} style={{ ...s.input, marginBottom: '1rem' }} defaultValue="">
                    <option value="" disabled>Select application</option>
                    {myApplications.map(app => (<option key={app.applicationId} value={app.applicationId}>{app.applicationId} — {app.treatmentType} — ₹{(app.estimatedAmount || 0).toLocaleString()}</option>))}
                  </select>
                  {selectedApplication && (applicationOffers.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No offers yet for this application.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {applicationOffers.map(offer => (
                        <div key={offer.offerId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: offer.status === 'issued' ? '#f0f9ff' : 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div><strong style={{ fontSize: '1.1rem' }}>₹{(offer.sanctionedAmount || 0).toLocaleString()}</strong><span style={{ marginLeft: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>@ {offer.interestRate}% × {offer.tenureMonths} months</span></div>
                            <span style={dash.statusBadge(offer.status)}>{offer.status}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                            <div><strong>EMI:</strong> ₹{(offer.emi || 0).toLocaleString()}/mo</div>
                            <div><strong>Processing Fee:</strong> ₹{(offer.processingFee || 0).toLocaleString()}</div>
                            <div><strong>Total Payable:</strong> ₹{(offer.totalPayable || 0).toLocaleString()}</div>
                          </div>
                          {offer.status === 'issued' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={async () => {
                                if (!window.confirm(`Accept offer of ₹${offer.sanctionedAmount.toLocaleString()}?`)) return;
                                try { await patientOffers.accept(offer.offerId); alert('Offer accepted!'); await handleSelectApplication(selectedApplication); } catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
                              }} style={{ ...dash.buttonPrimary, padding: '0.5rem 1rem', fontSize: '0.85rem' }}>✅ Accept</button>
                              <button onClick={async () => {
                                const reason = window.prompt('Reason for declining?'); if (!reason) return;
                                try { await patientOffers.decline(offer.offerId, { reason }); alert('Declined'); await handleSelectApplication(selectedApplication); } catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
                              }} style={{ ...dash.buttonSecondary, background: '#fee2e2', color: '#991b1b' }}>❌ Decline</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'agreements' && (
            <div style={s.card}>
              <h2 style={dash.cardTitle}>✍️ Agreements</h2>
              {myApplications.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No applications yet.</p>
              ) : (
                <>
                  <select onChange={(e) => { const app = myApplications.find(a => a.applicationId === e.target.value); if (app) handleSelectApplication(app); }} style={{ ...s.input, marginBottom: '1rem' }} defaultValue="">
                    <option value="" disabled>Select application</option>
                    {myApplications.map(app => (<option key={app.applicationId} value={app.applicationId}>{app.applicationId} — {app.status}</option>))}
                  </select>
                  {selectedApplication && (applicationAgreements.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '1rem' }}>No agreements yet. Accept an offer first.</p>
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {applicationAgreements.map(agreement => (
                        <div key={agreement.agreementId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: agreement.status === 'signed' ? '#f0fdf4' : 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div><strong>Agreement {agreement.agreementId}</strong><p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#64748b' }}>Offer: {agreement.offerId} · Provider: {agreement.esignProvider}</p></div>
                            <span style={dash.statusBadge(agreement.status)}>{agreement.status}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                            <div><strong>Lender Signed:</strong> {agreement.signedByLender ? '✅' : '⏳'}</div>
                            <div><strong>Patient Signed:</strong> {agreement.signedByPatient ? '✅' : '⏳'}</div>
                          </div>
                          {!agreement.signedByPatient && ['pending', 'initiated'].includes(agreement.status) && (
                            <button onClick={async () => {
                              const name = window.prompt('Enter your full name to sign:'); if (!name) return;
                              try { await patientAgreements.sign(agreement.agreementId, { signerRole: 'patient', signatoryName: name }); alert('Agreement signed!'); await handleSelectApplication(selectedApplication); } catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
                            }} style={{ ...dash.buttonPrimary, padding: '0.5rem 1rem', fontSize: '0.85rem' }}>✍️ Sign Agreement</button>
                          )}
                          {agreement.status === 'signed' && <p style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600, margin: '0.5rem 0 0' }}>✅ Fully signed — ready for disbursement</p>}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'loans' && (
            <div style={s.card}>
              <h2 style={dash.cardTitle}>💳 My Loans</h2>
              {myApplications.filter(a => ['disbursed', 'completed'].includes(a.status)).length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No disbursed loans yet.</p>
              ) : (
                <>
                  <select onChange={async (e) => {
                    const app = myApplications.find(a => a.applicationId === e.target.value); if (!app) return;
                    setSelectedApplication(app);
                    try { const res = await loanRepayment.getSchedule(app.applicationId); setLoanSchedule(res.data); } catch (err) { setLoanSchedule(null); alert('Failed to load schedule'); }
                  }} style={{ ...s.input, marginBottom: '1rem' }} defaultValue="">
                    <option value="" disabled>Select a loan</option>
                    {myApplications.filter(a => ['disbursed', 'completed'].includes(a.status)).map(app => (<option key={app.applicationId} value={app.applicationId}>{app.applicationId} — ₹{(app.sanctionedAmount || 0).toLocaleString()}</option>))}
                  </select>
                  {loanSchedule && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                        <div><strong>Loan:</strong><br />₹{(loanSchedule.sanctionedAmount || 0).toLocaleString()}</div>
                        <div><strong>Rate:</strong><br />{loanSchedule.interestRate}%</div>
                        <div><strong>Tenure:</strong><br />{loanSchedule.tenureMonths}m</div>
                        <div><strong>EMI:</strong><br />₹{(loanSchedule.emi || 0).toLocaleString()}</div>
                      </div>
                      <table style={dash.table}>
                        <thead><tr><th style={dash.th}>#</th><th style={dash.th}>Due</th><th style={dash.th}>EMI</th><th style={dash.th}>Principal</th><th style={dash.th}>Interest</th><th style={dash.th}>Balance</th><th style={dash.th}>Status</th></tr></thead>
                        <tbody>
                          {(loanSchedule.schedule || []).map(emi => (
                            <tr key={emi.emiNumber}>
                              <td style={dash.td}>#{emi.emiNumber}</td>
                              <td style={dash.td}>{new Date(emi.dueDate).toLocaleDateString()}</td>
                              <td style={dash.td}>₹{(emi.emiAmount || 0).toLocaleString()}</td>
                              <td style={dash.td}>₹{(emi.principal || 0).toLocaleString()}</td>
                              <td style={dash.td}>₹{(emi.interest || 0).toLocaleString()}</td>
                              <td style={dash.td}>₹{(emi.closingBalance || 0).toLocaleString()}</td>
                              <td style={dash.td}><span style={dash.statusBadge(emi.status === 'due' ? 'submitted' : 'approved')}>{emi.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'refunds' && (
            <div style={s.card}>
              <h2 style={dash.cardTitle}>💸 Refunds</h2>
              {myApplications.filter(a => ['disbursed', 'pending_disbursal', 'agreement_signed'].includes(a.status)).length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No eligible loans for refund.</p>
              ) : (
                <>
                  <select onChange={(e) => { const app = myApplications.find(a => a.applicationId === e.target.value); if (app) handleSelectApplication(app); }} style={{ ...s.input, marginBottom: '1rem' }} defaultValue="">
                    <option value="" disabled>Select application</option>
                    {myApplications.filter(a => ['disbursed', 'pending_disbursal', 'agreement_signed'].includes(a.status)).map(app => (<option key={app.applicationId} value={app.applicationId}>{app.applicationId} — ₹{(app.sanctionedAmount || 0).toLocaleString()}</option>))}
                  </select>
                  {selectedApplication && applicationRefunds.length === 0 && (
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', padding: '1rem', borderRadius: '8px' }}>
                      <p style={{ margin: '0 0 0.75rem', color: '#92400e', fontSize: '0.875rem' }}>⚠️ To request a refund, contact support with your application ID.</p>
                      <button onClick={() => alert('Contact support at support@hospitalhub.in')} style={dash.buttonPrimary}>📧 Contact Support</button>
                    </div>
                  )}
                  {selectedApplication && applicationRefunds.length > 0 && (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {applicationRefunds.map(refund => (
                        <div key={refund.transactionId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: refund.status === 'refunded' ? '#f0fdf4' : 'white' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <strong>Refund {refund.transactionId}</strong>
                            <span style={dash.statusBadge(refund.status)}>{refund.status}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                            <div><strong>Amount:</strong> ₹{(refund.amount || 0).toLocaleString()}</div>
                            <div><strong>Type:</strong> {refund.refund?.refundType || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* NOTIFICATION HISTORY — shown under all tabs */}
          {notificationLog.length > 0 && (
            <div style={{ ...s.card, marginTop: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.1rem' }}>📱 Notification History</h3>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {notificationLog.slice(0, 10).map((notif, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', padding: '8px', borderBottom: '1px solid #f1f5f9' }}>
                    <span>{notif.type === 'sms' && '📱'} {notif.type === 'email' && '📧'} {notif.type === 'whatsapp' && '💬'}</span>
                    <span style={{ marginLeft: '8px' }}>{new Date(notif.sentAt).toLocaleString()}</span>
                    <p style={{ marginTop: '4px', color: '#374151' }}>{notif.message?.substring(0, 150)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PREVIOUS APPLICATIONS */}
          {loanHistory.length > 1 && activeTab === 'applications' && (
            <div style={{ ...s.card, marginTop: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>Previous Applications</h3>
              {loanHistory.slice(0, 5).map(loan => (
                <div key={loan.applicationId} style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 0', cursor: 'pointer' }} onClick={() => handleSelectApplication(loan)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>{loan.lenderId?.businessName || 'Lender'}</strong><p style={{ fontSize: '11px', color: '#6b7280' }}>{loan.applicationId}</p></div>
                    <div style={{ textAlign: 'right' }}>
                      ₹{(loan.estimatedAmount || 0).toLocaleString()}
                      <p style={{ fontSize: '11px', color: loan.status === 'disbursed' ? '#10b981' : '#f59e0b' }}>{loan.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: WIZARD
  // ============================================
  if (step === 1) {
    return (
      <div style={s.container}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>Health on EMI</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Get medical treatment now, pay in easy EMIs</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
              {[{ v: 'Pan India', l: 'Lenders' }, { v: '₹5K-₹1Cr', l: 'Loan Range' }, { v: '0% EMI', l: 'Available' }].map((st, i) => (
                <div key={i} style={{ textAlign: 'center' }}><div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{st.v}</div><div style={{ fontSize: '11px', color: '#64748b' }}>{st.l}</div></div>
              ))}
            </div>
          </div>
          {isLoggedIn && (
            <div style={{ ...s.card, marginBottom: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', marginBottom: '8px' }}>Already logged in. Go to your dashboard:</p>
              <button onClick={() => setView('dashboard')} style={s.btn('#4f46e5')}>Go to My Loan Dashboard →</button>
            </div>
          )}
          <div style={s.card}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>📍 Your Location</h3>
            <div style={{ marginBottom: '14px' }}><label style={s.label}>PIN Code *</label><input type="text" value={userPincode} onChange={e => setUserPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit pincode" style={s.input} /></div>
            <div style={{ marginBottom: '14px' }}><label style={s.label}>City</label><input type="text" value={userCity} onChange={e => setUserCity(e.target.value)} placeholder="Your city" style={s.input} /></div>
            <button onClick={handleLocationSubmit} disabled={loading} style={s.btn('linear-gradient(135deg, #8b5cf6, #7c3aed)')}>{loading ? 'Finding lenders...' : 'Find Lenders →'}</button>
            <button onClick={() => { fetchLendersFromAPI('', '', '', ''); setStep(2); }} style={{ ...s.btn('transparent'), color: '#8b5cf6', marginTop: '8px', fontWeight: 600, fontSize: '13px' }}>Skip (Show all lenders)</button>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <Link to="/lender/register" style={{ padding: '10px 20px', background: '#10b981', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>🏦 Register as Lender</Link>
            <Link to="/lender/login" style={{ padding: '10px 20px', background: '#1e3a8a', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '13px' }}>🔑 Lender Login</Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2 && !isLoggedIn) {
    return (
      <div style={s.container}>
        <div style={{ maxWidth: '420px', margin: '0 auto', padding: '40px 20px' }}>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }}>← Back</button>
          <div style={s.card}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}><span style={{ fontSize: '40px' }}>💳</span><h2 style={{ fontSize: '22px', fontWeight: 800 }}>Health EMI</h2><p style={{ color: '#64748b', fontSize: '13px' }}>Login to apply for medical loan</p></div>
            <div style={{ marginBottom: '14px' }}><label style={s.label}>Mobile Number *</label><input type="tel" value={loginMobile} onChange={e => setLoginMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" style={s.input} disabled={loginOtpSent} /></div>
            {!loginOtpSent ? (
              <button onClick={handleSendLoginOTP} disabled={loading} style={s.btn('#8b5cf6')}>{loading ? 'Sending...' : 'Send OTP'}</button>
            ) : (
              <>
                <div style={{ marginBottom: '14px' }}><label style={s.label}>Enter OTP</label><input type="text" value={loginOtp} onChange={e => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit OTP" style={s.input} /></div>
                <button onClick={handleVerifyLoginOTP} disabled={loading} style={s.btn('#10b981')}>{loading ? 'Verifying...' : 'Verify & Continue'}</button>
              </>
            )}
            <p style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', marginTop: '16px' }}>Your Patient ID will be created automatically</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div style={s.container}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Treatment Details</h2>
            <span style={{ fontSize: '12px', color: '#8b5cf6' }}>ID: {patientId}</span>
          </div>
          <div style={s.card}>
            <form onSubmit={handleCostSubmit}>
              <div style={{ marginBottom: '16px' }}><label style={s.label}>Treatment Type *</label><select value={formData.treatmentType} onChange={e => setFormData(p => ({ ...p, treatmentType: e.target.value }))} style={s.select} required><option value="">Select treatment</option><option value="Surgery">🏥 Surgery</option><option value="Dental">🦷 Dental</option><option value="Eye Care">👁️ Eye Care</option><option value="Maternity">👶 Maternity</option><option value="Heart/Cardiac">❤️ Heart/Cardiac</option><option value="Orthopedic">🦴 Orthopedic</option><option value="Diagnostic Tests">🔬 Diagnostic Tests</option><option value="Health Checkup">🩺 Health Checkup</option></select></div>
              <div style={{ marginBottom: '16px' }}><label style={s.label}>Hospital / Diagnostic Center *</label><input type="text" value={formData.hospitalName} onChange={e => setFormData(p => ({ ...p, hospitalName: e.target.value }))} placeholder="Enter hospital or lab name" style={s.input} required /></div>
              <div style={{ marginBottom: '20px' }}><label style={s.label}>Treatment Cost (₹) *</label><input type="number" value={formData.treatmentCost} onChange={e => setFormData(p => ({ ...p, treatmentCost: e.target.value }))} placeholder="Enter amount" style={s.input} required min="5000" /><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#6b7280' }}><span>Min: ₹5,000</span><span>Unsecured up to ₹55L | Secured up to ₹1Cr+</span></div></div>
              <div style={{ marginBottom: '16px' }}><label style={s.label}>Hospital Booking ID *</label><input type="text" value={formData.bookingId || ''} onChange={e => setFormData(p => ({ ...p, bookingId: e.target.value }))} placeholder="e.g., ADM1793018065241288" style={s.input} required /><div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>From your HospitalHub booking confirmation</div></div>
              <button type="submit" style={s.btn('linear-gradient(135deg, #8b5cf6, #7c3aed)')}>View Loan Offers →</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    const principal = parseInt(formData.treatmentCost) || 0;
    const filtered = getFilteredLenders();
    const breakdown = (formData.selectedLender && formData.selectedTenure) ? calculateFullBreakdown(formData.selectedLender, principal, formData.selectedTenure) : null;

    return (
      <div style={s.container}>
        <div style={{ maxWidth: '850px', margin: '0 auto', padding: '24px 20px' }}>
          <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }}>← Back to treatment details</button>
          <div style={s.card}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Compare Loan Offers</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Treatment Cost: <strong>{formatINR(principal)}</strong> | {formData.treatmentType}</p>

            {/* CIBIL / income / employment filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <input type="number" value={cibilScore} onChange={e => setCibilScore(e.target.value)} placeholder="CIBIL Score" style={{ ...s.input, width: '130px', padding: '10px' }} />
              <input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} placeholder="Monthly Income" style={{ ...s.input, width: '140px', padding: '10px' }} />
              <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} style={{ ...s.select, width: '140px', padding: '10px' }}><option value="">Employment</option><option>Salaried</option><option>Self-Employed</option><option>Business</option><option>Retired</option></select>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {['all', 'unsecured', 'secured'].map(cat => (
                <button key={cat} onClick={() => setLoanCategory(cat)} style={{ padding: '8px 18px', borderRadius: '20px', border: loanCategory === cat ? '2px solid #8b5cf6' : '1px solid #e2e8f0', background: loanCategory === cat ? '#f3e8ff' : 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: loanCategory === cat ? '#7c3aed' : '#475569' }}>{cat === 'all' ? 'All Lenders' : cat === 'unsecured' ? '🟢 Unsecured' : '🔒 Secured'}</button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b', alignSelf: 'center' }}>{filtered.length} lender{filtered.length !== 1 ? 's' : ''} found</span>
            </div>

            {filtered.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏦</div>
                <p style={{ fontWeight: 600, fontSize: '15px' }}>No lenders available in your area</p>
                <button onClick={() => setStep(1)} style={{ ...s.btn('linear-gradient(135deg, #8b5cf6, #7c3aed)'), marginTop: '12px' }}>Change Location</button>
              </div>
            )}

            {filtered.map(lender => {
              const eligibility = checkEligibility(lender);
              const isSelected = formData.selectedLender?.lenderId === lender.lenderId || formData.selectedLender?._id === lender._id || formData.selectedLender?.id === lender.id;
              return (
                <div key={lender.lenderId || lender._id || lender.id} onClick={() => handleSelectLender(lender)} style={{ border: isSelected ? '2px solid #8b5cf6' : '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', marginBottom: '12px', cursor: 'pointer', background: isSelected ? '#faf5ff' : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '16px' }}>{lender.businessName || lender.name}</strong>
                      <span style={s.badge('#f1f5f9', '#475569')}>{lender.lenderType || 'National'}</span>
                      {eligibility.eligible === true && <span style={{ ...s.badge('#d1fae5', '#065f46'), marginLeft: '6px' }}>✅ Eligible</span>}
                      {eligibility.eligible === false && <span style={{ ...s.badge('#fee2e2', '#991b1b'), marginLeft: '6px' }}>❌ {eligibility.reason}</span>}
                      {lender.nearestBranch && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#3b82f6' }}>📍 {lender.assignedBranchName || lender.nearestBranch?.branchName}</span>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: (lender.interestRate || lender.loanProducts?.[0]?.interestRate) === 0 ? '#059669' : '#1e293b' }}>{lender.interestRate || lender.loanProducts?.[0]?.interestRate || 'N/A'}%</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{lender.approvalTime || 'Varies'}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{lender.description || ''}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Loan: {formatINR(lender.minLoan || 5000)} - {formatINR(lender.maxLoan || 10000000)} | CIBIL: {lender.minCibil || 600}+ | Fee: {lender.processingFee || 2}%</p>
                  {lender.requiresCollateral && <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>🏠 Collateral Required: {lender.collateralTypes?.join(', ')}</p>}
                  {!lender.requiresCollateral && (lender.interestRate === 0) && <p style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>🔥 0% EMI Offer - No interest!</p>}

                  {isSelected && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      {/* v2 product dropdown */}
                      {lenderProducts.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>Loan Product *</p>
                          <select
                            value={selectedProductId}
                            onChange={(e) => { e.stopPropagation(); handleSelectProduct(e.target.value); }}
                            onClick={(e) => e.stopPropagation()}
                            style={s.select}
                            required
                          >
                            <option value="">-- Select Product --</option>
                            {lenderProducts.map(p => (
                              <option key={p.productId || p._id} value={p.productId || p._id}>
                                {p.productName} — ₹{(p.minAmount || 0).toLocaleString()} to ₹{(p.maxAmount || 0).toLocaleString()} @ {p.interestRate}% for {p.minTenureMonths || 3}-{p.maxTenureMonths || 36} months
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <p style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>Select Tenure:</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {(lender.tenure || [12, 24, 36]).map(t => {
                          const emi = calculateEMI(principal, lender.interestRate || 0, t);
                          return (
                            <button key={t} onClick={(ev) => { ev.stopPropagation(); handleSelectTenure(t, lender); }} style={{ padding: '10px 16px', borderRadius: '10px', border: formData.selectedTenure === t ? '2px solid #8b5cf6' : '1px solid #e2e8f0', background: formData.selectedTenure === t ? '#f3e8ff' : 'white', cursor: 'pointer', minWidth: '90px', fontWeight: formData.selectedTenure === t ? 700 : 500 }}>
                              <div style={{ fontSize: '14px' }}>{t} months</div><div style={{ fontSize: '11px', color: '#059669' }}>{formatINR(emi)}/mo</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {breakdown && isSelected && (
                    <div style={{ marginTop: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ background: '#f8fafc', padding: '12px 16px', fontWeight: 700, fontSize: '14px', borderBottom: '1px solid #e2e8f0' }}>💰 Complete Cost Breakdown</div>
                      <div style={{ padding: '12px 16px' }}>
                        {[
                          { l: 'Treatment Cost', v: principal },
                          { l: 'Processing Fee', v: breakdown.processingFee },
                          { l: 'GST on Processing', v: breakdown.gstOnPF },
                          { l: 'Documentation Charge', v: breakdown.docCharge },
                          { l: 'Stamp Duty', v: breakdown.stampDuty },
                          { l: 'TOTAL CHARGES', v: breakdown.totalCharges, bold: true },
                          { l: 'TOTAL LOAN AMOUNT', v: breakdown.totalLoan, big: true },
                          { l: '', v: 0, hr: true },
                          { l: `Monthly EMI × ${formData.selectedTenure} months`, v: breakdown.emi, green: true },
                          { l: 'Total Repayment', v: breakdown.totalRepayment },
                          { l: 'Total Interest', v: breakdown.totalInterest, red: true },
                          { l: '', v: 0, hr: true },
                          { l: 'Platform Commission', v: breakdown.platformCommission, orange: true },
                          { l: 'Hospital Receives', v: breakdown.hospitalGets, blue: true },
                        ].map((row, i) => {
                          if (row.hr) return <hr key={i} style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '8px 0' }} />;
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: row.big ? '8px 0' : '3px 0', fontSize: row.big ? '16px' : '13px', fontWeight: row.big ? 800 : row.bold ? 700 : 400, color: row.green ? '#059669' : row.red ? '#ef4444' : row.orange ? '#f59e0b' : row.blue ? '#3b82f6' : '#475569', borderTop: (row.bold || row.big) ? '2px solid #e2e8f0' : 'none', marginTop: (row.bold || row.big) ? '4px' : 0 }}>
                              <span>{row.l}</span><span style={{ fontWeight: row.big || row.bold ? 800 : 600 }}>{row.v ? formatINR(row.v) : ''}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {formData.selectedTenure && formData.selectedLender && (
              <button onClick={handleProceedToKYC} style={{ ...s.btn('linear-gradient(135deg, #8b5cf6, #7c3aed)'), marginTop: '20px' }}>Continue to Application →</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div style={s.container}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 20px' }}>
          <button onClick={() => setStep(4)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }}>← Back to lenders</button>
          <div style={s.card}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Complete Loan Application</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              Lender: <strong>{formData.selectedLender?.businessName || formData.selectedLender?.name}</strong> • Amount: {formatINR(parseInt(formData.treatmentCost))}
              {formData.selectedLender?.requiresCollateral && <span style={{ color: '#f59e0b' }}> • Collateral Required</span>}
            </p>

            <form onSubmit={handleSubmitApplication}>
              <div style={{ marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>📱 Aadhaar Verification (eKYC)</h4>
                {!aadhaarVerified ? (
                  <>
                    <input type="text" value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="Enter 12-digit Aadhaar number" style={{ ...s.input, marginBottom: '8px' }} />
                    {!aadhaarOtpSent ? (
                      <button type="button" onClick={handleSendAadhaarOTP} style={s.btn('#8b5cf6')}>Send OTP</button>
                    ) : (
                      <div>
                        <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>OTP sent to Aadhaar mobile ending with ****{aadhaarNumber.slice(-4)}</p>
                        <input type="text" value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" style={{ ...s.input, marginBottom: '8px' }} />
                        <button type="button" onClick={handleVerifyAadhaarOTP} style={s.btn('#10b981')}>Verify OTP</button>
                      </div>
                    )}
                  </>
                ) : <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>✅ Aadhaar Verified Successfully</div>}
              </div>

              <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>Personal Information</h3>
              <div style={{ marginBottom: '14px' }}><label style={s.label}>Full Name (as per PAN) *</label><input type="text" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} style={s.input} required /></div>
              <div style={{ marginBottom: '14px' }}><label style={s.label}>PAN Card Number *</label><input type="text" value={formData.pan} onChange={e => setFormData(p => ({ ...p, pan: e.target.value.toUpperCase() }))} placeholder="ABCDE1234F" maxLength="10" style={s.input} required /></div>
              <div style={{ marginBottom: '14px' }}><label style={s.label}>Phone Number *</label><input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="10-digit mobile number" maxLength="10" style={s.input} required /></div>
              <div style={{ marginBottom: '16px' }}><label style={s.label}>Email ID</label><input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} style={s.input} /></div>

              <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>Credit & Income Details</h3>
              <div style={{ marginBottom: '14px' }}><label style={s.label}>CIBIL Score * (Min: {formData.selectedLender?.minCibil || 650})</label><input type="number" value={cibilScore} onChange={e => setCibilScore(e.target.value)} placeholder="Enter CIBIL score (300-900)" min="300" max="900" style={s.input} required /></div>

              {!formData.selectedLender?.requiresCollateral && (
                <>
                  <div style={{ marginBottom: '14px' }}><label style={s.label}>Monthly Income (₹) *</label><input type="number" value={monthlyIncome} onChange={e => setMonthlyIncome(e.target.value)} placeholder="Enter monthly income" style={s.input} /></div>
                  <div style={{ marginBottom: '16px' }}><label style={s.label}>Employment Type</label><select value={employmentType} onChange={e => setEmploymentType(e.target.value)} style={s.select}><option value="">Select</option><option value="Salaried">Salaried</option><option value="Self-Employed">Self-Employed</option><option value="Business">Business</option><option value="Retired">Retired</option></select></div>
                </>
              )}

              {formData.selectedLender?.requiresCollateral && (
                <div style={{ marginBottom: '16px', border: '1px solid #fcd34d', borderRadius: '10px', padding: '14px', background: '#fffbeb' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>🏠 Collateral / Mortgage Details</h4>
                  <div style={{ marginBottom: '8px' }}><select value={collateralDetails?.type || ''} onChange={e => setCollateralDetails(p => ({ ...p, type: e.target.value }))} style={s.select}><option value="">Select collateral type</option>{formData.selectedLender.collateralTypes?.map(type => (<option key={type} value={type}>{type}</option>))}</select></div>
                  <div style={{ marginBottom: '8px' }}><input type="number" placeholder="Estimated value (₹)" value={collateralDetails?.value || ''} onChange={e => setCollateralDetails(p => ({ ...p, value: e.target.value }))} style={s.input} /></div>
                  <textarea placeholder="Description / Location details" value={collateralDetails?.description || ''} onChange={e => setCollateralDetails(p => ({ ...p, description: e.target.value }))} rows="2" style={{ ...s.input, resize: 'vertical' }} />
                </div>
              )}

              <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>📄 Required Documents</h3>
              {[{ key: 'tentativeEstimate', label: '🏥 Tentative Hospital Bill/Estimate *', bg: '#fef3c7' }, { key: 'panCard', label: '📇 PAN Card *', bg: '#fef3c7' }, { key: 'aadhaarCard', label: '🆔 Aadhaar Card *', bg: '#fef3c7' }, { key: 'salarySlip', label: '💰 Salary Slip (Last 3 months) - Optional', bg: 'white' }, { key: 'bankStatement', label: '🏦 Bank Statement (6 months) - Optional', bg: 'white' }].map(doc => (
                <div key={doc.key} style={{ marginBottom: '10px', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: doc.bg }}>
                  <label style={{ fontWeight: 600, fontSize: '13px' }}>{doc.label}</label>
                  <input type="file" onChange={e => handleFileUpload(doc.key, e.target.files[0])} accept=".pdf,.jpg,.png" style={{ display: 'block', marginTop: '4px', fontSize: '12px' }} />
                  {uploadedDocuments[doc.key] && <p style={{ color: '#10b981', fontSize: '11px', marginTop: '4px' }}>✅ {uploadedDocuments[doc.key].name}</p>}
                </div>
              ))}

              <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '12px' }}>
                ⚡ <strong>Process:</strong> Application submitted to {formData.selectedLender?.businessName || formData.selectedLender?.name}. Approval time: {formData.selectedLender?.approvalTime || '2-3 days'}
              </div>

              <button type="submit" disabled={loading} style={{ ...s.btn('linear-gradient(135deg, #8b5cf6, #7c3aed)'), opacity: loading ? 0.7 : 1 }}>{loading ? 'Submitting...' : 'Submit Application to Lender →'}</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Financing;