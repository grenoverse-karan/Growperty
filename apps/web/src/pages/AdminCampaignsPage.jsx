import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';

const C = {
  bg: '#0d1117', card: '#0d1b2a', border: '#1e2d3d',
  text: '#e6edf3', sub: '#94aabf', muted: '#4d6175',
  green: '#1d9e75', blue: '#185fa5', red: '#a32d2d', yellow: '#ba7517',
};

const API = 'https://growperty-api.vercel.app/api';

const TEMPLATES = [
  { id: 'camp_property_alert', label: 'Property Alert Campaign', desc: 'Growperty ka introductory message — QR "Consent" button ke saath', preview: '🏡 Namaste! Growperty.com — Greater Noida ka Apna Property Buy & Sell Platform...' },
];

const Stat = ({ label, value, color, sub }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${color}`, borderRadius: 12, padding: '18px 22px', flex: 1, minWidth: 140 }}>
    <p style={{ fontSize: 12, color: C.sub, margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</p>
    <p style={{ fontSize: 30, fontWeight: 800, color, margin: '6px 0 2px' }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{sub}</p>}
  </div>
);

export default function AdminCampaignsPage() {
  const { token } = useAdminAuth();
  const [tab, setTab] = useState('send');
  // Send tab state
  const [selectedTemplate, setSelectedTemplate] = useState('camp_property_alert');
  const [phoneInput, setPhoneInput] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);
  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const phones = phoneInput.split(/[\n,]+/).map(p => p.replace(/\D/g, '').trim()).filter(p => p.length === 10 || (p.length === 12 && p.startsWith('91')));

  const fetchAnalytics = useCallback(async (s = search, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 50 });
      if (s) params.set('search', s);
      const res = await fetch(`${API}/campaigns/analytics?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      setAnalytics(await res.json());
    } catch { toast.error('Analytics load nahi ho payi'); }
    finally { setLoading(false); }
  }, [token, search, page]);

  useEffect(() => { if (tab === 'analytics') fetchAnalytics(); }, [tab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
    fetchAnalytics(searchInput, 1);
  };

  const handleSend = async () => {
    if (!phones.length) return toast.error('Koi valid phone number nahi mila.');
    if (!window.confirm(`${phones.length} number(s) par "${selectedTemplate}" bhejoge?`)) return;
    setSending(true);
    setResults([]);
    const out = [];
    for (const phone of phones) {
      const r = await fetch(`${API}/campaigns/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone, templateName: selectedTemplate }),
      }).then(r => r.json()).catch(e => ({ success: false, error: e.message }));
      out.push({ phone, success: r.success, error: r.error });
    }
    setResults(out);
    const ok = out.filter(r => r.success).length;
    toast.success(`${ok} / ${phones.length} messages sent.`);
    setSending(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <Helmet><title>Campaigns — Admin — Growperty</title></Helmet>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>📣 Campaigns</h1>
          <p style={{ color: C.sub, marginTop: 6, fontSize: 14 }}>WhatsApp campaign bhejo aur analytics dekho</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${C.border}`, marginBottom: 28 }}>
          {[['send', '📤 Send Campaign'], ['analytics', '📊 Analytics']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); if (key === 'analytics') fetchAnalytics(); }} style={{
              background: 'none', border: 'none', color: tab === key ? C.green : C.sub,
              fontWeight: tab === key ? 700 : 500, fontSize: 15, cursor: 'pointer',
              paddingBottom: 12, borderBottom: tab === key ? `2px solid ${C.green}` : '2px solid transparent',
            }}>{label}</button>
          ))}
        </div>

        {/* ── SEND TAB ── */}
        {tab === 'send' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontWeight: 700, marginBottom: 14, fontSize: 13, color: C.sub, textTransform: 'uppercase', letterSpacing: 1 }}>1. Template Select Karo</p>
              {TEMPLATES.map(t => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer', padding: 16, borderRadius: 10, border: `2px solid ${selectedTemplate === t.id ? C.green : C.border}`, background: selectedTemplate === t.id ? 'rgba(29,158,117,0.08)' : 'transparent' }}>
                  <input type="radio" name="template" value={t.id} checked={selectedTemplate === t.id} onChange={() => setSelectedTemplate(t.id)} style={{ marginTop: 3, accentColor: C.green }} />
                  <div>
                    <p style={{ fontWeight: 700, margin: 0 }}>{t.label}</p>
                    <p style={{ fontSize: 12, color: C.sub, margin: '4px 0 0' }}>{t.desc}</p>
                    <p style={{ fontSize: 11, color: C.muted, margin: '6px 0 0', fontStyle: 'italic' }}>"{t.preview}"</p>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 13, color: C.sub, textTransform: 'uppercase', letterSpacing: 1 }}>2. Phone Numbers (comma ya newline se separate karo)</p>
              <textarea value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder={'9891117876\n9958480068\n9876543210'} rows={8}
                style={{ width: '100%', background: '#0d1117', color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', fontSize: 14, resize: 'vertical', fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} />
              {phones.length > 0 && <p style={{ color: C.green, fontSize: 13, marginTop: 8, fontWeight: 600 }}>✅ {phones.length} valid number{phones.length > 1 ? 's' : ''} detected</p>}
            </div>

            <button onClick={handleSend} disabled={sending || !phones.length} style={{ background: sending ? C.muted : C.green, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontWeight: 700, fontSize: 16, cursor: sending ? 'not-allowed' : 'pointer', width: '100%' }}>
              {sending ? '⏳ Bhej rahe hain...' : `📤 Send to ${phones.length || '—'} Number${phones.length === 1 ? '' : 's'}`}
            </button>

            {results.length > 0 && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <p style={{ fontWeight: 700, marginBottom: 14 }}>Results — {results.filter(r => r.success).length} sent, {results.filter(r => !r.success).length} failed</p>
                {results.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < results.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{r.phone}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: r.success ? C.green : C.red }}>{r.success ? '✅ Sent' : `❌ ${r.error || 'Failed'}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {loading && !analytics ? (
              <p style={{ color: C.sub, textAlign: 'center', padding: 60 }}>Loading analytics...</p>
            ) : analytics && (
              <>
                {/* Summary */}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <Stat label="Total Sent" value={analytics.summary.sent} color={C.green} sub={`${analytics.summary.total} total attempts`} />
                  <Stat label="Delivered" value={analytics.summary.delivered} color={C.blue} sub={`${analytics.summary.deliveryRate}% delivery rate`} />
                  <Stat label="Read" value={analytics.summary.read} color={C.yellow} sub={`${analytics.summary.readRate}% read rate`} />
                  <Stat label="Consent Replies" value={analytics.summary.replied} color="#533ab7" sub={`${analytics.summary.replyRate}% reply rate`} />
                  <Stat label="Failed" value={analytics.summary.failed} color={C.red} sub="Delivery failed" />
                </div>

                {/* Daily stats */}
                {analytics.dailyStats?.length > 0 && (
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                    <p style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📅 Date-wise Record</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {analytics.dailyStats.map(d => {
                        const pct = d.sent ? Math.round((d.replied / d.sent) * 100) : 0;
                        return (
                          <div key={d._id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 180px', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 13, color: C.sub }}>{d._id}</span>
                            <div style={{ background: C.border, borderRadius: 4, height: 8, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, (d.sent / Math.max(...analytics.dailyStats.map(x => x.sent), 1)) * 100)}%`, background: C.green, height: '100%' }} />
                            </div>
                            <span style={{ fontSize: 13, color: C.text, textAlign: 'right' }}>
                              <span style={{ color: C.green }}>✉ {d.sent}</span>
                              {d.replied > 0 && <span style={{ color: C.blue, marginLeft: 10 }}>💬 {d.replied} ({pct}%)</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* By Template */}
                {analytics.byTemplate?.length > 0 && (
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                    <p style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📋 By Template</p>
                    {analytics.byTemplate.map(t => (
                      <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, color: C.sub }}>{t._id}</span>
                        <div style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 700 }}>
                          <span style={{ color: C.green }}>✅ {t.sent}</span>
                          <span style={{ color: C.blue }}>💬 {t.replied}</span>
                          {t.failed > 0 && <span style={{ color: C.red }}>❌ {t.failed}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recipients with search */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>
                      📱 All Recipients ({analytics.recipientTotal})
                    </p>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
                      <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search phone number..."
                        style={{ background: '#0d1117', color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, width: 200, outline: 'none' }} />
                      <button type="submit" style={{ background: C.blue, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Search</button>
                      {search && <button type="button" onClick={() => { setSearchInput(''); setSearch(''); fetchAnalytics('', 1); }} style={{ background: C.muted, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13 }}>Clear</button>}
                    </form>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ color: C.sub }}>
                          {['#', 'Phone', 'Template', 'Sent', 'Delivered', 'Read', 'Consent', 'Date & Time'].map(h => (
                            <th key={h} style={{ padding: '8px 12px', fontWeight: 600, borderBottom: `1px solid ${C.border}`, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recipients?.length === 0 ? (
                          <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: C.muted }}>No records found</td></tr>
                        ) : analytics.recipients?.map((r, i) => (
                          <tr key={r._id} style={{ borderBottom: `1px solid ${C.border}` }}>
                            <td style={{ padding: '9px 12px', color: C.muted }}>{((page - 1) * 50) + i + 1}</td>
                            <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: C.text }}>{r.phone}</td>
                            <td style={{ padding: '9px 12px', color: C.sub, fontSize: 12 }}>{r.templateName}</td>
                            <td style={{ padding: '9px 12px', color: r.status === 'sent' ? C.green : C.red }}>✅</td>
                            <td style={{ padding: '9px 12px', color: r.delivered ? C.blue : C.muted }}>{r.delivered ? '📬' : '—'}</td>
                            <td style={{ padding: '9px 12px', color: r.read ? C.yellow : C.muted }}>{r.read ? '👁' : '—'}</td>
                            <td style={{ padding: '9px 12px', color: r.replied ? '#533ab7' : C.muted }}>{r.replied ? '💬' : '—'}</td>
                            <td style={{ padding: '9px 12px', color: C.muted, whiteSpace: 'nowrap' }}>
                              {new Date(r.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {analytics.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                      <button disabled={page === 1} onClick={() => { setPage(p => p - 1); fetchAnalytics(search, page - 1); }}
                        style={{ background: C.border, color: C.text, border: 'none', borderRadius: 6, padding: '6px 14px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>← Prev</button>
                      <span style={{ color: C.sub, lineHeight: '30px', fontSize: 13 }}>Page {page} / {analytics.totalPages}</span>
                      <button disabled={page === analytics.totalPages} onClick={() => { setPage(p => p + 1); fetchAnalytics(search, page + 1); }}
                        style={{ background: C.border, color: C.text, border: 'none', borderRadius: 6, padding: '6px 14px', cursor: page === analytics.totalPages ? 'not-allowed' : 'pointer' }}>Next →</button>
                    </div>
                  )}
                </div>

                <button onClick={() => fetchAnalytics(search, page)} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13 }}>
                  🔄 Refresh
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
