import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';

const C = {
  bg:      '#f5f6f8',
  sidebar: '#ffffff',
  border:  '#e5e7eb',
  text:    '#111827',
  muted:   '#9ca3af',
  sub:     '#6b7280',
  hover:   '#f0fdf7',
  activeText: '#059669',
  green:   '#10b981',
  greenDark: '#059669',
};

const NAV = [
  { label: 'Dashboard',       icon: '📊',  to: '/cp/dashboard', end: true },
  { label: 'My Listings',     icon: '🏘',  to: '/cp/dashboard/listings'  },
  { label: 'Add Property',    icon: '➕',  to: '/cp/dashboard/add'       },
  { label: 'Wish List',       icon: '❤️',  to: '/cp/dashboard/wishlist'  },
  { label: 'Requirement',     icon: '📝',  to: '/cp/dashboard/requirements' },
  { label: 'Buyers',          icon: '👥',  to: '/cp/dashboard/leads'     },
  { label: 'Visit Requests',  icon: '📅',  to: '/cp/dashboard/visits'    },
  { label: 'Visitors',        icon: '🎯',  to: '/cp/dashboard/visitors'  },
  { label: 'Activities',      icon: '📋',  to: '/cp/dashboard/activities'},
  { label: 'Profile',         icon: '👤',  to: '/cp/dashboard/profile'   },
];

export default function CpDashboardLayout() {
  const { currentCp, token, cpLogout } = useCpAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiServerClient.fetch('/cp/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.status === 401) { cpLogout(false); navigate('/cp/login', { replace: true }); } })
      .catch(() => {});
  }, [token]);

  const handleLogout = () => {
    cpLogout();
    navigate('/cp/login');
  };

  const initials = (name) => {
    if (!name) return 'CP';
    return name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Branding */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.greenDark, letterSpacing: -0.5 }}>Growperty</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontWeight: 500 }}>Channel Partner Portal</div>
      </div>

      {/* CP Identity */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#d1fae5', color: C.greenDark,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, flexShrink: 0,
        }}>
          {initials(currentCp?.name)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentCp?.name || 'Partner'}
          </div>
          {currentCp?.companyName && (
            <div style={{ fontSize: 11, color: C.sub, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentCp.companyName}
            </div>
          )}
          <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{currentCp?.city}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 12px', overflow: 'auto' }}>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              marginBottom: 2,
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? C.activeText : C.sub,
              background: isActive ? C.hover : 'transparent',
              textDecoration: 'none',
              transition: 'background 0.12s, color 0.12s',
            })}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* CP ID */}
      {currentCp?.shareToken && (
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>CP ID</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, fontFamily: 'monospace' }}>{currentCp.shareToken}</div>
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'transparent',
            border: `1px solid ${C.border}`,
            color: C.sub,
            borderRadius: 7,
            padding: '8px 0',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.12s',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      {/* Desktop sidebar */}
      <aside style={{
        width: 228,
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        zIndex: 40,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.04), 4px 0 12px rgba(0,0,0,0.04)',
      }}
        className="cp-sidebar-desktop"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 45, backdropFilter: 'blur(2px)' }}
          />
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: 252,
            background: C.sidebar, borderRight: `1px solid ${C.border}`,
            zIndex: 50, display: 'flex', flexDirection: 'column',
            boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
          }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 228, minWidth: 0 }} className="cp-main">
        {/* Mobile top bar */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderBottom: `1px solid ${C.border}`,
          background: C.sidebar,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }} className="cp-mobile-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: C.text, fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4 }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 800, fontSize: 16, color: C.greenDark }}>Growperty</span>
          <span style={{ fontSize: 13, color: C.muted, marginLeft: 'auto' }}>{currentCp?.name}</span>
        </div>

        <div style={{ padding: '28px 28px', maxWidth: 1140, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .cp-sidebar-desktop { display: none !important; }
          .cp-main { margin-left: 0 !important; }
          .cp-mobile-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
