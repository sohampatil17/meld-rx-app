import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import EligibilityAnalysis from '@/components/EligibilityAnalysis';
import EligibilityDashboard from '@/components/EligibilityDashboard';
import ErrorMessage from '@/components/ErrorMessage';
import AnalysisError from '@/components/AnalysisError';
import EmptyResults from '@/components/EmptyResults';
import AnalysisLoading from '@/components/AnalysisLoading';

// Define types
interface Criterion {
  criterion: string;
  met: 'yes' | 'no' | 'unknown';
  explanation: string;
}

interface ClinicalTrial {
  nctId: string;
  briefTitle: string;
  briefSummary?: string;
  status: string;
  phase: string;
  eligibilityScore?: number;
  eligibilityExplanation?: string;
  inclusionCriteria?: Criterion[];
  exclusionCriteria?: Criterion[];
  analysisInProgress?: boolean;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [error, setError] = useState('');
  const [allAnalyzed, setAllAnalyzed] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setIsSearching(true);
    setError('');
    setAllAnalyzed(false);
    
    try {
      // In a real app, this would call your API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data for demonstration
      const mockTrials: ClinicalTrial[] = [
        {
          nctId: 'NCT04790682',
          briefTitle: 'LIquid Biopsy to prEdict Responses To First-line immunotherapY in Metastatic Non-small Cell LUNG Cancer',
          briefSummary: 'This study aims to identify biomarkers that can predict response to immunotherapy in lung cancer patients.',
          status: 'Recruiting',
          phase: 'Phase 2',
          analysisInProgress: false,
          eligibilityScore: 85,
          eligibilityExplanation: 'Patient meets all inclusion criteria and avoids all exclusion criteria. The patient is eligible for this trial.',
          inclusionCriteria: [
            {
              criterion: 'Age ≥ 18 years',
              met: 'yes',
              explanation: 'Patient is 65 years old, which meets the age requirement.'
            },
            {
              criterion: 'Histologically confirmed diagnosis of lung cancer',
              met: 'yes',
              explanation: 'Patient has a confirmed lung cancer diagnosis.'
            },
            {
              criterion: 'ECOG performance status ≤ 2',
              met: 'yes',
              explanation: 'Patient\'s ECOG performance status is 1.'
            }
          ],
          exclusionCriteria: [
            {
              criterion: 'Prior treatment with immunotherapy',
              met: 'no',
              explanation: 'Patient has not received prior immunotherapy.'
            },
            {
              criterion: 'Known brain metastases',
              met: 'no',
              explanation: 'Patient does not have known brain metastases.'
            }
          ]
        },
        {
          nctId: 'NCT05194982',
          briefTitle: 'A Study of BL-B01D1 in Patients With Advanced Solid Tumors',
          briefSummary: 'This is a Phase I clinical study to evaluate the safety and efficacy of BL-B01D1 in patients with locally advanced or metastatic solid tumors.',
          status: 'Recruiting',
          phase: 'Phase 1',
          analysisInProgress: false,
          eligibilityScore: 65,
          eligibilityExplanation: 'Patient meets 2/3 inclusion criteria and avoids 2/3 exclusion criteria, with 2 unknown factors. The patient may be eligible, but additional information is needed to confirm.',
          inclusionCriteria: [
            {
              criterion: 'Age ≥ 18 years',
              met: 'yes',
              explanation: 'Patient is 65 years old, which meets the age requirement.'
            },
            {
              criterion: 'Histologically confirmed diagnosis of solid tumor',
              met: 'yes',
              explanation: 'Patient has a confirmed solid tumor diagnosis.'
            },
            {
              criterion: 'Measurable disease per RECIST 1.1',
              met: 'unknown',
              explanation: 'Insufficient information to determine if patient meets this criterion.'
            }
          ],
          exclusionCriteria: [
            {
              criterion: 'Prior treatment with similar compounds',
              met: 'unknown',
              explanation: 'Insufficient information to determine if patient meets this criterion.'
            },
            {
              criterion: 'Known brain metastases',
              met: 'no',
              explanation: 'Patient does not have known brain metastases.'
            },
            {
              criterion: 'Inadequate organ function',
              met: 'no',
              explanation: 'Patient has adequate organ function based on available information.'
            }
          ]
        },
        {
          nctId: 'NCT06123456',
          briefTitle: 'Study of Novel Therapy for Advanced Breast Cancer',
          briefSummary: 'This study evaluates the efficacy of a novel therapy for patients with advanced breast cancer who have progressed on standard treatments.',
          status: 'Recruiting',
          phase: 'Phase 2',
          analysisInProgress: false,
          eligibilityScore: 35,
          eligibilityExplanation: 'Patient is ineligible because they do not meet an inclusion criterion: "Histologically confirmed diagnosis of breast cancer". All inclusion criteria must be met to qualify for the trial.',
          inclusionCriteria: [
            {
              criterion: 'Age ≥ 18 years',
              met: 'yes',
              explanation: 'Patient is 65 years old, which meets the age requirement.'
            },
            {
              criterion: 'Histologically confirmed diagnosis of breast cancer',
              met: 'no',
              explanation: 'Patient does not have a breast cancer diagnosis.'
            },
            {
              criterion: 'Prior treatment with at least one line of therapy',
              met: 'unknown',
              explanation: 'Insufficient information to determine if patient meets this criterion.'
            }
          ],
          exclusionCriteria: [
            {
              criterion: 'Known brain metastases',
              met: 'no',
              explanation: 'Patient does not have known brain metastases.'
            },
            {
              criterion: 'Inadequate organ function',
              met: 'no',
              explanation: 'Patient has adequate organ function based on available information.'
            }
          ]
        }
      ];
      
      // Sort trials by eligibility score (highest first)
      mockTrials.sort((a, b) => {
        // Trials with no score go to the bottom
        if (a.eligibilityScore === undefined) return 1;
        if (b.eligibilityScore === undefined) return -1;
        
        // Otherwise sort by score (highest first)
        return b.eligibilityScore - a.eligibilityScore;
      });
      
      setTrials(mockTrials);
      setAllAnalyzed(true);
    } catch (err) {
      console.error('Error searching trials:', err);
      setError('Failed to search for trials. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Add a function to simulate retrying analysis
  const retryAnalysis = async (trialId: string) => {
    // In a real app, this would call your API to retry the analysis
    const trial = trials.find(t => t.nctId === trialId);
    if (trial) {
      setTrials(prevTrials => 
        prevTrials.map(t => t.nctId === trialId ? {...t, analysisInProgress: true} : t)
      );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the trial with new analysis results
      setTrials(prevTrials => 
        prevTrials.map(t => {
          if (t.nctId === trialId) {
            return {
              ...t,
              analysisInProgress: false,
              eligibilityScore: 65,
              eligibilityExplanation: 'Analysis retry successful. Patient may be eligible for this trial.',
              inclusionCriteria: [
                {
                  criterion: 'Age ≥ 18 years',
                  met: 'yes',
                  explanation: 'Patient meets the age requirement.'
                },
                {
                  criterion: 'Confirmed diagnosis',
                  met: 'yes',
                  explanation: 'Patient has a confirmed diagnosis.'
                }
              ],
              exclusionCriteria: [
                {
                  criterion: 'Prior treatment with similar compounds',
                  met: 'no',
                  explanation: 'Patient has not received prior treatment with similar compounds.'
                }
              ]
            };
          }
          return t;
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Clinical Trial Matcher</title>
        <meta name="description" content="Find clinical trials that match your medical profile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary-600">Clinical Trial Matcher</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/demo" className="btn-outline">
                Try Demo
              </Link>
              <Link href="/launch" className="btn-primary">
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Match Patients with Clinical Trials
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              A SMART on FHIR application for clinical research sites to match patients with eligible clinical trials.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/launch" className="btn-primary mx-2">
                Launch App
              </Link>
              <Link href="/demo" className="btn-outline mx-2">
                Try Demo
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900">FHIR Integration</h3>
              <p className="mt-2 text-gray-500">
                Securely access patient data from EHR systems using SMART on FHIR standards.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900">Trial Matching</h3>
              <p className="mt-2 text-gray-500">
                Find relevant clinical trials from ClinicalTrials.gov based on patient conditions.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900">AI-Powered Eligibility</h3>
              <p className="mt-2 text-gray-500">
                Use LLMs to analyze patient eligibility for clinical trials with detailed explanations.
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">MeldRx Integration</h3>
              <p className="text-gray-500 mb-4">
                Clinical Trial Matcher is integrated with the MeldRx platform, allowing seamless deployment within healthcare systems.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">SMART on FHIR Launch</h4>
                  <p className="text-gray-500 mb-3">
                    Our app supports both EHR Launch and Standalone Launch flows, making it easy to integrate with any FHIR-compliant EHR system.
                  </p>
                  <ul className="list-disc pl-5 text-gray-500 space-y-1">
                    <li>Secure OAuth 2.0 authentication</li>
                    <li>FHIR R4 data model support</li>
                    <li>Patient-level scoped access</li>
                    <li>Contextual launching from patient charts</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Predictive AI Features</h4>
                  <p className="text-gray-500 mb-3">
                    Our app uses advanced AI to analyze patient eligibility for clinical trials, providing detailed explanations and recommendations.
                  </p>
                  <ul className="list-disc pl-5 text-gray-500 space-y-1">
                    <li>Real-time eligibility analysis</li>
                    <li>Detailed criteria explanations</li>
                    <li>Confidence scoring for eligibility</li>
                    <li>Personalized trial recommendations</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Link href="/launch" className="btn-primary">
                  Launch with MeldRx
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Try the Demo</h3>
              <p className="text-gray-500 mb-4">
                Want to see how it works without connecting to an EHR? Try our demo with sample patient data.
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for clinical trials by condition or keyword"
                  className="input flex-grow"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching || !searchTerm}
                  className="btn-primary whitespace-nowrap"
                >
                  {isSearching ? (
                    <>
                      <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                      Searching...
                    </>
                  ) : (
                    'Search Trials'
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          {isSearching ? (
            <AnalysisLoading message="Searching for clinical trials..." subMessage="This may take a moment." />
          ) : trials.length > 0 ? (
            <>
              {allAnalyzed && (
                <EligibilityDashboard trials={trials} isAnalyzing={isSearching} />
              )}
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Clinical Trials ({trials.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trials.map((trial) => (
                    <div key={trial.nctId} id={`trial-${trial.nctId}`} className="card h-full flex flex-col">
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                            {trial.briefTitle}
                          </h3>
                        </div>
                        
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded-md bg-gray-100 text-xs">
                            Status: {trial.status}
                          </span>
                          <span className="px-2 py-1 rounded-md bg-gray-100 text-xs">
                            Phase: {trial.phase}
                          </span>
                          <span className="px-2 py-1 rounded-md bg-gray-100 text-xs">
                            ID: {trial.nctId}
                          </span>
                        </div>
                        
                        <p className="mt-3 text-sm text-gray-500 line-clamp-3">
                          {trial.briefSummary?.substring(0, 150)}...
                        </p>
                      </div>
                      
                      {trial.analysisInProgress ? (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Analyzing Eligibility...
                          </h4>
                          <div className="flex items-center space-x-1 mt-2 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                      ) : trial.eligibilityExplanation?.includes("Failed to analyze") ? (
                        <AnalysisError 
                          message={trial.eligibilityExplanation}
                          trialId={trial.nctId}
                          onRetry={() => retryAnalysis(trial.nctId)}
                        />
                      ) : trial.inclusionCriteria || trial.exclusionCriteria ? (
                        <EligibilityAnalysis 
                          inclusionCriteria={trial.inclusionCriteria}
                          exclusionCriteria={trial.exclusionCriteria}
                          eligibilityScore={trial.eligibilityScore}
                          eligibilityExplanation={trial.eligibilityExplanation}
                          trialId={trial.nctId}
                          onRetry={() => retryAnalysis(trial.nctId)}
                        />
                      ) : (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-500">
                            Sign in to analyze your eligibility for this trial.
                          </p>
                          <div className="mt-3">
                            <Link href="/demo" className="btn-outline text-sm">
                              Try Demo
                            </Link>
                          </div>
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
            </>
          ) : (
            <div className="mt-8">
              {/* Empty state is only shown when user has searched but no results were found */}
              {searchTerm && !isSearching && (
                <EmptyResults />
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            &copy; 2023 Clinical Trial Matcher. All rights reserved.
          </p>
          <div className="mt-2 text-center text-sm text-gray-500">
            Powered by <a href="https://meldrx.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500">MeldRx</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 