
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  MapPin, Home, Building2, Layers, Maximize2, Ruler, CheckCircle, 
  Calendar, Flag, Train, Car, Plane, Heart, BookOpen, Phone, MessageCircle, 
  ArrowRight, ShieldCheck, Zap, Waves, Trees, Dumbbell, Coffee, Shield, Loader2
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

const IMAGES = [
  'https://images.unsplash.com/photo-1643732994186-6755311b4306',
  'https://images.unsplash.com/photo-1515263487990-61b07816b324',
  'https://images.unsplash.com/photo-1692830085898-802ee151c0b6',
  'https://images.unsplash.com/photo-1543766303-014a5662f9e2',
  'https://images.unsplash.com/photo-1539528408517-3e496473be3c'
];

const OVERVIEW_DETAILS = [
  { icon: Home, label: 'Property Types', value: '2, 3 BHK Apartments' },
  { icon: Building2, label: 'Total Units', value: '500+' },
  { icon: Layers, label: 'Total Towers', value: '8' },
  { icon: Maximize2, label: 'Total Floors', value: 'G+14' },
  { icon: Ruler, label: 'Area Range', value: '950 — 1650 Sq.ft' },
  { icon: CheckCircle, label: 'Possession', value: 'Ready to Move' },
  { icon: Calendar, label: 'Launch Year', value: '2021' },
  { icon: Flag, label: 'Completion Year', value: '2024' }
];

const CONFIGURATIONS = [
  { type: '2 BHK', area: '950 — 1100 Sq.ft', price: '₹45 Lac — ₹55 Lac', status: 'Available', badgeColor: 'bg-emerald-500' },
  { type: '3 BHK', area: '1350 — 1650 Sq.ft', price: '₹65 Lac — ₹85 Lac', status: 'Available', badgeColor: 'bg-emerald-500' },
  { type: '3 BHK + Study', area: '1600 — 1800 Sq.ft', price: '₹80 Lac — ₹95 Lac', status: 'Limited Units', badgeColor: 'bg-amber-500' }
];

const AMENITIES = [
  { category: 'LIFESTYLE', items: ['Clubhouse', 'Swimming Pool', 'Gymnasium', 'Jogging Track', 'Kids Play Area', 'Sports Court'] },
  { category: 'SECURITY', items: ['24/7 Security', 'CCTV', 'Gated Entry', 'Intercom', 'Fire Fighting System'] },
  { category: 'INFRASTRUCTURE', items: ['Power Backup', 'Lifts', 'Water Supply', 'EV Charging', 'Piped Gas', 'Rainwater Harvesting'] },
  { category: 'CONVENIENCE', items: ['Visitor Parking', 'Maintenance Staff', 'Shopping Complex', 'Park', 'Wide Roads'] }
];

const LOCATION_POINTS = [
  { icon: MapPin, text: 'Sector 1, Greater Noida' },
  { icon: MapPin, text: 'Near: Pari Chowk, Knowledge Park' },
  { icon: Train, text: 'Metro: Aqua Line — 2 km' },
  { icon: Car, text: 'Highway: Yamuna Expressway — 5 km' },
  { icon: Plane, text: 'Airport: Jewar International — 25 km' },
  { icon: Heart, text: 'Hospital: Fortis — 3 km' },
  { icon: BookOpen, text: 'School: DPS — 1 km' }
];

const SIMILAR_PROJECTS = [
  { name: 'Skyline Avenue', builder: 'Definitive Homes', location: 'Sector 150, Noida', price: '₹85L - ₹1.5Cr', status: 'UNDER CONSTRUCTION', image: 'https://images.unsplash.com/photo-1580041065738-e72023775cdc' },
  { name: 'Oasis Grand', builder: 'Prime Builders', location: 'Sector 4, Greater Noida', price: '₹55L - ₹95L', status: 'READY TO MOVE', image: 'https://images.unsplash.com/photo-1618404399394-123316e32859' },
  { name: 'Eco Village', builder: 'Green Earth Devs', location: 'Sector 1, Greater Noida', price: '₹40L - ₹75L', status: 'NEW LAUNCH', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00' }
];

const ProjectDetailPage = () => {
  const { projectName } = useParams();
  const [mainImage, setMainImage] = useState(IMAGES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    sameAsMobile: true,
    config: '',
    budget: '',
    timeline: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [projectName]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const scrollToEnquiry = () => {
    document.getElementById('enquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Mobile must be exactly 10 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Thank you! Your enquiry has been received. Our team will contact you within 24 hours.', {
        duration: 5000,
        icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
      });
      setFormData({
        name: '',
        mobile: '',
        sameAsMobile: true,
        config: '',
        budget: '',
        timeline: ''
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const formattedProjectName = projectName ? projectName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Greenwood Heights';

  return (
    <>
      <Helmet>
        <title>{formattedProjectName} - Residential Project in Greater Noida | Growperty</title>
        <meta name="description" content={`Discover ${formattedProjectName} by ABC Developers. 2 & 3 BHK premium apartments in Sector 1, Greater Noida. View floor plans, amenities, and price list.`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-grow pb-20">
          
          {/* SECTION 1 — IMAGE GALLERY */}
          <section className="bg-slate-900 w-full">
            <div className="max-w-7xl mx-auto">
              <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.5/1] overflow-hidden bg-black relative">
                <motion.img 
                  key={mainImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  src={mainImage} 
                  alt={formattedProjectName} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
              </div>
              
              <div className="flex overflow-x-auto gap-2 p-4 bg-slate-900 scrollbar-hide snap-x">
                {IMAGES.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`relative shrink-0 w-24 h-16 sm:w-32 sm:h-24 rounded-lg overflow-hidden snap-center transition-all ${mainImage === img ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900 opacity-100' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: Main Content */}
              <div className="lg:col-span-2 space-y-10">
                
                {/* SECTION 2 — PROJECT HEADER */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 border border-border/50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-blue dark:text-white tracking-tight">
                          {formattedProjectName}
                        </h1>
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-wide border-none hidden sm:inline-flex">
                          READY TO MOVE
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-medium flex items-center gap-2 mb-2">
                        By <span className="text-foreground font-bold">ABC Developers</span>
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                        Sector 1, Greater Noida, UP
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-wide border-none sm:hidden mb-3">
                        READY TO MOVE
                      </Badge>
                      <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Starting Price</p>
                      <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹45 Lac — ₹85 Lac
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">RERA: UP/RERA/PRJ/123456</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
                    <Button className="flex-1 h-12 text-base font-bold bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl shadow-lg shadow-brand-blue/20">
                      <Phone className="w-5 h-5 mr-2" />
                      <a href="tel:+919953537876">Call Now</a>
                    </Button>
                    <Button className="flex-1 h-12 text-base font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-lg shadow-[#25D366]/20">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      <a href={`https://wa.me/919953537876?text=${encodeURIComponent(`Hi, I'm interested in ${formattedProjectName} project on Growperty.com`)}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    </Button>
                    <Button onClick={scrollToEnquiry} variant="outline" className="flex-1 h-12 text-base font-bold border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                      Enquire
                    </Button>
                  </div>
                </div>

                {/* SECTION 3 — PROJECT OVERVIEW */}
                <div>
                  <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">Project Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {OVERVIEW_DETAILS.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-border/50 text-center flex flex-col items-center justify-center hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                            <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="font-bold text-foreground text-sm">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 4 — ABOUT PROJECT */}
                <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-border/50">
                  <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-4">About {formattedProjectName}</h2>
                  <p className="text-muted-foreground leading-relaxed text-balance">
                    {formattedProjectName} is a premium residential project by ABC Developers located in the heart of Sector 1, Greater Noida. The project offers spacious 2 and 3 BHK apartments with modern amenities and excellent connectivity to Noida, Delhi, and Yamuna Expressway. Built with world-class construction standards and eco-friendly features, it is the perfect choice for families and investors looking for quality living. Experience a blend of nature and luxury with 70% open green spaces and state-of-the-art club facilities.
                  </p>
                </div>

                {/* SECTION 5 — UNIT CONFIGURATIONS */}
                <div>
                  <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">Available Configurations</h2>
                  <div className="space-y-4">
                    {CONFIGURATIONS.map((config, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-foreground">{config.type}</h3>
                            <Badge className={`${config.badgeColor} text-white border-none font-semibold text-xs`}>
                              {config.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground font-medium flex items-center gap-1.5">
                            <Ruler className="w-4 h-4" /> {config.area}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{config.price}</p>
                        </div>
                        <div className="w-full md:w-auto">
                          <Button onClick={scrollToEnquiry} variant="outline" className="w-full md:w-auto border-brand-blue text-brand-blue hover:bg-brand-blue/5 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">
                            Request Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 6 — AMENITIES */}
                <div>
                  <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">Project Amenities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {AMENITIES.map((section, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-border/50">
                        <h3 className="text-sm font-bold text-brand-blue dark:text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                          {idx === 0 && <Coffee className="w-4 h-4 text-emerald-500" />}
                          {idx === 1 && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                          {idx === 2 && <Zap className="w-4 h-4 text-emerald-500" />}
                          {idx === 3 && <Home className="w-4 h-4 text-emerald-500" />}
                          {section.category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {section.items.map((item, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 7 — LOCATION & CONNECTIVITY */}
                <div>
                  <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">Location & Connectivity</h2>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-border/50 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                      {LOCATION_POINTS.map((point, idx) => {
                        const Icon = point.icon;
                        return (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-foreground font-medium text-sm leading-snug">{point.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="w-full h-80 rounded-2xl overflow-hidden shadow-sm border border-border/50 bg-slate-200 relative">
                    <iframe 
                      title="Project Location Map"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14031.545722421373!2d77.4988771!3d28.4534167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cc02c8eb18bc5%3A0xc3f0b2f6ef536ec6!2sSector%201%2C%20Greater%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen="" 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0"
                    ></iframe>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Sticky Form Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 space-y-6">
                  
                  {/* SECTION 8 — ENQUIRY FORM */}
                  <div id="enquiry-form" className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 border border-border/50 scroll-mt-28">
                    <h3 className="text-2xl font-extrabold text-brand-blue dark:text-white mb-2">Interested in this Project?</h3>
                    <p className="text-sm text-muted-foreground mb-8 font-medium">Leave your details and our expert team will contact you within 24 hours.</p>

                    <form onSubmit={handleEnquirySubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-semibold">Full Name <span className="text-destructive">*</span></Label>
                        <Input 
                          id="name" 
                          placeholder="Rajesh Kumar"
                          className={`h-12 rounded-xl bg-slate-50 dark:bg-slate-950 ${errors.name ? 'border-destructive ring-destructive' : ''}`}
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                        {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="font-semibold">Mobile Number <span className="text-destructive">*</span></Label>
                        <div className="flex">
                          <div className="flex items-center justify-center bg-muted border border-r-0 border-input rounded-l-xl px-4 text-muted-foreground font-medium">
                            +91
                          </div>
                          <Input 
                            id="mobile" 
                            type="tel"
                            maxLength={10}
                            placeholder="9876543210"
                            className={`h-12 rounded-l-none rounded-r-xl bg-slate-50 dark:bg-slate-950 ${errors.mobile ? 'border-destructive ring-destructive z-10' : ''}`}
                            value={formData.mobile}
                            onChange={(e) => handleInputChange('mobile', e.target.value)}
                          />
                        </div>
                        {errors.mobile && <p className="text-xs text-destructive font-medium">{errors.mobile}</p>}
                      </div>

                      <div className="flex items-center space-x-2 pt-1 pb-2">
                        <Checkbox 
                          id="sameAsMobile" 
                          checked={formData.sameAsMobile}
                          onCheckedChange={(checked) => handleInputChange('sameAsMobile', checked)}
                        />
                        <Label htmlFor="sameAsMobile" className="cursor-pointer font-medium text-sm text-muted-foreground">WhatsApp is same as mobile number</Label>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">Configuration interested in</Label>
                        <Select value={formData.config} onValueChange={(val) => handleInputChange('config', val)}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950">
                            <SelectValue placeholder="Select Configuration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2bhk">2 BHK</SelectItem>
                            <SelectItem value="3bhk">3 BHK</SelectItem>
                            <SelectItem value="3bhk-study">3 BHK + Study</SelectItem>
                            <SelectItem value="not-sure">Not Sure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold">When do you want to buy?</Label>
                        <Select value={formData.timeline} onValueChange={(val) => handleInputChange('timeline', val)}>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950">
                            <SelectValue placeholder="Select Timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediately</SelectItem>
                            <SelectItem value="1month">Within 1 Month</SelectItem>
                            <SelectItem value="3months">Within 3 Months</SelectItem>
                            <SelectItem value="6months">Within 6 Months</SelectItem>
                            <SelectItem value="exploring">Just Exploring</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 mt-4 transition-all active:scale-[0.98]"
                      >
                        {isSubmitting ? (
                          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                        ) : (
                          'Send Enquiry'
                        )}
                      </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border/50 text-center">
                      <p className="text-sm font-bold text-foreground mb-4">Or contact us directly:</p>
                      <div className="flex flex-col gap-3">
                        <Button asChild variant="outline" className="w-full h-12 font-bold border-brand-blue text-brand-blue hover:bg-brand-blue/5 dark:border-slate-700 dark:text-white rounded-xl">
                          <a href="tel:+919953537876">
                            <Phone className="w-4 h-4 mr-2" />
                            Call +91 9953537876
                          </a>
                        </Button>
                        <Button asChild className="w-full h-12 font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-md">
                          <a href="https://wa.me/919953537876" target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp +91 9953537876
                          </a>
                        </Button>
                      </div>
                      <div className="mt-6 flex items-start gap-2 text-left bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-border/50">
                        <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          Builder/owner contact is not shared publicly. All enquiries are securely handled by the trusted Growperty team.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* SECTION 9 — SIMILAR PROJECTS */}
            <div className="mt-20 pt-16 border-t border-border/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue dark:text-white">Similar Projects You May Like</h2>
                <Link gap-2 to="/projects" className="hidden sm:flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {SIMILAR_PROJECTS.map((project, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-border/50 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className={`px-3 py-1.5 font-bold text-[10px] uppercase shadow-md border-none ${project.status === 'READY TO MOVE' ? 'bg-emerald-500' : project.status === 'UNDER CONSTRUCTION' ? 'bg-amber-500' : 'bg-blue-500'} text-white`}>
                          {project.status}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-5 pt-12">
                        <h3 className="text-xl font-bold text-white mb-1">{project.name}</h3>
                        <p className="text-slate-300 text-xs font-medium">by {project.builder}</p>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-start gap-2 text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                        <span className="font-medium text-sm">{project.location}</span>
                      </div>
                      <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-6">{project.price}</p>
                      
                      <div className="mt-auto">
                        <Button asChild variant="outline" className="w-full border-border hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl">
                          <Link to={`/projects/${project.name.toLowerCase().replace(/\s+/g, '-')}`}>
                            View Project
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 text-center sm:hidden">
                <Button asChild variant="ghost" className="font-bold text-emerald-600">
                  <Link to="/projects">View All Projects <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProjectDetailPage;
