import React from 'react';

interface AnalysisLoadingProps {
  message?: string;
  subMessage?: string;
}

const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({
  message = "Analyzing trial eligibility for this patient...",
  subMessage = "This may take a minute as we process the eligibility criteria."
}) => {
  return (
    <div className="card text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
      <p className="mt-4 text-gray-500">
        {message}
      </p>
      {subMessage && (
        <p className="text-sm text-gray-400 mt-2">
          {subMessage}
        </p>
      )}
    </div>
  );
};

export default AnalysisLoading; 