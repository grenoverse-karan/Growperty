// Shared by generate-prerendered.mjs (writes the manifest) and
// check-prerendered-fresh.mjs (verifies against it) — which source files
// each prerendered snapshot depends on. Keep this in sync when a page
// starts/stops using a shared component.
const SHARED = ['src/components/Header.jsx', 'src/components/Footer.jsx'];
const LOCALITY_SHARED = [
  'src/components/LocalityLandingPage.jsx',
  'src/lib/localityPages.js',
  'src/components/RequestVisitModal.jsx',
];

export const PAGE_SOURCES = {
  'index.html': ['src/pages/HomePage.jsx', ...SHARED],
  'about.html': ['src/pages/AboutPage.jsx', ...SHARED],
  'how-it-works.html': ['src/pages/HowItWorksPage.jsx', ...SHARED],
  'fast-track.html': ['src/pages/FastTrackPage.jsx', ...SHARED],
  'faq.html': ['src/pages/FAQPage.jsx', ...SHARED],
  'contact.html': ['src/pages/ContactPage.jsx', ...SHARED],
  'privacy.html': ['src/pages/PrivacyPolicyPage.jsx', ...SHARED],
  'terms-and-conditions.html': ['src/pages/TermsAndConditionsPage.jsx', ...SHARED],
  'disclaimer.html': ['src/pages/DisclaimerPage.jsx', ...SHARED],
  'flats-in-greater-noida.html': ['src/pages/FlatsInGreaterNoidaPage.jsx', ...LOCALITY_SHARED, ...SHARED],
  'freehold-plots-greater-noida.html': ['src/pages/FreeholdPlotsGreaterNoidaPage.jsx', ...LOCALITY_SHARED, ...SHARED],
  'commercial-property-greater-noida.html': ['src/pages/CommercialPropertyGreaterNoidaPage.jsx', ...LOCALITY_SHARED, ...SHARED],
  'plots-near-yamuna-expressway.html': ['src/pages/PlotsNearYamunaExpresswayPage.jsx', ...LOCALITY_SHARED, ...SHARED],
  'property-near-noida-international-airport.html': ['src/pages/PropertyNearNoidaAirportPage.jsx', ...LOCALITY_SHARED, ...SHARED],
};
