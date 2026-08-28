import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Loader2, User, MapPin, Phone, Mail, CheckCircle2, LogOut, Trash2, Save, ArrowLeft,
  Home, Briefcase, KeyRound, TrendingUp, Hammer, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || '';

const WHO_OPTIONS = [
  { value: 'Buyer', icon: Home },
  { value: 'Seller', icon: Briefcase },
  { value: 'Investor', icon: TrendingUp },
  { value: 'Builder', icon: Hammer },
];

const UserProfilePage = () => {
  const { currentUser, getToken, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [roles, setRoles] = useState(currentUser?.roles || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Phone linking flow
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Email edit flow
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(currentUser?.email || '');
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const hasPassword = currentUser?.provider === 'email';

  const displayPhone = currentUser?.phone
    ? currentUser.phone.replace(/^91/, '')
    : null;

  const handleSendOtp = async () => {
    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length !== 10) { toast.error('Valid 10-digit number enter karo'); return; }
    setIsSendingOtp(true);
    try {
      const res = await fetch(`${API}/api/whatsapp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: digits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP bhejne mein error');
      setOtpSent(true);
      toast.success('OTP WhatsApp par bheja gaya');
    } catch (e) {
      toast.error(e.message || 'OTP send failed');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleLinkPhone = async () => {
    if (!otpInput.trim()) { toast.error('OTP daalo'); return; }
    setIsVerifyingOtp(true);
    try {
      const res = await fetch(`${API}/api/whatsapp/link-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ phoneNumber: phoneInput.replace(/\D/g, ''), userEnteredOtp: otpInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      updateCurrentUser(data.user);
      toast.success('WhatsApp number link ho gaya!');
      setOtpSent(false);
      setEditingPhone(false);
      setPhoneInput('');
      setOtpInput('');
    } catch (e) {
      toast.error(e.message || 'OTP verify failed');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSaveEmail = async () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) { toast.error('Enter a valid email address'); return; }
    setIsSavingEmail(true);
    try {
      const res = await apiServerClient.fetch('/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update email');
      updateCurrentUser(data);
      toast.success('Email updated successfully');
      setEditingEmail(false);
    } catch (e) {
      toast.error(e.message || 'Failed to update email');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const toggleWhoRole = (value) => {
    setRoles(prev => prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setIsSaving(true);
    try {
      const res = await apiServerClient.fetch('/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: name.trim(), city: city.trim(), roles }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      updateCurrentUser(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setIsChangingPassword(true);
    try {
      const res = await apiServerClient.fetch('/users/me/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      toast.success(hasPassword ? 'Password changed successfully' : 'Password set successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await apiServerClient.fetch('/users/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>My Profile - Growperty.com</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        {/* Top bar */}
        <div className="border-b border-border/50 bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="font-bold text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4 mr-1.5" />
            Log Out
          </Button>
        </div>

        <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="avatar" className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {currentUser?.name || 'Your Profile'}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {roles.map(r => (
                  <Badge key={r} variant="secondary" className="font-bold capitalize text-xs">{r}</Badge>
                ))}
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Profile Information</CardTitle>
                <CardDescription>Update your name, city, contact details and account type.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold text-sm">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="font-bold text-sm">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Greater Noida"
                        className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Mobile number */}
                  <div className="space-y-2">
                    <Label className="font-bold text-sm">Mobile Number</Label>
                    {!editingPhone ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        {displayPhone ? (
                          <>
                            <span className="font-medium text-slate-700 dark:text-slate-300">+91 {displayPhone}</span>
                            <CheckCircle2 className="h-4 w-4 text-green-500 ml-1" />
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not added</span>
                        )}
                        <button
                          type="button"
                          onClick={() => { setEditingPhone(true); setOtpSent(false); setPhoneInput(''); setOtpInput(''); }}
                          className="ml-auto flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          <Pencil className="h-3 w-3" /> {displayPhone ? 'Change' : 'Add'}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border-2 border-[#25D366]/30 bg-[#25D366]/5 space-y-3">
                        {!otpSent ? (
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                value={phoneInput}
                                onChange={e => setPhoneInput(e.target.value)}
                                placeholder="10-digit WhatsApp number"
                                maxLength={10}
                                className="pl-9 h-11 rounded-xl bg-white dark:bg-slate-950"
                              />
                            </div>
                            <Button type="button" onClick={handleSendOtp} disabled={isSendingOtp} className="h-11 rounded-xl font-bold bg-[#25D366] hover:bg-[#1ebe5d] text-white">
                              {isSendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">OTP WhatsApp par bheja gaya <span className="font-bold text-slate-700 dark:text-slate-300">+91 {phoneInput}</span> pe</p>
                            <div className="flex gap-2">
                              <Input
                                value={otpInput}
                                onChange={e => setOtpInput(e.target.value)}
                                placeholder="6-digit OTP"
                                maxLength={6}
                                className="h-11 rounded-xl bg-white dark:bg-slate-950"
                              />
                              <Button type="button" onClick={handleLinkPhone} disabled={isVerifyingOtp} className="h-11 rounded-xl font-bold bg-[#25D366] hover:bg-[#1ebe5d] text-white">
                                {isVerifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                              </Button>
                            </div>
                            <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-muted-foreground underline">Number change karo</button>
                          </div>
                        )}
                        <button type="button" onClick={() => setEditingPhone(false)} className="text-xs text-muted-foreground underline">Cancel</button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="font-bold text-sm">Email</Label>
                    {!editingEmail ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        {currentUser?.email ? (
                          <span className="font-medium text-slate-700 dark:text-slate-300">{currentUser.email}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not added</span>
                        )}
                        <button
                          type="button"
                          onClick={() => { setEditingEmail(true); setEmailInput(currentUser?.email || ''); }}
                          className="ml-auto flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          <Pencil className="h-3 w-3" /> {currentUser?.email ? 'Change' : 'Add'}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border-2 border-primary/30 bg-primary/5 space-y-3">
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            value={emailInput}
                            onChange={e => setEmailInput(e.target.value)}
                            placeholder="you@example.com"
                            className="pl-9 h-11 rounded-xl bg-white dark:bg-slate-950"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" onClick={handleSaveEmail} disabled={isSavingEmail} className="h-10 rounded-xl font-bold flex-1">
                            {isSavingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Email'}
                          </Button>
                          <button type="button" onClick={() => setEditingEmail(false)} className="text-xs text-muted-foreground underline px-2">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-sm">Are you? <span className="text-muted-foreground font-normal">(select all that apply)</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                      {WHO_OPTIONS.map(({ value, icon: Icon }) => {
                        const checked = roles.includes(value);
                        return (
                          <button
                            type="button"
                            key={value}
                            onClick={() => toggleWhoRole(value)}
                            className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all ${checked ? 'border-primary bg-primary/5' : 'border-muted hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          >
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-bold text-sm">{value}</span>
                            {checked && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 rounded-xl font-bold" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Card className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="pt-6">
                {!showPasswordForm ? (
                  <Button type="button" onClick={() => setShowPasswordForm(true)} className="rounded-xl font-bold h-11">
                    <KeyRound className="h-4 w-4 mr-2" /> Change Password
                  </Button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-5">
                    {hasPassword && (
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="font-bold text-sm">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="font-bold text-sm">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="font-bold text-sm">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="h-11 rounded-xl font-bold flex-1" disabled={isChangingPassword}>
                        {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
                        {isChangingPassword ? 'Updating...' : (hasPassword ? 'Update Password' : 'Set Password')}
                      </Button>
                      <Button type="button" variant="outline" className="h-11 rounded-xl font-bold" onClick={() => setShowPasswordForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
            <Card className="rounded-2xl border-destructive/20 bg-destructive/5 dark:bg-destructive/10 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-destructive/70">
                  Permanently delete your account and all your data. This cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="rounded-xl font-bold h-11">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        All your data including listings and saved properties will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold"
                      >
                        {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
