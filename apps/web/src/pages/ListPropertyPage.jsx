
import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SelectionScreen from '@/components/SelectionScreen.jsx';

const ListPropertyPage = () => {
  const navigate = useNavigate();

  const handleSelect = (option) => {
    navigate(option === 'project' ? '/list-property/project' : '/list-property/property');
  };

  return (
    <>
      <Helmet>
        <title>List Your Property or Project in Greater Noida & YEIDA - Growperty.com</title>
        <meta name="description" content="List your property or new project on Growperty.com and reach thousands of potential buyers in Greater Noida and YEIDA. Simple, fast, and effective." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />

        <main className="flex-1 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SelectionScreen onSelect={handleSelect} />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ListPropertyPage;
