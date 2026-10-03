// Two independent jobs:
//
// 1. Static SEO landing pages — a thin OG-only stub for social link-preview
//    bots only (WhatsApp, Facebook, Twitter…), gated by BOT_UA. Search
//    engines are deliberately excluded from BOT_UA and never see this stub:
//    Phase 2 build-time prerendering (apps/web/prerendered/) already gives
//    them the same real, indexable HTML everyone else gets.
//
// 2. /property/:id — real listing data, server-rendered for EVERY
//    requester (not bot-gated at all), since it's DB-backed and changes
//    constantly — Phase 2's build-time approach can't apply here. Reuses
//    the current deployment's own index.html for its <head> boilerplate
//    (script/link tags), so it never hand-tracks hashed asset filenames,
//    and splices in listing-specific title/meta/JSON-LD plus an initial
//    #root render. Never includes owner phone, house number, or exact
//    address — only sector/city. Sold listings get noindex; gone/removed
//    listings get 410. Short (5 min) edge cache.
import { SITE_URL } from './src/lib/siteUrl.js';

const BOT_UA = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot|Pinterest|Iframely/i;

const API = 'https://growperty-api.vercel.app';
const SITE = SITE_URL;
const FALLBACK_IMAGE = `${SITE}/growperty-logo.png`;
// A cold API start takes 2–5s; crawlers wait longer than that, so allow
// time for it — past this we fall back to the SPA's generic site preview.
const API_TIMEOUT_MS = 8000;

// Static SEO landing pages — no API fetch needed, title/description mirror
// each page's own <Helmet> values (kept in sync manually, same as the
// property-page title-building logic below being separate from its Helmet).
const LOCALITY_PAGE_META = {
  'flats-in-greater-noida': {
    title: 'Flats for Sale in Greater Noida | Growperty.com',
    description: 'Verified 1, 2 & 3 BHK flats for sale in Greater Noida — transparent pricing, direct seller contact & free site visits. Browse live listings.',
  },
  'freehold-plots-greater-noida': {
    title: 'Freehold Plots for Sale in Greater Noida | Growperty.com',
    description: "Explore freehold residential plots for sale in Greater Noida's GNIDA-planned sectors. Verify tenure, check prices & request a site visit on Growperty.com.",
  },
  'commercial-property-greater-noida': {
    title: 'Commercial Property for Sale in Greater Noida | Growperty',
    description: 'Shops, showrooms & office spaces for sale in Greater Noida. Check rental yields, price ranges & verified listings on Growperty.com. Request a site visit.',
  },
  'plots-near-yamuna-expressway': {
    title: 'Plots Near Yamuna Expressway, Greater Noida | Growperty.com',
    description: 'Residential plots in Greater Noida along the Yamuna Expressway corridor, near the upcoming Noida International Airport. Verified listings.',
  },
  'property-near-noida-international-airport': {
    title: 'Property Near Noida International Airport | Growperty.com',
    description: 'Flats, plots & commercial property in Greater Noida, within easy reach of the Noida International Airport via the Yamuna Expressway. Verified listings.',
  },
};

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Full Indian grouping, e.g. ₹36,13,500.
function fmtPrice(price) {
  const n = Number(price);
  return n ? `₹${Math.round(n).toLocaleString('en-IN')}` : '';
}

function buildOgHtml({ title, pageTitle, description, image, canonical, imageIsReal }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(pageTitle || title)}</title>
<meta name="description" content="${esc(description)}" />
<meta property="og:site_name" content="Growperty.com" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${esc(canonical)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:secure_url" content="${esc(image)}" />
${imageIsReal ? `<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
` : ''}<meta property="og:image:alt" content="${esc(title)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<link rel="canonical" href="${esc(canonical)}" />
<meta http-equiv="refresh" content="0; url=${esc(canonical)}" />
</head>
<body><a href="${esc(canonical)}">View on Growperty</a></body>
</html>`;
}

// Statuses that mean "this listing is permanently gone" — 410 for everyone,
// not just search engines. 'pending' is deliberately NOT here: it means
// "not yet published", not "gone", and an owner/admin may legitimately
// need to open this exact URL before it's approved.
const GONE_STATUSES = new Set(['rejected', 'suspended', 'unlisted']);

async function buildPropertyPageHtml(id, request) {
  const res = await fetch(`${API}/api/og/property/${id}`, {
    headers: { 'User-Agent': 'Growperty-Internal-Render/1.0' },
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  if (res.status === 404) return { status: 410 };
  if (!res.ok) return null; // transient API error — fall through to SPA, don't 410 a real listing
  const p = await res.json();
  if (!p || !p.status) return { status: 410 };
  if (GONE_STATUSES.has(p.status)) return { status: 410 };
  if (p.status === 'pending') return null; // not yet public — let the SPA's own auth/role logic decide who can see it

  const isSold = p.status === 'sold';
  const roomsLabel = !p.bhk && p.rooms > 0 ? `${p.rooms} Room${p.rooms > 1 ? 's' : ''}` : '';
  const typeLabel  = [p.bhk || roomsLabel, p.propertyType].filter(Boolean).join(' ') || 'Property';
  // Approx location only — sector + city. Never houseNo or the full address;
  // this endpoint (apps/api/src/routes/og.js) never even selects those fields.
  const location   = [p.sector, p.city].filter(Boolean).join(', ');
  const priceStr   = fmtPrice(p.totalPrice);
  const areaStr    = p.totalArea ? `${p.totalArea} ${p.areaUnit || 'Sq.ft'}` : '';
  const title      = [typeLabel, location && `in ${location}`, priceStr].filter(Boolean).join(' ');
  const description = [
    priceStr, areaStr,
    p.bathrooms ? `${p.bathrooms} Bath` : '',
    isSold ? 'Sold' : p.possessionStatus,
  ].filter(Boolean).join(' · ');
  const canonical = `${SITE}/property/${id}`;

  const imageCount = Math.min(p.imageCount || 0, 6);
  const images = Array.from({ length: imageCount }, (_, i) =>
    `${API}/api/og/property/${id}/image.jpg?i=${i}&v=${encodeURIComponent(p.updatedAt || '')}`);
  const ogImage = images[0] || FALLBACK_IMAGE;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    description,
    url: canonical,
    ...(images.length && { image: images }),
    address: { '@type': 'PostalAddress', addressLocality: p.sector || undefined, addressRegion: p.city || undefined, addressCountry: 'IN' },
    ...(p.totalPrice && { offers: {
      '@type': 'Offer',
      price: p.totalPrice,
      priceCurrency: 'INR',
      availability: isSold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    } }),
    ...(p.totalArea && { floorSize: { '@type': 'QuantitativeValue', value: p.totalArea, unitText: p.areaUnit || 'Sq.ft' } }),
  };

  // Reuse the CURRENT deployment's own index.html for its <head>
  // boilerplate (script/link tags) — never hand-track hashed asset
  // filenames here; whatever the live build actually ships is what loads.
  const shellRes = await fetch(new URL('/', request.url), { headers: { 'User-Agent': 'Growperty-Internal-Shell-Fetch/1.0' } });
  if (!shellRes.ok) return null;
  const shellHtml = await shellRes.text();
  const headEndIdx = shellHtml.indexOf('</head>');
  if (headEndIdx === -1) return null;
  // / is itself a prerendered page (Phase 2) with its own title/description/
  // OG/canonical/JSON-LD — strip those out so only generic boilerplate
  // (charset, viewport, favicon, font preloads, script/link tags) survives;
  // otherwise this page's tags would just duplicate, and HTML only honors
  // the FIRST <title> in <head>, silently discarding the one set below.
  const headHtml = shellHtml.slice(0, headEndIdx)
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/gi, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  const specs = [
    p.bhk || (p.rooms > 0 ? `${p.rooms} Room${p.rooms > 1 ? 's' : ''}` : ''),
    p.bathrooms ? `${p.bathrooms} Bathroom${p.bathrooms > 1 ? 's' : ''}` : '',
    p.balconies ? `${p.balconies} Balcon${p.balconies > 1 ? 'ies' : 'y'}` : '',
    areaStr,
    isSold ? 'Sold' : p.possessionStatus,
  ].filter(Boolean);

  const bodyHtml = `<div style="max-width:960px;margin:0 auto;padding:24px;font-family:sans-serif">
<h1>${esc(title)}</h1>
<p><strong>${esc(priceStr)}</strong>${areaStr ? ` &middot; ${esc(areaStr)}` : ''}</p>
<p>${esc(location)}</p>
<ul>${specs.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
${images.map((src, i) => `<img src="${esc(src)}" alt="${esc(`${title} - photo ${i + 1}`)}" loading="${i === 0 ? 'eager' : 'lazy'}" style="max-width:100%;height:auto" />`).join('\n')}
</div>`;

  const html = `${headHtml}<title>${esc(title)} | Growperty</title>
<meta name="description" content="${esc(description)}" />
${isSold ? '<meta name="robots" content="noindex, follow" />\n' : ''}<link rel="canonical" href="${esc(canonical)}" />
<meta property="og:site_name" content="Growperty.com" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${esc(canonical)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:image" content="${esc(ogImage)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(ogImage)}" />
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body><div id="root">${bodyHtml}</div></body>
</html>`;

  return { status: 200, html };
}

export default async function middleware(request) {
  const url = new URL(request.url);

  // /property/:id — every requester, not just bots (see header comment).
  const propIdMatch = url.pathname.match(/^\/property\/([a-f0-9]{24})\/?$/i);
  if (propIdMatch) {
    try {
      const result = await buildPropertyPageHtml(propIdMatch[1], request);
      if (!result) return; // fall through to the normal SPA
      if (result.status === 410) {
        return new Response('Gone', { status: 410, headers: { 'Content-Type': 'text/plain' } });
      }
      return new Response(result.html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=300' },
      });
    } catch {
      return; // on any error/timeout, fall through to the SPA
    }
  }

  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return; // not a bot — serve SPA normally

  // Static SEO landing pages — no API round-trip needed. The outer BOT_UA
  // gate already excludes search engines, so every request reaching here
  // is a social preview bot.
  const localitySlug = url.pathname.replace(/^\//, '').replace(/\/$/, '');
  const localityMeta = LOCALITY_PAGE_META[localitySlug];
  if (localityMeta) {
    const html = buildOgHtml({
      title: localityMeta.title,
      description: localityMeta.description,
      image: FALLBACK_IMAGE,
      canonical: `${SITE}/${localitySlug}`,
      imageIsReal: false,
    });
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  }
}

export const config = {
  matcher: [
    '/property/:id*',
    '/flats-in-greater-noida',
    '/freehold-plots-greater-noida',
    '/commercial-property-greater-noida',
    '/plots-near-yamuna-expressway',
    '/property-near-noida-international-airport',
  ],
};
