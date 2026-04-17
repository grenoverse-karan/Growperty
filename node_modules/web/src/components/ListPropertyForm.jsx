
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Minus, UploadCloud, X, ShieldAlert, Film } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { formatIndianPrice } from '@/lib/priceUtils.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { sanitizePropertyFormData, logPropertyPayload, logPocketBaseError, extractPocketBaseErrorMessage } from '@/lib/propertyFormDataMapper.js';

// --- Constants (Strictly matching PocketBase Schema) ---
const OWNER_TYPES = ['Individual', 'Builder/Developer', 'NRI', 'Partnership firm'];
const PROPERTY_TYPES = ['Flat/Apartment', 'Independent House', 'Villa', 'Penthouse', 'Plot/Land', 'Commercial'];
const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
const AREA_UNITS = ['Sq.ft', 'Sq.yd', 'Sq.m'];
const AREA_TYPES = ['Carpet Area', 'Built-up Area', 'Super Built-up Area'];
const FURNISHING_TYPES = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'];
const PROPERTY_AGE = ['0-1 Year', '1-5 Years', '5-10 Years', '10+ Years'];
const POSSESSION_STATUS = ['Ready to Move', 'Under Construction', 'Possession Soon'];
const OWNERSHIP_TYPE = ['Individual', 'Company', 'Joint'];
const BANK_LOAN = ['Yes', 'No'];
const PLOT_TYPES = ['Lease Hold', 'Free Hold', 'Kisan Kota'];

const SUB_TYPES = {
  'Commercial': ['Shop', 'Office Space', 'Store/Showroom', 'Warehouse'],
  'Plot/Land':  ['Residential Plot', 'Commercial Plot', 'Industrial Plot', 'Agricultural Land'],
};

const FURNISHING_ITEMS_LIST = [
  'Beds', 'AC', 'Sofa Set', 'Center Table', 'Dining Table', 'Dressing Table',
  'Chairs', 'Wardrobes', 'TV Unit', 'Refrigerator', 'Washing Machine', 'Geyser',
  'Television', 'Temple', 'Chimney', 'Microwave', 'Water Purifier', 'Ceiling Fans',
  'Lights', 'Exhaust Fans', 'Curtains', 'Modular Kitchen', 'Bathroom Fittings',
];

const AMENITIES_CATEGORIES = {
  'Security & Safety': [
    'Gated Entry', '24/7 Security Guards', 'CCTV Surveillance',
    'Intercom Facility', 'Fire Fighting System', '24/7 Power Backup',
  ],
  'Infrastructure & Utilities': [
    '24/7 Water Supply', 'Lifts', 'Piped Gas (IGL)',
    'Rainwater Harvesting', 'EV Charging Points',
  ],
  'Lifestyle & Recreation': [
    'Clubhouse', 'Gymnasium', 'Swimming Pool', 'Park',
    'Jogging & Cycling Tracks', "Kids' Play Area", 'Sports Courts',
  ],
  'Social & Convenience': [
    'Community Hall', 'Internal Shopping Complex', 'Visitor Parking',
    'Maintenance Staff', 'High-Speed Internet', 'Street Lighting',
    'Wide Internal Roads', 'Play School', 'Green Belts',
  ],
};

const NEARBY_AMENITIES = [
  'Market', 'Mall', 'Public Park', 'Temple',
  'School & Hospital', 'Public Transport', 'Metro',
];

const formatPriceToIndianWords = (value) => {
  if (!value || isNaN(value)) return '';
  const num = Number(value);
  if (num === 0) return 'Zero';
  let result = [];
  const crores    = Math.floor(num / 10000000);
  const lakhs     = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;
  if (crores    > 0) result.push(`${crores} Crore`);
  if (lakhs     > 0) result.push(`${lakhs} Lakh`);
  if (thousands > 0) result.push(`${thousands} Thousand`);
  if (remainder > 0) result.push(`${remainder}`);
  return result.join(' ');
};

const ListPropertyForm = () => {
  const navigate = useNavigate();
  const { currentUser, whatsappPhone, isAuthenticated } = useAuth();
  const fileInputRef  = useRef(null);
  const videoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    propertyType:      '',
    propertySubType:   '',
    bhk:               '',
    sector:            '',
    houseNo:           '',
    landmark:          '',
    totalArea:         '',
    areaUnit:          'Sq.ft',
    areaType:          'Carpet Area',
    bathrooms:         0,
    balconies:         0,
    floorNumber:       '',
    totalFloors:       '',
    totalPrice:        '',
    pricePerUnit:      0,
    propertyAge:       '',
    possessionStatus:  '',
    ownershipType:     '',
    bankLoanAvailable: '',
    plotType:          '',
    furnishingType:    '',
    furnishingItems:   {},
    carParking:        0,
    bikeParking:       0,
    amenities:         [],
    nearbyAmenities:   [],
    description:       '',
    email:             '',
    mobileNumber:      '',
    ownerType:         '',
    name:              '',
    currentAddress:    '',
    city:              '',
    images:            [],
    videos:            [],
    termsAccepted:     false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descWarning,  setDescWarning]  = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to list a property');
      navigate('/login');
      return;
    }

    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name:         prev.name         || currentUser.name  || '',
        email:        prev.email        || currentUser.email || '',
        mobileNumber: prev.mobileNumber || currentUser.phone || whatsappPhone || '',
      }));
    }
  }, [currentUser, whatsappPhone, isAuthenticated, navigate]);

  useEffect(() => {
    const price = Number(formData.totalPrice);
    const area  = Number(formData.totalArea);
    setFormData(prev => ({
      ...prev,
      pricePerUnit: price > 0 && area > 0 ? Math.round(price / area) : 0,
    }));
  }, [formData.totalPrice, formData.totalArea]);

  useEffect(() => {
    return () => {
      formData.images.forEach(img => URL.revokeObjectURL(img.preview));
      formData.videos.forEach(vid => URL.revokeObjectURL(vid.preview));
    };
  }, [formData.images, formData.videos]);

  if (!isAuthenticated) {
    return null;
  }

  const showFloors      = formData.propertyType !== 'Plot/Land';
  const showFloorNumber = showFloors && formData.propertyType !== 'Independent House';
  const showPlotType    = formData.propertyType === 'Plot/Land' && formData.propertySubType === 'Residential Plot';
  const showAmenities   = formData.propertyType !== 'Plot/Land' || formData.propertySubType === 'Residential Plot';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'description') {
      setDescWarning(/(?:\+?91[\-\s]?)?[6789]\d{2}[\-\s]?\d{3}[\-\s]?\d{4}/g.test(value));
    }
  };

  const handleChipSelect = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'propertyType') {
        newData.propertySubType = '';
        newData.plotType = '';
        if (value === 'Plot/Land') newData.amenities = [];
      }
      return newData;
    });
  };

  const handleQuantityChange = (field, increment) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, Number(prev[field] || 0) + increment),
    }));
  };

  const handleFurnishingTypeClick = (type) => {
    setFormData(prev => ({
      ...prev,
      furnishingType:  type,
      furnishingItems: type === 'Unfurnished' ? {} : prev.furnishingItems,
    }));
  };

  const handleFurnishingItemChange = (item, increment) => {
    setFormData(prev => {
      const currentQty = prev.furnishingItems[item] || 0;
      const newQty     = Math.max(0, currentQty + increment);
      const newItems   = { ...prev.furnishingItems };
      if (newQty === 0) delete newItems[item];
      else newItems[item] = newQty;
      return { ...prev, furnishingItems: newItems };
    });
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const array = prev[field] || [];
      return {
        ...prev,
        [field]: array.includes(item)
          ? array.filter(i => i !== item)
          : [...array, item],
      };
    });
  };

  const compressImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 1280;
          let { width, height } = img;
          if (width > height) { if (width  > MAX) { height *= MAX / width;  width  = MAX; } }
          else                { if (height > MAX) { width  *= MAX / height; height = MAX; } }
          canvas.width  = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.8);
        };
      };
    });

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 20) {
      toast.error('Maximum 20 images allowed');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const toastId = toast.loading('Compressing images...');
    try {
      const processed = await Promise.all(
        files.map(async (file) => {
          const compressed = await compressImage(file);
          return { file: compressed, preview: URL.createObjectURL(compressed) };
        })
      );
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...processed].slice(0, 20),
      }));
      toast.success('Images added successfully', { id: toastId });
    } catch {
      toast.error('Failed to process images', { id: toastId });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      URL.revokeObjectURL(newImages[indexToRemove].preview);
      newImages.splice(indexToRemove, 1);
      return { ...prev, images: newImages };
    });
  };

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.videos.length + files.length > 1) {
      toast.error('Maximum 1 video allowed');
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum 50MB per video`);
        return false;
      }
      return true;
    });

    const processed = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, ...processed].slice(0, 1),
    }));

    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeVideo = (indexToRemove) => {
    setFormData(prev => {
      const newVideos = [...prev.videos];
      URL.revokeObjectURL(newVideos[indexToRemove].preview);
      newVideos.splice(indexToRemove, 1);
      return { ...prev, videos: newVideos };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser?.id) {
      toast.error('Authentication required. Please log in to post a listing.');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('You must accept the Terms & Conditions');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting your property listing...');

    try {
      // Sanitize description
      const sanitizedDescription = formData.description 
        ? formData.description.replace(/(?:\+?91[\-\s]?)?[6789]\d{2}[\-\s]?\d{3}[\-\s]?\d{4}/g, '[HIDDEN]') 
        : '';

      // Prepare raw form data
      const rawFormData = {
        owner_id: currentUser.id,
        city: formData.city,
        propertyType: formData.propertyType,
        propertySubType: formData.propertySubType,
        sector: formData.sector,
        houseNo: formData.houseNo,
        totalPrice: formData.totalPrice,
        totalArea: formData.totalArea,
        areaUnit: formData.areaUnit,
        areaType: formData.areaType,
        bhk: formData.bhk,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        ownerType: formData.ownerType,
        name: formData.name,
        landmark: formData.landmark,
        description: sanitizedDescription,
        currentAddress: formData.currentAddress,
        ageOfProperty: formData.propertyAge,
        propertyAge: formData.propertyAge,
        possessionStatus: formData.possessionStatus,
        ownershipType: formData.ownershipType,
        furnishingType: formData.furnishingType,
        floorNo: formData.floorNumber,
        plotType: formData.plotType,
        bankLoanAvailable: formData.bankLoanAvailable,
        status: 'pending',
        carParking: formData.carParking,
        bikeParking: formData.bikeParking,
        totalFloors: formData.totalFloors,
        bathrooms: formData.bathrooms,
        balconies: formData.balconies,
        floorNumber: formData.floorNumber,
        pricePerUnit: formData.pricePerUnit,
        isResale: false,
        furnishingItems: formData.furnishingItems,
        specialFeatures: [],
        amenities: formData.amenities,
        nearbyAmenities: formData.nearbyAmenities,
      };

      // Sanitize and validate
      const sanitizationResult = sanitizePropertyFormData(rawFormData, formData.propertyType);

      if (!sanitizationResult.success) {
        toast.error(sanitizationResult.error, { id: toastId, duration: 10000 });
        setIsSubmitting(false);
        return;
      }

      const payload = sanitizationResult.data;

      // Log the sanitized payload
      logPropertyPayload(payload, 'ListPropertyForm Submission');

      // Submit to PocketBase
      const record = await pb.collection('properties').create(payload, { $autoCancel: false });
      
      console.log('✅ Property created successfully. Record ID:', record.id);

      // Upload media after successful record creation
      if (formData.images.length > 0 || formData.videos.length > 0) {
        const fileData = new FormData();
        formData.images.forEach(img => fileData.append('images', img.file));
        formData.videos.forEach(vid => fileData.append('videos', vid.file));
        await pb.collection('properties').update(record.id, fileData, { $autoCancel: false });
        console.log('✅ Media uploaded successfully');
      }

      toast.success('Property submitted for approval!', { id: toastId });
      setTimeout(() => navigate('/my-listings'), 1500);

    } catch (error) {
      logPocketBaseError(error, 'ListPropertyForm Submission Error');
      const errorMessage = extractPocketBaseErrorMessage(error);
      
      toast.error(errorMessage, { id: toastId, duration: 10000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-background">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            List your property
          </h1>
          <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary animate-free-btn opacity-20"></div>
            <div className="absolute inset-1 rounded-full bg-primary animate-shimmer flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-extrabold text-sm tracking-wider">FREE</span>
            </div>
          </div>
        </div>
        <p className="text-sm md:text-base text-muted-foreground font-medium">
          Get more genuine buyers and investors. Sell your property faster.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-3">
          <Label className="text-base font-bold">Property Type *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PROPERTY_TYPES.map(type => (
              <div
                key={type}
                onClick={() => handleChipSelect('propertyType', type)}
                className={`chip-base ${formData.propertyType === type ? 'chip-active' : 'chip-inactive'}`}
              >
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {formData.propertyType && SUB_TYPES[formData.propertyType] && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <Label className="text-base font-bold">Sub type</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SUB_TYPES[formData.propertyType].map(type => (
                <div
                  key={type}
                  onClick={() => handleChipSelect('propertySubType', type)}
                  className={`chip-base ${formData.propertySubType === type ? 'chip-active' : 'chip-inactive'}`}
                >
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {['Flat/Apartment', 'Independent House', 'Villa', 'Penthouse'].includes(formData.propertyType) && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <Label className="text-base font-bold">BHK Configuration *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {BHK_OPTIONS.map(bhk => (
                <div
                  key={bhk}
                  onClick={() => handleChipSelect('bhk', bhk)}
                  className={`chip-base ${formData.bhk === bhk ? 'chip-active' : 'chip-inactive'}`}
                >
                  <span>{bhk}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.propertyType !== 'Plot/Land' && formData.propertyType !== 'Commercial' && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div
              onClick={() => formData.bathrooms === 0 && handleQuantityChange('bathrooms', 1)}
              className={`chip-base flex-col justify-center min-h-[3.5rem] transition-all ${formData.bathrooms > 0 ? 'chip-active' : 'chip-inactive cursor-pointer'}`}
            >
              <span className={formData.bathrooms > 0 ? 'font-bold' : ''}>Bathrooms</span>
              {formData.bathrooms > 0 && (
                <div className="qty-counter-container mt-2">
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleQuantityChange('bathrooms', -1); }} className="qty-counter-btn"><Minus className="h-4 w-4" /></button>
                  <span className="qty-counter-value">{formData.bathrooms}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleQuantityChange('bathrooms', 1); }} className="qty-counter-btn"><Plus className="h-4 w-4" /></button>
                </div>
              )}
            </div>
            <div
              onClick={() => formData.balconies === 0 && handleQuantityChange('balconies', 1)}
              className={`chip-base flex-col justify-center min-h-[3.5rem] transition-all ${formData.balconies > 0 ? 'chip-active' : 'chip-inactive cursor-pointer'}`}
            >
              <span className={formData.balconies > 0 ? 'font-bold' : ''}>Balconies</span>
              {formData.balconies > 0 && (
                <div className="qty-counter-container mt-2">
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleQuantityChange('balconies', -1); }} className="qty-counter-btn"><Minus className="h-4 w-4" /></button>
                  <span className="qty-counter-value">{formData.balconies}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleQuantityChange('balconies', 1); }} className="qty-counter-btn"><Plus className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-base font-bold">Area Details *</Label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-[70%]">
              <Input name="totalArea" type="number" min="1" value={formData.totalArea || ''} onChange={handleChange} placeholder="Total Area" className="h-12 rounded-xl" />
            </div>
            <div className="w-full md:w-[30%] flex gap-2">
              <div className="flex-1 flex rounded-xl overflow-hidden border border-border">
                {AREA_UNITS.map(unit => (
                  <div
                    key={unit}
                    onClick={() => handleChipSelect('areaUnit', unit)}
                    className={`flex-1 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors break-words whitespace-normal text-center p-2 ${formData.areaUnit === unit ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                  >
                    {unit}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full bg-sky-50 dark:bg-sky-950/30 rounded-xl p-1 mt-2 border border-sky-100 dark:border-sky-900">
            <Select value={formData.areaType} onValueChange={(v) => handleChipSelect('areaType', v)}>
              <SelectTrigger className="bg-transparent border-none shadow-none text-sky-900 dark:text-sky-100 font-bold focus:ring-0 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AREA_TYPES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFloors && (
          <div className="grid grid-cols-2 gap-4">
            {showFloorNumber && (
              <div className="space-y-3">
                <Label className="text-base font-bold">Floor Number</Label>
                <Input name="floorNumber" type="number" value={formData.floorNumber || ''} onChange={handleChange} placeholder="e.g. 5" className="h-12 rounded-xl" />
              </div>
            )}
            <div className={`space-y-3 ${!showFloorNumber ? 'col-span-2' : ''}`}>
              <Label className="text-base font-bold">Total Floors</Label>
              <Input name="totalFloors" type="number" value={formData.totalFloors || ''} onChange={handleChange} placeholder="e.g. 12" className="h-12 rounded-xl" />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-base font-bold">Total Price *</Label>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-bold">₹</span>
                <Input
                  name="totalPrice"
                  type="text"
                  value={formData.totalPrice ? formatIndianPrice(formData.totalPrice) : ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'totalPrice', value: val } });
                  }}
                  placeholder="0"
                  className="h-12 rounded-xl text-lg font-bold pl-8"
                />
              </div>
              {formData.totalPrice && (
                <p className="text-sm font-medium text-muted-foreground pl-1 animate-in fade-in">
                  {formatPriceToIndianWords(formData.totalPrice)}
                </p>
              )}
            </div>
            <div className="w-full md:w-1/2 bg-muted/50 p-3 rounded-xl flex items-center justify-between border border-border">
              <span className="text-sm text-muted-foreground font-medium">Price Per {formData.areaUnit}</span>
              <span className="font-bold text-lg text-primary">₹ {formData.pricePerUnit.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
          <Label className="text-xl font-extrabold border-b pb-2 block">Location Details</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-bold">City *</Label>
              <Select value={formData.city} onValueChange={(v) => handleChipSelect('city', v)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Noida">Noida</SelectItem>
                  <SelectItem value="Greater Noida">Greater Noida</SelectItem>
                  <SelectItem value="YEIDA">Yeida (Yamuna Exp.)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold">Sector/Area *</Label>
              <Input name="sector" value={formData.sector || ''} onChange={handleChange} placeholder="Enter sector or area name (e.g. Sector 62)" className="h-12 rounded-xl placeholder:text-sm placeholder:text-muted-foreground/70" />
            </div>

            <div className="space-y-3 md:col-span-2">
              <Label className="text-base font-bold">Society/Project/Locality</Label>
              <Input name="landmark" value={formData.landmark || ''} onChange={handleChange} placeholder="Enter society, project, or locality name (e.g. DLF Pinnacle)" className="h-12 rounded-xl placeholder:text-sm placeholder:text-muted-foreground/70" />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold">House/Flat/Plot No. *</Label>
              <Input name="houseNo" value={formData.houseNo || ''} onChange={handleChange} placeholder="Enter house, flat, or plot number (e.g. 101)" className="h-12 rounded-xl placeholder:text-sm placeholder:text-muted-foreground/70" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-base font-bold">Possession Status</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {POSSESSION_STATUS.map(status => (
                <div key={status} onClick={() => handleChipSelect('possessionStatus', status)} className={`chip-base ${formData.possessionStatus === status ? 'chip-active' : 'chip-inactive'}`}>
                  <span>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showPlotType && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <Label className="text-base font-bold">Plot Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLOT_TYPES.map(type => (
                <div key={type} onClick={() => handleChipSelect('plotType', type)} className={`chip-base ${formData.plotType === type ? 'chip-active' : 'chip-inactive'}`}>
                  <span>{type}</span>
                  {type === 'Kisan Kota' && <span className="text-xs opacity-80 mt-1">5% 6% 7%</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.propertyType !== 'Plot/Land' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-bold">Furnishing Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FURNISHING_TYPES.map(type => (
                  <div key={type} onClick={() => handleFurnishingTypeClick(type)} className={`chip-base ${formData.furnishingType === type ? 'chip-active' : 'chip-inactive'}`}>
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>
            {(formData.furnishingType === 'Semi-Furnished' || formData.furnishingType === 'Fully Furnished') && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 p-5 bg-secondary/10 rounded-2xl border border-border">
                <Label className="text-sm font-bold text-muted-foreground">Select Furnishing Items</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {FURNISHING_ITEMS_LIST.map(item => {
                    const qty = formData.furnishingItems[item] || 0;
                    const isActive = qty > 0;
                    return (
                      <div
                        key={item}
                        onClick={() => qty === 0 && handleFurnishingItemChange(item, 1)}
                        className={`chip-base flex-col justify-center min-h-[3.5rem] transition-all ${isActive ? 'chip-active' : 'chip-inactive cursor-pointer'}`}
                      >
                        <span className={`text-center text-sm ${isActive ? 'font-bold' : ''}`}>{item}</span>
                        {isActive && (
                          <div className="qty-counter-container mt-2">
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleFurnishingItemChange(item, -1); }} className="qty-counter-btn"><Minus className="h-3 w-3" /></button>
                            <span className="qty-counter-value text-sm">{qty}</span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); handleFurnishingItemChange(item, 1); }} className="qty-counter-btn"><Plus className="h-3 w-3" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {formData.propertyType !== 'Plot/Land' && (
          <div className="space-y-4">
            <Label className="text-base font-bold">Parking</Label>
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => formData.carParking === 0 && handleQuantityChange('carParking', 1)} className={`chip-base flex-col justify-center min-h-[3.5rem] transition-all ${formData.carParking > 0 ? 'chip-active' : 'chip-inactive cursor-pointer'}`}>
                <span className={formData.carParking > 0 ? 'font-bold' : ''}>Car Parking</span>
                {formData.carParking > 0 && (
                  <div className="qty-counter-container mt-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleQuantityChange('carParking', -1); }} className="qty-counter-btn"><Minus className="h-4 w-4" /></button>
                    <span className="qty-counter-value">{formData.carParking}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleQuantityChange('carParking', 1); }} className="qty-counter-btn"><Plus className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
              <div onClick={() => formData.bikeParking === 0 && handleQuantityChange('bikeParking', 1)} className={`chip-base flex-col justify-center min-h-[3.5rem] transition-all ${formData.bikeParking > 0 ? 'chip-active' : 'chip-inactive cursor-pointer'}`}>
                <span className={formData.bikeParking > 0 ? 'font-bold' : ''}>Bike Parking</span>
                {formData.bikeParking > 0 && (
                  <div className="qty-counter-container mt-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleQuantityChange('bikeParking', -1); }} className="qty-counter-btn"><Minus className="h-4 w-4" /></button>
                    <span className="qty-counter-value">{formData.bikeParking}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleQuantityChange('bikeParking', 1); }} className="qty-counter-btn"><Plus className="h-4 w-4" /></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showAmenities && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            <Label className="text-xl font-extrabold border-b pb-2 block">Amenities & Features</Label>
            {Object.entries(AMENITIES_CATEGORIES).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{category}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map(item => {
                    const isSelected = formData.amenities.includes(item);
                    return (
                      <div key={item} onClick={() => toggleArrayItem('amenities', item)} className={`chip-base !min-h-[56px] ${isSelected ? 'chip-active' : 'chip-inactive'}`}>
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-xl font-extrabold border-b pb-2 block">Nearby Amenities</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {NEARBY_AMENITIES.map(item => {
              const isSelected = formData.nearbyAmenities.includes(item);
              return (
                <div key={item} onClick={() => toggleArrayItem('nearbyAmenities', item)} className={`chip-base ${isSelected ? 'chip-active' : 'chip-inactive'}`}>
                  <span>{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-3">
            <Label className="text-base font-bold">Ownership Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {OWNERSHIP_TYPE.map(type => (
                <div key={type} onClick={() => handleChipSelect('ownershipType', type)} className={`chip-base ${formData.ownershipType === type ? 'chip-active' : 'chip-inactive'}`}>
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-base font-bold">Bank Loan Available</Label>
            <div className="grid grid-cols-2 gap-3">
              {BANK_LOAN.map(opt => (
                <div key={opt} onClick={() => handleChipSelect('bankLoanAvailable', opt)} className={`chip-base ${formData.bankLoanAvailable === opt ? 'chip-active' : 'chip-inactive'}`}>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-base font-bold">Property Age</Label>
            <div className="grid grid-cols-2 gap-3">
              {PROPERTY_AGE.map(age => (
                <div key={age} onClick={() => handleChipSelect('propertyAge', age)} className={`chip-base ${formData.propertyAge === age ? 'chip-active' : 'chip-inactive'}`}>
                  <span>{age}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <Label className="text-base font-bold">Owner Type *</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {OWNER_TYPES.map(type => (
              <div key={type} onClick={() => handleChipSelect('ownerType', type)} className={`chip-base ${formData.ownerType === type ? 'chip-active' : 'chip-inactive'}`}>
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-bold">Images (Max 20)</Label>
              <span className="text-sm font-medium text-muted-foreground">{formData.images.length}/20 images uploaded</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border group shadow-sm">
                  <img src={img.preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.images.length < 20 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <UploadCloud className="h-8 w-8" />
                  <span className="text-sm font-medium break-words whitespace-normal text-center px-2">Add Image</span>
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-bold">Property Video (Max 1)</Label>
              <span className="text-sm font-medium text-muted-foreground">{formData.videos.length}/1 video uploaded</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {formData.videos.map((vid, index) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-border group shadow-sm bg-black">
                  <video src={vid.preview} className="w-full h-full object-cover" controls />
                  <button type="button" onClick={() => removeVideo(index)} className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.videos.length < 1 && (
                <button type="button" onClick={() => videoInputRef.current?.click()} className="aspect-video rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Film className="h-8 w-8" />
                  <span className="text-sm font-medium break-words whitespace-normal text-center px-2">Add Video</span>
                </button>
              )}
            </div>
            <input type="file" ref={videoInputRef} onChange={handleVideoChange} accept="video/*" className="hidden" />
          </div>
        </div>

        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <Label className="text-base font-bold">Description (Optional)</Label>
          <Textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Describe your property in detail..."
            className={`min-h-[150px] resize-none rounded-xl text-base ${descWarning ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''}`}
          />
          {descWarning && (
            <p className="text-sm text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1.5 mt-2">
              <ShieldAlert className="h-4 w-4" /> Phone numbers detected and will be automatically hidden for privacy.
            </p>
          )}
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
          <Label className="text-xl font-extrabold border-b pb-2 block">Owner Details</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-bold">Name / Property Title *</Label>
              <Input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Enter your full name or property title" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-bold">Email Address *</Label>
              <Input name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="Enter your email" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-bold">Mobile Number *</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">+91</span>
                <Input
                  name="mobileNumber"
                  type="tel"
                  maxLength={10}
                  value={formData.mobileNumber || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    handleChange({ target: { name: 'mobileNumber', value: val } });
                  }}
                  placeholder="10-digit mobile number"
                  className="h-12 rounded-xl pl-12"
                />
              </div>
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label className="text-base font-bold">Current Address</Label>
              <Textarea name="currentAddress" value={formData.currentAddress || ''} onChange={handleChange} placeholder="Enter your current residential address" className="min-h-[100px] resize-none rounded-xl text-base" />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border space-y-6">
          <div className="flex items-start space-x-3 bg-secondary/20 p-4 rounded-xl border border-border">
            <Checkbox
              id="terms"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(c) => handleChange({ target: { name: 'termsAccepted', type: 'checkbox', checked: c } })}
              className="mt-1 h-5 w-5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="terms" className="text-base font-bold cursor-pointer">
                I agree to the Terms & Conditions
              </Label>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By submitting, you confirm that the provided information is accurate and you have the right to list this property.
              </p>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-16 text-xl font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all"
            disabled={!formData.termsAccepted || isSubmitting}
          >
            {isSubmitting
              ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Submitting Listing...</>
              : 'Post Property Listing'
            }
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ListPropertyForm;
