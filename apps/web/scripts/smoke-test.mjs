// Run this right after every deploy (preview or prod) — see CLAUDE.md's
// deploy workflow. A plain HTTP-status check isn't enough: both
// production incidents on 2026-10-03 had a build that succeeded and a
// homepage that returned 200, while other pages were actually broken
// (one as a flat 404, one as a page that loaded but whose JS never ran
// because the browser rejected a mismatched asset MIME type). This opens
// each of 10 key routes in a real headless browser and checks:
//   1. the navigation itself didn't fail
//   2. an <h1> actually renders (proves React mounted, not just that
//      index.html's bytes arrived)
//   3. zero browser console errors / uncaught exceptions
//   4. every JS/CSS asset the page requested came back 200 with the
//      right content-type (catches exactly the stale-asset-hash /
//      MIME-mismatch failure mode from 2026-10-03)
//
// Usage: node scripts/smoke-test.mjs [base-url]
//   defaults to https://www.growperty.com
import puppeteer from 'puppeteer';

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

async function checkRoute(browser, path, label) {
  const page = await browser.newPage();
  const issues = [];
  const assetChecks = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') issues.push(`console error: ${msg.text().slice(0, 200)}`);
  });
  page.on('pageerror', (err) => issues.push(`uncaught exception: ${String(err).slice(0, 200)}`));
  page.on('requestfailed', (req) => {
    issues.push(`request failed: ${req.url()} (${req.failure()?.errorText || 'unknown'})`);
  });
  page.on('response', (res) => {
    const url = res.url();
    if (/\.(js|mjs)(\?|$)/.test(url)) {
      assetChecks.push({ url, status: res.status(), contentType: res.headers()['content-type'] || '', expect: 'javascript' });
    } else if (/\.css(\?|$)/.test(url)) {
      assetChecks.push({ url, status: res.status(), contentType: res.headers()['content-type'] || '', expect: 'css' });
    }
  });

  let navStatus = null;
  try {
    const res = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle0', timeout: 30000 });
    navStatus = res?.status();
    if (navStatus && navStatus >= 400) issues.push(`navigation returned ${navStatus}`);
  } catch (err) {
    issues.push(`navigation failed: ${err.message}`);
  }

  let h1Text = null;
  try {
    h1Text = await page.$eval('h1', (el) => el.textContent?.trim().slice(0, 60));
  } catch {
    issues.push('no <h1> found on page (React may not have mounted)');
  }

  for (const check of assetChecks) {
    if (check.status !== 200) {
      issues.push(`asset ${check.status}: ${check.url}`);
      continue;
    }
    const wantsJs = check.expect === 'javascript';
    const ok = wantsJs
      ? /javascript|ecmascript/i.test(check.contentType)
      : /css/i.test(check.contentType);
    if (!ok) {
      issues.push(`asset wrong content-type (got "${check.contentType}", expected ${check.expect}): ${check.url}`);
    }
  }

  await page.close();
  return { path, label, navStatus, h1Text, assetCount: assetChecks.length, issues };
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

  console.log(`Smoke testing ${BASE} — ${ROUTES.length} routes (headless browser)\n`);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const results = [];
  for (const { path, label } of ROUTES) {
    if (!path) { console.log(`⊘ SKIP  ${label}`); continue; }
    const r = await checkRoute(browser, path, label);
    results.push(r);
    const ok = r.issues.length === 0;
    console.log(`${ok ? '✓' : '✗'} ${String(r.navStatus ?? '?').padEnd(4)} ${label.padEnd(42)} h1="${r.h1Text || 'MISSING'}" (${r.assetCount} assets checked)`);
    if (!ok) r.issues.forEach((i) => console.log(`     - ${i}`));
  }
  await browser.close();

  const failed = results.filter((r) => r.issues.length > 0);
  console.log('');
  if (failed.length > 0) {
    console.error(`❌ ${failed.length}/${results.length} route(s) FAILED:\n`);
    failed.forEach((f) => {
      console.error(`   ${f.label} (${f.path}):`);
      f.issues.forEach((i) => console.error(`     - ${i}`));
    });
    console.error('\n   If this just happened after a prod deploy: vercel rollback <previous-deployment-url> --prod\n');
    process.exit(1);
  }

  console.log(`✓ All ${results.length} routes OK — rendered, H1 present, no console errors, all assets correct.`);
}

main();
