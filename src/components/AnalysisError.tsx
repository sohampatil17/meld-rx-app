import React from 'react';
import Link from 'next/link';

interface AnalysisErrorProps {
  message?: string;
  trialId?: string;
  onRetry?: () => void;
}

const AnalysisError: React.FC<AnalysisErrorProps> = ({ 
  message = "An error occurred during eligibility analysis.", 
  trialId,
  onRetry 
}) => {
  return (
    <div className="mt-4 p-4 bg-red-50 rounded-md border border-red-100">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Eligibility Analysis Error</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          
          <div className="mt-3 flex space-x-2">
            {onRetry && (
              <button 
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry Analysis
              </button>
            )}
            
            {trialId && (
              <Link 
                href={`https://clinicaltrials.gov/study/${trialId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Trial Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisError; 