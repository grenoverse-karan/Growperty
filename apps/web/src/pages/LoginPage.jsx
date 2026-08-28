import React, { useState } from 'react';
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
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const authData = await login(email, password);
      const role = authData.user?.role;
      if (role === 'seller') {
        navigate('/dashboard/seller', { replace: true });
      } else if (role === 'buyer') {
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
            <CardFooter className="flex flex-col items-center gap-3 pb-8">
              <p className="text-sm text-muted-foreground font-medium">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-primary hover:underline">
                  Sign up
                </Link>
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Are you a Channel Partner?{' '}
                <Link to="/cp/login" className="font-bold text-primary hover:underline">
                  CP Login
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