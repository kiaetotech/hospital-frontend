import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const TherapistLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://hospital-backend-production-8de3.up.railway.app/api/mentalhealth/therapist/login',
        { phone, password }
      );

      if (response.data.success) {
        localStorage.setItem('providerToken', response.data.token);
        localStorage.setItem('providerType', 'mentalhealth');
        localStorage.setItem('user', JSON.stringify(response.data.data));
        navigate('/mentalhealth/therapist/dashboard');
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>🧠 Therapist Login</h1>
        <p style={{ color: '#6b7280', textAlign: 'center' }}>Login to manage your sessions</p>
        {error && <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', color: '#dc2626' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '0.5rem' }} required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '0.5rem' }} required />
          <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#8b5cf6', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>Don't have an account? <Link to="/mentalhealth/therapist/register" style={{ color: '#8b5cf6' }}>Register here</Link></p>
      </div>
    </div>
  );
};

export default TherapistLogin;