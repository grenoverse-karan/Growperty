import React from 'react';
import { Helmet } from 'react-helmet';
import PropertyListingForm from '@/components/PropertyListingForm.jsx';

const AdminListPropertyPage = () => (
  <>
    <Helmet>
      <title>List Property — Admin — Growperty</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: '32px' }}>
      <div style={{ color: '#0d1117' }}>
        <PropertyListingForm isAdmin={true} />
      </div>
    </div>
  </>
);

export default AdminListPropertyPage;
