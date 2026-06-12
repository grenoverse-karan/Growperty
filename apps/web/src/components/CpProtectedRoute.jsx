import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCpAuth } from '@/contexts/CpAuthContext.jsx';
import { Loader2 } from 'lucide-react';

const CpProtectedRoute = ({ children }) => {
  const { isCpAuthenticated, isLoading } = useCpAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Verifying session...</p>
      </div>
    );
  }

  if (!isCpAuthenticated) {
    return <Navigate to="/cp/login" state={{ from: location }} replace />;
  }

  return children;
};

export default CpProtectedRoute;
