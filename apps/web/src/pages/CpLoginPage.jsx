import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';

export default function CpLoginPage() {
  const { cpLogin, isCpAuthenticated, isLoading } = useCpAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/cp/dashboard';

  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  if (isLoading) return null;
  if (isCpAuthenticated) return <Navigate to={from} replace />;

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      setError('Please enter your ID and password');
      return;
    }
    setLoading(true);
    try {
      await cpLogin(formData.identifier, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
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
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo / branding */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>Growperty</span>
            </Link>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Channel Partner Portal</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: '36px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Sign in to your account</h2>
            <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 24 }}>Use your mobile number, email, or CP ID (e.g. GP0068140626)</p>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: '#dc2626', fontSize: 14 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Mobile / Email / CP ID</label>
                  <input
                    type="text"
                    value={formData.identifier}
                    onChange={handleChange('identifier')}
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
                    value={formData.password}
                    onChange={handleChange('password')}
                    placeholder="Your password"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#9ca3af' : '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '11px 0',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: 4,
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9ca3af' }}>
              Not a partner yet?{' '}
              <Link to="/become-channel-partner" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Apply here</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
