import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const PAGE_LABELS = {
  '/admin/inventory':        { title: 'Inventory Overview',   icon: '📦' },
  '/admin/analytics':        { title: 'Analytics',            icon: '📈' },
  '/admin/transactions':     { title: 'Transactions',         icon: '💳' },
  '/admin/leads':            { title: 'Leads Overview',       icon: '📊' },
  '/admin/buyers':           { title: 'Buyers',               icon: '👥' },
  '/admin/inquiries':        { title: 'Inquiries',            icon: '📩' },
  '/admin/traffic':          { title: 'Traffic',              icon: '📡' },
  '/admin/lead-transactions':{ title: 'Lead Transactions',    icon: '💳' },
  '/admin/announcements':    { title: 'Announcements',        icon: '📢' },
  '/admin/activity':         { title: 'Activity Log',         icon: '📋' },
};

export default function AdminComingSoonPage() {
  const { pathname } = useLocation();
  const meta = PAGE_LABELS[pathname] || { title: 'Page', icon: '🚧' };

  return (
    <>
      <Helmet><title>{meta.title} — Admin — Growperty</title></Helmet>
      <div style={{
        minHeight: '100vh',
        background: '#0d1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}>
        <div style={{ textAlign: 'center', color: '#94aabf' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{meta.icon}</div>
          <h2 style={{ margin: '0 0 8px', color: '#e6edf3', fontSize: 22, fontWeight: 700 }}>
            {meta.title}
          </h2>
          <p style={{ margin: 0, fontSize: 14 }}>Coming soon — yeh page abhi develop ho raha hai</p>
        </div>
      </div>
    </>
  );
}
