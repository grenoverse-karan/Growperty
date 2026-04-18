
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Car, Dumbbell, Waves, Trees, Shield, Zap, Home, Forklift as Lift, Building2, Search, ArrowRight, CheckCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

const projectsData = [
  {
    id: 1,
    name: 'Greenwood Heights',
    builder: 'ABC Developers',
    location: 'Sector 1, Greater Noida',
    type: '2-3 BHK Apartments',
    priceRange: '₹45L - ₹85L',
    status: 'READY TO MOVE',
    image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324',
    amenities: [
      { icon: Car, label: 'Parking' },
      { icon: Dumbbell, label: 'Gym' },
      { icon: Waves, label: 'Pool' }
    ]
  },
  {
    id: 2,
    name: 'Royal Villas',
    builder: 'XYZ Builders',
    location: 'Sector Omega 1, Greater Noida',
    type: '4-5 BHK Villas',
    priceRange: '₹1.5Cr - ₹3Cr',
    status: 'UNDER CONSTRUCTION',
    image: 'https://images.unsplash.com/photo-1676615026612-8d7642335476',
    amenities: [
      { icon: Car, label: 'Parking' },
      { icon: Trees, label: 'Garden' },
      { icon: Shield, label: 'Security' }
    ]
  },
  {
    id: 3,
    name: 'YEIDA Plot Scheme',
    builder: 'Authority Plots',
    location: 'Sector 18, Yamuna Expressway',
    type: 'Residential Plots',
    priceRange: '₹25L - ₹80L',
    status: 'NEW LAUNCH',
    image: 'https://images.unsplash.com/photo-1693251097322-389b34006058',
    amenities: [
      { icon: MapPin, label: 'Road Access' },
      { icon: Zap, label: 'Utilities' },
      { icon: Shield, label: 'Gated' }
    ]
  },
  {
    id: 4,
    name: 'Tech Park Residency',
    builder: 'PQR Group',
    location: 'Sector 62, Noida',
    type: '2-3 BHK Apartments',
    priceRange: '₹60L - ₹1.1Cr',
    status: 'UNDER CONSTRUCTION',
    image: 'https://images.unsplash.com/photo-1703176309340-68f50990c6c5',
    amenities: [
      { icon: Car, label: 'Parking' },
      { icon: Dumbbell, label: 'Gym' },
      { icon: Zap, label: 'Co-working' }
    ]
  },
  {
    id: 5,
    name: 'Pearl County',
    builder: 'LMN Builders',
    location: 'Sector Chi 4, Greater Noida',
    type: '3-4 BHK Apartments',
    priceRange: '₹75L - ₹1.4Cr',
    status: 'READY TO MOVE',
    image: 'https://images.unsplash.com/photo-1619842799356-06c1c91c9d18',
    amenities: [
      { icon: Car, label: 'Parking' },
      { icon: Waves, label: 'Pool' },
      { icon: Home, label: 'Clubhouse' }
    ]
  },
  {
    id: 6,
    name: 'Business Square',
    builder: 'RST Developers',
    location: 'Sector Alpha 2, Greater Noida',
    type: 'Commercial Shops & Offices',
    priceRange: '₹30L - ₹2Cr',
    status: 'NEW LAUNCH',
    image: 'https://images.unsplash.com/photo-1602385602836-beb9f3d8099f',
    amenities: [
      { icon: Car, label: 'Parking' },
      { icon: Shield, label: 'Security' },
      { icon: Lift, label: 'Lift' }
    ]
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'READY TO MOVE':
      return 'bg-emerald-500 hover:bg-emerald-600 text-white';
    case 'UNDER CONSTRUCTION':
      return 'bg-amber-500 hover:bg-amber-600 text-white';
    case 'NEW LAUNCH':
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    default:
      return 'bg-slate-500 hover:bg-slate-600 text-white';
  }
};

const ProjectsPage = () => {
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    status: '',
    minBudget: '',
    maxBudget: ''
  });

  return (
    <>
      <Helmet>
        <title>Top Property Projects in Noida & Greater Noida | Growperty</title>
        <meta name="description" content="Discover verified residential and commercial projects across Greater Noida, Noida, and YEIDA. Find ready to move, under construction, and new launch properties." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-grow">
          {/* HERO SECTION */}
          <section className="relative pt-24 pb-32 overflow-hidden bg-brand-blue dark:bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-slate-900 to-slate-950 opacity-95 z-0" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] opacity-10 mix-blend-overlay z-0 bg-cover bg-center" />
            
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-bold tracking-widest uppercase mb-8 backdrop-blur-sm">
                  <Building2 className="w-4 h-4 mr-2" />
                  Premium Developments
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight text-balance leading-tight">
                  Explore Top Property Projects
                </h1>
                <p className="text-lg md:text-xl text-blue-100 dark:text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto text-balance">
                  Discover verified residential and commercial projects across Greater Noida, Noida, and YEIDA. From luxury villas to high-yield commercial spaces.
                </p>
              </motion.div>
            </div>
          </section>

          {/* FILTER SECTION */}
          <section className="relative z-20 -mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-border/50 p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
                <Search className="w-5 h-5 mr-2 text-emerald-500" />
                Find Your Perfect Project
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">City</label>
                  <Select value={filters.city} onValueChange={(v) => setFilters({...filters, city: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <SelectValue placeholder="Any City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater-noida">Greater Noida</SelectItem>
                      <SelectItem value="noida">Noida</SelectItem>
                      <SelectItem value="yeida">YEIDA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Property Type</label>
                  <Select value={filters.type} onValueChange={(v) => setFilters({...filters, type: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <SelectValue placeholder="Any Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="plots">Plots</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Status</label>
                  <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <SelectValue placeholder="Any Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready">Ready to Move</SelectItem>
                      <SelectItem value="under-construction">Under Construction</SelectItem>
                      <SelectItem value="new-launch">New Launch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Budget Range (₹)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Min" 
                      type="number" 
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950"
                      value={filters.minBudget}
                      onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input 
                      placeholder="Max" 
                      type="number" 
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950"
                      value={filters.maxBudget}
                      onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                    />
                  </div>
                </div>

                <div className="lg:col-span-4 mt-2 flex justify-end">
                  <Button className="w-full md:w-auto h-12 px-8 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                    Search Projects
                  </Button>
                </div>
              </div>
            </motion.div>
          </section>

          {/* PROJECTS GRID SECTION */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-blue dark:text-white tracking-tight">
                  Featured Projects
                </h2>
                <div className="w-16 h-1.5 bg-emerald-500 mt-4 rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projectsData.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 border border-border/50 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={`px-3 py-1.5 font-bold text-xs shadow-md border-none ${getStatusColor(project.status)}`}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                        <h3 className="text-2xl font-bold text-white mb-1 leading-tight">
                          {project.name}
                        </h3>
                        <p className="text-slate-300 text-sm font-medium">
                          by {project.builder}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-start gap-2 text-muted-foreground mb-4">
                        <MapPin className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                        <span className="font-medium">{project.location}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-border/50">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Type</p>
                          <p className="font-bold text-foreground text-sm">{project.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Price</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{project.priceRange}</p>
                        </div>
                      </div>

                      <div className="mb-8">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Amenities</p>
                        <div className="flex flex-wrap gap-3">
                          {project.amenities.map((amenity, i) => {
                            const Icon = amenity.icon;
                            return (
                              <div key={i} className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-sm font-medium text-foreground" title={amenity.label}>
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <span>{amenity.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-border/50">
                        <Button className="w-full h-12 rounded-xl font-bold bg-brand-blue hover:bg-brand-blue/90 text-white transition-all group-hover:bg-emerald-500">
                          View Project Details
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* TRUST BANNER SECTION */}
          <section className="py-16 bg-emerald-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] opacity-5 mix-blend-overlay z-0 bg-cover bg-center" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <CheckCircle className="w-12 h-12 text-white mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                All projects are verified by Growperty team
              </h2>
              <p className="text-lg text-emerald-50 font-medium mb-8 max-w-2xl mx-auto">
                Enquire through Growperty — owner and builder contact is never shared publicly. We ensure a safe and transparent buying experience.
              </p>
              <Button 
                asChild 
                size="lg" 
                className="h-14 px-8 text-lg font-bold bg-white text-emerald-600 hover:bg-slate-50 rounded-xl shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
              >
                <a href="https://wa.me/919953537876" target="_blank" rel="noopener noreferrer">
                  Enquire Now via WhatsApp
                </a>
              </Button>
            </div>
          </section>

          {/* LIST YOUR PROJECT SECTION */}
          <section className="py-20 bg-slate-100 dark:bg-slate-900/50 border-t border-border/50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">
                Are you a Builder or Developer?
              </h2>
              <p className="text-lg text-muted-foreground font-medium mb-8">
                List your project on Growperty and reach genuine buyers across Greater Noida, Noida, and YEIDA.
              </p>
              <Button 
                asChild 
                size="lg" 
                className="h-14 px-8 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <Link to="/contact">
                  List Your Project
                </Link>
              </Button>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProjectsPage;
