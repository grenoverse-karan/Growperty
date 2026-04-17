import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Loader2, Mail, Lock, User, Home, Briefcase } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'buyer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await signup(formData);
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      let authData;
      if (provider === 'google') authData = await loginWithGoogle();
      if (provider === 'facebook') authData = await loginWithFacebook();
      
      if (authData?.record?.role === 'seller') {
        navigate('/dashboard/seller', { replace: true });
      } else {
        navigate('/dashboard/buyer', { replace: true });
      }
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - Growperty.com</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-background p-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none"></div>
        
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
              <CardTitle className="text-3xl font-extrabold tracking-tight">Create an account</CardTitle>
              <CardDescription className="text-base font-medium">
                Join Growperty to buy, sell, or rent properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-3 mb-6">
                  <Label className="font-bold text-sm text-muted-foreground uppercase tracking-wider">I want to</Label>
                  <RadioGroup 
                    defaultValue="buyer" 
                    onValueChange={(val) => setFormData({...formData, role: val})}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="buyer" id="buyer" className="peer sr-only" />
                      <Label
                        htmlFor="buyer"
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        <Home className="mb-2 h-6 w-6 text-primary" />
                        <span className="font-bold">Buy / Rent</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="seller" id="seller" className="peer sr-only" />
                      <Label
                        htmlFor="seller"
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-slate-50 dark:hover:bg-slate-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                      >
                        <Briefcase className="mb-2 h-6 w-6 text-primary" />
                        <span className="font-bold">Sell / List</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      required 
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-bold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        required 
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm" className="font-bold">Confirm</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="passwordConfirm" 
                        type="password" 
                        required 
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        className="pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive font-bold">{error}</p>}

                <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base shadow-md bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] mt-2" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground font-bold tracking-wider">
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleOAuth('google')} className="h-12 rounded-xl font-bold border-border/60 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" onClick={() => handleOAuth('facebook')} className="h-12 rounded-xl font-bold border-border/60 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <svg className="mr-2 h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-8">
              <p className="text-sm text-muted-foreground font-medium">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default SignupPage;