import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatPriceInWords } from '@/lib/priceUtils.js';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const BuyerRequirementForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [phoneWarning, setPhoneWarning] = useState(false);

  const [formData, setFormData] = useState({
    city: '',
    propertyType: '',
    propertySubType: '',
    preferredBhk: '',
    minSize: '',
    maxSize: '',
    sizeUnit: 'Sq.ft',
    minBudget: '',
    maxBudget: '',
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
        newData.preferredBhk = '';
        newData.minSize = '';
        newData.maxSize = '';
      }

      if (field === 'specialRequirements') {
        const phoneRegex = /(\+91[-\s]?)?[0-9]{10}/;
        setPhoneWarning(phoneRegex.test(value));
      }

      return newData;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const isPlot = formData.propertyType === 'Plot/Land';
  const isCommercial = formData.propertyType === 'Commercial';
  const showSubType = isPlot || isCommercial;
  const showBhk = ['Flat/Apartment', 'House/Villa'].includes(formData.propertyType);
  const showSize = isPlot || isCommercial;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.propertyType) newErrors.propertyType = 'Property Type is required';
    if (!formData.maxBudget || isNaN(formData.maxBudget)) newErrors.maxBudget = 'Maximum Budget is required';
    if (formData.minBudget && Number(formData.minBudget) > Number(formData.maxBudget)) {
      newErrors.maxBudget = 'Max budget must be greater than Min budget';
    }
    
    if (!formData.buyerName.trim()) newErrors.buyerName = 'Name is required';
    if (!formData.buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
      newErrors.buyerEmail = 'Valid email is required';
    }
    if (!formData.buyerPhone || !/^\d{10}$/.test(formData.buyerPhone)) {
      newErrors.buyerPhone = 'Valid 10-digit phone number is required';
    }

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
      // Sanitize phone numbers from special requirements
      const sanitizedRequirements = formData.specialRequirements.replace(/(\+91[-\s]?)?[0-9]{10}/g, '**********');

      const payload = {
        city: formData.city,
        propertyType: formData.propertyType,
        propertySubType: formData.propertySubType,
        preferredBhk: formData.preferredBhk,
        minSize: formData.minSize ? Number(formData.minSize) : null,
        maxSize: formData.maxSize ? Number(formData.maxSize) : null,
        sizeUnit: formData.sizeUnit,
        minBudget: formData.minBudget ? Number(formData.minBudget) : null,
        maxBudget: Number(formData.maxBudget),
        specialRequirements: sanitizedRequirements,
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone,
        buyerAddress: formData.buyerAddress,
        status: 'active'
      };

      await pb.collection('buyer_requirements').create(payload, { $autoCancel: false });
      
      toast.success('Requirement posted successfully!');
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-card p-8 md:p-12 rounded-2xl border border-border shadow-sm text-center">
        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-secondary" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground mb-4">Requirement Received!</h2>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Thank you for sharing your requirements. Our team will match your criteria with our premium listings and contact you shortly.
        </p>
        <p className="text-sm text-muted-foreground">Redirecting to home page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      
      {/* SECTION 1: Property Preferences */}
      <section className="form-section-container">
        <h2 className="form-section-heading">1. Property Preferences</h2>
        <div className="form-grid-2col">
          <div>
            <label className="form-field-label">City *</label>
            <Select value={formData.city} onValueChange={(v) => updateField('city', v)}>
              <SelectTrigger className={cn("h-[44px] rounded-md", errors.city ? "border-destructive" : "border-input")}>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Noida">Noida</SelectItem>
                <SelectItem value="Greater Noida">Greater Noida</SelectItem>
                <SelectItem value="YEIDA">YEIDA</SelectItem>
              </SelectContent>
            </Select>
            {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="form-field-label">Property Type *</label>
            <Select value={formData.propertyType} onValueChange={(v) => updateField('propertyType', v)}>
              <SelectTrigger className={cn("h-[44px] rounded-md", errors.propertyType ? "border-destructive" : "border-input")}>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Flat/Apartment">Flat / Apartment</SelectItem>
                <SelectItem value="House/Villa">House / Villa</SelectItem>
                <SelectItem value="Plot/Land">Plot / Land</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
            {errors.propertyType && <p className="text-xs text-destructive mt-1">{errors.propertyType}</p>}
          </div>

          {showSubType && (
            <div className="md:col-span-2">
              <label className="form-field-label">Property Sub-Type</label>
              <Select value={formData.propertySubType} onValueChange={(v) => updateField('propertySubType', v)}>
                <SelectTrigger className="h-[44px] rounded-md border-input">
                  <SelectValue placeholder="Select Sub-Type" />
                </SelectTrigger>
                <SelectContent>
                  {isPlot ? (
                    <>
                      <SelectItem value="Residential Plot">Residential Plot</SelectItem>
                      <SelectItem value="Industrial Plot">Industrial Plot</SelectItem>
                      <SelectItem value="Agricultural Land">Agricultural Land</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Shop">Shop</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Store">Store</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: Size & BHK */}
      <section className="form-section-container">
        <h2 className="form-section-heading">2. Size & Configuration</h2>
        <div className="form-grid-2col">
          {showBhk && (
            <div>
              <label className="form-field-label">Preferred BHK</label>
              <Select value={formData.preferredBhk} onValueChange={(v) => updateField('preferredBhk', v)}>
                <SelectTrigger className="h-[44px] rounded-md border-input">
                  <SelectValue placeholder="Select BHK" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 BHK">1 BHK</SelectItem>
                  <SelectItem value="2 BHK">2 BHK</SelectItem>
                  <SelectItem value="3 BHK">3 BHK</SelectItem>
                  <SelectItem value="4 BHK">4 BHK</SelectItem>
                  <SelectItem value="5+ BHK">5+ BHK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showSize && (
            <div className="md:col-span-2">
              <label className="form-field-label">Preferred Size Range</label>
              <div className="flex gap-3">
                <Input 
                  type="number" 
                  placeholder="Min Size" 
                  className="h-[44px] rounded-md border-input w-1/3"
                  value={formData.minSize}
                  onChange={(e) => updateField('minSize', e.target.value)}
                />
                <Input 
                  type="number" 
                  placeholder="Max Size" 
                  className="h-[44px] rounded-md border-input w-1/3"
                  value={formData.maxSize}
                  onChange={(e) => updateField('maxSize', e.target.value)}
                />
                <Select value={formData.sizeUnit} onValueChange={(v) => updateField('sizeUnit', v)}>
                  <SelectTrigger className="h-[44px] rounded-md border-input w-1/3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sq.ft">Sq.ft</SelectItem>
                    <SelectItem value="Sq.yd">Sq.yd</SelectItem>
                    <SelectItem value="Sq.m">Sq.m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3: Budget */}
      <section className="form-section-container">
        <h2 className="form-section-heading">3. Budget</h2>
        <div className="form-grid-2col">
          <div>
            <label className="form-field-label">Minimum Budget (₹) Optional</label>
            <Input 
              type="number" 
              placeholder="e.g. 5000000" 
              className="h-[44px] rounded-md border-input"
              value={formData.minBudget}
              onChange={(e) => updateField('minBudget', e.target.value)}
            />
            {formData.minBudget && <span className="price-in-words">{formatPriceInWords(formData.minBudget)}</span>}
          </div>
          <div>
            <label className="form-field-label">Maximum Budget (₹) *</label>
            <Input 
              type="number" 
              placeholder="e.g. 15000000" 
              className={cn("h-[44px] rounded-md", errors.maxBudget ? "border-destructive" : "border-input")}
              value={formData.maxBudget}
              onChange={(e) => updateField('maxBudget', e.target.value)}
            />
            {errors.maxBudget && <p className="text-xs text-destructive mt-1">{errors.maxBudget}</p>}
            {formData.maxBudget && <span className="price-in-words">{formatPriceInWords(formData.maxBudget)}</span>}
          </div>
        </div>
      </section>

      {/* SECTION 4: Additional Notes */}
      <section className="form-section-container">
        <h2 className="form-section-heading">4. Additional Notes</h2>
        <div>
          <label className="form-field-label">Special Requirements</label>
          <Textarea 
            placeholder="Any specific requirements? (e.g., near metro, ground floor, park facing, etc.)" 
            className="min-h-[100px] rounded-md border-input resize-none"
            value={formData.specialRequirements}
            onChange={(e) => updateField('specialRequirements', e.target.value)}
            maxLength={500}
          />
          <div className="flex justify-between items-start mt-2">
            <div className="flex-1">
              {phoneWarning && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Please don't share phone numbers in this field.
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{formData.specialRequirements.length}/500</span>
          </div>
        </div>
      </section>

      {/* SECTION 5: Buyer Contact Details */}
      <section className="form-section-container">
        <h2 className="form-section-heading">5. Contact Details</h2>
        <div className="form-grid-2col">
          <div>
            <label className="form-field-label">Full Name *</label>
            <Input 
              value={formData.buyerName} 
              onChange={(e) => updateField('buyerName', e.target.value)} 
              className={cn("h-[44px] rounded-md", errors.buyerName ? "border-destructive" : "border-input")}
            />
            {errors.buyerName && <p className="text-xs text-destructive mt-1">{errors.buyerName}</p>}
          </div>
          
          <div>
            <label className="form-field-label">Email Address *</label>
            <Input 
              type="email"
              value={formData.buyerEmail} 
              onChange={(e) => updateField('buyerEmail', e.target.value)} 
              className={cn("h-[44px] rounded-md", errors.buyerEmail ? "border-destructive" : "border-input")}
            />
            {errors.buyerEmail && <p className="text-xs text-destructive mt-1">{errors.buyerEmail}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground">Mobile Number *</label>
              {currentUser?.phone && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is your registered WhatsApp number</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input 
              type="tel" 
              value={formData.buyerPhone} 
              onChange={(e) => updateField('buyerPhone', e.target.value)} 
              placeholder="10-digit number"
              readOnly={!!currentUser?.phone}
              className={cn(
                "h-[44px] rounded-md", 
                errors.buyerPhone ? "border-destructive" : "border-input",
                currentUser?.phone && "bg-muted opacity-80 cursor-not-allowed"
              )}
            />
            {errors.buyerPhone && <p className="text-xs text-destructive mt-1">{errors.buyerPhone}</p>}
          </div>

          <div>
            <label className="form-field-label">Current Address (Optional)</label>
            <Input 
              value={formData.buyerAddress} 
              onChange={(e) => updateField('buyerAddress', e.target.value)} 
              className="h-[44px] rounded-md border-input"
            />
          </div>
        </div>
      </section>

      <div className="pt-2 pb-8 flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full md:w-auto min-w-[200px] h-[48px] text-base font-bold rounded-md shadow-md transition-all active:scale-[0.98] bg-secondary hover:bg-secondary/90 text-white"
        >
          {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : 'Submit Requirement'}
        </Button>
      </div>
    </form>
  );
};

export default BuyerRequirementForm;