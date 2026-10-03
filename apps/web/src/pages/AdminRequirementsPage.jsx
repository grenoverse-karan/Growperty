import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu.jsx';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog.jsx';
import {
  Phone, MessageCircle, MoreVertical, Star, EyeOff, Eye, Trash2,
  Flame, Sun, Snowflake, Search, ClipboardList,
} from 'lucide-react';

const TEMP_STYLE = {
  Hot:  { icon: Flame,     className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900' },
  Warm: { icon: Sun,       className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900' },
  Cold: { icon: Snowflake, className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900' },
};

const waLink = (phone) => {
  const digits = (phone || '').replace(/\D/g, '');
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountryCode}`;
};

const fmt = (n) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

export default function AdminRequirementsPage() {
  const { token } = useAdminAuth();
  const [reqs, setReqs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchReqs = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 50 });
      const res  = await apiServerClient.fetch(`/requirements?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setReqs(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(pg);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchReqs(1); }, [fetchReqs]);

  const patchReq = useCallback(async (id, patch) => {
    try {
      const res = await apiServerClient.fetch(`/requirements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setReqs(prev => prev.map(r => (r._id === id ? { ...r, ...data.item } : r)));
    } catch (err) {
      toast.error(err.message);
    }
  }, [token]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await apiServerClient.fetch(`/requirements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setReqs(prev => prev.filter(r => r._id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      toast.success('Lead deleted');
    } catch (err) {
      toast.error(err.message);
    }
  }, [token, deleteTarget]);

  const filtered = reqs.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.buyerName?.toLowerCase().includes(q) ||
      r.buyerPhone?.includes(q) ||
      r.buyerEmail?.toLowerCase().includes(q) ||
      r.city?.toLowerCase().includes(q) ||
      r.propertyType?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Helmet><title>Buyer Requirements — Admin</title></Helmet>
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <div className="max-w-[1400px] mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" /> Buyer Requirements
            </h1>
            <p className="text-muted-foreground text-sm mt-1">All property requirements submitted by buyers</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 max-w-2xl">
            <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{total}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{reqs.filter(r => r.status !== 'unlisted').length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hot Leads</p>
              <p className="text-3xl font-extrabold text-red-600 mt-1">{reqs.filter(r => r.leadTemperature === 'Hot').length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Featured</p>
              <p className="text-3xl font-extrabold text-amber-500 mt-1">{reqs.filter(r => r.featured).length}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, city, property type…"
              className="pl-9 h-11 rounded-xl bg-white dark:bg-slate-900"
            />
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-16 text-muted-foreground text-sm">No requirements found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Looking For</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => {
                      const temp = TEMP_STYLE[r.leadTemperature];
                      const isUnlisted = r.status === 'unlisted';
                      return (
                        <TableRow key={r._id}>
                          <TableCell className="font-bold whitespace-nowrap">{r.buyerName || '—'}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <a href={`tel:${r.buyerPhone}`} className="text-primary font-semibold hover:underline">{r.buyerPhone || '—'}</a>
                            {r.buyerEmail && <p className="text-xs text-muted-foreground mt-0.5">{r.buyerEmail}</p>}
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-sm">{[r.preferredBhk, r.propertyType].filter(Boolean).join(' ') || '—'}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{[r.city, r.buyerAddress].filter(Boolean).join(', ') || '—'}</p>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm font-medium">
                            {(r.minBudget || r.maxBudget) ? `${fmt(r.minBudget)} – ${fmt(r.maxBudget)}` : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {temp && (
                                <Badge variant="outline" className={`gap-1 font-bold ${temp.className}`}>
                                  <temp.icon className="h-3 w-3" /> {r.leadTemperature}
                                </Badge>
                              )}
                              {r.featured && (
                                <Badge variant="outline" className="gap-1 font-bold bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900">
                                  <Star className="h-3 w-3 fill-current" /> Featured
                                </Badge>
                              )}
                              {isUnlisted && (
                                <Badge variant="outline" className="gap-1 font-bold text-muted-foreground">
                                  <EyeOff className="h-3 w-3" /> Unlisted
                                </Badge>
                              )}
                              {!temp && !r.featured && !isUnlisted && <span className="text-muted-foreground text-sm">—</span>}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg" title="Call">
                                <a href={`tel:${r.buyerPhone}`}><Phone className="h-4 w-4" /></a>
                              </Button>
                              <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" title="WhatsApp">
                                <a href={waLink(r.buyerPhone)} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /></a>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="More actions">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Lead temperature</DropdownMenuLabel>
                                  {['Hot', 'Warm', 'Cold'].map(t => {
                                    const Icon = TEMP_STYLE[t].icon;
                                    const active = r.leadTemperature === t;
                                    return (
                                      <DropdownMenuItem key={t} onClick={() => patchReq(r._id, { leadTemperature: active ? null : t })}>
                                        <Icon className="h-4 w-4 mr-2" /> {active ? `Remove ${t}` : `Mark ${t}`}
                                      </DropdownMenuItem>
                                    );
                                  })}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => patchReq(r._id, { featured: !r.featured })}>
                                    <Star className="h-4 w-4 mr-2" /> {r.featured ? 'Remove from Featured' : 'Add to Featured'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => patchReq(r._id, { status: isUnlisted ? 'active' : 'unlisted' })}>
                                    {isUnlisted ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                                    {isUnlisted ? 'Relist' : 'Unlist'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setDeleteTarget(r._id)} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2 mt-4 items-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? 'default' : 'outline'}
                  onClick={() => fetchReqs(p)}
                  className="rounded-lg font-bold"
                >
                  {p}
                </Button>
              ))}
            </div>
          )}

          <p className="text-muted-foreground text-sm mt-3">Showing {filtered.length} of {total} requirements</p>
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the buyer requirement. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
