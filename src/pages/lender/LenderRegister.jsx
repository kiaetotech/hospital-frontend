// D:\hospital-frontend\src\pages\Lender\LenderRegister.jsx
// Production Lender Registration with ALL required fields

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderRegistrationLayout from '../../components/ProviderRegistrationLayout';
import api from '../../services/api';

const LenderRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 0: Business Details
    businessName: '',
    registrationNumber: '',
    lenderType: 'regional',
    panNumber: '',
    gstNumber: '',
    
    // Step 1: Office Address
    address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    
    // Step 2: Contact
    email: '',
    phone: '',
    
    // Step 3: Loan Products
    productName: 'Medical Loan',
    minAmount: '50000',
    maxAmount: '500000',
    interestRate: '12',
    minTenure: '3',
    maxTenure: '36',
    processingFee: '2',
    minCibilScore: '650',
    requiresCollateral: false,
    collateralTypes: '',
    approvalTime: '24-48 hours',
    description: '',
    documentationCharge: '500',
    stampDutyPercent: '0.1',
    gstPercent: '18',
    insurancePercent: '0',
    prepaymentPenalty: '2',
    latePaymentFee: '500',
    cancellationCharge: '1000',
    processingFeeMin: '200',
    processingFeeMax: '5000',
    
    // Step 4: Commission
    commissionRate: '2',
    
    // Step 5: Account
    password: '',
    confirmPassword: ''
  });

  const steps = ['Business Details', 'Office Address', 'Contact', 'Loan Products', 'Commission', 'Password'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleArrayAdd = (field, value) => {
    if (!value) return;
    setFormData(prev => ({ ...prev, [field]: prev[field] ? prev[field] + ', ' + value : value }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        businessName: formData.businessName,
        registrationNumber: formData.registrationNumber,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        lenderType: formData.lenderType,
        registeredOffice: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode
        },
        servicePincodes: [formData.pincode],
        serviceCities: [formData.city],
        serviceDistricts: [formData.district],
        serviceStates: [formData.state],
        loanProducts: [{
          productName: formData.productName,
          minAmount: parseInt(formData.minAmount),
          maxAmount: parseInt(formData.maxAmount),
          interestRate: parseFloat(formData.interestRate),
          minTenure: parseInt(formData.minTenure),
          maxTenure: parseInt(formData.maxTenure),
          processingFee: parseFloat(formData.processingFee),
          minCibilScore: parseInt(formData.minCibilScore),
          requiresCollateral: formData.requiresCollateral,
          collateralTypes: formData.collateralTypes ? formData.collateralTypes.split(',').map(s => s.trim()) : [],
          approvalTime: formData.approvalTime,
          description: formData.description,
          documentationCharge: parseInt(formData.documentationCharge),
          stampDutyPercent: parseFloat(formData.stampDutyPercent),
          gstPercent: parseInt(formData.gstPercent),
          insurancePercent: parseFloat(formData.insurancePercent),
          prepaymentPenalty: parseFloat(formData.prepaymentPenalty),
          latePaymentFee: parseInt(formData.latePaymentFee),
          cancellationCharge: parseInt(formData.cancellationCharge),
          processingFeeMin: parseInt(formData.processingFeeMin),
          processingFeeMax: parseInt(formData.processingFeeMax)
        }],
        commissionRate: parseFloat(formData.commissionRate)
      };

      const response = await api.post('/lender/auth/register', payload);
      if (response.data.success) {
        alert('Registration submitted! Awaiting admin verification.');
        navigate('/lender/login');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 0:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🏢 Business Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={ls}>Business Name *</label>
                <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} style={is} required />
              </div>
              <div>
                <label style={ls}>Registration Number *</label>
                <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} style={is} required />
              </div>
              <div>
                <label style={ls}>Lender Type *</label>
                <select name="lenderType" value={formData.lenderType} onChange={handleChange} style={is}>
                  <option value="national">National (Pan India)</option>
                  <option value="regional">Regional (State Level)</option>
                  <option value="local">Local (City/District)</option>
                </select>
              </div>
              <div>
                <label style={ls}>PAN Number</label>
                <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} style={is} />
              </div>
              <div>
                <label style={ls}>GST Number</label>
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} style={is} />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📍 Registered Office Address</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={ls}>Address *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} style={is} required />
              </div>
              <div>
                <label style={ls}>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} style={is} required />
              </div>
              <div>
                <label style={ls}>District *</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange} style={is} required />
              </div>
              <div>
                <label style={ls}>State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} style={is} required />
              </div>
              <div>
                <label style={ls}>Pincode *</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} style={is} maxLength="6" required />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>📞 Contact Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={ls}>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} style={is} required />
              </div>
              <div>
                <label style={ls}>Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={is} required />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>💰 Loan Product Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={ls}>Product Name</label>
                <input type="text" name="productName" value={formData.productName} onChange={handleChange} style={is} />
              </div>
              <div>
                <label style={ls}>Min Loan Amount (₹) *</label>
                <input type="number" name="minAmount" value={formData.minAmount} onChange={handleChange} style={is} required />
              </div>
              <div>
                <label style={ls}>Max Loan Amount (₹) *</label>
                <input type="number" name="maxAmount" value={formData.maxAmount} onChange={handleChange} style={is} required />
              </div>
              <div>
                <label style={ls}>Interest Rate (%) *</label>
                <input type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} style={is} step="0.1" required />
              </div>
              <div>
                <label style={ls}>Processing Fee (%) *</label>
                <input type="number" name="processingFee" value={formData.processingFee} onChange={handleChange} style={is} step="0.1" required />
              </div>
              <div>
                <label style={ls}>Min Tenure (months)</label>
                <input type="number" name="minTenure" value={formData.minTenure} onChange={handleChange} style={is} />
              </div>
              <div>
                <label style={ls}>Max Tenure (months)</label>
                <input type="number" name="maxTenure" value={formData.maxTenure} onChange={handleChange} style={is} />
              </div>
              <div>
                <label style={ls}>Min CIBIL Score</label>
                <input type="number" name="minCibilScore" value={formData.minCibilScore} onChange={handleChange} style={is} />
              </div>
              <div>
                <label style={ls}>Approval Time</label>
                <input type="text" name="approvalTime" value={formData.approvalTime} onChange={handleChange} style={is} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={ls}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...is, resize: 'vertical' }} rows="2" />
              </div>
              <div>
                <label style={{ ...ls, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" name="requiresCollateral" checked={formData.requiresCollateral} onChange={handleChange} />
                  Requires Collateral
                </label>
              </div>
              <div>
                <label style={ls}>Collateral Types (comma separated)</label>
                <input type="text" name="collateralTypes" value={formData.collateralTypes} onChange={handleChange} style={is} placeholder="Property, Gold, FD" />
              </div>

              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>📋 Charges & Fees</h4>
              </div>
              <div>
                <label style={ls}>Documentation Charge (₹)</label>
                <input type="number" name="documentationCharge" value={formData.documentationCharge} onChange={handleChange} style={is} />
              </div>
              <div>
                <label style={ls}>Stamp Duty (%)</label>
                <input type="number" name="stampDutyPercent" value={formData.stampDutyPercent} onChange={handleChange} style={is} step="0.01" />
              </div>
              <div>
                <label style={ls}>GST on Processing (%)</label>
                <input type="number" name="gstPercent" value={formData.gstPercent} onChange={handleChange} style={is} />
              </div>
              <div>
                <label style={ls}>Insurance Premium (%)</label>
                <input type="number" name="insurancePercent" value={formData.insurancePercent} onChange={handleChange} style={is} step="0.1" />
              </div>
              <div>
                <label style={ls}>Prepayment Penalty (%)</label>
                <input type="number" name="prepaymentPenalty" value={formData.prepaymentPenalty} onChange={handleChange} style={is} step="0.1" />
              </div>
              <div>
                <label style={ls}>Late Payment Fee (₹)</label>
                <input type="number" name="latePaymentFee" value={formData.latePaymentFee} onChange={handleChange} style={is} />
              </div>
              <div>
                <label style={ls}>Cancellation Charge (₹)</label>
                <input type="number" name="cancellationCharge" value={formData.cancellationCharge} onChange={handleChange} style={is} />
              </div>
              <div>
                <label style={ls}>Processing Fee Min (₹)</label>
                <input type="number" name="processingFeeMin" value={formData.processingFeeMin} onChange={handleChange} style={is} />
              </div>
              <div>
                <label style={ls}>Processing Fee Max (₹)</label>
                <input type="number" name="processingFeeMax" value={formData.processingFeeMax} onChange={handleChange} style={is} />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>💸 Commission Setup</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={ls}>Platform Commission Rate (%) *</label>
                <input type="number" name="commissionRate" value={formData.commissionRate} onChange={handleChange} style={is} step="0.1" required />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>This is what you pay to the platform per disbursed loan</p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🔑 Account Setup</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={ls}>Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} style={is} required minLength="6" />
              </div>
              <div>
                <label style={ls}>Confirm Password *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={is} required />
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>Passwords do not match</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <ProviderRegistrationLayout
      title="Lender Registration"
      subtitle="Register your lending company with all charges and products"
      icon="💰"
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      loading={loading}
      onSubmit={handleSubmit}
    >
      {renderStep()}
    </ProviderRegistrationLayout>
  );
};

const ls = { display: 'block', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#374151' };
const is = { width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '0.9rem', backgroundColor: 'white', outline: 'none', boxSizing: 'border-box' };

export default LenderRegister;