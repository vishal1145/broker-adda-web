"use client";
import React from "react";
import data from "../data/myaccount.json";

const PropertiesManagement = () => {
  return (
    <>
      <div className="px-6 sm:px-12 lg:px-32 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="w-full bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Properties / Sites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img src="/images/pexels-binyaminmellish-106399.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Luxury Villa</h3>
                  <p className="text-gray-600 text-sm">3BHK, 2000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹2.5 Cr</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img src="/images/istockphoto-1165384568-612x612.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Modern Apartment</h3>
                  <p className="text-gray-600 text-sm">2BHK, 1200 sq ft</p>
                  <p className="text-green-600 font-semibold">₹85 L</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img src="/images/realestate2.jpg" alt="Property" className="w-full h-48 object-cover" />
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

export default PropertiesManagement;
