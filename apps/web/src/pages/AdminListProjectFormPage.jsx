import React from 'react';
import { Helmet } from 'react-helmet';
import ProjectListingForm from '@/components/ProjectListingForm.jsx';

const AdminListProjectFormPage = () => {
  return (
    <>
      <Helmet>
        <title>List Project — Admin — Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <main className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProjectListingForm isAdmin={true} />
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminListProjectFormPage;
