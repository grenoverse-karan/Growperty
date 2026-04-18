import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Building2, MessageSquare, Ban, CheckCircle } from 'lucide-react';

const AdminUserCard = ({ user, onToggleStatus }) => {
  const isSeller = user.role === 'seller';
  const isActive = user.status !== 'inactive';

  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/10">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {user.name?.substring(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground truncate">{user.name || 'Unnamed User'}</h3>
            <Badge variant="outline" className={isSeller ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}>
              {user.role || 'buyer'}
            </Badge>
            {!isActive && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
            <span className="flex items-center"><Mail className="h-3.5 w-3.5 mr-1.5" /> {user.email}</span>
            {user.phone && <span className="flex items-center"><Phone className="h-3.5 w-3.5 mr-1.5" /> {user.phone}</span>}
          </div>
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50">
          <div className="flex gap-4 text-center">
            {isSeller ? (
              <div>
                <p className="text-2xl font-extrabold text-foreground">{user.propertiesCount || 0}</p>
                <p className="text-xs text-muted-foreground font-medium flex items-center justify-center"><Building2 className="h-3 w-3 mr-1" /> Listings</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-extrabold text-foreground">{user.inquiriesCount || 0}</p>
                <p className="text-xs text-muted-foreground font-medium flex items-center justify-center"><MessageSquare className="h-3 w-3 mr-1" /> Inquiries</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 ml-auto sm:ml-0">
            <Button size="sm" variant="outline" className="w-full sm:w-auto">View Profile</Button>
            {isActive ? (
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto" onClick={() => onToggleStatus(user.id, 'inactive')}>
                <Ban className="h-4 w-4 mr-1.5" /> Deactivate
              </Button>
            ) : (
              <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50 w-full sm:w-auto" onClick={() => onToggleStatus(user.id, 'active')}>
                <CheckCircle className="h-4 w-4 mr-1.5" /> Activate
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUserCard;