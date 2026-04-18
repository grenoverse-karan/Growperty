import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [token, setToken] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkTokenValidity = () => {
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminData');
    
    if (storedToken && storedAdmin) {
      try {
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          setToken(storedToken);
          const adminData = JSON.parse(storedAdmin);
          setCurrentAdmin(adminData);
          setCurrentAdminId(adminData.id);
          setIsAdminAuthenticated(true);
        } else {
          // Token expired
          adminLogout(false);
        }
      } catch (error) {
        console.error('Invalid token format', error);
        adminLogout(false);
      }
    } else {
      setIsAdminAuthenticated(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkTokenValidity();
  }, []);

  const adminLogin = async (email, password) => {
    try {
      const response = await apiServerClient.fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        
        setToken(data.token);
        setCurrentAdmin(data.admin);
        setCurrentAdminId(data.admin.id);
        setIsAdminAuthenticated(true);
        
        toast.success('Welcome back, Admin');
        return data;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error(`[AdminAuthContext] Login failed:`, error);
      throw error;
    }
  };

  const adminLogout = (showToast = true) => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setToken(null);
    setCurrentAdmin(null);
    setCurrentAdminId(null);
    setIsAdminAuthenticated(false);
    if (showToast) {
      toast.success('Logged out successfully');
    }
  };

  const value = {
    currentAdminId,
    currentAdmin,
    isAdminAuthenticated,
    token,
    isLoading,
    adminLogin,
    adminLogout,
    checkTokenValidity
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};