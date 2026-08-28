import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const C = {
  surface: '#ffffff',
  border:  '#e5e7eb',
  text:    '#111827',
  muted:   '#9ca3af',
  sub:     '#6b7280',
  greenDark: '#059669',
};

const STATUS_META = {
  pending:    { bg: '#fef3c7', color: '#d97706', label: 'Pending'     },
  confirmed:  { bg: '#d1fae5', color: '#059669', label: 'Confirmed'   },
  visit_done: { bg: '#dbeafe', color: '#2563eb', label: 'Done'        },
  rescheduled:{ bg: '#ede9fe', color: '#7c3aed', label: 'Rescheduled' },
  deal_closed:{ bg: '#d1fae5', color: '#065f46', label: 'Deal Closed' },
  cancelled:  { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled'   },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CpVisitRequestsPage() {
  const { token } = useCpAuth();
  const [visits, setVisits]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiServerClient.fetch('/cp/visits', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setVisits(data.visits);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const [tab, setTab] = useState('requests');
  const requestsList = visits.filter(v => v.status !== 'visit_done');
  const doneList     = visits.filter(v => v.status === 'visit_done');
  const current      = tab === 'requests' ? requestsList : doneList;

  return (
    <>
      <Helmet><title>Visit Requests — CP Dashboard</title></Helmet>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>Visit Requests</h1>
          <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>
            {loading ? 'Loading...' : `${visits.length} total visit${visits.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={fetchVisits}
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `1px solid ${C.border}` }}>
        {[
          { key: 'requests', label: 'Visit Requests', count: requestsList.length },
          { key: 'done',     label: 'Visit Done',     count: doneList.length },
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

      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 100px',
            minWidth: 640,
            padding: '11px 20px',
            borderBottom: `1px solid ${C.border}`,
            background: '#f9fafb',
            color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <div>Visitor</div>
            <div>Property</div>
            <div>Date</div>
            <div>Time</div>
            <div>Status</div>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: C.muted, fontSize: 14 }}>Loading...</div>
          ) : current.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{tab === 'requests' ? '📅' : '✅'}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                {tab === 'requests' ? 'No visit requests yet' : 'No completed visits yet'}
              </div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {tab === 'requests' ? 'Visit requests from buyers will appear here.' : 'Visits marked as done will appear here.'}
              </div>
            </div>
          ) : (
            current.map((v, i) => {
              const st = STATUS_META[v.status] || STATUS_META.pending;
              return (
                <div
                  key={v.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 100px',
                    minWidth: 640,
                    padding: '13px 20px',
                    alignItems: 'center',
                    borderBottom: i < current.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{v.visitorName}</div>
                    {v.visitorPhone && (
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>📞 {v.visitorPhone}</div>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: C.sub }}>
                    {v.property ? `${v.property.type} · ${v.property.sector}, ${v.property.city}` : v.propertyId}
                  </div>
                  <div style={{ fontSize: 13, color: C.sub }}>{v.visitDate || '—'}</div>
                  <div style={{ fontSize: 13, color: C.sub }}>{v.visitTime || '—'}</div>
                  <div>
                    <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
