import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { MapPin, Phone, MessageCircle, SlidersHorizontal, Users, Search } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { PLATFORM_PHONE, PLATFORM_WHATSAPP } from '@/constants/contactInfo.js';

const fmt = (n) => {
  if (!n) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  if (mins < 60)   return `${mins || 1}m ago`;
  if (hours < 24)  return `${hours}hr ago`;
  if (days === 1)  return 'Yesterday';
  if (days < 7)    return `${days} days ago`;
  if (weeks === 1) return '1 week ago';
  if (weeks < 5)   return `${weeks} weeks ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const PROP_TYPES = ['Flat / Apartment', 'Independent House', 'Villa', 'Plot', 'Industrial Plot', 'Commercial Space'];
const CITIES     = ['Greater Noida', 'Noida', 'YEIDA'];
const BHK_OPTS   = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

function BuyerCard({ req, index }) {
  const budget = (req.minBudget || req.maxBudget)
    ? `${fmt(req.minBudget) || '—'} – ${fmt(req.maxBudget) || '—'}`
    : null;

  const waText = encodeURIComponent(
    `Hi Growperty, I have a property that matches a buyer requirement:\n• Type: ${req.propertyType || ''}${req.preferredBhk ? ` ${req.preferredBhk}` : ''}\n• City: ${req.city || ''}\n• Budget: ${budget || 'Not specified'}\n\nPlease connect me with the buyer.`
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full overflow-hidden"
    >
      {/* Coloured top bar */}
      <div className="h-1.5 bg-gradient-to-r from-primary to-emerald-400" />

      <div className="p-6 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-base leading-tight">
                {req.buyerName ? req.buyerName.split(' ')[0] + (req.buyerName.split(' ').length > 1 ? ' ' + req.buyerName.split(' ')[1][0] + '.' : '') : 'Anonymous Buyer'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Verified Buyer</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
              Active Buyer
            </Badge>
            {timeAgo(req.createdAt) && (
              <span className="text-xs text-muted-foreground">{timeAgo(req.createdAt)}</span>
            )}
          </div>
        </div>

        {/* Property want */}
        <h3 className="text-xl font-extrabold text-foreground mb-1 leading-tight">
          {[req.preferredBhk, req.propertyType].filter(Boolean).join(' ') || 'Any Property'}
        </h3>

        {/* Location */}
        {(req.city || req.buyerAddress) && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium truncate">{[req.city, req.buyerAddress].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {/* Budget */}
        {budget && (
          <div className="mb-4 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border/40">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Budget Range</p>
            <p className="text-2xl font-extrabold text-primary leading-tight">{budget}</p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {req.propertyType && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {req.propertyType}
            </span>
          )}
          {req.preferredBhk && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              {req.preferredBhk}
            </span>
          )}
          {req.city && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {req.city}
            </span>
          )}
        </div>

        {/* Special requirements */}
        {req.specialRequirements && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            "{req.specialRequirements}"
          </p>
        )}

        {/* Deal breakers */}
        {req.dealBreakers?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-destructive/70 uppercase tracking-wide mb-1.5">Cannot compromise on</p>
            <div className="flex flex-wrap gap-1.5">
              {req.dealBreakers.slice(0, 4).map(d => (
                <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-destructive/8 border border-destructive/20 text-destructive/80 font-medium">✕ {d}</span>
              ))}
              {req.dealBreakers.length > 4 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-muted-foreground font-medium">+{req.dealBreakers.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="border-t border-border/50 pt-4 mt-2">
          <p className="text-xs text-muted-foreground text-center mb-3 font-medium">
            Have a matching property? Contact us to connect
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <Button variant="outline" className="h-10 text-sm font-bold rounded-xl border-primary/20 text-primary hover:bg-primary/10"
              onClick={() => window.location.href = `tel:${PLATFORM_PHONE}`}>
              <Phone className="h-4 w-4 mr-1.5" /> Call Us
            </Button>
            <Button variant="outline" className="h-10 text-sm font-bold rounded-xl border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/10"
              onClick={() => window.open(`https://wa.me/${PLATFORM_WHATSAPP}?text=${waText}`, '_blank')}>
              <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BuyerFilter({ filters, onChange }) {
  const [local, setLocal] = useState(filters);

  const apply = () => onChange(local);
  const clear = () => {
    const reset = { city: 'all', propertyType: 'all', bhk: 'all', search: '' };
    setLocal(reset);
    onChange(reset);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-sm p-6 sticky top-4">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Filter Buyers</h3>
      </div>

      {/* Search */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-foreground mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={local.search}
            onChange={e => setLocal(p => ({ ...p, search: e.target.value }))}
            placeholder="Type, city, requirements…"
            className="w-full pl-9 pr-3 h-11 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* City */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-foreground mb-2 block">City</label>
        <select value={local.city} onChange={e => setLocal(p => ({ ...p, city: e.target.value }))}
          className="w-full h-11 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm font-medium px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer">
          <option value="all">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Property Type */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-foreground mb-2 block">Property Type</label>
        <select value={local.propertyType} onChange={e => setLocal(p => ({ ...p, propertyType: e.target.value }))}
          className="w-full h-11 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm font-medium px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer">
          <option value="all">All Types</option>
          {PROP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* BHK */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-foreground mb-2 block">BHK</label>
        <select value={local.bhk} onChange={e => setLocal(p => ({ ...p, bhk: e.target.value }))}
          className="w-full h-11 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm font-medium px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer">
          <option value="all">Any BHK</option>
          {BHK_OPTS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <Button onClick={apply} className="w-full h-12 rounded-xl font-bold text-sm shadow-sm mb-3">Apply Filters</Button>
      <button onClick={clear} className="w-full text-sm text-muted-foreground hover:text-foreground font-medium flex items-center justify-center gap-1.5 py-2">
        ✕ Clear Filters
      </button>
    </div>
  );
}

export default function BuyersPage() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filters, setFilters]           = useState({ city: 'all', propertyType: 'all', bhk: 'all', search: '' });

  useEffect(() => {
    (async () => {
      try {
        const res  = await apiServerClient.fetch('/requirements/public?limit=100');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        setRequirements(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return requirements.filter(r => {
      if (filters.city !== 'all' && r.city !== filters.city) return false;
      if (filters.propertyType !== 'all' && r.propertyType !== filters.propertyType) return false;
      if (filters.bhk !== 'all' && r.preferredBhk !== filters.bhk) return false;
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const haystack = [r.propertyType, r.preferredBhk, r.city, r.buyerAddress, r.specialRequirements].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [requirements, filters]);

  return (
    <>
      <Helmet>
        <title>Active Buyers in Delhi NCR — Growperty.com</title>
        <meta name="description" content="Browse verified buyers looking for properties in Noida, Greater Noida, and YEIDA. If you have a matching property, connect through Growperty." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero */}
          <div className="bg-secondary text-secondary-foreground py-16 md:py-20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Active Buyers</h1>
                <p className="text-lg md:text-xl text-secondary-foreground/80 leading-relaxed font-medium max-w-2xl">
                  Verified buyers actively looking for properties across Delhi-NCR. Have a matching property? Connect through Growperty.
                </p>
                {!loading && (
                  <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                    <Users className="h-4 w-4" />
                    {requirements.length} active buyer{requirements.length !== 1 ? 's' : ''} looking right now
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <BuyerFilter filters={filters} onChange={setFilters} />
              </aside>

              {/* Mobile Filter */}
              <div className="lg:hidden mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full h-14 text-base font-bold shadow-sm rounded-xl border-border/60">
                      <SlidersHorizontal className="h-5 w-5 mr-2" /> Filter Buyers
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] sm:w-[380px] overflow-y-auto p-4">
                    <SheetTitle className="sr-only">Filter Buyers</SheetTitle>
                    <BuyerFilter filters={filters} onChange={setFilters} />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-extrabold text-foreground">
                    {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'Buyer' : 'Buyers'} Found`}
                  </h2>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="space-y-4">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-destructive/10 rounded-2xl border border-destructive/20">
                    <p className="text-destructive font-medium">{error}</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 bg-white dark:bg-slate-900/50 rounded-3xl border border-border/50 shadow-sm">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                      <Users className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">No buyers found</h3>
                    <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
                      No buyers match your current filters. Try adjusting or clearing them.
                    </p>
                    <Button onClick={() => setFilters({ city: 'all', propertyType: 'all', bhk: 'all', search: '' })}
                      className="h-12 px-8 rounded-xl font-bold shadow-md">
                      Clear All Filters
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {filtered.map((req, i) => (
                      <BuyerCard key={req._id || i} req={req} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
