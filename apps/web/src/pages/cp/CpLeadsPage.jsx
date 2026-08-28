import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

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

const VISIT_STATUS = {
  pending:    { bg: '#fef3c7', color: '#d97706' },
  confirmed:  { bg: '#d1fae5', color: '#059669' },
  visit_done: { bg: '#dbeafe', color: '#2563eb' },
  cancelled:  { bg: '#fee2e2', color: '#dc2626' },
};

const fmt = (n) => {
  if (!n) return '—';
  const v = Number(n);
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(1).replace(/\.0$/, '')} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1).replace(/\.0$/, '')} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CpLeadsPage() {
  const { token } = useCpAuth();

  const [tab, setTab] = useState('mine');

  const [mine,      setMine]      = useState({ buyers: [], total: 0, page: 1, totalPages: 1 });
  const [growperty, setGrowperty] = useState({ buyers: [], total: 0, page: 1, totalPages: 1 });
  const [loading,   setLoading]   = useState(true);

  const fetchMine = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res  = await apiServerClient.fetch(`/cp/my-buyers?page=${pg}&limit=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setMine({ buyers: data.buyers, total: data.total, page: pg, totalPages: data.totalPages });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [token]);

  const fetchGrowperty = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res  = await apiServerClient.fetch(`/cp/growperty-buyers?page=${pg}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setGrowperty({ buyers: data.buyers, total: data.total, page: pg, totalPages: data.totalPages });
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchMine(1); },      [fetchMine]);
  useEffect(() => { fetchGrowperty(1); }, [fetchGrowperty]);

  const current   = tab === 'mine' ? mine : growperty;
  const fetchPage = tab === 'mine' ? fetchMine : fetchGrowperty;

  return (
    <>
      <Helmet><title>Buyers — CP Dashboard</title></Helmet>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>Buyers</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>People interested in your listings</p>
        </div>
        <button
          onClick={() => tab === 'mine' ? fetchMine(current.page) : fetchGrowperty(current.page)}
          style={{
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.sub, borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `1px solid ${C.border}` }}>
        {[
          { key: 'mine',      label: 'My Buyers',       count: mine.total },
          { key: 'growperty', label: 'Growperty Buyers', count: growperty.total },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 20px', fontSize: 13, fontWeight: 600,
              color: tab === t.key ? C.greenDark : C.sub,
              borderBottom: tab === t.key ? `2px solid ${C.greenDark}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
            <span style={{
              marginLeft: 7, fontSize: 11, fontWeight: 700,
              background: tab === t.key ? '#d1fae5' : '#f3f4f6',
              color: tab === t.key ? C.greenDark : C.muted,
              padding: '1px 7px', borderRadius: 20,
            }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Tables ── */}
      {tab === 'mine' ? (
        <MineBuyersTable buyers={mine.buyers} loading={loading} />
      ) : (
        <GrowpertyBuyersTable buyers={growperty.buyers} loading={loading} />
      )}

      {/* ── Pagination ── */}
      {current.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => fetchPage(current.page - 1)}
            disabled={current.page <= 1}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}
          >← Prev</button>
          <span style={{ color: C.sub, padding: '7px 14px', fontSize: 13 }}>
            {current.page} / {current.totalPages}
          </span>
          <button
            onClick={() => fetchPage(current.page + 1)}
            disabled={current.page >= current.totalPages}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}
          >Next →</button>
        </div>
      )}
    </>
  );
}

function MineBuyersTable({ buyers, loading }) {
  if (loading) return <Empty>Loading...</Empty>;
  if (!buyers.length) return (
    <Empty>
      <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
      <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>No buyers yet</div>
      <div style={{ fontSize: 13, color: C.muted }}>Share your property links to attract buyers.</div>
    </Empty>
  );

  return (
    <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 90px 90px 100px', minWidth: 700,
          padding: '11px 20px', borderBottom: `1px solid ${C.border}`, background: '#f9fafb',
          color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <div>Buyer</div><div>Visit Date</div><div>Visit Time</div><div>Status</div><div>Source</div><div>Received</div>
        </div>
        {buyers.map((b, i) => {
          const st = VISIT_STATUS[b.status] || VISIT_STATUS.pending;
          return (
            <div key={b.id} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 90px 90px 100px', minWidth: 700,
              padding: '13px 20px', alignItems: 'center',
              borderBottom: i < buyers.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{b.name}</div>
                {b.city && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>📍 {b.city}</div>}
                {b.message && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: 'italic' }}>{b.message.slice(0, 60)}{b.message.length > 60 ? '…' : ''}</div>}
              </div>
              <div style={{ fontSize: 13, color: C.sub }}>{b.visitDate || '—'}</div>
              <div style={{ fontSize: 13, color: C.sub }}>{b.visitTime || '—'}</div>
              <div>
                <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                  {b.status || 'pending'}
                </span>
              </div>
              <div>
                <SourceBadge src={b.leadSource} />
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>{fmtDate(b.createdAt)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GrowpertyBuyersTable({ buyers, loading }) {
  if (loading) return <Empty>Loading...</Empty>;
  if (!buyers.length) return (
    <Empty>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
      <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>No buyer requirements found</div>
      <div style={{ fontSize: 13, color: C.muted }}>Active buyer requirements will appear here.</div>
    </Empty>
  );

  return (
    <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 100px', minWidth: 640,
          padding: '11px 20px', borderBottom: `1px solid ${C.border}`, background: '#f9fafb',
          color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <div>Buyer</div><div>Looking For</div><div>Budget</div><div>Location</div><div>Since</div>
        </div>
        {buyers.map((b, i) => {
          const typeLabel = [b.preferredBhk, b.propertyType].filter(Boolean).join(' ') || '—';
          const areas = Array.isArray(b.areas) && b.areas.length ? b.areas.slice(0, 2).join(', ') : (b.city || '—');
          const budget = b.maxBudget ? fmt(b.maxBudget) : '—';
          return (
            <div key={b.id} style={{
              display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 100px', minWidth: 640,
              padding: '13px 20px', alignItems: 'center',
              borderBottom: i < buyers.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{b.buyerName}</div>
                {b.buyerCity && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>📍 {b.buyerCity}</div>}
                {b.buyingTimeline && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Timeline: {b.buyingTimeline}</div>}
              </div>
              <div style={{ fontSize: 13, color: C.sub }}>{typeLabel}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{budget}</div>
              <div style={{ fontSize: 12, color: C.sub }}>{areas}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{fmtDate(b.createdAt)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SourceBadge({ src }) {
  if (src === 'whatsapp') return (
    <span style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
      WhatsApp
    </span>
  );
  if (src === 'ad') return (
    <span style={{ background: '#dbeafe', color: '#2563eb', border: '1px solid #93c5fd', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
      Ad
    </span>
  );
  return <span style={{ fontSize: 11, color: C.muted }}>—</span>;
}

function Empty({ children }) {
  return (
    <div style={{
      background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
      padding: '48px 24px', textAlign: 'center', color: C.sub,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {children}
    </div>
  );
}
