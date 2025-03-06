import { useEffect } from 'react';
import Head from 'next/head';
import { launchFhirClient } from '@/utils/fhir';

export default function Launch() {
  useEffect(() => {
    const initLaunch = async () => {
      try {
        await launchFhirClient();
      } catch (error) {
        console.error('Launch error:', error);
      }
    };

    initLaunch();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Head>
        <title>Launching | Clinical Trial Matcher</title>
        <meta name="description" content="Launching SMART on FHIR app" />
      </Head>

      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        <h1 className="mt-6 text-xl font-semibold text-gray-900">Launching Clinical Trial Matcher</h1>
        <p className="mt-2 text-gray-500">Connecting to your health record...</p>
      </div>
    </div>
  );
} 