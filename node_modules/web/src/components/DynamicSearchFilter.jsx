import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { formatPriceInWords } from '@/lib/priceUtils.js';

const DynamicSearchFilter = () => {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    bhk: '',
    minArea: '',
    maxArea: '',
    areaUnit: 'Sq.yd',
    minPrice: '',
    maxPrice: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (filters.city) params.append('city', filters.city);
    if (filters.propertyType) params.append('propertyType', filters.propertyType);
    if (filters.bhk && !isPlot && !isCommercial) params.append('bhk', filters.bhk);
    if (filters.minArea && (isPlot || isCommercial)) params.append('minArea', filters.minArea);
    if (filters.maxArea && (isPlot || isCommercial)) params.append('maxArea', filters.maxArea);
    if (filters.areaUnit && (isPlot || isCommercial)) params.append('areaUnit', filters.areaUnit);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    
    navigate(`/search?${params.toString()}`);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'propertyType') {
        next.bhk = '';
        next.minArea = '';
        next.maxArea = '';
      }
      return next;
    });
  };

  const isPlot = filters.propertyType === 'Plot/Land';
  const isCommercial = filters.propertyType === 'Commercial';
  const showBhk = ['Flat/Apartment', 'House/Villa'].includes(filters.propertyType);
  const showSize = isPlot || isCommercial;

  return (
    <form onSubmit={handleSearch} className="w-full bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-lg border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-4">
        
        {/* 1. City */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City *</label>
          <Select value={filters.city} onValueChange={(v) => updateFilter('city', v)} required>
            <SelectTrigger className="h-[44px] lg:h-[40px] rounded-md border-[#e0e0e0] focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white font-medium">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Noida">Noida</SelectItem>
              <SelectItem value="Greater Noida">Greater Noida</SelectItem>
              <SelectItem value="YEIDA">YEIDA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 2. Property Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Type *</label>
          <Select value={filters.propertyType} onValueChange={(v) => updateFilter('propertyType', v)} required>
            <SelectTrigger className="h-[44px] lg:h-[40px] rounded-md border-[#e0e0e0] focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white font-medium">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Flat/Apartment">Flat / Apartment</SelectItem>
              <SelectItem value="House/Villa">House / Villa</SelectItem>
              <SelectItem value="Plot/Land">Plot / Land</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 3. Dynamic Field (BHK or Size) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {showBhk ? 'BHK' : showSize ? 'Size' : 'Size / BHK'}
          </label>
          {!filters.propertyType ? (
            <div className="h-[44px] lg:h-[40px] rounded-md border border-[#e0e0e0] bg-slate-50 flex items-center px-3 text-sm text-muted-foreground">
              Select Property Type First
            </div>
          ) : showBhk ? (
            <Select value={filters.bhk} onValueChange={(v) => updateFilter('bhk', v)}>
              <SelectTrigger className="h-[44px] lg:h-[40px] rounded-md border-[#e0e0e0] focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white font-medium">
                <SelectValue placeholder="Select BHK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 BHK</SelectItem>
                <SelectItem value="2">2 BHK</SelectItem>
                <SelectItem value="3">3 BHK</SelectItem>
                <SelectItem value="4">4 BHK</SelectItem>
                <SelectItem value="5+">5+ BHK</SelectItem>
              </SelectContent>
            </Select>
          ) : showSize ? (
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Min" 
                className="h-[44px] lg:h-[40px] rounded-md border-[#e0e0e0] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 w-1/3 px-2"
                value={filters.minArea}
                onChange={(e) => updateFilter('minArea', e.target.value)}
              />
              <Input 
                type="number" 
                placeholder="Max" 
                className="h-[44px] lg:h-[40px] rounded-md border-[#e0e0e0] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 w-1/3 px-2"
                value={filters.maxArea}
                onChange={(e) => updateFilter('maxArea', e.target.value)}
              />
              <Select value={filters.areaUnit} onValueChange={(v) => updateFilter('areaUnit', v)}>
                <SelectTrigger className="h-[44px] lg:h-[40px] rounded-md border-[#e0e0e0] focus:border-primary focus:ring-1 focus:ring-primary/20 w-1/3 px-2">
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
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget (₹)</label>
          <div className="flex gap-2">
            <Input 
              type="number" 
              placeholder="Min Price" 
              className="h-[44px] lg:h-[40px] rounded-md border-[#e0e0e0] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 w-1/2"
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
            />
            <Input 
              type="number" 
              placeholder="Max Price" 
              className="h-[44px] lg:h-[40px] rounded-md border-[#e0e0e0] focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 w-1/2"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
            />
          </div>
          {(filters.minPrice || filters.maxPrice) && (
            <span className="text-[10px] text-muted-foreground truncate">
              {filters.minPrice ? formatPriceInWords(filters.minPrice) : '0'} - {filters.maxPrice ? formatPriceInWords(filters.maxPrice) : 'Any'}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 md:mt-6 flex justify-end">
        <Button type="submit" className="w-full md:w-auto h-[44px] px-8 text-base font-bold rounded-md shadow-md hover:shadow-lg transition-all active:scale-[0.98] bg-primary hover:bg-primary/90 text-white">
          <Search className="h-4 w-4 mr-2" />
          Search Properties
        </Button>
      </div>
    </form>
  );
};

export default DynamicSearchFilter;