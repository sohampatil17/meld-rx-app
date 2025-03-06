import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { initializeFhirClient, getPatientData } from '@/utils/fhir';
import { Patient } from '@/types/app';
import ErrorMessage from '@/components/ErrorMessage';

export default function LaunchCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const router = useRouter();

  useEffect(() => {
    const completeAuth = async () => {
      try {
        // Initialize FHIR client
        const client = await initializeFhirClient();
        
        // Get patient data
        const patientData = await getPatientData(client);
        setPatient(patientData);
        
        // Store patient data in session storage for use in the app
        sessionStorage.setItem('patient', JSON.stringify(patientData));
        
        // Redirect to the main app
        router.push('/demo');
      } catch (error) {
        console.error('Error completing authentication:', error);
        setError('Failed to complete authentication. Please try again.');
        setLoading(false);
      }
    };

    completeAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Head>
        <title>Completing Authentication | Clinical Trial Matcher</title>
        <meta name="description" content="Completing SMART on FHIR authentication" />
      </Head>

      <div className="text-center max-w-md px-4">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <h1 className="mt-6 text-xl font-semibold text-gray-900">Completing Authentication</h1>
            <p className="mt-2 text-gray-500">Retrieving your health information...</p>
          </>
        ) : error ? (
          <div className="space-y-6">
            <ErrorMessage message={error} />
            <button 
              onClick={() => router.push('/launch')}
              className="btn-primary"
            >
              Try Again
            </button>
            <button 
              onClick={() => router.push('/')}
              className="btn-outline ml-4"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">Authentication successful! Redirecting...</p>
                </div>
              </div>
            </div>
            {patient && (
              <div className="bg-white shadow rounded-lg p-6 text-left">
                <h2 className="text-lg font-medium text-gray-900">Welcome, {patient.name}</h2>
                <p className="mt-2 text-sm text-gray-500">
                  We've successfully retrieved your health information. You'll be redirected to the application shortly.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 