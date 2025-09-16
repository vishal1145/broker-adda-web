"use client";
import React from "react";
import data from "../data/myaccount.json";

const Leads = () => {
  return (
    <>
      <div className="px-6 sm:px-12 lg:px-32 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="w-full bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Leads / Visitors</h2>
            <div className="space-y-4">
              <div className="rounded-lg p-4 bg-gray-50 hover:bg-green-50 border border-transparent hover:border-green-400 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">John Smith</h4>
                    <p className="text-gray-600 text-sm">Interested in 2BHK Apartment</p>
                    <p className="text-gray-500 text-xs">2 hours ago</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">New Lead</span>
                </div>
              </div>
              <div className="rounded-lg p-4 bg-gray-50 hover:bg-green-50 border border-transparent hover:border-green-400 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Sarah Johnson</h4>
                    <p className="text-gray-600 text-sm">Viewed Villa Property</p>
                    <p className="text-gray-500 text-xs">1 day ago</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Contacted</span>
                </div>
              </div>
              <div className="rounded-lg p-4 bg-gray-50 hover:bg-green-50 border border-transparent hover:border-green-400 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Mike Wilson</h4>
                    <p className="text-gray-600 text-sm">Interested in Commercial Space</p>
                    <p className="text-gray-500 text-xs">3 days ago</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Follow Up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Leads;
