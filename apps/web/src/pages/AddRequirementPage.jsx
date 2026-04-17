
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Shield, Gift, MessageCircle, Home, Loader2, Info } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const PROPERTY_TYPES = [
  'Flat/Apartment', 'Independent House', 'Villa', 'Farm House', 
  'Penthouse', 'Studio', 'Plot/Land', 'Commercial'
];

const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
const CITIES = ['Greater Noida', 'Noida', 'YEIDA/Yamuna Expressway'];
const TIMELINES = ['Immediately', 'Within 1 Month', 'Within 3 Months', 'Within 6 Months', 'Just Exploring'];

const AddRequirementPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    propertyType: '',
    bhk: '',
    category: 'Any',
    city: '',
    sector: '',
    minBudget: '',
    maxBudget: '',
    negotiable: 'Yes',
    timeline: '',
    name: '',
    email: '',
    mobile: '',
    sameAsMobile: true,
    whatsapp: '',
    notes: ''
  });

  const showBhk = ['Flat/Apartment', 'Penthouse', 'Studio'].includes(formData.propertyType);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.propertyType) newErrors.propertyType = 'Property Type is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    
    // DB requires email, so we validate it
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Mobile must be exactly 10 digits';
    }

    if (!formData.sameAsMobile && formData.whatsapp) {
      if (!/^\d{10}$/.test(formData.whatsapp.replace(/\D/g, ''))) {
        newErrors.whatsapp = 'WhatsApp must be exactly 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      // Scroll to first error
      const firstErrorElement = document.querySelector('.text-destructive');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanMobile = formData.mobile.replace(/\D/g, '');
      const cleanWhatsapp = formData.sameAsMobile ? cleanMobile : formData.whatsapp.replace(/\D/g, '');
      
      const payload = {
        propertyType: formData.propertyType,
        preferredBhk: showBhk ? formData.bhk : '',
        propertySubType: formData.category,
        city: formData.city,
        buyerAddress: formData.sector,
        minBudget: Number(formData.minBudget) || 0,
        maxBudget: Number(formData.maxBudget) || 0, // Required in DB schema
        buyerName: formData.name,
        buyerEmail: formData.email,
        buyerPhone: cleanMobile,
        specialRequirements: `Timeline: ${formData.timeline || 'Not specified'} | Negotiable: ${formData.negotiable} | WhatsApp: ${cleanWhatsapp} | Notes: ${formData.notes}`,
        status: 'active',
        matched: false
      };

      await pb.collection('buyer_requirements').create(payload, { $autoCancel: false });
      
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit requirement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Tell Us What You're Looking For | Growperty.com</title>
        <meta name="description" content="Share your property requirement and our dedicated team will find the best matching properties for you in Noida, Greater Noida, and YEIDA." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-grow">
          {/* HERO SECTION */}
          <section className="relative pt-20 pb-24 overflow-hidden bg-brand-blue dark:bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-slate-900 to-slate-950 opacity-95 z-0" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] opacity-10 mix-blend-overlay z-0 bg-cover bg-center" />
            
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500 border border-emerald-400 text-white text-sm font-bold tracking-widest uppercase mb-8 shadow-lg shadow-emerald-500/20">
                  <Gift className="w-4 h-4 mr-2" />
                  Free Service
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight text-balance leading-tight">
                  Tell Us What You're Looking For
                </h1>
                <p className="text-lg md:text-xl text-blue-100 dark:text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto text-balance">
                  Share your requirement and our expert team will find the best matching properties exclusively for you.
                </p>
              </motion.div>
            </div>
          </section>

          <section className="py-12 md:py-20 -mt-8 relative z-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  /* SUCCESS STATE */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-10 md:p-16 shadow-2xl border border-slate-100 dark:border-slate-800 text-center"
                  >
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                      Thank you! Your requirement has been received.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto font-medium">
                      Our expert team will carefully review your preferences and call or WhatsApp you within 24 hours with the best matching properties.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <Button 
                        asChild 
                        size="lg" 
                        className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20"
                      >
                        <a href="https://wa.me/919953537876" target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="mr-2 h-5 w-5" />
                          Chat with us now
                        </a>
                      </Button>
                      <Button 
                        asChild 
                        variant="outline"
                        size="lg" 
                        className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5 rounded-xl dark:border-brand-blue-foreground dark:text-brand-blue-foreground"
                      >
                        <Link to="/properties">
                          <Home className="mr-2 h-5 w-5" />
                          Browse Properties
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  /* FORM STATE */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="mb-10 text-center">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue dark:text-white">Your Property Requirement</h2>
                      <div className="w-16 h-1.5 bg-emerald-500 mx-auto mt-4 rounded-full" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                      
                      {/* SECTION 1 - PROPERTY PREFERENCE */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-blue-foreground/10 text-brand-blue dark:text-brand-blue-foreground flex items-center justify-center font-bold text-sm">1</div>
                          <h3 className="text-lg font-bold text-foreground">Property Preference</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="propertyType" className="text-foreground font-semibold">Property Type <span className="text-destructive">*</span></Label>
                            <Select 
                              value={formData.propertyType} 
                              onValueChange={(val) => handleInputChange('propertyType', val)}
                            >
                              <SelectTrigger className={`h-12 rounded-xl ${errors.propertyType ? 'border-destructive ring-destructive' : ''}`}>
                                <SelectValue placeholder="Select Property Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {PROPERTY_TYPES.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.propertyType && <p className="text-xs text-destructive font-medium mt-1">{errors.propertyType}</p>}
                          </div>

                          {showBhk && (
                            <div className="space-y-2">
                              <Label htmlFor="bhk" className="text-foreground font-semibold">BHK Configuration</Label>
                              <Select 
                                value={formData.bhk} 
                                onValueChange={(val) => handleInputChange('bhk', val)}
                              >
                                <SelectTrigger className="h-12 rounded-xl">
                                  <SelectValue placeholder="Select BHK" />
                                </SelectTrigger>
                                <SelectContent>
                                  {BHK_OPTIONS.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="space-y-3 md:col-span-full">
                            <Label className="text-foreground font-semibold">Property Category</Label>
                            <RadioGroup 
                              value={formData.category}
                              onValueChange={(val) => handleInputChange('category', val)}
                              className="flex flex-wrap gap-4"
                            >
                              {['Resale', 'Fresh Sale', 'Any'].map((cat) => (
                                <div key={cat} className="flex items-center space-x-2 bg-muted/50 px-4 py-3 rounded-xl border border-border/50 hover:border-border transition-colors cursor-pointer" onClick={() => handleInputChange('category', cat)}>
                                  <RadioGroupItem value={cat} id={`cat-${cat}`} />
                                  <Label htmlFor={`cat-${cat}`} className="cursor-pointer font-medium">{cat}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2 - LOCATION PREFERENCE */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-blue-foreground/10 text-brand-blue dark:text-brand-blue-foreground flex items-center justify-center font-bold text-sm">2</div>
                          <h3 className="text-lg font-bold text-foreground">Location Preference</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-foreground font-semibold">City <span className="text-destructive">*</span></Label>
                            <Select 
                              value={formData.city} 
                              onValueChange={(val) => handleInputChange('city', val)}
                            >
                              <SelectTrigger className={`h-12 rounded-xl ${errors.city ? 'border-destructive ring-destructive' : ''}`}>
                                <SelectValue placeholder="Select City" />
                              </SelectTrigger>
                              <SelectContent>
                                {CITIES.map(city => (
                                  <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.city && <p className="text-xs text-destructive font-medium mt-1">{errors.city}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sector" className="text-foreground font-semibold">Preferred Sector / Area <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                            <Input 
                              id="sector" 
                              placeholder="e.g., Sector 150, Noida Extension" 
                              className="h-12 rounded-xl text-foreground bg-background"
                              value={formData.sector}
                              onChange={(e) => handleInputChange('sector', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3 - BUDGET */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-blue-foreground/10 text-brand-blue dark:text-brand-blue-foreground flex items-center justify-center font-bold text-sm">3</div>
                          <h3 className="text-lg font-bold text-foreground">Budget & Timeline</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="minBudget" className="text-foreground font-semibold">Min Budget (₹) <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                            <Input 
                              id="minBudget" 
                              type="number"
                              placeholder="e.g., 2000000" 
                              className="h-12 rounded-xl text-foreground bg-background"
                              value={formData.minBudget}
                              onChange={(e) => handleInputChange('minBudget', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="maxBudget" className="text-foreground font-semibold">Max Budget (₹) <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                            <Input 
                              id="maxBudget" 
                              type="number"
                              placeholder="e.g., 5000000" 
                              className="h-12 rounded-xl text-foreground bg-background"
                              value={formData.maxBudget}
                              onChange={(e) => handleInputChange('maxBudget', e.target.value)}
                            />
                          </div>

                          <div className="space-y-3">
                            <Label className="text-foreground font-semibold">Is Budget Negotiable?</Label>
                            <RadioGroup 
                              value={formData.negotiable}
                              onValueChange={(val) => handleInputChange('negotiable', val)}
                              className="flex gap-4"
                            >
                              {['Yes', 'No'].map((opt) => (
                                <div key={opt} className="flex items-center space-x-2">
                                  <RadioGroupItem value={opt} id={`neg-${opt}`} />
                                  <Label htmlFor={`neg-${opt}`} className="cursor-pointer font-medium">{opt}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="timeline" className="text-foreground font-semibold">When do you want to buy?</Label>
                            <Select 
                              value={formData.timeline} 
                              onValueChange={(val) => handleInputChange('timeline', val)}
                            >
                              <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue placeholder="Select Timeline" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIMELINES.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 4 - CONTACT DETAILS */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-blue-foreground/10 text-brand-blue dark:text-brand-blue-foreground flex items-center justify-center font-bold text-sm">4</div>
                          <h3 className="text-lg font-bold text-foreground">Contact Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground font-semibold">Full Name <span className="text-destructive">*</span></Label>
                            <Input 
                              id="name" 
                              placeholder="e.g., Rajesh Kumar" 
                              className={`h-12 rounded-xl text-foreground bg-background ${errors.name ? 'border-destructive ring-destructive' : ''}`}
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                            />
                            {errors.name && <p className="text-xs text-destructive font-medium mt-1">{errors.name}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground font-semibold">Email Address <span className="text-destructive">*</span></Label>
                            <Input 
                              id="email" 
                              type="email"
                              placeholder="e.g., user@example.com" 
                              className={`h-12 rounded-xl text-foreground bg-background ${errors.email ? 'border-destructive ring-destructive' : ''}`}
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                            {errors.email && <p className="text-xs text-destructive font-medium mt-1">{errors.email}</p>}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="mobile" className="text-foreground font-semibold">Mobile Number <span className="text-destructive">*</span></Label>
                            <div className="flex">
                              <div className="flex items-center justify-center bg-muted border border-r-0 border-input rounded-l-xl px-4 text-muted-foreground font-medium">
                                +91
                              </div>
                              <Input 
                                id="mobile" 
                                type="tel"
                                placeholder="9876543210" 
                                maxLength={10}
                                className={`h-12 rounded-l-none rounded-r-xl text-foreground bg-background ${errors.mobile ? 'border-destructive ring-destructive z-10' : ''}`}
                                value={formData.mobile}
                                onChange={(e) => handleInputChange('mobile', e.target.value)}
                              />
                            </div>
                            {errors.mobile && <p className="text-xs text-destructive font-medium mt-1">{errors.mobile}</p>}
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center space-x-2 mt-10">
                              <Checkbox 
                                id="sameAsMobile" 
                                checked={formData.sameAsMobile}
                                onCheckedChange={(checked) => handleInputChange('sameAsMobile', checked)}
                              />
                              <Label htmlFor="sameAsMobile" className="cursor-pointer font-medium">WhatsApp is same as mobile number</Label>
                            </div>
                          </div>

                          {!formData.sameAsMobile && (
                            <div className="space-y-2 md:col-start-2">
                              <Label htmlFor="whatsapp" className="text-foreground font-semibold">WhatsApp Number</Label>
                              <div className="flex">
                                <div className="flex items-center justify-center bg-muted border border-r-0 border-input rounded-l-xl px-4 text-muted-foreground font-medium">
                                  +91
                                </div>
                                <Input 
                                  id="whatsapp" 
                                  type="tel"
                                  placeholder="9876543210" 
                                  maxLength={10}
                                  className={`h-12 rounded-l-none rounded-r-xl text-foreground bg-background ${errors.whatsapp ? 'border-destructive ring-destructive z-10' : ''}`}
                                  value={formData.whatsapp}
                                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                                />
                              </div>
                              {errors.whatsapp && <p className="text-xs text-destructive font-medium mt-1">{errors.whatsapp}</p>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SECTION 5 - ADDITIONAL NOTE */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-blue-foreground/10 text-brand-blue dark:text-brand-blue-foreground flex items-center justify-center font-bold text-sm">5</div>
                          <h3 className="text-lg font-bold text-foreground">Additional Note</h3>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes" className="text-foreground font-semibold">Any specific requirements? <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                          <Textarea 
                            id="notes" 
                            placeholder="E.g. Ground floor preferred, near school, corner property, north-east facing..." 
                            className="min-h-[120px] rounded-xl resize-none text-foreground bg-background"
                            maxLength={300}
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                          />
                          <div className="text-right text-xs text-muted-foreground font-medium mt-1">
                            {formData.notes.length}/300
                          </div>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-xl flex items-start gap-3 mt-4 border border-border/50">
                          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground font-medium">
                            Your contact details are safe with Growperty. We verify your requirement and match it with genuine sellers. We will never share your number publicly.
                          </p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border">
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full md:w-auto md:min-w-[280px] h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                        >
                          {isSubmitting ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                          ) : (
                            'Submit My Requirement'
                          )}
                        </Button>
                        <p className="text-sm text-muted-foreground font-medium mt-4 text-center md:text-left">
                          Our team will contact you within 24 hours on WhatsApp or call.
                        </p>
                      </div>

                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* TRUST SECTION */}
          <section className="py-20 bg-white dark:bg-slate-950 border-y border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  Why Choose Growperty?
                </h2>
                <div className="w-16 h-1.5 bg-emerald-500 mx-auto mt-4 rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform duration-300 text-center flex flex-col items-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-6">
                    <Gift className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Free Service</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    No hidden charges or premium fees for buyers. Finding your dream home with us is completely free.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform duration-300 text-center flex flex-col items-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Verified Listings</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    We physically verify all properties and sellers to ensure you only deal with genuine real estate opportunities.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform duration-300 text-center flex flex-col items-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-6">
                    <Shield className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Managed Process</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    From shortlisting and site visits to negotiation and paperwork, Growperty handles everything for you seamlessly.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT INFO SECTION */}
          <section className="py-16 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Need immediate help?</h2>
              <p className="text-lg font-medium text-muted-foreground flex items-center justify-center gap-2">
                Call or WhatsApp: 
                <a href="tel:+919891117876" className="text-emerald-600 dark:text-emerald-500 hover:underline font-bold">
                  +91 9891117876
                </a>
              </p>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default AddRequirementPage;
