import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProviderAuth = ({ children, providerType }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('providerToken');
    const storedType = localStorage.getItem('providerType');
    
    if (!token || storedType !== providerType) {
      navigate(`/${providerType}/login`);
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);

  }, [navigate, providerType]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p>Verifying credentials...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProviderAuth;
