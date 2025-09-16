"use client";
import React from "react";
import data from "../data/myaccount.json";
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <div className="px-6 sm:px-12 lg:px-32 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="w-full bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            
            {/* Quick Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Leads</h3>
                <p className="text-3xl font-bold text-green-600">24</p>
                <p className="text-sm text-gray-600">+12% from last month</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Properties Listed</h3>
                <p className="text-3xl font-bold text-blue-600">8</p>
                <p className="text-sm text-gray-600">3 new this week</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Visitors</h3>
                <p className="text-3xl font-bold text-yellow-600">156</p>
                <p className="text-sm text-gray-600">+8% from last week</p>
              </div>
            </div>

         
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
