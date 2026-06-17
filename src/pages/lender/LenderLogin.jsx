import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLender } from '../../contexts/LenderContext';

const LenderLogin = () => {
  const navigate = useNavigate();
  const { login } = useLender();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/lender/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', borderRadius: '1rem', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '3rem' }}>🏦</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Lender Login</h1>
          <p style={{ color: '#6b7280' }}>Access your loan management dashboard</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', color: '#dc2626' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lender@example.com"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
              required
            />
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
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            New to KiaetoCare?{' '}
            <a href="/lender/register" style={{ color: '#8b5cf6', textDecoration: 'none' }}>
              Register as Lender
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LenderLogin;