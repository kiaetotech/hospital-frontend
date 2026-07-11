import React, { createContext, useState, useContext, useEffect } from 'react';
import { lenderAuth } from '../services/lenderApi';

const LenderContext = createContext();

export const useLender = () => useContext(LenderContext);

export const LenderProvider = ({ children }) => {
  const [lender, setLender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('lenderToken'));

  useEffect(() => {
    if (token) {
      const storedLender = localStorage.getItem('lenderData');
      if (storedLender) {
        setLender(JSON.parse(storedLender));
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await lenderAuth.login(email, password);
    const { token, lender: lenderData } = response.data;
    localStorage.setItem('lenderToken', token);
    localStorage.setItem('lenderData', JSON.stringify(lenderData));
    setToken(token);
    setLender(lenderData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('lenderToken');
    localStorage.removeItem('lenderData');
    setToken(null);
    setLender(null);
  };

  const register = async (data) => {
    const response = await lenderAuth.register(data);
    return response.data;
  };

  return (
    <LenderContext.Provider value={{ lender, loading, login, logout, register, token }}>
      {children}
    </LenderContext.Provider>
  );
};
