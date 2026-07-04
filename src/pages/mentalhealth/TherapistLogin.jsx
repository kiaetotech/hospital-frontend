import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const TherapistLogin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('email');
  const [form, setForm] = useState({ email: '', phone: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => { if (otpCountdown > 0) { const t = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000); return () => clearTimeout(t); } }, [otpCountdown]);
  const handleChange = (f, v) => { setForm(p => ({ ...p, [f]: v })); setError(''); };
  const handleSendOTP = async () => {
    if (!form.phone || form.phone.length < 10) { setError('Enter valid 10-digit number'); return; }
    try { await api.post('/otp/send', { phone: `+91${form.phone}`, type: 'login' }); setOtpSent(true); setOtpCountdown(30); setError(''); } catch (e) { setError('Failed'); }
  };
  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      let res;
      if (activeTab === 'email') {
        if (!form.email || !form.password) { setError('Fill all fields'); setLoading(false); return; }
        res = await api.post('/auth/login', { email: form.email, password: form.password, role: 'mental_health_therapist' });
      } else {
        if (!form.phone || !form.otp) { setError('Enter phone and OTP'); setLoading(false); return; }
        res = await api.post('/otp/verify', { phone: `+91${form.phone}`, otp: form.otp, type: 'login' });
        if (res.data?.success) res = await api.post('/auth/login', { phone: `+91${form.phone}`, role: 'mental_health_therapist', otpLogin: true });
      }
      if (res.data?.success) {
        localStorage.setItem('providerToken', res.data.token);
        localStorage.setItem('providerId', res.data.user?._id || '');
        localStorage.setItem('providerType', 'mental_health_therapist');
        navigate('/mentalhealth/therapist/dashboard');
      } else setError(res.data?.message || 'Login failed');
    } catch (e) { setError('Login failed'); } finally { setLoading(false); }
  };

  const c = '#00897B';
  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(135deg,#00897B,#00695C)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',fontFamily:'Arial' }}>
      <div style={{ width:'100%',maxWidth:'420px',background:'#fff',borderRadius:'20px',padding:'30px 24px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center',marginBottom:'24px' }}><span style={{ fontSize:'44px',display:'block' }}>🧠</span><h2 style={{ margin:'8px 0 0',fontSize:'22px',fontWeight:800 }}>Therapist Login</h2><p style={{ fontSize:'13px',color:'#888' }}>Mental Health Professional</p></div>
        <div style={{ display:'flex',background:'#f5f5f5',borderRadius:'12px',padding:'4px',marginBottom:'20px' }}><button onClick={()=>{setActiveTab('email');setError('');}} style={{ flex:1,padding:'12px',border:'none',borderRadius:'10px',background:activeTab==='email'?c:'transparent',color:activeTab==='email'?'#fff':'#666',fontWeight:600,fontSize:'13px',cursor:'pointer' }}>✉️ Email</button><button onClick={()=>{setActiveTab('phone');setError('');}} style={{ flex:1,padding:'12px',border:'none',borderRadius:'10px',background:activeTab==='phone'?c:'transparent',color:activeTab==='phone'?'#fff':'#666',fontWeight:600,fontSize:'13px',cursor:'pointer' }}>📱 Mobile OTP</button></div>
        {error&&<div style={{ background:'#ffebee',color:'#c62828',padding:'10px',borderRadius:'8px',fontSize:'13px',marginBottom:'15px',textAlign:'center' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          {activeTab==='email'?<><div style={{ marginBottom:'14px' }}><label style={ls}>Email</label><input type="email" placeholder="Enter email" value={form.email} onChange={e=>handleChange('email',e.target.value)} style={is} /></div><div style={{ marginBottom:'10px' }}><label style={ls}>Password</label><div style={{ position:'relative' }}><input type={showPassword?'text':'password'} placeholder="Password" autoComplete="new-password" value={form.password} onChange={e=>handleChange('password',e.target.value)} style={{...is,paddingRight:'40px'}} /><button type="button" onClick={()=>setShowPassword(!showPassword)} style={{ position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',fontSize:'18px',cursor:'pointer' }}>{showPassword?'🙈':'👁️'}</button></div></div><div style={{ textAlign:'right',marginBottom:'16px' }}><Link to="/mentalhealth/therapist/forgot-password" style={{ fontSize:'12px',color:c,textDecoration:'none',fontWeight:600 }}>Forgot Password?</Link></div></>:<><div style={{ marginBottom:'14px' }}><label style={ls}>Phone</label><div style={{ display:'flex',gap:'8px' }}><span style={cc}>+91</span><input type="tel" placeholder="Phone" value={form.phone} onChange={e=>handleChange('phone',e.target.value.replace(/\D/g,'').slice(0,10))} style={{...is,flex:1}} /></div></div><div style={{ display:'flex',gap:'8px',marginBottom:'10px' }}><button type="button" onClick={handleSendOTP} disabled={otpCountdown>0} style={{ padding:'12px 16px',background:otpCountdown>0?'#ccc':c,color:'#fff',border:'none',borderRadius:'10px',fontSize:'12px',fontWeight:600,cursor:otpCountdown>0?'not-allowed':'pointer',whiteSpace:'nowrap' }}>{otpCountdown>0?`Resend ${otpCountdown}s`:'Send OTP'}</button>{otpSent&&<input type="text" placeholder="6-digit OTP" value={form.otp} onChange={e=>handleChange('otp',e.target.value.replace(/\D/g,'').slice(0,6))} maxLength={6} style={{...is,flex:1,letterSpacing:'6px',textAlign:'center',fontSize:'18px'}} />}</div></>}
          <button type="submit" disabled={loading} style={{ width:'100%',padding:'14px',background:c,color:'#fff',border:'none',borderRadius:'12px',fontSize:'15px',fontWeight:700,cursor:'pointer',opacity:loading?0.7:1 }}>{loading?'Logging in...':'Login'}</button>
        </form>
        <div style={{ textAlign:'center',marginTop:'18px',paddingTop:'16px',borderTop:'1px solid #eee' }}><p style={{ fontSize:'13px',color:'#888',margin:0 }}>Don't have an account? <Link to="/mentalhealth/therapist/register" style={{ color:c,fontWeight:700,textDecoration:'none' }}>Register Here</Link></p></div>
      </div>
    </div>
  );
};
const ls={display:'block',fontSize:'13px',fontWeight:600,color:'#555',marginBottom:'6px'};
const is={width:'100%',padding:'13px',border:'2px solid #e0e0e0',borderRadius:'10px',fontSize:'14px',outline:'none',boxSizing:'border-box',marginBottom:'12px'};
const cc={padding:'13px 10px',background:'#f5f5f5',border:'2px solid #e0e0e0',borderRadius:'10px',fontSize:'14px',fontWeight:600,color:'#555'};
export default TherapistLogin;