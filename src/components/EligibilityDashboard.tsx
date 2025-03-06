import React from 'react';
import Link from 'next/link';

interface ClinicalTrial {
  nctId: string;
  briefTitle: string;
  status: string;
  phase: string;
  eligibilityScore?: number;
}

interface EligibilityDashboardProps {
  trials: ClinicalTrial[];
  isAnalyzing: boolean;
}

const EligibilityDashboard: React.FC<EligibilityDashboardProps> = ({ trials, isAnalyzing }) => {
  // Filter trials by eligibility
  const eligibleTrials = trials.filter(trial => trial.eligibilityScore !== undefined && trial.eligibilityScore >= 80);
  const possiblyEligibleTrials = trials.filter(trial => trial.eligibilityScore !== undefined && trial.eligibilityScore >= 50 && trial.eligibilityScore < 80);
  const ineligibleTrials = trials.filter(trial => trial.eligibilityScore !== undefined && trial.eligibilityScore < 50);
  const pendingTrials = trials.filter(trial => trial.eligibilityScore === undefined);
  
  // Calculate percentages for the progress bars
  const totalAnalyzed = eligibleTrials.length + possiblyEligibleTrials.length + ineligibleTrials.length;
  const eligiblePercent = totalAnalyzed > 0 ? (eligibleTrials.length / totalAnalyzed) * 100 : 0;
  const possiblyEligiblePercent = totalAnalyzed > 0 ? (possiblyEligibleTrials.length / totalAnalyzed) * 100 : 0;
  const ineligiblePercent = totalAnalyzed > 0 ? (ineligibleTrials.length / totalAnalyzed) * 100 : 0;
  
  if (trials.length === 0) {
    return null;
  }
  
  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Eligibility Summary</h2>
      
      {isAnalyzing ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          <p className="ml-3 text-gray-500">Analyzing trial eligibility...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Eligible Trials</p>
                  <p className="text-2xl font-bold text-green-700">{eligibleTrials.length}</p>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              {eligibleTrials.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Top Match:</p>
                  <Link 
                    href={`#trial-${eligibleTrials[0].nctId}`}
                    className="text-sm font-medium text-green-700 hover:text-green-800 truncate block"
                  >
                    {eligibleTrials[0].briefTitle}
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Possibly Eligible</p>
                  <p className="text-2xl font-bold text-yellow-700">{possiblyEligibleTrials.length}</p>
                </div>
                <div className="bg-yellow-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              {possiblyEligibleTrials.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Top Match:</p>
                  <Link 
                    href={`#trial-${possiblyEligibleTrials[0].nctId}`}
                    className="text-sm font-medium text-yellow-700 hover:text-yellow-800 truncate block"
                  >
                    {possiblyEligibleTrials[0].briefTitle}
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ineligible Trials</p>
                  <p className="text-2xl font-bold text-red-700">{ineligibleTrials.length}</p>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              {ineligibleTrials.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Example:</p>
                  <Link 
                    href={`#trial-${ineligibleTrials[0].nctId}`}
                    className="text-sm font-medium text-red-700 hover:text-red-800 truncate block"
                  >
                    {ineligibleTrials[0].briefTitle}
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 transition-all duration-500 ease-in-out" 
                style={{ width: `${eligiblePercent}%` }}
              ></div>
              <div 
                className="bg-yellow-500 transition-all duration-500 ease-in-out" 
                style={{ width: `${possiblyEligiblePercent}%` }}
              ></div>
              <div 
                className="bg-red-500 transition-all duration-500 ease-in-out" 
                style={{ width: `${ineligiblePercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Eligible: {Math.round(eligiblePercent)}%</span>
              <span>Possibly: {Math.round(possiblyEligiblePercent)}%</span>
              <span>Ineligible: {Math.round(ineligiblePercent)}%</span>
            </div>
          </div>
          
          {pendingTrials.length > 0 && (
            <div className="text-sm text-gray-500 mt-4">
              {pendingTrials.length} trial{pendingTrials.length !== 1 ? 's' : ''} pending analysis
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EligibilityDashboard; 