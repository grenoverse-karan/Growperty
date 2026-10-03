// Link previews for shared /property/:id URLs and the static SEO landing
// pages. Crawlers (WhatsApp, Facebook, Twitter…) read only the first HTML
// response and never run the SPA's JS, so for them this Vercel middleware
// returns a tiny page with Open Graph tags; everyone else gets the normal SPA.
import { SITE_URL } from './src/lib/siteUrl.js';

const BOT_UA = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot|Pinterest|Googlebot|bingbot|Applebot|Iframely|preview|crawler/i;

// Narrower than BOT_UA — social link-preview bots only, deliberately
// excluding Googlebot/bingbot/Applebot. The locality landing pages carry
// real, unique content written to rank on Google — serving search crawlers
// the thin OG-only stub below (no body content) instead of the full SPA
// would defeat that, so they still get the real page. Social bots don't
// execute JS at all, so they need the stub regardless.
const SOCIAL_PREVIEW_UA = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot|Pinterest|Iframely/i;

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

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return; // not a bot — serve SPA normally

  const url = new URL(request.url);

  // Static SEO landing pages — no API round-trip needed. Only social
  // preview bots get the stub here (see SOCIAL_PREVIEW_UA); search
  // crawlers fall through to the real, fully-indexable SPA content.
  const localitySlug = url.pathname.replace(/^\//, '').replace(/\/$/, '');
  const localityMeta = LOCALITY_PAGE_META[localitySlug];
  if (localityMeta && SOCIAL_PREVIEW_UA.test(ua)) {
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

  const id = url.pathname.replace(/^\/property\//, '').split('/')[0];
  if (!/^[a-f0-9]{24}$/i.test(id)) return;

  try {
    // Lightweight preview fields only — the full property JSON embeds every
    // base64 photo (1MB+) and was too slow for crawlers.
    const res = await fetch(`${API}/api/og/property/${id}`, {
      headers: { 'User-Agent': 'Growperty-OG-Bot/1.0' },
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
    if (!res.ok) return;
    const p = await res.json();

    const roomsLabel = !p.bhk && p.rooms > 0 ? `${p.rooms} Room${p.rooms > 1 ? 's' : ''}` : '';
    const typeLabel  = [p.bhk || roomsLabel, p.propertyType].filter(Boolean).join(' ') || 'Property';
    const location   = [p.sector, p.city].filter(Boolean).join(', ');
    const title      = location ? `${typeLabel} in ${location}` : typeLabel;
    const description = [
      fmtPrice(p.totalPrice),
      p.totalArea ? `${p.totalArea} ${p.areaUnit || 'Sq.ft'}` : '',
      p.status === 'sold' ? 'Sold' : p.possessionStatus,
    ].filter(Boolean).join(' · ');

    // Photos live as base64 in MongoDB, so the API serves the display image
    // as a real 1200×630 JPEG. ?v= changes whenever the listing is edited, so
    // a new display image isn't hidden behind a cached old preview.
    const image = p.hasImage
      ? `${API}/api/og/property/${id}/image.jpg?v=${encodeURIComponent(p.updatedAt || '')}`
      : FALLBACK_IMAGE;
    const canonical = `${SITE}/property/${id}`;

    const html = buildOgHtml({
      title,
      pageTitle: `${title} | Growperty`,
      description,
      image,
      canonical,
      imageIsReal: !!p.hasImage,
    });

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  } catch {
    return; // on any error/timeout, fall through to SPA
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
