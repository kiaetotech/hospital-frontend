import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Financing = () => {
  const navigate = useNavigate();

  // ============================================
  // ALL 3 TYPES OF LENDERS IN ONE PLACE
  // ============================================
  
  // OPTION 1: NBFC Lenders (Unsecured, Instant, CIBIL based)
  const nbfcLenders = [
    { id: 'nbfc_1', name: "Bajaj Finserv", logo: "🏦", type: "NBFC", category: "unsecured", minCibil: 725, maxLoan: 5500000, minLoan: 50000, interestRate: 10, tenure: [6,12,18,24,36,48], processingFee: 1, approvalTime: "10 minutes", requiresCollateral: false, description: "Instant digital loan for medical emergencies" },
    { id: 'nbfc_2', name: "Hero FinCorp", logo: "🏍️", type: "NBFC", category: "unsecured", minCibil: 700, maxLoan: 500000, minLoan: 50000, interestRate: 18, tenure: [6,12,24,36], processingFee: 2, approvalTime: "10 minutes", requiresCollateral: false, description: "Medical emergency loan - no collateral" },
    { id: 'nbfc_3', name: "SMFG India Credit", logo: "🇮🇳", type: "NBFC", category: "unsecured", minCibil: 700, maxLoan: 3000000, minLoan: 300000, interestRate: 13, tenure: [12,24,36,48,60], processingFee: 1.5, approvalTime: "24 hours", requiresCollateral: false, description: "High-value personal loan for treatment" }
  ];

  // OPTION 2: Medical EMI Platforms (0% interest, instant)
  const medicalEmiLenders = [
    { id: 'medi_1', name: "SaveIN + Trillionloans", logo: "💰", type: "Medical EMI", category: "unsecured", minCibil: 650, maxLoan: 500000, minLoan: 10000, interestRate: 0, tenure: [3,6,9,12], processingFee: 2, approvalTime: "2 minutes", requiresCollateral: false, description: "0% EMI on partner hospitals" },
    { id: 'medi_2', name: "CarePay (Careena AI)", logo: "🤖", type: "Medical EMI", category: "unsecured", minCibil: 600, maxLoan: 1000000, minLoan: 10000, interestRate: 0, tenure: [6,12,18,24], processingFee: 3, approvalTime: "Instant", requiresCollateral: false, description: "AI-based instant approval - up to ₹10L" },
    { id: 'medi_3', name: "QubeHealth", logo: "🧊", type: "Medical EMI", category: "unsecured", minCibil: 650, maxLoan: 500000, minLoan: 5000, interestRate: 0, tenure: [6,12], processingFee: 2.5, approvalTime: "Instant", requiresCollateral: false, description: "EMI at 0% interest on healthcare" }
  ];

  // OPTION 3: Secured/Direct Lenders (Mortgage/Collateral required)
  const securedLenders = [
    { id: 'sec_1', name: "HealthFin Secured", logo: "🏥", type: "Secured", category: "secured", minCibil: 650, maxLoan: 10000000, minLoan: 200000, interestRate: 9.5, tenure: [12,24,36,48,60,72], processingFee: 1, approvalTime: "2-3 days", requiresCollateral: true, collateralTypes: ['Property', 'Fixed Deposit', 'Gold'], description: "Lowest interest with property mortgage" },
    { id: 'sec_2', name: "MedLoan Gold", logo: "⭐", type: "Secured", category: "secured", minCibil: 600, maxLoan: 2500000, minLoan: 20000, interestRate: 10.5, tenure: [6,12,24,36], processingFee: 0.5, approvalTime: "Same day", requiresCollateral: true, collateralTypes: ['Gold', 'Jewelry'], description: "Loan against gold - instant approval" },
    { id: 'sec_3', name: "CareFirst Secured", logo: "🩺", type: "Secured", category: "secured", minCibil: 620, maxLoan: 7500000, minLoan: 50000, interestRate: 11, tenure: [12,24,36,48], processingFee: 1.5, approvalTime: "3-5 days", requiresCollateral: true, collateralTypes: ['Property', 'Fixed Deposit', 'Vehicle'], description: "Multiple collateral options available" }
  ];

  // Combine ALL lenders
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

  // Load loan history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('healthEmiHistory');
    if (history) {
      setLoanHistory(JSON.parse(history));
    }
    const savedPatientId = localStorage.getItem('patientId');
    if (savedPatientId) {
      setPatientId(savedPatientId);
    }
    const savedNotifications = localStorage.getItem('notificationLog');
    if (savedNotifications) {
      setNotificationLog(JSON.parse(savedNotifications));
    }
  }, []);

  // ============================================
  // NOTIFICATION FUNCTIONS (SMS, Email, WhatsApp)
  // ============================================
  
  const sendSMS = (phoneNumber, message) => {
    console.log(`📱 [SMS] To: ${phoneNumber}`);
    console.log(`📱 [SMS] Message: ${message}`);
    const notification = {
      id: Date.now(),
      type: 'sms',
      to: phoneNumber,
      message: message,
      sentAt: new Date().toISOString()
    };
    setNotificationLog(prev => [notification, ...prev]);
    localStorage.setItem('notificationLog', JSON.stringify([notification, ...notificationLog]));
    alert(`📱 SMS to ${phoneNumber}: ${message}`);
    return true;
  };

  const sendEmail = (email, subject, body) => {
    console.log(`📧 [Email] To: ${email}`);
    console.log(`📧 [Email] Subject: ${subject}`);
    console.log(`📧 [Email] Body: ${body}`);
    const notification = {
      id: Date.now(),
      type: 'email',
      to: email,
      subject: subject,
      message: body,
      sentAt: new Date().toISOString()
    };
    setNotificationLog(prev => [notification, ...prev]);
    localStorage.setItem('notificationLog', JSON.stringify([notification, ...notificationLog]));
    alert(`📧 Email sent to ${email}: ${subject}`);
    return true;
  };

  const sendWhatsApp = (phoneNumber, message) => {
    console.log(`💬 [WhatsApp] To: ${phoneNumber}`);
    console.log(`💬 [WhatsApp] Message: ${message}`);
    const notification = {
      id: Date.now(),
      type: 'whatsapp',
      to: phoneNumber,
      message: message,
      sentAt: new Date().toISOString()
    };
    setNotificationLog(prev => [notification, ...prev]);
    localStorage.setItem('notificationLog', JSON.stringify([notification, ...notificationLog]));
    alert(`💬 WhatsApp message sent to ${phoneNumber}`);
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
    let filtered = allLenders;
    if (loanCategory === 'unsecured') {
      filtered = filtered.filter(l => l.category === 'unsecured');
    } else if (loanCategory === 'secured') {
      filtered = filtered.filter(l => l.category === 'secured');
    }
    return filtered.filter(l => cost >= l.minLoan && cost <= l.maxLoan);
  };

  // ============================================
  // HANDLERS
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
    setStep(2);
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
    setStep(3);
  };

  const handleSubmitApplication = (e) => {
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
    if (parseInt(cibilScore) < formData.selectedLender.minCibil) {
      alert(`Your CIBIL score (${cibilScore}) is below ${formData.selectedLender.name}'s minimum requirement`);
      return;
    }
    if (formData.selectedLender.requiresCollateral && !collateralDetails) {
      alert('Please provide collateral/mortgage details');
      return;
    }
    
    const newPatientId = `PAT_${Date.now()}_${formData.phone.slice(-4)}`;
    const applicationId = `APP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    if (!patientId) {
      setPatientId(newPatientId);
      localStorage.setItem('patientId', newPatientId);
    }
    
    const loanApplication = {
      applicationId: applicationId,
      patientId: patientId || newPatientId,
      amount: parseInt(formData.treatmentCost),
      requestedAmount: parseInt(formData.treatmentCost),
      lender: formData.selectedLender.name,
      lenderId: formData.selectedLender.id,
      lenderType: formData.selectedLender.type,
      lenderLogo: formData.selectedLender.logo,
      approvedAmount: null,
      disbursedAmount: null,
      finalBillAmount: null,
      tenure: formData.selectedTenure,
      emi: formData.emi,
      interestRate: formData.selectedLender.interestRate,
      totalPayable: formData.totalPayable,
      totalInterest: formData.totalInterest,
      patientName: formData.fullName,
      patientPan: formData.pan,
      patientPhone: formData.phone,
      patientEmail: formData.email,
      treatmentType: formData.treatmentType,
      hospitalName: formData.hospitalName,
      cibilScore: cibilScore,
      monthlyIncome: monthlyIncome,
      employmentType: employmentType,
      collateral: collateralDetails,
      requiresCollateral: formData.selectedLender.requiresCollateral,
      status: 'submitted',
      timeline: {
        submittedAt: new Date().toISOString(),
        approvedAt: null,
        disbursedAt: null,
        finalBillAdjustedAt: null
      },
      lenderRequests: [],
      notifications: []
    };
    
    sessionStorage.setItem('currentApplication', JSON.stringify(loanApplication));
    
    const updatedHistory = [loanApplication, ...loanHistory];
    setLoanHistory(updatedHistory);
    localStorage.setItem('healthEmiHistory', JSON.stringify(updatedHistory));
    setActiveApplication(loanApplication);
    
    const smsMessage = `KiaetoCare: Loan application ${applicationId} submitted to ${formData.selectedLender.name} for ₹${parseInt(formData.treatmentCost).toLocaleString()}. Track status: https://kiaetocare.com/my-loans. Expected decision: ${formData.selectedLender.approvalTime}. - KiaetoCare`;
    
    const emailSubject = `Loan Application Submitted - ${applicationId}`;
    const emailBody = `Dear ${formData.fullName},\n\nYour loan application has been successfully submitted to ${formData.selectedLender.name}.\n\n📋 Application Details:\n- Application ID: ${applicationId}\n- Loan Amount: ₹${parseInt(formData.treatmentCost).toLocaleString()}\n- Tenure: ${formData.selectedTenure} months\n- EMI: ₹${formData.emi}/month\n- Hospital: ${formData.hospitalName}\n- Treatment: ${formData.treatmentType}\n- Lender: ${formData.selectedLender.name}\n- Interest Rate: ${formData.selectedLender.interestRate}% p.a.\n- Expected Decision: ${formData.selectedLender.approvalTime}\n\nWhat happens next?\n1. ${formData.selectedLender.name} will verify your application\n2. You will receive updates via SMS and Email\n3. Upon approval, the loan amount will be disbursed directly to ${formData.hospitalName}\n\nTrack your application: https://kiaetocare.com/track/${applicationId}\n\nThank you for choosing KiaetoCare.\n\nRegards,\nKiaetoCare Team`;
    
    const whatsappMessage = `🏥 *KiaetoCare - Loan Application Submitted*\n\n✅ Application ID: ${applicationId}\n💰 Amount: ₹${parseInt(formData.treatmentCost).toLocaleString()}\n🏦 Lender: ${formData.selectedLender.name}\n📅 Tenure: ${formData.selectedTenure} months\n💵 EMI: ₹${formData.emi}/month\n\nWe will notify you once the lender updates the status.\n\nTrack: https://kiaetocare.com/my-loans`;
    
    sendAllNotifications(formData.phone, formData.email, smsMessage, emailSubject, emailBody, whatsappMessage);
    
    setFormData({...formData, applicationId: applicationId});
    setStep(4);
  };

  const mockLenderApprove = (application) => {
    const updated = { ...application };
    updated.status = 'approved';
    updated.approvedAmount = application.requestedAmount;
    updated.timeline.approvedAt = new Date().toISOString();
    
    const updatedHistory = loanHistory.map(app => 
      app.applicationId === updated.applicationId ? updated : app
    );
    setLoanHistory(updatedHistory);
    localStorage.setItem('healthEmiHistory', JSON.stringify(updatedHistory));
    setActiveApplication(updated);
    
    const smsMessage = `KiaetoCare: GREAT NEWS! Your loan of ₹${updated.requestedAmount.toLocaleString()} has been APPROVED by ${updated.lender}. Amount will be disbursed to ${updated.hospitalName} shortly. EMI: ₹${updated.emi}/month. - KiaetoCare`;
    
    const emailSubject = `Loan Approved - ${updated.applicationId}`;
    const emailBody = `Dear ${updated.patientName},\n\nCongratulations! Your loan application has been APPROVED by ${updated.lender}.\n\n✅ Loan Details:\n- Application ID: ${updated.applicationId}\n- Approved Amount: ₹${updated.approvedAmount.toLocaleString()}\n- Tenure: ${updated.tenure} months\n- EMI: ₹${updated.emi}/month\n- Interest Rate: ${updated.interestRate}% p.a.\n\nNext Steps:\n1. The amount will be disbursed to ${updated.hospitalName}\n2. You will receive confirmation once disbursed\n3. Your EMI payments will start from next month\n\nTrack your loan: https://kiaetocare.com/my-loans\n\nThank you for choosing KiaetoCare.\n\nRegards,\nKiaetoCare Team`;
    
    const whatsappMessage = `✅ *LOAN APPROVED!*\n\n🎉 Congratulations ${updated.patientName}!\n\n📋 Application: ${updated.applicationId}\n💰 Amount: ₹${updated.approvedAmount.toLocaleString()}\n🏦 Lender: ${updated.lender}\n📅 EMI: ₹${updated.emi}/month for ${updated.tenure} months\n\nFunds will be sent to ${updated.hospitalName} shortly.\n\n- KiaetoCare`;
    
    sendAllNotifications(updated.patientPhone, updated.patientEmail, smsMessage, emailSubject, emailBody, whatsappMessage);
    alert(`✅ Loan Approved! Notifications sent to ${updated.patientPhone}`);
  };
  
  const mockLenderDisburse = (application) => {
    if (application.status !== 'approved') {
      alert('Please approve the loan first');
      return;
    }
    
    const updated = { ...application };
    updated.status = 'disbursed';
    updated.disbursedAmount = application.approvedAmount;
    updated.timeline.disbursedAt = new Date().toISOString();
    
    const updatedHistory = loanHistory.map(app => 
      app.applicationId === updated.applicationId ? updated : app
    );
    setLoanHistory(updatedHistory);
    localStorage.setItem('healthEmiHistory', JSON.stringify(updatedHistory));
    setActiveApplication(updated);
    
    const smsMessage = `KiaetoCare: Loan of ₹${updated.disbursedAmount.toLocaleString()} has been DISBURSED to ${updated.hospitalName}. Your first EMI of ₹${updated.emi} is due on ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}. - KiaetoCare`;
    
    const emailSubject = `Loan Disbursed - ${updated.applicationId}`;
    const emailBody = `Dear ${updated.patientName},\n\nYour loan amount of ₹${updated.disbursedAmount.toLocaleString()} has been DISBURSED to ${updated.hospitalName}.\n\n💰 Disbursal Details:\n- Application ID: ${updated.applicationId}\n- Disbursed Amount: ₹${updated.disbursedAmount.toLocaleString()}\n- First EMI Due Date: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}\n- EMI Amount: ₹${updated.emi}/month\n\nPlease ensure timely EMI payments to maintain a good credit score.\n\nTrack your loan: https://kiaetocare.com/my-loans\n\nRegards,\nKiaetoCare Team`;
    
    const whatsappMessage = `💰 *LOAN DISBURSED!*\n\n🏥 Hospital: ${updated.hospitalName}\n💵 Amount: ₹${updated.disbursedAmount.toLocaleString()}\n📅 First EMI: ₹${updated.emi} due on ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}\n\nSet up auto-pay to avoid missing payments.\n\n- KiaetoCare`;
    
    sendAllNotifications(updated.patientPhone, updated.patientEmail, smsMessage, emailSubject, emailBody, whatsappMessage);
    alert(`💰 Loan Disbursed! Notifications sent to ${updated.patientPhone}`);
  };
  
  const mockRequestDocument = (application) => {
    const docRequest = prompt('Enter document name needed (e.g., "Salary Slip", "Bank Statement", "Property Deed"):', 'Salary Slip');
    if (!docRequest) return;
    
    const updated = { ...application };
    updated.lenderRequests.push({
      request: docRequest,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    });
    updated.status = 'document_needed';
    
    const updatedHistory = loanHistory.map(app => 
      app.applicationId === updated.applicationId ? updated : app
    );
    setLoanHistory(updatedHistory);
    localStorage.setItem('healthEmiHistory', JSON.stringify(updatedHistory));
    setActiveApplication(updated);
    
    const smsMessage = `KiaetoCare: ${updated.lender} needs additional documents: ${docRequest}. Please upload via portal within 2 days to avoid delay. - KiaetoCare`;
    
    const emailSubject = `Document Required - ${updated.applicationId}`;
    const emailBody = `Dear ${updated.patientName},\n\n${updated.lender} requires the following document(s) to process your loan application:\n\n📄 Required Document: ${docRequest}\n\nPlease upload the document within 2 business days.\n\nUpload here: https://kiaetocare.com/upload/${updated.applicationId}\n\nFailure to provide documents may result in application rejection.\n\nRegards,\nKiaetoCare Team`;
    
    const whatsappMessage = `📄 *DOCUMENTS REQUIRED*\n\nApplication: ${updated.applicationId}\nDocument: ${docRequest}\n\nPlease upload within 2 days to continue.\n\n- KiaetoCare`;
    
    sendAllNotifications(updated.patientPhone, updated.patientEmail, smsMessage, emailSubject, emailBody, whatsappMessage);
    alert(`📄 Document request sent to ${updated.patientPhone}`);
  };
  
  const mockFinalBillAdjustment = (application) => {
    if (application.status !== 'disbursed') {
      alert('Loan must be disbursed first');
      return;
    }
    
    const finalBill = prompt('Enter final hospital bill amount (₹):', Math.round(application.disbursedAmount * 0.7));
    if (!finalBill) return;
    
    const excessAmount = application.disbursedAmount - parseInt(finalBill);
    const updated = { ...application };
    updated.finalBillAmount = parseInt(finalBill);
    updated.timeline.finalBillAdjustedAt = new Date().toISOString();
    
    if (excessAmount > 0) {
      updated.status = 'excess_refund';
    }
    
    const updatedHistory = loanHistory.map(app => 
      app.applicationId === updated.applicationId ? updated : app
    );
    setLoanHistory(updatedHistory);
    localStorage.setItem('healthEmiHistory', JSON.stringify(updatedHistory));
    setActiveApplication(updated);
    
    const smsMessage = `KiaetoCare: Final hospital bill of ₹${parseInt(finalBill).toLocaleString()} received. Excess amount of ₹${excessAmount.toLocaleString()} will be refunded/reduced from loan. - KiaetoCare`;
    
    const emailSubject = `Final Bill Adjustment - ${updated.applicationId}`;
    const emailBody = `Dear ${updated.patientName},\n\nFinal bill adjustment has been processed.\n\n📋 Adjustment Details:\n- Original Loan Amount: ₹${updated.disbursedAmount.toLocaleString()}\n- Final Hospital Bill: ₹${parseInt(finalBill).toLocaleString()}\n- Excess Amount: ₹${excessAmount.toLocaleString()}\n\nThe excess amount will be refunded to your bank account within 7-10 business days OR reduced from your outstanding loan balance.\n\nRegards,\nKiaetoCare Team`;
    
    const whatsappMessage = `🏥 *FINAL BILL ADJUSTMENT*\n\nOriginal Loan: ₹${updated.disbursedAmount.toLocaleString()}\nFinal Bill: ₹${parseInt(finalBill).toLocaleString()}\nExcess Refund: ₹${excessAmount.toLocaleString()}\n\nRefund will be processed in 7-10 days.\n\n- KiaetoCare`;
    
    sendAllNotifications(updated.patientPhone, updated.patientEmail, smsMessage, emailSubject, emailBody, whatsappMessage);
    alert(`🏥 Final bill adjustment sent! Excess amount: ₹${excessAmount.toLocaleString()}`);
  };

  const handleBookAnother = () => {
    setFormData({
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
    setCollateralDetails(null);
    setAadhaarVerified(false);
    setAadhaarOtpSent(false);
    setAadhaarNumber('');
    setOtpValue('');
    setCibilScore('');
    setMonthlyIncome('');
    setEmploymentType('');
    setLoanCategory('all');
    setStep(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // ============================================
  // STEP 1: Treatment & Cost Details
  // ============================================
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '3rem' }}>💳</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Health EMI - Medical Loan Marketplace</h1>
            <p style={{ color: '#6b7280' }}>Compare 10+ lenders: NBFCs • 0% Medical EMI • Secured Mortgages</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: '#ecfdf5', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.25rem' }}>🏦</span>
              <p style={{ fontSize: '0.7rem' }}>NBFC Instant</p>
            </div>
            <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.25rem' }}>💰</span>
              <p style={{ fontSize: '0.7rem' }}>0% Medical EMI</p>
            </div>
            <div style={{ backgroundColor: '#ede9fe', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.25rem' }}>🏠</span>
              <p style={{ fontSize: '0.7rem' }}>Secured Mortgage</p>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleCostSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Treatment Type *</label>
                <select
                  value={formData.treatmentType}
                  onChange={(e) => setFormData({...formData, treatmentType: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  required
                >
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
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                  placeholder="Enter hospital or lab name"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Treatment Cost (₹) *</label>
                <input
                  type="number"
                  value={formData.treatmentCost}
                  onChange={(e) => setFormData({...formData, treatmentCost: e.target.value})}
                  placeholder="Enter amount"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  required
                  min="5000"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Min: ₹5,000</span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Unsecured up to ₹55L | Secured up to ₹1Cr+</span>
                </div>
              </div>

              <button type="submit" style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.875rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                View All Loan Offers →
              </button>
            </form>
          </div>

          {loanHistory && loanHistory.length > 0 && (
            <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Your Loan Applications</h3>
              {loanHistory.slice(0, 3).map((loan) => (
                <div 
                  key={loan.applicationId || loan.id || Date.now()} 
                  style={{ borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0', cursor: 'pointer' }} 
                  onClick={() => { setActiveApplication(loan); setStep(5); }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>{loan.lenderLogo || '🏦'}</span>
                      <strong>{loan.lender || 'Unknown Lender'}</strong>
                      <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>{loan.lenderType || 'Loan'} • {loan.treatmentType || 'Medical'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold' }}>₹{(loan.requestedAmount || loan.amount || 0).toLocaleString()}</p>
                      <p style={{ fontSize: '0.7rem', color: loan.status === 'disbursed' ? '#10b981' : loan.status === 'approved' ? '#8b5cf6' : loan.status === 'submitted' ? '#f59e0b' : '#6b7280' }}>
                        {loan.status === 'disbursed' ? '✅ Disbursed' : loan.status === 'approved' ? '👍 Approved' : loan.status === 'submitted' ? '⏳ Submitted' : loan.status || 'Pending'}
                      </p>
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
  // STEP 2: Lender Comparison & Selection
  // ============================================
  if (step === 2) {
    const principal = parseInt(formData.treatmentCost);
    const filteredLenders = getFilteredLenders();
    
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}>
            ← Back to treatment details
          </button>

          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Compare Loan Offers</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Treatment Cost: <strong>₹{principal.toLocaleString()}</strong></p>

            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setLoanCategory('all')} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: loanCategory === 'all' ? '2px solid #8b5cf6' : '1px solid #e5e7eb', backgroundColor: loanCategory === 'all' ? '#f3e8ff' : 'white', cursor: 'pointer' }}>All Lenders ({allLenders.length})</button>
              <button onClick={() => setLoanCategory('unsecured')} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: loanCategory === 'unsecured' ? '2px solid #8b5cf6' : '1px solid #e5e7eb', backgroundColor: loanCategory === 'unsecured' ? '#f3e8ff' : 'white', cursor: 'pointer' }}>🏦 Unsecured ({nbfcLenders.length + medicalEmiLenders.length})</button>
              <button onClick={() => setLoanCategory('secured')} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: loanCategory === 'secured' ? '2px solid #8b5cf6' : '1px solid #e5e7eb', backgroundColor: loanCategory === 'secured' ? '#f3e8ff' : 'white', cursor: 'pointer' }}>🏠 Secured ({securedLenders.length})</button>
            </div>

            {filteredLenders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No lenders available for this amount. Try adjusting loan amount or category.</div>
            )}

            {filteredLenders.map(lender => (
              <div key={lender.id} onClick={() => handleSelectLender(lender)} style={{ border: formData.selectedLender?.id === lender.id ? '2px solid #8b5cf6' : '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem', cursor: 'pointer', backgroundColor: formData.selectedLender?.id === lender.id ? '#f3e8ff' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div><span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>{lender.logo}</span><strong>{lender.name}</strong><span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#e5e7eb', borderRadius: '1rem' }}>{lender.type}</span></div>
                  <div style={{ textAlign: 'right' }}><span style={{ color: lender.interestRate === 0 ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>{lender.interestRate === 0 ? '0% p.a.' : `${lender.interestRate}% p.a.`}</span><p style={{ fontSize: '0.7rem', color: '#6b7280' }}>{lender.approvalTime}</p></div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{lender.description}</p>
                <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>Loan: ₹{lender.minLoan.toLocaleString()} - ₹{lender.maxLoan.toLocaleString()} | Min CIBIL: {lender.minCibil} | Fee: {lender.processingFee}%</p>
                {lender.requiresCollateral && <p style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '0.25rem' }}>🏠 Collateral Required: {lender.collateralTypes?.join(', ')}</p>}
                {!lender.requiresCollateral && lender.interestRate === 0 && <p style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem' }}>🔥 0% EMI Offer - No interest!</p>}
              </div>
            ))}

            {formData.selectedLender && (
              <>
                <h3 style={{ fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Select Tenure (months)</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {formData.selectedLender.tenure.map(tenure => {
                    const emi = calculateEMI(principal, formData.selectedLender.interestRate, tenure);
                    return (
                      <button key={tenure} onClick={() => handleSelectTenure(tenure)} style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: formData.selectedTenure === tenure ? '2px solid #8b5cf6' : '1px solid #e5e7eb', backgroundColor: formData.selectedTenure === tenure ? '#f3e8ff' : 'white', cursor: 'pointer', minWidth: '100px', textAlign: 'center' }}>
                        <strong>{tenure}</strong><br /><small>₹{emi}/mo</small>
                      </button>
                    );
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

            <button onClick={handleProceedToKYC} disabled={!formData.selectedTenure} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.875rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: formData.selectedTenure ? 'pointer' : 'not-allowed', opacity: formData.selectedTenure ? 1 : 0.5 }}>
              Continue to Application →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 3: Complete Application (KYC + Aadhaar + Income + Collateral)
  // ============================================
  if (step === 3) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}>← Back to lenders</button>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Complete Loan Application</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Lender: <strong>{formData.selectedLender?.name}</strong> • Amount: ₹{parseInt(formData.treatmentCost).toLocaleString()}{formData.selectedLender?.requiresCollateral && <span style={{ color: '#f59e0b' }}> • Collateral Required</span>}</p>

            <form onSubmit={handleSubmitApplication}>
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
              <div style={{ marginBottom: '1rem' }}><label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>CIBIL Score * (Min required: {formData.selectedLender?.minCibil})</label><input type="number" value={cibilScore} onChange={(e) => setCibilScore(e.target.value)} placeholder="Enter CIBIL score (300-900)" min="300" max="900" style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} required /></div>

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

              <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.75rem' }}>⚡ <strong>Realistic Flow:</strong> Your application will be submitted to {formData.selectedLender?.name}. {formData.selectedLender?.requiresCollateral ? ' They will verify your collateral documents.' : ' They will verify your CIBIL score and income.'} Approval time: {formData.selectedLender?.approvalTime}</div>

              <button type="submit" style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.875rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>Submit Application to Lender →</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 4: Application Submitted
  // ============================================
  if (step === 4) {
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Notifications Sent:</span><strong>SMS ✓ Email ✓ WhatsApp ✓</strong></div>
            </div>

            <div style={{ backgroundColor: '#dcfce7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#166534' }}>📱 <strong>Notifications sent to {application.patientPhone}:</strong></p>
              <p style={{ fontSize: '0.75rem', color: '#166534' }}>✓ SMS: Application submitted to {application.lender}</p>
              <p style={{ fontSize: '0.75rem', color: '#166534' }}>✓ WhatsApp: Application details sent</p>
              {application.patientEmail && <p style={{ fontSize: '0.75rem', color: '#166534' }}>✓ Email: Detailed application summary sent to {application.patientEmail}</p>}
            </div>

            <div style={{ backgroundColor: '#ede9fe', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>📋 <strong>What happens next?</strong></p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>1. {application.lender} will verify your application</p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>2. You will receive SMS/WhatsApp/Email updates on status change</p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>3. Upon approval, lender pays hospital directly → You pay EMI to lender</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setActiveApplication(application); setStep(5); }} style={{ flex: 1, backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Track Application</button>
              <button onClick={handleBookAnother} style={{ flex: 1, backgroundColor: '#e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Apply Another Loan</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 5: Application Status Dashboard
  // ============================================
    // ============================================
  // STEP 5: Application Status Dashboard (PATIENT VIEW - No Actions)
  // ============================================
  if (step === 5 && activeApplication) {
    // Check if user is lender (for demo, use URL param or localStorage)
    const isLenderMode = localStorage.getItem('lenderMode') === 'true' || window.location.search.includes('lender=true');
    
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}>← Back to Home</button>
          
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Loan Application Status</h2>
              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>ID: {activeApplication.applicationId}</span>
            </div>
            
            {/* Status Timeline */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: activeApplication.timeline?.submittedAt ? '#10b981' : '#e5e7eb', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem' }}>
                    {activeApplication.timeline?.submittedAt ? '✓' : '1'}
                  </div>
                  <p style={{ fontSize: '0.7rem', marginTop: '0.25rem', fontWeight: activeApplication.timeline?.submittedAt ? 'bold' : 'normal' }}>Submitted</p>
                  {activeApplication.timeline?.submittedAt && <p style={{ fontSize: '0.6rem', color: '#6b7280' }}>{formatDate(activeApplication.timeline.submittedAt)}</p>}
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: activeApplication.status === 'approved' || activeApplication.status === 'disbursed' ? '#10b981' : '#e5e7eb', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem' }}>
                    {activeApplication.status === 'approved' || activeApplication.status === 'disbursed' ? '✓' : '2'}
                  </div>
                  <p style={{ fontSize: '0.7rem', marginTop: '0.25rem', fontWeight: activeApplication.status === 'approved' || activeApplication.status === 'disbursed' ? 'bold' : 'normal' }}>Approved</p>
                  {activeApplication.timeline?.approvedAt && <p style={{ fontSize: '0.6rem', color: '#6b7280' }}>{formatDate(activeApplication.timeline.approvedAt)}</p>}
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: activeApplication.status === 'disbursed' ? '#10b981' : '#e5e7eb', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem' }}>
                    {activeApplication.status === 'disbursed' ? '✓' : '3'}
                  </div>
                  <p style={{ fontSize: '0.7rem', marginTop: '0.25rem', fontWeight: activeApplication.status === 'disbursed' ? 'bold' : 'normal' }}>Disbursed</p>
                  {activeApplication.timeline?.disbursedAt && <p style={{ fontSize: '0.6rem', color: '#6b7280' }}>{formatDate(activeApplication.timeline.disbursedAt)}</p>}
                </div>
              </div>
            </div>
            
            {/* Current Status Message */}
            <div style={{ 
              backgroundColor: 
                activeApplication.status === 'disbursed' ? '#dcfce7' : 
                activeApplication.status === 'approved' ? '#fef3c7' : 
                activeApplication.status === 'submitted' ? '#ede9fe' : '#fee2e2',
              padding: '1rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
                color: 
                  activeApplication.status === 'disbursed' ? '#166534' : 
                  activeApplication.status === 'approved' ? '#92400e' : 
                  activeApplication.status === 'submitted' ? '#5b21b6' : '#991b1b'
              }}>
                {activeApplication.status === 'disbursed' && '✅ Loan Disbursed Successfully!'}
                {activeApplication.status === 'approved' && '👍 Loan Approved! Waiting for Disbursal'}
                {activeApplication.status === 'submitted' && '⏳ Application Under Review'}
                {activeApplication.status === 'document_needed' && '📄 Additional Documents Required'}
                {activeApplication.status === 'rejected' && '❌ Application Declined'}
                {activeApplication.status === 'excess_refund' && '💰 Final Bill Adjusted - Refund Processing'}
              </p>
              {activeApplication.status === 'submitted' && (
                <p style={{ fontSize: '0.75rem', color: '#5b21b6', marginTop: '0.5rem' }}>
                  Your application is being reviewed by {activeApplication.lender}. Expected decision: {activeApplication.lenderType === 'Secured' ? '2-3 days' : '24 hours'}
                </p>
              )}
              {activeApplication.status === 'approved' && (
                <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.5rem' }}>
                  Your loan has been approved! The amount will be disbursed to {activeApplication.hospitalName} shortly.
                </p>
              )}
              {activeApplication.status === 'disbursed' && (
                <p style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.5rem' }}>
                  Amount of ₹{activeApplication.disbursedAmount?.toLocaleString()} has been sent to {activeApplication.hospitalName}. Your first EMI of ₹{activeApplication.emi} is due on {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}.
                </p>
              )}
              {activeApplication.status === 'document_needed' && (
                <p style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.5rem' }}>
                  Please upload the requested documents within 2 days to continue processing.
                </p>
              )}
            </div>
            
            {/* Application Details */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '0.875rem' }}>Application Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                <p><strong>Lender:</strong></p><p>{activeApplication.lender} ({activeApplication.lenderType})</p>
                <p><strong>Requested Amount:</strong></p><p>₹{(activeApplication.requestedAmount || activeApplication.amount || 0).toLocaleString()}</p>
                {activeApplication.approvedAmount && <><p><strong>Approved Amount:</strong></p><p>₹{activeApplication.approvedAmount.toLocaleString()}</p></>}
                {activeApplication.disbursedAmount && <><p><strong>Disbursed Amount:</strong></p><p>₹{activeApplication.disbursedAmount.toLocaleString()}</p></>}
                {activeApplication.finalBillAmount && <><p><strong>Final Bill:</strong></p><p>₹{activeApplication.finalBillAmount.toLocaleString()}</p></>}
                <p><strong>EMI:</strong></p><p>₹{activeApplication.emi}/month for {activeApplication.tenure} months</p>
                <p><strong>Interest Rate:</strong></p><p>{activeApplication.interestRate}% p.a.</p>
                <p><strong>Hospital:</strong></p><p>{activeApplication.hospitalName}</p>
                <p><strong>Treatment:</strong></p><p>{activeApplication.treatmentType}</p>
                <p><strong>Application Date:</strong></p><p>{activeApplication.timeline?.submittedAt ? formatDate(activeApplication.timeline.submittedAt) : 'N/A'}</p>
              </div>
            </div>
            
            {/* Lender Requests (if any) */}
            {activeApplication.lenderRequests && activeApplication.lenderRequests.length > 0 && (
              <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 Documents Requested by Lender:</p>
                {activeApplication.lenderRequests.map((req, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem' }}>• {req.request}</p>
                    <button 
                      onClick={() => alert(`Demo: Upload document - ${req.request}\nIn production, this will open file upload dialog.`)}
                      style={{ backgroundColor: '#f59e0b', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}
                    >
                      Upload
                    </button>
                  </div>
                ))}
                <p style={{ fontSize: '0.7rem', color: '#92400e', marginTop: '0.5rem' }}>⚠️ Please upload requested documents within 2 days to avoid application rejection.</p>
              </div>
            )}
            
            {/* EMI Payment Schedule (for approved/disbursed loans) */}
            {(activeApplication.status === 'approved' || activeApplication.status === 'disbursed') && (
              <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📅 EMI Payment Schedule</p>
                <div style={{ fontSize: '0.75rem' }}>
                  <p>• EMI Amount: <strong>₹{activeApplication.emi}/month</strong></p>
                  <p>• Total EMIs: <strong>{activeApplication.tenure} months</strong></p>
                  <p>• Total Payable: <strong>₹{(activeApplication.emi * activeApplication.tenure).toLocaleString()}</strong></p>
                  <p>• Next EMI Due: <strong>{new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</strong></p>
                </div>
              </div>
            )}
            
            {/* Notification History */}
            {notificationLog.length > 0 && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📱 Notification History</p>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {notificationLog.slice(0, 5).map((notif, idx) => (
                    <div key={idx} style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.5rem', padding: '0.25rem', borderBottom: '1px solid #e5e7eb' }}>
                      <span>
                        {notif.type === 'sms' && '📱'} {notif.type === 'email' && '📧'} {notif.type === 'whatsapp' && '💬'}
                      </span>
                      <span style={{ marginLeft: '0.5rem' }}>{new Date(notif.sentAt).toLocaleTimeString()}</span>
                      <p style={{ marginTop: '0.25rem', wordBreak: 'break-word' }}>{notif.message?.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Support Contact */}
            <div style={{ backgroundColor: '#f3e8ff', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: '#5b21b6' }}>
                📞 Need help? Contact our support team at <strong>+91-XXXXXXXXXX</strong> or email <strong>support@kiaetocare.com</strong>
              </p>
            </div>
            
            <button onClick={handleBookAnother} style={{ width: '100%', backgroundColor: '#e5e7eb', color: '#374151', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}>
              Apply Another Loan
            </button>
          </div>
          
          {/* Previous Applications */}
          {loanHistory.length > 1 && (
            <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Your Other Applications</h3>
              {loanHistory.filter(l => l.applicationId !== activeApplication.applicationId).slice(0, 2).map((loan) => (
                <div key={loan.applicationId} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0', cursor: 'pointer' }} onClick={() => { setActiveApplication(loan); setStep(5); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>{loan.lenderLogo || '🏦'}</span>
                      <strong>{loan.lender}</strong>
                      <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>{loan.applicationId}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p>₹{(loan.requestedAmount || loan.amount || 0).toLocaleString()}</p>
                      <p style={{ fontSize: '0.7rem', color: loan.status === 'disbursed' ? '#10b981' : loan.status === 'approved' ? '#8b5cf6' : '#f59e0b' }}>
                        {loan.status === 'disbursed' ? '✅ Disbursed' : loan.status === 'approved' ? '👍 Approved' : loan.status || 'Pending'}
                      </p>
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

  return null;
};

export default Financing;