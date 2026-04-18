
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion.jsx';

const buyerFaqs = [
  {
    question: 'How do I search for properties?',
    answer: 'You can use the search bar on our homepage or navigate to the Properties page. Filter listings by city (Noida, Greater Noida, YEIDA), property type, budget, and BHK configuration to find your perfect match.',
  },
  {
    question: 'How do I contact the owner?',
    answer: 'Simply click the "Call" or "WhatsApp" button on any property details page. Our expert team will instantly receive your enquiry and connect you directly with the verified owner.',
  },
  {
    question: 'Is there any fee for buyers?',
    answer: 'Browsing properties and scheduling visits is completely free. A standard, transparent brokerage fee is applicable only upon the successful closure of a property deal.',
  },
  {
    question: 'How do I schedule a property visit?',
    answer: 'Once you express interest in a property by sending an enquiry, our dedicated relationship managers will coordinate with both you and the owner to schedule a convenient time for a site visit.',
  },
  {
    question: "Why is the owner's number not visible?",
    answer: 'To ensure the privacy and security of our sellers, and to prevent spam, all initial communications are securely routed through the Growperty platform. We connect you once genuine interest is established.',
  },
];

const sellerFaqs = [
  {
    question: 'Is listing my property free?',
    answer: 'Yes! Submitting and listing your property on Growperty is 100% free. There are no hidden upfront charges or listing fees.',
  },
  {
    question: 'When is commission charged?',
    answer: 'We believe in a success-based model. Commission is charged strictly after a successful deal closure and the finalization of the transaction.',
  },
  {
    question: 'What is Fast Track?',
    answer: 'Fast Track is our premium, priority service designed for sellers who want to expedite their sale. It includes a dedicated relationship manager, premium listing placement, and proactive buyer matching.',
  },
  {
    question: 'Will my phone number be shown publicly?',
    answer: 'Absolutely not. Your contact details are kept strictly confidential. We act as a secure bridge, ensuring you only interact with serious, verified buyers.',
  },
  {
    question: 'Can I list commercial property?',
    answer: 'Yes, Growperty supports a wide range of real estate categories including residential flats, independent villas, residential plots, and commercial spaces.',
  },
];

const generalFaqs = [
  {
    question: 'What areas does Growperty cover?',
    answer: 'We currently specialize in premium real estate across Greater Noida, Noida, and the rapidly developing YEIDA (Yamuna Expressway) regions.',
  },
  {
    question: 'Who is behind Growperty?',
    answer: 'Growperty is powered by a team of seasoned real estate experts and technologists committed to bringing transparency, trust, and structure to the Indian real estate market.',
  },
  {
    question: 'How do I contact Growperty?',
    answer: 'You can reach out to our support team via the Contact Us page, drop us an email, or connect instantly through our official WhatsApp support number listed on the website.',
  },
];

const FAQPage = () => {
  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | Growperty.com</title>
        <meta name="description" content="Find answers to common questions about buying, selling, and listing properties on Growperty.com." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative pt-24 pb-32 overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 z-0" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1973&auto=format&fit=crop')] opacity-5 bg-cover bg-center mix-blend-overlay z-0" />
            
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight text-balance">
                  Frequently Asked Questions
                </h1>
                <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed text-balance">
                  Everything you need to know about buying and selling with Growperty.
                </p>
              </motion.div>
            </div>
          </section>

          {/* FAQ Content Sections */}
          <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
              
              {/* Buyer FAQs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                    For Buyers
                  </h2>
                  <div className="w-16 h-1.5 bg-emerald-500 mt-4 rounded-full" />
                </div>
                <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                  <Accordion type="single" collapsible className="w-full">
                    {buyerFaqs.map((faq, index) => (
                      <AccordionItem key={`buyer-${index}`} value={`buyer-${index}`} className="border-b-slate-100 dark:border-b-slate-800 last:border-0">
                        <AccordionTrigger className="text-left text-lg font-bold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-5">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>

              {/* Seller FAQs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                    For Sellers
                  </h2>
                  <div className="w-16 h-1.5 bg-slate-900 dark:bg-slate-100 mt-4 rounded-full" />
                </div>
                <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                  <Accordion type="single" collapsible className="w-full">
                    {sellerFaqs.map((faq, index) => (
                      <AccordionItem key={`seller-${index}`} value={`seller-${index}`} className="border-b-slate-100 dark:border-b-slate-800 last:border-0">
                        <AccordionTrigger className="text-left text-lg font-bold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-5">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>

              {/* General FAQs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                    General Questions
                  </h2>
                  <div className="w-16 h-1.5 bg-emerald-500 mt-4 rounded-full" />
                </div>
                <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                  <Accordion type="single" collapsible className="w-full">
                    {generalFaqs.map((faq, index) => (
                      <AccordionItem key={`general-${index}`} value={`general-${index}`} className="border-b-slate-100 dark:border-b-slate-800 last:border-0">
                        <AccordionTrigger className="text-left text-lg font-bold hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-5">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </motion.div>

            </div>
          </section>

          {/* Bottom CTA Section */}
          <section className="py-24 bg-white dark:bg-background border-t border-border">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 tracking-tight">
                  Still have questions?
                </h2>
                <p className="text-lg text-muted-foreground mb-10 font-medium max-w-xl mx-auto">
                  Can't find the answer you're looking for? Our team is here to help you with any queries.
                </p>
                <Button 
                  asChild 
                  size="lg" 
                  className="h-14 px-10 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  <Link to="/contact">
                    Contact Us
                  </Link>
                </Button>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FAQPage;
