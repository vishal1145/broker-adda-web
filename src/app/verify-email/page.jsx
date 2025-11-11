import { Suspense } from 'react';
import VerifyEmail from './VerifyEmail';

export const metadata = {
  title: 'Verify Email | Email Verification | Broker Gully',
  description: 'Verify your email address to complete your account setup on Broker Gully. Click the verification link sent to your email.',
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <svg className="animate-spin h-12 w-12 text-[#0D542B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmail />
    </Suspense>
  );
}

