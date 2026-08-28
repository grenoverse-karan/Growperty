import { useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { trackCpVisitor } from '@/lib/cpVisitorTracking.js';

// Sitewide "page load" ping for CP-referred visitor tracking. Property and
// search pages report richer context themselves (propertyId / keyword) from
// their own lifecycle, so this generic tracker skips those two paths to
// avoid double-counting the same page view.
export default function CpVisitorTracker() {
  const location = useLocation();

  useEffect(() => {
    if (matchPath('/property/:id', location.pathname)) return;
    if (location.pathname === '/search') return;
    trackCpVisitor({});
  }, [location.pathname]);

  return null;
}
