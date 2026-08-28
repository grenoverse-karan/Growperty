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
  dotBorder: '#d1fae5',
  dotBg:     '#f0fdf4',
};

const ICON = {
  property_listed: '🏘',
  lead_received:   '📩',
  visit_scheduled: '📅',
  visit_confirmed: '✅',
  visit_done:      '🤝',
  default:         '📋',
};

const fmtTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function CpActivitiesPage() {
  const { token } = useCpAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiServerClient.fetch('/cp/activities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setActivities(data.activities);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  return (
    <>
      <Helmet><title>Activities — CP Dashboard</title></Helmet>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>Activities</h1>
          <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Your recent actions and events</p>
        </div>
        <button
          onClick={fetchActivities}
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub, borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 48, textAlign: 'center', color: C.muted, fontSize: 14 }}>
          Loading...
        </div>
      ) : activities.length === 0 ? (
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 48, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No activities yet</div>
          <div style={{ fontSize: 13, color: C.muted }}>Activities will appear here as you use the dashboard.</div>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 4 }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: 19, top: 19, bottom: 19,
            width: 2,
            background: C.border,
            borderRadius: 2,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activities.map((act, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 16,
                  paddingBottom: i < activities.length - 1 ? 16 : 0,
                  position: 'relative',
                }}
              >
                {/* Dot */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: C.dotBg,
                  border: `2px solid ${C.dotBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0, zIndex: 1,
                }}>
                  {ICON[act.type] || ICON.default}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '12px 16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{act.message}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{fmtTime(act.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
