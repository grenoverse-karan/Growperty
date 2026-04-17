import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import DynamicSearchFilter from '@/components/DynamicSearchFilter.jsx';
import WhyChooseGrowperty from '@/components/WhyChooseGrowperty.jsx';
import { useProperties } from '@/hooks/useProperties.js';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { ArrowRight, AlertCircle, Home, RefreshCw, MapPin, Building2, Zap, BookOpen, HelpCircle, FileText, ArrowUpRight } from 'lucide-react';
const HomePage = () => {
  const navigate = useNavigate();
  const {
    fetchProperties,
    properties,
    isLoading,
    error
  } = useProperties();
  useEffect(() => {
    fetchProperties('approved');
  }, [fetchProperties]);
  const featuredProperties = properties.slice(0, 3);
  return <>
      <Helmet>
        <title>Growperty.com - Buy & Sell Properties in Greater Noida, Noida & YEIDA</title>
        <meta name="description" content="Find your dream home in Greater Noida, Noida and YEIDA. Browse verified flats, villas, and plots on Growperty.com." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden bg-slate-950">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1606011848941-0bd620636963?w=1920&q=80" alt="Modern Indian Real Estate" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              ease: "easeOut"
            }} className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight text-balance">
                  Namaste!
                </h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-[50ch] mx-auto leading-relaxed font-medium">
                  Explore verified flats, luxury villas, and premium plots across Greater Noida, Noida, and YEIDA.
                </p>
              </motion.div>

              {/* Search Filter */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              delay: 0.2,
              ease: "easeOut"
            }} className="w-full max-w-[1200px] mx-auto mt-10 md:mt-12">
                <DynamicSearchFilter />
              </motion.div>

              {/* Strategic Buttons */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              delay: 0.4,
              ease: "easeOut"
            }} className="flex flex-col md:flex-row w-full max-w-[1200px] mx-auto mt-0 mb-[24px] md:mb-[32px]">
                <button onClick={() => navigate('/list-property')} className="bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#1f2937] p-[14px] text-[16px] font-[600] border border-[#e5e7eb] w-full md:w-1/2 transition-all flex items-center justify-center rounded-t-xl md:rounded-tr-none md:rounded-l-xl">
                  Sell your property
                </button>
                <button onClick={() => navigate('/post-requirement')} className="bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#1f2937] p-[14px] text-[16px] font-[600] border border-[#e5e7eb] border-t-0 md:border-t md:border-l-0 w-full md:w-1/2 transition-all flex items-center justify-center rounded-b-xl md:rounded-bl-none md:rounded-r-xl">
                  Add your requirement
                </button>
              </motion.div>
            </div>
          </section>

          {/* Premium Properties Section */}
          <section className="py-20 md:py-24 bg-slate-50 dark:bg-slate-900/20">
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
                  {[1, 2, 3].map(i => <div key={i} className="space-y-4">
                      <Skeleton className="h-64 w-full rounded-2xl" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </div>)}
                </div> : error ? <div className="flex flex-col items-center justify-center py-16 px-4 bg-destructive/5 rounded-2xl border border-destructive/20 text-center shadow-sm">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-xl font-bold text-destructive mb-2">Failed to load properties</h3>
                  <Button onClick={() => fetchProperties('approved')} className="rounded-xl font-bold h-12 px-8 shadow-md mt-4">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Retry Fetching
                  </Button>
                </div> : featuredProperties.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {featuredProperties.map((property, index) => <motion.div key={property.id} initial={{
                opacity: 0,
                y: 30
              }} whileInView={{
                opacity: 1,
                y: 0
              }} viewport={{
                once: true
              }} transition={{
                duration: 0.5,
                delay: index * 0.1
              }}>
                      <PropertyCard property={property} />
                    </motion.div>)}
                </div> : <div className="flex flex-col items-center justify-center py-20 px-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-border/50 text-center shadow-sm">
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
                    <Link to="/area-guide/noida" className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors group/link border border-transparent hover:border-slate-700">
                      <span className="font-bold text-slate-200 group-hover/link:text-white">Noida Guide</span>
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
          
        </main>

        <Footer />
      </div>
    </>;
};
export default HomePage;