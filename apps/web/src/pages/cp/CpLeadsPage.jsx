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
};

const STATUS_COLOR = {
  pending:    '#fbbf24',
  confirmed:  '#34d399',
  visit_done: '#60a5fa',
  cancelled:  '#f87171',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CpLeadsPage() {
  const { token } = useCpAuth();
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiServerClient.fetch('/cp/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setLeads(data.leads);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  return (
    <>
      <Helmet><title>Leads — CP Dashboard</title></Helmet>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Leads</h1>
          <p style={{ margin: '4px 0 0', color: C.sub, fontSize: 13 }}>{leads.length} inquiries on your listings</p>
        </div>
        <button
          onClick={fetchLeads}
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}
        >
          ↻ Refresh
        </button>
      </div>

      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 90px 100px',
          padding: '11px 16px',
          borderBottom: `1px solid ${C.border}`,
          color: C.sub, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          <div>Visitor</div>
          <div>Visit Date</div>
          <div>Visit Time</div>
          <div>Status</div>
          <div>Received</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>Loading...</div>
        ) : leads.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>No leads yet.</div>
        ) : (
          leads.map((lead, i) => (
            <div
              key={lead.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 90px 100px',
                padding: '12px 16px',
                alignItems: 'center',
                borderBottom: i < leads.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{lead.visitorName}</div>
                {lead.visitorCity && <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>📍 {lead.visitorCity}</div>}
                {lead.message && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: 'italic' }}>{lead.message.slice(0, 60)}{lead.message.length > 60 ? '…' : ''}</div>}
              </div>
              <div style={{ fontSize: 13, color: C.sub }}>{lead.visitDate || '—'}</div>
              <div style={{ fontSize: 13, color: C.sub }}>{lead.visitTime || '—'}</div>
              <div>
                <span style={{ color: STATUS_COLOR[lead.status] || C.sub, fontSize: 12, fontWeight: 600 }}>
                  {lead.status || 'pending'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.sub }}>{fmtDate(lead.createdAt)}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
