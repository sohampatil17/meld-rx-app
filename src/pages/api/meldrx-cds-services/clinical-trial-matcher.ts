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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET request (for service discovery/registration)
  if (req.method === 'GET') {
    return res.status(200).json({
      cards: [
        {
          summary: "Clinical Trial Matcher",
          indicator: "info",
          source: {
            label: "Clinical Trial Matcher",
            url: "https://meld-1fge63tsr-sohams-projects-8ce650e9.vercel.app"
          },
          detail: "This is a static response for the clinical-trial-matcher service. In a real implementation, this would contain patient-specific clinical trial recommendations.",
          links: [
            {
              label: "View Matching Trials",
              url: "https://meld-1fge63tsr-sohams-projects-8ce650e9.vercel.app/launch",
              type: "absolute"
            }
          ]
        }
      ]
    });
  }

  // Handle POST request
  if (req.method === 'POST') {
    try {
      // Extract prefetched resources from the request
      const { prefetch } = req.body || {};
      
      if (!prefetch || !prefetch.patient) {
        return res.status(200).json({
          cards: [
            {
              summary: "Missing patient data",
              indicator: "warning",
              source: {
                label: "Clinical Trial Matcher",
                url: "https://meld-1fge63tsr-sohams-projects-8ce650e9.vercel.app"
              },
              detail: "Patient data is required to find matching clinical trials."
            }
          ]
        });
      }
      
      // Extract patient data
      const fhirPatient = prefetch.patient as FhirPatient;
      const conditions = prefetch.conditions?.entry?.map((entry: any) => entry.resource) as FhirCondition[] || [];
      const medications = prefetch.medications?.entry?.map((entry: any) => entry.resource) as FhirMedicationStatement[] || [];
      const observations = prefetch.observations?.entry?.map((entry: any) => entry.resource) as FhirObservation[] || [];
      
      // Convert to our app's patient model
      const patient = fhirPatientToAppPatient(fhirPatient, conditions, medications, observations);
      
      // Create CDS Hook cards
      const cards: CDSHookResponse['cards'] = [];
      
      // Add a card for the patient
      cards.push({
        summary: `${patient.name} may be eligible for clinical trials`,
        indicator: 'info' as const,
        source: {
          label: 'Clinical Trial Matcher',
          url: 'https://meld-1fge63tsr-sohams-projects-8ce650e9.vercel.app'
        },
        detail: `Based on ${patient.name}'s medical record, they may be eligible for clinical trials. ${
          patient.conditions.length > 0 
            ? `Relevant conditions: ${patient.conditions.map(c => c.name).join(', ')}.` 
            : ''
        }`,
        links: [
          {
            label: 'Find Matching Trials',
            url: `https://meld-1fge63tsr-sohams-projects-8ce650e9.vercel.app/launch?patientId=${patient.id}`,
            type: 'absolute',
            appContext: JSON.stringify({ patientId: patient.id })
          }
        ]
      });
      
      return res.status(200).json({ cards });
    } catch (error) {
      console.error('CDS Hook error:', error);
      
      // Return a generic error card
      return res.status(200).json({
        cards: [
          {
            summary: 'Error finding clinical trials',
            indicator: 'warning' as const,
            source: {
              label: 'Clinical Trial Matcher',
              url: 'https://meld-1fge63tsr-sohams-projects-8ce650e9.vercel.app'
            },
            detail: 'An error occurred while searching for clinical trials. Please try again later.'
          }
        ]
      });
    }
  }

  // If we get here, it's an unsupported method
  return res.status(405).json({ 
    cards: [
      {
        summary: 'Method not allowed',
        indicator: 'warning',
        source: {
          label: 'Clinical Trial Matcher',
          url: 'https://meld-1fge63tsr-sohams-projects-8ce650e9.vercel.app'
        },
        detail: 'This endpoint only supports GET, POST, and OPTIONS methods.'
      }
    ]
  });
} 