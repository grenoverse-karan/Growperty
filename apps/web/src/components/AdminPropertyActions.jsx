import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, CheckCircle, XCircle, Ban } from 'lucide-react';
import { toast } from 'sonner';

const AdminPropertyActions = ({ property }) => {
  const ownerPhone = property.ownerMobileNumber || property.owner?.phone;
  const ownerName = property.ownerName || property.owner?.name || 'Owner';

  const handleCall = () => {
    if (ownerPhone) {
      window.location.href = `tel:${ownerPhone}`;
    } else {
      toast.error('No phone number available for this owner.');
    }
  };

  const handleWhatsApp = () => {
    if (ownerPhone) {
      const cleanPhone = ownerPhone.replace(/\D/g, '');
      const message = encodeURIComponent(`Regarding your property: ${property.title || property.id}`);
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    } else {
      toast.error('No phone number available for this owner.');
    }
  };

  return (
    <div className="flex items-center gap-1 justify-end">
      {/* Call Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleCall}
        disabled={!ownerPhone}
        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        title="Call Owner"
      >
        <Phone className="h-4 w-4" />
      </Button>

      {/* WhatsApp Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleWhatsApp}
        disabled={!ownerPhone}
        className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
        title="WhatsApp Owner"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>

      {/* Approve Button (Disabled per requirements) */}
      <Button 
        variant="ghost" 
        size="icon" 
        disabled={true}
        className="h-8 w-8 text-slate-300 dark:text-slate-700 rounded-lg cursor-not-allowed"
        title="Approve (Disabled)"
      >
        <CheckCircle className="h-4 w-4" />
      </Button>

      {/* Reject Button (Disabled per requirements) */}
      <Button 
        variant="ghost" 
        size="icon" 
        disabled={true}
        className="h-8 w-8 text-slate-300 dark:text-slate-700 rounded-lg cursor-not-allowed"
        title="Reject (Disabled)"
      >
        <XCircle className="h-4 w-4" />
      </Button>

      {/* Suspend User Toggle (Disabled per requirements) */}
      <Button 
        variant="ghost" 
        size="icon" 
        disabled={true}
        className="h-8 w-8 text-slate-300 dark:text-slate-700 rounded-lg cursor-not-allowed"
        title="Suspend (Disabled)"
      >
        <Ban className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AdminPropertyActions;