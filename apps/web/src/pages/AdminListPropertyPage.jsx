import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyListingForm from '@/components/PropertyListingForm.jsx';
import ProjectListingForm from '@/components/ProjectListingForm.jsx';
import SelectionScreen from '@/components/SelectionScreen.jsx';

const AdminListPropertyPage = () => {
  const [selectedOption, setSelectedOption] = useState('property');

  return (
    <>
      <Helmet>
        <title>List Property — Admin — Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <main className="py-12 md:py-16">
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
                    <PropertyListingForm isAdmin={true} />
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
                    <ProjectListingForm isAdmin={true} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminListPropertyPage;
