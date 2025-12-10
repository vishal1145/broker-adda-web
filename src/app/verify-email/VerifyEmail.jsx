'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        toast.error('Verification token is missing. Please check your email link.');
        setTimeout(() => router.push('/settings'), 2000);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ;
        const apiEndpoint = `${apiUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const responseData = await response.json().catch(() => ({}));
        if (response.ok) {
          toast.success('Email verified successfully!', {
            duration: 2000,
          });
          
          // Redirect immediately
          router.push('/settings');
        } else {
          const errorMsg = responseData?.message || responseData?.error || 'Email verification failed. The link may be invalid or expired.';
          toast.error(errorMsg, {
            duration: 3000,
          });
          
          // Redirect to settings after showing error
          setTimeout(() => {
            router.push('/settings');
          }, 3000);
        }
      } catch (err) {
        toast.error('An error occurred while verifying your email. Please try again.', {
          duration: 3000,
        });
        
        // Redirect to settings after showing error
        setTimeout(() => {
          router.push('/settings');
        }, 3000);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  // Show minimal loading state while verifying
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="text-center">
        <div className="inline-block mb-4">
          <svg className="animate-spin h-12 w-12 text-[#0D542B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-600">Verifying your email...</p>
      </div>
    </div>
  );
};

export default VerifyEmail;

