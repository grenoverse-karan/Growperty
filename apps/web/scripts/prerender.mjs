// Build-time prerendering for static (non-DB) routes. Runs after `vite
// build`: boots a local preview server over the built dist/, visits each
// route in headless Chromium, waits for React + react-helmet to finish
// mounting, and writes the fully-rendered DOM (H1, body copy, FAQ,
// JSON-LD, and react-helmet's per-page title/meta/canonical) back into
// dist/ as a static HTML file at that route.
//
// Listings on these pages stay client-fetched — the snapshot captures
// whatever's rendered at wait time, loading spinner or already-loaded
// cards, and the client takes over identically either way once its JS
// boots (createRoot().render() replaces #root; react-helmet recognizes
// its own data-react-helmet="true" tags from the snapshot and updates
// them in place rather than duplicating them).
//
// Vercel serves a matching dist/<route>.html ahead of the SPA catch-all
// rewrite because of "cleanUrls": true in vercel.json — without that, this
// script's output would never actually be reached.
import { preview } from 'vite';
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

const DIST = path.resolve(process.cwd(), 'dist');
const PORT = 4174;

async function main() {
  const server = await preview({ preview: { port: PORT, host: '127.0.0.1', strictPort: true } });
  const base = `http://127.0.0.1:${PORT}`;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

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

    const html = '<!DOCTYPE html>\n' + (await page.content());

    const outPath = route === '/'
      ? path.join(DIST, 'index.html')
      : path.join(DIST, `${route.replace(/^\//, '')}.html`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);

    const title = await page.title();
    console.log(`✓ ${route.padEnd(45)} -> ${path.relative(DIST, outPath).padEnd(40)} "${title}" (${html.length} bytes)`);
  }

  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
