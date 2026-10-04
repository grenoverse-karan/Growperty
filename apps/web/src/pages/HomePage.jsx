import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import ProjectCard from '@/components/ProjectCard.jsx';
import DynamicSearchFilter from '@/components/DynamicSearchFilter.jsx';
import WhyChooseGrowperty from '@/components/WhyChooseGrowperty.jsx';
import EMICalculator from '@/components/EMICalculator.jsx';
import FestivalOfferTicker from '@/components/FestivalOfferTicker.jsx';
import { useProperties } from '@/hooks/useProperties.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { ArrowRight, AlertCircle, Home, RefreshCw, MapPin, Building2, Zap, BookOpen, HelpCircle, FileText, ArrowUpRight, Search, SlidersHorizontal, IndianRupee, ChevronRight, ShieldCheck, Users } from 'lucide-react';
const PROPERTY_TYPES = [
  { label: 'Flats / Apartments', subtitle: '1, 2, 3 & 4 BHK', query: 'Flat/Apartment', img: 'https://images.unsplash.com/photo-1758448511487-15f69dd6107b?w=600&q=75' },
  { label: 'Independent House', subtitle: 'Ready & Resale', query: 'Independent House', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=75' },
  { label: 'Plots', subtitle: 'Residential & Investment', query: 'Plot/Land', img: 'https://images.unsplash.com/photo-1747854805840-9be7d5e360e6?w=600&q=75' },
  { label: 'Commercial', subtitle: 'Shops, Offices & Showrooms', query: 'Commercial', img: 'https://images.unsplash.com/photo-1778961419928-2968ddd57c05?w=600&q=75' },
];

// Each entry links to a real, crawlable /search result instead of being
// bare text — plain keyword text with no links carries little SEO weight
// and a dense list like this risks reading as keyword stuffing; linking it
// to matching live listings turns it into legitimate internal linking.
const SEO_KEYWORDS = [
  { label: 'Flats in Greater Noida near Pari Chowk', href: '/search?status=approved&propertyType=Flat%2FApartment&q=Pari+Chowk' },
  { label: 'Independent house for sale in Greater Noida near Pari Chowk', href: '/search?status=approved&propertyType=House%2FVilla&q=Pari+Chowk' },
  { label: 'Builder floors for sale in Greater Noida', href: '/search?status=approved&propertyType=Flat%2FApartment&q=Greater+Noida' },
  { label: 'Freehold plots for sale in Greater Noida', href: '/freehold-plots-greater-noida' },
  { label: 'Ready to move 3 BHK flats in Greater Noida', href: '/search?status=approved&propertyType=Flat%2FApartment&bhk=3+BHK' },
  { label: 'Greater Noida authority residential plots for sale', href: '/freehold-plots-greater-noida' },
  { label: 'Studio apartment for sale near Pari Chowk', href: '/search?status=approved&propertyType=Flat%2FApartment&q=Pari+Chowk' },
  { label: 'Luxury villas in Greater Noida near Pari Chowk', href: '/search?status=approved&propertyType=House%2FVilla&q=Pari+Chowk' },
  { label: 'Commercial shop for sale in Greater Noida near Pari Chowk', href: '/commercial-property-greater-noida' },
  { label: 'Independent kothi for sale in Greater Noida', href: '/search?status=approved&propertyType=House%2FVilla&q=Greater+Noida' },
  { label: 'Office space for sale near Pari Chowk', href: '/commercial-property-greater-noida' },
  { label: 'Gated society flats in sector Phi 4 Greater Noida', href: '/search?status=approved&propertyType=Flat%2FApartment&q=Phi+4' },
  { label: 'Penthouse for sale in Chi-Phi Greater Noida', href: '/search?status=approved&propertyType=Flat%2FApartment&q=Chi' },
  { label: 'Residential plots near Yamuna Expressway Greater Noida', href: '/plots-near-yamuna-expressway' },
  { label: 'Society shops for sale in Chi-Phi Greater Noida', href: '/commercial-property-greater-noida' },
  { label: 'Furnished studio apartment near Pari Chowk Greater Noida', href: '/search?status=approved&propertyType=Flat%2FApartment&q=Pari+Chowk' },
  { label: 'Property for sale near Noida International Airport', href: '/property-near-noida-international-airport' },
  { label: 'Budget flats for sale in sector Phi 4 Greater Noida', href: '/search?status=approved&propertyType=Flat%2FApartment&q=Phi+4' },
  { label: 'Commercial properties near Yamuna Expressway Greater Noida', href: '/commercial-property-greater-noida' },
  { label: 'Plots near Noida International Airport Greater Noida', href: '/plots-near-yamuna-expressway' },
];

const TRUST_BADGES = [
  { icon: MapPin, title: 'Greater Noida Focused', subtitle: 'Only Greater Noida properties' },
  { icon: ShieldCheck, title: 'Verified Listings', subtitle: 'Genuine property options' },
  { icon: Users, title: 'Local Assistance', subtitle: 'From search to deal' },
  { icon: FileText, title: 'Free Listing for Owners', subtitle: 'No upfront charges' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const {
    fetchProperties,
    properties,
    isLoading,
    error
  } = useProperties();

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?status=approved&q=${encodeURIComponent(q)}`);
  };
  useEffect(() => {
    fetchProperties('approved,sold');
  }, [fetchProperties]);

  // Same project-mixing pattern as PropertiesPage.jsx — projects woven
  // into the featured feed (newest first), each card knowing its own kind.
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServerClient.fetch('/projects?status=approved&limit=6');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setProjects(Array.isArray(data.items) ? data.items : []);
      } catch {
        // Non-fatal — the property grid is the section's main content either way.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const featuredItems = useMemo(() => {
    const items = [
      ...properties.map(property => ({ kind: 'property', key: `p-${property.id}`, data: property, createdAt: property.createdAt })),
      ...projects.map(project => ({ kind: 'project', key: `j-${project._id}`, data: project, createdAt: project.createdAt })),
    ];
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return items.slice(0, 6);
  }, [properties, projects]);
  return <>
      <Helmet>
        <title>Growperty.com - Buy & Sell Properties in Greater Noida & YEIDA</title>
        <meta name="description" content="Flats, independent houses, plots & commercial property for sale in Greater Noida near Pari Chowk, Yamuna Expressway & Noida International Airport. Verified listings on Growperty.com." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <FestivalOfferTicker />

          {/* Hero Section */}
          <section className="relative overflow-hidden bg-white">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1770331373486-0aa277da9a88?w=2400&q=85" alt="Indian City Skyline" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-24">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="max-w-xl">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                  Greater Noida Ka Apna <span className="text-[#F97316]">Property</span> Platform
                </h1>
                <p className="text-lg md:text-xl font-bold text-slate-900 mt-2">
                  Buy • Sell • Invest — All in One Place
                </p>
                <p className="text-slate-600 mt-3 max-w-md">
                  Verified property options, local assistance aur transparent dealing — Greater Noida ke liye.
                </p>
              </motion.div>

              {/* Hero Search Bar */}
              <motion.form
                onSubmit={handleHeroSearch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="w-full max-w-xl mt-8 flex items-center bg-white rounded-full shadow-lg p-1.5 gap-2"
              >
                <Search className="h-5 w-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Sector, Society, BHK or Property Type"
                  className="flex-1 min-w-0 h-11 bg-transparent text-slate-800 placeholder:text-slate-400 text-[15px] font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-11 px-6 shrink-0 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-full font-bold text-sm transition-colors flex items-center gap-1.5"
                >
                  Search <ArrowRight className="h-4 w-4" />
                </button>
              </motion.form>

              {/* Quick action cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mt-6"
              >
                <button onClick={() => navigate('/properties')} className="flex items-center justify-between gap-2 bg-orange-100 hover:bg-orange-200 rounded-2xl px-4 py-4 text-left transition-colors">
                  <span className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center shrink-0">
                      <Home className="h-5 w-5 text-[#F97316]" />
                    </span>
                    <span className="font-bold text-slate-900 text-[15px] leading-tight">Buy<br />Property</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                </button>
                <div className="relative">
                  <span className="shine-badge absolute -top-3 -right-2 z-10 bg-[#10B981] text-white text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg ring-2 ring-white pointer-events-none">
                    Free
                  </span>
                  <button onClick={() => navigate('/list-property')} className="w-full flex items-center justify-between gap-2 bg-emerald-100 hover:bg-emerald-200 rounded-2xl px-4 py-4 text-left transition-colors">
                    <span className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
                        <IndianRupee className="h-5 w-5 text-[#10B981]" />
                      </span>
                      <span className="font-bold text-slate-900 text-[15px] leading-tight">Sell<br />Property</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </button>
                </div>
                <button onClick={() => navigate('/post-requirement')} className="flex items-center justify-between gap-2 bg-blue-100 hover:bg-blue-200 rounded-2xl px-4 py-4 text-left transition-colors">
                  <span className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </span>
                    <span className="font-bold text-slate-900 text-[15px] leading-tight">Post<br />Requirement</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                </button>
              </motion.div>
            </div>
          </section>

          {/* Trust badges */}
          <section className="bg-white border-b border-border/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:divide-x md:divide-border/60">
              {TRUST_BADGES.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="flex items-center gap-3 md:pl-6 md:first:pl-0">
                  <Icon className="h-7 w-7 text-primary shrink-0" strokeWidth={1.75} />
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-tight">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Explore Property Types */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Explore Property Types</h2>
                  <p className="text-muted-foreground mt-1">Find the right property for your needs</p>
                </div>
                <Link to="/properties" className="flex items-center gap-1.5 text-primary font-bold text-sm shrink-0 hover:underline">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {PROPERTY_TYPES.map((t) => (
                  <Link
                    key={t.label}
                    to={`/properties?type=${encodeURIComponent(t.query)}`}
                    className="group rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-lg transition-all bg-white"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                      <img src={t.img} alt={t.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-4 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 leading-snug">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</p>
                      </div>
                      <span className="h-8 w-8 rounded-full bg-slate-100 group-hover:bg-primary group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Premium Properties Section */}
          <section className="py-20 md:py-24 bg-white dark:bg-slate-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <motion.div initial={{
                opacity: 0,
                x: -20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.5
              }}>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
                    Premium Properties
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground max-w-2xl font-medium">
                    Handpicked verified listings offering exceptional value, stunning design, and prime locations.
                  </p>
                </motion.div>
                <motion.div initial={{
                opacity: 0,
                x: 20
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.5
              }}>
                  <Button variant="outline" size="lg" className="rounded-xl font-bold group h-12 px-6 border-border/60" asChild>
                    <Link to="/properties">
                      View All Listings
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="space-y-4">
                      <Skeleton className="h-64 w-full rounded-2xl" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </div>)}
                </div> : error ? <div className="flex flex-col items-center justify-center py-16 px-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-center shadow-sm">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-xl font-bold text-destructive mb-2">Failed to load properties</h3>
                  <Button onClick={() => fetchProperties('approved,sold')} className="rounded-xl font-bold h-12 px-8 shadow-md mt-4">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Retry Fetching
                  </Button>
                </div> : featuredItems.length > 0 ? <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {featuredItems.map((item, index) => <motion.div key={item.key} initial={{
                  opacity: 0,
                  y: 30
                }} whileInView={{
                  opacity: 1,
                  y: 0
                }} viewport={{
                  once: true
                }} transition={{
                  duration: 0.5,
                  delay: Math.min(index, 5) * 0.1
                }}>
                        {item.kind === 'project' ? <ProjectCard project={item.data} index={index} /> : <PropertyCard property={item.data} />}
                      </motion.div>)}
                  </div>
                </> : <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-border/50 text-center shadow-sm">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                    <Home className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No properties available yet</h3>
                  <p className="text-muted-foreground max-w-md mb-6 font-medium">
                    We are currently updating our listings. Please check back later or list your own property.
                  </p>
                  <Button onClick={() => navigate('/list-property')} className="rounded-xl font-bold h-12 px-8">
                    List a Property
                  </Button>
                </div>}
            </div>
          </section>
          
          {/* Why Choose Growperty Section */}
          <WhyChooseGrowperty />

          {/* Bottom Ecosystem / Quick Links Section (Bento Grid Style) */}
          <section className="py-24 bg-[#0a1128] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjMWZhODVlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight text-balance">
                  Explore The Growperty Ecosystem
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">
                  Everything you need to make informed, highly profitable real estate decisions across the most promising corridors in India.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(160px,auto)]">
                
                {/* 1. Area Guides (Large Span) */}
                <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-slate-900/90 to-slate-900/50 rounded-[2rem] p-8 md:p-10 border border-slate-800 flex flex-col justify-between group hover:border-[#10B981]/40 transition-colors shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>
                  <div>
                    <div className="w-14 h-14 bg-[#10B981]/10 rounded-2xl flex items-center justify-center mb-6">
                      <MapPin className="w-7 h-7 text-[#10B981]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">Area Master Guides</h3>
                    <p className="text-slate-400 font-medium leading-relaxed mb-8 max-w-sm">
                      Deep-dive analysis, price trends, and future projections for the hottest investment zones.
                    </p>
                  </div>
                  <div className="space-y-3 z-10 relative">
                    <Link to="/area-guide/greater-noida" className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors group/link border border-transparent hover:border-slate-700">
                      <span className="font-bold text-slate-200 group-hover/link:text-white">Greater Noida Guide</span>
                      <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover/link:text-[#10B981] transition-colors" />
                    </Link>
                    <Link to="/area-guide/yeida" className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors group/link border border-transparent hover:border-[#10B981]/50">
                      <span className="font-bold text-[#10B981] group-hover/link:text-[#10B981]">YEIDA Master Guide (Hot)</span>
                      <ArrowUpRight className="w-5 h-5 text-[#10B981] group-hover/link:text-[#10B981] transition-colors" />
                    </Link>
                  </div>
                </div>

                {/* 2. New Projects */}
                <Link to="/projects" className="bg-slate-900/80 rounded-[2rem] p-8 border border-slate-800 flex flex-col justify-between group hover:bg-slate-800/80 hover:border-slate-700 transition-all shadow-xl">
                  <div>
                    <Building2 className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">New Projects</h3>
                    <p className="text-sm text-slate-400 font-medium">Discover newly launched builder floors, societies, and commercial hubs.</p>
                  </div>
                  <div className="mt-6 flex items-center text-blue-400 font-bold text-sm tracking-wide group-hover:gap-2 transition-all">
                    EXPLORE <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>

                {/* 3. Fast Track */}
                <Link to="/fast-track" className="bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-[2rem] p-8 border border-[#10B981]/20 flex flex-col justify-between group hover:bg-[#10B981]/15 transition-all shadow-xl relative overflow-hidden">
                  <div>
                    <Zap className="w-8 h-8 text-[#10B981] mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Fast Track Sales</h3>
                    <p className="text-sm text-slate-300 font-medium">Accelerated property selling for urgent liquidity. Guaranteed swift closures.</p>
                  </div>
                  <div className="mt-6 flex items-center text-[#10B981] font-bold text-sm tracking-wide group-hover:gap-2 transition-all">
                    SELL FASTER <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>

                {/* 4. How It Works */}
                <Link to="/how-it-works" className="lg:col-span-2 bg-slate-900/80 rounded-[2rem] p-8 border border-slate-800 flex items-center justify-between group hover:bg-slate-800/80 hover:border-slate-700 transition-all shadow-xl">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center shrink-0 group-hover:bg-slate-700 transition-colors">
                      <BookOpen className="w-7 h-7 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">How Growperty Works</h3>
                      <p className="text-slate-400 font-medium">The transparent, step-by-step process of buying or selling with us.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all hidden sm:block" />
                </Link>

                {/* 5. FAQ */}
                <Link to="/faq" className="bg-slate-900/80 rounded-[2rem] p-8 border border-slate-800 flex flex-col justify-between group hover:bg-slate-800/80 hover:border-slate-700 transition-all shadow-xl">
                  <div>
                    <HelpCircle className="w-8 h-8 text-amber-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">FAQ</h3>
                    <p className="text-sm text-slate-400 font-medium">Answers to common queries about registration, loans, and legalities.</p>
                  </div>
                  <div className="mt-6 flex items-center text-amber-400 font-bold text-sm tracking-wide group-hover:gap-2 transition-all">
                    GET ANSWERS <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>

                {/* 6. Blog */}
                <Link to="/blog" className="bg-slate-900/80 rounded-[2rem] p-8 border border-slate-800 flex flex-col justify-between group hover:bg-slate-800/80 hover:border-slate-700 transition-all shadow-xl">
                  <div>
                    <FileText className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Real Estate Blog</h3>
                    <p className="text-sm text-slate-400 font-medium">Market insights, tips, and news updates from industry experts.</p>
                  </div>
                  <div className="mt-6 flex items-center text-purple-400 font-bold text-sm tracking-wide group-hover:gap-2 transition-all">
                    READ ARTICLES <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>

              </div>
            </div>
          </section>

          <EMICalculator />

        </main>

        <Footer />

        {/* SEO keyword footer — small, unobtrusive, at the very bottom. Real
            links to matching search results, not bare text, so these carry
            actual internal-linking value instead of reading as keyword stuffing. */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-[12px] leading-relaxed text-slate-400">
            {SEO_KEYWORDS.map((kw, i) => (
              <React.Fragment key={kw.label}>
                {i > 0 && ' | '}
                <Link to={kw.href} className="hover:text-slate-600 hover:underline">{kw.label}</Link>
              </React.Fragment>
            ))}
          </p>
        </section>

        {/* Floating Filters button */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
          {showFilters && (
            <div className="w-[95vw] max-w-md md:max-w-4xl lg:max-w-6xl max-h-[75vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 p-4">
              <DynamicSearchFilter />
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-black hover:bg-slate-800 text-white text-xs font-semibold shadow-lg transition-all"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>
    </>;
};
export default HomePage;