import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyListingForm from '@/components/PropertyListingForm.jsx';

const ListPropertyFormPage = () => {
  return (
    <>
      <Helmet>
        <title>List Your Property - Growperty.com</title>
        <meta name="description" content="List your property for free on Growperty.com and reach thousands of potential buyers in Greater Noida and YEIDA." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PropertyListingForm />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ListPropertyFormPage;
