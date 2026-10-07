import { API_SERVER_URL } from '@/lib/apiServerClient.js';

// Fire-and-forget engagement ping (share / wishlist_add / wishlist_remove).
// Never throws and never blocks the UI — a lost ping just means one missed count.
export function trackProperty(propertyId, event) {
  if (!propertyId || !event) return;
  try {
    window.fetch(`${API_SERVER_URL}/properties/${propertyId}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* analytics must never break the app */ }
}
