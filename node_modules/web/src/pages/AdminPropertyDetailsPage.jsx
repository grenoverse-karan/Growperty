import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Building2, MapPin, User, Phone, Calendar, AlertCircle } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';

const AdminPropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch single property using PocketBase directly since it's a standard read operation
        // and the backend might not have a specific GET /:id endpoint documented
        const record = await pb.collection('properties').getOne(id, { 
          expand: 'owner_id',
          $autoCancel: false 
        });
        setProperty(record);
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to load property details. It may have been deleted.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const getStatusBadge = (status, isActive) => {
    if (status === 'suspended') return <Badge className="bg-status-suspended">Suspended</Badge>;
    if (status === 'rejected') return <Badge className="bg-status-rejected">Rejected</Badge>;
    if (status === 'pending') return <Badge className="bg-status-pending text-amber-950">Pending</Badge>;
    if (status === 'approved') {
      return isActive 
        ? <Badge className="bg-status-approved">Active</Badge>
        : <Badge variant="outline" className="text-status-approved border-status-approved">Approved (Inactive)</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate('/admin')} className="rounded-xl font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{property ? `${property.title} - Admin` : 'Property Details'} - Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <ArrowLeft className="h-5 w-5 mr-2" /> Back
            </Button>
            <h1 className="text-2xl font-extrabold tracking-tight">Property Details</h1>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-48 rounded-2xl col-span-2" />
                <Skeleton className="h-48 rounded-2xl" />
              </div>
            </div>
          ) : property && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-3xl shadow-sm border-border/50 overflow-hidden">
                  {property.coverPhoto || property.thumbnail ? (
                    <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 relative">
                      <img 
                        src={pb.files.getUrl(property, property.coverPhoto || property.thumbnail)} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(property.status, property.is_active)}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                      <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                      <div className="absolute top-4 right-4">
                        {getStatusBadge(property.status, property.is_active)}
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6 sm:p-8">
                    <div className="mb-6">
                      <p className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">{property.propertyType} • {property.propertyCategory}</p>
                      <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{property.title}</h2>
                      <div className="flex items-center text-muted-foreground font-medium">
                        <MapPin className="h-4 w-4 mr-1.5" />
                        {property.sector}, {property.city}
                      </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                      <h3 className="text-lg font-bold">Description</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {property.description || 'No description provided.'}
                      </p>
                    </div>

                    {property.rejection_reason && property.status === 'rejected' && (
                      <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                        <h4 className="text-sm font-bold text-red-800 dark:text-red-400 mb-1">Rejection Reason</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">{property.rejection_reason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Property Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Price</p>
                        <p className="font-extrabold text-lg indian-price">₹{property.expectedPrice?.toLocaleString('en-IN') || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Area</p>
                        <p className="font-bold text-lg">{property.areaSize} {property.areaUnit}</p>
                      </div>
                      {property.bhk && (
                        <div>
                          <p className="text-sm text-muted-foreground font-medium mb-1">Bedrooms</p>
                          <p className="font-bold text-lg">{property.bhk} BHK</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Facing</p>
                        <p className="font-bold text-lg">{property.facingDirection || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Age</p>
                        <p className="font-bold text-lg">{property.propertyAge || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Possession</p>
                        <p className="font-bold text-lg">{property.possessionStatus || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="rounded-3xl shadow-sm border-border/50">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      Owner Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Name</p>
                      <p className="font-bold text-slate-900 dark:text-white">{property.expand?.owner_id?.name || property.ownerName || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Phone Number</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <p className="font-bold text-slate-900 dark:text-white">{property.expand?.owner_id?.phone || property.ownerMobileNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Account Status</p>
                      {property.expand?.owner_id?.is_suspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-sm border-border/50">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      System Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Property ID</p>
                      <p className="font-mono text-sm font-bold bg-slate-100 dark:bg-slate-800 p-2 rounded-lg break-all">{property.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Created At</p>
                      <p className="font-medium text-sm">{new Date(property.created).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Last Updated</p>
                      <p className="font-medium text-sm">{new Date(property.updated).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPropertyDetailsPage;