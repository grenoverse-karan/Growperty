import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">{title}</h2>
    <div className="space-y-2 text-sm leading-relaxed">{children}</div>
  </section>
);

const DisclaimerPage = () => (
  <>
    <Helmet>
      <title>Disclaimer | Growperty.com</title>
      <meta name="description" content="Read the official disclaimer for Growperty.com — property details, AI insights, and location data are for informational purposes only." />
    </Helmet>

    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <Header />

      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
          </Button>

          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-border">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
              <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Disclaimer</h1>
                <p className="text-muted-foreground mt-1 font-medium text-sm">Last Updated: June 2026 · Grenoverse Multi Ventures LLP</p>
              </div>
            </div>

            <div className="space-y-8 text-slate-700 dark:text-slate-300">
              <p className="text-sm leading-relaxed">
                This Disclaimer applies to <strong>Growperty.com</strong> and related applications, communication channels, property pages, enquiry forms, WhatsApp flows, and associated services operated by <strong>Grenoverse Multi Ventures LLP</strong>.
              </p>
              <div className="text-sm space-y-1">
                <p><strong>Grenoverse Multi Ventures LLP</strong></p>
                <p>Head Office: 01, Mannat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
                <p>Branch Office: 01, Kirat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
                <p>Email: <a href="mailto:support@growperty.com" className="text-primary underline">support@growperty.com</a> &nbsp;·&nbsp; Phone: <a href="tel:+919891117876" className="text-primary underline">+91 9891117876</a>, <a href="tel:+919971007876" className="text-primary underline">+91 9971007876</a></p>
              </div>
              <p className="text-sm leading-relaxed">By accessing or using the Platform, you acknowledge and agree to this Disclaimer in addition to the applicable Terms and Conditions and Privacy Policy.</p>

              <Section title="1. General Information Only">
                <p>The content available on Growperty.com is provided for general informational and facilitation purposes only. It is not intended to constitute legal advice, financial advice, tax advice, investment advice, valuation advice, engineering advice, brokerage advice, or any other professional advice.</p>
                <p>Users should not rely solely on the Platform, listing content, AI insights, communications, or informal guidance while making a property-related decision. Independent professional advice and independent verification should be obtained before entering into any transaction.</p>
              </Section>

              <Section title="2. No Guarantee of Accuracy or Completeness">
                <p>Property details, dimensions, pricing, project information, title-related statements, approval status, possession timelines, photographs, videos, maps, floor plans, and other listing content may be provided by owners, developers, brokers, third parties, public sources, or other external inputs.</p>
                <p>While Growperty may undertake moderation, screening, or basic verification steps for selected listings or users, Growperty does not warrant or guarantee that any listing, image, project detail, legal statement, pricing information, amenity description, or document summary is complete, accurate, updated, error-free, or suitable for your purpose at all times.</p>
              </Section>

              <Section title="3. Buyer and Investor Due Diligence">
                <p>Every buyer, investor, tenant, or other user is solely responsible for conducting independent legal, commercial, financial, technical, and physical due diligence before booking, paying any amount, signing documents, or closing a transaction.</p>
                <p>This includes, where applicable, verification of title, chain of ownership, encumbrances, mortgages, litigation, sanctioned plans, land use, approvals, taxes, dues, occupancy or completion status, possession, structural condition, society or association records, RERA status, and authority of the person offering the property.</p>
              </Section>

              <Section title="4. No Transaction Guarantee">
                <p>Growperty is a technology-enabled property discovery and transaction-assistance platform. Listing, enquiry submission, lead sharing, site visit coordination, matching support, or communication through the Platform does not guarantee property availability, deal completion, financing approval, registration, appreciation, rental yield, possession, or any specific commercial outcome.</p>
                <p>Any negotiations, offers, assurances, side commitments, or transaction terms discussed between users, sellers, developers, brokers, or third parties remain subject to independent confirmation and lawful documentation by the concerned parties.</p>
              </Section>

              <Section title="5. Verification Disclaimer">
                <p>Any statement on the Platform such as "verified," "screened," "qualified," "recommended," "premium," "fast track," or similar labels should not be interpreted as a legal certification, title guarantee, investment recommendation, or conclusive authenticity determination unless expressly stated otherwise in writing by the Company.</p>
                <p>Verification, where conducted, may be limited in scope and may not include full legal, structural, financial, municipal, or regulatory due diligence.</p>
              </Section>

              <Section title="6. Location Display Disclaimer">
                <p>For privacy, safety, anti-circumvention, anti-scraping, and lead-protection purposes, property locations, map pins, landmarks, or coordinates displayed on the Platform may be approximate, generalized, clustered, or intentionally shifted.</p>
                <p>Accordingly, publicly displayed location information should be treated as indicative only and not as an exact geo-location of the relevant property.</p>
              </Section>

              <Section title="7. AI and Analytics Disclaimer">
                <p>Growperty may display automated insights, property scores, trend indicators, estimated ranges, locality signals, investment markers, affordability views, or similar outputs generated using rules, algorithms, internal logic, historical patterns, or third-party data.</p>
                <p>Such AI or analytical outputs are provided only for general informational assistance and do not amount to legal, financial, valuation, or investment advice. They do not guarantee future appreciation, resale value, rental performance, suitability, or transaction safety.</p>
              </Section>

              <Section title="8. Seller and Third-Party Statements">
                <p>Growperty is not the author of all statements appearing on the Platform. Many representations may originate from sellers, owners, developers, brokers, advertisers, external service providers, or other third parties.</p>
                <p>Growperty does not assume responsibility for false claims, concealment, omissions, unauthorized representations, title issues, project delays, approval defects, structural defects, or any misconduct of third parties, except to the extent liability cannot be excluded under applicable law.</p>
              </Section>

              <Section title="9. Site Visits and Physical Inspection">
                <p>Any site visit, inspection, meeting, or on-ground interaction arranged through or following use of the Platform is undertaken at the user's own judgment and risk.</p>
                <p>Users must independently assess safety, surroundings, occupancy, construction status, access, amenities, neighborhood conditions, and suitability of the property. Growperty is not responsible for injury, loss, theft, damage, dispute, delay, or inconvenience arising during or after a site visit, except to the extent directly caused by the Company's proven willful misconduct where exclusion is not permitted by law.</p>
              </Section>

              <Section title="10. No Agency or Fiduciary Relationship">
                <p>Unless expressly agreed through a separate written document, Growperty does not act as a legal representative, fiduciary, attorney, or exclusive agent of any buyer, seller, investor, developer, or user.</p>
                <p>Use of the Platform, submission of an enquiry, or interaction with Growperty does not by itself create any partnership, agency, joint venture, employment, fiduciary duty, or advisory mandate.</p>
              </Section>

              <Section title="11. Communications Disclaimer">
                <p>Growperty may send or facilitate transactional communications, OTPs, reminders, alerts, enquiry responses, visit coordination messages, and follow-ups through WhatsApp, SMS, email, or voice calls, subject to applicable law and user consents.</p>
                <p>Delivery timing, message availability, telecom performance, third-party platform uptime, and message routing are not guaranteed, and Growperty shall not be liable for delays, failures, non-delivery, or technical disruptions caused by telecom operators, messaging intermediaries, device settings, user error, or force majeure.</p>
              </Section>

              <Section title="12. Third-Party Links and Services">
                <p>The Platform may contain links, integrations, embedded tools, maps, messaging services, payment links, external project pages, third-party advertisements, or references to external websites and services for user convenience.</p>
                <p>Growperty does not control and does not necessarily endorse the accuracy, security, legality, availability, content, or practices of any third-party website, service, advertiser, or tool. Users access such third-party resources at their own risk.</p>
              </Section>

              <Section title="13. Availability and Technical Disclaimer">
                <p>Growperty does not guarantee uninterrupted, secure, or error-free operation of the Platform. Access may be affected by maintenance, software defects, cyber incidents, internet failures, telecom issues, hosting downtime, or events beyond reasonable control.</p>
                <p>The Platform and all content are made available on an "as is" and "as available" basis, subject to applicable law.</p>
              </Section>

              <Section title="14. Limitation of Liability">
                <p>To the fullest extent permitted by applicable law, Grenoverse Multi Ventures LLP, its designated partners, employees, consultants, affiliates, and service providers shall not be liable for any indirect, incidental, consequential, special, punitive, or exemplary loss or damage arising out of or in connection with:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>use of or inability to use the Platform;</li>
                  <li>reliance on listing content, AI outputs, maps, project information, communications, or third-party material;</li>
                  <li>property defects, title disputes, delayed possession, project issues, or seller/developer misconduct;</li>
                  <li>failed negotiations, missed opportunities, pricing changes, financing issues, or transaction breakdowns;</li>
                  <li>telecom failures, WhatsApp delays, technical outages, payment interruptions, or third-party system failures.</li>
                </ul>
                <p>Nothing in this Disclaimer excludes liability that cannot be lawfully excluded under applicable law.</p>
              </Section>

              <Section title="15. No Waiver of Legal Rights">
                <p>Nothing in this Disclaimer shall be interpreted to waive any non-waivable statutory rights available to users under applicable law or to permit any misleading, fraudulent, or unfair practice.</p>
                <p>Users are encouraged to independently review all representations, approvals, and transaction documents, particularly because misleading property claims and unfair practices can attract legal consequences in the real estate sector.</p>
              </Section>

              <Section title="16. Changes to Disclaimer">
                <p>Growperty may update, modify, or replace this Disclaimer at any time by posting the revised version on the Platform. Continued use of the Platform after such update shall be treated as acceptance of the revised Disclaimer, to the extent permitted by law.</p>
              </Section>

              <Section title="17. Contact">
                <p><strong>Grenoverse Multi Ventures LLP</strong></p>
                <p>Head Office: 01, Mannat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
                <p>Branch Office: 01, Kirat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
                <p>Email: <a href="mailto:support@growperty.com" className="text-primary underline">support@growperty.com</a></p>
                <p>Phone: <a href="tel:+919891117876" className="text-primary underline">+91 9891117876</a>, <a href="tel:+919971007876" className="text-primary underline">+91 9971007876</a></p>
              </Section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  </>
);

export default DisclaimerPage;
