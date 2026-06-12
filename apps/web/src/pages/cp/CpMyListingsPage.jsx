import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const C = {
  bg:      '#0d1117',
  surface: '#0d1b2a',
  border:  '#1e2d3d',
  text:    '#e6edf3',
  muted:   '#4d6175',
  sub:     '#94aabf',
  green:   '#1d9e75',
  amber:   '#d97706',
  red:     '#c0392b',
};

const STATUS_COLOR = {
  pending:  { bg: '#78350f22', color: '#fbbf24', label: 'Pending' },
  approved: { bg: '#06422922', color: '#34d399', label: 'Live' },
  rejected: { bg: '#7f1d1d22', color: '#f87171', label: 'Rejected' },
  sold:     { bg: '#1e3a5f22', color: '#60a5fa', label: 'Sold' },
  unlisted: { bg: '#27272a22', color: '#9ca3af', label: 'Unlisted' },
};

const fmt = (price) => {
  if (!price) return '—';
  const n = Number(price);
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

export default function CpMyListingsPage() {
  const { token } = useCpAuth();
  const navigate  = useNavigate();

  const [tab, setTab] = useState('mine'); // 'mine' | 'growperty'

  // Per-tab state
  const [mine,      setMine]      = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [growperty, setGrowperty] = useState({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading,   setLoading]   = useState(true);

  const [shareToken, setShareToken] = useState('');
  const [shareModal, setShareModal] = useState(null); // null | { propertyId, title }
  const [copied,     setCopied]     = useState(''); // '' | 'whatsapp' | 'ad'

  // Fetch CP's own listings
  const fetchMine = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res  = await apiServerClient.fetch(`/cp/properties?page=${pg}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setMine({ items: data.items, total: data.total, page: pg, totalPages: data.totalPages });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [token]);

  // Fetch Growperty's approved listings
  const fetchGrowperty = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res  = await apiServerClient.fetch(`/cp/growperty-listings?page=${pg}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setGrowperty({ items: data.items, total: data.total, page: pg, totalPages: data.totalPages });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [token]);

  // Fetch share token from /cp/me
  useEffect(() => {
    if (!token) return;
    apiServerClient.fetch('/cp/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.cp?.shareToken) setShareToken(data.cp.shareToken); })
      .catch(() => {});
  }, [token]);

  // Load both tabs on mount
  useEffect(() => { fetchMine(1); },      [fetchMine]);
  useEffect(() => { fetchGrowperty(1); }, [fetchGrowperty]);

  const current = tab === 'mine' ? mine : growperty;
  const fetchPage = tab === 'mine' ? fetchMine : fetchGrowperty;

  const getShareLink = (propertyId, src) => {
    const base = `${window.location.origin}/property/${propertyId}?ref=${shareToken}`;
    return src ? `${base}&src=${src}` : base;
  };

  const handleCopy = (propertyId, src) => {
    navigator.clipboard.writeText(getShareLink(propertyId, src)).then(() => {
      setCopied(src);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <>
      <Helmet><title>Listings — CP Dashboard</title></Helmet>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Listings</h1>
        {tab === 'mine' && (
          <button
            onClick={() => navigate('/cp/dashboard/add')}
            style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            + Add Property
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `1px solid ${C.border}` }}>
        {[
          { key: 'mine',      label: 'My Listings',        count: mine.total },
          { key: 'growperty', label: 'Growperty Listings',  count: growperty.total },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 20px', fontSize: 13, fontWeight: 600,
              color: tab === t.key ? C.green : C.sub,
              borderBottom: tab === t.key ? `2px solid ${C.green}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 700,
              background: tab === t.key ? '#1d9e7522' : '#1e2d3d',
              color: tab === t.key ? C.green : C.muted,
              padding: '1px 7px', borderRadius: 20,
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 120px 110px 100px',
          padding: '11px 16px',
          borderBottom: `1px solid ${C.border}`,
          color: C.sub, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <div>Property</div>
          <div>Type</div>
          <div>Status</div>
          <div>Share</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>Loading...</div>
        ) : current.items.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>
            {tab === 'mine' ? (
              <>No listings yet.{' '}
                <span onClick={() => navigate('/cp/dashboard/add')} style={{ color: C.green, cursor: 'pointer', fontWeight: 600 }}>
                  Add your first property →
                </span>
              </>
            ) : 'No approved Growperty listings available.'}
          </div>
        ) : (
          current.items.map((p, i) => {
            const st = STATUS_COLOR[p.status] || STATUS_COLOR.approved;
            const propId = p._id || p.id;
            const propTitle = `${p.bhk ? p.bhk + ' ' : ''}${p.propertyType}`;
            return (
              <div
                key={propId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 120px 110px 100px',
                  padding: '13px 16px',
                  alignItems: 'center',
                  borderBottom: i < current.items.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{propTitle}</div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                    {p.sector}, {p.city} · {fmt(p.totalPrice)}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: C.sub }}>{p.ownershipType || '—'}</div>
                <div>
                  <span style={{
                    background: st.bg, color: st.color,
                    fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                  }}>
                    {st.label}
                  </span>
                </div>
                <div>
                  {shareToken && (
                    <button
                      onClick={() => setShareModal({ propertyId: propId, title: propTitle })}
                      style={{
                        background: 'transparent', border: `1px solid ${C.border}`,
                        color: C.sub, borderRadius: 6, padding: '4px 10px',
                        fontSize: 12, cursor: 'pointer',
                      }}
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

      {/* ── Pagination ── */}
      {current.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => fetchPage(current.page - 1)}
            disabled={current.page <= 1}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
          >
            ← Prev
          </button>
          <span style={{ color: C.sub, padding: '6px 12px', fontSize: 13 }}>
            {current.page} / {current.totalPages}
          </span>
          <button
            onClick={() => fetchPage(current.page + 1)}
            disabled={current.page >= current.totalPages}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Share Modal ── */}
      {shareModal && (
        <div
          onClick={() => setShareModal(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
              padding: 28, width: '100%', maxWidth: 460, color: C.text,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Share Listing</h3>
              <button
                onClick={() => setShareModal(null)}
                style={{ background: 'none', border: 'none', color: C.sub, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
              >×</button>
            </div>
            <p style={{ fontSize: 13, color: C.sub, marginBottom: 18 }}>{shareModal.title}</p>

            {/* WhatsApp link */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#25D366', textTransform: 'uppercase', letterSpacing: 0.5 }}>WhatsApp Link</span>
              </div>
              <div style={{
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '8px 12px', fontSize: 11, wordBreak: 'break-all', color: C.sub, marginBottom: 8,
              }}>
                {getShareLink(shareModal.propertyId, 'whatsapp')}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleCopy(shareModal.propertyId, 'whatsapp')}
                  style={{
                    flex: 1, background: copied === 'whatsapp' ? '#1d9e7522' : C.bg,
                    border: `1px solid ${copied === 'whatsapp' ? C.green : C.border}`,
                    color: copied === 'whatsapp' ? C.green : C.sub, borderRadius: 6,
                    padding: '7px 0', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {copied === 'whatsapp' ? '✓ Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => {
                    const link = getShareLink(shareModal.propertyId, 'whatsapp');
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Hi! Check out this property: ${link}`)}`, '_blank');
                  }}
                  style={{
                    flex: 2, background: '#25D36622', border: '1px solid #25D36640',
                    color: '#25D366', borderRadius: 6,
                    padding: '7px 0', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  }}
                >
                  Share on WhatsApp ↗
                </button>
              </div>
            </div>

            {/* Ad link */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Ad Link</span>
                <span style={{ fontSize: 10, color: C.muted }}>(Facebook / Instagram / Google)</span>
              </div>
              <div style={{
                background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: '8px 12px', fontSize: 11, wordBreak: 'break-all', color: C.sub, marginBottom: 8,
              }}>
                {getShareLink(shareModal.propertyId, 'ad')}
              </div>
              <button
                onClick={() => handleCopy(shareModal.propertyId, 'ad')}
                style={{
                  width: '100%', background: copied === 'ad' ? '#1e3a5f33' : C.bg,
                  border: `1px solid ${copied === 'ad' ? '#60a5fa' : C.border}`,
                  color: copied === 'ad' ? '#60a5fa' : C.sub, borderRadius: 6,
                  padding: '7px 0', fontWeight: 600, fontSize: 12, cursor: 'pointer',
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
