import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const CpAuthContext = createContext();

export const useCpAuth = () => useContext(CpAuthContext);

export const CpAuthProvider = ({ children }) => {
  const [currentCp, setCurrentCp]           = useState(null);
  const [token, setToken]                   = useState(null);
  const [isCpAuthenticated, setIsCpAuthenticated] = useState(false);
  const [isLoading, setIsLoading]           = useState(true);

  const checkTokenValidity = () => {
    const storedToken = localStorage.getItem('cpToken');
    const storedCp    = localStorage.getItem('cpData');

    if (storedToken && storedCp) {
      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp > Date.now() / 1000) {
          setToken(storedToken);
          setCurrentCp(JSON.parse(storedCp));
          setIsCpAuthenticated(true);
        } else {
          cpLogout(false);
        }
      } catch {
        cpLogout(false);
      }
    } else {
      setIsCpAuthenticated(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkTokenValidity();
  }, []);

  const cpLogin = async (email, password) => {
    const response = await apiServerClient.fetch('/cp/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('cpToken', data.token);
    localStorage.setItem('cpData', JSON.stringify(data.cp));

    setToken(data.token);
    setCurrentCp(data.cp);
    setIsCpAuthenticated(true);

    toast.success(`Welcome back, ${data.cp.name}`);
    return data;
  };

  const cpLogout = (showToast = true) => {
    localStorage.removeItem('cpToken');
    localStorage.removeItem('cpData');
    setToken(null);
    setCurrentCp(null);
    setIsCpAuthenticated(false);
    if (showToast) toast.success('Logged out successfully');
  };

  const value = {
    currentCp,
    token,
    isCpAuthenticated,
    isLoading,
    cpLogin,
    cpLogout,
    checkTokenValidity,
  };

  return (
    <CpAuthContext.Provider value={value}>
      {children}
    </CpAuthContext.Provider>
  );
};
