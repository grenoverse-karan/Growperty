import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, MapPin, ShieldCheck, Bath, Phone, MessageCircle } from 'lucide-react';
import { formatIndianPrice } from '@/hooks/useProperties.js';
import { getFilteredAddress } from '@/lib/contentFilteringUtils.js';
import { PLATFORM_PHONE, PLATFORM_WHATSAPP } from '@/constants/contactInfo.js';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';

const PropertyCard = ({ property }) => {
  const formattedPrice = formatIndianPrice(property.totalPrice || property.price);
  const displayAddress = getFilteredAddress(property);
  const title = property.propertyType
    ? `${property.bhk ? property.bhk + ' ' : ''}${property.propertyType}`
    : property.name || property.title || 'Untitled Property';
  const bedrooms = property.bhk ? parseInt(property.bhk) || 0 : (property.bedrooms || 0);

  let imageUrl = PLACEHOLDER;
  const firstImage = Array.isArray(property.images) && property.images.length > 0
    ? property.images[0]
    : (typeof property.images === 'string' ? property.images : null);

  if (firstImage) {
    imageUrl = firstImage; // base64 data URL or any URL
  }

  return (
    <Card className="group overflow-hidden bg-card border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl flex flex-col h-full">
      <div className="relative overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800">
        <img
          src={imageUrl}
          alt={property.title || 'Property Image'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge className="bg-primary text-primary-foreground shadow-md font-bold px-3 py-1 uppercase tracking-wider text-xs">
            For Sale
          </Badge>
        </div>

        {property.status === 'approved' && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-accent text-accent-foreground shadow-md font-bold px-3 py-1 flex items-center gap-1 border-none">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified
            </Badge>
          </div>
        )}
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
      
      <CardFooter className="p-6 pt-0 mt-auto flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 w-full mb-1">
          <Button 
            variant="outline" 
            className="w-full transition-all duration-200 active:scale-[0.98] rounded-xl h-10 text-sm font-bold border-primary/20 text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `tel:${PLATFORM_PHONE}`;
            }}
          >
            <Phone className="h-4 w-4 mr-1.5" /> Call
          </Button>
          <Button 
            variant="outline" 
            className="w-full transition-all duration-200 active:scale-[0.98] rounded-xl h-10 text-sm font-bold border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/10"
            onClick={(e) => {
              e.preventDefault();
              window.open(`https://wa.me/${PLATFORM_WHATSAPP}`, '_blank');
            }}
          >
            <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
          </Button>
        </div>
        <Button variant="default" className="w-full transition-all duration-200 active:scale-[0.98] rounded-xl h-11 text-sm font-bold" asChild>
          <Link to={`/property/${property.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;