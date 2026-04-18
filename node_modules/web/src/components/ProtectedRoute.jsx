import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  console.log(`[ProtectedRoute] Accessing: ${location.pathname} | Authenticated: ${isAuthenticated} | User Role: ${currentUser?.role || 'none'} | Allowed Roles: ${allowedRoles || 'any'}`);

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] User not authenticated. Redirecting to /login');
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    console.log(`[ProtectedRoute] Unauthorized role (${currentUser?.role}). Redirecting to /`);
    // Role not authorized, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;