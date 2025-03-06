import { useEffect, useState } from 'react';
import { oauth2 as SMART } from 'fhirclient';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Define types for FHIR resources
interface Patient {
  id: string;
  name?: Array<{
    given?: string[];
    family?: string;
    text?: string;
  }>;
  gender?: string;
  birthDate?: string;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
}

interface Condition {
  id: string;
  code?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  clinicalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  verificationStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  onsetDateTime?: string;
  recordedDate?: string;
}

export default function App() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize the SMART client
    SMART.ready()
      .then(client => {
        // Get patient data
        client.patient.read().then(
          (patientData: any) => {
            // Convert to our Patient interface
            const patientInfo: Patient = {
              id: patientData.id || '',
              name: patientData.name,
              gender: patientData.gender,
              birthDate: patientData.birthDate,
              address: patientData.address,
              telecom: patientData.telecom
            };
            
            setPatient(patientInfo);
            
            // Get patient conditions
            client.request(`Condition?patient=${patientData.id}&_sort=-date&_count=50`)
              .then((response: { entry?: Array<{ resource: Condition }> }) => {
                if (response.entry && response.entry.length > 0) {
                  const conditionResources = response.entry.map(entry => entry.resource);
                  setConditions(conditionResources);
                }
                setLoading(false);
              })
              .catch(err => {
                console.error('Error fetching conditions:', err);
                setError('Failed to fetch patient conditions');
                setLoading(false);
              });
          },
          err => {
            console.error('Error fetching patient:', err);
            setError('Failed to fetch patient data');
            setLoading(false);
          }
        );
      })
      .catch(err => {
        console.error('SMART authorization error:', err);
        setError('SMART authorization failed. Please try again.');
        setLoading(false);
      });
  }, []);

  const handleFindTrials = () => {
    // Navigate to the trial matching page with patient data
    router.push({
      pathname: '/app/trials',
      query: { patientId: patient?.id }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-300">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link href="/" className="btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Patient Dashboard | Clinical Trial Matcher</title>
      </Head>

      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">Clinical Trial Matcher</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/" className="btn-outline mr-2">
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Patient Information</h2>
            {patient && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {patient.name && patient.name[0]
                      ? patient.name[0].text || 
                        `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {patient.birthDate || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient ID</p>
                  <p className="text-lg text-gray-900 dark:text-white">{patient.id}</p>
                </div>
              </div>
            )}
          </div>

          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Medical Conditions</h2>
              <button onClick={handleFindTrials} className="btn-primary">
                Find Matching Trials
              </button>
            </div>
            
            {conditions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Condition
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Onset Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {conditions.map(condition => (
                      <tr key={condition.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {condition.code?.text || 
                           condition.code?.coding?.[0]?.display || 
                           'Unknown Condition'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {condition.clinicalStatus?.coding?.[0]?.display || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {condition.onsetDateTime || condition.recordedDate || 'Unknown'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-300">No conditions found for this patient.</p>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <button onClick={handleFindTrials} className="btn-primary text-lg px-8 py-3">
              Find Matching Clinical Trials
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 