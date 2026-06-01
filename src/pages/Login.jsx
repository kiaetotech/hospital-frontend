import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'patient' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      } else {
        const res = await api.post('/auth/register', formData);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '450px', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.5rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
              <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem' }}>
                <option value="patient">Patient</option>
                <option value="caregiver">Caregiver</option>
              </select>
            </>
          )}
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', border: '1px solid #ccc', borderRadius: '0.375rem' }} />
          <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{isLogin ? 'Login' : 'Register'}</button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>{isLogin ? 'Register' : 'Login'}</button>
        </p>
      </div>
    </div>
  );
};

export default Login;