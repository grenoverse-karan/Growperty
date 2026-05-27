import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { MapPin, User, Phone, Calendar, Trash2, RefreshCw, Loader2, Search, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { formatIndianPrice } from '@/hooks/useProperties.js';

// ── Colour palette (matches AdminDashboard) ───────────────────────
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
  purple:  '#533ab7',
};

const STATUS_TABS = [
  { key: 'all',      label: 'All',      color: C.blue },
  { key: 'pending',  label: 'Pending',  color: C.yellow },
  { key: 'approved', label: 'Live',     color: C.green },
  { key: 'rejected', label: 'Rejected', color: C.red },
  { key: 'unlisted', label: 'Unlisted', color: C.muted },
  { key: 'sold',     label: 'Sold',     color: C.purple },
];

const STATUS_META = {
  pending:  { label: 'Pending',  bg: 'rgba(186,117,23,0.15)',  color: '#e6963a' },
  approved: { label: 'Live',     bg: 'rgba(29,158,117,0.15)', color: '#1d9e75' },
  rejected: { label: 'Rejected', bg: 'rgba(163,45,45,0.15)',  color: '#e06c6c' },
  unlisted: { label: 'Unlisted', bg: 'rgba(77,97,117,0.15)',  color: '#94aabf' },
  sold:     { label: 'Sold',     bg: 'rgba(83,58,183,0.15)',  color: '#a48aff' },
  suspended:{ label: 'Suspended',bg: 'rgba(163,45,45,0.15)',  color: '#e06c6c' },
};

const ACTIONS = {
  pending:  ['approve', 'reject', 'delete'],
  approved: ['unlist', 'sold', 'reject', 'delete'],
  rejected: ['approve', 'unlist', 'delete'],
  unlisted: ['approve', 'reject', 'delete'],
  sold:     ['approve', 'unlist', 'delete'],
  suspended:['approve', 'delete'],
};

const ACTION_META = {
  approve: { label: 'Approve',  bg: C.green,  color: '#fff' },
  reject:  { label: 'Reject',   bg: C.red,    color: '#fff' },
  unlist:  { label: 'Unlist',   bg: C.muted,  color: '#fff' },
  sold:    { label: 'Mark Sold',bg: C.purple, color: '#fff' },
  delete:  { label: 'Delete',   bg: '#1a0a0a',color: '#e06c6c', border: 'rgba(163,45,45,0.4)' },
};

const STATUS_UPDATE = {
  approve: 'approved',
  reject:  'rejected',
  unlist:  'unlisted',
  sold:    'sold',
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Property Card ─────────────────────────────────────────────────
const PropertyCard = ({ property, onAction, actionLoading }) => {
  const id = property._id || property.id;
  const status = property.status || 'pending';
  const meta = STATUS_META[status] || STATUS_META.pending;
  const actions = ACTIONS[status] || [];
  const [expanded, setExpanded] = useState(false);

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
          {property.images?.[0]
            ? <img src={property.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <ImageIcon size={24} color={C.muted} />
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
              {property.propertyType}{property.bhk ? ` · ${property.bhk}` : ''}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 10px',
              borderRadius: 20, background: meta.bg, color: meta.color,
            }}>{meta.label}</span>
            {property.listedBy === 'admin' && (
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px',
                borderRadius: 20, background: 'rgba(24,95,165,0.2)', color: '#4a9fd5',
              }}>Admin Listed</span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: 12, color: C.sub }}>
            {(property.sector || property.city) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {[property.sector, property.city].filter(Boolean).join(', ')}
              </span>
            )}
            {property.name && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={12} /> {property.name}
              </span>
            )}
            {property.mobileNumber && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={12} /> {property.mobileNumber}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> {formatDate(property.createdAt)}
            </span>
          </div>

          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {property.totalPrice && (
              <span style={{ fontWeight: 700, fontSize: 18, color: C.green }}>
                {formatIndianPrice(property.totalPrice)}
              </span>
            )}
            {property.totalArea && (
              <span style={{ fontSize: 12, color: C.sub }}>
                {property.totalArea} {property.areaUnit || 'Sq.ft'}
              </span>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 4 }}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: '0 20px 12px', borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
          {property.description && (
            <p style={{ fontSize: 13, color: C.sub, marginBottom: 8 }}>{property.description}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: C.sub }}>
            {property.furnishingType && <span>Furnishing: <b style={{ color: C.text }}>{property.furnishingType}</b></span>}
            {property.possessionStatus && <span>Possession: <b style={{ color: C.text }}>{property.possessionStatus}</b></span>}
            {property.ownerType && <span>Owner: <b style={{ color: C.text }}>{property.ownerType}</b></span>}
            {property.email && <span>Email: <b style={{ color: C.text }}>{property.email}</b></span>}
          </div>
          {property.images?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {property.images.slice(0, 6).map((img, i) => (
                <img key={i} src={img} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: `1px solid ${C.border}` }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{
        padding: '10px 20px', borderTop: `1px solid ${C.border}`,
        display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        {actions.map(action => {
          const am = ACTION_META[action];
          const isLoading = actionLoading === `${id}-${action}`;
          return (
            <button
              key={action}
              onClick={() => onAction(id, action)}
              disabled={!!actionLoading}
              style={{
                padding: '6px 16px', borderRadius: 7,
                background: am.bg, color: am.color,
                border: `1px solid ${am.border || am.bg}`,
                fontSize: 12, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading && !isLoading ? 0.5 : 1,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {isLoading && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
              {action === 'delete' && <Trash2 size={12} />}
              {am.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
const AdminPropertiesPage = () => {
  const { token } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [properties, setProperties] = useState([]);
  const [counts, setCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiServerClient.fetch('/properties?limit=200', { headers: authHeaders });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const all = data.items || [];
      setProperties(all);
      const c = { all: all.length };
      STATUS_TABS.slice(1).forEach(t => {
        c[t.key] = all.filter(p => p.status === t.key).length;
      });
      setCounts(c);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAction = async (id, action) => {
    if (action === 'delete') {
      if (!window.confirm('Delete this property permanently?')) return;
      setActionLoading(`${id}-delete`);
      try {
        const res = await apiServerClient.fetch(`/properties/${id}`, {
          method: 'DELETE', headers: authHeaders,
        });
        if (!res.ok) throw new Error();
        toast.success('Property deleted');
        setProperties(prev => prev.filter(p => (p._id || p.id) !== id));
        setCounts(prev => {
          const prop = properties.find(p => (p._id || p.id) === id);
          return {
            ...prev,
            all: prev.all - 1,
            [prop?.status]: (prev[prop?.status] || 1) - 1,
          };
        });
      } catch {
        toast.error('Failed to delete property');
      } finally {
        setActionLoading(null);
      }
      return;
    }

    const newStatus = STATUS_UPDATE[action];
    setActionLoading(`${id}-${action}`);
    try {
      const res = await apiServerClient.fetch(`/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Property ${ACTION_META[action].label.toLowerCase()}d`);
      setProperties(prev => prev.map(p => (p._id || p.id) === id ? { ...p, status: newStatus } : p));
      setCounts(prev => {
        const prop = properties.find(p => (p._id || p.id) === id);
        return {
          ...prev,
          [prop?.status]: Math.max(0, (prev[prop?.status] || 1) - 1),
          [newStatus]: (prev[newStatus] || 0) + 1,
        };
      });
    } catch {
      toast.error(`Failed to ${action} property`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = properties.filter(p => {
    const matchStatus = activeTab === 'all' || p.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q || [p.propertyType, p.bhk, p.city, p.sector, p.name, p.mobileNumber]
      .some(v => v?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <>
      <Helmet>
        <title>All Listings — Admin — Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: '32px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>All Listings</h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Manage every property — approve, reject, unlist, mark sold, delete</p>
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
            placeholder="Search by type, city, sector, name, phone…"
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

        {/* List */}
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <Loader2 size={32} color={C.muted} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏘</div>
            <p style={{ color: C.sub, fontSize: 15 }}>No properties found</p>
          </div>
        ) : (
          filtered.map(p => (
            <PropertyCard
              key={p._id || p.id}
              property={p}
              onAction={handleAction}
              actionLoading={actionLoading}
            />
          ))
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default AdminPropertiesPage;
