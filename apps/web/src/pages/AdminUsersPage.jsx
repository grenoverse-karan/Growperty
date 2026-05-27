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
  redHov:  '#922b21',
  green:   '#1d9e75',
  blue:    '#185fa5',
};

const ROLE_COLOR = { buyer: '#185fa5', seller: '#1d9e75', admin: '#8e44ad' };
const PROVIDER_ICON = { whatsapp: '📱', email: '📧', google: '🔵' };

export default function AdminUsersPage() {
  const { token } = useAdminAuth();

  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async (pg = 1, q = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 50 });
      if (q) params.set('search', q);
      const res  = await apiServerClient.fetch(`/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(pg);
      setSelected(new Set());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(1, ''); }, [fetchUsers]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(1, search), 350);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const selectAll = () => {
    if (selected.size === users.length) setSelected(new Set());
    else setSelected(new Set(users.map(u => u._id)));
  };

  const deleteOne = async (id, name) => {
    if (!window.confirm(`Delete user "${name || id}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await apiServerClient.fetch(`/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('User deleted');
      fetchUsers(page, search);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} selected user(s)? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await apiServerClient.fetch('/users/bulk-delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.deleted} user(s) deleted`);
      fetchUsers(page, search);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <>
      <Helmet><title>Users — Admin — Growperty</title></Helmet>
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Users</h1>
            <p style={{ margin: '4px 0 0', color: C.sub, fontSize: 13 }}>{total} total users</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, phone, email..."
              style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.text, padding: '8px 14px', fontSize: 13, width: 240,
                outline: 'none',
              }}
            />
            {selected.size > 0 && (
              <button
                onClick={deleteSelected}
                disabled={deleting}
                style={{
                  background: C.red, color: '#fff', border: 'none', borderRadius: 8,
                  padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                🗑 Delete {selected.size} Selected
              </button>
            )}
            <button
              onClick={() => fetchUsers(page, search)}
              style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.sub, padding: '8px 14px', fontSize: 13, cursor: 'pointer',
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 140px 120px 100px 110px 80px',
            padding: '12px 16px',
            borderBottom: `1px solid ${C.border}`,
            color: C.sub, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <div>
              <input
                type="checkbox"
                checked={users.length > 0 && selected.size === users.length}
                onChange={selectAll}
                style={{ accentColor: C.blue, width: 15, height: 15, cursor: 'pointer' }}
              />
            </div>
            <div>Name / Email</div>
            <div>Phone</div>
            <div>Role</div>
            <div>Provider</div>
            <div>Joined</div>
            <div style={{ textAlign: 'right' }}>Action</div>
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>Loading...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>No users found</div>
          ) : (
            users.map((u, i) => (
              <div
                key={u._id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 140px 120px 100px 110px 80px',
                  padding: '13px 16px',
                  alignItems: 'center',
                  borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : 'none',
                  background: selected.has(u._id) ? '#132236' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                {/* Checkbox */}
                <div>
                  <input
                    type="checkbox"
                    checked={selected.has(u._id)}
                    onChange={() => toggleSelect(u._id)}
                    style={{ accentColor: C.blue, width: 15, height: 15, cursor: 'pointer' }}
                  />
                </div>

                {/* Name / email */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>
                    {u.name || <span style={{ color: C.muted, fontStyle: 'italic' }}>No name</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                    {u.email || '—'}
                  </div>
                  {u.city && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>📍 {u.city}</div>}
                </div>

                {/* Phone */}
                <div style={{ fontSize: 13, color: C.sub }}>
                  {u.phone ? u.phone.replace(/^91/, '') : '—'}
                </div>

                {/* Role badge */}
                <div>
                  <span style={{
                    background: ROLE_COLOR[u.role] || C.muted,
                    color: '#fff', fontSize: 11, fontWeight: 600,
                    padding: '3px 9px', borderRadius: 20, textTransform: 'capitalize',
                  }}>
                    {u.role || 'buyer'}
                  </span>
                </div>

                {/* Provider */}
                <div style={{ fontSize: 13, color: C.sub }}>
                  {PROVIDER_ICON[u.provider] || '?'} {u.provider || '—'}
                </div>

                {/* Joined date */}
                <div style={{ fontSize: 12, color: C.sub }}>{fmt(u.createdAt)}</div>

                {/* Delete button */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => deleteOne(u._id, u.name || u.phone || u.email)}
                    disabled={deleting}
                    style={{
                      background: 'transparent', border: `1px solid ${C.red}`,
                      color: C.red, borderRadius: 6, padding: '5px 10px',
                      fontSize: 12, cursor: 'pointer', fontWeight: 600,
                    }}
                    onMouseEnter={e => { e.target.style.background = C.red; e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = C.red; }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button
              onClick={() => fetchUsers(page - 1, search)}
              disabled={page <= 1}
              style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
            >
              ← Prev
            </button>
            <span style={{ color: C.sub, padding: '6px 12px', fontSize: 13 }}>
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => fetchUsers(page + 1, search)}
              disabled={page >= totalPages}
              style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
