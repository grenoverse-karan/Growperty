import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, MapPin, Bath, Phone, MessageCircle, Heart, Share2, Building2, TreePine, Store, Home, DoorOpen, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatIndianPrice } from '@/hooks/useProperties.js';
import { getFilteredAddress } from '@/lib/contentFilteringUtils.js';
import { PLATFORM_PHONE } from '@/constants/contactInfo.js';
import { isWishlisted as checkWishlisted, toggleWishlist as toggleWishlistStorage } from '@/lib/wishlist.js';
import { getActiveCpContact } from '@/lib/cpRef.js';
import { openWhatsApp } from '@/lib/whatsappLink.js';
import { trackProperty } from '@/lib/trackProperty.js';
import { getActiveOffer, getOfferPricing, getOfferBenefitLabel, getOfferSummary } from '@/lib/offerUtils.js';

const TYPE_PLACEHOLDER = {
  'Flat/Apartment':     { gradient: 'from-blue-600 to-teal-500',   Icon: Building2 },
  'Independent House':  { gradient: 'from-orange-500 to-amber-400', Icon: Home },
  'Villa':              { gradient: 'from-emerald-600 to-green-400',Icon: Home },
  'Penthouse':          { gradient: 'from-purple-600 to-pink-500',  Icon: Building2 },
  'Plot/Land':          { gradient: 'from-lime-600 to-green-500',   Icon: TreePine },
  'Commercial':         { gradient: 'from-slate-600 to-blue-500',   Icon: Store },
};
const DEFAULT_PLACEHOLDER = { gradient: 'from-primary to-primary/60', Icon: Building2 };

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
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
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// compact       — ~half-size card for dashboards (scoped CSS below, public card untouched)
// footer        — replaces the Call/WhatsApp footer (e.g. engagement stats)
// statusBadge   — extra chip stacked in the top-left corner (e.g. Live / Pending)
// onShare       — replaces the default share action (e.g. CP referral share modal)
const COMPACT_CSS = `
.pc-compact .p-6 { padding: .625rem; }
.pc-compact .p-6.pt-0 { padding-top: 0; }
.pc-compact .text-3xl { font-size: 1.125rem; line-height: 1.5rem; }
.pc-compact .text-xl { font-size: .875rem; line-height: 1.25rem; }
.pc-compact .text-sm { font-size: .6875rem; line-height: 1rem; }
.pc-compact .text-xs { font-size: .625rem; line-height: .875rem; }
.pc-compact .mb-6 { margin-bottom: .5rem; }
.pc-compact .mb-3 { margin-bottom: .375rem; }
.pc-compact .mb-2 { margin-bottom: .25rem; }
.pc-compact .gap-4 { gap: .5rem; }
.pc-compact .py-4 { padding-top: .5rem; padding-bottom: .5rem; }
.pc-compact .gap-3 { gap: .5rem; }
.pc-compact .p-2 { padding: .25rem; }
.pc-compact .h-5.w-5 { width: .875rem; height: .875rem; }
.pc-compact .h-9.w-9 { width: 1.75rem; height: 1.75rem; }
.pc-compact .h-9.w-9 svg { width: .8rem; height: .8rem; }
.pc-compact .top-4 { top: .5rem; }
.pc-compact .left-4 { left: .5rem; }
.pc-compact .right-4 { right: .5rem; }
.pc-compact .px-3 { padding-left: .5rem; padding-right: .5rem; }
.pc-compact .py-1\\.5 { padding-top: .125rem; padding-bottom: .125rem; }
.pc-compact .aspect-\\[4\\/3\\] { aspect-ratio: 16 / 10; }
`;

const PropertyCard = ({ property, compact = false, footer = null, statusBadge = null, onShare = null }) => {
  const originalPrice = Number(property.totalPrice || property.price);
  const offer = getActiveOffer(property);
  const offerPricing = getOfferPricing(offer, originalPrice);
  const offerBenefit = getOfferBenefitLabel(offer);
  // A % offer lowers the shown price; the original is struck through beside it.
  const price = offerPricing ? offerPricing.finalPrice : originalPrice;
  const formattedPrice = formatIndianPrice(price);
  const area = Number(property.totalArea);
  const pricePerUnit = price > 0 && area > 0 ? Math.round(price / area) : null;
  const unitLabel = property.areaUnit === 'Sq.yd' ? 'sq.yd' : property.areaUnit === 'Sq.m' ? 'sq.m' : 'sq.ft';
  const displayAddress = getFilteredAddress(property);
  const roomsPrefix = !property.bhk && property.rooms > 0
    ? `${property.rooms} Room${property.rooms > 1 ? 's' : ''} `
    : '';
  const areaPrefix = !property.bhk && !property.rooms && property.totalArea && property.areaUnit
    ? `${property.totalArea} ${property.areaUnit} `
    : '';
  const title = property.propertyType
    ? `${property.bhk ? property.bhk + ' ' : roomsPrefix || areaPrefix}${property.propertyType}`
    : property.name || property.title || 'Untitled Property';
  const bedrooms = property.bhk ? parseInt(property.bhk) || 0 : (property.bedrooms || 0);

  const firstImage = Array.isArray(property.images) && property.images.length > 0
    ? property.images[0]
    : (typeof property.images === 'string' ? property.images : null);

  const ph = TYPE_PLACEHOLDER[property.propertyType] || DEFAULT_PLACEHOLDER;
  const isSold = property.status === 'sold';
  const isCornerPlot = Array.isArray(property.facingType) && property.facingType.includes('Corner (Two Side Open)');

  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(checkWishlisted(property.id));
  }, [property.id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowWishlisted = toggleWishlistStorage(property.id);
    setIsWishlisted(nowWishlisted);
    toast.success(nowWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) { onShare(property); return; }
    const url = `${window.location.origin}/property/${property.id}`;
    if (navigator.share) {
      try { await navigator.share({ title, url }); trackProperty(property.id, 'share'); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      trackProperty(property.id, 'share');
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <Link to={`/property/${property.id}`} className={`block h-full ${compact ? 'pc-compact' : ''}`}>
    {compact && <style>{COMPACT_CSS}</style>}
    <Card className={`group overflow-hidden bg-card border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl flex flex-col h-full cursor-pointer ${isSold ? 'opacity-80' : ''}`}>
      <div className="relative overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800">
        {firstImage ? (
          <img
            src={firstImage}
            alt={property.title || 'Property Image'}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSold ? 'grayscale' : ''}`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${ph.gradient} flex flex-col items-center justify-center gap-2 transition-transform duration-700 group-hover:scale-110 ${isSold ? 'grayscale' : ''}`}>
            <ph.Icon className="h-14 w-14 text-white/30" strokeWidth={1} />
            <span className="text-white/80 text-xs font-semibold">Image uploading soon...</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Festive offer strip across the bottom of the photo */}
        {offer && (
          <div className="shine-badge absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
            <span className="text-sm leading-none animate-bounce">{offer.emoji}</span>
            <span className="text-xs font-extrabold tracking-wide truncate">
              {getOfferSummary(offer)}
            </span>
            <span className="text-sm leading-none animate-bounce [animation-delay:150ms]">{offer.emoji}</span>
          </div>
        )}

        {isSold ? (
          <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none">
            <div className="absolute top-[22px] left-[-38px] w-[170px] -rotate-45 bg-red-600 text-center text-white text-xs font-extrabold py-1.5 shadow-md tracking-widest">
              SOLD
            </div>
          </div>
        ) : (
          <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
            {statusBadge}
            {timeAgo(property.createdAt) && (
              <Badge className="bg-black/60 backdrop-blur-sm text-white shadow-md font-semibold px-3 py-1 text-xs border-0">
                {timeAgo(property.createdAt)}
              </Badge>
            )}
            {isCornerPlot && (
              <Badge className="bg-gradient-to-r from-[#FDE68A] via-[#F4C430] to-[#B8860B] text-black shadow-md font-bold px-3 py-1 text-xs border-0 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Corner Plot
              </Badge>
            )}
          </div>
        )}

        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label="Add to wishlist"
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
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
      
      <CardContent className="p-6 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1.5 text-primary flex-shrink-0" />
          <span className="font-medium truncate">{displayAddress}</span>
        </div>

        {property.reraApproved === true && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> RERA Approved
          </span>
        )}

        <h3 className="text-xl font-bold text-foreground mb-2 leading-snug line-clamp-2" style={{ textWrap: 'balance' }}>
          {title}
        </h3>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-3xl indian-price text-primary font-extrabold">
              {formattedPrice}
            </p>
            {offerPricing && (
              <p className="text-sm text-muted-foreground line-through">{formatIndianPrice(originalPrice)}</p>
            )}
          </div>
          {(offerPricing || offerBenefit) && (
            <span className="inline-flex items-center mt-1.5 max-w-full text-xs font-extrabold text-white bg-gradient-to-b from-[#FB5C74] to-[#FA233B] shadow-sm shadow-[#FA233B]/30 px-2.5 py-1 rounded-full">
              <span className="truncate">
                {offerPricing
                  ? `Save ₹${offerPricing.saving.toLocaleString('en-IN')} (${offerPricing.pct}% Off)`
                  : offerBenefit}
              </span>
            </span>
          )}
          {(property.totalArea && property.areaUnit) || pricePerUnit ? (
            <div className="flex items-center justify-between mt-2">
              {property.totalArea && property.areaUnit ? (
                <span className="inline-flex items-center text-xs text-slate-600 dark:text-slate-300 font-semibold bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                  Size {property.totalArea} {property.areaUnit}
                </span>
              ) : <span />}
              {pricePerUnit && (
                <p className="text-xs text-muted-foreground font-medium">
                  ₹{pricePerUnit.toLocaleString('en-IN')} / {unitLabel}
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-t border-border/60">
          {bedrooms > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bed className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{bedrooms} BHK</p>
                <p className="text-xs text-muted-foreground font-medium">Bedrooms</p>
              </div>
            </div>
          )}

          {!property.bhk && property.rooms > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DoorOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{property.rooms}</p>
                <p className="text-xs text-muted-foreground font-medium">Rooms</p>
              </div>
            </div>
          )}
          
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bath className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{property.bathrooms}</p>
                <p className="text-xs text-muted-foreground font-medium">Bathrooms</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 mt-auto">
        {footer ? footer : isSold ? (
          <div className="w-full rounded-xl h-10 flex items-center justify-center text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            This property has been sold
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="outline"
              className="w-full transition-all duration-200 active:scale-[0.98] rounded-xl h-10 text-sm font-bold border-primary/20 text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const cp = getActiveCpContact();
                const phone = cp ? cp.cpPhone.replace(/\D/g, '') : PLATFORM_PHONE;
                trackProperty(property.id || property._id, 'call');
                window.location.href = `tel:${phone}`;
              }}
            >
              <Phone className="h-4 w-4 mr-1.5" /> Call
            </Button>
            <Button
              variant="outline"
              className="w-full transition-all duration-200 active:scale-[0.98] rounded-xl h-10 text-sm font-bold border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const url = `${window.location.origin}/property/${property.id || property._id}`;
                trackProperty(property.id || property._id, 'whatsapp');
                openWhatsApp(`Hi, I'm interested in this property: ${url}`);
              }}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
    </Link>
  );
};

export default PropertyCard;