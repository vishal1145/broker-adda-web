'use client';

import React, { useState } from 'react';
import Select from 'react-select';

const BrokersComponent = () => {
  const [brokerFilters, setBrokerFilters] = useState({
    region: '',
    experienceRange: [0, 20],
    agency: '',
    brokerType: [],
    ratingRange: [4, 5],
    languages: [],
    showVerifiedOnly: false
  });

  const [sortBy, setSortBy] = useState('rating-high');

  const regions = ['Mumbai', 'Delhi', 'Bengaluru', 'Gurugram', 'Pune', 'Noida', 'Chennai', 'Hyderabad', 'Kolkata'];
  const agencies = ['Sharma Realty', 'Verma Associates', 'Mehta Properties', 'Kapoor Estates', 'Singh & Co.', 'Iyer Homes'];
  const brokerTypes = ['Residential Specialist', 'Commercial Expert', 'Investment Broker', 'Luxury Properties'];
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi'];

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
      backgroundColor: state.isSelected ? '#0A421E' : state.isFocused ? '#ECFDF5' : 'white',
      color: state.isSelected ? 'white' : '#111827'
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

  return (
    <div className="flex gap-8">
      {/* Filter Sidebar */}
      <div className="w-96 flex-shrink-0">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-6">
          {/* Filter Header */}
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Filter Options</h2>
          </div>

          {/* Location/Region Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Location/Region</h3>
            <Select
              instanceId="brokers-region-select"
              styles={reactSelectStyles}
              options={[{ value: '', label: 'Select Region' }, ...regions.map(r => ({ value: r, label: r }))]}
              value={[{ value: '', label: 'Select Region' }, ...regions.map(r => ({ value: r, label: r }))].find(o => o.value === brokerFilters.region) || { value: '', label: 'Select Region' }}
              onChange={(opt) => setBrokerFilters(prev => ({ ...prev, region: (opt?.value || '') }))}
              isSearchable
            />
          </div>

          {/* Experience Years Filter */}
          <div>
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
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-single"
                />
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={brokerFilters.experienceRange[1]}
                  onChange={(e) => handleExperienceChange(1, e.target.value)}
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-single"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-4">
                <span>0 years</span>
                <span>20 years</span>
              </div>
            </div>
          </div>

          {/* Agency/Company Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Agency/Company</h3>
            <Select
              instanceId="brokers-agency-select"
              styles={reactSelectStyles}
              options={[{ value: '', label: 'Select Agency' }, ...agencies.map(a => ({ value: a, label: a }))]}
              value={[{ value: '', label: 'Select Agency' }, ...agencies.map(a => ({ value: a, label: a }))].find(o => o.value === brokerFilters.agency) || { value: '', label: 'Select Agency' }}
              onChange={(opt) => setBrokerFilters(prev => ({ ...prev, agency: (opt?.value || '') }))}
              isSearchable
            />
          </div>

          {/* Broker Type Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Broker Type</h3>
            <div className="space-y-2">
              {brokerTypes.map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={brokerFilters.brokerType.includes(type)}
                    onChange={() => handleBrokerTypeChange(type)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="ml-3 text-sm text-gray-700">{type}</span>
                </label>
              ))}
              <label className="flex items-center mt-3">
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
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Rating</h3>
            <div className="relative">
              <div className="w-full h-2 bg-gray-200 rounded-lg relative">
                <div 
                  className="h-2 bg-[#0A421E] rounded-lg absolute top-0"
                  style={{
                    left: `${((brokerFilters.ratingRange[0] - 1) / 4) * 100}%`,
                    width: `${((brokerFilters.ratingRange[1] - brokerFilters.ratingRange[0]) / 4) * 100}%`
                  }}
                ></div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={brokerFilters.ratingRange[0]}
                  onChange={(e) => handleRatingChange(0, e.target.value)}
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-single"
                />
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={brokerFilters.ratingRange[1]}
                  onChange={(e) => handleRatingChange(1, e.target.value)}
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-single"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-[#0A421E]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Languages Spoken Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Languages Spoken</h3>
            <div className="space-y-2">
              {languages.map((language) => (
                <label key={language} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={brokerFilters.languages.includes(language)}
                    onChange={() => handleLanguageChange(language)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="ml-3 text-sm text-gray-700">{language}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brokers Grid */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Brokers</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Showing {brokers.length} of {brokers.length} results</span>
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {brokers.map((broker) => (
            <div key={broker.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              {/* Profile: Image, Name, Rating */}
              <div className="flex flex-col items-center mb-4">
                <img
                  src={broker.profileImage}
                  alt={broker.name}
                  className="w-28 h-28 rounded-full object-cover"
                />
                <h3 className="mt-3 text-lg font-semibold text-gray-900 text-center">{broker.name}</h3>
                <div className="flex items-center mt-1">
                  {renderStars(broker.rating)}
                  <span className="ml-2 text-sm text-gray-600">({broker.rating})</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-4 text-center">
                <div className="flex items-center justify-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-[#0A421E] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {broker.email}
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {broker.phone}
                </div>
              </div>

              {/* Status and Location Tags */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1 justify-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(broker.status)}`}>
                    {broker.status}
                  </span>
                  {broker.locations.map((location, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {location}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agency and Experience */}
              <div className="flex items-center justify-center mb-4 text-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                    <div className="text-sm font-medium text-gray-900">{broker.agency}</div>
                  <div className="text-xs text-gray-600">{broker.experience} years experience</div>
                </div>
              </div>

              {/* Address + Status/Region (chips already above for status/locations) */}
              <div className="mb-4 text-center">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 5.25-7.5 11-7.5 11s-7.5-5.75-7.5-11a7.5 7.5 0 1115 0z" />
                  </svg>
                  {broker.address}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button className="flex-1 bg-[#0A421E] border-2 border-[#0A421E] text-white py-2 px-4 rounded-md font-medium hover:bg-[#0b4f24] transition-colors mr-2">
                  View Details
                </button>
                <button className="flex-1 bg-white border-2 border-[#0A421E] text-[#0A421E] py-2 px-4 rounded-md font-medium hover:bg-green-50 transition-colors mr-2">
                  Contact
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
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

export default BrokersComponent;
