// Runs as the FIRST step of every build (see package.json). Pure file
// reads + hashing — no Puppeteer, works identically locally and in
// Vercel's build container. Fails the build if any of the 14 pages'
// source files have changed since apps/web/prerendered/manifest.json was
// last written, so a content edit can never silently ship without its
// prerendered snapshot — see CLAUDE.md's "Prerendered pages" rule.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PAGE_SOURCES } from './prerender-sources.mjs';

const OUT_DIR = path.resolve(process.cwd(), 'prerendered');
const MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');

function hashSources(sources) {
  const hash = crypto.createHash('sha256');
  for (const src of sources) {
    const abs = path.resolve(process.cwd(), src);
    if (!fs.existsSync(abs)) {
      throw new Error(`source file listed in prerender-sources.mjs does not exist: ${src}`);
    }
    hash.update(src);
    hash.update(fs.readFileSync(abs));
  }
  return hash.digest('hex');
}

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('\n❌ apps/web/prerendered/manifest.json is missing.');
  console.error('   Run `npm run prerender`, review apps/web/prerendered/, then commit it.\n');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const stale = [];

for (const [fileName, sources] of Object.entries(PAGE_SOURCES)) {
  if (!fs.existsSync(path.join(OUT_DIR, fileName))) {
    stale.push(`${fileName} — snapshot file itself is missing`);
    continue;
  }
  const currentHash = hashSources(sources);
  if (manifest[fileName] !== currentHash) {
    stale.push(`${fileName} (source: ${sources[0]})`);
  }
}

if (stale.length > 0) {
  console.error('\n❌ Prerendered snapshots are stale — these pages changed since the last `npm run prerender`:\n');
  stale.forEach((s) => console.error('   - ' + s));
  console.error('\n   Run `npm run prerender`, review apps/web/prerendered/, then commit it before deploying.\n');
  process.exit(1);
}

console.log('✓ All 14 prerendered snapshots are up to date.');
