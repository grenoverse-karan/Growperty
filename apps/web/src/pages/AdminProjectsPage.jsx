import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import {
  MapPin, Phone, Calendar, Trash2, RefreshCw, Loader2, Search,
  Image as ImageIcon, Building2, MessageCircle, Eye, EyeOff, Star, CheckCircle, XCircle, ExternalLink, Pencil,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { formatIndianPrice } from '@/hooks/useProperties.js';
import { SITE_URL } from '@/lib/siteUrl.js';

// ── Colour palette (matches AdminDashboard / AdminPropertiesPage) ──
const C = {
  bg:      '#0d1117',
  card:    '#0d1b2a',
  border:  '#1e2d3d',
  text:    '#e6edf3',
  muted:   '#4d6175',
  sub:     '#94aabf',
  hover:   '#132236',
  green:   '#1d9e75',
  blue:    '#185fa5',
  red:     '#a32d2d',
  yellow:  '#ba7517',
};

const STATUS_TABS = [
  { key: 'all',      label: 'All',      color: C.blue },
  { key: 'pending',  label: 'Pending',  color: C.yellow },
  { key: 'approved', label: 'Live',     color: C.green },
  { key: 'unlisted', label: 'Unlisted', color: C.muted },
  { key: 'rejected', label: 'Rejected', color: C.red },
];

const STATUS_META = {
  pending:  { label: 'Pending',  bg: 'rgba(186,117,23,0.15)',  color: '#e6963a' },
  approved: { label: 'Live',     bg: 'rgba(29,158,117,0.15)', color: '#1d9e75' },
  unlisted: { label: 'Unlisted', bg: 'rgba(77,97,117,0.15)',  color: '#94aabf' },
  rejected: { label: 'Rejected', bg: 'rgba(163,45,45,0.15)',  color: '#e06c6c' },
};

// 'call'/'whatsapp' are plain links, 'view' opens the full-detail modal,
// 'viewLive' opens the real public page, 'boost' toggles the `featured`
// flag — none of these go through the status-update PUT the way
// approve/reject/unlist/relist/delete do.
const ACTIONS = {
  pending:  ['call', 'whatsapp', 'view', 'edit', 'viewLive', 'boost', 'approve', 'reject', 'delete'],
  approved: ['call', 'whatsapp', 'view', 'edit', 'viewLive', 'boost', 'unlist', 'reject', 'delete'],
  unlisted: ['call', 'whatsapp', 'view', 'edit', 'viewLive', 'boost', 'relist', 'reject', 'delete'],
  rejected: ['call', 'whatsapp', 'view', 'edit', 'viewLive', 'boost', 'approve', 'delete'],
};

const ACTION_META = {
  call:     { type: 'link',   label: 'Call',      icon: Phone,        bg: C.hover,  color: '#4a9fd5', border: C.border },
  whatsapp: { type: 'link',   label: 'WhatsApp',  icon: MessageCircle,bg: C.hover,  color: '#25D366', border: C.border },
  view:     { type: 'view',   label: 'View',      icon: Eye,          bg: C.hover,  color: C.sub,     border: C.border },
  edit:     { type: 'edit',   label: 'Edit',      icon: Pencil,       bg: C.hover,  color: '#e6b93d', border: C.border },
  viewLive: { type: 'viewLive', label: 'View in Website', icon: ExternalLink, bg: C.hover, color: '#4a9fd5', border: C.border },
  boost:    { type: 'boost',  label: 'Boost',     icon: Star,         bg: C.hover,  color: '#e6b93d', border: C.border },
  approve:  { type: 'status', label: 'Approve',   icon: CheckCircle,  bg: C.green,  color: '#fff' },
  relist:   { type: 'status', label: 'Relist',    icon: CheckCircle,  bg: C.green,  color: '#fff' },
  unlist:   { type: 'status', label: 'Unlist',    icon: EyeOff,       bg: C.muted,  color: '#fff' },
  reject:   { type: 'status', label: 'Reject',    icon: XCircle,      bg: C.red,    color: '#fff' },
  delete:   { type: 'delete', label: 'Delete',    icon: Trash2,       bg: '#1a0a0a',color: '#e06c6c', border: 'rgba(163,45,45,0.4)' },
};

const STATUS_UPDATE = {
  approve: 'approved',
  relist:  'approved',
  unlist:  'unlisted',
  reject:  'rejected',
};

const waLink = (phone) => {
  const digits = (phone || '').replace(/\D/g, '');
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountryCode}`;
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// Scans the nested per-type/per-BHK pricing blob for the overall min/max
// price across every configuration, for a quick card-level summary.
const priceRangeOf = (propertyTypePricing) => {
  let min = null;
  let max = null;
  for (const byBhk of Object.values(propertyTypePricing || {})) {
    for (const p of Object.values(byBhk || {})) {
      const candidates = p.priceMode === 'fixed' ? [Number(p.price)] : [Number(p.minPrice), Number(p.maxPrice)];
      for (const n of candidates) {
        if (!n) continue;
        if (min === null || n < min) min = n;
        if (max === null || n > max) max = n;
      }
    }
  }
  return min && max ? { min, max } : null;
};

// Flattens the nested per-type/per-BHK pricing blob into rows for the full
// detail view — one row per (property type, BHK) pricing block.
const flattenPricing = (propertyTypePricing) => {
  const rows = [];
  for (const [type, byBhk] of Object.entries(propertyTypePricing || {})) {
    for (const [bhkKey, p] of Object.entries(byBhk || {})) {
      const priceLabel = p.priceMode === 'fixed'
        ? (p.price ? formatIndianPrice(Number(p.price)) : '—')
        : (p.minPrice && p.maxPrice ? `${formatIndianPrice(Number(p.minPrice))} – ${formatIndianPrice(Number(p.maxPrice))}` : '—');
      const areaLabel = p.priceMode === 'fixed'
        ? (p.area ? `${p.area} ${p.areaUnit || ''}` : '—')
        : (p.minArea && p.maxArea ? `${p.minArea} – ${p.maxArea} ${p.areaUnit || ''}` : '—');
      const ppsf = p.pricePerUnit && (p.pricePerUnit.value || (p.pricePerUnit.min && p.pricePerUnit.max))
        ? (p.pricePerUnit.value
            ? `₹${p.pricePerUnit.value.toLocaleString('en-IN')}`
            : `₹${p.pricePerUnit.min.toLocaleString('en-IN')} – ₹${p.pricePerUnit.max.toLocaleString('en-IN')}`)
        : null;
      // Skip entirely-blank blocks — e.g. a leftover 'default' entry from
      // before the form was split into per-BHK pricing.
      const isBlank = priceLabel === '—' && areaLabel === '—' && !ppsf && !p.units && !p.towers && !p.floors;
      if (isBlank) continue;
      rows.push({
        label: bhkKey === 'default' ? type : `${type} · ${bhkKey}`,
        priceLabel, areaLabel, ppsf,
        units: p.units, towers: p.towers, floors: p.floors,
      });
    }
  }
  return rows;
};

const PUBLIC_SITE_URL = import.meta.env.DEV ? 'http://localhost:3000' : SITE_URL;

function groupByDate(items) {
  const map = {};
  for (const p of items) {
    const key = p.createdAt
      ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'No Date';
    if (!map[key]) map[key] = { label: key, ts: p.createdAt ? new Date(p.createdAt).setHours(0,0,0,0) : 0, items: [] };
    map[key].items.push(p);
  }
  return Object.values(map).sort((a, b) => b.ts - a.ts);
}

// ── Project Card ─────────────────────────────────────────────────
const ProjectCard = ({ project, onAction, actionLoading }) => {
  const id = project._id || project.id;
  const status = project.status || 'pending';
  const meta = STATUS_META[status] || STATUS_META.pending;
  const actions = ACTIONS[status] || [];
  const [detailOpen, setDetailOpen] = useState(false);
  const range = priceRangeOf(project.propertyTypePricing);
  const pricingRows = flattenPricing(project.propertyTypePricing);

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${meta.color}`,
      borderRadius: 12, overflow: 'hidden', marginBottom: 12,
    }}>
      {/* Header row */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Thumbnail */}
        <div style={{
          width: 72, height: 72, borderRadius: 8, flexShrink: 0,
          background: '#132236', border: `1px solid ${C.border}`,
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {project.projectImages?.[0]
            ? <img src={project.projectImages[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <ImageIcon size={24} color={C.muted} />
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
              {project.projectName}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 10px',
              borderRadius: 20, background: meta.bg, color: meta.color,
            }}>{meta.label}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px',
              borderRadius: 20, background: 'rgba(24,95,165,0.2)', color: '#4a9fd5',
            }}>{project.projectType}</span>
            {project.featured && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3,
                borderRadius: 20, background: 'rgba(230,185,61,0.2)', color: '#e6b93d',
              }}><Star size={10} style={{ fill: '#e6b93d' }} /> Boosted</span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: 12, color: C.sub }}>
            {(project.sector || project.city) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {[project.sector, project.city].filter(Boolean).join(', ')}
              </span>
            )}
            {project.builderName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Building2 size={12} /> {project.builderName}
              </span>
            )}
            {project.mobileNumber && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={12} /> {project.mobileNumber}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> {formatDate(project.createdAt)}
            </span>
          </div>

          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {range && (
              <span style={{ fontWeight: 700, fontSize: 16, color: C.green }}>
                {formatIndianPrice(range.min)} – {formatIndianPrice(range.max)}
              </span>
            )}
            {project.propertyTypes?.length > 0 && (
              <span style={{ fontSize: 12, color: C.sub }}>
                {project.propertyTypes.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{
        padding: '10px 20px', borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        {actions.map(action => {
          const am = ACTION_META[action];
          const isLoading = actionLoading === `${id}-${action}`;
          const isBoosted = action === 'boost' && project.featured;
          const Icon = am.icon;
          const label = isBoosted ? 'Remove Boost' : am.label;
          const btnStyle = {
            padding: '6px 16px', borderRadius: 7,
            background: isBoosted ? 'rgba(230,185,61,0.15)' : am.bg,
            color: isBoosted ? '#e6b93d' : am.color,
            border: `1px solid ${isBoosted ? '#e6b93d' : (am.border || am.bg)}`,
            fontSize: 12, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
            opacity: actionLoading && !isLoading ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none',
          };

          if (am.type === 'link') {
            const href = action === 'call' ? `tel:${project.mobileNumber}` : waLink(project.mobileNumber);
            if (!project.mobileNumber) return null;
            return (
              <a key={action} href={href} target={action === 'whatsapp' ? '_blank' : undefined} rel="noopener noreferrer" style={btnStyle}>
                <Icon size={12} /> {am.label}
              </a>
            );
          }

          if (am.type === 'view') {
            return (
              <button key={action} onClick={() => setDetailOpen(true)} style={btnStyle}>
                <Icon size={12} /> {am.label}
              </button>
            );
          }

          if (am.type === 'viewLive') {
            return (
              <a key={action} href={`${PUBLIC_SITE_URL}/project/${id}`} target="_blank" rel="noopener noreferrer" style={btnStyle}>
                <Icon size={12} /> {am.label}
              </a>
            );
          }

          if (am.type === 'edit') {
            return (
              <Link key={action} to={`/admin/edit-project/${id}`} style={btnStyle}>
                <Icon size={12} /> {am.label}
              </Link>
            );
          }

          return (
            <button
              key={action}
              onClick={() => onAction(id, action)}
              disabled={!!actionLoading}
              style={btnStyle}
            >
              {isLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Icon size={12} style={isBoosted ? { fill: '#e6b93d' } : undefined} />}
              {label}
            </button>
          );
        })}
      </div>

      {/* Full detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{project.projectName}</DialogTitle>
            <DialogDescription>{project.builderName} · {project.projectType} · {[project.sector, project.city].filter(Boolean).join(', ')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            {project.projectImages?.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {project.projectImages.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-32 h-24 object-cover rounded-lg border shrink-0" />
                ))}
              </div>
            )}

            <div>
              <h4 className="font-bold text-foreground mb-2">Pricing & Configurations</h4>
              {pricingRows.length === 0 ? (
                <p className="text-muted-foreground">No pricing entered.</p>
              ) : (
                <div className="space-y-2">
                  {pricingRows.map((row, i) => (
                    <div key={i} className="border rounded-lg p-3 grid grid-cols-2 gap-2">
                      <div className="col-span-2 font-bold text-foreground">{row.label}</div>
                      <div>Price: <b>{row.priceLabel}</b></div>
                      <div>Area: <b>{row.areaLabel}</b></div>
                      {row.ppsf && <div>Rate: <b>{row.ppsf}/sq.ft</b></div>}
                      {(row.units || row.towers || row.floors) && (
                        <div className="col-span-2 text-muted-foreground">
                          {[row.units && `${row.units} units`, row.towers && `${row.towers} towers`, row.floors && `${row.floors} floors`].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>Project Status: <b className="text-foreground">{project.projectStatus || '—'}</b></div>
              <div>Launch Year: <b className="text-foreground">{project.launchYear || '—'}</b></div>
              <div>Possession: <b className="text-foreground">{project.expectedPossession || '—'}</b></div>
              <div>RERA: <b className="text-foreground">{project.reraNumber || '—'}</b></div>
              <div>Configurations: <b className="text-foreground">{project.configurationAvailable?.join(', ') || '—'}</b></div>
              <div>Address: <b className="text-foreground">{project.projectAddress || project.landmark || '—'}</b></div>
            </div>

            {project.paymentPlans?.length > 0 && (
              <div>
                <h4 className="font-bold text-foreground mb-2">Payment Plans</h4>
                <div className="flex flex-wrap gap-2">
                  {project.paymentPlans.map(p => <span key={p} className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium">{p}</span>)}
                </div>
              </div>
            )}

            {project.amenities?.length > 0 && (
              <div>
                <h4 className="font-bold text-foreground mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {project.amenities.map(a => <span key={a} className="px-2.5 py-1 bg-muted rounded-md text-xs font-medium">{a}</span>)}
                </div>
              </div>
            )}

            {(project.projectUSP || project.specialOffers) && (
              <div>
                <h4 className="font-bold text-foreground mb-2">USP / Offers</h4>
                {project.projectUSP && <p className="text-muted-foreground whitespace-pre-line">{project.projectUSP}</p>}
                {project.specialOffers && <p className="text-muted-foreground whitespace-pre-line mt-1">{project.specialOffers}</p>}
              </div>
            )}

            <div>
              <h4 className="font-bold text-foreground mb-2">Contact</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <div>Person: <b className="text-foreground">{project.contactPersonName || '—'}</b></div>
                <div>Designation: <b className="text-foreground">{project.designation || '—'}</b></div>
                <div>Mobile: <b className="text-foreground">{project.mobileNumber || '—'}</b></div>
                <div>Email: <b className="text-foreground">{project.email || '—'}</b></div>
              </div>
            </div>

            {(project.brochure || project.projectVideo || project.floorPlans?.length > 0) && (
              <div>
                <h4 className="font-bold text-foreground mb-2">Attachments</h4>
                <div className="flex flex-wrap gap-3">
                  {project.brochure && <a href={project.brochure} target="_blank" rel="noopener noreferrer" className="text-primary underline">Brochure</a>}
                  {project.projectVideo && <a href={project.projectVideo} target="_blank" rel="noopener noreferrer" className="text-primary underline">Video</a>}
                  {project.floorPlans?.map((fp, i) => (
                    <a key={i} href={fp} target="_blank" rel="noopener noreferrer" className="text-primary underline">Floor Plan {i + 1}</a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
const AdminProjectsPage = () => {
  const { token } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [projects, setProjects] = useState([]);
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiServerClient.fetch('/projects?limit=200', { headers: authHeaders });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const all = data.items || [];
      setProjects(all);
      const c = { all: all.length };
      STATUS_TABS.slice(1).forEach(t => {
        c[t.key] = all.filter(p => p.status === t.key).length;
      });
      setCounts(c);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAction = (id, action) => {
    if (action === 'reject') {
      setRejectReason('');
      setRejectDialog({ open: true, id });
      return;
    }
    doAction(id, action);
  };

  const handleRejectConfirm = async () => {
    const { id } = rejectDialog;
    setRejectDialog({ open: false, id: null });
    await doAction(id, 'reject', rejectReason.trim());
  };

  const doAction = async (id, action, reason = '') => {
    if (action === 'delete') {
      if (!window.confirm('Delete this project permanently?')) return;
      setActionLoading(`${id}-delete`);
      try {
        const res = await apiServerClient.fetch(`/projects/${id}`, {
          method: 'DELETE', headers: authHeaders,
        });
        if (!res.ok) throw new Error();
        toast.success('Project deleted');
        setProjects(prev => prev.filter(p => (p._id || p.id) !== id));
        setCounts(prev => {
          const proj = projects.find(p => (p._id || p.id) === id);
          return {
            ...prev,
            all: prev.all - 1,
            [proj?.status]: Math.max(0, (prev[proj?.status] || 1) - 1),
          };
        });
      } catch {
        toast.error('Failed to delete project');
      } finally {
        setActionLoading(null);
      }
      return;
    }

    if (action === 'boost') {
      const proj = projects.find(p => (p._id || p.id) === id);
      const nextFeatured = !proj?.featured;
      setActionLoading(`${id}-boost`);
      try {
        const res = await apiServerClient.fetch(`/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ featured: nextFeatured }),
        });
        if (!res.ok) throw new Error();
        toast.success(nextFeatured ? 'Project boosted' : 'Boost removed');
        setProjects(prev => prev.map(p => (p._id || p.id) === id ? { ...p, featured: nextFeatured } : p));
      } catch {
        toast.error('Failed to update boost status');
      } finally {
        setActionLoading(null);
      }
      return;
    }

    const newStatus = STATUS_UPDATE[action];
    setActionLoading(`${id}-${action}`);
    try {
      const res = await apiServerClient.fetch(`/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ status: newStatus, ...(action === 'reject' && reason ? { rejectReason: reason } : {}) }),
      });
      if (!res.ok) throw new Error();
      const TOAST_VERB = { approve: 'approved', relist: 'relisted', unlist: 'unlisted', reject: 'rejected' };
      toast.success(`Project ${TOAST_VERB[action] || newStatus}`);
      setProjects(prev => prev.map(p => (p._id || p.id) === id ? { ...p, status: newStatus } : p));
      setCounts(prev => {
        const proj = projects.find(p => (p._id || p.id) === id);
        return {
          ...prev,
          [proj?.status]: Math.max(0, (prev[proj?.status] || 1) - 1),
          [newStatus]: (prev[newStatus] || 0) + 1,
        };
      });
    } catch {
      toast.error(`Failed to ${action} project`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = projects.filter(p => {
    const matchStatus = activeTab === 'all' || p.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q || [p.projectName, p.builderName, p.city, p.sector, p.mobileNumber]
      .some(v => v?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <>
      <Helmet>
        <title>All Projects — Admin — Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: '32px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>All Projects</h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Manage submitted builder projects — approve, reject, delete</p>
          </div>
          <button
            onClick={fetchAll}
            disabled={isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8,
              background: C.hover, border: `1px solid ${C.border}`,
              color: C.sub, fontSize: 13, cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} style={isLoading ? { animation: 'spin 1s linear infinite' } : {}} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by project, builder, city, sector, phone…"
            style={{
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10,
              background: C.card, border: `1px solid ${C.border}`,
              color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {STATUS_TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const count = counts[tab.key] ?? 0;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '7px 16px', borderRadius: 8,
                  background: isActive ? `${tab.color}22` : C.card,
                  border: `1px solid ${isActive ? tab.color : C.border}`,
                  color: isActive ? tab.color : C.sub,
                  fontSize: 13, fontWeight: isActive ? 700 : 400, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {tab.label}
                <span style={{
                  fontSize: 11, fontWeight: 700, minWidth: 18, textAlign: 'center',
                  background: isActive ? tab.color : C.border,
                  color: isActive ? '#fff' : C.muted,
                  borderRadius: 20, padding: '0 6px',
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* List — grouped by submission date */}
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <Loader2 size={32} color={C.muted} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏗</div>
            <p style={{ color: C.sub, fontSize: 15 }}>No projects found</p>
          </div>
        ) : (
          groupByDate(filtered).map(group => (
            <div key={group.label} style={{ marginBottom: 28 }}>
              {/* Date separator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, background: 'rgba(24,95,165,0.15)', padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                  📅 {group.label}
                </span>
                <span style={{ fontSize: 12, color: C.muted }}>{group.items.length} project{group.items.length !== 1 ? 's' : ''}</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
              {group.items.map(p => (
                <ProjectCard
                  key={p._id || p.id}
                  project={p}
                  onAction={handleAction}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Reject reason dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(o) => !o && setRejectDialog({ open: false, id: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Project</DialogTitle>
            <DialogDescription>Give a reason for your own record — it's stored on the project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rejectReason">Reason for rejection</Label>
            <Textarea
              id="rejectReason"
              placeholder="e.g. Incomplete details, missing RERA number, incorrect pricing..."
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="resize-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, id: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminProjectsPage;
