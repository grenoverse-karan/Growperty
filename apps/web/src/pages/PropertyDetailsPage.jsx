import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Bed, Bath, Maximize, Phone, MessageCircle,
  ArrowLeft, ShieldCheck, Car, Bike, Building2,
  CheckCircle2, ChevronLeft, ChevronRight, Image as ImageIcon,
  Home, IndianRupee, Tag, Info, Clock, CalendarDays, Heart, Share2, DoorOpen, Landmark, Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatIndianPrice } from '@/hooks/useProperties.js';
import apiServerClient, { API_SERVER_URL } from '@/lib/apiServerClient.js';
import { PLATFORM_PHONE } from '@/constants/contactInfo.js';
import VisitRequestModal from '@/components/VisitRequestModal.jsx';
import SectorMap from '@/components/SectorMap.jsx';
import PropertyEMICalculator from '@/components/PropertyEMICalculator.jsx';
import ImageLightbox from '@/components/ImageLightbox.jsx';
import ConnectivityList from '@/components/ConnectivityList.jsx';
import { getActiveOffer, getOfferPricing, getOfferBenefitLabel, getOfferSummary, getOfferPhrase } from '@/lib/offerUtils.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { isWishlisted, toggleWishlist } from '@/lib/wishlist.js';
import { trackProperty } from '@/lib/trackProperty.js';
import { getActiveCpContact } from '@/lib/cpRef.js';
import { openWhatsApp } from '@/lib/whatsappLink.js';
import { trackCpVisitor } from '@/lib/cpVisitorTracking.js';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80';

// ── Small reusable pieces ─────────────────────────────────────────

const SectionTitle = ({ children }) => (
  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
    {children}
  </h2>
);

const SpecRow = ({ label, value }) => {
  if (value === null || value === undefined || value === '' || value === 0 && label !== 'Car Parking' && label !== 'Bike Parking') return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className="text-sm font-bold text-foreground text-right max-w-[60%]">{String(value)}</span>
    </div>
  );
};

const Chip = ({ children, color = 'slate' }) => {
  const styles = {
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    blue:   'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
    slate:  'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${styles[color]}`}>
      {children}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  // CP referral: { cpName, cpPhone, cpToken } or null
  const [cpContact, setCpContact] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);

  // Require login before requesting a visit; otherwise send guests to login
  const handleRequestVisit = () => {
    if (!isAuthenticated && !currentUser) {
      navigate('/login', { state: { from: `/property/${id}`, intent: 'visit' } });
      return;
    }
    setVisitModalOpen(true);
  };

  const handleToggleWishlist = () => {
    const nowWishlisted = toggleWishlist(id);
    setWishlisted(nowWishlisted);
    toast.success(nowWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url }); trackProperty(id, 'share'); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      trackProperty(id, 'share');
      toast.success('Link copied to clipboard');
    }
  };

  useEffect(() => {
    if (id) setWishlisted(isWishlisted(id));
  }, [id]);

  useEffect(() => {
    if (id && id !== 'undefined') trackCpVisitor({ propertyId: id });
  }, [id]);

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid property ID.');
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        // thumbOnly: only the cover image + imageCount come back here (fast);
        // the rest of the gallery loads on demand via /:id/images/:index below.
        const res = await apiServerClient.fetch(`/properties/${id}?thumbOnly=true`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Server error: ${res.status}`);
        }
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        console.error('[PropertyDetails] fetch error:', err);
        setError('Property not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  // ── CP referral resolution ───────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const lsKey = `cpRef_${id}`;
    const refToken = searchParams.get('ref');

    if (refToken) {
      const src = searchParams.get('src') || '';
      apiServerClient.fetch(`/cp/by-token?token=${encodeURIComponent(refToken)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.cpName) {
            const contact = { cpName: data.cpName, cpPhone: data.cpPhone, cpToken: refToken, leadSource: src };
            setCpContact(contact);
            try { localStorage.setItem(lsKey, JSON.stringify(contact)); } catch {}
          }
        })
        .catch(() => {});
    } else {
      try {
        const saved = localStorage.getItem(lsKey);
        if (saved) {
          setCpContact(JSON.parse(saved));
          return;
        }
      } catch {}
      // No per-property share link — fall back to the sitewide referral cookie
      const sitewide = getActiveCpContact();
      if (sitewide) setCpContact({ ...sitewide, cpToken: '', leadSource: '' });
    }
  }, [id, searchParams]);

  // ── Loading skeleton ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full space-y-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-80 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
          <h2 className="text-2xl font-bold text-destructive">{error || 'Property not found'}</h2>
          <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────
  const listedAgo = (() => {
    const dateStr = property.createdAt;
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

  // First image comes inline from the thumbOnly fetch (already loaded, no extra request);
  // remaining images are served individually so the browser can fetch/cache them in parallel.
  const imageCount = property.imageCount ?? (Array.isArray(property.images) ? property.images.length : 0);
  const firstImage = Array.isArray(property.images) ? property.images[0] : null;
  const images = imageCount > 0
    ? Array.from({ length: imageCount }, (_, i) =>
        i === 0 && firstImage ? firstImage : `${API_SERVER_URL}/properties/${property.id}/images/${i}`
      )
    : null;

  const roomsLabel = !property.bhk && property.rooms > 0 ? `${property.rooms} Room${property.rooms > 1 ? 's' : ''}` : null;
  const title = [property.bhk || roomsLabel, property.propertyType].filter(Boolean).join(' ') || property.name || 'Property';
  const isSold = property.status === 'sold';
  const offer = getActiveOffer(property);
  const offerPricing = getOfferPricing(offer, property.totalPrice);
  const offerBenefit = getOfferBenefitLabel(offer);
  // A % offer lowers the shown price (and the EMI calculator's starting
  // price); the original is struck through beside it.
  const effectivePrice = offerPricing ? offerPricing.finalPrice : Number(property.totalPrice);
  const formattedPrice = formatIndianPrice(effectivePrice);

  const pricePerSqft = effectivePrice && property.totalArea
    ? Math.round(effectivePrice / Number(property.totalArea))
    : null;

  const locationParts = [property.sector, property.landmark, property.city].filter(Boolean);

  const furnishingItemsList = property.furnishingItems && typeof property.furnishingItems === 'object'
    ? Object.entries(property.furnishingItems).filter(([, qty]) => Number(qty) > 0)
    : [];

  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg(i => (i + 1) % images.length);

  return (
    <>
      <Helmet>
        <title>{title} in {property.city || 'Greater Noida'} | Growperty</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to listings
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ════════════════════════════════════════
                  LEFT COLUMN — main content
              ════════════════════════════════════════ */}
              <div className="lg:col-span-2 space-y-6">

                {/* ── 1. IMAGE GALLERY ──────────────────── */}
                <div className="space-y-2">
                  {images ? (
                    <>
                      <div className="relative rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800" style={{ aspectRatio: '16/9' }}>
                        <img
                          key={activeImg}
                          src={images[activeImg]}
                          alt={`${title} - image ${activeImg + 1}`}
                          className="w-full h-full object-cover cursor-zoom-in"
                          onClick={() => setLightboxOpen(true)}
                          onError={(e) => { e.target.src = PLACEHOLDER; }}
                        />
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {isSold ? (
                            <Badge className="bg-red-600 text-white font-extrabold px-3 tracking-wide text-xs border-0">SOLD</Badge>
                          ) : (
                            <>
                              {listedAgo && <Badge className="bg-black/60 backdrop-blur-sm text-white font-semibold px-3 text-xs border-0">{listedAgo}</Badge>}
                              {property.status === 'approved' && (
                                <Badge className="bg-[#10B981] text-white font-bold px-3 flex items-center gap-1 text-xs">
                                  <ShieldCheck className="h-3 w-3" /> Verified
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        {/* Wishlist + Share */}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleToggleWishlist}
                            aria-label="Add to wishlist"
                            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
                          </button>
                          <button
                            type="button"
                            onClick={handleShare}
                            aria-label="Share property"
                            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <Share2 className="h-4 w-4 text-slate-700" />
                          </button>
                        </div>
                        {/* Arrows */}
                        {images.length > 1 && (
                          <>
                            <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors">
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors">
                              <ChevronRight className="h-5 w-5" />
                            </button>
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                              {activeImg + 1} / {images.length}
                            </div>
                          </>
                        )}
                      </div>
                      <ImageLightbox
                        images={images}
                        index={activeImg}
                        onIndexChange={setActiveImg}
                        open={lightboxOpen}
                        onClose={() => setLightboxOpen(false)}
                        alt={title}
                        placeholder={PLACEHOLDER}
                      />
                      {/* Thumbnail strip */}
                      {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {images.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImg(i)}
                              className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            >
                              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 relative" style={{ aspectRatio: '16/9' }}>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                        <p className="text-sm font-bold">Image uploading soon...</p>
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        {isSold ? (
                          <Badge className="bg-red-600 text-white font-extrabold px-3 tracking-wide text-xs border-0">SOLD</Badge>
                        ) : (
                          <>
                            <Badge className="bg-primary text-primary-foreground font-bold px-3 uppercase tracking-wider text-xs">For Sale</Badge>
                            {property.status === 'approved' && (
                              <Badge className="bg-[#10B981] text-white font-bold px-3 flex items-center gap-1 text-xs">
                                <ShieldCheck className="h-3 w-3" /> Verified
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleToggleWishlist}
                          aria-label="Add to wishlist"
                          className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
                        </button>
                        <button
                          type="button"
                          onClick={handleShare}
                          aria-label="Share property"
                          className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <Share2 className="h-4 w-4 text-slate-700" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── 2. TITLE + LOCATION ───────────────── */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">{title}</h1>
                  {locationParts.length > 0 && (
                    <div className="flex items-start gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span className="font-medium text-sm">{locationParts.join(', ')}</span>
                    </div>
                  )}
                  {property.reraApproved === true && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full mt-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> RERA Approved
                    </span>
                  )}
                </div>

              </div>{/* end Part A */}

              {/* ════════════════════════════════════════
                  SIDEBAR CARD 1 — pricing & details
              ════════════════════════════════════════ */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border/50 shadow-lg lg:sticky lg:top-24 space-y-5">

                  {/* Price */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Asking Price</p>
                    <p className="text-3xl font-extrabold text-primary leading-tight">{formattedPrice}</p>
                    {(offerPricing || offerBenefit) && (
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {offerPricing && (
                          <span className="text-base text-muted-foreground line-through">{formatIndianPrice(property.totalPrice)}</span>
                        )}
                        <span className="inline-flex items-center text-xs font-extrabold text-white bg-gradient-to-b from-[#FB5C74] to-[#FA233B] shadow-sm shadow-[#FA233B]/30 px-2.5 py-1 rounded-full">
                          {offerPricing ? `Save ₹${offerPricing.saving.toLocaleString('en-IN')}` : offerBenefit}
                        </span>
                      </div>
                    )}
                    {pricePerSqft && (
                      <p className="text-sm text-muted-foreground font-medium mt-1">
                        ₹ {pricePerSqft.toLocaleString('en-IN')} / {property.areaUnit || 'Sq.ft'}
                      </p>
                    )}
                    {offer && (
                      <div className="shine-badge relative mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md">
                        <span className="text-sm leading-none">{offer.emoji}</span>
                        <span className="text-xs font-extrabold truncate">
                          {getOfferSummary(offer)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Quick specs */}
                  <div className="grid grid-cols-2 gap-2 py-4 border-y border-border/50">
                    {property.bhk && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-bold text-foreground">{property.bhk}</span>
                      </div>
                    )}
                    {property.rooms > 0 && (
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-bold text-foreground">{property.rooms} Rooms</span>
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-bold text-foreground">{property.bathrooms} Bath</span>
                      </div>
                    )}
                    {property.totalArea && (
                      <div className="flex items-center gap-2 col-span-2">
                        <Maximize className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-bold text-foreground">{property.totalArea} {property.areaUnit || 'Sq.ft'} ({property.areaType})</span>
                      </div>
                    )}
                  </div>

                  {/* Sector-level map link — never the exact property location */}
                  <SectorMap sector={property.sector} city={property.city} />
                </div>
              </div>

              {/* ════════════════════════════════════════
                  PART B — remaining details
              ════════════════════════════════════════ */}
              <div className="lg:col-span-2 space-y-6">

                {/* ── 3. BASIC INFO ─────────────────────── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                  <SectionTitle>Basic Information</SectionTitle>
                  <div className="space-y-0">
                    <SpecRow label="Property Type" value={property.propertyType} />
                    {property.propertySubType && <SpecRow label="Sub Type" value={property.propertySubType} />}
                    <SpecRow label="BHK / Configuration" value={property.bhk} />
                    {property.rooms > 0 && <SpecRow label="Rooms" value={property.rooms} />}
                    <SpecRow label="Bathrooms" value={property.bathrooms} />
                    <SpecRow label="Balconies" value={property.balconies} />
                    {property.ownershipType && <SpecRow label="Ownership Type" value={property.ownershipType} />}
                    {property.plotType && <SpecRow label="Plot Type" value={property.plotType} />}
                  </div>
                </div>

                {/* ── 5. FLOOR DETAILS ──────────────────── */}
                {(property.floorNumber != null || property.totalFloors != null) && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                    <SectionTitle>Floor Details</SectionTitle>
                    <div className="space-y-0">
                      {property.floorNumber != null && property.floorNumber !== '' && (
                        <SpecRow label="Property on Floor" value={property.floorNumber} />
                      )}
                      {property.totalFloors != null && property.totalFloors !== '' && (
                        <SpecRow label="Total Floors in Building" value={property.totalFloors} />
                      )}
                    </div>
                  </div>
                )}

                {/* ── 8. PARKING ────────────────────────── */}
                {(property.carParking >= 0 || property.bikeParking >= 0) && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                    <SectionTitle>Parking</SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <Car className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="text-xl font-extrabold text-foreground">{property.carParking ?? 0}</p>
                          <p className="text-xs text-muted-foreground font-medium">Car Parking</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <Bike className="h-8 w-8 text-indigo-500" />
                        <div>
                          <p className="text-xl font-extrabold text-foreground">{property.bikeParking ?? 0}</p>
                          <p className="text-xs text-muted-foreground font-medium">Bike Parking</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 9. STATUS TAGS ────────────────────── */}
                {(property.possessionStatus || property.furnishingType || property.ownershipType || property.saleType) && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                    <SectionTitle>Status & Type</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {property.possessionStatus && <Chip color="green"><CheckCircle2 className="h-3.5 w-3.5" />{property.possessionStatus}</Chip>}
                      {property.furnishingType && <Chip color="blue"><Home className="h-3.5 w-3.5" />{property.furnishingType}</Chip>}
                      {property.ownershipType && <Chip color="amber"><Tag className="h-3.5 w-3.5" />{property.ownershipType}</Chip>}
                      {property.saleType && <Chip color="purple"><IndianRupee className="h-3.5 w-3.5" />{property.saleType}</Chip>}
                    </div>
                  </div>
                )}

                {/* ── 10. FURNISHING ITEMS ──────────────── */}
                {furnishingItemsList.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                    <SectionTitle>Furnishing Items</SectionTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {furnishingItemsList.map(([item, qty]) => (
                        <div key={item} className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                          <span className="text-sm font-bold text-blue-900 dark:text-blue-200">{item}</span>
                          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-300">{qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 11. AMENITIES ─────────────────────── */}
                {Array.isArray(property.amenities) && property.amenities.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                    <SectionTitle>Amenities ({property.amenities.length})</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((a, i) => (
                        <Chip key={i} color="green">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          {a}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 12. NEARBY FACILITIES ─────────────── */}
                {((Array.isArray(property.nearbyAmenities) && property.nearbyAmenities.length > 0) || property.nearbyFamousPlace || property.connectivity?.length > 0) && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                    <SectionTitle>Nearby Facilities {property.nearbyAmenities?.length ? `(${property.nearbyAmenities.length})` : ''}</SectionTitle>
                    {property.connectivity?.length > 0 && (
                      <div className="mb-4">
                        <ConnectivityList rows={property.connectivity} />
                      </div>
                    )}
                    {property.nearbyFamousPlace && (
                      <div className="flex items-start gap-2 mb-3 text-sm font-semibold text-primary">
                        <Landmark className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="whitespace-pre-line">{property.nearbyFamousPlace}</span>
                      </div>
                    )}
                    {Array.isArray(property.nearbyAmenities) && property.nearbyAmenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {property.nearbyAmenities.map((a, i) => (
                          <Chip key={i} color="slate">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {a}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── 13. DESCRIPTION ───────────────────── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                  <SectionTitle>Description</SectionTitle>
                  {property.description ? (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">{property.description}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">No description provided.</p>
                  )}
                </div>

                {/* ── SPECIAL OFFER ─────────────────────── */}
                {offer && (
                  <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                        {offer.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Special Offer</p>
                        {offer.title && <p className="text-lg font-extrabold leading-tight">{offer.title}</p>}
                        {offer.details && <p className="text-sm font-semibold text-white/95">{getOfferPhrase(offer.details)}</p>}
                        {offer.validTill && (
                          <p className="text-xs font-semibold text-white/90 mt-1">
                            Valid till {offer.validTill.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="absolute bottom-2 right-3 text-[10px] text-white/75">T&amp;C* apply</p>
                  </div>
                )}

                {/* ── 14. VISIT TIMINGS ─────────────────── */}
                {property.visitTimeType && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                    <SectionTitle><span className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Preferred Visit Time</span></SectionTitle>
                    {property.visitTimeType === 'anytime' && (
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">Any Time (10 AM – 6 PM)</p>
                    )}
                    {property.visitTimeType === 'fixed' && Array.isArray(property.visitFixedSlots) && property.visitFixedSlots.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {property.visitFixedSlots.map((slot, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold border border-blue-200 dark:border-blue-700">
                            <Clock className="h-3.5 w-3.5" />{slot}
                          </span>
                        ))}
                      </div>
                    )}
                    {property.visitTimeType === 'flexible' && Array.isArray(property.visitFlexibleSlots) && property.visitFlexibleSlots.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {property.visitFlexibleSlots.map((slot, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold border border-amber-200 dark:border-amber-700">
                            <Clock className="h-3.5 w-3.5" />{slot}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── 15. EMI CALCULATOR ────────────────── */}
                {!isSold && Number(property.totalPrice) > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                    <SectionTitle><span className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" />EMI Calculator</span></SectionTitle>
                    <PropertyEMICalculator key={effectivePrice} price={effectivePrice} />
                  </div>
                )}

              </div>{/* end Part B */}

              {/* ════════════════════════════════════════
                  SIDEBAR CARD 2 — listed by + contact buttons
              ════════════════════════════════════════ */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border/50 shadow-lg lg:sticky lg:top-24 space-y-5">

                  {/* Listed by */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Listed By</p>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">Growperty</p>
                        {cpContact && (
                          <p className="text-xs text-muted-foreground mt-0.5">via {cpContact.cpName}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  {isSold ? (
                    <div className="w-full rounded-xl py-3 text-center text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      This property has been sold
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Button
                          onClick={() => {
                            const phone = cpContact ? cpContact.cpPhone.replace(/\D/g, '') : PLATFORM_PHONE;
                            trackProperty(id, 'call');
                            window.location.href = `tel:${phone}`;
                          }}
                          className="w-full h-12 text-base font-bold rounded-xl bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                          <Phone className="mr-2 h-4 w-4" /> Call Now
                        </Button>
                        <Button
                          onClick={() => {
                            const url = window.location.href.split('?')[0];
                            trackProperty(id, 'whatsapp');
                            openWhatsApp(`Hi, I'm interested in this property: ${url}`);
                          }}
                          className="w-full h-12 text-base font-bold rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                        </Button>
                        <Button
                          onClick={handleRequestVisit}
                          variant="outline"
                          className="w-full h-12 text-base font-bold rounded-xl border-2 border-primary text-primary hover:bg-primary/5 shadow-sm transition-all active:scale-[0.98]"
                        >
                          <CalendarDays className="mr-2 h-4 w-4" /> Request to Visit
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>{/* end grid */}
          </div>

          {/* Disclaimer block */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:mt-14 pb-10">
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-4 text-xs text-amber-800 dark:text-amber-300 leading-relaxed space-y-1">
              <p><strong>Disclaimer:</strong> Property details, pricing, approvals, and availability are provided by the owner/developer and may be subject to change. Please conduct independent legal, financial, and technical due diligence before making any payment or signing any document.</p>
              <p>Exact property location may be masked for privacy and anti-circumvention purposes. Verified location will be shared during authorized site visit coordination.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      <VisitRequestModal
        open={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        propertyId={id}
        propertyLabel={property ? `${property.bhk ? property.bhk + ' ' : ''}${property.propertyType} in ${property.sector}, ${property.city}` : ''}
        visitTimeType={property?.visitTimeType}
        visitFixedSlots={property?.visitFixedSlots}
        visitFlexibleSlots={property?.visitFlexibleSlots}
        currentUser={currentUser}
        cpToken={cpContact?.cpToken || ''}
        leadSource={cpContact?.leadSource || ''}
      />
    </>
  );
};

export default PropertyDetailsPage;
