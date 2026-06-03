import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Map route patterns to human-readable page names
function getPageName(path) {
  if (path === '/')                          return 'Home';
  if (path === '/properties')               return 'Properties';
  if (path.startsWith('/property/'))        return 'Property Detail';
  if (path === '/projects')                 return 'Projects';
  if (path.startsWith('/project/'))         return 'Project Detail';
  if (path === '/list-property')            return 'List Property';
  if (path === '/post-requirement')         return 'Post Requirement';
  if (path === '/add-requirement')          return 'Add Requirement';
  if (path === '/contact')                  return 'Contact';
  if (path === '/about')                    return 'About';
  if (path === '/how-it-works')             return 'How It Works';
  if (path === '/faq')                      return 'FAQ';
  if (path === '/login')                    return 'Login';
  if (path === '/signup')                   return 'Signup';
  if (path === '/blog')                     return 'Blog';
  if (path === '/investor')                 return 'Investor';
  if (path === '/fast-track')               return 'Fast Track';
  if (path === '/buyer-dashboard')          return 'Buyer Dashboard';
  if (path === '/seller-dashboard')         return 'Seller Dashboard';
  if (path === '/search')                   return 'Search';
  if (path.startsWith('/admin'))            return null; // don't track admin pages
  return path;
}

// Detect traffic source from UTM params or referrer
function detectSource() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = params.get('utm_source')?.toLowerCase();
    if (utm) {
      if (utm.includes('google'))    return 'Google';
      if (utm.includes('facebook') || utm.includes('fb')) return 'Facebook';
      if (utm.includes('instagram') || utm.includes('ig')) return 'Instagram';
      if (utm.includes('youtube'))   return 'YouTube';
      if (utm.includes('whatsapp') || utm.includes('wa')) return 'WhatsApp';
      if (utm.includes('twitter') || utm.includes('x'))  return 'Twitter/X';
      return utm.charAt(0).toUpperCase() + utm.slice(1);
    }

    const ref = document.referrer;
    if (!ref) return 'Direct';
    const host = new URL(ref).hostname.replace('www.', '');
    if (host.includes('google'))       return 'Google';
    if (host.includes('facebook') || host.includes('fb.')) return 'Facebook';
    if (host.includes('instagram'))    return 'Instagram';
    if (host.includes('youtube'))      return 'YouTube';
    if (host.includes('whatsapp') || host.includes('wa.me')) return 'WhatsApp';
    if (host.includes('twitter') || host.includes('t.co') || host.includes('x.com')) return 'Twitter/X';
    if (host.includes('linkedin'))     return 'LinkedIn';
    if (host.includes('quora'))        return 'Quora';
    return 'Referral';
  } catch {
    return 'Direct';
  }
}

function getOrCreateId(key) {
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

function getOrCreateSessionId() {
  let id = sessionStorage.getItem('_gwp_sid');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('_gwp_sid', id);
  }
  return id;
}

async function post(endpoint, body) {
  try {
    await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // silent — analytics must never break the app
  }
}

export function usePageTracking() {
  const location = useLocation();
  const sessionStarted = useRef(false);
  const isFirstPage = useRef(true);

  useEffect(() => {
    const pageName = getPageName(location.pathname);
    if (pageName === null) return; // skip admin pages

    const visitorId  = getOrCreateId('_gwp_vid');
    const sessionId  = getOrCreateSessionId();
    const isNew      = !localStorage.getItem('_gwp_returning');
    const source     = detectSource();

    // Start session once per browser session
    if (!sessionStarted.current) {
      sessionStarted.current = true;
      post('analytics/session', {
        sessionId, visitorId, isNew,
        source, referrer: document.referrer,
        landingPage: location.pathname,
      });
      // Mark as returning for future visits
      localStorage.setItem('_gwp_returning', '1');
    }

    // Log page view (skip the very first page — session creation already counts it)
    if (!isFirstPage.current) {
      post('analytics/pageview', {
        sessionId, visitorId, isNew,
        page: location.pathname,
        pageName: pageName || location.pathname,
        source,
      });
    }
    isFirstPage.current = false;
  }, [location.pathname]);
}
