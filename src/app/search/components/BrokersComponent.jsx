'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Select, { components } from 'react-select';

const BrokersComponent = ({ activeTab, setActiveTab }) => {
  const router = useRouter();
  const [brokerFilters, setBrokerFilters] = useState({
    region: [],
    experienceRange: [0, 20],
    agency: '',
    brokerType: [],
    ratingRange: [4, 5],
    languages: [],
    showVerifiedOnly: false
  });

  const [sortBy, setSortBy] = useState('rating-high');
  const [isLoading, setIsLoading] = useState(false);

  // Enable skeleton loader on Brokers page when switching tabs
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTab]);

  const regions = ['Mumbai', 'Delhi', 'Bengaluru', 'Gurugram', 'Pune', 'Noida', 'Chennai', 'Hyderabad', 'Kolkata'];
  const agencies = ['Sharma Realty', 'Verma Associates', 'Mehta Properties', 'Kapoor Estates', 'Singh & Co.', 'Iyer Homes'];
  const brokerTypes = ['Residential Specialist', 'Commercial Expert', 'Investment Broker', 'Luxury Properties'];
  // Languages filter removed

  const resetFilters = () => {
    setBrokerFilters({
      region: [],
      experienceRange: [0, 20],
      agency: '',
      brokerType: [],
      ratingRange: [4, 5],
      languages: [],
      showVerifiedOnly: false,
    });
  };

  const reactSelectStyles = {
    control: (base) => ({
      ...base,
      borderColor: '#d1d5db',
      boxShadow: 'none',
      minHeight: 38,
      cursor: 'pointer',
      ':hover': { borderColor: '#0A421E' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#0A421E' : state.isFocused ? '#ECFDF5' : 'white',
      color: state.isSelected ? 'white' : '#111827',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({ ...base, color: '#111827' }),
    placeholder: (base) => ({ ...base, color: '#6b7280' }),
    indicatorSeparator: () => ({ display: 'none' })
  };

  const brokers = [
    {
      id: 1,
      name: 'Aarav Sharma',
      profileImage: '/images/user-1.webp',
      rating: 4.8,
      email: 'aarav.sharma@brokeradda.com',
      phone: '+91 98765 43210',
      status: 'Verified',
      locations: ['Mumbai', 'Pune'],
      agency: 'Sharma Realty',
      experience: 8,
      languages: ['English', 'Hindi', 'Marathi'],
      address: 'Bandra West, Mumbai, India'
    },
    {
      id: 2,
      name: 'Priya Verma',
      profileImage: '/images/user-2.jpeg',
      rating: 4.9,
      email: 'priya.verma@brokeradda.com',
      phone: '+91 99887 66554',
      status: 'Active',
      locations: ['Delhi', 'Noida'],
      agency: 'Verma Associates',
      experience: 12,
      languages: ['English', 'Hindi'],
      address: 'South Extension, New Delhi, India'
    },
    {
      id: 3,
      name: 'Rohan Mehta',
      profileImage: '/images/user-3.jpeg',
      rating: 4.7,
      email: 'rohan.mehta@brokeradda.com',
      phone: '+91 91234 56789',
      status: 'Verified',
      locations: ['Bengaluru', 'Electronic City'],
      agency: 'Mehta Properties',
      experience: 15,
      languages: ['English', 'Hindi'],
      address: 'Electronic City Phase 1, Bengaluru, India'
    },
    {
      id: 4,
      name: 'Neha Kapoor',
      profileImage: '/images/user-4.jpeg',
      rating: 4.5,
      email: 'neha.kapoor@brokeradda.com',
      phone: '+91 98111 22334',
      status: 'Active',
      locations: ['Gurugram', 'Sector 62'],
      agency: 'Kapoor Estates',
      experience: 6,
      languages: ['English', 'Hindi'],
      address: 'Sector 62, Gurugram, India'
    },
    {
      id: 5,
      name: 'Vikram Singh',
      profileImage: '/images/user-5.jpeg',
      rating: 4.2,
      email: 'vikram.singh@brokeradda.com',
      phone: '+91 90909 80807',
      status: 'Inactive',
      locations: ['Jaipur'],
      agency: 'Singh & Co.',
      experience: 10,
      languages: ['English', 'Hindi'],
      address: 'C-Scheme, Jaipur, India'
    },
    {
      id: 6,
      name: 'Ananya Iyer',
      profileImage: '/images/user-6.jpg',
      rating: 4.6,
      email: 'ananya.iyer@brokeradda.com',
      phone: '+91 94444 55555',
      status: 'Verified',
      locations: ['Chennai'],
      agency: 'Iyer Homes',
      experience: 9,
      languages: ['English', 'Tamil'],
      address: 'Adyar, Chennai, India'
    }
  ];

  const handleBrokerTypeChange = (type) => {
    setBrokerFilters(prev => ({
      ...prev,
      brokerType: prev.brokerType.includes(type)
        ? prev.brokerType.filter(t => t !== type)
        : [...prev.brokerType, type]
    }));
  };

  const handleLanguageChange = (language) => {
    setBrokerFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleExperienceChange = (index, value) => {
    const newRange = [...brokerFilters.experienceRange];
    newRange[index] = parseInt(value);
    setBrokerFilters(prev => ({
      ...prev,
      experienceRange: newRange
    }));
  };

  const handleRatingChange = (index, value) => {
    const newRange = [...brokerFilters.ratingRange];
    newRange[index] = parseFloat(value);
    setBrokerFilters(prev => ({
      ...prev,
      ratingRange: newRange
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return 'bg-[#ECFDF5] text-[#0A421E]';
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getRatingPillClasses = (rating) => {
    // Use a consistent amber color scheme for all ratings
    return 'bg-amber-50 text-amber-700 border-amber-100';
  };

  return (
    <div className="flex gap-8">
      {/* Filter Sidebar */}
      <div className="w-96 flex-shrink-0">
        {isLoading ? (
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-6">
              {/* Filter Header Skeleton */}
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              
              {/* Location/Region Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
              
              {/* Experience Years Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-28 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
              
              {/* Agency/Company Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
              
              {/* Broker Type Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                <div className="space-y-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="ml-3 h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                  <div className="flex items-center mt-3">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="ml-3 h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
              
              {/* Rating Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-12 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
              
              
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6">
          {/* Filter Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">Filter Options</h2>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#0A421E] hover:text-green-700 cursor-pointer flex items-center"
              aria-label="Reset filters"
              title="Reset filters"
            >
              <i className="fa-solid fa-arrows-rotate text-sm" aria-hidden="true"></i>
              <span className="sr-only">Reset</span>
            </button>
          </div>

          {/* Location/Region Filter (multi-select with checkboxes) */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Location/Region</h3>
            {(() => {
              const regionOptions = regions.map(r => ({ value: r, label: r }));
              const CheckboxOption = (props) => (
                <components.Option {...props}>
                  <input type="checkbox" checked={props.isSelected} readOnly className="mr-2" />
                  <span>{props.label}</span>
                </components.Option>
              );
              return (
                <Select
                  instanceId="brokers-region-select"
                  styles={reactSelectStyles}
                  className="cursor-pointer"
                  options={regionOptions}
                  value={regionOptions.filter(o => brokerFilters.region.includes(o.value))}
                  onChange={(opts) => setBrokerFilters(prev => ({ ...prev, region: (opts || []).map(o => o.value) }))}
                  isSearchable
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ Option: CheckboxOption }}
                  placeholder="Select Regions"
                />
              );
            })()}
          </div>

          {/* Experience Years Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Experience Years</h3>
            <div className="relative">
              <div className="w-full h-2 bg-gray-200 rounded-lg relative">
                <div 
                  className="h-2 bg-[#0A421E] rounded-lg absolute top-0"
                  style={{
                    left: `${(brokerFilters.experienceRange[0] / 20) * 100}%`,
                    width: `${((brokerFilters.experienceRange[1] - brokerFilters.experienceRange[0]) / 20) * 100}%`
                  }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={brokerFilters.experienceRange[0]}
                  onChange={(e) => handleExperienceChange(0, e.target.value)}
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-single slider-dual"
                />
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={brokerFilters.experienceRange[1]}
                  onChange={(e) => handleExperienceChange(1, e.target.value)}
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-single slider-dual"
                />
              </div>
              
            </div>
          </div>

          {/* Agency/Company Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Agency/Company</h3>
            <Select
              instanceId="brokers-agency-select"
              styles={reactSelectStyles}
              className="cursor-pointer"
              options={[{ value: '', label: 'Select Agency' }, ...agencies.map(a => ({ value: a, label: a }))]}
              value={[{ value: '', label: 'Select Agency' }, ...agencies.map(a => ({ value: a, label: a }))].find(o => o.value === brokerFilters.agency) || { value: '', label: 'Select Agency' }}
              onChange={(opt) => setBrokerFilters(prev => ({ ...prev, agency: (opt?.value || '') }))}
              isSearchable
            />
          </div>

          {/* Broker Type Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Broker Type</h3>
            <div className="space-y-2">
              {brokerTypes.map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brokerFilters.brokerType.includes(type)}
                    onChange={() => handleBrokerTypeChange(type)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="ml-3 text-sm text-gray-700">{type}</span>
                </label>
              ))}
              <label className="flex items-center mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={brokerFilters.showVerifiedOnly}
                  onChange={(e) => setBrokerFilters(prev => ({ ...prev, showVerifiedOnly: e.target.checked }))}
                  className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                />
                <span className="ml-3 text-sm text-gray-700 font-medium">Show Verified Only</span>
              </label>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Rating</h3>
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBrokerFilters(prev => ({ ...prev, ratingRange: [i, 5] }))}
                  className="p-0.5 cursor-pointer"
                  aria-label={`Minimum ${i} stars`}
                >
                  <svg className={`w-5 h-5 ${i <= Math.round(brokerFilters.ratingRange[0]) ? 'text-[#0A421E]' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-xs text-gray-700">{Math.round(brokerFilters.ratingRange[0])}+</span>
            </div>
          </div>

          
          </div>
        )}
      </div>

      {/* Brokers Grid */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">Showing 1–{brokers.length} of {brokers.length} results</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sort by:</span>
                <div className="min-w-[220px]">
                  <Select
                    instanceId="brokers-sort-select"
                    styles={reactSelectStyles}
                    options={[
                      { value: 'rating-high', label: 'Rating (High to Low)' },
                      { value: 'rating-low', label: 'Rating (Low to High)' },
                      { value: 'experience-high', label: 'Experience (High to Low)' },
                      { value: 'experience-low', label: 'Experience (Low to High)' },
                      { value: 'name-asc', label: 'Name (A-Z)' },
                      { value: 'name-desc', label: 'Name (Z-A)' }
                    ]}
                    value={[
                      { value: 'rating-high', label: 'Rating (High to Low)' },
                      { value: 'rating-low', label: 'Rating (Low to High)' },
                      { value: 'experience-high', label: 'Experience (High to Low)' },
                      { value: 'experience-low', label: 'Experience (Low to High)' },
                      { value: 'name-asc', label: 'Name (A-Z)' },
                      { value: 'name-desc', label: 'Name (Z-A)' }
                    ].find(o => o.value === sortBy)}
                    onChange={(opt) => setSortBy(opt?.value || 'rating-high')}
                    isSearchable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brokers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                {/* Header: Avatar, name, rating pill */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-18 h-18 bg-gray-200 rounded-full"></div>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full border bg-gray-100">
                      <div className="w-3 h-3 bg-gray-200 rounded"></div>
                      <div className="w-6 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>

                {/* Contact (aligned like live card) */}
                <div className="ml-20 mt-2 space-y-2 mb-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>

                {/* Status and Locations chips */}
                <div className="ml-20 mb-3">
                  <div className="flex flex-wrap gap-1">
                    <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                  </div>
                </div>

                

                {/* Agency and Experience */}
                <div className="ml-20 flex items-center mb-3">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>

                {/* Address */}
                <div className="ml-20 mb-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                  </div>
                </div>

                {/* Action Buttons (two) */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 h-9 bg-gray-200 rounded-full mr-2"></div>
                  <div className="flex-1 h-9 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brokers.map((broker) => (
            <div key={broker.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100">
              {/* Header: Avatar, name, rating */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex flex-col items-center">
                  <img src={broker.profileImage} alt={broker.name} className="w-18 h-18 rounded-full object-cover" />
                  <span className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border ${getRatingPillClasses(broker.rating)}`}>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {broker.rating}
                  </span>
                </div>
                <div className='mt-4'>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{broker.name}</h3>
                    {broker.status === 'Verified' && (
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600"
                        title="Verified"
                        aria-label="Verified"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{broker.agency}</div>
                </div>
              </div>

              {/* Contact (aligned under name/avatar) */}
              <div className="ml-20 -mt-12 space-y-1 mb-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {broker.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {broker.phone}
                </div>
              </div>

              {/* Locations */}
              <div className="ml-20 mb-3">
                <div className="flex flex-wrap gap-1">
                  {broker.locations.map((location, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-[11px] rounded-full">
                      {location}
                    </span>
                  ))}
                </div>
              </div>

              

              {/* Agency and Experience (icon aligned only with agency name) */}
              <div className="ml-20 mb-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="text-sm font-medium text-gray-900">{broker.agency}</div>
                </div>
                <div className="text-xs text-gray-600 ml-6">{broker.experience} years experience</div>
              </div>

              {/* Address */}
              <div className="ml-20 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 5.25-7.5 11-7.5 11s-7.5-5.75-7.5-11a7.5 7.5 0 1115 0z" />
                  </svg>
                  {broker.address}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button onClick={() => router.push('/broker-details')} className="flex-1 bg-[#0A421E] text-white py-2 px-4 rounded-full font-medium shadow-sm hover:bg-[#0b4f24] transition-colors mr-2 cursor-pointer">
                  View Details
                </button>
                <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-full font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                  Contact
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .slider-single {
          background: transparent;
        }
        /* Allow dragging both thumbs on overlapping dual sliders */
        .slider-dual { pointer-events: none; }
        .slider-dual::-webkit-slider-thumb { pointer-events: auto; }
        .slider-dual::-moz-range-thumb { pointer-events: auto; }
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

export default BrokersComponent;
