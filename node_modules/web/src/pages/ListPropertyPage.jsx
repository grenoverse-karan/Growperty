
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyListingForm from '@/components/PropertyListingForm.jsx';
import ProjectListingForm from '@/components/ProjectListingForm.jsx';
import SelectionScreen from '@/components/SelectionScreen.jsx';

const ListPropertyPage = () => {
  const [selectedOption, setSelectedOption] = useState('property');

  return (
    <>
      <Helmet>
        <title>List Your Property or Project in Delhi NCR - Growperty.com</title>
        <meta name="description" content="List your property or new project on Growperty.com and reach thousands of potential buyers in Noida, Greater Noida, and YEIDA. Simple, fast, and effective." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SelectionScreen 
              selectedOption={selectedOption} 
              onSelect={setSelectedOption} 
            />

            <div className="mt-8">
              <AnimatePresence mode="wait">
                {selectedOption === 'property' && (
                  <motion.div
                    key="property-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PropertyListingForm />
                  </motion.div>
                )}

                {selectedOption === 'project' && (
                  <motion.div
                    key="project-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProjectListingForm />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ListPropertyPage;
