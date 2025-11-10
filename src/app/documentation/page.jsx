"use client";

export const metadata = {
  title: 'Documentation | Help & Documentation | Broker Gully',
  description: 'Access comprehensive documentation and help guides for Broker Gully. Learn how to use all features and get the most out of the platform.',
};

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DocumentationRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the actual documentation page
    router.replace('/help/documentation');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to documentation...</p>
      </div>
    </div>
  );
};

export default DocumentationRedirect;
