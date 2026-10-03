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
// Listings stay client-fetched — the snapshot captures whatever's
// rendered at wait time, loading spinner or already-loaded cards, and the
// client takes over identically either way once its JS boots
// (createRoot().render() replaces #root; react-helmet recognizes its own
// data-react-helmet="true" tags from the snapshot and updates them in
// place rather than duplicating them).
import { build, preview } from 'vite';
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

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

const OUT_DIR = path.resolve(process.cwd(), 'prerendered');
const PORT = 4174;

async function main() {
  console.log('[generate-prerendered] building dist/ first...');
  await build();

  const server = await preview({ preview: { port: PORT, host: '127.0.0.1', strictPort: true } });
  const base = `http://127.0.0.1:${PORT}`;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const route of ROUTES) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 15000 });

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

    const outPath = route === '/'
      ? path.join(OUT_DIR, 'index.html')
      : path.join(OUT_DIR, `${route.replace(/^\//, '')}.html`);
    fs.writeFileSync(outPath, html);

    const title = await page.title();
    console.log(`✓ ${route.padEnd(45)} -> ${path.relative(OUT_DIR, outPath).padEnd(40)} "${title}" (${html.length} bytes)`);
  }

  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
  console.log(`\n[generate-prerendered] done — review prerendered/, then commit it.`);
}

main().catch((err) => {
  console.error('[generate-prerendered] failed:', err);
  process.exit(1);
});
