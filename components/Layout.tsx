import React, { ReactNode, useEffect, useState } from 'react';
import Head from 'next/head';
import { FaCalendarAlt, FaChartLine, FaUsers, FaBoxes, FaCog, FaSignOutAlt, FaUserFriends } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Restaurant Dashboard' }) => {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  // After mounting, we can access localStorage and apply the theme
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage for theme preference
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      try {
        const { colorTheme } = JSON.parse(savedSettings);
        if (colorTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (colorTheme === 'light') {
          document.documentElement.classList.remove('dark');
        } else if (colorTheme === 'system') {
          // Check system preference
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  }, []);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-dark-bg">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Restaurant management dashboard" />
        <link rel="icon" href="/the%20old%20thatch.png" />
      </Head>
      
      <div className="flex">
        {/* Sidebar - keeping it dark in both themes */}
        <div className="fixed h-screen w-64 bg-sidebar text-white flex flex-col justify-between">
          <div className="flex flex-col">
            <div className="pt-4 pb-0 px-4 flex justify-center">
              <div className="relative w-48 h-40">
                <Image 
                  src="/the%20old%20thatch.png" 
                  alt="The Old Thatch Logo" 
                  width={192} 
                  height={192}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            
            <nav className="-mt-8">
              <ul>
                <NavItem href="/" icon={<FaChartLine />} text="Overview" />
                <NavItem href="/bookings" icon={<FaCalendarAlt />} text="Bookings" />
                <NavItem href="/financials" icon={<FaChartLine />} text="Financials" />
                <NavItem href="/staff" icon={<FaUsers />} text="Staff" />
                <NavItem href="/inventory" icon={<FaBoxes />} text="Inventory" />
                {isAdmin && (
                  <NavItem href="/users" icon={<FaUserFriends />} text="Users" />
                )}
                <NavItem href="/settings" icon={<FaCog />} text="Settings" />
              </ul>
            </nav>
          </div>
          
          {/* User Profile and Logout at bottom of sidebar */}
          <div className="p-4 border-t border-sidebar-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white text-sidebar flex items-center justify-center">
                  <span className="font-semibold">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AR'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
                  <span className="text-xs text-gray-300">{user?.role || 'User'}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-white hover:text-primary transition-colors p-2 rounded-full hover:bg-sidebar-hover"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="ml-64 flex-1">
          {/* Content */}
          <main className="dashboard-container">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ href: string; icon: ReactNode; text: string }> = ({ href, icon, text }) => {
  return (
    <li>
      <Link href={href} className="flex items-center space-x-3 px-6 py-3 hover:bg-sidebar-hover">
        <span className="text-lg">{icon}</span>
        <span>{text}</span>
      </Link>
    </li>
  );
};

export default Layout; 