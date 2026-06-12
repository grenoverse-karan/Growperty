import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const C = {
  surface: '#0d1b2a',
  border:  '#1e2d3d',
  text:    '#e6edf3',
  muted:   '#4d6175',
  sub:     '#94aabf',
};

const STATUS_META = {
  pending:    { color: '#fbbf24', label: 'Pending'    },
  confirmed:  { color: '#34d399', label: 'Confirmed'  },
  visit_done: { color: '#60a5fa', label: 'Done'       },
  rescheduled:{ color: '#c084fc', label: 'Rescheduled'},
  deal_closed:{ color: '#10b981', label: 'Deal Closed'},
  cancelled:  { color: '#f87171', label: 'Cancelled'  },
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

  return (
    <>
      <Helmet><title>Visit Requests — CP Dashboard</title></Helmet>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Visit Requests</h1>
          <p style={{ margin: '4px 0 0', color: C.sub, fontSize: 13 }}>{visits.length} total</p>
        </div>
        <button
          onClick={fetchVisits}
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}
        >
          ↻ Refresh
        </button>
      </div>

      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 90px',
          padding: '11px 16px',
          borderBottom: `1px solid ${C.border}`,
          color: C.sub, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <div>Visitor</div>
          <div>Property</div>
          <div>Date</div>
          <div>Time</div>
          <div>Status</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>Loading...</div>
        ) : visits.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>No visit requests yet.</div>
        ) : (
          visits.map((v, i) => {
            const st = STATUS_META[v.status] || STATUS_META.pending;
            return (
              <div
                key={v.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 90px',
                  padding: '12px 16px',
                  alignItems: 'center',
                  borderBottom: i < visits.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>{v.visitorName}</div>
                <div style={{ fontSize: 13, color: C.sub }}>
                  {v.property ? `${v.property.type} · ${v.property.sector}, ${v.property.city}` : v.propertyId}
                </div>
                <div style={{ fontSize: 13, color: C.sub }}>{v.visitDate || '—'}</div>
                <div style={{ fontSize: 13, color: C.sub }}>{v.visitTime || '—'}</div>
                <div>
                  <span style={{ color: st.color, fontSize: 12, fontWeight: 600 }}>{st.label}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
