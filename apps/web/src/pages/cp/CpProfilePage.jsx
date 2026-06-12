import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const C = {
  surface: '#0d1b2a',
  border:  '#1e2d3d',
  text:    '#e6edf3',
  sub:     '#94aabf',
  green:   '#1d9e75',
};

export default function CpProfilePage() {
  const { currentCp, token } = useCpAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({
    name:        currentCp?.name        || '',
    phone:       currentCp?.phone       || '',
    companyName: currentCp?.companyName || '',
    city:        currentCp?.city        || '',
  });

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
    background: '#0d1117',
    color: C.text,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const Field = ({ label, value, field, readOnly }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
      {editing && !readOnly ? (
        <input type="text" value={form[field] || ''} onChange={handleChange(field)} style={inputStyle} />
      ) : (
        <div style={{ fontSize: 14, color: C.text, padding: '9px 0' }}>{value || '—'}</div>
      )}
    </div>
  );

  return (
    <>
      <Helmet><title>Profile — CP Dashboard</title></Helmet>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Profile</h1>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '28px 24px', maxWidth: 540 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Field label="Full Name"     value={currentCp?.name}        field="name"        />
          <Field label="Email"         value={currentCp?.email}       field="email"       readOnly />
          <Field label="Phone"         value={currentCp?.phone}       field="phone"       />
          <Field label="Company"       value={currentCp?.companyName} field="companyName" />
          <Field label="City"          value={currentCp?.city}        field="city"        />
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, textTransform: 'uppercase', letterSpacing: 0.4 }}>Status</label>
            <div style={{ marginTop: 5 }}>
              <span style={{
                background: '#06422922', color: '#34d399',
                fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              }}>
                Approved
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: C.green, color: '#fff', border: 'none', borderRadius: 7,
                  padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  background: 'transparent', border: `1px solid ${C.border}`, color: C.sub,
                  borderRadius: 7, padding: '9px 16px', fontSize: 13, cursor: 'pointer',
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
                borderRadius: 7, padding: '9px 20px', fontSize: 13, cursor: 'pointer', fontWeight: 500,
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </>
  );
}
