import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
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

interface Patient {
  id: string;
  name: string;
  gender: string;
  age: number;
  dateOfBirth: string;
  conditions: Array<{
    name: string;
    diagnosisDate: string;
    status: string;
  }>;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  performanceStatus?: string;
}

export default function PatientTrials() {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [allAnalyzed, setAllAnalyzed] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Load patient data from session storage
    const loadPatientData = () => {
      try {
        const patientData = sessionStorage.getItem('fhir_patient');
        if (!patientData) {
          setError('No patient data found. Please launch the app from your EHR.');
          return;
        }
        
        // Parse patient data
        const fhirPatient = JSON.parse(patientData);
        
        // Get conditions
        const conditionsData = sessionStorage.getItem('fhir_conditions');
        const fhirConditions = conditionsData ? JSON.parse(conditionsData) : { entry: [] };
        
        // Get medications
        const medicationsData = sessionStorage.getItem('fhir_medications');
        const fhirMedications = medicationsData ? JSON.parse(medicationsData) : { entry: [] };
        
        // Format patient data
        const formattedPatient: Patient = {
          id: fhirPatient.id,
          name: formatPatientName(fhirPatient),
          gender: fhirPatient.gender || 'Unknown',
          age: fhirPatient.birthDate ? calculateAge(new Date(fhirPatient.birthDate)) : 0,
          dateOfBirth: fhirPatient.birthDate || 'Unknown',
          conditions: fhirConditions.entry?.map((entry: any) => {
            const condition = entry.resource;
            return {
              name: condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown Condition',
              diagnosisDate: condition.onsetDateTime || condition.recordedDate || 'Unknown',
              status: condition.clinicalStatus?.coding?.[0]?.display || 'Unknown'
            };
          }) || [],
          medications: fhirMedications.entry?.map((entry: any) => {
            const medication = entry.resource;
            return {
              name: medication.medicationCodeableConcept?.text || 
                    medication.medicationCodeableConcept?.coding?.[0]?.display || 
                    'Unknown Medication',
              dosage: medication.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value + 
                      ' ' + 
                      (medication.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || '') || 
                      'Unknown',
              frequency: medication.dosageInstruction?.[0]?.text || 'Unknown'
            };
          }) || [],
          performanceStatus: 'ECOG 0' // Default to ECOG 0 if not available
        };
        
        setPatient(formattedPatient);
        
        // Get search term from query params
        const { term } = router.query;
        if (term && typeof term === 'string') {
          setSearchTerm(term);
          searchTrials(term, formattedPatient);
        }
      } catch (err) {
        console.error('Error loading patient data:', err);
        setError(`Failed to load patient data: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    if (router.isReady) {
      loadPatientData();
    }
  }, [router.isReady, router.query]);
  
  const formatPatientName = (fhirPatient: any): string => {
    if (fhirPatient.name && fhirPatient.name.length > 0) {
      const name = fhirPatient.name[0];
      
      if (name.text) {
        return name.text;
      }
      
      const given = name.given?.join(' ') || '';
      const family = name.family || '';
      
      return `${given} ${family}`.trim();
    }
    
    return 'Unknown Patient';
  };
  
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const searchTrials = async (term: string, patientData: Patient) => {
    setError('');
    setAnalyzing(true);
    setAllAnalyzed(false);
    
    try {
      const response = await axios.get('/api/clinicaltrials', {
        params: { term }
      });
      
      if (response.data && response.data.studies) {
        // Map API response to our ClinicalTrial type
        const mappedTrials: ClinicalTrial[] = response.data.studies.map((study: any) => ({
          nctId: study.protocolSection?.identificationModule?.nctId || 'Unknown',
          briefTitle: study.protocolSection?.identificationModule?.briefTitle || 'Untitled Study',
          briefSummary: study.protocolSection?.descriptionModule?.briefSummary || '',
          status: study.protocolSection?.statusModule?.overallStatus || 'Unknown',
          phase: study.protocolSection?.designModule?.phases?.join(', ') || 'Not Specified',
          analysisInProgress: false
        }));
        
        setTrials(mappedTrials);
        
        // If patient is selected, analyze eligibility for each trial
        if (patientData) {
          // Analyze one by one with delay to show streaming effect
          for (let i = 0; i < mappedTrials.length; i++) {
            await analyzeEligibility(mappedTrials[i], patientData);
            // Add a small delay between analyses for visual effect
            if (i < mappedTrials.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          // After all trials are analyzed, sort them by eligibility score
          setTrials(prevTrials => {
            // Create a copy of the trials array
            const sortedTrials = [...prevTrials];
            
            // Sort by eligibility score (highest first)
            sortedTrials.sort((a, b) => {
              // Trials with no score go to the bottom
              if (a.eligibilityScore === undefined) return 1;
              if (b.eligibilityScore === undefined) return -1;
              
              // Otherwise sort by score (highest first)
              return b.eligibilityScore - a.eligibilityScore;
            });
            
            return sortedTrials;
          });
          
          // Set all analyzed to true after all trials have been processed
          setAllAnalyzed(true);
        }
      } else {
        setError('No trials found');
        setTrials([]);
      }
    } catch (err) {
      console.error('Error searching trials:', err);
      setError('Failed to search for trials');
      setTrials([]);
    } finally {
      setAnalyzing(false);
    }
  };
  
  const analyzeEligibility = async (trial: ClinicalTrial, patientData: Patient) => {
    // Mark trial as being analyzed
    const updatedTrial = { ...trial, analysisInProgress: true };
    setTrials(prevTrials => 
      prevTrials.map(t => t.nctId === trial.nctId ? updatedTrial : t)
    );

    try {
      // In a real implementation, this would call your API to analyze eligibility
      // For now, we'll simulate the analysis with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock eligibility analysis
      const inclusionCriteria: Criterion[] = [];
      const exclusionCriteria: Criterion[] = [];
      
      // Generate mock inclusion criteria
      const mockInclusionCriteria = [
        "Age ≥ 18 years",
        "Histologically confirmed diagnosis of cancer",
        "ECOG performance status ≤ 2",
        "Adequate organ function",
        "Ability to understand and provide informed consent"
      ];
      
      let hasFailedInclusion = false;
      
      mockInclusionCriteria.forEach(criterion => {
        // For demo purposes, make most criteria met, but have some randomness
        // In a real app, this would be based on actual patient data
        let met: 'yes' | 'no' | 'unknown';
        
        if (criterion.includes("Age")) {
          // Check age criterion against patient data
          // If age is available, check if it meets the requirement
          // Otherwise, mark as unknown instead of automatically failing
          if (patientData.age) {
            const ageRequirement = parseInt(criterion.match(/\d+/)?.[0] || "18");
            met = patientData.age >= ageRequirement ? 'yes' : 'no';
          } else {
            met = 'unknown';
          }
        } else if (criterion.includes("cancer") || criterion.includes("diagnosis")) {
          // Check if patient has cancer diagnosis
          const hasCancer = patientData.conditions.some(c => 
            c.name.toLowerCase().includes("cancer") || 
            c.name.toLowerCase().includes("carcinoma") || 
            c.name.toLowerCase().includes("tumor")
          );
          met = hasCancer ? 'yes' : 'no';
        } else if (criterion.includes("ECOG")) {
          // Check ECOG status if available
          if (patientData.performanceStatus) {
            const ecogValue = parseInt(patientData.performanceStatus.replace('ECOG ', ''));
            met = !isNaN(ecogValue) && ecogValue <= 2 ? 'yes' : 'no';
          } else {
            met = 'unknown';
          }
        } else {
          // For other criteria, generate a weighted random result
          // More likely to be 'yes' for inclusion criteria
          const rand = Math.random();
          met = rand > 0.2 ? 'yes' : rand > 0.1 ? 'unknown' : 'no';
        }
        
        // If any inclusion criterion is not met, patient is ineligible
        if (met === 'no') {
          hasFailedInclusion = true;
        }
        
        inclusionCriteria.push({
          criterion,
          met,
          explanation: getExplanation(criterion, met, patientData)
        });
      });
      
      // Generate mock exclusion criteria
      const mockExclusionCriteria = [
        "Prior treatment with investigational agents within 4 weeks",
        "Known brain metastases",
        "History of allergic reactions to similar compounds",
        "Pregnant or breastfeeding",
        "Uncontrolled intercurrent illness"
      ];
      
      let hasMetExclusion = false;
      
      mockExclusionCriteria.forEach(criterion => {
        // For exclusion criteria, we want most to be 'no' (not met)
        // but with some randomness for demo purposes
        let met: 'yes' | 'no' | 'unknown';
        
        if (criterion.includes("brain metastases")) {
          // Check for brain metastases in conditions
          const hasBrainMets = patientData.conditions.some(c => 
            c.name.toLowerCase().includes("brain metastasis") || 
            c.name.toLowerCase().includes("brain metastases")
          );
          met = hasBrainMets ? 'yes' : 'no';
        } else if (criterion.includes("pregnant")) {
          // Check gender for pregnancy possibility
          met = patientData.gender === 'Male' ? 'no' : 'unknown';
        } else {
          // For other criteria, generate a weighted random result
          // More likely to be 'no' for exclusion criteria
          const rand = Math.random();
          met = rand > 0.8 ? 'yes' : rand > 0.2 ? 'no' : 'unknown';
        }
        
        // If any exclusion criterion is met, patient is ineligible
        if (met === 'yes') {
          hasMetExclusion = true;
        }
        
        exclusionCriteria.push({
          criterion,
          met,
          explanation: getExplanation(criterion, met, patientData)
        });
      });
      
      // Calculate eligibility score based on criteria
      let eligibilityScore: number;
      
      if (hasMetExclusion) {
        // If any exclusion criterion is met, patient is ineligible
        eligibilityScore = Math.floor(Math.random() * 30); // 0-29
      } else if (hasFailedInclusion) {
        // If any inclusion criterion is not met, patient is ineligible
        eligibilityScore = Math.floor(Math.random() * 30) + 10; // 10-39
      } else {
        // Calculate score based on criteria
        const metInclusion = inclusionCriteria.filter(c => c.met === 'yes').length;
        const totalInclusion = inclusionCriteria.length;
        
        const metExclusion = exclusionCriteria.filter(c => c.met === 'no').length;
        const totalExclusion = exclusionCriteria.length;
        
        const unknownInclusion = inclusionCriteria.filter(c => c.met === 'unknown').length;
        const unknownExclusion = exclusionCriteria.filter(c => c.met === 'unknown').length;
        
        // Base score calculation
        const inclusionScore = (metInclusion / totalInclusion) * 100;
        const exclusionScore = (metExclusion / totalExclusion) * 100;
        
        // Adjust for unknowns - each unknown reduces certainty
        const unknownPenalty = ((unknownInclusion + unknownExclusion) / (totalInclusion + totalExclusion)) * 20;
        
        eligibilityScore = Math.round((inclusionScore + exclusionScore) / 2 - unknownPenalty);
        
        // Ensure score is within bounds
        eligibilityScore = Math.max(40, Math.min(100, eligibilityScore));
      }
      
      const eligibilityExplanation = getEligibilityExplanation(eligibilityScore, inclusionCriteria, exclusionCriteria);
      
      // Update trial with eligibility analysis
      const analyzedTrial: ClinicalTrial = {
        ...trial,
        inclusionCriteria,
        exclusionCriteria,
        eligibilityScore,
        eligibilityExplanation,
        analysisInProgress: false
      };
      
      setTrials(prevTrials => 
        prevTrials.map(t => t.nctId === trial.nctId ? analyzedTrial : t)
      );
      
    } catch (error) {
      console.error("Error analyzing eligibility:", error);
      
      // Update trial to show analysis failed
      const failedTrial = { 
        ...trial, 
        analysisInProgress: false,
        eligibilityExplanation: "Failed to analyze eligibility. Please try again."
      };
      
      setTrials(prevTrials => 
        prevTrials.map(t => t.nctId === trial.nctId ? failedTrial : t)
      );
    }
  };
  
  const getExplanation = (criterion: string, met: string, patient: Patient): string => {
    // Generate a realistic explanation based on the criterion and patient data
    if (criterion.includes("Age")) {
      if (patient.age) {
        const ageRequirement = parseInt(criterion.match(/\d+/)?.[0] || "18");
        return `Patient is ${patient.age} years old, which ${met === 'yes' ? 'meets' : 'does not meet'} the age requirement of ≥ ${ageRequirement} years.`;
      } else {
        return `Patient's age is unknown. Additional information is needed to determine eligibility for this criterion.`;
      }
    }
    
    if (criterion.includes("cancer") || criterion.includes("diagnosis")) {
      const hasCancer = patient.conditions.some(c => 
        c.name.toLowerCase().includes("cancer") || 
        c.name.toLowerCase().includes("carcinoma") || 
        c.name.toLowerCase().includes("tumor")
      );
      return `Patient ${hasCancer ? 'has' : 'does not have'} a confirmed cancer diagnosis.`;
    }
    
    if (criterion.includes("ECOG")) {
      return `Patient's ECOG performance status is ${patient.performanceStatus || 'unknown'}.`;
    }
    
    if (criterion.includes("brain metastases")) {
      const hasBrainMets = patient.conditions.some(c => 
        c.name.toLowerCase().includes("brain metastasis") || 
        c.name.toLowerCase().includes("brain metastases")
      );
      return `Patient ${hasBrainMets ? 'has' : 'does not have'} known brain metastases.`;
    }
    
    if (criterion.includes("pregnant")) {
      return `Patient is ${patient.gender === 'Male' ? 'male and cannot be pregnant' : 'female and pregnancy status is unknown'}.`;
    }
    
    // Generic explanations for other criteria
    if (met === 'yes') {
      return "Based on available information, patient meets this criterion.";
    } else if (met === 'no') {
      return "Based on available information, patient does not meet this criterion.";
    } else {
      return "Insufficient information to determine if patient meets this criterion.";
    }
  };
  
  const getEligibilityExplanation = (score: number, inclusionCriteria: Criterion[], exclusionCriteria: Criterion[]): string => {
    const metInclusion = inclusionCriteria.filter(c => c.met === 'yes').length;
    const totalInclusion = inclusionCriteria.length;
    
    const metExclusion = exclusionCriteria.filter(c => c.met === 'no').length;
    const totalExclusion = exclusionCriteria.length;
    
    const unknownInclusion = inclusionCriteria.filter(c => c.met === 'unknown').length;
    const unknownExclusion = exclusionCriteria.filter(c => c.met === 'unknown').length;
    
    const failedInclusion = inclusionCriteria.filter(c => c.met === 'no');
    const metExclusionCriteria = exclusionCriteria.filter(c => c.met === 'yes');
    
    // Check for automatic disqualification first
    if (metExclusionCriteria.length > 0) {
      const exclusionReason = metExclusionCriteria[0].criterion;
      return `Patient is ineligible because they meet an exclusion criterion: "${exclusionReason}". Meeting any exclusion criterion automatically disqualifies a patient from the trial.`;
    }
    
    if (failedInclusion.length > 0) {
      const inclusionReason = failedInclusion[0].criterion;
      return `Patient is ineligible because they do not meet an inclusion criterion: "${inclusionReason}". All inclusion criteria must be met to qualify for the trial.`;
    }
    
    // For patients who aren't automatically disqualified
    if (score >= 80) {
      if (unknownInclusion + unknownExclusion === 0) {
        return `Patient meets all ${metInclusion}/${totalInclusion} inclusion criteria and avoids all ${metExclusion}/${totalExclusion} exclusion criteria. The patient is eligible for this trial.`;
      } else {
        return `Patient meets ${metInclusion}/${totalInclusion} inclusion criteria and avoids ${metExclusion}/${totalExclusion} exclusion criteria, with ${unknownInclusion + unknownExclusion} unknown factors. The patient is likely eligible, but additional information may be needed.`;
      }
    } else if (score >= 50) {
      return `Patient meets ${metInclusion}/${totalInclusion} inclusion criteria and avoids ${metExclusion}/${totalExclusion} exclusion criteria, with ${unknownInclusion + unknownExclusion} unknown factors. The patient may be eligible, but additional information is needed to confirm.`;
    } else {
      return `Patient only meets ${metInclusion}/${totalInclusion} inclusion criteria and/or avoids ${metExclusion}/${totalExclusion} exclusion criteria, with ${unknownInclusion + unknownExclusion} unknown factors. The patient is likely not eligible for this trial.`;
    }
  };
  
  const retryAnalysis = async (trialId: string) => {
    const trial = trials.find(t => t.nctId === trialId);
    if (trial && patient) {
      await analyzeEligibility(trial, patient);
    }
  };
  
  const handleSearchAgain = () => {
    if (!searchTerm) return;
    if (patient) {
      searchTrials(searchTerm, patient);
    }
  };
  
  const renderTypingIndicator = () => {
    return (
      <div className="flex items-center space-x-1 mt-2 animate-pulse">
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Trial Matching | Clinical Trial Matcher</title>
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">Clinical Trial Matcher</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/patient" className="btn-outline mr-2">
                Back to Patient
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Clinical Trials</h2>
            
            <div className="mb-4">
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
                  onClick={handleSearchAgain}
                  disabled={analyzing}
                  className="btn-primary whitespace-nowrap"
                >
                  {analyzing ? 'Searching...' : 'Search Trials'}
                </button>
              </div>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          {analyzing ? (
            <AnalysisLoading />
          ) : trials.length > 0 ? (
            <>
              {allAnalyzed && (
                <EligibilityDashboard trials={trials} isAnalyzing={analyzing} />
              )}
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Matching Clinical Trials ({trials.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trials.map((trial, trialIndex) => (
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
                          {renderTypingIndicator()}
                        </div>
                      ) : (
                        <EligibilityAnalysis 
                          inclusionCriteria={trial.inclusionCriteria}
                          exclusionCriteria={trial.exclusionCriteria}
                          eligibilityScore={trial.eligibilityScore}
                          eligibilityExplanation={trial.eligibilityExplanation}
                          trialId={trial.nctId}
                          onRetry={() => retryAnalysis(trial.nctId)}
                        />
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
            <EmptyResults />
          )}
        </div>
      </main>
    </div>
  );
} 