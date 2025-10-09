'use client';

import React, { useState } from 'react';

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

  const regions = ['New York', 'California', 'Texas', 'Florida', 'Washington', 'Colorado', 'Illinois'];
  const agencies = ['Elite Realty Group', 'Pacific Homes', 'Lone Star Properties', 'Cascade Estates', 'Rocky Mountain Homes'];
  const brokerTypes = ['Residential Specialist', 'Commercial Expert', 'Investment Broker', 'Luxury Properties'];
  const languages = ['English', 'Spanish', 'Mandarin', 'Vietnamese', 'German', 'Korean', 'French'];

  const brokers = [
    {
      id: 1,
      name: 'John Doe',
      profileImage: '/images/user-1.webp',
      rating: 4.8,
      email: 'john.doe@brokeradda.com',
      phone: '+1 (555) 123-4567',
      status: 'Verified',
      locations: ['New York', 'New Jersey'],
      agency: 'Elite Realty Group',
      experience: 8,
      languages: ['English', 'Spanish']
    },
    {
      id: 2,
      name: 'Jane Smith',
      profileImage: '/images/user-2.jpeg',
      rating: 4.9,
      email: 'jane.smith@brokeradda.com',
      phone: '+1 (555) 234-5678',
      status: 'Active',
      locations: ['California', 'Nevada'],
      agency: 'Pacific Homes',
      experience: 12,
      languages: ['English', 'Mandarin']
    },
    {
      id: 3,
      name: 'Robert Johnson',
      profileImage: '/images/user-3.jpeg',
      rating: 4.7,
      email: 'robert.johnson@brokeradda.com',
      phone: '+1 (555) 345-6789',
      status: 'Verified',
      locations: ['Texas', 'Florida'],
      agency: 'Lone Star Properties',
      experience: 15,
      languages: ['English']
    },
    {
      id: 4,
      name: 'Emily Chen',
      profileImage: '/images/user-4.jpeg',
      rating: 4.5,
      email: 'emily.chen@brokeradda.com',
      phone: '+1 (555) 456-7890',
      status: 'Active',
      locations: ['Washington', 'Oregon'],
      agency: 'Cascade Estates',
      experience: 6,
      languages: ['English', 'Vietnamese']
    },
    {
      id: 5,
      name: 'Michael Green',
      profileImage: '/images/user-5.jpeg',
      rating: 4.2,
      email: 'michael.green@brokeradda.com',
      phone: '+1 (555) 567-8901',
      status: 'Inactive',
      locations: ['Colorado'],
      agency: 'Rocky Mountain Homes',
      experience: 10,
      languages: ['English', 'German']
    },
    {
      id: 6,
      name: 'Sarah Kim',
      profileImage: '/images/user-6.jpg',
      rating: 4.6,
      email: 'sarah.kim@brokeradda.com',
      phone: '+1 (555) 678-9012',
      status: 'Verified',
      locations: ['Illinois', 'Michigan'],
      agency: 'Midwest Properties',
      experience: 9,
      languages: ['English', 'Korean']
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
        return 'bg-green-100 text-green-800';
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
      <div className=" flex-shrink-0">
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
            <select
              value={brokerFilters.region}
              onChange={(e) => setBrokerFilters(prev => ({ ...prev, region: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Experience Years Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Experience Years</h3>
            <div className="relative">
              <div className="w-full h-2 bg-gray-200 rounded-lg relative">
                <div 
                  className="h-2 bg-blue-600 rounded-lg absolute top-0"
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
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 years</span>
                <span>20 years</span>
              </div>
            </div>
          </div>

          {/* Agency/Company Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Agency/Company</h3>
            <select
              value={brokerFilters.agency}
              onChange={(e) => setBrokerFilters(prev => ({ ...prev, agency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Agency</option>
              {agencies.map((agency) => (
                <option key={agency} value={agency}>{agency}</option>
              ))}
            </select>
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
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">{type}</span>
                </label>
              ))}
              <label className="flex items-center mt-3">
                <input
                  type="checkbox"
                  checked={brokerFilters.showVerifiedOnly}
                  onChange={(e) => setBrokerFilters(prev => ({ ...prev, showVerifiedOnly: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                  className="h-2 bg-blue-600 rounded-lg absolute top-0"
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
                    <svg key={i} className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating-high">Rating (High to Low)</option>
                  <option value="rating-low">Rating (Low to High)</option>
                  <option value="experience-high">Experience (High to Low)</option>
                  <option value="experience-low">Experience (Low to High)</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Brokers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {brokers.map((broker) => (
            <div key={broker.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={broker.profileImage}
                    alt={broker.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{broker.name}</h3>
                    <div className="flex items-center mt-1">
                      {renderStars(broker.rating)}
                      <span className="ml-2 text-sm text-gray-600">({broker.rating})</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(broker.status)}`}>
                  {broker.status}
                </span>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-600">{broker.email}</div>
                <div className="text-sm text-gray-600">{broker.phone}</div>
              </div>

              {/* Location Tags */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {broker.locations.map((location, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {location}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agency and Experience */}
              <div className="flex items-center mb-4">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <div className="text-sm font-medium text-gray-900">{broker.agency}</div>
                  <div className="text-xs text-gray-600">{broker.experience} years experience</div>
                </div>
              </div>

              {/* Languages */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {broker.languages.map((language, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors mr-2">
                  View Details
                </button>
                <button className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-2 px-4 rounded-md font-medium hover:bg-blue-50 transition-colors mr-2">
                  Contact
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          border: 2px solid #3b82f6;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider-single::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #3b82f6;
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
