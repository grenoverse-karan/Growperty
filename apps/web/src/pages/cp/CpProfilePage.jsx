import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { CP_LANGUAGES, CP_WORKING_IN } from '@/components/cpPortalShared.jsx';
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
  fontFamily: 'inherit',
};
const focusGreen = (e) => (e.target.style.borderColor = '#10b981');
const blurGrey = (e) => (e.target.style.borderColor = C.border);

const last10 = (v) => String(v || '').replace(/\D/g, '').slice(-10);
const yrs = (n) => (n != null && n !== '' ? `${n} yr${Number(n) !== 1 ? 's' : ''}` : '');

// Field components live at module level on purpose: when they were defined
// inside the page component they got a new identity every render, so React
// remounted the <input> on each keystroke and focus was lost after one character.
const FieldShell = ({ label, children, full }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: full ? '1 / -1' : undefined }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</label>
    {children}
  </div>
);

const ViewValue = ({ value }) => (
  <div style={{ fontSize: 14, color: value ? C.text : C.muted, padding: '9px 0', fontWeight: value ? 400 : 300, whiteSpace: 'pre-line' }}>
    {value || '—'}
  </div>
);

const TextField = ({ label, value, editing, readOnly, onChange, type = 'text', multiline, full, hint, ...rest }) => (
  <FieldShell label={label} full={full}>
    {editing && !readOnly ? (
      multiline ? (
        <textarea rows={3} value={value ?? ''} onChange={onChange} style={{ ...inputStyle, resize: 'vertical' }} onFocus={focusGreen} onBlur={blurGrey} {...rest} />
      ) : (
        <input type={type} value={value ?? ''} onChange={onChange} style={inputStyle} onFocus={focusGreen} onBlur={blurGrey} {...rest} />
      )
    ) : (
      <ViewValue value={value} />
    )}
    {hint}
  </FieldShell>
);

const SelectField = ({ label, value, editing, onChange, options, placeholder }) => (
  <FieldShell label={label}>
    {editing ? (
      <select value={value ?? ''} onChange={onChange} style={inputStyle} onFocus={focusGreen} onBlur={blurGrey}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <ViewValue value={value} />
    )}
  </FieldShell>
);

const ChipsField = ({ label, options, values, editing, onToggle, full = true }) => (
  <FieldShell label={label} full={full}>
    {editing ? (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(o => {
          const on = values.includes(o);
          return (
            <button key={o} type="button" aria-pressed={on} onClick={() => onToggle(o)} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
              border: `1.5px solid ${on ? '#10b981' : C.border}`, background: on ? '#f0fdf4' : '#fff',
              color: on ? '#047857' : C.sub, fontWeight: on ? 600 : 400,
            }}>{on ? '✓ ' : ''}{o}</button>
          );
        })}
      </div>
    ) : values.length ? (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 0' }}>
        {values.map(v => <span key={v} style={{ background: '#ecfdf5', color: '#047857', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999 }}>{v}</span>)}
      </div>
    ) : <ViewValue value="" />}
  </FieldShell>
);

const toForm = (r = {}) => ({
  name:          r.name || '',
  phone:         last10(r.phone),
  companyName:   r.companyName || '',
  city:          r.city || '',
  age:           r.age ?? '',
  gender:        r.gender || '',
  experienceYrs: r.experienceYrs ?? '',
  workType:      r.workType || '',
  education:     r.education || '',
  hasOwnOffice:  r.hasOwnOffice === undefined || r.hasOwnOffice === null ? '' : (r.hasOwnOffice ? 'yes' : 'no'),
  officeAddress: r.officeAddress || '',
  houseAddress:  r.houseAddress || '',
  workingIn:     r.workingIn || [],
  languages:     r.languages || [],
});

export default function CpProfilePage() {
  const { currentCp, token, updateCp } = useCpAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [shareToken, setShareToken] = useState('');
  // currentCp comes from login and only has basic fields; /cp/me has the full record.
  const [me, setMe] = useState(null);
  const [refLink, setRefLink] = useState('');
  const [copied, setCopied] = useState('');
  const [refCopied, setRefCopied] = useState(false);

  const view = { ...(currentCp || {}), ...(me || {}) };
  const [form, setForm] = useState(() => toForm(currentCp));

  // OTP state — only used when the phone number is being changed
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [verifiedToken, setVerifiedToken] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => () => clearInterval(timerRef.current), []);

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

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const toggle = (field) => (item) => setForm(prev => ({
    ...prev,
    [field]: prev[field].includes(item) ? prev[field].filter(x => x !== item) : [...prev[field], item],
  }));

  const resetOtp = () => {
    setOtpSent(false); setOtpCode(''); setOtpError(''); setDevOtp('');
    setVerifiedToken(''); setVerifiedPhone(''); setResendTimer(0);
    clearInterval(timerRef.current);
  };

  const startEdit = () => { setForm(toForm(view)); resetOtp(); setEditing(true); };
  const cancelEdit = () => { setEditing(false); resetOtp(); };

  const phoneDigits = last10(form.phone);
  const phoneChanged = phoneDigits !== last10(view.phone);
  const phoneVerified = phoneChanged && !!verifiedToken && verifiedPhone === phoneDigits;

  const onPhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm(prev => ({ ...prev, phone: digits }));
    if (digits !== verifiedPhone) { setVerifiedToken(''); setOtpSent(false); setOtpCode(''); setOtpError(''); }
  };

  const sendOtp = async () => {
    if (phoneDigits.length !== 10) { setOtpError('Enter a valid 10-digit number'); return; }
    setOtpBusy(true); setOtpError('');
    try {
      const res  = await apiServerClient.fetch('/cp/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneDigits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true); setOtpCode(''); setDevOtp(data.devOtp || '');
      setResendTimer(30);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setResendTimer(t => (t <= 1 ? (clearInterval(timerRef.current), 0) : t - 1)), 1000);
    } catch (err) { setOtpError(err.message); }
    finally { setOtpBusy(false); }
  };

  const verifyOtp = async (code) => {
    setOtpBusy(true); setOtpError('');
    try {
      const res  = await apiServerClient.fetch('/cp/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneDigits, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Incorrect OTP');
      setVerifiedToken(data.verifiedToken); setVerifiedPhone(phoneDigits);
    } catch (err) { setOtpError(err.message); }
    finally { setOtpBusy(false); }
  };

  const onOtpInput = (e) => {
    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(code); setOtpError('');
    if (code.length === 6) verifyOtp(code);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.city.trim()) return toast.error('City is required');
    if (phoneDigits.length !== 10) return toast.error('Enter a valid 10-digit phone number');
    if (phoneChanged && !phoneVerified) return toast.error('Verify the new phone number with an OTP first');
    if (form.hasOwnOffice === 'yes' && !form.officeAddress.trim()) return toast.error('Office address is required');
    if (form.hasOwnOffice === 'no' && !form.houseAddress.trim()) return toast.error('House address is required');

    const payload = {
      name: form.name, companyName: form.companyName, city: form.city, education: form.education,
      age: form.age, gender: form.gender, experienceYrs: form.experienceYrs, workType: form.workType,
      workingIn: form.workingIn, languages: form.languages,
      ...(form.hasOwnOffice && {
        hasOwnOffice: form.hasOwnOffice === 'yes',
        officeAddress: form.officeAddress, houseAddress: form.houseAddress,
      }),
      ...(phoneChanged && { phone: phoneDigits, verifiedToken }),
    };

    setSaving(true);
    try {
      const res  = await apiServerClient.fetch('/cp/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setMe(prev => ({ ...(prev || {}), ...data.cp }));
      updateCp(data.cp);
      toast.success('Profile updated');
      setEditing(false); resetOtp();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = (name) => {
    if (!name) return 'CP';
    return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  const f = editing ? form : toForm(view);
  const officeLabel = f.hasOwnOffice === 'yes' ? 'Office Address' : 'House Address';

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
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '28px 28px', maxWidth: 720, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 24 }}>
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#d1fae5', color: C.greenDark,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, flexShrink: 0,
          }}>
            {initials(view.name)}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{view.name || '—'}</div>
            {view.companyName && (
              <div style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{view.companyName}</div>
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
          {view.shareToken && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>CP ID</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, fontFamily: 'monospace', background: '#f3f4f6', padding: '4px 10px', borderRadius: 6 }}>
                {view.shareToken}
              </div>
            </div>
          )}
        </div>

        {/* Fields grid */}
        <div className="cp-profile-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
          <TextField label="Full Name" value={f.name} editing={editing} onChange={set('name')} />
          <TextField label="Email" value={view.email} editing={editing} readOnly
            hint={editing ? <span style={{ fontSize: 11, color: C.muted }}>Email is your login ID and can't be changed here.</span> : null} />

          <TextField
            label="Phone (WhatsApp)" value={f.phone} editing={editing} onChange={onPhoneChange} type="tel" inputMode="numeric" maxLength={10}
            hint={editing && phoneChanged ? (
              <div style={{ marginTop: 6 }}>
                {phoneVerified ? (
                  <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>✓ New number verified</span>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <button type="button" onClick={sendOtp} disabled={otpBusy || resendTimer > 0 || phoneDigits.length !== 10} style={{
                        background: otpBusy || resendTimer > 0 || phoneDigits.length !== 10 ? '#9ca3af' : '#d97706', color: '#fff', border: 'none',
                        borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: otpBusy || resendTimer > 0 ? 'not-allowed' : 'pointer',
                      }}>
                        {otpBusy && !otpSent ? 'Sending…' : resendTimer > 0 ? `Resend in ${resendTimer}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                      {otpSent && (
                        <input
                          value={otpCode} onChange={onOtpInput} inputMode="numeric" maxLength={6} placeholder="Enter 6-digit OTP" autoFocus
                          style={{ ...inputStyle, width: 150, letterSpacing: 3, fontWeight: 700 }} onFocus={focusGreen} onBlur={blurGrey}
                        />
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
                      Changing your number needs an OTP sent to the <b style={{ color: '#10b981' }}>new WhatsApp</b> number.
                    </div>
                    {devOtp && <div style={{ fontSize: 11, color: '#b45309', marginTop: 4 }}>WhatsApp delivery unavailable — OTP: <b>{devOtp}</b></div>}
                    {otpError && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{otpError}</div>}
                  </>
                )}
              </div>
            ) : null}
          />
          <TextField label="Company Name" value={f.companyName} editing={editing} onChange={set('companyName')} />

          <TextField label="City" value={f.city} editing={editing} onChange={set('city')} />
          <TextField label="Education" value={f.education} editing={editing} onChange={set('education')} />

          <TextField label="Age" value={f.age === '' ? '' : String(f.age)} editing={editing} onChange={set('age')} type="number" min="18" max="100" />
          <SelectField label="Gender" value={f.gender} editing={editing} onChange={set('gender')} options={['Male', 'Female', 'Other']} placeholder="Select gender" />

          {editing
            ? <TextField label="Experience (years)" value={f.experienceYrs} editing onChange={set('experienceYrs')} type="number" min="0" max="60" />
            : <TextField label="Experience" value={yrs(f.experienceYrs)} editing={false} />}
          <SelectField label="Work Type" value={f.workType} editing={editing} onChange={set('workType')} options={['Full Time', 'Part Time', 'Freelance']} placeholder="Select type" />

          <ChipsField label="Working in" options={CP_WORKING_IN} values={f.workingIn} editing={editing} onToggle={toggle('workingIn')} />
          <ChipsField label="Languages Known" options={CP_LANGUAGES} values={f.languages} editing={editing} onToggle={toggle('languages')} />

          <FieldShell label="Own office?" full>
            {editing ? (
              <div style={{ display: 'flex', gap: 10 }}>
                {['yes', 'no'].map(opt => (
                  <label key={opt} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
                    padding: '9px 14px', borderRadius: 8, fontSize: 14,
                    border: `1.5px solid ${form.hasOwnOffice === opt ? '#10b981' : C.border}`,
                    background: form.hasOwnOffice === opt ? '#f0fdf4' : '#fff',
                  }}>
                    <input type="radio" name="hasOwnOffice" value={opt} checked={form.hasOwnOffice === opt} onChange={set('hasOwnOffice')} style={{ accentColor: '#10b981' }} />
                    {opt === 'yes' ? 'Yes' : 'No'}
                  </label>
                ))}
              </div>
            ) : <ViewValue value={f.hasOwnOffice === 'yes' ? 'Yes' : f.hasOwnOffice === 'no' ? 'No' : ''} />}
          </FieldShell>

          {(editing ? form.hasOwnOffice !== '' : f.hasOwnOffice !== '') && (
            <TextField
              label={officeLabel} full multiline editing={editing}
              value={f.hasOwnOffice === 'yes' ? f.officeAddress : f.houseAddress}
              onChange={set(f.hasOwnOffice === 'yes' ? 'officeAddress' : 'houseAddress')}
              placeholder={f.hasOwnOffice === 'yes' ? 'Shop/Office no., building, sector, city' : 'House no., street, sector, city'}
            />
          )}
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
                onClick={cancelEdit}
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
              onClick={startEdit}
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
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', maxWidth: 720, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 24 }}>
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
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 28px', maxWidth: 720, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
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
