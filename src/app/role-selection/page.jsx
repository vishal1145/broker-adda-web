"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';

const RoleSelection = () => {
  const router = useRouter();

  const handleProfileTypeSelect = (profileType) => {
    // Store the selected profile type and navigate to profile
    localStorage.setItem('selectedProfileType', profileType);
    router.push('/profile');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Your Profile
            </h1>
            <p className="text-lg text-gray-600">
              Choose your profile type to continue with the setup process
            </p>
          </div>

          {/* Profile Type Selection Cards */}
          <div className="space-y-6">
            {/* Individual Profile Card */}
            <div 
              onClick={() => handleProfileTypeSelect('individual')}
              className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-green-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Individual Icon */}
                  <div className="w-20 h-20  flex items-center justify-center  ">
                    <img 
                      src="/images/Selection.png" 
                      alt="Individual Profile" 
                      className="w-16 h-16 "
                      onError={(e) => {
                        e.currentTarget.src = '/images/user-1.webp';
                      }}
                    />
                   
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Individual Profile
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Personal profile for individual users with basic information and preferences
                    </p>
                    <div className="flex items-center text-green-600 text-xs">
                      <span>Find out more</span>
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Arrow Button */}
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Business Profile Card */}
            <div 
              onClick={() => handleProfileTypeSelect('business')}
              className="bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-green-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Business Icon */}
                  <div className="w-20 h-20flex items-center justify-center ">
                    <img 
                      src="/images/Selection 1.png" 
                      alt="Business Profile" 
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/images/user-1.webp';
                      }}
                    />
                    {/* Small circles around the icon */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="absolute top-1 -right-2 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <div className="absolute -bottom-1 right-1 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Business Profile
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Professional profile for businesses with company information and services
                    </p>
                    <div className="flex items-center text-green-600 text-xs">
                      <span>Find out more</span>
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Arrow Button */}
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
};

export default RoleSelection;
