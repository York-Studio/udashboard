/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Changed from 'media' to 'class' for manual control
  theme: {
    extend: {
      colors: {
        // Dark sidebar color
        sidebar: '#1e293b', // Dark slate blue
        'sidebar-hover': '#334155', // Slightly lighter slate blue for hover states
        
        // Pastel colors for the rest of the dashboard
        primary: '#93c5fd', // Pastel blue
        secondary: '#c4b5fd', // Pastel purple
        accent: '#a5f3fc', // Pastel cyan
        warning: '#fb923c', // Darker orange (replacing pastel yellow)
        danger: '#fca5a5', // Pastel red
        success: '#86efac', // Pastel green
        
        // Background colors
        'bg-light': '#f8fafc', // Very light background
        'card-bg': '#ffffff', // Card background
        
        // Dark mode colors
        'dark-bg': '#0f172a', // Dark background
        'dark-card': '#1e293b', // Dark card background
        'dark-text': '#e2e8f0', // Light text for dark mode
        'dark-border': '#334155', // Border color for dark mode
      },
    },
  },
  plugins: [],
} 