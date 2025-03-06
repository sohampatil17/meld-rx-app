# Clinical Trial Matcher

A SMART on FHIR application for matching patients with eligible clinical trials using AI-powered eligibility analysis.

## Overview

Clinical Trial Matcher helps healthcare providers find appropriate clinical trials for their patients by:

1. Securely accessing patient data from EHR systems using SMART on FHIR standards
2. Searching for relevant clinical trials from ClinicalTrials.gov based on patient conditions
3. Analyzing patient eligibility for each trial using AI to provide detailed explanations
4. Presenting a dashboard of eligible trials with confidence scores and detailed criteria analysis

## Features

- **SMART on FHIR Integration**: Securely access patient data from EHR systems
- **AI-Powered Eligibility Analysis**: Analyze patient eligibility for clinical trials with detailed explanations
- **Real-time Trial Matching**: Find relevant clinical trials from ClinicalTrials.gov
- **Interactive Eligibility Dashboard**: Visualize eligibility results with detailed breakdowns
- **CDS Hooks Integration**: Suggest relevant clinical trials directly within EHR workflows

## MeldRx Integration

This application is designed to work with the MeldRx platform for the Predictive AI In Healthcare with FHIR® hackathon.

### App Registration on MeldRx

1. Log in to your MeldRx developer account at [app.meldrx.com](https://app.meldrx.com)
2. Navigate to "My Apps" and click "Register New App"
3. Fill in the required fields:
   - **App Name**: Clinical Trial Matcher
   - **App Description**: A SMART on FHIR application that matches patients with eligible clinical trials using AI-powered eligibility analysis.
   - **App URL**: https://clinictrial-matcher.vercel.app
   - **Launch URL**: https://clinictrial-matcher.vercel.app/launch
   - **Redirect URL**: https://clinictrial-matcher.vercel.app/launch/callback
   - **Logo URL**: https://clinictrial-matcher.vercel.app/logo.png
   - **Scopes**: launch/patient patient/*.read openid fhirUser
   - **FHIR Version**: R4
   - **Client Type**: Public
   - **Grant Type**: Authorization Code

### SMART on FHIR Configuration

The application includes the necessary SMART on FHIR configuration files:

- `public/smart-configuration.json`: SMART on FHIR manifest file
- `public/.well-known/smart-configuration.json`: Well-known SMART configuration
- `public/cds-services.json`: CDS Hooks service definition

### CDS Hooks Integration

The application provides a CDS Hooks service that can be triggered from EHR workflows:

- **Service ID**: clinical-trial-matcher
- **Hook**: patient-view
- **Endpoint**: /api/cds-services/clinical-trial-matcher

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/clinictrial.git
cd clinictrial

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Testing with SMART on FHIR

You can test the application with the SMART on FHIR sandbox:

1. Visit [https://launch.smarthealthit.org/](https://launch.smarthealthit.org/)
2. Select a patient
3. Launch the app with the following URL: `https://clinictrial-matcher.vercel.app/launch`

## Deployment

The application is deployed on Vercel. To deploy your own instance:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- ClinicalTrials.gov for providing the API
- MeldRx for the integration platform
- SMART Health IT for the FHIR client libraries 