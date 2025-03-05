import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const LoginPage: NextPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string || '/';
  
  // If already authenticated, redirect to home or returnUrl
  useEffect(() => {
    if (isAuthenticated) {
      router.push(decodeURIComponent(returnUrl));
    }
  }, [isAuthenticated, router, returnUrl]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    // Validate form
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    // Start loading state
    setIsLoading(true);
    
    try {
      // Attempt login
      const success = await login(username, password);
      
      if (success) {
        // Show success toast
        toast.success('Login successful!');
        
        // Redirect to return URL or home page
        router.push(decodeURIComponent(returnUrl));
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-sidebar text-white flex flex-col justify-center py-8 sm:px-6 lg:px-8">
      <Head>
        <title>Login | Restaurant Dashboard</title>
        <meta name="description" content="Login to the Restaurant Dashboard" />
        <link rel="icon" href="/the%20old%20thatch.png" />
      </Head>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <div className="h-128 w-128 relative">
            <Image 
              src="/the%20old%20thatch.png" 
              alt="The Old Thatch Logo" 
              width={512} 
              height={512}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
      
      <div className="mt-0 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-sidebar-hover py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-900/20 border border-red-800 rounded-md p-4 text-red-400">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-sidebar-hover text-white placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-sidebar-hover text-white placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FaSignInAlt className="mr-2" />
                    Sign in
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 