import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import PropertyListingForm from '@/components/PropertyListingForm.jsx';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient';

export default function CpEditPropertyPage() {
  const { id } = useParams();
  const { token, currentCp } = useCpAuth();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiServerClient.fetch(`/properties/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(res.status === 404 ? 'Listing not found.' : 'Failed to load the listing.');
        const data = await res.json();
        // Only the CP's own listings are editable (the server enforces this on save too).
        if (data.cpId !== currentCp?.id) throw new Error('You can only edit your own listings.');
        if (!cancelled) setProperty(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [id, token, currentCp?.id]);

  return (
    <>
      <Helmet><title>Edit Property — CP Dashboard</title></Helmet>
      <div style={{ marginBottom: 20 }}>
        <Link to="/cp/dashboard/listings" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Back to My Listings</Link>
        <h1 style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 700, color: '#111827' }}>Edit Property</h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
          Changes to a live listing apply immediately. A rejected listing returns to review once you save it.
        </p>
      </div>
      {error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: 10, padding: 16, fontSize: 14 }}>{error}</div>
      ) : !property ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, padding: 0, overflow: 'hidden' }}>
          <PropertyListingForm cpMode cpToken={token} initialData={property} />
        </div>
      )}
    </>
  );
}
