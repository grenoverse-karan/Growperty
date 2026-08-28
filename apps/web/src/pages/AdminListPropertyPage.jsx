import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import SelectionScreen from '@/components/SelectionScreen.jsx';

const AdminListPropertyPage = () => {
  const navigate = useNavigate();

  const handleSelect = (option) => {
    navigate(option === 'project' ? '/admin/list-property/project' : '/admin/list-property/property');
  };

  return (
    <>
      <Helmet>
        <title>List Property — Admin — Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <main className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SelectionScreen onSelect={handleSelect} />
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminListPropertyPage;
