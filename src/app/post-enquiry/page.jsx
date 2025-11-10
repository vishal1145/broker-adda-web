'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PostEnquiryRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to property-enquiry page
    router.replace('/property-enquiry');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d542b] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Property Enquiry...</p>
      </div>
    </div>
  );
}

