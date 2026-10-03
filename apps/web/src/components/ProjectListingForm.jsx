
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, Loader2, UploadCloud, X, ArrowRight, Building2, ExternalLink, Sparkles, FileText, Clock } from 'lucide-react';
import apiServerClient, { API_SERVER_URL } from '@/lib/apiServerClient.js';
import AiGenerationOverlay, { AI_GENERATION_STEPS } from '@/components/AiGenerationOverlay.jsx';
import SpecialOfferSection from '@/components/SpecialOfferSection.jsx';
import { convertHeicToJpeg, isHeicFile, IMAGE_ACCEPT_WITH_HEIC } from '@/lib/heicConvert.js';
import { BEST_FOR_RESIDENTIAL, BEST_FOR_PLOT, BEST_FOR_COMMERCIAL, PROJECT_DOCUMENT_TYPES, connectivityToRows, connectivityFromRows } from '@/lib/listingOptions.js';
import ConnectivityFields from '@/components/ConnectivityFields.jsx';
import { LISTING_ZONES, ZONE_SECTORS } from '@/lib/sectorZones.js';
import { Combobox } from '@/components/ui/combobox.jsx';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';

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
  'Studio', 'Plot/Land', 'Shop', 'Office', 'Store', 'Others'
];

// Autosaved draft for the NEW-listing flow only — never for editing an
// existing project (editId present), where overlaying a stale draft onto
// freshly-fetched initialData would be actively wrong. A laptop going to
// sleep mid-fill can cause the tab to get discarded and reloaded by the
// browser (independent of anything this app does), wiping all in-memory
// React state; this makes that recoverable instead of destructive. File
// inputs (images/floor plans/brochure/documents) can't be restored this
// way — browsers never allow re-populating a <input type="file"> from
// script for security reasons — so only the text/selection fields persist.
const PROJECT_DRAFT_KEY = 'growperty_project_draft_v1';
const PROJECT_DRAFT_SAVE_DEBOUNCE_MS = 800;

const PROJECT_STATUSES = ['Upcoming', 'New Launch', 'Under Construction', 'Nearing Possession', 'Ready to Move', 'Completed'];
// Statuses where the builder already has a possession timeline to share.
const POSSESSION_REQUIRED_STATUSES = ['Under Construction', 'Nearing Possession'];

const CONFIGURATIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

const PAYMENT_PLANS = [
  'Construction Linked Plan', 'Down Payment Plan', 'Possession Linked Plan', 'Bank Loan Available'
];

const AREA_TYPES = ['Carpet Area', 'Built-up Area', 'Super Built-up Area'];

const PROPERTY_TYPE_CONFIG = {
  'Flat/Apartment':          { unit: 'Sq.ft', units: ['Sq.ft', 'Sq.yd', 'Sq.m'], showAreaTypes: true },
  'Independent House/Villa': { unit: 'Sq.yd', units: ['Sq.yd', 'Sq.ft', 'Sq.m'], showAreaTypes: false },
  'Penthouse':               { unit: 'Sq.ft', units: ['Sq.ft', 'Sq.yd', 'Sq.m'], showAreaTypes: true },
  'Studio':                  { unit: 'Sq.ft', units: ['Sq.ft', 'Sq.yd', 'Sq.m'], showAreaTypes: true },
  'Plot/Land':               { unit: 'Sq.m',  units: ['Sq.m', 'Sq.yd', 'Sq.ft'], showAreaTypes: false },
  'Shop':                    { unit: 'Sq.ft', units: ['Sq.ft', 'Sq.yd', 'Sq.m'], showAreaTypes: true },
  'Office':                  { unit: 'Sq.ft', units: ['Sq.ft', 'Sq.yd', 'Sq.m'], showAreaTypes: true },
  'Others':                  { unit: 'Sq.ft', units: ['Sq.ft', 'Sq.yd', 'Sq.m'], showAreaTypes: false },
};

// Property types where BHK configuration is a meaningful distinction (a shop
// or a plot doesn't have "2 BHK" pricing, so they never split by BHK below).
const BHK_APPLICABLE_TYPES = ['Flat/Apartment', 'Independent House/Villa', 'Penthouse', 'Studio'];

// One shared pricing block by default; only splits into one block per BHK
// once more than one configuration is selected — matches how the form asks
// for a single "Configuration Available" list, not per-type BHK selection.
const getBhkKeysForType = (type, configurationAvailable) => {
  if (BHK_APPLICABLE_TYPES.includes(type) && configurationAvailable.length > 1) {
    return configurationAvailable;
  }
  return ['default'];
};

const emptyTypePricing = (unit) => ({
  priceMode: 'range', minPrice: '', maxPrice: '', price: '',
  pricePerUnit: '', minArea: '', maxArea: '', area: '', areaUnit: unit, areaByType: {},
  units: '', towers: '', floors: '',
});

// Price per Sq.ft is derived, never typed in — formula: Total Price / Super
// Area = Price per Sq.ft. Uses the Super Built-up Area figures specifically
// when a type has area-type breakdown; falls back to the plain area fields
// for types that don't (Independent House/Villa, Plot/Land, Others).
const calcPricePerSqft = (p, showAreaTypes) => {
  const superAreaField = (key) => {
    const raw = showAreaTypes ? p.areaByType?.['Super Built-up Area']?.[key] : p[key];
    const n = Number(raw);
    return n > 0 ? n : null;
  };
  if ((p.priceMode || 'range') === 'fixed') {
    const price = Number(p.price) || null;
    const area = superAreaField('area');
    return { value: (price && area) ? Math.round(price / area) : null };
  }
  const minPrice = Number(p.minPrice) || null;
  const maxPrice = Number(p.maxPrice) || null;
  const minArea = superAreaField('minArea');
  const maxArea = superAreaField('maxArea');
  return {
    min: (minPrice && minArea) ? Math.round(minPrice / minArea) : null,
    max: (maxPrice && maxArea) ? Math.round(maxPrice / maxArea) : null,
  };
};

const AMENITIES_CATEGORIES = [
  {
    name: 'LIFESTYLE & RECREATION',
    items: ['Clubhouse', 'Swimming Pool', 'Gymnasium', 'Jogging Track', 'Kids Play Area', 'Sports Court', 'Park/Garden', 'Temple']
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
    items: ['Market', 'Metro', 'Hospital', 'School', 'Mall', 'Highway', 'Bus Stop', 'Airport']
  }
];

const ProjectListingForm = ({ isAdmin = false, initialData = null }) => {
  const navigate = useNavigate();
  const { token: adminToken } = useAdminAuth();
  const editId = initialData?._id || initialData?.id || null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [antiBypassWarning, setAntiBypassWarning] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState(0);

  const [formData, setFormData] = useState({
    projectName: '',
    builderName: '',
    projectType: '',
    propertyTypes: [],
    configurationAvailable: [],

    landArea: '',
    landAreaUnit: 'Acres',
    totalTowers: '',
    totalFloors: '',
    totalUnits: '',
    unitsAvailable: '',
    greenAreaPercent: '',

    propertyTypePricing: {},
    paymentPlans: [],

    projectStatus: '',
    launchYear: '',
    expectedPossession: '',
    reraNumber: '',
    reraApplied: false,
    gstNumber: '',

    city: '',
    sector: '',
    landmark: '',
    societyName: '',
    projectAddress: '',
    
    amenities: [],
    
    contactPersonName: '',
    designation: '',
    mobileNumber: '',
    email: '',
    companyWebsite: '',
    officeAddress: '',
    
    projectUSP: '',
    description: '',
    // { [type key]: { name, distance } } — only filled rows are submitted.
    connectivity: {},
    // Documents marked "Applied" (not issued yet). RERA uses reraApplied instead.
    documentsApplied: [],
    bestFor: [],
    offerTitle: '',
    offerDetails: '',
    offerValidTill: '',

    confirmationCheckbox1: false,
    confirmationCheckbox2: false
  });

  const [files, setFiles] = useState({
    projectImages: [],
    brochure: null,
    projectVideo: null,
    floorPlans: [],
    documents: {}, // { [PROJECT_DOCUMENT_TYPES key]: File }
  });

  // Already-uploaded media, present only when editing. Images/floor plans/
  // documents can be removed (kept out of what's resubmitted); brochure and
  // video can only be replaced, not cleared outright, in this first version.
  const [existingMedia, setExistingMedia] = useState({
    projectImages: [],
    floorPlans: [],
    brochure: '',
    projectVideo: '',
    documents: {}, // { [PROJECT_DOCUMENT_TYPES key]: url }
  });

  // Pre-fill the form when editing an existing project.
  useEffect(() => {
    if (!initialData) return;
    const d = initialData;
    setFormData(prev => ({
      ...prev,
      projectName: d.projectName || '',
      builderName: d.builderName || '',
      projectType: d.projectType || '',
      propertyTypes: d.propertyTypes || [],
      configurationAvailable: d.configurationAvailable || [],
      landArea: d.landArea ?? '',
      landAreaUnit: d.landAreaUnit || 'Acres',
      totalTowers: d.totalTowers ?? '',
      totalFloors: d.totalFloors || '',
      totalUnits: d.totalUnits ?? '',
      unitsAvailable: d.unitsAvailable ?? '',
      greenAreaPercent: d.greenAreaPercent ?? '',
      propertyTypePricing: d.propertyTypePricing || {},
      paymentPlans: d.paymentPlans || [],
      projectStatus: d.projectStatus || '',
      launchYear: d.launchYear || '',
      expectedPossession: d.expectedPossession || '',
      reraNumber: d.reraNumber || '',
      reraApplied: Boolean(d.reraApplied),
      gstNumber: d.gstNumber || '',
      city: d.city || '',
      sector: d.sector || '',
      landmark: d.landmark || '',
      societyName: d.societyName || '',
      projectAddress: d.projectAddress || '',
      amenities: d.amenities || [],
      contactPersonName: d.contactPersonName || '',
      designation: d.designation || '',
      mobileNumber: d.mobileNumber || '',
      email: d.email || '',
      companyWebsite: d.companyWebsite || '',
      officeAddress: d.officeAddress || '',
      projectUSP: d.projectUSP || '',
      description: d.description || '',
      connectivity: connectivityFromRows(d.connectivity),
      documentsApplied: d.documentsApplied || [],
      bestFor: d.bestFor || [],
      offerTitle: d.offerTitle || '',
      offerDetails: d.offerDetails || '',
      offerValidTill: d.offerValidTill ? String(d.offerValidTill).slice(0, 10) : '',
      confirmationCheckbox1: true,
      confirmationCheckbox2: true,
    }));
    setExistingMedia({
      projectImages: d.projectImages || [],
      floorPlans: d.floorPlans || [],
      brochure: d.brochure || '',
      projectVideo: d.projectVideo || '',
      documents: d.documents || {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Restore an autosaved draft once on mount — new-listing flow only (see
  // PROJECT_DRAFT_KEY comment above).
  useEffect(() => {
    if (editId) return;
    try {
      const saved = localStorage.getItem(PROJECT_DRAFT_KEY);
      if (!saved) return;
      const draft = JSON.parse(saved);
      setFormData(prev => ({ ...prev, ...draft }));
      toast.info('Draft restored — pick up where you left off. Please re-attach any photos or documents.');
    } catch {
      localStorage.removeItem(PROJECT_DRAFT_KEY); // corrupted draft — don't keep retrying it
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave the draft (debounced) as the user types — text/selection
  // fields only, see PROJECT_DRAFT_KEY comment. Stops once editing an
  // existing project or after a successful new-listing submit.
  useEffect(() => {
    if (editId || isSuccess) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(PROJECT_DRAFT_KEY, JSON.stringify(formData));
      } catch {
        // localStorage full or unavailable (e.g. private browsing) — skip
        // this save; not fatal, the in-memory form still works normally.
      }
    }, PROJECT_DRAFT_SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [formData, editId, isSuccess]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'city' && value !== prev.city) next.sector = '';
      if (field === 'projectType' && value === 'Residential') {
        next.propertyTypes = prev.propertyTypes.filter(t => !['Shop', 'Office', 'Store'].includes(t));
      }
      if (field === 'projectType' && value === 'Commercial') {
        next.propertyTypes = prev.propertyTypes.filter(t => !['Flat/Apartment', 'Independent House/Villa', 'Penthouse', 'Studio', 'Others'].includes(t));
      }
      return next;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleConnectivityChange = (key, field, value) => {
    setFormData(prev => ({
      ...prev,
      connectivity: { ...prev.connectivity, [key]: { ...prev.connectivity[key], [field]: value } },
    }));
  };

  const handleMultiSelect = (field, item, checked) => {
    setFormData(prev => {
      const array = prev[field] || [];
      const next = { ...prev, [field]: checked ? [...array, item] : array.filter(i => i !== item) };
      if (field === 'propertyTypes' && checked && !prev.propertyTypePricing[item]) {
        const cfg = PROPERTY_TYPE_CONFIG[item] || { unit: 'Sq.ft', units: ['Sq.ft', 'Sq.yd', 'Sq.m'], showAreaTypes: false };
        next.propertyTypePricing = {
          ...prev.propertyTypePricing,
          [item]: { default: emptyTypePricing(cfg.unit) },
        };
      }
      return next;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleTypePrice = (type, bhkKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      propertyTypePricing: {
        ...prev.propertyTypePricing,
        [type]: {
          ...prev.propertyTypePricing[type],
          [bhkKey]: { ...(prev.propertyTypePricing[type]?.[bhkKey]), [field]: value },
        },
      },
    }));
  };

  // Each area type (Carpet/Built-up/Super Built-up) gets its own independent
  // area fields, rather than one shared Min/Max Area behind a checkbox list.
  const handleAreaTypeField = (type, bhkKey, atype, field, value) => {
    setFormData(prev => {
      const current = prev.propertyTypePricing[type]?.[bhkKey] || {};
      const areaByType = { ...(current.areaByType || {}) };
      areaByType[atype] = { ...(areaByType[atype] || {}), [field]: value };
      return {
        ...prev,
        propertyTypePricing: {
          ...prev.propertyTypePricing,
          [type]: {
            ...prev.propertyTypePricing[type],
            [bhkKey]: { ...current, areaByType },
          },
        },
      };
    });
  };

  const checkAntiBypass = (text) => {
    const phoneRegex = /\b\d{10}\b/;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const keywordsRegex = /call me|whatsapp|contact me|reach out/i;
    return phoneRegex.test(text) || emailRegex.test(text) || keywordsRegex.test(text);
  };

  const handleTextareaChange = (field, value) => {
    handleInputChange(field, value);
    if (field === 'projectUSP' || field === 'description') {
      const hasViolation = checkAntiBypass(value);
      setAntiBypassWarning(hasViolation);
    }
  };

  const handleFileChange = async (field, e, maxCount, maxSizeMB) => {
    const input = e.target;
    let selectedFiles = Array.from(input.files || []);
    input.value = '';

    // iPhone HEIC photos → JPEG, so every browser can show them to buyers.
    if (['projectImages', 'floorPlans'].includes(field) && selectedFiles.some(isHeicFile)) {
      const toastId = toast.loading('Converting iPhone photos…');
      const converted = await Promise.all(selectedFiles.map(f => convertHeicToJpeg(f).catch(() => null)));
      toast.dismiss(toastId);
      const failed = converted.filter(f => !f).length;
      if (failed) toast.error(`${failed} photo(s) couldn't be read. Try exporting them as JPEG.`);
      selectedFiles = converted.filter(Boolean);
      if (!selectedFiles.length) return;
    }
    
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

  const MAX_DOCUMENT_MB = 10;

  const handleDocumentChange = async (key, e) => {
    const input = e.target;
    let file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (isHeicFile(file)) {
      const toastId = toast.loading('Converting iPhone photo…');
      file = await convertHeicToJpeg(file).catch(() => null);
      toast.dismiss(toastId);
      if (!file) { toast.error("That photo couldn't be read. Try exporting it as JPEG or PDF."); return; }
    }
    if (file.size > MAX_DOCUMENT_MB * 1024 * 1024) {
      toast.error(`File exceeds the ${MAX_DOCUMENT_MB}MB limit.`);
      return;
    }
    setFiles(prev => ({ ...prev, documents: { ...prev.documents, [key]: file } }));
  };

  // RERA's "Applied" is the same flag as the RERA Applied checkbox in Project Status.
  const isDocumentApplied = (key) =>
    key === 'reraCertificate' ? formData.reraApplied : formData.documentsApplied.includes(key);

  const toggleDocumentApplied = (key, checked) => {
    if (key === 'reraCertificate') {
      handleInputChange('reraApplied', checked);
      if (checked) handleInputChange('reraNumber', '');
    } else {
      handleInputChange('documentsApplied', checked
        ? [...formData.documentsApplied, key]
        : formData.documentsApplied.filter(k => k !== key));
    }
    if (checked) removeDocument(key); // nothing to upload until it's issued
  };

  const removeDocument = (key) => {
    setFiles(prev => {
      const documents = { ...prev.documents };
      delete documents[key];
      return { ...prev, documents };
    });
  };

  // Drops an already-uploaded document/image/floor-plan when editing — it
  // won't be in the "existing" list re-sent on save, so the server removes it.
  const removeExistingDocument = (key) => {
    setExistingMedia(prev => {
      const documents = { ...prev.documents };
      delete documents[key];
      return { ...prev, documents };
    });
  };
  const removeExistingMediaItem = (field, index) => {
    setExistingMedia(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  // Compact upload control placed to the right of a number field (RERA/GST),
  // instead of the full document cards in Section 9. Same upload/applied
  // state as the Documents section — a cert uploaded here also satisfies
  // that section (each doc key has one control that shows wherever it's used).
  const CertificateUpload = ({ docKey, label }) => {
    const file = files.documents[docKey];
    const existingUrl = existingMedia.documents[docKey];
    const applied = isDocumentApplied(docKey);
    if (file) {
      return (
        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-800 rounded-lg px-3 py-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">{file.name}</span>
          <button type="button" onClick={() => removeDocument(docKey)} className="text-destructive shrink-0" title="Remove">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }
    if (existingUrl) {
      return (
        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-800 rounded-lg px-3 py-2.5">
          <a href={`${API_SERVER_URL}/projects/${editId}/documents/${docKey}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
            View uploaded {label}
          </a>
          <label className="text-xs font-bold text-[#10B981] cursor-pointer hover:underline">
            Replace
            <input type="file" accept={`application/pdf,${IMAGE_ACCEPT_WITH_HEIC}`} className="hidden" onChange={(e) => handleDocumentChange(docKey, e)} />
          </label>
          <button type="button" onClick={() => removeExistingDocument(docKey)} className="text-destructive shrink-0" title="Remove">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }
    if (applied) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 rounded-lg px-3 py-2.5 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5" /> Applied
        </span>
      );
    }
    return (
      <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] border border-[#10B981]/40 hover:bg-[#10B981]/10 px-4 py-2.5 rounded-lg cursor-pointer whitespace-nowrap">
        <UploadCloud className="w-3.5 h-3.5" /> Upload {label}
        <input
          type="file"
          accept={`application/pdf,${IMAGE_ACCEPT_WITH_HEIC}`}
          className="hidden"
          onChange={(e) => handleDocumentChange(docKey, e)}
        />
      </label>
    );
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

  const handleGenerateDescription = async () => {
    if (!formData.projectName.trim() || !formData.city || !formData.sector.trim()) {
      toast.error('Fill Project Name, City and Sector first to generate a description.');
      return;
    }
    setGeneratingDescription(true);
    setAiStepIndex(0);
    const stepInterval = setInterval(() => {
      setAiStepIndex(prev => Math.min(prev + 1, AI_GENERATION_STEPS.length - 1));
    }, 1200);
    try {
      const res = await apiServerClient.fetch('/ai/generate-project-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to generate description');
      setFormData(prev => ({ ...prev, description: data.description }));
      toast.success('Description generated — review and edit it before submitting.');
    } catch (err) {
      toast.error(err.message || 'Description generation failed.');
    } finally {
      clearInterval(stepInterval);
      setGeneratingDescription(false);
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

    // Section 2 — per property type (and per BHK, once more than one is selected) pricing
    formData.propertyTypes.forEach(type => {
      const bhkKeys = getBhkKeysForType(type, formData.configurationAvailable);
      bhkKeys.forEach(bhkKey => {
        const p = formData.propertyTypePricing[type]?.[bhkKey] || {};
        const errKey = bhkKeys.length > 1 ? `${type}_${bhkKey}` : type;
        if ((p.priceMode || 'range') === 'fixed') {
          if (!p.price) newErrors[`price_${errKey}`] = 'Price is required';
        } else {
          if (!p.minPrice) newErrors[`minPrice_${errKey}`] = 'Min Price is required';
          if (!p.maxPrice) newErrors[`maxPrice_${errKey}`] = 'Max Price is required';
          if (p.minPrice && p.maxPrice && Number(p.minPrice) > Number(p.maxPrice))
            newErrors[`maxPrice_${errKey}`] = 'Max Price must be ≥ Min Price';
        }
      });
    });

    // Project Overview
    if (!formData.landArea || Number(formData.landArea) <= 0) newErrors.landArea = 'Project Land Area is required';
    if (!formData.totalUnits || Number(formData.totalUnits) <= 0) newErrors.totalUnits = 'Total Units is required';
    if (formData.unitsAvailable && formData.totalUnits && Number(formData.unitsAvailable) > Number(formData.totalUnits)) {
      newErrors.unitsAvailable = 'Units Available cannot exceed Total Units';
    }
    if (formData.greenAreaPercent && (Number(formData.greenAreaPercent) < 0 || Number(formData.greenAreaPercent) > 100)) {
      newErrors.greenAreaPercent = 'Enter a percentage between 0 and 100';
    }

    // Section 3
    if (!formData.projectStatus) newErrors.projectStatus = 'Project Status is required';
    if (!formData.launchYear) newErrors.launchYear = 'Launch Year is required';
    if (POSSESSION_REQUIRED_STATUSES.includes(formData.projectStatus) && !formData.expectedPossession) {
      newErrors.expectedPossession = 'Expected Possession is required';
    }
    if (formData.gstNumber.trim() && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(formData.gstNumber.trim())) {
      newErrors.gstNumber = 'Enter a valid 15-character GSTIN (e.g. 09ABCDE1234F1Z5)';
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
      formPayload.append('landArea', formData.landArea);
      formPayload.append('landAreaUnit', formData.landAreaUnit);
      formPayload.append('totalTowers', formData.totalTowers);
      formPayload.append('totalFloors', formData.totalFloors.trim());
      formPayload.append('totalUnits', formData.totalUnits);
      formPayload.append('unitsAvailable', formData.unitsAvailable);
      formPayload.append('greenAreaPercent', formData.greenAreaPercent);
      formPayload.append('launchYear', formData.launchYear);
      formPayload.append('expectedPossession', formData.expectedPossession);
      formPayload.append('reraNumber', formData.reraNumber);
      formPayload.append('reraApplied', formData.reraApplied);
      formPayload.append('gstNumber', formData.gstNumber);
      formPayload.append('city', formData.city);
      formPayload.append('sector', formData.sector);
      formPayload.append('landmark', formData.landmark);
      formPayload.append('societyName', formData.societyName);
      formPayload.append('projectAddress', formData.projectAddress);
      formPayload.append('areaUnit', formData.areaUnit);
      formPayload.append('contactPersonName', formData.contactPersonName);
      formPayload.append('designation', formData.designation);
      formPayload.append('mobileNumber', formData.mobileNumber);
      formPayload.append('email', formData.email);
      formPayload.append('companyWebsite', formData.companyWebsite);
      formPayload.append('officeAddress', formData.officeAddress);
      formPayload.append('projectUSP', formData.projectUSP);
      formPayload.append('description', formData.description.trim());
      formPayload.append('connectivity', JSON.stringify(connectivityToRows(formData.connectivity)));
      formPayload.append('bestFor', JSON.stringify(formData.bestFor));
      formPayload.append('offerTitle', formData.offerTitle.trim());
      formPayload.append('offerDetails', formData.offerDetails.trim());
      if (formData.offerValidTill) formPayload.append('offerValidTill', formData.offerValidTill);
      formPayload.append('confirmationCheckbox1', formData.confirmationCheckbox1);
      formPayload.append('confirmationCheckbox2', formData.confirmationCheckbox2);

      // New listings always start pending review; an edit must never reset a
      // project that's already live back to pending, so status is left alone.
      if (!editId) formPayload.append('status', 'pending');

      // Append JSON fields — inject the auto-calculated price-per-sqft (never
      // user-typed) into each pricing block before it's stored. Only the
      // currently-active BHK keys for each type are kept, so a stale
      // 'default' block left over from before the form split into per-BHK
      // pricing (or vice versa) never gets submitted alongside the real ones.
      const pricingWithComputedRate = Object.fromEntries(
        formData.propertyTypes.map(type => {
          const cfg = PROPERTY_TYPE_CONFIG[type] || {};
          const activeBhkKeys = getBhkKeysForType(type, formData.configurationAvailable);
          const byBhk = formData.propertyTypePricing[type] || {};
          const entries = activeBhkKeys
            .filter(bhkKey => byBhk[bhkKey])
            .map(bhkKey => {
              const p = byBhk[bhkKey];
              const pps = calcPricePerSqft(p, cfg.showAreaTypes);
              return [bhkKey, { ...p, pricePerUnit: pps }];
            });
          return [type, Object.fromEntries(entries)];
        })
      );
      formPayload.append('propertyTypes', JSON.stringify(formData.propertyTypes));
      formPayload.append('propertyTypePricing', JSON.stringify(pricingWithComputedRate));
      formPayload.append('configurationAvailable', JSON.stringify(formData.configurationAvailable));
      formPayload.append('paymentPlans', JSON.stringify(formData.paymentPlans));
      formPayload.append('amenities', JSON.stringify(formData.amenities));

      // Append files
      files.projectImages.forEach(file => formPayload.append('projectImages', file));
      files.floorPlans.forEach(file => formPayload.append('floorPlans', file));
      if (files.brochure) formPayload.append('brochure', files.brochure);
      if (files.projectVideo) formPayload.append('projectVideo', files.projectVideo);
      formPayload.append('documentsApplied', JSON.stringify(formData.documentsApplied));
      PROJECT_DOCUMENT_TYPES.forEach(({ key, statuses }) => {
        const file = files.documents[key];
        if (file && (!statuses || statuses.includes(formData.projectStatus))) formPayload.append(`doc_${key}`, file);
      });

      // Editing: tell the server exactly which already-uploaded media to
      // keep (anything removed in the UI is simply left out). New uploads
      // above are added on top of these on save.
      if (editId) {
        formPayload.append('existingProjectImages', JSON.stringify(existingMedia.projectImages));
        formPayload.append('existingFloorPlans', JSON.stringify(existingMedia.floorPlans));
        formPayload.append('existingBrochure', existingMedia.brochure);
        formPayload.append('existingProjectVideo', existingMedia.projectVideo);
        formPayload.append('existingDocuments', JSON.stringify(existingMedia.documents));
      }

      const res = await apiServerClient.fetch(editId ? `/projects/${editId}` : '/projects', {
        method: editId ? 'PUT' : 'POST',
        headers: editId && adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
        body: formPayload,
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result.success === false) {
        throw new Error(result.message || `Server error: ${res.status}`);
      }

      if (editId) {
        toast.success('Project updated successfully.');
        navigate('/admin/projects');
        return;
      }

      localStorage.removeItem(PROJECT_DRAFT_KEY);
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error(error.message || 'Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Best For chips follow the project's type; Plot/Land adds plot-specific ones.
  const bestForOptions = [...new Set([
    ...(['Residential', 'Mixed Use'].includes(formData.projectType) ? BEST_FOR_RESIDENTIAL : []),
    ...(['Commercial', 'Mixed Use'].includes(formData.projectType) ? BEST_FOR_COMMERCIAL : []),
    ...(formData.propertyTypes.includes('Plot/Land') ? BEST_FOR_PLOT : []),
  ])];

  const isSubmitDisabled = 
    !formData.confirmationCheckbox1 || 
    !formData.confirmationCheckbox2 || 
    isSubmitting;

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
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
                <a href="https://wa.me/919891487876" target="_blank" rel="noopener noreferrer">
                  Chat with Growperty Team
                </a>
              </Button>
              <Button onClick={() => navigate('/projects')} variant="outline" className="h-14 px-8 text-base font-bold rounded-xl border-2">
                <Building2 className="w-5 h-5 mr-2" /> View All Projects
              </Button>
            </div>
          </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{editId ? 'Edit Project' : 'List Your Project'} - Growperty</title>
        <meta name="description" content="List your residential or commercial project on Growperty and reach verified buyers." />
        {editId && <meta name="robots" content="noindex, nofollow" />}
      </Helmet>

      <div className="py-4 md:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

            <div className="mb-10 text-center">
              {editId ? (
                <h1 className="text-3xl md:text-5xl font-extrabold text-primary dark:text-white mb-4 tracking-tight">Edit Project</h1>
              ) : (
                <>
                  <Badge className="bg-brand-blue hover:bg-brand-blue text-white px-4 py-1.5 text-xs font-bold tracking-widest mb-4 shadow-sm border-none">
                    FOR BUILDERS & DEVELOPERS ONLY
                  </Badge>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-primary dark:text-white mb-4 tracking-tight">List Your Project</h1>
                  <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
                    Share your project details and reach genuine buyers across Greater Noida and YEIDA.
                  </p>
                </>
              )}
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
                      {PROPERTY_TYPES.filter(t => {
                        if (formData.projectType === 'Residential') return !['Shop', 'Office', 'Store'].includes(t);
                        if (formData.projectType === 'Commercial') return !['Flat/Apartment', 'Independent House/Villa', 'Penthouse', 'Studio', 'Others'].includes(t);
                        return true;
                      }).map(type => (
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

                  {['Residential', 'Mixed Use'].includes(formData.projectType) &&
                   (formData.propertyTypes.length === 0 || formData.propertyTypes.some(t => ['Flat/Apartment', 'Independent House/Villa', 'Penthouse'].includes(t))) && (
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

                </div>
              </div>

              {/* SECTION 2 - PROJECT OVERVIEW */}
              <div className="form-section-container">
                <h2 className="form-section-heading">2. Project Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="form-label">Project Land Area <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 12.5"
                        className={`form-input flex-1 ${errors.landArea ? 'border-destructive' : ''}`}
                        value={formData.landArea}
                        onChange={(e) => handleInputChange('landArea', e.target.value)}
                      />
                      <Select value={formData.landAreaUnit} onValueChange={(val) => handleInputChange('landAreaUnit', val)}>
                        <SelectTrigger className="form-input w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Acres">Acres</SelectItem>
                          <SelectItem value="Sq. Ft.">Sq. Ft.</SelectItem>
                          <SelectItem value="Sq. Yards">Sq. Yards</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.landArea && <p className="text-xs text-destructive mt-1 font-medium">{errors.landArea}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Total Towers / Blocks <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g. 6"
                      className="form-input"
                      value={formData.totalTowers}
                      onChange={(e) => handleInputChange('totalTowers', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="form-label">Total Floors <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                    <Input
                      placeholder="e.g. G+24"
                      maxLength={30}
                      className="form-input"
                      value={formData.totalFloors}
                      onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="form-label">Total Units <span className="text-destructive">*</span></Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g. 720"
                      className={`form-input ${errors.totalUnits ? 'border-destructive' : ''}`}
                      value={formData.totalUnits}
                      onChange={(e) => handleInputChange('totalUnits', e.target.value)}
                    />
                    {errors.totalUnits && <p className="text-xs text-destructive mt-1 font-medium">{errors.totalUnits}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Units Available <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g. 150"
                      className={`form-input ${errors.unitsAvailable ? 'border-destructive' : ''}`}
                      value={formData.unitsAvailable}
                      onChange={(e) => handleInputChange('unitsAvailable', e.target.value)}
                    />
                    {errors.unitsAvailable && <p className="text-xs text-destructive mt-1 font-medium">{errors.unitsAvailable}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Total Open / Green Area % <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      placeholder="e.g. 70"
                      className={`form-input ${errors.greenAreaPercent ? 'border-destructive' : ''}`}
                      value={formData.greenAreaPercent}
                      onChange={(e) => handleInputChange('greenAreaPercent', e.target.value)}
                    />
                    {errors.greenAreaPercent && <p className="text-xs text-destructive mt-1 font-medium">{errors.greenAreaPercent}</p>}
                  </div>
                </div>
              </div>

              {/* SECTION 3 - PRICING & AREA DETAILS (per property type) */}
              <div className="form-section-container">
                <h2 className="form-section-heading">3. Pricing & Area Details</h2>

                {formData.propertyTypes.length === 0 ? (
                  <p className="text-muted-foreground text-sm font-medium text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-border">
                    Select property types above to configure pricing and area details.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {formData.propertyTypes.map(type => {
                      const cfg = PROPERTY_TYPE_CONFIG[type] || { unit: 'Sq.ft', units: ['Sq.ft', 'Sq.yd', 'Sq.m'], showAreaTypes: false };
                      const bhkKeys = getBhkKeysForType(type, formData.configurationAvailable);
                      const splitByBhk = bhkKeys.length > 1;
                      return (
                        <div key={type} className="border border-border/60 rounded-2xl p-5 bg-white dark:bg-slate-950 space-y-4">
                          <h3 className="font-bold text-sm text-primary border-b border-border pb-2.5 uppercase tracking-wide">{type}</h3>

                          <div className={splitByBhk ? 'space-y-4' : ''}>
                            {bhkKeys.map(bhkKey => {
                              const p = formData.propertyTypePricing[type]?.[bhkKey] || {};
                              const errKey = splitByBhk ? `${type}_${bhkKey}` : type;
                              return (
                                <div
                                  key={bhkKey}
                                  className={splitByBhk ? 'border border-border/40 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-900/40 space-y-4' : 'space-y-4'}
                                >
                                  {splitByBhk && (
                                    <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider">{bhkKey}</h4>
                                  )}

                                  <div>
                                    <Label className="form-label">Price & Area Type</Label>
                                    <div className="flex mt-1.5 rounded-xl overflow-hidden border border-border w-fit">
                                      {[{ id: 'range', label: 'Min-Max Range' }, { id: 'fixed', label: 'One Price & Area' }].map(mode => (
                                        <button
                                          key={mode.id}
                                          type="button"
                                          onClick={() => handleTypePrice(type, bhkKey, 'priceMode', mode.id)}
                                          className={`px-4 py-2 text-xs font-bold transition-colors ${(p.priceMode || 'range') === mode.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                                        >
                                          {mode.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {(p.priceMode || 'range') === 'range' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label className="form-label">Min Price (₹) <span className="text-destructive">*</span></Label>
                                        <Input type="number" placeholder="e.g. 4500000"
                                          className={`form-input ${errors[`minPrice_${errKey}`] ? 'border-destructive' : ''}`}
                                          value={p.minPrice || ''}
                                          onChange={(e) => handleTypePrice(type, bhkKey, 'minPrice', e.target.value)}
                                        />
                                        {errors[`minPrice_${errKey}`] && <p className="text-xs text-destructive mt-1 font-medium">{errors[`minPrice_${errKey}`]}</p>}
                                      </div>
                                      <div>
                                        <Label className="form-label">Max Price (₹) <span className="text-destructive">*</span></Label>
                                        <Input type="number" placeholder="e.g. 8500000"
                                          className={`form-input ${errors[`maxPrice_${errKey}`] ? 'border-destructive' : ''}`}
                                          value={p.maxPrice || ''}
                                          onChange={(e) => handleTypePrice(type, bhkKey, 'maxPrice', e.target.value)}
                                        />
                                        {errors[`maxPrice_${errKey}`] && <p className="text-xs text-destructive mt-1 font-medium">{errors[`maxPrice_${errKey}`]}</p>}
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <Label className="form-label">Price (₹) <span className="text-destructive">*</span></Label>
                                      <Input type="number" placeholder="e.g. 6500000"
                                        className={`form-input ${errors[`price_${errKey}`] ? 'border-destructive' : ''}`}
                                        value={p.price || ''}
                                        onChange={(e) => handleTypePrice(type, bhkKey, 'price', e.target.value)}
                                      />
                                      {errors[`price_${errKey}`] && <p className="text-xs text-destructive mt-1 font-medium">{errors[`price_${errKey}`]}</p>}
                                    </div>
                                  )}

                                  <div>
                                    <Label className="form-label">Area Unit</Label>
                                    <div className="flex mt-1.5 rounded-xl overflow-hidden border border-border">
                                      {cfg.units.map(unit => (
                                        <div key={unit} onClick={() => handleTypePrice(type, bhkKey, 'areaUnit', unit)}
                                          className={`flex-1 flex items-center justify-center text-sm font-bold cursor-pointer py-2.5 transition-colors ${(p.areaUnit || cfg.unit) === unit ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                                        >
                                          {unit}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {cfg.showAreaTypes ? (
                                    <div className="space-y-3">
                                      <Label className="form-label">Area by Type <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                                      {AREA_TYPES.map(atype => {
                                        const a = p.areaByType?.[atype] || {};
                                        return (
                                          <div key={atype} className="border border-border/40 rounded-xl p-3.5 bg-slate-50/60 dark:bg-slate-900/40">
                                            <p className="text-xs font-bold text-foreground mb-2">{atype}</p>
                                            {(p.priceMode || 'range') === 'range' ? (
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Input type="number" placeholder={`Min Area (${p.areaUnit || cfg.unit})`} className="form-input"
                                                  value={a.minArea || ''} onChange={(e) => handleAreaTypeField(type, bhkKey, atype, 'minArea', e.target.value)} />
                                                <Input type="number" placeholder={`Max Area (${p.areaUnit || cfg.unit})`} className="form-input"
                                                  value={a.maxArea || ''} onChange={(e) => handleAreaTypeField(type, bhkKey, atype, 'maxArea', e.target.value)} />
                                              </div>
                                            ) : (
                                              <Input type="number" placeholder={`Area (${p.areaUnit || cfg.unit})`} className="form-input"
                                                value={a.area || ''} onChange={(e) => handleAreaTypeField(type, bhkKey, atype, 'area', e.target.value)} />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className={`grid grid-cols-1 gap-4 ${(p.priceMode || 'range') === 'range' ? 'md:grid-cols-2' : ''}`}>
                                      {(p.priceMode || 'range') === 'range' ? (
                                        <>
                                          <div>
                                            <Label className="form-label">Min Area ({p.areaUnit || cfg.unit})</Label>
                                            <Input type="number" placeholder="e.g. 950" className="form-input"
                                              value={p.minArea || ''} onChange={(e) => handleTypePrice(type, bhkKey, 'minArea', e.target.value)} />
                                          </div>
                                          <div>
                                            <Label className="form-label">Max Area ({p.areaUnit || cfg.unit})</Label>
                                            <Input type="number" placeholder="e.g. 2400" className="form-input"
                                              value={p.maxArea || ''} onChange={(e) => handleTypePrice(type, bhkKey, 'maxArea', e.target.value)} />
                                          </div>
                                        </>
                                      ) : (
                                        <div>
                                          <Label className="form-label">Area ({p.areaUnit || cfg.unit})</Label>
                                          <Input type="number" placeholder="e.g. 1200" className="form-input"
                                            value={p.area || ''} onChange={(e) => handleTypePrice(type, bhkKey, 'area', e.target.value)} />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {(() => {
                                    const pps = calcPricePerSqft(p, cfg.showAreaTypes);
                                    const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;
                                    const display = (p.priceMode || 'range') === 'fixed'
                                      ? (pps.value ? fmt(pps.value) : null)
                                      : (pps.min && pps.max ? `${fmt(pps.min)} – ${fmt(pps.max)}` : null);
                                    return (
                                      <div>
                                        <Label className="form-label">Price per {p.areaUnit || cfg.unit} <span className="text-muted-foreground font-normal">(Auto-calculated)</span></Label>
                                        <div className="form-input flex items-center bg-slate-100 dark:bg-slate-900 text-foreground font-bold cursor-not-allowed select-none">
                                          {display || <span className="text-muted-foreground font-normal">Enter price & Super Built-up Area to calculate</span>}
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <Label className="form-label">Total Units <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                                      <Input type="number" placeholder="e.g. 500" className="form-input"
                                        value={p.units || ''} onChange={(e) => handleTypePrice(type, bhkKey, 'units', e.target.value)} />
                                    </div>
                                    <div>
                                      <Label className="form-label">Total Towers <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                                      <Input type="number" placeholder="e.g. 8" className="form-input"
                                        value={p.towers || ''} onChange={(e) => handleTypePrice(type, bhkKey, 'towers', e.target.value)} />
                                    </div>
                                    <div>
                                      <Label className="form-label">Total Floors <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                                      <Input type="number" placeholder="e.g. 14" className="form-input"
                                        value={p.floors || ''} onChange={(e) => handleTypePrice(type, bhkKey, 'floors', e.target.value)} />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6">
                  <Label className="form-label">Payment Plans Available <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {PAYMENT_PLANS.map(plan => (
                      <div key={plan} className="flex items-start space-x-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-border/50">
                        <Checkbox id={`plan-${plan}`} checked={formData.paymentPlans.includes(plan)}
                          onCheckedChange={(checked) => handleMultiSelect('paymentPlans', plan, checked)} className="mt-0.5" />
                        <Label htmlFor={`plan-${plan}`} className="cursor-pointer text-sm font-medium leading-tight">{plan}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 4 - PROJECT STATUS */}
              <div className="form-section-container">
                <h2 className="form-section-heading">4. Project Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="form-label">Project Status <span className="text-destructive">*</span></Label>
                    <Select value={formData.projectStatus} onValueChange={(val) => handleInputChange('projectStatus', val)}>
                      <SelectTrigger className={`form-input ${errors.projectStatus ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
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

                  {POSSESSION_REQUIRED_STATUSES.includes(formData.projectStatus) && (
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

                </div>
              </div>

              {/* SECTION 5 - LOCATION */}
              <div className="form-section-container">
                <h2 className="form-section-heading">5. Location Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="form-label">City <span className="text-destructive">*</span></Label>
                    <Select value={formData.city} onValueChange={(val) => handleInputChange('city', val)}>
                      <SelectTrigger className={`form-input ${errors.city ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        {LISTING_ZONES.map(z => (
                          <SelectItem key={z.value} value={z.value} disabled={z.comingSoon}>
                            {z.comingSoon ? `${z.label} (Coming soon…)` : z.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city && <p className="text-xs text-destructive mt-1 font-medium">{errors.city}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Sector / Area <span className="text-destructive">*</span></Label>
                    <Combobox
                      options={ZONE_SECTORS[formData.city] || []}
                      value={formData.sector}
                      onChange={(val) => handleInputChange('sector', val)}
                      disabled={!formData.city}
                      error={!!errors.sector}
                      placeholder={formData.city ? 'Select Sector' : 'Select City first'}
                      searchPlaceholder="Type to search sector/area/village..."
                      emptyText="No matching sector/area/village."
                    />
                    {errors.sector && <p className="text-xs text-destructive mt-1 font-medium">{errors.sector}</p>}
                  </div>
                  <div>
                    <Label className="form-label">Society / Colony Name <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                    <Input
                      placeholder="e.g. Godrej Woods, ATS Dolce"
                      className="form-input"
                      value={formData.societyName}
                      onChange={(e) => handleInputChange('societyName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="form-label">Landmark <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                    <Input
                      placeholder="e.g. Near Pari Chowk"
                      className="form-input"
                      value={formData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="form-label">Project Address <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
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
                  <div className="md:col-span-2">
                    <Label className="form-label mb-0">Connectivity &amp; Nearby Facilities <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                    <p className="text-xs text-muted-foreground mb-3">Fill in whichever apply — nearest place and its distance or drive time.</p>
                    <ConnectivityFields value={formData.connectivity} onChange={handleConnectivityChange} />
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

              {/* SECTION 7 - BEST FOR */}
              {bestForOptions.length > 0 && (
                <div className="form-section-container">
                  <h2 className="form-section-heading">7. Best For <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span></h2>
                  <p className="text-xs text-muted-foreground -mt-4 mb-4">Select whatever fits this project.</p>
                  <div className="flex flex-wrap gap-2">
                    {bestForOptions.map(item => {
                      const isSelected = formData.bestFor.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleMultiSelect('bestFor', item, !isSelected)}
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
              )}

              {/* SECTION 8 - MEDIA */}
              <div className="form-section-container">
                <h2 className="form-section-heading">8. Media & Attachments <span className="text-sm font-normal text-muted-foreground">(Optional)</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <div className="space-y-3">
                    <Label className="form-label">Project Images (Max 20, 5MB each)</Label>
                    {existingMedia.projectImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {existingMedia.projectImages.map((url, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border/60 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeExistingMediaItem('projectImages', i)}
                              className="absolute top-1 right-1 bg-black/60 hover:bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors relative">
                      <Input
                        type="file"
                        multiple
                        accept={IMAGE_ACCEPT_WITH_HEIC}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange('projectImages', e, 20 - existingMedia.projectImages.length, 5)}
                      />
                      <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Click or drag images to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP, HEIC (iPhone)</p>
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
                    {existingMedia.brochure && !files.brochure && (
                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-800 px-3 py-2 rounded-lg text-sm">
                        <a href={`${API_SERVER_URL}/projects/${editId}/brochure`} target="_blank" rel="noopener noreferrer" className="truncate font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">View current brochure</a>
                        <button type="button" onClick={() => setExistingMedia(prev => ({ ...prev, brochure: '' }))} className="text-destructive shrink-0 ml-2" title="Remove"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors relative">
                      <Input
                        type="file"
                        accept="application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange('brochure', e, 1, 10)}
                      />
                      <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">{existingMedia.brochure ? 'Replace Brochure' : 'Upload Project Brochure'}</p>
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
                    {existingMedia.projectVideo && !files.projectVideo && (
                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-800 px-3 py-2 rounded-lg text-sm">
                        <a href={existingMedia.projectVideo} target="_blank" rel="noopener noreferrer" className="truncate font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">View current video</a>
                        <button type="button" onClick={() => setExistingMedia(prev => ({ ...prev, projectVideo: '' }))} className="text-destructive shrink-0 ml-2" title="Remove"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors relative">
                      <Input
                        type="file"
                        accept="video/mp4, video/quicktime, video/x-msvideo"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange('projectVideo', e, 1, 100)}
                      />
                      <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">{existingMedia.projectVideo ? 'Replace Video' : 'Upload Promotional Video'}</p>
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
                    {existingMedia.floorPlans.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {existingMedia.floorPlans.map((url, i) => (
                          <div key={i} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1.5 rounded-lg text-xs">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Plan {i + 1}</a>
                            <button type="button" onClick={() => removeExistingMediaItem('floorPlans', i)} className="text-destructive" title="Remove"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors relative">
                      <Input
                        type="file"
                        multiple
                        accept={`${IMAGE_ACCEPT_WITH_HEIC},application/pdf`}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange('floorPlans', e, 10 - existingMedia.floorPlans.length, 5)}
                      />
                      <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">Upload Floor Plans</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, HEIC (iPhone), PDF</p>
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

              {/* SECTION 9 - DOCUMENTS */}
              <div className="form-section-container">
                <h2 className="form-section-heading">9. Documents <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span></h2>
                <p className="text-xs text-muted-foreground -mt-4 mb-5">PDF, JPG, PNG or HEIC · max {MAX_DOCUMENT_MB}MB each. Verified documents build buyer trust.</p>

                {/* RERA & GST — number field + "Applied" toggle + certificate upload, each as one row */}
                <div className="space-y-3 mb-3">
                  <div className="p-3 rounded-xl border border-border/60 bg-slate-50 dark:bg-slate-950">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div>
                          <Label className="form-label mb-1.5">RERA Registration <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                          <Input
                            placeholder="RERA Registration Number"
                            className="form-input w-full sm:max-w-sm"
                            value={formData.reraNumber}
                            onChange={(e) => handleInputChange('reraNumber', e.target.value)}
                            disabled={formData.reraApplied}
                          />
                        </div>
                        <div className="flex items-center space-x-2 sm:mt-6">
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
                      <div className="sm:mt-6">
                        <CertificateUpload docKey="reraCertificate" label="RERA Certificate" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border/60 bg-slate-50 dark:bg-slate-950">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div>
                          <Label className="form-label mb-1.5">GST Number <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                          <Input
                            placeholder="e.g. 09ABCDE1234F1Z5"
                            maxLength={15}
                            className={`form-input w-full sm:max-w-sm uppercase ${errors.gstNumber ? 'border-destructive' : ''}`}
                            value={formData.gstNumber}
                            onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                          />
                          {errors.gstNumber && <p className="text-xs text-destructive mt-1 font-medium">{errors.gstNumber}</p>}
                        </div>
                        <div className="flex items-center space-x-2 sm:mt-6">
                          <Checkbox
                            id="gstApplied"
                            checked={isDocumentApplied('gstCertificate')}
                            onCheckedChange={(checked) => toggleDocumentApplied('gstCertificate', Boolean(checked))}
                          />
                          <Label htmlFor="gstApplied" className="cursor-pointer font-medium text-sm">GST Applied</Label>
                        </div>
                      </div>
                      <div className="sm:mt-6">
                        <CertificateUpload docKey="gstCertificate" label="GST Certificate" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PROJECT_DOCUMENT_TYPES
                    // RERA & GST have their own row above, with the number field alongside.
                    .filter(({ key }) => key !== 'reraCertificate' && key !== 'gstCertificate')
                    .filter(({ statuses }) => !statuses || statuses.includes(formData.projectStatus))
                    .map(({ key, label, statuses, canApply }) => {
                      const file = files.documents[key];
                      const existingUrl = existingMedia.documents[key];
                      const applied = canApply && isDocumentApplied(key);
                      return (
                        <div key={key} className={`p-3 rounded-xl border ${file || existingUrl ? 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-900/20 dark:border-emerald-800' : applied ? 'border-amber-300 bg-amber-50/60 dark:bg-amber-900/20 dark:border-amber-800' : 'border-border/60 bg-slate-50 dark:bg-slate-950'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${file || existingUrl ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-white dark:bg-slate-900 border border-border/60'}`}>
                            {file || existingUrl ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {file
                                ? file.name
                                : existingUrl
                                  ? <a href={existingUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">View uploaded file</a>
                                  : applied
                                    ? <span className="font-semibold text-amber-700 dark:text-amber-400">Applied — awaiting certificate</span>
                                    : statuses ? 'For completed projects, if applicable' : 'Not uploaded'}
                            </p>
                          </div>
                          {applied ? null : file ? (
                            <button type="button" onClick={() => removeDocument(key)} className="text-destructive p-1 shrink-0" title="Remove">
                              <X className="w-4 h-4" />
                            </button>
                          ) : existingUrl ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <label className="text-xs font-bold text-[#10B981] cursor-pointer hover:underline">
                                Replace
                                <input type="file" accept={`application/pdf,${IMAGE_ACCEPT_WITH_HEIC}`} className="hidden" onChange={(e) => handleDocumentChange(key, e)} />
                              </label>
                              <button type="button" onClick={() => removeExistingDocument(key)} className="text-destructive p-1" title="Remove">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#10B981] border border-[#10B981]/40 hover:bg-[#10B981]/10 px-3 py-1.5 rounded-lg cursor-pointer">
                              <UploadCloud className="w-3.5 h-3.5" /> Upload
                              <input
                                type="file"
                                accept={`application/pdf,${IMAGE_ACCEPT_WITH_HEIC}`}
                                className="hidden"
                                onChange={(e) => handleDocumentChange(key, e)}
                              />
                            </label>
                          )}
                        </div>
                        {canApply && (
                          <label className="mt-2 ml-12 flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer w-fit">
                            <Checkbox checked={applied} onCheckedChange={(checked) => toggleDocumentApplied(key, Boolean(checked))} />
                            Applied
                          </label>
                        )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* SECTION 10 - BUILDER CONTACT DETAILS */}
              <div className="form-section-container">
                <h2 className="form-section-heading">10. Official Contact Details</h2>
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
                        placeholder="10 digit mobile number" 
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
                    <Label className="form-label">Company Website <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                    <Input 
                      type="url"
                      placeholder="https://..." 
                      className="form-input"
                      value={formData.companyWebsite}
                      onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="form-label">Office Address <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
                    <Textarea 
                      placeholder="Head office address" 
                      className="min-h-[48px] rounded-xl bg-slate-50 dark:bg-slate-950 border-border"
                      value={formData.officeAddress}
                      onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 11 - PROJECT HIGHLIGHTS */}
              <div className="form-section-container">
                <h2 className="form-section-heading">11. Project Highlights <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span></h2>

                {antiBypassWarning && (
                  <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center">
                    <X className="w-5 h-5 mr-2 shrink-0" />
                    Phone numbers and contact details are not allowed in description fields.
                  </div>
                )}

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
              </div>

              {/* SECTION 12 - DESCRIPTION (with AI) */}
              <div className={`form-section-container relative overflow-hidden ${generatingDescription ? 'min-h-[280px]' : ''}`}>
                <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
                  <h2 className="form-section-heading mb-0">12. Description <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span></h2>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateDescription}
                    disabled={generatingDescription}
                    className="h-8 gap-1.5 text-xs font-bold border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10 hover:text-[#10B981]"
                  >
                    {generatingDescription ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {generatingDescription ? 'Generating...' : 'Make Description with AI'}
                  </Button>
                </div>
                <Textarea
                  placeholder="Describe what makes this project special. (Note: Phone numbers will be hidden for privacy)"
                  className="min-h-[160px] rounded-xl bg-slate-50 dark:bg-slate-950 resize-y border-border"
                  maxLength={3000}
                  value={formData.description}
                  onChange={(e) => handleTextareaChange('description', e.target.value)}
                />
                <AiGenerationOverlay active={generatingDescription} stepIndex={aiStepIndex} />
              </div>

              {/* SECTION 13 - SPECIAL OFFER */}
              <SpecialOfferSection
                title="13. Special Offer"
                containerClassName="form-section-container"
                values={{ offerTitle: formData.offerTitle, offerDetails: formData.offerDetails, offerValidTill: formData.offerValidTill }}
                onChange={(name, value) => handleInputChange(name, value)}
              />

              {/* SECTION 10 - CONFIRMATION */}
              <div className="bg-primary/5 dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-primary/20">
                {!editId && (
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
                )}

                <div className={editId ? '' : 'mt-8'}>
                  <Button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="w-full md:w-auto h-14 px-12 text-lg font-bold bg-brand-green hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-brand-green/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> {editId ? 'Saving...' : 'Processing...'}</>
                    ) : (
                      editId ? 'Save Changes' : 'Submit Project Listing'
                    )}
                  </Button>
                </div>
              </div>

            </form>
          </div>
        </div>
    </>
  );
};

export default ProjectListingForm;
