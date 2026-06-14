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

  const [step, setStep] = useState(1);
  const [loanCategory, setLoanCategory] = useState('all'); // 'all', 'unsecured', 'secured'
  const [collateralDetails, setCollateralDetails] = useState(null);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [cibilScore, setCibilScore] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  
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

  // Load loan history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('healthEmiHistory');
    if (history) {
      setLoanHistory(JSON.parse(history));
    }
  }, []);

  const calculateEMI = (principal, rate, months) => {
    if (rate === 0) return Math.round(principal / months);
    const monthlyRate = rate / 100 / 12;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  // Filter lenders based on category and loan amount
  const getFilteredLenders = () => {
    const cost = parseInt(formData.treatmentCost) || 0;
    let filtered = allLenders;
    
    // Filter by category
    if (loanCategory === 'unsecured') {
      filtered = filtered.filter(l => l.category === 'unsecured');
    } else if (loanCategory === 'secured') {
      filtered = filtered.filter(l => l.category === 'secured');
    }
    
    // Filter by loan amount range
    return filtered.filter(l => cost >= l.minLoan && cost <= l.maxLoan);
  };

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
    alert(`OTP sent to mobile linked with Aadhaar ending with ${aadhaarNumber.slice(-4)}`);
  };

  const handleVerifyAadhaarOTP = () => {
    if (!otpValue || otpValue.length !== 6) {
      alert('Enter valid 6-digit OTP');
      return;
    }
    // Mock verification - in real scenario, call API
    setAadhaarVerified(true);
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
    
    // Validate basic KYC
    if (!formData.fullName || !formData.phone || !formData.pan) {
      alert('Please fill all required KYC fields');
      return;
    }
    
    // Validate Aadhaar verification
    if (!aadhaarVerified) {
      alert('Please complete Aadhaar OTP verification');
      return;
    }
    
    // Validate CIBIL score
    if (!cibilScore) {
      alert('Please enter your CIBIL score');
      return;
    }
    
    // Check CIBIL requirement for selected lender
    if (parseInt(cibilScore) < formData.selectedLender.minCibil) {
      alert(`Your CIBIL score (${cibilScore}) is below ${formData.selectedLender.name}'s minimum requirement (${formData.selectedLender.minCibil}). Please try another lender.`);
      return;
    }
    
    // For secured loans, validate collateral
    if (formData.selectedLender.requiresCollateral && !collateralDetails) {
      alert('Please provide collateral/mortgage details');
      return;
    }
    
    // For unsecured loans, validate income
    if (!formData.selectedLender.requiresCollateral && monthlyIncome) {
      const emiToIncomeRatio = (formData.emi / parseInt(monthlyIncome)) * 100;
      if (emiToIncomeRatio > 50) {
        alert(`Your EMI (₹${formData.emi}) is ${emiToIncomeRatio.toFixed(1)}% of your monthly income. Lenders require EMI < 50% of income.`);
        return;
      }
    }
    
    // Generate application ID
    const applicationId = `APP_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create loan application
    const loanApplication = {
      applicationId: applicationId,
      lender: formData.selectedLender.name,
      lenderType: formData.selectedLender.type,
      lenderLogo: formData.selectedLender.logo,
      amount: parseInt(formData.treatmentCost),
      tenure: formData.selectedTenure,
      emi: formData.emi,
      interestRate: formData.selectedLender.interestRate,
      totalPayable: formData.totalPayable,
      totalInterest: formData.totalInterest,
      patientName: formData.fullName,
      patientPan: formData.pan,
      patientPhone: formData.phone,
      treatmentType: formData.treatmentType,
      hospitalName: formData.hospitalName,
      cibilScore: cibilScore,
      monthlyIncome: monthlyIncome,
      employmentType: employmentType,
      collateral: collateralDetails,
      requiresCollateral: formData.selectedLender.requiresCollateral,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      expectedApprovalDate: new Date(Date.now() + (formData.selectedLender.approvalTime.includes('minute') ? 1 : 3) * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Store application
    sessionStorage.setItem('healthEmiApplication', JSON.stringify(loanApplication));
    
    // Add to history
    const updatedHistory = [loanApplication, ...loanHistory];
    setLoanHistory(updatedHistory);
    localStorage.setItem('healthEmiHistory', JSON.stringify(updatedHistory));
    
    setFormData({...formData, applicationId: applicationId});
    setStep(4);
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

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
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

              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  padding: '0.875rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                View All Loan Offers →
              </button>
            </form>
          </div>

          {loanHistory.length > 0 && (
            <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Your Loan Applications</h3>
              {loanHistory.slice(0, 3).map((loan) => (
                <div key={loan.applicationId} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>{loan.lenderLogo}</span>
                      <strong>{loan.lender}</strong>
                      <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>{loan.lenderType} • {loan.treatmentType}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold' }}>₹{loan.amount.toLocaleString()}</p>
                      <p style={{ fontSize: '0.7rem', color: loan.status === 'approved' ? '#10b981' : '#f59e0b' }}>
                        {loan.status === 'approved' ? '✅ Approved' : '⏳ Pending'}
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
  // STEP 2: Lender Comparison & Selection (ALL 3 TYPES)
  // ============================================
  if (step === 2) {
    const principal = parseInt(formData.treatmentCost);
    const filteredLenders = getFilteredLenders();
    
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <button 
            onClick={() => setStep(1)}
            style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}
          >
            ← Back to treatment details
          </button>

          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Compare Loan Offers</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Treatment Cost: <strong>₹{principal.toLocaleString()}</strong>
            </p>

            {/* Loan Category Filter */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setLoanCategory('all')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: loanCategory === 'all' ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                  backgroundColor: loanCategory === 'all' ? '#f3e8ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                All Lenders ({allLenders.length})
              </button>
              <button
                onClick={() => setLoanCategory('unsecured')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: loanCategory === 'unsecured' ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                  backgroundColor: loanCategory === 'unsecured' ? '#f3e8ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                🏦 Unsecured ({nbfcLenders.length + medicalEmiLenders.length})
              </button>
              <button
                onClick={() => setLoanCategory('secured')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: loanCategory === 'secured' ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                  backgroundColor: loanCategory === 'secured' ? '#f3e8ff' : 'white',
                  cursor: 'pointer'
                }}
              >
                🏠 Secured/Mortgage ({securedLenders.length})
              </button>
            </div>

            {/* Lender Cards */}
            {filteredLenders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                No lenders available for this amount. Try adjusting loan amount or category.
              </div>
            )}

            {filteredLenders.map(lender => (
              <div
                key={lender.id}
                onClick={() => handleSelectLender(lender)}
                style={{
                  border: formData.selectedLender?.id === lender.id ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  backgroundColor: formData.selectedLender?.id === lender.id ? '#f3e8ff' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>{lender.logo}</span>
                    <strong>{lender.name}</strong>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#e5e7eb', borderRadius: '1rem' }}>
                      {lender.type}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: lender.interestRate === 0 ? '#f59e0b' : '#10b981', fontWeight: 'bold' }}>
                      {lender.interestRate === 0 ? '0% p.a.' : `${lender.interestRate}% p.a.`}
                    </span>
                    <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>{lender.approvalTime}</p>
                  </div>
                </div>
                
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{lender.description}</p>
                <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                  Loan: ₹{lender.minLoan.toLocaleString()} - ₹{lender.maxLoan.toLocaleString()} | 
                  Min CIBIL: {lender.minCibil} | Fee: {lender.processingFee}%
                </p>
                {lender.requiresCollateral && (
                  <p style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                    🏠 Collateral Required: {lender.collateralTypes?.join(', ')}
                  </p>
                )}
                {!lender.requiresCollateral && lender.interestRate === 0 && (
                  <p style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.25rem' }}>
                    🔥 0% EMI Offer - No interest!
                  </p>
                )}
              </div>
            ))}

            {formData.selectedLender && (
              <>
                <h3 style={{ fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Select Tenure (months)</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {formData.selectedLender.tenure.map(tenure => {
                    const emi = calculateEMI(principal, formData.selectedLender.interestRate, tenure);
                    return (
                      <button
                        key={tenure}
                        onClick={() => handleSelectTenure(tenure)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '0.5rem',
                          border: formData.selectedTenure === tenure ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                          backgroundColor: formData.selectedTenure === tenure ? '#f3e8ff' : 'white',
                          cursor: 'pointer',
                          minWidth: '100px',
                          textAlign: 'center'
                        }}
                      >
                        <strong>{tenure}</strong><br />
                        <small>₹{emi}/mo</small>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {formData.emi && (
              <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Loan Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Monthly EMI:</span>
                  <strong style={{ color: '#10b981' }}>₹{formData.emi.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Total Payable:</span>
                  <span>₹{formData.totalPayable.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Interest:</span>
                  <span style={{ color: '#ef4444' }}>₹{formData.totalInterest.toLocaleString()}</span>
                </div>
                {formData.selectedLender.requiresCollateral && (
                  <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' }}>
                    ⚡ This is a secured loan. Collateral/mortgage required.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleProceedToKYC}
              disabled={!formData.selectedTenure}
              style={{
                width: '100%',
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '0.875rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: formData.selectedTenure ? 'pointer' : 'not-allowed',
                opacity: formData.selectedTenure ? 1 : 0.5
              }}
            >
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
          <button 
            onClick={() => setStep(2)}
            style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}
          >
            ← Back to lenders
          </button>

          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Complete Loan Application</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Lender: <strong>{formData.selectedLender.name}</strong> • Amount: ₹{parseInt(formData.treatmentCost).toLocaleString()}
              {formData.selectedLender.requiresCollateral && <span style={{ color: '#f59e0b' }}> • Collateral Required</span>}
            </p>

            <form onSubmit={handleSubmitApplication}>
              {/* Aadhaar OTP Verification */}
              <div style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>📱 Aadhaar Verification (eKYC)</h4>
                {!aadhaarVerified ? (
                  <>
                    <input
                      type="text"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="Enter 12-digit Aadhaar number"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
                    />
                    {!aadhaarOtpSent ? (
                      <button
                        type="button"
                        onClick={handleSendAadhaarOTP}
                        style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                      >
                        Send OTP
                      </button>
                    ) : (
                      <div>
                        <p style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.5rem' }}>OTP sent to Aadhaar mobile ending with ****{aadhaarNumber.slice(-4)}</p>
                        <input
                          type="text"
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit OTP"
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyAadhaarOTP}
                          style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                        >
                          Verify OTP
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ backgroundColor: '#ecfdf5', padding: '0.5rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                    ✅ Aadhaar Verified Successfully
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <h3 style={{ fontWeight: '600', marginBottom: '1rem', fontSize: '1rem' }}>Personal Information</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name (as per PAN) *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>PAN Card Number *</label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => setFormData({...formData, pan: e.target.value.toUpperCase()})}
                  placeholder="ABCDE1234F"
                  maxLength="10"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  required
                />
              </div>

              {/* Credit Information */}
              <h3 style={{ fontWeight: '600', marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1rem' }}>Credit & Income Details</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  CIBIL Score * (Min required: {formData.selectedLender?.minCibil})
                </label>
                <input
                  type="number"
                  value={cibilScore}
                  onChange={(e) => setCibilScore(e.target.value)}
                  placeholder="Enter CIBIL score (300-900)"
                  min="300"
                  max="900"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  required
                />
              </div>

              {!formData.selectedLender.requiresCollateral && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Monthly Income (₹) *</label>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="Enter monthly income"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    >
                      <option value="">Select</option>
                      <option value="Salaried">Salaried</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Business">Business</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                </>
              )}

              {/* Collateral Section (for Secured Loans) */}
              {formData.selectedLender.requiresCollateral && (
                <div style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                  <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>🏠 Collateral / Mortgage Details</h4>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <select
                      value={collateralDetails?.type || ''}
                      onChange={(e) => setCollateralDetails({...collateralDetails, type: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    >
                      <option value="">Select collateral type</option>
                      {formData.selectedLender.collateralTypes?.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <input
                      type="number"
                      placeholder="Estimated value (₹)"
                      value={collateralDetails?.value || ''}
                      onChange={(e) => setCollateralDetails({...collateralDetails, value: e.target.value})}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                    />
                  </div>
                  <textarea
                    placeholder="Description / Location details"
                    value={collateralDetails?.description || ''}
                    onChange={(e) => setCollateralDetails({...collateralDetails, description: e.target.value})}
                    rows="2"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                  />
                </div>
              )}

              <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.75rem' }}>
                ⚡ <strong>Realistic Flow:</strong> Your application will be submitted to {formData.selectedLender.name}. 
                {formData.selectedLender.requiresCollateral ? ' They will verify your collateral documents.' : ' They will verify your CIBIL score and income.'}
                Approval time: {formData.selectedLender.approvalTime}
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  padding: '0.875rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Submit Application to Lender →
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 4: Application Submitted (Pending Review)
  // ============================================
  if (step === 4) {
    const application = JSON.parse(sessionStorage.getItem('healthEmiApplication') || '{}');
    const isSecured = application.requiresCollateral;
    
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '4rem' }}>⏳</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' }}>Application Submitted!</h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Your loan request has been sent to {application.lender}
            </p>
            
            <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Application ID:</span>
                <strong>{application.applicationId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Lender:</span>
                <strong>{application.lender} ({application.lenderType})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Loan Amount:</span>
                <strong>₹{application.amount?.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>EMI:</span>
                <strong>₹{application.emi}/month for {application.tenure} months</strong>
              </div>
              {isSecured && application.collateral && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Collateral:</span>
                  <span>{application.collateral.type} (₹{parseInt(application.collateral.value).toLocaleString()})</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Expected Decision:</span>
                <span style={{ color: '#f59e0b' }}>{formatDate(application.expectedApprovalDate)}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#ede9fe', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>📋 <strong>What happens next?</strong></p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                1. {application.lender} will verify your {isSecured ? 'collateral documents' : 'CIBIL score and income'}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                2. You will receive SMS/Email confirmation within {application.lenderType === 'Secured' ? '2-3 days' : '24 hours'}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                3. Upon approval, lender pays hospital directly → You pay EMI to lender
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleBookAnother}
                style={{
                  flex: 1,
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Apply Another Loan
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  flex: 1,
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Financing;