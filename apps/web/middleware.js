const BOT_UA = /WhatsApp|facebookexternalhit|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot|Pinterest|Googlebot|bingbot|Applebot|Iframely|preview|crawler/i;

const API = 'https://growperty-api.vercel.app';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function fmtPrice(price) {
  const n = Number(price);
  if (!n) return '';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1).replace(/\.0$/, '')} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1).replace(/\.0$/, '')} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return; // not a bot — serve SPA normally

  const url = new URL(request.url);
  const id = url.pathname.replace(/^\/property\//, '').split('/')[0];
  if (!id || id.length < 8) return;

  try {
    const res = await fetch(`${API}/api/properties/${id}`, {
      headers: { 'User-Agent': 'Growperty-OG-Bot/1.0' },
    });
    if (!res.ok) return;
    const p = await res.json();

    const titleParts = [p.bhk, p.propertyType].filter(Boolean);
    const title     = esc(titleParts.join(' ') || 'Property');
    const location  = esc([p.sector, p.city].filter(Boolean).join(', '));
    const price     = esc(fmtPrice(p.totalPrice));
    const area      = p.totalArea ? esc(`${p.totalArea} ${p.areaUnit || 'sq.ft'}`) : '';
    const possession = esc(p.possessionStatus || '');
    const descParts = [price, area, possession, location].filter(Boolean);
    const description = esc(descParts.join(' · '));

    // base64 data URIs can't be used as og:image — find the first real HTTP URL
    const rawImage = (p.images || []).find(img => typeof img === 'string' && img.startsWith('http'));
    const image    = esc(rawImage || 'https://www.growperty.com/growperty-logo.png');
    const canonical = `https://www.growperty.com/property/${id}`;
    const fullTitle = `${title} in ${location} | Growperty`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${fullTitle}</title>
<meta name="description" content="${description}" />
<meta property="og:site_name" content="Growperty" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${fullTitle}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${fullTitle}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
<link rel="canonical" href="${canonical}" />
<meta http-equiv="refresh" content="0; url=${canonical}" />
</head>
<body><a href="${canonical}">View on Growperty</a></body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  } catch {
    return; // on any error, fall through to SPA
  }
}

export const config = {
  matcher: '/property/:id*',
};
