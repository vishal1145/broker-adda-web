'use client';

import React, { useEffect, useState } from 'react';
import PropertiesComponent from './components/PropertiesComponent';
import LeadsComponent from './components/LeadsComponent';
import BrokersComponent from './components/BrokersComponent';
import HeaderFile from '../components/Header';

const Search = () => {
  const [activeTab, setActiveTab] = useState('brokers');
  const [searchQuery, setSearchQuery] = useState('');

  // Read query param without useSearchParams to avoid Suspense requirement
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const t = sp.get('tab');
      if (t === 'leads' || t === 'brokers' || t === 'properties') {
        setActiveTab(t);
      }
      // Only set search query if regionId is not present (regionId takes precedence)
      const regionId = sp.get('regionId');
      if (!regionId) {
        const q = sp.get('q');
        if (q) {
          setSearchQuery(q);
        }
      } else {
        // Clear search query when regionId is present
        setSearchQuery('');
      }
    } catch {}
  }, []);

  // Listen for URL changes (back/forward buttons)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      try {
        const sp = new URLSearchParams(window.location.search);
        const t = sp.get('tab');
        if (t === 'leads' || t === 'brokers' || t === 'properties') {
          setActiveTab(t);
        }
        // Only set search query if regionId is not present (regionId takes precedence)
        const regionId = sp.get('regionId');
        if (!regionId) {
          const q = sp.get('q');
          if (q) {
            setSearchQuery(q);
          } else {
            setSearchQuery('');
          }
        } else {
          setSearchQuery('');
        }
      } catch {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url);
    }
  };

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
        return <BrokersComponent activeTab={activeTab} setActiveTab={setActiveTab} initialSearchQuery={searchQuery} />;
      default:
        return <PropertiesComponent activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <HeaderFile data={{
        title: 'Search',
        breadcrumb: [
          { label: 'Home', href: '/' },
          { label: 'Search', href: '/search' }
        ]
      }} />

      <div className="w-full mx-auto  py-8">
        {/* Render Active Component */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Search;
