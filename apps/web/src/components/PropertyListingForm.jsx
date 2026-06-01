
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient.js';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Loader2, UploadCloud, X, Plus, Minus, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { sanitizePropertyFormData, logPropertyPayload } from '@/lib/propertyFormDataMapper.js';

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
const FURNISHING_ITEMS = [
  'Bed', 'Sofa', 'Wardrobe', 'Dining Table',
  'Washing Machine', 'Fridge', 'AC', 'Geyser',
  'Chimney', 'Jacuzzi', 'TV', 'Fan',
  'Microwave', 'Water Purifier', 'Stove', 'Modular Kitchen',
  'Exhaust Fan', 'Curtains', 'Table', 'Chair',
  'Cooler', 'TV Unit',
];
const PLOT_TYPES_RESIDENTIAL = ['Lease Hold', 'Free Hold', 'Kisan Kota 5%', 'Kisan Kota 6%', 'Kisan Kota 7%'];

const AMENITIES_CATEGORIES = {
  'SECURITY & SAFETY': ['Gated Entry', '24/7 Security Guards', 'CCTV Surveillance', 'Intercom Facility', 'Fire Fighting System', '24/7 Power Backup'],
  'INFRASTRUCTURE & UTILITIES': ['24/7 Water Supply', 'Lifts', 'Piped Gas (IGL)', 'Rainwater Harvesting', 'EV Charging Points'],
  'LIFESTYLE & RECREATION': ['Clubhouse', 'Gymnasium', 'Swimming Pool', 'Park', 'Jogging & Cycling Tracks', "Kids' Play Area", 'Sports Courts'],
  'SOCIAL & CONVENIENCE': ['Community Hall', 'Internal Shopping Complex', 'Visitor Parking', 'Maintenance Staff', 'High-Speed Internet', 'Street Lighting', 'Wide Internal Roads', 'Play School', 'Green Belts']
};
const NEARBY_AMENITIES = ['Market', 'Mall', 'Public Park', 'Temple', 'School & Hospital', 'Public Transport', 'Metro'];

const PropertyListingForm = ({ isAdmin = false }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, whatsappPhone, getToken } = useAuth();
  const { token: adminToken } = useAdminAuth();
  const imageInputRef = useRef(null);

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
    visitTimeType: '',
    visitFixedSlots: [],
    visitFlexibleSlots: [],
    name: '',
    email: '',
    mobileNumber: '',
    currentAddress: '',
    termsAccepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]); // [{ id, file, preview }]
  const [isCompressing, setIsCompressing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (name) => {
    if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.propertyType) errors.propertyType = 'Property type select karo';
    if (showBhk && !formData.bhk) errors.bhk = 'BHK configuration select karo';
    if (!formData.totalArea) errors.totalArea = 'Total area enter karo';
    if (!formData.totalPrice || Number(formData.totalPrice) <= 0) errors.totalPrice = 'Expected price enter karo';
    if (!formData.city) errors.city = 'City select karo';
    if (!formData.sector?.trim()) errors.sector = 'Sector / Area enter karo';
    if (!formData.houseNo?.trim()) errors.houseNo = 'Flat / House No. enter karo';
    if (showFloors && !formData.totalFloors) errors.totalFloors = 'Total floors enter karo';
    if (showFloorNumber && !formData.floorNumber) errors.floorNumber = 'Floor number enter karo';
    if (!formData.possessionStatus) errors.possessionStatus = 'Possession status select karo';
    if (!formData.ownershipType) errors.ownershipType = 'Ownership type select karo';
    if (showFloors && !formData.furnishingType) errors.furnishingType = 'Furnishing type select karo';
    if (!formData.visitTimeType) errors.visitTimeType = 'Preferred visit time select karo';
    if (!formData.name?.trim()) errors.name = 'Name enter karo';
    if (!formData.mobileNumber?.trim()) errors.mobileNumber = 'Mobile number enter karo';
    return errors;
  };

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        mobileNumber: prev.mobileNumber || (currentUser.phone || currentUser.phoneNumber || whatsappPhone || '').replace(/^(\+?91)/, '').replace(/\D/g, '').slice(-10)
      }));
    }
  }, [currentUser, whatsappPhone]);

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
    clearFieldError(field);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearFieldError(name);
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

  const MAX_IMAGES = 20;
  const MAX_SIZE_BYTES = 1024 * 1024; // 1MB

  const compressImage = (file) =>
    new Promise((resolve) => {
      if (file.size <= MAX_SIZE_BYTES) { resolve(file); return; }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        let { width, height } = img;
        const MAX_DIM = 1920;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size <= MAX_SIZE_BYTES || quality <= 0.1) {
              resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            } else {
              quality = Math.max(0.1, quality - 0.1);
              tryCompress();
            }
          }, 'image/jpeg', quality);
        };
        tryCompress();
      };

      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });

  const handleImageUpload = async (e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast({ title: 'Limit reached', description: `Maximum ${MAX_IMAGES} images allowed.`, variant: 'destructive' });
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    const accepted = incoming.slice(0, remaining);
    if (incoming.length > remaining) {
      toast({ title: 'Some images skipped', description: `Only ${remaining} more image(s) can be added.`, variant: 'destructive' });
    }

    setIsCompressing(true);
    try {
      const processed = await Promise.all(
        accepted.map(async (file, i) => {
          const compressed = await compressImage(file);
          const preview = URL.createObjectURL(compressed);
          return { id: `${Date.now()}-${i}`, file: compressed, preview };
        })
      );
      setImages(prev => [...prev, ...processed]);
    } finally {
      setIsCompressing(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const removeImage = (id) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
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
    console.log('🚀 handleSubmit triggered', { currentUser: currentUser?.id, termsAccepted: formData.termsAccepted, propertyType: formData.propertyType });

    const userId = currentUser?._id || currentUser?.id;
    if (!isAdmin && !userId) {
      console.log('❌ STOP: No currentUser._id — user not authenticated');
      toast({ title: 'Login Required', description: 'Please log in to list a property.', variant: 'destructive' });
      return;
    }
    console.log('✅ Auth check passed — user:', isAdmin ? 'admin' : userId);

    // Run ALL field validation first — shows red errors on every empty required field
    const validationErrors = validateForm();
    if (!formData.termsAccepted) validationErrors.termsAccepted = 'Terms & Conditions accept karo';

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      // Scroll to first error field
      const firstKey = Object.keys(validationErrors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      sonnerToast.error(`${Object.keys(validationErrors).length} required field(s) reh gaye hain — red fields fill karo`);
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);

    try {
      // Map plot type for Kisan Kota variants
      let mappedPlotType = formData.plotType;
      if (mappedPlotType && mappedPlotType.includes('Kisan Kota')) {
        mappedPlotType = 'Kisan Kota';
      }

      // Prepare form data for sanitization
      const rawFormData = {
        owner_id: isAdmin ? 'admin' : (currentUser._id || currentUser.id),
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
        towerBlock: formData.towerBlock,
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
        visitTimeType: formData.visitTimeType || undefined,
        visitFixedSlots: formData.visitFixedSlots.length ? formData.visitFixedSlots : undefined,
        visitFlexibleSlots: formData.visitFlexibleSlots.length ? formData.visitFlexibleSlots : undefined,
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        currentAddress: formData.currentAddress,
        ownerType: isAdmin ? 'Admin' : 'Individual',
        status: isAdmin ? 'approved' : 'pending',
        ...(isAdmin && { listedBy: 'admin', liveAt: new Date().toISOString() }),
      };
      console.log('✅ rawFormData built:', rawFormData);

      // Sanitize and validate
      const sanitizationResult = sanitizePropertyFormData(rawFormData, formData.propertyType);
      console.log('✅ sanitizationResult:', sanitizationResult);

      if (!sanitizationResult.success) {
        console.log('❌ STOP: Validation failed —', sanitizationResult.error);
        toast({
          title: 'Validation Error',
          description: sanitizationResult.error,
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      const payload = sanitizationResult.data;

      // Always inject visit time fields directly — sanitizer whitelist may miss them
      if (formData.visitTimeType) {
        payload.visitTimeType = formData.visitTimeType;
        if (formData.visitFixedSlots?.length) payload.visitFixedSlots = formData.visitFixedSlots;
        if (formData.visitFlexibleSlots?.length) payload.visitFlexibleSlots = formData.visitFlexibleSlots;
      }
      // Tower/Block isn't in the sanitizer whitelist — inject directly
      if (formData.towerBlock?.trim()) payload.towerBlock = formData.towerBlock.trim();

      // Convert images to base64 (max 10 to stay within MongoDB 16MB doc limit)
      if (images.length > 0) {
        const toBase64 = (file) => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
        const base64Images = await Promise.all(
          images.slice(0, 10).map(img => toBase64(img.file))
        );
        payload.images = base64Images.filter(Boolean);
      }

      console.log('✅ Payload ready, calling API...', { imageCount: payload.images?.length || 0 });
      logPropertyPayload(payload, 'PropertyListingForm Submission');

      // Submit to MongoDB via Express API
      const authToken = isAdmin ? adminToken : getToken();
      const response = await apiServerClient.fetch('/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      console.log('✅ Property created successfully. Record ID:', result.propertyId);

      if (isAdmin) {
        toast({ title: 'Success', description: 'Property listed successfully and is now live.' });
        navigate('/admin/properties');
      } else {
        toast({ title: 'Success', description: 'Property listed successfully and is pending approval.' });
        navigate('/properties');
      }
    } catch (error) {
      console.log('❌ CATCH block hit:', error?.message, error);
      toast({
        title: 'Submission Failed',
        description: error?.message || 'Something went wrong. Please try again.',
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

  const CounterBlock = ({ label, value, onDecrement, onIncrement }) => (
    <div className="flex flex-col items-center p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 w-full">
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">{label}</span>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onDecrement} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-[#10B981] hover:text-[#10B981] transition-colors"><Minus className="w-4 h-4" /></button>
        <span className="font-extrabold w-6 text-center text-lg">{value}</span>
        <button type="button" onClick={onIncrement} className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-[#10B981] hover:text-[#10B981] transition-colors"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0a0a0a] min-h-screen py-8 md:py-12">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* (1) HEADER */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981]"></div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            List Property{' '}
            <span className="free-shine">FREE</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Get more genuine buyers and investors. Sell your property faster.
          </p>
        </div>
        <style>{`
          .free-shine {
            color: #10B981;
            display: inline-block;
            position: relative;
            overflow: hidden;
            vertical-align: text-bottom;
            line-height: inherit;
          }
          .free-shine::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 60%;
            height: 100%;
            background: linear-gradient(
              120deg,
              transparent 0%,
              rgba(255,255,255,0.7) 50%,
              transparent 100%
            );
            animation: freeSwipe 3s ease-in-out infinite;
          }
          @keyframes freeSwipe {
            0%   { left: -100%; }
            40%  { left: 150%; }
            100% { left: 150%; }
          }
        `}</style>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* (2) PROPERTY TYPE */}
          <div id="field-propertyType" className={`bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border dark:border-slate-800 space-y-5 ${fieldErrors.propertyType ? 'border-red-400' : 'border-slate-200'}`}>
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">1. Property Type *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {PROPERTY_TYPES.map(type => (
                <Chip key={type} label={type} selected={formData.propertyType === type} onClick={() => handleSelect('propertyType', type)} />
              ))}
            </div>
            {fieldErrors.propertyType && <p className="text-red-500 text-xs font-bold mt-1">⚠ {fieldErrors.propertyType}</p>}

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
            <div id="field-bhk" className={`bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border dark:border-slate-800 space-y-5 animate-in fade-in ${fieldErrors.bhk ? 'border-red-400' : 'border-slate-200'}`}>
              <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">2. BHK Configuration *</Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {BHK_OPTIONS.map(bhk => (
                  <Chip key={bhk} label={bhk} selected={formData.bhk === bhk} onClick={() => handleSelect('bhk', bhk)} />
                ))}
              </div>
              {fieldErrors.bhk && <p className="text-red-500 text-xs font-bold mt-1">⚠ {fieldErrors.bhk}</p>}
            </div>
          )}

          {/* (4) SIZE CONFIGURATION (Bathrooms/Balconies) */}
          {showBathBalcony && (
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in">
              <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">3. Additional Details</Label>
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
              <div id="field-totalArea" className="flex-1 space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Area *</Label>
                <Input name="totalArea" type="number" min="1" value={formData.totalArea} onChange={handleInputChange} placeholder="e.g. 1500" className={`h-12 bg-slate-50 dark:bg-slate-900 text-lg font-bold ${fieldErrors.totalArea ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-200 dark:border-slate-800'}`} />
                {fieldErrors.totalArea && <p className="text-red-500 text-xs font-bold">⚠ {fieldErrors.totalArea}</p>}
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
              <div id="field-totalFloors" className="flex gap-4 pt-2">
                {showFloorNumber && (
                  <div className="flex-1 space-y-2 animate-in fade-in">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Floor Number *</Label>
                    <Input name="floorNumber" type="number" value={formData.floorNumber} onChange={handleInputChange} placeholder="e.g. 5" className={`h-12 bg-slate-50 dark:bg-slate-900 ${fieldErrors.floorNumber ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-200 dark:border-slate-800'}`} />
                    {fieldErrors.floorNumber && <p className="text-red-500 text-xs font-bold">⚠ {fieldErrors.floorNumber}</p>}
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Floors *</Label>
                  <Input name="totalFloors" type="number" value={formData.totalFloors} onChange={handleInputChange} placeholder="e.g. 12" className={`h-12 bg-slate-50 dark:bg-slate-900 ${fieldErrors.totalFloors ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-200 dark:border-slate-800'}`} />
                  {fieldErrors.totalFloors && <p className="text-red-500 text-xs font-bold">⚠ {fieldErrors.totalFloors}</p>}
                </div>
              </div>
            )}
          </div>

          {/* (6) EXPECTED PRICE */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">5. Expected Price *</Label>
            
            <div className="space-y-4">
              <div id="field-totalPrice" className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">₹</span>
                <Input
                  name="totalPrice"
                  type="number"
                  min="1"
                  value={formData.totalPrice}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={`h-14 pl-10 bg-slate-50 dark:bg-slate-900 text-xl font-extrabold text-[#10B981] ${fieldErrors.totalPrice ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-200 dark:border-slate-800'}`}
                />
                {fieldErrors.totalPrice && <p className="text-red-500 text-xs font-bold mt-1">⚠ {fieldErrors.totalPrice}</p>}
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
              <div id="field-city" className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">City *</Label>
                <select name="city" value={formData.city} onChange={handleInputChange} className={`flex h-12 w-full items-center justify-between rounded-xl border bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#10B981] ${fieldErrors.city ? 'border-red-400' : 'border-slate-200 dark:border-slate-800'}`}>
                  <option value="" disabled>Select City</option>
                  {CITY_OPTIONS.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                {fieldErrors.city && <p className="text-red-500 text-xs font-bold">⚠ {fieldErrors.city}</p>}
              </div>
              <div id="field-sector" className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sector / Area *</Label>
                <Input name="sector" value={formData.sector} onChange={handleInputChange} placeholder="e.g. Sector 150" className={`h-12 bg-slate-50 dark:bg-slate-900 ${fieldErrors.sector ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-200 dark:border-slate-800'}`} />
                {fieldErrors.sector && <p className="text-red-500 text-xs font-bold">⚠ {fieldErrors.sector}</p>}
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
                <div id="field-houseNo" className="space-y-2 flex-1">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">No. *</Label>
                  <Input name="houseNo" value={formData.houseNo} onChange={handleInputChange} placeholder="Flat/House/Plot No" className={`h-12 bg-slate-50 dark:bg-slate-900 ${fieldErrors.houseNo ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-200 dark:border-slate-800'}`} />
                  {fieldErrors.houseNo && <p className="text-red-500 text-xs font-bold">⚠ {fieldErrors.houseNo}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* (8) POSSESSION, (9) OWNERSHIP, (10) FURNISHING */}
          <div className={`bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border dark:border-slate-800 space-y-8 ${fieldErrors.furnishingType ? 'border-red-400' : 'border-slate-200'}`}>
            
            <div className="space-y-4">
              <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">7. Status & Type *</Label>
              
              <div id="field-possessionStatus" className="space-y-2">
                <Label className="text-sm font-bold text-slate-500">Possession Status *</Label>
                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl p-1 ${fieldErrors.possessionStatus ? 'ring-2 ring-red-400' : ''}`}>
                  {POSSESSION_STATUS.map(status => (
                    <Chip key={status} label={status} selected={formData.possessionStatus === status} onClick={() => handleSelect('possessionStatus', status)} />
                  ))}
                </div>
                {fieldErrors.possessionStatus && <p className="text-red-500 text-xs font-bold mt-1">⚠ {fieldErrors.possessionStatus}</p>}
              </div>

              <div id="field-ownershipType" className="space-y-2 pt-2">
                <Label className="text-sm font-bold text-slate-500">Ownership Type *</Label>
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl p-1 ${fieldErrors.ownershipType ? 'ring-2 ring-red-400' : ''}`}>
                  {OWNERSHIP_TYPE.map(type => (
                    <Chip key={type} label={type} selected={formData.ownershipType === type} onClick={() => handleSelect('ownershipType', type)} />
                  ))}
                </div>
                {fieldErrors.ownershipType && <p className="text-red-500 text-xs font-bold mt-1">⚠ {fieldErrors.ownershipType}</p>}
              </div>

              {showFloors && (
                <div id="field-furnishingType" className="space-y-2 pt-2">
                  <Label className="text-sm font-bold text-slate-500">Furnishing Type *</Label>
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl p-1 ${fieldErrors.furnishingType ? 'ring-2 ring-red-400' : ''}`}>
                    {FURNISHING_TYPE.map(type => (
                      <Chip key={type} label={type} selected={formData.furnishingType === type} onClick={() => handleSelect('furnishingType', type)} />
                    ))}
                  </div>
                  {fieldErrors.furnishingType && <p className="text-red-500 text-xs font-bold mt-1">⚠ {fieldErrors.furnishingType}</p>}

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

          {/* (15) IMAGES & DESCRIPTION */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">11. Media & Description</Label>

            {/* Image Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Property Images</Label>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${images.length >= MAX_IMAGES ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {images.length}/{MAX_IMAGES} images selected
                </span>
              </div>

              {/* Upload area */}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isCompressing}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#10B981] hover:bg-[#10B981]/5 flex flex-col items-center justify-center gap-2 text-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
                      <span className="text-sm font-bold text-[#10B981]">Compressing images…</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8" />
                      <span className="text-sm font-bold">Upload Images (JPG, PNG, WEBP · Max 20)</span>
                      <span className="text-xs text-slate-400">Images over 1MB are auto-compressed</span>
                    </>
                  )}
                </button>
              )}
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
              />

              {/* Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                  {images.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-900">
                      <img
                        src={img.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
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

          {/* PREFERRED VISIT TIME */}
          <div id="field-visitTimeType" className={`bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border dark:border-slate-800 space-y-5 ${fieldErrors.visitTimeType ? 'border-red-400' : 'border-slate-200'}`}>
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">
              12. Preferred Visit Time *
            </Label>
            {fieldErrors.visitTimeType && <p className="text-red-500 text-xs font-bold -mt-3">⚠ {fieldErrors.visitTimeType}</p>}

            {/* 3 main type buttons */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl p-1 ${fieldErrors.visitTimeType ? 'ring-2 ring-red-400' : ''}`}>
              {[
                { value: 'anytime',  label: 'Any Time',   sub: '10am – 6pm' },
                { value: 'fixed',    label: 'Fixed Time',  sub: 'Select a slot' },
                { value: 'flexible', label: 'Flexible',    sub: 'Multiple slots' },
              ].map(({ value, label, sub }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, visitTimeType: prev.visitTimeType === value ? '' : value, visitFixedSlots: [], visitFlexibleSlots: [] }))}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    formData.visitTimeType === value
                      ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                      : 'border-slate-200 dark:border-slate-700 hover:border-[#10B981]/50 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
                </button>
              ))}
            </div>

            {/* Fixed: multi-select slots */}
            {formData.visitTimeType === 'fixed' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Select preferred time slots <span className="text-slate-400 font-normal">(can select multiple)</span></Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['10am–11am','11am–12pm','12pm–1pm','1pm–2pm','2pm–3pm','3pm–4pm','4pm–5pm','5pm–6pm'].map(slot => {
                    const selected = formData.visitFixedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData(prev => {
                          const next = selected
                            ? prev.visitFixedSlots.filter(s => s !== slot)
                            : [...prev.visitFixedSlots, slot];
                          return { ...prev, visitFixedSlots: next };
                        })}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                          selected
                            ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#10B981]/50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Flexible: multi-select broad slots */}
            {formData.visitTimeType === 'flexible' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Select all that apply</Label>
                <div className="flex flex-wrap gap-2">
                  {['10am–1pm','1pm–4pm','4pm–6pm'].map(slot => {
                    const selected = formData.visitFlexibleSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData(prev => {
                          const next = selected
                            ? prev.visitFlexibleSlots.filter(s => s !== slot)
                            : [...prev.visitFlexibleSlots, slot];
                          return { ...prev, visitFlexibleSlots: next };
                        })}
                        className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
                          selected
                            ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#10B981]/50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* (16) OWNER DETAILS */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
            <Label className="text-lg font-bold text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-3">13. Owner Details</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div id="field-name" className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name *</Label>
                <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Name" className={`h-12 bg-slate-50 dark:bg-slate-900 ${fieldErrors.name ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-200 dark:border-slate-800'}`} />
                {fieldErrors.name && <p className="text-red-500 text-xs font-bold">⚠ {fieldErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address <span className="text-slate-400 font-normal">(optional)</span></Label>
                <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
              <div id="field-mobileNumber" className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mobile Number (10 digits) *</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">+91</span>
                  <Input name="mobileNumber" type="tel" maxLength="10" value={formData.mobileNumber} onChange={handleInputChange} placeholder="9876543210" className={`h-12 pl-12 bg-slate-50 dark:bg-slate-900 tracking-wide font-bold ${fieldErrors.mobileNumber ? 'border-red-400 focus-visible:ring-red-400' : 'border-slate-200 dark:border-slate-800'}`} />
                </div>
                {fieldErrors.mobileNumber && <p className="text-red-500 text-xs font-bold">⚠ {fieldErrors.mobileNumber}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Address</Label>
                <Textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} placeholder="Your current residential address" className="min-h-[80px] rounded-xl resize-none bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
              </div>
            </div>
          </div>

          {/* (17) TERMS & CONDITIONS */}
          <div id="field-termsAccepted" className="bg-transparent pt-4 pb-2">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({ ...prev, termsAccepted: checked }));
                  clearFieldError('termsAccepted');
                }}
                className={`mt-1 data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981] ${fieldErrors.termsAccepted ? 'border-red-400' : ''}`}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="terms" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  I agree to the Terms & Conditions.
                </label>
                <p className="text-sm text-slate-500 font-medium">
                  By submitting, you confirm that the provided information is accurate and you have the right to list this property.
                </p>
                {fieldErrors.termsAccepted && <p className="text-red-500 text-xs font-bold mt-1">⚠ {fieldErrors.termsAccepted}</p>}
              </div>
            </div>
          </div>

          {/* (18) SUBMIT BUTTON */}
          <Button 
            type="submit" 
            className="w-full h-16 text-lg font-extrabold rounded-2xl bg-[#10B981] hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isSubmitting}
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
