import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiServerClient from '@/lib/apiServerClient.js';
import { setCpRef } from '@/lib/cpRef.js';

// Invisible redirect route: /ref/:cpPublicId/:refToken
// Validates the referral pair, sets the sitewide cpRef cookie if valid,
// then always lands on the homepage — silently, with no error shown either way.
export default function RefRedirectPage() {
  const { cpPublicId, refToken } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    apiServerClient.fetch(`/cp/validate-ref/${cpPublicId}/${refToken}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.valid) {
          setCpRef({ cpPublicId, refToken, cpName: data.cpName, cpPhone: data.cpPhone });
        }
      })
      .catch(() => {})
      .finally(() => navigate('/', { replace: true }));
  }, [cpPublicId, refToken, navigate]);

  return null;
}
