import type { NextApiRequest, NextApiResponse } from 'next';

type CDSServicesResponse = {
  services: Array<{
    hook: string;
    title: string;
    description: string;
    id: string;
    prefetch: {
      [key: string]: string;
    };
  }>;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CDSServicesResponse>
) {
  // Return the CDS services discovery response
  res.status(200).json({
    services: [
      {
        hook: "patient-view",
        title: "Clinical Trial Matcher",
        description: "Suggests clinical trials that the patient may be eligible for based on their medical record",
        id: "clinical-trial-matcher",
        prefetch: {
          patient: "Patient/{{context.patientId}}",
          conditions: "Condition?patient={{context.patientId}}",
          observations: "Observation?patient={{context.patientId}}",
          medications: "MedicationStatement?patient={{context.patientId}}"
        }
      }
    ]
  });
} 