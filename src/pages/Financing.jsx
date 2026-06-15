import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAuth, patientLoans } from '../services/loanApi';

const Financing = () => {
  const navigate = useNavigate();

  // ============================================
  // ALL 3 TYPES OF LENDERS IN ONE PLACE (Fallback if API fails)
  // ============================================
  
  const nbfcLenders = [
    { id: 'nbfc_1', name: "Bajaj Finserv", logo: "🏦", type: "NBFC", category: "unsecured", minCibil: 725, maxLoan: 5500000, minLoan: 50000, interestRate: 10, tenure: [6,12,18,24,36,48], processingFee: 1, approvalTime: "10 minutes", requiresCollateral: false, description: "Instant digital loan for medical emergencies" },
    { id: 'nbfc_2', name: "Hero FinCorp", logo: "🏍️", type: "NBFC", category: "unsecured", minCibil: 700, maxLoan: 500000, minLoan: 50000, interestRate: 18, tenure: [6,12,24,36], processingFee: 2, approvalTime: "10 minutes", requiresCollateral: false, description: "Medical emergency loan - no collateral" },
    { id: 'nbfc_3', name: "SMFG India Credit", logo: "🇮🇳", type: "NBFC", category: "unsecured", minCibil: 700, maxLoan: 3000000, minLoan: 300000, interestRate: 13, tenure: [12,24,36,48,60], processingFee: 1.5, approvalTime: "24 hours", requiresCollateral: false, description: "High-value personal loan for treatment" }
  ];

  const medicalEmiLenders = [
    { id: 'medi_1', name: "SaveIN + Trillionloans", logo: "💰", type: "Medical EMI", category: "unsecured", minCibil: 650, maxLoan: 500000, minLoan: 10000, interestRate: 0, tenure: [3,6,9,12], processingFee: 2, approvalTime: "2 minutes", requiresCollateral: false, description: "0% EMI on partner hospitals" },
    { id: 'medi_2', name: "CarePay (Careena AI)", logo: "🤖", type: "Medical EMI", category: "unsecured", minCibil: 600, maxLoan: 1000000, minLoan: 10000, interestRate: 0, tenure: [6,12,18,24], processingFee: 3, approvalTime: "Instant", requiresCollateral: false, description: "AI-based instant approval - up to ₹10L" },
    { id: 'medi_3', name: "QubeHealth", logo: "🧊", type: "Medical EMI", category: "unsecured", minCibil: 650, maxLoan: 500000, minLoan: 5000, interestRate: 0, tenure: [6,12], processingFee: 2.5, approvalTime: "Instant", requiresCollateral: false, description: "EMI at 0% interest on healthcare" }
  ];

  const securedLenders = [
    { id: 'sec_1', name: "HealthFin Secured", logo: "🏥", type: "Secured", category: "secured", minCibil: 650, maxLoan: 10000000, minLoan: 200000, interestRate: 9.5, tenure: [12,24,36,48,60,72], processingFee: 1, approvalTime: "2-3 days", requiresCollateral: true, collateralTypes: ['Property', 'Fixed Deposit', 'Gold'], description: "Lowest interest with property mortgage" },
    { id: 'sec_2', name: "MedLoan Gold", logo: "⭐", type: "Secured", category: "secured", minCibil: 600, maxLoan: 2500000, minLoan: 20000, interestRate: 10.5, tenure: [6,12,24,36], processingFee: 0.5, approvalTime: "Same day", requiresCollateral: true, collateralTypes: ['Gold', 'Jewelry'], description: "Loan against gold - instant approval" },
    { id: 'sec_3', name: "CareFirst Secured", logo: "🩺", type: "Secured", category: "secured", minCibil: 620, maxLoan: 7500000, minLoan: 50000, interestRate: 11, tenure: [12,24,36,48], processingFee: 1.5, approvalTime: "3-5 days", requiresCollateral: true, collateralTypes: ['Property', 'Fixed Deposit', 'Vehicle'], description: "Multiple collateral options available" }
  ];

  const allLenders = [...nbfcLenders, ...medicalEmiLenders, ...securedLenders];

  // ============================================
  // STATE VARIABLES
  // ============================================
  const [step, setStep] = useState(1);
  const [loanCategory, setLoanCategory] = useState('all');
  const [collateralDetails, setCollateralDetails] = useState(null);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [cibilScore, setCibilScore] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [patientId, setPatientId] = useState(null);
  const [notificationLog, setNotificationLog] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Location state
  const [userPincode, setUserPincode] = useState('');
  const [userCity, setUserCity] = useState('');
  const [userDistrict, setUserDistrict] = useState('');
  const [userState, setUserState] = useState('');
  const [locationSkipped, setLocationSkipped] = useState(false);
  
  // API lenders
  const [availableLenders, setAvailableLenders] = useState([]);
  
  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState({
    tentativeEstimate: null,
    panCard: null,
    aadhaarCard: null,
    salarySlip: null,
    bankStatement: null,
    finalBill: null
  });
  
  const [formData, setFormData] = useState({
    treatmentType: '',
    hospitalName: '',
    treatmentCost: '',
    selectedLender: null,
    selectedTenure: null,
    emi: null,
    totalPayable: null,
    totalInterest: null,
    fullName: '',
    pan: '',
    phone: '',
    email: '',
    address: '',
    applicationStatus: 'pending',
    applicationId: null
  });
  
  const [loanHistory, setLoanHistory] = useState([]);
  const [activeApplication, setActiveApplication] = useState(null);

  // ============================================
  // LOAD DATA
  // ============================================
  useEffect(() => {
    const history = localStorage.getItem('healthEmiHistory');
    if (history) {
      setLoanHistory(JSON.parse(history));
    }
    const savedPatientId = localStorage.getItem('patientId');
    const savedToken = localStorage.getItem('patientToken');
    if (savedPatientId && savedToken) {
      setPatientId(savedPatientId);
      fetchPatientProfile();
      fetchLoanHistory();
    }
    const savedNotifications = localStorage.getItem('notificationLog');
    if (savedNotifications) {
      setNotificationLog(JSON.parse(savedNotifications));
    }
  }, []);

  const fetchPatientProfile = async () => {
    try {
      const response = await patientAuth.getProfile();
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          fullName: response.data.fullName,
          email: response.data.email,
          pan: response.data.pan,
          phone: response.data.phone,
          address: response.data.serviceAddress?.address
        }));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchLoanHistory = async () => {
    try {
      const response = await patientLoans.getApplications();
      if (response.data.applications) {
        setLoanHistory(response.data.applications);
      }
    } catch (error) {
      console.error('Failed to fetch loan history:', error);
    }
  };

  // ============================================
  // FILE UPLOAD HANDLER
  // ============================================
  const handleFileUpload = (docType, file) => {
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    setUploadedDocuments(prev => ({
      ...prev,
      [docType]: { name: file.name, url: fileUrl, uploadedAt: new Date().toISOString() }
    }));
    alert(`${docType} uploaded: ${file.name}`);
  };

  // ============================================
  // NOTIFICATION FUNCTIONS
  // ============================================
  const sendSMS = (phoneNumber, message) => {
    console.log(`📱 [SMS] To: ${phoneNumber}: ${message}`);
    const notification = { id: Date.now(), type: 'sms', to: phoneNumber, message, sentAt: new Date().toISOString() };
    setNotificationLog(prev => [notification, ...prev]);
    localStorage.setItem('notificationLog', JSON.stringify([notification, ...notificationLog]));
    return true;
  };

  const sendEmail = (email, subject, body) => {
    if (!email) return;
    console.log(`📧 [Email] To: ${email}: ${subject}`);
    const notification = { id: Date.now(), type: 'email', to: email, subject, message: body, sentAt: new Date().toISOString() };
    setNotificationLog(prev => [notification, ...prev]);
    return true;
  };

  const sendWhatsApp = (phoneNumber, message) => {
    console.log(`💬 [WhatsApp] To: ${phoneNumber}: ${message}`);
    const notification = { id: Date.now(), type: 'whatsapp', to: phoneNumber, message, sentAt: new Date().toISOString() };
    setNotificationLog(prev => [notification, ...prev]);
    return true;
  };

  const sendAllNotifications = (phone, email, smsMessage, emailSubject, emailBody, whatsappMessage) => {
    if (phone && phone.length === 10) {
      sendSMS(phone, smsMessage);
      sendWhatsApp(phone, whatsappMessage || smsMessage);
    }
    if (email && email.includes('@')) {
      sendEmail(email, emailSubject, emailBody);
    }
  };

  // ============================================
  // CALCULATIONS & HELPERS
  // ============================================
  const calculateEMI = (principal, rate, months) => {
    if (rate === 0) return Math.round(principal / months);
    const monthlyRate = rate / 100 / 12;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const getFilteredLenders = () => {
    const cost = parseInt(formData.treatmentCost) || 0;
    let filtered = availableLenders.length > 0 ? availableLenders : allLenders;
    if (loanCategory === 'unsecured') {
      filtered = filtered.filter(l => l.category === 'unsecured');
    } else if (loanCategory === 'secured') {
      filtered = filtered.filter(l => l.category === 'secured');
    }
    return filtered.filter(l => cost >= (l.minLoan || 5000) && cost <= (l.maxLoan || 10000000));
  };

  // ============================================
  // PATIENT AUTHENTICATION (API)
  // ============================================
  const [loginMobile, setLoginMobile] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSendLoginOTP = async () => {
    if (!loginMobile || loginMobile.length !== 10) {
      alert('Enter valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const response = await patientAuth.sendOTP(loginMobile);
      if (response.data.success) {
        setLoginOtpSent(true);
        alert(`OTP sent to ${loginMobile}. Demo OTP: ${response.data.demoOtp}`);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOTP = async () => {
    if (!loginOtp) {
      alert('Enter OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await patientAuth.verifyOTP(loginMobile, loginOtp, formData.fullName, formData.email);
      if (response.data.success) {
        localStorage.setItem('patientToken', response.data.token);
        localStorage.setItem('patientId', response.data.patient.id);
        setPatientId(response.data.patient.id);
        setIsLoggedIn(true);
        alert(`Login successful! Patient ID: ${response.data.patient.id}`);
        setStep(3);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOCATION HANDLER
  // ============================================
  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!userPincode || userPincode.length !== 6) {
      alert('Enter valid 6-digit pincode');
      return;
    }
    setLoading(true);
    try {
      const response = await patientLoans.getNearbyLenders({
        pincode: userPincode,
        city: userCity,
        district: userDistrict,
        state: userState
      });
      setAvailableLenders(response.data.lenders || []);
      alert(`Found ${response.data.count} lenders in your area`);
      setStep(2);
    } catch (error) {
      console.error('Location error:', error);
      alert('Could not fetch lenders. Using default lenders.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOAN APPLICATION HANDLERS
  // ============================================
  const handleCostSubmit = (e) => {
    e.preventDefault();
    const cost = parseInt(formData.treatmentCost);
    if (cost < 5000) {
      alert('Minimum loan amount is ₹5,000');
      return;
    }
    if (cost > 10000000) {
      alert('Maximum loan amount is ₹1,00,00,000');
      return;
    }
    setStep(4);
  };

  const handleSelectLender = (lender) => {
    setFormData({ ...formData, selectedLender: lender, selectedTenure: null, emi: null });
  };

  const handleSelectTenure = (tenure) => {
    const principal = parseInt(formData.treatmentCost);
    const rate = formData.selectedLender.interestRate;
    const emi = calculateEMI(principal, rate, tenure);
    const totalPayable = emi * tenure;
    const totalInterest = totalPayable - principal;
    setFormData({ 
      ...formData, 
      selectedTenure: tenure, 
      emi: emi,
      totalPayable: totalPayable,
      totalInterest: totalInterest
    });
  };

  const handleSendAadhaarOTP = () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      alert('Enter valid 12-digit Aadhaar number');
      return;
    }
    setAadhaarOtpSent(true);
    if (formData.phone) {
      sendSMS(formData.phone, `Your Aadhaar OTP is 123456. Valid for 10 minutes. - KiaetoCare`);
      sendWhatsApp(formData.phone, `🔐 *Aadhaar OTP*\nYour OTP is 123456\nValid for 10 minutes\n- KiaetoCare`);
    }
    alert(`OTP sent to mobile linked with Aadhaar ending with ${aadhaarNumber.slice(-4)}`);
  };

  const handleVerifyAadhaarOTP = () => {
    if (!otpValue || otpValue.length !== 6) {
      alert('Enter valid 6-digit OTP');
      return;
    }
    setAadhaarVerified(true);
    if (formData.phone) {
      sendSMS(formData.phone, `Aadhaar verification successful. Continue with loan application. - KiaetoCare`);
    }
    alert('Aadhaar verified successfully!');
  };

  const handleProceedToKYC = () => {
    if (!formData.selectedTenure) {
      alert('Please select tenure');
      return;
    }
    setStep(5);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.pan) {
      alert('Please fill all required KYC fields');
      return;
    }
    if (!aadhaarVerified) {
      alert('Please complete Aadhaar OTP verification');
      return;
    }
    if (!cibilScore) {
      alert('Please enter your CIBIL score');
      return;
    }
    if (parseInt(cibilScore) < (formData.selectedLender.minCibil || 600)) {
      alert(`Your CIBIL score (${cibilScore}) is below ${formData.selectedLender.name}'s minimum requirement`);
      return;
    }
    if (formData.selectedLender.requiresCollateral && !collateralDetails) {
      alert('Please provide collateral/mortgage details');
      return;
    }
    if (!uploadedDocuments.tentativeEstimate) {
      alert('Please upload tentative hospital bill/estimate');
      return;
    }
    if (!uploadedDocuments.panCard) {
      alert('Please upload PAN card');
      return;
    }
    if (!uploadedDocuments.aadhaarCard) {
      alert('Please upload Aadhaar card');
      return;
    }
    
    setLoading(true);
    try {
      const applicationData = {
        treatmentType: formData.treatmentType,
        hospitalName: formData.hospitalName,
        estimatedAmount: parseInt(formData.treatmentCost),
        lenderId: formData.selectedLender._id || formData.selectedLender.id,
        tenure: formData.selectedTenure,
        documents: {
          tentativeEstimate: uploadedDocuments.tentativeEstimate?.url,
          panCard: uploadedDocuments.panCard?.url,
          aadhaarCard: uploadedDocuments.aadhaarCard?.url,
          salarySlip: uploadedDocuments.salarySlip?.url,
          bankStatement: uploadedDocuments.bankStatement?.url
        },
        collateral: collateralDetails,
        patientLocation: {
          pincode: userPincode,
          city: userCity,
          district: userDistrict,
          state: userState
        }
      };
      
      const response = await patientLoans.submitApplication(applicationData);
      if (response.data.success) {
        const smsMessage = `KiaetoCare: Loan application ${response.data.applicationId} submitted to ${formData.selectedLender.name}. Track status: https://kiaetocare.com/my-loans. - KiaetoCare`;
        const emailSubject = `Loan Application Submitted - ${response.data.applicationId}`;
        const emailBody = `Dear ${formData.fullName},\n\nYour loan application has been submitted.\n\nApplication ID: ${response.data.applicationId}\nAmount: ₹${parseInt(formData.treatmentCost).toLocaleString()}\nLender: ${formData.selectedLender.name}\n\nTrack: https://kiaetocare.com/my-loans\n\nRegards,\nKiaetoCare Team`;
        sendAllNotifications(formData.phone, formData.email, smsMessage, emailSubject, emailBody, null);
        alert(`Application Submitted!\nApplication ID: ${response.data.applicationId}\nAssigned to: ${response.data.assignedBranch?.branchName || 'Lender'}`);
        fetchLoanHistory();
        setStep(7);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalBillUpload = async (application, file) => {
    if (!file) return;
    setLoading(true);
    try {
      const fileUrl = URL.createObjectURL(file);
      await patientLoans.uploadFinalBill(application.applicationId, fileUrl, null, null);
      alert(`Final bill uploaded. Lender will process disbursal.`);
      fetchLoanHistory();
    } catch (error) {
      alert('Failed to upload final bill');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAnother = () => {
    setFormData({
      treatmentType: '', hospitalName: '', treatmentCost: '', selectedLender: null,
      selectedTenure: null, emi: null, totalPayable: null, totalInterest: null,
      fullName: '', pan: '', phone: '', email: '', address: '',
      applicationStatus: 'pending', applicationId: null
    });
    setCollateralDetails(null);
    setAadhaarVerified(false);
    setAadhaarOtpSent(false);
    setAadhaarNumber('');
    setOtpValue('');
    setCibilScore('');
    setMonthlyIncome('');
    setEmploymentType('');
    setLoanCategory('all');
    setUploadedDocuments({
      tentativeEstimate: null, panCard: null, aadhaarCard: null,
      salarySlip: null, bankStatement: null, finalBill: null
    });
    setStep(3);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ============================================
  // STEP 1: LOCATION SELECTION
  // ============================================
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '3rem' }}>📍</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Find Lenders Near You</h1>
            <p style={{ color: '#6b7280' }}>Enter your pincode to see available loan options</p>
          </div>
          <form onSubmit={handleLocationSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>PIN Code *</label>
              <input type="text" value={userPincode} onChange={(e) => setUserPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit pincode" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Finding lenders...' : 'Continue →'}
            </button>
          </form>
          <button onClick={() => { setLocationSkipped(true); setStep(2); }} style={{ width: '100%', backgroundColor: 'transparent', color: '#8b5cf6', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>Skip (Show national lenders)</button>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 2: MOBILE OTP LOGIN
  // ============================================
  if (step === 2 && !isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem' }}>← Back</button>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '3rem' }}>💳</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Health EMI</h1>
            <p style={{ color: '#6b7280' }}>Login to apply for medical loan</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Mobile Number *</label>
            <input type="tel" value={loginMobile} onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} disabled={loginOtpSent} />
          </div>
          {!loginOtpSent ? (
            <button onClick={handleSendLoginOTP} disabled={loading} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Enter OTP</label>
                <input type="text" value={loginOtp} onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit OTP" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
              </div>
              <button onClick={handleVerifyLoginOTP} disabled={loading} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </>
          )}
          <p style={{ fontSize: '0.7rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>Your Patient ID will be created automatically</p>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 3: TREATMENT DETAILS
  // ============================================
  if (step === 3) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Treatment Details</h2>
            <span style={{ fontSize: '0.7rem', color: '#8b5cf6' }}>ID: {patientId}</span>
          </div>
          <form onSubmit={handleCostSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Treatment Type *</label>
              <select value={formData.treatmentType} onChange={(e) => setFormData({...formData, treatmentType: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required>
                <option value="">Select treatment</option>
                <option value="Surgery">🏥 Surgery</option>
                <option value="Dental">🦷 Dental</option>
                <option value="Eye Care">👁️ Eye Care</option>
                <option value="Maternity">👶 Maternity</option>
                <option value="Heart/Cardiac">❤️ Heart/Cardiac</option>
                <option value="Orthopedic">🦴 Orthopedic</option>
                <option value="Diagnostic Tests">🔬 Diagnostic Tests</option>
                <option value="Health Checkup">🩺 Health Checkup</option>
              </select>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Hospital / Diagnostic Center *</label>
              <input type="text" value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} placeholder="Enter hospital or lab name" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Treatment Cost (₹) *</label>
              <input type="number" value={formData.treatmentCost} onChange={(e) => setFormData({...formData, treatmentCost: e.target.value})} placeholder="Enter amount" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required min="5000" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Min: ₹5,000</span>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Unsecured up to ₹55L | Secured up to ₹1Cr+</span>
              </div>
            </div>
            <button type="submit" style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.875rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>View Loan Offers →</button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 4: LENDER COMPARISON & SELECTION
  // ============================================
  if (step === 4) {
    const principal = parseInt(formData.treatmentCost);
    const filteredLenders = getFilteredLenders();
    
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}>← Back to treatment details</button>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Compare Loan Offers</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Treatment Cost: <strong>₹{principal.toLocaleString()}</strong></p>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setLoanCategory('all')} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: loanCategory === 'all' ? '2px solid #8b5cf6' : '1px solid #e5e7eb', backgroundColor: loanCategory === 'all' ? '#f3e8ff' : 'white', cursor: 'pointer' }}>All Lenders</button>
              <button onClick={() => setLoanCategory('unsecured')} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: loanCategory === 'unsecured' ? '2px solid #8b5cf6' : '1px solid #e5e7eb', backgroundColor: loanCategory === 'unsecured' ? '#f3e8ff' : 'white', cursor: 'pointer' }}>🏦 Unsecured</button>
              <button onClick={() => setLoanCategory('secured')} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: loanCategory === 'secured' ? '2px solid #8b5cf6' : '1px solid #e5e7eb', backgroundColor: loanCategory === 'secured' ? '#f3e8ff' : 'white', cursor: 'pointer' }}>🏠 Secured/Mortgage</button>
            </div>
            {filteredLenders.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No lenders available for this amount. Try adjusting loan amount or category.</div>}
            {filteredLenders.map(lender => (
              <div key={lender.id || lender._id} onClick={() => handleSelectLender(lender)} style={{ border: formData.selectedLender?.id === lender.id || formData.selectedLender?._id === lender._id ? '2px solid #8b5cf6' : '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem', cursor: 'pointer', backgroundColor: (formData.selectedLender?.id === lender.id || formData.selectedLender?._id === lender._id) ? '#f3e8ff' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div><span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>{lender.logo}</span><strong>{lender.name}</strong><span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#e5e7eb', borderRadius: '1rem' }}>{lender.type || lender.lenderType}</span></div>
                  <div style={{ textAlign: 'right' }}><span style={{ color: lender.interestRate === 0 ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>{lender.interestRate === 0 ? '0% p.a.' : `${lender.interestRate}% p.a.`}</span><p style={{ fontSize: '0.7rem', color: '#6b7280' }}>{lender.approvalTime || 'Varies'}</p></div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{lender.description}</p>
                <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Loan: ₹{(lender.minLoan || 5000).toLocaleString()} - ₹{(lender.maxLoan || 10000000).toLocaleString()} | Min CIBIL: {lender.minCibil || 650} | Fee: {lender.processingFee || 1}%</p>
                {lender.requiresCollateral && <p style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '0.25rem' }}>🏠 Collateral Required: {lender.collateralTypes?.join(', ')}</p>}
                {!lender.requiresCollateral && lender.interestRate === 0 && <p style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem' }}>🔥 0% EMI Offer - No interest!</p>}
                {lender.nearestBranch && <p style={{ fontSize: '0.7rem', color: '#8b5cf6', marginTop: '0.25rem' }}>📍 Assigned Branch: {lender.nearestBranch.branchName}</p>}
              </div>
            ))}
            {formData.selectedLender && (
              <>
                <h3 style={{ fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Select Tenure (months)</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {(formData.selectedLender.tenure || [12, 24, 36]).map(tenure => {
                    const emi = calculateEMI(principal, formData.selectedLender.interestRate, tenure);
                    return (<button key={tenure} onClick={() => handleSelectTenure(tenure)} style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: formData.selectedTenure === tenure ? '2px solid #8b5cf6' : '1px solid #e5e7eb', backgroundColor: formData.selectedTenure === tenure ? '#f3e8ff' : 'white', cursor: 'pointer', minWidth: '100px', textAlign: 'center' }}><strong>{tenure}</strong><br /><small>₹{emi}/mo</small></button>);
                  })}
                </div>
              </>
            )}
            {formData.emi && (
              <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Loan Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Monthly EMI:</span><strong style={{ color: '#10b981' }}>₹{formData.emi.toLocaleString()}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Total Payable:</span><span>₹{formData.totalPayable.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Interest:</span><span style={{ color: '#ef4444' }}>₹{formData.totalInterest.toLocaleString()}</span></div>
                {formData.selectedLender.requiresCollateral && <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' }}>⚡ This is a secured loan. Collateral/mortgage required.</p>}
              </div>
            )}
            <button onClick={handleProceedToKYC} disabled={!formData.selectedTenure} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.875rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: formData.selectedTenure ? 'pointer' : 'not-allowed', opacity: formData.selectedTenure ? 1 : 0.5 }}>Continue to Application →</button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 5: COMPLETE APPLICATION (KYC + Aadhaar + Income + Collateral + DOCUMENTS)
  // ============================================
  if (step === 5) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={() => setStep(4)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}>← Back to lenders</button>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Complete Loan Application</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Lender: <strong>{formData.selectedLender?.name}</strong> • Amount: ₹{parseInt(formData.treatmentCost).toLocaleString()}{formData.selectedLender?.requiresCollateral && <span style={{ color: '#f59e0b' }}> • Collateral Required</span>}</p>

            <form onSubmit={handleSubmitApplication}>
              {/* Aadhaar OTP Verification */}
              <div style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📱 Aadhaar Verification (eKYC)</h4>
                {!aadhaarVerified ? (
                  <>
                    <input type="text" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="Enter 12-digit Aadhaar number" style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.5rem' }} />
                    {!aadhaarOtpSent ? (
                      <button type="button" onClick={handleSendAadhaarOTP} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Send OTP</button>
                    ) : (
                      <div>
                        <p style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.5rem' }}>OTP sent to Aadhaar mobile ending with ****{aadhaarNumber.slice(-4)}</p>
                        <input type="text" value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.5rem' }} />
                        <button type="button" onClick={handleVerifyAadhaarOTP} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Verify OTP</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ backgroundColor: '#ecfdf5', padding: '0.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>✅ Aadhaar Verified Successfully</div>
                )}
              </div>

              <h3 style={{ fontWeight: '600', marginBottom: '1rem', fontSize: '1rem' }}>Personal Information</h3>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name (as per PAN) *</label><input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>PAN Card Number *</label><input type="text" value={formData.pan} onChange={(e) => setFormData({...formData, pan: e.target.value.toUpperCase()})} placeholder="ABCDE1234F" maxLength="10" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', textTransform: 'uppercase' }} required /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="10-digit mobile number" maxLength="10" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required /></div>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email ID</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} /></div>

              <h3 style={{ fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1rem' }}>Credit & Income Details</h3>
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>CIBIL Score * (Min required: {formData.selectedLender?.minCibil || 650})</label><input type="number" value={cibilScore} onChange={(e) => setCibilScore(e.target.value)} placeholder="Enter CIBIL score (300-900)" min="300" max="900" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required /></div>

              {!formData.selectedLender?.requiresCollateral && (
                <>
                  <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Monthly Income (₹) *</label><input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="Enter monthly income" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} /></div>
                  <div style={{ marginBottom: '1.5rem' }}><label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Employment Type</label><select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}><option value="">Select</option><option value="Salaried">Salaried</option><option value="Self-Employed">Self-Employed</option><option value="Business">Business</option><option value="Retired">Retired</option></select></div>
                </>
              )}

              {formData.selectedLender?.requiresCollateral && (
                <div style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>🏠 Collateral / Mortgage Details</h4>
                  <div style={{ marginBottom: '0.75rem' }}><select value={collateralDetails?.type || ''} onChange={(e) => setCollateralDetails({...collateralDetails, type: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}><option value="">Select collateral type</option>{formData.selectedLender.collateralTypes?.map(type => (<option key={type} value={type}>{type}</option>))}</select></div>
                  <div style={{ marginBottom: '0.75rem' }}><input type="number" placeholder="Estimated value (₹)" value={collateralDetails?.value || ''} onChange={(e) => setCollateralDetails({...collateralDetails, value: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} /></div>
                  <textarea placeholder="Description / Location details" value={collateralDetails?.description || ''} onChange={(e) => setCollateralDetails({...collateralDetails, description: e.target.value})} rows="2" style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }} />
                </div>
              )}

              <h3 style={{ fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1rem' }}>📄 Required Documents</h3>
              <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#fef3c7' }}>
                <label style={{ fontWeight: 'bold' }}>🏥 Tentative Hospital Bill/Estimate *</label>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.5rem' }}>Upload the cost estimate from hospital (PDF/Image)</p>
                <input type="file" onChange={(e) => handleFileUpload('tentativeEstimate', e.target.files[0])} accept=".pdf,.jpg,.png" />
                {uploadedDocuments.tentativeEstimate && <p style={{ color: '#10b981', fontSize: '0.7rem', marginTop: '0.5rem' }}>✅ {uploadedDocuments.tentativeEstimate.name}</p>}
              </div>
              <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                <label style={{ fontWeight: 'bold' }}>📇 PAN Card *</label>
                <input type="file" onChange={(e) => handleFileUpload('panCard', e.target.files[0])} accept=".pdf,.jpg,.png" />
                {uploadedDocuments.panCard && <p style={{ color: '#10b981', fontSize: '0.7rem', marginTop: '0.5rem' }}>✅ {uploadedDocuments.panCard.name}</p>}
              </div>
              <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                <label style={{ fontWeight: 'bold' }}>🆔 Aadhaar Card *</label>
                <input type="file" onChange={(e) => handleFileUpload('aadhaarCard', e.target.files[0])} accept=".pdf,.jpg,.png" />
                {uploadedDocuments.aadhaarCard && <p style={{ color: '#10b981', fontSize: '0.7rem', marginTop: '0.5rem' }}>✅ {uploadedDocuments.aadhaarCard.name}</p>}
              </div>
              <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                <label style={{ fontWeight: 'bold' }}>💰 Salary Slip (Last 3 months)</label>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.5rem' }}>Optional but recommended for faster approval</p>
                <input type="file" onChange={(e) => handleFileUpload('salarySlip', e.target.files[0])} accept=".pdf,.jpg,.png" />
                {uploadedDocuments.salarySlip && <p style={{ color: '#10b981', fontSize: '0.7rem', marginTop: '0.5rem' }}>✅ {uploadedDocuments.salarySlip.name}</p>}
              </div>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                <label style={{ fontWeight: 'bold' }}>🏦 Bank Statement (6 months)</label>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.5rem' }}>Optional but recommended for higher loan amounts</p>
                <input type="file" onChange={(e) => handleFileUpload('bankStatement', e.target.files[0])} accept=".pdf" />
                {uploadedDocuments.bankStatement && <p style={{ color: '#10b981', fontSize: '0.7rem', marginTop: '0.5rem' }}>✅ {uploadedDocuments.bankStatement.name}</p>}
              </div>

              <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.75rem' }}>
                ⚡ <strong>Realistic Flow:</strong> Your application will be submitted to {formData.selectedLender?.name}. {formData.selectedLender?.requiresCollateral ? ' They will verify your collateral documents.' : ' They will verify your CIBIL score and income.'} Approval time: {formData.selectedLender?.approvalTime || '2-3 days'}
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.875rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Submitting...' : 'Submit Application to Lender →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 6: APPLICATION SUBMITTED CONFIRMATION
  // ============================================
  if (step === 6) {
    const application = JSON.parse(sessionStorage.getItem('currentApplication') || '{}');
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '4rem' }}>✅</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' }}>Application Submitted Successfully!</h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Your loan request has been sent to {application.lender}</p>
            <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Application ID:</span><strong>{application.applicationId}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Lender:</span><strong>{application.lender}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Loan Amount:</span><strong>₹{(application.requestedAmount || application.amount || 0).toLocaleString()}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>EMI:</span><strong>₹{application.emi}/month for {application.tenure} months</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Documents Uploaded:</span><strong>{application.documents?.tentativeEstimate ? '📄 ' : ''}{application.documents?.panCard ? '📇 ' : ''}{application.documents?.aadhaarCard ? '🆔 ' : ''}</strong></div>
            </div>
            <div style={{ backgroundColor: '#ede9fe', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>📋 <strong>What happens next?</strong></p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>1. {application.lender} will verify your application and documents</p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>2. You will receive SMS/WhatsApp/Email updates on status change</p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>3. Upon approval, lender pays hospital directly → You pay EMI to lender</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setActiveApplication(application); setStep(7); }} style={{ flex: 1, backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Track Application</button>
              <button onClick={handleBookAnother} style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Apply Another Loan</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 7: APPLICATION STATUS DASHBOARD
  // ============================================
  if (step === 7 && (activeApplication || loanHistory.length > 0)) {
    const displayApp = activeApplication || (loanHistory.length > 0 ? loanHistory[0] : null);
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}>← Back to Home</button>
          
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Loan Application Status</h2>
              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>ID: {displayApp?.applicationId}</span>
            </div>
            
            <div style={{ backgroundColor: displayApp?.status === 'disbursed' ? '#dcfce7' : displayApp?.status === 'approved' ? '#fef3c7' : displayApp?.status === 'submitted' ? '#ede9fe' : '#f3e8ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', fontWeight: 'bold', color: displayApp?.status === 'disbursed' ? '#166534' : displayApp?.status === 'approved' ? '#92400e' : displayApp?.status === 'submitted' ? '#5b21b6' : '#6b7280' }}>
                {displayApp?.status === 'disbursed' && '✅ Loan Disbursed Successfully!'}
                {displayApp?.status === 'approved' && '👍 Loan Approved! Waiting for Disbursal'}
                {displayApp?.status === 'submitted' && '⏳ Application Under Review'}
                {displayApp?.status === 'pending_disbursal' && '🏥 Final Bill Received - Processing Disbursal'}
                {displayApp?.status === 'rejected' && '❌ Application Declined'}
              </p>
            </div>
            
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Application Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                <p><strong>Patient ID:</strong></p><p>{patientId || displayApp?.patientId}</p>
                <p><strong>Patient Name:</strong></p><p>{displayApp?.patientDetails?.fullName || displayApp?.patientName}</p>
                <p><strong>Lender:</strong></p><p>{displayApp?.lenderId?.businessName || displayApp?.lender}</p>
                <p><strong>Requested Amount:</strong></p><p>₹{(displayApp?.estimatedAmount || displayApp?.amount || 0).toLocaleString()}</p>
                {displayApp?.approvedAmount && <><p><strong>Approved Amount:</strong></p><p>₹{displayApp.approvedAmount.toLocaleString()}</p></>}
                {displayApp?.disbursedAmount && <><p><strong>Disbursed Amount:</strong></p><p>₹{displayApp.disbursedAmount.toLocaleString()}</p></>}
                <p><strong>EMI:</strong></p><p>₹{displayApp?.emi}/month for {displayApp?.tenure} months</p>
                <p><strong>Hospital:</strong></p><p>{displayApp?.hospitalName}</p>
                <p><strong>Assigned Branch:</strong></p><p>{displayApp?.assignedBranchName || 'Head Office'}</p>
                <p><strong>Submitted:</strong></p><p>{formatDate(displayApp?.submittedAt)}</p>
              </div>
            </div>
            
            {(displayApp?.status === 'approved' && !displayApp?.finalBillAmount) && (
              <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🏥 Final Hospital Bill (After Treatment)</p>
                <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>After treatment completion, upload final bill for disbursal</p>
                <input type="file" onChange={(e) => handleFinalBillUpload(displayApp, e.target.files[0])} accept=".pdf,.jpg,.png" />
              </div>
            )}
            
            {notificationLog.length > 0 && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📱 Notification History</p>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {notificationLog.slice(0, 5).map((notif, idx) => (
                    <div key={idx} style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.5rem', padding: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                      <span>{notif.type === 'sms' && '📱'} {notif.type === 'email' && '📧'} {notif.type === 'whatsapp' && '💬'}</span>
                      <span style={{ marginLeft: '0.5rem' }}>{new Date(notif.sentAt).toLocaleTimeString()}</span>
                      <p style={{ marginTop: '0.25rem' }}>{notif.message?.substring(0, 80)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button onClick={handleBookAnother} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>Apply Another Loan</button>
          </div>
          
          {loanHistory.length > 1 && (
            <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Previous Applications</h3>
              {loanHistory.filter(l => l.applicationId !== displayApp?.applicationId).slice(0, 2).map((loan) => (
                <div key={loan.applicationId} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0', cursor: 'pointer' }} onClick={() => { setActiveApplication(loan); setStep(7); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><strong>{loan.lenderId?.businessName || loan.lender}</strong><p style={{ fontSize: '0.7rem' }}>{loan.applicationId}</p></div>
                    <div>₹{(loan.estimatedAmount || loan.amount || 0).toLocaleString()}<p style={{ fontSize: '0.7rem', color: loan.status === 'disbursed' ? '#10b981' : '#f59e0b' }}>{loan.status}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Financing;