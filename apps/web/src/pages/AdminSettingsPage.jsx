import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Loader2, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettingsPage = () => {
  const { currentAdmin, changePassword } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const initialMessage = location.state?.message || '';
  const isForced = currentAdmin?.requiresPasswordChange;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully. Please log in again.');
      navigate('/admin-login', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Settings - Growperty.com</title>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          
          {!isForced && (
            <Button 
              variant="ghost" 
              className="mb-6"
              onClick={() => navigate('/admin-dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          )}

          {isForced && (
            <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-start gap-4">
              <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400">Security Requirement</h3>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  {initialMessage || 'You are using a temporary or compromised password. You must change it before accessing the admin dashboard.'}
                </p>
              </div>
            </div>
          )}

          <Card className="shadow-lg rounded-3xl border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-extrabold">Change Password</CardTitle>
                  <CardDescription className="text-base mt-1">
                    Update your admin account password. This will log you out for security.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setError('');
                    }}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl font-bold text-base shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating Password...</>
                  ) : (
                    'Update Password & Logout'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminSettingsPage;