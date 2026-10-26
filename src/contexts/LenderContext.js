import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { lenderAuth } from '../services/lenderApi';

const LenderContext = createContext(null);

export const useLender = () => {
  const ctx = useContext(LenderContext);
  if (!ctx) {
    throw new Error('useLender must be used within a LenderProvider');
  }
  return ctx;
};

const readLenderFromStorage = () => {
  try {
    const raw = localStorage.getItem('lenderData');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const LenderProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('lenderToken') || null);
  const [lender, setLender] = useState(() => readLenderFromStorage());

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'lenderToken' || e.key === 'lenderData' || e.key === null) {
        setToken(localStorage.getItem('lenderToken') || null);
        setLender(readLenderFromStorage());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await lenderAuth.login(email, password);
    const payload = response?.data || {};
    const newToken = payload.token;
    const lenderData = payload.lender;

    if (!newToken || !lenderData) {
      throw new Error('Login response missing token or lender');
    }

    localStorage.setItem('lenderToken', newToken);
    localStorage.setItem('lenderData', JSON.stringify(lenderData));
    setToken(newToken);
    setLender(lenderData);

    return payload;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lenderToken');
    localStorage.removeItem('lenderData');
    setToken(null);
    setLender(null);
  }, []);

  const register = useCallback(async (data) => {
    const response = await lenderAuth.register(data);
    return response?.data;
  }, []);

  const loading = false;

  const value = { lender, token, loading, login, logout, register };
  return <LenderContext.Provider value={value}>{children}</LenderContext.Provider>;
};