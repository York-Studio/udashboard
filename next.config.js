/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // These will be replaced with actual environment variables in production
    NEXT_PUBLIC_AIRTABLE_API_KEY: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
    NEXT_PUBLIC_AIRTABLE_BASE_ID: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
  },
  // Enable standalone output for Docker deployment
  output: 'standalone',
};

module.exports = nextConfig; 