// D:\hospital-frontend\src\pages\insurance\InsuranceCompanyRegister.jsx
// ============================================
// INSURER REGISTRATION — 4-step wizard
// Steps: Company Details → Contact → Bank & Commission → Password
// ============================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const InsuranceCompanyRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Step 1
    companyName: '',
    legalName: '',
    registrationNumber: '',
    irdaRegistration: '',
    gstNumber: '',
    panNumber: '',
    // Step 2
    email: '',
    phone: '',
    website: '',
    contactPerson: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    // Step 3
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: '',
      branchName: '',
    },
    commissionRate: '15',
    // Step 4
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const STEPS = [
    { id: 1, label: 'Company Details' },
    { id: 2, label: 'Contact' },
    { id: 3, label: 'Bank & Commission' },
    { id: 4, label: 'Password' },
  ];

  const set = (key, value) => setFormData((p) => ({ ...p, [key]: value }));
  const setNested = (parent, key, value) =>
    setFormData((p) => ({ ...p, [parent]: { ...p[parent], [key]: value } }));

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.companyName || !formData.legalName || !formData.registrationNumber || !formData.irdaRegistration || !formData.panNumber) {
        setError('Please fill all required fields (Company Name, Legal Name, Registration No, IRDA No, PAN)');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.email || !formData.phone) {
        setError('Email and Phone are required');
        return false;
      }
      if (formData.phone.length < 10) {
        setError('Phone must be at least 10 digits');
        return false;
      }
      if (!formData.address.line1 || !formData.address.city || !formData.address.state || !formData.address.pincode) {
        setError('Address, City, State, Pincode are required');
        return false;
      }
    }
    if (step === 3) {
      if (!formData.bankDetails.accountNumber || !formData.bankDetails.ifscCode || !formData.bankDetails.accountHolderName || !formData.bankDetails.bankName) {
        setError('Bank Account, IFSC, Holder Name, Bank Name are required');
        return false;
      }
    }
    if (step === 4) {
      if (!formData.password || formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!formData.termsAccepted) {
        setError('Please accept the terms and conditions');
        return false;
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(4, s + 1)); };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        companyName: formData.companyName,
        legalName: formData.legalName,
        registrationNumber: formData.registrationNumber,
        irdaRegistration: formData.irdaRegistration,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        contactPerson: formData.contactPerson,
        address: formData.address,
        bankDetails: formData.bankDetails,
        commissionRate: parseFloat(formData.commissionRate) || 15,
        password: formData.password,
      };
      const response = await api.post('/insurance/company/register', payload);
      if (response.data.success) {
        alert('Registration submitted! Admin will verify your account. You can log in once approved.');
        navigate('/insurance/company/login');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const c = '#1565C0';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1565C0,#0D47A1)', padding: '30px 20px', fontFamily: 'Arial' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', color: '#fff', marginBottom: '24px' }}>
          <span style={{ fontSize: '44px' }}>🛡️</span>
          <h1 style={{ margin: '8px 0 4px', fontSize: '26px', fontWeight: 800 }}>Insurance Company Registration</h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '14px' }}>Register your insurance company on HospitalHub</p>
        </div>

        {/* Stepper */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 700,
                    background: step > s.id ? '#10b981' : step === s.id ? c : '#e5e7eb',
                    color: step >= s.id ? '#fff' : '#6b7280',
                  }}>{step > s.id ? '✓' : s.id}</div>
                  <span style={{
                    fontSize: '13px', fontWeight: 600,
                    color: step === s.id ? c : '#6b7280',
                    display: 'none',
                  }} className="step-label">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: '3px', margin: '0 8px',
                    background: step > s.id ? '#10b981' : '#e5e7eb',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', fontWeight: 700, color: c }}>
            Step {step} of 4 — {STEPS[step - 1].label}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>

          {/* STEP 1 — COMPANY DETAILS */}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Company Name *">
                <input value={formData.companyName} onChange={(e) => set('companyName', e.target.value)} style={inputStyle} placeholder="e.g. MUNICH INSURANCE" />
              </Field>
              <Field label="Legal Name *">
                <input value={formData.legalName} onChange={(e) => set('legalName', e.target.value)} style={inputStyle} placeholder="e.g. MUNICH INSURANCE PVT LTD" />
              </Field>
              <Field label="Registration Number *">
                <input value={formData.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="IRDA Registration *">
                <input value={formData.irdaRegistration} onChange={(e) => set('irdaRegistration', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="GST Number">
                <input value={formData.gstNumber} onChange={(e) => set('gstNumber', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="PAN Number *">
                <input value={formData.panNumber} onChange={(e) => set('panNumber', e.target.value.toUpperCase())} style={inputStyle} />
              </Field>
            </div>
          )}

          {/* STEP 2 — CONTACT */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Contact Person">
                <input value={formData.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Email *">
                <input type="email" value={formData.email} onChange={(e) => set('email', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Phone *">
                <input type="tel" value={formData.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} style={inputStyle} />
              </Field>
              <Field label="Website">
                <input type="url" value={formData.website} onChange={(e) => set('website', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Address Line 1 *" span>
                <input value={formData.address.line1} onChange={(e) => setNested('address', 'line1', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Address Line 2" span>
                <input value={formData.address.line2} onChange={(e) => setNested('address', 'line2', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="City *">
                <input value={formData.address.city} onChange={(e) => setNested('address', 'city', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="State *">
                <input value={formData.address.state} onChange={(e) => setNested('address', 'state', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Pincode *">
                <input value={formData.address.pincode} onChange={(e) => setNested('address', 'pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} style={inputStyle} />
              </Field>
            </div>
          )}

          {/* STEP 3 — BANK & COMMISSION */}
          {step === 3 && (
            <>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#374151' }}>Bank Details (for settlements)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Account Number *">
                  <input value={formData.bankDetails.accountNumber} onChange={(e) => setNested('bankDetails', 'accountNumber', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="IFSC Code *">
                  <input value={formData.bankDetails.ifscCode} onChange={(e) => setNested('bankDetails', 'ifscCode', e.target.value.toUpperCase())} style={inputStyle} />
                </Field>
                <Field label="Account Holder Name *">
                  <input value={formData.bankDetails.accountHolderName} onChange={(e) => setNested('bankDetails', 'accountHolderName', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Bank Name *">
                  <input value={formData.bankDetails.bankName} onChange={(e) => setNested('bankDetails', 'bankName', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Branch Name">
                  <input value={formData.bankDetails.branchName} onChange={(e) => setNested('bankDetails', 'branchName', e.target.value)} style={inputStyle} />
                </Field>
              </div>

              <h3 style={{ margin: '24px 0 16px', fontSize: '16px', fontWeight: 700, color: '#374151' }}>Commission</h3>
              <Field label="Platform Commission Rate (%)">
                <input type="number" min="0" max="50" value={formData.commissionRate} onChange={(e) => set('commissionRate', e.target.value)} style={inputStyle} />
              </Field>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                This is the platform's commission on each policy sold. Admin may adjust during verification.
              </p>
            </>
          )}

          {/* STEP 4 — PASSWORD */}
          {step === 4 && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <Field label="Password *">
                <input type="password" value={formData.password} onChange={(e) => set('password', e.target.value)} style={inputStyle} placeholder="Minimum 6 characters" />
              </Field>
              <Field label="Confirm Password *">
                <input type="password" value={formData.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} style={inputStyle} />
              </Field>

              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => set('termsAccepted', e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <span>
                    I confirm the information provided is accurate. I agree to the{' '}
                    <Link to="/terms" target="_blank" style={{ color: c, fontWeight: 600 }}>Terms & Conditions</Link>{' '}
                    and{' '}
                    <Link to="/privacy" target="_blank" style={{ color: c, fontWeight: 600 }}>Privacy Policy</Link>.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <button
              type="button"
              onClick={step === 1 ? () => navigate('/insurance/company/login') : back}
              style={{
                padding: '12px 24px', background: '#f3f4f6', color: '#374151',
                border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              }}
            >
              {step === 1 ? '← Back to Login' : '← Previous'}
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                style={{
                  padding: '12px 32px', background: c, color: '#fff',
                  border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: '12px 32px', background: loading ? '#9ca3af' : '#10b981', color: '#fff',
                  border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Submitting…' : '✅ Submit Registration'}
              </button>
            )}
          </div>
        </div>

        {/* Login link */}
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#fff', fontSize: '14px' }}>
          Already registered?{' '}
          <Link to="/insurance/company/login" style={{ color: '#fff', fontWeight: 700, textDecoration: 'underline' }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

function Field({ label, children, span }) {
  return (
    <div style={span ? { gridColumn: '1 / -1' } : {}}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '2px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export default InsuranceCompanyRegister;