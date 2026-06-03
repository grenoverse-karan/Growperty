import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const C = {
  bg: '#0d1117', surface: '#0d1b2a', border: '#1e2d3d',
  text: '#e6edf3', muted: '#4d6175', sub: '#94aabf',
  hover: '#132236', green: '#1d9e75', blue: '#185fa5',
};

const fmt = (n) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

export default function AdminRequirementsPage() {
  const { token } = useAdminAuth();
  const [reqs, setReqs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReqs = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 50 });
      const res  = await apiServerClient.fetch(`/requirements?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setReqs(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(pg);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchReqs(1); }, [fetchReqs]);

  const filtered = reqs.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.buyerName?.toLowerCase().includes(q) ||
      r.buyerPhone?.includes(q) ||
      r.buyerEmail?.toLowerCase().includes(q) ||
      r.city?.toLowerCase().includes(q) ||
      r.propertyType?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Helmet><title>Buyer Requirements — Admin</title></Helmet>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>📋 Buyer Requirements</h1>
            <p style={{ color: C.sub, marginTop: 6, fontSize: 14 }}>All property requirements submitted by buyers</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28, maxWidth: 500 }}>
            {[
              { label: 'Total Requirements', value: total,                                   color: C.blue },
              { label: 'Active',             value: reqs.filter(r => r.status === 'active').length, color: C.green },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px' }}>
                <p style={{ fontSize: 12, color: C.sub, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 32, fontWeight: 800, color: s.color, margin: '6px 0 0' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, city, property type…"
            style={{ width: '100%', maxWidth: 420, padding: '10px 14px', borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, marginBottom: 20, boxSizing: 'border-box' }}
          />

          {/* Table */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: 40, color: C.sub }}>Loading…</p>
            ) : filtered.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 40, color: C.sub }}>No requirements found</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['Buyer', 'Phone', 'Email', 'Property Type', 'BHK', 'City / Area', 'Budget', 'Notes', 'Date'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: C.sub, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r._id || i} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = C.hover}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.buyerName || '—'}</td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <a href={`tel:${r.buyerPhone}`} style={{ color: C.green, textDecoration: 'none' }}>{r.buyerPhone || '—'}</a>
                        </td>
                        <td style={{ padding: '12px 16px', color: C.sub, fontSize: 12 }}>{r.buyerEmail || '—'}</td>
                        <td style={{ padding: '12px 16px', color: C.sub }}>{r.propertyType || '—'}</td>
                        <td style={{ padding: '12px 16px', color: C.sub }}>{r.preferredBhk || '—'}</td>
                        <td style={{ padding: '12px 16px', color: C.sub }}>{[r.city, r.buyerAddress].filter(Boolean).join(', ') || '—'}</td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: C.sub }}>
                          {(r.minBudget || r.maxBudget) ? `${fmt(r.minBudget)} – ${fmt(r.maxBudget)}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: C.sub, fontSize: 12, maxWidth: 200 }}>
                          <span title={r.specialRequirements} style={{ display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 200 }}>
                            {r.specialRequirements || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: C.sub, fontSize: 12, whiteSpace: 'nowrap' }}>
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchReqs(p)}
                  style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${C.border}`, background: p === page ? C.blue : C.surface, color: C.text, cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          <p style={{ color: C.sub, fontSize: 13, marginTop: 12 }}>Showing {filtered.length} of {total} requirements</p>
        </div>
      </div>
    </>
  );
}
