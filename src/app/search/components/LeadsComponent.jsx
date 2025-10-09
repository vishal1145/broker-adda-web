'use client';

import React, { useState } from 'react';
import Select from 'react-select';

const LeadsComponent = () => {
  const [leadFilters, setLeadFilters] = useState({
    leadStatus: ['Open', 'In Progress'],
    leadType: ['Buy', 'Rent'],
    budgetRange: [5000000, 15000000],
    location: '',
    dateAdded: {
      start: '2024-06-01',
      end: ''
    },
    brokerAgent: '',
    priority: ['High']
  });

  const [sortBy, setSortBy] = useState('date-added-newest');

  const leadStatusOptions = ['Open', 'In Progress', 'Closed'];
  const leadTypeOptions = ['Buy', 'Rent', 'Sell', 'Commercial', 'Residential'];
  const priorityOptions = ['High', 'Medium', 'Low'];

  const reactSelectStyles = {
    control: (base) => ({
      ...base,
      borderColor: '#d1d5db',
      boxShadow: 'none',
      minHeight: 38,
      ':hover': { borderColor: '#0A421E' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#0A421E'
        : state.isFocused
          ? '#ECFDF5'
          : 'white',
      color: state.isSelected ? 'white' : '#111827'
    }),
    singleValue: (base) => ({ ...base, color: '#111827' }),
    placeholder: (base) => ({ ...base, color: '#6b7280' }),
    indicatorSeparator: () => ({ display: 'none' })
  };

  const leads = [
    {
      id: 1,
      name: 'Neha Kapoor',
      profileImage: '/images/user-1.webp',
      status: 'Open',
      type: 'Buy',
      budget: '$5,500,000',
      phone: '+91 98765 11001',
      email: 'neha.kapoor@email.com',
      updated: '2024-07-20',
      regions: ['Delhi NCR', 'Riverside', 'Green Hills']
    },
    {
      id: 2,
      name: 'Rohan Desai',
      profileImage: '/images/user-2.jpeg',
      status: 'In Progress',
      type: 'Sell',
      budget: '$8,200,000',
      phone: '+91 98765 11002',
      email: 'rohan.desai@email.com',
      updated: '2024-07-19',
      regions: ['Uptown', 'Industrial Park']
    },
    {
      id: 3,
      name: 'Aarav Mehta',
      profileImage: '/images/user-3.jpeg',
      status: 'Open',
      type: 'Rent',
      budget: '$3,000/month',
      phone: '+91 98765 11003',
      email: 'aarav.mehta@email.com',
      updated: '2024-07-18',
      regions: ['Suburbia West', 'City Center']
    },
    {
      id: 4,
      name: 'Isha Verma',
      profileImage: '/images/user-4.jpeg',
      status: 'Closed',
      type: 'Commercial',
      budget: '$15,000,000',
      phone: '+91 98765 11004',
      email: 'isha.verma@email.com',
      updated: '2024-07-17',
      regions: ['Business District']
    },
    {
      id: 5,
      name: 'Sneha Nair',
      profileImage: '/images/user-5.jpeg',
      status: 'Open',
      type: 'Buy',
      budget: '$7,100,000',
      phone: '+91 98765 11005',
      email: 'sneha.nair@email.com',
      updated: '2024-07-16',
      regions: ['Midtown', 'Parkside']
    },
    {
      id: 6,
      name: 'Vikram Singh',
      profileImage: '/images/user-6.jpg',
      status: 'In Progress',
      type: 'Residential',
      budget: '$9,800,000',
      phone: '+91 98765 11006',
      email: 'vikram.singh@email.com',
      updated: '2024-07-15',
      regions: ['Lakeview', 'Mountain Crest']
    },
    {
      id: 7,
      name: 'Ananya Iyer',
      profileImage: '/images/user-7.jpeg',
      status: 'Open',
      type: 'Rent',
      budget: '$2,500/month',
      phone: '+91 98765 11007',
      email: 'ananya.iyer@email.com',
      updated: '2024-07-14',
      regions: ['Westside', 'Downtown']
    },
    {
      id: 8,
      name: 'Karan Gupta',
      profileImage: '/images/user-1.webp',
      status: 'In Progress',
      type: 'Sell',
      budget: '$12,300,000',
      phone: '+91 98765 11008',
      email: 'karan.gupta@email.com',
      updated: '2024-07-13',
      regions: ['Eastside', 'Riverside']
    }
  ];

  const handleLeadStatusChange = (status) => {
    setLeadFilters(prev => ({
      ...prev,
      leadStatus: prev.leadStatus.includes(status)
        ? prev.leadStatus.filter(s => s !== status)
        : [...prev.leadStatus, status]
    }));
  };

  const handleLeadTypeChange = (type) => {
    setLeadFilters(prev => ({
      ...prev,
      leadType: prev.leadType.includes(type)
        ? prev.leadType.filter(t => t !== type)
        : [...prev.leadType, type]
    }));
  };

  const handlePriorityChange = (priority) => {
    setLeadFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  const handleLeadBudgetChange = (value) => {
    setLeadFilters(prev => ({
      ...prev,
      budgetRange: [parseInt(value), 20000000]
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-50 text-[#0A421E]';
      case 'In Progress':
        return 'bg-[#ECFDF5] text-[#0A421E]';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex gap-8">
      {/* Filter Sidebar */}
      <div className="w-96 flex-shrink-0">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Filter Options</h2>
          </div>

          {/* Lead Status Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Lead Status</h3>
            <div className="space-y-2">
              {leadStatusOptions.map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={leadFilters.leadStatus.includes(status)}
                    onChange={() => handleLeadStatusChange(status)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="ml-3 text-sm text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lead Type Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Lead Type</h3>
            <div className="space-y-2">
              {leadTypeOptions.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={leadFilters.leadType.includes(type)}
                    onChange={() => handleLeadTypeChange(type)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="ml-3 text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget Range Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Budget Range</h3>
            <div className="mb-3">
              <div className="text-sm text-gray-700">
                {formatPrice(leadFilters.budgetRange[0])} - {formatPrice(leadFilters.budgetRange[1])}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-2 bg-gray-200 rounded-lg relative">
                <div 
                  className="h-2 bg-[#0A421E] rounded-lg absolute top-0"
                  style={{
                    left: `${((leadFilters.budgetRange[0] - 1000000) / (20000000 - 1000000)) * 100}%`,
                    width: `${100 - ((leadFilters.budgetRange[0] - 1000000) / (20000000 - 1000000)) * 100}%`
                  }}
                ></div>
                <input
                  type="range"
                  min="1000000"
                  max="20000000"
                  step="500000"
                  value={leadFilters.budgetRange[0]}
                  onChange={(e) => handleLeadBudgetChange(e.target.value)}
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-single"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                <span>$1M</span>
                <span>$20M</span>
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search locations..."
                value={leadFilters.location}
                onChange={(e) => setLeadFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0A421E]"
              />
              <svg className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Date Added Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Date Added</h3>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="date"
                  value={leadFilters.dateAdded.start}
                  onChange={(e) => setLeadFilters(prev => ({ 
                    ...prev, 
                    dateAdded: { ...prev.dateAdded, start: e.target.value }
                  }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0A421E]"
                />
                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={leadFilters.dateAdded.end}
                  onChange={(e) => setLeadFilters(prev => ({ 
                    ...prev, 
                    dateAdded: { ...prev.dateAdded, end: e.target.value }
                  }))}
                  placeholder="End date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0A421E]"
                />
                <svg className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Broker/Agent Filter (react-select) */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Broker/Agent</h3>
            <Select
              instanceId="leads-agent-select"
              styles={reactSelectStyles}
              options={[
                { value: '', label: 'Select an Agent' },
                { value: 'agent1', label: 'Agent 1' },
                { value: 'agent2', label: 'Agent 2' },
                { value: 'agent3', label: 'Agent 3' }
              ]}
              value={[
                { value: '', label: 'Select an Agent' },
                { value: 'agent1', label: 'Agent 1' },
                { value: 'agent2', label: 'Agent 2' },
                { value: 'agent3', label: 'Agent 3' }
              ].find(o => o.value === leadFilters.brokerAgent) || { value: '', label: 'Select an Agent' }}
              onChange={(opt) => setLeadFilters(prev => ({ ...prev, brokerAgent: (opt?.value || '') }))}
              isSearchable
            />
          </div>

          {/* Priority Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Priority</h3>
            <div className="space-y-2">
              {priorityOptions.map((priority) => (
                <label key={priority} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={leadFilters.priority.includes(priority)}
                    onChange={() => handlePriorityChange(priority)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="ml-3 text-sm text-gray-700">{priority}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Properties Leads</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Showing {leads.length} of {leads.length} results</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sort by:</span>
                <div className="min-w-[220px]">
                  <Select
                    instanceId="leads-sort-select"
                    styles={reactSelectStyles}
                    options={[
                      { value: 'date-added-newest', label: 'Date Added (Newest)' },
                      { value: 'date-added-oldest', label: 'Date Added (Oldest)' },
                      { value: 'name-asc', label: 'Name (A-Z)' },
                      { value: 'name-desc', label: 'Name (Z-A)' },
                      { value: 'budget-high', label: 'Budget (High to Low)' },
                      { value: 'budget-low', label: 'Budget (Low to High)' }
                    ]}
                    value={[
                      { value: 'date-added-newest', label: 'Date Added (Newest)' },
                      { value: 'date-added-oldest', label: 'Date Added (Oldest)' },
                      { value: 'name-asc', label: 'Name (A-Z)' },
                      { value: 'name-desc', label: 'Name (Z-A)' },
                      { value: 'budget-high', label: 'Budget (High to Low)' },
                      { value: 'budget-low', label: 'Budget (Low to High)' }
                    ].find(o => o.value === sortBy)}
                    onChange={(opt) => setSortBy(opt?.value || 'date-added-newest')}
                    isSearchable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              {/* Profile and Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={lead.profileImage}
                    alt={lead.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                  </div>
                </div>
                {lead.status !== 'Open' && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                )}
              </div>

              {/* Lead Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium text-gray-900">{lead.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Budget/Price:</span>
                  <span className="text-sm font-medium text-gray-900">{lead.budget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm font-medium text-gray-900">{lead.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">{lead.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Updated:</span>
                  <span className="text-sm font-medium text-gray-900">{lead.updated}</span>
                </div>
              </div>

              {/* Interested Regions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Interested Regions:</h4>
                <div className="flex flex-wrap gap-1">
                  {lead.regions.map((region, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-[#0A421E] text-white py-2 px-4 rounded-md font-medium hover:bg-[#0b4f24] transition-colors">
                  View Details
                </button>
                <div className="flex justify-end gap-4">
                  {/* Share */}
                  <button aria-label="Share" className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                  {/* Assign/User Plus */}
                  <button aria-label="Assign" className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 8v6" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 11h-6" />
                    </svg>
                  </button>
                  {/* Delete */}
                  <button aria-label="Delete" className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .slider-single {
          background: transparent;
        }
        .slider-single::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #0A421E;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider-single::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #0A421E;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider-single::-webkit-slider-track {
          background: transparent;
        }
        .slider-single::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default LeadsComponent;
