import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import PropertyListingForm from '@/components/PropertyListingForm.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';

const AdminEditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAdminAuth();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiServerClient.fetch(`/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to load property (${res.status})`);
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (id && token) fetch();
  }, [id, token]);

  return (
    <>
      <Helmet>
        <title>Edit Property — Admin — Growperty</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate('/admin/properties')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Listings
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-semibold">Edit Property</span>
            {id && <span className="text-xs font-mono text-muted-foreground">{id}</span>}
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <p className="text-destructive font-medium">{error}</p>
            </div>
          ) : !property ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PropertyListingForm isAdmin={true} initialData={property} />
          )}
        </div>
      </div>
    </>
  );
};

export default AdminEditPropertyPage;
