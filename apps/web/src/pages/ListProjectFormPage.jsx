import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProjectListingForm from '@/components/ProjectListingForm.jsx';

const ListProjectFormPage = () => {
  return (
    <>
      <Helmet>
        <title>List Your Project - Growperty.com</title>
        <meta name="description" content="List your residential or commercial project on Growperty.com and reach thousands of potential buyers in Greater Noida and YEIDA." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProjectListingForm />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ListProjectFormPage;
