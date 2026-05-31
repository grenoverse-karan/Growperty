import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

// ── Colours ───────────────────────────────────────────────────────
const C = {
  bg:        '#0d1117',
  sidebar:   '#0d1b2a',
  border:    '#1e2d3d',
  text:      '#e6edf3',
  muted:     '#4d6175',
  subtext:   '#94aabf',
  hover:     '#132236',
  green:     '#1d9e75',
  blue:      '#185fa5',
};

// ── Sidebar nav definition ────────────────────────────────────────
const NAV = [
  { id: 'home',           label: 'Dashboard',     icon: '⊞',  href: '/admin' },
  { divider: 'INVENTORY' },
  { id: 'inv-overview',   label: 'Overview',       icon: '📊', href: '/admin/inventory' },
  { id: 'inv-list',       label: 'List Property',  icon: '➕', href: '/admin/list-property' },
  { id: 'inv-listings',   label: 'Listings',       icon: '🏘', href: '/admin/properties' },
  { id: 'inv-fasttrack',  label: 'Fast Track',     icon: '⚡', href: '/admin/approvals' },
  { id: 'inv-analytics',  label: 'Analytics',      icon: '📈', href: '/admin/analytics' },
  { id: 'inv-txn',        label: 'Transactions',   icon: '💳', href: '/admin/transactions' },
  { divider: 'LEADS' },
  { id: 'leads-overview', label: 'Overview',       icon: '📊', href: '/admin/leads' },
  { id: 'leads-users',    label: 'Users',          icon: '👤', href: '/admin/users' },
  { id: 'leads-buyers',   label: 'Buyers',         icon: '👥', href: '/admin/buyers' },
  { id: 'leads-inquiries',label: 'Inquiries',      icon: '📩', href: '/admin/inquiries' },
  { id: 'leads-traffic',  label: 'Traffic',        icon: '📡', href: '/admin/traffic' },
  { id: 'leads-txn',      label: 'Transactions',   icon: '💳', href: '/admin/lead-transactions' },
  { divider: 'CAMPAIGN' },
  { id: 'camp-send',      label: 'Send Campaign',  icon: '📣', href: '/admin/campaigns' },
  { divider: 'SYSTEM' },
  { id: 'announcements',  label: 'Announcements',  icon: '📢', href: '/admin/announcements' },
  { id: 'activity',       label: 'Activity Log',   icon: '📋', href: '/admin/activity' },
  { id: 'settings',       label: 'Settings',       icon: '⚙️', href: '/admin/settings' },
];

const STATS_DEF = [
  { key: 'totalProperties', label: 'Total Properties', icon: '🏠', color: '#1a3a5c' },
  { key: 'activeListings',  label: 'Live Listings',    icon: '✅', color: '#0f6e56' },
  { key: 'totalPending',    label: 'Pending Review',   icon: '⏳', color: '#ba7517' },
  { key: 'totalSellers',    label: 'Total Sellers',    icon: '👤', color: '#185fa5' },
  { key: 'totalBuyers',     label: 'Total Buyers',     icon: '👥', color: '#533ab7' },
  { key: 'dealsClosed',     label: 'Deals Closed',     icon: '🤝', color: '#0f6e56' },
  { key: 'activeLeads',     label: 'Active Leads',     icon: '🔥', color: '#a32d2d' },
  { key: 'totalRevenue',    label: 'Total Revenue',    icon: '💰', color: '#3b6d11', prefix: '₹' },
];

const QUICK_ACTIONS = [
  { label: 'Review Pending',  href: '/admin/approvals',          color: '#ba7517' },
  { label: 'View Inquiries',  href: '/admin/inquiries',          color: '#185fa5' },
  { label: 'Announcements',   href: '/admin/announcements',      color: '#533ab7' },
  { label: 'Activity Log',    href: '/admin/activity',           color: C.muted    },
];

// ── Sidebar ───────────────────────────────────────────────────────
const Sidebar = ({ open, onToggle, onLogout, adminEmail }) => (
  <aside style={{
    width: open ? 240 : 64,
    background: C.sidebar,
    borderRight: `1px solid ${C.border}`,
    transition: 'width 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: 0,
  }}>
    {/* Logo */}
    <div style={{
      padding: '20px 16px',
      borderBottom: `1px solid ${C.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <div style={{
        width: 32, height: 32,
        background: 'linear-gradient(135deg, #1d9e75, #185fa5)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontSize: 14, fontWeight: 700, color: '#fff',
      }}>G</div>
      {open && (
        <span style={{ fontWeight: 700, fontSize: 16, color: C.text, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
          Growperty
        </span>
      )}
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
      {NAV.map((item, i) => {
        if (item.divider) {
          return open
            ? (
              <div key={i} style={{
                fontSize: 10, fontWeight: 600, color: C.muted,
                letterSpacing: '1px', padding: '16px 10px 6px',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>{item.divider}</div>
            )
            : <div key={i} style={{ borderTop: `1px solid ${C.border}`, margin: '10px 0' }} />;
        }

        return (
          <NavLink
            key={item.id}
            to={item.href}
            end={item.href === '/admin'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 6, marginBottom: 2,
              background:   isActive ? '#132236' : 'transparent',
              color:        isActive ? C.green   : C.subtext,
              border:       `1px solid ${isActive ? C.border : 'transparent'}`,
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            {open && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>

    {/* Footer: email + logout */}
    {open && (
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 11, color: C.muted, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {adminEmail || 'admin@growperty.com'}
        </p>
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '7px 0', borderRadius: 6,
            background: 'rgba(163,45,45,0.12)',
            border: '1px solid rgba(163,45,45,0.3)',
            color: '#e06c6c', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    )}

    {/* Toggle button */}
    <button
      onClick={onToggle}
      style={{
        margin: '12px 8px', padding: 8, borderRadius: 6,
        background: '#132236', border: `1px solid ${C.border}`,
        color: C.muted, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}
    >
      {open ? '◀' : '▶'}
    </button>
  </aside>
);

// ── Main Dashboard ────────────────────────────────────────────────
const AdminDashboard = () => {
  const { currentAdmin, adminLogout, token, isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats]             = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!isAdminAuthenticated) navigate('/admin-login');
  }, [isAdminAuthenticated, navigate]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const res = await apiServerClient.fetch('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        adminLogout(false);
        toast.error('Session expired, please login again');
        navigate('/admin-login');
        return;
      }
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, [token, adminLogout, navigate]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleLogout = () => { adminLogout(); navigate('/admin-login'); };

  if (!isAdminAuthenticated) return null;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard — Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
          onLogout={handleLogout}
          adminEmail={currentAdmin?.email}
        />

        {/* Right pane */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Top navbar */}
          <header style={{
            background: C.sidebar,
            borderBottom: `1px solid ${C.border}`,
            padding: '14px 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0 }}>Admin Dashboard</h1>
              <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>Grenoverse Multi Ventures LLP</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: C.muted }}>🟢 Live</span>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#132236', border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, cursor: 'pointer',
              }}>
                {currentAdmin?.email?.[0]?.toUpperCase() || '👤'}
              </div>
            </div>
          </header>

          {/* Main content */}
          <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

            {/* Two big section buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36 }}>
              {[
                {
                  href: '/admin/properties', emoji: '📦', title: 'Inventory',
                  sub: 'Properties · Listings · Fast Track · Analytics',
                  accent: C.green, label: 'Open Inventory',
                },
                {
                  href: '/admin/inquiries', emoji: '👥', title: 'Leads',
                  sub: 'Buyers · Inquiries · Visits · Deals',
                  accent: C.blue, label: 'Open Leads',
                },
              ].map(({ href, emoji, title, sub, accent, label }) => (
                <NavLink key={href} to={href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: C.sidebar, border: `1px solid ${C.border}`,
                    borderTop: `3px solid ${accent}`,
                    borderRadius: 16, padding: '40px 32px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                    cursor: 'pointer', transition: 'box-shadow 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}40`}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ fontSize: 48 }}>{emoji}</div>
                    <div style={{ textAlign: 'center' }}>
                      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>{title}</h2>
                      <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{sub}</p>
                    </div>
                    <div style={{
                      background: accent, color: '#fff',
                      padding: '8px 24px', borderRadius: 8,
                      fontSize: 13, fontWeight: 600,
                    }}>
                      {label} →
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>

            {/* Stats grid */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{
                fontSize: 13, fontWeight: 600, color: C.muted,
                textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14,
              }}>
                Quick Overview
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {STATS_DEF.map(({ key, label, icon, color, prefix = '' }) => {
                  const raw = stats?.[key] ?? 0;
                  const display = statsLoading ? '…' : `${prefix}${raw}`;
                  return (
                    <div key={key} style={{
                      background: C.sidebar, border: `1px solid ${C.border}`,
                      borderLeft: `3px solid ${color}`,
                      borderRadius: 10, padding: '16px 18px',
                    }}>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13 }}>{icon}</span> {label}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{display}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h3 style={{
                fontSize: 13, fontWeight: 600, color: C.muted,
                textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14,
              }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {QUICK_ACTIONS.map(({ label, href, color }) => (
                  <NavLink key={label} to={href} style={{ textDecoration: 'none' }}>
                    <button
                      style={{
                        background: C.sidebar,
                        border: `1px solid ${color}40`,
                        borderRadius: 8, padding: '9px 18px',
                        fontSize: 13, color, cursor: 'pointer',
                        fontWeight: 500, transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = `${color}18`}
                      onMouseLeave={e => e.currentTarget.style.background = C.sidebar}
                    >
                      {label}
                    </button>
                  </NavLink>
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
