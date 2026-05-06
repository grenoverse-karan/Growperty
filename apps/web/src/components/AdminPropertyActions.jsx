import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, CheckCircle, XCircle, Ban, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';

const AdminPropertyActions = ({ property, onStatusChange }) => {
  const { token } = useAdminAuth();
  const [loadingStatus, setLoadingStatus] = useState(null);

  const ownerPhone = property.mobileNumber || property.ownerMobileNumber || property.owner?.phone;
  const propertyId = property.id || property._id;

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
      const message = encodeURIComponent(`Regarding your property listing on Growperty (ID: ${propertyId})`);
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    } else {
      toast.error('No phone number available for this owner.');
    }
  };

  const updateStatus = async (status) => {
    if (!propertyId) return;
    setLoadingStatus(status);
    try {
      const response = await apiServerClient.fetch(`/admin/properties/${propertyId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Server error: ${response.status}`);

      const labels = { approved: 'Approved', rejected: 'Rejected', suspended: 'Suspended' };
      toast.success(`Property ${labels[status] || status}`);
      onStatusChange?.();
    } catch (err) {
      console.error(`[AdminPropertyActions] Failed to set status=${status}:`, err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setLoadingStatus(null);
    }
  };

  const isLoading = loadingStatus !== null;

  return (
    <div className="flex items-center gap-1 justify-end">
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

      <Button
        variant="ghost"
        size="icon"
        onClick={() => updateStatus('approved')}
        disabled={isLoading || property.status === 'approved'}
        className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
        title="Approve"
      >
        {loadingStatus === 'approved' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => updateStatus('rejected')}
        disabled={isLoading || property.status === 'rejected'}
        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Reject"
      >
        {loadingStatus === 'rejected' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => updateStatus('suspended')}
        disabled={isLoading || property.status === 'suspended'}
        className="h-8 w-8 text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
        title="Suspend"
      >
        {loadingStatus === 'suspended' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default AdminPropertyActions;
