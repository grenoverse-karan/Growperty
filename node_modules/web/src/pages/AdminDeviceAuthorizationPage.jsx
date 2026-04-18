import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Loader2, ArrowLeft, MonitorSmartphone, CheckCircle2 } from 'lucide-react';

const AdminDeviceAuthorizationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const state = location.state;

  if (!state || !state.adminId || !state.fingerprint) {
    return <Navigate to="/admin-login" replace />;
  }

  const { adminId, fingerprint, deviceInfo } = state;

  const handleRequest = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      // Check if request already exists
      const existing = await pb.collection('pending_authorizations').getFullList({
        filter: `admin_id="${adminId}" && device_fingerprint="${fingerprint}" && status="pending"`,
        $autoCancel: false
      });

      if (existing.length === 0) {
        await pb.collection('pending_authorizations').create({
          admin_id: adminId,
          device_fingerprint: fingerprint,
          device_info: deviceInfo,
          status: 'pending'
        }, { $autoCancel: false });
      }
      
      setIsSuccess(true);
    } catch (err) {
      console.error('Error requesting authorization:', err);
      setError('Failed to send authorization request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Device Authorization - Growperty Admin</title>
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
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white hover:bg-white/10 mb-6"
            onClick={() => navigate('/admin-login')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
          </Button>

          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
            <div className="h-2 bg-amber-500 w-full"></div>
            <CardHeader className="space-y-3 pb-6 pt-8 px-8">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                <MonitorSmartphone className="h-8 w-8 text-amber-500" />
              </div>
              <CardTitle className="text-2xl font-extrabold text-center text-white">Unauthorized Device</CardTitle>
              <CardDescription className="text-center text-slate-400 font-medium">
                This device is not recognized for admin access.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {isSuccess ? (
                <div className="text-center space-y-6">
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 flex flex-col items-center">
                    <CheckCircle2 className="h-10 w-10 mb-3" />
                    <p className="font-bold text-lg mb-1">Request Sent</p>
                    <p className="text-sm text-green-400/80">
                      Authorization request sent. Please check your email or contact the master administrator to approve this device.
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/admin-login')}
                    className="w-full h-12 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    Return to Login
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Browser</span>
                      <span className="text-slate-300 font-medium">{deviceInfo?.browser}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">OS</span>
                      <span className="text-slate-300 font-medium">{deviceInfo?.os}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Resolution</span>
                      <span className="text-slate-300 font-medium">{deviceInfo?.resolution}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-destructive/20 border border-destructive/30 text-destructive text-sm font-medium text-center">
                      {error}
                    </div>
                  )}

                  <Button 
                    onClick={handleRequest}
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl font-bold text-lg bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending Request...
                      </>
                    ) : (
                      'Request Authorization'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AdminDeviceAuthorizationPage;