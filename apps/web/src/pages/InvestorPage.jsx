
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Home, Plane, Route as Road, Building, Shield, 
  Building2, Landmark, ShoppingCart, Star, Search, Phone, 
  Eye, HeartHandshake as Handshake, ArrowRight, CheckCircle2
} from 'lucide-react';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.jsx";

const InvestorPage = () => {
  return (
    <>
      <Helmet>
        <title>Invest Smart in Greater Noida & YEIDA - Growperty</title>
        <meta name="description" content="Discover high-yield real estate investment opportunities in Greater Noida, Noida, and YEIDA. Explore residential, commercial, and plot investments." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1">
          {/* HERO SECTION */}
          <section className="relative bg-gradient-to-br from-[#1e3a5f] to-slate-900 pt-24 pb-32 overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-4xl mx-auto mb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <Badge className="bg-[#10B981] hover:bg-[#10B981]/90 text-white px-4 py-1.5 text-sm font-bold tracking-widest mb-6 shadow-sm border-none uppercase">
                    SMART INVESTMENT
                  </Badge>
                  <h1 className="text-[32px] md:text-[48px] font-extrabold text-white mb-6 leading-[1.2] tracking-tight text-balance">
                    Invest Smart in Greater Noida & YEIDA
                  </h1>
                  <p className="text-[16px] md:text-[18px] text-slate-300 max-w-[60ch] mx-auto leading-relaxed font-medium mb-10">
                    India's fastest growing real estate corridor is here. Don't miss your opportunity.
                  </p>
                  <Button asChild className="bg-[#10B981] hover:bg-[#0e9f6e] text-white h-14 px-8 text-lg font-bold rounded-xl shadow-lg shadow-[#10B981]/20 transition-all active:scale-[0.98]">
                    <Link to="/properties">
                      Explore Investment Properties <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
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
                  <TrendingUp className="w-10 h-10 text-[#10B981] mx-auto mb-4" />
                  <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">40%</div>
                  <div className="text-sm font-medium text-slate-300 uppercase tracking-wide">Avg Price Growth in 5 Years</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center transform transition-transform hover:-translate-y-1">
                  <Home className="w-10 h-10 text-[#10B981] mx-auto mb-4" />
                  <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">₹8,300</div>
                  <div className="text-sm font-medium text-slate-300 uppercase tracking-wide">Avg Price per Sq.ft Noida</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center transform transition-transform hover:-translate-y-1">
                  <Plane className="w-10 h-10 text-[#10B981] mx-auto mb-4" />
                  <div className="text-4xl font-extrabold text-white mb-2 tracking-tight">2025</div>
                  <div className="text-sm font-medium text-slate-300 uppercase tracking-wide">Jewar Airport Launch Year</div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* WHY INVEST SECTION */}
          <section className="py-24 bg-white dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1e3a5f] dark:text-white mb-4 tracking-tight text-balance">
                  Why Invest in Greater Noida & YEIDA?
                </h2>
                <p className="text-lg text-muted-foreground font-medium">
                  Strong fundamentals. Massive growth potential.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { icon: Plane, title: 'Jewar International Airport', desc: 'Upcoming largest airport in Asia driving massive infrastructure and commercial development in the region.' },
                  { icon: Road, title: 'Yamuna Expressway', desc: 'Seamless 6-lane connectivity to Agra, Mathura, and Lucknow, making it a prime logistics and residential hub.' },
                  { icon: Building, title: 'Rapid Infrastructure Growth', desc: 'New metro lines, upcoming Film City, and massive IT parks are transforming the economic landscape.' },
                  { icon: TrendingUp, title: 'Affordable Entry Point', desc: 'Compared to Gurgaon and Delhi, property prices are still at a stage where maximum appreciation is possible.' },
                  { icon: Home, title: 'High Rental Yield', desc: 'Growing corporate presence and educational institutions ensure consistent and high rental demand.' },
                  { icon: Shield, title: 'RERA Protected Market', desc: 'Strict regulatory compliance ensures your investments are safe, transparent, and delivered on time.' }
                ].map((feature, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-14 h-14 bg-[#10B981]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#10B981]/20 transition-colors">
                      <feature.icon className="w-7 h-7 text-[#10B981]" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* INVESTMENT OPTIONS SECTION */}
          <section className="py-24 bg-[#f9fafb] dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1e3a5f] dark:text-white mb-4 tracking-tight text-balance">
                  What Can You Invest In?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Option 1 */}
                <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 md:p-10 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-[#10B981]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground mb-1">Residential Apartments</h3>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">2, 3, 4 BHK Flats</p>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                    Secure, gated communities with modern amenities. Ideal for steady rental income and long-term capital appreciation in established sectors.
                  </p>
                  <div className="mt-auto pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xl font-extrabold text-[#10B981]">Starting ₹35 Lac</div>
                    <Button asChild className="bg-[#10B981] hover:bg-[#0e9f6e] text-white font-bold rounded-xl">
                      <Link to="/properties?type=Flat/Apartment">Browse Apartments</Link>
                    </Button>
                  </div>
                </div>

                {/* Option 2 */}
                <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 md:p-10 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center">
                      <Landmark className="w-8 h-8 text-[#10B981]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground mb-1">Plots & Land</h3>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Residential & Commercial Plots</p>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                    The ultimate appreciating asset. Invest in YEIDA authority plots or private gated developments for maximum ROI over the next decade.
                  </p>
                  <div className="mt-auto pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xl font-extrabold text-[#10B981]">Starting ₹15 Lac</div>
                    <Button asChild className="bg-[#10B981] hover:bg-[#0e9f6e] text-white font-bold rounded-xl">
                      <Link to="/properties?type=Plot/Land">Browse Plots</Link>
                    </Button>
                  </div>
                </div>

                {/* Option 3 */}
                <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 md:p-10 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-[#10B981]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground mb-1">Commercial Property</h3>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Shops, Offices, Retail Spaces</p>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                    High-street retail and premium office spaces offering superior rental yields (6-8%) compared to residential properties.
                  </p>
                  <div className="mt-auto pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xl font-extrabold text-[#10B981]">Starting ₹25 Lac</div>
                    <Button asChild className="bg-[#10B981] hover:bg-[#0e9f6e] text-white font-bold rounded-xl">
                      <Link to="/properties?type=Commercial">Browse Commercial</Link>
                    </Button>
                  </div>
                </div>

                {/* Option 4 */}
                <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 md:p-10 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-bl-full -z-10"></div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center">
                      <Star className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground mb-1">Premium Villas</h3>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Independent Villas & Farm Houses</p>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-grow">
                    Luxury living combined with land ownership. Exclusive communities offering privacy, space, and premium lifestyle amenities.
                  </p>
                  <div className="mt-auto pt-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xl font-extrabold text-[#D4AF37]">Starting ₹80 Lac</div>
                    <Button asChild variant="outline" className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-bold rounded-xl transition-colors">
                      <Link to="/properties?type=Villa">Browse Villas</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AREA GUIDE SECTION */}
          <section className="py-24 bg-white dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1e3a5f] dark:text-white mb-4 tracking-tight text-balance">
                  Top Investment Zones
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Zone 1 */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <Badge className="bg-[#10B981] hover:bg-[#10B981] text-white w-fit mb-6 px-3 py-1 font-bold border-none">
                    Established & Growing
                  </Badge>
                  <h3 className="text-2xl font-extrabold text-foreground mb-6">Greater Noida</h3>
                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#10B981] mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Well planned sectors</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#10B981] mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Metro connectivity</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#10B981] mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Top schools & hospitals</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#10B981] mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Strong resale market</span></li>
                  </ul>
                  <div className="pt-6 border-t border-border/50">
                    <p className="text-lg font-extrabold text-[#10B981]">Avg Price: ₹4,500 — ₹8,500 per Sq.ft</p>
                  </div>
                </div>

                {/* Zone 2 */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <Badge className="bg-[#1e3a5f] hover:bg-[#1e3a5f] text-white w-fit mb-6 px-3 py-1 font-bold border-none">
                    Premium & Connected
                  </Badge>
                  <h3 className="text-2xl font-extrabold text-foreground mb-6">Noida</h3>
                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#1e3a5f] dark:text-blue-400 mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Direct Delhi metro link</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#1e3a5f] dark:text-blue-400 mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">IT & corporate hub</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#1e3a5f] dark:text-blue-400 mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">High rental demand</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#1e3a5f] dark:text-blue-400 mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Premium projects</span></li>
                  </ul>
                  <div className="pt-6 border-t border-border/50">
                    <p className="text-lg font-extrabold text-[#1e3a5f] dark:text-blue-400">Avg Price: ₹6,000 — ₹12,000 per Sq.ft</p>
                  </div>
                </div>

                {/* Zone 3 */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <Badge className="bg-[#D4AF37] hover:bg-[#D4AF37] text-slate-900 w-fit mb-6 px-3 py-1 font-bold border-none">
                    Highest Growth Potential
                  </Badge>
                  <h3 className="text-2xl font-extrabold text-foreground mb-6">YEIDA / Yamuna Exp.</h3>
                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Jewar Airport proximity</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Film City project nearby</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">YEIDA authority plots</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-[#D4AF37] mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Early stage — best prices now</span></li>
                  </ul>
                  <div className="pt-6 border-t border-border/50">
                    <p className="text-lg font-extrabold text-[#D4AF37]">Avg Price: ₹2,500 — ₹6,000 per Sq.ft</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INVESTMENT PROCESS SECTION */}
          <section className="py-24 bg-gradient-to-br from-[#1e3a5f] to-slate-900 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-white mb-4 tracking-tight text-balance">
                  How to Invest with Growperty
                </h2>
                <p className="text-lg text-slate-300 font-medium">
                  Simple, transparent, and hassle-free
                </p>
              </div>

              <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-white/10"></div>
                
                {/* Connecting Line (Mobile) */}
                <div className="md:hidden absolute top-10 bottom-10 left-12 w-0.5 bg-white/10"></div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative">
                  {[
                    { icon: Search, num: '01', title: 'Browse Listings', desc: 'Explore verified properties and projects on Growperty.' },
                    { icon: Phone, num: '02', title: 'Talk to Our Team', desc: 'Call or WhatsApp Growperty. We guide you to the best investment options.' },
                    { icon: Eye, num: '03', title: 'Visit & Verify', desc: 'Growperty coordinates property visits. See before you invest.' },
                    { icon: Handshake, num: '04', title: 'Close the Deal', desc: 'Our team handles documentation and ensures smooth transaction.' }
                  ].map((step, idx) => (
                    <div key={idx} className="relative flex md:flex-col items-start md:items-center text-left md:text-center group">
                      <div className="w-24 h-24 shrink-0 md:w-24 md:h-24 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center relative z-10 shadow-xl group-hover:border-[#10B981] transition-colors duration-300">
                        <step.icon className="w-10 h-10 text-[#10B981]" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900">
                          {step.num}
                        </div>
                      </div>
                      <div className="ml-6 md:ml-0 md:mt-8">
                        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ SECTION */}
          <section className="py-24 bg-white dark:bg-slate-950">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#1e3a5f] dark:text-white mb-4 tracking-tight text-balance">
                  Frequently Asked Questions
                </h2>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="item-1" className="bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-xl px-6">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-[#10B981] transition-colors py-6">
                    Is it a good time to invest in Greater Noida?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    Yes. With Jewar Airport coming in 2025, metro expansion, and Film City project, Greater Noida is entering a growth phase. Prices are still affordable compared to Noida and Gurgaon, making it an ideal time to invest.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-xl px-6">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-[#10B981] transition-colors py-6">
                    What's the expected appreciation in YEIDA?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    YEIDA plots near Jewar Airport have shown 15-20% annual appreciation in recent years. With the airport launch, this is expected to accelerate further.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-xl px-6">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-[#10B981] transition-colors py-6">
                    Can I get a loan for investment properties?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    Yes. Most banks offer home loans for investment properties at competitive rates. Growperty can connect you with lenders.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-xl px-6">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-[#10B981] transition-colors py-6">
                    What's the rental yield in Greater Noida?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    Residential properties typically offer 3-4% annual rental yield. Commercial properties offer 6-8% yield depending on location and property type.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-xl px-6">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-[#10B981] transition-colors py-6">
                    Are properties RERA registered?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    Yes. All properties listed on Growperty are RERA registered or in the process of registration. This ensures buyer protection.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-xl px-6">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-[#10B981] transition-colors py-6">
                    How do I verify property authenticity?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    Growperty verifies all properties before listing. Our team also coordinates site visits so you can verify before investing.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" className="bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-xl px-6">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-[#10B981] transition-colors py-6">
                    What are the hidden costs in real estate investment?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    Registration, stamp duty, and maintenance charges. Growperty provides transparent cost breakdowns for each property.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" className="bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-xl px-6">
                  <AccordionTrigger className="text-left font-bold text-lg hover:no-underline hover:text-[#10B981] transition-colors py-6">
                    Can I invest as an NRI?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    Yes. NRIs can invest in Indian real estate. Growperty assists with documentation and compliance.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* FINAL CTA SECTION */}
          <section className="py-20 bg-gradient-to-r from-[#10B981] to-emerald-500">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-[28px] md:text-[36px] font-extrabold text-white mb-6 tracking-tight text-balance">
                Ready to Invest?
              </h2>
              <p className="text-lg text-emerald-50 mb-10 font-medium">
                Explore verified investment properties in Greater Noida, Noida, and YEIDA
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild className="bg-white text-[#10B981] hover:bg-slate-50 h-14 px-8 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]">
                  <Link to="/properties">Explore Properties</Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#10B981] h-14 px-8 text-lg font-bold rounded-xl transition-all active:scale-[0.98]">
                  <a href="https://wa.me/919953537876" target="_blank" rel="noopener noreferrer">Contact Our Team</a>
                </Button>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default InvestorPage;
