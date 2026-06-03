import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, User, MessageSquare, Loader2, Calendar, MapPin, CheckCircle2, Clock, XCircle, Home, Phone } from 'lucide-react';

const VisitStatusBadge = ({ status }) => {
  const map = {
    pending:   { cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', icon: <Clock className="h-3 w-3 mr-1" /> },
    confirmed: { cls: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
    cancelled: { cls: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', icon: <XCircle className="h-3 w-3 mr-1" /> },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center w-fit ${s.cls}`}>
      {s.icon}{status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const BuyerDashboard = () => {
  const { currentUser, getToken } = useAuth();
  const [visits, setVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    fetchVisits();
  }, [currentUser]);

  const fetchVisits = async () => {
    if (!currentUser?.phone) { setLoadingVisits(false); return; }
    setLoadingVisits(true);
    try {
      const phone10 = currentUser.phone.replace(/\D/g, '').slice(-10);
      const res = await apiServerClient.fetch(
        `/visit-requests?visitorPhone=${phone10}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      setVisits(data.items || []);
    } catch {
      // silent
    } finally {
      setLoadingVisits(false);
    }
  };

  const pendingCount = visits.filter(v => v.status === 'pending').length;
  const confirmedCount = visits.filter(v => v.status === 'confirmed').length;

  return (
    <>
      <Helmet><title>Buyer Dashboard — Growperty.com</title></Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Buyer Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome, <span className="font-bold text-foreground">{currentUser?.name || 'Buyer'}</span>
                {currentUser?.phone && <> · {currentUser.phone.replace(/^91/, '+91 ')}</>}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Site Visits', value: visits.length, icon: <MessageSquare className="h-5 w-5" />, color: 'text-primary' },
                { label: 'Pending', value: pendingCount, icon: <Clock className="h-5 w-5" />, color: 'text-yellow-600' },
                { label: 'Confirmed', value: confirmedCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-600' },
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

            <Tabs defaultValue="visits" className="space-y-6">
              <TabsList className="bg-white dark:bg-slate-900 border border-border/50 p-1 rounded-xl h-auto gap-1">
                <TabsTrigger value="visits" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2 px-4 font-bold text-sm">
                  <MessageSquare className="h-4 w-4 mr-1.5" /> My Site Visits
                </TabsTrigger>
                <TabsTrigger value="browse" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2 px-4 font-bold text-sm">
                  <Search className="h-4 w-4 mr-1.5" /> Browse Properties
                </TabsTrigger>
                <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2 px-4 font-bold text-sm">
                  <User className="h-4 w-4 mr-1.5" /> Profile
                </TabsTrigger>
              </TabsList>

              {/* Site Visits Tab */}
              <TabsContent value="visits" className="focus-visible:outline-none">
                {!currentUser?.phone ? (
                  <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                      <p className="font-bold text-lg text-foreground mb-1">Add your phone number</p>
                      <p className="text-muted-foreground text-sm mb-6">Your visit requests are linked to your phone number. Add it to your profile to see them here.</p>
                      <Button asChild className="rounded-xl font-bold">
                        <Link to="/profile">Go to Profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : loadingVisits ? (
                  <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : visits.length === 0 ? (
                  <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                      <p className="font-bold text-lg text-foreground mb-1">No site visits yet</p>
                      <p className="text-muted-foreground text-sm mb-6">Browse properties and request a visit from any listing.</p>
                      <Button asChild className="rounded-xl font-bold">
                        <Link to="/properties"><Home className="h-4 w-4 mr-2" /> Browse Properties</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {visits.map(v => (
                      <Card key={v.id || v._id} className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900/50">
                        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-foreground">Visit Request</span>
                              <VisitStatusBadge status={v.status} />
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              {v.visitDate && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{v.visitDate} {v.visitTime || ''}</span>}
                              {v.visitorCity && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{v.visitorCity}</span>}
                              {v.notes && <span className="text-xs italic">"{v.notes}"</span>}
                            </div>
                          </div>
                          <Button asChild variant="outline" size="sm" className="rounded-lg font-bold shrink-0">
                            <Link to={`/property/${v.propertyId}`}><Home className="h-4 w-4 mr-1" /> View Property</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Browse Tab */}
              <TabsContent value="browse" className="focus-visible:outline-none">
                <Card className="rounded-2xl border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle>Browse Properties</CardTitle>
                    <CardDescription>Find your perfect property in Greater Noida, Noida & YEIDA.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="rounded-xl font-bold flex-1">
                      <Link to="/properties"><Home className="h-4 w-4 mr-2" /> All Listings</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl font-bold flex-1">
                      <Link to="/post-requirement"><Search className="h-4 w-4 mr-2" /> Post Requirement</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="focus-visible:outline-none">
                <Card className="rounded-2xl border-border/50 shadow-sm max-w-lg">
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>Your account details.</CardDescription>
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

export default BuyerDashboard;
