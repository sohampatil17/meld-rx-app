import React from 'react';
import Link from 'next/link';

interface EmptyResultsProps {
  message?: string;
  suggestedAction?: string;
  actionLink?: string;
  actionText?: string;
}

const EmptyResults: React.FC<EmptyResultsProps> = ({
  message = "No clinical trials found.",
  suggestedAction = "Try searching for a different condition or keyword.",
  actionLink = "/demo",
  actionText = "Try Demo with Patient Data"
}) => {
  return (
    <div className="card text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
      <p className="mt-1 text-sm text-gray-500">
        {suggestedAction}
      </p>
      {actionLink && actionText && (
        <div className="mt-6">
          <Link href={actionLink} className="btn-primary">
            {actionText}
          </Link>
        </div>
      )}
    </div>
  );
};

export default EmptyResults; 