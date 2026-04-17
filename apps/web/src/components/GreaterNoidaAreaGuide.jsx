
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building, Train, BookOpen, Factory, Route as Road, Plane, 
  MapPin, TrendingUp, Percent, Star, CheckCircle2, ArrowRight,
  GraduationCap, Stethoscope, ShoppingBag, Home, ShieldCheck,
  Briefcase, Trees
} from 'lucide-react';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';

const GreaterNoidaAreaGuide = () => {
  return (
    <>
      <Helmet>
        <title>Greater Noida Real Estate Guide - Growperty</title>
        <meta name="description" content="Comprehensive area guide for Greater Noida real estate. Explore top localities, property prices, connectivity, and investment trends." />
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
                    Greater Noida Real Estate Guide
                  </h1>
                  <p className="text-[16px] md:text-[18px] text-primary-foreground/80 max-w-[60ch] mx-auto leading-relaxed font-medium mb-10">
                    Discover India's first ISO 9001:2000 certified urban planning city. A perfect blend of modern infrastructure, green spaces, and high-yield investment opportunities.
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
                  <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2 tracking-tight">₹4,500 — ₹8,500</div>
                  <div className="text-sm font-medium text-primary-foreground/70 uppercase tracking-wide">Price per Sq.ft</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center transform transition-transform hover:-translate-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2 tracking-tight">200+</div>
                  <div className="text-sm font-medium text-primary-foreground/70 uppercase tracking-wide">Residential Sectors</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center transform transition-transform hover:-translate-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2 tracking-tight">25 km</div>
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
                  About Greater Noida
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Planned with a vision for the future, Greater Noida offers wide roads, underground cabling, abundant green cover, and dedicated sectors for residential, commercial, and industrial development. It has rapidly emerged as a preferred destination for homebuyers seeking quality living and investors looking for strong capital appreciation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {[
                  { icon: Building, title: 'Well Planned City', desc: '25% green cover, wide roads, and systematic sector layouts.' },
                  { icon: Train, title: 'Metro Connected', desc: 'Aqua Line metro provides seamless connectivity to Noida and Delhi.' },
                  { icon: BookOpen, title: 'Education Hub', desc: 'Home to Knowledge Park, featuring top universities and schools.' },
                  { icon: Factory, title: 'Industrial Growth', desc: 'Major manufacturing hub attracting multinational corporations.' }
                ].map((highlight, idx) => (
                  <div key={idx} className="bg-muted rounded-2xl p-8 flex items-start gap-6 hover:bg-muted/80 transition-colors">
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
                  Explore the most sought-after sectors for residential investment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Sector Omega', type: 'Premium Residential', price: '₹6,500 - ₹9,000 / sq.ft', known: 'Luxury apartments and villas', popular: 'Families and corporate executives' },
                  { name: 'Sector Alpha', type: 'Established Hub', price: '₹5,500 - ₹8,000 / sq.ft', known: 'Excellent commercial markets', popular: 'End-users and long-term investors' },
                  { name: 'Sector Chi', type: 'Emerging Premium', price: '₹5,000 - ₹7,500 / sq.ft', known: 'Proximity to Yamuna Expressway', popular: 'Investors seeking high appreciation' },
                  { name: 'Sector Gamma', type: 'Central Location', price: '₹6,000 - ₹8,500 / sq.ft', known: 'Well-developed infrastructure', popular: 'Families seeking ready-to-move homes' },
                  { name: 'Sector Phi', type: 'Affordable Luxury', price: '₹4,500 - ₹7,000 / sq.ft', known: 'Spacious group housing societies', popular: 'First-time homebuyers' },
                  { name: 'Knowledge Park', type: 'Institutional/Rental', price: '₹5,000 - ₹8,000 / sq.ft', known: 'Educational institutions & IT parks', popular: 'Investors seeking rental yield' }
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
                    <h3 className="text-xl font-bold text-foreground mb-2">Road Network</h3>
                    <p className="text-muted-foreground leading-relaxed">Direct access to Noida-Greater Noida Expressway, Yamuna Expressway, and Eastern Peripheral Expressway.</p>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all flex items-start gap-6">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Train className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Metro Access</h3>
                    <p className="text-muted-foreground leading-relaxed">Aqua Line metro connects Greater Noida to Noida Sector 51, with further expansion plans approved.</p>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all flex items-start gap-6">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Plane className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Airport Proximity</h3>
                    <p className="text-muted-foreground leading-relaxed">Just 40 minutes from the upcoming Jewar International Airport, driving massive future appreciation.</p>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-all flex items-start gap-6">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Nearby Cities</h3>
                    <p className="text-muted-foreground leading-relaxed">Excellent connectivity to Delhi (25km), Noida (15km), Ghaziabad (20km), and Faridabad (30km).</p>
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
                      <GraduationCap className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Education</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Gautam Buddha University</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Shiv Nadar University</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Delhi Public School (DPS)</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Somerville School</span></li>
                  </ul>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Healthcare</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Yatharth Super Speciality</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Kailash Hospital</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Sharda Hospital</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Government Institute of Medical Sciences</span></li>
                  </ul>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Lifestyle</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">The Grand Venice Mall</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">Omaxe Connaught Place</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">MSX Mall</span></li>
                    <li className="flex items-start"><CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 mr-3 shrink-0" /><span className="text-muted-foreground">India Expo Mart</span></li>
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
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="p-6 font-bold text-lg">Property Type</th>
                      <th className="p-6 font-bold text-lg">Average Price Range</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card">
                    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">1 BHK Apartment</td>
                      <td className="p-6 font-bold text-secondary">₹25 Lac — ₹40 Lac</td>
                    </tr>
                    <tr className="border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">2 BHK Apartment</td>
                      <td className="p-6 font-bold text-secondary">₹45 Lac — ₹75 Lac</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">3 BHK Apartment</td>
                      <td className="p-6 font-bold text-secondary">₹75 Lac — ₹1.5 Cr</td>
                    </tr>
                    <tr className="border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">4 BHK / Penthouse</td>
                      <td className="p-6 font-bold text-secondary">₹1.5 Cr — ₹3.5 Cr</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-6 font-medium text-foreground">Residential Plot</td>
                      <td className="p-6 font-bold text-secondary">₹60,000 — ₹1,20,000 / sq.yd</td>
                    </tr>
                    <tr className="hover:bg-muted/50 transition-colors bg-muted/30">
                      <td className="p-6 font-medium text-foreground">Commercial Shop</td>
                      <td className="p-6 font-bold text-secondary">₹15,000 — ₹30,000 / sq.ft</td>
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
                  Why Invest in Greater Noida?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 lg:col-span-2">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">High Capital Appreciation</h3>
                  <p className="text-muted-foreground leading-relaxed">With the upcoming Jewar Airport and continuous infrastructure development, property values in Greater Noida have seen a steady 10-15% annual appreciation, outperforming many traditional NCR markets.</p>
                </div>
                
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <Home className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Affordability</h3>
                  <p className="text-muted-foreground leading-relaxed">Compared to Noida and Gurgaon, Greater Noida offers larger spaces and better amenities at significantly lower entry price points.</p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <Briefcase className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Employment Hub</h3>
                  <p className="text-muted-foreground leading-relaxed">Growing presence of IT/ITES companies, manufacturing units, and data centers is driving continuous housing demand.</p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <Trees className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Quality of Life</h3>
                  <p className="text-muted-foreground leading-relaxed">Low pollution levels, minimal traffic congestion, and abundant green spaces make it ideal for family living.</p>
                </div>

                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">RERA Compliance</h3>
                  <p className="text-muted-foreground leading-relaxed">A highly regulated market with strict RERA enforcement ensures buyer protection and timely project deliveries.</p>
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
                  <h3 className="text-4xl font-extrabold text-foreground mb-2">+12%</h3>
                  <p className="text-muted-foreground font-medium">YoY Price Growth</p>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Percent className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-4xl font-extrabold text-foreground mb-2">3.5 - 4%</h3>
                  <p className="text-muted-foreground font-medium">Average Rental Yield</p>
                </div>
                <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-4xl font-extrabold text-foreground mb-2">High</h3>
                  <p className="text-muted-foreground font-medium">Demand for 3 BHKs</p>
                </div>
              </div>
            </div>
          </section>

          {/* BOTTOM CTA SECTION */}
          <section className="py-20 bg-gradient-to-r from-secondary to-emerald-500">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-[28px] md:text-[36px] font-extrabold text-secondary-foreground mb-6 tracking-tight text-balance">
                Interested in Greater Noida Properties?
              </h2>
              <p className="text-lg text-secondary-foreground/90 mb-10 font-medium">
                Let our local experts help you find the perfect home or investment property.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button asChild className="bg-white text-secondary hover:bg-slate-50 h-14 px-8 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]">
                  <Link to="/properties?city=Greater+Noida">
                    Browse Greater Noida Properties
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-secondary h-14 px-8 text-lg font-bold rounded-xl transition-all active:scale-[0.98]">
                  <a href="https://wa.me/919953537876?text=Hi,%20I%20want%20to%20know%20about%20Greater%20Noida%20properties%20on%20Growperty.com" target="_blank" rel="noopener noreferrer">
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

export default GreaterNoidaAreaGuide;
