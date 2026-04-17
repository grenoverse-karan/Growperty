import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const HomePageSearchFilter = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
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
    if (filters.bhk && filters.propertyType !== 'Plot/Land') params.append('bhk', filters.bhk);
    if (filters.minArea && filters.propertyType === 'Plot/Land') params.append('minArea', filters.minArea);
    if (filters.maxArea && filters.propertyType === 'Plot/Land') params.append('maxArea', filters.maxArea);
    if (filters.budget) params.append('budget', filters.budget);
    
    navigate(`/properties?${params.toString()}`);
  };

  const isPlot = filters.propertyType === 'Plot/Land';

  return (
    <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 w-full">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* City */}
        <div className="relative">
          <Select value={filters.city} onValueChange={(v) => setFilters({ ...filters, city: v })} required>
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
        </div>

        {/* Property Type */}
        <div className="relative">
          <Select value={filters.propertyType} onValueChange={(v) => setFilters({ ...filters, propertyType: v, bhk: '', minArea: '', maxArea: '' })} required>
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
        </div>

        {/* Dynamic BHK / Area */}
        <div className="relative">
          {isPlot ? (
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="Min Area" 
                className="h-14 rounded-xl border-slate-200 bg-white font-semibold w-1/2"
                value={filters.minArea}
                onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
              />
              <Input 
                type="number" 
                placeholder="Max Area" 
                className="h-14 rounded-xl border-slate-200 bg-white font-semibold w-1/2"
                value={filters.maxArea}
                onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
              />
            </div>
          ) : (
            <Select value={filters.bhk} onValueChange={(v) => setFilters({ ...filters, bhk: v })} disabled={!filters.propertyType || filters.propertyType === 'Commercial'}>
              <SelectTrigger className="h-14 text-base rounded-xl border-slate-200 bg-white focus-visible:ring-primary font-semibold disabled:opacity-50">
                <SelectValue placeholder="BHK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 BHK</SelectItem>
                <SelectItem value="2">2 BHK</SelectItem>
                <SelectItem value="3">3 BHK</SelectItem>
                <SelectItem value="4">4 BHK</SelectItem>
                <SelectItem value="5+">5+ BHK</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Budget */}
        <div className="relative">
          <Select value={filters.budget} onValueChange={(v) => setFilters({ ...filters, budget: v })}>
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
      </div>

      <Button type="submit" className="h-14 px-8 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] bg-primary hover:bg-primary/90 w-full lg:w-auto flex-shrink-0">
        <Search className="h-5 w-5 mr-2" />
        Search
      </Button>
    </form>
  );
};

export default HomePageSearchFilter;