import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Bed, Bath, Maximize, CheckCircle2, Phone, MessageCircle, ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import { formatIndianPrice } from '@/hooks/useProperties.js';
import { getFilteredAddress } from '@/lib/contentFilteringUtils.js';
import pb from '@/lib/pocketbaseClient';
import { PLATFORM_PHONE, PLATFORM_WHATSAPP } from '@/constants/contactInfo.js';

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const record = await pb.collection('properties').getOne(id, { $autoCancel: false });
        setProperty(record);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Property not found or unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold text-destructive mb-4">{error}</h2>
          <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const displayAddress = getFilteredAddress(property);
  const formattedPrice = formatIndianPrice(property.expectedPrice || property.price);
  
  const images = property.images && Array.isArray(property.images) && property.images.length > 0
    ? property.images.map(img => pb.files.getUrl(property, img))
    : property.images ? [pb.files.getUrl(property, property.images)] : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'];

  return (
    <>
      <Helmet>
        <title>{property.title} | Growperty</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        
        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Image Gallery */}
                <div className="rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 aspect-video relative">
                  <img src={images[0]} alt={property.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wider">For Sale</Badge>
                    {property.status === 'approved' && (
                      <Badge className="bg-accent text-accent-foreground px-3 py-1 text-sm font-bold flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">{property.title}</h1>
                  <div className="flex items-center text-muted-foreground mb-6 text-lg">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium">{displayAddress}</span>
                  </div>

                  <div className="flex flex-wrap gap-6 py-6 border-y border-border/60 mb-8">
                    {property.bhk > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl"><Bed className="h-6 w-6 text-primary" /></div>
                        <div>
                          <p className="text-lg font-bold text-foreground">{property.bhk} BHK</p>
                          <p className="text-sm text-muted-foreground font-medium">Configuration</p>
                        </div>
                      </div>
                    )}
                    {property.areaSize > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl"><Maximize className="h-6 w-6 text-primary" /></div>
                        <div>
                          <p className="text-lg font-bold text-foreground">{property.areaSize} {property.areaUnit}</p>
                          <p className="text-sm text-muted-foreground font-medium">Total Area</p>
                        </div>
                      </div>
                    )}
                    {property.landTenure && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/10 rounded-xl"><FileText className="h-6 w-6 text-amber-600" /></div>
                        <div>
                          <p className="text-lg font-bold text-foreground">
                            {property.landTenure} {property.landTenurePercentage ? `${property.landTenurePercentage}%` : ''}
                          </p>
                          <p className="text-sm text-muted-foreground font-medium">Land Tenure</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">Description</h2>
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {property.description || 'No description provided.'}
                    </div>
                  </div>

                  {property.amenities && property.amenities.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h2 className="text-2xl font-bold text-foreground">Amenities</h2>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(property.amenities) ? property.amenities.map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> {amenity}
                          </Badge>
                        )) : property.amenities.split(',').map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="px-4 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-800">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> {amenity.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-border/50 shadow-lg sticky top-24">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Asking Price</p>
                  <p className="text-4xl font-extrabold text-primary indian-price mb-6">{formattedPrice}</p>
                  
                  <div className="border-t border-border/60 pt-6 mb-6">
                    <p className="text-sm font-bold text-muted-foreground mb-4">Listed By</p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg">Verified Owner</p>
                        <p className="text-sm text-muted-foreground">Growperty Protected</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={() => window.location.href = `tel:${PLATFORM_PHONE}`} 
                      className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] bg-primary text-primary-foreground"
                    >
                      <Phone className="mr-2 h-5 w-5" /> Call Now
                    </Button>
                    <Button 
                      onClick={() => window.open(`https://wa.me/${PLATFORM_WHATSAPP}`, '_blank')} 
                      className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] bg-[#25D366] hover:bg-[#20bd5a] text-white"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" /> Message on WhatsApp
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-4 font-medium">
                    Secure communication via Growperty. Direct contact info is hidden for privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PropertyDetailsPage;