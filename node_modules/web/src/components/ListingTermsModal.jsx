import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const ListingTermsModal = ({ onAccept, onCancel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('growperty_listing_terms_accepted');
    if (!hasAccepted) {
      setIsOpen(true);
    } else {
      onAccept();
    }
  }, [onAccept]);

  const handleContinue = () => {
    if (isAgreed) {
      localStorage.setItem('growperty_listing_terms_accepted', 'true');
      setIsOpen(false);
      onAccept();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (onCancel) onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isAgreed) {
        handleCancel();
      }
    }}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl">
        <div className="bg-primary/5 p-6 flex items-center gap-4 border-b border-border/50">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-xl font-extrabold text-foreground">
              Growperty.com Listing Policy
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground mt-1">
              Please read our security and privacy guidelines before listing.
            </DialogDescription>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              To ensure the highest quality of leads and protect your privacy, Growperty.com operates as a secure intermediary for all property inquiries.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>All inquiries are routed through Growperty.com.</strong> We verify buyers before connecting them with you.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>Your contact info is kept strictly confidential.</strong> It will never be displayed publicly on your listing.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-foreground font-medium"><strong>Do not share personal phone numbers in the property description.</strong> Our system automatically detects and removes them to prevent spam calls.</span>
              </li>
            </ul>
          </div>

          <div className="flex items-start space-x-3 bg-muted/50 p-4 rounded-xl border border-border/50">
            <Checkbox 
              id="terms-agree" 
              checked={isAgreed} 
              onCheckedChange={(checked) => setIsAgreed(checked)} 
              className="mt-1"
            />
            <label 
              htmlFor="terms-agree" 
              className="text-sm font-medium leading-snug cursor-pointer select-none"
            >
              I understand and agree to this policy. I will not include my personal contact information in the property description.
            </label>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 gap-3 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto rounded-xl font-bold">
            Cancel
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={!isAgreed}
            className="w-full sm:w-auto rounded-xl font-bold transition-all active:scale-[0.98]"
          >
            Continue to Listing Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ListingTermsModal;