import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';

export default function CpSetupPage() {
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get('token');
  const navigate        = useNavigate();
  const { cpLoginDirect } = useCpAuth();

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none',
    background: '#fff', color: '#111', boxSizing: 'border-box',
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 12 }}>Invalid or missing setup link.</p>
          <Link to="/cp/login" style={{ color: '#10b981', fontWeight: 600 }}>Go to Login</Link>
        </div>
      </div>
    );
  }

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
        body: JSON.stringify({ token, password }),
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
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 6 }}>Password set successfully!</h2>
                <p style={{ color: '#6b7280', fontSize: 14 }}>Redirecting to your dashboard…</p>
              </div>
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

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
                  Already have a password?{' '}
                  <Link to="/cp/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
