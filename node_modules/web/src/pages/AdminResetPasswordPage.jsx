import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { resetPassword } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await resetPassword(token, password);
      console.log(`Password reset completed for: ${result.email}`);
      setSuccess(true);
      toast.success('Password reset successful');
      setTimeout(() => {
        navigate('/admin-login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Set New Password - Growperty.com</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
            <div className="h-2 bg-primary w-full"></div>
            <CardHeader className="space-y-3 pb-6 pt-8 px-8">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                <ShieldAlert className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-extrabold text-center text-white">Set New Password</CardTitle>
              <CardDescription className="text-center text-slate-400 font-medium">
                Create a strong password for your admin account
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {success ? (
                <div className="space-y-6 text-center">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex flex-col items-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
                    <p className="text-green-200 font-medium">Password reset successful</p>
                    <p className="text-sm text-green-200/70 mt-2">Redirecting to login...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-xl bg-destructive/20 border border-destructive/30 text-destructive text-sm font-medium text-center">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300 font-bold">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="h-12 rounded-xl bg-slate-950 border-slate-800 text-white focus-visible:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300 font-bold">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      className="h-12 rounded-xl bg-slate-950 border-slate-800 text-white focus-visible:ring-primary"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl font-bold text-lg bg-primary hover:bg-primary/90 text-white mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating...</>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AdminResetPasswordPage;