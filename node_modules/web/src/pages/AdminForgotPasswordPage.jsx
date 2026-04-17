import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KeyRound, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const AdminForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const { requestPasswordReset } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to process request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Password Recovery - Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Button 
            variant="ghost" 
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 -ml-4"
            onClick={() => navigate('/admin-login')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-border/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
              <div className="h-1.5 bg-primary w-full"></div>
              <CardHeader className="space-y-3 pb-6 pt-8 px-6 sm:px-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-extrabold text-center text-slate-900 dark:text-white">Reset Password</CardTitle>
                <CardDescription className="text-center text-slate-500 dark:text-slate-400 font-medium">
                  Enter your admin email to receive reset instructions
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 sm:px-8 pb-8">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex flex-col items-center">
                      <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400 mb-3" />
                      <h3 className="text-lg font-bold text-green-800 dark:text-green-300 mb-1">Check your inbox</h3>
                      <p className="text-sm text-green-700 dark:text-green-400/80">
                        We've sent a password reset link to <strong>{email}</strong>.
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate('/admin-login')}
                      className="w-full h-12 rounded-xl font-bold text-base"
                    >
                      Return to Login
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-bold">Admin Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@growperty.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-primary"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 text-white mt-6 transition-all active:scale-[0.98]"
                      disabled={isSubmitting || !email.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending Link...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminForgotPasswordPage;