// Application-specific types

// Criterion for eligibility analysis
export interface Criterion {
  criterion: string;
  met: 'yes' | 'no' | 'unknown';
  explanation: string;
}

// Clinical Trial model
export interface ClinicalTrial {
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

// Patient model
export interface Patient {
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