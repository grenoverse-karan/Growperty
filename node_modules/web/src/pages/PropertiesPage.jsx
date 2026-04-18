import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import PropertyFilter from '@/components/PropertyFilter.jsx';
import { useProperties } from '@/hooks/useProperties.js';
import { Search, SlidersHorizontal, Building2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const PropertiesPage = () => {
  const { fetchProperties, filterProperties, isLoading, error } = useProperties();

  useEffect(() => {
    fetchProperties('approved');
  }, [fetchProperties]);

  const [filters, setFilters] = useState({
    location: 'all',
    type: 'all',
    plotType: 'all',
    bhk: 'all',
    maxPrice: 50000000,
    verified: false
  });

  const filteredProperties = useMemo(() => {
    return filterProperties(filters);
  }, [filters, filterProperties]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <Helmet>
        <title>Browse Properties in Delhi NCR - Growperty.com</title>
        <meta name="description" content="Explore our extensive collection of verified properties for sale in Noida, Greater Noida, and YEIDA. Filter by budget, BHK, and location." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1">
          <div className="bg-secondary text-secondary-foreground py-16 md:py-20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl"
              >
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                  Discover Premium Properties
                </h1>
                <p className="text-lg md:text-xl text-secondary-foreground/80 leading-relaxed font-medium">
                  Browse our curated selection of verified real estate across Delhi-NCR. Use the filters to find exactly what you're looking for.
                </p>
              </motion.div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                    {isLoading ? 'Loading Properties...' : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'Property' : 'Properties'} Found`}
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
                ) : filteredProperties.length === 0 ? (
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
                      We couldn't find any properties matching your current filters in Delhi-NCR. Try adjusting your budget or location.
                    </p>
                    <Button
                      onClick={() => handleFilterChange({ location: 'all', type: 'all', plotType: 'all', bhk: 'all', maxPrice: 50000000, verified: false })}
                      className="h-12 px-8 rounded-xl font-bold shadow-md bg-primary hover:bg-primary/90"
                    >
                      Clear All Filters
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                    {filteredProperties.map((property, index) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <PropertyCard property={property} />
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