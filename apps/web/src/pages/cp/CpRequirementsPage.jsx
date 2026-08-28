import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const C = {
  surface: '#ffffff',
  border:  '#e5e7eb',
  text:    '#111827',
  muted:   '#9ca3af',
  sub:     '#6b7280',
  greenDark: '#059669',
};

const CITY_OPTIONS = ['Noida', 'Greater Noida', 'YEIDA'];
const PROPERTY_TYPES = ['Flat/Apartment', 'Studio', 'House/Villa', 'Penthouse', 'Farm House', 'Plot/Land', 'Commercial'];
const BHK_TYPES = ['Flat/Apartment', 'House/Villa', 'Penthouse', 'Farm House'];
const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

const fmt = (n) => {
  if (!n) return '—';
  const v = Number(n);
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(1).replace(/\.0$/, '')} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(1).replace(/\.0$/, '')} L`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const inputStyle = {
  width: '100%', height: 42, padding: '0 12px', borderRadius: 8,
  border: `1.5px solid ${C.border}`, fontSize: 13, outline: 'none',
  background: '#fff', color: C.text, boxSizing: 'border-box',
};
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 5 };

const EMPTY_FORM = {
  buyerName: '', buyerPhone: '', buyerCity: '',
  propertyType: '', preferredBhk: '', city: '', areas: '',
  minBudget: '', maxBudget: '', specialRequirements: '',
};

export default function CpRequirementsPage() {
  const { token } = useCpAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/cp/requirements?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setItems(data.items);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchRequirements(); }, [fetchRequirements]);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const showBhk = BHK_TYPES.includes(form.propertyType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.buyerName.trim() || !form.buyerPhone.trim() || !form.propertyType || !form.city || !form.maxBudget) {
      toast.error('Fill in buyer name, phone, property type, city, and max budget');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        buyerName: form.buyerName.trim(),
        buyerPhone: form.buyerPhone.trim(),
        buyerCity: form.buyerCity.trim(),
        propertyType: form.propertyType,
        preferredBhk: form.preferredBhk,
        city: form.city,
        areas: form.areas.split(',').map(a => a.trim()).filter(Boolean),
        minBudget: form.minBudget ? Number(form.minBudget) : 0,
        maxBudget: Number(form.maxBudget),
        specialRequirements: form.specialRequirements.trim(),
      };
      const res = await apiServerClient.fetch('/cp/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post requirement');
      toast.success('Requirement posted');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchRequirements();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <Helmet><title>Requirements — CP Dashboard</title></Helmet>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>Requirement</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.muted }}>Post a buyer's requirement and we'll match it to listings</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: C.greenDark, color: '#fff', border: 'none',
            borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ Add Requirement'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
            padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Buyer Name *</label>
              <input style={inputStyle} value={form.buyerName} onChange={e => updateField('buyerName', e.target.value)} placeholder="Buyer's full name" />
            </div>
            <div>
              <label style={labelStyle}>Buyer Phone (WhatsApp) *</label>
              <input style={inputStyle} value={form.buyerPhone} onChange={e => updateField('buyerPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" />
            </div>
            <div>
              <label style={labelStyle}>Buyer's City</label>
              <input style={inputStyle} value={form.buyerCity} onChange={e => updateField('buyerCity', e.target.value)} placeholder="e.g. Delhi, Mumbai…" />
            </div>
            <div>
              <label style={labelStyle}>Looking In (Zone) *</label>
              <select style={inputStyle} value={form.city} onChange={e => updateField('city', e.target.value)}>
                <option value="">Select Zone</option>
                {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Property Type *</label>
              <select style={inputStyle} value={form.propertyType} onChange={e => updateField('propertyType', e.target.value)}>
                <option value="">Select Type</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {showBhk && (
              <div>
                <label style={labelStyle}>Preferred BHK</label>
                <select style={inputStyle} value={form.preferredBhk} onChange={e => updateField('preferredBhk', e.target.value)}>
                  <option value="">Any</option>
                  {BHK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={labelStyle}>Preferred Sectors / Areas</label>
              <input style={inputStyle} value={form.areas} onChange={e => updateField('areas', e.target.value)} placeholder="e.g. Alpha 1, Phi 4 (comma separated)" />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Min Budget</label>
                <input style={inputStyle} type="number" value={form.minBudget} onChange={e => updateField('minBudget', e.target.value)} placeholder="0" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Max Budget *</label>
                <input style={inputStyle} type="number" value={form.maxBudget} onChange={e => updateField('maxBudget', e.target.value)} placeholder="e.g. 5000000" />
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Special Requirements</label>
            <textarea
              style={{ ...inputStyle, height: 70, padding: '10px 12px', resize: 'none' }}
              value={form.specialRequirements}
              onChange={e => updateField('specialRequirements', e.target.value)}
              placeholder="e.g. near metro, east facing, quick possession…"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: submitting ? '#9ca3af' : C.greenDark, color: '#fff', border: 'none',
              borderRadius: 8, padding: '11px 24px', fontWeight: 700, fontSize: 14,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Posting…' : 'Post Requirement'}
          </button>
        </form>
      )}

      <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 100px', minWidth: 640,
            padding: '11px 20px', borderBottom: `1px solid ${C.border}`, background: '#f9fafb',
            color: C.muted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <div>Buyer</div><div>Looking For</div><div>Budget</div><div>Location</div><div>Posted</div>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: C.muted, fontSize: 14 }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No requirements posted yet</div>
              <div style={{ fontSize: 13, color: C.muted }}>Add a buyer's requirement and we'll match it to listings.</div>
            </div>
          ) : (
            items.map((r, i) => {
              const typeLabel = [r.preferredBhk, r.propertyType].filter(Boolean).join(' ') || '—';
              const areas = Array.isArray(r.areas) && r.areas.length ? r.areas.slice(0, 2).join(', ') : (r.city || '—');
              return (
                <div key={r.id} style={{
                  display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 100px', minWidth: 640,
                  padding: '13px 20px', alignItems: 'center',
                  borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{r.buyerName}</div>
                    {r.buyerPhone && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>📞 {r.buyerPhone}</div>}
                  </div>
                  <div style={{ fontSize: 13, color: C.sub }}>{typeLabel}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{fmt(r.maxBudget)}</div>
                  <div style={{ fontSize: 12, color: C.sub }}>{areas}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{fmtDate(r.createdAt)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
