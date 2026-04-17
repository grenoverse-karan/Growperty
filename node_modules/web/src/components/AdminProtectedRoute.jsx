import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Loader2 } from 'lucide-react';

const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse">Verifying admin session...</p>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    console.log('[AdminProtectedRoute] Access denied. Redirecting to login.');
    return <Navigate to="/admin-login" state={{ from: location, message: 'Please log in to access the admin panel.' }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;