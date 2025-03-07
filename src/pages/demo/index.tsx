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
  },
  {
    id: '4',
    name: 'Emily Chen',
    gender: 'Female',
    age: 45,
    dateOfBirth: '1978-03-12',
    conditions: [
      { name: 'Ovarian Cancer', diagnosisDate: '2023-01-20', status: 'active' },
      { name: 'Anemia', diagnosisDate: '2022-11-05', status: 'active' }
    ],
    medications: [
      { name: 'Paclitaxel', dosage: '175mg/m²', frequency: 'Every 3 weeks' },
      { name: 'Iron Supplement', dosage: '325mg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '5',
    name: 'Michael Rodriguez',
    gender: 'Male',
    age: 61,
    dateOfBirth: '1962-07-28',
    conditions: [
      { name: 'Colorectal Cancer', diagnosisDate: '2022-05-17', status: 'active' },
      { name: 'Hypertension', diagnosisDate: '2010-09-30', status: 'active' }
    ],
    medications: [
      { name: 'FOLFOX Regimen', dosage: 'Standard', frequency: 'Every 2 weeks' },
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    gender: 'Female',
    age: 52,
    dateOfBirth: '1971-11-04',
    conditions: [
      { name: 'Triple-Negative Breast Cancer', diagnosisDate: '2022-08-12', status: 'active' },
      { name: 'Anxiety Disorder', diagnosisDate: '2018-03-22', status: 'active' }
    ],
    medications: [
      { name: 'Doxorubicin', dosage: '60mg/m²', frequency: 'Every 3 weeks' },
      { name: 'Escitalopram', dosage: '10mg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 0'
  },
  {
    id: '7',
    name: 'David Wilson',
    gender: 'Male',
    age: 68,
    dateOfBirth: '1955-02-19',
    conditions: [
      { name: 'Pancreatic Cancer', diagnosisDate: '2023-02-05', status: 'active' },
      { name: 'Type 2 Diabetes', diagnosisDate: '2012-11-30', status: 'active' }
    ],
    medications: [
      { name: 'Gemcitabine', dosage: '1000mg/m²', frequency: 'Weekly' },
      { name: 'Insulin Glargine', dosage: '20 units', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 2'
  },
  {
    id: '8',
    name: 'Jennifer Martinez',
    gender: 'Female',
    age: 41,
    dateOfBirth: '1982-06-15',
    conditions: [
      { name: 'Cervical Cancer', diagnosisDate: '2022-12-03', status: 'active' },
      { name: 'Hypothyroidism', diagnosisDate: '2019-08-17', status: 'active' }
    ],
    medications: [
      { name: 'Cisplatin', dosage: '40mg/m²', frequency: 'Weekly' },
      { name: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '9',
    name: 'Thomas Brown',
    gender: 'Male',
    age: 74,
    dateOfBirth: '1949-09-22',
    conditions: [
      { name: 'Chronic Lymphocytic Leukemia', diagnosisDate: '2021-07-14', status: 'active' },
      { name: 'Coronary Artery Disease', diagnosisDate: '2015-05-11', status: 'active' },
      { name: 'Osteoarthritis', diagnosisDate: '2018-01-23', status: 'active' }
    ],
    medications: [
      { name: 'Ibrutinib', dosage: '420mg', frequency: 'Once daily' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily' },
      { name: 'Acetaminophen', dosage: '500mg', frequency: 'As needed' }
    ],
    performanceStatus: 'ECOG 2'
  },
  {
    id: '10',
    name: 'Maria Garcia',
    gender: 'Female',
    age: 55,
    dateOfBirth: '1968-04-30',
    conditions: [
      { name: 'Endometrial Cancer', diagnosisDate: '2022-10-18', status: 'active' },
      { name: 'Hypertension', diagnosisDate: '2016-12-05', status: 'active' }
    ],
    medications: [
      { name: 'Carboplatin', dosage: 'AUC 5', frequency: 'Every 3 weeks' },
      { name: 'Lisinopril', dosage: '20mg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '11',
    name: 'James Anderson',
    gender: 'Male',
    age: 63,
    dateOfBirth: '1960-01-07',
    conditions: [
      { name: 'Bladder Cancer', diagnosisDate: '2022-11-29', status: 'active' },
      { name: 'GERD', diagnosisDate: '2017-08-14', status: 'active' }
    ],
    medications: [
      { name: 'BCG Therapy', dosage: 'Standard', frequency: 'Weekly' },
      { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '12',
    name: 'Patricia Lee',
    gender: 'Female',
    age: 49,
    dateOfBirth: '1974-12-11',
    conditions: [
      { name: 'Melanoma', diagnosisDate: '2023-03-08', status: 'active' },
      { name: 'Migraine', diagnosisDate: '2015-10-22', status: 'active' }
    ],
    medications: [
      { name: 'Pembrolizumab', dosage: '200mg', frequency: 'Every 3 weeks' },
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed' }
    ],
    performanceStatus: 'ECOG 0'
  },
  {
    id: '13',
    name: 'Richard Taylor',
    gender: 'Male',
    age: 70,
    dateOfBirth: '1953-05-25',
    conditions: [
      { name: 'Multiple Myeloma', diagnosisDate: '2022-04-16', status: 'active' },
      { name: 'Chronic Kidney Disease', diagnosisDate: '2020-09-03', status: 'active' }
    ],
    medications: [
      { name: 'Lenalidomide', dosage: '25mg', frequency: 'Days 1-21 of 28-day cycle' },
      { name: 'Dexamethasone', dosage: '40mg', frequency: 'Once weekly' }
    ],
    performanceStatus: 'ECOG 2'
  },
  {
    id: '14',
    name: 'Susan White',
    gender: 'Female',
    age: 57,
    dateOfBirth: '1966-08-19',
    conditions: [
      { name: 'Follicular Lymphoma', diagnosisDate: '2022-07-22', status: 'active' },
      { name: 'Hypothyroidism', diagnosisDate: '2014-11-08', status: 'active' }
    ],
    medications: [
      { name: 'Rituximab', dosage: '375mg/m²', frequency: 'Weekly' },
      { name: 'Levothyroxine', dosage: '100mcg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '15',
    name: 'Joseph Clark',
    gender: 'Male',
    age: 66,
    dateOfBirth: '1957-10-03',
    conditions: [
      { name: 'Renal Cell Carcinoma', diagnosisDate: '2022-09-14', status: 'active' },
      { name: 'Hypertension', diagnosisDate: '2013-06-27', status: 'active' }
    ],
    medications: [
      { name: 'Sunitinib', dosage: '50mg', frequency: '4 weeks on, 2 weeks off' },
      { name: 'Hydrochlorothiazide', dosage: '25mg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '16',
    name: 'Elizabeth Scott',
    gender: 'Female',
    age: 53,
    dateOfBirth: '1970-03-28',
    conditions: [
      { name: 'Ovarian Cancer', diagnosisDate: '2022-06-11', status: 'active' },
      { name: 'Depression', diagnosisDate: '2018-12-05', status: 'active' }
    ],
    medications: [
      { name: 'Paclitaxel', dosage: '175mg/m²', frequency: 'Every 3 weeks' },
      { name: 'Carboplatin', dosage: 'AUC 6', frequency: 'Every 3 weeks' },
      { name: 'Sertraline', dosage: '50mg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '17',
    name: 'Charles Harris',
    gender: 'Male',
    age: 59,
    dateOfBirth: '1964-07-16',
    conditions: [
      { name: 'Esophageal Cancer', diagnosisDate: '2023-01-09', status: 'active' },
      { name: 'GERD', diagnosisDate: '2016-04-22', status: 'active' }
    ],
    medications: [
      { name: '5-Fluorouracil', dosage: '1000mg/m²', frequency: 'Continuous infusion' },
      { name: 'Cisplatin', dosage: '75mg/m²', frequency: 'Every 3 weeks' },
      { name: 'Pantoprazole', dosage: '40mg', frequency: 'Twice daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '18',
    name: 'Margaret Young',
    gender: 'Female',
    age: 71,
    dateOfBirth: '1952-02-14',
    conditions: [
      { name: 'Diffuse Large B-Cell Lymphoma', diagnosisDate: '2022-08-30', status: 'active' },
      { name: 'Atrial Fibrillation', diagnosisDate: '2019-05-17', status: 'active' }
    ],
    medications: [
      { name: 'R-CHOP Regimen', dosage: 'Standard', frequency: 'Every 3 weeks' },
      { name: 'Apixaban', dosage: '5mg', frequency: 'Twice daily' }
    ],
    performanceStatus: 'ECOG 2'
  },
  {
    id: '19',
    name: 'Daniel Lewis',
    gender: 'Male',
    age: 47,
    dateOfBirth: '1976-09-08',
    conditions: [
      { name: 'Glioblastoma', diagnosisDate: '2022-12-15', status: 'active' },
      { name: 'Seizure Disorder', diagnosisDate: '2023-01-05', status: 'active' }
    ],
    medications: [
      { name: 'Temozolomide', dosage: '150mg/m²', frequency: 'Days 1-5 of 28-day cycle' },
      { name: 'Levetiracetam', dosage: '500mg', frequency: 'Twice daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '20',
    name: 'Karen Walker',
    gender: 'Female',
    age: 62,
    dateOfBirth: '1961-11-19',
    conditions: [
      { name: 'Metastatic Breast Cancer', diagnosisDate: '2021-10-07', status: 'active' },
      { name: 'Osteoporosis', diagnosisDate: '2018-07-14', status: 'active' }
    ],
    medications: [
      { name: 'Palbociclib', dosage: '125mg', frequency: 'Days 1-21 of 28-day cycle' },
      { name: 'Letrozole', dosage: '2.5mg', frequency: 'Once daily' },
      { name: 'Alendronate', dosage: '70mg', frequency: 'Once weekly' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '21',
    name: 'Christopher Allen',
    gender: 'Male',
    age: 54,
    dateOfBirth: '1969-06-23',
    conditions: [
      { name: 'Hepatocellular Carcinoma', diagnosisDate: '2022-11-12', status: 'active' },
      { name: 'Hepatitis C', diagnosisDate: '2010-03-18', status: 'active' },
      { name: 'Cirrhosis', diagnosisDate: '2018-09-25', status: 'active' }
    ],
    medications: [
      { name: 'Sorafenib', dosage: '400mg', frequency: 'Twice daily' },
      { name: 'Spironolactone', dosage: '100mg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 2'
  },
  {
    id: '22',
    name: 'Nancy Green',
    gender: 'Female',
    age: 48,
    dateOfBirth: '1975-04-11',
    conditions: [
      { name: 'Hodgkin Lymphoma', diagnosisDate: '2023-02-18', status: 'active' },
      { name: 'Asthma', diagnosisDate: '2005-08-30', status: 'active' }
    ],
    medications: [
      { name: 'ABVD Regimen', dosage: 'Standard', frequency: 'Every 2 weeks' },
      { name: 'Albuterol', dosage: '90mcg', frequency: 'As needed' },
      { name: 'Fluticasone', dosage: '250mcg', frequency: 'Twice daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '23',
    name: 'Paul King',
    gender: 'Male',
    age: 69,
    dateOfBirth: '1954-12-05',
    conditions: [
      { name: 'Chronic Myeloid Leukemia', diagnosisDate: '2021-05-20', status: 'active' },
      { name: 'Type 2 Diabetes', diagnosisDate: '2011-10-14', status: 'active' },
      { name: 'Hypertension', diagnosisDate: '2009-07-22', status: 'active' }
    ],
    medications: [
      { name: 'Imatinib', dosage: '400mg', frequency: 'Once daily' },
      { name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }
    ],
    performanceStatus: 'ECOG 1'
  },
  {
    id: '24',
    name: 'Sandra Hill',
    gender: 'Female',
    age: 51,
    dateOfBirth: '1972-08-27',
    conditions: [
      { name: 'Recurrent Glioblastoma', diagnosisDate: '2022-03-15', status: 'active' },
      { name: 'Seizure Disorder', diagnosisDate: '2022-04-02', status: 'active' }
    ],
    medications: [
      { name: 'Bevacizumab', dosage: '10mg/kg', frequency: 'Every 2 weeks' },
      { name: 'Dexamethasone', dosage: '4mg', frequency: 'Twice daily' },
      { name: 'Levetiracetam', dosage: '1000mg', frequency: 'Twice daily' }
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
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Demographics
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Conditions
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {samplePatients.map((patient) => (
                        <tr 
                          key={patient.id} 
                          className={`hover:bg-gray-50 transition-colors ${
                            selectedPatient?.id === patient.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">ID: {patient.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{patient.gender}, {patient.age} years</div>
                            <div className="text-sm text-gray-500">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {patient.conditions.map((condition, idx) => (
                                <div key={idx} className="mb-1">
                                  {condition.name}
                                </div>
                              )).slice(0, 2)}
                              {patient.conditions.length > 2 && (
                                <div className="text-xs text-gray-500">+{patient.conditions.length - 2} more</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {patient.performanceStatus && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {patient.performanceStatus}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handlePatientSelect(patient)}
                              className={`text-primary-600 hover:text-primary-900 ${
                                selectedPatient?.id === patient.id ? 'font-bold' : ''
                              }`}
                            >
                              {selectedPatient?.id === patient.id ? 'Selected' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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