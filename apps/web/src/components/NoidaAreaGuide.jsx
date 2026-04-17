
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, Train, Crown, TrendingUp, Route as Road, Plane, 
  MapPin, BookOpen, Heart, ShoppingCart, Home, Percent, Star, 
  CheckCircle2, Building, ShieldCheck, Trees
} from 'lucide-react';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';

const NoidaAreaGuide = () => {
  return (
    <>
      <Helmet>
        <title>Noida Real Estate Guide - Growperty</title>
        <meta name="description" content="Comprehensive area guide for Noida real estate. Explore top localities, property prices, connectivity, and investment trends in Noida." />
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
                  <Badge className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-1.5 text-sm font-bold tracking-widest mb-6 shadow-sm border-none uppercase">
                    AREA GUIDE
                  </Badge>
                  <h1 className="text-[32px] md:text-[48px] font-extrabold text-primary-foreground mb-6 leading-[1.2] tracking-tight text-balance">
                    Noida Real Estate Guide
                  </h1>
                  <p className="text-[16px] md:text-[18px] text-primary-foreground/80 max-w-[60ch] mx-auto leading-relaxed font-medium mb-10">
                    The IT and corporate capital of North India. Discover premium living, high rental yields, and seamless connectivity in one of NCR's most developed cities.
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
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center transform transition-transform hover:-translate-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2 tracking-tight">₹6,000 — ₹12,000</div>
                  <div className="text-sm font-medium text-primary-foreground/70 uppercase tracking-wide">Price per Sq.ft</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center transform transition-transform hover:-translate-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2 tracking-tight">100+</div>
                  <div className="text-sm font-medium text-primary-foreground/70 uppercase tracking-wide">Residential Sectors</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center transform transition-transform hover:-translate-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2 tracking-tight">15 km</div>
                  <div className="text-sm font-medium text-primary-foreground/70 uppercase tracking-wide">From Delhi</div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* OVERVIEW SECTION */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary dark:text-white mb-6 tracking-tight text-balance">
                  About Noida
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  New Okhla Industrial Development Authority (NOIDA) is a systematically planned city that has evolved into a major IT, corporate, and educational hub. With its wide roads, excellent metro connectivity, and premium residential projects, Noida offers an unparalleled urban lifestyle and robust real estate investment opportunities.
                </p>
              </div>

              {/* KEY HIGHLIGHTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {[
                  { icon: Briefcase, title: 'IT & Corporate Hub', desc: 'Home to major multinational corporations, IT parks, and business centers driving massive employment.' },
                  { icon: Train, title: 'Metro Connected', desc: 'Extensive Blue Line and Aqua Line metro networks providing seamless access across NCR.' },
                  { icon: Crown, title: 'Premium Living', desc: 'Luxury high-rises, gated communities, and independent villas with world-class amenities.' },
                  { icon: TrendingUp, title: 'High Rental Yield', desc: 'Strong demand from working professionals ensures consistent and high rental returns.' }
                ].map((highlight, idx) => (
                  <div key={idx} className="bg-card rounded-2xl p-8 flex items-start gap-6 border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                      <highlight.icon className="w-7 h-7 text-secondary" />
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

          {/* TOP LOCALITIES SECTION */}
          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary dark:text-white mb-4 tracking-tight text-balance">
                  Top Localities
                </h2>
                <p className="text-lg text-muted-foreground">
                  Explore the most sought-after sectors for residential and commercial investment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Sector 150', type: 'Ultra Luxury', price: '₹8,000 - ₹14,000 / sq.ft', known: 'Greenest sector, sports city', popular: 'Premium homebuyers & investors' },
                  { name: 'Sector 137', type: 'Premium Residential', price: '₹7,000 - ₹10,000 / sq.ft', known: 'Metro connectivity, ready-to-move', popular: 'Working professionals & families' },
                  { name: 'Sector 75-78', type: 'Established Hub', price: '₹6,500 - ₹9,500 / sq.ft', known: 'Central location, great amenities', popular: 'End-users and long-term investors' },
                  { name: 'Sector 62', type: 'IT & Residential', price: '₹7,500 - ₹11,000 / sq.ft', known: 'Major IT parks, excellent connectivity', popular: 'Corporate employees & rental income' },
                  { name: 'Sector 44-45', type: 'Prime Location', price: '₹9,000 - ₹15,000 / sq.ft', known: 'Proximity to Delhi & Expressway', popular: 'Luxury seekers & HNIs' },
                  { name: 'Sector 18', type: 'Commercial Hub', price: '₹20,000 - ₹40,000 / sq.ft', known: 'Atta Market, DLF Mall of India', popular: 'Retail investors & businesses' }
                ].map((locality, idx) => (
                  <div key={idx} className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-foreground">{locality.name}</h3>
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-none">
                        {locality.type}
                      </Badge>
                    </div>
                    <div className="text-lg font-extrabold text-secondary mb-6">{locality.price}</div>
                    <div className="space-y-4 flex-grow">
                      <div>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-1">Known For</span>
                        <span className="text-foreground font-medium">{locality.known}</span>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-1">Popular For</span>
                        <span className="text-foreground font-medium">{locality.popular}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CONNECTIVITY SECTION */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary dark:text-white mb-4 tracking-tight text-balance">
                  Seamless Connectivity
                </h2>
                <p className="text-lg text-muted-foreground">
                  Strategic location with multi-modal transport infrastructure.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all flex items-start gap-6">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Road className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Road Network</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Noida-Greater Noida Expressway</span></li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">DND Flyway to South Delhi</span></li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Yamuna Expressway to Agra</span></li>
                    </ul>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all flex items-start gap-6">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Train className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Metro Access</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Blue Line (Dwarka to Electronic City)</span></li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Aqua Line (Noida to Greater Noida)</span></li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Magenta Line (Botanical Garden to Janakpuri)</span></li>
                    </ul>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all flex items-start gap-6">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Plane className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Airport Proximity</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">IGI Airport, Delhi (approx. 30-40 km)</span></li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Upcoming Jewar Airport (approx. 45 km)</span></li>
                    </ul>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all flex items-start gap-6">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-4">Nearby Cities</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Direct border with East & South Delhi</span></li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Seamless access to Ghaziabad & Indirapuram</span></li>
                      <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Gateway to Greater Noida</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SOCIAL INFRASTRUCTURE SECTION */}
          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary dark:text-white mb-4 tracking-tight text-balance">
                  World-Class Infrastructure
                </h2>
                <p className="text-lg text-muted-foreground">
                  Everything you need for a comfortable lifestyle is right here.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Education</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Amity University</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Step by Step School</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Delhi Public School (DPS)</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Lotus Valley International</span></li>
                  </ul>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Healthcare</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Fortis Hospital</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Jaypee Hospital</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Kailash Hospital</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Apollo Hospital</span></li>
                  </ul>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Lifestyle</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">DLF Mall of India</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">The Great India Place (GIP)</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Logix City Center</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Sector 18 Market</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* PROPERTY PRICES SECTION */}
          <section className="py-24 bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary dark:text-white mb-4 tracking-tight text-balance">
                  Average Property Prices
                </h2>
                <p className="text-lg text-muted-foreground">
                  Current market rates across different property configurations.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="p-6 font-bold text-lg">Property Type</th>
                      <th className="p-6 font-bold text-lg">Average Price Range</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card">
                    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">1 BHK Apartment</td>
                      <td className="p-6 font-bold text-secondary">₹35 Lac — ₹55 Lac</td>
                    </tr>
                    <tr className="border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">2 BHK Apartment</td>
                      <td className="p-6 font-bold text-secondary">₹65 Lac — ₹1.2 Cr</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">3 BHK Apartment</td>
                      <td className="p-6 font-bold text-secondary">₹1.1 Cr — ₹2.5 Cr</td>
                    </tr>
                    <tr className="border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">4 BHK / Penthouse</td>
                      <td className="p-6 font-bold text-secondary">₹2.5 Cr — ₹6.0 Cr+</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">Independent Villa</td>
                      <td className="p-6 font-bold text-secondary">₹3.0 Cr — ₹10.0 Cr+</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors bg-muted/30">
                      <td className="p-6 font-medium text-foreground">Commercial Office Space</td>
                      <td className="p-6 font-bold text-secondary">₹8,000 — ₹15,000 / sq.ft</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* WHY INVEST SECTION */}
          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary dark:text-white mb-4 tracking-tight text-balance">
                  Why Invest in Noida?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 lg:col-span-2">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Consistent Capital Appreciation</h3>
                  <p className="text-muted-foreground leading-relaxed">Noida has consistently delivered strong capital appreciation due to its strategic location, continuous infrastructure upgrades, and influx of corporate investments, making it a safe haven for real estate investors.</p>
                </div>
                
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <Home className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">High Rental Demand</h3>
                  <p className="text-muted-foreground leading-relaxed">With thousands of IT professionals migrating to Noida annually, the demand for quality rental housing remains robust, ensuring steady passive income.</p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <Briefcase className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Corporate Ecosystem</h3>
                  <p className="text-muted-foreground leading-relaxed">Presence of Fortune 500 companies, massive IT parks, and commercial hubs drives both residential and commercial real estate growth.</p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <Trees className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Planned Infrastructure</h3>
                  <p className="text-muted-foreground leading-relaxed">Wide roads, dedicated green belts, underground cabling, and excellent civic amenities provide a superior quality of life.</p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Secure Investment</h3>
                  <p className="text-muted-foreground leading-relaxed">A mature, RERA-regulated market with established developers ensures transparency and timely delivery of projects.</p>
                </div>
              </div>
            </div>
          </section>

          {/* MARKET TRENDS SECTION */}
          <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-primary dark:text-white mb-4 tracking-tight text-balance">
                  Current Market Trends
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-4xl font-extrabold text-foreground mb-2">+15%</h3>
                  <p className="text-muted-foreground font-medium">YoY Price Growth</p>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Percent className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-4xl font-extrabold text-foreground mb-2">4 - 5%</h3>
                  <p className="text-muted-foreground font-medium">Average Rental Yield</p>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-4xl font-extrabold text-foreground mb-2">Sec 150</h3>
                  <p className="text-muted-foreground font-medium">Fastest Growing Zone</p>
                </div>
              </div>
            </div>
          </section>

          {/* BOTTOM CTA SECTION */}
          <section className="py-20 bg-gradient-to-r from-secondary to-emerald-500">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-[28px] md:text-[36px] font-extrabold text-secondary-foreground mb-6 tracking-tight text-balance">
                Interested in Noida Properties?
              </h2>
              <p className="text-lg text-secondary-foreground/90 mb-10 font-medium">
                Let our local experts help you find the perfect home or investment property.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button asChild className="bg-white text-secondary hover:bg-slate-50 h-14 px-8 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]">
                  <Link to="/properties?city=Noida">
                    Browse Noida Properties
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-secondary h-14 px-8 text-lg font-bold rounded-xl transition-all active:scale-[0.98]">
                  <a href="https://wa.me/919953537876?text=Hi,%20I%20want%20to%20know%20about%20Noida%20properties%20on%20Growperty.com" target="_blank" rel="noopener noreferrer">
                    Talk to Expert
                  </a>
                </Button>
              </div>
              <p className="text-secondary-foreground/80 font-medium">
                Or call us at <a href="tel:+919891117879" className="text-white font-bold hover:underline">+91 9891117879</a>
              </p>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default NoidaAreaGuide;
