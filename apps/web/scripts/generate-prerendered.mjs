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
// mounting, and writes prerendered/<route>.json — NOT a full HTML
// document. A full document would embed THIS build's hashed asset
// filenames (e.g. /assets/index-C87ULHU2.js); Vercel's own build produces
// different hashes for the same source whenever ANYTHING bundled changes,
// so a stored <script src="..."> from a local build goes stale the
// moment source drifts — the browser requests a JS/CSS file that doesn't
// exist in that deployment's dist/assets/, which falls through the SPA's
// catch-all rewrite to index.html and fails with a MIME-type error
// instead of executing (exactly what broke production on 2026-10-03).
// So only the page-specific pieces are stored — react-helmet's tags
// (title, meta, canonical, JSON-LD) and #root's rendered content —  and
// apply-prerendered.mjs splices them into THAT build's own freshly-built
// dist/index.html, whose asset tags are always correct by construction.
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
import { PAGES, ROUTES_WITH_LISTINGS } from './prerender-sources.mjs';

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
  // hang forever, so useProperties' fetch() (and the home page's own
  // /api/projects fetch) never settles and the component stays in its
  // loading state for the whole capture. Toggled per-route below since it
  // only applies to ROUTES_WITH_LISTINGS.
  let blockListings = false;
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (blockListings && /\/api\/(properties|projects)(\?|$)/.test(req.url())) return; // left hanging on purpose
    req.continue();
  });

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifest = {};

  for (const [route, { snapshot, sources }] of Object.entries(PAGES)) {
    blockListings = ROUTES_WITH_LISTINGS.has(route);
    // networkidle0 would itself hang forever on these routes since the
    // blocked request never resolves — domcontentloaded + waitForSelector
    // is the readiness signal instead.
    await page.goto(`${base}${route}`, { waitUntil: blockListings ? 'domcontentloaded' : 'networkidle0', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 15000 });
    if (blockListings) await new Promise((r) => setTimeout(r, 1000)); // let the loading skeleton actually paint

    // headExtra = exactly what react-helmet added (title, description,
    // canonical, OG, JSON-LD — tagged data-react-helmet="true" by Helmet
    // itself, not something this script adds). bodyHtml = #root's
    // rendered content. Nothing else — no <script>/<link> boilerplate, no
    // static index.html defaults — gets stored.
    const { headExtra, bodyHtml } = await page.evaluate(() => ({
      // react-helmet sets document.title directly rather than tagging the
      // <title> element with data-react-helmet="true" the way it does for
      // meta/link/script — so the title needs capturing (and escaping,
      // via a throwaway element's own serialization) separately, or it
      // silently never makes it into the snapshot at all.
      headExtra: (() => {
        const titleEl = document.createElement('title');
        titleEl.textContent = document.title;
        return titleEl.outerHTML + '\n' + [...document.querySelectorAll('[data-react-helmet="true"]')].map((el) => el.outerHTML).join('\n');
      })(),
      bodyHtml: document.getElementById('root').innerHTML,
    }));

    const outPath = path.join(OUT_DIR, snapshot);
    fs.writeFileSync(outPath, JSON.stringify({ headExtra, bodyHtml }, null, 2) + '\n');
    manifest[snapshot] = hashSources(sources);

    const title = await page.title();
    console.log(`✓ ${route.padEnd(45)} -> ${snapshot.padEnd(40)} "${title}" (${bodyHtml.length} bytes body)`);
  }

  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  console.log(`\n[generate-prerendered] done — review prerendered/, then commit it (including manifest.json).`);
}

main().catch((err) => {
  console.error('[generate-prerendered] failed:', err);
  process.exit(1);
});
