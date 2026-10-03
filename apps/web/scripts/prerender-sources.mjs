// Single source of truth for the 14 prerendered routes — used by
// generate-prerendered.mjs (writes prerendered/<snapshot>), apply-
// prerendered.mjs (splices <snapshot> into dist/<dist>), and
// check-prerendered-fresh.mjs (verifies manifest hashes against
// `sources`). Keep in sync when a page starts/stops using a shared
// component, or add a new prerendered route here.
const SHARED = ['src/components/Header.jsx', 'src/components/Footer.jsx'];
const LOCALITY_SHARED = [
  'src/components/LocalityLandingPage.jsx',
  'src/lib/localityPages.js',
  'src/components/RequestVisitModal.jsx',
];

// Routes that render a live /properties listings grid — generate-
// prerendered.mjs blocks that request during capture on these so a
// snapshot never bakes in a point-in-time price/availability (see the
// comment at the top of that script).
export const ROUTES_WITH_LISTINGS = new Set(['/', '/flats-in-greater-noida', '/freehold-plots-greater-noida', '/commercial-property-greater-noida', '/plots-near-yamuna-expressway', '/property-near-noida-international-airport']);

export const PAGES = {
  '/': { snapshot: 'index.json', dist: 'index.html', sources: ['src/pages/HomePage.jsx', ...SHARED] },
  '/about': { snapshot: 'about.json', dist: 'about.html', sources: ['src/pages/AboutPage.jsx', ...SHARED] },
  '/how-it-works': { snapshot: 'how-it-works.json', dist: 'how-it-works.html', sources: ['src/pages/HowItWorksPage.jsx', ...SHARED] },
  '/fast-track': { snapshot: 'fast-track.json', dist: 'fast-track.html', sources: ['src/pages/FastTrackPage.jsx', ...SHARED] },
  '/faq': { snapshot: 'faq.json', dist: 'faq.html', sources: ['src/pages/FAQPage.jsx', ...SHARED] },
  '/contact': { snapshot: 'contact.json', dist: 'contact.html', sources: ['src/pages/ContactPage.jsx', ...SHARED] },
  '/privacy': { snapshot: 'privacy.json', dist: 'privacy.html', sources: ['src/pages/PrivacyPolicyPage.jsx', ...SHARED] },
  '/terms-and-conditions': { snapshot: 'terms-and-conditions.json', dist: 'terms-and-conditions.html', sources: ['src/pages/TermsAndConditionsPage.jsx', ...SHARED] },
  '/disclaimer': { snapshot: 'disclaimer.json', dist: 'disclaimer.html', sources: ['src/pages/DisclaimerPage.jsx', ...SHARED] },
  '/flats-in-greater-noida': { snapshot: 'flats-in-greater-noida.json', dist: 'flats-in-greater-noida.html', sources: ['src/pages/FlatsInGreaterNoidaPage.jsx', ...LOCALITY_SHARED, ...SHARED] },
  '/freehold-plots-greater-noida': { snapshot: 'freehold-plots-greater-noida.json', dist: 'freehold-plots-greater-noida.html', sources: ['src/pages/FreeholdPlotsGreaterNoidaPage.jsx', ...LOCALITY_SHARED, ...SHARED] },
  '/commercial-property-greater-noida': { snapshot: 'commercial-property-greater-noida.json', dist: 'commercial-property-greater-noida.html', sources: ['src/pages/CommercialPropertyGreaterNoidaPage.jsx', ...LOCALITY_SHARED, ...SHARED] },
  '/plots-near-yamuna-expressway': { snapshot: 'plots-near-yamuna-expressway.json', dist: 'plots-near-yamuna-expressway.html', sources: ['src/pages/PlotsNearYamunaExpresswayPage.jsx', ...LOCALITY_SHARED, ...SHARED] },
  '/property-near-noida-international-airport': { snapshot: 'property-near-noida-international-airport.json', dist: 'property-near-noida-international-airport.html', sources: ['src/pages/PropertyNearNoidaAirportPage.jsx', ...LOCALITY_SHARED, ...SHARED] },
};
