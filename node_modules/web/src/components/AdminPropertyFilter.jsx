import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, FilterX } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const AdminPropertyFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state for debounced search
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  
  // Dynamic filter options
  const [cities, setCities] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  // Fetch unique cities and property types on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const records = await pb.collection('properties').getFullList({
          fields: 'city,propertyType',
          $autoCancel: false
        });
        
        const uniqueCities = [...new Set(records.map(r => r.city).filter(Boolean))].sort();
        const uniqueTypes = [...new Set(records.map(r => r.propertyType).filter(Boolean))].sort();
        
        setCities(uniqueCities);
        setPropertyTypes(uniqueTypes);
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParams = Object.fromEntries([...searchParams]);
      if (searchValue) {
        currentParams.search = searchValue;
      } else {
        delete currentParams.search;
      }
      // Reset to page 1 on search
      currentParams.page = '1';
      setSearchParams(currentParams);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchParams, setSearchParams]);

  const handleFilterChange = (key, value) => {
    const currentParams = Object.fromEntries([...searchParams]);
    if (value && value !== 'all') {
      currentParams[key] = value;
    } else {
      delete currentParams[key];
    }
    // Reset to page 1 on filter change
    currentParams.page = '1';
    setSearchParams(currentParams);
  };

  const handleReset = () => {
    setSearchValue('');
    // Keep status if it exists
    const status = searchParams.get('status');
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  // Calculate active filters count (excluding pagination and status)
  const activeFiltersCount = Array.from(searchParams.keys()).filter(k => !['page', 'limit', 'status'].includes(k)).length;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-border/50 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search ID, Phone, or Name..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 pr-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-border/50"
          />
          {searchValue && (
            <button 
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Date Filter */}
          <Select 
            value={searchParams.get('dateFilter') || 'alltime'} 
            onValueChange={(val) => handleFilterChange('dateFilter', val)}
          >
            <SelectTrigger className="w-[140px] h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-border/50 font-medium">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="alltime">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          {/* City Filter */}
          <Select 
            value={searchParams.get('city') || 'all'} 
            onValueChange={(val) => handleFilterChange('city', val)}
          >
            <SelectTrigger className="w-[140px] h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-border/50 font-medium">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Property Type Filter */}
          <Select 
            value={searchParams.get('propertyType') || 'all'} 
            onValueChange={(val) => handleFilterChange('propertyType', val)}
          >
            <SelectTrigger className="w-[150px] h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-border/50 font-medium">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Types</SelectItem>
              {propertyTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              onClick={handleReset}
              className="h-11 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl font-bold transition-colors"
            >
              <FilterX className="h-4 w-4 mr-2" />
              Reset
              <Badge variant="secondary" className="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {activeFiltersCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyFilter;