import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const C = {
  bg: '#0d1117', surface: '#0d1b2a', border: '#1e2d3d',
  text: '#e6edf3', muted: '#4d6175', sub: '#94aabf',
  hover: '#132236', green: '#1d9e75', blue: '#185fa5',
  yellow: '#ba7517', red: '#c0392b', purple: '#533ab7',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PALETTE = ['#185fa5','#1d9e75','#ba7517','#533ab7','#e74c3c','#4d9de0','#a48aff'];

function last30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function groupByDay(items, dateKey = 'createdAt') {
  const map = {};
  for (const item of items) {
    const d = item[dateKey];
    if (!d) continue;
    const key = new Date(d).toISOString().slice(0, 10);
    map[key] = (map[key] || 0) + 1;
  }
  return last30Days().map(date => ({
    date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    count: map[date] || 0,
  }));
}

function groupByDow(items, dateKey = 'createdAt') {
  const map = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const item of items) {
    const d = item[dateKey];
    if (!d) continue;
    map[new Date(d).getDay()]++;
  }
  return DAYS.map((name, i) => ({ name, visits: map[i], reqs: 0 }));
}

function countBy(items, key) {
  const map = {};
  for (const item of items) {
    const v = item[key]?.trim() || 'Unknown';
    map[v] = (map[v] || 0) + 1;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ color: C.sub, fontSize: 11, margin: '0 0 4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || C.text, fontWeight: 700, fontSize: 14, margin: 0 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

function SectionCard({ title, children, span2 }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, gridColumn: span2 ? 'span 2' : undefined }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: C.sub, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function AdminTrafficPage() {
  const { token } = useAdminAuth();
  const [visits, setVisits]   = useState([]);
  const [reqs, setReqs]       = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Day-of-week with both visits and reqs
  const dowData = (() => {
    const vMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const rMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const v of visits) { if (v.createdAt) vMap[new Date(v.createdAt).getDay()]++; }
    for (const r of reqs)   { if (r.createdAt) rMap[new Date(r.createdAt).getDay()]++; }
    return DAYS.map((name, i) => ({ name, Visits: vMap[i], Requirements: rMap[i] }));
  })();

  // Last 30 days combined line chart
  const last30 = (() => {
    const vMap = {}; const rMap = {};
    for (const v of visits) { if (v.createdAt) { const k = new Date(v.createdAt).toISOString().slice(0,10); vMap[k] = (vMap[k]||0)+1; } }
    for (const r of reqs)   { if (r.createdAt) { const k = new Date(r.createdAt).toISOString().slice(0,10); rMap[k] = (rMap[k]||0)+1; } }
    return last30Days().map(date => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      Visits: vMap[date] || 0,
      Requirements: rMap[date] || 0,
    }));
  })();

  const topCitiesV = countBy(visits, 'visitorCity');
  const topCitiesR = countBy(reqs, 'city');

  // Combined city leads
  const combinedCities = (() => {
    const map = {};
    for (const { name, value } of topCitiesV) map[name] = (map[name] || 0) + value;
    for (const { name, value } of topCitiesR) map[name] = (map[name] || 0) + value;
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  })();

  // Recent 7 days summary
  const now = Date.now();
  const visitsLast7  = visits.filter(v => v.createdAt && (now - new Date(v.createdAt)) < 7*86400000).length;
  const reqsLast7    = reqs.filter(r => r.createdAt && (now - new Date(r.createdAt)) < 7*86400000).length;
  const visitsLast30 = visits.filter(v => v.createdAt && (now - new Date(v.createdAt)) < 30*86400000).length;
  const reqsLast30   = reqs.filter(r => r.createdAt && (now - new Date(r.createdAt)) < 30*86400000).length;

  const totalLeads = visits.length + reqs.length;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.sub }}>Loading…</p>
    </div>
  );

  return (
    <>
      <Helmet><title>Traffic — Admin</title></Helmet>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>📡 Traffic</h1>
            <p style={{ color: C.sub, marginTop: 6, fontSize: 14 }}>Lead volume trends — visits and requirements over time</p>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Total Leads',      value: totalLeads,    color: C.blue },
              { label: 'Visits (7d)',       value: visitsLast7,   color: C.green },
              { label: 'Reqs (7d)',         value: reqsLast7,     color: C.purple },
              { label: 'Visits (30d)',      value: visitsLast30,  color: '#4d9de0' },
              { label: 'Reqs (30d)',        value: reqsLast30,    color: '#a48aff' },
              { label: 'Total Visits',      value: visits.length, color: C.yellow },
              { label: 'Total Requirements',value: reqs.length,   color: '#e74c3c' },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
                <p style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: s.color, margin: '4px 0 0' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Last 30 days combined line */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.sub, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 1 }}>
              Leads per Day — Last 30 Days
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={last30}>
                <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: C.sub, fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Visits" stroke={C.blue} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Requirements" stroke={C.purple} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
              <span style={{ fontSize: 12, color: C.blue, fontWeight: 600 }}>● Visits</span>
              <span style={{ fontSize: 12, color: C.purple, fontWeight: 600 }}>● Requirements</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Day of week */}
            <SectionCard title="By Day of Week">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dowData} barSize={16} barGap={4}>
                  <XAxis dataKey="name" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Visits" fill={C.blue} radius={[3,3,0,0]} />
                  <Bar dataKey="Requirements" fill={C.purple} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: C.blue, fontWeight: 600 }}>● Visits</span>
                <span style={{ fontSize: 12, color: C.purple, fontWeight: 600 }}>● Requirements</span>
              </div>
            </SectionCard>

            {/* Top cities combined */}
            <SectionCard title="Top Cities (All Leads)">
              {combinedCities.length === 0 ? <p style={{ color: C.muted }}>No data</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={combinedCities} layout="vertical" barSize={18}>
                    <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0,4,4,0]}>
                      {combinedCities.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          </div>

          {/* Visits per day bar + Reqs per day bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <SectionCard title="Visit Bookings — Last 30 Days">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={groupByDay(visits)} barSize={8}>
                  <XAxis dataKey="date" tick={{ fill: C.sub, fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={C.blue} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
            <SectionCard title="Requirements — Last 30 Days">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={groupByDay(reqs)} barSize={8}>
                  <XAxis dataKey="date" tick={{ fill: C.sub, fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={C.purple} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

        </div>
      </div>
    </>
  );
}
