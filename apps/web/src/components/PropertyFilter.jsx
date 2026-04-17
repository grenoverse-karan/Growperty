import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SlidersHorizontal, X } from 'lucide-react';
import { formatIndianPrice } from '@/hooks/useProperties.js';

const PropertyFilter = ({ onFilter }) => {
  const [localFilters, setLocalFilters] = useState({
    location: 'all',
    type: 'all',
    plotType: 'all',
    bhk: 'all',
    maxPrice: 50000000, // 5 Cr default max
    verified: false
  });

  const locations = [
    { id: 'all', label: 'All Locations' },
    { id: 'Noida', label: 'Noida' },
    { id: 'Greater Noida', label: 'Greater Noida' },
    { id: 'Delhi', label: 'Delhi' },
    { id: 'Gurgaon', label: 'Gurgaon' },
    { id: 'Faridabad', label: 'Faridabad' },
    { id: 'YEIDA', label: 'YEIDA' }
  ];

  const propertyTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'Flat', label: 'Flat / Apartment' },
    { id: 'Villa', label: 'Villa / House' },
    { id: 'Plot', label: 'Residential Plot' },
    { id: 'Commercial', label: 'Commercial Space' }
  ];

  const plotTypes = [
    { id: 'all', label: 'All Plot Types' },
    { id: 'Residential Plot', label: 'Residential Plot' },
    { id: 'Kisan Kota % Plot', label: 'Kisan Kota % Plot' },
    { id: 'Industrial Plot', label: 'Industrial Plot' },
    { id: 'Agriculture Land', label: 'Agriculture Land' }
  ];

  const bhkOptions = [
    { id: 'all', label: 'Any BHK' },
    { id: '1', label: '1 BHK' },
    { id: '2', label: '2 BHK' },
    { id: '3', label: '3 BHK' },
    { id: '4+', label: '4+ BHK' }
  ];

  const handleApply = () => {
    onFilter(localFilters);
  };

  const handleReset = () => {
    const resetState = {
      location: 'all',
      type: 'all',
      plotType: 'all',
      bhk: 'all',
      maxPrice: 50000000,
      verified: false
    };
    setLocalFilters(resetState);
    onFilter(resetState);
  };

  return (
    <Card className="sticky top-28 rounded-2xl shadow-lg border-border/50 bg-white dark:bg-slate-900/80">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-bold">Filter Search</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">City</Label>
          <Select
            value={localFilters.location}
            onValueChange={(value) => setLocalFilters({ ...localFilters, location: value })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-border/50 focus-visible:ring-primary">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">Property Type</Label>
          <Select
            value={localFilters.type}
            onValueChange={(value) => setLocalFilters({ ...localFilters, type: value, plotType: 'all' })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-border/50 focus-visible:ring-primary">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {localFilters.type === 'Plot' && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Plot Type</Label>
            <Select
              value={localFilters.plotType}
              onValueChange={(value) => setLocalFilters({ ...localFilters, plotType: value })}
            >
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-border/50 focus-visible:ring-primary">
                <SelectValue placeholder="Select Plot Type" />
              </SelectTrigger>
              <SelectContent>
                {plotTypes.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>
                    {pt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">BHK</Label>
          <Select
            value={localFilters.bhk}
            onValueChange={(value) => setLocalFilters({ ...localFilters, bhk: value })}
            disabled={localFilters.type === 'Plot' || localFilters.type === 'Commercial'}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-border/50 focus-visible:ring-primary">
              <SelectValue placeholder="Select BHK" />
            </SelectTrigger>
            <SelectContent>
              {bhkOptions.map((bhk) => (
                <SelectItem key={bhk.id} value={bhk.id}>
                  {bhk.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-foreground">Max Budget</Label>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full indian-price">
              {formatIndianPrice(localFilters.maxPrice)}
            </span>
          </div>
          <Slider
            min={2000000} // 20 Lac
            max={50000000} // 5 Cr
            step={1000000} // 1 Lac steps
            value={[localFilters.maxPrice]}
            onValueChange={(val) => setLocalFilters({ ...localFilters, maxPrice: val[0] })}
            className="py-4"
          />
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>₹20 Lac</span>
            <span>₹5 Cr+</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-border/50">
          <Checkbox 
            id="verified" 
            checked={localFilters.verified}
            onCheckedChange={(checked) => setLocalFilters({ ...localFilters, verified: checked })}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label htmlFor="verified" className="text-sm font-bold cursor-pointer">
            Verified Properties Only
          </Label>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button 
            onClick={handleApply} 
            className="w-full h-12 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] font-bold text-base bg-primary hover:bg-primary/90"
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full h-12 rounded-xl transition-all active:scale-[0.98] font-bold border-border/60"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFilter;