import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, LayoutDashboard, LogOut, Loader2, ShieldCheck, Menu, X, Clock, CheckCircle2, Ban, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import AdminPropertyFilter from '@/components/AdminPropertyFilter.jsx';
import AdminPropertyTable from '@/components/AdminPropertyTable.jsx';
import AdminRequirementsTab from '@/components/AdminRequirementsTab.jsx';

const AdminDashboard = () => {
  const { currentAdmin, adminLogout, token, isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' or 'requirements'
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin-login');
    }
  }, [isAdminAuthenticated, navigate]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    
    setIsStatsLoading(true);
    setStatsError(null);
    try {
      const response = await apiServerClient.fetch('/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        adminLogout(false);
        toast.error('Session expired, please login again');
        navigate('/admin-login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError('Failed to load statistics');
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsStatsLoading(false);
    }
  }, [token, adminLogout, navigate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin-login');
  };

  const adminName = currentAdmin?.name || 'Administrator';
  const adminEmail = currentAdmin?.email || '';

  const renderSidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl"><ShieldCheck className="h-6 w-6 text-white" /></div>
          <span className="font-extrabold text-xl text-white tracking-tight">Admin Panel</span>
        </div>
        <button className="lg:hidden ml-auto text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="mb-6 px-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
          <button
            onClick={() => { setActiveTab('properties'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${activeTab === 'properties' ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Properties
          </button>
          <button
            onClick={() => { setActiveTab('requirements'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 mt-2 ${activeTab === 'requirements' ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Users className="h-5 w-5" />
            Buyer Requirements
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{adminName}</p>
            <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="destructive" className="w-full font-bold rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-0">
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </div>
    </aside>
  );

  if (!isAdminAuthenticated) return null;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {renderSidebar()}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-border/50 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-extrabold text-lg">Admin Panel</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
              
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {activeTab === 'properties' ? 'Property Management' : 'Buyer Requirements'}
                  </h1>
                  <p className="text-muted-foreground font-medium mt-1">
                    {activeTab === 'properties' ? 'Review, approve, and manage property listings.' : 'Manage and match buyer requirements with listings.'}
                  </p>
                </div>
                <div className="hidden lg:flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{adminName}</p>
                    <p className="text-xs text-muted-foreground">{adminEmail}</p>
                  </div>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="rounded-lg font-bold">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              </div>

              {activeTab === 'properties' && (
                <>
                  {statsError ? (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <p className="font-bold">{statsError}</p>
                      <Button variant="outline" size="sm" onClick={fetchStats} className="ml-auto">Retry</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="rounded-2xl shadow-sm border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400">
                            <Building2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider">Today's New</p>
                            <div className="flex items-center gap-2">
                              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> : (
                                <p className="text-2xl font-extrabold text-blue-900 dark:text-blue-400">{stats?.todaysNew || 0}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl shadow-sm border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                            <Clock className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider">Total Pending</p>
                            <div className="flex items-center gap-2">
                              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-amber-600" /> : (
                                <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-400">{stats?.totalPending || 0}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl shadow-sm border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-xl text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-green-800 dark:text-green-500 uppercase tracking-wider">Active Listings</p>
                            <div className="flex items-center gap-2">
                              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-green-600" /> : (
                                <p className="text-2xl font-extrabold text-green-900 dark:text-green-400">{stats?.activeListings || 0}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl shadow-sm border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50">
                        <CardContent className="p-5 flex items-center gap-4">
                          <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-400">
                            <Ban className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Suspended Accs</p>
                            <div className="flex items-center gap-2">
                              {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-600" /> : (
                                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-300">{stats?.suspendedAccounts || 0}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <AdminPropertyFilter />
                  <AdminPropertyTable refreshTrigger={refreshTrigger} />
                </>
              )}

              {activeTab === 'requirements' && (
                <AdminRequirementsTab />
              )}

            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;