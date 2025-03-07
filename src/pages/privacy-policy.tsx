import React from 'react';
import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Privacy Policy | Clinical Trial Matcher</title>
        <meta name="description" content="Privacy Policy for Clinical Trial Matcher" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-700">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
          <p>Clinical Trial Matcher ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
          <p>We collect information through your healthcare provider's electronic health record (EHR) system when you use our application. This may include:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Personal identifiers (name, date of birth, etc.)</li>
            <li>Medical information (diagnoses, medications, lab results, etc.)</li>
            <li>Demographic information (age, gender, etc.)</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Match you with relevant clinical trials based on your medical profile</li>
            <li>Provide you with information about clinical trials you may be eligible for</li>
            <li>Improve our application and services</li>
            <li>Comply with legal obligations</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">4. HIPAA Compliance</h2>
          <p>Our application is designed to be compliant with the Health Insurance Portability and Accountability Act (HIPAA). We implement appropriate technical, administrative, and physical safeguards to protect the confidentiality, integrity, and availability of your protected health information (PHI).</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">5. Data Retention</h2>
          <p>We retain your information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">6. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>Your healthcare providers</li>
            <li>Service providers who help us operate our application</li>
            <li>Legal authorities when required by law</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">7. Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, such as:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>The right to access your personal information</li>
            <li>The right to correct inaccurate information</li>
            <li>The right to request deletion of your information</li>
            <li>The right to restrict or object to processing</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">8. Children's Privacy</h2>
          <p>Our application is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">9. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3">10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us.</p>
        </div>
      </div>
    </div>
  );
} 