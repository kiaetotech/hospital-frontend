import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const BookHomeopathyConsult = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Doctor passed via navigation state OR fetched by ID
  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [consultationType, setConsultationType] = useState(location.state?.consultationType || 'online');

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    patientName: '', phone: '', email: '', age: '', gender: '',
    date: '', time: '', symptoms: ''
  });
  const [slotList, setSlotList] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);

  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState('');

  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const token = localStorage.getItem('patientToken') || localStorage.getItem('token');

  const today = new Date().toISOString().split('T')[0];

  // ============================================
  // AUTH GUARD
  // ============================================
  useEffect(() => {
    if (!token) {
      navigate(`/login?redirect=/homeopathy/book/${doctorId}`);
    }
  }, [token, doctorId, navigate]);

  // ============================================
  // FETCH DOCTOR IF NOT IN STATE
  // ============================================
  useEffect(() => {
    if (!doctor && doctorId) {
      (async () => {
        try {
          const res = await api.get(`/homeopathy/doctors/${doctorId}`);
          if (res.data?.success) setDoctor(res.data.data);
        } catch (err) {
          console.error('Doctor fetch error:', err);
        }
      })();
    }
  }, [doctor, doctorId]);

  // ============================================
  // FETCH AVAILABLE SLOTS WHEN DATE CHANGES
  // ============================================
  useEffect(() => {
    if (!form.date || !doctorId) {
      setSlotList([]);
      return;
    }
    setSlotLoading(true);
    api.get(`/homeopathy/doctor/${doctorId}/slots?date=${form.date}`)
      .then(res => {
        const slots = res.data?.data?.slots || [];
        setSlotList(slots.filter(s => s.available !== false).map(s => s.startTime));
      })
      .catch(() => setSlotList([]))
      .finally(() => setSlotLoading(false));
  }, [form.date, doctorId]);

  // ============================================
  // FETCH PRICING WHEN STEP 2 IS REACHED
  // ============================================
  useEffect(() => {
    if (step !== 2 || !doctor) return;
    const amount = doctor.consultationFee || 500;
    setPricingLoading(true);
    api.post('/homeopathy/bookings/pricing-preview', {
      bookingType: 'homeopathy_consult',
      amount,
      discountAmount,
      providerId: doctorId,
      providerModel: 'HomeopathyDoctor',
      city: doctor.address?.city,
      state: doctor.address?.state
    })
      .then(res => {
        if (res.data?.success) setPricing(res.data.data);
      })
      .catch(err => {
        console.error('Pricing preview error:', err);
        setPricing(null);
      })
      .finally(() => setPricingLoading(false));
  }, [step, doctor, discountAmount, doctorId]);

  // ============================================
  // RESEND OTP COOLDOWN
  // ============================================
  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  // ============================================
  // VALIDATE DISCOUNT (via server, when creating booking)
  // Just clear stale state — real validation happens on submit
  // ============================================
  const applyDiscountCode = () => {
    setDiscountMessage('Code will be validated on booking');
    // We don't know the discount without the server — the pricing preview
    // will re-run when the booking is created. For UX, we optimistically
    // show a "will be applied" message.
  };

  // ============================================
  // STEP NAVIGATION
  // ============================================
  const handleContinue = (e) => {
    e.preventDefault();
    if (!form.patientName || !form.phone || !form.date || !form.time) {
      alert('Please fill all required fields');
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  // ============================================
  // RAZORPAY SCRIPT LOADER
  // ============================================
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ============================================
  // CREATE BOOKING → OPEN RAZORPAY → VERIFY
  // ============================================
  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create booking on backend
      const createRes = await api.post('/homeopathy/bookings/create', {
        type: 'homeopathy_consult',
        doctorId,
        consultationType,
        bookingDate: form.date,
        slotTime: form.time,
        symptoms: form.symptoms,
        patientName: form.patientName,
        patientPhone: form.phone,
        patientEmail: form.email,
        patientAge: form.age ? parseInt(form.age) : null,
        patientGender: form.gender,
        discountCode: discountCode || undefined
      });

      if (!createRes.data?.success) {
        throw new Error(createRes.data?.message || 'Failed to create booking');
      }

      const { bookingId, razorpayOrderId, razorpayKeyId, amount, otp: bookingOtp } = createRes.data.data;
      setBookingData({ bookingId, amount, otp: bookingOtp });

      // 2. Load Razorpay
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) {
        alert('Failed to load payment gateway. Please try again.');
        setLoading(false);
        return;
      }

      // 3. Open Razorpay checkout
      const options = {
        key: razorpayKeyId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'KiaetoCare',
        description: `Homeopathy Consultation - Dr ${doctor.name}`,
        order_id: razorpayOrderId,
        prefill: {
          name: form.patientName,
          email: form.email || '',
          contact: form.phone
        },
        theme: { color: '#7c3aed' },
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/homeopathy/bookings/verify-payment', {
              bookingId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyRes.data?.success) {
              setStep(3);
              window.scrollTo(0, 0);
            } else {
              alert('Payment verification failed: ' + (verifyRes.data?.message || 'Unknown error'));
            }
          } catch (err) {
            console.error('Verify error:', err);
            alert(err.response?.data?.message || 'Payment verification failed. Contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Booking create error:', err);
      alert(err.response?.data?.message || err.message || 'Booking failed');
      setLoading(false);
    }
  };

  // ============================================
  // VERIFY OTP
  // ============================================
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setOtpError('Enter the 4-digit OTP');
      return;
    }
    setLoading(true);
    setOtpError('');
    try {
      const res = await api.post('/homeopathy/bookings/verify-otp', {
        bookingId: bookingData.bookingId,
        otp
      });
      if (res.data?.success) {
        setStep(4);
      } else {
        setOtpError(res.data?.message || 'Invalid OTP');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.post('/homeopathy/bookings/resend-otp', { bookingId: bookingData.bookingId });
      setResendCooldown(30);
    } catch (err) {
      alert('Failed to resend OTP');
    }
  };

  // ============================================
  // RENDER: STEP 4 — CONFIRMED
  // ============================================
  if (step === 4 && bookingData) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '5rem' }}>✅</div>
        <h1 style={{ color: '#059669' }}>Booking Confirmed!</h1>
        <p style={{ color: '#64748b' }}>A confirmation has been sent to {form.phone}</p>
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'left', margin: '1.5rem 0' }}>
          {[
            ['Booking ID', bookingData.bookingId],
            ['Doctor', doctor?.name],
            ['Type', consultationType === 'online' ? '💻 Online' : '🏥 Clinic'],
            ['Patient', form.patientName],
            ['Date', new Date(form.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
            ['Time', form.time],
            ['Total Paid', `₹${bookingData.amount}`]
          ].map(([l, v], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: '#64748b' }}>{l}</span>
              <span style={{ fontWeight: 'bold' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/homeopathy')} style={{ padding: '0.75rem 2rem', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>🏠 Home</button>
          <button onClick={() => navigate('/homeopathy/my-bookings')} style={{ padding: '0.75rem 2rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>📋 My Bookings</button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: STEP 3 — OTP
  // ============================================
  if (step === 3 && bookingData) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔐</div>
          <h2 style={{ color: '#7C3AED', marginTop: 0 }}>Verify OTP</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Enter the 4-digit OTP sent to {form.phone}
          </p>
          <p style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 'bold' }}>
            Booking {bookingData.bookingId} • Paid ₹{bookingData.amount}
          </p>

          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            placeholder="----"
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '2rem',
              letterSpacing: '1rem',
              textAlign: 'center',
              borderRadius: '0.75rem',
              border: '2px solid #e2e8f0',
              marginTop: '1rem',
              marginBottom: '1rem',
              boxSizing: 'border-box'
            }}
          />

          {otpError && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{otpError}</p>}

          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length < 4}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: loading || otp.length < 4 ? '#a5b4fc' : '#7C3AED',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading || otp.length < 4 ? 'not-allowed' : 'pointer'
            }}>
            {loading ? 'Verifying...' : 'Confirm Booking'}
          </button>

          <button
            onClick={handleResendOtp}
            disabled={resendCooldown > 0}
            style={{ marginTop: '1rem', background: 'none', border: 'none', color: resendCooldown > 0 ? '#94a3b8' : '#7C3AED', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: STEP 2 — PAYMENT REVIEW
  // ============================================
  if (step === 2) {
    const baseAmount = doctor?.consultationFee || 500;
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
        <button onClick={() => setStep(1)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>← Back</button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>💳 Payment</h1>

        <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Order Summary</h3>
          {pricingLoading ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Calculating...</p>
          ) : pricing ? (
            <>
              <Row label="Consultation Fee" value={`₹${pricing.baseAmount}`} />
              {pricing.discountAmount > 0 && <Row label="Discount" value={`-₹${pricing.discountAmount}`} color="#059669" />}
              <Row label={`Platform Fee`} value={`₹${pricing.platformFee}`} />
              <Row label={`GST (${pricing.gstPercentage}%)`} value={`₹${pricing.gstAmount}`} />
              <hr />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontWeight: 'bold', fontSize: '1.2rem' }}>
                <span>Total</span>
                <span style={{ color: '#7C3AED' }}>₹{pricing.total}</span>
              </div>
            </>
          ) : (
            <p style={{ color: '#dc2626', fontSize: '0.9rem' }}>
              Unable to load pricing. Admin may not have configured Homeopathy pricing yet.
            </p>
          )}
        </div>

        <div style={{ backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <p style={{ margin: '0.25rem 0' }}><strong>Patient:</strong> {form.patientName}</p>
          <p style={{ margin: '0.25rem 0' }}><strong>Date:</strong> {new Date(form.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <p style={{ margin: '0.25rem 0' }}><strong>Time:</strong> {form.time}</p>
          <p style={{ margin: '0.25rem 0' }}><strong>Doctor:</strong> {doctor?.name}</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || !pricing}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: loading || !pricing ? '#a5b4fc' : '#7C3AED',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: loading || !pricing ? 'not-allowed' : 'pointer'
          }}>
          {loading ? '⏳ Processing...' : `💳 Pay ₹${pricing?.total || 0}`}
        </button>
      </div>
    );
  }

  // ============================================
  // RENDER: STEP 1 — DETAILS
  // ============================================
  const fee = doctor?.consultationFee || 500;
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem' }}>
      <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>← Back</button>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ textAlign: 'center' }}>
            <div style={{
              width: '35px', height: '35px', borderRadius: '50%',
              backgroundColor: step >= s ? '#7C3AED' : '#e2e8f0',
              color: step >= s ? 'white' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', margin: '0 auto 0.3rem'
            }}>
              {step > s ? '✓' : s}
            </div>
            <span style={{ fontSize: '0.75rem', color: step >= s ? '#7C3AED' : '#64748b' }}>
              {s === 1 ? 'Details' : s === 2 ? 'Payment' : 'Confirm'}
            </span>
          </div>
        ))}
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
        📞 Book {consultationType === 'online' ? 'Online' : 'Clinic'} Consultation
      </h1>

      <div style={{ backgroundColor: '#ede9fe', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', margin: 0 }}>👨‍⚕️ {doctor?.name}</p>
        <p style={{ color: '#7C3AED', fontSize: '0.9rem', margin: '0.25rem 0' }}>{doctor?.specialization}</p>
        {doctor?.clinicName && <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0' }}>🏥 {doctor.clinicName}</p>}
        <p style={{ fontWeight: 'bold', color: '#7C3AED', marginTop: '0.5rem', marginBottom: 0 }}>Fee: ₹{fee}</p>
      </div>

      {/* Consultation type toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {doctor?.consultationTypes?.online && (
          <button
            type="button"
            onClick={() => setConsultationType('online')}
            style={{
              flex: 1, padding: '0.6rem',
              backgroundColor: consultationType === 'online' ? '#7C3AED' : '#f1f5f9',
              color: consultationType === 'online' ? 'white' : '#334155',
              border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'
            }}>
            💻 Online
          </button>
        )}
        {doctor?.consultationTypes?.clinic && (
          <button
            type="button"
            onClick={() => setConsultationType('clinic')}
            style={{
              flex: 1, padding: '0.6rem',
              backgroundColor: consultationType === 'clinic' ? '#059669' : '#f1f5f9',
              color: consultationType === 'clinic' ? 'white' : '#334155',
              border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem'
            }}>
            🏥 Clinic
          </button>
        )}
      </div>

      <form onSubmit={handleContinue} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input required placeholder="Full Name *" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} style={inp} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input required placeholder="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} style={inp} />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inp} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input placeholder="Age" value={form.age} onChange={e => setForm({ ...form, age: e.target.value.replace(/\D/g, '').slice(0, 3) })} style={inp} />
          <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} style={inp}>
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label style={lbl}>📅 Date *</label>
          <input required type="date" value={form.date} min={today} onChange={e => setForm({ ...form, date: e.target.value })} style={inp} />
        </div>
        <div>
          <label style={lbl}>🕐 Time *</label>
          {slotLoading ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading available slots...</p>
          ) : form.date && slotList.length === 0 ? (
            <p style={{ color: '#dc2626', fontSize: '0.85rem' }}>No slots available for this date. Pick another day.</p>
          ) : (
            <select required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={inp} disabled={!form.date}>
              <option value="">{form.date ? 'Select Time' : 'Pick a date first'}</option>
              {slotList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>
        <div>
          <label style={lbl}>🏷️ Discount Code (optional)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              placeholder="e.g. FIRST100"
              value={discountCode}
              onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountMessage(''); }}
              style={{ ...inp, flex: 1, marginBottom: 0 }}
            />
            <button
              type="button"
              onClick={applyDiscountCode}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Apply
            </button>
          </div>
          {discountMessage && <p style={{ color: '#059669', fontSize: '0.8rem', marginTop: '0.3rem' }}>{discountMessage}</p>}
        </div>
        <textarea placeholder="Describe your symptoms / health concerns..." value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} style={{ ...inp, height: '80px', resize: 'vertical' }} />
        <button type="submit" style={{ padding: '1rem', backgroundColor: '#7C3AED', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
          Continue to Payment →
        </button>
      </form>
    </div>
  );
};

const inp = { padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '1rem', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' };
const lbl = { fontWeight: 'bold', display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem' };

const Row = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: color || '#64748b' }}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default BookHomeopathyConsult;