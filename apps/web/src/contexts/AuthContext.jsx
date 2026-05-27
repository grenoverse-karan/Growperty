import React, { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';

const AuthContext = createContext();

const TOKEN_KEY = 'growperty_token';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiServerClient
      .fetch('/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((user) => {
        if (user._id) setCurrentUser(user);
        else localStorage.removeItem(TOKEN_KEY);
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const login = async (email, password) => {
    const res = await apiServerClient.fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || 'Invalid credentials');
      throw new Error(data.error);
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setCurrentUser(data.user);
    toast.success('Logged in successfully');
    return data;
  };

  const signup = async (formData) => {
    const res = await apiServerClient.fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || 'Failed to create account');
      throw new Error(data.error);
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setCurrentUser(data.user);
    toast.success('Account created successfully!');
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  const updateCurrentUser = (updatedUser) => setCurrentUser(updatedUser);

  const handleWhatsAppLoginSuccess = ({ token, user, isProfileComplete }) => {
    localStorage.setItem(TOKEN_KEY, token);
    // flushSync guarantees currentUser is set before navigate() runs,
    // preventing ProtectedRoute from seeing isAuthenticated:false
    flushSync(() => setCurrentUser(user));
    return { isProfileComplete, user };
  };

  const value = {
    currentUser,
    isLoading,
    getToken,
    login,
    signup,
    logout,
    updateCurrentUser,
    handleWhatsAppLoginSuccess,
    isAuthenticated: !!currentUser,
    isSeller: currentUser?.role === 'seller',
    isBuyer: currentUser?.role === 'buyer',
    isAdmin: currentUser?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
