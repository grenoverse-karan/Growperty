// Single source of truth for the production origin. www is the actual
// production domain — growperty.com (apex) 308-redirects to it — so every
// canonical tag, og:url, and JSON-LD URL in the app must be built from this
// constant rather than a hardcoded string, or they silently drift out of
// sync with the apex/www redirect.
export const SITE_URL = 'https://www.growperty.com';
