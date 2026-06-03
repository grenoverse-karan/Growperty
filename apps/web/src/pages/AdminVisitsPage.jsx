import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const C = {
  bg: '#0d1117', surface: '#0d1b2a', border: '#1e2d3d',
  text: '#e6edf3', muted: '#4d6175', sub: '#94aabf',
  hover: '#132236', green: '#1d9e75', blue: '#185fa5',
  red: '#c0392b', yellow: '#ba7517', purple: '#6c3fb5',
};

const STATUS = {
  pending:    { label: 'Pending',     bg: '#ba751722', color: '#f0a500' },
  confirmed:  { label: 'Confirmed',   bg: '#185fa522', color: '#4d9de0' },
  visit_done: { label: 'Visit Done',  bg: '#1d9e7522', color: '#1d9e75' },
  rescheduled:{ label: 'Rescheduled', bg: '#6c3fb522', color: '#a97de0' },
  deal_closed:{ label: 'Deal Closed', bg: '#1d9e7544', color: '#00e676' },
  cancelled:  { label: 'Cancelled',   bg: '#c0392b22', color: '#e74c3c' },
};

const STATUS_ORDER = ['pending', 'confirmed', 'visit_done', 'rescheduled', 'deal_closed', 'cancelled'];

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function groupByVisitDate(visits) {
  const map = {};
  for (const v of visits) {
    const key = v.visitDate || 'No Date';
    if (!map[key]) map[key] = [];
    map[key].push(v);
  }
  return Object.entries(map).sort(([a], [b]) => {
    if (a === 'No Date') return 1;
    if (b === 'No Date') return -1;
    return new Date(b) - new Date(a);
  });
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function StatusMenu({ visitId, current, onUpdate }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px', color: C.sub, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
        Change ▾
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{ position: 'absolute', top: 30, left: 0, zIndex: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, minWidth: 150, overflow: 'hidden', boxShadow: '0 8px 24px #00000055' }}>
            {STATUS_ORDER.map(s => (
              <button key={s} onClick={() => { onUpdate(visitId, s); setOpen(false); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', background: s === current ? C.hover : 'none', border: 'none', color: STATUS[s].color, fontSize: 13, cursor: 'pointer', fontWeight: s === current ? 700 : 400 }}>
                {STATUS[s].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminVisitsPage() {
  const { token } = useAdminAuth();
  const [visits, setVisits]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiServerClient.fetch('/visit-requests?limit=500', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const items = data.items || [];
      setVisits(items);
      setTotal(items.length);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const updateStatus = async (id, status) => {
    try {
      const res = await apiServerClient.fetch(`/visit-requests/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setVisits(vs => vs.map(v => v._id === id || v.id === id ? { ...v, status } : v));
      toast.success(`Status updated to ${STATUS[status].label}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteVisit = async (id) => {
    if (!window.confirm('Delete this visit request?')) return;
    setDeletingId(id);
    try {
      const res = await apiServerClient.fetch(`/visit-requests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setVisits(vs => vs.filter(v => v._id !== id && v.id !== id));
      setTotal(t => t - 1);
      toast.success('Visit deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = visits.filter(v => {
    const q = search.toLowerCase().trim();
    const matchQ = !q || v.visitorName?.toLowerCase().includes(q) || v.visitorPhone?.includes(q) || v.visitorCity?.toLowerCase().includes(q);
    const matchS = statusFilter === 'all' || v.status === statusFilter;
    return matchQ && matchS;
  });

  const grouped = groupByVisitDate(filtered);

  const counts = {
    total, pending: visits.filter(v => v.status === 'pending').length,
    confirmed: visits.filter(v => v.status === 'confirmed').length,
    visit_done: visits.filter(v => v.status === 'visit_done').length,
    deal_closed: visits.filter(v => v.status === 'deal_closed').length,
  };

  return (
    <>
      <Helmet><title>Booked Visits — Admin</title></Helmet>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>📅 Booked Visits</h1>
            <p style={{ color: C.sub, marginTop: 6, fontSize: 14 }}>All site visit requests — grouped by visit date</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Total',      value: counts.total,      color: C.blue },
              { label: 'Pending',    value: counts.pending,    color: '#f0a500' },
              { label: 'Confirmed',  value: counts.confirmed,  color: '#4d9de0' },
              { label: 'Visit Done', value: counts.visit_done, color: C.green },
              { label: 'Deal Closed',value: counts.deal_closed,color: '#00e676' },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', cursor: 'pointer' }}
                onClick={() => setStatusFilter(s.label === 'Total' ? 'all' : Object.keys(STATUS).find(k => STATUS[k].label === s.label) || 'all')}>
                <p style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: '4px 0 0' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, city…"
              style={{ padding: '9px 14px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, width: 280, boxSizing: 'border-box' }}
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, cursor: 'pointer' }}>
              <option value="all">All Statuses</option>
              {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}
            </select>
            {(search || statusFilter !== 'all') && (
              <button onClick={() => { setSearch(''); setStatusFilter('all'); }}
                style={{ padding: '9px 14px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, color: C.sub, fontSize: 13, cursor: 'pointer' }}>
                Clear filters
              </button>
            )}
            <span style={{ color: C.sub, fontSize: 13, marginLeft: 'auto' }}>
              Showing {filtered.length} of {total}
            </span>
          </div>

          {/* Date-grouped table */}
          {loading ? (
            <p style={{ textAlign: 'center', padding: 60, color: C.sub }}>Loading…</p>
          ) : grouped.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 60, color: C.sub }}>No visits found</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {grouped.map(([date, items]) => (
                <div key={date}>
                  {/* Date header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.blue, background: '#185fa522', padding: '3px 12px', borderRadius: 20 }}>
                      📅 {date}
                    </span>
                    <span style={{ fontSize: 12, color: C.sub }}>{items.length} visit{items.length !== 1 ? 's' : ''}</span>
                    <div style={{ flex: 1, height: 1, background: C.border }} />
                  </div>

                  {/* Table */}
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                            {['Visitor', 'Phone', 'City', 'Time', 'Status', 'Property', 'Submitted', 'Actions'].map(h => (
                              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: C.sub, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((v, i) => {
                            const vid = v._id || v.id;
                            const phone = v.visitorPhone?.replace(/\D/g, '');
                            const wa = `https://wa.me/91${phone?.slice(-10)}?text=${encodeURIComponent(`Hi ${v.visitorName}, this is regarding your site visit request for ${v.visitDate} at ${v.visitTime}.`)}`;
                            return (
                              <tr key={vid || i} style={{ borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background .15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = C.hover}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                {/* Visitor name */}
                                <td style={{ padding: '11px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>{v.visitorName || '—'}</td>

                                {/* Phone */}
                                <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
                                  <a href={`tel:${v.visitorPhone}`} style={{ color: C.green, textDecoration: 'none', fontWeight: 600 }}>{v.visitorPhone}</a>
                                </td>

                                {/* City */}
                                <td style={{ padding: '11px 14px', color: C.sub }}>{v.visitorCity || '—'}</td>

                                {/* Time */}
                                <td style={{ padding: '11px 14px', color: C.sub, whiteSpace: 'nowrap' }}>{v.visitTime || '—'}</td>

                                {/* Status */}
                                <td style={{ padding: '11px 14px' }}>
                                  <StatusBadge status={v.status} />
                                </td>

                                {/* Property */}
                                <td style={{ padding: '11px 14px' }}>
                                  {v.propertyId ? (
                                    <a href={`/property/${v.propertyId}`} target="_blank" rel="noreferrer"
                                      style={{ color: C.blue, textDecoration: 'none', fontSize: 12 }}>
                                      View →
                                    </a>
                                  ) : <span style={{ color: C.muted }}>—</span>}
                                </td>

                                {/* Submitted */}
                                <td style={{ padding: '11px 14px', color: C.sub, fontSize: 12, whiteSpace: 'nowrap' }}>
                                  {v.createdAt ? fmtDate(v.createdAt) : '—'}
                                </td>

                                {/* Actions */}
                                <td style={{ padding: '11px 14px' }}>
                                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap' }}>

                                    {/* Call */}
                                    <a href={`tel:${v.visitorPhone}`}
                                      style={{ padding: '5px 10px', borderRadius: 6, background: '#1d9e7522', color: C.green, fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
                                      title="Call">
                                      📞 Call
                                    </a>

                                    {/* WhatsApp */}
                                    <a href={wa} target="_blank" rel="noreferrer"
                                      style={{ padding: '5px 10px', borderRadius: 6, background: '#1d9e7522', color: '#25d366', fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
                                      title="WhatsApp">
                                      💬 WA
                                    </a>

                                    {/* Status change */}
                                    <StatusMenu visitId={vid} current={v.status} onUpdate={updateStatus} />

                                    {/* Delete */}
                                    <button onClick={() => deleteVisit(vid)}
                                      disabled={deletingId === vid}
                                      style={{ padding: '5px 10px', borderRadius: 6, background: '#c0392b22', color: '#e74c3c', border: 'none', fontSize: 12, fontWeight: 700, cursor: deletingId === vid ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: deletingId === vid ? 0.5 : 1 }}
                                      title="Delete">
                                      🗑 Del
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ color: C.muted, fontSize: 12, marginTop: 20, textAlign: 'right' }}>
            {filtered.length} visits across {grouped.length} date{grouped.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </>
  );
}
