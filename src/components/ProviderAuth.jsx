import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const ProviderAuth = ({ children, providerType }) => {
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

    const verifyToken = async () => {
      try {
        const res = await api.get(`/${providerType}/auth/verify`);
        if (res.data.success) {
          setUser(res.data.data);
          setLoading(false);
        } else {
          navigate(`/${providerType}/login`);
        }
      } catch (error) {
        navigate(`/${providerType}/login`);
      }
    };
    verifyToken();
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