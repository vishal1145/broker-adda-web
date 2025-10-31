'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContentLoader from 'react-content-loader';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated, isBroker, isCustomer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!isAuthenticated()) {
      console.log('ProtectedRoute: User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    // Check role-specific access
    if (requiredRole === 'broker' && !isBroker()) {
      console.log('ProtectedRoute: User is not a broker, redirecting to login');
      router.push('/login');
      return;
    }

    if (requiredRole === 'customer' && !isCustomer()) {
      console.log('ProtectedRoute: User is not a customer, redirecting to login');
      router.push('/login');
      return;
    }
  }, [user, loading, isAuthenticated, isBroker, isCustomer, requiredRole, router]);

  // Show loading skeleton while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="w-full mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left column - 9/12 width for property cards */}
              <div className="w-full lg:w-9/12">
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="flex">
                        {/* Image Section - Left */}
                        <div className="relative w-[400px] h-[300px] flex-shrink-0">
                          <ContentLoader
                            speed={2}
                            width={400}
                            height={300}
                            viewBox="0 0 400 300"
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                            style={{ width: '100%', height: '100%' }}
                          >
                            {/* Main image */}
                            <rect x="0" y="0" rx="12" ry="12" width="400" height="300" />
                            {/* Tag overlay - top-left */}
                            <rect x="16" y="16" rx="12" ry="12" width="100" height="24" />
                            {/* Rating - top-right */}
                            <circle cx="368" cy="24" r="16" />
                            {/* Price pill - bottom-left */}
                            <rect x="16" y="260" rx="16" ry="16" width="150" height="28" />
                            {/* Share button - bottom-right */}
                            <circle cx="368" cy="276" r="20" />
                          </ContentLoader>
                        </div>
                        
                        {/* Details Section - Right */}
                        <div className="flex-1 p-6 flex flex-col">
                          <ContentLoader
                            speed={2}
                            width={600}
                            height={300}
                            viewBox="0 0 600 300"
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                            style={{ width: '100%', height: '100%' }}
                          >
                            {/* Title with verified icon */}
                            <rect x="0" y="0" rx="4" ry="4" width="250" height="20" />
                            <circle cx="265" cy="10" r="7" />
                            
                            {/* Description */}
                            <rect x="0" y="32" rx="4" ry="4" width="418" height="12" />
                            <rect x="0" y="50" rx="4" ry="4" width="400" height="12" />
                            <rect x="0" y="68" rx="4" ry="4" width="380" height="12" />
                            
                            {/* Location Details */}
                            <circle cx="8" cy="105" r="6" />
                            <rect x="20" y="100" rx="4" ry="4" width="80" height="12" />
                            <circle cx="8" cy="130" r="6" />
                            <rect x="20" y="125" rx="4" ry="4" width="200" height="12" />
                            
                            {/* Features label */}
                            <rect x="0" y="155" rx="4" ry="4" width="60" height="14" />
                            {/* Features chips */}
                            <rect x="0" y="177" rx="16" ry="16" width="70" height="24" />
                            <rect x="80" y="177" rx="16" ry="16" width="70" height="24" />
                            <rect x="160" y="177" rx="16" ry="16" width="80" height="24" />
                            
                            {/* Amenities label */}
                            <rect x="0" y="220" rx="4" ry="4" width="70" height="14" />
                            {/* Amenities chips */}
                            <rect x="0" y="242" rx="12" ry="12" width="60" height="20" />
                            <rect x="70" y="242" rx="12" ry="12" width="70" height="20" />
                            <rect x="150" y="242" rx="12" ry="12" width="80" height="20" />
                          </ContentLoader>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right column - 3/12 width */}
              <div className="w-full lg:w-3/12">
                {/* Tips Section Skeleton */}
                <div className="bg-green-50 rounded-[10px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] border border-gray-200 p-5">
                  <ContentLoader
                    speed={2}
                    width={300}
                    height={280}
                    viewBox="0 0 300 280"
                    backgroundColor="#e0f2e9"
                    foregroundColor="#c8e6d5"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Title */}
                    <rect x="0" y="0" rx="4" ry="4" width="200" height="20" />
                    
                    {/* 3 tip items */}
                    {[0, 1, 2].map((i) => (
                      <React.Fragment key={i}>
                        <circle cx="14" cy={45 + i * 75} r="14" />
                        <rect x="40" y={38 + i * 75} rx="4" ry="4" width="140" height="16" />
                        <rect x="40" y={58 + i * 75} rx="4" ry="4" width="220" height="12" />
                      </React.Fragment>
                    ))}
                  </ContentLoader>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!isAuthenticated()) {
    return null;
  }

  if (requiredRole === 'broker' && !isBroker()) {
    return null;
  }

  if (requiredRole === 'customer' && !isCustomer()) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
