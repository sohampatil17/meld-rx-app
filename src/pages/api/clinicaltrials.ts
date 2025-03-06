import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

type Data = {
  studies: any[];
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Extract the search term from the query parameters
  const termString = req.query.term as string;

  // Validate that a search term was provided
  if (!termString) {
    return res.status(400).json({
      success: false,
      studies: [],
      error: 'No search term provided',
    });
  }

  try {
    // Make a request to the ClinicalTrials.gov API v2 with the correct parameters
    const response = await axios.get(
      `https://clinicaltrials.gov/api/v2/studies?query.term=${termString}&filter.overallStatus=RECRUITING&pageSize=20`
    );

    // Return the studies data
    return res.status(200).json({
      success: true,
      studies: response.data.studies,
    });
  } catch (error) {
    console.error('Error fetching data from ClinicalTrials.gov API:', error);

    // Attempt a fallback approach with a simpler request
    try {
      console.log('Attempting fallback approach with simpler request...');
      const fallbackResponse = await axios.get(
        `https://clinicaltrials.gov/api/v2/studies?query.term=${termString}&pageSize=5`
      );

      return res.status(200).json({
        success: true,
        studies: fallbackResponse.data.studies,
      });
    } catch (fallbackError) {
      console.error('Fallback approach also failed:', fallbackError);

      // Return demo data if both approaches fail
      return res.status(200).json({
        success: false,
        studies: [
          {
            protocolSection: {
              identificationModule: {
                nctId: 'NCT00000000',
                orgStudyIdInfo: {
                  id: 'DEMO-STUDY',
                },
                organization: {
                  fullName: 'Demo Organization',
                  class: 'OTHER',
                },
                briefTitle: 'Demo Clinical Trial for Testing',
                officialTitle:
                  'This is a Demo Clinical Trial for Testing Purposes Only',
              },
              statusModule: {
                statusVerifiedDate: '2023-01-01',
                overallStatus: 'RECRUITING',
                expandedAccessInfo: {
                  hasExpandedAccess: false,
                },
                startDateStruct: {
                  date: '2023-01-01',
                  type: 'ACTUAL',
                },
                primaryCompletionDateStruct: {
                  date: '2024-01-01',
                  type: 'ANTICIPATED',
                },
                completionDateStruct: {
                  date: '2024-06-01',
                  type: 'ANTICIPATED',
                },
              },
              descriptionModule: {
                briefSummary:
                  'This is a demo clinical trial for testing purposes only. It does not represent a real study.',
                detailedDescription:
                  'This demo trial is provided as a fallback when the API is unavailable.',
              },
              conditionsModule: {
                conditions: ['Demo Condition'],
              },
              eligibilityModule: {
                eligibilityCriteria:
                  'Inclusion Criteria:\n- Age 18 or older\n\nExclusion Criteria:\n- None',
                healthyVolunteers: true,
                sex: 'ALL',
                minimumAge: '18 Years',
                maximumAge: 'N/A',
              },
              contactsLocationsModule: {
                locations: [
                  {
                    facility: 'Demo Facility',
                    status: 'RECRUITING',
                    city: 'Demo City',
                    state: 'Demo State',
                    zip: '12345',
                    country: 'United States',
                  },
                ],
              },
            },
          },
        ],
        error: 'Error fetching data from ClinicalTrials.gov API',
      });
    }
  }
} 