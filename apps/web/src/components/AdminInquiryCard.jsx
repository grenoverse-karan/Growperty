import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Calendar, CheckCircle, Trash2, Eye } from 'lucide-react';

const AdminInquiryCard = ({ inquiry, onResolve, onDelete }) => {
  const isResolved = inquiry.status === 'resolved';

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground line-clamp-1">{inquiry.propertyName || 'Unknown Property'}</h3>
              </div>
              <Badge className={isResolved ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-amber-100 text-amber-800 hover:bg-amber-100'}>
                {inquiry.status || 'pending'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-border/50">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Buyer Details</p>
                <p className="text-sm font-semibold flex items-center"><User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> {inquiry.buyerName || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground ml-5">{inquiry.buyerPhone || 'No phone'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">Seller Details</p>
                <p className="text-sm font-semibold flex items-center"><User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> {inquiry.sellerName || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground ml-5">{inquiry.sellerPhone || 'No phone'}</p>
              </div>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground font-medium">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {new Date(inquiry.created).toLocaleString()}
            </div>
          </div>

          <div className="flex md:flex-col gap-2 justify-end border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-4">
            {!isResolved && (
              <Button size="sm" onClick={() => onResolve(inquiry.id)} className="bg-green-600 hover:bg-green-700 text-white w-full">
                <CheckCircle className="h-4 w-4 mr-1.5" /> Resolve
              </Button>
            )}
            <Button size="sm" variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-1.5" /> View
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full" onClick={() => onDelete(inquiry.id)}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInquiryCard;