import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
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
  yellow: '#ba7517', red: '#c0392b', purple: '#533ab7',
};

const STATUS_COLOR = {
  approved: '#1d9e75', pending: '#f0a500', rejected: '#e74c3c',
  unlisted: '#94aabf', sold: '#a48aff', suspended: '#e06c6c',
};

const PALETTE = ['#185fa5','#1d9e75','#ba7517','#533ab7','#e74c3c','#4d9de0','#a48aff','#f0a500'];

const fmt = (n) => {
  if (!n) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${Number(n).toLocaleString('en-IN')}`;
};

function groupByMonth(items, dateKey = 'createdAt') {
  const map = {};
  for (const item of items) {
    const d = item[dateKey];
    if (!d) continue;
    const dt = new Date(d);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      count,
    }));
}

function countBy(items, key) {
  const map = {};
  for (const item of items) {
    const v = item[key] || 'Unknown';
    map[v] = (map[v] || 0) + 1;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: C.sub, margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h3>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ color: C.sub, fontSize: 12, margin: '0 0 4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || C.text, fontWeight: 700, fontSize: 14, margin: 0 }}>{p.value}</p>
      ))}
    </div>
  );
};

export default function AdminAnalyticsPage() {
  const { token } = useAdminAuth();
  const [properties, setProperties] = useState([]);
  const [visits, setVisits]         = useState([]);
  const [loading, setLoading]       = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [pRes, vRes] = await Promise.all([
        apiServerClient.fetch('/properties?limit=500', { headers }),
        apiServerClient.fetch('/visit-requests?limit=500', { headers }),
      ]);
      const [pData, vData] = await Promise.all([pRes.json(), vRes.json()]);
      if (!pRes.ok) throw new Error(pData.error || 'Properties failed');
      if (!vRes.ok) throw new Error(vData.error || 'Visits failed');
      setProperties(pData.items || []);
      setVisits(vData.items || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const approved  = properties.filter(p => p.status === 'approved').length;
  const pending   = properties.filter(p => p.status === 'pending').length;
  const sold      = properties.filter(p => p.status === 'sold').length;
  const totalVal  = properties.filter(p => p.status === 'approved').reduce((s, p) => s + (p.totalPrice || 0), 0);
  const avgPrice  = approved > 0 ? totalVal / approved : 0;
  const dealClosed = visits.filter(v => v.status === 'deal_closed').length;

  const statusData    = countBy(properties, 'status').map(d => ({ ...d, color: STATUS_COLOR[d.name] || C.muted }));
  const typeData      = countBy(properties, 'propertyType').slice(0, 8);
  const cityData      = countBy(properties, 'city').slice(0, 8);
  const bhkData       = countBy(properties.filter(p => p.bhk), 'bhk').slice(0, 6);
  const listingsMonth = groupByMonth(properties);
  const visitsMonth   = groupByMonth(visits);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.sub }}>Loading…</p>
    </div>
  );

  return (
    <>
      <Helmet><title>Analytics — Admin</title></Helmet>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>📊 Analytics</h1>
            <p style={{ color: C.sub, marginTop: 6, fontSize: 14 }}>Property listings and visit performance at a glance</p>
          </div>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Total Listings',  value: properties.length, color: C.blue },
              { label: 'Live',            value: approved,          color: C.green },
              { label: 'Pending Review',  value: pending,           color: '#f0a500' },
              { label: 'Sold',            value: sold,              color: '#a48aff' },
              { label: 'Total Visits',    value: visits.length,     color: '#4d9de0' },
              { label: 'Deals Closed',    value: dealClosed,        color: '#00e676' },
              { label: 'Avg Live Price',  value: fmt(avgPrice),     color: C.yellow },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
                <p style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: s.color, margin: '4px 0 0' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Listings over time + Visits over time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <SectionCard title="Listings per Month">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={listingsMonth}>
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" stroke={C.blue} strokeWidth={2} dot={{ fill: C.blue, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>
            <SectionCard title="Visits per Month">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={visitsMonth}>
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" stroke={C.green} strokeWidth={2} dot={{ fill: C.green, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          {/* Status distribution + Property type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <SectionCard title="Listings by Status">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData} barSize={36}>
                  <XAxis dataKey="name" tick={{ fill: C.sub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
            <SectionCard title="Listings by Property Type">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={typeData} layout="vertical" barSize={18}>
                  <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0,4,4,0]}>
                    {typeData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          {/* City + BHK breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <SectionCard title="Listings by City">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cityData} layout="vertical" barSize={18}>
                  <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={C.purple} radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
            <SectionCard title="BHK Distribution (Flats)">
              {bhkData.length === 0 ? <p style={{ color: C.muted }}>No BHK data</p> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={bhkData} barSize={40}>
                    <XAxis dataKey="name" tick={{ fill: C.sub, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {bhkData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          </div>

        </div>
      </div>
    </>
  );
}
