import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'staff';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  // Now we can use the loading property from AuthContext
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while still loading
    if (loading) return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      toast.error('Please log in to access this page');
      router.push(`/login?returnUrl=${encodeURIComponent(router.asPath)}`);
    } 
    // If authenticated but role check fails, redirect to home
    else if (requiredRole && user) {
      let hasRequiredRole = false;
      
      // Check if user has the required role
      if (requiredRole === 'admin' && user.role === 'admin') {
        hasRequiredRole = true;
      } else if (requiredRole === 'manager' && ['admin', 'manager'].includes(user.role)) {
        hasRequiredRole = true;
      } else if (requiredRole === 'staff' && ['admin', 'manager', 'staff'].includes(user.role)) {
        hasRequiredRole = true;
      }
      
      if (!hasRequiredRole) {
        toast.error(`You need ${requiredRole} access for this page`);
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, user, router, requiredRole]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If role check is required but user doesn't have permission
  if (requiredRole && user) {
    let hasRequiredRole = false;
    
    if (requiredRole === 'admin' && user.role === 'admin') {
      hasRequiredRole = true;
    } else if (requiredRole === 'manager' && ['admin', 'manager'].includes(user.role)) {
      hasRequiredRole = true;
    } else if (requiredRole === 'staff' && ['admin', 'manager', 'staff'].includes(user.role)) {
      hasRequiredRole = true;
    }
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. This page requires {requiredRole} privileges.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Go to Home
          </button>
        </div>
      );
    }
  }

  // If all checks pass, render children
  return <>{children}</>;
};

export default ProtectedRoute; 