import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, PieChart, Pie, Legend,
} from 'recharts';

const C = {
  bg: '#0d1117', surface: '#0d1b2a', border: '#1e2d3d',
  text: '#e6edf3', muted: '#4d6175', sub: '#94aabf',
  hover: '#132236', green: '#1d9e75', blue: '#185fa5',
  yellow: '#ba7517', red: '#a32d2d', purple: '#533ab7',
};

const STATUS_META = {
  approved: { label: 'Live',      color: '#1d9e75', bg: 'rgba(29,158,117,0.15)' },
  pending:  { label: 'Pending',   color: '#f0a500', bg: 'rgba(186,117,23,0.15)' },
  rejected: { label: 'Rejected',  color: '#e06c6c', bg: 'rgba(163,45,45,0.15)' },
  unlisted: { label: 'Unlisted',  color: '#94aabf', bg: 'rgba(77,97,117,0.15)' },
  sold:     { label: 'Sold',      color: '#a48aff', bg: 'rgba(83,58,183,0.15)' },
  suspended:{ label: 'Suspended', color: '#e06c6c', bg: 'rgba(163,45,45,0.15)' },
};

const PALETTE = ['#185fa5','#1d9e75','#ba7517','#533ab7','#e74c3c','#4d9de0','#a48aff','#f0a500','#00e676'];

const fmt = (n) => {
  if (!n) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function countBy(items, key) {
  const map = {};
  for (const item of items) {
    const v = item[key]?.toString().trim() || 'Unknown';
    map[v] = (map[v] || 0) + 1;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function groupByMonth(items) {
  const map = {};
  for (const p of items) {
    if (!p.createdAt) continue;
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([k, count]) => ({
      month: new Date(k + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      count,
    }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ color: C.sub, fontSize: 11, margin: '0 0 4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || C.text, fontWeight: 700, fontSize: 14, margin: 0 }}>{p.value}</p>
      ))}
    </div>
  );
};

function Card({ children, style }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{ fontSize: 12, fontWeight: 700, color: C.sub, margin: '0 0 18px', textTransform: 'uppercase', letterSpacing: 1 }}>
      {children}
    </h3>
  );
}

export default function AdminInventoryOverviewPage() {
  const { token } = useAdminAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/properties?limit=1000&withImages=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setProperties(data.items || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const now = Date.now();
  const live     = properties.filter(p => p.status === 'approved');
  const pending  = properties.filter(p => p.status === 'pending');
  const sold     = properties.filter(p => p.status === 'sold');
  const rejected = properties.filter(p => p.status === 'rejected');
  const unlisted = properties.filter(p => p.status === 'unlisted');

  const thisWeek  = properties.filter(p => p.createdAt && now - new Date(p.createdAt) < 7 * 86400000).length;
  const thisMonth = properties.filter(p => p.createdAt && now - new Date(p.createdAt) < 30 * 86400000).length;

  const liveValue  = live.reduce((s, p) => s + (p.totalPrice || 0), 0);
  const avgPrice   = live.length > 0 ? liveValue / live.length : 0;
  const soldValue  = sold.reduce((s, p) => s + (p.totalPrice || 0), 0);

  // Chart data
  const statusChartData = Object.entries(STATUS_META).map(([key, { label, color }]) => ({
    name: label, value: properties.filter(p => p.status === key).length, color,
  })).filter(d => d.value > 0);

  const typeData = countBy(properties, 'propertyType').slice(0, 8)
    .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }));

  const cityData = countBy(live, 'city').slice(0, 8)
    .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }));

  const bhkData = countBy(properties.filter(p => p.bhk), 'bhk').slice(0, 6)
    .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }));

  const monthlyData = groupByMonth(properties);

  const ownerTypeData = countBy(properties, 'ownerType').slice(0, 6)
    .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }));

  const recentListings = [...properties]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  const topSellers = (() => {
    const map = {};
    for (const p of properties) {
      const key = p.mobileNumber || p.name || 'Unknown';
      if (!map[key]) map[key] = { name: p.name || '—', phone: p.mobileNumber || '—', count: 0 };
      map[key].count++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  })();

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.sub, fontSize: 16 }}>Loading inventory…</p>
    </div>
  );

  return (
    <>
      <Helmet><title>Inventory Overview — Admin</title></Helmet>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>📦 Inventory Overview</h1>
              <p style={{ color: C.sub, marginTop: 6, fontSize: 14 }}>Complete picture of all property listings</p>
            </div>
            <button onClick={() => navigate('/admin/properties')}
              style={{ padding: '9px 18px', borderRadius: 8, background: C.blue, color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Manage Listings →
            </button>
          </div>

          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Total Listings',  value: properties.length, color: C.blue,    sub: `${thisWeek} this week` },
              { label: 'Live',            value: live.length,       color: '#1d9e75',  sub: `₹${fmt(avgPrice)} avg price` },
              { label: 'Pending Review',  value: pending.length,    color: '#f0a500',  sub: 'awaiting approval' },
              { label: 'Sold',            value: sold.length,       color: '#a48aff',  sub: fmt(soldValue) + ' total' },
              { label: 'Rejected',        value: rejected.length,   color: '#e06c6c',  sub: null },
              { label: 'Unlisted',        value: unlisted.length,   color: C.sub,      sub: null },
              { label: 'Added This Month',value: thisMonth,         color: C.yellow,   sub: `${thisWeek} this week` },
              { label: 'Live Value',      value: fmt(liveValue),    color: C.green,    sub: `${live.length} properties` },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
                <p style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: typeof s.value === 'string' ? 20 : 28, fontWeight: 800, color: s.color, margin: '4px 0 2px' }}>{s.value}</p>
                {s.sub && <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Status bar + Monthly trend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 20 }}>
            <Card>
              <SectionTitle>By Status</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusChartData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionTitle>Listings Added per Month (Last 12 Months)</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData}>
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" stroke={C.blue} strokeWidth={2.5} dot={{ fill: C.blue, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Property type + City breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <Card>
              <SectionTitle>By Property Type</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={typeData} layout="vertical" barSize={18}>
                  <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {typeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionTitle>Live Listings by City</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cityData} layout="vertical" barSize={18}>
                  <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {cityData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* BHK + Owner type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <Card>
              <SectionTitle>BHK Distribution</SectionTitle>
              {bhkData.length === 0 ? <p style={{ color: C.muted }}>No BHK data</p> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={bhkData} barSize={40}>
                    <XAxis dataKey="name" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {bhkData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
            <Card>
              <SectionTitle>By Owner Type</SectionTitle>
              {ownerTypeData.length === 0 ? <p style={{ color: C.muted }}>No data</p> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ownerTypeData} layout="vertical" barSize={20}>
                    <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {ownerTypeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Top sellers + Recent listings */}
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>

            {/* Top sellers */}
            <Card>
              <SectionTitle>Most Active Sellers</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topSellers.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < topSellers.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: C.muted, width: 24, textAlign: 'right' }}>#{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                      <a href={`tel:${s.phone}`} style={{ fontSize: 12, color: C.green, textDecoration: 'none' }}>{s.phone}</a>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.blue, background: 'rgba(24,95,165,0.15)', padding: '3px 10px', borderRadius: 20 }}>
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent listings */}
            <Card>
              <SectionTitle>Recently Added Listings</SectionTitle>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['Property', 'Location', 'Price', 'Seller', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: C.muted, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentListings.map((p, i) => {
                      const sm = STATUS_META[p.status] || STATUS_META.pending;
                      return (
                        <tr key={p._id || i} style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background .15s' }}
                          onClick={() => navigate(`/admin/properties/${p._id || p.id}`)}
                          onMouseEnter={e => e.currentTarget.style.background = C.hover}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                            {p.propertyType}{p.bhk ? ` · ${p.bhk}` : ''}
                          </td>
                          <td style={{ padding: '10px 12px', color: C.sub }}>
                            {[p.sector, p.city].filter(Boolean).join(', ') || '—'}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: C.green, whiteSpace: 'nowrap' }}>
                            {fmt(p.totalPrice)}
                          </td>
                          <td style={{ padding: '10px 12px', color: C.sub }}>{p.name || '—'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: sm.bg, color: sm.color }}>
                              {sm.label}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: C.muted, fontSize: 12, whiteSpace: 'nowrap' }}>
                            {fmtDate(p.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </>
  );
}
