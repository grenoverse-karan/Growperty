import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import PropertyListingForm from '@/components/PropertyListingForm.jsx';

const PropertyListingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>List Your Property for Free | Growperty.com</title>
        <meta name="description" content="List your property for free on Growperty.com. Reach thousands of potential buyers and tenants in Noida and Greater Noida." />
      </Helmet>
      
      <Header />
      
      <main className="flex-grow py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <PropertyListingForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PropertyListingPage;