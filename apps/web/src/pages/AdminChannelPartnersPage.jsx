import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const C = {
  bg:      '#0d1117',
  surface: '#0d1b2a',
  border:  '#1e2d3d',
  text:    '#e6edf3',
  muted:   '#4d6175',
  sub:     '#94aabf',
  hover:   '#132236',
  red:     '#c0392b',
  green:   '#1d9e75',
  amber:   '#d97706',
  blue:    '#185fa5',
};

const STATUS_COLOR = {
  pending:  '#fbbf24',
  approved: '#34d399',
  rejected: '#f87171',
  banned:   '#f97316',
};

const ACCESS_LABELS = {
  canAddListings:    'Add Listings',
  canViewLeads:      'View Leads',
  canViewVisits:     'View Visits',
  canViewActivities: 'View Activities',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const inp = (err) => ({
  width: '100%', padding: '9px 12px', borderRadius: 7,
  border: `1px solid ${err ? '#e53e3e' : C.border}`,
  background: '#0d1117', color: C.text, fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
});

const Btn = ({ onClick, disabled, color = C.green, outline, children, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: outline ? 'transparent' : color,
      border: `1px solid ${color}`,
      color: outline ? color : '#fff',
      borderRadius: 6, padding: '5px 12px',
      fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      ...style,
    }}
  >
    {children}
  </button>
);

const Dialog = ({ title, onClose, children, maxWidth = 440 }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '26px 24px', width: '100%', maxWidth }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.sub, fontSize: 18, cursor: 'pointer' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, field, type = 'text', form, setForm }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
    <input type={type} value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={inp()} />
  </div>
);

export default function AdminChannelPartnersPage() {
  const { token } = useAdminAuth();

  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [acting, setActing]     = useState(false);

  // Dialog states
  const [approveTarget, setApproveTarget] = useState(null);
  const [approvePass, setApprovePass]     = useState('');

  const [editTarget, setEditTarget]   = useState(null);
  const [editForm, setEditForm]       = useState({});

  const [banTarget, setBanTarget]     = useState(null);
  const [banType, setBanType]         = useState('temporary');
  const [banDays, setBanDays]         = useState(7);

  const [accessTarget, setAccessTarget] = useState(null);
  const [accessForm, setAccessForm]     = useState({});

  const [detailTarget, setDetailTarget] = useState(null);
  const [detail, setDetail]             = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const authH = { Authorization: `Bearer ${token}` };

  const fetchItems = useCallback(async (pg = 1, status = '') => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: pg, limit: 50 });
      if (status) p.set('status', status);
      const res  = await apiServerClient.fetch(`/admin/channel-partners?${p}`, { headers: authH });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(pg);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchItems(1, statusFilter); }, [fetchItems, statusFilter]);

  const call = async (url, method, body) => {
    setActing(true);
    try {
      const res  = await apiServerClient.fetch(url, {
        method,
        headers: { ...authH, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      return data;
    } finally {
      setActing(false);
    }
  };

  /* ── Approve ── */
  const handleApprove = async () => {
    if (!approvePass || approvePass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      await call(`/admin/channel-partners/${approveTarget.id}/approve`, 'PUT', { password: approvePass });
      toast.success(`${approveTarget.name} approved`);
      setApproveTarget(null);
      fetchItems(page, statusFilter);
    } catch (err) { toast.error(err.message); }
  };

  /* ── Reject ── */
  const handleReject = async (cp) => {
    if (!window.confirm(`Reject "${cp.name}"?`)) return;
    try {
      await call(`/admin/channel-partners/${cp.id}/reject`, 'PUT');
      toast.success('Rejected');
      fetchItems(page, statusFilter);
    } catch (err) { toast.error(err.message); }
  };

  /* ── Edit ── */
  const openEdit = (cp) => { setEditTarget(cp); setEditForm({ name: cp.name, email: cp.email, phone: cp.phone, companyName: cp.companyName || '', city: cp.city }); };
  const handleEdit = async () => {
    try {
      await call(`/admin/channel-partners/${editTarget.id}`, 'PUT', editForm);
      toast.success('Updated');
      setEditTarget(null);
      fetchItems(page, statusFilter);
    } catch (err) { toast.error(err.message); }
  };

  /* ── Ban ── */
  const openBan = (cp) => { setBanTarget(cp); setBanType('temporary'); setBanDays(7); };
  const handleBan = async () => {
    try {
      await call(`/admin/channel-partners/${banTarget.id}/ban`, 'PUT', { type: banType, days: banType === 'temporary' ? Number(banDays) : undefined });
      toast.success(`${banTarget.name} banned`);
      setBanTarget(null);
      fetchItems(page, statusFilter);
    } catch (err) { toast.error(err.message); }
  };
  const handleUnban = async (cp) => {
    if (!window.confirm(`Unban "${cp.name}"?`)) return;
    try {
      await call(`/admin/channel-partners/${cp.id}/unban`, 'PUT');
      toast.success('Unbanned');
      fetchItems(page, statusFilter);
    } catch (err) { toast.error(err.message); }
  };

  /* ── Access ── */
  const openAccess = (cp) => {
    setAccessTarget(cp);
    setAccessForm({
      canAddListings:    cp.access?.canAddListings    !== false,
      canViewLeads:      cp.access?.canViewLeads      !== false,
      canViewVisits:     cp.access?.canViewVisits     !== false,
      canViewActivities: cp.access?.canViewActivities !== false,
    });
  };
  const handleAccess = async () => {
    try {
      await call(`/admin/channel-partners/${accessTarget.id}/access`, 'PUT', accessForm);
      toast.success('Access updated');
      setAccessTarget(null);
      fetchItems(page, statusFilter);
    } catch (err) { toast.error(err.message); }
  };

  /* ── Delete ── */
  const handleDelete = async (cp) => {
    if (!window.confirm(`Permanently delete "${cp.name}"? This cannot be undone.`)) return;
    try {
      await call(`/admin/channel-partners/${cp.id}`, 'DELETE');
      toast.success('Deleted');
      fetchItems(page, statusFilter);
    } catch (err) { toast.error(err.message); }
  };

  /* ── Detail ── */
  const openDetail = async (cp) => {
    setDetailTarget(cp);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res  = await apiServerClient.fetch(`/admin/channel-partners/${cp.id}`, { headers: authH });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDetail(data);
    } catch (err) { toast.error(err.message); }
    finally { setDetailLoading(false); }
  };

  const TABS = [
    { label: 'All',      value: ''         },
    { label: 'Pending',  value: 'pending'  },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Banned',   value: 'banned'   },
  ];

  return (
    <>
      <Helmet><title>Channel Partners — Admin — Growperty</title></Helmet>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Channel Partners</h1>
            <p style={{ margin: '4px 0 0', color: C.sub, fontSize: 13 }}>{total} total</p>
          </div>
          <button onClick={() => fetchItems(page, statusFilter)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.sub, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
            ↻ Refresh
          </button>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          {TABS.map(tab => {
            const active = tab.value === statusFilter;
            return (
              <button key={tab.value} onClick={() => setStatusFilter(tab.value)} style={{
                background: active ? C.green : C.surface,
                color: active ? '#fff' : C.sub,
                border: `1px solid ${active ? C.green : C.border}`,
                borderRadius: 20, padding: '5px 14px', fontSize: 12,
                fontWeight: active ? 600 : 400, cursor: 'pointer',
              }}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 110px 100px 95px 220px', padding: '11px 16px', borderBottom: `1px solid ${C.border}`, color: C.sub, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 800 }}>
            <div>Name / Company</div>
            <div>Email</div>
            <div>Phone</div>
            <div>City</div>
            <div>Applied</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>No applications found</div>
          ) : (
            items.map((cp, i) => (
              <div key={cp.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 110px 100px 95px 220px', padding: '13px 16px', alignItems: 'center', borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : 'none', minWidth: 800 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cp.name}</div>
                  {cp.companyName && <div style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>{cp.companyName}</div>}
                  <span style={{ display: 'inline-block', marginTop: 3, background: '#00000030', color: STATUS_COLOR[cp.status], fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>
                    {cp.status}{cp.bannedUntil ? ` until ${fmt(cp.bannedUntil)}` : ''}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: C.sub }}>{cp.email}</div>
                <div style={{ fontSize: 13, color: C.sub }}>{cp.phone}</div>
                <div style={{ fontSize: 13, color: C.sub }}>{cp.city}</div>
                <div style={{ fontSize: 12, color: C.sub }}>{fmt(cp.createdAt)}</div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Btn onClick={() => openDetail(cp)} outline color={C.sub}>View</Btn>
                  <Btn onClick={() => openEdit(cp)} outline color={C.blue}>Edit</Btn>

                  {cp.status === 'pending' && (
                    <Btn onClick={() => { setApproveTarget(cp); setApprovePass(''); }}>Approve</Btn>
                  )}
                  {cp.status !== 'approved' && cp.status !== 'banned' && (
                    <Btn onClick={() => handleReject(cp)} outline color={C.red}>Reject</Btn>
                  )}
                  {cp.status === 'approved' && (
                    <Btn onClick={() => openBan(cp)} outline color={C.amber}>Ban</Btn>
                  )}
                  {cp.status === 'banned' && (
                    <Btn onClick={() => handleUnban(cp)} color={C.blue}>Unban</Btn>
                  )}
                  {cp.status === 'approved' && (
                    <Btn onClick={() => openAccess(cp)} outline color={C.sub}>Access</Btn>
                  )}
                  <Btn onClick={() => handleDelete(cp)} outline color={C.red}>Del</Btn>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button onClick={() => fetchItems(page - 1, statusFilter)} disabled={page <= 1} style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>← Prev</button>
            <span style={{ color: C.sub, padding: '6px 12px', fontSize: 13 }}>Page {page} / {totalPages}</span>
            <button onClick={() => fetchItems(page + 1, statusFilter)} disabled={page >= totalPages} style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Next →</button>
          </div>
        )}
      </div>

      {/* ── Approve dialog ── */}
      {approveTarget && (
        <Dialog title={`Approve — ${approveTarget.name}`} onClose={() => setApproveTarget(null)}>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: C.sub }}>Set a login password for this CP. They'll use it to sign in to their dashboard.</p>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Password (min 6 chars)</label>
            <input type="text" value={approvePass} onChange={e => setApprovePass(e.target.value)} placeholder="Set password for CP" style={inp()} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={handleApprove} disabled={acting}>{acting ? 'Approving...' : 'Approve & Set Password'}</Btn>
            <Btn onClick={() => setApproveTarget(null)} outline color={C.sub}>Cancel</Btn>
          </div>
        </Dialog>
      )}

      {/* ── Edit dialog ── */}
      {editTarget && (
        <Dialog title={`Edit — ${editTarget.name}`} onClose={() => setEditTarget(null)}>
          <Field label="Name"    field="name"        form={editForm} setForm={setEditForm} />
          <Field label="Email"   field="email"       form={editForm} setForm={setEditForm} type="email" />
          <Field label="Phone"   field="phone"       form={editForm} setForm={setEditForm} type="tel" />
          <Field label="Company / Office" field="companyName" form={editForm} setForm={setEditForm} />
          <Field label="City"    field="city"        form={editForm} setForm={setEditForm} />
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Btn onClick={handleEdit} disabled={acting}>{acting ? 'Saving...' : 'Save Changes'}</Btn>
            <Btn onClick={() => setEditTarget(null)} outline color={C.sub}>Cancel</Btn>
          </div>
        </Dialog>
      )}

      {/* ── Ban dialog ── */}
      {banTarget && (
        <Dialog title={`Ban — ${banTarget.name}`} onClose={() => setBanTarget(null)}>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: C.sub }}>This will block the CP from logging in and accessing their dashboard.</p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {['temporary', 'permanent'].map(t => (
              <label key={t} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                border: `1.5px solid ${banType === t ? C.amber : C.border}`,
                background: banType === t ? '#78350f22' : 'transparent',
              }}>
                <input type="radio" name="banType" value={t} checked={banType === t} onChange={() => setBanType(t)} style={{ accentColor: C.amber }} />
                {t === 'temporary' ? 'Temporary' : 'Permanent'}
              </label>
            ))}
          </div>

          {banType === 'temporary' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Number of Days</label>
              <input type="number" min="1" value={banDays} onChange={e => setBanDays(e.target.value)} style={inp()} />
            </div>
          )}

          {banType === 'permanent' && (
            <div style={{ background: '#7f1d1d22', border: '1px solid #f87171', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>
              This will permanently ban the CP. You can unban them later.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={handleBan} disabled={acting} color={C.amber}>{acting ? 'Banning...' : 'Confirm Ban'}</Btn>
            <Btn onClick={() => setBanTarget(null)} outline color={C.sub}>Cancel</Btn>
          </div>
        </Dialog>
      )}

      {/* ── Access dialog ── */}
      {accessTarget && (
        <Dialog title={`Access — ${accessTarget.name}`} onClose={() => setAccessTarget(null)}>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: C.sub }}>Toggle which sections this CP can access in their dashboard.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {Object.entries(ACCESS_LABELS).map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#0d111780', borderRadius: 8, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                <div
                  onClick={() => setAccessForm(p => ({ ...p, [key]: !p[key] }))}
                  style={{
                    width: 42, height: 24, borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s',
                    background: accessForm[key] ? C.green : C.muted,
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', left: accessForm[key] ? 21 : 3,
                  }} />
                </div>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={handleAccess} disabled={acting}>{acting ? 'Saving...' : 'Save Access'}</Btn>
            <Btn onClick={() => setAccessTarget(null)} outline color={C.sub}>Cancel</Btn>
          </div>
        </Dialog>
      )}

      {/* ── Detail modal ── */}
      {detailTarget && (
        <Dialog title={detailTarget.name} onClose={() => { setDetailTarget(null); setDetail(null); }} maxWidth={680}>
          {detailLoading || !detail ? (
            <div style={{ padding: 20, textAlign: 'center', color: C.sub }}>Loading...</div>
          ) : (
            <>
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 20, fontSize: 13 }}>
                {[
                  ['Email',      detail.cp?.email],
                  ['Phone',      detail.cp?.phone],
                  ['City',       detail.cp?.city],
                  ['Company',    detail.cp?.companyName || '—'],
                  ['Status',     detail.cp?.status],
                  ['Work Type',  detail.cp?.workType || '—'],
                  ['Experience', detail.cp?.experienceYrs != null ? `${detail.cp.experienceYrs} yrs` : '—'],
                  ['Own Office', detail.cp?.hasOwnOffice ? 'Yes' : 'No'],
                  ['Education',  detail.cp?.education || '—'],
                  ['Languages',  detail.cp?.languages?.join(', ') || '—'],
                  ['Applied',    fmt(detail.cp?.createdAt)],
                  ['Banned Until', detail.cp?.bannedUntil ? fmt(detail.cp.bannedUntil) : '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{k}</div>
                    <div style={{ color: C.text, marginTop: 2, wordBreak: 'break-all' }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Access flags */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Access Flags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(ACCESS_LABELS).map(([key, label]) => {
                    const allowed = detail.cp?.access?.[key] !== false;
                    return (
                      <span key={key} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: allowed ? '#06422922' : '#7f1d1d22', color: allowed ? '#34d399' : '#f87171' }}>
                        {allowed ? '✓' : '✗'} {label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Listings */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Listings ({detail.listings?.length || 0})
                </div>
                {(detail.listings?.length || 0) === 0 ? (
                  <div style={{ fontSize: 13, color: C.muted }}>No listings yet</div>
                ) : detail.listings.slice(0, 8).map(p => (
                  <div key={p._id || p.id} style={{ padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.sub }}>
                    {p.bhk ? `${p.bhk} ` : ''}{p.propertyType} · {p.sector}, {p.city} ·{' '}
                    <span style={{ color: STATUS_COLOR[p.status] || C.sub, fontWeight: 600 }}>{p.status}</span>
                  </div>
                ))}
              </div>

              {/* Visits */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Visit Requests ({detail.visits?.length || 0})
                </div>
                {(detail.visits?.length || 0) === 0 ? (
                  <div style={{ fontSize: 13, color: C.muted }}>No visits yet</div>
                ) : detail.visits.slice(0, 8).map(v => (
                  <div key={v._id || v.id} style={{ padding: '7px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.sub }}>
                    {v.visitorName} · {v.visitDate} {v.visitTime} ·{' '}
                    <span style={{ fontWeight: 600 }}>{v.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Dialog>
      )}
    </>
  );
}
