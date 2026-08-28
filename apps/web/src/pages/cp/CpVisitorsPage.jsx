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

const STATUS_BADGE = {
  none:            { label: '🟡 Browsing',        bg: '#fef3c7', color: '#d97706' },
  inquiry:         { label: '🔵 Inquiry Done',    bg: '#dbeafe', color: '#2563eb' },
  visit_scheduled: { label: '🟢 Visit Scheduled', bg: '#d1fae5', color: '#059669' },
  deal_closed:     { label: '✅ Deal Closed',      bg: '#dcfce7', color: '#16a34a' },
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CpVisitorsPage() {
  const { token } = useCpAuth();

  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ totalReferredVisitors: 0, activeThisWeek: 0, inquiriesGenerated: 0, dealsClosed: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/cp-visitors', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load visitors');
      setItems(data.items);
      setSummary(data.summary);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) fetchVisitors(); }, [token, fetchVisitors]);

  const CARDS = [
    { label: 'Total Referred Visitors', value: summary.totalReferredVisitors, icon: '🎯' },
    { label: 'Active This Week',        value: summary.activeThisWeek,        icon: '⚡' },
    { label: 'Inquiries Generated',     value: summary.inquiriesGenerated,    icon: '🔵' },
    { label: 'Deals Closed',            value: summary.dealsClosed,           icon: '✅' },
  ];

  return (
    <>
      <Helmet><title>Referred Visitors — CP Dashboard</title></Helmet>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>My Referred Visitors</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>People who clicked your referral link</p>
        </div>
        <button
          onClick={fetchVisitors}
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {CARDS.map(c => (
          <div key={c.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{c.value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <Empty>Loading...</Empty>
      ) : !items.length ? (
        <Empty>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
          <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>No referred visitors yet</div>
          <div style={{ fontSize: 13, color: C.muted }}>Share your referral link to start tracking activity here.</div>
        </Empty>
      ) : (
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 90px 110px 140px', minWidth: 820,
              padding: '11px 20px', borderBottom: `1px solid ${C.border}`, background: '#f9fafb',
              color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              <div>Visitor</div><div>First Came</div><div>Last Active</div><div>Visits</div><div>Source</div><div>Properties</div><div>Status</div>
            </div>
            {items.map((v, i) => {
              const st = STATUS_BADGE[v.dealStatus] || STATUS_BADGE.none;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 90px 110px 140px', minWidth: 820,
                    padding: '13px 20px', alignItems: 'center', cursor: 'pointer',
                    borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>
                      {v.visitorName ? v.visitorName : `Visitor #${v.visitorNumber}`}
                    </div>
                    {v.visitorPhone && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{v.visitorPhone}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: C.sub }}>{fmtDate(v.firstVisit)}</div>
                  <div style={{ fontSize: 12, color: C.sub }}>{fmtDate(v.lastVisit)}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{v.totalVisits}</div>
                  <div style={{ fontSize: 12, color: C.sub }}>{v.source}</div>
                  <div style={{ fontSize: 13, color: C.sub }}>{v.propertiesViewedCount} viewed</div>
                  <div>
                    <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedId && (
        <VisitorDetailModal id={selectedId} token={token} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}

function VisitorDetailModal({ id, token, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiServerClient.fetch(`/cp-visitors/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setDetail)
      .catch(() => toast.error('Failed to load visitor detail'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const st = detail ? (STATUS_BADGE[detail.dealStatus] || STATUS_BADGE.none) : null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: C.surface, borderRadius: 14, width: '100%', maxWidth: 560, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}
      >
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.text }}>
              {detail?.visitorName || `Visitor #${detail?.visitorNumber ?? ''}`}
            </h2>
            {detail?.visitorPhone && <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{detail.visitorPhone}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: C.muted, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {loading ? (
            <p style={{ color: C.muted, fontSize: 13 }}>Loading...</p>
          ) : !detail ? (
            <p style={{ color: C.muted, fontSize: 13 }}>Could not load visitor detail.</p>
          ) : (
            <>
              {st && (
                <div style={{ marginBottom: 20 }}>
                  <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                    {st.label}
                  </span>
                </div>
              )}

              <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Timeline</h3>
              <div style={{ marginBottom: 24 }}>
                {detail.timeline.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: C.muted, minWidth: 80, whiteSpace: 'nowrap' }}>{fmtDate(ev.date)}</div>
                    <div style={{ fontSize: 13, color: C.text }}>— {ev.label}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                Properties Viewed ({detail.propertiesViewed.length})
              </h3>
              {detail.propertiesViewed.length ? (
                <div style={{ marginBottom: 24 }}>
                  {detail.propertiesViewed.map(p => (
                    <div key={p.propertyId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                      <span style={{ color: C.text }}>{p.label}</span>
                      <span style={{ color: C.muted }}>{p.viewCount}× · {fmtDate(p.lastViewed)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>No properties viewed yet.</p>
              )}

              {detail.searchKeywords.length > 0 && (
                <>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Search Keywords</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {detail.searchKeywords.map((k, i) => (
                      <span key={i} style={{ background: '#f3f4f6', color: C.sub, fontSize: 12, padding: '4px 10px', borderRadius: 20 }}>{k}</span>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
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
