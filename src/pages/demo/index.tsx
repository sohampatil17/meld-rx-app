import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Patient } from '@/types/app';
import ErrorMessage from '@/components/ErrorMessage';

// Sample patient data for demo mode
const samplePatients = [
  {
    id: '1',
    name: 'John Smith',
    gender: 'Male',
    age: 65,
    dateOfBirth: '1958-05-15',
    conditions: [
      { name: 'Non-small Cell Lung Cancer', diagnosisDate: '2022-01-15', status: 'active' },
      { name: 'Hypertension', diagnosisDate: '2015-03-10', status: 'active' },
      { name: 'Type 2 Diabetes', diagnosisDate: '2018-07-22', status: 'active' }
    ],
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    gender: 'Female',
    age: 58,
    dateOfBirth: '1965-11-23',
    conditions: [
      { name: 'Breast Cancer', diagnosisDate: '2021-09-05', status: 'active' },
      { name: 'Osteoporosis', diagnosisDate: '2019-04-18', status: 'active' }
    ],
    medications: [
      { name: 'Anastrozole', dosage: '1mg', frequency: 'Once daily' },
      { name: 'Calcium + Vitamin D', dosage: '600mg/400IU', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 0'
  },
  {
    id: '3',
    name: 'Robert Williams',
    gender: 'Male',
    age: 72,
    dateOfBirth: '1951-08-30',
    conditions: [
      { name: 'Prostate Cancer', diagnosisDate: '2020-12-10', status: 'active' },
      { name: 'Atrial Fibrillation', diagnosisDate: '2017-02-14', status: 'active' },
      { name: 'Chronic Kidney Disease', diagnosisDate: '2019-11-05', status: 'active' }
    ],
    medications: [
      { name: 'Enzalutamide', dosage: '160mg', frequency: 'Once daily' },
      { name: 'Apixaban', dosage: '5mg', frequency: 'Twice daily' }
    ],
    performanceStatus: 'ECOG 2'
  }
];

export default function Demo() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [fhirPatient, setFhirPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we have a patient from FHIR
    const storedPatient = sessionStorage.getItem('patient');
    if (storedPatient) {
      try {
        const parsedPatient = JSON.parse(storedPatient) as Patient;
        setFhirPatient(parsedPatient);
        setSelectedPatient(parsedPatient);
      } catch (err) {
        console.error('Error parsing stored patient:', err);
        setError('Failed to load patient data from session storage.');
      }
    }
    setIsLoading(false);
  }, []);

  const handlePatientSelect = (patient: typeof samplePatients[0]) => {
    setSelectedPatient(patient);
  };

  const handleFindTrials = () => {
    if (!selectedPatient) return;
    
    // Store selected patient in session storage
    sessionStorage.setItem('selectedPatient', JSON.stringify(selectedPatient));
    
    // Navigate to trials page
    router.push({
      pathname: '/demo/trials',
      query: { patientId: selectedPatient.id }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Demo | Clinical Trial Matcher</title>
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">Clinical Trial Matcher</h1>
              </div>
              <div className="ml-4 px-3 py-1 my-auto rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                Demo Mode
              </div>
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
          {error && <ErrorMessage message={error} />}
          
          <div className="card mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Patient</h2>
            
            {fhirPatient ? (
              <div className="mb-6">
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">Patient data loaded from your health record</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="p-4 border border-green-300 rounded-lg bg-white shadow-sm cursor-pointer"
                  onClick={() => setSelectedPatient(fhirPatient)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{fhirPatient.name}</h3>
                      <p className="text-sm text-gray-500">
                        {fhirPatient.gender}, {fhirPatient.age} years old
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      FHIR Patient
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700">Conditions:</h4>
                    <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
                      {fhirPatient.conditions.map((condition, index) => (
                        <li key={index}>{condition.name}</li>
                      )).slice(0, 3)}
                      {fhirPatient.conditions.length > 3 && (
                        <li>+{fhirPatient.conditions.length - 3} more conditions</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Select a sample patient to find matching clinical trials. In a real implementation, this data would come from your EHR system.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {samplePatients.map((patient) => (
                    <div 
                      key={patient.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id 
                          ? 'border-primary-300 bg-primary-50' 
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">
                        {patient.gender}, {patient.age} years old
                      </p>
                      
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700">Conditions:</h4>
                        <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
                          {patient.conditions.map((condition, index) => (
                            <li key={index}>{condition.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button 
                onClick={handleFindTrials}
                disabled={!selectedPatient}
                className={`btn-primary ${!selectedPatient ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Find Matching Trials
              </button>
            </div>
          </div>
          
          {selectedPatient && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedPatient.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedPatient.gender}, {selectedPatient.age} years old (DOB: {selectedPatient.dateOfBirth})
                  </p>
                  
                  {selectedPatient.performanceStatus && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedPatient.performanceStatus}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Conditions:</h4>
                    <ul className="mt-1 space-y-2">
                      {selectedPatient.conditions.map((condition, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium text-gray-900">{condition.name}</span>
                          <div className="text-xs text-gray-500">
                            Diagnosed: {condition.diagnosisDate}
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {condition.status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Medications:</h4>
                  <ul className="mt-1 space-y-2">
                    {selectedPatient.medications.map((medication, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium text-gray-900">{medication.name}</span>
                        <div className="text-xs text-gray-500">
                          {medication.dosage}, {medication.frequency}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
} 