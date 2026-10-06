import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Lock, ArrowRight, ShieldCheck, KeyRound, Handshake } from 'lucide-react';
import { SKY_BG, FEATURES, STATS, WHY, CP_PORTAL_CSS } from '@/components/cpPortalShared.jsx';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';

// Clean, background-free photo of the hero person — drop the file at
// apps/web/public/cp-login-man.png. Hidden automatically while missing.
const HERO_PERSON = '/cp-login-man.png';


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
  const [personOk, setPersonOk]     = useState(true);

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

  return (
    <>
      <Helmet>
        <title>CP Login — Growperty</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap" rel="stylesheet" />
      </Helmet>
      <style>{CP_PORTAL_CSS}</style>
      <div className="cpl-root">
        <section className="cpl-hero">
          <div className="cpl-sky" style={{ backgroundImage: `url('${SKY_BG}')` }} />
          <div className="cpl-wash" />
          <div className="cpl-inner">
            <div className="cpl-top">
              <Link to="/"><img className="cpl-logo" src="/growperty-logo.png" alt="Growperty" /></Link>
              <div className="cpl-apply-top">
                Are you a new partner?<Link to="/become-channel-partner">Apply Now →</Link>
              </div>
            </div>

            <div className="cpl-left">
              <div className="cpl-badge"><Handshake size={18} /> CHANNEL PARTNER PORTAL</div>
              <h1 className="cpl-h1">Grow Together<br />in <span>Real Estate</span></h1>
              <p className="cpl-lead">Access verified properties, genuine buyers and powerful tools – all in one platform.</p>

              <div className="cpl-feats">
                {FEATURES.map(({ icon: Icon, label, bg }) => (
                  <div className="cpl-feat" key={label}>
                    <i style={{ background: bg }}><Icon size={26} /></i>
                    {label}
                  </div>
                ))}
              </div>

              <div className="cpl-brush cpl-d-only">Your<br />Property Business<b>Our Technology</b></div>

              {personOk && (
                <img className="cpl-person" src={HERO_PERSON} alt="" onError={() => setPersonOk(false)} />
              )}
              {personOk && (
                <div className="cpl-hand">Bigger Network<br />More Deals<br />Higher Earnings</div>
              )}
            </div>

            <div className="cpl-right">
              <div className="cpl-card">
                <img className="cpl-card-logo" src="/growperty-logo.png" alt="Growperty" />
                <h2>Welcome Back, Partner! 👋</h2>
                <p className="sub">
                  {showPasswordLogin
                    ? 'Use your mobile number, email, or CP ID with your password.'
                    : 'Login to access your dashboard and manage your business with Growperty.'}
                </p>

                {error && <div className="cpl-err">{error}</div>}

                {!showPasswordLogin ? (
                  <>
                    <button type="button" className="cpl-wa" onClick={handleWhatsappLogin}>
                      <MessageCircle size={20} /> Login with WhatsApp <ArrowRight size={18} />
                    </button>
                    <div className="cpl-secure">
                      <span><ShieldCheck size={15} /> Secure &amp; Safe Login</span>
                      <em />
                      <span><KeyRound size={15} /> No Password Needed</span>
                    </div>
                    <div className="cpl-or">or</div>
                    <button type="button" className="cpl-alt" onClick={() => { setShowPasswordLogin(true); setError(''); }}>
                      <Lock size={16} /> Login with ID &amp; Password
                    </button>
                  </>
                ) : (
                  <form onSubmit={handlePasswordLogin} noValidate>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label className="cpl-label">Mobile / Email / CP ID</label>
                        <input
                          className="cpl-input" type="text" value={identifier} autoFocus autoComplete="username"
                          onChange={e => { setIdentifier(e.target.value); if (error) setError(''); }}
                          placeholder="9999999999 / you@email.com / GP0068140626"
                        />
                      </div>
                      <div>
                        <label className="cpl-label">Password</label>
                        <input
                          className="cpl-input" type="password" value={password} autoComplete="current-password"
                          onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                          placeholder="Your password"
                        />
                      </div>
                      <button type="submit" className="cpl-wa" disabled={submitting} style={submitting ? { background: '#9ca3af', boxShadow: 'none' } : undefined}>
                        <Lock size={17} /> {submitting ? 'Signing in…' : 'Sign In'}
                      </button>
                    </div>
                    <div className="cpl-foot" style={{ marginTop: 16 }}>
                      Prefer OTP?{' '}
                      <button type="button" onClick={() => { setShowPasswordLogin(false); setError(''); }}>Login with WhatsApp</button>
                    </div>
                  </form>
                )}

                <div className="cpl-foot">
                  Not a partner yet? <Link to="/become-channel-partner">Apply Now →</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="cpl-stats">
          <div className="cpl-stats-in">
            {STATS.map(({ icon: Icon, title, sub }) => (
              <div className="cpl-stat" key={title}>
                <Icon strokeWidth={1.6} />
                <div><b>{title}</b><small>{sub}</small></div>
              </div>
            ))}
          </div>
        </div>

        <section className="cpl-why">
          <h3>Why <span>Grow with Growperty?</span></h3>
          <div className="bar" />
          <div className="cpl-why-grid">
            {WHY.map(({ icon: Icon, bg, color, title, text }) => (
              <div className="cpl-why-card" key={title}>
                <i style={{ background: bg, color }}><Icon size={28} /></i>
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
