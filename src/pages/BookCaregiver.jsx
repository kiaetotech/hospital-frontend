import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCaregiverById, bookCaregiver } from '../services/api';

const BookCaregiver = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [caregiver, setCaregiver] = useState(location.state?.caregiver || null);
  const [loading, setLoading] = useState(!caregiver);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [durationType, setDurationType] = useState('hourly');
  const [durationValue, setDurationValue] = useState(4);
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    serviceAddress: '',
    startDate: '',
    startTime: '',
    endDate: '',
    requirements: '',
    recurringWeekly: false,
    recurringDays: []
  });

  useEffect(() => {
    if (!caregiver && id) {
      fetchCaregiver();
    }
  }, [id]);

  const fetchCaregiver = async () => {
    try {
      const response = await getCaregiverById(id);
      if (response.data.success) {
        setCaregiver(response.data.data);
      } else {
        setError('Caregiver not found');
      }
    } catch (err) {
      setError('Failed to load caregiver details');
    } finally {
      setLoading(false);
    }
  };

  const hourlyRate = caregiver?.pricing?.personal?.hourly || caregiver?.pricing?.skilled?.hourly || 300;
  const dailyRate = hourlyRate * 8;
  const weeklyRate = dailyRate * 5;
  const monthlyRate = weeklyRate * 4;
  const yearlyRate = monthlyRate * 12;

  const getTotalAmount = () => {
    switch (durationType) {
      case 'hourly': return hourlyRate * durationValue;
      case 'daily': return dailyRate * durationValue;
      case 'weekly': return weeklyRate * durationValue;
      case 'monthly': return monthlyRate * durationValue;
      case 'yearly': return yearlyRate * durationValue;
      default: return hourlyRate * 4;
    }
  };

  const totalAmount = getTotalAmount();
  const platformFee = Math.min(totalAmount * 0.05, 500);
  const gst = Math.round(platformFee * 0.18);
  const finalAmount = totalAmount + platformFee + gst;

  const getDurationLabel = () => {
    switch (durationType) {
      case 'hourly': return `${durationValue} hour(s)`;
      case 'daily': return `${durationValue} day(s)`;
      case 'weekly': return `${durationValue} week(s)`;
      case 'monthly': return `${durationValue} month(s)`;
      case 'yearly': return `${durationValue} year(s)`;
      default: return '';
    }
  };

  const getRateText = () => {
    switch (durationType) {
      case 'hourly': return `₹${hourlyRate}/hour`;
      case 'daily': return `₹${dailyRate}/day (8 hours)`;
      case 'weekly': return `₹${weeklyRate}/week (5 days)`;
      case 'monthly': return `₹${monthlyRate}/month (20 days)`;
      case 'yearly': return `₹${yearlyRate}/year (240 days)`;
      default: return '';
    }
  };

  const getMaxValue = () => {
    switch (durationType) {
      case 'hourly': return 24;
      case 'daily': return 30;
      case 'weekly': return 52;
      case 'monthly': return 12;
      case 'yearly': return 5;
      default: return 24;
    }
  };

  const getStepIcon = (step) => {
    if (step < currentStep) return '✅';
    if (step === currentStep) return '🔵';
    return '⚪';
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return durationValue >= 1 && durationValue <= getMaxValue();
      case 2:
        return formData.patientName && formData.patientPhone && formData.serviceAddress && formData.startDate;
      case 3:
        return true; // Review step, always valid
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      alert('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    
    try {
      const bookingData = {
        caregiverId: caregiver._id,
        serviceType: caregiver.serviceType === 'both' ? 'personal' : caregiver.serviceType,
        careType: caregiver.specializations?.[0] || 'General Care',
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        duration: durationValue,
        durationType: durationType,
        totalAmount: finalAmount,
        commissionAmount: platformFee + gst,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        serviceAddress: formData.serviceAddress,
        requirements: formData.requirements || undefined,
        recurringWeekly: formData.recurringWeekly,
        recurringDays: formData.recurringDays.length > 0 ? formData.recurringDays : undefined
      };

      const response = await bookCaregiver(bookingData);
      
      if (response.data.success) {
        setBookingSuccess(response.data.data);
        setCurrentStep(4);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const weekDays = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' }
  ];

  const toggleRecurringDay = (day) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day]
    }));
  };

  // Loading State
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !caregiver) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Booking Unavailable</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            {error || 'Caregiver information not found. Please go back and try again.'}
          </p>
          <button onClick={() => navigate('/caregivers')} style={secondaryBtnStyle}>
            ← Find Caregivers
          </button>
        </div>
      </div>
    );
  }

  // Success State
  if (bookingSuccess && currentStep === 4) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '550px', width: '100%', textAlign: 'center' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '3rem 2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: '2px solid #bbf7d0'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2.5rem'
            }}>
              ✅
            </div>
            <h2 style={{ color: '#065f46', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              {caregiver.fullName} will contact you shortly.
            </p>

            <div style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
              border: '1px solid #bbf7d0'
            }}>
              <DetailRow label="Booking ID" value={bookingSuccess.bookingId || 'N/A'} />
              <DetailRow label="Caregiver" value={caregiver.fullName} />
              <DetailRow label="Caregiver Contact" value={caregiver.phone} />
              <DetailRow label="Service" value={getDurationLabel()} />
              <DetailRow label="Start Date" value={new Date(formData.startDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
              <DetailRow label="Total Paid" value={`₹${finalAmount}`} highlight />
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              📞 The caregiver will call you within 30 minutes to confirm the schedule.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => navigate('/caregivers')} style={{ ...secondaryBtnStyle, flex: 1 }}>
                Find More
              </button>
              <button onClick={() => navigate('/')} style={{ ...primaryBtnStyle, flex: 1 }}>
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => navigate(-1)} style={{ ...secondaryBtnStyle, marginBottom: '1rem' }}>
            ← Back
          </button>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
            Book Caregiver
          </h1>
          <p style={{ color: '#64748b' }}>
            Book {caregiver.fullName} • ⭐ {caregiver.ratings?.average?.toFixed(1) || '0.0'} • {caregiver.experienceYears} years exp
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {[
              { step: 1, label: 'Duration' },
              { step: 2, label: 'Details' },
              { step: 3, label: 'Review' }
            ].map((s, i) => (
              <React.Fragment key={s.step}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= s.step ? '#3b82f6' : '#e2e8f0',
                    color: currentStep >= s.step ? 'white' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}>
                    {currentStep > s.step ? '✓' : s.step}
                  </div>
                  <p style={{
                    fontSize: '0.8rem',
                    fontWeight: currentStep === s.step ? '600' : '400',
                    color: currentStep === s.step ? '#1e40af' : '#94a3b8',
                    margin: 0
                  }}>
                    {s.label}
                  </p>
                </div>
                {i < 2 && (
                  <div style={{
                    flex: '0 0 50px',
                    height: '2px',
                    backgroundColor: currentStep > s.step ? '#3b82f6' : '#e2e8f0',
                    marginBottom: '1.5rem'
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Step 1: Duration Selection */}
          {currentStep === 1 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem' }}>
                Select Booking Duration
              </h3>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {[
                  { key: 'hourly', label: 'Hourly', defaultVal: 4 },
                  { key: 'daily', label: 'Daily', defaultVal: 1 },
                  { key: 'weekly', label: 'Weekly', defaultVal: 1 },
                  { key: 'monthly', label: 'Monthly', defaultVal: 1 },
                  { key: 'yearly', label: 'Yearly', defaultVal: 1 }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { setDurationType(opt.key); setDurationValue(opt.defaultVal); }}
                    style={{
                      padding: '0.6rem 1.25rem',
                      backgroundColor: durationType === opt.key ? '#3b82f6' : '#f1f5f9',
                      color: durationType === opt.key ? 'white' : '#475569',
                      border: durationType === opt.key ? '2px solid #2563eb' : '2px solid #e2e8f0',
                      borderRadius: '2rem',
                      cursor: 'pointer',
                      fontWeight: durationType === opt.key ? '600' : '400',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>
                  {durationType === 'hourly' ? 'Number of Hours' :
                   durationType === 'daily' ? 'Number of Days' :
                   durationType === 'weekly' ? 'Number of Weeks' :
                   durationType === 'monthly' ? 'Number of Months' : 'Number of Years'}
                </label>
                <input
                  type="range"
                  min={1}
                  max={getMaxValue()}
                  value={durationValue}
                  onChange={(e) => setDurationValue(parseInt(e.target.value))}
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>1</span>
                  <span style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '1.1rem' }}>
                    {durationValue} {durationType === 'hourly' ? 'hrs' : durationType === 'daily' ? 'days' : durationType === 'weekly' ? 'wks' : durationType === 'monthly' ? 'mos' : 'yrs'}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{getMaxValue()}</span>
                </div>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '0.75rem',
                border: '1px solid #bbf7d0',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#065f46', fontWeight: '500', margin: 0 }}>
                  💰 {getRateText()} • Total: <strong>₹{totalAmount}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => navigate(-1)} style={secondaryBtnStyle}>
                  Cancel
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!validateStep(1)}
                  style={{
                    ...primaryBtnStyle,
                    opacity: validateStep(1) ? 1 : 0.5,
                    cursor: validateStep(1) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Patient Details */}
          {currentStep === 2 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem' }}>
                Patient & Service Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Patient Name *</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                    style={inputStyle}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Patient Age</label>
                  <input
                    type="number"
                    value={formData.patientAge}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientAge: e.target.value }))}
                    style={inputStyle}
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Patient Gender</label>
                  <select
                    value={formData.patientGender}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientGender: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                    style={inputStyle}
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>Service Address *</label>
                <textarea
                  value={formData.serviceAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceAddress: e.target.value }))}
                  rows="2"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Full address where service is needed"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={labelStyle}>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    style={inputStyle}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {(durationType === 'weekly' || durationType === 'monthly' || durationType === 'yearly') && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={labelStyle}>End Date (optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    style={inputStyle}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              <div style={{ marginTop: '1rem' }}>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.recurringWeekly}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurringWeekly: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  Recurring Weekly (same days every week)
                </label>
              </div>

              {formData.recurringWeekly && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={labelStyle}>Select Days of Week</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {weekDays.map(day => (
                      <button
                        type="button"
                        key={day.key}
                        onClick={() => toggleRecurringDay(day.key)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: formData.recurringDays.includes(day.key) ? '#3b82f6' : '#f1f5f9',
                          color: formData.recurringDays.includes(day.key) ? 'white' : '#475569',
                          border: formData.recurringDays.includes(day.key) ? '2px solid #2563eb' : '2px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '0.85rem'
                        }}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>Special Requirements / Notes</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  rows="2"
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Any specific care instructions or medical notes..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <button onClick={() => setCurrentStep(1)} style={secondaryBtnStyle}>
                  ← Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!validateStep(2)}
                  style={{
                    ...primaryBtnStyle,
                    opacity: validateStep(2) ? 1 : 0.5,
                    cursor: validateStep(2) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Review Booking →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {currentStep === 3 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem' }}>
                Review Your Booking
              </h3>

              {/* Caregiver Info */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                alignItems: 'center',
                border: '1px solid #e2e8f0'
              }}>
                {caregiver.photo && caregiver.photo !== 'https://placehold.co/400x400/e2e8f0/1e293b?text=Caregiver' ? (
                  <img src={caregiver.photo} alt={caregiver.fullName} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {caregiver.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div>
                  <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>{caregiver.fullName}</p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    ⭐ {caregiver.ratings?.average?.toFixed(1)} • {caregiver.experienceYears} years exp
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1rem' }}>📋 Booking Summary</h4>
                <ReviewRow label="Patient Name" value={formData.patientName} />
                <ReviewRow label="Phone" value={formData.patientPhone} />
                <ReviewRow label="Address" value={formData.serviceAddress} />
                <ReviewRow label="Duration" value={getDurationLabel()} />
                <ReviewRow label="Start Date" value={formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} />
                {formData.startTime && <ReviewRow label="Start Time" value={formData.startTime} />}
                {formData.recurringWeekly && <ReviewRow label="Recurring Days" value={formData.recurringDays.map(d => weekDays.find(w => w.key === d)?.label).join(', ')} />}
                {formData.requirements && <ReviewRow label="Requirements" value={formData.requirements} />}
              </div>

              {/* Price Breakdown */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '0.75rem',
                border: '2px solid #bbf7d0'
              }}>
                <h4 style={{ color: '#065f46', marginBottom: '1rem', fontSize: '1rem' }}>💰 Price Breakdown</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #bbf7d0' }}>
                  <span style={{ color: '#374151' }}>Service Charges ({getDurationLabel()})</span>
                  <span style={{ fontWeight: '500', color: '#1e293b' }}>₹{totalAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #bbf7d0' }}>
                  <span style={{ color: '#374151' }}>Platform Fee (5%)</span>
                  <span style={{ fontWeight: '500', color: '#1e293b' }}>₹{platformFee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #bbf7d0' }}>
                  <span style={{ color: '#374151' }}>GST (18% on fee)</span>
                  <span style={{ fontWeight: '500', color: '#1e293b' }}>₹{gst}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#065f46', fontSize: '1.1rem' }}>Total Payable</span>
                  <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '1.3rem' }}>₹{finalAmount}</span>
                </div>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>
                By confirming, you agree to our terms. The caregiver will contact you directly.
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button onClick={() => setCurrentStep(2)} style={secondaryBtnStyle}>
                  ← Edit Details
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    ...primaryBtnStyle,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '1.1rem',
                    padding: '0.8rem 2rem'
                  }}
                >
                  {submitting ? 'Booking...' : `Confirm & Pay ₹${finalAmount}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.8rem',
          marginTop: '1.5rem',
          lineHeight: '1.6'
        }}>
          ⚠️ HealthCare Hub is a technology platform connecting patients with independent caregivers. 
          We do not employ caregivers or provide medical services. All care services are provided directly 
          by the caregiver. We earn a commission for the booking connection.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// Helper Components
const DetailRow = ({ label, value, highlight }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #bbf7d0' }}>
    <span style={{ color: '#374151', fontSize: '0.9rem' }}>{label}</span>
    <span style={{ 
      fontWeight: highlight ? 'bold' : '500', 
      color: highlight ? '#059669' : '#1e293b',
      fontSize: '0.9rem'
    }}>
      {value}
    </span>
  </div>
);

const ReviewRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{label}</span>
    <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '0.9rem', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
  </div>
);

// Styles
const labelStyle = {
  display: 'block',
  fontWeight: '600',
  marginBottom: '0.35rem',
  fontSize: '0.85rem',
  color: '#374151'
};

const inputStyle = {
  width: '100%',
  padding: '0.65rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  fontSize: '0.9rem',
  color: '#1e293b',
  outline: 'none',
  transition: 'border-color 0.2s',
  backgroundColor: 'white'
};

const primaryBtnStyle = {
  padding: '0.7rem 1.5rem',
  background: 'linear-gradient(135deg, #10b981, #059669)',
  color: 'white',
  border: 'none',
  borderRadius: '0.5rem',
  fontWeight: '600',
  cursor: 'pointer',
  fontSize: '0.95rem',
  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
};

const secondaryBtnStyle = {
  padding: '0.7rem 1.5rem',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  fontWeight: '500',
  cursor: 'pointer',
  fontSize: '0.95rem'
};

export default BookCaregiver;

