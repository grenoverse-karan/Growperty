import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, AreaChart, Area,
} from 'recharts';

const C = {
  bg: '#0d1117', surface: '#0d1b2a', border: '#1e2d3d',
  text: '#e6edf3', muted: '#4d6175', sub: '#94aabf',
  hover: '#132236', green: '#1d9e75', blue: '#185fa5',
  yellow: '#ba7517', red: '#c0392b', purple: '#533ab7',
};

const SOURCE_COLOR = {
  'Google':    '#4285F4',
  'Facebook':  '#1877F2',
  'Instagram': '#E1306C',
  'YouTube':   '#FF0000',
  'WhatsApp':  '#25D366',
  'Twitter/X': '#1DA1F2',
  'LinkedIn':  '#0A66C2',
  'Direct':    '#94aabf',
  'Referral':  '#ba7517',
  'Quora':     '#B92B27',
  'Unknown':   '#4d6175',
};

const SOURCE_ICON = {
  'Google':    '🔍',
  'Facebook':  '📘',
  'Instagram': '📸',
  'YouTube':   '▶️',
  'WhatsApp':  '💬',
  'Twitter/X': '🐦',
  'LinkedIn':  '💼',
  'Direct':    '🔗',
  'Referral':  '↗️',
  'Quora':     '❓',
  'Unknown':   '❔',
};

const PALETTE = ['#185fa5','#1d9e75','#ba7517','#533ab7','#e74c3c','#4d9de0','#a48aff','#f0a500','#25D366','#4285F4'];

const fmt = (n) => typeof n === 'number' ? n.toLocaleString('en-IN') : n;
const pct  = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0;

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ color: C.sub, fontSize: 11, margin: '0 0 6px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || C.text, fontWeight: 700, fontSize: 13, margin: '2px 0' }}>
          {p.name}: {fmt(p.value)}
        </p>
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

function KpiCard({ label, value, sub, color, note }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
      <p style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: color || C.text, margin: '4px 0 2px' }}>{fmt(value)}</p>
      {sub  && <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{sub}</p>}
      {note && <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0', fontStyle: 'italic' }}>{note}</p>}
    </div>
  );
}

const PERIODS = [
  { label: '7 days',  days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

export default function AdminWebAnalyticsPage() {
  const { token } = useAdminAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiServerClient.fetch(`/analytics/stats?days=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, period]);

  useEffect(() => { load(); }, [load]);

  if (loading || !data) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.sub, fontSize: 16 }}>Loading analytics…</p>
    </div>
  );

  const { summary, dailyChart, dowChart, sourceBreakdown, topPages, listingViews, firstLanding, usersByRole, usersByProvider } = data;

  const totalVisitors  = dailyChart.reduce((s, d) => s + d.uniqueVisitors, 0);
  const totalSessions  = dailyChart.reduce((s, d) => s + d.sessions, 0);
  const totalPageViews = dailyChart.reduce((s, d) => s + d.pageViews, 0);
  const totalSignups   = dailyChart.reduce((s, d) => s + d.signups, 0);
  const avgPagesPerSession = totalSessions > 0 ? (totalPageViews / totalSessions).toFixed(1) : '—';
  const buyerCount     = usersByRole.find(r => r.role === 'buyer')?.count  || 0;
  const sellerCount    = usersByRole.find(r => r.role === 'seller')?.count || 0;
  const totalUsers     = usersByRole.reduce((s, r) => s + r.count, 0);

  // Chart data with formatted dates
  const chartData = dailyChart.map(d => ({ ...d, label: fmtDate(d.date) }));
  const dowChartData = dowChart;

  // Source pie-style breakdown (sorted)
  const sourceData = [...sourceBreakdown].sort((a, b) => b.count - a.count);
  const sourceTotal = sourceData.reduce((s, d) => s + d.count, 0);

  // Top pages cleaned
  const pagesData = topPages.map(p => ({
    page: p.pageName || p.page,
    views: p.views,
  }));

  // Listing views clean
  const listingData = listingViews.map(p => ({
    page: p.page.replace('/property/', 'ID: ').slice(0, 20),
    views: p.views,
  }));

  // New vs returning donut data
  const nvr = [
    { name: 'New',       value: summary.newVisitors,       color: C.blue },
    { name: 'Returning', value: summary.returningVisitors,  color: C.green },
  ];

  return (
    <>
      <Helmet><title>Website Analytics — Admin</title></Helmet>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>🌐 Website Analytics</h1>
              <p style={{ color: C.sub, marginTop: 6, fontSize: 14 }}>Real visitor data — sources, behavior, signups</p>
            </div>
            {/* Period selector */}
            <div style={{ display: 'flex', gap: 8 }}>
              {PERIODS.map(p => (
                <button key={p.days} onClick={() => setPeriod(p.days)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${period === p.days ? C.blue : C.border}`, background: period === p.days ? 'rgba(24,95,165,0.2)' : C.surface, color: period === p.days ? '#4d9de0' : C.sub, fontSize: 13, fontWeight: period === p.days ? 700 : 400, cursor: 'pointer' }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 28 }}>
            <KpiCard label="Unique Visitors"     value={totalVisitors}     color={C.blue}    sub={`last ${period} days`} />
            <KpiCard label="Total Sessions"      value={totalSessions}     color='#4d9de0'   sub={`${avgPagesPerSession} pages/session`} />
            <KpiCard label="Page Views"          value={totalPageViews}    color={C.green}   sub={`last ${period} days`} />
            <KpiCard label="Bounce Rate"         value={`${summary.bounceRate}%`} color={summary.bounceRate > 60 ? '#e74c3c' : '#1d9e75'} sub="left after 1 page" />
            <KpiCard label="New Visitors"        value={summary.newVisitors}     color='#a48aff'   sub={`${pct(summary.newVisitors, totalSessions)}% of sessions`} />
            <KpiCard label="Returning Visitors"  value={summary.returningVisitors} color={C.yellow} sub={`${pct(summary.returningVisitors, totalSessions)}% of sessions`} />
            <KpiCard label="Signups"             value={totalSignups}      color='#00e676'   sub={`last ${period} days`} />
            <KpiCard label="Total Users"         value={totalUsers}        color={C.purple}  sub={`${buyerCount}B · ${sellerCount}S`} />
          </div>

          {/* Main chart — visitors + page views over time */}
          <Card style={{ marginBottom: 20 }}>
            <SectionTitle>Daily Visitors & Page Views — Last {period} Days</SectionTitle>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 8)} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke={C.blue} fill="url(#gBlue)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="pageViews"      name="Page Views"      stroke={C.green} fill="url(#gGreen)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="signups"        name="Signups"         stroke="#a48aff" fill="none" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, marginTop: 10, justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: C.blue,    fontWeight: 600 }}>● Unique Visitors</span>
              <span style={{ fontSize: 12, color: C.green,   fontWeight: 600 }}>● Page Views</span>
              <span style={{ fontSize: 12, color: '#a48aff', fontWeight: 600 }}>- - Signups</span>
            </div>
          </Card>

          {/* Traffic source + Day of week */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Traffic sources */}
            <Card>
              <SectionTitle>Traffic Sources</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sourceData.length === 0 ? (
                  <p style={{ color: C.muted, fontSize: 13 }}>No data yet — tracking will populate as visitors arrive</p>
                ) : sourceData.map((s, i) => {
                  const barPct = pct(s.count, sourceTotal);
                  const color = SOURCE_COLOR[s.source] || PALETTE[i % PALETTE.length];
                  return (
                    <div key={s.source}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                          {SOURCE_ICON[s.source] || '🌐'} {s.source}
                        </span>
                        <span style={{ fontSize: 13, color: C.sub, fontWeight: 700 }}>
                          {fmt(s.count)} <span style={{ color: C.muted, fontWeight: 400 }}>({barPct}%)</span>
                        </span>
                      </div>
                      <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${barPct}%`, background: color, borderRadius: 3, transition: 'width .5s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Day of week */}
            <Card>
              <SectionTitle>Visitors by Day of Week</SectionTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dowChartData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fill: C.sub, fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sessions" name="Sessions" radius={[4, 4, 0, 0]}>
                    {dowChartData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* New vs returning + User accounts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* New vs returning */}
            <Card>
              <SectionTitle>New vs Returning Visitors</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                {nvr.map(v => (
                  <div key={v.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: v.color }}>{v.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: v.color }}>
                        {fmt(v.value)} <span style={{ color: C.muted, fontSize: 12, fontWeight: 400 }}>
                          ({pct(v.value, summary.newVisitors + summary.returningVisitors)}%)
                        </span>
                      </span>
                    </div>
                    <div style={{ height: 10, background: C.border, borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct(v.value, summary.newVisitors + summary.returningVisitors)}%`, background: v.color, borderRadius: 5 }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: '12px 16px', background: C.hover, borderRadius: 8 }}>
                  <p style={{ fontSize: 12, color: C.sub, margin: '0 0 4px' }}>Bounce Rate</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: summary.bounceRate > 60 ? '#e74c3c' : C.green, margin: 0 }}>{summary.bounceRate}%</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>visitors who left after 1 page</p>
                </div>
              </div>
            </Card>

            {/* Buyer vs seller */}
            <Card>
              <SectionTitle>Users by Role</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Buyers',  value: buyerCount,  color: C.blue,   icon: '🛒' },
                  { label: 'Sellers', value: sellerCount, color: C.green,  icon: '🏠' },
                ].map(r => (
                  <div key={r.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{r.icon} {r.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: r.color }}>
                        {fmt(r.value)} <span style={{ color: C.muted, fontWeight: 400, fontSize: 12 }}>({pct(r.value, totalUsers)}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 10, background: C.border, borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct(r.value, totalUsers)}%`, background: r.color, borderRadius: 5 }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: '12px 16px', background: C.hover, borderRadius: 8 }}>
                  <p style={{ fontSize: 12, color: C.sub, margin: '0 0 4px' }}>Total Registered Users</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: C.purple, margin: 0 }}>{fmt(totalUsers)}</p>
                </div>
                <div style={{ marginTop: 4 }}>
                  <p style={{ fontSize: 12, color: C.sub, margin: '0 0 8px' }}>By Sign-up Method</p>
                  {usersByProvider.map((p, i) => (
                    <div key={p.provider} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 13, color: C.sub, textTransform: 'capitalize' }}>{p.provider || 'Email'}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE[i] }}>{fmt(p.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* First landing pages for new visitors */}
            <Card>
              <SectionTitle>First Page — New Visitors</SectionTitle>
              {firstLanding.length === 0 ? (
                <p style={{ color: C.muted, fontSize: 13 }}>No data yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {firstLanding.map((p, i) => {
                    const barPct = pct(p.count, firstLanding[0].count);
                    return (
                      <div key={p.page}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 12, color: C.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}
                            title={p.page}>{p.page}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: PALETTE[i % PALETTE.length] }}>{fmt(p.count)}</span>
                        </div>
                        <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${barPct}%`, background: PALETTE[i % PALETTE.length], borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Top pages + Listing views */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <Card>
              <SectionTitle>Most Viewed Pages</SectionTitle>
              {pagesData.length === 0 ? (
                <p style={{ color: C.muted, fontSize: 13 }}>No page view data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={pagesData.slice(0, 10)} layout="vertical" barSize={16}>
                    <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="page" tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="views" name="Views" radius={[0, 4, 4, 0]}>
                      {pagesData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
            <Card>
              <SectionTitle>Property Listing Views</SectionTitle>
              {listingData.length === 0 ? (
                <p style={{ color: C.muted, fontSize: 13 }}>No listing views tracked yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={listingData} layout="vertical" barSize={16}>
                    <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="page" tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="views" name="Views" fill={C.green} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Daily signups bar */}
          <Card>
            <SectionTitle>Daily Signups — Last {period} Days</SectionTitle>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={period <= 7 ? 24 : period <= 30 ? 10 : 5}>
                <XAxis dataKey="label" tick={{ fill: C.sub, fontSize: 10 }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 8)} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="signups" name="Signups" fill="#a48aff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <p style={{ color: C.muted, fontSize: 11, marginTop: 16, textAlign: 'right' }}>
            Data collected from in-app tracking · Admin pages excluded · All times in IST
          </p>
        </div>
      </div>
    </>
  );
}
