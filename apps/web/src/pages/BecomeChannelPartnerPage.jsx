import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';

const LANGUAGES = ['Hindi', 'English'];
const WORKING_IN = [
  'Independent House', 'Villas', 'Highrise Apartments', 'Lowrise Apartments', 'Leasehold Properties',
  'Freehold Properties', 'Commercial', 'Industrial', 'Freehold Plots', 'Lands',
];

export default function BecomeChannelPartnerPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', companyName: '', city: '',
    age: '', gender: '', experienceYrs: '', hasOwnOffice: '', officeAddress: '', houseAddress: '',
    workType: '', education: '', languages: [], workingIn: [],
  });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  // OTP state
  const [otpSent, setOtpSent]         = useState(false);
  const [otpCode, setOtpCode]         = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState('');
  const [sendingOtp, setSendingOtp]   = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError]       = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtp, setDevOtp] = useState('');
  const [otpDelivered, setOtpDelivered] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToWhatsapp, setAgreedToWhatsapp] = useState(false);
  const timerRef = useRef(null);
  const otpRefs  = useRef([]);

  // The CP Terms & Conditions link opens in a new tab; that tab posts a message
  // back here once the user ticks "I agree" there, so they don't have to tick twice.
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'cp-terms-agreed') setAgreedToTerms(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const validate = () => {
    const e = {};
    if (!formData.name.trim())         e.name         = 'Full name is required';
    if (!formData.email.trim())        e.email        = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email';
    if (!formData.phone.trim())        e.phone        = 'Phone number is required';
    if (!otpVerified)                  e.phone        = 'Please verify your phone number';
    if (!formData.city.trim())         e.city         = 'City is required';
    if (!formData.age)                 e.age          = 'Age is required';
    if (!formData.gender)              e.gender       = 'Gender is required';
    if (formData.experienceYrs === '') e.experienceYrs = 'Experience is required';
    if (formData.hasOwnOffice === '')  e.hasOwnOffice  = 'Please select an option';
    if (formData.hasOwnOffice === 'yes' && !formData.officeAddress.trim()) e.officeAddress = 'Office address is required';
    if (formData.hasOwnOffice === 'no'  && !formData.houseAddress.trim())  e.houseAddress  = 'House address is required';
    if (!formData.workType)            e.workType     = 'Work type is required';
    if (!agreedToTerms)                e.terms        = 'You must accept the Channel Partner Terms & Conditions';
    if (!agreedToWhatsapp)             e.whatsapp     = 'You must agree to receive WhatsApp alerts';
    return e;
  };

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    // Reset OTP if phone changes
    if (field === 'phone' && otpSent) {
      setOtpSent(false); setOtpVerified(false); setVerifiedToken('');
      setOtpCode(['', '', '', '', '', '']); setOtpError(''); setDevOtp('');
    }
  };

  const handleLangToggle = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleWorkingInToggle = (item) => {
    setFormData(prev => ({
      ...prev,
      workingIn: prev.workingIn.includes(item)
        ? prev.workingIn.filter(w => w !== item)
        : [...prev.workingIn, item],
    }));
  };

  /* ── OTP helpers ── */
  const startResendTimer = () => {
    setResendTimer(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const phone = formData.phone.trim();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setErrors(p => ({ ...p, phone: 'Enter a valid 10-digit phone number first' }));
      return;
    }
    setSendingOtp(true); setOtpError('');
    try {
      const res  = await apiServerClient.fetch('/cp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error || 'Failed to send OTP'); return; }
      setOtpSent(true);
      startResendTimer();
      setOtpDelivered(data.delivered !== false);
      // Show dev OTP as a hint (non-prod / WhatsApp delivery failed) but always
      // require the user to type it in — never auto-fill or auto-verify.
      setDevOtp(data.devOtp || '');
      setOtpCode(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch { setOtpError('Network error. Please try again.'); }
    finally { setSendingOtp(false); }
  };

  const handleOtpInput = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next  = [...otpCode];
    next[idx]   = digit;
    setOtpCode(next);
    setOtpError('');
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '') && next.join('').length === 6) {
      verifyOtp(next.join(''));
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const verifyOtp = async (code) => {
    setVerifyingOtp(true); setOtpError('');
    try {
      const res  = await apiServerClient.fetch('/cp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error || 'Incorrect OTP'); return; }
      setOtpVerified(true);
      setVerifiedToken(data.verifiedToken);
      setErrors(p => ({ ...p, phone: undefined }));
    } catch { setOtpError('Network error. Please try again.'); }
    finally { setVerifyingOtp(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        experienceYrs: Number(formData.experienceYrs),
        hasOwnOffice: formData.hasOwnOffice === 'yes',
        officeAddress: formData.hasOwnOffice === 'yes' ? formData.officeAddress.trim() : '',
        houseAddress:  formData.hasOwnOffice === 'no'  ? formData.houseAddress.trim()  : '',
        verifiedToken,
      };
      const res  = await apiServerClient.fetch('/cp/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ form: data.error || 'Submission failed' }); return; }
      setSubmitted(true);
    } catch { setErrors({ form: 'Network error. Please try again.' }); }
    finally { setSubmitting(false); }
  };

  /* ── Styles ── */
  const inp = (field) => ({
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1.5px solid ${errors[field] ? '#e53e3e' : '#d1d5db'}`,
    fontSize: 14, outline: 'none', background: '#fff', color: '#111', boxSizing: 'border-box',
  });
  const lbl  = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 };
  const err  = (field) => errors[field] ? <p style={{ fontSize: 12, color: '#e53e3e', marginTop: 3 }}>{errors[field]}</p> : null;
  const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };

  if (submitted) {
    return (
      <>
        <Helmet><title>Become a Channel Partner — Growperty</title></Helmet>
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 }}>Application Submitted!</h2>
            <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.6 }}>
              Thank you for your interest in becoming a Growperty Channel Partner. We'll review your application and contact you soon.
            </p>
            <Link to="/" style={{ display: 'inline-block', marginTop: 24, background: '#10b981', color: '#fff', padding: '10px 24px', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Become a Channel Partner — Growperty</title></Helmet>
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '48px 24px' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Link to="/" style={{ color: '#10b981', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>← Back to Growperty</Link>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginTop: 12, marginBottom: 8 }}>Become a Channel Partner</h1>
            <p style={{ color: '#6b7280', fontSize: 15 }}>Partner with Growperty to grow your real estate business.</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <form onSubmit={handleSubmit} noValidate>
              {errors.form && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
                  {errors.form}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Name */}
                <div>
                  <label style={lbl}>Full Name *</label>
                  <input type="text" value={formData.name} onChange={handleChange('name')} placeholder="Your full name" style={inp('name')} />
                  {err('name')}
                </div>

                {/* Email */}
                <div>
                  <label style={lbl}>Email *</label>
                  <input type="email" value={formData.email} onChange={handleChange('email')} placeholder="you@example.com" style={inp('email')} />
                  {err('email')}
                </div>

                {/* Phone + OTP */}
                <div>
                  <label style={lbl}>Phone (WhatsApp) *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      placeholder="10-digit mobile number"
                      style={{ ...inp('phone'), flex: 1 }}
                    />
                    {!otpVerified && formData.phone.replace(/\D/g, '').length === 10 && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || resendTimer > 0}
                        style={{
                          background: sendingOtp || resendTimer > 0 ? '#9ca3af' : '#d97706',
                          color: '#fff', border: 'none', borderRadius: 8,
                          padding: '0 16px', fontSize: 13, fontWeight: 600,
                          cursor: sendingOtp || resendTimer > 0 ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sendingOtp ? 'Sending…' : resendTimer > 0 ? `Resend (${resendTimer}s)` : otpSent ? 'Resend' : 'Verify'}
                      </button>
                    )}
                    {otpVerified && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 600, paddingRight: 4 }}>
                        ✓ Verified
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>OTP will be sent to this <strong style={{ color: '#10b981', fontWeight: 700 }}>WhatsApp</strong> number</p>
                  {err('phone')}

                  {/* OTP input boxes */}
                  {otpSent && !otpVerified && (
                    <div style={{ marginTop: 14, padding: '16px', background: otpDelivered ? '#f0fdf4' : '#fffbeb', borderRadius: 10, border: `1px solid ${otpDelivered ? '#bbf7d0' : '#fcd34d'}` }}>
                      <p style={{ fontSize: 13, color: otpDelivered ? '#15803d' : '#92400e', fontWeight: 600, marginBottom: 12 }}>
                        {otpDelivered
                          ? 'OTP has been sent to your WhatsApp number. Please enter it below.'
                          : `WhatsApp delivery failed. Your OTP is: ${devOtp}`}
                      </p>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: otpError ? 10 : 0 }}>
                        {otpCode.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={el => otpRefs.current[idx] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpInput(idx, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(idx, e)}
                            style={{
                              width: 44, height: 50, textAlign: 'center', fontSize: 20, fontWeight: 700,
                              borderRadius: 8, border: `2px solid ${otpError ? '#e53e3e' : digit ? '#10b981' : '#d1d5db'}`,
                              outline: 'none', background: '#fff', color: '#111',
                            }}
                          />
                        ))}
                      </div>
                      {verifyingOtp && <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 8 }}>Verifying…</p>}
                      {otpError && <p style={{ textAlign: 'center', fontSize: 12, color: '#e53e3e', marginTop: 8 }}>{otpError}</p>}
                    </div>
                  )}
                </div>

                {/* Age + Gender */}
                <div style={row2}>
                  <div>
                    <label style={lbl}>Age *</label>
                    <input type="number" min="18" max="80" value={formData.age} onChange={handleChange('age')} placeholder="e.g. 32" style={inp('age')} />
                    {err('age')}
                  </div>
                  <div>
                    <label style={lbl}>Gender *</label>
                    <select value={formData.gender} onChange={handleChange('gender')} style={{ ...inp('gender'), appearance: 'auto' }}>
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    {err('gender')}
                  </div>
                </div>

                {/* Experience + Work Type */}
                <div style={row2}>
                  <div>
                    <label style={lbl}>Experience (years) *</label>
                    <input type="number" min="0" max="50" value={formData.experienceYrs} onChange={handleChange('experienceYrs')} placeholder="e.g. 3" style={inp('experienceYrs')} />
                    {err('experienceYrs')}
                  </div>
                  <div>
                    <label style={lbl}>Work Type *</label>
                    <select value={formData.workType} onChange={handleChange('workType')} style={{ ...inp('workType'), appearance: 'auto' }}>
                      <option value="">Select type</option>
                      <option>Full Time</option>
                      <option>Part Time</option>
                      <option>Freelance</option>
                    </select>
                    {err('workType')}
                  </div>
                </div>

                {/* Working in */}
                <div>
                  <label style={lbl}>Working in</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
                    {WORKING_IN.map(item => {
                      const selected = formData.workingIn.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => handleWorkingInToggle(item)}
                          style={{
                            padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                            border: `1.5px solid ${selected ? '#10b981' : '#d1d5db'}`,
                            background: selected ? '#f0fdf4' : '#fff',
                            color: selected ? '#047857' : '#374151',
                          }}
                        >
                          {selected ? '✓ ' : ''}{item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Own Office */}
                <div>
                  <label style={lbl}>Do you have your own office? *</label>
                  <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                    {['yes', 'no'].map(opt => (
                      <label key={opt} style={{
                        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                        padding: '9px 18px', borderRadius: 8, flex: 1, justifyContent: 'center',
                        border: `1.5px solid ${formData.hasOwnOffice === opt ? '#10b981' : (errors.hasOwnOffice ? '#e53e3e' : '#d1d5db')}`,
                        background: formData.hasOwnOffice === opt ? '#f0fdf4' : '#fff',
                        fontSize: 14, fontWeight: 500,
                      }}>
                        <input type="radio" name="hasOwnOffice" value={opt} checked={formData.hasOwnOffice === opt} onChange={handleChange('hasOwnOffice')} style={{ accentColor: '#10b981' }} />
                        {opt === 'yes' ? 'Yes' : 'No'}
                      </label>
                    ))}
                  </div>
                  {err('hasOwnOffice')}
                </div>

                {/* Address — office or house depending on the answer above */}
                {formData.hasOwnOffice === 'yes' && (
                  <div>
                    <label style={lbl}>Office Address *</label>
                    <textarea rows={3} value={formData.officeAddress} onChange={handleChange('officeAddress')} placeholder="Shop/Office no., building, sector, city" style={{ ...inp('officeAddress'), resize: 'vertical', fontFamily: 'inherit' }} />
                    {err('officeAddress')}
                  </div>
                )}
                {formData.hasOwnOffice === 'no' && (
                  <div>
                    <label style={lbl}>House Address *</label>
                    <textarea rows={3} value={formData.houseAddress} onChange={handleChange('houseAddress')} placeholder="House no., street, sector, city" style={{ ...inp('houseAddress'), resize: 'vertical', fontFamily: 'inherit' }} />
                    {err('houseAddress')}
                  </div>
                )}

                {/* Education + Company */}
                <div style={row2}>
                  <div>
                    <label style={lbl}>Education</label>
                    <input type="text" value={formData.education} onChange={handleChange('education')} placeholder="e.g. B.Com, MBA" style={inp('education')} />
                  </div>
                  <div>
                    <label style={lbl}>Company or Office Name</label>
                    <input type="text" value={formData.companyName} onChange={handleChange('companyName')} placeholder="Your company or office name" style={inp('companyName')} />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label style={lbl}>City *</label>
                  <input type="text" value={formData.city} onChange={handleChange('city')} placeholder="e.g. Greater Noida" style={inp('city')} />
                  {err('city')}
                </div>

                {/* Languages */}
                <div>
                  <label style={lbl}>Languages Known</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
                    {LANGUAGES.map(lang => {
                      const selected = formData.languages.includes(lang);
                      return (
                        <label key={lang} style={{
                          display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                          padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                          border: `1.5px solid ${selected ? '#10b981' : '#d1d5db'}`,
                          background: selected ? '#f0fdf4' : '#fff',
                        }}>
                          <input type="checkbox" checked={selected} onChange={() => handleLangToggle(lang)} style={{ accentColor: '#10b981', width: 15, height: 15 }} />
                          {lang}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => { setAgreedToTerms(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms: undefined })); }}
                      style={{ accentColor: '#10b981', width: 17, height: 17, marginTop: 2, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                      I confirm that I am applying as an independent Channel Partner, I agree to Growperty's{' '}
                      <Link to="/terms?type=cp" target="_blank" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'underline' }}>
                        Channel Partner Terms &amp; Conditions
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" target="_blank" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'underline' }}>
                        Privacy Policy
                      </Link>
                      , and I will not bypass the Platform, misuse shared links, or engage in off-platform deals for Growperty-generated opportunities.
                    </span>
                  </label>
                  {err('terms')}
                </div>

                {/* WhatsApp Alerts Consent */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={agreedToWhatsapp}
                      onChange={(e) => { setAgreedToWhatsapp(e.target.checked); if (errors.whatsapp) setErrors(p => ({ ...p, whatsapp: undefined })); }}
                      style={{ accentColor: '#10b981', width: 17, height: 17, marginTop: 2, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
                      I agree to receive <MessageCircle style={{ display: 'inline', width: 14, height: 14, color: '#10b981', verticalAlign: -2 }} />{' '}
                      <strong style={{ color: '#10b981', fontWeight: 700 }}>WhatsApp</strong> Leads inquery & visits alerts &amp; updates.
                    </span>
                  </label>
                  {err('whatsapp')}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !otpVerified || !agreedToTerms || !agreedToWhatsapp}
                  style={{
                    width: '100%',
                    background: (!otpVerified || !agreedToTerms || !agreedToWhatsapp) ? '#9ca3af' : submitting ? '#9ca3af' : '#10b981',
                    color: '#fff', border: 'none', borderRadius: 8,
                    padding: '12px 0', fontSize: 15, fontWeight: 700,
                    cursor: submitting || !otpVerified || !agreedToTerms || !agreedToWhatsapp ? 'not-allowed' : 'pointer',
                    marginTop: 4,
                  }}
                >
                  {submitting ? 'Submitting…' : !otpVerified ? 'Verify phone to submit' : (!agreedToTerms || !agreedToWhatsapp) ? 'Accept Terms to submit' : 'Submit Application'}
                </button>

              </div>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
              Already a partner?{' '}
              <Link to="/cp/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
