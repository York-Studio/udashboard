import React from 'react';
import Link from 'next/link';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import Layout from '@/components/Layout';

const NotFoundPage = () => {
  return (
    <Layout title="Page Not Found">
      <div className="flex flex-col items-center justify-center py-12">
        <FaExclamationTriangle className="text-6xl text-yellow-500 mb-6" />
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/" className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200">
          <FaHome />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage; 