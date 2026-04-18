import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [sortBy, setSortBy] = useState('newest');

  const fetchResults = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query string from URL params
      const queryParams = new URLSearchParams(searchParams);
      queryParams.set('page', page);
      queryParams.set('limit', 10);
      
      const response = await apiServerClient.fetch(`/properties/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const data = await response.json();
      
      // Client-side sorting since backend doesn't explicitly support sort param in the prompt
      let sortedItems = [...data.items];
      if (sortBy === 'price-asc') {
        sortedItems.sort((a, b) => (a.price || a.expectedPrice || 0) - (b.price || b.expectedPrice || 0));
      } else if (sortBy === 'price-desc') {
        sortedItems.sort((a, b) => (b.price || b.expectedPrice || 0) - (a.price || a.expectedPrice || 0));
      }
      
      setProperties(sortedItems);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        totalItems: data.totalItems
      });
      
    } catch (err) {
      console.error('Search error:', err);
      setError('Could not load search results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(1);
  }, [searchParams]);

  // Re-sort when sortBy changes without re-fetching
  useEffect(() => {
    if (properties.length > 0) {
      let sortedItems = [...properties];
      if (sortBy === 'price-asc') {
        sortedItems.sort((a, b) => (a.price || a.expectedPrice || 0) - (b.price || b.expectedPrice || 0));
      } else if (sortBy === 'price-desc') {
        sortedItems.sort((a, b) => (b.price || b.expectedPrice || 0) - (a.price || a.expectedPrice || 0));
      } else if (sortBy === 'newest') {
        // Assuming created_at exists, otherwise fallback to id string comparison
        sortedItems.sort((a, b) => new Date(b.created_at || b.created || 0) - new Date(a.created_at || a.created || 0));
      }
      setProperties(sortedItems);
    }
  }, [sortBy]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchResults(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const city = searchParams.get('city');
  const propertyType = searchParams.get('propertyType');
  const searchTitle = city && propertyType ? `${propertyType}s in ${city}` : 'Search Results';

  return (
    <>
      <Helmet>
        <title>{searchTitle} | Growperty.com</title>
        <meta name="description" content={`Browse verified ${propertyType || 'properties'} in ${city || 'Delhi NCR'}.`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1 py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <Button variant="ghost" onClick={() => navigate('/')} className="mb-2 -ml-4 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Modify Search
                </Button>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  {searchTitle}
                </h1>
                <p className="text-muted-foreground font-medium mt-2">
                  {isLoading ? 'Searching...' : `Found ${pagination.totalItems} matching properties`}
                </p>
              </div>

              {!isLoading && properties.length > 0 && (
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-xl border border-border shadow-sm">
                  <SlidersHorizontal className="h-5 w-5 text-muted-foreground ml-2" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] border-0 bg-transparent focus:ring-0 font-semibold">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Results Section */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Finding the best matches for you...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-destructive/5 rounded-3xl border border-destructive/20 text-center shadow-sm">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-2xl font-bold text-destructive mb-2">Oops! Something went wrong</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => fetchResults(pagination.page)} className="rounded-xl font-bold h-12 px-8">
                  Try Again
                </Button>
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-slate-900/50 rounded-3xl border border-border/50 text-center shadow-sm">
                <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">No exact matches found</h3>
                <p className="text-muted-foreground max-w-md mb-8 font-medium leading-relaxed">
                  We couldn't find any properties matching your exact criteria. Try adjusting your filters or budget.
                </p>
                <Button onClick={() => navigate('/')} className="rounded-xl font-bold h-12 px-8 shadow-md">
                  Modify Search Criteria
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {properties.map((property, index) => (
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-border">
                    <Button 
                      variant="outline" 
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="rounded-xl font-bold"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 px-4 font-medium text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="rounded-xl font-bold"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SearchResultsPage;