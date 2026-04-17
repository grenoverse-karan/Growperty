import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonitorSmartphone, ShieldAlert, ArrowLeft, Trash2, LogOut, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const AdminDeviceManagementPage = () => {
  const { currentAdmin, currentDeviceFingerprint, getAuthorizedDevices, revokeDevice, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const data = await getAuthorizedDevices();
      setDevices(data);
    } catch (error) {
      console.error('Failed to load devices:', error);
      toast.error('Failed to load authorized devices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (deviceId, isCurrentDevice) => {
    if (window.confirm('Are you sure you want to revoke access for this device?')) {
      try {
        await revokeDevice(deviceId);
        toast.success('Device access revoked');
        if (isCurrentDevice) {
          logout();
          navigate('/admin-login');
        } else {
          loadDevices();
        }
      } catch (error) {
        toast.error('Failed to revoke device');
      }
    }
  };

  const handleLogoutAllOther = async () => {
    if (window.confirm('This will revoke access for all devices except this one. Continue?')) {
      try {
        const otherDevices = devices.filter(d => d.device_fingerprint !== currentDeviceFingerprint && d.status === 'active');
        
        for (const device of otherDevices) {
          await revokeDevice(device.id);
        }
        
        toast.success('All other devices revoked');
        loadDevices();
      } catch (error) {
        toast.error('Failed to revoke some devices');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Device Management - Admin Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <header className="bg-slate-950 text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin-dashboard')} className="text-slate-300 hover:text-white hover:bg-white/10 mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <ShieldAlert className="h-5 w-5 text-primary" />
              <span className="font-extrabold text-xl tracking-tight">Security Settings</span>
            </div>
          </div>
        </header>

        <main className="flex-1 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-foreground mb-2">Authorized Devices</h1>
                  <p className="text-muted-foreground font-medium">Manage devices that have access to your admin account.</p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleLogoutAllOther}
                  disabled={devices.filter(d => d.device_fingerprint !== currentDeviceFingerprint && d.status === 'active').length === 0}
                  className="font-bold rounded-xl shadow-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout All Other Devices
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {devices.map((device) => {
                    const isCurrent = device.device_fingerprint === currentDeviceFingerprint;
                    const isActive = device.status === 'active';
                    
                    return (
                      <Card key={device.id} className={`border-border/50 shadow-sm ${isCurrent ? 'ring-2 ring-primary/50 bg-primary/5 dark:bg-primary/5' : ''}`}>
                        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                          <div className={`p-4 rounded-2xl ${isCurrent ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'}`}>
                            <MonitorSmartphone className="h-8 w-8" />
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold text-foreground">
                                {device.device_info?.device_name || 'Unknown Device'}
                              </h3>
                              {isCurrent && <Badge className="bg-primary text-primary-foreground">This Device</Badge>}
                              {!isActive && <Badge variant="destructive">Revoked</Badge>}
                            </div>
                            
                            <div className="text-sm text-muted-foreground font-medium space-y-1">
                              <p>Browser: {device.device_info?.browser} on {device.device_info?.os}</p>
                              <p className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1.5" /> 
                                Last active: {new Date(device.last_login).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {isActive && (
                            <Button 
                              variant="outline" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 font-bold rounded-xl w-full sm:w-auto"
                              onClick={() => handleRevoke(device.id, isCurrent)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Revoke Access
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {devices.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-slate-900/50 rounded-2xl border border-border/50">
                      <p className="text-muted-foreground font-medium">No devices found.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDeviceManagementPage;