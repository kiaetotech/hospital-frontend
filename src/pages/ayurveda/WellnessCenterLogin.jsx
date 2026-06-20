import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const WellnessCenterLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/ayurveda-centers/login', { phone, password });
      if (response.data.success) {
        localStorage.setItem('centerToken', response.data.token);
        localStorage.setItem('centerData', JSON.stringify(response.data.center));
        navigate('/ayurveda/center/dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', color: '#FF9800', marginBottom: '2rem' }}>
        🏨 Center Login
      </h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input required placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} 
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
        <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} 
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
        <button type="submit" disabled={loading} 
          style={{ padding: '0.75rem', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
          New center?{' '}
          <span onClick={() => navigate('/ayurveda/center/register')} 
            style={{ color: '#FF9800', cursor: 'pointer', fontWeight: 'bold' }}>
            Register here
          </span>
        </p>
      </form>
    </div>
  );
};

export default WellnessCenterLogin;