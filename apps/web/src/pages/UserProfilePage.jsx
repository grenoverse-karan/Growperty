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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, User, MapPin, Phone, Mail, CheckCircle2, LogOut, Trash2, Save, ArrowLeft, Home, Briefcase, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const UserProfilePage = () => {
  const { currentUser, getToken, logout, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [role, setRole] = useState(currentUser?.role || 'buyer');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayPhone = currentUser?.phone
    ? currentUser.phone.replace(/^91/, '')
    : null;

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
        body: JSON.stringify({ name: name.trim(), city: city.trim(), role }),
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

  const providerLabel = currentUser?.provider === 'whatsapp'
    ? 'WhatsApp'
    : currentUser?.provider === 'google'
    ? 'Google'
    : 'Email';

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
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="font-bold capitalize text-xs">
                  {currentUser?.role || 'buyer'}
                </Badge>
                <Badge variant="outline" className="font-bold text-xs gap-1">
                  {currentUser?.provider === 'whatsapp' && <MessageCircle className="h-3 w-3 text-[#25D366]" />}
                  {providerLabel}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Info (read-only) */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Contact</CardTitle>
                <CardDescription>Your verified contact details — cannot be changed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayPhone && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">+91 {displayPhone}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                  </div>
                )}
                {currentUser?.email && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{currentUser.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit Profile */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
            <Card className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Profile Information</CardTitle>
                <CardDescription>Update your name, city and account type.</CardDescription>
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

                  <div className="space-y-2">
                    <Label className="font-bold text-sm">I want to</Label>
                    <RadioGroup value={role} onValueChange={setRole} className="grid grid-cols-2 gap-3">
                      <div>
                        <RadioGroupItem value="buyer" id="role-buyer" className="peer sr-only" />
                        <Label htmlFor="role-buyer" className="flex items-center gap-2 rounded-xl border-2 border-muted bg-transparent p-3 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                          <Home className="h-4 w-4 text-primary" />
                          <span className="font-bold text-sm">Buy / Rent</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="seller" id="role-seller" className="peer sr-only" />
                        <Label htmlFor="role-seller" className="flex items-center gap-2 rounded-xl border-2 border-muted bg-transparent p-3 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span className="font-bold text-sm">Sell / List</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full h-11 rounded-xl font-bold" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
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
