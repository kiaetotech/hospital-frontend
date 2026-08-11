import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const HospitalRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [form, setForm] = useState({
    name: '', type: 'private', phone: '', email: '',
    password: '', confirmPassword: '', city: '', state: '', address: '', website: ''
  });

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSendOTP = async () => {
    if (!form.phone || form.phone.length !== 10) return setError('Valid 10-digit phone required');
    if (!form.name || !form.email || !form.password) return setError('Fill all required fields');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password min 8 characters');
    setLoading(true); setError('');
    try {
      await api.post('/otp/send', { phone: form.phone, type: 'login' });
      setStep(2); setSuccess('OTP sent!');
      setResendTimer(30);
      const t = setInterval(() => setResendTimer(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) return setError('Enter valid OTP');
    setLoading(true); setError('');
    try {
      await api.post('/otp/verify', { phone: form.phone, otp, type: 'login' });
      setStep(3); setSuccess('Phone verified!');
    } catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/hospitals/provider/register', {
        name: form.name,
        type: form.type,
        contact: { phone: form.phone, email: form.email },
        password: form.password,
        address: { city: form.city, state: form.state, line1: form.address || '', country: 'India' },
        website: form.website || ''
      });
      setStep(4); setTimeout(() => navigate('/hospital/login'), 2000);
    } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const s = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { background: 'white', borderRadius: '20px', padding: '30px', maxWidth: '500px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
    inp: { width: '100%', padding: '12px 14px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    lbl: { display: 'block', fontWeight: '600', fontSize: '12px', marginBottom: '4px', color: '#333' },
    btn: { width: '100%', padding: '13px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
  };

  const StepCircle = ({ n, label, active, done }) => (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontWeight: '700', fontSize: '14px', background: done ? '#4caf50' : active ? '#1976d2' : '#e0e0e0', color: done || active ? 'white' : '#999' }}>{done ? '✓' : n}</div>
      <div style={{ fontSize: '10px', color: active ? '#1976d2' : '#999' }}>{label}</div>
    </div>
  );

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '40px' }}>🏥</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '4px 0' }}>Register Hospital</h2>
          <p style={{ color: '#666', fontSize: '13px' }}>Free registration. Add details later from dashboard.</p>
        </div>
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <StepCircle n={1} label="Details" active={step===1} done={step>1} /><div style={{ width: '30px', height: '2px', background: step>1?'#4caf50':'#e0e0e0', alignSelf: 'center', marginTop: '-16px' }} />
          <StepCircle n={2} label="Verify" active={step===2} done={step>2} /><div style={{ width: '30px', height: '2px', background: step>2?'#4caf50':'#e0e0e0', alignSelf: 'center', marginTop: '-16px' }} />
          <StepCircle n={3} label="Confirm" active={step===3} done={step>3} /><div style={{ width: '30px', height: '2px', background: step>3?'#4caf50':'#e0e0e0', alignSelf: 'center', marginTop: '-16px' }} />
          <StepCircle n={4} label="Done" active={step===4} done={false} />
        </div>
        {error && <div style={{ background: '#fff0f0', color: '#d32f2f', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>❌ {error}</div>}
        {success && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>✅ {success}</div>}

        {step === 1 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ gridColumn: 'span 2' }}><label style={s.lbl}>Hospital Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="Apollo Hospital" style={s.inp} /></div>
              <div><label style={s.lbl}>Type</label><select name="type" value={form.type} onChange={handleChange} style={s.inp}><option value="private">Private</option><option value="government">Government</option><option value="trust">Trust/Charitable</option><option value="corporate">Corporate Chain</option></select></div>
              <div><label style={s.lbl}>Ownership</label><select name="ownership" value={form.ownership} onChange={handleChange} style={s.inp}><option value="private">Private</option><option value="government">Government</option><option value="trust">Trust</option></select></div>
              <div style={{ gridColumn: 'span 2' }}><label style={s.lbl}>Phone * (10 digits)</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" maxLength={10} style={s.inp} /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={s.lbl}>Email *</label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="hospital@email.com" style={s.inp} /></div>
              <div><label style={s.lbl}>City *</label><input name="city" value={form.city} onChange={handleChange} placeholder="Enter your city" style={s.inp} /></div>
              <div><label style={s.lbl}>State *</label><input name="state" value={form.state} onChange={handleChange} placeholder="Enter your state" style={s.inp} /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={s.lbl}>Website</label><input name="website" value={form.website} onChange={handleChange} placeholder="https://..." style={s.inp} /></div>
              <div><label style={s.lbl}>Password * (min 8)</label><input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters" style={s.inp} /></div>
              <div><label style={s.lbl}>Confirm *</label><input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter" style={s.inp} /></div>
            </div>
            <button onClick={handleSendOTP} disabled={loading} style={{ ...s.btn, marginTop: '16px', background: loading ? '#ccc' : '#1976d2' }}>{loading ? 'Sending...' : '📱 Send OTP'}</button>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>📱</div><h3>Verify Phone</h3><p style={{ color: '#666', fontSize: '13px' }}>OTP sent to +91 {form.phone}</p>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="Enter OTP" style={{ ...s.inp, textAlign: 'center', fontSize: '20px', letterSpacing: '6px', fontWeight: '700', width: '200px', margin: '0 auto 16px', display: 'block' }} />
            <button onClick={handleVerifyOTP} disabled={loading || otp.length < 4} style={{ ...s.btn, background: loading ? '#ccc' : '#4caf50', marginBottom: '10px' }}>{loading ? 'Verifying...' : '✅ Verify'}</button>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {resendTimer > 0 ? <span>Resend in {resendTimer}s</span> : <button onClick={handleSendOTP} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer' }}>Resend OTP</button>}
              <span style={{ margin: '0 8px' }}>|</span><button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>Edit</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>📋</div><h3>Confirm</h3>
            <div style={{ background: '#f5f5f5', borderRadius: '10px', padding: '16px', textAlign: 'left', margin: '16px 0' }}>
              <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>Hospital:</strong> {form.name}</p>
              <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>Phone:</strong> +91 {form.phone} ✅</p>
              <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>Email:</strong> {form.email}</p>
              <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>City:</strong> {form.city}, {form.state}</p>
            </div>
            <button onClick={handleRegister} disabled={loading} style={{ ...s.btn, background: loading ? '#ccc' : '#1976d2' }}>{loading ? 'Registering...' : '🏥 Complete Registration'}</button>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px' }}>🎉</div><h3 style={{ color: '#4caf50' }}>Done!</h3>
            <button onClick={() => navigate('/hospital/login')} style={{ ...s.btn, background: '#1976d2', marginTop: '12px' }}>Go to Login →</button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f0f0f0', fontSize: '13px', color: '#666' }}>
          Already registered? <Link to="/hospital/login" style={{ color: '#1976d2', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default HospitalRegister;
