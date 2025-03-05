import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Check if the current route should be protected
  const isPublicRoute = router.pathname === '/login';
  
  // Admin-only routes
  const isAdminRoute = router.pathname === '/users';
  
  // Manager or admin routes (if we add any in the future)
  const isManagerRoute = false; // Example: router.pathname === '/reports'
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Restaurant dashboard providing real-time insights into booking trends, customer traffic, financial performance, staffing efficiency, and inventory levels." />
        <meta name="keywords" content="restaurant, dashboard, analytics, bookings, inventory, staff" />
        <title>Restaurant Dashboard</title>
      </Head>
      <AuthProvider>
        <Toaster position="top-right" />
        {isPublicRoute ? (
          <Component {...pageProps} />
        ) : isAdminRoute ? (
          <ProtectedRoute requiredRole="admin">
            <Component {...pageProps} />
          </ProtectedRoute>
        ) : isManagerRoute ? (
          <ProtectedRoute requiredRole="manager">
            <Component {...pageProps} />
          </ProtectedRoute>
        ) : (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        )}
      </AuthProvider>
    </>
  );
}

export default MyApp; 