import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Plus, Minus } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatPriceInWords } from '@/lib/priceUtils.js';

import RadioButtonGroup from './form/RadioButtonGroup.jsx';
import InputField from './form/InputField.jsx';
import DropdownSelect from './form/DropdownSelect.jsx';
import AmenitiesSelector from './AmenitiesSelector.jsx';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const FURNISHING_ITEMS_LIST = [
  'Bed', 'Sofa', 'Dining Table', 'Kitchen Appliances', 
  'Wardrobe', 'Curtains', 'Lights & Fixtures', 
  'Air Conditioner', 'Water Heater', 'Washing Machine'
];

const RequirementForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [phoneWarning, setPhoneWarning] = useState(false);
  const [isFurnishingModalOpen, setIsFurnishingModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    propertyType: '',
    propertySubType: '',
    bhk: '',
    minArea: '',
    maxArea: '',
    areaUnit: 'Sq.ft',
    city: '',
    sector: '',
    society: '',
    furnishingType: '',
    furnishingItems: {},
    possessionStatus: '',
    ownershipType: '',
    amenities: [],
    minPrice: '',
    maxPrice: '',
    specialRequirements: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerAddress: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        buyerName: prev.buyerName || currentUser.name || '',
        buyerEmail: prev.buyerEmail || currentUser.email || '',
        buyerPhone: prev.buyerPhone || currentUser.phone || ''
      }));
    }
  }, [currentUser]);

  const updateField = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'propertyType') {
        newData.propertySubType = '';
        newData.bhk = '';
      }
      if (field === 'specialRequirements') {
        const phoneRegex = /(\+91[-\s]?)?[0-9]{10}/;
        setPhoneWarning(phoneRegex.test(value));
      }
      return newData;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleFurnishingTypeClick = (type) => {
    updateField('furnishingType', type);
    if (type === 'Semi furnished' || type === 'Full furnished') {
      setIsFurnishingModalOpen(true);
    } else {
      updateField('furnishingItems', {});
    }
  };

  const handleFurnishingItemChange = (item, increment) => {
    setFormData(prev => {
      const currentQty = prev.furnishingItems[item] || 0;
      const newQty = Math.max(0, currentQty + increment);
      const newItems = { ...prev.furnishingItems };
      if (newQty === 0) {
        delete newItems[item];
      } else {
        newItems[item] = newQty;
      }
      return { ...prev, furnishingItems: newItems };
    });
  };

  const isPlot = formData.propertyType === 'Plot/Land';
  const isCommercial = formData.propertyType === 'Commercial';
  const showSubType = isPlot || isCommercial;
  const showBhk = !isPlot && !isCommercial && formData.propertyType;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.propertyType) newErrors.propertyType = 'Required';
    if (!formData.city) newErrors.city = 'Required';
    if (!formData.sector) newErrors.sector = 'Required';
    if (!formData.minPrice || isNaN(formData.minPrice)) newErrors.minPrice = 'Required';
    if (!formData.maxPrice || isNaN(formData.maxPrice)) newErrors.maxPrice = 'Required';
    if (Number(formData.minPrice) > Number(formData.maxPrice)) newErrors.maxPrice = 'Max price must be greater than Min price';
    if (!formData.buyerName.trim()) newErrors.buyerName = 'Required';
    if (!formData.buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) newErrors.buyerEmail = 'Valid email required';
    if (!formData.buyerPhone || !/^\d{10}$/.test(formData.buyerPhone)) newErrors.buyerPhone = 'Valid 10-digit number required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all mandatory fields correctly.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      // Sanitize special requirements
      const sanitizedRequirements = formData.specialRequirements.replace(/(\+91[-\s]?)?[0-9]{10}/g, '**********');

      const payload = {
        ...formData,
        status: 'active',
        minArea: formData.minArea ? Number(formData.minArea) : null,
        maxArea: formData.maxArea ? Number(formData.maxArea) : null,
        minPrice: Number(formData.minPrice),
        maxPrice: Number(formData.maxPrice),
        bhk: formData.bhk ? Number(formData.bhk.replace(/[^0-9]/g, '')) : null,
        specialRequirements: sanitizedRequirements,
        furnishingData: {
          type: formData.furnishingType,
          items: formData.furnishingItems
        }
      };

      await pb.collection('buyer_requirements').create(payload, { $autoCancel: false });
      toast.success('Requirement posted successfully!');
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto bg-card p-8 md:p-12 rounded-3xl border border-border shadow-xl text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground mb-4">Requirement Posted!</h2>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">We will notify you as soon as a matching property is listed on our platform.</p>
        <Button variant="outline" onClick={() => navigate('/properties')} className="font-bold rounded-xl h-12 px-8">
          Browse Current Properties
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        
        {/* SECTION 1: PROPERTY TYPE */}
        <section className="form-section-container">
          <h2 className="form-section-heading">1. Property Type & Sub-Type</h2>
          <div className="space-y-6">
            <RadioButtonGroup 
              options={[
                { label: 'Flat/Apartment', value: 'Flat/Apartment' },
                { label: 'Independent House', value: 'Independent House' },
                { label: 'Villa', value: 'Villa' },
                { label: 'Penthouse', value: 'Penthouse' },
                { label: 'Plot/Land', value: 'Plot/Land' },
                { label: 'Commercial', value: 'Commercial' }
              ]} 
              value={formData.propertyType} 
              onChange={(v) => updateField('propertyType', v)} 
              error={errors.propertyType}
              columns={3}
            />
            {showSubType && (
              <DropdownSelect 
                label="Property Sub-Type" 
                options={isPlot ? [
                  { label: 'Residential Plot', value: 'Residential Plot' },
                  { label: 'Commercial Plot', value: 'Commercial Plot' },
                  { label: 'Industrial Plot', value: 'Industrial Plot' },
                  { label: 'Agricultural Land', value: 'Agricultural Land' }
                ] : [
                  { label: 'Shop', value: 'Shop' },
                  { label: 'Office', value: 'Office' },
                  { label: 'Store', value: 'Store' },
                  { label: 'Other', value: 'Other' }
                ]}
                value={formData.propertySubType}
                onChange={(v) => updateField('propertySubType', v)}
              />
            )}
          </div>
        </section>

        {/* SECTION 2: SIZE & CONFIGURATION */}
        <section className="form-section-container">
          <h2 className="form-section-heading">2. Size & Configuration</h2>
          <div className="space-y-6">
            {showBhk && (
              <RadioButtonGroup 
                label="BHK Configuration" 
                options={[{ label: '1 BHK', value: '1 BHK' }, { label: '2 BHK', value: '2 BHK' }, { label: '3 BHK', value: '3 BHK' }, { label: '4 BHK', value: '4 BHK' }, { label: '5+ BHK', value: '5+ BHK' }]} 
                value={formData.bhk} 
                onChange={(v) => updateField('bhk', v)} 
                columns={5}
              />
            )}
            {!isPlot && (
              <div className="form-grid-2col">
                <InputField label="Min Area" type="number" value={formData.minArea} onChange={(e) => updateField('minArea', e.target.value)} />
                <InputField label="Max Area" type="number" value={formData.maxArea} onChange={(e) => updateField('maxArea', e.target.value)} />
              </div>
            )}
            <div className="max-w-md">
              <DropdownSelect label="Area Unit" options={[{label: 'Sq.ft', value: 'Sq.ft'}, {label: 'Sq.yd', value: 'Sq.yd'}, {label: 'Sq.m', value: 'Sq.m'}]} value={formData.areaUnit} onChange={(v) => updateField('areaUnit', v)} />
            </div>
          </div>
        </section>

        {/* SECTION 3: LOCATION */}
        <section className="form-section-container">
          <h2 className="form-section-heading">3. Location Preferences</h2>
          <div className="form-grid-2col">
            <DropdownSelect label="City *" options={[{label: 'Noida', value: 'Noida'}, {label: 'Greater Noida', value: 'Greater Noida'}, {label: 'YEIDA', value: 'YEIDA'}]} value={formData.city} onChange={(v) => updateField('city', v)} error={errors.city} />
            <InputField label="Sector/Area *" value={formData.sector} onChange={(e) => updateField('sector', e.target.value)} error={errors.sector} />
            <InputField label="Society/Project (Optional)" value={formData.society} onChange={(e) => updateField('society', e.target.value)} />
          </div>
        </section>

        {/* SECTION 4: PROPERTY DETAILS */}
        <section className="form-section-container">
          <h2 className="form-section-heading">4. Property Details</h2>
          <div className="space-y-8">
            
            {/* Possession Status */}
            <div className="space-y-3">
              <label className="form-field-label">Possession Status</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Ready to move', 'Under construction', 'Possession soon'].map(status => (
                  <div key={status} onClick={() => updateField('possessionStatus', status)} className={`chip-base ${formData.possessionStatus === status ? 'chip-active' : 'chip-inactive'}`}>
                    <span>{status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ownership Type */}
            <div className="space-y-3">
              <label className="form-field-label">Ownership Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Lease Hold', 'Free Hold', 'Kisan Kota', 'Power of attorney'].map(type => (
                  <div key={type} onClick={() => updateField('ownershipType', type)} className={`chip-base ${formData.ownershipType === type ? 'chip-active' : 'chip-inactive'}`}>
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Furnishing */}
            <div className="space-y-3">
              <label className="form-field-label">Furnishing Status</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['Unfinished', 'Semi furnished', 'Full furnished'].map(type => (
                  <div key={type} onClick={() => handleFurnishingTypeClick(type)} className={`chip-base ${formData.furnishingType === type ? 'chip-active' : 'chip-inactive'}`}>
                    <span>{type}</span>
                  </div>
                ))}
              </div>
              {Object.keys(formData.furnishingItems).length > 0 && (
                <div className="mt-3 p-4 bg-secondary/20 rounded-xl border border-border">
                  <p className="text-sm font-bold mb-2">Selected Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(formData.furnishingItems).map(([item, qty]) => (
                      <span key={item} className="text-xs font-medium bg-background border border-border px-2 py-1 rounded-md">
                        {item} <span className="text-primary ml-1">x{qty}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="pt-4 border-t border-border">
              <label className="form-field-label mb-3">Required Amenities</label>
              <AmenitiesSelector value={formData.amenities} onChange={(v) => updateField('amenities', v)} />
            </div>
          </div>
        </section>

        {/* SECTION 5: BUDGET */}
        <section className="form-section-container">
          <h2 className="form-section-heading">5. Budget</h2>
          <div className="form-grid-2col">
            <div>
              <InputField label="Min Price (₹) *" type="number" value={formData.minPrice} onChange={(e) => updateField('minPrice', e.target.value)} error={errors.minPrice} />
              {formData.minPrice && <span className="text-sm font-medium text-muted-foreground mt-1.5 block">₹ {formatPriceInWords(formData.minPrice)}</span>}
            </div>
            <div>
              <InputField label="Max Price (₹) *" type="number" value={formData.maxPrice} onChange={(e) => updateField('maxPrice', e.target.value)} error={errors.maxPrice} />
              {formData.maxPrice && <span className="text-sm font-medium text-muted-foreground mt-1.5 block">₹ {formatPriceInWords(formData.maxPrice)}</span>}
            </div>
          </div>
          {formData.minPrice && formData.maxPrice && !errors.maxPrice && (
            <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20 text-primary font-semibold text-sm text-center">
              Budget Range: ₹ {formatPriceInWords(formData.minPrice)} - ₹ {formatPriceInWords(formData.maxPrice)}
            </div>
          )}
        </section>

        {/* SECTION 6: SPECIAL REQUIREMENTS */}
        <section className="form-section-container">
          <h2 className="form-section-heading">6. Special Requirements</h2>
          <Textarea 
            placeholder="Any specific requirements? (e.g., near metro, ground floor, park facing, etc.)" 
            className="min-h-[120px] rounded-xl bg-form-input-bg border-form-input-border"
            value={formData.specialRequirements}
            onChange={(e) => updateField('specialRequirements', e.target.value)}
            maxLength={500}
          />
          {phoneWarning && <p className="text-sm text-destructive mt-2 font-medium">Warning: Phone numbers are not allowed in this field and will be hidden.</p>}
          <p className="text-xs text-muted-foreground mt-2 text-right">{formData.specialRequirements.length}/500</p>
        </section>

        {/* SECTION 7: BUYER DETAILS */}
        <section className="form-section-container">
          <h2 className="form-section-heading">7. Buyer Details</h2>
          <div className="form-grid-2col">
            <InputField label="Full Name *" value={formData.buyerName} onChange={(e) => updateField('buyerName', e.target.value)} error={errors.buyerName} />
            <InputField label="Email Address *" type="email" value={formData.buyerEmail} onChange={(e) => updateField('buyerEmail', e.target.value)} error={errors.buyerEmail} />
            <InputField label="Mobile Number *" type="tel" value={formData.buyerPhone} onChange={(e) => updateField('buyerPhone', e.target.value)} error={errors.buyerPhone} placeholder="10-digit number" />
            <InputField label="Current Address (Optional)" value={formData.buyerAddress} onChange={(e) => updateField('buyerAddress', e.target.value)} />
          </div>
        </section>

        <div className="pt-4 pb-12 flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto md:min-w-[240px] h-14 text-base font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]">
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Posting...</> : 'Post Requirement'}
          </Button>
        </div>
      </form>

      {/* Furnishing Modal */}
      <Dialog open={isFurnishingModalOpen} onOpenChange={setIsFurnishingModalOpen}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Select Furnishing Items</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {FURNISHING_ITEMS_LIST.map(item => {
              const qty = formData.furnishingItems[item] || 0;
              const isActive = qty > 0;
              return (
                <div 
                  key={item}
                  onClick={() => qty === 0 && handleFurnishingItemChange(item, 1)}
                  className={`chip-base flex-col justify-center min-h-[4rem] transition-all ${isActive ? 'chip-active' : 'chip-inactive cursor-pointer'}`}
                >
                  <span className={`text-center ${isActive ? 'font-bold' : ''}`}>{item}</span>
                  {isActive && (
                    <div className="qty-counter-container mt-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleFurnishingItemChange(item, -1); }} className="qty-counter-btn"><Minus className="h-4 w-4" /></button>
                      <span className="qty-counter-value">{qty}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleFurnishingItemChange(item, 1); }} className="qty-counter-btn"><Plus className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsFurnishingModalOpen(false)} className="w-full sm:w-auto font-bold rounded-xl">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequirementForm;