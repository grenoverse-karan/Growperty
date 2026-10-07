
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Tag, Users, Phone, Calendar, HeartHandshake as Handshake } from 'lucide-react';

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

    </div>
  );
};

export default WhyChooseGrowperty;
