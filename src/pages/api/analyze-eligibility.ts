import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Define types
interface Patient {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  conditions: Array<{
    name: string;
    code: string;
  }>;
}

interface Trial {
  nctId: string;
  briefTitle: string;
  eligibilityCriteria: string;
}

interface AnalysisResult {
  nctId: string;
  score: number;
  explanation: string;
  inclusionCriteria?: Array<{
    criterion: string;
    met: 'yes' | 'no' | 'unknown';
    explanation: string;
  }>;
  exclusionCriteria?: Array<{
    criterion: string;
    met: 'yes' | 'no' | 'unknown';
    explanation: string;
  }>;
}

interface RequestData {
  patient: Patient;
  trials: Trial[];
}

interface ResponseData {
  results: AnalysisResult[];
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { patient, trials } = req.body as RequestData;

    if (!patient || !trials || !Array.isArray(trials)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Process trials in batches to avoid rate limits
    const batchSize = 5;
    const results: AnalysisResult[] = [];

    for (let i = 0; i < trials.length; i += batchSize) {
      const batch = trials.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(trial => analyzeTrialEligibility(patient, trial))
      );
      results.push(...batchResults);
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Error analyzing eligibility:', error);
    return res.status(500).json({ error: 'Failed to analyze trial eligibility' });
  }
}

async function analyzeTrialEligibility(patient: Patient, trial: Trial): Promise<AnalysisResult> {
  try {
    // Create a prompt for the LLM
    const prompt = `
You are a clinical research coordinator assessing patient eligibility for clinical trials.

PATIENT INFORMATION:
- ID: ${patient.id}
- Name: ${patient.name}
- Gender: ${patient.gender}
- Birth Date: ${patient.birthDate}
- Medical Conditions: ${patient.conditions.map(c => c.name).join(', ')}

CLINICAL TRIAL:
- ID: ${trial.nctId}
- Title: ${trial.briefTitle}

ELIGIBILITY CRITERIA:
${trial.eligibilityCriteria}

Based on the patient information and the trial eligibility criteria, assess if this patient is likely eligible for this clinical trial.
Analyze each inclusion and exclusion criterion and determine if the patient meets it based on the available information.
If there's not enough information to determine eligibility for a specific criterion, note that.

Extract and analyze the key inclusion and exclusion criteria separately. For each criterion:
1. Identify if it's an inclusion or exclusion criterion
2. Determine if the patient meets it (yes), doesn't meet it (no), or if there's not enough information (unknown)
3. Provide a brief explanation for your determination

Then provide an overall assessment of eligibility with a score from 0-100, where:
- 0-30: Patient is clearly ineligible
- 31-50: Patient is likely ineligible
- 51-70: Patient may be eligible but more information is needed
- 71-90: Patient is likely eligible
- 91-100: Patient is clearly eligible

Return your response in JSON format with the following structure:
{
  "score": number,
  "explanation": string,
  "inclusionCriteria": [
    {
      "criterion": string,
      "met": "yes" | "no" | "unknown",
      "explanation": string
    }
  ],
  "exclusionCriteria": [
    {
      "criterion": string,
      "met": "yes" | "no" | "unknown",
      "explanation": string
    }
  ]
}
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a clinical research coordinator with expertise in clinical trial eligibility assessment.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    // Parse the response
    const content = response.choices[0]?.message?.content || '{"score": 0, "explanation": "Failed to analyze eligibility", "inclusionCriteria": [], "exclusionCriteria": []}';
    const analysis = JSON.parse(content);

    return {
      nctId: trial.nctId,
      score: analysis.score,
      explanation: analysis.explanation,
      inclusionCriteria: analysis.inclusionCriteria || [],
      exclusionCriteria: analysis.exclusionCriteria || []
    };
  } catch (error) {
    console.error(`Error analyzing trial ${trial.nctId}:`, error);
    return {
      nctId: trial.nctId,
      score: 0,
      explanation: 'Failed to analyze eligibility due to an error',
      inclusionCriteria: [],
      exclusionCriteria: []
    };
  }
} 