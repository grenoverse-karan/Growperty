import React from 'react';
import { Helmet } from 'react-helmet';
import PropertyListingForm from '@/components/PropertyListingForm.jsx';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';

export default function CpAddPropertyPage() {
  const { token } = useCpAuth();

  return (
    <>
      <Helmet><title>Add Property — CP Dashboard</title></Helmet>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#e6edf3' }}>Add Property</h1>
        <p style={{ margin: '4px 0 0', color: '#94aabf', fontSize: 13 }}>
          All listings are displayed as "Listed by Growperty".
        </p>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 0, overflow: 'hidden' }}>
        <PropertyListingForm cpMode cpToken={token} />
      </div>
    </>
  );
}
