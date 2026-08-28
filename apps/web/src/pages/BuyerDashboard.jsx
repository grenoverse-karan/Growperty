import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search, User, MessageSquare, Loader2, Calendar, CheckCircle2, Clock, Home, Phone,
  Heart, FileText, CalendarClock, CalendarCheck, Image as ImageIcon, Eye,
} from 'lucide-react';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=60';

const STATUS_BADGE = {
  pending:      { label: 'Pending',   className: 'bg-amber-100 text-amber-700' },
  confirmed:    { label: 'Confirmed', className: 'bg-blue-100 text-blue-700' },
  rescheduled:  { label: 'Rescheduled', className: 'bg-purple-100 text-purple-700' },
  visit_done:   { label: 'Visited',   className: 'bg-green-100 text-green-700' },
  deal_closed:  { label: 'Deal Closed', className: 'bg-green-100 text-green-700' },
  cancelled:    { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
};

const fmtPrice = (n) => {
  if (!n) return '—';
  const v = Number(n);
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2).replace(/\.?0+$/, '')} Lac`;
  return `₹${v.toLocaleString('en-IN')}`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const BuyerDashboard = () => {
  const { currentUser, getToken } = useAuth();

  const [visits, setVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);

  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);

  const fetchVisits = useCallback(async () => {
    if (!currentUser?.phone) { setLoadingVisits(false); return; }
    setLoadingVisits(true);
    try {
      const res = await apiServerClient.fetch('/visit-requests/mine', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setVisits(data.items || []);
    } catch { /* silent */ }
    finally { setLoadingVisits(false); }
  }, [currentUser?.phone, getToken]);

  const fetchWishlist = useCallback(async () => {
    setLoadingWishlist(true);
    try {
      const res = await apiServerClient.fetch('/users/me/wishlist', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setWishlist(data.items || []);
    } catch { /* silent */ }
    finally { setLoadingWishlist(false); }
  }, [getToken]);

  const fetchInquiries = useCallback(async () => {
    setLoadingInquiries(true);
    try {
      const res = await apiServerClient.fetch('/requirements/mine', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setInquiries(data.items || []);
    } catch { /* silent */ }
    finally { setLoadingInquiries(false); }
  }, [getToken]);

  useEffect(() => {
    if (!currentUser) return;
    fetchVisits();
    fetchWishlist();
    fetchInquiries();
  }, [currentUser, fetchVisits, fetchWishlist, fetchInquiries]);

  const handleRemoveFromWishlist = async (propertyId) => {
    try {
      const res = await apiServerClient.fetch(`/users/me/wishlist/${propertyId}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      setWishlist(prev => prev.filter(p => p.id !== propertyId));
    } catch { /* silent */ }
  };

  const requestedVisits = visits.filter(v => !['visit_done', 'deal_closed'].includes(v.status));
  const visitedVisits = visits.filter(v => ['visit_done', 'deal_closed'].includes(v.status));
  const pendingCount = requestedVisits.length;
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
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Total Site Visits', value: visits.length, icon: <MessageSquare className="h-5 w-5" />, color: 'text-primary' },
                { label: 'Pending', value: pendingCount, icon: <Clock className="h-5 w-5" />, color: 'text-yellow-600' },
                { label: 'Confirmed', value: confirmedCount, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-600' },
                { label: 'Wish List', value: wishlist.length, icon: <Heart className="h-5 w-5" />, color: 'text-red-500' },
                { label: 'Inquiries', value: inquiries.length, icon: <FileText className="h-5 w-5" />, color: 'text-blue-600' },
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
              <TabsList className="bg-white dark:bg-slate-900 border border-border/50 p-1 rounded-xl h-auto gap-1 flex-wrap">
                <TabsTrigger value="visits" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2 px-4 font-bold text-sm">
                  <MessageSquare className="h-4 w-4 mr-1.5" /> My Site Visits
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2 px-4 font-bold text-sm">
                  <Heart className="h-4 w-4 mr-1.5" /> Wish List
                </TabsTrigger>
                <TabsTrigger value="inquiries" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white py-2 px-4 font-bold text-sm">
                  <FileText className="h-4 w-4 mr-1.5" /> Inquiries
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
                ) : (
                  <Tabs defaultValue="requested" className="w-full">
                    <TabsList className="rounded-xl">
                      <TabsTrigger value="requested" className="text-xs font-bold rounded-lg gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" /> Request Visits ({requestedVisits.length})
                      </TabsTrigger>
                      <TabsTrigger value="visited" className="text-xs font-bold rounded-lg gap-1.5">
                        <CalendarCheck className="h-3.5 w-3.5" /> Visited ({visitedVisits.length})
                      </TabsTrigger>
                    </TabsList>

                    {[{ key: 'requested', list: requestedVisits, emptyMsg: 'No pending visit requests.' },
                      { key: 'visited', list: visitedVisits, emptyMsg: 'No completed visits yet.' }].map(({ key, list, emptyMsg }) => (
                      <TabsContent key={key} value={key} className="mt-4">
                        {loadingVisits ? (
                          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : list.length === 0 ? (
                          <Card className="rounded-2xl border-border/50 shadow-sm">
                            <CardContent className="py-16 text-center">
                              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                              <p className="font-bold text-lg text-foreground mb-1">{emptyMsg}</p>
                              <p className="text-muted-foreground text-sm mb-6">Browse properties and request a visit from any listing.</p>
                              <Button asChild className="rounded-xl font-bold">
                                <Link to="/properties"><Home className="h-4 w-4 mr-2" /> Browse Properties</Link>
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            {list.map(v => {
                              const statusInfo = STATUS_BADGE[v.status] || { label: v.status, className: 'bg-slate-100 text-slate-600' };
                              return (
                                <Card key={v.id} className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900/50">
                                  <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                                      {v.property?.image ? (
                                        <img src={v.property.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-slate-400" /></div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-bold text-sm truncate">
                                        {v.property ? v.property.type : 'Property'}
                                        {v.property?.sector ? ` · ${v.property.sector}, ${v.property.city}` : ''}
                                      </div>
                                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5">
                                        {v.visitDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(v.visitDate)} {v.visitTime || ''}</span>}
                                      </div>
                                      {v.property?.totalPrice ? <div className="text-sm font-bold text-primary mt-0.5">{fmtPrice(v.property.totalPrice)}</div> : null}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                      <Badge className={`${statusInfo.className} font-bold text-xs border-0`}>{statusInfo.label}</Badge>
                                      <Button asChild variant="outline" size="sm" className="rounded-lg font-bold">
                                        <Link to={`/property/${v.propertyId}`}><Home className="h-3.5 w-3.5 mr-1" /> View</Link>
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </TabsContent>

              {/* Wish List Tab */}
              <TabsContent value="wishlist" className="focus-visible:outline-none">
                {loadingWishlist ? (
                  <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : wishlist.length === 0 ? (
                  <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardContent className="py-16 text-center">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
                      <p className="font-bold text-lg text-foreground mb-1">No saved properties yet</p>
                      <p className="text-muted-foreground text-sm mb-6">Tap the heart icon on any property to save it here.</p>
                      <Button asChild className="rounded-xl font-bold">
                        <Link to="/properties"><Home className="h-4 w-4 mr-2" /> Browse Properties</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {wishlist.map(p => (
                      <Card key={p.id} className="rounded-2xl border-border/50 shadow-sm bg-white dark:bg-slate-900/50">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-slate-400" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{p.propertyType}{p.bhk ? ` · ${p.bhk}` : ''}</div>
                            <div className="text-xs text-muted-foreground truncate">{[p.sector, p.city].filter(Boolean).join(', ')}</div>
                            <div className="text-sm font-bold text-primary mt-0.5">{fmtPrice(p.totalPrice)}</div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button asChild variant="outline" size="icon" className="rounded-lg h-9 w-9">
                              <a href={`/property/${p.id}`} target="_blank" rel="noreferrer"><Eye className="h-4 w-4" /></a>
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-lg h-9 w-9 hover:bg-red-50" onClick={() => handleRemoveFromWishlist(p.id)}>
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Inquiries Tab */}
              <TabsContent value="inquiries" className="focus-visible:outline-none">
                <Card className="rounded-2xl border-border/50 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Inquiries</CardTitle>
                      <CardDescription>Requirements you've posted describing what you're looking for.</CardDescription>
                    </div>
                    <Button asChild size="sm" className="rounded-xl font-bold shrink-0">
                      <Link to="/post-requirement">+ Post New</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingInquiries ? (
                      <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : inquiries.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm font-medium">No requirements posted yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inquiries.map(r => (
                          <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="font-bold text-sm">
                                {[r.preferredBhk, r.propertyType].filter(Boolean).join(' ')} in {r.city}
                              </div>
                              <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Budget: {fmtPrice(r.minBudget)} – {fmtPrice(r.maxBudget)}
                            </div>
                            {r.specialRequirements && (
                              <div className="text-xs text-muted-foreground mt-1 italic">"{r.specialRequirements}"</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
