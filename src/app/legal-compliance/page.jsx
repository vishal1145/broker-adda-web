"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LegalComplianceRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual legal compliance page
    router.replace('/help/legal-compliance');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to legal compliance guide...</p>
      </div>
    </div>
  );
};

export default LegalComplianceRedirect;
