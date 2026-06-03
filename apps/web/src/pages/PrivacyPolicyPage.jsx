import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">{title}</h2>
    <div className="space-y-2 text-sm leading-relaxed">{children}</div>
  </section>
);

const SubSection = ({ title, items }) => (
  <div>
    <p className="font-semibold text-foreground mb-1">{title}</p>
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  </div>
);

const PrivacyPolicyPage = () => (
  <>
    <Helmet>
      <title>Privacy Policy | Growperty.com</title>
      <meta name="description" content="Read Growperty's Privacy Policy — how we collect, use, store, and protect your personal data." />
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
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Privacy Policy</h1>
                <p className="text-muted-foreground mt-1 font-medium text-sm">Last Updated: June 2026 · Grenoverse Multi Ventures LLP</p>
              </div>
            </div>

            <div className="space-y-8 text-slate-700 dark:text-slate-300">
              <p className="text-sm leading-relaxed">
                This Privacy Policy explains how <strong>Grenoverse Multi Ventures LLP</strong>, operating <strong>Growperty.com</strong> and related applications, forms, communication channels, and services (collectively, the "Platform"), collects, uses, stores, shares, protects, and otherwise processes personal data.
              </p>
              <p className="text-sm leading-relaxed">
                By accessing, registering on, submitting information through, or using the Platform, you acknowledge that you have read and understood this Privacy Policy. Where consent is required under applicable law, personal data will be processed on the basis of your consent or any other lawful basis available under applicable law.
              </p>

              <Section title="1. Entity Details">
                <p><strong>Grenoverse Multi Ventures LLP</strong></p>
                <p>Head Office: 01, Mannat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
                <p>Branch Office: 01, Kirat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
                <p>Email: <a href="mailto:support@growperty.com" className="text-primary underline">support@growperty.com</a> &nbsp;·&nbsp; Phone: <a href="tel:+919891117876" className="text-primary underline">+91 9891117876</a>, <a href="tel:+919971007876" className="text-primary underline">+91 9971007876</a></p>
                <p>For the purposes of this Policy, "personal data" means data about an identifiable individual.</p>
              </Section>

              <Section title="2. Scope">
                <p>This Privacy Policy applies to personal data collected through:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>the Growperty.com website;</li>
                  <li>account registration and login flows;</li>
                  <li>property enquiry, requirement, and listing forms;</li>
                  <li>WhatsApp, SMS, email, voice calls, and support interactions;</li>
                  <li>site-visit scheduling and deal coordination processes;</li>
                  <li>online and offline onboarding connected with Platform services.</li>
                </ul>
                <p>This Policy should be read together with the applicable <Link to="/terms" className="text-primary underline">Terms and Conditions</Link>, <Link to="/disclaimer" className="text-primary underline">Disclaimer</Link>, consent notices, and any transaction-specific or service-specific terms presented on the Platform.</p>
              </Section>

              <Section title="3. Personal Data Collected">
                <p>Depending on how the Platform is used, Growperty may collect the following categories of personal data:</p>
                <SubSection title="3.1 Identity and Contact Data" items={['full name;', 'mobile number;', 'email address;', 'city, locality, and address details;', 'communication preferences.']} />
                <SubSection title="3.2 Account and Verification Data" items={['OTP verification details;', 'login and account identifiers;', 'profile information;', 'KYC or identity-related details where required for verification or compliance;', 'authority documents where a user acts on behalf of another person or entity.']} />
                <SubSection title="3.3 Property and Transaction Data" items={['property preferences, budget, purpose, and search requirements;', 'property listing details submitted by sellers, owners, or authorized representatives;', 'site visit requests and visit history;', 'enquiry history, lead records, negotiation history, and transaction-stage information;', 'documents, photos, videos, floor plans, and related uploads.']} />
                <SubSection title="3.4 Device and Usage Data" items={['IP address;', 'browser type;', 'device type;', 'operating system;', 'pages viewed;', 'timestamps;', 'referral URLs;', 'clickstream, interaction, and session-level activity.']} />
                <SubSection title="3.5 Communication Data" items={['emails, chat records, WhatsApp messages, call logs, support tickets, and other communication records shared with or through the Platform.']} />
                <SubSection title="3.6 Payment and Commercial Data" items={['fee-related records, invoices, payment status, tax details, and related transaction metadata, where applicable.']} />
                <p><strong>3.7 Sensitive or Higher-Risk Data:</strong> Growperty does not intentionally seek unnecessary sensitive personal data. Where any higher-risk personal information is collected, it will be collected only where reasonably necessary, lawfully permitted, and subject to appropriate notice and safeguards.</p>
              </Section>

              <Section title="4. How Personal Data Is Collected">
                <p>Personal data may be collected:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>directly from users when forms are filled, accounts are created, or enquiries are submitted;</li>
                  <li>during calls, chats, WhatsApp conversations, emails, and support interactions;</li>
                  <li>when property details, requirements, or documents are uploaded;</li>
                  <li>automatically through cookies, logs, analytics tools, and device/browser technologies;</li>
                  <li>from business partners, owners, developers, brokers, service providers, or public sources where relevant to Platform operations;</li>
                  <li>during verification, anti-fraud, or transaction-assistance processes.</li>
                </ul>
              </Section>

              <Section title="5. Purposes of Processing">
                <p>Growperty may process personal data for the following purposes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>creating and managing accounts;</li>
                  <li>verifying users, listings, and submitted information;</li>
                  <li>matching buyers, sellers, investors, and properties;</li>
                  <li>enabling listing publication, enquiry handling, and requirement fulfillment;</li>
                  <li>coordinating site visits, discussions, and transaction workflows;</li>
                  <li>sending OTPs, service alerts, reminders, and operational messages;</li>
                  <li>providing customer support and responding to grievances;</li>
                  <li>preventing fraud, spam, misuse, scraping, circumvention, and security incidents;</li>
                  <li>improving user experience, recommendations, analytics, and Platform performance;</li>
                  <li>enabling AI-based insights, filters, matching systems, and internal scoring tools;</li>
                  <li>administering fees, invoices, collections, and recovery processes;</li>
                  <li>complying with legal, regulatory, tax, contractual, audit, or law-enforcement obligations;</li>
                  <li>establishing, exercising, or defending legal claims.</li>
                </ul>
              </Section>

              <Section title="6. Legal Basis and Consent">
                <p>Where consent is required, Growperty seeks consent through clear affirmative action such as checkbox acceptance, form submission, OTP-based flows, email confirmation, or other recorded digital interactions.</p>
                <p>In appropriate cases, Growperty may also process personal data where such processing is reasonably necessary for requested services, fraud prevention, security, compliance, dispute handling, or other lawful uses available under applicable law.</p>
                <p>Where non-essential promotional communication consent is collected, such consent may be withdrawn by the user at any time through available unsubscribe or preference-management methods.</p>
              </Section>

              <Section title="7. Communication Policy">
                <p>If a user provides a mobile number, email address, or similar contact information, Growperty may send:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>OTPs and login confirmations;</li>
                  <li>enquiry acknowledgements;</li>
                  <li>buyer/seller matching alerts;</li>
                  <li>property recommendations;</li>
                  <li>site visit coordination messages;</li>
                  <li>transaction updates;</li>
                  <li>account and security alerts;</li>
                  <li>support and grievance responses;</li>
                  <li>fee or payment-related reminders, where applicable.</li>
                </ul>
                <p>Service-related communications may continue where necessary for security, service delivery, transaction processing, fraud prevention, compliance, dispute resolution, or enforcement of accepted terms. Promotional communications, where consent-based, may be opted out of separately.</p>
              </Section>

              <Section title="8. Cookies and Similar Technologies">
                <p>Growperty may use cookies, pixels, SDKs, analytics tags, session tools, and similar technologies to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>keep users signed in;</li>
                  <li>remember preferences;</li>
                  <li>analyze traffic and usage;</li>
                  <li>improve performance and product features;</li>
                  <li>understand conversion flows;</li>
                  <li>protect against abuse and suspicious activity.</li>
                </ul>
                <p>Users may control cookies through browser settings or other mechanisms made available on the Platform, though disabling some cookies may affect functionality.</p>
              </Section>

              <Section title="9. Sharing of Personal Data">
                <p>Growperty may share personal data only as reasonably necessary with:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>property owners, sellers, buyers, developers, or authorized representatives involved in a relevant enquiry or transaction;</li>
                  <li>employees, affiliates, and internal teams on a need-to-know basis;</li>
                  <li>technology vendors, cloud hosting providers, CRM providers, analytics providers, communication service providers, and similar processors;</li>
                  <li>payment, invoicing, compliance, audit, legal, collection, or support service providers;</li>
                  <li>governmental, regulatory, judicial, tax, or law-enforcement authorities where required by law or necessary to protect legal rights;</li>
                  <li>acquirers, investors, successors, or transaction counterparties in connection with a merger, acquisition, restructuring, financing, or business transfer, subject to lawful handling obligations.</li>
                </ul>
                <p>Growperty does not sell personal data in a manner inconsistent with this Privacy Policy or applicable law.</p>
              </Section>

              <Section title="10. Data Quality and User Responsibility">
                <p>Users are responsible for ensuring that the personal data and property-related information submitted by them is accurate, lawful, and updated.</p>
                <p>Users should not share another person's data, identity documents, phone number, or property details without appropriate authority or lawful basis.</p>
              </Section>

              <Section title="11. Retention">
                <p>Personal data may be retained for as long as reasonably necessary for account management, listing and enquiry handling, site-visit records, transaction support, anti-fraud and abuse prevention, legal compliance, evidence preservation, dispute resolution, recovery of dues, and audit and internal recordkeeping.</p>
                <p>When personal data is no longer required for the purposes for which it was collected, it may be deleted, anonymized, redacted, or archived, subject to legal and operational requirements.</p>
              </Section>

              <Section title="12. Security Practices">
                <p>Growperty implements reasonable technical, organizational, and administrative safeguards designed to protect personal data against unauthorized access, loss, misuse, alteration, disclosure, or destruction.</p>
                <p>However, no website, app, network, storage environment, or transmission system can be guaranteed to be fully secure, and users submit data at their own risk to the extent permitted by law.</p>
              </Section>

              <Section title="13. User Rights and Choices">
                <p>Subject to applicable law and reasonable verification, users may request to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>access or review certain personal data associated with them;</li>
                  <li>correct, update, or complete inaccurate data;</li>
                  <li>withdraw consent for consent-based processing;</li>
                  <li>opt out of non-essential promotional communications;</li>
                  <li>request erasure or restriction, where legally applicable;</li>
                  <li>raise grievances regarding privacy practices.</li>
                </ul>
                <p>To exercise any of these rights, write to <a href="mailto:support@growperty.com" className="text-primary underline">support@growperty.com</a>.</p>
              </Section>

              <Section title="14. Withdrawal of Consent">
                <p>Where processing is based on consent, users may withdraw consent through the same or an equivalent accessible channel through which consent was provided, such as unsubscribe links, consent management options, or by emailing <a href="mailto:support@growperty.com" className="text-primary underline">support@growperty.com</a>.</p>
                <p>Withdrawal of consent will not affect processing already undertaken before the withdrawal request, and certain limited processing may continue where required for security, legal compliance, fraud prevention, recordkeeping, dispute handling, or enforcement of accrued rights, to the extent permitted by law.</p>
              </Section>

              <Section title="15. Children's Privacy">
                <p>The Platform is not intended for children who are not legally competent to enter into relevant contracts or use the services independently under applicable law.</p>
                <p>If Growperty becomes aware that personal data has been collected in a manner inconsistent with applicable legal requirements concerning children, it may take appropriate steps to restrict access, seek additional consent, or delete the data as required.</p>
              </Section>

              <Section title="16. Third-Party Services and Links">
                <p>The Platform may integrate or link with third-party tools, maps, payment services, communication platforms, analytics services, advertisements, or external websites.</p>
                <p>Growperty does not control the privacy practices of third-party platforms and users should review the privacy notices of those third parties separately.</p>
              </Section>

              <Section title="17. Cross-Border or Processor Handling">
                <p>Where data is processed by third-party vendors, cloud providers, communication platforms, or technology partners, such processing may occur on systems or infrastructure operated by those service providers, subject to contractual or operational safeguards as applicable.</p>
                <p>Growperty will take reasonable steps to ensure that such processing remains aligned with this Policy and applicable law.</p>
              </Section>

              <Section title="18. Grievances and Requests">
                <p>For privacy-related questions, correction requests, consent withdrawal, or grievances, contact:</p>
                <p><strong>Grenoverse Multi Ventures LLP</strong></p>
                <p>Head Office: 01, Mannat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
                <p>Branch Office: 01, Kirat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
                <p>Email: <a href="mailto:support@growperty.com" className="text-primary underline">support@growperty.com</a></p>
                <p>Phone: <a href="tel:+919891117876" className="text-primary underline">+91 9891117876</a>, <a href="tel:+919971007876" className="text-primary underline">+91 9971007876</a></p>
              </Section>

              <Section title="19. Policy Updates">
                <p>Growperty may update this Privacy Policy from time to time to reflect legal, operational, technical, or business changes. The revised version will be posted on the Platform with an updated "Last Updated" date.</p>
                <p>Continued use of the Platform after such update may constitute acknowledgement of the revised Policy, to the extent permitted by law.</p>
              </Section>

              {/* Short notice boxes */}
              <div className="space-y-4 pt-2">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
                  <p className="font-bold text-foreground mb-1">Short Privacy Notice (forms & signup flows)</p>
                  <p className="italic text-slate-600 dark:text-slate-400">"By continuing, you agree that Growperty may collect and process your personal data for account creation, enquiry handling, matching, site visit coordination, support, fraud prevention, and related service purposes, in accordance with the Privacy Policy."</p>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
                  <p className="font-bold text-foreground mb-1">Marketing Consent Line</p>
                  <p className="italic text-slate-600 dark:text-slate-400">"I agree to receive property recommendations, offers, updates, and promotional communications from Growperty through WhatsApp, SMS, email, and calls. I understand that I can withdraw this consent later."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  </>
);

export default PrivacyPolicyPage;
