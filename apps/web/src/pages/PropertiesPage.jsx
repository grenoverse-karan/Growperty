import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import ProjectCard from '@/components/ProjectCard.jsx';
import FestivalOfferTicker from '@/components/FestivalOfferTicker.jsx';
import PropertyFilter from '@/components/PropertyFilter.jsx';
import { useProperties } from '@/hooks/useProperties.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { Search, SlidersHorizontal, Building2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const PropertiesPage = () => {
  const { fetchProperties, filterProperties, isLoading, error } = useProperties();

  useEffect(() => {
    // Include sold listings too — PropertyCard renders them distinctly and
    // filterProperties() below sorts them to the end of the grid.
    fetchProperties('approved,sold');
  }, [fetchProperties]);

  // Projects aren't a separate section — they're woven into the same
  // listing feed as properties (newest first), just tagged with a small
  // "Project" badge so it's clear what you're looking at. Property-specific
  // filters (BHK, size, price) don't apply to a multi-unit project, so these
  // always show regardless of the sidebar filters.
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServerClient.fetch('/projects?status=approved&limit=50');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setProjects(Array.isArray(data.items) ? data.items : []);
      } catch {
        // Non-fatal — the property grid is the page's main content either way.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    location: 'all',
    type: searchParams.get('type') || 'all',
    plotType: 'all',
    bhk: 'all',
    maxPrice: 50000000,
  });

  const filteredProperties = useMemo(() => {
    return filterProperties(filters);
  }, [filters, filterProperties]);

  // Properties + projects merged into one chronological feed (newest first),
  // each entry carrying its own kind so the grid below knows which card to render.
  const feedItems = useMemo(() => {
    const items = [
      ...filteredProperties.map(property => ({ kind: 'property', key: `p-${property.id}`, data: property, createdAt: property.createdAt })),
      ...projects.map(project => ({ kind: 'project', key: `j-${project._id}`, data: project, createdAt: project.createdAt })),
    ];
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return items;
  }, [filteredProperties, projects]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <Helmet>
        <title>Browse Properties in Greater Noida & YEIDA - Growperty.com</title>
        <meta name="description" content="Explore our extensive collection of verified properties for sale in Greater Noida and YEIDA. Filter by budget, BHK, and location." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1">
          {/* No visible banner — the page heading stays for SEO / screen readers only. */}
          <h1 className="sr-only">Discover Properties You Want</h1>
          <FestivalOfferTicker to={null} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-80 flex-shrink-0">
                <PropertyFilter onFilter={handleFilterChange} />
              </aside>

              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full h-14 text-base font-bold shadow-sm rounded-xl border-border/60">
                      <SlidersHorizontal className="h-5 w-5 mr-2" />
                      Filter Properties
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] sm:w-[380px] overflow-y-auto p-0">
                    <SheetTitle className="sr-only">Filter Properties</SheetTitle>
                    <div className="p-4">
                      <PropertyFilter onFilter={handleFilterChange} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Property Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-extrabold text-foreground">
                    {isLoading
                      ? 'Loading Properties...'
                      : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'Property' : 'Properties'} Found`}
                    {!isLoading && projects.length > 0 && (
                      <span className="text-base font-semibold text-muted-foreground"> + {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}</span>
                    )}
                  </h2>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-4">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-destructive/10 rounded-2xl border border-destructive/20">
                    <p className="text-destructive font-medium">{error}</p>
                  </div>
                ) : feedItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-24 bg-white dark:bg-slate-900/50 rounded-3xl border border-border/50 shadow-sm"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">No properties found</h3>
                    <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto font-medium">
                      We couldn't find any properties matching your current filters. Try adjusting your budget or location.
                    </p>
                    <Button
                      onClick={() => handleFilterChange({ location: 'all', type: 'all', plotType: 'all', bhk: 'all', maxPrice: 50000000 })}
                      className="h-12 px-8 rounded-xl font-bold shadow-md bg-primary hover:bg-primary/90"
                    >
                      Clear All Filters
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                    {feedItems.map((item, index) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
                      >
                        {item.kind === 'project' ? (
                          <ProjectCard project={item.data} index={index} />
                        ) : (
                          <PropertyCard property={item.data} />
                        )}
                      </motion.div>
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
};

export default PropertiesPage;