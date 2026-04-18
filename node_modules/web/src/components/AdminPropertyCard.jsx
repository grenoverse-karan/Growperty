import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, CheckCircle, XCircle, Edit, Trash2, Image as ImageIcon, MessageCircle, Phone } from 'lucide-react';
import { formatIndianPrice } from '@/hooks/useProperties.js';

const AdminPropertyCard = ({ property, onApprove, onReject, onDelete }) => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  const handleRejectSubmit = () => {
    onReject(property.id, rejectNotes);
    setIsRejectModalOpen(false);
    setRejectNotes('');
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  const whatsappMessage = `Hi, I'm interested in your property: ${property.title} - ${formatIndianPrice(property.price)} - ${property.location}. View details: https://growperty.com/properties/${property.id}`;
  const whatsappUrl = `https://wa.me/${property.ownerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-48 h-48 sm:h-auto relative flex-shrink-0">
            <img 
              src={property.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'} 
              alt={property.title} 
              className="w-full h-full object-cover"
            />
            <Badge className={`absolute top-2 left-2 ${statusColors[property.status || 'pending']} border-none font-bold uppercase tracking-wider text-[10px]`}>
              {property.status || 'pending'}
            </Badge>
          </div>
          
          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-foreground line-clamp-1">{property.title}</h3>
                <span className="text-lg font-extrabold text-primary whitespace-nowrap ml-4">
                  {formatIndianPrice(property.price)}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}, {property.city}
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                <div><span className="text-muted-foreground">Seller:</span> <span className="font-medium">{property.ownerName || 'Unknown'}</span></div>
                <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{property.propertyType}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date(property.created).toLocaleDateString()}</span></div>
                <div><span className="text-muted-foreground">ID:</span> <span className="font-medium text-xs">{property.id}</span></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/50">
              {property.status !== 'approved' && (
                <Button size="sm" onClick={() => onApprove(property.id)} className="bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-1.5" /> Approve
                </Button>
              )}
              {property.status !== 'rejected' && (
                <Button size="sm" variant="destructive" onClick={() => setIsRejectModalOpen(true)}>
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject
                </Button>
              )}
              
              <div className="flex-1"></div>
              
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-medium transition-colors">
                <MessageCircle className="h-4 w-4 mr-1.5" /> WA
              </a>
              <a href={`tel:${property.ownerPhone}`} className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-secondary hover:bg-secondary/90 text-white text-sm font-medium transition-colors">
                <Phone className="h-4 w-4 mr-1.5" /> Call
              </a>
              <Button size="sm" variant="outline" title="View Images">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" title="Edit">
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => onDelete(property.id)} title="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property Listing</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Reason for rejection (sent to seller):</label>
            <Textarea 
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g., Images are blurry, price seems incorrect..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSubmit} disabled={!rejectNotes.trim()}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPropertyCard;