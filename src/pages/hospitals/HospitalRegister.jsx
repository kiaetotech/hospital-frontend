import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

// City-State JSON data (top 100 Indian cities)
const CITY_DATA = [
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Delhi", state: "Delhi" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Lucknow", state: "Uttar Pradesh" },
  { city: "Nagpur", state: "Maharashtra" },
  { city: "Indore", state: "Madhya Pradesh" },
  { city: "Bhopal", state: "Madhya Pradesh" },
  { city: "Ludhiana", state: "Punjab" },
  { city: "Patna", state: "Bihar" },
  { city: "Vadodara", state: "Gujarat" },
  { city: "Agra", state: "Uttar Pradesh" },
  { city: "Thane", state: "Maharashtra" },
  { city: "Nashik", state: "Maharashtra" },
  { city: "Faridabad", state: "Haryana" },
  { city: "Meerut", state: "Uttar Pradesh" },
  { city: "Rajkot", state: "Gujarat" },
  { city: "Varanasi", state: "Uttar Pradesh" },
  { city: "Srinagar", state: "Jammu & Kashmir" },
  { city: "Aurangabad", state: "Maharashtra" },
  { city: "Dhanbad", state: "Jharkhand" },
  { city: "Amritsar", state: "Punjab" },
  { city: "Allahabad", state: "Uttar Pradesh" },
  { city: "Ranchi", state: "Jharkhand" },
  { city: "Jodhpur", state: "Rajasthan" },
  { city: "Coimbatore", state: "Tamil Nadu" },
  { city: "Vijayawada", state: "Andhra Pradesh" },
  { city: "Visakhapatnam", state: "Andhra Pradesh" },
  { city: "Chandigarh", state: "Chandigarh" },
  { city: "Guwahati", state: "Assam" },
  { city: "Mysore", state: "Karnataka" },
  { city: "Mangalore", state: "Karnataka" },
  { city: "Kochi", state: "Kerala" },
  { city: "Thiruvananthapuram", state: "Kerala" },
  { city: "Kozhikode", state: "Kerala" },
  { city: "Bhubaneswar", state: "Odisha" },
  { city: "Cuttack", state: "Odisha" },
  { city: "Raipur", state: "Chhattisgarh" },
  { city: "Jabalpur", state: "Madhya Pradesh" },
  { city: "Gwalior", state: "Madhya Pradesh" },
  { city: "Udaipur", state: "Rajasthan" },
  { city: "Dehradun", state: "Uttarakhand" },
  { city: "Shimla", state: "Himachal Pradesh" },
  { city: "Jammu", state: "Jammu & Kashmir" },
  { city: "Noida", state: "Uttar Pradesh" },
  { city: "Gurugram", state: "Haryana" },
  { city: "Ghaziabad", state: "Uttar Pradesh" },
  { city: "Kanpur", state: "Uttar Pradesh" },
  { city: "Surat", state: "Gujarat" },
  { city: "Goa", state: "Goa" },
  { city: "Puducherry", state: "Puducherry" },
  { city: "Siliguri", state: "West Bengal" },
  { city: "Warangal", state: "Telangana" },
  { city: "Tirupati", state: "Andhra Pradesh" },
  { city: "Madurai", state: "Tamil Nadu" },
  { city: "Salem", state: "Tamil Nadu" },
  { city: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Hubli", state: "Karnataka" },
  { city: "Belgaum", state: "Karnataka" },
  { city: "Kolhapur", state: "Maharashtra" },
  { city: "Solapur", state: "Maharashtra" },
  { city: "Nanded", state: "Maharashtra" },
  { city: "Amravati", state: "Maharashtra" },
  { city: "Sangli", state: "Maharashtra" },
  { city: "Jalgaon", state: "Maharashtra" },
  { city: "Akola", state: "Maharashtra" },
  { city: "Latur", state: "Maharashtra" },
  { city: "Ajmer", state: "Rajasthan" },
  { city: "Bikaner", state: "Rajasthan" },
  { city: "Kota", state: "Rajasthan" },
  { city: "Jhansi", state: "Uttar Pradesh" },
  { city: "Gorakhpur", state: "Uttar Pradesh" },
  { city: "Bareilly", state: "Uttar Pradesh" },
  { city: "Moradabad", state: "Uttar Pradesh" },
  { city: "Aligarh", state: "Uttar Pradesh" },
  { city: "Saharanpur", state: "Uttar Pradesh" },
  { city: "Firozabad", state: "Uttar Pradesh" },
  { city: "Mathura", state: "Uttar Pradesh" },
  { city: "Rourkela", state: "Odisha" },
  { city: "Bhilai", state: "Chhattisgarh" },
  { city: "Bilaspur", state: "Chhattisgarh" },
  { city: "Durgapur", state: "West Bengal" },
  { city: "Asansol", state: "West Bengal" },
  { city: "Jamshedpur", state: "Jharkhand" },
  { city: "Bokaro", state: "Jharkhand" },
  { city: "Tirunelveli", state: "Tamil Nadu" },
  { city: "Erode", state: "Tamil Nadu" },
  { city: "Vellore", state: "Tamil Nadu" },
  { city: "Kurnool", state: "Andhra Pradesh" },
  { city: "Rajahmundry", state: "Andhra Pradesh" },
  { city: "Kakinada", state: "Andhra Pradesh" },
  { city: "Nellore", state: "Andhra Pradesh" },
  { city: "Anantapur", state: "Andhra Pradesh" }
];

const HospitalRegister = () => {
  const navigate = useNavigate();
  
  // Steps: 1=basic, 2=otp, 3=email verify, 4=done
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // OTP states
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Email verification
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailToken, setEmailToken] = useState('');
  
  // City search
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState(CITY_DATA);
  
  // Form data
  const [form, setForm] = useState({
    name: '',
    registrationNumber: '',
    type: 'multi_specialty',
    ownership: 'private',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    address: '',
    pincode: '',
    website: '',
    establishedYear: ''
  });

  // Filter cities on search
  useEffect(() => {
    if (citySearch.length > 0) {
      setFilteredCities(CITY_DATA.filter(c => 
        c.city.toLowerCase().includes(citySearch.toLowerCase()) ||
        c.state.toLowerCase().includes(citySearch.toLowerCase())
      ));
      setShowCityDropdown(true);
    } else {
      setFilteredCities(CITY_DATA);
      setShowCityDropdown(false);
    }
  }, [citySearch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'city') {
      setCitySearch(value);
      // Auto-fill state
      const cityData = CITY_DATA.find(c => c.city.toLowerCase() === value.toLowerCase());
      if (cityData) {
        setForm(prev => ({ ...prev, state: cityData.state }));
      }
    }
  };

  const selectCity = (cityData) => {
    setForm(prev => ({ ...prev, city: cityData.city, state: cityData.state }));
    setCitySearch(cityData.city);
    setShowCityDropdown(false);
  };

  // ============================================
  // STEP 1: Send OTP
  // ============================================
  const handleSendOTP = async () => {
    if (!form.phone || form.phone.length !== 10) {
      return setError('Please enter a valid 10-digit phone number');
    }
    if (!form.name || !form.email || !form.password) {
      return setError('Please fill all required fields');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/otp/send', { 
        phone: form.phone, 
        type: 'hospital_registration' 
      });
      if (res.data.success) {
        setOtpSent(true);
        setStep(2);
        setSuccess('OTP sent to your phone');
        startResendTimer();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // STEP 2: Verify OTP
  // ============================================
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      return setError('Please enter valid OTP');
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/otp/verify', { 
        phone: form.phone, 
        otp, 
        type: 'hospital_registration' 
      });
      if (res.data.success) {
        setOtpVerified(true);
        setStep(3);
        setSuccess('Phone verified! Check your email for verification link.');
        // Send email verification
        sendEmailVerification();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Send Email Verification
  // ============================================
  const sendEmailVerification = async () => {
    try {
      const res = await api.post('/auth/send-verification-email', { 
        email: form.email,
        type: 'hospital_registration'
      });
      if (res.data?.token) {
        setEmailToken(res.data.token);
      }
    } catch (err) {
      // Silent fail — user can still register
    }
  };

  // ============================================
  // STEP 3: Complete Registration
  // ============================================
  const handleRegister = async () => {
    if (!otpVerified) {
      return setError('Please verify your phone number first');
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/hospitals/provider/register', {
        name: form.name,
        registrationNumber: form.registrationNumber,
        type: form.type,
        ownership: form.ownership,
        establishedYear: form.establishedYear,
        contact: {
          phone: form.phone,
          email: form.email,
          website: form.website
        },
        password: form.password,
        address: {
          line1: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: 'India'
        },
        phoneVerified: otpVerified,
        emailVerified: emailVerified,
        emailVerificationToken: emailToken
      });

      if (res.data.success) {
        setStep(4);
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/hospital/login'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = () => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOTP = async () => {
    try {
      await api.post('/otp/send', { phone: form.phone, type: 'hospital_registration' });
      setSuccess('OTP resent!');
      startResendTimer();
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  // ============================================
  // STYLES
  // ============================================
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '560px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    fontSize: '13px',
    marginBottom: '6px',
    color: '#333'
  };

  const btnPrimary = {
    width: '100%',
    padding: '14px',
    background: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  };

  const stepIndicator = (num, label, active, done) => (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 8px', fontWeight: '700', fontSize: '16px',
        background: done ? '#4caf50' : active ? '#1976d2' : '#e0e0e0',
        color: done || active ? 'white' : '#999'
      }}>
        {done ? '✓' : num}
      </div>
      <div style={{ fontSize: '11px', color: active ? '#1976d2' : '#999', fontWeight: active ? '600' : '400' }}>{label}</div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏥</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 6px' }}>Register Your Hospital</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Join India's largest healthcare network. Free registration.
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', marginBottom: '28px', padding: '0 20px' }}>
          {stepIndicator(1, 'Details', step === 1, step > 1)}
          <div style={{ width: '40px', height: '2px', background: step > 1 ? '#4caf50' : '#e0e0e0', alignSelf: 'center', marginTop: '-20px' }} />
          {stepIndicator(2, 'Verify Phone', step === 2, step > 2)}
          <div style={{ width: '40px', height: '2px', background: step > 2 ? '#4caf50' : '#e0e0e0', alignSelf: 'center', marginTop: '-20px' }} />
          {stepIndicator(3, 'Confirm', step === 3, step > 3)}
          <div style={{ width: '40px', height: '2px', background: step > 3 ? '#4caf50' : '#e0e0e0', alignSelf: 'center', marginTop: '-20px' }} />
          {stepIndicator(4, 'Done', step === 4, step === 4)}
        </div>

        {/* Messages */}
        {error && <div style={{ background: '#fff0f0', color: '#d32f2f', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>❌ {error}</div>}
        {success && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>✅ {success}</div>}

        {/* ============================================ */}
        {/* STEP 1: Basic Details */}
        {/* ============================================ */}
        {step === 1 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Hospital Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Apollo Hospital" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Registration Number</label>
                <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} placeholder="Medical council reg." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Established Year</label>
                <input name="establishedYear" value={form.establishedYear} onChange={handleChange} placeholder="e.g. 1995" style={inputStyle} type="number" />
              </div>
              <div>
                <label style={labelStyle}>Type *</label>
                <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                  <option value="multi_specialty">Multi-Specialty</option>
                  <option value="super_specialty">Super-Specialty</option>
                  <option value="single_specialty">Single Specialty</option>
                  <option value="general">General Hospital</option>
                  <option value="nursing_home">Nursing Home</option>
                  <option value="clinic">Clinic</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Ownership *</label>
                <select name="ownership" value={form.ownership} onChange={handleChange} style={inputStyle}>
                  <option value="private">Private</option>
                  <option value="government">Government</option>
                  <option value="trust">Trust/Charitable</option>
                  <option value="corporate">Corporate Chain</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Phone Number * (10 digits)</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" maxLength={10} style={inputStyle} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Email Address *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="hospital@example.com" style={inputStyle} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Website</label>
                <input name="website" value={form.website} onChange={handleChange} placeholder="https://www.yourhospital.com" style={inputStyle} />
              </div>
              
              {/* City with search + auto state */}
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>City *</label>
                <input name="city" value={citySearch} onChange={handleChange} onFocus={() => setShowCityDropdown(true)}
                  placeholder="Search city..." style={inputStyle} autoComplete="off" />
                {showCityDropdown && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '2px solid #e0e0e0', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', zIndex: 100 }}>
                    {filteredCities.slice(0, 20).map((c, i) => (
                      <div key={i} onClick={() => selectCity(c)}
                        style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #f0f0f0' }}
                        onMouseEnter={e => e.target.style.background = '#f5f5f5'}
                        onMouseLeave={e => e.target.style.background = 'white'}>
                        {c.city}, <span style={{ color: '#888' }}>{c.state}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>State (Auto-filled)</label>
                <input name="state" value={form.state} onChange={handleChange} placeholder="State" style={{ ...inputStyle, background: '#f5f5f5' }} readOnly />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Address</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Street, building, area" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" maxLength={6} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Password *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" style={inputStyle} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Confirm Password *</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" style={inputStyle} />
              </div>
            </div>

            <button onClick={handleSendOTP} disabled={loading}
              style={{ ...btnPrimary, marginTop: '20px', background: loading ? '#ccc' : '#1976d2' }}>
              {loading ? 'Sending OTP...' : '📱 Send OTP to Verify Phone'}
            </button>
          </div>
        )}

        {/* ============================================ */}
        {/* STEP 2: OTP Verification */}
        {/* ============================================ */}
        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <h3 style={{ marginBottom: '8px' }}>Verify Your Phone</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
              OTP sent to <strong>+91 {form.phone}</strong>
            </p>
            
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}
              placeholder="Enter 6-digit OTP"
              style={{ ...inputStyle, textAlign: 'center', fontSize: '22px', letterSpacing: '8px', fontWeight: '700', width: '250px', margin: '0 auto 20px', display: 'block' }} />
            
            <button onClick={handleVerifyOTP} disabled={loading || otp.length < 4}
              style={{ ...btnPrimary, background: loading ? '#ccc' : '#4caf50', marginBottom: '12px' }}>
              {loading ? 'Verifying...' : '✅ Verify & Continue'}
            </button>

            <div style={{ fontSize: '14px', color: '#666' }}>
              {resendTimer > 0 ? (
                <span>Resend OTP in {resendTimer}s</span>
              ) : (
                <button onClick={handleResendOTP} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontWeight: '500' }}>
                  📤 Resend OTP
                </button>
              )}
              <span style={{ margin: '0 8px' }}>|</span>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                Edit Details
              </button>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* STEP 3: Confirmation */}
        {/* ============================================ */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ marginBottom: '16px' }}>Confirm Registration</h3>
            
            <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
              <DetailRow label="Hospital" value={form.name} />
              <DetailRow label="Type" value={form.type?.replace('_', ' ')} />
              <DetailRow label="Phone" value={`+91 ${form.phone}`} verified={otpVerified} />
              <DetailRow label="Email" value={form.email} verified={emailVerified} />
              <DetailRow label="City" value={`${form.city}, ${form.state}`} />
              {form.website && <DetailRow label="Website" value={form.website} />}
            </div>

            <button onClick={handleRegister} disabled={loading}
              style={{ ...btnPrimary, background: loading ? '#ccc' : '#1976d2' }}>
              {loading ? 'Registering...' : '🏥 Complete Registration'}
            </button>

            <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
              After registration, you can add doctors, beds, pricing and more from your dashboard.
            </p>
          </div>
        )}

        {/* ============================================ */}
        {/* STEP 4: Done */}
        {/* ============================================ */}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ color: '#4caf50', marginBottom: '8px' }}>Registration Successful!</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
              Your hospital has been registered. Redirecting to login...
            </p>
            <button onClick={() => navigate('/hospital/login')} style={btnPrimary}>
              Go to Login →
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', fontSize: '14px', color: '#666' }}>
          Already registered? <Link to="/hospital/login" style={{ color: '#1976d2', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, verified }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e0e0', fontSize: '14px' }}>
    <span style={{ color: '#666' }}>{label}</span>
    <span style={{ fontWeight: '500' }}>
      {value || '—'}
      {verified !== undefined && (verified ? <span style={{ color: '#4caf50', marginLeft: '6px' }}>✅</span> : <span style={{ color: '#ff9800', marginLeft: '6px' }}>⏳</span>)}
    </span>
  </div>
);

export default HospitalRegister;