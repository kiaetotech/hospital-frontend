import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Financing = () => {
  const navigate = useNavigate();

  // Mock lender data
  const lenders = [
    { id: 1, name: "HealthFin", logo: "🏥", rate: 11, min: 5000, max: 500000, tenure: [6, 12, 24], fee: 1, rating: 4.5 },
    { id: 2, name: "CareCredit", logo: "💚", rate: 13, min: 10000, max: 300000, tenure: [3, 6, 12], fee: 0.5, rating: 4.3 },
    { id: 3, name: "MedLoan", logo: "⚕️", rate: 10.5, min: 20000, max: 1000000, tenure: [12, 24, 36], fee: 1.5, rating: 4.7 },
    { id: 4, name: "HealthyEMI", logo: "💳", rate: 12, min: 5000, max: 750000, tenure: [6, 12, 18, 24], fee: 1, rating: 4.4 },
    { id: 5, name: "CareFirst", logo: "🩺", rate: 14, min: 15000, max: 400000, tenure: [6, 12], fee: 0, rating: 4.2 },
  ];

  const [step, setStep] = useState(1);
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
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return Math.round(principal / months);
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const handleCostSubmit = (e) => {
    e.preventDefault();
    const cost = parseInt(formData.treatmentCost);
    if (cost < 5000) {
      alert('Minimum loan amount is ₹5,000');
      return;
    }
    if (cost > 1000000) {
      alert('Maximum loan amount is ₹10,00,000');
      return;
    }
    setStep(2);
  };

  const handleSelectLender = (lender) => {
    setFormData({ ...formData, selectedLender: lender, selectedTenure: null, emi: null });
  };

  const handleSelectTenure = (tenure) => {
    const principal = parseInt(formData.treatmentCost);
    const rate = formData.selectedLender.rate;
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

  const handleProceedToKYC = () => {
    if (!formData.selectedTenure) {
      alert('Please select tenure');
      return;
    }
    setStep(3);
  };

  const handleKYCSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.pan) {
      alert('Please fill all required fields');
      return;
    }
    
    // Mock validation - in real scenario, call lender API
    const loanApplication = {
      id: `LOAN_${Date.now()}`,
      lender: formData.selectedLender.name,
      lenderLogo: formData.selectedLender.logo,
      amount: parseInt(formData.treatmentCost),
      tenure: formData.selectedTenure,
      emi: formData.emi,
      interestRate: formData.selectedLender.rate,
      totalPayable: formData.totalPayable,
      totalInterest: formData.totalInterest,
      patientName: formData.fullName,
      patientPan: formData.pan,
      patientPhone: formData.phone,
      treatmentType: formData.treatmentType,
      hospitalName: formData.hospitalName,
      status: 'approved',
      appliedAt: new Date().toISOString(),
      nextEmiDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Store current loan
    sessionStorage.setItem('healthEmiLoan', JSON.stringify(loanApplication));
    
    // Add to history
    const updatedHistory = [loanApplication, ...loanHistory];
    setLoanHistory(updatedHistory);
    localStorage.setItem('healthEmiHistory', JSON.stringify(updatedHistory));
    
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
    });
    setStep(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Step 1: Treatment & Cost Details
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '3rem' }}>💳</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Health EMI</h1>
            <p style={{ color: '#6b7280' }}>Pay for medical treatment in easy monthly installments</p>
          </div>

          {/* Features Banner */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>🏥</span>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Lender pays hospital directly</p>
            </div>
            <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>📋</span>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Compare 5+ lenders</p>
            </div>
            <div style={{ backgroundColor: '#ede9fe', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>⚡</span>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Instant approval</p>
            </div>
            <div style={{ backgroundColor: '#fce7f3', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>0️⃣</span>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Zero upfront payment</p>
            </div>
          </div>

          {/* Main Form */}
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleCostSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Treatment Type *</label>
                <select
                  value={formData.treatmentType}
                  onChange={(e) => setFormData({...formData, treatmentType: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }}
                  required
                >
                  <option value="">Select treatment</option>
                  <option value="Surgery">🏥 Surgery</option>
                  <option value="Dental">🦷 Dental</option>
                  <option value="Eye Care (Lasik/Cataract)">👁️ Eye Care (Lasik/Cataract)</option>
                  <option value="Maternity">👶 Maternity</option>
                  <option value="Heart/Cardiac">❤️ Heart/Cardiac</option>
                  <option value="Orthopedic">🦴 Orthopedic</option>
                  <option value="Diagnostic Tests">🔬 Diagnostic Tests</option>
                  <option value="Health Checkup">🩺 Health Checkup</option>
                  <option value="Other">📋 Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Hospital / Diagnostic Center *</label>
                <input
                  type="text"
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                  placeholder="Enter hospital or lab name"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }}
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
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }}
                  required
                  min="5000"
                  max="1000000"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Min: ₹5,000</span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Max: ₹10,00,000</span>
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
                Check EMI Options →
              </button>
            </form>
          </div>

          {/* Loan History Section */}
          {loanHistory.length > 0 && (
            <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📋 Your Loan History</h3>
              {loanHistory.slice(0, 3).map((loan) => (
                <div key={loan.id} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>{loan.lenderLogo}</span>
                      <strong>{loan.lender}</strong>
                      <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>{loan.treatmentType} • {loan.hospitalName}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold' }}>₹{loan.amount.toLocaleString()}</p>
                      <p style={{ fontSize: '0.7rem', color: '#10b981' }}>EMI: ₹{loan.emi}/month</p>
                    </div>
                  </div>
                </div>
              ))}
              {loanHistory.length > 3 && (
                <p style={{ fontSize: '0.75rem', color: '#8b5cf6', textAlign: 'center', marginTop: '0.5rem' }}>
                  +{loanHistory.length - 3} more loans
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Lender Comparison & Selection
  if (step === 2) {
    const principal = parseInt(formData.treatmentCost);
    
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Choose Lender</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Treatment Cost: <strong>₹{principal.toLocaleString()}</strong>
            </p>

            {lenders.filter(l => principal >= l.min && principal <= l.max).map(lender => (
              <div
                key={lender.id}
                onClick={() => handleSelectLender(lender)}
                style={{
                  border: formData.selectedLender?.id === lender.id ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  backgroundColor: formData.selectedLender?.id === lender.id ? '#f3e8ff' : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>{lender.logo}</span>
                    <strong style={{ fontSize: '1rem' }}>{lender.name}</strong>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#f59e0b' }}>★ {lender.rating}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{lender.rate}% p.a.</span>
                    <p style={{ fontSize: '0.7rem', color: '#6b7280' }}>Fee: {lender.fee}%</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Loan: ₹{lender.min.toLocaleString()} - ₹{lender.max.toLocaleString()}
                </p>
              </div>
            ))}

            {formData.selectedLender && (
              <>
                <h3 style={{ fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Select Tenure (months)</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {formData.selectedLender.tenure.map(tenure => {
                    const emi = calculateEMI(principal, formData.selectedLender.rate, tenure);
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
              Continue to KYC →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: KYC Form
  if (step === 3) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <button 
            onClick={() => setStep(2)}
            style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.875rem' }}
          >
            ← Back to lenders
          </button>

          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Verify Your Identity</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Lender: <strong>{formData.selectedLender.name}</strong> • Amount: ₹{parseInt(formData.treatmentCost).toLocaleString()}
            </p>

            <form onSubmit={handleKYCSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name (as per PAN) *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }}
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
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem', textTransform: 'uppercase' }}
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
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email ID</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="2"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.75rem' }}>
                ⚡ <strong>Mock Mode:</strong> Your loan will be instantly approved for demo purposes. In production, lender will verify your details.
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.875rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Submit & Get Instant Approval
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Success / Approval Page
  if (step === 4) {
    const loan = JSON.parse(sessionStorage.getItem('healthEmiLoan') || '{}');
    
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '4rem' }}>🎉</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' }}>Loan Approved!</h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Your treatment is now confirmed</p>
            
            <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Lender:</span>
                <strong>{loan.lender}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Loan Amount:</span>
                <strong>₹{loan.amount?.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>EMI:</span>
                <strong>₹{loan.emi}/month for {loan.tenure} months</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hospital:</span>
                <span>{loan.hospitalName}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f3e8ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>✅ <strong>What happens next?</strong></p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                1. Lender will pay ₹{loan.amount?.toLocaleString()} directly to {loan.hospitalName}<br />
                2. You pay EMI of ₹{loan.emi} starting {loan.nextEmiDate ? formatDate(loan.nextEmiDate) : 'next month'}<br />
                3. Your booking is confirmed
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