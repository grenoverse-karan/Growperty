# Growperty — Project Rules

## ⚠️ No production deploys (as of 2026-10-03)

**Never run `vercel deploy --prod` on the Web project.** Deploy to **preview only** (`vercel deploy`, no `--prod`) and hand the user the preview URL. The user checks it themselves and promotes to production from the Vercel dashboard when satisfied — that promotion step is theirs alone, not something to do or ask to do.

This followed a real incident: Phase 2/3 prerendering changes passed `npm run build` and all post-deploy smoke tests locally, but broke multiple pages on production while localhost stayed fine — a gap between "build succeeds" and "production actually works" that preview-first catches before it reaches real users.

The API project (`apps/api`) is not affected by this rule unless the user says otherwise — confirm if unsure.

## Deploy workflow (required)

Before every deploy (API prod, or Web preview per the rule above), in this order:

1. **Commit first.** Stage and commit all pending changes — never deploy from an uncommitted working directory. The commit message must clearly state what changed (not generic messages like "update" or "fix").
2. **Push to GitHub** (`git push origin master`) right after committing, before deploying.
3. **Only then deploy.** API: `vercel deploy --prod` from `apps/api`. Web: `vercel deploy` (no `--prod`, see the rule above) from the repo root (Root Directory is already set to `apps/web`).
4. **Smoke test immediately after, against the deployment just created** — its preview URL for Web (`npm run smoke-test -- <preview-url>`), production for API. `npm run smoke-test` (from `apps/web`) hits 10 key routes covering all 3 ways this site serves a page (prerendered static file, SPA catch-all, middleware-rendered `/property/:id`) and fails loudly if any 404s, or if a page fails to actually render (see below). This class of bug — build succeeds, but real routing/rendering is broken — has twice slipped past a successful build on this project (2026-10-03, twice), which is exactly why Web no longer deploys straight to production.

This keeps GitHub as the source of truth for what's actually live, and gives every deploy a matching commit to roll back to if something breaks.

Reminder: `git push` does **not** auto-deploy on this project — deploying is always a separate, explicit step, run only when the user asks for it.

## Prerendered pages (required)

14 routes ship as build-time-prerendered static HTML, not the generic SPA shell — home, about, how-it-works, fast-track, faq, contact, privacy, terms-and-conditions, disclaimer, and the 5 SEO landing pages (flats-in-greater-noida, freehold-plots-greater-noida, commercial-property-greater-noida, plots-near-yamuna-expressway, property-near-noida-international-airport). The committed snapshots live in `apps/web/prerendered/`.

**If you change any of these 14 pages' content** (the page's own component, or `LocalityLandingPage.jsx` / `Header.jsx` / `Footer.jsx` / `RequestVisitModal.jsx` / `localityPages.js`, which all 14 or the 5 landing pages share — see `apps/web/scripts/prerender-sources.mjs` for the exact per-page list):

1. Run `npm run prerender` (from `apps/web`) — regenerates every snapshot into `apps/web/prerendered/` and its `manifest.json`.
2. Review the diff.
3. Commit `apps/web/prerendered/` **before** deploying.

The build (`npm run build`) runs `scripts/check-prerendered-fresh.mjs` first and **fails the build** if any of these source files have changed since the snapshots were last generated — so a forgotten `npm run prerender` blocks the deploy with that exact instruction, rather than silently shipping stale content. Don't bypass this by hand-editing `apps/web/prerendered/manifest.json`.

Listings on these pages are deliberately captured in their loading state, never with real prices/availability baked in (see the comment at the top of `generate-prerendered.mjs`) — that's intentional, not a bug to "fix" by waiting longer during capture.
