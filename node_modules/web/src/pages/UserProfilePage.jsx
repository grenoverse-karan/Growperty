import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, User, MapPin, Phone, CheckCircle2, LogOut, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

const UserProfilePage = () => {
  const { currentUser, whatsappPhone, logout } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayPhone = whatsappPhone || currentUser?.phone || currentUser?.email?.split('@')[0] || 'Not provided';
  const isPhoneVerified = !!(whatsappPhone || currentUser?.phone || currentUser?.email?.includes('whatsapp.local'));

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !city.trim()) {
      toast.error('Name and City are required');
      return;
    }

    setIsSaving(true);
    try {
      await pb.collection('users').update(currentUser.id, {
        name: name.trim(),
        city: city.trim(),
      }, { $autoCancel: false });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await pb.collection('users').delete(currentUser.id, { $autoCancel: false });
      toast.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>My Profile - Growperty.com</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Account Settings</h1>
            <Button variant="outline" onClick={handleLogout} className="font-bold rounded-xl border-border/60 hover:bg-slate-100 dark:hover:bg-slate-800">
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="rounded-3xl shadow-lg border-border/50 bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-border/50 pb-6">
                <CardTitle className="text-xl font-bold flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-bold text-slate-700 dark:text-slate-300">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="name" 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 focus-visible:ring-primary text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="font-bold text-slate-700 dark:text-slate-300">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                          id="city" 
                          type="text" 
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 focus-visible:ring-primary text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-slate-700 dark:text-slate-300">Mobile Number</Label>
                      {isPhoneVerified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 font-bold">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="text" 
                        value={displayPhone}
                        disabled
                        className="pl-10 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Mobile number cannot be changed once verified.</p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" className="h-12 px-8 rounded-xl font-bold shadow-md bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]" disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="rounded-3xl border-destructive/20 bg-destructive/5 dark:bg-destructive/10 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-destructive flex items-center">
                  <Trash2 className="w-5 h-5 mr-2" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-destructive/80">
                  Permanently delete your account and all associated data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="font-bold rounded-xl">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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