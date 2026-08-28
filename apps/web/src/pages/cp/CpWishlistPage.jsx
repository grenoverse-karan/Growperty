import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Heart } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';
import { getWishlist, toggleWishlist } from '@/lib/wishlist.js';

const C = {
  surface: '#ffffff',
  border:  '#e5e7eb',
  text:    '#111827',
  muted:   '#9ca3af',
  sub:     '#6b7280',
  greenDark: '#059669',
};

const STATUS_META = {
  pending:  { bg: '#fef3c7', color: '#d97706', label: 'Pending'  },
  approved: { bg: '#d1fae5', color: '#059669', label: 'Live'     },
  rejected: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
  sold:     { bg: '#dbeafe', color: '#2563eb', label: 'Sold'     },
};

const fmt = (price) => {
  if (!price) return '—';
  const n = Number(price);
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export default function CpWishlistPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    const ids = getWishlist();
    if (!ids.length) {
      setProperties([]);
      setLoading(false);
      return;
    }
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await apiServerClient.fetch(`/properties/${id}`);
          if (!res.ok) return null;
          return await res.json();
        } catch { return null; }
      })
    );
    setProperties(results.filter(Boolean));
    setLoading(false);
  }, []);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const handleRemove = (propertyId) => {
    toggleWishlist(propertyId);
    setProperties(prev => prev.filter(p => (p._id || p.id) !== propertyId));
  };

  return (
    <>
      <Helmet><title>Wish List — CP Dashboard</title></Helmet>

      <style>{`
        .cpwl-row {
          display: grid;
          grid-template-columns: 56px 2fr 110px 110px 130px;
          align-items: center;
        }
        .cpwl-row-top, .cpwl-pricestatus { display: contents; }
        @media (max-width: 700px) {
          .cpwl-header { display: none; }
          .cpwl-row { display: flex; flex-direction: column; align-items: stretch; gap: 10px; }
          .cpwl-row-top { display: flex; align-items: center; gap: 12px; width: 100%; }
          .cpwl-title { flex: 1; min-width: 0; }
          .cpwl-pricestatus { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
          .cpwl-actions { width: 100%; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>Wish List</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>Properties you've saved for later</p>
        </div>
      </div>

      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="cpwl-row cpwl-header" style={{
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
        ) : properties.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🤍</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No saved properties yet</div>
            <div style={{ fontSize: 13, color: C.muted }}>Tap the heart icon on any property to save it here.</div>
          </div>
        ) : (
          properties.map((p, i) => {
            const propId = p._id || p.id;
            const st = STATUS_META[p.status] || STATUS_META.approved;
            const areaPrefix = !p.bhk && p.totalArea && p.areaUnit ? `${p.totalArea} ${p.areaUnit} ` : '';
            const propTitle = p.bhk ? `${p.bhk} ${p.propertyType}` : `${areaPrefix}${p.propertyType}`;
            const thumb = Array.isArray(p.images) ? p.images[0] : null;
            return (
              <div
                key={propId}
                className="cpwl-row"
                style={{
                  padding: '14px 20px',
                  borderBottom: i < properties.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div className="cpwl-row-top">
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
                  <div className="cpwl-title">
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{propTitle}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                      {[p.sector, p.city].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  <div className="cpwl-pricestatus">
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
                <div className="cpwl-actions" style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={`/property/${propId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'transparent', border: `1px solid ${C.border}`,
                      color: C.sub, borderRadius: 6, padding: '5px 12px',
                      fontSize: 12, cursor: 'pointer', fontWeight: 500,
                      textDecoration: 'none', display: 'inline-block',
                    }}
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleRemove(propId)}
                    style={{
                      background: 'transparent', border: `1px solid ${C.border}`,
                      color: C.sub, borderRadius: 6, padding: '5px 10px',
                      fontSize: 12, cursor: 'pointer', fontWeight: 500,
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Heart size={13} className="fill-red-500 text-red-500" />
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
