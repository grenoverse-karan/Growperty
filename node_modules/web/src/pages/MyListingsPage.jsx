import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Home, MapPin, IndianRupee, Eye, Edit, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MyListingsPage = () => {
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchMyProperties();
    }
  }, [currentUser]);

  const fetchMyProperties = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('properties').getList(1, 50, {
        filter: `owner_id = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      setProperties(records.items);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      toast.error('Failed to load your listings');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      approved: { variant: 'default', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      rejected: { variant: 'destructive', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge className={`${config.className} font-bold`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>My Listings - Property Portal</title>
        <meta name="description" content="Manage your property listings" />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              My Listings
            </h1>
            <p className="text-muted-foreground font-medium">
              Manage and track your property listings
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="space-y-4">
                <Home className="h-16 w-16 mx-auto text-muted-foreground" />
                <h2 className="text-2xl font-bold">No properties listed yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start by listing your first property to reach potential buyers
                </p>
                <Button asChild size="lg" className="mt-4">
                  <Link to="/list-property">List Your Property</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg leading-tight">
                        {property.propertyType || 'Property'}
                        {property.bhk && ` - ${property.bhk}`}
                      </h3>
                      {getStatusBadge(property.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="font-medium">
                        {property.sector}, {property.city}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-grow space-y-3">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-primary" />
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(property.totalPrice)}
                      </span>
                    </div>
                    
                    {property.totalArea && (
                      <p className="text-sm text-muted-foreground">
                        Area: {property.totalArea} {property.areaUnit || 'Sq.ft'}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="flex gap-2 mt-auto">
                    {property.status === 'approved' && (
                      <Button asChild variant="default" className="flex-1">
                        <Link to={`/property/${property.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    )}
                    {property.status === 'pending' && (
                      <Button asChild variant="secondary" className="flex-1">
                        <Link to={`/edit-property/${property.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyListingsPage;