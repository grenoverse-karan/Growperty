import React, { useState } from 'react';
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
import { Loader2, User, MapPin, Phone, Home, Briefcase, CheckCircle2, MessageCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const GoogleCompleteProfilePage = () => {
  const { currentUser, getToken, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [role, setRole] = useState(currentUser?.role || 'buyer');

  // Phone + OTP
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(!!currentUser?.phone);
  const [verifiedPhone, setVerifiedPhone] = useState(currentUser?.phone || '');

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) { toast.error('Valid 10-digit number daalo'); return; }
    setIsSendingOtp(true);
    try {
      const res = await fetch(`${API}/api/whatsapp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: digits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP send failed');
      setOtpSent(true);
      toast.success('OTP WhatsApp par bheja gaya');
    } catch (e) {
      toast.error(e.message || 'OTP send failed');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { toast.error('OTP daalo'); return; }
    setIsVerifying(true);
    try {
      const res = await fetch(`${API}/api/whatsapp/link-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ phoneNumber: phone.replace(/\D/g, ''), userEnteredOtp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verify failed');
      setPhoneVerified(true);
      setVerifiedPhone(phone.replace(/\D/g, ''));
      updateCurrentUser(data.user);
      toast.success('Number verify ho gaya!');
    } catch (e) {
      toast.error(e.message || 'OTP verify failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name required hai'); return; }
    if (!city.trim()) { toast.error('City required hai'); return; }
    if (!phoneVerified) { toast.error('Pehle number verify karo'); return; }

    setIsSubmitting(true);
    try {
      const res = await apiServerClient.fetch('/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: name.trim(), city: city.trim(), role, source: 'google_complete' }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Profile update failed');
      const updated = await res.json();
      updateCurrentUser(updated);
      toast.success('Profile complete ho gaya!');
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
              <CardTitle className="text-2xl font-extrabold">Profile Complete Karo</CardTitle>
              <CardDescription>
                Google account connected hai — bas kuch details aur chahiye
              </CardDescription>
              {currentUser?.email && (
                <p className="text-xs text-muted-foreground mt-1">{currentUser.email}</p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="font-bold text-sm">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Aapka poora naam" className="pl-9 h-11 rounded-xl" required />
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
                  <Label className="font-bold text-sm">Main chahta/chahti hoon *</Label>
                  <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-3">
                    <div>
                      <RadioGroupItem value="buyer" id="buyer" className="peer sr-only" />
                      <Label htmlFor="buyer" className="flex items-center gap-2 rounded-xl border-2 border-muted bg-transparent p-3 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                        <Home className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm">Property Khareedna</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="seller" id="seller" className="peer sr-only" />
                      <Label htmlFor="seller" className="flex items-center gap-2 rounded-xl border-2 border-muted bg-transparent p-3 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm">Property Bechna</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Phone + OTP */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-sm">WhatsApp Number *</Label>
                  {phoneVerified ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      <div>
                        <p className="font-bold text-green-700 dark:text-green-400 text-sm">Number verified!</p>
                        <p className="text-xs text-green-600 dark:text-green-500">+91 {verifiedPhone.slice(-10)}</p>
                      </div>
                    </div>
                  ) : !otpSent ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="10-digit number" maxLength={10}
                          className="pl-9 h-11 rounded-xl" />
                      </div>
                      <Button type="button" onClick={handleSendOtp} disabled={isSendingOtp}
                        className="h-11 rounded-xl font-bold bg-[#25D366] hover:bg-[#1ebe5d] text-white shrink-0">
                        {isSendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <><MessageCircle className="h-4 w-4 mr-1" /> OTP</>}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        OTP bheja gaya <strong className="text-foreground">+91 {phone}</strong> pe
                      </p>
                      <div className="flex gap-2">
                        <Input value={otp} onChange={e => setOtp(e.target.value)}
                          placeholder="6-digit OTP" maxLength={6}
                          className="h-11 rounded-xl flex-1" />
                        <Button type="button" onClick={handleVerifyOtp} disabled={isVerifying}
                          className="h-11 rounded-xl font-bold bg-[#25D366] hover:bg-[#1ebe5d] text-white shrink-0">
                          {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                        </Button>
                      </div>
                      <button type="button" onClick={() => setOtpSent(false)}
                        className="text-xs text-muted-foreground underline">Number change karo</button>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base" disabled={isSubmitting || !phoneVerified}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : 'Profile Complete Karo'}
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
