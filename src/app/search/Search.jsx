'use client';

import React, { useState } from 'react';
import PropertiesComponent from './components/PropertiesComponent';
import LeadsComponent from './components/LeadsComponent';
import BrokersComponent from './components/BrokersComponent';

const Search = () => {
  const [activeTab, setActiveTab] = useState('properties');

  const renderContent = () => {
    switch (activeTab) {
      case 'properties':
        return <PropertiesComponent />;
      case 'leads':
        return <LeadsComponent />;
      case 'brokers':
        return <BrokersComponent />;
      default:
        return <PropertiesComponent />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className=" mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button 
                onClick={() => setActiveTab('properties')}
                className={`py-2 px-1 border-b-2 font-medium ${
                  activeTab === 'properties' 
                    ? 'border-green-900 text-green-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Properties
              </button>
              <button 
                onClick={() => setActiveTab('leads')}
                className={`py-2 px-1 border-b-2 font-medium ${
                  activeTab === 'leads' 
                    ? 'border-green-900 text-green-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leads
              </button>
              <button 
                onClick={() => setActiveTab('brokers')}
                className={`py-2 px-1 border-b-2 font-medium ${
                  activeTab === 'brokers' 
                    ? 'border-green-900 text-green-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Brokers
              </button>
            </nav>
          </div>
        </div>

        {/* Render Active Component */}
        {renderContent()}
      </div>

    </div>
  );
};

export default Search;
