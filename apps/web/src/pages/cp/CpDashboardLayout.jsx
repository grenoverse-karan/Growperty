import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';

const C = {
  bg:      '#0d1117',
  sidebar: '#0d1b2a',
  border:  '#1e2d3d',
  text:    '#e6edf3',
  muted:   '#4d6175',
  sub:     '#94aabf',
  hover:   '#132236',
  green:   '#1d9e75',
};

const NAV = [
  { label: 'My Listings',     icon: '🏘',  to: '/cp/dashboard/listings'  },
  { label: 'Add Property',    icon: '➕',  to: '/cp/dashboard/add'       },
  { label: 'Buyers',          icon: '👥',  to: '/cp/dashboard/leads'     },
  { label: 'Visit Requests',  icon: '📅',  to: '/cp/dashboard/visits'    },
  { label: 'Activities',      icon: '📋',  to: '/cp/dashboard/activities'},
  { label: 'Profile',         icon: '👤',  to: '/cp/dashboard/profile'   },
];

export default function CpDashboardLayout() {
  const { currentCp, cpLogout } = useCpAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    cpLogout();
    navigate('/cp/login');
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Branding */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>Growperty</div>
        <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>Channel Partner</div>
      </div>

      {/* CP Identity */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {currentCp?.name || 'Partner'}
        </div>
        {currentCp?.companyName && (
          <div style={{ fontSize: 11, color: C.sub, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentCp.companyName}
          </div>
        )}
        <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{currentCp?.city}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflow: 'auto' }}>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#fff' : C.sub,
              background: isActive ? C.hover : 'transparent',
              textDecoration: 'none',
              borderLeft: isActive ? `3px solid ${C.green}` : '3px solid transparent',
              transition: 'background 0.15s',
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'transparent',
            border: `1px solid ${C.border}`,
            color: C.sub,
            borderRadius: 6,
            padding: '8px 0',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 500,
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
        width: 220,
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        zIndex: 40,
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }}
          />
          <aside style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
            background: C.sidebar, borderRight: `1px solid ${C.border}`,
            zIndex: 50, display: 'flex', flexDirection: 'column',
          }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 220, minWidth: 0 }} className="cp-main">
        {/* Mobile top bar */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderBottom: `1px solid ${C.border}`,
          background: C.sidebar,
        }} className="cp-mobile-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: C.text, fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 0 }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, color: C.green }}>Growperty CP</span>
        </div>

        <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
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
