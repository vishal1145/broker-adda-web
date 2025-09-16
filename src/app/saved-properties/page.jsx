"use client";
import React, { useState } from "react";
import data from "../data/myaccount.json";
import toast, { Toaster } from "react-hot-toast";

const SavedProperties = () => {
  const [favoriteProperties, setFavoriteProperties] = useState(new Set());

  // Toggle favorite property
  const toggleFavorite = (propertyId) => {
    setFavoriteProperties(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
        toast.success('Removed from favorites');
      } else {
        newFavorites.add(propertyId);
        toast.success('Added to favorites');
      }
      return newFavorites;
    });
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="px-6 sm:px-12 lg:px-32 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="w-full bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src="/images/pexels-binyaminmellish-106399.jpg" alt="Property" className="w-full h-48 object-cover" />
                  <button 
                    onClick={() => toggleFavorite('property-1')}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <svg className={`w-5 h-5 transition-colors ${favoriteProperties.has('property-1') ? 'text-red-500' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Luxury Villa</h3>
                  <p className="text-gray-600 text-sm">3BHK, 2000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹2.5 Cr</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src="/images/istockphoto-1165384568-612x612.jpg" alt="Property" className="w-full h-48 object-cover" />
                  <button 
                    onClick={() => toggleFavorite('property-2')}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <svg className={`w-5 h-5 transition-colors ${favoriteProperties.has('property-2') ? 'text-red-500' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Modern Apartment</h3>
                  <p className="text-gray-600 text-sm">2BHK, 1200 sq ft</p>
                  <p className="text-green-600 font-semibold">₹85 L</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src="/images/realestate2.jpg" alt="Property" className="w-full h-48 object-cover" />
                  <button 
                    onClick={() => toggleFavorite('property-3')}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <svg className={`w-5 h-5 transition-colors ${favoriteProperties.has('property-3') ? 'text-red-500' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Commercial Space</h3>
                  <p className="text-gray-600 text-sm">Office, 5000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹1.2 Cr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SavedProperties;
