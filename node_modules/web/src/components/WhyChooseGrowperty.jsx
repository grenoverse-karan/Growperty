
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Tag, Users, Phone, Calendar, HeartHandshake as Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Shield,
    title: 'Anti-Bypass Protection',
    description: 'Owner contact details are always hidden. All communication is routed through Growperty only.'
  },
  {
    icon: Tag,
    title: '100% Free Listing',
    description: 'List your property for free. Commission is only charged after successful deal closure.'
  },
  {
    icon: Users,
    title: 'Serious Buyers Only',
    description: 'We filter enquiries and connect sellers only with genuine, verified buyers.'
  },
  {
    icon: Phone,
    title: 'Managed Communication',
    description: 'All calls and WhatsApp go through Growperty. No direct bypass. No time waste.'
  },
  {
    icon: Calendar,
    title: 'Coordinated Visits',
    description: 'Property visits are scheduled and coordinated by Growperty with owner consent.'
  },
  {
    icon: Handshake,
    title: 'End-to-End Support',
    description: 'From listing to deal closure — Growperty handles enquiries, visits, and negotiation.'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const WhyChooseGrowperty = () => {
  return (
    <div className="w-full">
      {/* Section 1: Feature Cards Grid */}
      <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-6"
            >
              Why Choose Growperty?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed text-balance"
            >
              We are not just a listing platform. We are your managed real estate partner.
            </motion.p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-medium mt-auto">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 2: Trust Banner */}
      <section className="relative py-20 overflow-hidden bg-brand-blue dark:bg-slate-950 border-y border-brand-blue/20 dark:border-slate-800">
        {/* Abstract Background Element */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-400 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight text-balance">
              No Broker. No Bypass. Just Trust.
            </h2>
            <p className="text-lg md:text-xl text-blue-100 dark:text-slate-300 mb-10 font-medium max-w-2xl mx-auto leading-relaxed text-balance">
              Growperty ensures every deal is transparent, structured, and secure.
            </p>
            <Button 
              asChild 
              size="lg" 
              className="h-14 px-8 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98]"
            >
              <Link to="/list-property">
                List Your Property Free
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Stats Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center p-10 md:p-12 text-center group hover:bg-white dark:hover:bg-slate-900 transition-colors duration-300">
              <span className="text-5xl md:text-6xl font-black text-emerald-500 mb-4 tracking-tight group-hover:scale-105 transition-transform duration-300">
                100%
              </span>
              <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                Free Listings
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-10 md:p-12 text-center group hover:bg-white dark:hover:bg-slate-900 transition-colors duration-300">
              <span className="text-5xl md:text-6xl font-black text-emerald-500 mb-4 tracking-tight group-hover:scale-105 transition-transform duration-300">
                0
              </span>
              <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                Hidden Owner Contacts
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-10 md:p-12 text-center group hover:bg-white dark:hover:bg-slate-900 transition-colors duration-300">
              <span className="text-5xl md:text-6xl font-black text-emerald-500 mb-4 tracking-tight group-hover:scale-105 transition-transform duration-300">
                1 Number
              </span>
              <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                All enquiries through +91 9953537876
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WhyChooseGrowperty;
