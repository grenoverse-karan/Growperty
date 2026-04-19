import pb from '@/lib/pocketbase';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Loader2, UploadCloud, X, Plus, Minus, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { sanitizePropertyFormData, logPropertyPayload, logPocketBaseError, extractPocketBaseErrorMessage } from '@/lib/propertyFormDataMapper.js';

// --- Constants (Strictly matching PocketBase Schema) ---
const PROPERTY_TYPES = ['Flat/Apartment', 'Independent House', 'Villa', 'Penthouse', 'Plot/Land', 'Commercial'];
const SUB_TYPES = {
  'Commercial': ['Shop', 'Office Space', 'Store/Showroom', 'Warehouse'],
  'Plot/Land': ['Residential Plot', 'Commercial Plot', 'Industrial Plot', 'Agricultural Land']
};
const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
const AREA_UNITS = ['Sq.ft', 'Sq.yd', 'Sq.m'];
const AREA_TYPES = ['Carpet Area', 'Built-up Area', 'Super Built-up Area'];
const CITY_OPTIONS = ['Noida', 'Greater Noida', 'YEIDA'];
const POSSESSION_STATUS = ['Ready to Move', 'Under Construction', 'Possession Soon'];
const OWNERSHIP_TYPE = ['Lease Hold', 'Free Hold', 'Kisan Kota', 'Power of Attorney'];
const FURNISHING_TYPE = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];
const FURNISHING_ITEMS = ['Beds', 'AC', 'Sofa Set', 'Center Table', 'Dining Table', 'Dressing Table', 'Chairs', 'Wardrobes', 'TV Unit', 'Refrigerator', 'Washing Machine', 'Geyser'];
const PLOT_TYPES_RESIDENTIAL = ['Lease Hold', 'Free Hold', 'Kisan Kota 5%', 'Kisan Kota 6%', 'Kisan Kota 7%'];

const AMENITIES_CATEGORIES = {
  'SECURITY & SAFETY': ['Gated Entry', '24/7 Security Guards', 'CCTV Surveillance', 'Intercom Facility', 'Fire Fighting System', '24/7 Power Backup'],
  'INFRASTRUCTURE & UTILITIES': ['24/7 Water Supply', 'Lifts', 'Piped Gas (IGL)', 'Rainwater Harvesting', 'EV Charging Points'],
  'LIFESTYLE & RECREATION': ['Clubhouse', 'Gymnasium', 'Swimming Pool', 'Park', 'Jogging & Cycling Tracks', "Kids' Play Area", 'Sports Courts'],
  'SOCIAL & CONVENIENCE': ['Community Hall', 'Internal Shopping Complex', 'Visitor Parking', 'Maintenance Staff', 'High-Speed Internet', 'Street Lighting', 'Wide Internal Roads', 'Play School', 'Green Belts']
};
const NEARBY_AMENITIES = ['Market', 'Mall', 'Public Park', 'Temple', 'School & Hospital', 'Public Transport', 'Metro'];

const PropertyListingForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  // --- State ---
  const [formData, setFormData] = useState({
    propertyType: '',
    propertySubType: '',
    bhk: '',
    bathrooms: 0,
    balconies: 0,
    totalArea: '',
    areaUnit: 'Sq.ft',
    areaType: 'Carpet Area',
    floorNumber: '',
    totalFloors: '',
    totalPrice: '',
    city: '',
    sector: '',
    landmark: '',
    towerBlock: '',
    houseNo: '',
    possessionStatus: '',
    ownershipType: '',
    furnishingType: '',
    furnishingItems: {},
    plotType: '',
    carParking: { covered: 0, open: 0 },
    bikeParking: { covered: 0, open: 0 },
    amenities: [],
    nearbyAmenities: [],
    description: '',
    name: '',
    email: '',
    mobileNumber: '',
    currentAddress: '',
    termsAccepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        mobileNumber: prev.mobileNumber || currentUser.phone || ''
      }));
    }
  }, [currentUser]);

  // --- Helpers ---
  const handleSelect = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'propertyType') {
        newData.propertySubType = '';
        newData.bhk = '';
        newData.plotType = '';
      }
      if (field === 'furnishingType' && value === 'Unfurnished') {
        newData.furnishingItems = {};
      }
      return newData;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCounterChange = (field, increment) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + increment)
    }));
  };

  const handleNestedCounterChange = (category, type, increment) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: Math.max(0, prev[category][type] + increment)
      }
    }));
  };

  const handleFurnishingItemChange = (item, increment) => {
    setFormData(prev => {
      const currentQty = prev.furnishingItems[item] || 0;
      const newQty = Math.max(0, currentQty + increment);
      const newItems = { ...prev.furnishingItems };
      if (newQty === 0) delete newItems[item];
      else newItems[item] = newQty;
      return { ...prev, furnishingItems: newItems };
    });
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const array = prev[field];
      if (array.includes(item)) {
        return { ...prev, [field]: array.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...array, item] };
      }
    });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Video must be under 100MB', variant: 'destructive' });
      return;
    }

    setFormData(prev => ({ ...prev, video: file }));
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, video: null }));
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Computations ---
  const formatPriceToWords = (price) => {
    if (!price || isNaN(price)) return '';
    const num = Number(price);
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Crore`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    if (num >= 1000) return `₹ ${(num / 1000).toFixed(2)} Thousand`;
    return `₹ ${num}`;
  };

  const calculatePricePerSqft = () => {
    if (!formData.totalPrice || !formData.totalArea || isNaN(formData.totalPrice) || isNaN(formData.totalArea)) return null;
    const price = Number(formData.totalPrice);
    let area = Number(formData.totalArea);
    
    if (formData.areaUnit === 'Sq.yd') area = area * 9;
    if (formData.areaUnit === 'Sq.m') area = area * 10.764;
    
    const perSqft = price / area;
    return perSqft > 0 ? `₹ ${Math.round(perSqft).toLocaleString('en-IN')} / sq.ft` : null;
  };

  const sanitizeDescription = (text) => {
    const phoneRegex = /(?:\+?91[\-\s]?)?[6789]\d{2}[\-\s]?\d{3}[\-\s]?\d{4}/g;
    return text.replace(phoneRegex, '[HIDDEN]');
  };

  // --- Logic Checks ---
  const showSubTypes = ['Commercial', 'Plot/Land'].includes(formData.propertyType);
  const showBhk = ['Flat/Apartment', 'Independent House', 'Villa', 'Penthouse'].includes(formData.propertyType);
  const showBathBalcony = showBhk;
  const showFloors = formData.propertyType !== 'Plot/Land';
  const showFloorNumber = showFloors && formData.propertyType !== 'Independent House';
  const showFurnishingDetails = ['Semi-Furnished', 'Fully Furnished'].includes(formData.furnishingType);
  const showPlotType = formData.propertyType === 'Plot/Land' && formData.propertySubType === 'Residential Plot';
  const showAmenities = showBhk;

  // --- Submit ---
  const handleSubmit = async (e) => {
  e.preventDefault();

  const data = {
  title: formData.propertyType || "Property",
  price: Number(formData.totalPrice) || 0,
  location: `${formData.city || ""} ${formData.sector || ""}`,
  description: formData.description || "Good property"
};

  try {
    await pb.collection('properties').create(data);
    alert("Property Added ✅");
  } catch (error) {
    console.error(error);
    alert("Error ❌");
  }
};
    e.preventDefault();
    
    if (!currentUser?.id) {
      toast({ title: 'Authentication Required', description: 'Please log in to list a property.', variant: 'destructive' });
      return;
    }

    if (!formData.termsAccepted) {
      toast({ title: 'Terms Required', description: 'You must accept the Terms & Conditions.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Map plot type for Kisan Kota variants
      let mappedPlotType = formData.plotType;
      if (mappedPlotType && mappedPlotType.includes('Kisan Kota')) {
        mappedPlotType = 'Kisan Kota';
      }

      // Prepare form data for sanitization
      const rawFormData = {
        owner_id: currentUser.id,
        propertyType: formData.propertyType,
        propertySubType: formData.propertySubType,
        bhk: formData.bhk,
        bathrooms: formData.bathrooms,
        balconies: formData.balconies,
        totalArea: formData.totalArea,
        areaUnit: formData.areaUnit,
        areaType: formData.areaType,
        floorNumber: formData.floorNumber,
        totalFloors: formData.totalFloors,
        totalPrice: formData.totalPrice,
        city: formData.city,
        sector: formData.sector,
        landmark: formData.landmark,
        houseNo: formData.houseNo,
        possessionStatus: formData.possessionStatus,
        ownershipType: formData.ownershipType,
        furnishingType: formData.furnishingType,
        furnishingItems: formData.furnishingItems,
        plotType: mappedPlotType,
        carParking: (formData.carParking.covered + formData.carParking.open),
        bikeParking: (formData.bikeParking.covered + formData.bikeParking.open),
        amenities: formData.amenities,
        nearbyAmenities: formData.nearbyAmenities,
        description: sanitizeDescription(formData.description),
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        currentAddress: formData.currentAddress,
        ownerType: 'Individual',
        status: 'pending'
      };

      // Sanitize and validate
      const sanitizationResult = sanitizePropertyFormData(rawFormData, formData.propertyType);

      if (!sanitizationResult.success) {
        toast({ 
          title: 'Validation Error', 
          description: sanitizationResult.error, 
          variant: 'destructive' 
        });
        setIsSubmitting(false);
        return;
      }

      const payload = sanitizationResult.data;

      // Log the sanitized payload
      logPropertyPayload(payload, 'PropertyListingForm Submission');

      // Submit to PocketBase
      const data = {
      title: formData.propertyType || "2BHK Flat",
      price: formData.totalPrice || 0,
      location: `${formData.city} Sector ${formData.sector}`,
      description: formData.description || "Good property",
      };
     
      console.log('✅ Property created successfully. Record ID:', record.id);

      // If video exists, upload it using FormData in an update call
      if (formData.video) {
        const formObj = new FormData();
        formObj.append('videos', formData.video);
               console.log('✅ Video uploaded successfully');
      }
      
      toast({ title: 'Success', description: 'Property listed successfully and is pending approval.' });
      navigate('/properties');
    } catch (error) {
      logPocketBaseError(error, 'PropertyListingForm Submission Error');
      const errorMessage = extractPocketBaseErrorMessage(error);
      
      toast({ 
        title: 'Submission Failed', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Reusable UI Components ---
  const Chip = ({ label, selected, onClick, subtext }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border flex flex-col items-center justify-center text-center leading-snug w-full min-h-[3rem] ${
        selected 
          ? 'bg-[#10B981] border-[#10B981] text-white shadow-md' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#10B981]/50 hover:bg-[#10B981]/5'
      }`}
    >
      <span>{label}</span>
      {subtext && <span className={`text-[10px] mt-1 ${selected ? 'text-white/80' : 'text-muted-foreground'}`}>{subtext}</span>}
    </button>
  );

  const CounterBlock = ({ label, value, onDecrement, onIncrement }) => {
  return (
    <div className="flex flex-col items-center p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 w-full">
      
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
        {label}
      </span>

      <div className="flex items-center gap-4">
        
        <button
          type="button"
          onClick={onDecrement}
          className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-[#10B981] hover:text-[#10B981] transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <span className="font-extrabold w-6 text-center text-lg">
          {value}
        </span>

        <button
          type="button"
          onClick={onIncrement}
          className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-[#10B981] hover:text-[#10B981] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>

      </div>
    </div>
  );


  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0a0a] min-h-screen py-8 md:py-12">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* (1) HEADER */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981]"></div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              FREE List your property
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Get more genuine buyers and investors. Sell your property faster.
            </p>
          </div>
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-[#10B981] blur-md opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-[#10B981] to-emerald-600 text-white font-extrabold py-3 px-8 rounded-full shadow-lg overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
              FREE
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* (2) PROPERTY TYPE */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">1. Property Type *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {PROPERTY_TYPES.map(type => (
                <Chip key={type} label={type} selected={formData.propertyType === type} onClick={() => handleSelect('propertyType', type)} />
              ))}
            </div>

            {/* Sub-types */}
            {showSubTypes && formData.propertyType && SUB_TYPES[formData.propertyType] && (
              <div className="pt-4 animate-in fade-in slide-in-from-top-2">
                <Label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-3 block uppercase tracking-wider">{formData.propertyType} Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {SUB_TYPES[formData.propertyType].map(type => (
                    <Chip key={type} label={type} selected={formData.propertySubType === type} onClick={() => handleSelect('propertySubType', type)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* (3) BHK CONFIGURATION */}
          {showBhk && (
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in">
              <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">2. BHK Configuration *</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {BHK_OPTIONS.map(bhk => (
                  <Chip key={bhk} label={bhk} selected={formData.bhk === bhk} onClick={() => handleSelect('bhk', bhk)} />
                ))}
              </div>
            </div>
          )}

          {/* (4) SIZE CONFIGURATION (Bathrooms/Balconies) */}
          {showBathBalcony && (
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in">
              <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">3. Size Details</Label>
              <div className="flex gap-4 w-full">
                <div className="w-1/2">
                  <CounterBlock label="Bathrooms" value={formData.bathrooms} onDecrement={() => handleCounterChange('bathrooms', -1)} onIncrement={() => handleCounterChange('bathrooms', 1)} />
                </div>
                <div className="w-1/2">
                  <CounterBlock label="Balconies" value={formData.balconies} onDecrement={() => handleCounterChange('balconies', -1)} onIncrement={() => handleCounterChange('balconies', 1)} />
                </div>
              </div>
            </div>
          )}

          {/* (5) AREA DETAILS */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">4. Area Details *</Label>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Area *</Label>
                <Input name="totalArea" type="number" min="1" value={formData.totalArea} onChange={handleInputChange} placeholder="e.g. 1500" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-lg font-bold" />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Area Unit *</Label>
                <div className="flex h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  {AREA_UNITS.map(unit => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleSelect('areaUnit', unit)}
                      className={`flex-1 text-sm font-bold transition-colors ${formData.areaUnit === unit ? 'bg-[#10B981] text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Area Type</Label>
                <select name="areaType" value={formData.areaType} onChange={handleInputChange} className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm font-bold ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#10B981] disabled:cursor-not-allowed disabled:opacity-50">
                  {AREA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>

            {/* Floors */}
            {showFloors && (
              <div className="flex gap-4 pt-2">
                {showFloorNumber && (
                  <div className="flex-1 space-y-2 animate-in fade-in">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Floor Number</Label>
                    <Input name="floorNumber" type="number" value={formData.floorNumber} onChange={handleInputChange} placeholder="e.g. 5" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Floors</Label>
                  <Input name="totalFloors" type="number" value={formData.totalFloors} onChange={handleInputChange} placeholder="e.g. 12" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
                </div>
              </div>
            )}
          </div>

          {/* (6) EXPECTED PRICE */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">5. Expected Price *</Label>
            
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">₹</span>
                <Input 
                  name="totalPrice" 
                  type="number" 
                  min="1"
                  value={formData.totalPrice} 
                  onChange={handleInputChange} 
                  placeholder="0" 
                  className="h-14 pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xl font-extrabold text-[#10B981]" 
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md inline-block w-fit">
                  {formatPriceToWords(formData.totalPrice)}
                </span>
                {calculatePricePerSqft() && (
                  <span className="text-sm font-bold text-[#10B981] flex items-center gap-1">
                    <Info className="w-4 h-4" /> {calculatePricePerSqft()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* (7) LOCATION DETAILS */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">6. Location Details *</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">City *</Label>
                <select name="city" value={formData.city} onChange={handleInputChange} className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#10B981]">
                  <option value="" disabled>Select City</option>
                  {CITY_OPTIONS.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sector / Area *</Label>
                <Input name="sector" value={formData.sector} onChange={handleInputChange} placeholder="e.g. Sector 150" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Society / Project / Locality</Label>
                <Input name="landmark" value={formData.landmark} onChange={handleInputChange} placeholder="e.g. Godrej Woods" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tower / Block</Label>
                  <Input name="towerBlock" value={formData.towerBlock} onChange={handleInputChange} placeholder="e.g. Tower A" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
                </div>
                <div className="space-y-2 flex-1">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">No. *</Label>
                  <Input name="houseNo" value={formData.houseNo} onChange={handleInputChange} placeholder="Flat/House/Plot No" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
                </div>
              </div>
            </div>
          </div>

          {/* (8) POSSESSION, (9) OWNERSHIP, (10) FURNISHING */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
            
            <div className="space-y-4">
              <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">7. Status & Type</Label>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-500">Possession Status</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {POSSESSION_STATUS.map(status => (
                    <Chip key={status} label={status} selected={formData.possessionStatus === status} onClick={() => handleSelect('possessionStatus', status)} />
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-sm font-bold text-slate-500">Ownership Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {OWNERSHIP_TYPE.map(type => (
                    <Chip key={type} label={type} selected={formData.ownershipType === type} onClick={() => handleSelect('ownershipType', type)} />
                  ))}
                </div>
              </div>

              {showFloors && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-bold text-slate-500">Furnishing Type</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FURNISHING_TYPE.map(type => (
                      <Chip key={type} label={type} selected={formData.furnishingType === type} onClick={() => handleSelect('furnishingType', type)} />
                    ))}
                  </div>

                  {/* Expandable Furnishing Items */}
                  {showFurnishingDetails && (
                    <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                      <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 block">Furnishing Items</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {FURNISHING_ITEMS.map(item => {
                          const qty = formData.furnishingItems[item] || 0;
                          return (
                            <div key={item} className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-colors ${qty > 0 ? 'border-[#10B981] bg-[#10B981]/5' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}>
                              <span className={`text-sm font-bold text-center mb-3 leading-tight ${qty > 0 ? 'text-[#10B981]' : 'text-slate-600 dark:text-slate-400'}`}>{item}</span>
                              <div className="flex items-center gap-3">
                                <button type="button" onClick={() => handleFurnishingItemChange(item, -1)} className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:text-[#10B981]"><Minus className="w-3 h-3" /></button>
                                <span className="font-bold text-sm w-3 text-center">{qty}</span>
                                <button type="button" onClick={() => handleFurnishingItemChange(item, 1)} className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:text-[#10B981]"><Plus className="w-3 h-3" /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* (11) PLOT TYPE */}
            {showPlotType && (
              <div className="space-y-4 animate-in fade-in">
                <Label className="text-sm font-bold text-slate-500">Plot Type Details (Required for Residential Plots)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {PLOT_TYPES_RESIDENTIAL.map(type => {
                    const isKisan = type.includes('Kisan');
                    const mainText = isKisan ? 'Kisan Kota' : type;
                    const subText = isKisan ? type.split(' ')[2] : null;
                    return (
                      <Chip key={type} label={mainText} subtext={subText} selected={formData.plotType === type} onClick={() => handleSelect('plotType', type)} />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* (12) PARKING SECTION */}
          {showFloors && (
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
              <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">8. Parking Details</Label>
              <div className="flex flex-col md:flex-row gap-6">
                {['carParking', 'bikeParking'].map(vehicle => (
                  <div key={vehicle} className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                    <Label className="text-base font-extrabold text-slate-800 dark:text-slate-200 mb-4 block text-center uppercase tracking-wide">
                      {vehicle === 'carParking' ? 'Car Parking' : 'Bike Parking'}
                    </Label>
                    <div className="flex justify-center gap-6">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-500 mb-2">Covered</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => handleNestedCounterChange(vehicle, 'covered', -1)} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border flex items-center justify-center hover:border-[#10B981] hover:text-[#10B981]"><Minus className="w-4 w-4" /></button>
                          <span className="font-bold w-4 text-center">{formData[vehicle].covered}</span>
                          <button type="button" onClick={() => handleNestedCounterChange(vehicle, 'covered', 1)} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border flex items-center justify-center hover:border-[#10B981] hover:text-[#10B981]"><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="w-px bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-500 mb-2">Open</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => handleNestedCounterChange(vehicle, 'open', -1)} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border flex items-center justify-center hover:border-[#10B981] hover:text-[#10B981]"><Minus className="w-4 h-4" /></button>
                          <span className="font-bold w-4 text-center">{formData[vehicle].open}</span>
                          <button type="button" onClick={() => handleNestedCounterChange(vehicle, 'open', 1)} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border flex items-center justify-center hover:border-[#10B981] hover:text-[#10B981]"><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* (13) AMENITIES & FEATURES */}
          {showAmenities && (
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in">
              <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">9. Amenities & Features</Label>
              
              {Object.entries(AMENITIES_CATEGORIES).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <Label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{category}</Label>
                  <div className="flex flex-wrap gap-2">
                    {items.map(item => {
                      const isSelected = formData.amenities.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleArrayItem('amenities', item)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                            isSelected 
                              ? 'bg-[#10B981] border-[#10B981] text-white shadow-sm' 
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#10B981]/50'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* (14) NEARBY AMENITIES */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">10. Nearby Facilities</Label>
            <div className="flex flex-wrap gap-2 pt-2">
              {NEARBY_AMENITIES.map(item => {
                const isSelected = formData.nearbyAmenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem('nearbyAmenities', item)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      isSelected 
                        ? 'bg-[#10B981] border-[#10B981] text-white shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#10B981]/50'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* (15) PROPERTY VIDEO & DESCRIPTION */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">11. Media & Description</Label>
            
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Property Video (Max 1)</Label>
              {!videoPreview ? (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#10B981] hover:bg-[#10B981]/5 flex flex-col items-center justify-center gap-2 text-slate-500 transition-colors">
                  <UploadCloud className="h-8 w-8" />
                  <span className="text-sm font-bold">Upload Video (MP4, Max 100MB)</span>
                </button>
              ) : (
                <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video">
                  <video src={videoPreview} controls className="w-full h-full object-contain" />
                  <button type="button" onClick={removeVideo} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleVideoUpload} accept="video/mp4,video/quicktime" className="hidden" />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</Label>
              <Textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Describe what makes your property special. (Note: Phone numbers will be hidden for privacy)"
                className="min-h-[150px] rounded-xl resize-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          {/* (16) OWNER DETAILS */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">12. Owner Details</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Property Title / Full Name *</Label>
                <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Name or Property Title" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address *</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mobile Number (10 digits) *</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">+91</span>
                  <Input name="mobileNumber" type="tel" maxLength="10" value={formData.mobileNumber} onChange={handleInputChange} placeholder="9876543210" className="h-12 pl-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 tracking-wide font-bold" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Address</Label>
                <Textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} placeholder="Your current residential address" className="min-h-[80px] rounded-xl resize-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
            </div>
          </div>

          {/* (17) TERMS & CONDITIONS */}
          <div className="bg-transparent pt-4 pb-2">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={formData.termsAccepted} 
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: checked }))}
                className="mt-1 data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981]"
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="terms" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  I agree to the Terms & Conditions.
                </label>
                <p className="text-sm text-slate-500 font-medium">
                  By submitting, you confirm that the provided information is accurate and you have the right to list this property.
                </p>
              </div>
            </div>
          </div>

          {/* (18) SUBMIT BUTTON */}
          <Button 
            type="submit" 
            className="w-full h-16 text-lg font-extrabold rounded-2xl bg-[#10B981] hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={!formData.termsAccepted || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Posting Listing...
              </>
            ) : (
              'Post Property Listing'
            )}
          </Button>

        </form>
      </div>
    </div>
  );
};

export default PropertyListingForm;
