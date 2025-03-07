/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/clinicaltrials/:path*',
        destination: 'https://clinicaltrials.gov/api/v2/:path*',
      },
      {
        source: '/.well-known/cds-services',
        destination: '/api/.well-known/cds-services',
      },
    ];
  },
};

module.exports = nextConfig; 