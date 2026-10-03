// Runs on every build (`vite build && node scripts/apply-prerendered.mjs`).
// Pure file copies — no Puppeteer, no browser launch — so it works
// unmodified in Vercel's build container, unlike generate-prerendered.mjs.
// Copies the git-tracked prerendered/ snapshots (built locally, see that
// script's header) over the matching dist/ files, so each static route
// serves its real prerendered HTML instead of the generic SPA shell.
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.cwd(), 'prerendered');
const DIST = path.resolve(process.cwd(), 'dist');

if (!fs.existsSync(SRC)) {
  console.log('[apply-prerendered] no prerendered/ directory found, skipping');
  process.exit(0);
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.html'));
for (const file of files) {
  fs.copyFileSync(path.join(SRC, file), path.join(DIST, file));
  console.log(`[apply-prerendered] ${file} -> dist/${file}`);
}
console.log(`[apply-prerendered] applied ${files.length} prerendered page(s)`);
