import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, User, MapPin, Home, Briefcase, CheckCircle2, MessageCircle } from 'lucide-react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://growperty-api.vercel.app/api';

const GoogleCompleteProfilePage = () => {
  const { currentUser, getToken, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [role, setRole] = useState(currentUser?.role || 'buyer');

  // Phone + OTP state (same as WhatsAppOTPLogin)
  const [phone, setPhone] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [userOtp, setUserOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(!!currentUser?.phone);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) timer = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handlePhoneChange = (e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
  const handleOtpChange = (e) => setUserOtp(e.target.value.replace(/\D/g, '').slice(0, 6));

  const handleSendOtp = async () => {
    if (phone.length !== 10) { toast.error('Enter a valid 10-digit number'); return; }
    setIsSendingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/whatsapp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        setIsOtpSent(true);
        setCountdown(300);
        setUserOtp('');
        toast.success(data.message || 'OTP sent on WhatsApp');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch {
      toast.error('Could not send OTP — check your connection');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (userOtp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setIsVerifyingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/whatsapp/link-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ phoneNumber: phone, userEnteredOtp: userOtp }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setPhoneVerified(true);
        if (data.user) updateCurrentUser(data.user);
        toast.success('Phone number verified!');
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch {
      toast.error('Verification failed — check your connection');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (!city.trim()) { toast.error('City is required'); return; }
    if (!phoneVerified) { toast.error('Please verify your phone number first'); return; }

    setIsSubmitting(true);
    try {
      const res = await apiServerClient.fetch('/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: name.trim(), city: city.trim(), role, source: 'google_complete' }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Update failed');
      const updated = await res.json();
      updateCurrentUser(updated);
      toast.success('Profile complete!');
      navigate('/', { replace: true });
    } catch (e) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet><title>Complete Your Profile — Growperty.com</title></Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-background p-4">
        <div className="w-full max-w-md">
          <Card className="rounded-3xl shadow-xl border-border/50 bg-white dark:bg-slate-900">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-3">
                <User className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl font-extrabold">Complete Your Profile</CardTitle>
              <CardDescription>Just a few more details to get started</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="font-bold text-sm">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your full name" className="pl-9 h-11 rounded-xl" required />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="font-bold text-sm">City *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="city" value={city} onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Greater Noida" className="pl-9 h-11 rounded-xl" required />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-sm">I want to *</Label>
                  <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-3">
                    <div>
                      <RadioGroupItem value="buyer" id="buyer" className="peer sr-only" />
                      <Label htmlFor="buyer" className="flex items-center gap-2 rounded-xl border-2 border-muted bg-transparent p-3 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                        <Home className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm">Buy Property</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="seller" id="seller" className="peer sr-only" />
                      <Label htmlFor="seller" className="flex items-center gap-2 rounded-xl border-2 border-muted bg-transparent p-3 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm">Sell Property</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Phone + OTP — same UI as WhatsAppOTPLogin */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Label className="font-bold text-sm">WhatsApp Number *</Label>

                  {phoneVerified ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      <div>
                        <p className="font-bold text-green-700 dark:text-green-400 text-sm">Phone number verified!</p>
                        <p className="text-xs text-green-600 dark:text-green-500">+91 {phone || (currentUser?.phone?.slice(-10))}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        disabled={isOtpSent && countdown > 0}
                        placeholder="Enter 10-digit number"
                        className="h-12 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-[#25D366]"
                      />

                      {!isOtpSent ? (
                        <Button type="button" onClick={handleSendOtp}
                          disabled={phone.length !== 10 || isSendingOtp}
                          className="w-full h-12 rounded-xl font-bold text-base bg-[#25D366] hover:bg-[#20BD5A] text-white">
                          {isSendingOtp
                            ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Sending…</>
                            : <><MessageCircle className="mr-2 h-5 w-5" /> Send OTP on WhatsApp</>}
                        </Button>
                      ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <Label className="font-bold text-sm">Enter 6-digit OTP</Label>
                              <button type="button" onClick={handleSendOtp}
                                disabled={countdown > 0 || isSendingOtp}
                                className="text-xs font-medium text-[#25D366] hover:text-[#20BD5A] disabled:opacity-50 disabled:cursor-not-allowed">
                                {countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend OTP'}
                              </button>
                            </div>
                            <Input type="text" value={userOtp} onChange={handleOtpChange}
                              placeholder="••••••"
                              className="h-12 rounded-xl bg-white dark:bg-slate-950 text-center tracking-widest text-2xl font-mono focus-visible:ring-[#25D366]" />
                          </div>
                          <Button type="button" onClick={handleVerifyOtp}
                            disabled={userOtp.length !== 6 || isVerifyingOtp}
                            className="w-full h-12 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 text-white">
                            {isVerifyingOtp ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                            Verify OTP
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base"
                  disabled={isSubmitting || !phoneVerified}>
                  {isSubmitting
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</>
                    : 'Complete Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default GoogleCompleteProfilePage;
