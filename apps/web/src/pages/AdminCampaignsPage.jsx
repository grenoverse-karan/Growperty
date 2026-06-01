import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';

const C = {
  bg: '#0d1117', card: '#0d1b2a', border: '#1e2d3d',
  text: '#e6edf3', sub: '#94aabf', muted: '#4d6175',
  green: '#1d9e75', blue: '#185fa5', red: '#a32d2d',
  yellow: '#ba7517',
};

const TEMPLATES = [
  {
    id: 'camp_property_alert',
    label: 'Property Alert Campaign',
    desc: 'Growperty ka introductory message — QR "Consent" button ke saath',
    preview: '🏡 Namaste! Growperty.com — Greater Noida ka Apna Property Buy & Sell Platform...',
  },
];

const StatCard = ({ label, value, color, sub }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderLeft: `3px solid ${color}`, borderRadius: 12,
    padding: '20px 24px', flex: 1, minWidth: 160,
  }}>
    <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>{label}</p>
    <p style={{ fontSize: 32, fontWeight: 800, color, margin: '6px 0 2px' }}>{value}</p>
    {sub && <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{sub}</p>}
  </div>
);

export default function AdminCampaignsPage() {
  const { token } = useAdminAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('camp_property_alert');
  const [phoneInput, setPhoneInput] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [tab, setTab] = useState('send'); // 'send' | 'analytics'

  const phones = phoneInput
    .split(/[\n,]+/)
    .map(p => p.replace(/\D/g, '').trim())
    .filter(p => p.length === 10 || (p.length === 12 && p.startsWith('91')));

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('https://growperty-api.vercel.app/api/campaigns/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnalytics(data);
    } catch { /* silent */ }
    finally { setAnalyticsLoading(false); }
  };

  const handleSend = async () => {
    if (!phones.length) return toast.error('Koi valid phone number nahi mila.');
    if (!window.confirm(`${phones.length} number(s) par "${selectedTemplate}" bhejoge?`)) return;

    setSending(true);
    setResults([]);
    const out = [];
    for (const phone of phones) {
      const r = await fetch('https://growperty-api.vercel.app/api/campaigns/send', {
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
    fetchAnalytics();
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <Helmet><title>Send Campaign — Admin — Growperty</title></Helmet>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>📣 Campaigns</h1>
          <p style={{ color: C.sub, marginTop: 6, fontSize: 14 }}>WhatsApp campaign bhejo aur analytics dekho</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
          {[['send', '📤 Send Campaign'], ['analytics', '📊 Analytics']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'none', border: 'none', color: tab === key ? C.green : C.sub,
              fontWeight: tab === key ? 700 : 500, fontSize: 15, cursor: 'pointer',
              paddingBottom: 12, borderBottom: tab === key ? `2px solid ${C.green}` : '2px solid transparent',
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {/* ── SEND TAB ── */}
        {tab === 'send' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Template selector */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontWeight: 700, marginBottom: 14, fontSize: 13, color: C.sub, textTransform: 'uppercase', letterSpacing: 1 }}>1. Template Select Karo</p>
              {TEMPLATES.map(t => (
                <label key={t.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer',
                  padding: 16, borderRadius: 10,
                  border: `2px solid ${selectedTemplate === t.id ? C.green : C.border}`,
                  background: selectedTemplate === t.id ? 'rgba(29,158,117,0.08)' : 'transparent',
                }}>
                  <input type="radio" name="template" value={t.id} checked={selectedTemplate === t.id}
                    onChange={() => setSelectedTemplate(t.id)} style={{ marginTop: 3, accentColor: C.green }} />
                  <div>
                    <p style={{ fontWeight: 700, margin: 0 }}>{t.label}</p>
                    <p style={{ fontSize: 12, color: C.sub, margin: '4px 0 0' }}>{t.desc}</p>
                    <p style={{ fontSize: 11, color: C.muted, margin: '6px 0 0', fontStyle: 'italic' }}>"{t.preview}"</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Phone input */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 13, color: C.sub, textTransform: 'uppercase', letterSpacing: 1 }}>
                2. Phone Numbers (comma ya newline se separate karo)
              </p>
              <textarea value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
                placeholder={'9891117876\n9958480068\n9876543210'}
                rows={8} style={{
                  width: '100%', background: '#0d1117', color: C.text,
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: '12px 14px', fontSize: 14, resize: 'vertical',
                  fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none',
                }} />
              {phones.length > 0 && (
                <p style={{ color: C.green, fontSize: 13, marginTop: 8, fontWeight: 600 }}>
                  ✅ {phones.length} valid number{phones.length > 1 ? 's' : ''} detected
                </p>
              )}
            </div>

            <button onClick={handleSend} disabled={sending || !phones.length} style={{
              background: sending ? C.muted : C.green, color: '#fff', border: 'none',
              borderRadius: 10, padding: '14px 32px', fontWeight: 700, fontSize: 16,
              cursor: sending ? 'not-allowed' : 'pointer', width: '100%',
            }}>
              {sending ? '⏳ Bhej rahe hain...' : `📤 Send to ${phones.length || '—'} Number${phones.length === 1 ? '' : 's'}`}
            </button>

            {results.length > 0 && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <p style={{ fontWeight: 700, marginBottom: 14 }}>📊 Results</p>
                {results.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < results.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{r.phone}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: r.success ? C.green : C.red }}>
                      {r.success ? '✅ Sent' : `❌ ${r.error || 'Failed'}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {analyticsLoading ? (
              <p style={{ color: C.sub, textAlign: 'center', padding: 40 }}>Loading analytics...</p>
            ) : !analytics ? (
              <p style={{ color: C.red, textAlign: 'center', padding: 40 }}>Failed to load analytics.</p>
            ) : (
              <>
                {/* Summary cards */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <StatCard label="Total Sent" value={analytics.summary.sent} color={C.green} sub="Messages delivered" />
                  <StatCard label="Failed" value={analytics.summary.failed} color={C.red} sub="Delivery failed" />
                  <StatCard label="Success Rate" value={`${analytics.summary.successRate}%`} color={C.blue} sub={`Out of ${analytics.summary.total} total`} />
                </div>

                {/* Daily stats */}
                {analytics.dailyStats?.length > 0 && (
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                    <p style={{ fontWeight: 700, marginBottom: 16 }}>📅 Last 7 Days</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {analytics.dailyStats.map(d => {
                        const total = d.sent + d.failed;
                        const pct = total ? Math.round((d.sent / total) * 100) : 0;
                        return (
                          <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 13, color: C.sub, width: 100, flexShrink: 0 }}>{d._id}</span>
                            <div style={{ flex: 1, background: C.border, borderRadius: 4, height: 8, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, background: C.green, height: '100%', borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: 13, color: C.text, width: 80, textAlign: 'right', flexShrink: 0 }}>
                              {d.sent} sent{d.failed > 0 && <span style={{ color: C.red }}>, {d.failed} failed</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* By template */}
                {analytics.byTemplate?.length > 0 && (
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                    <p style={{ fontWeight: 700, marginBottom: 16 }}>📋 By Template</p>
                    {analytics.byTemplate.map(t => (
                      <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, color: C.sub }}>{t._id}</span>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <span style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>✅ {t.sent}</span>
                          {t.failed > 0 && <span style={{ color: C.red, fontWeight: 700, fontSize: 13 }}>❌ {t.failed}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent sends */}
                {analytics.recent?.length > 0 && (
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                    <p style={{ fontWeight: 700, marginBottom: 16 }}>🕐 Recent Sends</p>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ color: C.sub, textAlign: 'left' }}>
                            {['Phone', 'Template', 'Status', 'Time'].map(h => (
                              <th key={h} style={{ padding: '6px 12px', fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.recent.map(r => (
                            <tr key={r._id} style={{ borderBottom: `1px solid ${C.border}` }}>
                              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: C.text }}>{r.phone}</td>
                              <td style={{ padding: '8px 12px', color: C.sub }}>{r.templateName}</td>
                              <td style={{ padding: '8px 12px', color: r.status === 'sent' ? C.green : C.red, fontWeight: 700 }}>
                                {r.status === 'sent' ? '✅ Sent' : '❌ Failed'}
                              </td>
                              <td style={{ padding: '8px 12px', color: C.muted }}>
                                {new Date(r.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <button onClick={fetchAnalytics} style={{
                  background: 'none', border: `1px solid ${C.border}`, color: C.sub,
                  borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13,
                }}>🔄 Refresh Analytics</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
