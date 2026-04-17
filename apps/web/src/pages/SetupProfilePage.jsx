import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const SetupProfilePage = () => {
  const { currentUser, whatsappPhone } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [isLoading, setIsLoading] = useState(false);

  const displayPhone = whatsappPhone || currentUser?.phone || 'Not provided';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim() || !city.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await pb.collection('users').update(currentUser.id, {
        name: name.trim(),
        city: city.trim(),
      }, { $autoCancel: false });
      
      toast.success('Profile created successfully');
      navigate('/');
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Complete Your Profile - Growperty.com</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="rounded-3xl shadow-xl border-border/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight">Complete Profile</CardTitle>
              <CardDescription className="text-base font-medium">
                Just a few more details to get you started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-700 dark:text-slate-300">Mobile Number</Label>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 font-bold">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                    </Badge>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold text-slate-700 dark:text-slate-300">Full Name <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Enter your full name" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-primary text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="font-bold text-slate-700 dark:text-slate-300">City <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      id="city" 
                      type="text" 
                      placeholder="e.g. Noida, Greater Noida" 
                      required 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-primary text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base shadow-md bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] mt-4" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {isLoading ? 'Saving...' : 'Complete Setup'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default SetupProfilePage;