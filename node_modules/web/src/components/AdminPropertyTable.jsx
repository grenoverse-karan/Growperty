import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle, RefreshCw, Loader2, XCircle } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';
import pb from '@/lib/pocketbaseClient';
import AdminPropertyActions from './AdminPropertyActions.jsx';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { toast } from 'sonner';

const AdminPropertyTable = ({ refreshTrigger }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, adminLogout } = useAdminAuth();
  
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSlowRequest, setIsSlowRequest] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20 });
  
  const abortControllerRef = useRef(null);

  const currentStatus = searchParams.get('status') || 'pending';

  const fetchProperties = async () => {
    if (!token) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setIsSlowRequest(false);

    const slowTimer = setTimeout(() => {
      setIsSlowRequest(true);
    }, 15000);

    try {
      const currentParams = new URLSearchParams(searchParams);
      if (!currentParams.has('page')) currentParams.set('page', '1');
      if (!currentParams.has('limit')) currentParams.set('limit', '20');
      if (!currentParams.has('status')) currentParams.set('status', 'pending');
      
      const query = currentParams.toString();
      
      const response = await apiServerClient.fetch(`/admin/properties?${query}`, {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      clearTimeout(slowTimer);
      
      if (response.status === 401) {
        adminLogout(false);
        toast.error('Session expired, please login again');
        navigate('/admin-login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setProperties(data.items || []);
      setPagination({
        total: data.totalItems || 0,
        page: data.page || 1,
        limit: data.perPage || 20
      });
    } catch (err) {
      clearTimeout(slowTimer);
      
      if (err.name === 'AbortError') {
        console.log('Properties fetch was canceled by the user.');
      } else {
        console.error('Error fetching properties:', err);
        setError(err.message || 'A network error occurred while loading properties. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
      setIsSlowRequest(false);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  useEffect(() => {
    fetchProperties();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchParams, refreshTrigger, token]);

  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handlePageChange = (newPage) => {
    const currentParams = Object.fromEntries([...searchParams]);
    currentParams.page = newPage.toString();
    setSearchParams(currentParams);
  };

  const handleStatusChange = (newStatus) => {
    const currentParams = Object.fromEntries([...searchParams]);
    if (newStatus === 'all') {
      delete currentParams.status;
    } else {
      currentParams.status = newStatus;
    }
    currentParams.page = '1';
    setSearchParams(currentParams);
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status?.toLowerCase() || 'pending';
    
    if (normalizedStatus === 'suspended') return <Badge className="bg-gray-500 hover:bg-gray-600 text-white">Suspended</Badge>;
    if (normalizedStatus === 'rejected') return <Badge className="bg-red-500 hover:bg-red-600 text-white">Rejected</Badge>;
    if (normalizedStatus === 'approved') return <Badge className="bg-green-500 hover:bg-green-600 text-white">Approved</Badge>;
    
    return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Pending</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
      }).format(date);
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-border/50 overflow-x-auto">
        <Tabs value={currentStatus} onValueChange={handleStatusChange} className="w-full">
          <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-2">
            <TabsTrigger value="all" className="data-[state=active]:bg-black data-[state=active]:text-white rounded-xl px-6">All</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-xl px-6">Pending</TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-xl px-6">Approved</TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-xl px-6">Rejected</TabsTrigger>
            <TabsTrigger value="suspended" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white rounded-xl px-6">Suspended</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Slow Request Warning */}
      {isSlowRequest && isLoading && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400">
            <Loader2 className="h-5 w-5 animate-spin shrink-0" />
            <div>
              <p className="font-bold">Request is taking longer than expected</p>
              <p className="text-sm opacity-80">The server might be experiencing high load or your connection is slow.</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancelRequest}
            className="shrink-0 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300"
          >
            <XCircle className="h-4 w-4 mr-2" /> Cancel Request
          </Button>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-8 text-center bg-destructive/5 border border-destructive/20 rounded-2xl animate-in fade-in">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4 opacity-80" />
          <h3 className="text-lg font-bold text-destructive mb-2">Failed to load properties</h3>
          <p className="text-destructive/80 font-medium mb-6 max-w-md mx-auto">{error}</p>
          <Button onClick={fetchProperties} className="rounded-xl font-bold shadow-sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      )}

      {/* Data Table */}
      {!error && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                <TableRow>
                  <TableHead className="font-bold whitespace-nowrap">ID</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Date/Time</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Thumbnail</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Owner Name</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Owner Phone</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Property Type</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">City</TableHead>
                  <TableHead className="font-bold whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right font-bold whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-12 w-16 rounded-lg" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32 ml-auto rounded-lg" /></TableCell>
                    </TableRow>
                  ))
                ) : properties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-10 w-10 mb-3 opacity-20" />
                        <p className="font-medium">No properties found matching your filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  properties.map((property) => (
                    <TableRow key={property.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <TableCell>
                        <button 
                          onClick={() => navigate(`/admin/properties/${property.id}`)}
                          className="font-mono text-xs font-bold text-primary hover:underline"
                        >
                          {property.id}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(property.created_at || property.created)}
                      </TableCell>
                      <TableCell>
                        <div className="h-12 w-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-border/50 flex items-center justify-center">
                          {property.thumbnail ? (
                            <img 
                              src={pb.files.getUrl(property, property.thumbnail, { thumb: '100x100' })} 
                              alt="Thumbnail"
                              className="h-full w-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                            />
                          ) : null}
                          <ImageIcon className={`h-5 w-5 text-slate-400 ${property.thumbnail ? 'hidden' : 'block'}`} />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-bold text-slate-900 dark:text-white">
                        {property.ownerName || property.owner?.name || 'Unknown Owner'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {property.ownerMobileNumber || property.ownerPhone || property.owner?.phone || 'No Phone'}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {property.propertyType || 'Unspecified'}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {property.city || 'Unspecified'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(property.status)}
                      </TableCell>
                      <TableCell>
                        <AdminPropertyActions property={property} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && properties.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground font-medium">
            Showing <span className="font-bold text-foreground">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-bold text-foreground">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-bold text-foreground">{pagination.total}</span> properties
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-lg font-bold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <div className="text-sm font-medium px-2">
              Page {pagination.page} of {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="rounded-lg font-bold"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyTable;