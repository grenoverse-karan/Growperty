import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, MapPin, Bath, Phone, MessageCircle, Heart, Share2, Building2, TreePine, Store, Home } from 'lucide-react';
import { toast } from 'sonner';
import { formatIndianPrice } from '@/hooks/useProperties.js';
import { getFilteredAddress } from '@/lib/contentFilteringUtils.js';
import { PLATFORM_PHONE, PLATFORM_WHATSAPP } from '@/constants/contactInfo.js';
import { isWishlisted as checkWishlisted, toggleWishlist as toggleWishlistStorage } from '@/lib/wishlist.js';
import { getActiveCpContact } from '@/lib/cpRef.js';

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

const PropertyCard = ({ property }) => {
  const formattedPrice = formatIndianPrice(property.totalPrice || property.price);
  const displayAddress = getFilteredAddress(property);
  const areaPrefix = !property.bhk && property.totalArea && property.areaUnit
    ? `${property.totalArea} ${property.areaUnit} `
    : '';
  const title = property.propertyType
    ? `${property.bhk ? property.bhk + ' ' : areaPrefix}${property.propertyType}`
    : property.name || property.title || 'Untitled Property';
  const bedrooms = property.bhk ? parseInt(property.bhk) || 0 : (property.bedrooms || 0);

  const firstImage = Array.isArray(property.images) && property.images.length > 0
    ? property.images[0]
    : (typeof property.images === 'string' ? property.images : null);

  const ph = TYPE_PLACEHOLDER[property.propertyType] || DEFAULT_PLACEHOLDER;

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
    const url = `${window.location.origin}/property/${property.id}`;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <Link to={`/property/${property.id}`} className="block h-full">
    <Card className="group overflow-hidden bg-card border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl flex flex-col h-full cursor-pointer">
      <div className="relative overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800">
        {firstImage ? (
          <img
            src={firstImage}
            alt={property.title || 'Property Image'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${ph.gradient} flex items-center justify-center transition-transform duration-700 group-hover:scale-110`}>
            <ph.Icon className="h-16 w-16 text-white/30" strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {timeAgo(property.createdAt) && (
            <Badge className="bg-black/60 backdrop-blur-sm text-white shadow-md font-semibold px-3 py-1 text-xs border-0">
              {timeAgo(property.createdAt)}
            </Badge>
          )}
        </div>

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
        
        <h3 className="text-xl font-bold text-foreground mb-2 leading-snug line-clamp-2" style={{ textWrap: 'balance' }}>
          {title}
        </h3>
        
        <div className="flex items-baseline gap-2 mb-6">
          <p className="text-3xl indian-price text-primary font-extrabold">
            {formattedPrice}
          </p>
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
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            className="w-full transition-all duration-200 active:scale-[0.98] rounded-xl h-10 text-sm font-bold border-primary/20 text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const cp = getActiveCpContact();
              const phone = cp ? cp.cpPhone.replace(/\D/g, '') : PLATFORM_PHONE;
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
              const cp = getActiveCpContact();
              const whatsapp = cp ? `91${cp.cpPhone.replace(/\D/g, '').slice(-10)}` : PLATFORM_WHATSAPP;
              window.open(`https://wa.me/${whatsapp}`, '_blank');
            }}
          >
            <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
          </Button>
        </div>
      </CardFooter>
    </Card>
    </Link>
  );
};

export default PropertyCard;