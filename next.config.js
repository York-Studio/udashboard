/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    // These will be replaced with actual environment variables in production
    NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN: process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN,
    NEXT_PUBLIC_AIRTABLE_BASE_ID: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
    NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS: process.env.NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS,
  },
  // Removed standalone output since we're no longer using Docker
};

module.exports = nextConfig; 