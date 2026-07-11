import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getHospitalById, bookOPD, createPaymentOrder, verifyPayment } from '../services/api';

const BookOPD = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDoctor = searchParams.get('doctor');

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1=Select Doctor, 2=Patient Details, 3=Payment
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    doctorName: preselectedDoctor || '',
    doctorFee: 0,
    doctorSpecialization: '',
    patientName: '',
    patientAge: '',
    patientGender: 'Male',
    patientPhone: '',
    patientEmail: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    existingReports: false,
    paymentMethod: 'online'
  });

  // Time slots
  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
    '07:00 PM', '07:30 PM', '08:00 PM'
  ];

  useEffect(() => {
    fetchHospital();
  }, [id]);

  const fetchHospital = async () => {
    try {
      const res = await getHospitalById(id);
      setHospital(res.data.data);
      
      // If doctor preselected from URL
      if (preselectedDoctor) {
        const doctor = res.data.data.doctors?.find(d => d.name === preselectedDoctor);
        if (doctor) {
          setFormData(prev => ({
            ...prev,
            doctorName: doctor.name,
            doctorFee: doctor.consultation_fee,
            doctorSpecialization: doctor.specialization
          }));
        }
      }
    } catch (error) {
      setError('Failed to load hospital details');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setFormData({
      ...formData,
      doctorName: doctor.name,
      doctorFee: doctor.consultation_fee,
      doctorSpecialization: doctor.specialization
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateStep1 = () => {
    if (!formData.doctorName) {
      setError('Please select a doctor');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.patientName || !formData.patientAge || !formData.patientPhone) {
      setError('Please fill all required patient details');
      return false;
    }
    if (!formData.appointmentDate || !formData.appointmentTime) {
      setError('Please select appointment date and time');
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

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const bookingData = {
        hospitalId: id,
        hospitalName: hospital.name,
        doctorName: formData.doctorName,
        doctorSpecialization: formData.doctorSpecialization,
        consultationFee: formData.doctorFee,
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge),
        patientGender: formData.patientGender,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        existingReports: formData.existingReports,
        paymentMethod: formData.paymentMethod
      };

      // Create payment order
      const paymentRes = await createPaymentOrder({
        amount: formData.doctorFee,
        currency: 'INR',
        bookingType: 'opd',
        hospitalId: id
      });

      const { orderId, amount, currency } = paymentRes.data.data;

      // Load Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx',
        amount: amount,
        currency: currency,
        name: hospital.name,
        description: `OPD Booking - ${formData.doctorName}`,
        order_id: orderId,
        handler: async function(response) {
          // Verify payment
          const verifyRes = await verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            bookingData: bookingData
          });

          if (verifyRes.data.success) {
            // Create booking after payment
            const bookingRes = await bookOPD({
              ...bookingData,
              paymentId: response.razorpay_payment_id,
              orderId: orderId
            });

            setSuccess('✅ Booking confirmed! Check your email for details.');
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
          color: '#10b981'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
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

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return max.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
          <p>Loading booking page...</p>
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

  const discount = hospital.pricing?.online_booking_discount || 10;
  const discountAmount = Math.round(formData.doctorFee * discount / 100);
  const finalFee = formData.doctorFee - discountAmount;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            ← Back
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>📋 Book OPD Appointment</h1>
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
              backgroundColor: step >= s ? '#10b981' : '#e5e7eb',
              color: step >= s ? 'white' : '#6b7280',
              fontWeight: step === s ? 'bold' : 'normal',
              borderRadius: s === 1 ? '0.5rem 0 0 0.5rem' : s === 3 ? '0 0.5rem 0.5rem 0' : '0'
            }}>
              {s === 1 ? '👨‍⚕️' : s === 2 ? '📝' : '💳'} Step {s}: {s === 1 ? 'Select Doctor' : s === 2 ? 'Patient Details' : 'Payment'}
            </div>
          ))}
        </div>

        {/* STEP 1: SELECT DOCTOR */}
        {step === 1 && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Select Doctor</h2>
            
            {preselectedDoctor && formData.doctorName ? (
              <div style={{ backgroundColor: '#d1fae5', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 'bold' }}>✅ Selected: {formData.doctorName}</p>
                <p style={{ fontSize: '0.875rem' }}>{formData.doctorSpecialization} • ₹{formData.doctorFee}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {hospital.doctors?.filter(d => d.availability?.status !== 'leave').map((doctor, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleDoctorSelect(doctor)}
                    style={{ 
                      padding: '1rem', 
                      border: formData.doctorName === doctor.name ? '2px solid #10b981' : '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      backgroundColor: formData.doctorName === doctor.name ? '#f0fdf4' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontWeight: 'bold' }}>{doctor.name}</h3>
                        <p style={{ color: '#3b82f6', fontSize: '0.875rem' }}>{doctor.specialization}</p>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          📜 {doctor.qualification || 'N/A'} • 📅 {doctor.experience || 'N/A'} exp
                        </p>
                        {doctor.languages?.length > 0 && (
                          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            🗣️ {doctor.languages.join(', ')}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                          <span>⭐ {doctor.rating || 'N/A'}</span>
                          {doctor.reviewCount > 0 && <span>({doctor.reviewCount} reviews)</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>₹{doctor.consultation_fee}</div>
                        <div style={{ fontSize: '0.75rem', color: '#059669' }}>Save {discount}% online</div>
                        {doctor.availability?.status === 'limited' && (
                          <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.65rem' }}>Few slots left</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(!hospital.doctors || hospital.doctors.length === 0) && (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No doctors available for booking.</p>
                )}
              </div>
            )}

            <button 
              onClick={handleNextStep}
              disabled={!formData.doctorName}
              style={{ 
                marginTop: '1.5rem', 
                width: '100%',
                padding: '0.75rem', 
                backgroundColor: formData.doctorName ? '#10b981' : '#d1d5db', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.5rem', 
                cursor: formData.doctorName ? 'pointer' : 'not-allowed',
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
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Patient Details</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Patient Name *</label>
                <input type="text" name="patientName" value={formData.patientName} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Age *</label>
                <input type="number" name="patientAge" value={formData.patientAge} onChange={handleInputChange} required min="1" max="120" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
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
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Appointment Date *</label>
                <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleInputChange} required min={getTomorrowDate()} max={getMaxDate()} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Preferred Time *</label>
                <select name="appointmentTime" value={formData.appointmentTime} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                  <option value="">Select time</option>
                  <optgroup label="Morning">
                    {timeSlots.filter(t => t.includes('AM')).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Evening">
                    {timeSlots.filter(t => t.includes('PM')).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>Reason for Visit</label>
              <textarea name="reason" value={formData.reason} onChange={handleInputChange} rows="3" placeholder="Describe your symptoms or reason for consultation..." style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', resize: 'vertical' }}></textarea>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="existingReports" checked={formData.existingReports} onChange={handleInputChange} />
                <span style={{ fontSize: '0.875rem' }}>I have existing medical reports to show</span>
              </label>
            </div>

            {/* Selected Doctor Summary */}
            <div style={{ marginTop: '1.5rem', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>📋 Booking Summary</h4>
              <div style={{ fontSize: '0.875rem' }}>
                <p><strong>Hospital:</strong> {hospital.name}</p>
                <p><strong>Doctor:</strong> {formData.doctorName} ({formData.doctorSpecialization})</p>
                <p><strong>Consultation Fee:</strong> ₹{formData.doctorFee} 
                  <span style={{ color: '#059669', marginLeft: '0.5rem' }}>
                    (Save ₹{discountAmount} with online booking)
                  </span>
                </p>
                <p><strong>Final Amount:</strong> <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>₹{finalFee}</span></p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button onClick={() => setStep(1)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={handleNextStep} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                Proceed to Payment →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT */}
        {step === 3 && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>💳 Payment</h2>
            
            {/* Booking Summary */}
            <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Booking Summary</h3>
              <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hospital:</span>
                  <span><strong>{hospital.name}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Doctor:</span>
                  <span><strong>{formData.doctorName}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Specialization:</span>
                  <span>{formData.doctorSpecialization}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Patient:</span>
                  <span>{formData.patientName} ({formData.patientAge} yrs, {formData.patientGender})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Date & Time:</span>
                  <span>{formData.appointmentDate} at {formData.appointmentTime}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Consultation Fee:</span>
                  <span>₹{formData.doctorFee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Online Booking Discount ({discount}%):</span>
                  <span>-₹{discountAmount}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: '#10b981' }}>₹{finalFee}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Payment Method</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', cursor: 'pointer', border: '2px solid #10b981' }}>
                <input type="radio" name="paymentMethod" value="online" checked={formData.paymentMethod === 'online'} onChange={handleInputChange} />
                <span>💳 Pay Online (Credit/Debit Card, UPI, Net Banking)</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setStep(2)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                ← Back
              </button>
              <button 
                onClick={handleSubmitBooking}
                disabled={submitting}
                style={{ 
                  flex: 1, 
                  padding: '0.75rem', 
                  backgroundColor: submitting ? '#d1d5db' : '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '0.5rem', 
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {submitting ? 'Processing...' : `Pay ₹${finalFee} & Confirm Booking`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookOPD;
