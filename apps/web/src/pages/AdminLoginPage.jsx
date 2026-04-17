import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Loader2, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const { adminLogin, isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';
  const initialMessage = location.state?.message || '';

  useEffect(() => {
    // Redirect if already authenticated
    if (isAdminAuthenticated) {
      navigate(from, { replace: true });
    }

    // Load remembered email
    const savedEmail = localStorage.getItem('admin_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [isAdminAuthenticated, navigate, from]);

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(val)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) validateEmail(val);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const isEmailValid = validateEmail(email);
    if (!isEmailValid || !password) {
      if (!password) setError('Password is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminLogin(email, password);
      
      if (rememberMe) {
        localStorage.setItem('admin_remembered_email', email.trim());
      } else {
        localStorage.removeItem('admin_remembered_email');
      }
      
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Portal Login - Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-500/5 blur-[100px]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Button 
            variant="ghost" 
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 -ml-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Website
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
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-extrabold text-center text-slate-900 dark:text-white">Admin Portal</CardTitle>
                <CardDescription className="text-center text-slate-500 dark:text-slate-400 font-medium">
                  Secure access for authorized personnel only
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 sm:px-8 pb-8">
                {initialMessage && !error && (
                  <div className="mb-6 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm font-medium flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
                    <p>{initialMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-bold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@growperty.com"
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => validateEmail(email)}
                      className={`h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-primary ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      disabled={isSubmitting}
                    />
                    {emailError && <p className="text-xs text-destructive font-medium mt-1">{emailError}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-bold">Password</Label>
                      <Link 
                        to="/admin-forgot-password" 
                        className="text-sm font-bold text-primary hover:text-primary/80 hover:underline transition-colors"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus-visible:ring-primary pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        tabIndex="-1"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                      disabled={isSubmitting}
                      className="rounded-md"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 dark:text-slate-400 cursor-pointer"
                    >
                      Remember my email
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 text-white mt-6 transition-all active:scale-[0.98]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      'Sign In to Dashboard'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;