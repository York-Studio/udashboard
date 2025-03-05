import { useEffect } from 'react';
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
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while still loading
    if (loading) return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      // Store the current URL to redirect back after login
      const returnUrl = encodeURIComponent(router.asPath);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }
    
    // If a specific role is required and user doesn't have it
    if (requiredRole && user && user.role !== requiredRole) {
      // Check if user role has sufficient permissions
      // In this simple hierarchy: admin > manager > staff
      const hasAccess = 
        (requiredRole === 'staff' && ['admin', 'manager', 'staff'].includes(user.role)) ||
        (requiredRole === 'manager' && ['admin', 'manager'].includes(user.role)) ||
        (requiredRole === 'admin' && user.role === 'admin');
      
      if (!hasAccess) {
        toast.error(`Access denied. '${requiredRole}' role required.`);
        router.push('/');
      }
    }
  }, [isAuthenticated, loading, requiredRole, router, user]);

  // If loading or not authenticated, show loading indicator
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-dark-bg">
        <div className="animate-pulse text-primary text-2xl">Loading...</div>
      </div>
    );
  }
  
  // If checking role requirements
  if (requiredRole && user && user.role !== requiredRole) {
    // For admin routes, only admin can access
    if (requiredRole === 'admin' && user.role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-dark-bg">
          <div className="text-center">
            <div className="text-red-500 text-2xl mb-4">Access Denied</div>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have the required permissions.
            </p>
          </div>
        </div>
      );
    }
    
    // For manager routes, managers and admins can access
    if (requiredRole === 'manager' && !['admin', 'manager'].includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-dark-bg">
          <div className="text-center">
            <div className="text-red-500 text-2xl mb-4">Access Denied</div>
            <p className="text-gray-600 dark:text-gray-400">
              Manager or Admin access required.
            </p>
          </div>
        </div>
      );
    }
  }

  // If authenticated and passes role requirements, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 