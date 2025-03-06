import FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';
import { 
  FhirPatient, 
  FhirCondition, 
  FhirObservation, 
  FhirMedicationStatement,
  FhirResearchStudy,
  FhirBundle
} from '../types/fhir';
import { Patient, ClinicalTrial } from '../types/app';

// Initialize SMART on FHIR client
export const initializeFhirClient = async (): Promise<Client> => {
  try {
    // For EHR Launch
    const client = await FHIR.oauth2.ready();
    return client;
  } catch (error) {
    console.error('Error initializing FHIR client:', error);
    throw error;
  }
};

// Standalone launch
export const launchFhirClient = async (): Promise<void> => {
  try {
    await FHIR.oauth2.authorize({
      clientId: 'clinical-trial-matcher',
      scope: 'launch/patient patient/*.read openid fhirUser',
      redirectUri: window.location.origin + '/launch/callback',
      iss: 'https://launch.smarthealthit.org/v/r4/fhir'
    });
  } catch (error) {
    console.error('Error launching FHIR client:', error);
    throw error;
  }
};

// Convert FHIR Patient to our app's Patient model
export const fhirPatientToAppPatient = (fhirPatient: FhirPatient, conditions: FhirCondition[], medications: FhirMedicationStatement[], observations: FhirObservation[]): Patient => {
  // Extract name
  const name = fhirPatient.name?.[0];
  const fullName = name ? 
    [name.given?.join(' '), name.family].filter(Boolean).join(' ') : 
    'Unknown';
  
  // Extract gender
  const gender = fhirPatient.gender ? 
    fhirPatient.gender.charAt(0).toUpperCase() + fhirPatient.gender.slice(1) : 
    'Unknown';
  
  // Extract age and date of birth
  const birthDate = fhirPatient.birthDate || '';
  const age = birthDate ? calculateAge(birthDate) : 0;
  
  // Extract conditions
  const mappedConditions = conditions.map(condition => ({
    name: condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown Condition',
    diagnosisDate: condition.onsetDateTime || condition.recordedDate || '',
    status: condition.clinicalStatus?.coding?.[0]?.code || 'unknown'
  }));
  
  // Extract medications
  const mappedMedications = medications.map(med => ({
    name: med.medicationCodeableConcept?.text || med.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown Medication',
    dosage: med.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity?.value + ' ' + med.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || '',
    frequency: med.dosage?.[0]?.timing?.code?.text || ''
  }));
  
  // Extract ECOG performance status from observations
  const ecogObservation = observations.find(obs => 
    obs.code?.coding?.some(coding => 
      coding.code === '89247-1' || // LOINC code for ECOG performance status
      coding.display?.toLowerCase().includes('ecog')
    )
  );
  
  const performanceStatus = ecogObservation?.valueInteger !== undefined ? 
    `ECOG ${ecogObservation.valueInteger}` : 
    undefined;
  
  return {
    id: fhirPatient.id || '',
    name: fullName,
    gender,
    age,
    dateOfBirth: birthDate,
    conditions: mappedConditions,
    medications: mappedMedications,
    performanceStatus
  };
};

// Convert ClinicalTrials.gov API response to FHIR ResearchStudy
export const apiTrialToFhirResearchStudy = (apiTrial: any): FhirResearchStudy => {
  return {
    resourceType: 'ResearchStudy',
    identifier: [
      {
        system: 'http://clinicaltrials.gov',
        value: apiTrial.protocolSection?.identificationModule?.nctId || ''
      }
    ],
    title: apiTrial.protocolSection?.identificationModule?.briefTitle || '',
    status: apiTrial.protocolSection?.statusModule?.overallStatus?.toLowerCase() || 'unknown',
    phase: {
      text: apiTrial.protocolSection?.designModule?.phases?.join(', ') || 'N/A'
    },
    description: apiTrial.protocolSection?.descriptionModule?.briefSummary || '',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/research-study-category',
            code: 'clinical-trial',
            display: 'Clinical Trial'
          }
        ]
      }
    ]
  };
};

// Convert FHIR ResearchStudy to our app's ClinicalTrial model
export const fhirResearchStudyToAppTrial = (study: FhirResearchStudy): ClinicalTrial => {
  return {
    nctId: study.identifier?.[0]?.value || '',
    briefTitle: study.title || '',
    briefSummary: study.description || '',
    status: study.status || 'unknown',
    phase: study.phase?.text || 'Not Specified',
    analysisInProgress: false
  };
};

// Helper function to calculate age from birthdate
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Get patient data from FHIR server
export const getPatientData = async (client: Client): Promise<Patient> => {
  try {
    // Get patient resource
    const fhirPatient = await client.patient.read() as FhirPatient;
    
    // Get patient conditions
    const conditionsResponse = await client.patient.request(`Condition?patient=${fhirPatient.id}`) as FhirBundle;
    const conditions = conditionsResponse.entry?.map(entry => entry.resource as FhirCondition) || [];
    
    // Get patient medications
    const medicationsResponse = await client.patient.request(`MedicationStatement?patient=${fhirPatient.id}`) as FhirBundle;
    const medications = medicationsResponse.entry?.map(entry => entry.resource as FhirMedicationStatement) || [];
    
    // Get patient observations
    const observationsResponse = await client.patient.request(`Observation?patient=${fhirPatient.id}`) as FhirBundle;
    const observations = observationsResponse.entry?.map(entry => entry.resource as FhirObservation) || [];
    
    // Convert to our app's patient model
    return fhirPatientToAppPatient(fhirPatient, conditions, medications, observations);
  } catch (error) {
    console.error('Error getting patient data:', error);
    throw error;
  }
}; 