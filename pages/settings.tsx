import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { FaCog, FaDatabase, FaUserAlt, FaPalette, FaBell, FaSave } from 'react-icons/fa';
import Layout from '@/components/Layout';
import { toast } from 'react-hot-toast';

const SettingsPage: NextPage = () => {
  // State for settings
  const [refreshInterval, setRefreshInterval] = useState('15');
  const [defaultView, setDefaultView] = useState('overview');
  const [colorTheme, setColorTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    lowInventory: true,
    bookings: true,
    financialReports: false,
    staffSchedule: true
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load saved settings on component mount
  useEffect(() => {
    // In a real app, this would fetch from an API or localStorage
    // For now, we'll just simulate loading saved settings
    const loadSettings = () => {
      // This could be replaced with actual API calls or localStorage
      const savedSettings = localStorage.getItem('dashboardSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setRefreshInterval(parsedSettings.refreshInterval || '15');
        setDefaultView(parsedSettings.defaultView || 'overview');
        setColorTheme(parsedSettings.colorTheme || 'light');
        setNotifications(parsedSettings.notifications || {
          lowInventory: true,
          bookings: true,
          financialReports: false,
          staffSchedule: true
        });
      }
    };

    loadSettings();
  }, []);

  // Handle saving settings
  const saveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Save to localStorage for demo purposes
      const settings = {
        refreshInterval,
        defaultView,
        colorTheme,
        notifications
      };
      
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
      
      setIsSaving(false);
      toast.success('Settings saved successfully!');
    }, 800);
  };

  // Handle notification toggle
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle theme change
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    setColorTheme(newTheme);
    
    // Apply theme change immediately
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (newTheme === 'system') {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <Layout title="Settings">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <button 
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center px-4 py-2 bg-primary text-gray-800 rounded-md hover:bg-opacity-80 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <FaDatabase className="mr-2" />
              Data Integration Settings
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Configure your Airtable integration settings. Current connection status: <span className="text-green-500 font-semibold">Connected</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Refresh Interval (minutes)
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="60">60</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <FaUserAlt className="mr-2" />
              User Preferences
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Customize your dashboard experience
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Dashboard View
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value)}
              >
                <option value="overview">Overview</option>
                <option value="bookings">Bookings</option>
                <option value="financials">Financials</option>
                <option value="inventory">Inventory</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <FaPalette className="mr-2" />
              Display Settings
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Adjust the display and appearance of your dashboard
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Theme
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={colorTheme}
                onChange={handleThemeChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                {colorTheme === 'dark' ? 
                  'Dark mode is currently active.' : 
                  colorTheme === 'light' ? 
                    'Light mode is currently active.' : 
                    'System preference will be used for theme.'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <FaBell className="mr-2" />
              Notification Settings
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Configure your notification preferences
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Low Inventory Alerts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.lowInventory}
                    onChange={() => toggleNotification('lowInventory')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Booking Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.bookings}
                    onChange={() => toggleNotification('bookings')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Financial Report Alerts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.financialReports}
                    onChange={() => toggleNotification('financialReports')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Staff Schedule Reminders</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.staffSchedule}
                    onChange={() => toggleNotification('staffSchedule')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage; 