import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, CalendarCheck, Share2, Phone, MoreVertical, Pencil, EyeOff, RotateCcw, Trash2 } from 'lucide-react';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';
import { isWishlisted, toggleWishlist } from '@/lib/wishlist.js';
import { trackProperty } from '@/lib/trackProperty.js';
import PropertyCard from '@/components/PropertyCard.jsx';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu.jsx';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle,
  AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog.jsx';

const C = {
  bg:      '#f5f6f8',
  surface: '#ffffff',
  border:  '#e5e7eb',
  text:    '#111827',
  muted:   '#9ca3af',
  sub:     '#6b7280',
  green:   '#10b981',
  greenDark: '#059669',
};

const STATUS_META = {
  pending:  { bg: '#fef3c7', color: '#d97706', label: 'Pending'  },
  approved: { bg: '#d1fae5', color: '#059669', label: 'Live'     },
  rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  sold:     { bg: '#dbeafe', color: '#2563eb', label: 'Sold'     },
  unlisted: { bg: '#f3f4f6', color: '#6b7280', label: 'Unlisted' },
};

const fmt = (price) => {
  if (!price) return '—';
  const n = Number(price);
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

function WishlistButton({ propertyId }) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(isWishlisted(propertyId));
  }, [propertyId]);

  return (
    <button
      type="button"
      onClick={() => {
        const now = toggleWishlist(propertyId);
        setWishlisted(now);
        toast.success(now ? 'Added to wishlist' : 'Removed from wishlist');
      }}
      aria-label="Toggle wishlist"
      style={{
        background: 'transparent', border: `1px solid ${C.border}`,
        borderRadius: 6, padding: '5px 8px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Heart size={14} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-500'} />
    </button>
  );
}

// Engagement row shown on each of the CP's own listing cards.
// "Contacts" = Call taps + WhatsApp taps combined; hover shows the split.
function StatsFooter({ stats = {} }) {
  const calls = Number(stats.calls || 0);
  const whatsapps = Number(stats.whatsapps || 0);
  const items = [
    { Icon: Eye,           label: 'Views',    value: stats.views,     span: 2 },
    { Icon: CalendarCheck, label: 'Visits',   value: stats.visits,    span: 2 },
    { Icon: Share2,        label: 'Shares',   value: stats.shares,    span: 2 },
    { Icon: Heart,         label: 'Saved',    value: stats.wishlists, span: 3, color: '#ef4444' },
    { Icon: Phone,         label: 'Contacts', value: calls + whatsapps, span: 3, color: '#16a34a', title: `${calls} call${calls === 1 ? '' : 's'} · ${whatsapps} WhatsApp` },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', rowGap: 10, width: '100%', borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
      {items.map(({ Icon, label, value, span, color, title }) => (
        <div key={label} title={title || label} style={{ textAlign: 'center', gridColumn: `span ${span}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: C.text }}>
            <Icon size={12} color={color || C.sub} /> {Number(value || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// Three-dot actions on a CP listing card. The card is wrapped in a <Link>, so
// every click here is stopped from bubbling up and navigating to the property.
const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

function ListingMenu({ property, onEdit, onUnlist, onRelist, onDelete }) {
  const canUnlist = property.status === 'approved';
  const isUnlisted = property.status === 'unlisted';
  const cpUnlisted = property.unlistedBy === 'cp';
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={stop}
          aria-label="Listing actions"
          className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-slate-700" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={stop} className="min-w-[170px]">
        <DropdownMenuItem onSelect={() => onEdit(property)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
        {canUnlist && (
          <DropdownMenuItem onSelect={() => onUnlist(property)}><EyeOff className="h-4 w-4 mr-2" /> Unlist</DropdownMenuItem>
        )}
        {isUnlisted && (
          <DropdownMenuItem disabled={!cpUnlisted} onSelect={() => onRelist(property)}>
            <RotateCcw className="h-4 w-4 mr-2" /> {cpUnlisted ? 'Relist' : 'Unlisted by Growperty'}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onDelete(property)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// A shareable-link bar: the URL, Copy, Share (native share sheet, else WhatsApp) and Open.
function LinkBar({ icon, title, desc, url, shareTitle, shareText, openable = true }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, text: shareText, url }); } catch { /* user cancelled */ }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}: ${url}`)}`, '_blank');
    }
  };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 190, flex: '0 1 230px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{icon} {title}</div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ flex: '1 1 260px', minWidth: 0, background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 12, color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={url}>
        {url}
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button type="button" onClick={copy} style={{
          background: copied ? '#d1fae5' : C.surface, border: `1px solid ${copied ? '#10b981' : C.border}`,
          color: copied ? C.greenDark : C.sub, borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minWidth: 78,
        }}>{copied ? '✓ Copied' : 'Copy'}</button>
        <button type="button" onClick={share} style={{
          background: C.greenDark, border: 'none', color: '#fff', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Share</button>
        {openable && (
          <a href={url} target="_blank" rel="noreferrer" style={{
            background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}>Open ↗</a>
        )}
      </div>
    </div>
  );
}

// source="mine"      -> the CP's own listings (default, /cp/dashboard/listings)
// source="growperty" -> Growperty-owned listings the CP can share (/cp/dashboard/growperty-listings)
export default function CpMyListingsPage({ source = 'mine' }) {
  const { token } = useCpAuth();
  const navigate  = useNavigate();
  const isMine    = source === 'mine';

  const [current, setCurrent] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [shareModal, setShareModal] = useState(null);
  const [copied,     setCopied]     = useState('');
  const shareToken = localStorage.getItem('cpRef') || '';

  const endpoint = isMine ? '/cp/properties' : '/cp/growperty-listings';

  const fetchPage = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res  = await apiServerClient.fetch(`${endpoint}?page=${pg}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setCurrent({ items: data.items, total: data.total, page: pg, totalPages: data.totalPages });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [token, endpoint]);

  useEffect(() => {
    setCurrent({ items: [], total: 0, page: 1, totalPages: 1 });
    fetchPage(1);
  }, [fetchPage]);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const changeStatus = async (property, action) => {
    const id = property.id || property._id;
    try {
      const res  = await apiServerClient.fetch(`/cp/properties/${id}/status`, { method: 'PATCH', headers: authHeaders, body: JSON.stringify({ action }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update listing');
      setCurrent(prev => ({ ...prev, items: prev.items.map(p => (p.id || p._id) === id ? { ...p, status: data.status, unlistedBy: action === 'unlist' ? 'cp' : '' } : p) }));
      toast.success(action === 'unlist' ? 'Listing unlisted — it is hidden from buyers' : 'Listing is live again');
    } catch (err) { toast.error(err.message); }
  };

  const confirmDelete = async () => {
    const id = deleteTarget.id || deleteTarget._id;
    setDeleting(true);
    try {
      const res  = await apiServerClient.fetch(`/cp/properties/${id}`, { method: 'DELETE', headers: authHeaders });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete listing');
      setCurrent(prev => ({ ...prev, items: prev.items.filter(p => (p.id || p._id) !== id), total: Math.max(0, prev.total - 1) }));
      toast.success('Listing deleted');
      setDeleteTarget(null);
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(false); }
  };

  // "My store" link: a public page with only the listings this CP added (no Growperty listings).
  const storeUrl = shareToken ? `${window.location.origin}/cp/${shareToken}/listings?own=1` : '';

  // Sitewide referral link (buyers who click it are credited to this CP for 7 days).
  // /cp/me creates it on first use, so it's fetched rather than read from login data.
  const [refUrl, setRefUrl] = useState('');
  useEffect(() => {
    if (isMine || !token) return;
    apiServerClient.fetch('/cp/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data?.cp?.refLink) setRefUrl(`https://${data.cp.refLink}`); })
      .catch(() => {});
  }, [isMine, token]);

  const getShareLink = (propertyId, src) => {
    const base = `${window.location.origin}/property/${propertyId}?ref=${shareToken}`;
    return src ? `${base}&src=${src}` : base;
  };

  const handleCopy = (propertyId, src) => {
    navigator.clipboard.writeText(getShareLink(propertyId, src)).then(() => {
      trackProperty(propertyId, 'share');
      setCopied(src);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <>
      <Helmet><title>{isMine ? 'My Listings' : 'Growperty Listings'} — CP Dashboard</title></Helmet>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>{isMine ? 'My Listings' : 'Growperty Listings'}</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>
            {isMine
              ? `Properties you've listed yourself${current.total ? ` · ${current.total} total` : ''}`
              : `Verified Growperty listings you can share with your clients${current.total ? ` · ${current.total} available` : ''}`}
          </p>
        </div>
        {isMine && (
          <button
            onClick={() => navigate('/cp/dashboard/add')}
            style={{
              background: C.greenDark, color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            + Add Property
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <style>{`
        .cpml-row {
          display: grid;
          grid-template-columns: 56px 2fr 110px 110px 215px;
          align-items: center;
        }
        .cpml-row-top, .cpml-pricestatus { display: contents; }
        @media (max-width: 700px) {
          .cpml-header { display: none; }
          .cpml-row {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .cpml-row-top {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
          }
          .cpml-title { flex: 1; min-width: 0; }
          .cpml-pricestatus {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
            flex-shrink: 0;
          }
          .cpml-actions { width: 100%; }
        }
      `}</style>
      {isMine && storeUrl && (
        <LinkBar
          icon="🔗" title="Your store link" url={storeUrl}
          desc="Opens a page with only the listings you added — your live ones, no Growperty listings."
          shareTitle="My property listings on Growperty" shareText="Check out my property listings on Growperty"
        />
      )}
      {!isMine && refUrl && (
        <LinkBar
          icon="🎯" title="Get your referral link" url={refUrl} openable={false}
          desc="Share it with buyers — anyone who clicks it is credited to you for 7 days, site-wide, including these Growperty listings."
          shareTitle="Properties on Growperty" shareText="Check out Growperty properties"
        />
      )}

      {isMine ? (
        loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: C.muted, fontSize: 14 }}>Loading...</div>
        ) : current.items.length === 0 ? (
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏘</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No listings yet</div>
            <span onClick={() => navigate('/cp/dashboard/add')} style={{ color: C.greenDark, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              Add your first property →
            </span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
            {current.items.map(p => {
              const st = STATUS_META[p.status] || STATUS_META.approved;
              const title = p.bhk ? `${p.bhk} ${p.propertyType}` : p.propertyType;
              return (
                <PropertyCard
                  key={p.id || p._id}
                  property={p}
                  compact
                  statusBadge={(
                    <span style={{ background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{st.label}</span>
                  )}
                  footer={<StatsFooter stats={p.stats} />}
                  menu={(
                    <ListingMenu
                      property={p}
                      onEdit={(x) => navigate(`/cp/dashboard/edit/${x.id || x._id}`)}
                      onUnlist={(x) => changeStatus(x, 'unlist')}
                      onRelist={(x) => changeStatus(x, 'relist')}
                      onDelete={setDeleteTarget}
                    />
                  )}
                  onShare={shareToken ? () => setShareModal({ propertyId: p.id || p._id, title }) : null}
                />
              );
            })}
          </div>
        )
      ) : (
        <>
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="cpml-row cpml-header" style={{
          padding: '11px 20px',
          borderBottom: `1px solid ${C.border}`,
          background: '#f9fafb',
          color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <div></div>
          <div>Property</div>
          <div>Price</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: C.muted, fontSize: 14 }}>Loading...</div>
        ) : current.items.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏘</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>
              {isMine ? 'No listings yet' : 'No Growperty listings available'}
            </div>
            {isMine && (
              <span
                onClick={() => navigate('/cp/dashboard/add')}
                style={{ color: C.greenDark, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >
                Add your first property →
              </span>
            )}
          </div>
        ) : (
          current.items.map((p, i) => {
            const st = STATUS_META[p.status] || STATUS_META.approved;
            const propId = p._id || p.id;
            const areaPrefix = !p.bhk && p.totalArea && p.areaUnit ? `${p.totalArea} ${p.areaUnit} ` : '';
            const propTitle = p.bhk ? `${p.bhk} ${p.propertyType}` : `${areaPrefix}${p.propertyType}`;
            const thumb = Array.isArray(p.images) ? p.images[0] : null;
            return (
              <div
                key={propId}
                className="cpml-row"
                style={{
                  padding: '14px 20px',
                  borderBottom: i < current.items.length - 1 ? `1px solid ${C.border}` : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <div className="cpml-row-top">
                  <div>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={propTitle}
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: `1px solid ${C.border}`, flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 44, height: 44, borderRadius: 8, background: '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                      }}>🏠</div>
                    )}
                  </div>
                  <div className="cpml-title">
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{propTitle}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                      {[p.sector, p.city].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <div className="cpml-pricestatus">
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{fmt(p.totalPrice)}</div>
                    <div>
                      <span style={{
                        background: st.bg, color: st.color,
                        fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                      }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="cpml-actions" style={{ display: 'flex', gap: 8 }}>
                  <WishlistButton propertyId={propId} />
                  <a
                    href={`/property/${propId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'transparent', border: `1px solid ${C.border}`,
                      color: C.sub, borderRadius: 6, padding: '5px 12px',
                      fontSize: 12, cursor: 'pointer', fontWeight: 500,
                      textDecoration: 'none', display: 'inline-block',
                      transition: 'border-color 0.1s, color 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}
                  >
                    View
                  </a>
                  {shareToken && (
                    <button
                      onClick={() => setShareModal({ propertyId: propId, title: propTitle })}
                      style={{
                        background: 'transparent', border: `1px solid ${C.border}`,
                        color: C.sub, borderRadius: 6, padding: '5px 12px',
                        fontSize: 12, cursor: 'pointer', fontWeight: 500,
                        transition: 'border-color 0.1s, color 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.greenDark; e.currentTarget.style.color = C.greenDark; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}
                    >
                      Share
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

        </>
      )}

      {/* ── Pagination ── */}
      {current.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => fetchPage(current.page - 1)}
            disabled={current.page <= 1}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}
          >
            ← Prev
          </button>
          <span style={{ color: C.sub, padding: '7px 14px', fontSize: 13 }}>
            {current.page} / {current.totalPages}
          </span>
          <button
            onClick={() => fetchPage(current.page + 1)}
            disabled={current.page >= current.totalPages}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open && !deleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `${deleteTarget.bhk ? deleteTarget.bhk + ' ' : ''}${deleteTarget.propertyType} in ${[deleteTarget.sector, deleteTarget.city].filter(Boolean).join(', ')}` : ''}
              {' '}will be permanently removed. This can't be undone. If you only want to hide it from buyers, use Unlist instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Share Modal ── */}
      {shareModal && (
        <div
          onClick={() => setShareModal(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
              padding: 28, width: '100%', maxWidth: 460, color: C.text,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>Share Listing</h3>
              <button
                onClick={() => setShareModal(null)}
                style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 2 }}
              >×</button>
            </div>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>{shareModal.title}</p>

            {/* WhatsApp link */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>
                WhatsApp Link
              </div>
              <div style={{
                background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '8px 12px', fontSize: 11, wordBreak: 'break-all', color: C.sub, marginBottom: 8,
              }}>
                {getShareLink(shareModal.propertyId, 'whatsapp')}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleCopy(shareModal.propertyId, 'whatsapp')}
                  style={{
                    flex: 1,
                    background: copied === 'whatsapp' ? '#d1fae5' : C.surface,
                    border: `1px solid ${copied === 'whatsapp' ? '#10b981' : C.border}`,
                    color: copied === 'whatsapp' ? '#059669' : C.sub,
                    borderRadius: 7, padding: '8px 0', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {copied === 'whatsapp' ? '✓ Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => {
                    const link = getShareLink(shareModal.propertyId, 'whatsapp');
                    trackProperty(shareModal.propertyId, 'share');
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this property: ${link}`)}`, '_blank');
                  }}
                  style={{
                    flex: 2, background: '#dcfce7', border: '1px solid #86efac',
                    color: '#16a34a', borderRadius: 7,
                    padding: '8px 0', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  }}
                >
                  Share on WhatsApp ↗
                </button>
              </div>
            </div>

            {/* Ad link */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>
                Ad Link
                <span style={{ fontSize: 10, color: C.muted, fontWeight: 400, textTransform: 'none', marginLeft: 6 }}>Facebook / Instagram / Google</span>
              </div>
              <div style={{
                background: '#f9fafb', border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '8px 12px', fontSize: 11, wordBreak: 'break-all', color: C.sub, marginBottom: 8,
              }}>
                {getShareLink(shareModal.propertyId, 'ad')}
              </div>
              <button
                onClick={() => handleCopy(shareModal.propertyId, 'ad')}
                style={{
                  width: '100%',
                  background: copied === 'ad' ? '#dbeafe' : C.surface,
                  border: `1px solid ${copied === 'ad' ? '#3b82f6' : C.border}`,
                  color: copied === 'ad' ? '#2563eb' : C.sub,
                  borderRadius: 7, padding: '8px 0', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                }}
              >
                {copied === 'ad' ? '✓ Copied!' : 'Copy Ad Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
