// Run this right after every `vercel deploy --prod` (both API and Web) —
// see CLAUDE.md's deploy workflow. Checks that the 3 different ways this
// site serves a page (prerendered static file, SPA catch-all rewrite,
// middleware-rendered /property/:id) are all actually reachable, so a
// routing regression like the cleanUrls/rewrite break on 2026-10-03 (every
// non-prerendered route silently 404ing) gets caught in seconds instead of
// by a user screenshotting a broken production page.
//
// Usage: node scripts/smoke-test.mjs [base-url]
//   defaults to https://www.growperty.com
const BASE = process.argv[2] || 'https://www.growperty.com';
const API = 'https://growperty-api.vercel.app/api';

async function getLivePropertyId() {
  try {
    const res = await fetch(`${API}/properties?status=approved,sold&limit=1`);
    const data = await res.json();
    return data.items?.[0]?.id || null;
  } catch {
    return null;
  }
}

async function main() {
  const livePropertyId = await getLivePropertyId();

  const ROUTES = [
    { path: '/', label: 'home (prerendered)' },
    { path: '/properties', label: 'properties (SPA catch-all)' },
    { path: '/search', label: 'search (SPA catch-all)' },
    { path: '/projects', label: 'projects (SPA catch-all)' },
    { path: '/login', label: 'login (SPA catch-all)' },
    { path: '/admin', label: 'admin (SPA catch-all)' },
    { path: '/about', label: 'about (prerendered)' },
    { path: '/faq', label: 'faq (prerendered)' },
    { path: '/flats-in-greater-noida', label: 'flats landing page (prerendered)' },
    ...(livePropertyId
      ? [{ path: `/property/${livePropertyId}`, label: 'property detail (middleware-rendered)' }]
      : [{ path: null, label: 'property detail — SKIPPED, no live property found via API' }]),
  ];

  console.log(`Smoke testing ${BASE} — ${ROUTES.length} routes\n`);

  const failures = [];
  for (const { path, label } of ROUTES) {
    if (!path) { console.log(`⊘ SKIP  ${label}`); continue; }
    const url = `${BASE}${path}`;
    try {
      const res = await fetch(url, { redirect: 'manual' });
      const ok = res.status === 200 || (res.status >= 300 && res.status < 400);
      const line = `${ok ? '✓' : '✗'} ${String(res.status).padEnd(4)} ${label.padEnd(42)} ${url}`;
      console.log(line);
      if (!ok) failures.push({ path, label, status: res.status });
    } catch (err) {
      console.log(`✗ ERR  ${label.padEnd(42)} ${url} — ${err.message}`);
      failures.push({ path, label, status: 'error', error: err.message });
    }
  }

  console.log('');
  if (failures.length > 0) {
    console.error(`❌ ${failures.length}/${ROUTES.length} route(s) FAILED:\n`);
    failures.forEach((f) => console.error(`   - ${f.label} (${f.path}) -> ${f.status}${f.error ? ` (${f.error})` : ''}`));
    console.error('\n   If this just happened after a deploy, consider: vercel rollback <previous-deployment-url> --prod\n');
    process.exit(1);
  }

  console.log(`✓ All ${ROUTES.length} routes OK.`);
}

main();
