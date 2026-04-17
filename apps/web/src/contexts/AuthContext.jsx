import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [isLoading, setIsLoading] = useState(true);
  const [whatsappPhone, setWhatsappPhone] = useState(null);

  useEffect(() => {
    console.log('[AuthContext] Initializing auth state. Valid:', pb.authStore.isValid);
    
    const unsubscribe = pb.authStore.onChange((token, model) => {
      console.log('[AuthContext] Auth state changed. New model ID:', model?.id);
      setCurrentUser(model);
    });

    setIsLoading(false);

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      toast.success('Logged in successfully');
      return authData;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to log in. Please check your credentials.');
      throw error;
    }
  };

  const signup = async (data) => {
    try {
      const record = await pb.collection('users').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        name: data.name,
        role: data.role || 'buyer',
      });

      await pb.collection('users').requestVerification(data.email);
      
      toast.success('Account created! Please check your email to verify.');
      return record;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account.');
      throw error;
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logging out user');
    pb.authStore.clear();
    setCurrentUser(null);
    setWhatsappPhone(null);
    toast.success('Logged out successfully');
  };

  const resetPassword = async (email) => {
    try {
      await pb.collection('users').requestPasswordReset(email);
      toast.success('Password reset email sent.');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send password reset email.');
      throw error;
    }
  };

  const verifyEmail = async (token) => {
    try {
      await pb.collection('users').confirmVerification(token);
      toast.success('Email verified successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Invalid or expired verification token.');
      throw error;
    }
  };

  const loginWithGoogle = () => {
    console.log('[AuthContext] Initiating Google OAuth2 login...');
    return pb.collection('users').authWithOAuth2({ provider: 'google' })
      .then((authData) => {
        console.log('[AuthContext] Google OAuth2 successful. User ID:', authData.record.id);
        setCurrentUser(authData.record);
        toast.success('Logged in with Google');
        return authData;
      })
      .catch((error) => {
        console.error('[AuthContext] Google login error:', error);
        toast.error('Failed to log in with Google.');
        throw error;
      });
  };

  const loginWithFacebook = () => {
    console.log('[AuthContext] Initiating Facebook OAuth2 login...');
    return pb.collection('users').authWithOAuth2({ provider: 'facebook' })
      .then((authData) => {
        console.log('[AuthContext] Facebook OAuth2 successful. User ID:', authData.record.id);
        setCurrentUser(authData.record);
        toast.success('Logged in with Facebook');
        return authData;
      })
      .catch((error) => {
        console.error('[AuthContext] Facebook login error:', error);
        toast.error('Failed to log in with Facebook.');
        throw error;
      });
  };

  const handleWhatsAppLoginSuccess = async (phone) => {
    try {
      setWhatsappPhone(phone);
      
      // Simulate PocketBase login for WhatsApp users using a deterministic email
      const email = `${phone}@whatsapp.local`;
      const password = `wa-${phone}-secret-key-123`; // In production, use a secure backend method
      
      let authData;
      try {
        authData = await pb.collection('users').authWithPassword(email, password);
      } catch (e) {
        // User doesn't exist, create them
        await pb.collection('users').create({
          email,
          password,
          passwordConfirm: password,
          name: '',
          phone: phone, // Attempt to save phone if schema allows
        });
        authData = await pb.collection('users').authWithPassword(email, password);
      }

      // Attach phone to currentUser object for easy access
      const userWithPhone = { ...authData.record, phone: phone };
      setCurrentUser(userWithPhone);
      
      // Check if profile is complete
      const isProfileComplete = !!(authData.record.name && authData.record.city);
      
      return { success: true, isProfileComplete, user: userWithPhone };
    } catch (error) {
      console.error('WhatsApp PB login error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isLoading,
    whatsappPhone,
    login,
    signup,
    logout,
    resetPassword,
    verifyEmail,
    loginWithGoogle,
    loginWithFacebook,
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