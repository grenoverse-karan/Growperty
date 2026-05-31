import React, { useState } from 'react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';

// ── Colour palette ────────────────────────────────────────────────
const C = {
  bg: '#0d1117', card: '#0d1b2a', border: '#1e2d3d',
  text: '#e6edf3', sub: '#94aabf', muted: '#4d6175',
  green: '#1d9e75', blue: '#185fa5', red: '#a32d2d',
};

const TEMPLATES = [
  {
    id: 'camp_property_alert',
    label: 'Property Alert Campaign',
    desc: 'Growperty ka introductory message — QR "Consent" button ke saath',
    preview: '🏡 Namaste! Growperty.com — Greater Noida ka Apna Property Buy & Sell Platform...',
  },
];

export default function AdminCampaignsPage() {
  const { token } = useAdminAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('camp_property_alert');
  const [phoneInput, setPhoneInput] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);

  const phones = phoneInput
    .split(/[\n,]+/)
    .map(p => p.replace(/\D/g, '').trim())
    .filter(p => p.length === 10 || (p.length === 12 && p.startsWith('91')));

  const handleSend = async () => {
    if (!phones.length) return toast.error('Koi valid phone number nahi mila.');
    if (!selectedTemplate) return toast.error('Template select karo.');
    if (!window.confirm(`${phones.length} number(s) par "${selectedTemplate}" template bhejoge?`)) return;

    setSending(true);
    setResults([]);
    const res = await Promise.allSettled(
      phones.map(phone =>
        fetch(`https://growperty-api.vercel.app/api/campaigns/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ phone, templateName: selectedTemplate }),
        }).then(r => r.json())
      )
    );

    const out = res.map((r, i) => ({
      phone: phones[i],
      success: r.status === 'fulfilled' && r.value?.success,
      error: r.status === 'rejected' ? r.reason?.message : r.value?.error,
    }));
    setResults(out);
    const ok = out.filter(r => r.success).length;
    toast.success(`${ok} / ${phones.length} messages sent successfully.`);
    setSending(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, display: 'flex' }}>
      <Helmet><title>Send Campaign — Admin — Growperty</title></Helmet>
      <div style={{ flex: 1, padding: 32, maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>📣 Send Campaign</h1>
          <p style={{ color: C.sub, marginTop: 6, fontSize: 14 }}>
            WhatsApp template ek ya multiple numbers par bhejo
          </p>
        </div>

        {/* Template selector */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <p style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, color: C.sub, textTransform: 'uppercase', letterSpacing: 1 }}>
            1. Template Select Karo
          </p>
          {TEMPLATES.map(t => (
            <label
              key={t.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer',
                padding: 16, borderRadius: 10,
                border: `2px solid ${selectedTemplate === t.id ? C.green : C.border}`,
                background: selectedTemplate === t.id ? 'rgba(29,158,117,0.08)' : 'transparent',
                marginBottom: 10, transition: 'all 0.15s',
              }}
            >
              <input
                type="radio"
                name="template"
                value={t.id}
                checked={selectedTemplate === t.id}
                onChange={() => setSelectedTemplate(t.id)}
                style={{ marginTop: 3, accentColor: C.green }}
              />
              <div>
                <p style={{ fontWeight: 700, margin: 0 }}>{t.label}</p>
                <p style={{ fontSize: 12, color: C.sub, margin: '4px 0 0' }}>{t.desc}</p>
                <p style={{ fontSize: 11, color: C.muted, margin: '6px 0 0', fontStyle: 'italic' }}>"{t.preview}"</p>
              </div>
            </label>
          ))}
        </div>

        {/* Phone numbers input */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 14, color: C.sub, textTransform: 'uppercase', letterSpacing: 1 }}>
            2. Phone Numbers (10-digit, comma ya newline se separate karo)
          </p>
          <textarea
            value={phoneInput}
            onChange={e => setPhoneInput(e.target.value)}
            placeholder={'9891117876\n9958480068\n9876543210'}
            rows={8}
            style={{
              width: '100%', background: '#0d1117', color: C.text,
              border: `1px solid ${C.border}`, borderRadius: 8,
              padding: '12px 14px', fontSize: 14, resize: 'vertical',
              fontFamily: 'monospace', boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          {phones.length > 0 && (
            <p style={{ color: C.green, fontSize: 13, marginTop: 8, fontWeight: 600 }}>
              ✅ {phones.length} valid number{phones.length > 1 ? 's' : ''} detected
            </p>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={sending || !phones.length}
          style={{
            background: sending ? C.muted : C.green,
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '14px 32px', fontWeight: 700, fontSize: 16,
            cursor: sending ? 'not-allowed' : 'pointer', width: '100%',
            transition: 'background 0.15s',
          }}
        >
          {sending ? '⏳ Bhej rahe hain...' : `📤 Send to ${phones.length || '—'} Number${phones.length === 1 ? '' : 's'}`}
        </button>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginTop: 24 }}>
            <p style={{ fontWeight: 700, marginBottom: 14 }}>📊 Results</p>
            {results.map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: i < results.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <span style={{ fontFamily: 'monospace', fontSize: 14 }}>{r.phone}</span>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: r.success ? C.green : C.red,
                }}>
                  {r.success ? '✅ Sent' : `❌ ${r.error || 'Failed'}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
