/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MELDRX_CLIENT_ID: process.env.MELDRX_CLIENT_ID,
    FHIR_SERVER_URL: process.env.FHIR_SERVER_URL,
    FHIR_AUTH_URL: process.env.FHIR_AUTH_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/clinicaltrials/:path*',
        destination: 'https://clinicaltrials.gov/api/v2/:path*',
      },
      {
        source: '/.well-known/cds-services',
        destination: '/api/cds-services',
      },
      {
        source: '/cds-services/clinical-trial-matcher',
        destination: '/api/cds-services/clinical-trial-matcher',
      },
      {
        source: '/cds-services',
        destination: '/api/cds-services',
      },
    ];
  },
};

module.exports = nextConfig; 