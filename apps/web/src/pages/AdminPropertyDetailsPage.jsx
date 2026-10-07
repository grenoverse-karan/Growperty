import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Building2, MapPin, User, Calendar, AlertCircle, Pencil, ExternalLink } from 'lucide-react';
import apiServerClient, { API_SERVER_URL } from '@/lib/apiServerClient';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';

const STATUS_STYLES = {
  approved:  { label: 'Live',     cls: 'bg-emerald-600 text-white' },
  pending:   { label: 'Pending',  cls: 'bg-amber-500 text-amber-950' },
  rejected:  { label: 'Rejected', cls: 'bg-red-600 text-white' },
  suspended: { label: 'Suspended', cls: 'bg-red-600 text-white' },
  unlisted:  { label: 'Unlisted', cls: 'bg-slate-500 text-white' },
  sold:      { label: 'Sold',     cls: 'bg-indigo-600 text-white' },
};

const getListedBy = (p) => {
  if (p.listedBy === 'admin' || p.ownerType === 'Admin') return 'Admin';
  if (p.listedBy === 'cp' || p.ownerType === 'CP') return 'CP';
  if (/builder/i.test(p.ownerType || '')) return 'Builder';
  return 'Seller';
};

const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '—';
const fmtPrice = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

const Field = ({ label, value }) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) return null;
  return (
    <div>
      <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
      <p className="font-bold text-base break-words">{Array.isArray(value) ? value.join(', ') : String(value)}</p>
    </div>
  );
};

const AdminPropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAdminAuth();

  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cp, setCp] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        // thumbOnly keeps the response light — images are loaded one by one from /images/:index below.
        const res = await apiServerClient.fetch(`/properties/${id}?thumbOnly=true`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(res.status === 404 ? 'Property not found. It may have been deleted.' : 'Failed to load property details.');
        const data = await res.json();
        if (!cancelled) setProperty(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load property details.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, token]);

  // Listings store the CP's database id; the CP ID people know (GP…) is its shareToken.
  const cpDbId = property?.cpId;
  useEffect(() => {
    if (!cpDbId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServerClient.fetch(`/admin/channel-partners/${cpDbId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCp(data.cp);
      } catch { /* the DB id below is still shown as a fallback */ }
    })();
    return () => { cancelled = true; };
  }, [cpDbId, token]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate('/admin/properties')} className="rounded-xl font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings
        </Button>
      </div>
    );
  }

  const p = property;
  const status = p && (STATUS_STYLES[p.status] || { label: p.status, cls: 'bg-slate-500 text-white' });
  const title = p ? [p.propertyType, p.bhk || (p.rooms > 0 ? `${p.rooms} Room${p.rooms > 1 ? 's' : ''}` : '')].filter(Boolean).join(' · ') : '';
  const imageCount = p?.imageCount || 0;

  return (
    <>
      <Helmet>
        <title>{p ? `${title} - Admin` : 'Property Details'} - Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="ghost" onClick={() => navigate('/admin/properties')} className="rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <ArrowLeft className="h-5 w-5 mr-2" /> Back
            </Button>
            <h1 className="text-2xl font-extrabold tracking-tight">Property Details</h1>
            {p && (
              <div className="ml-auto flex gap-2">
                <Button variant="outline" className="rounded-xl font-semibold" onClick={() => navigate(`/admin/edit-property/${id}`)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button asChild variant="outline" className="rounded-xl font-semibold">
                  <a href={`/property/${id}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 mr-2" /> View on website</a>
                </Button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-48 rounded-2xl col-span-2" />
                <Skeleton className="h-48 rounded-2xl" />
              </div>
            </div>
          ) : p && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-3xl shadow-sm border-border/50 overflow-hidden">
                  {imageCount > 0 ? (
                    <div className="grid grid-cols-2 gap-1 bg-slate-200 dark:bg-slate-800">
                      {Array.from({ length: imageCount }, (_, i) => (
                        <img
                          key={i}
                          src={`${API_SERVER_URL}/properties/${id}/images/${i}`}
                          alt={`${title} - photo ${i + 1}`}
                          loading={i < 2 ? 'eager' : 'lazy'}
                          className={`w-full object-cover ${i === 0 ? 'col-span-2 h-72' : 'h-40'}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={status.cls}>{status.label}</Badge>
                      <Badge variant="outline">Listed by {getListedBy(p)}</Badge>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{title || 'Property'}</h2>
                    <div className="flex items-center text-muted-foreground font-medium mb-5">
                      <MapPin className="h-4 w-4 mr-1.5 shrink-0" />
                      {[p.houseNo, p.towerBlock, p.sector, p.city].filter(Boolean).join(', ')}
                    </div>
                    <p className="text-3xl font-extrabold text-emerald-600">{fmtPrice(p.totalPrice)}</p>

                    <div className="mt-6">
                      <h3 className="text-lg font-bold mb-1">Description</h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {p.description || 'No description provided.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-sm border-border/50">
                  <CardHeader><CardTitle>Property Specifications</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      <Field label="Area" value={p.totalArea ? `${p.totalArea} ${p.areaUnit || ''}${p.areaType ? ` (${p.areaType})` : ''}` : ''} />
                      <Field label="Bedrooms" value={p.bhk} />
                      <Field label="Bathrooms" value={p.bathrooms || ''} />
                      <Field label="Balconies" value={p.balconies || ''} />
                      <Field label="Floor" value={p.floorNumber !== undefined && p.floorNumber !== null ? `${p.floorNumber}${p.totalFloors ? ` of ${p.totalFloors}` : ''}` : ''} />
                      <Field label="Facing" value={p.directionFacing} />
                      <Field label="Facing Type" value={p.facingType} />
                      <Field label="Possession" value={p.possessionStatus} />
                      <Field label="Ownership" value={p.ownershipType} />
                      <Field label="Sale Type" value={p.saleType} />
                      <Field label="Furnishing" value={p.furnishingType} />
                      <Field label="Car Parking" value={p.carParking || ''} />
                      <Field label="Bike Parking" value={p.bikeParking || ''} />
                      <Field label="Bank Loan" value={p.bankLoanAvailable} />
                      <Field label="Price Negotiable" value={p.priceNegotiable === undefined ? '' : (p.priceNegotiable ? 'Yes' : 'No')} />
                      <Field label="RERA Approved" value={p.reraApproved === undefined ? '' : (p.reraApproved ? 'Yes' : 'No')} />
                      <Field label="Landmark" value={p.landmark} />
                    </div>
                    {p.amenities?.length > 0 && (
                      <div className="mt-6">
                        <p className="text-sm text-muted-foreground font-medium mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-2">
                          {p.amenities.map((a) => <Badge key={a} variant="secondary">{a}</Badge>)}
                        </div>
                      </div>
                    )}
                    {p.offerTitle && (
                      <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
                        <p className="text-sm font-bold">{p.offerTitle}{p.offerDetails ? ` — ${p.offerDetails}` : ''}</p>
                        {p.offerValidTill && <p className="text-xs text-muted-foreground mt-1">Valid till {new Date(p.offerValidTill).toLocaleDateString('en-IN')}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="rounded-3xl shadow-sm border-border/50">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center"><User className="h-5 w-5 mr-2 text-primary" />Contact &amp; Owner</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <Field label="Name" value={p.name} />
                    <Field label="Mobile" value={p.mobileNumber} />
                    <Field label="Email" value={p.email} />
                    <Field label="Owner Type" value={p.ownerType} />
                    <Field label="Listed By" value={getListedBy(p)} />
                    <Field label="CP Name" value={cp?.name} />
                    <Field label="CP ID" value={cp?.shareToken || p.cpId} />
                    <Field label="Current Address" value={p.currentAddress} />
                    <Field label="WhatsApp Alerts" value={p.whatsappAlerts === undefined ? '' : (p.whatsappAlerts ? 'On' : 'Off')} />
                  </CardContent>
                </Card>

                <Card className="rounded-3xl shadow-sm border-border/50">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center"><Calendar className="h-5 w-5 mr-2 text-primary" />System Info</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Property ID</p>
                      <p className="font-mono text-sm font-bold bg-slate-100 dark:bg-slate-800 p-2 rounded-lg break-all">{p.id}</p>
                    </div>
                    <Field label="Created" value={fmtDateTime(p.createdAt)} />
                    <Field label="Last Updated" value={fmtDateTime(p.updatedAt)} />
                    {p.liveAt && <Field label="Went Live" value={fmtDateTime(p.liveAt)} />}
                    <Field label="Visit Slots" value={[...(p.visitFixedSlots || []), ...(p.visitFlexibleSlots || [])]} />
                  </CardContent>
                </Card>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPropertyDetailsPage;
