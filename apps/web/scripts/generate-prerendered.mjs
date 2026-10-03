// Local-only tool — run this by hand (`npm run prerender`) whenever one of
// the static pages below changes, NOT as part of the Vercel build.
//
// Vercel's build container is a minimal Linux image that's missing the
// shared libraries (libnspr4.so, libnss3.so, …) Puppeteer's bundled
// Chromium needs, so launching a browser there fails outright. Rather than
// fighting that environment, this runs locally (where Chromium launches
// fine) and writes its output into prerendered/ — a plain, git-tracked
// directory of static HTML. apply-prerendered.mjs (Puppeteer-free, just
// file copies) runs that output into dist/ on every actual Vercel build.
//
// Builds dist/ itself first, boots a preview server over it, visits each
// route in headless Chromium, waits for React + react-helmet to finish
// mounting, and writes the fully-rendered DOM (H1, body copy, FAQ,
// JSON-LD, and react-helmet's per-page title/meta/canonical) to
// prerendered/<route>.html.
//
// Listings stay client-fetched in principle, but a naive capture would bake
// whatever prices/listings happen to be live AT GENERATION TIME into a
// static file that then sits unchanged until the next manual regeneration
// — e.g. a property that sells (or has its price changed) the day after
// `npm run prerender` runs would still show its old price/availability to
// Google until someone remembers to regenerate. So on the 6 routes that
// render a live listings grid (home + the 5 locality pages), the listings
// API call is deliberately left hanging during capture — it never
// resolves, so the component stays in its own loading-skeleton state
// forever, and that's what gets written to the snapshot. Once a real
// visitor's JS boots, the real (fresh) fetch happens exactly as before —
// this only affects the pre-JS snapshot, never the live client fetch.
//
// Everything else — H1, intro copy, FAQ, JSON-LD, react-helmet's per-page
// title/meta/canonical — is captured for real and takes over identically
// once a real visitor's JS boots (createRoot().render() replaces #root;
// react-helmet recognizes its own data-react-helmet="true" tags from the
// snapshot and updates them in place rather than duplicating them).
import { build, preview } from 'vite';
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PAGE_SOURCES } from './prerender-sources.mjs';

// Hash of each page's source files' current contents, written into
// manifest.json alongside the snapshots — check-prerendered-fresh.mjs
// re-hashes those same files at build time and compares, so staleness
// detection works from file contents alone (no reliance on git history or
// filesystem mtimes, neither of which survive a `vercel deploy` CLI
// upload into the build container).
function hashSources(sources) {
  const hash = crypto.createHash('sha256');
  for (const src of sources) {
    hash.update(src);
    hash.update(fs.readFileSync(path.resolve(process.cwd(), src)));
  }
  return hash.digest('hex');
}

const ROUTES = [
  '/',
  '/about',
  '/how-it-works',
  '/fast-track',
  '/faq',
  '/contact',
  '/privacy',
  '/terms-and-conditions',
  '/disclaimer',
  '/flats-in-greater-noida',
  '/freehold-plots-greater-noida',
  '/commercial-property-greater-noida',
  '/plots-near-yamuna-expressway',
  '/property-near-noida-international-airport',
];

// Routes that render a live /properties listings grid — see the big
// comment above for why their listings fetch is blocked during capture.
const ROUTES_WITH_LISTINGS = new Set([
  '/',
  '/flats-in-greater-noida',
  '/freehold-plots-greater-noida',
  '/commercial-property-greater-noida',
  '/plots-near-yamuna-expressway',
  '/property-near-noida-international-airport',
]);

const OUT_DIR = path.resolve(process.cwd(), 'prerendered');
const PORT = 4174;

async function main() {
  console.log('[generate-prerendered] building dist/ first...');
  await build();

  const server = await preview({ preview: { port: PORT, host: '127.0.0.1', strictPort: true } });
  const base = `http://127.0.0.1:${PORT}`;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  // Deliberately never continue/abort/respond matching requests — they
  // hang forever, so useProperties' fetch() never settles and the
  // component stays in its loading state for the whole capture. Toggled
  // per-route below since it only applies to ROUTES_WITH_LISTINGS.
  let blockListings = false;
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (blockListings && /\/api\/properties(\?|$)/.test(req.url())) return; // left hanging on purpose
    req.continue();
  });

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const route of ROUTES) {
    blockListings = ROUTES_WITH_LISTINGS.has(route);
    // networkidle0 would itself hang forever on these routes since the
    // blocked request never resolves — domcontentloaded + waitForSelector
    // is the readiness signal instead.
    await page.goto(`${base}${route}`, { waitUntil: blockListings ? 'domcontentloaded' : 'networkidle0', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 15000 });
    if (blockListings) await new Promise((r) => setTimeout(r, 1000)); // let the loading skeleton actually paint

    // Drop any static default <meta>/<link> that react-helmet has a
    // page-specific replacement for, so the output carries exactly one
    // (the correct, page-specific) copy of each — not index.html's
    // generic default duplicated alongside it.
    await page.evaluate(() => {
      const helmetKeys = new Set();
      document.querySelectorAll('[data-react-helmet="true"]').forEach((el) => {
        const key = el.getAttribute('name') || el.getAttribute('property') || el.tagName.toLowerCase();
        helmetKeys.add(key);
      });
      document.querySelectorAll('meta[name], meta[property]').forEach((el) => {
        if (el.getAttribute('data-react-helmet') === 'true') return;
        const key = el.getAttribute('name') || el.getAttribute('property');
        if (helmetKeys.has(key)) el.remove();
      });
    });

    const html = await page.content(); // already includes <!DOCTYPE html>

    const fileName = route === '/' ? 'index.html' : `${route.replace(/^\//, '')}.html`;
    const outPath = path.join(OUT_DIR, fileName);
    fs.writeFileSync(outPath, html);

    const title = await page.title();
    console.log(`✓ ${route.padEnd(45)} -> ${fileName.padEnd(40)} "${title}" (${html.length} bytes)`);
  }

  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));

  const manifest = {};
  for (const [fileName, sources] of Object.entries(PAGE_SOURCES)) {
    manifest[fileName] = hashSources(sources);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  console.log(`\n[generate-prerendered] done — review prerendered/, then commit it (including manifest.json).`);
}

main().catch((err) => {
  console.error('[generate-prerendered] failed:', err);
  process.exit(1);
});
