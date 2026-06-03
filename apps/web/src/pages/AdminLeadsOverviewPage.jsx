import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const C = {
  bg: '#0d1117', surface: '#0d1b2a', border: '#1e2d3d',
  text: '#e6edf3', muted: '#4d6175', sub: '#94aabf',
  hover: '#132236', green: '#1d9e75', blue: '#185fa5',
  yellow: '#ba7517', red: '#c0392b', purple: '#533ab7',
};

const fmt = (n) => {
  if (!n) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const VISIT_STATUS = {
  pending:    { label: 'Pending',     color: '#f0a500' },
  confirmed:  { label: 'Confirmed',   color: '#4d9de0' },
  visit_done: { label: 'Visit Done',  color: '#1d9e75' },
  rescheduled:{ label: 'Rescheduled', color: '#a97de0' },
  deal_closed:{ label: 'Deal Closed', color: '#00e676' },
  cancelled:  { label: 'Cancelled',   color: '#e74c3c' },
};

function StatCard({ label, value, color, sub, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => onClick && (e.currentTarget.style.background = C.hover)}
      onMouseLeave={e => onClick && (e.currentTarget.style.background = C.surface)}>
      <p style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 800, color, margin: '4px 0 2px' }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{sub}</p>}
    </div>
  );
}

export default function AdminLeadsOverviewPage() {
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const [visits, setVisits]     = useState([]);
  const [reqs, setReqs]         = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [vRes, rRes] = await Promise.all([
        apiServerClient.fetch('/visit-requests?limit=500', { headers }),
        apiServerClient.fetch('/requirements?limit=500', { headers }),
      ]);
      const [vData, rData] = await Promise.all([vRes.json(), rRes.json()]);
      if (!vRes.ok) throw new Error(vData.error || 'Visits failed');
      if (!rRes.ok) throw new Error(rData.error || 'Requirements failed');
      setVisits(vData.items || []);
      setReqs(rData.items || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const pending    = visits.filter(v => v.status === 'pending').length;
  const confirmed  = visits.filter(v => v.status === 'confirmed').length;
  const visitDone  = visits.filter(v => v.status === 'visit_done').length;
  const dealClosed = visits.filter(v => v.status === 'deal_closed').length;
  const cancelled  = visits.filter(v => v.status === 'cancelled').length;

  // Visits by status bar chart data
  const statusChartData = Object.entries(VISIT_STATUS).map(([key, { label, color }]) => ({
    name: label, value: visits.filter(v => v.status === key).length, color,
  }));

  // Recent activity (latest 10 visits + 10 requirements sorted by date)
  const recentActivity = [
    ...visits.slice(0, 20).map(v => ({ ...v, _type: 'visit' })),
    ...reqs.slice(0, 20).map(r => ({ ...r, _type: 'requirement' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15);

  // Conversion funnel
  const funnel = [
    { label: 'Requirements', value: reqs.length,  color: C.blue },
    { label: 'Visits Booked',value: visits.length, color: C.yellow },
    { label: 'Visits Done',  value: visitDone,     color: '#4d9de0' },
    { label: 'Deals Closed', value: dealClosed,    color: '#00e676' },
  ];
  const maxFunnel = Math.max(...funnel.map(f => f.value), 1);

  // Top cities from visits
  const cityMap = {};
  for (const v of visits) {
    const c = v.visitorCity?.trim();
    if (c) cityMap[c] = (cityMap[c] || 0) + 1;
  }
  const topCities = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.sub }}>Loading…</p>
    </div>
  );

  return (
    <>
      <Helmet><title>Lead Overview — Admin</title></Helmet>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>👥 Lead Overview</h1>
            <p style={{ color: C.sub, marginTop: 6, fontSize: 14 }}>All visit requests and buyer requirements at a glance</p>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
            <StatCard label="Total Visits"  value={visits.length} color={C.blue}    onClick={() => navigate('/admin/visits')} />
            <StatCard label="Pending"       value={pending}       color='#f0a500'   onClick={() => navigate('/admin/visits')} />
            <StatCard label="Confirmed"     value={confirmed}     color='#4d9de0'   onClick={() => navigate('/admin/visits')} />
            <StatCard label="Visit Done"    value={visitDone}     color={C.green}   onClick={() => navigate('/admin/visits')} />
            <StatCard label="Deal Closed"   value={dealClosed}    color='#00e676'   onClick={() => navigate('/admin/visits')} />
            <StatCard label="Cancelled"     value={cancelled}     color='#e74c3c'   onClick={() => navigate('/admin/visits')} />
            <StatCard label="Requirements"  value={reqs.length}   color={C.purple}  onClick={() => navigate('/admin/requirements')} />
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>

            {/* Visits by status */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.sub, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 1 }}>Visits by Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusChartData} barSize={30}>
                  <XAxis dataKey="name" tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top cities */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.sub, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 1 }}>Top Cities (Visits)</h3>
              {topCities.length === 0 ? <p style={{ color: C.muted, fontSize: 13 }}>No data</p> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topCities} layout="vertical" barSize={18}>
                    <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }} />
                    <Bar dataKey="value" fill={C.blue} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Conversion funnel */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.sub, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 1 }}>Conversion Funnel</h3>
            <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end', height: 120 }}>
              {funnel.map((f, i) => {
                const h = Math.max(20, (f.value / maxFunnel) * 100);
                const pct = i > 0 && funnel[0].value > 0 ? Math.round((f.value / funnel[0].value) * 100) : 100;
                return (
                  <div key={f.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: C.sub }}>{pct}%</span>
                    <div style={{ width: '70%', height: `${h}%`, background: f.color, borderRadius: '4px 4px 0 0', minHeight: 8, opacity: 0.85 }} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 800, color: f.color, margin: 0 }}>{f.value}</p>
                      <p style={{ fontSize: 11, color: C.sub, margin: 0 }}>{f.label}</p>
                    </div>
                    {i < funnel.length - 1 && (
                      <div style={{ position: 'absolute' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.sub, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Recent Activity</h3>
              <span style={{ fontSize: 12, color: C.muted }}>Last {recentActivity.length} entries</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['Type', 'Name', 'Phone', 'City / Details', 'Status / Budget', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: C.muted, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((item, i) => (
                    <tr key={item._id || i} style={{ borderBottom: `1px solid ${C.border}`, transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.hover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                          background: item._type === 'visit' ? '#185fa522' : '#533ab722',
                          color: item._type === 'visit' ? '#4d9de0' : '#a48aff',
                        }}>
                          {item._type === 'visit' ? '📅 Visit' : '📋 Req'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 600 }}>
                        {item._type === 'visit' ? item.visitorName : item.buyerName}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <a href={`tel:${item._type === 'visit' ? item.visitorPhone : item.buyerPhone}`}
                          style={{ color: C.green, textDecoration: 'none' }}>
                          {item._type === 'visit' ? item.visitorPhone : item.buyerPhone}
                        </a>
                      </td>
                      <td style={{ padding: '10px 16px', color: C.sub }}>
                        {item._type === 'visit'
                          ? `${item.visitorCity || '—'} · ${item.visitDate || ''}`
                          : `${item.city || '—'} · ${item.propertyType || ''}`}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        {item._type === 'visit' ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: (VISIT_STATUS[item.status] || VISIT_STATUS.pending).color }}>
                            {(VISIT_STATUS[item.status] || VISIT_STATUS.pending).label}
                          </span>
                        ) : (
                          <span style={{ color: C.sub, fontSize: 12 }}>
                            {fmt(item.minBudget)} – {fmt(item.maxBudget)}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px', color: C.muted, fontSize: 12 }}>{fmtDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
