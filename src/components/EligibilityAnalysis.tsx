import { useState, useEffect, useRef } from 'react';
import styles from './EligibilityAnalysis.module.css';

interface Criterion {
  criterion: string;
  met: 'yes' | 'no' | 'unknown';
  explanation: string;
}

interface EligibilityAnalysisProps {
  inclusionCriteria?: Criterion[];
  exclusionCriteria?: Criterion[];
  eligibilityScore?: number;
  eligibilityExplanation?: string;
  trialId: string;
  onRetry?: () => void;
}

const EligibilityAnalysis: React.FC<EligibilityAnalysisProps> = ({
  inclusionCriteria = [],
  exclusionCriteria = [],
  eligibilityScore,
  eligibilityExplanation,
  trialId,
  onRetry
}) => {
  const [visibleInclusionCriteria, setVisibleInclusionCriteria] = useState(0);
  const [visibleExclusionCriteria, setVisibleExclusionCriteria] = useState(0);
  const [showConclusion, setShowConclusion] = useState(false);
  const [showEligibilityBadge, setShowEligibilityBadge] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [earlyTermination, setEarlyTermination] = useState(false);
  const [earlyTerminationReason, setEarlyTerminationReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const criteriaRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  useEffect(() => {
    // Check if there's an error in the eligibility explanation
    if (eligibilityExplanation?.includes("Failed to analyze") || eligibilityExplanation?.includes("error")) {
      setError(eligibilityExplanation);
      setIsAnalyzing(false);
      return;
    }
    
    // Start displaying inclusion criteria one by one
    if (inclusionCriteria.length > 0) {
      let currentCriterion = 0;
      let foundIneligible = false;
      
      const inclusionInterval = setInterval(() => {
        if (currentCriterion < inclusionCriteria.length) {
          setVisibleInclusionCriteria(currentCriterion + 1);
          
          // Check if this criterion makes the patient ineligible
          if (inclusionCriteria[currentCriterion].met === 'no' && !foundIneligible) {
            foundIneligible = true;
            setEarlyTermination(true);
            setEarlyTerminationReason(`Patient does not meet inclusion criterion: "${inclusionCriteria[currentCriterion].criterion}"`);
          }
          
          currentCriterion++;
        } else {
          clearInterval(inclusionInterval);
          
          // After inclusion criteria, start showing exclusion criteria
          if (exclusionCriteria.length > 0) {
            startExclusionCriteriaDisplay();
          } else {
            // If no exclusion criteria, show conclusion
            showConclusionAndBadge();
          }
        }
      }, 1000); // Show a new criterion every 1 second
      
      return () => clearInterval(inclusionInterval);
    } else if (exclusionCriteria.length > 0) {
      // If no inclusion criteria but has exclusion criteria
      startExclusionCriteriaDisplay();
    } else if (eligibilityExplanation) {
      // If no criteria at all but has explanation, show conclusion
      showConclusionAndBadge();
    } else {
      // If no criteria and no explanation, show error
      setError("No eligibility criteria available for analysis.");
      setIsAnalyzing(false);
    }
  }, []);
  
  const startExclusionCriteriaDisplay = () => {
    // Add a small delay before starting exclusion criteria
    setTimeout(() => {
      let currentCriterion = 0;
      
      const exclusionInterval = setInterval(() => {
        if (currentCriterion < exclusionCriteria.length) {
          setVisibleExclusionCriteria(currentCriterion + 1);
          
          // Check if this criterion makes the patient ineligible
          if (exclusionCriteria[currentCriterion].met === 'yes') {
            setEarlyTermination(true);
            setEarlyTerminationReason(`Patient meets exclusion criterion: "${exclusionCriteria[currentCriterion].criterion}"`);
            
            // Stop showing more exclusion criteria
            clearInterval(exclusionInterval);
            showConclusionAndBadge();
            return;
          }
          
          currentCriterion++;
        } else {
          clearInterval(exclusionInterval);
          showConclusionAndBadge();
        }
      }, 1000); // Show a new criterion every 1 second
      
      return () => clearInterval(exclusionInterval);
    }, 800); // Wait a bit before starting exclusion criteria
  };
  
  const showConclusionAndBadge = () => {
    // Short delay before showing conclusion
    setTimeout(() => {
      setShowConclusion(true);
      setIsAnalyzing(false);
      
      // After showing conclusion, show eligibility badge
      setTimeout(() => {
        setShowEligibilityBadge(true);
      }, 1000);
    }, 1000);
  };
  
  const renderTypingIndicator = () => (
    <div className={styles.typingIndicator}>
      <div className={styles.typingDot}></div>
      <div className={styles.typingDot}></div>
      <div className={styles.typingDot}></div>
    </div>
  );
  
  const getEligibilityBadgeClass = () => {
    if (!eligibilityScore) return styles.eligibilityBadgeMedium;
    
    if (eligibilityScore >= 80) {
      return styles.eligibilityBadgeHigh;
    } else if (eligibilityScore >= 50) {
      return styles.eligibilityBadgeMedium;
    } else {
      return styles.eligibilityBadgeLow;
    }
  };
  
  const getEligibilityBadgeText = () => {
    if (!eligibilityScore) return 'Eligibility Unknown';
    
    if (eligibilityScore >= 80) {
      return 'Likely Eligible';
    } else if (eligibilityScore >= 50) {
      return 'Possibly Eligible';
    } else {
      return 'Likely Ineligible';
    }
  };
  
  // If there's an error, show error message
  if (error) {
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
            <p className="mt-1 text-sm text-red-700">{error}</p>
            
            {onRetry && (
              <button 
                onClick={onRetry}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry Analysis
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.eligibilityContainer}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium text-gray-900">
          Eligibility Analysis
        </h4>
        
        {showEligibilityBadge && eligibilityScore !== undefined && (
          <div className={`${styles.eligibilityBadge} ${getEligibilityBadgeClass()}`}>
            {getEligibilityBadgeText()}
          </div>
        )}
      </div>
      
      {inclusionCriteria.length > 0 && (
        <div className={styles.criteriaSection}>
          <h5 className={styles.criteriaTitle}>Inclusion Criteria</h5>
          <div className={styles.criteriaList}>
            {inclusionCriteria.slice(0, visibleInclusionCriteria).map((criterion, index) => (
              <div 
                key={`inc-${index}`} 
                className={styles.criterionItem}
                ref={el => {
                  criteriaRefs.current[`${trialId}-inc-${index}`] = el;
                }}
              >
                <div className={styles.criterionIcon}>
                  {criterion.met === 'yes' ? (
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : criterion.met === 'no' ? (
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className={styles.criterionContent}>
                  <p className={styles.criterionText}>{criterion.criterion}</p>
                  <p className={styles.criterionExplanation}>{criterion.explanation}</p>
                </div>
              </div>
            ))}
            {visibleInclusionCriteria < inclusionCriteria.length && !earlyTermination && renderTypingIndicator()}
          </div>
        </div>
      )}
      
      {exclusionCriteria.length > 0 && (
        <div className={styles.criteriaSection}>
          <h5 className={styles.criteriaTitle}>Exclusion Criteria</h5>
          <div className={styles.criteriaList}>
            {exclusionCriteria.slice(0, visibleExclusionCriteria).map((criterion, index) => (
              <div 
                key={`exc-${index}`} 
                className={styles.criterionItem}
                ref={el => {
                  criteriaRefs.current[`${trialId}-exc-${index}`] = el;
                }}
              >
                <div className={styles.criterionIcon}>
                  {criterion.met === 'no' ? (
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : criterion.met === 'yes' ? (
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className={styles.criterionContent}>
                  <p className={styles.criterionText}>{criterion.criterion}</p>
                  <p className={styles.criterionExplanation}>{criterion.explanation}</p>
                </div>
              </div>
            ))}
            {visibleExclusionCriteria < exclusionCriteria.length && !earlyTermination && renderTypingIndicator()}
          </div>
        </div>
      )}
      
      {earlyTermination && (
        <div className={styles.earlyTermination}>
          <div className="flex items-center mt-4 p-3 bg-red-50 rounded-md">
            <svg className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-700">{earlyTerminationReason}</p>
          </div>
        </div>
      )}
      
      {showConclusion && eligibilityExplanation && (
        <div 
          className={styles.conclusionSection}
          ref={el => {
            criteriaRefs.current[`${trialId}-conclusion`] = el;
          }}
        >
          <h5 className={styles.conclusionTitle}>Conclusion</h5>
          <p className={styles.conclusionText}>{earlyTermination ? earlyTerminationReason : eligibilityExplanation}</p>
        </div>
      )}
      
      {isAnalyzing && 
       visibleInclusionCriteria === inclusionCriteria.length && 
       visibleExclusionCriteria === exclusionCriteria.length && 
       !showConclusion && 
       !earlyTermination &&
       (inclusionCriteria.length > 0 || exclusionCriteria.length > 0) && 
       renderTypingIndicator()}
    </div>
  );
};

export default EligibilityAnalysis; 