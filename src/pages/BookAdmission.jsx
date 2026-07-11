import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHospitalById, bookAdmission, createPaymentOrder, verifyPayment } from '../services/api';

const BookAdmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1=Room Selection, 2=Patient Details, 3=Payment
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    // Room selection
    roomType: '',
    roomPrice: 0,
    numberOfDays: 1,
    
    // Patient details
    patientName: '',
    patientAge: '',
    patientGender: 'Male',
    patientPhone: '',
    patientEmail: '',
    guardianName: '',
    guardianPhone: '',
    relation: 'Self',
    
    // Admission details
    admissionDate: '',
    admissionReason: '',
    doctorReferral: '',
    existingReports: false,
    insuranceProvider: '',
    insurancePolicyNumber: '',
    schemeApplied: '',
    
    // Payment
    paymentMethod: 'online',
    advancePayment: 0
  });

  const roomCategories = [
    { 
      type: 'General Ward', 
      price: hospital?.pricing?.general_bed_per_day || 2200,
      beds: hospital?.beds?.available || 0,
      description: 'Shared room with basic amenities',
      icon: '🏥'
    },
    { 
      type: 'Semi-Private', 
      price: hospital?.pricing?.semi_private_per_day || 4500,
      beds: hospital?.beds?.categories?.semi_private?.available || 0,
      description: 'Twin sharing room with AC',
      icon: '🛏️'
    },
    { 
      type: 'Private Room', 
      price: hospital?.pricing?.private_per_day || 6500,
      beds: hospital?.beds?.categories?.private?.available || 0,
      description: 'Single room with AC, TV, WiFi',
      icon: '🏨'
    },
    { 
      type: 'Deluxe Room', 
      price: hospital?.pricing?.deluxe_per_day || 8000,
      beds: hospital?.beds?.categories?.deluxe?.available || 0,
      description: 'Premium room with all amenities',
      icon: '✨'
    },
    { 
      type: 'ICU', 
      price: hospital?.pricing?.icu_bed_per_day || 8000,
      beds: hospital?.beds?.icu_available || 0,
      description: 'Intensive Care Unit',
      icon: '🏥'
    }
  ];

  const schemeOptions = [
    { value: '', label: 'None' },
    { value: 'ayushman', label: 'Ayushman Bharat (PM-JAY)' },
    { value: 'cghs', label: 'CGHS' },
    { value: 'esi', label: 'ESI' },
    { value: 'echs', label: 'ECHS' },
    { value: 'state_scheme', label: 'State Health Scheme' }
  ];

  useEffect(() => {
    fetchHospital();
  }, [id]);

  const fetchHospital = async () => {
    try {
      const res = await getHospitalById(id);
      setHospital(res.data.data);
    } catch (error) {
      setError('Failed to load hospital details');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room) => {
    setFormData({
      ...formData,
      roomType: room.type,
      roomPrice: room.price
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const calculateTotal = () => {
    const roomCost = formData.roomPrice * (formData.numberOfDays || 1);
    const advancePercent = hospital?.advance_payment_percent || 25;
    const advanceAmount = Math.round(roomCost * advancePercent / 100);
    return { roomCost, advancePercent, advanceAmount };
  };

  const validateStep1 = () => {
    if (!formData.roomType) {
      setError('Please select a room type');
      return false;
    }
    if (formData.numberOfDays < 1) {
      setError('Number of days must be at least 1');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.patientName || !formData.patientAge || !formData.patientPhone) {
      setError('Please fill all required patient details');
      return false;
    }
    if (!formData.admissionDate) {
      setError('Please select admission date');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmitAdmission = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const { advanceAmount } = calculateTotal();
      
      const bookingData = {
        hospitalId: id,
        hospitalName: hospital.name,
        roomType: formData.roomType,
        roomPrice: formData.roomPrice,
        numberOfDays: formData.numberOfDays,
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge),
        patientGender: formData.patientGender,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        relation: formData.relation,
        admissionDate: formData.admissionDate,
        admissionReason: formData.admissionReason,
        doctorReferral: formData.doctorReferral,
        existingReports: formData.existingReports,
        insuranceProvider: formData.insuranceProvider,
        insurancePolicyNumber: formData.insurancePolicyNumber,
        schemeApplied: formData.schemeApplied,
        totalAmount: calculateTotal().roomCost,
        advanceAmount: advanceAmount,
        paymentMethod: formData.paymentMethod
      };

      if (advanceAmount > 0) {
        // Create payment order for advance
        const paymentRes = await createPaymentOrder({
          amount: advanceAmount,
          currency: 'INR',
          bookingType: 'admission',
          hospitalId: id
        });

        const { orderId, amount, currency } = paymentRes.data.data;

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx',
          amount: amount,
          currency: currency,
          name: hospital.name,
          description: `Admission Booking - ${formData.roomType} - Advance Payment`,
          order_id: orderId,
          handler: async function(response) {
            const verifyRes = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: bookingData
            });

            if (verifyRes.data.success) {
              const admissionRes = await bookAdmission({
                ...bookingData,
                paymentId: response.razorpay_payment_id,
                orderId: orderId
              });

              setSuccess('✅ Admission booked successfully! Check your email for confirmation.');
              setTimeout(() => {
                navigate('/my-bookings');
              }, 2000);
            } else {
              setError('Payment verification failed. Please try again.');
            }
          },
          prefill: {
            name: formData.patientName,
            email: formData.patientEmail,
            contact: formData.patientPhone
          },
          theme: {
            color: '#3b82f6'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        // No advance payment required
        const admissionRes = await bookAdmission(bookingData);
        setSuccess('✅ Admission booked successfully! Check your email for confirmation.');
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      }
      
    } catch (error) {
      setError('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏥</div>
          <p>Loading admission page...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Hospital not found</p>
        <button onClick={() => navigate('/hospitals')} style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
          Back to Hospitals
        </button>
      </div>
    );
  }

  const { roomCost, advancePercent, advanceAmount } = calculateTotal();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            ← Back
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🏥 Book Hospital Admission</h1>
          <p style={{ color: '#6b7280' }}>{hospital.name} • {hospital.address?.city}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <p style={{ fontWeight: 'bold' }}>{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Steps Indicator */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ 
              flex: 1, 
              textAlign: 'center',
              padding: '0.75rem',
              backgroundColor: step >= s ? '#3b82f6' : '#e5e7eb',
              color: step >= s ? 'white' : '#6b7280',
              fontWeight: step === s ? 'bold' : 'normal',
              borderRadius: s === 1 ? '0.5rem 0 0 0.5rem' : s === 3 ? '0 0.5rem 0.5rem 0' : '0'
            }}>
              {s === 1 ? '🛏️' : s === 2 ? '📝' : '💳'} Step {s}: {s === 1 ? 'Select Room' : s === 2 ? 'Patient Details' : 'Payment'}
            </div>
          ))}
        </div>

        {/* STEP 1: SELECT ROOM */}
        {step === 1 && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Select Room Type</h2>
            
            {/* Room Categories */}
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {roomCategories.filter(room => room.price > 0).map((room, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleRoomSelect(room)}
                  style={{ 
                    padding: '1rem', 
                    border: formData.roomType === room.type ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: formData.roomType === room.type ? '#eff6ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>{room.icon}</span>
                      <div>
                        <h3 style={{ fontWeight: 'bold' }}>{room.type}</h3>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{room.description}</p>
                        {room.beds > 0 ? (
                          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>🟢 {room.beds} beds available</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>🔴 Currently full</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>₹{room.price}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>per day</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Number of Days */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                  Expected Number of Days
                </label>
                <input 
                  type="number" 
                  name="numberOfDays" 
                  value={formData.numberOfDays} 
                  onChange={handleInputChange}
                  min="1" 
                  max="90"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>
              {formData.roomType && (
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Estimated Room Cost:</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>₹{roomCost.toLocaleString()}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Advance ({advancePercent}%): ₹{advanceAmount.toLocaleString()}</p>
                </div>
              )}
            </div>

            <button 
              onClick={handleNextStep}
              disabled={!formData.roomType}
              style={{ 
                marginTop: '1.5rem', 
                width: '100%',
                padding: '0.75rem', 
                backgroundColor: formData.roomType ? '#3b82f6' : '#d1d5db', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.5rem', 
                cursor: formData.roomType ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Continue to Patient Details →
            </button>
          </div>
        )}

        {/* STEP 2: PATIENT DETAILS */}
        {step === 2 && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Patient & Admission Details</h2>
            
            {/* Patient Info */}
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#3b82f6' }}>👤 Patient Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Patient Name *</label>
                <input type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Age *</label>
                <input type="number" name="patientAge" value={formData.patientAge} onChange={handleInputChange} required min="0" max="120" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Gender</label>
                <select name="patientGender" value={formData.patientGender} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Phone *</label>
                <input type="tel" name="patientPhone" value={formData.patientPhone} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Email</label>
                <input type="email" name="patientEmail" value={formData.patientEmail} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
            </div>

            {/* Guardian Info */}
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#3b82f6' }}>👨‍👩‍👧 Guardian / Attendant Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Guardian Name</label>
                <input type="text" name="guardianName" value={formData.guardianName} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Relation to Patient</label>
                <select name="relation" value={formData.relation} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                  <option>Self</option>
                  <option>Spouse</option>
                  <option>Son</option>
                  <option>Daughter</option>
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Brother</option>
                  <option>Sister</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Guardian Phone</label>
                <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
            </div>

            {/* Admission Details */}
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#3b82f6' }}>🏥 Admission Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Admission Date *</label>
                <input type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} required min={getTomorrowDate()} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Referring Doctor</label>
                <input type="text" name="doctorReferral" value={formData.doctorReferral} onChange={handleInputChange} placeholder="Doctor name (if any)" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Reason for Admission *</label>
              <textarea name="admissionReason" value={formData.admissionReason} onChange={handleInputChange} rows="3" required placeholder="Describe the medical condition or procedure..." style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', resize: 'vertical' }}></textarea>
            </div>

            {/* Insurance & Scheme */}
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#3b82f6' }}>💳 Insurance / Scheme (Optional)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Insurance Provider</label>
                <input type="text" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleInputChange} placeholder="e.g., Star Health" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Policy Number</label>
                <input type="text" name="insurancePolicyNumber" value={formData.insurancePolicyNumber} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Government Scheme (if applicable)</label>
              <select name="schemeApplied" value={formData.schemeApplied} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                {schemeOptions.map(scheme => (
                  <option key={scheme.value} value={scheme.value}>{scheme.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="existingReports" checked={formData.existingReports} onChange={handleInputChange} />
                <span style={{ fontSize: '0.875rem' }}>I have existing medical reports to submit</span>
              </label>
            </div>

            {/* Booking Summary */}
            <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 Admission Summary</h4>
              <div style={{ fontSize: '0.875rem' }}>
                <p><strong>Hospital:</strong> {hospital.name}</p>
                <p><strong>Room:</strong> {formData.roomType} @ ₹{formData.roomPrice}/day</p>
                <p><strong>Duration:</strong> {formData.numberOfDays} day(s)</p>
                <p><strong>Estimated Room Cost:</strong> ₹{roomCost.toLocaleString()}</p>
                <p><strong>Advance Required ({advancePercent}%):</strong> <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>₹{advanceAmount.toLocaleString()}</span></p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setStep(1)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={handleNextStep} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                Proceed to Payment →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT */}
        {step === 3 && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>💳 Payment</h2>
            
            {/* Full Summary */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Admission Summary</h3>
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hospital:</span>
                  <span><strong>{hospital.name}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Room Type:</span>
                  <span><strong>{formData.roomType}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Duration:</span>
                  <span>{formData.numberOfDays} day(s)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Patient:</span>
                  <span>{formData.patientName} ({formData.patientAge} yrs)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Admission Date:</span>
                  <span>{formData.admissionDate}</span>
                </div>
                {formData.insuranceProvider && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Insurance:</span>
                    <span>{formData.insuranceProvider} ({formData.insurancePolicyNumber})</span>
                  </div>
                )}
                {formData.schemeApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Scheme:</span>
                    <span>{schemeOptions.find(s => s.value === formData.schemeApplied)?.label}</span>
                  </div>
                )}
                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Room Cost ({formData.numberOfDays} days):</span>
                  <span>₹{roomCost.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3b82f6' }}>
                  <span>Advance Payment ({advancePercent}%):</span>
                  <span>₹{advanceAmount.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  * Remaining amount to be paid at hospital during admission
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  <span>Pay Now:</span>
                  <span style={{ color: '#3b82f6' }}>₹{advanceAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Payment Method</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', cursor: 'pointer', border: '2px solid #3b82f6' }}>
                <input type="radio" name="paymentMethod" value="online" checked={formData.paymentMethod === 'online'} onChange={handleInputChange} />
                <span>💳 Pay Online (Credit/Debit Card, UPI, Net Banking, EMI)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setStep(2)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                ← Back
              </button>
              <button 
                onClick={handleSubmitAdmission}
                disabled={submitting}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  backgroundColor: submitting ? '#d1d5db' : '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {submitting ? 'Processing...' : `Pay ₹${advanceAmount.toLocaleString()} & Confirm Admission`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookAdmission;
