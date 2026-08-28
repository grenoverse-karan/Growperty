import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, User, Home, Handshake, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-foreground border-b border-border pb-2">{title}</h2>
    <div className="space-y-2 text-sm leading-relaxed">{children}</div>
  </section>
);

const SubList = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

const BuyerTerms = () => (
  <div className="space-y-8 text-slate-700 dark:text-slate-300">
    <p className="text-sm leading-relaxed">
      These Terms and Conditions ("Terms") govern the access and use of <strong>Growperty.com</strong> and related applications, forms, communication channels, and services (collectively, the "Platform"), operated by <strong>Grenoverse Multi Ventures LLP</strong> ("Company", "Growperty", "we", "us", or "our").
    </p>
    <p className="text-sm leading-relaxed">
      By visiting, registering on, submitting an enquiry through, scheduling a site visit through, or otherwise using the Platform, you ("Buyer", "User", "you", or "your") agree to be bound by these Terms, our Privacy Policy, and any additional written terms accepted by you for a specific service or transaction. If you do not agree, do not use the Platform.
    </p>

    <Section title="1. Platform Role">
      <p>1.1 Growperty is a technology-enabled property discovery, lead-routing, and transaction-assistance platform.</p>
      <p>1.2 Unless expressly agreed by the Company in a separate written document, Growperty does not act as your attorney, legal adviser, financial adviser, architect, valuer, or authorized signatory.</p>
      <p>1.3 The Platform may facilitate introductions, enquiries, negotiations, document coordination, and site visit scheduling between buyers and property owners, developers, or their authorized representatives.</p>
      <p>1.4 The Company does not guarantee that any property listed on the Platform will remain available, be sold at a specific price, or match your expectations or investment goals.</p>
    </Section>

    <Section title="2. Eligibility">
      <p>2.1 You must be legally competent to enter into a binding contract under applicable law.</p>
      <p>2.2 If you use the Platform on behalf of a company, family office, partnership, or any other person, you represent that you are duly authorized to bind that person or entity to these Terms.</p>
      <p>2.3 You agree to provide true, current, and complete information while creating an account, submitting an enquiry, booking a visit, or interacting with the Platform.</p>
    </Section>

    <Section title="3. Account and Verification">
      <p>3.1 The Company may require mobile OTP verification, email verification, KYC details, or other identity checks before giving access to specific listings, seller interactions, or site visits.</p>
      <p>3.2 You are responsible for maintaining the confidentiality of your login credentials, OTPs, and account access.</p>
      <p>3.3 You shall not impersonate any person, create false enquiries, submit fake requirements, or use misleading contact information.</p>
      <p>3.4 The Company may suspend, restrict, or terminate access where it reasonably believes your account is fake, risky, abusive, non-compliant, or involved in circumvention.</p>
    </Section>

    <Section title="4. Property Information and Listing Content">
      <p>4.1 Property details displayed on the Platform may be based on information received from property owners, developers, brokers, public records, third-party sources, or internal assessments.</p>
      <p>4.2 While the Company may apply screening, moderation, or verification checks, it does not warrant that every property detail, approval, area measurement, photograph, price, title status, possession timeline, amenity description, or legal statement is complete, accurate, or updated at all times.</p>
      <p>4.3 Any map pin, locality pointer, landmark marker, or displayed location may be approximate, generalized, or intentionally shifted for privacy, security, lead-protection, or anti-circumvention purposes.</p>
      <p>4.4 You agree not to treat any listing, map location, score, image, brochure, chat response, or telephonic conversation as a substitute for your independent legal, technical, tax, and financial due diligence.</p>
    </Section>

    <Section title="5. Buyer Due Diligence">
      <p>5.1 Before paying any token, booking amount, earnest money, or sale consideration, you must independently verify all material aspects of the property, including title, encumbrances, approvals, sanctioned plans, RERA status where applicable, possession status, dues, taxes, physical condition, and seller authority.</p>
      <p>5.2 Growperty is not responsible for hidden defects, title disputes, unauthorized construction, encroachments, pending litigation, financing issues, delayed possession, or misstatements made by property owners or third parties.</p>
      <p>5.3 Any purchase decision made by you is solely at your own judgment and risk.</p>
    </Section>

    <Section title="6. Site Visits and Conduct">
      <p>6.1 Site visits may be arranged only through the Platform and only for qualified buyers, at the Company's discretion.</p>
      <p>6.2 You agree to behave lawfully and respectfully during calls, chats, meetings, and site visits, and shall not harass, threaten, pressure, record without permission, or misuse seller or property information.</p>
      <p>6.3 You shall not visit, inspect, contact occupants, security staff, neighbors, society managers, or local brokers for the purpose of identifying or reaching the property directly where the listing location has been masked or the contact is intentionally withheld.</p>
      <p>6.4 The Company may refuse, reschedule, or cancel any site visit without liability if it suspects misuse, safety risk, fake intent, or breach of these Terms.</p>
    </Section>

    <Section title="7. Buyer Fee / Success Fee">
      <p>7.1 Certain properties or transactions may involve a buyer-side service fee, success fee, facilitation fee, advisory fee, visit fee, or transaction support charge ("Buyer Fee").</p>
      <p>7.2 No Buyer Fee shall be payable by you unless the applicable amount, rate, formula, or fee event has been communicated to you and accepted by you through the Platform, by electronic checkbox, written message, email, booking form, term sheet, or any other recorded mode before execution of a binding transaction document or closure event.</p>
      <p>7.3 Where a Buyer Fee is applicable and accepted by you, the Buyer Fee shall become due upon the earliest of the following events in relation to a property introduced, shown, or materially facilitated through Growperty:</p>
      <SubList items={[
        'execution of a booking form;',
        'payment of token or booking amount;',
        'execution of an expression of interest, term sheet, allotment, agreement to sell, memorandum of understanding, or similar instrument;',
        'registration, transfer, lease execution, or possession event;',
        'any direct or indirect closing of the transaction with the relevant seller, developer, owner, or their affiliate.',
      ]} />
      <p>7.4 Unless otherwise agreed in writing, your Buyer Fee obligation shall continue for <strong>12 months</strong> from the date on which the relevant property, seller, or lead was first introduced to you through Growperty.</p>
      <p>7.5 All due Buyer Fees shall be paid within <strong>3 business days</strong> of the applicable trigger event, unless a different timeline is expressly agreed in writing.</p>
      <p>7.6 Taxes, if applicable, shall be charged in addition to the Buyer Fee.</p>
    </Section>

    <Section title="8. Anti-Circumvention">
      <p>8.1 If the Company introduces you to a property, seller, owner, developer, or transaction opportunity, you agree not to bypass, avoid, or circumvent the Platform in order to prevent the Company from earning its agreed fee.</p>
      <p>8.2 Prohibited circumvention includes, without limitation:</p>
      <SubList items={[
        'contacting the seller directly outside the Platform after introduction through Growperty;',
        'using publicly available records, neighbors, guards, society offices, brokers, or digital tools to identify or reach a masked listing;',
        'routing the transaction through a friend, relative, entity, broker, employee, or affiliate to avoid payment of the Buyer Fee;',
        'concluding the transaction off-platform after using Growperty\'s listing data, site visit coordination, negotiation assistance, or seller introduction.',
      ]} />
      <p>8.3 In the event of circumvention, the Company shall be entitled, subject to applicable law, to recover: the unpaid Buyer Fee that would otherwise have been payable; reasonable compensation for breach and recovery costs; documented legal costs and collection expenses.</p>
      <p>8.4 You acknowledge that the Company may maintain lead logs, communication records, OTP logs, visit records, timestamps, acceptance records, and CRM evidence for enforcing its rights.</p>
    </Section>

    <Section title="9. Communications Consent">
      <p>9.1 By providing your mobile number, email address, or other contact details, you consent to receive service-related communications from Growperty, including OTPs, enquiry confirmations, site visit coordination, transaction updates, support replies, fraud-prevention alerts, and payment reminders through WhatsApp, SMS, email, and voice calls.</p>
      <p>9.2 Promotional or marketing communications, where required by applicable law, shall be sent only on the basis of a valid consent or other lawful basis available to the Company.</p>
      <p>9.3 You may opt out of non-essential promotional communications using the unsubscribe link, account settings, reply instructions, or by writing to the contact address notified by the Company.</p>
      <p>9.4 Your withdrawal of non-essential communication consent shall not affect service messages that are reasonably necessary for account security, transaction processing, fraud prevention, compliance, dispute management, or performance of services already requested by you.</p>
    </Section>

    <Section title="10. AI Tools, Scores, and Market Insights">
      <p>10.1 The Platform may display automated estimates, market trends, property scores, locality insights, affordability markers, yield indicators, or other analytics generated using rules, historical data, third-party data, or automated systems.</p>
      <p>10.2 Such information is provided for general informational purposes only and does not constitute legal, valuation, tax, or investment advice.</p>
      <p>10.3 The Company does not guarantee future appreciation, rental income, returns, resale value, financing approval, or suitability of any property based on any score, trend, or analytical output shown on the Platform.</p>
    </Section>

    <Section title="11. Prohibited Use">
      <p>11.1 You shall not:</p>
      <SubList items={[
        'scrape, copy, download, harvest, frame, mirror, or commercially exploit listings or seller data without written permission;',
        'upload malware, interfere with Platform security, or probe the Platform for vulnerabilities;',
        'use automated tools, bots, or scripts to extract listing intelligence or hidden identity information;',
        'post unlawful, defamatory, obscene, discriminatory, or misleading content;',
        'attempt to reverse engineer internal lead-routing, pricing, matching, scoring, or anti-bypass mechanisms.',
      ]} />
      <p>11.2 The Company may take technical, legal, or commercial action against prohibited use.</p>
    </Section>

    <Section title="12. Intellectual Property">
      <p>12.1 All Platform software, branding, content layout, text, compilations, databases, graphics, features, and internal processes are owned by or licensed to the Company.</p>
      <p>12.2 Your use of the Platform does not grant you any ownership rights in the Platform or any license except the limited, revocable, non-transferable right to access the Platform for personal or internal business use in accordance with these Terms.</p>
    </Section>

    <Section title="13. Disclaimer of Warranties">
      <p>13.1 The Platform and all content, services, and communications are provided on an "as is" and "as available" basis.</p>
      <p>13.2 To the fullest extent permitted by law, the Company disclaims all warranties, express or implied, including warranties relating to uninterrupted access, merchantability, fitness for a particular purpose, accuracy, non-infringement, and suitability.</p>
      <p>13.3 The Company does not guarantee that the Platform will be error-free, always available, or free from delays, outages, or third-party integration failures.</p>
    </Section>

    <Section title="14. Limitation of Liability">
      <p>14.1 To the fullest extent permitted by law, the Company, its designated partners, employees, consultants, service providers, and affiliates shall not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages.</p>
      <p>14.2 Without limiting the above, the Company shall not be liable for:</p>
      <SubList items={[
        'loss caused by false statements or misconduct of a seller, developer, broker, or third party;',
        'title defects, legal disputes, approval issues, encumbrances, structural defects, or project delays;',
        'your reliance on any listing content, AI score, trend, chat, or communication;',
        'missed opportunities, loss of profit, goodwill, financing loss, or data loss;',
        'service interruptions, telecom failures, messaging delays, payment gateway issues, or force majeure events.',
      ]} />
      <p>14.3 Where liability cannot be excluded under applicable law, the aggregate liability of the Company shall not exceed the lower of: the total Buyer Fee actually paid by you to the Company in the preceding 12 months for the relevant transaction; or INR 10,000.</p>
    </Section>

    <Section title="15. Indemnity">
      <p>15.1 You agree to indemnify, defend, and hold harmless the Company, its designated partners, employees, and affiliates from and against all claims, losses, liabilities, penalties, damages, costs, and expenses, including reasonable legal fees, arising out of or related to: your breach of these Terms; your misuse of the Platform; your circumvention of the Platform; your violation of any law or third-party rights; false information or documents submitted by you.</p>
    </Section>

    <Section title="16. Suspension and Termination">
      <p>16.1 The Company may suspend, limit, delist, restrict, or terminate your access immediately if it believes that you have breached these Terms, your conduct creates legal, commercial, reputational, or safety risk, or continued access may harm other users, sellers, or the Platform.</p>
      <p>16.2 Suspension or termination shall not affect any accrued rights, payment obligations, indemnities, evidence rights, or remedies available to the Company.</p>
    </Section>

    <Section title="17. Privacy and Data Use">
      <p>17.1 Personal data shall be handled in accordance with the Platform's Privacy Policy and applicable law.</p>
      <p>17.2 You agree that the Company may use your data for account management, lead handling, visit scheduling, fraud prevention, service improvement, legal compliance, dispute resolution, payment recovery, and other purposes described in the Privacy Policy or disclosed at the point of collection.</p>
    </Section>

    <Section title="18. Electronic Acceptance and Records">
      <p>18.1 Your acceptance of these Terms through checkbox, click-wrap, OTP flow, logged form submission, recorded WhatsApp confirmation, email confirmation, or any other electronic mode shall constitute valid acceptance.</p>
      <p>18.2 Electronic records maintained by the Company, including logs, timestamps, CRM notes, communication trails, invoices, payment reminders, visit records, and system-generated metadata, shall be admissible to the extent permitted by law for enforcing these Terms.</p>
    </Section>

    <Section title="19. Governing Law and Jurisdiction">
      <p>19.1 These Terms shall be governed by and construed in accordance with the laws of India.</p>
      <p>19.2 Subject to applicable law, courts having competent jurisdiction in <strong>Gautam Buddh Nagar, Uttar Pradesh</strong> shall have exclusive jurisdiction over disputes arising out of or relating to these Terms or the use of the Platform.</p>
    </Section>

    <Section title="20. Changes to Terms">
      <p>20.1 The Company may revise these Terms from time to time by updating the revised version on the Platform. Continued use of the Platform after such update shall constitute acceptance of the revised Terms, to the extent permitted by law.</p>
    </Section>

    <Section title="21. Service Fee & Pricing">
      <p>Where applicable, the Buyer Fee shall be as per the fee schedule displayed on the Platform or as separately communicated to and accepted by the Buyer through any recorded electronic or written mode prior to the relevant transaction trigger.</p>
    </Section>

    <Section title="22. Contact">
      <p><strong>Grenoverse Multi Ventures LLP</strong></p>
      <p>Head Office: 01, Mannat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
      <p>Branch Office: 01, Kirat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
      <p>Email: <a href="mailto:support@growperty.com" className="text-primary underline">support@growperty.com</a></p>
      <p>Phone: <a href="tel:+919891117876" className="text-primary underline">+91 9891117876</a>, <a href="tel:+919891487876" className="text-primary underline">+91 9891487876</a></p>
    </Section>

    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
      <p className="font-bold text-foreground mb-1">Checkbox Text (Signup / Enquiry / Login / Site-visit flow)</p>
      <p className="italic">"I have read and agree to Growperty's Terms and Conditions and Privacy Policy. I understand that certain transactions may attract a disclosed Buyer Fee, and I agree not to bypass the Platform for any property introduced through Growperty."</p>
    </div>
  </div>
);

const SellerTerms = () => (
  <div className="space-y-8 text-slate-700 dark:text-slate-300">
    <p className="text-sm leading-relaxed">
      These Terms and Conditions ("Terms") govern the listing, publication, promotion, lead handling, and transaction-assistance services made available through <strong>Growperty.com</strong> and related applications, forms, communication channels, and services (collectively, the "Platform"), operated by <strong>Grenoverse Multi Ventures LLP</strong> ("Company", "Growperty", "we", "us", or "our").
    </p>
    <p className="text-sm leading-relaxed">
      By registering, creating an account, submitting property information, listing a property, responding to leads, scheduling a site visit, or otherwise using the Platform as a property owner, landlord, seller, developer, builder, lessor, attorney holder, or authorized representative ("Seller", "Owner", "you", or "your"), you agree to be bound by these Terms, our Privacy Policy, and any additional written or electronic terms accepted by you for a specific service, package, or transaction. If you do not agree, do not use the Platform.
    </p>

    <Section title="1. Platform Role">
      <p>1.1 Growperty is a technology-enabled property discovery, lead-routing, listing-management, and transaction-assistance platform.</p>
      <p>1.2 Unless expressly agreed in a separate written document, Growperty does not act as your legal adviser, tax adviser, architect, valuer, attorney, or fiduciary representative.</p>
      <p>1.3 The Platform may facilitate listing publication, enquiry handling, property discovery, buyer screening, communication coordination, document collection, and site visit scheduling.</p>
      <p>1.4 The Company does not guarantee any minimum number of leads, site visits, offers, sale price, rental value, closure timeline, or transaction completion.</p>
    </Section>

    <Section title="2. Eligibility and Authority">
      <p>2.1 You must be legally competent to enter into a binding contract under applicable law.</p>
      <p>2.2 You may list a property only if you are the legal owner; or you hold a valid and legally sufficient authority, power of attorney, board authorization, mandate, allotment right, or other written authorization permitting you to market, negotiate, or transact in relation to that property.</p>
      <p>2.3 If you act on behalf of any owner, company, HUF, partnership, developer, society, or other person, you represent that you are duly authorized to bind that person or entity to these Terms.</p>
      <p>2.4 You shall provide true, current, complete, and non-misleading information at all times.</p>
    </Section>

    <Section title="3. Listing Services">
      <p>3.1 The Company may allow free listing, assisted listing, premium placement, Fast Track listing, promotional tools, or other paid and unpaid listing models from time to time.</p>
      <p>3.2 A property may be accepted, rejected, moderated, edited for formatting, temporarily hidden, limited in visibility, or removed at the Company's discretion for quality, compliance, duplication, fraud-risk, safety, technical, or business reasons.</p>
      <p>3.3 Listing on the Platform does not create any exclusive agency relationship unless expressly agreed in writing.</p>
    </Section>

    <Section title="4. Free Listing and Paid Services">
      <p>4.1 The Company may offer a free listing option for certain properties, categories, geographies, or durations. The availability, duration, scope, and visibility of free listings may be changed, restricted, limited, or withdrawn by the Company at any time.</p>
      <p>4.2 Paid services such as Fast Track, premium visibility, promotional boosts, featured badges, lead-priority routing, or campaign support shall be governed by the pricing, duration, deliverables, and terms disclosed at the time of purchase.</p>
      <p>4.3 Unless otherwise expressly stated in writing, fees paid for paid listing services, visibility upgrades, promotions, or marketing tools are non-refundable once the service has been activated or materially provisioned.</p>
      <p>4.4 Purchase of a paid listing package does not by itself waive any separately disclosed success fee, facilitation fee, or transaction-linked charge.</p>
    </Section>

    <Section title="5. Seller Information and Representations">
      <p>5.1 By listing or submitting a property, you represent and warrant that:</p>
      <SubList items={[
        'the property details, dimensions, floor area, location, photographs, videos, title information, price, possession status, approvals, and disclosures submitted by you are true, lawful, and not misleading;',
        'you have the right to share and publish the content, images, and documents uploaded by you;',
        'you will promptly update any material change affecting price, availability, title, encumbrance, litigation, possession, occupancy, approvals, or authority;',
        'your listing does not infringe any third-party rights or violate any law, court order, regulatory condition, or contract.',
      ]} />
      <p>5.2 You further represent that all material adverse facts known to you, including pending disputes, mortgages, charges, notices, acquisition issues, access issues, or structural risks, have been disclosed or will be disclosed before any transaction closure.</p>
    </Section>

    <Section title="6. Verification and Documents">
      <p>6.1 The Company may ask for title papers, ID proof, address proof, tax receipts, sanction documents, RERA details where applicable, authorization letters, photographs, utility documents, or any other information reasonably required for moderation, verification, fraud prevention, or compliance.</p>
      <p>6.2 You agree to provide requested documents within a reasonable time and in legible form.</p>
      <p>6.3 Failure to provide satisfactory verification may result in reduced visibility, suspension, delisting, withholding of leads, or account restriction.</p>
    </Section>

    <Section title="7. Success Fee / Transaction Fee">
      <p>7.1 Certain properties, categories, transactions, or service arrangements may involve a seller-side success fee, facilitation fee, commission, introduction fee, advisory fee, or transaction support fee ("Seller Fee").</p>
      <p>7.2 No Seller Fee shall be payable by you unless the applicable amount, rate, formula, or fee event has been communicated to you and accepted by you through the Platform, by checkbox, email, WhatsApp confirmation, signed form, digital mandate, pricing sheet, onboarding flow, or any other recorded mode.</p>
      <p>7.3 Where a Seller Fee is applicable and accepted by you, it shall become due upon the earliest of the following events in relation to a buyer introduced, identified, screened, scheduled, tracked, or materially facilitated through Growperty:</p>
      <SubList items={[
        'receipt of token, booking amount, earnest money, or reservation amount;',
        'execution of a term sheet, booking form, allotment, expression of interest, memorandum of understanding, agreement to sell, lease deed, leave and license, or similar instrument;',
        'registration, transfer, possession, handover, or closure of the transaction;',
        'completion of any direct or indirect transaction with the relevant buyer or with any relative, nominee, affiliate, entity, associate, or representative of such buyer.',
      ]} />
      <p>7.4 Unless otherwise agreed in writing, your Seller Fee obligation shall continue for <strong>12 months</strong> from the date on which the relevant buyer, lead, or transaction opportunity was first introduced or materially facilitated through Growperty.</p>
      <p>7.5 All due Seller Fees shall be paid within <strong>3 business days</strong> of the applicable trigger event, unless a different period is expressly agreed in writing.</p>
      <p>7.6 Taxes, if applicable, shall be charged in addition to the Seller Fee.</p>
    </Section>

    <Section title="8. Anti-Circumvention">
      <p>8.1 If the Company introduces, routes, identifies, screens, schedules, or materially facilitates a buyer, enquiry, or transaction opportunity for you, you agree not to bypass, avoid, or circumvent the Platform in order to prevent the Company from earning its agreed fee.</p>
      <p>8.2 Prohibited circumvention includes, without limitation:</p>
      <SubList items={[
        'directly negotiating or closing with a buyer introduced through Growperty without honoring the applicable Seller Fee;',
        'obtaining buyer details from site visits, calls, chats, forms, guards, neighbors, brokers, society offices, or third parties for off-platform closing;',
        'routing the transaction through a relative, employee, partner, affiliate, nominee, broker, attorney holder, or entity to avoid payment;',
        'falsely marking the property as unavailable, sold, or withdrawn while continuing negotiations with a Growperty-introduced buyer;',
        'deleting the listing or stopping communication on the Platform while privately pursuing the same introduced lead.',
      ]} />
      <p>8.3 In the event of circumvention, the Company shall be entitled, subject to applicable law, to recover: the unpaid Seller Fee that would otherwise have been payable; reasonable compensation for breach and recovery costs; documented legal costs, investigation costs, and collection expenses.</p>
      <p>8.4 You acknowledge that the Company may maintain CRM records, lead logs, visit records, OTP logs, timestamps, communication trails, acceptance records, and related metadata for enforcing its rights.</p>
    </Section>

    <Section title="9. Hidden Contact and Listing Protection">
      <p>9.1 To protect lead integrity and reduce misuse, the Company may hide, mask, redact, or moderate phone numbers, email addresses, website links, QR codes, or other direct-contact details from your listing.</p>
      <p>9.2 You shall not include direct contact details in listing titles, descriptions, photographs, watermarks, brochures, videos, floor plans, or any uploaded media unless expressly permitted by the Company.</p>
    </Section>

    <Section title="10. Location Display and Privacy Protection">
      <p>10.1 You acknowledge and agree that map pins, localities, coordinates, landmarks, or displayed locations on the Platform may be approximate, generalized, clustered, or intentionally shifted for privacy, security, anti-scraping, or anti-circumvention purposes.</p>
      <p>10.2 The Company may disclose more precise location information only to qualified users, after verification, or during an authorized site visit process, at its discretion.</p>
    </Section>

    <Section title="11. Leads and Site Visits">
      <p>11.1 The Company may screen, prioritize, qualify, rank, or withhold buyer leads based on internal quality checks, fraud prevention, buyer intent signals, profile completeness, or business rules.</p>
      <p>11.2 You agree to reasonably cooperate in relation to genuine buyer enquiries, visit coordination, and transaction follow-up.</p>
      <p>11.3 The Company may cancel, reschedule, limit, or decline any site visit if it reasonably suspects fake intent, safety risk, abuse, or breach of these Terms.</p>
      <p>11.4 While the Company may attempt to screen users, it does not guarantee the conduct, solvency, seriousness, identity, or safety of any buyer or visitor.</p>
    </Section>

    <Section title="12. Seller Conduct">
      <p>12.1 You shall not:</p>
      <SubList items={[
        'post fake, duplicate, misleading, or bait listings;',
        'artificially inflate prices after generating buyer interest without updating the listing;',
        'harass, threaten, discriminate against, spam, or abuse any user or Company staff;',
        'collect or misuse buyer information for unrelated marketing, database building, or resale;',
        'upload unlawful, infringing, obscene, or deceptive content;',
        'interfere with the Platform\'s systems, ranking, lead-routing, or security features.',
      ]} />
    </Section>

    <Section title="13. Disclaimer and Limitation of Liability">
      <p>13.1 The Platform and all services are provided on an "as is" and "as available" basis. To the fullest extent permitted by law, the Company disclaims all warranties, express or implied.</p>
      <p>13.2 The Company shall not be liable for failed negotiations, delayed deals, cancelled transactions, false statements or misconduct by buyers, service downtime, or force majeure events.</p>
      <p>13.3 Where liability cannot be excluded under applicable law, the aggregate liability of the Company shall not exceed the lower of: the total amount actually paid by you to the Company in the preceding 12 months in relation to the relevant listing or transaction; or INR 10,000.</p>
    </Section>

    <Section title="14. Indemnity">
      <p>14.1 You agree to indemnify, defend, and hold harmless the Company, its designated partners, employees, and affiliates from and against all claims, losses, liabilities, penalties, damages, costs, and expenses arising out of or related to: breach of these Terms; false, misleading, incomplete, or fraudulent property information or documents submitted by you; title defects, authority defects, undisclosed disputes, or third-party claims connected to your property; your misuse of buyer data or circumvention of the Platform; your violation of any law or third-party rights.</p>
    </Section>

    <Section title="15. Content License">
      <p>15.1 You grant the Company a non-exclusive, royalty-free, revocable, sublicensable, and limited license to host, store, reproduce, publish, format, adapt, compress, crop, watermark, translate, market, and display the listing content, media, and documents provided by you for the purpose of operating, promoting, protecting, and improving the Platform and the listing services.</p>
    </Section>

    <Section title="16. Electronic Acceptance and Records">
      <p>16.1 Your acceptance of these Terms through checkbox, click-wrap, OTP flow, logged form submission, email confirmation, recorded WhatsApp acknowledgment, digital onboarding, or any other electronic mode shall constitute valid acceptance.</p>
      <p>16.2 Electronic records maintained by the Company shall be admissible to the extent permitted by law for enforcing these Terms.</p>
    </Section>

    <Section title="17. Governing Law and Jurisdiction">
      <p>17.1 These Terms shall be governed by and construed in accordance with the laws of India.</p>
      <p>17.2 Subject to applicable law, courts having competent jurisdiction in <strong>Gautam Buddh Nagar, Uttar Pradesh</strong> shall have exclusive jurisdiction over disputes arising out of or relating to these Terms or the use of the Platform.</p>
    </Section>

    <Section title="18. Changes to Terms">
      <p>18.1 The Company may revise these Terms from time to time by updating the revised version on the Platform. Continued use of the Platform after such update shall constitute acceptance of the revised Terms, to the extent permitted by law.</p>
    </Section>

    <Section title="19. Service Fee & Pricing">
      <p>Where applicable, the Seller Fee shall be as per the fee schedule displayed on the Platform or as separately communicated to and accepted by the Seller through any recorded electronic or written mode prior to the relevant transaction trigger.</p>
    </Section>

    <Section title="20. Contact">
      <p><strong>Grenoverse Multi Ventures LLP</strong></p>
      <p>Head Office: 01, Mannat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
      <p>Branch Office: 01, Kirat Tower, Bindal Enclave, Kasna near Sector Phi-4, Greater Noida, Uttar Pradesh – 201310</p>
      <p>Email: <a href="mailto:support@growperty.com" className="text-primary underline">support@growperty.com</a></p>
      <p>Phone: <a href="tel:+919891117876" className="text-primary underline">+91 9891117876</a>, <a href="tel:+919891487876" className="text-primary underline">+91 9891487876</a></p>
    </Section>

    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm space-y-3">
      <div>
        <p className="font-bold text-foreground mb-1">Mandatory Checkbox Text</p>
        <p className="italic">"I confirm that I am the legal owner or duly authorized representative of this property, that the information submitted by me is true and complete, and that I agree to Growperty's Terms and Conditions, including the applicable Seller Fee and Anti-Circumvention provisions."</p>
      </div>
      <div>
        <p className="font-bold text-foreground mb-1">Seller Fee Popup Text</p>
        <p className="italic">"This property/listing is subject to Growperty's Seller Fee as communicated to you. I acknowledge the applicable fee structure and agree that the fee becomes payable upon the specified transaction trigger involving any buyer introduced or materially facilitated through Growperty."</p>
      </div>
    </div>
  </div>
);

const ChannelPartnerTerms = () => (
  <div className="space-y-8 text-slate-700 dark:text-slate-300">
    <p className="text-sm leading-relaxed">
      These Terms & Conditions ("Terms") govern the onboarding and participation of any Channel Partner ("CP", "you", "your") on <strong>Growperty.com</strong>, operated by <strong>Grenoverse Multi Ventures LLP</strong> ("Growperty", "Company", "we", "us", "our"). By applying, registering, logging in, listing inventory, sharing links, or using the CP dashboard, you agree to be bound by these Terms. Electronic acceptance may be relied upon as valid acceptance, provided the terms are clearly presented and affirmatively accepted.
    </p>

    <Section title="1. Independent Status">
      <p>The CP acts as an independent channel partner / independent contractor and not as an employee, agent of record, partner, franchisee, or legal representative of Growperty unless expressly agreed in writing. Nothing in these Terms creates employment benefits, salary rights, exclusivity, or authority to bind Growperty in any manner.</p>
    </Section>

    <Section title="2. Platform-Only Model">
      <p>The CP may market, upload, manage, and share eligible property inventory only through Growperty's approved systems, dashboard, tools, and link-sharing mechanisms. The CP shall not use Growperty data, leads, or inventory for off-platform dealing, parallel brokering, or independent closure outside the Growperty-managed flow.</p>
    </Section>

    <Section title="3. Approval and Access">
      <p>CP registration is subject to Growperty's sole review and approval. Growperty may approve, reject, suspend, limit, or terminate any CP account, listing, access request, or feature at its discretion for quality, compliance, fraud-risk, business, safety, or operational reasons.</p>
    </Section>

    <Section title="4. Login and Account Security">
      <p>CP login credentials, OTPs, and dashboard access are personal and non-transferable. The CP shall not share, sell, lend, or allow any other person to use the account, and shall remain responsible for all activity conducted through the account unless promptly reported as unauthorized use.</p>
    </Section>

    <Section title="5. Listing Rules">
      <p>The CP may add and manage listings permitted by Growperty, including updates to price, images, and property details. The CP is solely responsible for ensuring that all uploaded information, media, and claims are lawful, accurate, current, and properly authorized, and shall immediately correct any inaccurate or outdated listing content.</p>
    </Section>

    <Section title="6. Contact and Data Restrictions">
      <p>The CP shall not access, extract, disclose, share, sell, misuse, or attempt to discover buyer or seller personal contact information except as expressly permitted by Growperty for a specific managed interaction. The CP shall not contact users outside approved Growperty processes using hidden, inferred, scraped, or externally sourced contact details.</p>
      <p>CPs must not upload another broker's or owner's data without lawful authority.</p>
    </Section>

    <Section title="7. Shared Link Rules">
      <p>Growperty may permit CP-specific shareable links for the CP's own client outreach. Such links are limited, revocable tools for legitimate client servicing only, and any misuse, mass circulation, scraping, impersonation, misleading forwarding, or use for bypassing Growperty may result in immediate suspension or termination.</p>
    </Section>

    <Section title="8. Display and Branding">
      <p>Listings on the Platform may display as "Listed by Growperty" or in any other presentation format determined by Growperty. The CP shall have no right to demand platform-facing branding, public attribution, white-labelling, or independent branding placement on Growperty listing pages unless separately approved in writing.</p>
      <p>Fast Track or promotional benefits, where applicable, do not create ownership over Growperty leads or platform branding.</p>
    </Section>

    <Section title="9. Managed Contact Logic">
      <p>Where Growperty enables CP-shared links, Growperty may determine which contact information is shown to end users based on visitor source, routing logic, business rules, or platform design. The CP shall not alter, manipulate, or reverse engineer this logic.</p>
    </Section>

    <Section title="10. No Bypass / No Off-Platform Deal">
      <p>The CP shall not bypass Growperty by directly closing, diverting, routing, or facilitating any deal outside Growperty where the property, lead, client, visit, enquiry, or transaction opportunity originated from or was materially facilitated by Growperty. Any side deal, shadow negotiation, or indirect closure through nominees, affiliates, staff, or third parties shall be treated as a breach of these Terms.</p>
    </Section>

    <Section title="11. Commission and Commercial Terms">
      <p>All commissions, fees, incentives, or CP payouts shall be determined, controlled, processed, and settled only by Growperty in accordance with separately communicated commercial terms, if any. The CP shall have no right to independently set, alter, collect, promise, or represent Growperty commission terms unless expressly authorized in writing.</p>
      <p>CP payout/commission structure will be separately communicated by Growperty and may be revised from time to time.</p>
    </Section>

    <Section title="12. No Access to Other CP Data">
      <p>The CP shall not access, copy, monitor, or interfere with the listings, leads, dashboards, routing logic, contacts, analytics, or data of any other CP, seller, buyer, or user except as expressly allowed through the Platform.</p>
    </Section>

    <Section title="13. Compliance and Legal Responsibility">
      <p>The CP shall comply with applicable law, platform policies, privacy obligations, anti-spam requirements, and any real estate regulatory requirements that may apply to the CP's own activities. Under the RERA framework, facilitation of sale or purchase of covered real estate projects may trigger registration obligations for real estate agents, and Growperty does not waive or assume the CP's independent legal obligations in this regard.</p>
    </Section>

    <Section title="14. No Authority to Bind Growperty">
      <p>The CP shall not make guarantees, legal assurances, title assurances, approval claims, price promises, investment promises, or other commitments on behalf of Growperty. Any unauthorized representation made by the CP shall be solely at the CP's risk and responsibility.</p>
    </Section>

    <Section title="15. Limitation of Liability">
      <p>Growperty shall not be liable for losses arising from inaccurate CP listings, unauthorized promises made by a CP, direct or side deals done outside the Platform, client misconduct, regulatory non-compliance by the CP, or misuse of dashboard tools by the CP. Nothing in these Terms excludes liability that cannot be excluded under applicable law.</p>
    </Section>

    <Section title="16. Suspension and Termination">
      <p>Growperty may suspend or terminate the CP account, remove listings, block links, withhold access, or stop payouts where it suspects breach, misuse, circumvention, fraud, legal risk, spam, misrepresentation, or any conduct harmful to the Platform or its users. Accrued rights, audit rights, evidence rights, payment set-offs, indemnities, and remedies shall survive termination.</p>
    </Section>

    <Section title="17. Indemnity">
      <p>The CP agrees to indemnify and hold harmless Growperty, Grenoverse Multi Ventures LLP, and their partners, employees, and affiliates against claims, losses, liabilities, penalties, damages, and reasonable legal costs arising from the CP's breach of these Terms, false listings, unauthorized data use, regulatory violations, side deals, or misrepresentations.</p>
    </Section>

    <Section title="18. Governing Law and Jurisdiction">
      <p>These Terms shall be governed by the laws of India. Courts having competent jurisdiction in Gautam Buddh Nagar, Uttar Pradesh shall have exclusive jurisdiction over disputes arising from or relating to these Terms, subject to applicable law.</p>
    </Section>

    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm space-y-3">
      <div>
        <p className="font-bold text-foreground mb-1">Mandatory Checkbox Text (CP Registration)</p>
        <p className="italic">"I confirm that I am applying as an independent Channel Partner, I agree to Growperty's Channel Partner Terms & Conditions, and I will not bypass the Platform, misuse shared links, or engage in off-platform deals for Growperty-generated opportunities."</p>
      </div>
    </div>
  </div>
);

const TAB_FROM_TYPE = { buyer: 'buyer', seller: 'seller', cp: 'cp' };

const TermsAndConditionsPage = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(TAB_FROM_TYPE[searchParams.get('type')] || 'buyer');
  const [agreed, setAgreed] = useState(false);

  const isCpFlow = searchParams.get('type') === 'cp';

  // Any form (CP registration, property listing, project listing) opens these
  // Terms in a new tab — if that's how we got here, offer to go back to it
  // instead of sending the user to the homepage.
  const [hasOpener, setHasOpener] = useState(false);
  useEffect(() => {
    setHasOpener(!!(window.opener && !window.opener.closed));
  }, []);

  // Opened from a form in a new tab — let that tab know the user agreed (CP
  // registration listens for this), then return them to it.
  const handleBackToForm = () => {
    if (agreed && window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'cp-terms-agreed' }, window.location.origin);
    }
    if (window.opener && !window.opener.closed) {
      window.close();
    } else {
      window.location.href = isCpFlow ? '/become-channel-partner' : '/';
    }
  };

  return (
    <>
      <Helmet>
        <title>Terms and Conditions | Growperty.com</title>
        <meta name="description" content="Read the Terms and Conditions for buyers and sellers on Growperty.com — Greater Noida's property platform." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1 py-12 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {hasOpener ? (
              <Button variant="ghost" onClick={handleBackToForm} className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Form
              </Button>
            ) : (
              <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
                <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
              </Button>
            )}

            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-border">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Terms and Conditions</h1>
                  <p className="text-muted-foreground mt-1 font-medium text-sm">Last Updated: June 2026 · Grenoverse Multi Ventures LLP</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-8 border-b border-border">
                <button
                  onClick={() => setTab('buyer')}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${tab === 'buyer' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  <User className="h-4 w-4" /> Buyer / User
                </button>
                <button
                  onClick={() => setTab('seller')}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${tab === 'seller' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  <Home className="h-4 w-4" /> Property Owner / Seller
                </button>
                <button
                  onClick={() => setTab('cp')}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${tab === 'cp' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  <Handshake className="h-4 w-4" /> Channel Partner
                </button>
              </div>

              {tab === 'buyer' ? <BuyerTerms /> : tab === 'seller' ? <SellerTerms /> : <ChannelPartnerTerms />}

              {isCpFlow && (
                <div className="mt-10 pt-6 border-t border-border space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 h-[17px] w-[17px] shrink-0 accent-primary"
                    />
                    <span className="text-sm text-foreground leading-relaxed">
                      I have read and agree to Growperty's Channel Partner Terms &amp; Conditions.
                    </span>
                  </label>
                  <Button onClick={handleBackToForm} disabled={!agreed} className="rounded-xl font-bold">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Accept &amp; Back to Form
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsAndConditionsPage;
