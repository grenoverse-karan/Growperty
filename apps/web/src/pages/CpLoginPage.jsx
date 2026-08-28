import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Lock, TrendingUp, Sparkles } from 'lucide-react';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';

const HERO_BG = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop';

export default function CpLoginPage() {
  const { isCpAuthenticated, isLoading, cpLogin } = useCpAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/cp/dashboard';

  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (isCpAuthenticated) return <Navigate to={from} replace />;

  const handleWhatsappLogin = () => navigate('/cp/newpassword');

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) { setError('Please enter your ID/mobile/email and password'); return; }
    setError('');
    setSubmitting(true);
    try {
      await cpLogin(identifier.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid #d1d5db',
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    color: '#111',
    boxSizing: 'border-box',
  };

  return (
    <>
      <Helmet><title>CP Login — Growperty</title></Helmet>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #064e3b 0%, #047857 38%, #0f172a 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${HERO_BG}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.18, mixBlendMode: 'overlay',
        }} />
        {/* Decorative glow blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)' }} />

        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ width: '100%', maxWidth: 440 }}>

            {/* Hero / branding */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 18 }}>
                <img src="/growperty-logo.png" alt="Growperty" style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
              </Link>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 999, padding: '5px 14px', marginBottom: 14,
              }}>
                <Sparkles style={{ width: 13, height: 13, color: '#6ee7b7' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#d1fae5', letterSpacing: 0.3 }}>CHANNEL PARTNER PORTAL</span>
              </div>

              <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: -0.5, lineHeight: 1.15 }}>
                Welcome, Partner 🎉
              </h1>
              <p style={{ fontSize: 15, color: '#d1fae5', margin: 0, fontWeight: 500, lineHeight: 1.5 }}>
                Start your journey. <span style={{ color: '#fff', fontWeight: 700 }}>Grow with Growperty.</span>
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 20 }}>
                {[
                  { icon: TrendingUp, label: 'Earn More' },
                  { icon: Sparkles, label: 'Exclusive Leads' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d1fae5', fontSize: 12.5, fontWeight: 600 }}>
                    <Icon style={{ width: 14, height: 14, color: '#6ee7b7' }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Login card */}
            <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Sign in to your account</h2>
              <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 24 }}>
                {showPasswordLogin ? 'Use your mobile number, email, or CP ID with your password' : 'Verify with a WhatsApp OTP to continue'}
              </p>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
                  {error}
                </div>
              )}

              {!showPasswordLogin ? (
                <button
                  type="button"
                  onClick={handleWhatsappLogin}
                  style={{
                    width: '100%', background: '#10b981', color: '#fff',
                    border: 'none', borderRadius: 8, padding: '11px 0',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <MessageCircle style={{ width: 17, height: 17 }} />
                  Login with WhatsApp
                </button>
              ) : (
                <form onSubmit={handlePasswordLogin} noValidate>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Mobile / Email / CP ID</label>
                      <input
                        type="text"
                        value={identifier}
                        onChange={e => { setIdentifier(e.target.value); if (error) setError(''); }}
                        placeholder="9999999999 / you@email.com / GP0068140626"
                        style={inputStyle}
                        autoFocus
                        autoComplete="username"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                        placeholder="Your password"
                        style={inputStyle}
                        autoComplete="current-password"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        width: '100%', background: submitting ? '#9ca3af' : '#10b981', color: '#fff',
                        border: 'none', borderRadius: 8, padding: '11px 0',
                        fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}
                    >
                      <Lock style={{ width: 16, height: 16 }} />
                      {submitting ? 'Signing in…' : 'Sign In'}
                    </button>
                  </div>
                </form>
              )}

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
                {showPasswordLogin ? (
                  <>Prefer OTP?{' '}
                    <button type="button" onClick={() => { setShowPasswordLogin(false); setError(''); }} style={{ color: '#10b981', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                      Login with WhatsApp
                    </button>
                  </>
                ) : (
                  <>Have a password?{' '}
                    <button type="button" onClick={() => { setShowPasswordLogin(true); setError(''); }} style={{ color: '#10b981', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                      Login with ID & Password
                    </button>
                  </>
                )}
              </p>

              <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#9ca3af' }}>
                Not a partner yet?{' '}
                <Link to="/become-channel-partner" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Apply here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
