'use client';

import React, { useEffect, useState } from 'react';
import PropertiesComponent from './components/PropertiesComponent';
import LeadsComponent from './components/LeadsComponent';
import BrokersComponent from './components/BrokersComponent';

const Dots = ({ className, style }) => (
  <svg
    width="120"
    height="60"
    viewBox="0 0 120 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    {/* Manually placed circles for a scattered look */}
    <circle cx="10" cy="20" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="25" cy="10" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="40" cy="25" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="60" cy="15" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="80" cy="30" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="100" cy="20" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="20" cy="40" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="35" cy="50" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="55" cy="40" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="75" cy="50" r="5" fill="#E5E7EB" opacity="0.5" />
    {/* More dots for a denser scatter */}
    <circle cx="15" cy="30" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="30" cy="20" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="50" cy="10" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="65" cy="35" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="90" cy="40" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="110" cy="30" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="5" cy="50" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="45" cy="55" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="70" cy="45" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="100" cy="55" r="5" fill="#E5E7EB" opacity="0.5" />
  </svg>
);

const Search = () => {
  const [activeTab, setActiveTab] = useState('brokers');

  // Read query param without useSearchParams to avoid Suspense requirement
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const t = sp.get('tab');
      if (t === 'leads' || t === 'brokers' || t === 'properties') {
        setActiveTab(t);
      }
    } catch {}
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'properties':
        return 'Properties';
      case 'leads':
        return 'Leads';
      case 'brokers':
        return 'Brokers';
      default:
        return 'Search';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'properties':
        return <PropertiesComponent activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'leads':
        return <LeadsComponent activeTab={activeTab} setActiveTab={setActiveTab} />;
      case 'brokers':
        return <BrokersComponent activeTab={activeTab} setActiveTab={setActiveTab} />;
      default:
        return <PropertiesComponent activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Documentation-style Header */}
      <div className="bg-gray-50 py-10 w-screen relative left-1/2 -translate-x-1/2 overflow-x-hidden -mt-2">
        <div className="relative mx-auto flex flex-col items-center text-center">
          {/* Dots - top left */}
          <div className="absolute left-30 top-18">
            <Dots />
          </div>
          {/* Dots - bottom right */}
          <div className="absolute right-30 bottom-18">
            <Dots />
          </div>

          <h1 className="text-3xl font-medium text-gray-900 mb-2">Search</h1>

          {/* Header Tabs */}
          <div className="mt-2">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              <button
                type="button"
                onClick={() => setActiveTab('brokers')}
                className={`${activeTab === 'brokers' ? 'bg-[#0A421E] text-white' : 'text-gray-600 hover:text-gray-800'} px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer`}
              >
                Brokers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('leads')}
                className={`${activeTab === 'leads' ? 'bg-[#0A421E] text-white' : 'text-gray-600 hover:text-gray-800'} px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer`}
              >
                Leads
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('properties')}
                className={`${activeTab === 'properties' ? 'bg-[#0A421E] text-white' : 'text-gray-600 hover:text-gray-800'} px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer`}
              >
                Properties
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto  py-8">
        {/* Render Active Component */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Search;
