
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, Loader2, UploadCloud, X, ArrowRight, Building2, ExternalLink } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Badge } from '@/components/ui/badge.jsx';

const PROPERTY_TYPES = [
  'Flat/Apartment', 'Independent House/Villa', 'Penthouse', 
  'Studio', 'Plot/Land', 'Shop', 'Office', 'Others'
];

const CONFIGURATIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

const PAYMENT_PLANS = [
  'Construction Linked Plan', 'Down Payment Plan', 'Possession Linked Plan', 'Bank Loan Available'
];

const AREA_TYPES = ['Carpet Area', 'Built-up Area', 'Super Built-up Area'];

const AMENITIES_CATEGORIES = [
  {
    name: 'LIFESTYLE & RECREATION',
    items: ['Clubhouse', 'Swimming Pool', 'Gymnasium', 'Jogging Track', 'Kids Play Area', 'Sports Court', 'Park/Garden']
  },
  {
    name: 'SECURITY & SAFETY',
    items: ['24/7 Security Guards', 'CCTV Surveillance', 'Gated Entry', 'Intercom', 'Fire Fighting System']
  },
  {
    name: 'INFRASTRUCTURE',
    items: ['Power Backup', 'Lifts', '24/7 Water Supply', 'EV Charging Points', 'Piped Gas (IGL)', 'Rainwater Harvesting']
  },
  {
    name: 'CONVENIENCE',
    items: ['Visitor Parking', 'Maintenance Staff', 'Internal Shopping Complex', 'Wide Internal Roads', 'Play School']
  },
  {
    name: 'NEARBY FACILITIES',
    items: ['Metro', 'Hospital', 'School', 'Mall', 'Highway', 'Airport']
  }
];

const ProjectListingForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [antiBypassWarning, setAntiBypassWarning] = useState(false);

  const [formData, setFormData] = useState({
    projectName: '',
    builderName: '',
    projectType: '',
    propertyTypes: [],
    configurationAvailable: [],
    totalUnits: '',
    totalTowers: '',
    totalFloors: '',
    
    minPrice: '',
    maxPrice: '',
    pricePerSqft: '',
    paymentPlans: [],
    
    projectStatus: '',
    launchYear: '',
    expectedPossession: '',
    reraNumber: '',
    reraApplied: false,
    
    city: '',
    sector: '',
    landmark: '',
    projectAddress: '',
    
    minArea: '',
    maxArea: '',
    areaUnit: 'Sq.ft',
    areaTypes: [],
    
    amenities: [],
    
    contactPersonName: '',
    designation: '',
    mobileNumber: '',
    email: '',
    companyWebsite: '',
    officeAddress: '',
    
    projectUSP: '',
    specialOffers: '',
    
    confirmationCheckbox1: false,
    confirmationCheckbox2: false
  });

  const [files, setFiles] = useState({
    projectImages: [],
    brochure: null,
    projectVideo: null,
    floorPlans: []
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleMultiSelect = (field, item, checked) => {
    setFormData(prev => {
      const array = prev[field] || [];
      return { ...prev, [field]: checked ? [...array, item] : array.filter(i => i !== item) };
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const checkAntiBypass = (text) => {
    const phoneRegex = /\b\d{10}\b/;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const keywordsRegex = /call me|whatsapp|contact me|reach out/i;
    return phoneRegex.test(text) || emailRegex.test(text) || keywordsRegex.test(text);
  };

  const handleTextareaChange = (field, value) => {
    handleInputChange(field, value);
    if (field === 'projectUSP' || field === 'specialOffers') {
      const hasViolation = checkAntiBypass(value);
      setAntiBypassWarning(hasViolation);
    }
  };

  const handleFileChange = (field, e, maxCount, maxSizeMB) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check sizes
    const oversized = selectedFiles.some(f => f.size > maxSizeMB * 1024 * 1024);
    if (oversized) {
      toast.error(`One or more files exceed the ${maxSizeMB}MB limit.`);
      return;
    }

    if (field === 'projectImages' || field === 'floorPlans') {
      setFiles(prev => {
        const newTotal = prev[field].length + selectedFiles.length;
        if (newTotal > maxCount) {
          toast.error(`You can only upload up to ${maxCount} files for this section.`);
          return prev;
        }
        return { ...prev, [field]: [...prev[field], ...selectedFiles] };
      });
    } else {
      setFiles(prev => ({ ...prev, [field]: selectedFiles[0] }));
    }
  };

  const removeFile = (field, index = null) => {
    if (index !== null) {
      setFiles(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      setFiles(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Section 1
    if (!formData.projectName.trim()) newErrors.projectName = 'Project Name is required';
    if (!formData.builderName.trim()) newErrors.builderName = 'Builder Name is required';
    if (!formData.projectType) newErrors.projectType = 'Project Type is required';
    if (formData.propertyTypes.length === 0) newErrors.propertyTypes = 'Select at least one property type';
    
    if (['Residential', 'Mixed Use'].includes(formData.projectType) && formData.configurationAvailable.length === 0) {
      newErrors.configurationAvailable = 'Select at least one configuration';
    }

    // Section 2
    if (!formData.minPrice) newErrors.minPrice = 'Min Price is required';
    if (!formData.maxPrice) newErrors.maxPrice = 'Max Price is required';
    if (formData.minPrice && formData.maxPrice && Number(formData.minPrice) > Number(formData.maxPrice)) {
      newErrors.maxPrice = 'Max Price must be greater than or equal to Min Price';
    }

    // Section 3
    if (!formData.projectStatus) newErrors.projectStatus = 'Project Status is required';
    if (!formData.launchYear) newErrors.launchYear = 'Launch Year is required';
    if (['Under Construction', 'Partially Ready'].includes(formData.projectStatus) && !formData.expectedPossession) {
      newErrors.expectedPossession = 'Expected Possession is required';
    }

    // Section 4
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.sector.trim()) newErrors.sector = 'Sector/Area is required';

    // Section 8
    if (!formData.contactPersonName.trim()) newErrors.contactPersonName = 'Contact Person Name is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Mobile must be exactly 10 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors in the form.');
      const firstError = document.querySelector('.border-destructive');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    
    if (antiBypassWarning) {
      toast.error('Please remove phone numbers or contact details from description fields.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      
      // Append text fields
      formPayload.append('projectName', formData.projectName);
      formPayload.append('builderName', formData.builderName);
      formPayload.append('projectType', formData.projectType);
      formPayload.append('projectStatus', formData.projectStatus);
      formPayload.append('launchYear', formData.launchYear);
      formPayload.append('expectedPossession', formData.expectedPossession);
      formPayload.append('reraNumber', formData.reraNumber);
      formPayload.append('reraApplied', formData.reraApplied);
      formPayload.append('city', formData.city);
      formPayload.append('sector', formData.sector);
      formPayload.append('landmark', formData.landmark);
      formPayload.append('projectAddress', formData.projectAddress);
      formPayload.append('areaUnit', formData.areaUnit);
      formPayload.append('contactPersonName', formData.contactPersonName);
      formPayload.append('designation', formData.designation);
      formPayload.append('mobileNumber', formData.mobileNumber);
      formPayload.append('email', formData.email);
      formPayload.append('companyWebsite', formData.companyWebsite);
      formPayload.append('officeAddress', formData.officeAddress);
      formPayload.append('projectUSP', formData.projectUSP);
      formPayload.append('specialOffers', formData.specialOffers);
      formPayload.append('confirmationCheckbox1', formData.confirmationCheckbox1);
      formPayload.append('confirmationCheckbox2', formData.confirmationCheckbox2);
      
      // Default hidden fields to bypass schema limits if any (though schema says optional)
      formPayload.append('status', 'pending');

      // Append numeric fields
      if (formData.totalUnits) formPayload.append('totalUnits', formData.totalUnits);
      if (formData.totalTowers) formPayload.append('totalTowers', formData.totalTowers);
      if (formData.totalFloors) formPayload.append('totalFloors', formData.totalFloors);
      formPayload.append('minPrice', formData.minPrice);
      formPayload.append('maxPrice', formData.maxPrice);
      if (formData.pricePerSqft) formPayload.append('pricePerSqft', formData.pricePerSqft);
      if (formData.minArea) formPayload.append('minArea', formData.minArea);
      if (formData.maxArea) formPayload.append('maxArea', formData.maxArea);

      // Append JSON fields
      formPayload.append('propertyTypes', JSON.stringify(formData.propertyTypes));
      formPayload.append('configurationAvailable', JSON.stringify(formData.configurationAvailable));
      formPayload.append('paymentPlans', JSON.stringify(formData.paymentPlans));
      formPayload.append('areaTypes', JSON.stringify(formData.areaTypes));
      formPayload.append('amenities', JSON.stringify(formData.amenities));

      // Append files
      files.projectImages.forEach(file => formPayload.append('projectImages', file));
      files.floorPlans.forEach(file => formPayload.append('floorPlans', file));
      if (files.brochure) formPayload.append('brochure', files.brochure);
      if (files.projectVideo) formPayload.append('projectVideo', files.projectVideo);

      await pb.collection('projects').create(formPayload, { $autoCancel: false });
      
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error(error?.response?.message || 'Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = 
    !formData.confirmationCheckbox1 || 
    !formData.confirmationCheckbox2 || 
    isSubmitting;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center py-20 px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 md:p-12 text-center max-w-2xl w-full border border-border/50"
          >
            <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-brand-green" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary dark:text-white mb-4">Thank you! Your project has been received.</h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed font-medium">
              Our team will review the details and contact you within 24 hours to activate your listing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="h-14 px-8 text-base font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-lg">
                <a href="https://wa.me/919953537876" target="_blank" rel="noopener noreferrer">
                  Chat with Growperty Team
                </a>
              </Button>
              <Button onClick={() => navigate('/projects')} variant="outline" className="h-14 px-8 text-base font-bold rounded-xl border-2">
                <Building2 className="w-5 h-5 mr-2" /> View All Projects
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>List Your Project - Growperty</title>
        <meta name="description" content="List your residential or commercial project on Growperty and reach verified buyers." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-grow py-12 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            
            <div className="mb-10 text-center">
              <Badge className="bg-brand-blue hover:bg-brand-blue text-white px-4 py-1.5 text-xs font-bold tracking-widest mb-4 shadow-sm border-none">
                FOR BUILDERS & DEVELOPERS ONLY
              </Badge>
              <h1 className="text-3xl md:text-5xl font-extrabold text-primary dark:text-white mb-4 tracking-tight">List Your Project</h1>
              <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
                Share your project details and reach genuine buyers across Greater Noida, Noida, and YEIDA.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECTION 1 - PROJECT BASIC DETAILS */}
              <div className="form-section-container">
                <h2 className="form-section-heading">1. Project Basic Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="form-label">Project Name <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="Enter project name" 
                      className={`form-input ${errors.projectName ? 'border-destructive ring-destructive' : ''}`}
                      value={formData.projectName}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                    />
                    {errors.projectName && <p className="text-xs text-destructive mt-1 font-medium">{errors.projectName}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Builder/Developer Name <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="e.g. ABC Developers" 
                      className={`form-input ${errors.builderName ? 'border-destructive ring-destructive' : ''}`}
                      value={formData.builderName}
                      onChange={(e) => handleInputChange('builderName', e.target.value)}
                    />
                    {errors.builderName && <p className="text-xs text-destructive mt-1 font-medium">{errors.builderName}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label className="form-label">Project Type <span className="text-destructive">*</span></Label>
                    <RadioGroup 
                      value={formData.projectType} 
                      onValueChange={(val) => handleInputChange('projectType', val)}
                      className="flex flex-wrap gap-4 mt-2"
                    >
                      {['Residential', 'Commercial', 'Mixed Use'].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <RadioGroupItem value={type} id={`ptype-${type}`} />
                          <Label htmlFor={`ptype-${type}`} className="cursor-pointer">{type}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors.projectType && <p className="text-xs text-destructive mt-1 font-medium">{errors.projectType}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label className="form-label">Property Types <span className="text-destructive">*</span></Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                      {PROPERTY_TYPES.map(type => (
                        <div key={type} className="flex items-start space-x-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-border/50">
                          <Checkbox 
                            id={`prop-${type}`} 
                            checked={formData.propertyTypes.includes(type)}
                            onCheckedChange={(checked) => handleMultiSelect('propertyTypes', type, checked)}
                            className="mt-0.5"
                          />
                          <Label htmlFor={`prop-${type}`} className="cursor-pointer text-sm font-medium leading-tight">{type}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.propertyTypes && <p className="text-xs text-destructive mt-1 font-medium">{errors.propertyTypes}</p>}
                  </div>

                  {['Residential', 'Mixed Use'].includes(formData.projectType) && (
                    <div className="md:col-span-2">
                      <Label className="form-label">Configuration Available <span className="text-destructive">*</span></Label>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {CONFIGURATIONS.map(config => (
                          <div key={config} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-lg border border-border/50">
                            <Checkbox 
                              id={`config-${config}`} 
                              checked={formData.configurationAvailable.includes(config)}
                              onCheckedChange={(checked) => handleMultiSelect('configurationAvailable', config, checked)}
                            />
                            <Label htmlFor={`config-${config}`} className="cursor-pointer text-sm font-medium">{config}</Label>
                          </div>
                        ))}
                      </div>
                      {errors.configurationAvailable && <p className="text-xs text-destructive mt-1 font-medium">{errors.configurationAvailable}</p>}
                    </div>
                  )}

                  <div>
                    <Label className="form-label">Total Units (Optional)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 500" 
                      className="form-input"
                      value={formData.totalUnits}
                      onChange={(e) => handleInputChange('totalUnits', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="form-label">Total Towers</Label>
                      <Input 
                        type="number"
                        placeholder="e.g. 8" 
                        className="form-input"
                        value={formData.totalTowers}
                        onChange={(e) => handleInputChange('totalTowers', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="form-label">Total Floors</Label>
                      <Input 
                        type="number"
                        placeholder="e.g. 14" 
                        className="form-input"
                        value={formData.totalFloors}
                        onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2 - PRICING */}
              <div className="form-section-container">
                <h2 className="form-section-heading">2. Pricing Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="form-label">Min Price (₹) <span className="text-destructive">*</span></Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 4500000" 
                      className={`form-input ${errors.minPrice ? 'border-destructive' : ''}`}
                      value={formData.minPrice}
                      onChange={(e) => handleInputChange('minPrice', e.target.value)}
                    />
                    {errors.minPrice && <p className="text-xs text-destructive mt-1 font-medium">{errors.minPrice}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Max Price (₹) <span className="text-destructive">*</span></Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 8500000" 
                      className={`form-input ${errors.maxPrice ? 'border-destructive' : ''}`}
                      value={formData.maxPrice}
                      onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                    />
                    {errors.maxPrice && <p className="text-xs text-destructive mt-1 font-medium">{errors.maxPrice}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Price Per Sq.ft (Optional)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 5000" 
                      className="form-input"
                      value={formData.pricePerSqft}
                      onChange={(e) => handleInputChange('pricePerSqft', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <Label className="form-label">Payment Plans Available (Optional)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {PAYMENT_PLANS.map(plan => (
                        <div key={plan} className="flex items-start space-x-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-border/50">
                          <Checkbox 
                            id={`plan-${plan}`} 
                            checked={formData.paymentPlans.includes(plan)}
                            onCheckedChange={(checked) => handleMultiSelect('paymentPlans', plan, checked)}
                            className="mt-0.5"
                          />
                          <Label htmlFor={`plan-${plan}`} className="cursor-pointer text-sm font-medium leading-tight">{plan}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3 - PROJECT STATUS */}
              <div className="form-section-container">
                <h2 className="form-section-heading">3. Project Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="form-label">Project Status <span className="text-destructive">*</span></Label>
                    <Select value={formData.projectStatus} onValueChange={(val) => handleInputChange('projectStatus', val)}>
                      <SelectTrigger className={`form-input ${errors.projectStatus ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New Launch">New Launch</SelectItem>
                        <SelectItem value="Under Construction">Under Construction</SelectItem>
                        <SelectItem value="Partially Ready">Partially Ready</SelectItem>
                        <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.projectStatus && <p className="text-xs text-destructive mt-1 font-medium">{errors.projectStatus}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Launch Year <span className="text-destructive">*</span></Label>
                    <Select value={formData.launchYear} onValueChange={(val) => handleInputChange('launchYear', val)}>
                      <SelectTrigger className={`form-input ${errors.launchYear ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 7}, (_, i) => 2020 + i).map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.launchYear && <p className="text-xs text-destructive mt-1 font-medium">{errors.launchYear}</p>}
                  </div>

                  {['Under Construction', 'Partially Ready'].includes(formData.projectStatus) && (
                    <div>
                      <Label className="form-label">Expected Possession <span className="text-destructive">*</span></Label>
                      <Input 
                        placeholder="MM/YYYY" 
                        className={`form-input ${errors.expectedPossession ? 'border-destructive' : ''}`}
                        value={formData.expectedPossession}
                        onChange={(e) => handleInputChange('expectedPossession', e.target.value)}
                      />
                      {errors.expectedPossession && <p className="text-xs text-destructive mt-1 font-medium">{errors.expectedPossession}</p>}
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <Label className="form-label">RERA Registration (Optional)</Label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <Input 
                        placeholder="RERA Registration Number" 
                        className="form-input w-full sm:max-w-sm"
                        value={formData.reraNumber}
                        onChange={(e) => handleInputChange('reraNumber', e.target.value)}
                        disabled={formData.reraApplied}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="reraApplied" 
                          checked={formData.reraApplied}
                          onCheckedChange={(checked) => {
                            handleInputChange('reraApplied', checked);
                            if (checked) handleInputChange('reraNumber', '');
                          }}
                        />
                        <Label htmlFor="reraApplied" className="cursor-pointer font-medium text-sm">RERA Applied</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4 - LOCATION */}
              <div className="form-section-container">
                <h2 className="form-section-heading">4. Location Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="form-label">City <span className="text-destructive">*</span></Label>
                    <Select value={formData.city} onValueChange={(val) => handleInputChange('city', val)}>
                      <SelectTrigger className={`form-input ${errors.city ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Greater Noida">Greater Noida</SelectItem>
                        <SelectItem value="Noida">Noida</SelectItem>
                        <SelectItem value="YEIDA">YEIDA/Yamuna Expressway</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.city && <p className="text-xs text-destructive mt-1 font-medium">{errors.city}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Sector / Area <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="e.g. Sector 1" 
                      className={`form-input ${errors.sector ? 'border-destructive' : ''}`}
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                    />
                    {errors.sector && <p className="text-xs text-destructive mt-1 font-medium">{errors.sector}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Landmark (Optional)</Label>
                    <Input 
                      placeholder="e.g. Near Pari Chowk" 
                      className="form-input"
                      value={formData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="form-label">Project Address (Optional)</Label>
                    <Textarea 
                      placeholder="Complete site address..." 
                      className="min-h-[100px] rounded-xl bg-slate-50 dark:bg-slate-950 border-border"
                      value={formData.projectAddress}
                      onChange={(e) => handleInputChange('projectAddress', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground font-medium mt-2">
                      Exact address stored securely. Only approximate location shown publicly.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 5 - AREA DETAILS */}
              <div className="form-section-container">
                <h2 className="form-section-heading">5. Area Details (Optional)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="form-label">Min Area</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 950" 
                      className="form-input"
                      value={formData.minArea}
                      onChange={(e) => handleInputChange('minArea', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="form-label">Max Area</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 2400" 
                      className="form-input"
                      value={formData.maxArea}
                      onChange={(e) => handleInputChange('maxArea', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="form-label">Unit</Label>
                    <Select value={formData.areaUnit} onValueChange={(val) => handleInputChange('areaUnit', val)}>
                      <SelectTrigger className="form-input">
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sq.ft">Sq.ft</SelectItem>
                        <SelectItem value="Sq.yd">Sq.yd</SelectItem>
                        <SelectItem value="Sq.m">Sq.m</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-3">
                    <Label className="form-label">Area Types Available</Label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {AREA_TYPES.map(type => (
                        <div key={type} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-lg border border-border/50">
                          <Checkbox 
                            id={`areaType-${type}`} 
                            checked={formData.areaTypes.includes(type)}
                            onCheckedChange={(checked) => handleMultiSelect('areaTypes', type, checked)}
                          />
                          <Label htmlFor={`areaType-${type}`} className="cursor-pointer text-sm font-medium">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6 - AMENITIES */}
              <div className="form-section-container">
                <h2 className="form-section-heading">6. Project Amenities</h2>
                <div className="space-y-8">
                  {AMENITIES_CATEGORIES.map(category => (
                    <div key={category.name}>
                      <h3 className="text-sm font-bold text-primary dark:text-brand-blue mb-4 tracking-wide uppercase">
                        {category.name}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {category.items.map(item => (
                          <div key={item} className="flex items-start space-x-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-border/50">
                            <Checkbox 
                              id={`amenity-${item}`} 
                              checked={formData.amenities.includes(item)}
                              onCheckedChange={(checked) => handleMultiSelect('amenities', item, checked)}
                              className="mt-0.5"
                            />
                            <Label htmlFor={`amenity-${item}`} className="cursor-pointer font-medium text-sm leading-snug">{item}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 7 - MEDIA */}
              <div className="form-section-container">
                <h2 className="form-section-heading">7. Media & Attachments (Optional)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <div className="space-y-3">
                    <Label className="form-label">Project Images (Max 20, 5MB each)</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors relative">
                      <Input 
                        type="file" 
                        multiple 
                        accept="image/jpeg, image/png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange('projectImages', e, 20, 5)}
                      />
                      <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Click or drag images to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG only</p>
                    </div>
                    {files.projectImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs font-bold text-primary w-full">{files.projectImages.length} / 20 Images Selected</span>
                        {files.projectImages.map((file, i) => (
                          <div key={i} className="flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                            <span className="truncate max-w-[100px]">{file.name}</span>
                            <button type="button" onClick={() => removeFile('projectImages', i)} className="ml-2 text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="form-label">Brochure (Max 1, PDF, 10MB)</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors relative">
                      <Input 
                        type="file" 
                        accept="application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange('brochure', e, 1, 10)}
                      />
                      <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Upload Project Brochure</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF only</p>
                    </div>
                    {files.brochure && (
                      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded mt-3 text-sm">
                        <span className="truncate">{files.brochure.name}</span>
                        <button type="button" onClick={() => removeFile('brochure')} className="text-destructive"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="form-label">Project Video (Max 1, 100MB)</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors relative">
                      <Input 
                        type="file" 
                        accept="video/mp4, video/quicktime, video/x-msvideo"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange('projectVideo', e, 1, 100)}
                      />
                      <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Upload Promotional Video</p>
                      <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI only</p>
                    </div>
                    {files.projectVideo && (
                      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded mt-3 text-sm">
                        <span className="truncate">{files.projectVideo.name}</span>
                        <button type="button" onClick={() => removeFile('projectVideo')} className="text-destructive"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="form-label">Floor Plans (Max 10, 5MB each)</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors relative">
                      <Input 
                        type="file" 
                        multiple 
                        accept="image/jpeg, image/png, application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange('floorPlans', e, 10, 5)}
                      />
                      <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Upload Floor Plans</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF only</p>
                    </div>
                    {files.floorPlans.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs font-bold text-primary w-full">{files.floorPlans.length} / 10 Plans Selected</span>
                        {files.floorPlans.map((file, i) => (
                          <div key={i} className="flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                            <span className="truncate max-w-[100px]">{file.name}</span>
                            <button type="button" onClick={() => removeFile('floorPlans', i)} className="ml-2 text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* SECTION 8 - BUILDER CONTACT DETAILS */}
              <div className="form-section-container">
                <h2 className="form-section-heading">8. Official Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="form-label">Contact Person Name <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="Name" 
                      className={`form-input ${errors.contactPersonName ? 'border-destructive' : ''}`}
                      value={formData.contactPersonName}
                      onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                    />
                    {errors.contactPersonName && <p className="text-xs text-destructive mt-1 font-medium">{errors.contactPersonName}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Designation <span className="text-destructive">*</span></Label>
                    <Select value={formData.designation} onValueChange={(val) => handleInputChange('designation', val)}>
                      <SelectTrigger className={`form-input ${errors.designation ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                        <SelectItem value="Marketing Team">Marketing Team</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.designation && <p className="text-xs text-destructive mt-1 font-medium">{errors.designation}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Official Mobile Number <span className="text-destructive">*</span></Label>
                    <div className="flex">
                      <div className="flex items-center justify-center bg-muted border border-r-0 border-input rounded-l-xl px-4 text-muted-foreground font-medium">
                        +91
                      </div>
                      <Input 
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210" 
                        className={`h-12 rounded-l-none rounded-r-xl bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-primary ${errors.mobileNumber ? 'border-destructive z-10 ring-destructive' : ''}`}
                        value={formData.mobileNumber}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                      />
                    </div>
                    {errors.mobileNumber && <p className="text-xs text-destructive mt-1 font-medium">{errors.mobileNumber}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Official Email <span className="text-destructive">*</span></Label>
                    <Input 
                      type="email"
                      placeholder="name@company.com" 
                      className={`form-input ${errors.email ? 'border-destructive' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                    {errors.email && <p className="text-xs text-destructive mt-1 font-medium">{errors.email}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Company Website (Optional)</Label>
                    <Input 
                      type="url"
                      placeholder="https://..." 
                      className="form-input"
                      value={formData.companyWebsite}
                      onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="form-label">Office Address (Optional)</Label>
                    <Textarea 
                      placeholder="Head office address" 
                      className="min-h-[48px] rounded-xl bg-slate-50 dark:bg-slate-950 border-border"
                      value={formData.officeAddress}
                      onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 9 - ADDITIONAL INFO */}
              <div className="form-section-container">
                <h2 className="form-section-heading">9. Additional Info (Optional)</h2>
                
                {antiBypassWarning && (
                  <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center">
                    <X className="w-5 h-5 mr-2 shrink-0" />
                    Phone numbers and contact details are not allowed in description fields.
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <Label className="form-label">Project USP / Highlights</Label>
                    <Textarea 
                      placeholder="Describe key highlights without including contact details..."
                      className={`min-h-[120px] rounded-xl bg-slate-50 dark:bg-slate-950 resize-y border-border focus:ring-primary ${antiBypassWarning ? 'border-destructive ring-1 ring-destructive' : ''}`}
                      maxLength={500}
                      value={formData.projectUSP}
                      onChange={(e) => handleTextareaChange('projectUSP', e.target.value)}
                    />
                    <div className="text-right text-xs text-muted-foreground font-medium mt-1">
                      {formData.projectUSP.length} / 500 characters
                    </div>
                  </div>
                  <div>
                    <Label className="form-label">Special Offers</Label>
                    <Textarea 
                      placeholder="Any limited time offers, freebies, or discounts..."
                      className={`min-h-[120px] rounded-xl bg-slate-50 dark:bg-slate-950 resize-y border-border focus:ring-primary ${antiBypassWarning ? 'border-destructive ring-1 ring-destructive' : ''}`}
                      maxLength={500}
                      value={formData.specialOffers}
                      onChange={(e) => handleTextareaChange('specialOffers', e.target.value)}
                    />
                    <div className="text-right text-xs text-muted-foreground font-medium mt-1">
                      {formData.specialOffers.length} / 500 characters
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 10 - CONFIRMATION */}
              <div className="bg-primary/5 dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-primary/20">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="confirm1" 
                      className="mt-1 w-5 h-5"
                      checked={formData.confirmationCheckbox1}
                      onCheckedChange={(checked) => handleInputChange('confirmationCheckbox1', checked)}
                    />
                    <Label htmlFor="confirm1" className="cursor-pointer text-sm font-medium leading-relaxed">
                      I confirm that I am authorized to list this project and all details provided are accurate and legally compliant.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="confirm2" 
                      className="mt-1 w-5 h-5"
                      checked={formData.confirmationCheckbox2}
                      onCheckedChange={(checked) => handleInputChange('confirmationCheckbox2', checked)}
                    />
                    <Label htmlFor="confirm2" className="cursor-pointer text-sm font-medium leading-relaxed">
                      I agree to Growperty <a href="/terms-and-conditions" target="_blank" className="text-primary hover:underline font-bold inline-flex items-center">Terms & Conditions <ExternalLink className="w-3 h-3 ml-1" /></a>
                    </Label>
                  </div>
                </div>

                <div className="mt-8">
                  <Button 
                    type="submit" 
                    disabled={isSubmitDisabled}
                    className="w-full md:w-auto h-14 px-12 text-lg font-bold bg-brand-green hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-brand-green/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Processing...</>
                    ) : (
                      'Submit Project Listing'
                    )}
                  </Button>
                </div>
              </div>

            </form>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ProjectListingForm;
