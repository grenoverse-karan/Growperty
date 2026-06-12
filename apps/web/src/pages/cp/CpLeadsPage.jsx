import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
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
};

const VISIT_STATUS = {
  pending:    '#fbbf24',
  confirmed:  '#34d399',
  visit_done: '#60a5fa',
  cancelled:  '#f87171',
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Buyers</h1>
        <button
          onClick={() => tab === 'mine' ? fetchMine(current.page) : fetchGrowperty(current.page)}
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `1px solid ${C.border}` }}>
        {[
          { key: 'mine',      label: 'My Buyers',        count: mine.total },
          { key: 'growperty', label: 'Growperty Buyers',  count: growperty.total },
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
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
          >← Prev</button>
          <span style={{ color: C.sub, padding: '6px 12px', fontSize: 13 }}>
            {current.page} / {current.totalPages}
          </span>
          <button
            onClick={() => fetchPage(current.page + 1)}
            disabled={current.page >= current.totalPages}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
          >Next →</button>
        </div>
      )}
    </>
  );
}

// ── My Buyers (CP-referred visit requests) ────────────────────────────────
function MineBuyersTable({ buyers, loading }) {
  if (loading) return <Empty>Loading...</Empty>;
  if (!buyers.length) return <Empty>No buyers yet. Share property links to attract buyers.</Empty>;

  return (
    <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 90px 90px 100px',
        padding: '11px 16px', borderBottom: `1px solid ${C.border}`,
        color: C.sub, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        <div>Buyer</div><div>Visit Date</div><div>Visit Time</div><div>Status</div><div>Source</div><div>Received</div>
      </div>
      {buyers.map((b, i) => (
        <div key={b.id} style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 90px 90px 100px',
          padding: '12px 16px', alignItems: 'center',
          borderBottom: i < buyers.length - 1 ? `1px solid ${C.border}` : 'none',
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
            {b.city && <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>📍 {b.city}</div>}
            {b.message && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: 'italic' }}>{b.message.slice(0, 60)}{b.message.length > 60 ? '…' : ''}</div>}
          </div>
          <div style={{ fontSize: 13, color: C.sub }}>{b.visitDate || '—'}</div>
          <div style={{ fontSize: 13, color: C.sub }}>{b.visitTime || '—'}</div>
          <div>
            <span style={{ color: VISIT_STATUS[b.status] || C.sub, fontSize: 12, fontWeight: 600 }}>
              {b.status || 'pending'}
            </span>
          </div>
          <div>
            <SourceBadge src={b.leadSource} />
          </div>
          <div style={{ fontSize: 12, color: C.sub }}>{fmtDate(b.createdAt)}</div>
        </div>
      ))}
    </div>
  );
}

// ── Growperty Buyers (buyer requirements) ────────────────────────────────
function GrowpertyBuyersTable({ buyers, loading }) {
  if (loading) return <Empty>Loading...</Empty>;
  if (!buyers.length) return <Empty>No buyer requirements found.</Empty>;

  return (
    <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 100px',
        padding: '11px 16px', borderBottom: `1px solid ${C.border}`,
        color: C.sub, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        <div>Buyer</div><div>Looking For</div><div>Budget</div><div>Location</div><div>Since</div>
      </div>
      {buyers.map((b, i) => {
        const typeLabel = [b.preferredBhk, b.propertyType].filter(Boolean).join(' ') || '—';
        const areas = Array.isArray(b.areas) && b.areas.length ? b.areas.slice(0, 2).join(', ') : (b.city || '—');
        const budget = b.maxBudget ? fmt(b.maxBudget) : '—';
        return (
          <div key={b.id} style={{
            display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 100px',
            padding: '13px 16px', alignItems: 'center',
            borderBottom: i < buyers.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{b.buyerName}</div>
              {b.buyerCity && <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>📍 {b.buyerCity}</div>}
              {b.buyingTimeline && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Timeline: {b.buyingTimeline}</div>}
            </div>
            <div style={{ fontSize: 13, color: C.sub }}>{typeLabel}</div>
            <div style={{ fontSize: 13, color: C.sub }}>{budget}</div>
            <div style={{ fontSize: 12, color: C.sub }}>{areas}</div>
            <div style={{ fontSize: 12, color: C.sub }}>{fmtDate(b.createdAt)}</div>
          </div>
        );
      })}
    </div>
  );
}

function SourceBadge({ src }) {
  if (src === 'whatsapp') return (
    <span style={{ background: '#25D36622', color: '#25D366', border: '1px solid #25D36640', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
      WhatsApp
    </span>
  );
  if (src === 'ad') return (
    <span style={{ background: '#1e3a5f33', color: '#60a5fa', border: '1px solid #60a5fa40', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
      Ad
    </span>
  );
  return <span style={{ fontSize: 11, color: C.muted }}>—</span>;
}

function Empty({ children }) {
  return (
    <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: '40px 24px', textAlign: 'center', color: C.sub }}>
      {children}
    </div>
  );
}
