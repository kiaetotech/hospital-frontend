import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.post('/homeopathy/doctor/login', { phone, password });
      if (res.data.success) {
        localStorage.setItem('homeoDoctorToken', res.data.token);
        localStorage.setItem('homeoDoctor', JSON.stringify(res.data.doctor));
        navigate('/homeopathy/doctor/dashboard');
      }
    } catch (error) { alert(error.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:'400px',margin:'3rem auto',padding:'2rem' }}>
      <h1 style={{ textAlign:'center',color:'#7C3AED',marginBottom:'2rem' }}>🌿 Doctor Login</h1>
      <form onSubmit={handleLogin} style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
        <input required placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} style={{ padding:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0',fontSize:'1rem' }} />
        <input required type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{ padding:'0.75rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0',fontSize:'1rem' }} />
        <button type="submit" disabled={loading} style={{ padding:'0.75rem',backgroundColor:'#7C3AED',color:'white',border:'none',borderRadius:'0.5rem',fontWeight:'bold',cursor:'pointer' }}>{loading?'Logging in...':'Login'}</button>
        <p style={{ textAlign:'center' }}>New? <span onClick={()=>navigate('/homeopathy/doctor/register')} style={{ color:'#7C3AED',cursor:'pointer',fontWeight:'bold' }}>Register</span></p>
      </form>
    </div>
  );
};

export default DoctorLogin;