import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { formatIndianPrice } from '@/hooks/useProperties.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { MapPin, Phone, MessageCircle, Bed, Maximize, IndianRupee } from 'lucide-react';
import ImageSlider from '@/components/ImageSlider.jsx';
import { API_SERVER_URL } from '@/lib/apiServerClient.js';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=70';

// ── Small property card (store variant) ──────────────────────────
function StorePropertyCard({ property, cp }) {
  const navigate = useNavigate();
  const title = [property.bhk, property.propertyType].filter(Boolean).join(' ') || 'Property';
  const location = [property.sector, property.city].filter(Boolean).join(', ');
  const price = formatIndianPrice(property.totalPrice);
  const propId = property._id || property.id;
  // Listing photos are stored as data: URIs (or http URLs) — both are valid <img> sources.
  const img = property.images?.[0];
  const hasPhoto = !!img && (img.startsWith('http') || img.startsWith('data:'));

  const waMsg = encodeURIComponent(`Hi ${cp.name}, I'm interested in this property: ${window.location.origin}/property/${property._id || property.id}`);
  const waLink = `https://wa.me/91${cp.phone.replace(/\D/g, '').slice(-10)}?text=${waMsg}`;

  return (
    <div style={{
      background: '#fff', borderRadius: 14, overflow: 'hidden',
      border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div
        className="group overflow-hidden"
        style={{ position: 'relative', aspectRatio: '16/9', cursor: 'pointer' }}
        onClick={() => navigate(`/property/${propId}`)}
      >
        {hasPhoto ? (
          <ImageSlider
            images={[img]}
            count={Number(property.imageCount) || 1}
            getUrl={(i) => `${API_SERVER_URL}/properties/${propId}/images/${i}?w=640`}
            alt={title}
            dotsTop={10}
          />
        ) : (
          <img src={PLACEHOLDER} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          background: 'rgba(0,0,0,0.65)', color: '#fff',
          fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
        }}>
          {price}
        </div>
      </div>
      <div style={{ padding: '14px 16px', flex: 1 }}>
        <div
          style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4, cursor: 'pointer' }}
          onClick={() => navigate(`/property/${property._id || property.id}`)}
        >
          {title}
        </div>
        {location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 10 }}>
            <MapPin size={12} /> {location}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b', marginBottom: 14 }}>
          {property.bhk && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Bed size={12} />{property.bhk}</span>}
          {property.totalArea && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Maximize size={12} />{property.totalArea} {property.areaUnit || 'sq.ft'}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={`tel:${cp.phone}`}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              background: '#0ea5e9', color: '#fff', borderRadius: 8,
              padding: '8px 0', fontWeight: 600, fontSize: 12, textDecoration: 'none',
            }}
          >
            <Phone size={13} /> Call
          </a>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              background: '#25D366', color: '#fff', borderRadius: 8,
              padding: '8px 0', fontWeight: 600, fontSize: 12, textDecoration: 'none',
            }}
          >
            <MessageCircle size={13} /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Buyer Enquiry Form ────────────────────────────────────────────
function BuyerEnquiryForm({ shareToken }) {
  const [form, setForm] = useState({
    buyerName: '', buyerPhone: '', propertyType: '', preferredBhk: '',
    city: '', maxBudget: '', specialRequirements: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const inp = (field) => ({
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
    background: '#fff', color: '#111', boxSizing: 'border-box',
  });

  const handle = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.buyerName.trim() || !form.buyerPhone.trim()) {
      setError('Name and phone are required'); return;
    }
    setSubmitting(true); setError('');
    try {
      const res = await apiServerClient.fetch(`/cp/store/${shareToken}/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit'); return; }
      setDone(true);
    } catch { setError('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Requirement Submitted!</h3>
      <p style={{ color: '#64748b', fontSize: 14 }}>The partner will get in touch with you shortly.</p>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ maxWidth: 520, margin: '0 auto', padding: '8px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Your Name *</label>
          <input value={form.buyerName} onChange={handle('buyerName')} placeholder="Rahul Sharma" style={inp('buyerName')} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Phone *</label>
          <input value={form.buyerPhone} onChange={handle('buyerPhone')} placeholder="10-digit mobile" maxLength={10} style={inp('buyerPhone')} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Property Type</label>
          <select value={form.propertyType} onChange={handle('propertyType')} style={{ ...inp(), appearance: 'auto' }}>
            <option value="">Any</option>
            <option>Flat/Apartment</option>
            <option>Plot/Land</option>
            <option>Independent House/Villa</option>
            <option>Commercial</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>BHK / Config</label>
          <select value={form.preferredBhk} onChange={handle('preferredBhk')} style={{ ...inp(), appearance: 'auto' }}>
            <option value="">Any</option>
            <option>1 BHK</option><option>2 BHK</option><option>3 BHK</option>
            <option>4 BHK</option><option>4+ BHK</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Preferred City / Area</label>
          <input value={form.city} onChange={handle('city')} placeholder="e.g. Greater Noida" style={inp()} />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Max Budget</label>
          <input value={form.maxBudget} onChange={handle('maxBudget')} placeholder="e.g. 5000000" type="number" style={inp()} />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Special Requirements</label>
        <textarea value={form.specialRequirements} onChange={handle('specialRequirements')} placeholder="Any specific needs..." rows={3}
          style={{ ...inp(), resize: 'vertical' }} />
      </div>
      {error && <p style={{ color: '#e53e3e', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      <button
        type="submit" disabled={submitting}
        style={{
          width: '100%', padding: '12px 0', background: submitting ? '#9ca3af' : '#1d9e75',
          color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700,
          fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Submitting…' : 'Submit Requirement'}
      </button>
    </form>
  );
}

// ── Main Store Page ───────────────────────────────────────────────
export default function CpStorePage() {
  const { shareToken, tab } = useParams();
  const navigate = useNavigate();

  const [cp, setCp]               = useState(null);
  const [listings, setListings]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const activeTab = tab === 'buyers' ? 'buyers' : 'listings';

  useEffect(() => {
    apiServerClient.fetch(`/cp/store/${shareToken}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setCp(data.cp))
      .catch(() => setError('Partner page not found.'));
  }, [shareToken]);

  useEffect(() => {
    if (activeTab !== 'listings') return;
    setLoading(true);
    apiServerClient.fetch(`/cp/store/${shareToken}/listings?page=${page}&limit=12`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setListings(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shareToken, activeTab, page]);

  if (error) return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b', fontSize: 16 }}>{error}</p>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Helmet>
        <title>{cp ? `${cp.name}${cp.companyName ? ` — ${cp.companyName}` : ''} | Growperty` : 'Channel Partner | Growperty'}</title>
      </Helmet>
      <Header />
      <main style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* ── CP Profile Banner ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #1d9e75, #0ea5e9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {cp?.name?.[0] || '?'}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                  {cp?.name || '…'}
                </h1>
                {cp?.companyName && <p style={{ margin: '2px 0 0', fontSize: 14, color: '#64748b', fontWeight: 500 }}>{cp.companyName}</p>}
                <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                  {cp?.city && <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={12} />{cp.city}</span>}
                  {cp?.experienceYrs > 0 && <span style={{ fontSize: 12, color: '#64748b' }}>📈 {cp.experienceYrs}yr experience</span>}
                  {cp?.languages?.length > 0 && <span style={{ fontSize: 12, color: '#64748b' }}>🗣 {cp.languages.join(', ')}</span>}
                </div>
              </div>
              {cp && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                  <a href={`tel:${cp.phone}`} style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: '#0ea5e9', color: '#fff',
                    padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none',
                  }}>
                    <Phone size={14} /> Call
                  </a>
                  <a href={`https://wa.me/91${cp.phone.replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 6, background: '#25D366', color: '#fff',
                    padding: '9px 18px', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none',
                  }}>
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </div>
              )}
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb' }}>
              {[
                { key: 'listings', label: `Listings${total ? ` (${total})` : ''}` },
                { key: 'buyers',   label: 'Submit Requirement' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => navigate(`/cp/${shareToken}/${t.key}`, { replace: true })}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '12px 22px', fontSize: 14, fontWeight: 600,
                    color: activeTab === t.key ? '#1d9e75' : '#64748b',
                    borderBottom: activeTab === t.key ? '2px solid #1d9e75' : '2px solid transparent',
                    marginBottom: -1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 60px' }}>

          {activeTab === 'listings' && (
            <>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '60px 0' }}>Loading listings…</p>
              ) : listings.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '60px 0' }}>No listings available yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {listings.map(p => cp && <StorePropertyCard key={p._id || p.id} property={p} cp={cp} />)}
                </div>
              )}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 32 }}>
                  <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                    style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#374151' }}>← Prev</button>
                  <span style={{ padding: '8px 12px', color: '#64748b', fontSize: 13 }}>{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                    style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#374151' }}>Next →</button>
                </div>
              )}
            </>
          )}

          {activeTab === 'buyers' && cp && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Submit Your Requirement</h2>
                <p style={{ color: '#64748b', fontSize: 14 }}>Tell {cp.name} what you're looking for and they'll find it for you.</p>
              </div>
              <BuyerEnquiryForm shareToken={shareToken} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
