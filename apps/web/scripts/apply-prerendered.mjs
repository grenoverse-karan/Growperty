// Runs on every build (`vite build && node scripts/apply-prerendered.mjs`).
// Pure file reads/string-splicing — no Puppeteer, no browser launch — so
// it works unmodified in Vercel's build container.
//
// Splices each prerendered/<snapshot>.json's stored react-helmet tags
// (headExtra) and #root content (bodyHtml) into THIS build's own
// freshly-built dist/index.html — never a stored, potentially stale
// snapshot of a <script>/<link> boilerplate. That boilerplate's hashed
// asset filenames (e.g. /assets/index-C87ULHU2.js) only exist in THIS
// build's own dist/assets/; a filename baked in at a different build time
// (local vs Vercel, or an earlier commit) can easily not exist in this
// one, which silently 404s and — because of the SPA's catch-all rewrite —
// serves index.html's markup back for a request expecting JavaScript,
// which the browser then refuses to execute as a MIME-type mismatch. That
// exact bug took production down on 2026-10-03; this is the fix.
import fs from 'node:fs';
import path from 'node:path';
import { PAGES } from './prerender-sources.mjs';

const SRC = path.resolve(process.cwd(), 'prerendered');
const DIST = path.resolve(process.cwd(), 'dist');

if (!fs.existsSync(SRC)) {
  console.log('[apply-prerendered] no prerendered/ directory found, skipping');
  process.exit(0);
}

// The shell this build itself just produced — correct asset hashes by
// construction, and (since apply-prerendered runs before anything
// overwrites dist/index.html) still carries index.html's generic,
// unmodified <title>/<meta> defaults, nothing page-specific yet.
const shellPath = path.join(DIST, 'index.html');
const shellHtml = fs.readFileSync(shellPath, 'utf8');
const headEndIdx = shellHtml.indexOf('</head>');
if (headEndIdx === -1) {
  console.error('[apply-prerendered] dist/index.html has no </head> — aborting, nothing applied');
  process.exit(1);
}
const shellHead = shellHtml.slice(0, headEndIdx);

function spliceHead(headExtra) {
  // headExtra defines its own name/property/rel keys (title always; meta
  // description/OG/canonical for pages whose Helmet sets them) — strip
  // the shell's matching defaults so each key appears exactly once, with
  // headExtra's page-specific value winning, not index.html's generic one.
  const keys = [...headExtra.matchAll(/<(?:meta|link)\s+[^>]*?(?:name|property|rel)="([^"]+)"/gi)].map((m) => m[1]);
  let cleaned = shellHead.replace(/<title>[\s\S]*?<\/title>/i, '');
  for (const key of keys) {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned
      .replace(new RegExp(`<meta[^>]*(?:name|property)="${esc}"[^>]*>\\s*`, 'gi'), '')
      .replace(new RegExp(`<link[^>]*rel="${esc}"[^>]*>\\s*`, 'gi'), '');
  }
  return cleaned + headExtra + '\n</head>';
}

let applied = 0;
for (const { snapshot, dist } of Object.values(PAGES)) {
  const snapshotPath = path.join(SRC, snapshot);
  if (!fs.existsSync(snapshotPath)) {
    console.error(`[apply-prerendered] missing ${snapshot} — skipping ${dist}`);
    continue;
  }
  const { headExtra, bodyHtml } = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const html = `<!DOCTYPE html>\n<html lang="en">\n${spliceHead(headExtra)}\n<body>\n<div id="root">${bodyHtml}</div>\n</body>\n</html>\n`;
  fs.writeFileSync(path.join(DIST, dist), html);
  console.log(`[apply-prerendered] ${snapshot} -> dist/${dist}`);
  applied++;
}
console.log(`[apply-prerendered] applied ${applied} prerendered page(s), using this build's own asset hashes`);
