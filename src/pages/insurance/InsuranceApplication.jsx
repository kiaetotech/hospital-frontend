import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const InsuranceApplication = () => {
  const navigate = useNavigate();
  const { planId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState(null);
  const [premiumCalculation, setPremiumCalculation] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    primaryInsured: {
      name: '',
      age: '',
      gender: 'male',
      dateOfBirth: '',
      aadhaar: '',
      pan: '',
      occupation: '',
      isSmoker: false
    },
    members: [],
    sumInsured: '',
    startDate: new Date().toISOString().split('T')[0],
    selectedAddons: [],
    nominee: {
      name: '',
      relation: '',
      contactNumber: ''
    },
    termsAccepted: false
  });

  // Member form
  const [memberForm, setMemberForm] = useState({
    name: '',
    relation: 'spouse',
    age: '',
    gender: 'male'
  });

  // Fetch plan details
  useEffect(() => {
    if (planId) {
      fetchPlanDetails();
    }
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/insurance/plans/${planId}`);
      if (response.data.success) {
        setPlan(response.data.data);
        setFormData(prev => ({
          ...prev,
          sumInsured: response.data.data.sumInsured?.default || ''
        }));
        await calculatePremium(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      setError('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const calculatePremium = async (planData) => {
    try {
      const response = await axios.post('/api/insurance/calculate-premium', {
        planId: planData._id,
        age: parseInt(formData.primaryInsured.age) || 30,
        sumInsured: parseInt(formData.sumInsured) || planData.sumInsured?.default,
        membersCount: formData.members.length + 1,
        isSmoker: formData.primaryInsured.isSmoker
      });
      if (response.data.success) {
        setPremiumCalculation(response.data.data);
      }
    } catch (error) {
      console.error('Error calculating premium:', error);
    }
  };

  // Recalculate premium when form changes
  useEffect(() => {
    if (plan) {
      const timer = setTimeout(() => {
        calculatePremium(plan);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.primaryInsured.age, formData.sumInsured, formData.members.length, formData.primaryInsured.isSmoker]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handlePrimaryInsuredChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      primaryInsured: {
        ...prev.primaryInsured,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleAddMember = () => {
    if (memberForm.name && memberForm.age) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, { ...memberForm, id: Date.now() }]
      }));
      setMemberForm({ name: '', relation: 'spouse', age: '', gender: 'male' });
    }
  };

  const handleRemoveMember = (id) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id)
    }));
  };

  const handleAddonToggle = (addonId) => {
    setFormData(prev => {
      const selected = prev.selectedAddons.includes(addonId)
        ? prev.selectedAddons.filter(id => id !== addonId)
        : [...prev.selectedAddons, addonId];
      return { ...prev, selectedAddons: selected };
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.termsAccepted) {
    setError('Please accept the terms and conditions');
    return;
  }

  if (!formData.primaryInsured.name || !formData.primaryInsured.age) {
    setError('Please fill in primary insured details');
    return;
  }

  try {
    setSubmitting(true);
    setError(null);

    // Get user token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to apply for insurance');
      navigate('/login');
      return;
    }

    const payload = {
      planId: plan._id,
      sumInsured: parseInt(formData.sumInsured),
      members: formData.members,
      startDate: formData.startDate,
      selectedAddons: formData.selectedAddons,
      primaryInsured: formData.primaryInsured,
      nominee: formData.nominee,
      termsAccepted: formData.termsAccepted
    };

    const response = await axios.post('/api/insurance/apply', payload, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      // Store booking data for payment
      localStorage.setItem('insuranceBookingId', response.data.data.bookingId);
      localStorage.setItem('insurancePolicyId', response.data.data.policyId);
      
      // Navigate to payment
      navigate(`/payment?orderId=${response.data.data.orderId}&bookingId=${response.data.data.bookingId}&amount=${response.data.data.amount}`);
    }
  } catch (error) {
    console.error('Error submitting application:', error);
    
    if (error.response?.status === 401) {
      setError('Please login to continue');
      navigate('/login');
    } else {
      setError(error.response?.data?.message || 'Failed to submit application. Please try again.');
    }
  } finally {
    setSubmitting(false);
  }
};

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
          <p style={{ textAlign: 'center' }}>Loading application...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Plan Not Found</h2>
          <p style={{ color: '#6b7280' }}>The plan you're applying for doesn't exist.</p>
          <button
            onClick={() => navigate('/insurance/list')}
            style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Browse Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ color: '#4b5563', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
            >
              ←
            </button>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Apply for Insurance</h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {plan.planName} • {plan.companyId?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Progress Steps */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: step >= 1 ? '#2563eb' : '#e5e7eb',
                  color: step >= 1 ? 'white' : '#6b7280',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}>
                  1
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: step >= 1 ? 'bold' : 'normal' }}>Personal Details</span>
              </div>
              <div style={{ flex: 1, height: '2px', backgroundColor: '#e5e7eb', margin: '0 0.5rem' }}>
                <div style={{ width: step >= 2 ? '100%' : '0%', height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: step >= 2 ? '#2563eb' : '#e5e7eb',
                  color: step >= 2 ? 'white' : '#6b7280',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}>
                  2
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: step >= 2 ? 'bold' : 'normal' }}>Coverage</span>
              </div>
              <div style={{ flex: 1, height: '2px', backgroundColor: '#e5e7eb', margin: '0 0.5rem' }}>
                <div style={{ width: step >= 3 ? '100%' : '0%', height: '100%', backgroundColor: '#2563eb', transition: 'width 0.3s' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: step >= 3 ? '#2563eb' : '#e5e7eb',
                  color: step >= 3 ? 'white' : '#6b7280',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}>
                  3
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: step >= 3 ? 'bold' : 'normal' }}>Review & Pay</span>
              </div>
            </div>
          </div>

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Primary Insured Details</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.primaryInsured.name}
                    onChange={handlePrimaryInsuredChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.primaryInsured.age}
                    onChange={handlePrimaryInsuredChange}
                    min={18}
                    max={80}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Gender *</label>
                  <select
                    name="gender"
                    value={formData.primaryInsured.gender}
                    onChange={handlePrimaryInsuredChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.primaryInsured.dateOfBirth}
                    onChange={handlePrimaryInsuredChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Aadhaar Number</label>
                  <input
                    type="text"
                    name="aadhaar"
                    value={formData.primaryInsured.aadhaar}
                    onChange={handlePrimaryInsuredChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>PAN Number</label>
                  <input
                    type="text"
                    name="pan"
                    value={formData.primaryInsured.pan}
                    onChange={handlePrimaryInsuredChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.primaryInsured.occupation}
                    onChange={handlePrimaryInsuredChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
                  <input
                    type="checkbox"
                    name="isSmoker"
                    checked={formData.primaryInsured.isSmoker}
                    onChange={handlePrimaryInsuredChange}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label style={{ cursor: 'pointer' }}>I am a smoker</label>
                </div>
              </div>

              {/* Family Members */}
              <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Family Members (Optional)</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Name"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                  <select
                    value={memberForm.relation}
                    onChange={(e) => setMemberForm({ ...memberForm, relation: e.target.value })}
                    style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  >
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Age"
                    value={memberForm.age}
                    onChange={(e) => setMemberForm({ ...memberForm, age: e.target.value })}
                    style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                </div>

                {formData.members.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {formData.members.map((member) => (
                      <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '6px', marginBottom: '0.25rem' }}>
                        <span><strong>{member.name}</strong> ({member.relation}, {member.age} yrs)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Coverage */}
          {step === 2 && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Coverage Details</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Sum Insured (₹) *</label>
                  <input
                    type="number"
                    name="sumInsured"
                    value={formData.sumInsured}
                    onChange={handleInputChange}
                    placeholder={`Default: ${plan.sumInsured?.default?.toLocaleString()}`}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px' }}>Policy Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                </div>
              </div>

              {/* Add-ons */}
              {(plan.addons || []).length > 0 && (
                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Add-ons / Riders</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {plan.addons.map((addon, idx) => (
                      <div key={idx} style={{ 
                        padding: '0.75rem', 
                        border: formData.selectedAddons.includes(addon._id) ? '2px solid #2563eb' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: formData.selectedAddons.includes(addon._id) ? '#eff6ff' : 'white'
                      }}
                      onClick={() => handleAddonToggle(addon._id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{addon.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{addon.description}</div>
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(addon.price || 0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Calculation Preview */}
              {premiumCalculation && (
                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '1.5rem', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Premium Calculation</h3>
                  <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Base Premium</div>
                        <div style={{ fontWeight: 'bold' }}>{formatCurrency(premiumCalculation.basePremium)}</div>
                      </div>
                      {premiumCalculation.discountAmount > 0 && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Discount</div>
                          <div style={{ fontWeight: 'bold', color: '#10b981' }}>-{formatCurrency(premiumCalculation.discountAmount)}</div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>GST ({premiumCalculation.gstRate || 18}%)</div>
                        <div style={{ fontWeight: 'bold' }}>+{formatCurrency(premiumCalculation.gstAmount)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Premium</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(premiumCalculation.totalPremium)}</div>
                        <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>per year</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ padding: '10px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{ padding: '10px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Review & Pay →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Pay */}
          {step === 3 && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Review & Confirm</h2>

              {/* Summary */}
              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Plan</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.planName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Company</div>
                    <div style={{ fontWeight: 'bold' }}>{plan.companyId?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sum Insured</div>
                    <div style={{ fontWeight: 'bold' }}>{formatCurrency(parseInt(formData.sumInsured) || plan.sumInsured?.default)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Primary Insured</div>
                    <div style={{ fontWeight: 'bold' }}>{formData.primaryInsured.name} ({formData.primaryInsured.age} yrs)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Members</div>
                    <div style={{ fontWeight: 'bold' }}>{formData.members.length + 1} members</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Start Date</div>
                    <div style={{ fontWeight: 'bold' }}>{new Date(formData.startDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Premium Total */}
              {premiumCalculation && (
                <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', marginBottom: '1rem', border: '2px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Premium (including GST)</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{formatCurrency(premiumCalculation.totalPremium)}</div>
                      <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>per year</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>You Save</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(premiumCalculation.discountAmount)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '0.875rem' }}>
                    I have read and agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Terms and Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>Privacy Policy</a>
                  </span>
                </label>
              </div>

              {error && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '1rem', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ padding: '10px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ 
                    padding: '10px 32px', 
                    backgroundColor: submitting ? '#6b7280' : '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Processing...' : 'Pay & Submit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsuranceApplication;
