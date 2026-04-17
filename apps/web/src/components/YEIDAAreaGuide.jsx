
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, FileText, Film, TrendingUp, Building, Users, 
  Route as Road, Zap, ShieldCheck, Star, ArrowRight,
  MapPin, CheckCircle2, Clock, Calculator, Trees
} from 'lucide-react';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { cn } from '@/lib/utils.js';

const YEIDAAreaGuide = () => {
  const [plotSize, setPlotSize] = useState(100);

  const calculatorData = {
    100: { current: '₹25 Lac', yr3: '₹38 Lac', yr5: '₹50 Lac', profit: '₹25 Lac' },
    200: { current: '₹50 Lac', yr3: '₹76 Lac', yr5: '₹1.0 Cr', profit: '₹50 Lac' },
    300: { current: '₹75 Lac', yr3: '₹1.14 Cr', yr5: '₹1.5 Cr', profit: '₹75 Lac' }
  };

  return (
    <>
      <Helmet>
        <title>YEIDA & Yamuna Expressway Real Estate Guide - Growperty</title>
        <meta name="description" content="Comprehensive area guide for YEIDA and Yamuna Expressway. Discover high-growth investment zones near Jewar Airport and upcoming Film City." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* HERO SECTION */}
          <section className="relative bg-gradient-to-br from-primary to-slate-900 pt-24 pb-32 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-4xl mx-auto mb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <Badge className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-1.5 text-sm font-bold tracking-widest mb-6 shadow-sm border-none uppercase">
                    HIGHEST GROWTH POTENTIAL
                  </Badge>
                  <h1 className="text-[32px] md:text-[48px] font-extrabold text-primary-foreground mb-6 leading-[1.2] tracking-tight text-balance">
                    YEIDA & Yamuna Expressway Real Estate Guide
                  </h1>
                  <p className="text-[16px] md:text-[18px] text-primary-foreground/80 max-w-[60ch] mx-auto leading-relaxed font-medium mb-10">
                    The fastest-growing real estate corridor in India. Powered by the upcoming Noida International Airport at Jewar and the mega Film City project.
                  </p>
                </motion.div>
              </div>

              {/* Quick Stats Grid */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
              >
                <div className="bg-white/10 backdrop-blur-md border border-accent/30 rounded-2xl p-8 text-center transform transition-transform hover:-translate-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-accent mb-2 tracking-tight">₹2,500—₹6,000</div>
                  <div className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wide">Price per Sq.ft</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-accent/30 rounded-2xl p-8 text-center transform transition-transform hover:-translate-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-accent mb-2 tracking-tight">25 km</div>
                  <div className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wide">From Jewar Airport</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-accent/30 rounded-2xl p-8 text-center transform transition-transform hover:-translate-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-accent mb-2 tracking-tight">50%+</div>
                  <div className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wide">Expected Growth</div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* OVERVIEW SECTION */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary mb-6 tracking-tight text-balance">
                  About YEIDA & Yamuna Expressway
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The Yamuna Expressway Industrial Development Authority (YEIDA) region is witnessing unprecedented infrastructure development. Stretching from Greater Noida to Agra, this corridor is the epicenter of massive industrial, commercial, and residential investments, making it the most lucrative real estate market in North India.
                </p>
              </div>

              {/* Urgency Box */}
              <div className="max-w-4xl mx-auto bg-white border-[3px] border-accent rounded-2xl p-8 shadow-lg transform transition-transform hover:-translate-y-1 mb-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -z-10"></div>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                    <Zap className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-primary mb-3">The Early Mover Advantage</h3>
                    <p className="text-foreground/80 leading-relaxed font-medium text-lg">
                      With Phase 1 of Noida International Airport (Jewar) nearing completion and major allotments for Film City underway, property prices in YEIDA sectors are poised for an explosive surge. Investing now guarantees maximum entry-level appreciation before the airport becomes fully operational.
                    </p>
                  </div>
                </div>
              </div>

              {/* KEY HIGHLIGHTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {[
                  { icon: Plane, title: 'Jewar Airport Proximity', desc: 'Asia\'s largest upcoming airport driving global investment and commercial growth.' },
                  { icon: FileText, title: 'YEIDA Authority Plots', desc: 'Highly secure, government-allotted residential and industrial plots with clear titles.' },
                  { icon: Film, title: 'Mega Film City', desc: 'A 1000-acre world-class Film City project generating massive employment and housing demand.' },
                  { icon: TrendingUp, title: 'Lowest Entry Prices', desc: 'Currently offering the most competitive per sq.ft rates compared to Noida and Greater Noida.' }
                ].map((highlight, idx) => (
                  <div key={idx} className="bg-card rounded-2xl p-8 flex items-start gap-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-border">
                    <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                      <highlight.icon className="w-7 h-7 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{highlight.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{highlight.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TOP INVESTMENT ZONES SECTION */}
          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary mb-4 tracking-tight text-balance">
                  Top Investment Zones
                </h2>
                <p className="text-lg text-muted-foreground">
                  Strategic sectors offering the highest return on investment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {[
                  { name: 'Sector 17 & 18', type: 'Highest Growth', typeColor: 'bg-accent text-accent-foreground', price: '₹3,000 - ₹6,000 / sq.ft', known: 'YEIDA Residential Plots', popular: 'Long-term Investors' },
                  { name: 'Sector 22D', type: 'Affordable', typeColor: 'bg-secondary text-secondary-foreground', price: '₹2,800 - ₹4,500 / sq.ft', known: 'Mixed-use development', popular: 'First-time Buyers' },
                  { name: 'Sector 24 & 25', type: 'Film City Zone', typeColor: 'bg-accent text-accent-foreground', price: '₹3,500 - ₹5,500 / sq.ft', known: 'Proximity to Film City', popular: 'Commercial & High-end Residential' },
                  { name: 'Tappal Area', type: 'Ultra Affordable', typeColor: 'bg-secondary text-secondary-foreground', price: '₹800 - ₹2,000 / sq.ft', known: 'Logistics and Warehousing', popular: 'Land Investors' }
                ].map((locality, idx) => (
                  <div key={idx} className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-bold text-primary">{locality.name}</h3>
                      <Badge className={cn("border-none font-bold px-3 py-1", locality.typeColor)}>
                        {locality.type}
                      </Badge>
                    </div>
                    <div className="text-xl font-extrabold text-accent-foreground mb-6">{locality.price}</div>
                    <div className="space-y-4 flex-grow">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Key Attraction</span>
                        <span className="text-foreground font-semibold">{locality.known}</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Ideal For</span>
                        <span className="text-foreground font-semibold">{locality.popular}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* JEWAR AIRPORT IMPACT SECTION */}
          <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #D4AF37 0%, transparent 70%)' }}></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-white mb-4 tracking-tight text-balance">
                  Jewar Airport — The Game Changer
                </h2>
                <p className="text-lg text-primary-foreground/80">
                  How Noida International Airport is transforming the regional economy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors shadow-lg">
                  <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6">
                    <Plane className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Global Connectivity</h3>
                  <p className="text-primary-foreground/80 leading-relaxed">Slated to be India's largest airport, it will handle 1.2 crore passengers annually in Phase 1, making YEIDA a global transit hub.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors shadow-lg">
                  <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6">
                    <Building className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Commercial Boom</h3>
                  <p className="text-primary-foreground/80 leading-relaxed">Triggering massive development of commercial spaces, hotels, logistics parks, and aviation hubs in the immediate vicinity.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors shadow-lg">
                  <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6">
                    <Users className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Employment Generation</h3>
                  <p className="text-primary-foreground/80 leading-relaxed">Expected to create over 1 lakh direct and indirect jobs, driving immense demand for rental and residential housing.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors shadow-lg">
                  <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6">
                    <TrendingUp className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Rapid Appreciation</h3>
                  <p className="text-primary-foreground/80 leading-relaxed">Property values within a 20km radius have already surged by 40% and are projected to double upon the airport's completion.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CONNECTIVITY SECTION */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary mb-4 tracking-tight text-balance">
                  Unmatched Connectivity
                </h2>
                <p className="text-lg text-muted-foreground">
                  The foundation of YEIDA's spectacular growth story.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card rounded-2xl p-8 shadow-md hover:shadow-lg border border-border transition-all flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                      <Road className="w-7 h-7 text-accent-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Current Network</h3>
                  </div>
                  <ul className="space-y-4 flex-grow">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-accent-foreground mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground font-medium">Yamuna Expressway directly connects Greater Noida to Agra</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-accent-foreground mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground font-medium">Eastern Peripheral Expressway linking Haryana and UP</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-accent-foreground mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground font-medium">Smooth access to Noida-Greater Noida Expressway</span></li>
                  </ul>
                </div>
                
                <div className="bg-card rounded-2xl p-8 shadow-md hover:shadow-lg border border-border transition-all flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                      <Zap className="w-7 h-7 text-accent-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Upcoming Links</h3>
                  </div>
                  <ul className="space-y-4 flex-grow">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-accent-foreground mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground font-medium">Pod Taxi service connecting Jewar Airport to Film City</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-accent-foreground mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground font-medium">High-speed Metro corridor linking Greater Noida to Jewar</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-accent-foreground mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground font-medium">Delhi-Mumbai Expressway link road</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* PROPERTY PRICES SECTION */}
          <section className="py-24 bg-muted">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary mb-4 tracking-tight text-balance">
                  Average Property Prices
                </h2>
                <p className="text-lg text-muted-foreground">
                  Current market rates across YEIDA sectors.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl shadow-lg border border-border bg-card">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="p-6 font-bold text-lg">Property Type</th>
                      <th className="p-6 font-bold text-lg">Average Price Range</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card">
                    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">YEIDA Residential Plots (Sector 18/20)</td>
                      <td className="p-6 font-extrabold text-accent-foreground">₹22,000 — ₹35,000 / sq.m</td>
                    </tr>
                    <tr className="border-b border-border bg-slate-50 hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">Private Developer Plots</td>
                      <td className="p-6 font-extrabold text-accent-foreground">₹2,500 — ₹4,500 / sq.yd</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">Agricultural/Freehold Land</td>
                      <td className="p-6 font-extrabold text-accent-foreground">₹3 Cr — ₹5 Cr / Acre</td>
                    </tr>
                    <tr className="border-b border-border bg-slate-50 hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">Commercial Shops</td>
                      <td className="p-6 font-extrabold text-accent-foreground">₹10,000 — ₹18,000 / sq.ft</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">2/3 BHK Apartments (Upcoming)</td>
                      <td className="p-6 font-extrabold text-accent-foreground">₹3,500 — ₹5,000 / sq.ft</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* INVESTMENT CALCULATOR SECTION */}
          <section className="py-24 bg-background">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary mb-4 tracking-tight text-balance flex items-center justify-center gap-3">
                  <Calculator className="w-8 h-8 text-accent-foreground" /> Projection Calculator
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  See the estimated future value of YEIDA residential plots based on current market growth trajectories.
                </p>
              </div>

              <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border">
                <div className="flex flex-col items-center mb-10">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Select Plot Size (Sq.yd)</span>
                  <div className="flex bg-muted p-1.5 rounded-xl">
                    {[100, 200, 300].map((size) => (
                      <button
                        key={size}
                        onClick={() => setPlotSize(size)}
                        className={cn(
                          "px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300",
                          plotSize === size 
                            ? "bg-white text-primary shadow-sm" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={`curr-${plotSize}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-slate-50 rounded-2xl p-6 text-center border border-border"
                    >
                      <div className="text-sm font-bold text-muted-foreground mb-2">Current Value</div>
                      <div className="text-3xl font-extrabold text-accent-foreground">{calculatorData[plotSize].current}</div>
                    </motion.div>
                    
                    <motion.div 
                      key={`yr3-${plotSize}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-slate-50 rounded-2xl p-6 text-center border border-border"
                    >
                      <div className="text-sm font-bold text-muted-foreground mb-2">After 3 Years</div>
                      <div className="text-3xl font-extrabold text-secondary">{calculatorData[plotSize].yr3}</div>
                    </motion.div>

                    <motion.div 
                      key={`yr5-${plotSize}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-slate-50 rounded-2xl p-6 text-center border border-border"
                    >
                      <div className="text-sm font-bold text-muted-foreground mb-2">After 5 Years</div>
                      <div className="text-3xl font-extrabold text-secondary">{calculatorData[plotSize].yr5}</div>
                    </motion.div>

                    <motion.div 
                      key={`prof-${plotSize}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-primary rounded-2xl p-6 text-center shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full pointer-events-none"></div>
                      <div className="text-sm font-bold text-primary-foreground/80 mb-2 relative z-10">Est. Profit (5Y)</div>
                      <div className="text-3xl font-extrabold text-accent relative z-10">+{calculatorData[plotSize].profit}</div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-8">
                  *Projections are based on historical data and anticipated infrastructure milestones. Real estate investments are subject to market risks.
                </p>
              </div>
            </div>
          </section>

          {/* WHY INVEST NOW SECTION */}
          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary mb-4 tracking-tight text-balance">
                  Why Invest Now?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 lg:col-span-2">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                    <Clock className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Pre-Launch Airport Pricing</h3>
                  <p className="text-muted-foreground leading-relaxed">Once the first flight takes off from Jewar Airport, property prices are expected to correct sharply upwards. The current window offers the last opportunity to enter at ground-level rates.</p>
                </div>
                
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                    <Building className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Industrial Corridors</h3>
                  <p className="text-muted-foreground leading-relaxed">Dedicated zones for Medical Devices Park, Apparel Park, and Toy Park are driving immediate commercial demand.</p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Clear Titles</h3>
                  <p className="text-muted-foreground leading-relaxed">Authority-allotted plots ensure completely transparent, legal, and hassle-free ownership for buyers.</p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                    <Trees className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Smart City Planning</h3>
                  <p className="text-muted-foreground leading-relaxed">Designed from scratch with wide roads, massive green belts, and future-ready underground utilities.</p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                    <Film className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Film City Impact</h3>
                  <p className="text-muted-foreground leading-relaxed">The 1000-acre Film City will attract high-net-worth individuals, boosting luxury residential demand nearby.</p>
                </div>
              </div>
            </div>
          </section>

          {/* MARKET TRENDS SECTION */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary mb-4 tracking-tight text-balance">
                  Current Market Trends
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-4xl font-extrabold text-foreground mb-2">+40%</h3>
                  <p className="text-muted-foreground font-medium">Price Growth (Last 2 Yrs)</p>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-4xl font-extrabold text-foreground mb-2">High</h3>
                  <p className="text-muted-foreground font-medium">Investment Velocity</p>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-4xl font-extrabold text-foreground mb-2">Plots</h3>
                  <p className="text-muted-foreground font-medium">Most Demanded Asset</p>
                </div>
              </div>
            </div>
          </section>

          {/* BOTTOM CTA SECTION */}
          <section className="py-24 bg-gradient-to-br from-primary to-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIyIiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-30"></div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-8 border border-white/20">
                <Zap className="w-5 h-5 text-accent" />
                <span className="text-white font-bold text-sm tracking-wide">LIMITED TIME OPPORTUNITY</span>
              </div>
              <h2 className="text-[32px] md:text-[42px] font-extrabold text-primary-foreground mb-6 tracking-tight text-balance">
                Don't Miss the YEIDA Growth Story
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 font-medium max-w-2xl mx-auto">
                Secure your plot in North India's most promising real estate corridor before prices soar further.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
                <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-14 px-8 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]">
                  <Link to="/properties?city=Yamuna+Expressway">
                    Browse YEIDA Properties
                  </Link>
                </Button>
                <Button asChild className="bg-accent text-primary hover:bg-accent/90 h-14 px-8 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]">
                  <a href="https://wa.me/919953537876?text=Hi,%20I%20want%20to%20invest%20in%20YEIDA%20/%20Yamuna%20Expressway.%20Please%20guide%20me." target="_blank" rel="noopener noreferrer">
                    Talk to Advisor
                  </a>
                </Button>
              </div>
              <p className="text-primary-foreground/80 font-medium text-lg">
                Or call our YEIDA experts at <a href="tel:+919891117876" className="text-accent font-bold hover:underline">+91 9891117876</a>
              </p>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default YEIDAAreaGuide;
