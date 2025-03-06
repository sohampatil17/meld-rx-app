import { useEffect, useState } from 'react';
import { oauth2 as SMART } from 'fhirclient';

export default function StandaloneLaunch() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the SMART client for standalone launch
    SMART.authorize({
      clientId: process.env.NEXT_PUBLIC_MELDRX_CLIENT_ID || 'default-client-id',
      scope: 'patient/*.read openid profile',
      redirectUri: `${window.location.origin}/app`,
      iss: process.env.NEXT_PUBLIC_FHIR_SERVER_URL || 'https://api.meldrx.com/fhir',
      completeInTarget: true,
    }).catch(error => {
      console.error('Authorization error:', error);
      setError('Failed to authorize with the FHIR server. Please try again.');
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Standalone Launch
        </h1>
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <>
            <p className="text-gray-500 dark:text-gray-300 mb-4">
              Connecting to FHIR server...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 