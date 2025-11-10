"use client";

export const metadata = {
  title: 'My Account | Customer Account | Broker Gully',
  description: 'Manage your customer account on Broker Gully. View your profile, saved properties, and account settings.',
};

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerAccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile since MyAccount is now split into separate pages
    router.push('/profile');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to profile...</p>
      </div>
    </div>
  );
}

