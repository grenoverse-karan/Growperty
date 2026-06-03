import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MessageSquare, User, PlusCircle, Eye, MapPin, IndianRupee, Loader2, Phone, Calendar, CheckCircle2, Clock, XCircle, EyeOff } from 'lucide-react';

const formatPrice = (price) => {
  if (!price) return 'N/A';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

const StatusBadge = ({ status }) => {
  const map = {
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    unlisted: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    sold:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[status] || map.pending}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const VisitStatusBadge = ({ status }) => {
  const map = {
    pending:   { cls: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3 mr-1" /> },
    confirmed: { cls: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
    cancelled: { cls: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3 mr-1" /> },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center ${s.cls}`}>
      {s.icon}{status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const SellerDashboard = () => {
  const { currentUser, getToken } = useAuth();
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingVisits, setLoadingVisits] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    fetchProperties();
    fetchVisits();
  }, [currentUser]);

  const fetchProperties = async () => {
    setLoadingProps(true);
    try {
      const records = await pb.collection('properties').getList(1, 50, {
        filter: `owner_id = "${currentUser._id || currentUser.id}"`,
        sort: '-created',
        $autoCancel: false,
      });
      setProperties(records.items);
    } catch {
      toast.error('Could not load your listings');
    } finally {
      setLoadingProps(false);
    }
  };

  const fetchVisits = async () => {
    setLoadingVisits(true);
    try {
      if (!currentUser.phone) { setLoadingVisits(false); return; }
      const res = await apiServerClient.fetch(
        `/visit-requests?visitorPhone=${currentUser.phone}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      // These are visits the seller received — filter by their property phone
      // Seller sees visits on THEIR properties, not visits they made
      // Fetch by property owner: get all visits for each property
      const propIds = properties.map(p => p.id);
      const allVisits = [];
      for (const pid of propIds.slice(0, 10)) {
        const r = await apiServerClient.fetch(`/visit-requests?propertyId=${pid}`);
        const d = await r.json();
        if (d.items) allVisits.push(...d.items);
      }
      setVisits(allVisits);
    } catch {
      // silent
    } finally {
      setLoadingVisits(false);
    }
  };

  // re-fetch visits after properties load
  useEffect(() => {
    if (properties.length > 0) {
      const fetchPropertyVisits = async () => {
        const allVisits = [];
        for (const p of properties.slice(0, 10)) {
          try {
            const r = await apiServerClient.fetch(`/visit-requests?propertyId=${p.id}`);
            const d = await r.json();
            if (d.items) allVisits.push(...d.items.map(v => ({ ...v, propertyTitle: p.name || p.houseNo })));
          } catch {}
        }
        setVisits(allVisits);
        setLoadingVisits(false);
      };
      fetchPropertyVisits();
    }
  }, [properties]);

  const handleUnlist = async (propertyId) => {
    if (!window.confirm('Unlist this property?')) return;
    try {
      const res = await apiServerClient.fetch(`/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'unlisted' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed');
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: 'unlisted' } : p));
      toast.success('Property unlisted.');
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    }
  };

  const activeCount = properties.filter(p => p.status === 'approved').length;
  const pendingCount = properties.filter(p => p.status === 'pending').length;

  return (
    <>
      <Helmet><title>Seller Dashboard — Growperty.com</title></Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                  Seller Dashboard
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Welcome, <span className="font-bold text-foreground">{currentUser?.name || 'Seller'}</span> · {currentUser?.phone?.slice(-10) || currentUser?.email || ''}
                </p>
              </div>
              <Button asChild className="rounded-xl font-bold h-11 px-5 shrink-0">
                <Link to="/list-property"><PlusCircle className="h-4 w-4 mr-2" /> List New Property</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Listed', value: properties.length, icon: <Building2 className="h-5 w-5" />, color: 'text-primary' },
                { label: 'Live / Approved', value: activeCount, icon: <Eye className="h-5 w-5" />, color: 'text-green-600' },
                { label: 'Pending Review', value: pendingCount, icon: <Clock className="h-5 w-5" />, color: 'text-yellow-600' },
                { label: 'Visit Requests', value: visits.length, icon: <MessageSquare className="h-5 w-5" />, color: 'text-blue-600' },
              ].map(s => (
                <Card key={s.label} className="rounded-2xl border-border/50 shadow-sm">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className={`p-2 bg-slate-100 dark:bg-slate-800 rounded-xl ${s.color}`}>{s.icon}</div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">{s.label}</p>
                      <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="listings" className="space-y-6">
              <TabsList className="bg-white dark:bg-slate-900 border border-border/50 p-1 rounded-xl h-auto gap-1">
                <TabsTrigger value="listings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2 px-4 font-bold text-sm">
                  <Building2 className="h-4 w-4 mr-1.5" /> My Listings
                </TabsTrigger>
                <TabsTrigger value="visits" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2 px-4 font-bold text-sm">
                  <MessageSquare className="h-4 w-4 mr-1.5" /> Visit Requests
                </TabsTrigger>
                <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2 px-4 font-bold text-sm">
                  <User className="h-4 w-4 mr-1.5" /> Profile
                </TabsTrigger>
              </TabsList>

              {/* Listings Tab */}
              <TabsContent value="listings" className="focus-visible:outline-none">
                {loadingProps ? (
                  <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : properties.length === 0 ? (
                  <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                      <p className="font-bold text-lg text-foreground mb-1">No listings yet</p>
                      <p className="text-muted-foreground text-sm mb-6">List your first property and start getting enquiries.</p>
                      <Button asChild className="rounded-xl font-bold">
                        <Link to="/list-property"><PlusCircle className="h-4 w-4 mr-2" /> List a Property</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {properties.map(p => (
                      <Card key={p.id} className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900/50">
                        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-bold text-foreground truncate">{p.bhk} {p.propertyType} — {p.houseNo || p.name || 'Property'}</span>
                              <StatusBadge status={p.status} />
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{p.sector}, {p.city}</span>
                              {p.price && <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{formatPrice(p.price)}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button asChild variant="outline" size="sm" className="rounded-lg font-bold">
                              <Link to={`/property/${p.id}`}><Eye className="h-4 w-4 mr-1" /> View</Link>
                            </Button>
                            {p.status !== 'unlisted' && p.status !== 'sold' && (
                              <Button variant="ghost" size="sm" className="rounded-lg font-bold text-muted-foreground hover:text-destructive" onClick={() => handleUnlist(p.id)}>
                                <EyeOff className="h-4 w-4 mr-1" /> Unlist
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Visit Requests Tab */}
              <TabsContent value="visits" className="focus-visible:outline-none">
                {loadingVisits ? (
                  <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : visits.length === 0 ? (
                  <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                      <p className="font-bold text-lg text-foreground mb-1">No visit requests yet</p>
                      <p className="text-muted-foreground text-sm">When buyers request a visit, they'll appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {visits.map(v => (
                      <Card key={v.id || v._id} className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900/50">
                        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="font-bold text-foreground">{v.visitorName}</p>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{v.visitorPhone}</span>
                              {v.visitDate && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{v.visitDate} {v.visitTime || ''}</span>}
                              {v.propertyTitle && <span className="text-xs text-muted-foreground">· {v.propertyTitle}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <VisitStatusBadge status={v.status} />
                            <Button asChild variant="outline" size="sm" className="rounded-lg font-bold">
                              <a href={`tel:${v.visitorPhone}`}><Phone className="h-4 w-4 mr-1" /> Call</a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="focus-visible:outline-none">
                <Card className="rounded-2xl border-border/50 shadow-sm max-w-lg">
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>Your account details and contact info.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {[
                      { label: 'Name', value: currentUser?.name },
                      { label: 'Phone', value: currentUser?.phone?.replace(/^91/, '+91 ') },
                      { label: 'Email', value: currentUser?.email },
                      { label: 'City', value: currentUser?.city },
                      { label: 'Role', value: currentUser?.role },
                      { label: 'Login via', value: currentUser?.provider },
                    ].filter(r => r.value).map(r => (
                      <div key={r.label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="font-bold text-muted-foreground">{r.label}</span>
                        <span className="font-semibold text-foreground capitalize">{r.value}</span>
                      </div>
                    ))}
                    <Button asChild className="w-full rounded-xl font-bold mt-4">
                      <Link to="/profile">Edit Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default SellerDashboard;
