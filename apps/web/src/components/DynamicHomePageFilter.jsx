import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DynamicHomePageFilter = () => {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    propertySubType: '',
    tenure: '',
    bhk: '',
    minArea: '',
    maxArea: '',
    areaUnit: 'Sq.yd',
    budget: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (filters.city) params.append('city', filters.city);
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    if (filters.propertySubType) params.append('propertySubType', filters.propertySubType);
    if (filters.tenure) params.append('tenure', filters.tenure);
    if (filters.bhk && !isPlot && !isCommercial) params.append('bhk', filters.bhk);
    if (filters.minArea && (isPlot || isCommercial)) params.append('minArea', filters.minArea);
    if (filters.maxArea && (isPlot || isCommercial)) params.append('maxArea', filters.maxArea);
    if (filters.areaUnit && (isPlot || isCommercial)) params.append('areaUnit', filters.areaUnit);
    
    if (filters.budget) {
      const [min, max] = filters.budget.split('-');
      if (min) params.append('minPrice', min);
      if (max) params.append('maxPrice', max);
    }
    
    navigate(`/search?${params.toString()}`);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      // Reset dependent fields
      if (key === 'propertyType') {
        next.propertySubType = '';
        next.tenure = '';
        next.bhk = '';
        next.minArea = '';
        next.maxArea = '';
      }
      if (key === 'propertySubType') {
        next.tenure = '';
      }
      return next;
    });
  };

  const isPlot = filters.propertyType === 'Plot/Land';
  const isCommercial = filters.propertyType === 'Commercial';
  const showBhk = ['Flat/Apartment', 'Independent House', 'Villa', 'Penthouse'].includes(filters.propertyType);
  const showSize = isPlot || isCommercial;
  const showTenure = isPlot && filters.propertySubType === 'Residential Plot';

  const plotSubTypes = ['Residential Plot', 'Industrial Plot', 'Agricultural Land'];
  const commercialSubTypes = ['Shop', 'Office', 'Store'];
  const tenureOptions = ['Lease Hold', 'Free Hold', 'Kisan Kota'];
  const bhkOptions = ['1', '2', '3', '4', '5+'];

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-6 w-full">
      {/* Primary 4 Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. City */}
        <Select value={filters.city} onValueChange={(v) => updateFilter('city', v)} required>
          <SelectTrigger className="h-14 text-base rounded-xl border-slate-200 bg-white focus-visible:ring-primary font-semibold">
            <SelectValue placeholder="Select City *" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Noida">Noida</SelectItem>
            <SelectItem value="Greater Noida">Greater Noida</SelectItem>
            <SelectItem value="YEIDA">YEIDA</SelectItem>
            <SelectItem value="Ghaziabad">Ghaziabad</SelectItem>
            <SelectItem value="Delhi">Delhi</SelectItem>
          </SelectContent>
        </Select>

        {/* 2. Property Type */}
        <Select value={filters.propertyType} onValueChange={(v) => updateFilter('propertyType', v)} required>
          <SelectTrigger className="h-14 text-base rounded-xl border-slate-200 bg-white focus-visible:ring-primary font-semibold">
            <SelectValue placeholder="Property Type *" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Flat/Apartment">Flat / Apartment</SelectItem>
            <SelectItem value="Independent House">Independent House</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Penthouse">Penthouse</SelectItem>
            <SelectItem value="Plot/Land">Plot / Land</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>

        {/* 3. BHK / Size (Dynamic) */}
        <div className="relative flex items-center h-14 bg-white rounded-xl border border-slate-200 px-3">
          {!filters.propertyType ? (
            <span className="text-muted-foreground font-medium">Select Property Type First</span>
          ) : showBhk ? (
            <div className="w-full bhk-grid">
              {bhkOptions.map(bhk => (
                <button
                  key={bhk}
                  type="button"
                  onClick={() => updateFilter('bhk', bhk)}
                  className={cn(
                    "toggle-btn-base btn-compact",
                    filters.bhk === bhk ? "toggle-btn-on" : "toggle-btn-off"
                  )}
                >
                  <span className="relative z-10">{bhk} BHK</span>
                </button>
              ))}
            </div>
          ) : showSize ? (
            <div className="flex gap-2 w-full">
              <Input 
                type="number" 
                placeholder="Min" 
                className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold w-1/3 px-2"
                value={filters.minArea}
                onChange={(e) => updateFilter('minArea', e.target.value)}
              />
              <Input 
                type="number" 
                placeholder="Max" 
                className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold w-1/3 px-2"
                value={filters.maxArea}
                onChange={(e) => updateFilter('maxArea', e.target.value)}
              />
              <Select value={filters.areaUnit} onValueChange={(v) => updateFilter('areaUnit', v)}>
                <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-slate-50 font-semibold w-1/3 px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sq.ft">Sq.ft</SelectItem>
                  <SelectItem value="Sq.yd">Sq.yd</SelectItem>
                  <SelectItem value="Sq.m">Sq.m</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        {/* 4. Budget */}
        <Select value={filters.budget} onValueChange={(v) => updateFilter('budget', v)}>
          <SelectTrigger className="h-14 text-base rounded-xl border-slate-200 bg-white focus-visible:ring-primary font-semibold">
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-5000000">Upto ₹50 Lakh</SelectItem>
            <SelectItem value="5000000-10000000">₹50 Lakh - ₹1 Crore</SelectItem>
            <SelectItem value="10000000-20000000">₹1 Crore - ₹2 Crore</SelectItem>
            <SelectItem value="20000000-50000000">₹2 Crore - ₹5 Crore</SelectItem>
            <SelectItem value="50000000-999999999">₹5 Crore+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conditional Chain Logic Rows */}
      {(isPlot || isCommercial) && (
        <div className="flex flex-wrap gap-4 items-center bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-bold text-slate-500 mr-2 self-center">Sub-Type:</span>
            {(isPlot ? plotSubTypes : commercialSubTypes).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => updateFilter('propertySubType', type)}
                className={cn(
                  "toggle-btn-base btn-standard",
                  filters.propertySubType === type ? "toggle-btn-on" : "toggle-btn-off"
                )}
              >
                {type}
              </button>
            ))}
          </div>

          {showTenure && (
            <div className="flex flex-wrap gap-2 ml-0 lg:ml-4 pl-0 lg:pl-4 border-l-0 lg:border-l border-slate-200">
              <span className="text-sm font-bold text-slate-500 mr-2 self-center">Tenure:</span>
              {tenureOptions.map(tenure => (
                <button
                  key={tenure}
                  type="button"
                  onClick={() => updateFilter('tenure', tenure)}
                  className={cn(
                    "toggle-btn-base btn-standard",
                    filters.tenure === tenure ? "toggle-btn-on" : "toggle-btn-off"
                  )}
                >
                  {tenure}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Button type="submit" className="h-14 px-8 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] bg-primary hover:bg-primary/90 w-full lg:w-auto lg:self-end">
        <Search className="h-5 w-5 mr-2" />
        Search Properties
      </Button>
    </form>
  );
};

export default DynamicHomePageFilter;