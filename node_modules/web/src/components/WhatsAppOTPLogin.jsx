import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, Loader2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';

const WhatsAppOTPLogin = () => {
  const [phone, setPhone] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [userOtp, setUserOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const { handleWhatsAppLoginSuccess } = useAuth();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setUserOtp(val);
  };

  const handleSendOTP = async () => {
    const phoneNumber = phone.trim();
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiServerClient.fetch('/whatsapp/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success !== false) {
        setIsOtpSent(true);
        setCountdown(300); // 5 minutes countdown matching backend expiry
        toast.success(data.message || 'OTP sent to WhatsApp');
        setUserOtp('');
      } else {
        toast.error(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      toast.error('Failed to send OTP - check your connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (userOtp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiServerClient.fetch('/whatsapp/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: phone.trim(), 
          userEnteredOtp: userOtp 
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success !== false) {
        toast.success(data.message || 'OTP Verified Successfully');
        
        // Handle PocketBase login and profile check
        try {
          const loginResult = await handleWhatsAppLoginSuccess(phone);
          if (loginResult?.isProfileComplete) {
            navigate('/');
          } else {
            navigate(data.redirectUrl || '/setup-profile');
          }
        } catch (e) {
          // Fallback if auth context fails
          navigate(data.redirectUrl || '/setup-profile');
        }
      } else {
        // Show specific error message from backend (e.g., expired, max attempts, invalid)
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (err) {
      toast.error('Failed to verify OTP - check your connection');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-5 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="space-y-2">
        <Label className="text-slate-700 dark:text-slate-300 font-bold">WhatsApp Number</Label>
        <Input 
          type="tel"
          value={phone} 
          onChange={handlePhoneChange}
          disabled={isOtpSent && countdown > 0}
          placeholder="Enter 10-digit number"
          className="h-12 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-[#25D366]"
        />
      </div>
      
      {!isOtpSent && (
        <Button 
          type="button"
          onClick={handleSendOTP}
          disabled={phone.length !== 10 || isLoading || countdown > 0}
          className="w-full h-12 rounded-xl font-bold text-lg bg-[#25D366] hover:bg-[#20BD5A] text-white transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Sending...
            </>
          ) : (
            <>
              <MessageCircle className="mr-2 h-5 w-5" />
              Send OTP on WhatsApp
            </>
          )}
        </Button>
      )}

      {isOtpSent && (
        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-slate-700 dark:text-slate-300 font-bold">Enter 6-digit OTP</Label>
              <button 
                type="button"
                onClick={handleSendOTP}
                disabled={countdown > 0 || isLoading}
                className="text-xs font-medium text-[#25D366] hover:text-[#20BD5A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend OTP'}
              </button>
            </div>
            <Input 
              type="text"
              value={userOtp} 
              onChange={handleOtpChange}
              placeholder="••••••"
              className="h-12 rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-[#25D366] text-center tracking-widest text-2xl font-mono"
            />
          </div>
          
          <Button 
            type="button"
            onClick={handleVerifyOTP}
            disabled={userOtp.length !== 6 || loading}
            className="w-full h-12 rounded-xl font-bold text-lg bg-primary hover:bg-primary/90 text-white transition-colors"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
            Verify OTP
          </Button>
        </div>
      )}
    </div>
  );
};

export default WhatsAppOTPLogin;