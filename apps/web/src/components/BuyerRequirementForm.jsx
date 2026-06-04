import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Info, AlertTriangle, MessageCircle, ShieldCheck } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { formatPriceInWords } from '@/lib/priceUtils.js';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ── Static sub-components defined OUTSIDE to prevent remount on every render ──

const Chip = ({ label, selected, onClick, danger }) => (
  <button type="button" onClick={onClick}
    className={cn(
      'px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150 cursor-pointer select-none',
      danger
        ? selected ? 'bg-red-50 border-red-400 text-red-600 font-semibold' : 'bg-white border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500'
        : selected ? 'bg-primary border-primary text-white font-semibold shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary'
    )}>
    {label}
  </button>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-7">
    <h2 className="text-xl font-bold text-foreground leading-tight">{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);

const FieldGroup = ({ label, hint, required, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-foreground mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && <span className="text-muted-foreground font-normal ml-1.5 text-xs">{hint}</span>}
    </label>
    {children}
    {error && <p className="text-xs text-destructive mt-1.5 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{error}</p>}
  </div>
);

const ChipRow = ({ label, hint, required, options, value, onChange, danger, multi, error }) => (
  <div>
    <p className="text-sm font-semibold text-foreground mb-3">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && <span className="text-muted-foreground font-normal ml-1.5 text-xs">{hint}</span>}
    </p>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <Chip key={opt} label={opt} danger={danger}
          selected={multi ? value.includes(opt) : value === opt}
          onClick={() => onChange(opt)} />
      ))}
    </div>
    {error && <p className="text-xs text-destructive mt-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{error}</p>}
  </div>
);

const BuyerRequirementForm = () => {
  const navigate = useNavigate();
  const { currentUser, handleWhatsAppLoginSuccess } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [phoneWarning, setPhoneWarning] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [verifiedToken, setVerifiedToken] = useState(null);

  const [formData, setFormData] = useState({
    city: '',
    areas: [],
    propertyType: '',
    propertySubType: '',
    preferredBhk: '',
    minSize: '',
    maxSize: '',
    sizeUnit: 'Sq.ft',
    minBudget: '',
    maxBudget: '',
    specialRequirements: '',
    dealBreakers: [],
    purposeOfBuying: [],
    buyingTimeline: '',
    needsHomeLoan: '',
    loanAmount: '',
    profession: '',
    nationality: '',
    countryOfResidence: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerAddress: '',
    buyerCity: ''
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
      
      if (field === 'city') newData.areas = [];
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

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  const fmtCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSendOtp = async () => {
    const phone = formData.buyerPhone.trim();
    if (!/^\d{10}$/.test(phone)) { toast.error('Enter a valid 10-digit number first'); return; }
    setOtpLoading(true);
    try {
      const res  = await apiServerClient.fetch('/whatsapp/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: phone }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) { setOtpSent(true); setOtpCountdown(300); setOtpValue(''); toast.success('OTP sent to WhatsApp'); }
      else toast.error(data.message || 'Failed to send OTP');
    } catch { toast.error('Failed to send OTP'); }
    finally { setOtpLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setOtpLoading(true);
    try {
      const res  = await apiServerClient.fetch('/whatsapp/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: formData.buyerPhone.trim(), userEnteredOtp: otpValue }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.token) {
        setOtpVerified(true);
        setVerifiedToken(data.token);
        // Auto-fill name from existing account if any
        if (data.user?.name && !formData.buyerName) updateField('buyerName', data.user.name);
        toast.success('Number verified! ✓');
      } else toast.error(data.message || 'Invalid OTP');
    } catch { toast.error('Verification failed'); }
    finally { setOtpLoading(false); }
  };

  const [areaInput, setAreaInput] = useState('');

  const addArea = (val) => {
    const v = val.trim();
    if (v && !formData.areas.includes(v)) updateField('areas', [...formData.areas, v]);
    setAreaInput('');
  };

  const handleAreaKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addArea(areaInput); }
    if ((e.key === ',' || e.key === ';') && areaInput.trim()) { e.preventDefault(); addArea(areaInput); }
  };

  const isPlot = formData.propertyType === 'Plot/Land';
  const isCommercial = formData.propertyType === 'Commercial';
  const showSubType = isPlot || isCommercial;
  const showBhk = ['Flat/Apartment', 'House/Villa', 'Penthouse', 'Farm House'].includes(formData.propertyType);
  const showSize = !!formData.propertyType; // show size for all property types

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.propertyType) newErrors.propertyType = 'Property Type is required';
    if (!formData.maxBudget || isNaN(formData.maxBudget)) newErrors.maxBudget = 'Maximum Budget is required';
    if (formData.minBudget && Number(formData.minBudget) > Number(formData.maxBudget)) {
      newErrors.maxBudget = 'Max budget must be greater than Min budget';
    }
    
    if (!formData.buyerName.trim()) newErrors.buyerName = 'Name is required';
    if (formData.buyerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
      newErrors.buyerEmail = 'Enter a valid email address';
    }
    if (!formData.buyerPhone || !/^\d{10}$/.test(formData.buyerPhone)) {
      newErrors.buyerPhone = 'Valid 10-digit phone number is required';
    }
    if (!currentUser && !otpVerified) {
      newErrors.buyerPhone = 'Please verify your number via WhatsApp OTP';
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
        areas: formData.areas,
        propertyType: formData.propertyType,
        propertySubType: formData.propertySubType,
        preferredBhk: formData.preferredBhk,
        minSize: formData.minSize ? Number(formData.minSize) : null,
        maxSize: formData.maxSize ? Number(formData.maxSize) : null,
        sizeUnit: formData.sizeUnit,
        minBudget: formData.minBudget ? Number(formData.minBudget) : null,
        maxBudget: Number(formData.maxBudget),
        specialRequirements: sanitizedRequirements,
        dealBreakers: formData.dealBreakers,
        purposeOfBuying: formData.purposeOfBuying,
        buyingTimeline: formData.buyingTimeline,
        needsHomeLoan: formData.needsHomeLoan,
        loanAmount: formData.needsHomeLoan === 'Yes' ? formData.loanAmount : '',
        profession: formData.profession,
        nationality: formData.nationality,
        countryOfResidence: formData.countryOfResidence,
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerPhone: formData.buyerPhone,
        buyerAddress: formData.buyerAddress,
        buyerCity: formData.buyerCity,
        status: 'active'
      };

      const res = await apiServerClient.fetch('/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Submission failed');

      // Auto-login with verified token and update profile
      if (verifiedToken && !currentUser) {
        try {
          await apiServerClient.fetch('/users/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${verifiedToken}` },
            body: JSON.stringify({ name: formData.buyerName, city: formData.city, ...(formData.buyerEmail ? { email: formData.buyerEmail } : {}) }),
          });
          handleWhatsAppLoginSuccess({ token: verifiedToken, user: { phone: formData.buyerPhone, name: formData.buyerName, city: formData.city, role: 'buyer' }, isProfileComplete: true });
        } catch { /* profile update is non-critical */ }
      }

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
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5">

      {/* ── SECTION 1: Property Preferences ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <SectionHeader step={1} icon="1" color="bg-blue-600" title="Property Preferences" subtitle="Tell us what kind of property you're looking for" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldGroup label="City" required error={errors.city}>
            <Select value={formData.city} onValueChange={(v) => updateField('city', v)}>
              <SelectTrigger className={cn("h-[46px] rounded-xl", errors.city ? "border-destructive" : "border-slate-200")}>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Noida">Noida</SelectItem>
                <SelectItem value="Greater Noida">Greater Noida</SelectItem>
                <SelectItem value="YEIDA">YEIDA</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Property Type" required error={errors.propertyType}>
            <Select value={formData.propertyType} onValueChange={(v) => updateField('propertyType', v)}>
              <SelectTrigger className={cn("h-[46px] rounded-xl", errors.propertyType ? "border-destructive" : "border-slate-200")}>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Flat/Apartment">Flat / Apartment</SelectItem>
                <SelectItem value="Studio">Studio</SelectItem>
                <SelectItem value="House/Villa">House / Villa</SelectItem>
                <SelectItem value="Penthouse">Penthouse</SelectItem>
                <SelectItem value="Farm House">Farm House</SelectItem>
                <SelectItem value="Plot/Land">Plot / Land</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          {/* Area tag-input — shown after city is selected */}
          {formData.city && (
            <div className="sm:col-span-2">
              <p className="text-sm font-semibold text-foreground mb-1.5">
                Sector / Village / Area
                <span className="text-muted-foreground font-normal text-xs ml-2">(Add multiple)</span>
              </p>
              <p className="text-xs text-muted-foreground mb-3">Type a sector or area name and press Enter to add</p>

              {/* Tag display */}
              {formData.areas.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.areas.map(area => (
                    <span key={area} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                      {area}
                      <button type="button" onClick={() => updateField('areas', formData.areas.filter(a => a !== area))}
                        className="text-primary/60 hover:text-primary leading-none text-base font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={areaInput}
                  onChange={e => setAreaInput(e.target.value)}
                  onKeyDown={handleAreaKeyDown}
                  placeholder={formData.city === 'Noida' ? 'e.g. Sector 150, Sector 62…' : formData.city === 'Greater Noida' ? 'e.g. Alpha 1, Phi 4, Omicron…' : 'e.g. Sector 5, Tappal…'}
                  className="flex-1 h-[44px] px-4 rounded-xl border border-slate-200 bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                />
                <button type="button" onClick={() => addArea(areaInput)} disabled={!areaInput.trim()}
                  className="h-[44px] px-4 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 shrink-0">
                  Add
                </button>
              </div>
            </div>
          )}

          {showSubType && (
            <div className="sm:col-span-2">
              <FieldGroup label="Property Sub-Type">
                <Select value={formData.propertySubType} onValueChange={(v) => updateField('propertySubType', v)}>
                  <SelectTrigger className="h-[46px] rounded-xl border-slate-200">
                    <SelectValue placeholder="Select Sub-Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {isPlot ? (<>
                      <SelectItem value="Residential Plot">Residential Plot</SelectItem>
                      <SelectItem value="Industrial Plot">Industrial Plot</SelectItem>
                      <SelectItem value="Agricultural Land">Agricultural Land</SelectItem>
                    </>) : (<>
                      <SelectItem value="Shop">Shop</SelectItem>
                      <SelectItem value="Office">Office</SelectItem>
                      <SelectItem value="Store">Store</SelectItem>
                    </>)}
                  </SelectContent>
                </Select>
              </FieldGroup>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 2: Size & Configuration ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <SectionHeader step={2} icon="2" color="bg-violet-500" title="Size & Configuration" subtitle="How big and how many rooms?" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {showBhk && (
            <FieldGroup label="Preferred BHK">
              <Select value={formData.preferredBhk} onValueChange={(v) => updateField('preferredBhk', v)}>
                <SelectTrigger className="h-[46px] rounded-xl border-slate-200">
                  <SelectValue placeholder="Select BHK" />
                </SelectTrigger>
                <SelectContent>
                  {['1 BHK','2 BHK','3 BHK','4 BHK','5+ BHK'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldGroup>
          )}
          {showSize && (
            <div className={showBhk ? '' : 'sm:col-span-2'}>
              <FieldGroup label="Area / Size Range">
                <div className="flex gap-2">
                  <Input type="number" placeholder="Min" className="h-[46px] rounded-xl border-slate-200 flex-1" value={formData.minSize} onChange={(e) => updateField('minSize', e.target.value)} />
                  <Input type="number" placeholder="Max" className="h-[46px] rounded-xl border-slate-200 flex-1" value={formData.maxSize} onChange={(e) => updateField('maxSize', e.target.value)} />
                  <Select value={formData.sizeUnit} onValueChange={(v) => updateField('sizeUnit', v)}>
                    <SelectTrigger className="h-[46px] rounded-xl border-slate-200 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sq.ft">Sq.ft</SelectItem>
                      <SelectItem value="Sq.yd">Sq.yd</SelectItem>
                      <SelectItem value="Sq.m">Sq.m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FieldGroup>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 3: Budget ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <SectionHeader step={3} icon="3" color="bg-emerald-600" title="Budget" subtitle="What's your price range?" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldGroup label="Minimum Budget" hint="(Optional)">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
              <Input type="number" placeholder="e.g. 5000000" className="h-[46px] rounded-xl border-slate-200 pl-7" value={formData.minBudget} onChange={(e) => updateField('minBudget', e.target.value)} />
            </div>
            {formData.minBudget && <p className="text-xs text-primary font-semibold mt-1">{formatPriceInWords(formData.minBudget)}</p>}
          </FieldGroup>
          <FieldGroup label="Maximum Budget" required error={errors.maxBudget}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
              <Input type="number" placeholder="e.g. 15000000" className={cn("h-[46px] rounded-xl pl-7", errors.maxBudget ? "border-destructive" : "border-slate-200")} value={formData.maxBudget} onChange={(e) => updateField('maxBudget', e.target.value)} />
            </div>
            {formData.maxBudget && <p className="text-xs text-primary font-semibold mt-1">{formatPriceInWords(formData.maxBudget)}</p>}
          </FieldGroup>
        </div>
      </div>

      {/* ── SECTION 4: Cannot Compromise On ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <SectionHeader step={4} icon="4" color="bg-red-500" title="Cannot Compromise On" subtitle="Select anything you absolutely won't accept — we'll filter it out" />
        <div className="flex flex-wrap gap-2">
          {['South Facing','West Facing','Ground Floor','Top Floor','No Lift','No Parking','Near Market (Noise/Traffic)','No Park/Garden Nearby','Shared Bathroom','Old Construction (10+ years)','Under Construction','No Power Backup','No Security/Guard','No Club House'].map(item => (
            <Chip key={item} label={item} danger selected={formData.dealBreakers.includes(item)}
              onClick={() => updateField('dealBreakers', formData.dealBreakers.includes(item)
                ? formData.dealBreakers.filter(d => d !== item)
                : [...formData.dealBreakers, item])} />
          ))}
        </div>
      </div>

      {/* ── SECTION 5: Buyer Profile ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 space-y-7">
        <SectionHeader step={5} icon="5" color="bg-amber-500" title="Buyer Profile" subtitle="Help us understand you better so we match the right properties" />

        <ChipRow label="Purpose of Buying?" hint="(Can select multiple)" options={['Living','Rental Income','Investment','All of the Above']}
          value={formData.purposeOfBuying} multi
          onChange={(opt) => {
            const sel = formData.purposeOfBuying;
            if (opt === 'All of the Above') { updateField('purposeOfBuying', sel.includes(opt) ? [] : ['Living','Rental Income','Investment','All of the Above']); }
            else { updateField('purposeOfBuying', sel.includes(opt) ? sel.filter(p => p !== opt && p !== 'All of the Above') : [...sel.filter(p => p !== 'All of the Above'), opt]); }
          }} />

        <div className="border-t border-slate-100 pt-6">
          <ChipRow label="When are you planning to buy?" options={['Immediately (0-1 month)','Soon (1-3 months)','Planning (3-6 months)','Exploring (6+ months)','Just Browsing']}
            value={formData.buyingTimeline} onChange={(opt) => updateField('buyingTimeline', formData.buyingTimeline === opt ? '' : opt)} />
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
          <ChipRow label="Do you need a Home Loan?" options={['Yes','No']} value={formData.needsHomeLoan}
            onChange={(opt) => { updateField('needsHomeLoan', formData.needsHomeLoan === opt ? '' : opt); if (opt === 'No') updateField('loanAmount', ''); }} />
          {formData.needsHomeLoan === 'Yes' && (
            <div className="pl-5 border-l-2 border-primary/30">
              <ChipRow label="How much loan do you need?" options={['Up to 50%','50% - 70%','70% - 80%','80%+ (Maximum)']}
                value={formData.loanAmount} onChange={(opt) => updateField('loanAmount', formData.loanAmount === opt ? '' : opt)} />
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-6">
          <ChipRow label="Your Profession?" options={['Salaried (Government)','Salaried (Private)','Self Employed / Business','Freelancer','Retired','Other']}
            value={formData.profession} onChange={(opt) => updateField('profession', formData.profession === opt ? '' : opt)} />
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
          <ChipRow label="Nationality?" options={['Indian (Resident)','NRI (Non-Resident Indian)','Foreign National']}
            value={formData.nationality}
            onChange={(opt) => { updateField('nationality', formData.nationality === opt ? '' : opt); updateField('countryOfResidence', ''); }} />
          {(formData.nationality === 'NRI (Non-Resident Indian)' || formData.nationality === 'Foreign National') && (
            <div className="pl-5 border-l-2 border-primary/30">
              <FieldGroup label={formData.nationality === 'NRI (Non-Resident Indian)' ? 'Which Country are you based in?' : 'Which Country?'}>
                <Input value={formData.countryOfResidence} onChange={e => updateField('countryOfResidence', e.target.value)}
                  placeholder="e.g. United States, UAE, Canada…" className="h-[46px] rounded-xl border-slate-200 max-w-xs" />
              </FieldGroup>
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION 6: Additional Notes ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <SectionHeader step={6} icon="6" color="bg-slate-600" title="Additional Notes" subtitle="Anything else we should know? Share freely." />
        <FieldGroup label="Special Requirements">
          <Textarea
            placeholder="e.g. Near metro, east facing, corner flat, school nearby, quick possession…"
            className="min-h-[110px] rounded-xl border-slate-200 resize-none"
            value={formData.specialRequirements}
            onChange={(e) => updateField('specialRequirements', e.target.value)}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            {phoneWarning
              ? <p className="text-xs text-destructive font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Don't share phone numbers here</p>
              : <span />}
            <span className="text-xs text-muted-foreground">{formData.specialRequirements.length}/500</span>
          </div>
        </FieldGroup>
      </div>

      {/* ── SECTION 7: Contact Details ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">
        <SectionHeader step={7} icon="7" color="bg-green-600" title="Contact Details" subtitle="Almost done! How should we reach you?" />
        <div className="flex flex-col gap-5">

          <FieldGroup label="Full Name" required error={errors.buyerName}>
            <Input value={formData.buyerName} onChange={(e) => updateField('buyerName', e.target.value)}
              className={cn("h-[46px] rounded-xl", errors.buyerName ? "border-destructive" : "border-slate-200")} placeholder="Your full name" />
          </FieldGroup>

          <FieldGroup label="Your City">
            <Input value={formData.buyerCity} onChange={(e) => updateField('buyerCity', e.target.value)}
              placeholder="e.g. Delhi, Mumbai, Lucknow…"
              className="h-[46px] rounded-xl border-slate-200" />
          </FieldGroup>

          {/* Mobile + OTP */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-1.5">Mobile Number <span className="text-red-500">*</span></p>
            {currentUser?.phone ? (
              <div className="flex items-center h-[46px] rounded-xl border border-emerald-300 bg-emerald-50 pr-2">
                <input value={formData.buyerPhone} readOnly className="flex-1 h-full px-3 bg-transparent text-sm outline-none" />
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span>
              </div>
            ) : otpVerified ? (
              <div className="space-y-1.5">
                <div className="flex items-center h-[46px] rounded-xl border border-emerald-300 bg-emerald-50 pr-2">
                  <input value={formData.buyerPhone} readOnly className="flex-1 h-full px-3 bg-transparent text-sm outline-none" />
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 shrink-0"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span>
                </div>
                <p className="text-xs text-slate-400">Verify number via WhatsApp OTP</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className={cn("flex items-center h-[46px] rounded-xl border bg-background pr-1.5", errors.buyerPhone ? "border-destructive" : "border-slate-200")}>
                  <input type="tel" value={formData.buyerPhone}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g,'').slice(0,10); updateField('buyerPhone', v); if (v.length < 10) { setOtpSent(false); setOtpValue(''); } }}
                    placeholder="10-digit WhatsApp number" disabled={otpSent}
                    className="flex-1 h-full px-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
                  {formData.buyerPhone.length === 10 && !otpSent && (
                    <button type="button" onClick={handleSendOtp} disabled={otpLoading}
                      className="h-[34px] px-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-bold shrink-0 transition-colors disabled:opacity-60">
                      {otpLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Verify'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400">Verify number via WhatsApp OTP</p>
                {otpSent && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 pt-1">
                    <div className="flex gap-2">
                      <Input type="text" inputMode="numeric" value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g,'').slice(0,6))}
                        placeholder="Enter 6-digit OTP" autoFocus
                        className="h-[46px] rounded-xl border-slate-200 flex-1 tracking-[0.3em] text-center text-lg font-mono" />
                      <Button type="button" onClick={handleVerifyOtp} disabled={otpValue.length !== 6 || otpLoading}
                        className="h-[46px] px-5 rounded-xl font-bold text-sm shrink-0">
                        {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit OTP'}
                      </Button>
                    </div>
                    {otpCountdown > 0
                      ? <p className="text-xs text-muted-foreground">Expires in {fmtCountdown(otpCountdown)}</p>
                      : <button type="button" onClick={handleSendOtp} className="text-xs text-[#25D366] font-medium hover:underline">Resend OTP</button>}
                  </div>
                )}
                {errors.buyerPhone && <p className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.buyerPhone}</p>}
              </div>
            )}
          </div>

          <FieldGroup label="Email Address" hint="(Optional)" error={errors.buyerEmail}>
            <Input type="email" value={formData.buyerEmail} onChange={(e) => updateField('buyerEmail', e.target.value)}
              placeholder="your@email.com" className={cn("h-[46px] rounded-xl", errors.buyerEmail ? "border-destructive" : "border-slate-200")} />
          </FieldGroup>

          <FieldGroup label="Current Address" hint="(Optional)">
            <Input value={formData.buyerAddress} onChange={(e) => updateField('buyerAddress', e.target.value)}
              placeholder="Your current locality or area" className="h-[46px] rounded-xl border-slate-200" />
          </FieldGroup>
        </div>
      </div>

      <div className="pb-10">
        <Button type="submit" disabled={isSubmitting}
          className="w-full h-[52px] text-base font-bold rounded-xl shadow-md transition-all active:scale-[0.98] bg-secondary hover:bg-secondary/90 text-white">
          {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting…</> : 'Submit Requirement'}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">Your information is private and shared only with Growperty team</p>
      </div>
    </form>
  );
};

export default BuyerRequirementForm;