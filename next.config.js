/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/clinicaltrials/:path*',
        destination: 'https://clinicaltrials.gov/api/v2/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 