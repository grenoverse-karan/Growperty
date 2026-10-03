import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, CalendarDays, RefreshCw } from 'lucide-react';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyCard from '@/components/PropertyCard.jsx';
import RequestVisitModal from '@/components/RequestVisitModal.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { LOCALITY_PAGES } from '@/lib/localityPages.js';

/**
 * Shared template for dedicated SEO landing pages (one per high-intent
 * keyword) — unique area content, live matching listings, FAQ, a map, and a
 * "Request Visit" CTA. Each page just supplies a config object; this keeps
 * five near-identical pages from being five near-identical files.
 */
export default function LocalityLandingPage({
  metaTitle, metaDescription, canonicalPath,
  badge, title, heroSubtitle, stats = [],
  intro = [], priceRows = [], connectivity = [], faqs = [],
  mapQuery,
  listingsHeading, listingsFilter = {}, fallbackFilter = null,
  requirementContext = {},
}) {
  const [listings, setListings] = useState([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visitOpen, setVisitOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchWith = async (filter) => {
      const params = new URLSearchParams({ status: 'approved,sold', limit: '6' });
      Object.entries(filter).forEach(([k, v]) => v && params.set(k, v));
      const res = await apiServerClient.fetch(`/properties?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load listings');
      const data = await res.json();
      return data.items || [];
    };

    (async () => {
      setLoading(true);
      try {
        let items = await fetchWith(listingsFilter);
        let fallback = false;
        if (items.length === 0 && fallbackFilter) {
          items = await fetchWith(fallbackFilter);
          fallback = true;
        }
        if (!cancelled) { setListings(items); setUsedFallback(fallback); }
      } catch {
        if (!cancelled) setListings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapsUrl = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : null;
  const mapEmbedUrl = mapQuery ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed` : null;

  const pageUrl = canonicalPath ? `https://growperty.com${canonicalPath}` : undefined;
  const ogImage = 'https://growperty.com/growperty-logo.png';

  const faqJsonLd = faqs.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  const breadcrumbJsonLd = pageUrl ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://growperty.com/' },
      { '@type': 'ListItem', position: 2, name: title, item: pageUrl },
    ],
  } : null;

  const currentSlug = canonicalPath?.replace(/^\//, '');
  const relatedPages = LOCALITY_PAGES.filter(p => p.slug !== currentSlug);

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        {canonicalPath && <link rel="canonical" href={pageUrl} />}

        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        {pageUrl && <meta property="og:url" content={pageUrl} />}
        <meta property="og:type" content="website" />

        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
        {breadcrumbJsonLd && <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>}
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* HERO */}
          <section className="relative bg-gradient-to-br from-primary to-slate-900 pt-20 pb-20 overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              {badge && (
                <Badge className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-1.5 text-sm font-bold tracking-widest mb-6 shadow-sm border-none uppercase">
                  {badge}
                </Badge>
              )}
              <h1 className="text-[28px] md:text-[42px] font-extrabold text-primary-foreground mb-5 leading-[1.2] tracking-tight text-balance">
                {title}
              </h1>
              {heroSubtitle && (
                <p className="text-[16px] md:text-[18px] text-primary-foreground/80 max-w-[65ch] mx-auto leading-relaxed font-medium mb-10">
                  {heroSubtitle}
                </p>
              )}
              {stats.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {stats.map((s, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center">
                      <div className="text-2xl md:text-3xl font-extrabold text-primary-foreground mb-1 tracking-tight">{s.value}</div>
                      <div className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wide">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* INTRO CONTENT */}
          <section className="py-16 bg-background">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
              {intro.map((para, i) => (
                <p key={i} className="text-base md:text-lg text-muted-foreground leading-relaxed">{para}</p>
              ))}
            </div>
          </section>

          {/* PRICE TABLE */}
          {priceRows.length > 0 && (
            <section className="py-16 bg-muted">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary dark:text-white mb-8 text-center tracking-tight">
                  Indicative Price Range
                </h2>
                <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-primary text-primary-foreground">
                        <th className="p-4 font-bold">Property Type</th>
                        <th className="p-4 font-bold">Price Range</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card">
                      {priceRows.map((row, i) => (
                        <tr key={i} className={`border-b border-border last:border-0 ${i % 2 ? 'bg-muted/30' : ''}`}>
                          <td className="p-4 font-medium text-foreground">{row.type}</td>
                          <td className="p-4 font-bold text-secondary">{row.range}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* CONNECTIVITY */}
          {connectivity.length > 0 && (
            <section className="py-16 bg-background">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary dark:text-white mb-8 text-center tracking-tight">
                  Connectivity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {connectivity.map((c, i) => (
                    <div key={i} className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-start gap-5">
                      <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0">
                        <c.icon className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1">{c.title}</h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* LIVE LISTINGS */}
          <section className="py-16 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary dark:text-white mb-2 text-center tracking-tight">
                {listingsHeading}
              </h2>
              {usedFallback && listings.length > 0 && (
                <p className="text-center text-muted-foreground text-sm mb-8">
                  No exact matches live right now — here are similar verified listings you may like.
                </p>
              )}
              {!usedFallback && <div className="mb-8" />}

              {loading ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {listings.map((property) => <PropertyCard key={property.id} property={property} />)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-border/50 text-center shadow-sm">
                  <p className="text-muted-foreground mb-4">No live listings match this yet — post your requirement and we'll notify you the moment one comes up.</p>
                  <Button asChild className="rounded-xl font-bold">
                    <Link to="/add-requirement">Post Your Requirement</Link>
                  </Button>
                </div>
              )}

              {listings.length > 0 && (
                <div className="text-center mt-10">
                  <Button asChild variant="outline" className="rounded-xl font-bold">
                    <Link to="/properties">View All Properties</Link>
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* MAP */}
          {mapEmbedUrl && (
            <section className="py-16 bg-background">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary dark:text-white mb-8 text-center tracking-tight">
                  Location Map
                </h2>
                <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                  <iframe
                    title={`Map — ${title}`}
                    src={mapEmbedUrl}
                    className="w-full h-[360px] border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline">
                  <MapPin className="h-4 w-4" />
                  Open in Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </section>
          )}

          {/* FAQ */}
          {faqs.length > 0 && (
            <section className="py-16 bg-muted">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary dark:text-white mb-8 text-center tracking-tight">
                  Frequently Asked Questions
                </h2>
                <div className="bg-card rounded-2xl border border-border shadow-sm px-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((f, i) => (
                      <AccordionItem key={i} value={`faq-${i}`} className="border-b-border last:border-0">
                        <AccordionTrigger className="text-left font-bold hover:text-secondary transition-colors py-5">
                          {f.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                          {f.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="py-16 bg-gradient-to-r from-secondary to-emerald-500">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-secondary-foreground mb-4 tracking-tight text-balance">
                Want to See These Properties in Person?
              </h2>
              <p className="text-secondary-foreground/90 mb-8 font-medium">
                Request a visit and our local team will arrange it at a time that works for you.
              </p>
              <Button
                onClick={() => setVisitOpen(true)}
                className="bg-white text-secondary hover:bg-slate-50 h-14 px-8 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
              >
                <CalendarDays className="w-5 h-5 mr-2" />
                Request a Visit
              </Button>
            </div>
          </section>

          {/* RELATED AREAS — internal links to the other locality pages */}
          {relatedPages.length > 0 && (
            <section className="py-16 bg-background">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary dark:text-white mb-8 text-center tracking-tight">
                  Related Areas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedPages.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/${p.slug}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-5 py-4 font-semibold text-foreground hover:border-secondary hover:text-secondary transition-colors"
                    >
                      {p.label}
                      <MapPin className="h-4 w-4 shrink-0 opacity-60" />
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

        </main>

        <Footer />
      </div>

      <RequestVisitModal
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        pageLabel={title}
        propertyType={requirementContext.propertyType}
        city={requirementContext.city}
        areas={requirementContext.areas}
      />
    </>
  );
}
