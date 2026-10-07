import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const C = {
  surface:   '#ffffff',
  border:    '#e5e7eb',
  text:      '#111827',
  muted:     '#9ca3af',
  sub:       '#6b7280',
  greenDark: '#059669',
  inputBg:   '#f9fafb',
};

export default function CpProfilePage() {
  const { currentCp, token } = useCpAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [shareToken, setShareToken] = useState('');
  // currentCp comes from login and only has basic fields; /cp/me has the full record (experience etc.).
  const [me, setMe] = useState(null);
  const [refLink, setRefLink] = useState('');
  const [copied, setCopied] = useState('');
  const [refCopied, setRefCopied] = useState(false);

  const [form, setForm] = useState({
    name:        currentCp?.name        || '',
    phone:       currentCp?.phone       || '',
    companyName: currentCp?.companyName || '',
    city:        currentCp?.city        || '',
  });

  useEffect(() => {
    if (!token) return;
    apiServerClient.fetch('/cp/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.cp) setMe(data.cp);
        if (data?.cp?.shareToken) setShareToken(data.cp.shareToken);
        if (data?.cp?.refLink) setRefLink(data.cp.refLink);
      })
      .catch(() => {});
  }, [token]);

  const storeBase = shareToken ? `${window.location.origin}/cp/${shareToken}` : '';
  const refUrl = refLink ? `https://${refLink}` : '';

  const copyRefLink = () => {
    navigator.clipboard.writeText(refUrl).then(() => {
      setRefCopied(true);
      setTimeout(() => setRefCopied(false), 2000);
    });
  };

  const shareRefLinkOnWhatsapp = () => {
    const text = encodeURIComponent(`Check out Growperty properties: ${refUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyLink = (type) => {
    navigator.clipboard.writeText(`${storeBase}/${type}`).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleChange = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await apiServerClient.fetch('/cp/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 7,
    border: `1px solid ${C.border}`,
    background: C.inputBg,
    color: C.text,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const Field = ({ label, value, field, readOnly, type = 'text' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
      {editing && !readOnly ? (
        <input
          type={type}
          value={form[field] || ''}
          onChange={handleChange(field)}
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = '#10b981')}
          onBlur={e => (e.target.style.borderColor = C.border)}
        />
      ) : (
        <div style={{ fontSize: 14, color: value ? C.text : C.muted, padding: '9px 0', fontWeight: value ? 400 : 300 }}>
          {value || '—'}
        </div>
      )}
    </div>
  );

  const initials = (name) => {
    if (!name) return 'CP';
    return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <>
      <Helmet><title>Profile — CP Dashboard</title></Helmet>

      <style>{`
        @media (max-width: 640px) {
          .cp-profile-fields { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>Profile</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>Manage your channel partner profile</p>
      </div>

      {/* ── Profile Card ── */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '28px 28px', maxWidth: 580, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 24 }}>
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#d1fae5', color: C.greenDark,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, flexShrink: 0,
          }}>
            {initials(currentCp?.name)}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{currentCp?.name || '—'}</div>
            {currentCp?.companyName && (
              <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{currentCp.companyName}</div>
            )}
            <div style={{ marginTop: 6 }}>
              <span style={{
                background: '#d1fae5', color: '#059669',
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              }}>
                ✓ Approved
              </span>
            </div>
          </div>
          {currentCp?.shareToken && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>CP ID</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, fontFamily: 'monospace', background: '#f3f4f6', padding: '4px 10px', borderRadius: 6 }}>
                {currentCp.shareToken}
              </div>
            </div>
          )}
        </div>

        {/* Fields grid */}
        <div className="cp-profile-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
          <Field label="Full Name"    value={currentCp?.name}        field="name"        />
          <Field label="Email"        value={currentCp?.email}       field="email"       readOnly />
          <Field label="Phone"        value={currentCp?.phone}       field="phone"       />
          <Field label="Company Name" value={currentCp?.companyName} field="companyName" />
          <Field label="City"         value={currentCp?.city}        field="city"        />
          <Field label="Experience"   value={(me ?? currentCp)?.experienceYrs != null ? `${(me ?? currentCp).experienceYrs} yr${(me ?? currentCp).experienceYrs !== 1 ? 's' : ''}` : null} readOnly />
        </div>

        {/* Action buttons */}
        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: C.greenDark, color: '#fff', border: 'none', borderRadius: 8,
                  padding: '10px 22px', fontWeight: 600, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  background: 'transparent', border: `1px solid ${C.border}`, color: C.sub,
                  borderRadius: 8, padding: '10px 18px', fontSize: 13, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{
                background: 'transparent', border: `1px solid ${C.border}`, color: C.sub,
                borderRadius: 8, padding: '10px 22px', fontSize: 13, cursor: 'pointer', fontWeight: 500,
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ── Your Referral Link ── */}
      {refUrl && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', maxWidth: 580, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 24 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: C.text }}>🎯 Your Referral Link</h2>
          <p style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>
            Share this link — buyers who click it are automatically credited to you for 7 days, sitewide.
          </p>
          <div style={{
            background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 7,
            padding: '8px 12px', fontSize: 12, color: C.sub, wordBreak: 'break-all', marginBottom: 12,
          }}>
            {refLink}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={copyRefLink}
              style={{
                flex: 1, background: refCopied ? '#d1fae5' : C.greenDark,
                border: 'none', color: refCopied ? '#059669' : '#fff',
                borderRadius: 7, padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {refCopied ? '✓ Copied' : 'Copy Link'}
            </button>
            <button
              onClick={shareRefLinkOnWhatsapp}
              style={{
                flex: 1, background: '#25D366', border: 'none', color: '#fff',
                borderRadius: 7, padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Share on WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* ── Store Links ── */}
      {storeBase && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', maxWidth: 580, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: C.text }}>🔗 My Store Links</h2>
          {[
            { key: 'listings', label: 'Listings Page',      icon: '🏘', desc: 'Share with buyers to browse your properties' },
            { key: 'buyers',   label: 'Buyer Enquiry Page', icon: '👥', desc: 'Let clients submit their requirements'       },
          ].map(({ key, label, icon, desc }) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 2 }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{desc}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{
                  flex: 1, background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 7,
                  padding: '8px 12px', fontSize: 11, color: C.sub, wordBreak: 'break-all',
                }}>
                  {storeBase}/{key}
                </div>
                <button
                  onClick={() => copyLink(key)}
                  style={{
                    background: copied === key ? '#d1fae5' : 'transparent',
                    border: `1px solid ${copied === key ? '#10b981' : C.border}`,
                    color: copied === key ? '#059669' : C.sub,
                    borderRadius: 7, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  {copied === key ? '✓ Copied' : 'Copy'}
                </button>
                <a
                  href={`${storeBase}/${key}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'transparent', border: `1px solid ${C.border}`,
                    color: C.sub, borderRadius: 7, padding: '8px 14px', fontSize: 12,
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  Open ↗
                </a>
              </div>
            </div>
          ))}
          <p style={{ fontSize: 11, color: C.muted, marginTop: 4, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            Share these links with your clients. Your referral token is embedded automatically.
          </p>
        </div>
      )}
    </>
  );
}
