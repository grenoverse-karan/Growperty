
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, MessageSquare, Calendar, CheckCircle, Upload, CheckSquare, Users, HeartHandshake as Handshake, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';

const buyerSteps = [
  {
    icon: Search,
    title: 'Browse Properties',
    description: 'Search verified listings by city, type, budget, and specific requirements.',
  },
  {
    icon: Eye,
    title: 'View Details',
    description: 'See full property info, high-quality photos, location details, and amenities.',
  },
  {
    icon: MessageSquare,
    title: 'Send Enquiry',
    description: 'Click Call or WhatsApp — connects directly to the Growperty expert team.',
  },
  {
    icon: Calendar,
    title: 'Schedule Visit',
    description: 'Growperty coordinates a convenient property visit with the owner.',
  },
  {
    icon: CheckCircle,
    title: 'Close the Deal',
    description: 'Growperty handles the negotiation and ensures a smooth deal closure.',
  },
];

const sellerSteps = [
  {
    icon: Upload,
    title: 'List for Free',
    description: 'Submit your property details and photos — listing is 100% free.',
  },
  {
    icon: CheckSquare,
    title: 'Listing Reviewed',
    description: 'The Growperty team verifies your details and publishes your listing.',
  },
  {
    icon: Users,
    title: 'Receive Leads',
    description: 'Only serious, verified buyers are matched to your property.',
  },
  {
    icon: Calendar,
    title: 'Visit Scheduled',
    description: 'Growperty coordinates buyer visits strictly with your prior consent.',
  },
  {
    icon: Handshake,
    title: 'Deal Closed',
    description: 'Commission is charged only after a successful and verified deal closure.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const HowItWorksPage = () => {
  return (
    <>
      <Helmet>
        <title>How It Works | Growperty.com</title>
        <meta name="description" content="Learn how Growperty makes buying and selling properties simple, safe, and structured." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative pt-24 pb-32 overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 z-0" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay z-0" />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight text-balance">
                  How Growperty Works
                </h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed text-balance">
                  Simple, safe, and structured — from listing to deal closure.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Buyer Journey Section */}
          <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  For Buyers
                </h2>
                <div className="w-24 h-1.5 bg-emerald-500 mx-auto mt-6 rounded-full" />
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {buyerSteps.map((step, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div className="absolute -right-6 -top-6 text-9xl font-black text-slate-50 dark:text-slate-900/50 z-0 transition-transform duration-500 group-hover:scale-110">
                      {index + 1}
                    </div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                        <step.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Seller Journey Section */}
          <section className="py-20 md:py-28 bg-white dark:bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  For Sellers
                </h2>
                <div className="w-24 h-1.5 bg-slate-900 dark:bg-slate-100 mx-auto mt-6 rounded-full" />
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {sellerSteps.map((step, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div className="absolute -right-6 -top-6 text-9xl font-black text-white dark:text-slate-950 z-0 transition-transform duration-500 group-hover:scale-110">
                      {index + 1}
                    </div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-6 text-slate-700 dark:text-slate-300">
                        <step.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Trust Note Section */}
          <section className="py-20 bg-emerald-50 dark:bg-emerald-950/20 border-y border-emerald-100 dark:border-emerald-900/30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-8">
                  <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 mb-6 tracking-tight">
                  Your Privacy & Safety
                </h2>
                <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-2xl text-balance">
                  All communication is routed through Growperty. Owner and buyer contact details are never shared publicly.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Bottom CTA Section */}
          <section className="py-24 bg-white dark:bg-background">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-10 tracking-tight">
                Ready to get started?
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  <Link to="/properties">
                    Browse Properties
                  </Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-2 border-slate-900 text-slate-900 hover:bg-slate-50 dark:border-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-[0.98]"
                >
                  <Link to="/list-property">
                    List Your Property
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HowItWorksPage;
