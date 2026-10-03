# Growperty — Project Rules

## Deploy workflow (required)

Before every `vercel deploy --prod` (API or Web), in this order:

1. **Commit first.** Stage and commit all pending changes — never deploy from an uncommitted working directory. The commit message must clearly state what changed (not generic messages like "update" or "fix").
2. **Push to GitHub** (`git push origin master`) right after committing, before deploying.
3. **Only then deploy.** `vercel deploy --prod` from `apps/api` for the API, from the repo root for Web (Root Directory is already set to `apps/web`).

This keeps GitHub as the source of truth for what's actually live, and gives every deploy a matching commit to roll back to if something breaks.

Reminder: `git push` does **not** auto-deploy on this project — deploying is always a separate, explicit `vercel deploy --prod` step, run only when the user asks for it.

## Prerendered pages (required)

14 routes ship as build-time-prerendered static HTML, not the generic SPA shell — home, about, how-it-works, fast-track, faq, contact, privacy, terms-and-conditions, disclaimer, and the 5 SEO landing pages (flats-in-greater-noida, freehold-plots-greater-noida, commercial-property-greater-noida, plots-near-yamuna-expressway, property-near-noida-international-airport). The committed snapshots live in `apps/web/prerendered/`.

**If you change any of these 14 pages' content** (the page's own component, or `LocalityLandingPage.jsx` / `Header.jsx` / `Footer.jsx` / `RequestVisitModal.jsx` / `localityPages.js`, which all 14 or the 5 landing pages share — see `apps/web/scripts/prerender-sources.mjs` for the exact per-page list):

1. Run `npm run prerender` (from `apps/web`) — regenerates every snapshot into `apps/web/prerendered/` and its `manifest.json`.
2. Review the diff.
3. Commit `apps/web/prerendered/` **before** deploying.

The build (`npm run build`) runs `scripts/check-prerendered-fresh.mjs` first and **fails the build** if any of these source files have changed since the snapshots were last generated — so a forgotten `npm run prerender` blocks the deploy with that exact instruction, rather than silently shipping stale content. Don't bypass this by hand-editing `apps/web/prerendered/manifest.json`.

Listings on these pages are deliberately captured in their loading state, never with real prices/availability baked in (see the comment at the top of `generate-prerendered.mjs`) — that's intentional, not a bug to "fix" by waiting longer during capture.
