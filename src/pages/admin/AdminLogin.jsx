import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Simple admin key validation (matches backend)
      if (adminKey === 'admin_secret_key_2024') {
        localStorage.setItem('adminToken', 'admin_authenticated');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin key');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '3rem' }}>🔐</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Admin Login</h1>
          <p style={{ color: '#6b7280' }}>Enter your admin key to access the dashboard</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', color: '#dc2626' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Admin Key</label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              required
            />
            <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.25rem' }}>Default key: admin_secret_key_2024</p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;