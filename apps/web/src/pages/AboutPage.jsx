import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin, Phone, Mail, Building2, Quote,
  Home, TrendingUp, Handshake, Building, Network, Cpu, Rocket, CheckCircle2,
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const SectionHeading = ({ eyebrow, title, subtitle }) => (
  <div className="text-center max-w-3xl mx-auto mb-14">
    {eyebrow && <p className="text-sm font-extrabold uppercase tracking-widest text-secondary mb-3">{eyebrow}</p>}
    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight" style={{ textWrap: 'balance' }}>{title}</h2>
    {subtitle && <p className="text-lg text-muted-foreground font-medium leading-relaxed">{subtitle}</p>}
  </div>
);

const OWNER_NEEDS = [
  'Better property visibility',
  'Genuine buyer enquiries',
  'Proper follow-up',
  'Site visit coordination',
  'Buyer requirement matching',
  'Local market support',
  'Help in moving a deal forward',
];

const CP_ROLE = [
  'Understanding buyer requirements',
  'Shortlisting suitable properties',
  'Arranging site visits',
  'Local market information',
  'Negotiation and coordination',
  'Connecting buyers and sellers',
  'Taking a transaction from enquiry towards closure',
];

const OFFERINGS = [
  { icon: Home, title: 'Buy', description: 'Search and discover properties based on location, budget and requirements.' },
  { icon: Building2, title: 'Sell', description: 'Property owners and developers can showcase their properties to potential buyers.' },
  { icon: TrendingUp, title: 'Invest', description: 'Explore residential, commercial and land opportunities based on investment objectives.' },
  { icon: Handshake, title: 'Channel Partners', description: 'Property dealers, consultants and agencies can manage their inventory, buyer requirements and digital property sharing from one platform.' },
  { icon: Building, title: 'Projects', description: 'Builders and developers can showcase projects with structured information, amenities, pricing, floor plans, media and more.' },
];

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Growperty.com</title>
        <meta name="description" content="Growperty.com connects buyers, sellers, developers and Channel Partners in Greater Noida and YEIDA — technology for discovery, people for the deal." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1">
          {/* ── HERO ─────────────────────────────── */}
          <section className="bg-primary text-primary-foreground py-20 md:py-28 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
                <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight" style={{ textWrap: 'balance' }}>
                  Real Estate Is More Than a Listing. It&apos;s a Deal That Needs People.
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed font-medium max-w-[65ch]">
                  Growperty.com is a venture of Grenoverse Multi Ventures LLP, built to make property buying, selling and investment more organised, transparent and locally connected.
                </p>
                <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed font-medium max-w-[65ch] mt-4">
                  We believe that putting a property online is only the first step. A real estate transaction involves much more — understanding the requirement, finding the right property, connecting the right people, arranging site visits, discussing the deal, negotiating, coordinating between parties and helping move the transaction forward. That&apos;s where Growperty comes in.
                </p>
              </motion.div>
            </div>
          </section>

          {/* ── THE PROBLEM WE SAW ──────────────────── */}
          <section className="py-20 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...fadeUp}>
                <SectionHeading
                  eyebrow="The Problem We Saw"
                  title="Plenty of listings. Still hard to find the right match."
                  subtitle="The Indian real estate market has plenty of property listings, but finding the right property and the right buyer is still difficult."
                />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <motion.div {...fadeUp}>
                  <Card className="h-full border-none shadow-md bg-white dark:bg-slate-900/50 rounded-2xl">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-extrabold text-foreground mb-2">For Property Owners &amp; Developers</h3>
                      <p className="text-muted-foreground font-medium leading-relaxed mb-5">
                        A listing alone doesn&apos;t guarantee a genuine buyer. Owners and developers often need:
                      </p>
                      <ul className="space-y-2.5 mb-5">
                        {OWNER_NEEDS.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-foreground font-medium">
                            <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-muted-foreground font-medium leading-relaxed">
                        Many property marketing models focus heavily on packages, listings and online visibility. At Growperty, we believe real estate should not stop at uploading a property.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div {...fadeUp}>
                  <Card className="h-full border-none shadow-md bg-white dark:bg-slate-900/50 rounded-2xl">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-extrabold text-foreground mb-2">For Buyers</h3>
                      <p className="text-muted-foreground font-medium leading-relaxed mb-5">
                        Buying a property is a major financial decision. A buyer doesn&apos;t simply need thousands of listings. They need:
                      </p>
                      <ul className="space-y-2.5">
                        {['The right property.', 'The right information.', 'The right people.', 'And the right guidance.'].map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-foreground font-medium">
                            <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-muted-foreground font-medium leading-relaxed mt-5">
                        Growperty brings properties, buyer requirements and local market professionals together so that the process can become more structured and easier to navigate.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
                <Quote className="h-8 w-8 text-secondary/40 mx-auto mb-4" />
                <p className="text-xl md:text-2xl font-extrabold text-foreground leading-snug" style={{ textWrap: 'balance' }}>
                  A property listing can generate a lead.<br className="hidden sm:block" /> A well-managed transaction creates a deal.
                </p>
              </motion.div>
            </div>
          </section>

          {/* ── TECHNOLOGY + LOCAL PROFESSIONALS ────── */}
          <section className="py-20 md:py-24 bg-white dark:bg-slate-900/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                  <p className="text-sm font-extrabold uppercase tracking-widest text-secondary mb-3">Technology + Local Real Estate Professionals</p>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 tracking-tight" style={{ textWrap: 'balance' }}>
                    We don&apos;t believe technology should replace the people who understand the local property market.
                  </h2>
                  <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-6">
                    Technology can find and organise opportunities. People understand the deal. That&apos;s why Channel Partners are an important part of the Growperty ecosystem — Growperty gives them the technology, inventory and digital tools to work more professionally.
                  </p>
                  <p className="text-base font-bold text-foreground mb-3">A good Channel Partner / property consultant can help with:</p>
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {CP_ROLE.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-foreground font-medium">
                        <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-6">
                  <Card className="border-none shadow-md bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                    <CardContent className="p-8 flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Cpu className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1.5">Technology</h3>
                        <p className="text-muted-foreground font-medium leading-relaxed text-sm">Discovers and organises opportunities — listings, buyer requirements and local market data in one place.</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-md bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                    <CardContent className="p-8 flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Handshake className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-1.5">People</h3>
                        <p className="text-muted-foreground font-medium leading-relaxed text-sm">Understand the deal — site visits, negotiation, coordination and everything that moves a transaction forward.</p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="pt-2">
                    <p className="text-sm font-extrabold uppercase tracking-widest text-primary mb-3">Your Property Network, Online</p>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                      With Growperty, Channel Partners can build their own digital presence, manage their properties and buyer requirements, discover properties from the wider Growperty inventory, and share property links with their clients — instead of managing everything through scattered WhatsApp messages, phone calls and notebooks.
                    </p>
                    <p className="text-foreground font-bold leading-relaxed mt-4">
                      Growperty is not here to remove the Channel Partner from real estate. We are here to empower them with technology.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── WHAT GROWPERTY BRINGS TOGETHER ──────── */}
          <section className="py-20 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...fadeUp}>
                <SectionHeading eyebrow="What Growperty Brings Together" title="One platform, every part of the transaction" />
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {OFFERINGS.map(({ icon: Icon, title, description }) => (
                  <motion.div key={title} {...fadeUp}>
                    <Card className="h-full border-none shadow-md bg-white dark:bg-slate-900/50 rounded-2xl group hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors mb-4">
                          <Icon className="h-6 w-6 text-secondary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                        <p className="text-muted-foreground font-medium leading-relaxed text-sm flex-grow">{description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ── BUILT LOCALLY ────────────────────────── */}
          <section className="py-20 md:py-24 bg-primary text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <motion.div {...fadeUp}>
                <Network className="h-10 w-10 mx-auto mb-6 text-white/80" />
                <p className="text-sm font-extrabold uppercase tracking-widest text-white/70 mb-3">Built Locally. Growing With the Market.</p>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight" style={{ textWrap: 'balance' }}>
                  Greater Noida • YEIDA
                </h2>
                <p className="text-lg text-primary-foreground/80 leading-relaxed font-medium max-w-2xl mx-auto">
                  We combine a digital platform with local market understanding and on-ground coordination. Because property is not just about a pin on a map. It&apos;s about the people, the location, the requirement and the deal.
                </p>
              </motion.div>
            </div>
          </section>

          {/* ── OUR APPROACH ─────────────────────────── */}
          <section className="py-20 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...fadeUp}>
                <SectionHeading
                  eyebrow="Our Approach"
                  title="Not just another website where a property gets uploaded and forgotten"
                />
              </motion.div>
              <motion.div {...fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {[
                  { label: 'Technology', desc: 'for discovery' },
                  { label: 'Data', desc: 'for better decisions' },
                  { label: 'People', desc: 'for coordination' },
                  { label: 'Local presence', desc: 'for real transactions' },
                ].map(({ label, desc }) => (
                  <Card key={label} className="border-none shadow-md bg-white dark:bg-slate-900/50 rounded-2xl text-center">
                    <CardContent className="p-6">
                      <p className="text-lg font-extrabold text-foreground mb-1">{label}</p>
                      <p className="text-sm text-muted-foreground font-medium">{desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
                <Rocket className="h-8 w-8 text-secondary mx-auto mb-4" />
                <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-8">
                  As Growperty grows, our goal is to build a property ecosystem where buyers, sellers, developers and Channel Partners can work together more efficiently.
                </p>
                <div className="inline-block bg-white dark:bg-slate-900/50 rounded-3xl shadow-lg border border-border/50 px-8 py-8 md:px-12">
                  <p className="text-sm font-extrabold uppercase tracking-widest text-secondary mb-2">Growperty.com</p>
                  <p className="text-2xl md:text-3xl font-extrabold text-foreground mb-3" style={{ textWrap: 'balance' }}>
                    Buy Smart • Sell Smart • Grow Smart
                  </p>
                  <p className="text-muted-foreground font-medium">
                    A property platform built around people, technology and real-world transactions.
                  </p>
                  <p className="text-sm font-bold text-primary mt-3">Greater Noida • YEIDA</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── OFFICE LOCATION ──────────────────────── */}
          <section className="py-20 md:py-24 bg-white dark:bg-slate-900/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div {...fadeUp}>
                <SectionHeading
                  title="Visit Our Office"
                  subtitle="We'd love to meet you in person. Drop by our headquarters to discuss your real estate needs with our expert team."
                />

                <Card className="rounded-3xl shadow-xl border-border/50 overflow-hidden bg-white dark:bg-slate-900/80">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 md:p-12 flex flex-col justify-center space-y-8">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                          <MapPin className="h-7 w-7 text-secondary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-secondary uppercase tracking-wider mb-1">Headquarters</p>
                          <h3 className="text-xl font-bold text-foreground mb-2">Growperty Main Office</h3>
                          <p className="text-base text-muted-foreground leading-relaxed font-medium">
                            01, Kirat Tower, Bindal Enclave,<br />
                            Sec. Phi-4, near Honda Chowk,<br />
                            Greater Noida, G.B. Nagar, Uttar Pradesh - 201310.
                          </p>
                        </div>
                      </div>

                      <div className="w-full h-px bg-border/60" />

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Phone className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Call Us</p>
                          <div className="flex flex-col space-y-1">
                            <a href="tel:+919891487876" className="text-lg font-bold text-foreground hover:text-primary transition-colors">+91 9891487876</a>
                            <a href="tel:+919891117876" className="text-lg font-bold text-foreground hover:text-primary transition-colors">+91 9891117876</a>
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-px bg-border/60" />

                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Mail className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Email Us</p>
                          <div className="flex flex-col space-y-1">
                            <a href="mailto:info@growperty.com" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                              info@growperty.com
                            </a>
                            <a href="mailto:support@growperty.com" className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                              support@growperty.com
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-200 dark:bg-slate-800 min-h-[300px] md:min-h-full relative">
                      <iframe
                        src="https://www.google.com/maps?q=28.4412634,77.5307429&output=embed"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Growperty Office Location"
                        className="absolute inset-0"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
