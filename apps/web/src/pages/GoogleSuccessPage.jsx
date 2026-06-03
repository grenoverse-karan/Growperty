import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Loader2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';

const TOKEN_KEY = 'growperty_token';

const GoogleSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateCurrentUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const complete = params.get('complete') === 'true';

    if (!token) {
      navigate('/login?error=google_failed');
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);

    // Fetch full user object and set in context
    apiServerClient
      .fetch('/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(user => {
        if (user?._id) {
          updateCurrentUser(user);
          if (!complete || !user.name || !user.city || !user.phone) {
            navigate('/complete-profile/google', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else {
          navigate('/login?error=google_failed');
        }
      })
      .catch(() => navigate('/login?error=google_failed'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <p className="font-bold text-foreground">Setting up your account…</p>
      </div>
    </div>
  );
};

export default GoogleSuccessPage;
