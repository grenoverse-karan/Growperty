import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Home, IndianRupee, Tag, Info,
} from 'lucide-react';
import { formatIndianPrice } from '@/hooks/useProperties.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { PLATFORM_PHONE, PLATFORM_WHATSAPP } from '@/constants/contactInfo.js';

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
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid property ID.');
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await apiServerClient.fetch(`/properties/${id}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Server error: ${res.status}`);
        }
        const data = await res.json();

        // ── Full document log ─────────────────────────────────
        console.group(`[PropertyDetails] Document for id=${id}`);
        console.log('All fields:', Object.keys(data));
        console.table(
          Object.entries(data)
            .filter(([, v]) => typeof v !== 'object' || v === null)
            .map(([k, v]) => ({ field: k, value: v }))
        );
        console.log('images:', data.images);
        console.log('amenities:', data.amenities);
        console.log('nearbyAmenities:', data.nearbyAmenities);
        console.log('furnishingItems:', data.furnishingItems);
        console.groupEnd();
        // ──────────────────────────────────────────────────────

        setProperty(data);
      } catch (err) {
        console.error('[PropertyDetails] fetch error:', err);
        setError('Property not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

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
  const images = Array.isArray(property.images) && property.images.length > 0
    ? property.images
    : null;

  const title = [property.bhk, property.propertyType].filter(Boolean).join(' ') || property.name || 'Property';
  const formattedPrice = formatIndianPrice(property.totalPrice);

  const pricePerSqft = property.totalPrice && property.totalArea
    ? Math.round(Number(property.totalPrice) / Number(property.totalArea))
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
        <title>{title} in {property.city || 'Delhi NCR'} | Growperty</title>
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
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = PLACEHOLDER; }}
                        />
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge className="bg-primary text-primary-foreground font-bold px-3 uppercase tracking-wider text-xs">For Sale</Badge>
                          {property.status === 'approved' && (
                            <Badge className="bg-[#10B981] text-white font-bold px-3 flex items-center gap-1 text-xs">
                              <ShieldCheck className="h-3 w-3" /> Verified
                            </Badge>
                          )}
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
                      {/* Thumbnail strip */}
                      {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {images.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImg(i)}
                              className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            >
                              <img src={src} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative" style={{ aspectRatio: '16/9' }}>
                      <img src={PLACEHOLDER} alt={title} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                        <p className="text-sm font-bold">No photos uploaded</p>
                      </div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-primary text-primary-foreground font-bold px-3 uppercase tracking-wider text-xs">For Sale</Badge>
                        {property.status === 'approved' && (
                          <Badge className="bg-[#10B981] text-white font-bold px-3 flex items-center gap-1 text-xs">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </Badge>
                        )}
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
                </div>

                {/* ── 3. BASIC INFO ─────────────────────── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                  <SectionTitle>Basic Information</SectionTitle>
                  <div className="space-y-0">
                    <SpecRow label="Property Type" value={property.propertyType} />
                    {property.propertySubType && <SpecRow label="Sub Type" value={property.propertySubType} />}
                    <SpecRow label="BHK / Configuration" value={property.bhk} />
                    <SpecRow label="Bathrooms" value={property.bathrooms} />
                    <SpecRow label="Balconies" value={property.balconies} />
                    <SpecRow label="Owner Type" value={property.ownerType} />
                    {property.plotType && <SpecRow label="Plot Type" value={property.plotType} />}
                  </div>
                </div>

                {/* ── 4. AREA DETAILS ───────────────────── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                  <SectionTitle>Area Details</SectionTitle>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-2xl font-extrabold text-primary">{property.totalArea || '—'}</p>
                      <p className="text-xs text-muted-foreground font-bold mt-1">{property.areaUnit || 'Sq.ft'}</p>
                      <p className="text-xs text-muted-foreground">Total Area</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-base font-extrabold text-foreground leading-tight">{property.areaType || '—'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Area Type</p>
                    </div>
                    {pricePerSqft && (
                      <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <p className="text-base font-extrabold text-[#10B981]">₹{pricePerSqft.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-muted-foreground mt-1">per {property.areaUnit || 'Sq.ft'}</p>
                      </div>
                    )}
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

                {/* ── 6. PRICING ────────────────────────── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                  <SectionTitle>Pricing</SectionTitle>
                  <div className="space-y-0">
                    <SpecRow label="Total Price" value={formattedPrice} />
                    {pricePerSqft && (
                      <SpecRow label={`Price per ${property.areaUnit || 'Sq.ft'}`} value={`₹ ${pricePerSqft.toLocaleString('en-IN')}`} />
                    )}
                    {property.priceNegotiable && (
                      <SpecRow label="Negotiable" value="Yes" />
                    )}
                    {property.bankLoanAvailable && (
                      <SpecRow label="Bank Loan Available" value={property.bankLoanAvailable} />
                    )}
                  </div>
                </div>

                {/* ── 7. LOCATION ───────────────────────── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                  <SectionTitle>Location Details</SectionTitle>
                  <div className="space-y-0">
                    <SpecRow label="City" value={property.city} />
                    <SpecRow label="Sector / Area" value={property.sector} />
                    <SpecRow label="Society / Project / Landmark" value={property.landmark} />
                    <SpecRow label="House / Flat / Plot No." value={property.houseNo} />
                  </div>
                </div>

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
                {Array.isArray(property.nearbyAmenities) && property.nearbyAmenities.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border/50 shadow-sm">
                    <SectionTitle>Nearby Facilities ({property.nearbyAmenities.length})</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {property.nearbyAmenities.map((a, i) => (
                        <Chip key={i} color="slate">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {a}
                        </Chip>
                      ))}
                    </div>
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

              </div>{/* end left column */}

              {/* ════════════════════════════════════════
                  RIGHT COLUMN — sticky price card
              ════════════════════════════════════════ */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border/50 shadow-lg sticky top-24 space-y-5">

                  {/* Price */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Asking Price</p>
                    <p className="text-3xl font-extrabold text-primary leading-tight">{formattedPrice}</p>
                    {pricePerSqft && (
                      <p className="text-sm text-muted-foreground font-medium mt-1">
                        ₹ {pricePerSqft.toLocaleString('en-IN')} / {property.areaUnit || 'Sq.ft'}
                      </p>
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
                    {property.city && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-bold text-foreground">{[property.sector, property.city].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Listed by */}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Listed By</p>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">Verified Owner</p>
                        <p className="text-xs text-muted-foreground">Growperty Protected</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => window.location.href = `tel:${PLATFORM_PHONE}`}
                      className="w-full h-12 text-base font-bold rounded-xl bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <Phone className="mr-2 h-4 w-4" /> Call Now
                    </Button>
                    <Button
                      onClick={() => window.open(`https://wa.me/${PLATFORM_WHATSAPP}`, '_blank')}
                      className="w-full h-12 text-base font-bold rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Direct contact details are hidden for privacy.
                  </p>
                </div>
              </div>

            </div>{/* end grid */}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PropertyDetailsPage;
