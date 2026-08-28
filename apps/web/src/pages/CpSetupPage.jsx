import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';

export default function CpSetupPage() {
  const [searchParams]  = useSearchParams();
  const linkToken        = searchParams.get('token');
  const navigate          = useNavigate();
  const { cpLoginDirect } = useCpAuth();

  // Step machine for the self-service (no link token) flow:
  // 'identifier' -> 'otp' -> 'password' -> done
  const [step, setStep] = useState(linkToken ? 'password' : 'identifier');
  const [setupToken, setSetupToken] = useState(linkToken || '');

  const [identifier, setIdentifier] = useState(searchParams.get('identifier') || '');
  const [identifierError, setIdentifierError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otpDelivered, setOtpDelivered] = useState(true);
  const [devOtp, setDevOtp] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [loggedInDirect, setLoggedInDirect] = useState(false);

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none',
    background: '#fff', color: '#111', boxSizing: 'border-box',
  };

  const startResendTimer = () => {
    setResendTimer(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!identifier.trim()) { setIdentifierError('Enter your WhatsApp number'); return; }
    setIdentifierError('');
    setSendingOtp(true);
    try {
      const res  = await apiServerClient.fetch('/cp/setup/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setIdentifierError(data.error || 'Failed to send OTP'); return; }
      setMaskedPhone(data.maskedPhone || '');
      setOtpDelivered(data.delivered !== false);
      setDevOtp(data.devOtp || '');
      setOtpCode(['', '', '', '', '', '']);
      setOtpError('');
      setStep('otp');
      startResendTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch { setIdentifierError('Network error. Please try again.'); }
    finally { setSendingOtp(false); }
  };

  const verifyOtp = async (code) => {
    setVerifyingOtp(true); setOtpError('');
    try {
      const res  = await apiServerClient.fetch('/cp/setup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error || 'Incorrect OTP'); return; }

      if (!data.needsSetup) {
        // Password already set — log straight in, no need to create one again.
        cpLoginDirect(data.token, data.cp);
        setLoggedInDirect(true);
        setDone(true);
        setTimeout(() => navigate('/cp/dashboard', { replace: true }), 1000);
        return;
      }
      setSetupToken(data.setupToken);
      setStep('password');
    } catch { setOtpError('Network error. Please try again.'); }
    finally { setVerifyingOtp(false); }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const res  = await apiServerClient.fetch('/cp/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: setupToken, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Setup failed'); return; }

      cpLoginDirect(data.token, data.cp);

      setDone(true);
      setTimeout(() => navigate('/cp/dashboard', { replace: true }), 1500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Set Your Password — Growperty CP</title></Helmet>
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>Growperty</span>
            </Link>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Channel Partner Portal</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            {done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 6 }}>{loggedInDirect ? 'Logged in successfully!' : 'Password set successfully!'}</h2>
                <p style={{ color: '#6b7280', fontSize: 14 }}>Redirecting to your dashboard…</p>
              </div>
            ) : step === 'identifier' ? (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Login with WhatsApp OTP</h2>
                <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 24 }}>
                  Enter your WhatsApp number. We'll verify it's you via WhatsApp OTP — if this is your first login, you'll create a password next; otherwise you'll be signed in directly.
                </p>

                {identifierError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
                    {identifierError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>WhatsApp Number</label>
                    <input
                      type="tel"
                      value={identifier}
                      onChange={e => { setIdentifier(e.target.value); setIdentifierError(''); }}
                      placeholder="Enter 10-digit number"
                      style={inp}
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    style={{
                      width: '100%', background: sendingOtp ? '#9ca3af' : '#10b981',
                      color: '#fff', border: 'none', borderRadius: 8,
                      padding: '11px 0', fontSize: 15, fontWeight: 700,
                      cursor: sendingOtp ? 'not-allowed' : 'pointer', marginTop: 4,
                    }}
                  >
                    {sendingOtp ? 'Sending OTP…' : 'Send OTP'}
                  </button>
                </div>
              </>
            ) : step === 'otp' ? (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Enter OTP</h2>
                <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20 }}>
                  {maskedPhone ? `OTP sent to your WhatsApp number ${maskedPhone}` : 'OTP sent to your registered WhatsApp number'}
                </p>

                <div style={{ padding: '16px', background: otpDelivered ? '#f0fdf4' : '#fffbeb', borderRadius: 10, border: `1px solid ${otpDelivered ? '#bbf7d0' : '#fcd34d'}`, marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: otpDelivered ? '#15803d' : '#92400e', fontWeight: 600, marginBottom: 12 }}>
                    {otpDelivered
                      ? 'Enter the 6-digit OTP sent to your WhatsApp'
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

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || resendTimer > 0}
                  style={{
                    width: '100%', background: 'transparent', color: resendTimer > 0 ? '#9ca3af' : '#10b981',
                    border: 'none', fontSize: 13, fontWeight: 600,
                    cursor: resendTimer > 0 ? 'not-allowed' : 'pointer', padding: '4px 0',
                  }}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Create your password</h2>
                <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 24 }}>
                  Set a password to access your Channel Partner dashboard. You can login with your mobile number, email, or CP ID.
                </p>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>New Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(''); }}
                        placeholder="Min. 6 characters"
                        style={inp}
                        autoFocus
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Confirm Password</label>
                      <input
                        type="password"
                        value={confirm}
                        onChange={e => { setConfirm(e.target.value); setError(''); }}
                        placeholder="Re-enter password"
                        style={inp}
                        autoComplete="new-password"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%', background: loading ? '#9ca3af' : '#10b981',
                        color: '#fff', border: 'none', borderRadius: 8,
                        padding: '11px 0', fontSize: 15, fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4,
                      }}
                    >
                      {loading ? 'Setting up…' : 'Set Password & Sign In'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {!done && (
              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
                Already have a password?{' '}
                <Link to="/cp/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
