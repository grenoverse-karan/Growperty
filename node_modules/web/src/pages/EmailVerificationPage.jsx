import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Building2, Loader2, KeyRound, ArrowRight } from 'lucide-react';

const EmailVerificationPage = () => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await verifyEmail(token);
      navigate('/login', { replace: true });
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verify Email - Growperty.com</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none"></div>
        
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
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight">Verify your email</CardTitle>
              <CardDescription className="text-base font-medium">
                We sent a verification token to <br/><span className="font-bold text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token" className="font-bold">Verification Token</Label>
                  <Input 
                    id="token" 
                    type="text" 
                    placeholder="Enter token from email" 
                    required 
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 focus-visible:ring-primary text-center tracking-widest font-mono text-lg"
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base shadow-md bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]" disabled={isLoading || !token}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Account'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center pb-8 space-y-4">
              <p className="text-sm text-muted-foreground font-medium">
                Didn't receive the email?{' '}
                <button className="font-bold text-primary hover:underline">
                  Resend token
                </button>
              </p>
              <Link to="/login" className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                Skip to log in <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default EmailVerificationPage;