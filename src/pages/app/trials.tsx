import { useEffect, useState } from 'react';
import { oauth2 as SMART } from 'fhirclient';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';

// Define types
interface Patient {
  id: string;
  name?: Array<{
    given?: string[];
    family?: string;
    text?: string;
  }>;
  gender?: string;
  birthDate?: string;
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
}

interface ClinicalTrial {
  nctId: string;
  briefTitle: string;
  briefSummary: string;
  detailedDescription?: string;
  eligibilityCriteria: string;
  status: string;
  phase: string;
  conditions: string[];
  interventions?: Array<{
    interventionType: string;
    interventionName: string;
  }>;
  locations?: Array<{
    facility: {
      name: string;
      address: {
        city: string;
        state: string;
        country: string;
      };
    };
    status: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  }>;
  eligibilityScore?: number;
  eligibilityExplanation?: string;
}

export default function TrialMatching() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
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
              birthDate: patientData.birthDate
            };
            
            setPatient(patientInfo);
            
            // Get patient conditions
            client.request(`Condition?patient=${patientData.id}&_sort=-date&_count=50`)
              .then((response: { entry?: Array<{ resource: Condition }> }) => {
                if (response.entry && response.entry.length > 0) {
                  const conditionResources = response.entry.map(entry => entry.resource);
                  setConditions(conditionResources);
                  
                  // Set the first condition as selected by default
                  if (conditionResources.length > 0 && conditionResources[0].code) {
                    const conditionName = conditionResources[0].code.text || 
                                         conditionResources[0].code.coding?.[0]?.display || 
                                         '';
                    setSelectedCondition(conditionName);
                    setSearchTerm(conditionName);
                  }
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

  const searchTrials = async () => {
    if (!searchTerm) return;
    
    setAnalyzing(true);
    try {
      // Search for clinical trials using our API route
      const response = await axios.get(`/api/clinicaltrials`, {
        params: {
          term: searchTerm
        }
      });

      if (response.data && response.data.studies) {
        // Transform the API response to our ClinicalTrial interface
        const transformedTrials: ClinicalTrial[] = response.data.studies.map((study: any) => ({
          nctId: study.protocolSection?.identificationModule?.nctId || '',
          briefTitle: study.protocolSection?.identificationModule?.briefTitle || '',
          briefSummary: study.protocolSection?.descriptionModule?.briefSummary || '',
          detailedDescription: study.protocolSection?.descriptionModule?.detailedDescription || '',
          eligibilityCriteria: study.protocolSection?.eligibilityModule?.eligibilityCriteria || '',
          status: study.protocolSection?.statusModule?.overallStatus || '',
          phase: study.protocolSection?.designModule?.phases?.join(', ') || 'N/A',
          conditions: study.protocolSection?.conditionsModule?.conditions || [],
          interventions: study.protocolSection?.armsInterventionsModule?.interventions?.map((intervention: any) => ({
            interventionType: intervention.type || '',
            interventionName: intervention.name || ''
          })) || [],
          locations: study.protocolSection?.contactsLocationsModule?.locations?.map((location: any) => ({
            facility: {
              name: location.facility || '',
              address: {
                city: location.city || '',
                state: location.state || '',
                country: location.country || ''
              }
            },
            status: location.status || '',
            contactName: location.contactName || '',
            contactPhone: location.contactPhone || '',
            contactEmail: location.contactEmail || ''
          })) || []
        }));

        // Now analyze eligibility with LLM
        await analyzeEligibility(transformedTrials);
      } else {
        setTrials([]);
        setAnalyzing(false);
      }
    } catch (err) {
      console.error('Error searching trials:', err);
      setError('Failed to search for clinical trials. Please try again.');
      setAnalyzing(false);
    }
  };

  const analyzeEligibility = async (trials: ClinicalTrial[]) => {
    try {
      // Prepare patient data for LLM analysis
      const patientData = {
        id: patient?.id || '',
        name: patient?.name?.[0]?.text || 
              `${patient?.name?.[0]?.given?.join(' ') || ''} ${patient?.name?.[0]?.family || ''}`,
        gender: patient?.gender || '',
        birthDate: patient?.birthDate || '',
        conditions: conditions.map(c => ({
          name: c.code?.text || c.code?.coding?.[0]?.display || '',
          code: c.code?.coding?.[0]?.code || ''
        }))
      };

      // Call our API endpoint to analyze eligibility with LLM
      const response = await axios.post('/api/analyze-eligibility', {
        patient: patientData,
        trials: trials.map(trial => ({
          nctId: trial.nctId,
          briefTitle: trial.briefTitle,
          eligibilityCriteria: trial.eligibilityCriteria
        }))
      });

      if (response.data && response.data.results) {
        // Update trials with eligibility scores and explanations
        const analyzedTrials = trials.map(trial => {
          const analysis = response.data.results.find((r: any) => r.nctId === trial.nctId);
          if (analysis) {
            return {
              ...trial,
              eligibilityScore: analysis.score,
              eligibilityExplanation: analysis.explanation
            };
          }
          return trial;
        });

        // Sort by eligibility score (highest first)
        analyzedTrials.sort((a, b) => 
          (b.eligibilityScore || 0) - (a.eligibilityScore || 0)
        );

        setTrials(analyzedTrials);
      }
    } catch (err) {
      console.error('Error analyzing eligibility:', err);
      setError('Failed to analyze trial eligibility');
      // Still show the trials even if analysis fails
      setTrials(trials);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConditionSelect = (conditionName: string) => {
    setSelectedCondition(conditionName);
    setSearchTerm(conditionName);
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
          <Link href="/app" className="btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Trial Matching | Clinical Trial Matcher</title>
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
              <Link href="/app" className="btn-outline mr-2">
                Dashboard
              </Link>
              <Link href="/" className="btn-outline">
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Find Clinical Trials</h2>
            
            <div className="mb-4">
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Patient Conditions
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {conditions.map(condition => (
                  <button
                    key={condition.id}
                    onClick={() => handleConditionSelect(condition.code?.text || condition.code?.coding?.[0]?.display || '')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCondition === (condition.code?.text || condition.code?.coding?.[0]?.display || '')
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown Condition'}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  id="searchTerm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for clinical trials by condition or keyword"
                  className="input flex-grow"
                />
                <button 
                  onClick={searchTrials}
                  disabled={analyzing}
                  className="btn-primary whitespace-nowrap"
                >
                  {analyzing ? 'Searching...' : 'Search Trials'}
                </button>
              </div>
            </div>
          </div>

          {analyzing ? (
            <div className="card text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-300">
                Analyzing trial eligibility for this patient...
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                This may take a minute as we process the eligibility criteria.
              </p>
            </div>
          ) : trials.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Matching Clinical Trials ({trials.length})
              </h2>
              
              <div className="space-y-6">
                {trials.map(trial => (
                  <div key={trial.nctId} className="card">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {trial.briefTitle}
                      </h3>
                      {trial.eligibilityScore !== undefined && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          trial.eligibilityScore >= 80 ? 'bg-green-100 text-green-800' :
                          trial.eligibilityScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {trial.eligibilityScore >= 80 ? 'Likely Eligible' :
                           trial.eligibilityScore >= 50 ? 'Possibly Eligible' :
                           'Likely Ineligible'}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs">
                        Status: {trial.status}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs">
                        Phase: {trial.phase}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs">
                        ID: {trial.nctId}
                      </span>
                    </div>
                    
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">
                      {trial.briefSummary?.substring(0, 200)}...
                    </p>
                    
                    {trial.eligibilityExplanation && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Eligibility Analysis
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          {trial.eligibilityExplanation}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <Link 
                        href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-sm"
                      >
                        View on ClinicalTrials.gov
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500 dark:text-gray-300">
                No clinical trials found. Try searching for a different condition or keyword.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 