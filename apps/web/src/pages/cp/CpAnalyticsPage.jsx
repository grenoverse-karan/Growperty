import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { formatIndianPrice } from '@/hooks/useProperties.js';

// Page chrome follows the other CP pages; chart colors come from the
// validated data-viz palette (categorical slots 1-2 + the blue ordinal ramp).
const C = {
  bg: '#f5f6f8', surface: '#ffffff', border: '#e5e7eb', hairline: '#eceef1',
  text: '#111827', sub: '#52514e', muted: '#8a8f98', greenDark: '#059669',
  up: '#0f7b3f', down: '#c0392b',
};
const SERIES = { visitors: '#2a78d6', leads: '#eb6834', requirements: '#1baf7a' };
const FUNNEL_RAMP = ['#86b6ef', '#3987e5', '#1c5cab', '#104281'];
const BAR_BLUE = '#2a78d6';

const RANGES = [{ days: 7, label: '7 days' }, { days: 30, label: '30 days' }, { days: 90, label: '90 days' }];

const VISIT_STATUS_LABEL = {
  pending: 'Pending', confirmed: 'Confirmed', visit_done: 'Visit done',
  rescheduled: 'Rescheduled', deal_closed: 'Deal closed', cancelled: 'Cancelled',
};
const LISTING_ROWS = [
  { key: 'live', label: 'Live' }, { key: 'pending', label: 'Pending review' }, { key: 'unlisted', label: 'Unlisted' },
  { key: 'sold', label: 'Sold' }, { key: 'rejected', label: 'Rejected' }, { key: 'suspended', label: 'Suspended' },
];

const fmtNum = (n) => Number(n || 0).toLocaleString('en-IN');
const fmtDay = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const timeAgo = (d) => {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
};

const card = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const cardTitle = { margin: 0, fontSize: 15, fontWeight: 700, color: C.text };
const cardSub = { margin: '3px 0 0', fontSize: 12, color: C.muted };

function Delta({ cur, prev, days }) {
  if (!prev && !cur) return <span style={{ fontSize: 12, color: C.muted }}>No activity yet</span>;
  if (!prev) return <span style={{ fontSize: 12, color: C.up, fontWeight: 600 }}>▲ New this period</span>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return <span style={{ fontSize: 12, color: C.muted }}>No change vs previous {days} days</span>;
  const good = pct > 0;
  return (
    <span style={{ fontSize: 12, color: good ? C.up : C.down, fontWeight: 600 }}>
      {good ? '▲' : '▼'} {Math.abs(pct)}% <span style={{ color: C.muted, fontWeight: 400 }}>vs previous {days} days</span>
    </span>
  );
}

// 12-point sparkline: de-emphasis gray line, current (last) point in the accent
function Sparkline({ values, color }) {
  const W = 84, H = 26, pad = 3;
  const chunk = Math.max(1, Math.ceil(values.length / 12));
  const pts = [];
  for (let i = 0; i < values.length; i += chunk) pts.push(values.slice(i, i + chunk).reduce((a, b) => a + b, 0));
  const max = Math.max(...pts, 1);
  const xy = pts.map((v, i) => [pad + (i * (W - 2 * pad)) / Math.max(pts.length - 1, 1), H - pad - (v / max) * (H - 2 * pad)]);
  const last = xy[xy.length - 1];
  return (
    <svg width={W} height={H} aria-hidden="true" style={{ display: 'block' }}>
      <polyline points={xy.map(p => p.join(',')).join(' ')} fill="none" stroke="#c4c8cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {last && <circle cx={last[0]} cy={last[1]} r="4" fill={color} stroke="#fff" strokeWidth="2" />}
    </svg>
  );
}

function StatTile({ label, value, sub, spark, color, children }) {
  return (
    <div style={{ ...card, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <div style={{ fontSize: 12.5, color: C.sub, fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>{value}</div>
        {spark && <Sparkline values={spark} color={color} />}
      </div>
      <div style={{ minHeight: 18 }}>{children || (sub && <span style={{ fontSize: 12, color: C.muted }}>{sub}</span>)}</div>
    </div>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', boxShadow: '0 6px 18px rgba(0,0,0,0.12)', fontSize: 12.5 }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>{fmtDay(label)}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.sub, marginTop: 3 }}>
          <span style={{ width: 14, height: 2, background: p.color, borderRadius: 2, display: 'inline-block' }} />
          <span style={{ minWidth: 70 }}>{p.name}</span>
          <b style={{ color: C.text }}>{p.value}</b>
        </div>
      ))}
    </div>
  );
}

const Empty = ({ children }) => (
  <div style={{ padding: '22px 0', textAlign: 'center', color: C.muted, fontSize: 13 }}>{children}</div>
);

export default function CpAnalyticsPage() {
  const { currentCp, token } = useCpAuth();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tableView, setTableView] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await apiServerClient.fetch(`/cp/analytics?days=${days}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load analytics');
      setData(json);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [days, token]);

  useEffect(() => { if (token) load(); }, [load, token]);

  const series = data?.series || [];
  const spark = useMemo(() => ({
    visitors: series.map(s => s.visitors),
    leads: series.map(s => s.leads),
    requirements: series.map(s => s.requirements),
  }), [series]);

  const firstName = (currentCp?.name || '').trim().split(' ')[0] || 'Partner';
  const hasAnyActivity = data && (data.visitors.total + data.leads.total + data.requirements.total > 0);
  const chartIsEmpty = series.every(s => s.visitors === 0 && s.leads === 0);

  return (
    <>
      <Helmet><title>Dashboard — CP Dashboard</title></Helmet>

      <style>{`
        .cpa-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-bottom: 18px; }
        .cpa-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 18px; margin-bottom: 18px; }
        .cpa-wide { grid-column: 1 / -1; }
        .cpa-skel { background: linear-gradient(90deg, #eef0f3 25%, #f6f7f9 50%, #eef0f3 75%); background-size: 200% 100%; animation: cpa-shimmer 1.2s infinite; border-radius: 12px; }
        @keyframes cpa-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .cpa-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .cpa-table th { text-align: left; color: ${C.muted}; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; padding: 8px 8px 8px 0; border-bottom: 1px solid ${C.hairline}; }
        .cpa-table td { padding: 10px 8px 10px 0; border-bottom: 1px solid ${C.hairline}; color: ${C.text}; }
        .cpa-table th.num, .cpa-table td.num { text-align: right; padding-right: 0; padding-left: 14px; white-space: nowrap; font-variant-numeric: tabular-nums; }
        @media (max-width: 640px) { .cpa-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>Welcome back, {firstName}</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>Here's how your referrals, leads and listings are doing.</p>
        </div>
        <div role="group" aria-label="Date range" style={{ display: 'flex', gap: 6, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
          {RANGES.map(r => (
            <button key={r.days} type="button" aria-pressed={days === r.days} onClick={() => setDays(r.days)} style={{
              border: 'none', cursor: 'pointer', borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: days === r.days ? 700 : 500,
              background: days === r.days ? '#d1fae5' : 'transparent', color: days === r.days ? C.greenDark : C.sub,
            }}>{r.label}</button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ ...card, borderColor: '#fca5a5', background: '#fef2f2', color: '#b91c1c', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span>{error}</span>
          <button type="button" onClick={load} style={{ border: '1px solid #fca5a5', background: '#fff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', color: '#b91c1c', fontWeight: 600 }}>Retry</button>
        </div>
      )}

      {loading && !data ? (
        <>
          <div className="cpa-kpis">{[0, 1, 2, 3, 4].map(i => <div key={i} className="cpa-skel" style={{ height: 112 }} />)}</div>
          <div className="cpa-skel" style={{ height: 340, marginBottom: 18 }} />
          <div className="cpa-grid"><div className="cpa-skel" style={{ height: 260 }} /><div className="cpa-skel" style={{ height: 260 }} /></div>
        </>
      ) : data && (
        <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity .15s' }}>

          {!hasAnyActivity && (
            <div style={{ ...card, marginBottom: 18, background: '#f0fdf4', borderColor: '#bbf7d0', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>No visitors or leads yet — let's get them flowing</div>
                <div style={{ fontSize: 13, color: C.sub, marginTop: 3 }}>Share your referral link or add a property. Visitors, leads and requirements will start showing up here as they happen.</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/cp/dashboard/profile" style={{ background: C.greenDark, color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600 }}>Get my referral link</Link>
                <Link to="/cp/dashboard/add" style={{ background: '#fff', color: C.greenDark, border: '1px solid #86efac', textDecoration: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600 }}>Add property</Link>
              </div>
            </div>
          )}

          {/* KPI row */}
          <div className="cpa-kpis">
            <StatTile label="Referred visitors" value={fmtNum(data.visitors.period)} spark={spark.visitors} color={SERIES.visitors}>
              <Delta cur={data.visitors.period} prev={data.visitors.prev} days={days} />
            </StatTile>
            <StatTile label="Leads (visit requests)" value={fmtNum(data.leads.period)} spark={spark.leads} color={SERIES.leads}>
              <Delta cur={data.leads.period} prev={data.leads.prev} days={days} />
            </StatTile>
            <StatTile label="Buyer requirements" value={fmtNum(data.requirements.period)} spark={spark.requirements} color={SERIES.requirements}>
              <Delta cur={data.requirements.period} prev={data.requirements.prev} days={days} />
            </StatTile>
            <StatTile label="Deals closed" value={fmtNum(data.funnel.dealsClosed)} sub={`from visitors in the last ${days} days`} />
            <StatTile label="Live listings" value={fmtNum(data.listings.live)} sub={`of ${fmtNum(data.listings.total)} total`} />
          </div>

          {/* Trend chart */}
          <div style={{ ...card, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div>
                <h2 style={cardTitle}>Visitors &amp; leads over time</h2>
                <p style={cardSub}>Daily, last {days} days</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                {[['Referred visitors', SERIES.visitors], ['Leads', SERIES.leads]].map(([label, color]) => (
                  <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: C.sub }}>
                    <span style={{ width: 16, height: 2, background: color, borderRadius: 2, display: 'inline-block' }} />{label}
                  </span>
                ))}
                <button type="button" onClick={() => setTableView(v => !v)} style={{ border: `1px solid ${C.border}`, background: '#fff', borderRadius: 8, padding: '5px 12px', fontSize: 12, color: C.sub, cursor: 'pointer' }}>
                  {tableView ? 'Show chart' : 'View as table'}
                </button>
              </div>
            </div>

            {tableView ? (
              <div style={{ maxHeight: 320, overflow: 'auto' }}>
                <table className="cpa-table">
                  <thead><tr><th>Date</th><th className="num">Visitors</th><th className="num">Leads</th><th className="num">Requirements</th></tr></thead>
                  <tbody>{series.map(s => (
                    <tr key={s.date}><td>{fmtDay(s.date)}</td><td className="num">{s.visitors}</td><td className="num">{s.leads}</td><td className="num">{s.requirements}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            ) : (
              <div style={{ width: '100%', height: 280, position: 'relative' }} role="img" aria-label={`Line chart of daily referred visitors and leads over the last ${days} days`}>
                <ResponsiveContainer>
                  <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                    <CartesianGrid stroke={C.hairline} vertical={false} />
                    <XAxis dataKey="date" tickFormatter={fmtDay} tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={{ stroke: C.border }} interval="preserveStartEnd" minTickGap={28} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} tickLine={false} axisLine={false} />
                    <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#c4c8cf', strokeWidth: 1 }} />
                    <Line type="monotone" dataKey="visitors" name="Referred visitors" stroke={SERIES.visitors} strokeWidth={2} dot={false} strokeLinecap="round" strokeLinejoin="round"
                      activeDot={{ r: 5, fill: SERIES.visitors, stroke: '#fff', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="leads" name="Leads" stroke={SERIES.leads} strokeWidth={2} dot={false} strokeLinecap="round" strokeLinejoin="round"
                      activeDot={{ r: 5, fill: SERIES.leads, stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
                {chartIsEmpty && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${C.border}`, borderRadius: 999, padding: '6px 14px', fontSize: 12.5, color: C.muted }}>No visitors or leads in this period yet</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="cpa-grid">
            {/* Funnel */}
            <div style={card}>
              <h2 style={cardTitle}>Referral funnel</h2>
              <p style={cardSub}>Visitors who first arrived through your link in the last {days} days</p>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['Visited your link', data.funnel.visitors],
                  ['Made an enquiry', data.funnel.inquiries],
                  ['Visit scheduled', data.funnel.visitsScheduled],
                  ['Deal closed', data.funnel.dealsClosed],
                ].map(([label, value], i, arr) => {
                  const top = arr[0][1];
                  const pctOfTop = top ? (value / top) * 100 : 0;
                  const prevVal = i ? arr[i - 1][1] : null;
                  return (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: C.sub, marginBottom: 5 }}>
                        <span>{label}</span>
                        <span>{i > 0 && prevVal ? `${Math.round((value / prevVal) * 100)}% of previous` : ''}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 22, position: 'relative' }}>
                          <div style={{ width: `${value ? Math.max(pctOfTop, 3) : 0}%`, height: '100%', background: FUNNEL_RAMP[i], borderRadius: '0 4px 4px 0', transition: 'width .3s' }} />
                        </div>
                        <b style={{ minWidth: 34, textAlign: 'right', color: C.text, fontSize: 14 }}>{fmtNum(value)}</b>
                      </div>
                    </div>
                  );
                })}
              </div>
              {data.visitors.returning > 0 && (
                <p style={{ margin: '16px 0 0', fontSize: 12, color: C.muted }}>{fmtNum(data.visitors.returning)} of your {fmtNum(data.visitors.total)} referred visitors came back more than once.</p>
              )}
            </div>

            {/* Listings + visit requests */}
            <div style={card}>
              <h2 style={cardTitle}>Your listings</h2>
              <p style={cardSub}>{fmtNum(data.listings.total)} total</p>
              {data.listings.total === 0 ? (
                <Empty>No listings yet. <Link to="/cp/dashboard/add" style={{ color: C.greenDark, fontWeight: 600 }}>Add your first property</Link></Empty>
              ) : (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {LISTING_ROWS.filter(r => data.listings[r.key] > 0).map(r => (
                    <div key={r.key} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 28px', alignItems: 'center', gap: 10, fontSize: 13 }}>
                      <span style={{ color: C.sub }}>{r.label}</span>
                      <div style={{ height: 10 }}><div style={{ width: `${(data.listings[r.key] / data.listings.total) * 100}%`, minWidth: 6, height: '100%', background: BAR_BLUE, borderRadius: '0 4px 4px 0' }} /></div>
                      <b style={{ textAlign: 'right', color: C.text }}>{data.listings[r.key]}</b>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ borderTop: `1px solid ${C.hairline}`, marginTop: 18, paddingTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Visit requests <span style={{ color: C.muted, fontWeight: 400 }}>· {fmtNum(data.leads.total)} all time</span></div>
                {Object.keys(data.visitStatus).length === 0 ? (
                  <span style={{ fontSize: 12.5, color: C.muted }}>None yet</span>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(data.visitStatus).map(([k, v]) => (
                      <span key={k} style={{ background: '#f3f4f6', borderRadius: 999, padding: '4px 12px', fontSize: 12.5, color: C.sub }}>
                        {VISIT_STATUS_LABEL[k] || k} <b style={{ color: C.text }}>{v}</b>
                      </span>
                    ))}
                  </div>
                )}
                {data.leads.total > 0 && (
                  <p style={{ margin: '10px 0 0', fontSize: 12, color: C.muted }}>{fmtNum(data.leads.onListings)} on your listings · {fmtNum(data.leads.viaReferral)} via your referral link</p>
                )}
              </div>
            </div>

            {/* Top listings */}
            <div style={card}>
              <h2 style={cardTitle}>Top listings</h2>
              <p style={cardSub}>Ranked by leads in the last {days} days, then views from your referred visitors</p>
              {data.topListings.length === 0 ? (
                <Empty>Your listings will be ranked here.</Empty>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                <table className="cpa-table" style={{ marginTop: 8 }}>
                  <thead><tr><th>Property</th><th className="num">Price</th><th className="num">Leads</th><th className="num">Views</th></tr></thead>
                  <tbody>{data.topListings.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.label}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{t.location}</div>
                      </td>
                      <td className="num">{t.price ? formatIndianPrice(t.price) : '—'}</td>
                      <td className="num"><b>{t.leads}</b></td>
                      <td className="num">{t.views}</td>
                    </tr>
                  ))}</tbody>
                </table>
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 style={cardTitle}>Recent activity</h2>
                <Link to="/cp/dashboard/activities" style={{ fontSize: 12.5, color: C.greenDark, fontWeight: 600, textDecoration: 'none' }}>View all</Link>
              </div>
              {data.recentActivity.length === 0 ? (
                <Empty>Activity from your listings and referred visitors shows up here.</Empty>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column' }}>
                  {data.recentActivity.map((a, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: i < data.recentActivity.length - 1 ? `1px solid ${C.hairline}` : 'none', fontSize: 13, color: C.text }}>
                      <span>{a.message}</span>
                      <span style={{ color: C.muted, fontSize: 12, whiteSpace: 'nowrap' }}>{timeAgo(a.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/cp/dashboard/add" style={{ background: C.greenDark, color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600 }}>+ Add property</Link>
            <Link to="/cp/dashboard/requirements" style={{ background: '#fff', color: C.sub, border: `1px solid ${C.border}`, textDecoration: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600 }}>Post a requirement</Link>
            <Link to="/cp/dashboard/profile" style={{ background: '#fff', color: C.sub, border: `1px solid ${C.border}`, textDecoration: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600 }}>Share referral link</Link>
          </div>
        </div>
      )}
    </>
  );
}
