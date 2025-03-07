import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { 
  FhirPatient, 
  FhirCondition, 
  FhirObservation, 
  FhirMedicationStatement 
} from '@/types/fhir';
import { fhirPatientToAppPatient } from '@/utils/fhir';

type CDSHookResponse = {
  cards: Array<{
    summary: string;
    indicator: 'info' | 'warning' | 'critical' | 'success';
    source: {
      label: string;
      url: string;
    };
    detail: string;
    suggestions?: Array<{
      label: string;
      uuid: string;
      actions: Array<{
        type: string;
        description: string;
        resource?: any;
      }>;
    }>;
    links?: Array<{
      label: string;
      url: string;
      type: string;
      appContext?: string;
    }>;
  }>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CDSHookResponse | any>
) {
  // Set CORS headers to allow access from MeldRx
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Extract prefetched resources from the request
    const { prefetch } = req.body || {};
    
    if (!prefetch || !prefetch.patient) {
      throw new Error('Missing required prefetch data');
    }
    
    // Extract patient data
    const fhirPatient = prefetch.patient as FhirPatient;
    const conditions = prefetch.conditions?.entry?.map((entry: any) => entry.resource) as FhirCondition[] || [];
    const medications = prefetch.medications?.entry?.map((entry: any) => entry.resource) as FhirMedicationStatement[] || [];
    const observations = prefetch.observations?.entry?.map((entry: any) => entry.resource) as FhirObservation[] || [];
    
    // Convert to our app's patient model
    const patient = fhirPatientToAppPatient(fhirPatient, conditions, medications, observations);
    
    // Get condition names for search
    const conditionNames = patient.conditions.map(c => c.name);
    
    // Find potential clinical trials
    let potentialTrials: any[] = [];
    
    // Only search if we have conditions
    if (conditionNames.length > 0) {
      // Use the first condition for the search
      const searchTerm = conditionNames[0];
      
      // Search for trials
      const response = await axios.get('https://clinicaltrials.gov/api/v2/studies', {
        params: {
          'query.term': searchTerm,
          'filter.overallStatus': 'RECRUITING',
          'pageSize': 5
        }
      });
      
      if (response.data && response.data.studies) {
        potentialTrials = response.data.studies;
      }
    }
    
    // Create CDS Hook cards
    const cards: CDSHookResponse['cards'] = [];
    
    // Add a card for the patient
    cards.push({
      summary: `${patient.name} may be eligible for clinical trials`,
      indicator: 'info' as const,
      source: {
        label: 'Clinical Trial Matcher',
        url: 'https://meld-rx-6c9oazvxp-sohams-projects-8ce650e9.vercel.app'
      },
      detail: `Based on ${patient.name}'s medical record, they may be eligible for clinical trials. ${
        patient.conditions.length > 0 
          ? `Relevant conditions: ${patient.conditions.map(c => c.name).join(', ')}.` 
          : ''
      }`,
      links: [
        {
          label: 'Find Matching Trials',
          url: `https://meld-rx-6c9oazvxp-sohams-projects-8ce650e9.vercel.app/launch?patientId=${patient.id}`,
          type: 'absolute',
          appContext: JSON.stringify({ patientId: patient.id })
        }
      ]
    });
    
    // Add cards for potential trials if found
    if (potentialTrials.length > 0) {
      cards.push({
        summary: `${potentialTrials.length} potential clinical trials found`,
        indicator: 'success' as const,
        source: {
          label: 'ClinicalTrials.gov',
          url: 'https://clinicaltrials.gov'
        },
        detail: `Found ${potentialTrials.length} potential clinical trials that may be relevant for this patient. Click "View Trials" to analyze eligibility.`,
        links: [
          {
            label: 'View Trials',
            url: `https://meld-rx-6c9oazvxp-sohams-projects-8ce650e9.vercel.app/launch?patientId=${patient.id}&autoSearch=true`,
            type: 'absolute',
            appContext: JSON.stringify({
              patientId: patient.id,
              autoSearch: true
            })
          }
        ]
      });
    }
    
    res.status(200).json({ cards });
  } catch (error) {
    console.error('CDS Hook error:', error);
    
    // Return a generic error card
    res.status(200).json({
      cards: [
        {
          summary: 'Error finding clinical trials',
          indicator: 'warning' as const,
          source: {
            label: 'Clinical Trial Matcher',
            url: 'https://meld-rx-6c9oazvxp-sohams-projects-8ce650e9.vercel.app'
          },
          detail: 'An error occurred while searching for clinical trials. Please try again later.'
        }
      ]
    });
  }
} 