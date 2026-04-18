import React, { useState, useEffect } from 'react';
import { Loader2, Search, Trash2, CheckCircle, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { formatPriceInWords } from '@/lib/priceUtils.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const AdminRequirementsTab = () => {
  const [requirements, setRequirements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchingProperties, setMatchingProperties] = useState([]);
  const [isMatching, setIsMatching] = useState(false);

  const fetchRequirements = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('buyer_requirements').getList(1, 50, {
        sort: '-created',
        $autoCancel: false
      });
      setRequirements(records.items);
    } catch (error) {
      console.error('Error fetching requirements:', error);
      toast.error('Failed to load requirements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleViewDetails = async (req) => {
    setSelectedReq(req);
    setIsModalOpen(true);
    setIsMatching(true);
    
    try {
      // Build match filter
      let filterStr = `propertyType = "${req.propertyType}" && city = "${req.city}" && status = "approved"`;
      if (req.bhk) filterStr += ` && bhk = ${req.bhk}`;
      if (req.minPrice) filterStr += ` && expectedPrice >= ${req.minPrice}`;
      if (req.maxPrice) filterStr += ` && expectedPrice <= ${req.maxPrice}`;
      
      const matches = await pb.collection('properties').getList(1, 10, {
        filter: filterStr,
        $autoCancel: false
      });
      setMatchingProperties(matches.items);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setIsMatching(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await pb.collection('buyer_requirements').update(id, { status: newStatus }, { $autoCancel: false });
      toast.success(`Status updated to ${newStatus}`);
      fetchRequirements();
      if (selectedReq && selectedReq.id === id) {
        setSelectedReq({ ...selectedReq, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this requirement?')) return;
    try {
      await pb.collection('buyer_requirements').delete(id, { $autoCancel: false });
      toast.success('Requirement deleted');
      fetchRequirements();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete requirement');
    }
  };

  const filteredReqs = requirements.filter(r => 
    r.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.propertyType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, city, or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-900"
          />
        </div>
        <Button onClick={fetchRequirements} variant="outline" size="sm">Refresh</Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredReqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No requirements found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReqs.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="text-sm">{new Date(req.created).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <p className="font-medium">{req.buyerName}</p>
                    <p className="text-xs text-muted-foreground">{req.buyerPhone}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{req.propertyType} {req.bhk ? `(${req.bhk} BHK)` : ''}</p>
                    <p className="text-xs text-muted-foreground">{req.sector}, {req.city}</p>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatPriceInWords(req.minPrice)} - {formatPriceInWords(req.maxPrice)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={req.status === 'active' ? 'default' : 'secondary'}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(req)}>
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Requirement Details</DialogTitle>
            <DialogDescription>Submitted on {selectedReq && new Date(selectedReq.created).toLocaleString()}</DialogDescription>
          </DialogHeader>
          
          {selectedReq && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-sm text-muted-foreground">Buyer Name</p>
                  <p className="font-bold">{selectedReq.buyerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-bold">{selectedReq.buyerPhone} | {selectedReq.buyerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-bold">{selectedReq.propertyType} {selectedReq.propertySubType ? `- ${selectedReq.propertySubType}` : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-bold">{selectedReq.sector}, {selectedReq.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-bold text-primary">{formatPriceInWords(selectedReq.minPrice)} - {formatPriceInWords(selectedReq.maxPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedReq.status === 'active' ? 'default' : 'secondary'}>{selectedReq.status}</Badge>
                </div>
              </div>

              {selectedReq.specialRequirements && (
                <div>
                  <h4 className="font-bold mb-2">Special Requirements</h4>
                  <p className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-lg whitespace-pre-wrap">
                    {selectedReq.specialRequirements}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" /> 
                  Matching Properties ({matchingProperties.length})
                </h4>
                {isMatching ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Finding matches...</div>
                ) : matchingProperties.length > 0 ? (
                  <div className="space-y-2">
                    {matchingProperties.map(prop => (
                      <div key={prop.id} className="flex justify-between items-center p-3 border border-border rounded-lg hover:bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{prop.title}</p>
                          <p className="text-xs text-muted-foreground">{formatPriceInWords(prop.expectedPrice)}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => window.open(`/property/${prop.id}`, '_blank')}>View</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4" /> No exact matches found currently.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                {selectedReq.status === 'active' ? (
                  <Button onClick={() => handleUpdateStatus(selectedReq.id, 'inactive')} variant="secondary">Mark as Inactive</Button>
                ) : (
                  <Button onClick={() => handleUpdateStatus(selectedReq.id, 'active')} variant="default">Mark as Active</Button>
                )}
                <Button onClick={() => handleDelete(selectedReq.id)} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequirementsTab;