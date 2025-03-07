import React from 'react';
import Head from 'next/head';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Terms of Service | Clinical Trial Matcher</title>
        <meta name="description" content="Terms of Service for Clinical Trial Matcher" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-700">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using the Clinical Trial Matcher application ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. Description of Service</h2>
          <p>Clinical Trial Matcher is a healthcare application that helps patients find relevant clinical trials based on their medical records. The app analyzes patient data to identify potential trial matches and provides detailed eligibility information.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. Use of Service</h2>
          <p>The Service is intended to be used as an informational tool only. It does not provide medical advice and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. User Accounts</h2>
          <p>When you use the Service through a healthcare provider's system, you may not need to create a separate account. However, you are responsible for maintaining the confidentiality of your access credentials and for all activities that occur under your credentials.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. Privacy</h2>
          <p>Your use of the Service is also governed by our Privacy Policy, which is incorporated by reference into these Terms.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">6. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Clinical Trial Matcher and its licensors. The Service is protected by copyright, trademark, and other laws.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">7. Disclaimer of Warranties</h2>
          <p>The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee the accuracy, completeness, or usefulness of any information provided through the Service.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">8. Limitation of Liability</h2>
          <p>In no event shall Clinical Trial Matcher, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">9. Changes to Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time. It is your responsibility to review these Terms periodically for changes.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">10. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us.</p>
        </div>
      </div>
    </div>
  );
} 