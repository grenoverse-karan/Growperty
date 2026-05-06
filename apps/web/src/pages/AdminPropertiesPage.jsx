import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, MapPin, User, Calendar, Phone } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { formatIndianPrice } from '@/hooks/useProperties.js';

const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectDialog, setRejectDialog] = useState({ open: false, propertyId: null });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch('/properties?status=pending&limit=100');
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Server error: ${response.status}`);
      }
      const data = await response.json();
      setProperties(data.items || []);
    } catch (error) {
      console.error('Failed to fetch pending properties:', error);
      toast.error('Failed to load pending properties');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (propertyId, status) => {
    setActionLoading(propertyId);
    try {
      const response = await apiServerClient.fetch(`/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Server error: ${response.status}`);
      }
      toast.success(status === 'approved' ? 'Property approved successfully' : 'Property rejected');
      setProperties(prev => prev.filter(p => (p._id || p.id) !== propertyId));
    } catch (error) {
      console.error(`Failed to ${status} property:`, error);
      toast.error(`Failed to ${status} property`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (propertyId) => updateStatus(propertyId, 'approved');

  const handleRejectClick = (propertyId) => {
    setRejectDialog({ open: true, propertyId });
    setRejectionReason('');
  };

  const handleRejectConfirm = async () => {
    await updateStatus(rejectDialog.propertyId, 'rejected');
    setRejectDialog({ open: false, propertyId: null });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Pending Properties - Admin | Growperty</title>
      </Helmet>

      <Header />

      <main className="flex-grow py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                Pending Properties
              </h1>
              <p className="text-muted-foreground font-medium">
                Review and approve or reject property listings
              </p>
            </div>
            <Badge className="text-base px-4 py-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 font-bold">
              {properties.length} pending
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="space-y-4">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                <h2 className="text-2xl font-bold">All caught up!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No pending properties to review right now.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => {
                const id = property._id || property.id;
                return (
                  <Card key={id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-grow">
                          <h3 className="font-bold text-xl">
                            {property.propertyType || 'Property'}
                            {property.bhk && ` · ${property.bhk}`}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {(property.sector || property.city) && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                <span className="font-medium">
                                  {[property.sector, property.city].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                            {property.name && (
                              <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{property.name}</span>
                              </div>
                            )}
                            {property.mobileNumber && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-4 w-4" />
                                <span className="font-medium">{property.mobileNumber}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">{formatDate(property.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 font-bold shrink-0">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2">
                      {property.totalPrice && (
                        <p className="text-lg font-bold text-primary">
                          {formatIndianPrice(property.totalPrice)}
                        </p>
                      )}
                      {property.totalArea && (
                        <p className="text-sm text-muted-foreground">
                          Area: {property.totalArea} {property.areaUnit || 'Sq.ft'}
                        </p>
                      )}
                      {property.ownerType && (
                        <p className="text-sm text-muted-foreground">
                          Owner type: {property.ownerType}
                        </p>
                      )}
                      {property.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {property.description}
                        </p>
                      )}
                    </CardContent>

                    <CardFooter className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(id)}
                        disabled={actionLoading === id}
                        className="flex-1"
                      >
                        {actionLoading === id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectClick(id)}
                        disabled={actionLoading === id}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ open, propertyId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this property listing?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Label htmlFor="reason">Rejection Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, propertyId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={actionLoading === rejectDialog.propertyId}
            >
              {actionLoading === rejectDialog.propertyId && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminPropertiesPage;
