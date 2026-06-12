import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

const C = {
  surface: '#0d1b2a',
  border:  '#1e2d3d',
  sub:     '#94aabf',
  muted:   '#4d6175',
  green:   '#1d9e75',
};

const ICON = {
  property_listed: '🏘',
  lead_received:   '📩',
  visit_scheduled: '📅',
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

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Activities</h1>
        <p style={{ margin: '4px 0 0', color: C.sub, fontSize: 13 }}>Your recent actions</p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: C.sub }}>Loading...</div>
      ) : activities.length === 0 ? (
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 40, textAlign: 'center', color: C.sub }}>
          No activities yet. Activities will appear here as you use the dashboard.
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            left: 19, top: 0, bottom: 0,
            width: 2,
            background: C.border,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activities.map((act, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 14,
                  paddingBottom: i < activities.length - 1 ? 20 : 0,
                  position: 'relative',
                }}
              >
                {/* Dot */}
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: C.surface,
                  border: `2px solid ${C.border}`,
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
                }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{act.message}</div>
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
