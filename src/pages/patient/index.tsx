import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

// Define FHIR types
interface FHIRPatient {
  id: string;
  resourceType: string;
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
}

interface FHIRCondition {
  resourceType: string;
  id: string;
  clinicalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  code?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
}

interface FHIRMedication {
  resourceType: string;
  id: string;
  status?: string;
  medicationCodeableConcept?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  dosageInstruction?: Array<{
    text?: string;
    doseAndRate?: Array<{
      doseQuantity?: {
        value?: number;
        unit?: string;
      };
    }>;
  }>;
  authoredOn?: string;
}

// Define our app's Patient type
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

export default function PatientPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadPatientData = () => {
      try {
        // Get patient data from session storage
        const patientData = sessionStorage.getItem('fhir_patient');
        const conditionsData = sessionStorage.getItem('fhir_conditions');
        const medicationsData = sessionStorage.getItem('fhir_medications');
        
        if (!patientData) {
          setError('No patient data found. Please launch the app from your EHR.');
          setLoading(false);
          return;
        }
        
        // Parse FHIR data
        const fhirPatient: FHIRPatient = JSON.parse(patientData);
        const fhirConditions = conditionsData ? JSON.parse(conditionsData) : { entry: [] };
        const fhirMedications = medicationsData ? JSON.parse(medicationsData) : { entry: [] };
        
        // Calculate age from birthDate
        const birthDate = fhirPatient.birthDate ? new Date(fhirPatient.birthDate) : null;
        const age = birthDate ? calculateAge(birthDate) : 0;
        
        // Format patient name
        const patientName = formatPatientName(fhirPatient);
        
        // Format conditions
        const conditions = fhirConditions.entry?.map((entry: { resource: FHIRCondition }) => {
          const condition = entry.resource;
          return {
            name: condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown Condition',
            diagnosisDate: condition.onsetDateTime || condition.recordedDate || 'Unknown',
            status: condition.clinicalStatus?.coding?.[0]?.display || 'Unknown'
          };
        }) || [];
        
        // Format medications
        const medications = fhirMedications.entry?.map((entry: { resource: FHIRMedication }) => {
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
        }) || [];
        
        // Create our patient object
        const formattedPatient: Patient = {
          id: fhirPatient.id,
          name: patientName,
          gender: fhirPatient.gender || 'Unknown',
          age: age,
          dateOfBirth: fhirPatient.birthDate || 'Unknown',
          conditions: conditions,
          medications: medications,
          // Default to ECOG 0 (fully active) if not available
          performanceStatus: 'ECOG 0'
        };
        
        setPatient(formattedPatient);
        setLoading(false);
      } catch (err) {
        console.error('Error loading patient data:', err);
        setError(`Failed to load patient data: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };
    
    loadPatientData();
  }, []);
  
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const formatPatientName = (fhirPatient: FHIRPatient): string => {
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
  
  const handleFindTrials = () => {
    if (!patient) return;
    
    // Use the first condition as the search term if no search term is provided
    const term = searchTerm || (patient.conditions.length > 0 ? patient.conditions[0].name : '');
    
    if (!term) {
      setError('Please enter a search term or select a condition.');
      return;
    }
    
    // Navigate to the trials page with the patient data and search term
    router.push({
      pathname: '/patient/trials',
      query: { 
        term,
        patientId: patient.id
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-500">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Patient Dashboard | Clinical Trial Matcher</title>
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary-600">Clinical Trial Matcher</h1>
            </div>
            <div className="flex items-center">
              <Link href="/" className="btn-outline">
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {patient ? (
            <>
              <div className="card mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {patient.name}
                    </h2>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      <span>{patient.gender}</span>
                      <span>•</span>
                      <span>{patient.age} years old</span>
                      <span>•</span>
                      <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                      {patient.performanceStatus && (
                        <>
                          <span>•</span>
                          <span>{patient.performanceStatus}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Conditions</h3>
                  
                  {patient.conditions.length > 0 ? (
                    <div className="space-y-3">
                      {patient.conditions.map((condition, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{condition.name}</h4>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                              {condition.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Diagnosed: {new Date(condition.diagnosisDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No conditions recorded.</p>
                  )}
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Medications</h3>
                  
                  {patient.medications.length > 0 ? (
                    <div className="space-y-3">
                      {patient.medications.map((medication, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-900">{medication.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {medication.dosage} • {medication.frequency}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No medications recorded.</p>
                  )}
                </div>
              </div>
              
              <div className="card mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Clinical Trials</h2>
                
                <div className="mb-4">
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Conditions
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {patient.conditions.map((condition, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchTerm(condition.name)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          searchTerm === condition.name
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {condition.name}
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
                      onClick={handleFindTrials}
                      className="btn-primary whitespace-nowrap"
                    >
                      Find Matching Trials
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patient data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please launch the app from your EHR system to load patient data.
              </p>
              <div className="mt-6">
                <Link href="/" className="btn-primary">
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 