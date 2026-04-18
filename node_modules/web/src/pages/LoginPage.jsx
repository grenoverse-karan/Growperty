import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Building2, Loader2, Mail, Lock } from 'lucide-react';
import WhatsAppOTPLogin from '@/components/WhatsAppOTPLogin.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    console.log('Production login page loaded');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const authData = await login(email, password);
      if (authData.record.role === 'seller') {
        navigate('/dashboard/seller', { replace: true });
      } else if (authData.record.role === 'buyer') {
        navigate('/dashboard/buyer', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    console.log(`[LoginPage] Initiating ${provider} OAuth...`);
    if (provider === 'google') {
      loginWithGoogle()
        .then((authData) => {
          console.log('[LoginPage] Google login successful', authData);
          navigate(authData?.record?.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer', { replace: true });
        })
        .catch(err => console.error('[LoginPage] Google login failed', err));
    } else if (provider === 'facebook') {
      loginWithFacebook()
        .then((authData) => {
          console.log('[LoginPage] Facebook login successful', authData);
          navigate(authData?.record?.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer', { replace: true });
        })
        .catch(err => console.error('[LoginPage] Facebook login failed', err));
    }
  };

  return (
    <>
      <Helmet>
        <title>Log In - Growperty.com</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none"></div>
        
        <Link to="/" className="flex items-center space-x-2 mb-8 relative z-10 transition-transform hover:scale-105">
          <div className="bg-primary p-2 rounded-xl shadow-sm">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <span className="text-3xl font-extrabold text-foreground tracking-tight">Growperty<span className="text-primary">.com</span></span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="rounded-3xl shadow-xl border-border/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="text-3xl font-extrabold tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-base font-medium">
                Log in to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Primary Login Method: WhatsApp */}
              <WhatsAppOTPLogin />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground font-bold tracking-wider">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Secondary Login Methods: OAuth */}
              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" onClick={() => handleOAuth('google')} className="h-12 rounded-xl font-bold border-border/60 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
                <Button type="button" variant="outline" onClick={() => handleOAuth('facebook')} className="h-12 rounded-xl font-bold border-border/60 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <svg className="mr-2 h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground font-bold tracking-wider">
                    OR LOGIN WITH EMAIL
                  </span>
                </div>
              </div>

              {/* Tertiary Login Method: Email/Password */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-bold">Password</Label>
                    <Link to="/reset-password" className="text-sm font-bold text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <Button type="submit" variant="secondary" className="w-full h-12 rounded-xl font-bold text-base shadow-sm transition-all active:scale-[0.98]" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log in with Email'}
                </Button>
              </form>

            </CardContent>
            <CardFooter className="flex justify-center pb-8">
              <p className="text-sm text-muted-foreground font-medium">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;