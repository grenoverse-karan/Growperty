import apiServerClient from './apiServerClient.js';
import { getCpRef } from './cpRef.js';

const TOKEN_COOKIE = 'visitorToken';
const TOKEN_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export function getVisitorToken() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setVisitorToken(token) {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; max-age=${TOKEN_MAX_AGE}; path=/`;
}

// Silent, fire-and-forget sitewide tracking ping. Never throws, never blocks the page.
// Only does something if the visitor is already tracked (visitorToken cookie) or
// has an active CP referral cookie (cpRef) — organic visitors are left untouched.
export function trackCpVisitor({ propertyId, keyword } = {}) {
  const visitorToken = getVisitorToken();
  const ref = getCpRef();

  if (!visitorToken && !ref) return;

  const body = {
    ...(visitorToken && { visitorToken }),
    ...(!visitorToken && ref && { cpPublicId: ref.cpPublicId, refToken: ref.refToken }),
    ...(propertyId && { propertyId }),
    ...(keyword && { keyword }),
  };

  apiServerClient.fetch('/cp-visitors/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      if (data?.visitorToken && data.visitorToken !== visitorToken) {
        setVisitorToken(data.visitorToken);
      }
    })
    .catch(() => {});
}
