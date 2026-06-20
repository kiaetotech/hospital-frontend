import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ayurveda/doctor/login', { phone, password });
      if (res.data.success) {
        localStorage.setItem('ayurvedaDoctorToken', res.data.token);
        localStorage.setItem('ayurvedaDoctor', JSON.stringify(res.data.doctor));
        navigate('/ayurveda/doctor/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth:'400px',margin:'3rem auto',padding:'2rem' }}>
      <h1 style={{ textAlign:'center',color:'#2E7D32' }}>Doctor Login</h1>
      <form onSubmit={handleLogin}>
        <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)}
          style={{ width:'100%',padding:'0.75rem',marginBottom:'0.5rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0' }} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
          style={{ width:'100%',padding:'0.75rem',marginBottom:'0.5rem',borderRadius:'0.5rem',border:'1px solid #e2e8f0' }} />
        <button type="submit" disabled={loading}
          style={{ width:'100%',padding:'0.75rem',backgroundColor:'#4CAF50',color:'white',border:'none',borderRadius:'0.5rem',cursor:'pointer' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p style={{ textAlign:'center',marginTop:'1rem' }}>
          New? <span onClick={()=>navigate('/ayurveda/doctor/register')} style={{ color:'#4CAF50',cursor:'pointer' }}>Register</span>
        </p>
      </form>
    </div>
  );
};

export default DoctorLogin;