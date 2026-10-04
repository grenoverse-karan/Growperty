
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import {
  MapPin, Building2, Layers, CheckCircle,
  Calendar, Phone, MessageCircle, ArrowRight, ShieldCheck, Loader2,
  Image as ImageIcon, FileText, Video, Sparkles, Clock,
  LandPlot, Building, ArrowUpFromLine, Home, KeyRound, Trees,
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Checkbox } from '@/components/ui/checkbox.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import apiServerClient, { API_SERVER_URL } from '@/lib/apiServerClient.js';
import { formatIndianPrice } from '@/hooks/useProperties.js';
import SectorMap from '@/components/SectorMap.jsx';
import { getActiveOffer, getOfferPhrase } from '@/lib/offerUtils.js';
import { flattenPricing } from '@/lib/projectPricing.js';
import { PROJECT_DOCUMENT_TYPES } from '@/lib/listingOptions.js';
import { isReraApproved } from '@/lib/projectDisplay.js';
import ConnectivityList from '@/components/ConnectivityList.jsx';
import { PLATFORM_PHONE } from '@/constants/contactInfo.js';
import { openWhatsApp } from '@/lib/whatsappLink.js';
import ImageLightbox from '@/components/ImageLightbox.jsx';


const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '', mobile: '', sameAsMobile: true, config: '', timeline: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiServerClient.fetch(`/projects/${id}`);
        if (!res.ok) throw new Error(res.status === 404 ? 'Project not found' : `Server error: ${res.status}`);
        const data = await res.json();
        setProject(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
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
    setTimeout(() => {
      toast.success('Thank you! Your enquiry has been received. Our team will contact you within 24 hours.', {
        duration: 5000,
        icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
      });
      setFormData({ name: '', mobile: '', sameAsMobile: true, config: '', timeline: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">{error || 'Project not found'}</h1>
          <Button asChild className="mt-4"><Link to="/projects">Browse Other Projects</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const { rows: pricingRows, range } = flattenPricing(project.propertyTypePricing);
  const galleryImages = Array.isArray(project.projectImages) ? project.projectImages : [];
  const mainImage = galleryImages[activeImg] || galleryImages[0];
  const activeOffer = getActiveOffer(project);
  const listedAgo = (() => {
    const dateStr = project.createdAt;
    if (!dateStr) return null;
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    if (mins < 60)   return `${mins || 1}m ago`;
    if (hours < 24)  return `${hours}hr ago`;
    if (days === 1)  return 'Yesterday';
    if (days < 7)    return `${days} days ago`;
    if (weeks === 1) return '1 week ago';
    if (weeks < 5)   return `${weeks} weeks ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  })();
  const isDocApplied = (key) =>
    key === 'reraCertificate' ? Boolean(project.reraApplied) : (project.documentsApplied || []).includes(key);

  return (
    <>
      <Helmet>
        <title>{project.projectName} - {project.projectType} Project in {project.city} | Growperty</title>
        <meta name="description" content={`${project.projectName} by ${project.builderName} in ${[project.sector, project.societyName, project.city].filter(Boolean).join(', ')}. View pricing, amenities, and configurations.`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-grow pb-20">

          {/* SECTION 1 — IMAGE GALLERY */}
          <section className="bg-slate-900 w-full">
            <div className="max-w-7xl mx-auto">
              <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.5/1] overflow-hidden bg-black relative flex items-center justify-center">
                {mainImage ? (
                  <img
                    key={activeImg}
                    src={mainImage}
                    alt={`${project.projectName} - image ${activeImg + 1}`}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => setLightboxOpen(true)}
                  />
                ) : (
                  <ImageIcon className="w-16 h-16 text-slate-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
              </div>

              <ImageLightbox
                images={galleryImages}
                index={activeImg}
                onIndexChange={setActiveImg}
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                alt={project.projectName}
              />

              {galleryImages.length > 1 && (
                <div className="flex overflow-x-auto gap-2 p-4 bg-slate-900 scrollbar-hide snap-x">
                  {galleryImages.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`relative shrink-0 w-24 h-16 sm:w-32 sm:h-24 rounded-lg overflow-hidden snap-center border-2 transition-all ${idx === activeImg ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt={`${project.projectName} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT COLUMN */}
              <div className="lg:col-span-2 space-y-10">

                {/* SECTION 2 — HEADER */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 border border-border/50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-blue dark:text-white tracking-tight">
                          {project.projectName}
                        </h1>
                        {project.projectStatus && (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-wide border-none">
                            {project.projectStatus.toUpperCase()}
                          </Badge>
                        )}
                        {isReraApproved(project) && (
                          <Badge className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> RERA Approved
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground font-medium flex items-center gap-2 mb-2">
                        By <span className="text-foreground font-bold">{project.builderName}</span>
                      </p>
                      {(project.sector || project.city) && (
                        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                          <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                          {[project.sector, project.societyName, project.city].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {listedAgo && (
                        <p className="text-muted-foreground flex items-center gap-1.5 text-sm mt-1.5">
                          <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                          Listed {listedAgo}
                        </p>
                      )}
                    </div>
                    {range && (
                      <div className="text-left md:text-right">
                        <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Starting Price</p>
                        <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatIndianPrice(range.min)} – {formatIndianPrice(range.max)}
                        </p>
                        {project.reraNumber && <p className="text-xs text-muted-foreground mt-2">RERA: {project.reraNumber}</p>}
                        {project.gstNumber && <p className="text-xs text-muted-foreground mt-0.5">GSTIN: {project.gstNumber}</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
                    <Button asChild className="flex-1 h-12 text-base font-bold bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl shadow-lg shadow-brand-blue/20">
                      <a href={`tel:${PLATFORM_PHONE}`}><Phone className="w-5 h-5 mr-2" />Call Now</a>
                    </Button>
                    <Button
                      onClick={() => openWhatsApp(`Hi, I'm interested in ${project.projectName}: ${window.location.href.split('?')[0]}`)}
                      className="flex-1 h-12 text-base font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-lg shadow-[#25D366]/20"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />WhatsApp
                    </Button>
                    <Button onClick={scrollToEnquiry} variant="outline" className="flex-1 h-12 text-base font-bold border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
                      Enquire
                    </Button>
                  </div>
                </div>

                {/* SECTION 3 — OVERVIEW */}
                <div>
                  <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">Project Overview</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Building2, label: 'Property Types', value: project.propertyTypes?.join(', ') },
                      { icon: Layers, label: 'Configurations', value: project.configurationAvailable?.join(', ') },
                      { icon: CheckCircle, label: 'Possession', value: project.expectedPossession || project.projectStatus },
                      { icon: Calendar, label: 'Launch Year', value: project.launchYear },
                      { icon: LandPlot, label: 'Land Area', value: project.landArea ? `${project.landArea} ${project.landAreaUnit || 'Acres'}` : null },
                      { icon: Building, label: 'Towers / Blocks', value: project.totalTowers },
                      { icon: ArrowUpFromLine, label: 'Floors', value: project.totalFloors },
                      { icon: Home, label: 'Total Units', value: project.totalUnits?.toLocaleString('en-IN') },
                      { icon: KeyRound, label: 'Units Available', value: project.unitsAvailable?.toLocaleString('en-IN') },
                      { icon: Trees, label: 'Open / Green Area', value: project.greenAreaPercent ? `${project.greenAreaPercent}%` : null },
                    ].filter(item => item.value).map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-border/50 text-center flex flex-col items-center justify-center">
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

                {/* SECTION 4 — ABOUT (AI/written description; USP shown as highlights) */}
                {(project.description || project.projectUSP) && (
                  <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 space-y-3">
                    <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-2">About {project.projectName}</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description || project.projectUSP}</p>
                    {project.description && project.projectUSP && (
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Highlights</p>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.projectUSP}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* SECTION 4A — FESTIVE OFFER (structured; hides itself after "valid till") */}
                {activeOffer && (
                  <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                        {activeOffer.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Special Offer</p>
                        {activeOffer.title && <p className="text-lg font-extrabold leading-tight">{activeOffer.title}</p>}
                        {activeOffer.details && <p className="text-sm font-semibold text-white/95">{getOfferPhrase(activeOffer.details)}</p>}
                        {activeOffer.validTill && (
                          <p className="text-xs font-semibold text-white/90 mt-1">
                            Valid till {activeOffer.validTill.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="absolute bottom-2 right-3 text-[10px] text-white/75">T&amp;C* apply</p>
                  </div>
                )}

                {/* SECTION 4B — SPECIAL OFFER */}
                {!activeOffer && project.hasSpecialOffer && project.specialOffers && (() => {
                  const isComingSoon = project.specialOffers.trim().toLowerCase().startsWith('coming soon');
                  const OfferIcon = isComingSoon ? Clock : Sparkles;
                  const theme = isComingSoon
                    ? {
                        wrap: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
                        icon: 'text-amber-500 dark:text-amber-400',
                        label: 'text-amber-600 dark:text-amber-500',
                        text: 'text-amber-700 dark:text-amber-400',
                      }
                    : {
                        wrap: 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-200 dark:border-emerald-900',
                        icon: 'text-emerald-600 dark:text-emerald-400',
                        label: 'text-emerald-600 dark:text-emerald-400',
                        text: 'text-emerald-700 dark:text-emerald-300',
                      };
                  return (
                    <div className={`flex items-start gap-3 p-6 rounded-2xl border ${theme.wrap}`}>
                      <OfferIcon className={`w-6 h-6 shrink-0 mt-0.5 ${theme.icon}`} />
                      <div>
                        <span className={`font-extrabold uppercase tracking-wide text-base block mb-1 ${theme.label}`}>Special Offer</span>
                        <p className={`font-semibold whitespace-pre-line leading-relaxed ${theme.text}`}>{project.specialOffers}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* SECTION 5 — CONFIGURATIONS */}
                {pricingRows.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">Available Configurations</h2>
                    <div className="space-y-4">
                      {pricingRows.map((row, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-1">{row.label}</h3>
                            {row.areaLabel && <p className="text-muted-foreground font-medium text-sm">{row.areaLabel}</p>}
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{row.priceLabel}</p>
                          </div>
                          <Button onClick={scrollToEnquiry} variant="outline" className="w-full md:w-auto border-brand-blue text-brand-blue hover:bg-brand-blue/5 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">
                            Request Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 6 — AMENITIES */}
                {project.amenities?.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">Project Amenities</h2>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-border/50">
                      <div className="flex flex-wrap gap-2">
                        {project.amenities.map((item, i) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 6B — BEST FOR */}
                {project.bestFor?.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">Best For</h2>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-border/50">
                      <div className="flex flex-wrap gap-2">
                        {project.bestFor.map((item, i) => (
                          <span key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 7 — LOCATION (sector-level only, no invented distances) */}
                <div>
                  <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">Location</h2>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-border/50 space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">
                        {[project.sector, project.societyName, project.landmark, project.city].filter(Boolean).join(', ')}
                      </span>
                    </div>
                    {project.connectivity?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Connectivity &amp; Nearby Facilities</p>
                        <ConnectivityList rows={project.connectivity} />
                      </div>
                    )}
                    {project.nearbyFamousPlace?.trim() && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{project.connectivity?.length ? 'Other Nearby Places' : 'Nearby Places'}</p>
                        <ul className="space-y-1.5">
                          {project.nearbyFamousPlace.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => (
                            <li key={i} className="text-sm font-medium text-foreground">{line}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <SectorMap sector={project.sector} city={project.city} />
                  </div>
                </div>

                {/* Attachments */}
                {/* Documents uploaded by the builder (or applied for) — RERA/GST
                    cards also show the registration number itself, not just the certificate. */}
                {(PROJECT_DOCUMENT_TYPES.some(({ key }) => project.documents?.[key] || isDocApplied(key))
                  || project.reraNumber?.trim() || project.gstNumber?.trim()) && (
                  <div>
                    <h2 className="text-2xl font-bold text-brand-blue dark:text-white mb-6">Documents</h2>
                    <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PROJECT_DOCUMENT_TYPES.filter(({ key }) => !project.documents?.[key] && isDocApplied(key)).map(({ key, label }) => {
                        const number = key === 'reraCertificate' ? project.reraNumber : key === 'gstCertificate' ? project.gstNumber : null;
                        return (
                        <div key={key} className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                          <span className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-foreground truncate">{label}</span>
                            {number && <span className="block text-xs text-muted-foreground truncate">{number}</span>}
                          </span>
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 shrink-0">Applied</span>
                        </div>
                        );
                      })}
                      {PROJECT_DOCUMENT_TYPES.filter(({ key }) => project.documents?.[key]).map(({ key, label }) => {
                        const number = key === 'reraCertificate' ? project.reraNumber : key === 'gstCertificate' ? project.gstNumber : null;
                        return (
                        <a
                          key={key}
                          href={`${API_SERVER_URL}/projects/${id}/documents/${key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors"
                        >
                          <span className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                            {key === 'reraCertificate' ? <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-foreground truncate">{label}</span>
                            {number && <span className="block text-xs text-muted-foreground truncate">{number}</span>}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">View</span>
                        </a>
                        );
                      })}
                      {[
                        { key: 'reraCertificate', label: 'RERA Registration', number: project.reraNumber },
                        { key: 'gstCertificate', label: 'GST Registration', number: project.gstNumber },
                      ].filter(({ key, number }) => number?.trim() && !project.documents?.[key] && !isDocApplied(key)).map(({ key, label, number }) => (
                        <div key={key} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-slate-50 dark:bg-slate-950">
                          <span className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-border/60 flex items-center justify-center shrink-0">
                            {key === 'reraCertificate' ? <ShieldCheck className="w-4 h-4 text-muted-foreground" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-foreground truncate">{label}</span>
                            <span className="block text-xs text-muted-foreground truncate">{number}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(project.brochure || project.projectVideo) && (
                  <div className="flex flex-wrap gap-3">
                    {project.brochure && (
                      <Button asChild variant="outline" className="font-bold">
                        <a href={`${API_SERVER_URL}/projects/${id}/brochure`} target="_blank" rel="noopener noreferrer"><FileText className="w-4 h-4 mr-2" />Download Brochure</a>
                      </Button>
                    )}
                    {project.projectVideo && (
                      <Button asChild variant="outline" className="font-bold">
                        <a href={project.projectVideo} target="_blank" rel="noopener noreferrer"><Video className="w-4 h-4 mr-2" />Watch Video</a>
                      </Button>
                    )}
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: Sticky Enquiry Form */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 space-y-6">
                  <div id="enquiry-form" className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 md:p-8 border border-border/50 scroll-mt-28">
                    <h3 className="text-2xl font-extrabold text-brand-blue dark:text-white mb-2">Interested in this Project?</h3>
                    <p className="text-sm text-muted-foreground mb-8 font-medium">Leave your details and our expert team will contact you within 24 hours.</p>

                    <form onSubmit={handleEnquirySubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-semibold">Full Name <span className="text-destructive">*</span></Label>
                        <Input
                          id="name"
                          placeholder="Enter name"
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
                            placeholder="Enter mobile number"
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

                      {project.configurationAvailable?.length > 0 && (
                        <div className="space-y-2">
                          <Label className="font-semibold">Configuration interested in</Label>
                          <Select value={formData.config} onValueChange={(val) => handleInputChange('config', val)}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950">
                              <SelectValue placeholder="Select Configuration" />
                            </SelectTrigger>
                            <SelectContent>
                              {project.configurationAvailable.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              <SelectItem value="not-sure">Not Sure</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

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
                          <a href={`tel:${PLATFORM_PHONE}`}>
                            <Phone className="w-4 h-4 mr-2" />
                            Call +91 {PLATFORM_PHONE}
                          </a>
                        </Button>
                        <Button
                          onClick={() => openWhatsApp(`Hi, I'm interested in ${project.projectName}: ${window.location.href.split('?')[0]}`)}
                          className="w-full h-12 font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl shadow-md"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                      <div className="mt-6 flex items-start gap-2 text-left bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-border/50">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          Builder contact is not shared publicly. All enquiries are securely handled by the trusted Growperty team.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explore more */}
            <div className="mt-20 pt-16 border-t border-border/50 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-brand-blue dark:text-white mb-4">Looking for more options?</h2>
              <Button asChild variant="outline" className="font-bold rounded-xl">
                <Link to="/projects">Browse All Projects <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProjectDetailPage;
