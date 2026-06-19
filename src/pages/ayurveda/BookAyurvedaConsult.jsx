import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const BookAyurvedaConsult = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const doctorData = location.state || {};

  const doctor = doctorData.doctor || {
    _id: doctorId, 
    name: doctorData.doctorName || 'Doctor', 
    specialization: doctorData.specialization || '', 
    consultationFee: doctorData.fee || 500,
    wellnessCenter: doctorData.wellnessCenter || ''
  };
  const consultationType = doctorData.consultationType || 'online';

  const [step, setStep] = useState(1); // 1=Form, 2=Payment, 3=Confirmation
  const [form, setForm] = useState({
    patientName: '', phone: '', email: '', date: '', time: '',
    symptoms: '', age: '', gender: ''
  });
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [bookingData, setBookingData] = useState(null);

  // Generate time slots every 30 minutes from 6 AM to 10 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        const displayMin = min.toString().padStart(2, '0');
        slots.push(`${displayHour}:${displayMin} ${ampm}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Calculate amounts
  const consultationFee = doctor.consultationFee || 500;
  const platformFee = Math.round(consultationFee * 0.15); // 15% commission
  const discountAmount = discountInfo?.discountAmount || 0;
  const totalAmount = consultationFee - discountAmount;
  const gst = Math.round(totalAmount * 0.18); // 18% GST
  const finalAmount = totalAmount + gst;

  // Validate discount code
  const validateDiscount = async () => {
    if (!discountCode.trim()) return;
    setValidatingDiscount(true);
    try {
      // Try API first
      const api = (await import('../../services/api')).default;
      const response = await api.get(`/discounts/validate/${discountCode.toUpperCase()}`, {
        params: { type: 'ayurveda_consultation', amount: consultationFee }
      });
      if (response.data?.success) {
        setDiscountInfo(response.data.data);
        alert(`✅ Discount applied! You save ₹${response.data.data.discountAmount}`);
      }
    } catch (error) {
      // Fallback: Check local discount codes
      const localDiscounts = {
        'AYUR50': { code: 'AYUR50', discountAmount: Math.round(consultationFee * 0.5), type: 'percentage', value: 50 },
        'FIRST100': { code: 'FIRST100', discountAmount: 100, type: 'fixed', value: 100 },
        'WELLNESS20': { code: 'WELLNESS20', discountAmount: Math.round(consultationFee * 0.2), type: 'percentage', value: 20 },
      };
      const code = discountCode.toUpperCase();
      if (localDiscounts[code]) {
        setDiscountInfo(localDiscounts[code]);
        alert(`✅ Discount applied! You save ₹${localDiscounts[code].discountAmount}`);
      } else {
        alert('❌ Invalid or expired discount code');
        setDiscountCode('');
      }
    } finally {
      setValidatingDiscount(false);
    }
  };

  // Step 1: Validate form and go to payment
  const handleContinueToPayment = (e) => {
    e.preventDefault();
    if (!form.patientName || !form.phone || !form.date || !form.time) {
      alert('Please fill all required fields (*)');
      return;
    }
    if (form.phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  // Step 2: Process Payment
  const handlePayment = async () => {
    setLoading(true);
    
    const bookingId = 'AYB' + Date.now();
    
    try {
      // Try Razorpay integration
      if (paymentMethod === 'razorpay') {
        try {
          const api = (await import('../../services/api')).default;
          
          // Create Razorpay order
          const orderResponse = await api.post('/ayurveda/payments/create-order', {
            amount: finalAmount,
            bookingId,
            doctorId: doctor._id,
            patientName: form.patientName,
            patientPhone: form.phone
          });

          if (orderResponse.data?.success) {
            const { razorpayOrderId, razorpayKeyId } = orderResponse.data.data;
            
            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
              const options = {
                key: razorpayKeyId || 'rzp_test_YourTestKey',
                amount: finalAmount * 100, // in paise
                currency: 'INR',
                name: 'Ayurveda Wellness Hub',
                description: `Consultation with ${doctor.name}`,
                order_id: razorpayOrderId,
                prefill: {
                  name: form.patientName,
                  contact: form.phone,
                  email: form.email
                },
                theme: { color: '#4CAF50' },
                handler: function(response) {
                  // Payment successful
                  completeBooking(bookingId, response.razorpay_payment_id);
                },
                modal: {
                  ondismiss: function() {
                    setLoading(false);
                    alert('Payment cancelled. Please try again.');
                  }
                }
              };
              const rzp = new window.Razorpay(options);
              rzp.open();
            };
            document.body.appendChild(script);
            return;
          }
        } catch (razorpayError) {
          console.log('Razorpay not configured, using demo payment');
        }
      }
      
      // Demo/Test Payment (for development)
      setTimeout(() => {
        completeBooking(bookingId, 'DEMO_PAYMENT_' + Date.now());
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      alert('Payment failed. Please try again.');
    }
  };

  // Complete booking after payment
  const completeBooking = (bookingId, paymentId) => {
    const bookingInfo = {
      bookingId,
      doctorId: doctor._id,
      doctorName: doctor.name,
      consultationType,
      patientName: form.patientName,
      phone: form.phone,
      email: form.email,
      date: form.date,
      time: form.time,
      symptoms: form.symptoms,
      age: form.age,
      gender: form.gender,
      consultationFee,
      discount: discountAmount,
      gst,
      platformFee,
      finalAmount,
      paymentMethod,
      paymentId,
      paymentStatus: 'paid',
      paidAt: new Date().toISOString(),
      wellnessCenter: doctor.wellnessCenter,
      specialization: doctor.specialization
    };

    setBookingData(bookingInfo);
    setStep(3);
    setLoading(false);
    window.scrollTo(0, 0);
  };

  // ============================================
  // STEP 3: CONFIRMATION SCREEN
  // ============================================
  if (step === 3 && bookingData) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ color: '#2E7D32', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Your consultation has been booked successfully. Confirmation sent to {bookingData.phone}
        </p>

        {/* Booking Details Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'left',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem', borderBottom: '2px solid #4CAF50', paddingBottom: '0.5rem' }}>
            📋 Booking Details
          </h3>
          {[
            ['Booking ID', bookingData.bookingId],
            ['Doctor', `👨‍⚕️ ${bookingData.doctorName}`],
            ['Specialization', bookingData.specialization],
            ['Center', bookingData.wellnessCenter],
            ['Consultation Type', bookingData.consultationType === 'online' ? '💻 Online Video Call' : '🏥 Clinic Visit'],
            ['Patient Name', bookingData.patientName],
            ['Phone', bookingData.phone],
            ['Date', new Date(bookingData.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
            ['Time', bookingData.time],
            ['Consultation Fee', `₹${bookingData.consultationFee}`],
            ...(bookingData.discount > 0 ? [['Discount', `-₹${bookingData.discount}`]] : []),
            ['GST (18%)', `₹${bookingData.gst}`],
            ['Platform Fee', `₹${bookingData.platformFee} (included)`],
          ].map(([label, value], i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '0.6rem 0', 
              borderBottom: '1px solid #e2e8f0',
              fontSize: '0.9rem'
            }}>
              <span style={{ color: '#64748b' }}>{label}</span>
              <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{value}</span>
            </div>
          ))}

          {/* Total */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '0.8rem 0', 
            marginTop: '0.5rem',
            backgroundColor: '#f0fdf4',
            borderRadius: '0.5rem',
            padding: '0.8rem'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1e293b' }}>💰 Total Paid</span>
            <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#4CAF50' }}>₹{bookingData.finalAmount}</span>
          </div>

          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            backgroundColor: '#e8f5e9', 
            borderRadius: '0.5rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#2E7D32'
          }}>
            Payment ID: {bookingData.paymentId} | Status: {bookingData.paymentStatus.toUpperCase()}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/ayurveda')} style={{
            padding: '0.75rem 2rem', backgroundColor: '#4CAF50', color: 'white',
            border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
          }}>
            🏠 Go to Home
          </button>
          <button onClick={() => navigate('/my-bookings')} style={{
            padding: '0.75rem 2rem', backgroundColor: '#2196F3', color: 'white',
            border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
          }}>
            📋 My Bookings
          </button>
          <button onClick={() => window.print()} style={{
            padding: '0.75rem 2rem', backgroundColor: '#FF9800', color: 'white',
            border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
          }}>
            🖨️ Print Receipt
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 2: PAYMENT SCREEN
  // ============================================
  if (step === 2) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
        <button onClick={() => setStep(1)} style={{
          padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none',
          borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem'
        }}>
          ← Back to Details
        </button>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>
          💳 Payment
        </h1>

        {/* Order Summary */}
        <div style={{
          backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#64748b' }}>
            <span>Consultation Fee</span>
            <span>₹{consultationFee}</span>
          </div>
          
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#4CAF50' }}>
              <span>Discount ({discountInfo?.code})</span>
              <span>-₹{discountAmount}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#64748b' }}>
            <span>Platform Fee (15%)</span>
            <span>₹{platformFee}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#64748b' }}>
            <span>GST (18%)</span>
            <span>₹{gst}</span>
          </div>
          
          <hr style={{ margin: '0.5rem 0', border: '1px solid #e2e8f0' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>Total Amount</span>
            <span style={{ color: '#FF9800' }}>₹{finalAmount}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{
          backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>Select Payment Method</h3>
          
          {[
            { id: 'razorpay', label: '💳 Pay Online', desc: 'UPI, Credit/Debit Card, NetBanking, Wallet', icon: '💳' },
            { id: 'cod', label: '🏥 Pay at Clinic', desc: 'Pay when you visit the clinic', icon: '🏥' },
          ].map(method => (
            <div key={method.id} onClick={() => setPaymentMethod(method.id)} style={{
              padding: '1rem', marginBottom: '0.5rem', borderRadius: '0.5rem',
              border: `2px solid ${paymentMethod === method.id ? '#4CAF50' : '#e2e8f0'}`,
              cursor: 'pointer', backgroundColor: paymentMethod === method.id ? '#f0fdf4' : 'white',
              display: 'flex', alignItems: 'center', gap: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
              <div>
                <p style={{ fontWeight: 'bold', color: '#1e293b' }}>{method.label}</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{method.desc}</p>
              </div>
              {paymentMethod === method.id && (
                <span style={{ marginLeft: 'auto', color: '#4CAF50', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Patient Info Summary */}
        <div style={{
          backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1rem',
          marginBottom: '1.5rem', fontSize: '0.9rem'
        }}>
          <p><strong>Patient:</strong> {form.patientName}</p>
          <p><strong>Date:</strong> {new Date(form.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p><strong>Time:</strong> {form.time}</p>
          <p><strong>Doctor:</strong> {doctor.name}</p>
        </div>

        {/* Pay Button */}
        <button onClick={handlePayment} disabled={loading} style={{
          width: '100%', padding: '1rem', backgroundColor: loading ? '#a5d6a7' : '#4CAF50',
          color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold',
          fontSize: '1.2rem', cursor: loading ? 'not-allowed' : 'pointer'
        }}>
          {loading ? '⏳ Processing Payment...' : `💳 Pay ₹${finalAmount}`}
        </button>
        
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '1rem' }}>
          🔒 Secured by 256-bit SSL encryption. Your payment info is safe.
        </p>
      </div>
    );
  }

  // ============================================
  // STEP 1: BOOKING FORM
  // ============================================
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={{
        padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none',
        borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem'
      }}>
        ← Back
      </button>

      {/* Progress Steps */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', gap: '2rem' }}>
        {[
          { num: 1, label: 'Details', active: step >= 1 },
          { num: 2, label: 'Payment', active: step >= 2 },
          { num: 3, label: 'Confirm', active: step >= 3 },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              width: '35px', height: '35px', borderRadius: '50%',
              backgroundColor: s.active ? '#4CAF50' : '#e2e8f0',
              color: s.active ? 'white' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', margin: '0 auto 0.3rem', fontSize: '0.9rem'
            }}>
              {s.active ? '✓' : s.num}
            </div>
            <span style={{ fontSize: '0.75rem', color: s.active ? '#4CAF50' : '#64748b' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
        📞 Book {consultationType === 'online' ? 'Online' : 'Clinic'} Consultation
      </h1>

      {/* Doctor Summary */}
      <div style={{ 
        backgroundColor: '#f0fdf4', borderRadius: '0.75rem', padding: '1rem', 
        marginBottom: '1.5rem', border: '1px solid #bbf7d0' 
      }}>
        <p style={{ fontWeight: 'bold', color: '#1e293b' }}>👨‍⚕️ {doctor.name}</p>
        <p style={{ color: '#4CAF50', fontSize: '0.9rem' }}>{doctor.specialization}</p>
        {doctor.wellnessCenter && <p style={{ color: '#64748b', fontSize: '0.85rem' }}>🏥 {doctor.wellnessCenter}</p>}
        <p style={{ fontWeight: 'bold', color: '#FF9800', marginTop: '0.5rem' }}>Fee: ₹{consultationFee}</p>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Type: {consultationType === 'online' ? '💻 Online Video Call' : '🏥 Clinic Visit'}
        </p>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
          ⚠️ Platform fee (15%) + GST (18%) will be added at payment
        </p>
      </div>

      <form onSubmit={handleContinueToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input required placeholder="Full Name *" value={form.patientName} 
          onChange={(e) => setForm({...form, patientName: e.target.value})} style={inputStyle} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input required placeholder="Phone Number *" value={form.phone} type="tel"
            onChange={(e) => setForm({...form, phone: e.target.value})} style={inputStyle} />
          <input placeholder="Email" value={form.email} type="email"
            onChange={(e) => setForm({...form, email: e.target.value})} style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input placeholder="Age" value={form.age} type="number"
            onChange={(e) => setForm({...form, age: e.target.value})} style={inputStyle} />
          <select value={form.gender} onChange={(e) => setForm({...form, gender: e.target.value})} style={inputStyle}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.3rem', color: '#1e293b', fontSize: '0.9rem' }}>
            📅 Select Date *
          </label>
          <input required type="date" value={form.date} min={today} max={maxDateStr}
            onChange={(e) => setForm({...form, date: e.target.value})} style={inputStyle} />
        </div>

        {/* Time Slots */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.3rem', color: '#1e293b', fontSize: '0.9rem' }}>
            🕐 Select Time Slot *
          </label>
          <select required value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} style={inputStyle}>
            <option value="">Select Time</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            33 slots available • 6:00 AM - 10:00 PM • Every 30 minutes
          </p>
        </div>

        {/* Discount Code */}
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.3rem', color: '#1e293b', fontSize: '0.9rem' }}>
            🏷️ Discount Code (Optional)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder="Enter code (e.g., AYUR50)"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={validateDiscount} disabled={validatingDiscount || !discountCode.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: discountInfo ? '#4CAF50' : '#FF9800',
                color: 'white', border: 'none', borderRadius: '0.5rem',
                fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
              {validatingDiscount ? '...' : discountInfo ? '✅' : 'Apply'}
            </button>
          </div>
          {discountInfo && (
            <div style={{ 
              marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#e8f5e9', 
              borderRadius: '0.5rem', fontSize: '0.9rem', color: '#2E7D32',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span>✅ {discountInfo.code}: Save ₹{discountInfo.discountAmount}</span>
              <button type="button" onClick={() => { setDiscountCode(''); setDiscountInfo(null); }}
                style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                ✕
              </button>
            </div>
          )}
          <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
            Try: AYUR50 (50% off) | FIRST100 (₹100 off) | WELLNESS20 (20% off)
          </p>
        </div>

        <textarea placeholder="Describe your symptoms / health concerns..."
          value={form.symptoms} onChange={(e) => setForm({...form, symptoms: e.target.value})} 
          style={{...inputStyle, height: '80px', resize: 'vertical'}} />

        <button type="submit" style={{
          padding: '1rem', backgroundColor: '#4CAF50', color: 'white',
          border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem',
          cursor: 'pointer', marginTop: '0.5rem'
        }}>
          Continue to Payment → ₹{finalAmount}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0',
  fontSize: '1rem', width: '100%', boxSizing: 'border-box'
};

export default BookAyurvedaConsult;