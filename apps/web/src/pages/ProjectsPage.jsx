
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Search, CheckCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { flattenPricing } from '@/lib/projectPricing.js';
import { PROJECT_CITY_LABELS } from '@/lib/projectDisplay.js';
import ProjectCard from '@/components/ProjectCard.jsx';
import { openWhatsApp } from '@/lib/whatsappLink.js';

const matchesFilters = (p, f) => {
  if (f.city && p.city !== f.city) return false;
  if (f.type === 'Plots') {
    if (!(p.propertyTypes || []).includes('Plot/Land')) return false;
  } else if (f.type && p.projectType !== f.type && p.projectType !== 'Mixed Use') {
    return false;
  }
  if (f.status && p.projectStatus !== f.status) return false;
  // Budget: keep projects whose price range overlaps the requested one.
  const { range } = flattenPricing(p.propertyTypePricing);
  const min = Number(f.minBudget) || 0;
  const max = Number(f.maxBudget) || Infinity;
  if ((min || max !== Infinity) && (!range || range.max < min || range.min > max)) return false;
  return true;
};

const ProjectsPage = () => {
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    status: '',
    minBudget: '',
    maxBudget: ''
  });
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Only real, admin-approved listings — newest first (API default sort).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServerClient.fetch('/projects?status=approved&limit=100');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setProjects(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const visibleProjects = useMemo(() => projects.filter(p => matchesFilters(p, filters)), [projects, filters]);
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <Helmet>
        <title>Top Property Projects in Greater Noida & YEIDA | Growperty</title>
        <meta name="description" content="Discover verified residential and commercial projects across Greater Noida and YEIDA. Find ready to move, under construction, and new launch properties." />
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
                  Discover verified residential and commercial projects across Greater Noida and YEIDA (Yamuna Expressway). From luxury villas to high-yield commercial spaces.
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
                      {Object.entries(PROJECT_CITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
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
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Plots">Plots</SelectItem>
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
                      {['Upcoming', 'New Launch', 'Under Construction', 'Nearing Possession', 'Ready to Move', 'Completed'].map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
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

                {hasActiveFilters && (
                  <div className="lg:col-span-4 mt-2 flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setFilters({ city: '', type: '', status: '', minBudget: '', maxBudget: '' })}
                      className="w-full md:w-auto h-12 px-8 rounded-xl font-bold"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </section>

          {/* PROJECTS GRID SECTION */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-blue dark:text-white tracking-tight">
                  {hasActiveFilters ? `${visibleProjects.length} Project${visibleProjects.length === 1 ? '' : 's'} Found` : 'Featured Projects'}
                </h2>
                <div className="w-16 h-1.5 bg-emerald-500 mt-4 rounded-full" />
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[0, 1, 2].map(i => <Skeleton key={i} className="h-[460px] rounded-2xl" />)}
                </div>
              ) : loadError ? (
                <p className="text-center text-muted-foreground py-16">Couldn&apos;t load projects right now. Please refresh the page.</p>
              ) : visibleProjects.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-border/50">
                  <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-bold text-foreground">{projects.length ? 'No projects match these filters.' : 'New projects are coming soon.'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{projects.length ? 'Try clearing a filter or widening the budget.' : 'Check back shortly — verified projects are being added.'}</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleProjects.map((project, index) => (
                  <ProjectCard key={project._id} project={project} index={index} />
                ))}
              </div>
              )}
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
                size="lg" 
                onClick={() => openWhatsApp('Hi, I\'m looking for a project on Growperty.')}
                className="h-14 px-8 text-lg font-bold bg-white text-emerald-600 hover:bg-slate-50 rounded-xl shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
              >
                Enquire Now via WhatsApp
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
                List your project on Growperty and reach genuine buyers across Greater Noida and YEIDA.
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
