import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, MapPin, User, Calendar } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
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

const AdminApprovalsPage = () => {
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
      const records = await pb.collection('properties').getList(1, 50, {
        filter: 'status = "pending"',
        sort: '-created',
        $autoCancel: false
      });
      setProperties(records.items);
    } catch (error) {
      console.error('Failed to fetch pending properties:', error);
      toast.error('Failed to load pending properties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (propertyId) => {
    setActionLoading(propertyId);
    try {
      await pb.collection('properties').update(propertyId, {
        status: 'approved'
      }, { $autoCancel: false });
      
      toast.success('Property approved successfully');
      await fetchPendingProperties();
    } catch (error) {
      console.error('Failed to approve property:', error);
      toast.error('Failed to approve property');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (propertyId) => {
    setRejectDialog({ open: true, propertyId });
    setRejectionReason('');
  };

  const handleRejectConfirm = async () => {
    const { propertyId } = rejectDialog;
    setActionLoading(propertyId);
    
    try {
      await pb.collection('properties').update(propertyId, {
        status: 'rejected'
      }, { $autoCancel: false });
      
      toast.success('Property rejected');
      setRejectDialog({ open: false, propertyId: null });
      await fetchPendingProperties();
    } catch (error) {
      console.error('Failed to reject property:', error);
      toast.error('Failed to reject property');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Property Approvals - Admin</title>
        <meta name="description" content="Review and approve pending property listings" />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Property Approvals
            </h1>
            <p className="text-muted-foreground font-medium">
              Review and approve pending property listings
            </p>
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
                  There are no pending properties to review at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-grow">
                        <h3 className="font-bold text-xl">
                          {property.propertyType || 'Property'}
                          {property.bhk && ` - ${property.bhk}`}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">
                              {property.sector}, {property.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{property.name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{formatDate(property.created)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 font-bold">
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {property.totalPrice && (
                      <p className="text-lg font-bold text-primary">
                        ₹ {new Intl.NumberFormat('en-IN').format(property.totalPrice)}
                      </p>
                    )}
                    {property.totalArea && (
                      <p className="text-sm text-muted-foreground">
                        Area: {property.totalArea} {property.areaUnit || 'Sq.ft'}
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
                      onClick={() => handleApprove(property.id)}
                      disabled={actionLoading === property.id}
                      className="flex-1"
                    >
                      {actionLoading === property.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(property.id)}
                      disabled={actionLoading === property.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, propertyId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this property listing? You can optionally provide a reason.
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
              {actionLoading === rejectDialog.propertyId ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminApprovalsPage;