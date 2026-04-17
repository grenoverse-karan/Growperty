import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BuyerRequirementForm from '@/components/BuyerRequirementForm.jsx';
import { Search } from 'lucide-react';

const PostRequirementPage = () => {
  return (
    <>
      <Helmet>
        <title>Post Your Property Requirement - Growperty.com</title>
        <meta name="description" content="Can't find what you're looking for? Post your property requirement and let sellers contact you directly." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }} 
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/10 mb-4 shadow-sm">
                <Search className="h-8 w-8 text-secondary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                Post Your Requirement
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
                Tell us exactly what you're looking for. We'll match your requirements with our verified listings and notify you instantly.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <BuyerRequirementForm />
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PostRequirementPage;