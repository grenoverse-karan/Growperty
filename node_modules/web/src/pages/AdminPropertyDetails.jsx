import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, MapPin, User, Clock, ShieldAlert } from 'lucide-react';
import { formatIndianPrice, useProperties } from '@/hooks/useProperties.js';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const AdminPropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updatePropertyStatus } = useProperties();
  
  const [property, setProperty] = useState(null);
  const [owner, setOwner] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const propRecord = await pb.collection('properties').getOne(id, { expand: 'userId', $autoCancel: false });
        setProperty(propRecord);
        if (propRecord.expand?.userId) setOwner(propRecord.expand.userId);

        try {
          const logsRecord = await pb.collection('contentLogs').getFullList({
            filter: `listingId="${id}"`,
            sort: '-created',
            $autoCancel: false
          });
          setLogs(logsRecord);
        } catch (e) {
          console.warn('Could not fetch logs', e);
        }
      } catch (err) {
        console.error('Error fetching admin property details:', err);
        toast.error('Failed to load property details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await updatePropertyStatus(id, status);
      setProperty(prev => ({ ...prev, status }));
      toast.success(`Property marked as ${status}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-32 w-32 rounded-full" /></div>;
  }

  if (!property) {
    return <div className="p-8 text-center">Property not found.</div>;
  }

  return (
    <>
      <Helmet><title>Admin: {property.title}</title></Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/admin-dashboard')} className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <div className="flex gap-3">
              {property.status !== 'approved' && (
                <Button onClick={() => handleStatusChange('approved')} className="bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="mr-2 h-4 w-4" /> Approve
                </Button>
              )}
              {property.status !== 'rejected' && (
                <Button onClick={() => handleStatusChange('rejected')} variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl">{property.title}</CardTitle>
                    <Badge variant={property.status === 'approved' ? 'default' : property.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {property.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-bold text-sm text-muted-foreground mb-2">Description</h3>
                    <p className="whitespace-pre-wrap text-sm">{property.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase">Price</p>
                      <p className="font-bold text-lg">{formatIndianPrice(property.price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase">BHK / Bath</p>
                      <p className="font-bold text-lg">{property.bedrooms} / {property.bathrooms}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Full Private Address */}
              <Card className="border-blue-200 dark:border-blue-900">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/50">
                  <CardTitle className="text-lg flex items-center text-blue-800 dark:text-blue-300">
                    <MapPin className="mr-2 h-5 w-5" /> Full Private Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-bold text-muted-foreground">Flat/House No:</span> {property.flatHouseNumber || 'N/A'}</div>
                    <div><span className="font-bold text-muted-foreground">Sector:</span> {property.sector || 'N/A'}</div>
                    <div><span className="font-bold text-muted-foreground">Locality:</span> {property.locality || 'N/A'}</div>
                    <div><span className="font-bold text-muted-foreground">Area:</span> {property.area || 'N/A'}</div>
                    <div><span className="font-bold text-muted-foreground">City:</span> {property.city || property.location || 'N/A'}</div>
                    <div><span className="font-bold text-muted-foreground">Pincode:</span> {property.pincode || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <span className="font-bold text-muted-foreground text-xs uppercase block mb-1">Combined String</span>
                    {property.fullAddress || 'N/A'}
                  </div>
                </CardContent>
              </Card>

              {/* Content Logs */}
              <Card className="border-orange-200 dark:border-orange-900">
                <CardHeader className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-900/50">
                  <CardTitle className="text-lg flex items-center text-orange-800 dark:text-orange-300">
                    <ShieldAlert className="mr-2 h-5 w-5" /> Content Filtering Logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {logs.length > 0 ? (
                    <div className="space-y-4">
                      {logs.map(log => (
                        <div key={log.id} className="p-4 border border-orange-200 dark:border-orange-800 rounded-xl bg-white dark:bg-slate-900">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Filtered: {log.fieldName}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center"><Clock className="h-3 w-3 mr-1"/> {new Date(log.created).toLocaleString()}</span>
                          </div>
                          <p className="text-sm font-medium">Removed Content:</p>
                          <p className="text-sm text-destructive font-mono bg-destructive/10 p-2 rounded mt-1 break-all">{log.removedContent}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No contact info was filtered for this listing.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center"><User className="mr-2 h-5 w-5" /> Owner Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {owner ? (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase">Name</p>
                        <p className="font-medium">{owner.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase">Email</p>
                        <p className="font-medium">{owner.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-bold uppercase">User ID</p>
                        <p className="font-mono text-xs">{owner.id}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Owner details unavailable.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPropertyDetails;