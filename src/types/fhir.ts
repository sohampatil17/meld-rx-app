// FHIR R4 Resource Types
export interface FhirResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
  };
}

// FHIR Patient Resource
export interface FhirPatient extends FhirResource {
  resourceType: 'Patient';
  identifier?: Array<{
    system?: string;
    value?: string;
  }>;
  active?: boolean;
  name?: Array<{
    use?: string;
    family?: string;
    given?: string[];
    prefix?: string[];
    suffix?: string[];
    text?: string;
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  gender?: string;
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: Array<{
    use?: string;
    type?: string;
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

// FHIR Condition Resource
export interface FhirCondition extends FhirResource {
  resourceType: 'Condition';
  clinicalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  verificationStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  code?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subject?: {
    reference?: string;
    display?: string;
  };
  onsetDateTime?: string;
  onsetPeriod?: {
    start?: string;
    end?: string;
  };
  recordedDate?: string;
}

// FHIR Observation Resource
export interface FhirObservation extends FhirResource {
  resourceType: 'Observation';
  status?: string;
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  code?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subject?: {
    reference?: string;
    display?: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueCodeableConcept?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
}

// FHIR MedicationStatement Resource
export interface FhirMedicationStatement extends FhirResource {
  resourceType: 'MedicationStatement';
  status?: string;
  medicationCodeableConcept?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  subject?: {
    reference?: string;
    display?: string;
  };
  effectivePeriod?: {
    start?: string;
    end?: string;
  };
  dosage?: Array<{
    text?: string;
    timing?: {
      code?: {
        coding?: Array<{
          system?: string;
          code?: string;
          display?: string;
        }>;
        text?: string;
      };
    };
    doseAndRate?: Array<{
      doseQuantity?: {
        value?: number;
        unit?: string;
        system?: string;
        code?: string;
      };
    }>;
  }>;
}

// FHIR ResearchStudy Resource (for Clinical Trials)
export interface FhirResearchStudy extends FhirResource {
  resourceType: 'ResearchStudy';
  identifier?: Array<{
    system?: string;
    value?: string;
  }>;
  title?: string;
  status?: string;
  phase?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  description?: string;
  enrollment?: Array<{
    reference?: string;
  }>;
  sponsor?: {
    reference?: string;
    display?: string;
  };
  principalInvestigator?: {
    reference?: string;
    display?: string;
  };
  site?: Array<{
    reference?: string;
    display?: string;
  }>;
}

// FHIR Bundle Resource
export interface FhirBundle extends FhirResource {
  resourceType: 'Bundle';
  type: string;
  total?: number;
  entry?: Array<{
    resource: FhirResource;
  }>;
}

// Utility type for FHIR search parameters
export interface FhirSearchParams {
  [key: string]: string | string[] | undefined;
} 