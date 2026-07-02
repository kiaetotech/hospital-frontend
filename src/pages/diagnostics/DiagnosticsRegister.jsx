import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const DiagnosticsRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    type: 'Lab', registrationNumber: '',
    address: { line1: '', city: '', state: '', pincode: '' },
    is_nabl_accredited: false, is_iso_accredited: false,
    is_home_collection_available: false,
    facilities: [], accreditations: []
  });

  const steps = ['Basic Info', 'Contact & Location', 'Facilities', 'Verification'];

  const accreditationOptions = ['NABL', 'ISO', 'CAP', 'NGSP'];
  const facilityOptions = ['Pathology', 'Microbiology', 'Hematology', 'Biochemistry', 'Radiology', 'CT Scan', 'MRI', 'Ultrasound', 'X-Ray', 'ECG', 'Home Collection'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].includes(value) ? prev[field].filter(v => v !== value) : [...prev[field], value] }));
  };

  const handleSendOTP = async () => {
    if (!formData.phone) { setError('Please enter phone number first'); return; }
    try { await api.post('/otp/send', { phone: `+91${formData.phone}` }); setOtpSent(true); setResendTimer(30); const t = setInterval(() => { setResendTimer(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }); }, 1000); } catch (e) { setError('Failed to send OTP'); }
  };

  const handleVerifyOTP = async () => {
    if (!otp) { setError('Enter OTP'); return; }
    try { const r = await api.post('/otp/verify', { phone: `+91${formData.phone}`, otp }); if (r.data?.success) { setOtpVerified(true); setError(''); } else setError('Invalid OTP'); } catch (e) { setError('Invalid OTP'); }
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (!otpVerified) { setError('Please verify phone with OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/diagnostics/register', formData);
      if (res.data?.success) { setSuccess('✅ Registration successful! Redirecting to login...'); setTimeout(() => navigate('/diagnostics/login'), 2000); }
      else setError(res.data?.message || 'Failed');
    } catch (e) { setError('Registration failed'); }
    finally { setLoading(false); }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 0: return (
        <div>
          <h3 style={st}>🔬 Basic Information</h3>
          <div style={g2}><div><label style={ls}>Lab Name *</label><input name="name" value={formData.name} onChange={handleChange} style={inp} required /></div><div><label style={ls}>Registration Number</label><input name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} style={inp} /></div><div><label style={ls}>Type *</label><select name="type" value={formData.type} onChange={handleChange} style={inp}><option value="Lab">Diagnostic Lab</option><option value="Hospital">Hospital Lab</option><option value="Both">Both</option></select></div></div>
          <div style={{ marginTop: '1rem' }}><label style={ls}>Accreditations</label><div style={cg}>{accreditationOptions.map(a=><label key={a} style={cl}><input type="checkbox" checked={formData.accreditations.includes(a)} onChange={()=>handleMultiSelect('accreditations',a)} />{a}</label>)}</div></div>
        </div>
      );
      case 1: return (
        <div>
          <h3 style={st}>📞 Contact & 📍 Location</h3>
          <div style={g2}><div><label style={ls}>Email *</label><input name="email" type="email" value={formData.email} onChange={handleChange} style={inp} required /></div><div><label style={ls}>Phone *</label><input name="phone" type="tel" value={formData.phone} onChange={handleChange} style={inp} required /></div></div>
          <div style={g2}><div style={{ gridColumn: 'span 2' }}><label style={ls}>Address</label><input name="address.line1" value={formData.address.line1} onChange={handleChange} style={inp} /></div><div><label style={ls}>City *</label><input name="address.city" value={formData.address.city} onChange={handleChange} style={inp} required /></div><div><label style={ls}>State *</label><input name="address.state" value={formData.address.state} onChange={handleChange} style={inp} required /></div><div><label style={ls}>Pincode</label><input name="address.pincode" value={formData.address.pincode} onChange={handleChange} style={inp} /></div></div>
        </div>
      );
      case 2: return (
        <div>
          <h3 style={st}>🏗️ Facilities</h3>
          <div style={{ marginBottom: '1rem' }}><label style={cl}><input type="checkbox" name="is_nabl_accredited" checked={formData.is_nabl_accredited} onChange={handleChange} />NABL Accredited</label><label style={cl}><input type="checkbox" name="is_home_collection_available" checked={formData.is_home_collection_available} onChange={handleChange} />Home Collection Available</label></div>
          <div><label style={ls}>Facilities</label><div style={cg}>{facilityOptions.map(f=><span key={f} onClick={()=>handleMultiSelect('facilities',f)} style={{ ...cs, backgroundColor: formData.facilities.includes(f)?'#d1fae5':'#f3f4f6', border: formData.facilities.includes(f)?'2px solid #10b981':'1px solid #e5e7eb' }}>{formData.facilities.includes(f)?'✅ ':''}{f}</span>)}</div></div>
        </div>
      );
      case 3: return (
        <div>
          <h3 style={st}>📱 Verification & 🔑 Password</h3>
          <p style={{ fontSize:'0.85rem', color:'#888', marginBottom:'1rem' }}>Verify phone: <strong>+91 {formData.phone}</strong></p>
          {!otpVerified?(
            !otpSent?<button onClick={handleSendOTP} style={{ padding:'0.75rem 2rem', background:'#10b981', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:'bold' }}>📱 Send OTP</button>
            :<div><div style={{ display:'flex',gap:'0.5rem' }}><input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} maxLength={6} placeholder="OTP" style={{ ...inp, width:'150px', textAlign:'center', letterSpacing:'0.5rem', fontSize:'1.2rem' }} /><button onClick={handleVerifyOTP} style={{ padding:'0.6rem 1.5rem', background:'#10b981', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontWeight:'bold' }}>Verify</button></div><p style={{ fontSize:'0.8rem', marginTop:'0.5rem' }}>{resendTimer>0?`Resend in ${resendTimer}s`:<button onClick={handleSendOTP} style={{ background:'none',border:'none',color:'#10b981',cursor:'pointer' }}>Resend OTP</button>}</p></div>
          ):<div style={{ background:'#d1fae5', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1rem' }}>✅ Phone Verified!</div>}
          <div style={g2}><div><label style={ls}>Password *</label><input name="password" type="password" value={formData.password} onChange={handleChange} style={inp} minLength={8} required /></div><div><label style={ls}>Confirm Password *</label><input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} style={inp} required /></div></div>
          {formData.password&&formData.confirmPassword&&formData.password!==formData.confirmPassword&&<p style={{ color:'#dc2626',fontSize:'0.8rem' }}>❌ Passwords do not match</p>}
          <div style={{ marginTop:'1rem', background:'#f0fdf4', padding:'1rem', borderRadius:'0.5rem', fontSize:'0.8rem' }}><h4>Summary</h4><p>🔬 {formData.name||'N/A'} | 📍 {formData.address.city||'N/A'}, {formData.address.state||'N/A'}</p><p>🏗️ Facilities: {formData.facilities.length} | 📱 Verified: {otpVerified?'Yes':'No'}</p></div>
        </div>
      );
      default: return null;
    }
  };

  const st = { fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.1rem', color: '#1f2937' };
  const ls = { display: 'block', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.25rem', color: '#374151' };
  const inp = { width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.9rem', backgroundColor: 'white', outline: 'none', boxSizing: 'border-box', marginBottom: '0.5rem' };
  const g2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
  const cg = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' };
  const cl = { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' };
  const cs = { padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '20px', padding: '30px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <Link to="/diagnostics/login" style={{ fontSize: '14px', color: '#10b981', textDecoration: 'none', display: 'inline-block', marginBottom: '15px' }}>← Back to Login</Link>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}><span style={{ fontSize: '40px', display: 'block' }}>🔬</span><h2 style={{ margin: '8px 0 0', fontSize: '20px', fontWeight: 800 }}>Register Your Lab</h2><p style={{ fontSize: '13px', color: '#888' }}>Step {currentStep+1} of {steps.length}: {steps[currentStep]}</p></div>
        {error&&<div style={{ background:'#ffebee', color:'#c62828', padding:'10px', borderRadius:'8px', fontSize:'13px', marginBottom:'15px', textAlign:'center' }}>{error}</div>}
        {success&&<div style={{ background:'#e8f5e9', color:'#2e7d32', padding:'10px', borderRadius:'8px', fontSize:'13px', marginBottom:'15px', textAlign:'center' }}>{success}</div>}
        <div style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: '1rem' }}>{renderStep()}</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {currentStep > 0 && <button onClick={() => setCurrentStep(currentStep - 1)} style={{ flex: 1, padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>← Previous</button>}
          {currentStep < steps.length - 1 ? (
            <button onClick={() => setCurrentStep(currentStep + 1)} style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Next →</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>{loading ? 'Submitting...' : '✅ Submit Registration'}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsRegister;