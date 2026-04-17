
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Zap, CheckCircle, Unlock, Clock, Headphones, CreditCard, Rocket, HeartHandshake as Handshake, MessageCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button.jsx';

const FastTrackPage = () => {
  const sellerBenefits = [
    {
      icon: TrendingUp,
      title: 'Priority Listing',
      text: 'Your property appears at the top of search results, ensuring maximum visibility.'
    },
    {
      icon: Star,
      title: 'Better Exposure',
      text: 'Featured placement on the homepage and premium listings pages.'
    },
    {
      icon: Zap,
      title: 'Faster Response',
      text: 'Our dedicated relationship team handles and qualifies your leads first.'
    },
    {
      icon: CheckCircle,
      title: 'Serious Buyers',
      text: 'Only pre-screened, verified buyers are connected to save your valuable time.'
    }
  ];

  const buyerBenefits = [
    {
      icon: Unlock,
      title: 'Priority Access',
      text: 'Get early exclusive access to new and premium unlisted properties before others.'
    },
    {
      icon: Clock,
      title: 'Faster Visit Scheduling',
      text: 'Property site visits are arranged and coordinated on a strict priority basis.'
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      text: 'Personalized assistance throughout your entire property buying journey.'
    }
  ];

  const stepLogic = [
    {
      num: '1',
      icon: CreditCard,
      title: 'Pay Advance Fee',
      text: 'Pay the Fast Track premium fee to activate your priority plan and dedicated support.'
    },
    {
      num: '2',
      icon: Rocket,
      title: 'Get Priority Treatment',
      text: 'Enjoy priority listing placement, enhanced visibility, and rapid team support.'
    },
    {
      num: '3',
      icon: Handshake,
      title: 'Fee Adjusted on Success',
      text: 'If the deal closes, the Fast Track fee is adjusted in the final commission. If it does not close, the fee is non-refundable.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Fast Track Premium Plan | Growperty.com</title>
        <meta name="description" content="Get priority listing, faster responses, and dedicated handling with the Growperty Fast Track plan." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow">
          {/* HERO SECTION */}
          <section className="relative pt-24 pb-32 overflow-hidden bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-brand-blue to-slate-950 z-0 opacity-90" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay z-0" />
            
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Star className="w-4 h-4 mr-2 fill-amber-400" />
                  Premium Plan
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight text-balance">
                  Fast Track Your Property Deal
                </h1>
                <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed text-balance max-w-2xl mx-auto">
                  Get priority listing, faster responses, and dedicated handling — exclusively designed for serious buyers and sellers.
                </p>
              </motion.div>
            </div>
          </section>

          {/* WHAT IS FAST TRACK SECTION */}
          <section className="py-20 bg-white dark:bg-slate-950 border-b border-border/50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 tracking-tight">
                  What is Fast Track?
                </h2>
                <div className="w-16 h-1.5 bg-emerald-500 mx-auto mt-4 mb-8 rounded-full" />
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  Fast Track is Growperty's premium managed service tier. It separates casual browsers from serious transactors by attaching a small upfront commitment. In return, you skip the queue and receive VIP treatment from our expert team, ensuring your property journey is swift, secure, and successful.
                </p>
              </motion.div>
            </div>
          </section>

          {/* FOR SELLERS SECTION */}
          <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  Fast Track for Sellers
                </h2>
                <p className="text-lg text-muted-foreground mt-4 font-medium">Maximize your property's visibility and close deals faster.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {sellerBenefits.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row gap-6 items-start"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <item.icon className="w-7 h-7 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed font-medium">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* FOR BUYERS SECTION */}
          <section className="py-20 md:py-28 bg-white dark:bg-slate-950 border-y border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  Fast Track for Buyers
                </h2>
                <p className="text-lg text-muted-foreground mt-4 font-medium">Skip the waitlist and secure the best properties.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {buyerBenefits.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-50 dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/60 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6">
                      <item.icon className="w-7 h-7 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium mt-auto">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS SECTION */}
          <section className="py-20 md:py-28 bg-slate-950 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-950 to-slate-950" />
            
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Fast Track Payment Logic
                </h2>
                <div className="w-16 h-1.5 bg-amber-500 mx-auto mt-4 rounded-full" />
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
                {/* Connecting Line for desktop */}
                <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-800 z-0" />
                
                {stepLogic.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="relative z-10 flex flex-col items-center text-center group"
                  >
                    <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center mb-8 relative group-hover:border-amber-500/50 transition-colors duration-300 shadow-xl">
                      <span className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-lg">
                        {step.num}
                      </span>
                      <step.icon className="w-10 h-10 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-slate-100">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-medium">{step.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* PRICING SECTION */}
          <section className="py-20 bg-emerald-50 dark:bg-emerald-950/20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl border border-emerald-100 dark:border-emerald-900/30"
              >
                <h2 className="text-3xl font-extrabold text-foreground mb-4">Pricing</h2>
                <p className="text-lg text-muted-foreground mb-8 font-medium">
                  Fast Track pricing is currently being finalized to offer you the best value. Contact our team to know the current introductory rates and availability.
                </p>
                <Button 
                  asChild 
                  size="lg" 
                  className="h-14 px-8 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
                >
                  <a 
                    href="https://wa.me/919953537876?text=Hi,%20I%20want%20to%20know%20about%20Fast%20Track%20plan%20on%20Growperty.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Ask About Fast Track
                  </a>
                </Button>
              </motion.div>
            </div>
          </section>

          {/* BOTTOM CTA SECTION */}
          <section className="py-24 bg-white dark:bg-background border-t border-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-10 tracking-tight">
                  Ready to go Fast Track?
                </h2>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Button 
                    asChild 
                    size="lg" 
                    className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                  >
                    <Link to="/list-property">
                      Fast Track My Listing
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline"
                    size="lg" 
                    className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5 dark:border-brand-blue-foreground dark:text-brand-blue-foreground dark:hover:bg-brand-blue-foreground/10 rounded-xl transition-all active:scale-[0.98]"
                  >
                    <a 
                      href="https://wa.me/919891117876" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Headphones className="mr-2 h-5 w-5" />
                      Talk to Team
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default FastTrackPage;
