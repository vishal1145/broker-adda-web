'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Select, { components } from 'react-select';

const BrokersComponent = ({ activeTab, setActiveTab }) => {
  const router = useRouter();
  const [brokerFilters, setBrokerFilters] = useState({
    region: [],
    experienceRange: [0, 20],
    brokerType: [],
    ratingRange: [4, 5],
    languages: [],
    showVerifiedOnly: false
  });

  const [sortBy, setSortBy] = useState('rating-high');
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  
  // Store full region objects for ID mapping
  const [regionsData, setRegionsData] = useState([]);
  
  // Brokers API state
  const [brokers, setBrokers] = useState([]);
  const [brokersLoading, setBrokersLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  // Enable skeleton loader on Brokers page when switching tabs
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Fetch regions from API
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setRegionsLoading(true);
        
        // Get token from localStorage following app pattern
        const token = typeof window !== 'undefined' 
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;
        
        // Use environment variable for API URL following app pattern
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        
        if (!token) {
          console.log('No token found, using fallback regions');
          throw new Error('No authentication token found');
        }
        
        const response = await fetch(`${apiUrl}/regions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch regions: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Regions API response:', data);
        
        // Extract regions data following app pattern
        let regionsData = [];
        
        if (Array.isArray(data?.data)) {
          regionsData = data.data;
        } else if (Array.isArray(data?.regions)) {
          regionsData = data.regions;
        } else if (Array.isArray(data)) {
          regionsData = data;
        } else if (data?.data?.regions && Array.isArray(data.data.regions)) {
          regionsData = data.data.regions;
        }
        
        if (Array.isArray(regionsData) && regionsData.length > 0) {
          // Store full region objects for ID mapping
          setRegionsData(regionsData);
          
          // Extract region names from objects if they are objects
          const regionNames = regionsData.map(region => {
            if (typeof region === 'string') {
              return region;
            } else if (typeof region === 'object' && region !== null) {
              return region.name || region.city || region.state || region._id || String(region);
            }
            return String(region);
          });
          console.log('Processed region names:', regionNames);
          console.log('Full regions data:', regionsData);
          setRegions(regionNames);
        } else {
          throw new Error('No valid regions data received');
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
        // Fallback to hardcoded regions if API fails
        const fallbackRegions = ['Mumbai', 'Delhi', 'Bengaluru', 'Gurugram', 'Pune', 'Noida ', 'Chennai', 'Hyderabad', 'Kolkata'];
        setRegions(fallbackRegions);
      } finally {
        setRegionsLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Fetch brokers from API with region filtering
  const fetchBrokers = async (regionIds = null) => {
    try {
      setBrokersLoading(true);
      
      // Get token from localStorage following app pattern
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      // Use environment variable for API URL following app pattern
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      if (!token) {
        console.log('No token found, using fallback brokers');
        throw new Error('No authentication token found');
      }
      
      // Build base query parameters
      const baseQueryParams = new URLSearchParams();
      
      // Add region filter if provided
      if (regionIds && regionIds.length > 0) {
        console.log('Using region IDs for filtering:', regionIds);
        
        // Use the first valid region ID for API call
        const validRegionId = regionIds[0];
        baseQueryParams.append('regionId', validRegionId);
        console.log('Using region ID:', validRegionId);
      }
      
      // Fetch brokers with a single API call first, then paginate if needed
      let allBrokers = [];
      const limit = 100; // Server's maximum allowed limit
      
      console.log('Fetching brokers with region IDs:', regionIds);
      console.log('Base query params:', baseQueryParams.toString());
      
      // First, try to get all brokers in one call
      const queryParams = new URLSearchParams(baseQueryParams);
      queryParams.append('page', 1);
      queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const apiUrlWithParams = queryString ? `${apiUrl}/brokers?${queryString}` : `${apiUrl}/brokers`;
      
      console.log('Fetching brokers, URL:', apiUrlWithParams);
      
      const response = await fetch(apiUrlWithParams, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch brokers: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Brokers response:', data);
      console.log('Response structure:', {
        hasData: !!data?.data,
        dataIsArray: Array.isArray(data?.data),
        hasBrokers: !!data?.brokers,
        brokersIsArray: Array.isArray(data?.brokers),
        isArray: Array.isArray(data),
        hasDataBrokers: !!data?.data?.brokers,
        dataBrokersIsArray: Array.isArray(data?.data?.brokers)
      });
      
      // Extract brokers data following app pattern
      let brokersData = [];
      
      if (Array.isArray(data?.data)) {
        brokersData = data.data;
        console.log(`Using data.data, found ${brokersData.length} brokers`);
      } else if (Array.isArray(data?.brokers)) {
        brokersData = data.brokers;
        console.log(`Using data.brokers, found ${brokersData.length} brokers`);
      } else if (Array.isArray(data)) {
        brokersData = data;
        console.log(`Using data directly, found ${brokersData.length} brokers`);
      } else if (data?.data?.brokers && Array.isArray(data.data.brokers)) {
        brokersData = data.data.brokers;
        console.log(`Using data.data.brokers, found ${brokersData.length} brokers`);
      }
      
      if (brokersData.length > 0) {
        console.log(`Sample broker data:`, brokersData[0]);
        allBrokers = brokersData;
      }
      
      if (allBrokers.length > 0) {
        console.log('Raw broker data sample:', allBrokers[0]);
        console.log('Available fields in broker:', Object.keys(allBrokers[0]));
        
        // Transform API data to match our component structure
        const transformedBrokers = allBrokers.map((broker, index) => {
          console.log(`Transforming broker ${index}:`, {
            id: broker._id || broker.id,
            name: broker.name,
            profileImage: broker.brokerImage,
            email: broker.email,
            phone: broker.phone || broker.whatsappNumber,
            status: broker.approvedByAdmin,
            locations: broker.region,
            agency: broker.firmName,
            address: broker.address || broker.centerLocation,
            specializations: broker.specializations
          });
          
          return {
            id: broker._id || broker.id,
            name: broker.name || 'Unknown Broker',
            profileImage: broker.brokerImage || '/images/user-1.webp',
            rating: 4.5, // Default rating since not in API
            email: broker.email || '',
            phone: broker.phone || broker.whatsappNumber || '',
            status: broker.approvedByAdmin === 'unblocked' ? 'Verified' : 'Active',
            locations: broker.region ? broker.region.map(r => r.name) : [broker.city || 'Unknown'],
            agency: broker.firmName || 'Unknown Agency',
            experience: Math.floor(Math.random() * 15) + 2, // Random experience between 2-16 years for testing
            languages: ['English', 'Hindi'], // Default languages
            address: broker.address || broker.centerLocation || 'Unknown Address',
            brokerTypes: broker.specializations || ['Real Estate Consulting'] // Map specializations to broker types
          };
        });
        
        console.log(`Fetched ${transformedBrokers.length} total brokers across ${currentPage - 1} pages`);
        console.log('All brokers data:', transformedBrokers);
        setBrokers(transformedBrokers);
      } else {
        throw new Error('No valid brokers data received');
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
      // Fallback to hardcoded brokers if API fails
      const fallbackBrokers = [
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
          address: 'Bandra West, Mumbai, India',
          brokerTypes: ['Luxury Homes', 'Investment Properties']
        },
        {
          id: 2,
          name: 'Priya Verma',
          profileImage: '/images/user-2.jpeg',
          rating: 4.9,
          email: 'priya.verma@brokeradda.com',
          phone: '+91 99887 66554',
          status: 'Active',
          locations: ['Delhi', 'Noida Sector 62'],
          agency: 'Verma Associates',
          experience: 12,
          languages: ['English', 'Hindi'],
          address: 'South Extension, New Delhi, India',
          brokerTypes: ['Commercial Leasing', 'Rental Properties']
        }
      ];
      setBrokers(fallbackBrokers);
    } finally {
      setBrokersLoading(false);
    }
  };

  // Fetch brokers when region filter changes or on initial mount (with debouncing)
  useEffect(() => {
    // Only fetch if regionsData is loaded
    if (regionsData.length === 0) {
      console.log('Regions data not loaded yet, skipping broker fetch');
      return;
    }

    // Debounce the API call to prevent multiple rapid calls
    const timeoutId = setTimeout(() => {
      // Convert region names to region IDs for API filtering
      const regionIds = brokerFilters.region.map(regionName => {
        const region = regionsData.find(r => {
          if (typeof r === 'object' && r !== null) {
            const regionNameFromData = r.name || r.city || r.state || r._id || String(r);
            return regionNameFromData === regionName;
          }
          return String(r) === regionName;
        });
        
        if (region && region._id && /^[0-9a-fA-F]{24}$/.test(region._id)) {
          return region._id;
        }
        return null;
      }).filter(Boolean);
      
      console.log('Region names:', brokerFilters.region);
      console.log('Mapped region IDs:', regionIds);
      fetchBrokers(regionIds);
    }, 300); // 300ms debounce delay

    // Cleanup timeout on unmount or dependency change
    return () => clearTimeout(timeoutId);
  }, [brokerFilters.region, regionsData.length]); // Only depend on regionsData.length instead of the whole array

  const brokerTypes = [
    'Commercial Leasing',
    'Luxury Homes', 
    'Investment Properties',
    'Rental Properties',
    'Land Development',
    'Property Management',
    'Real Estate Consulting'
  ];
  // Languages filter removed

  const resetFilters = () => {
    setBrokerFilters({
      region: [],
      experienceRange: [0, 20],
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

  // Filter brokers based on selected filters (client-side filtering for all filters)
  const filteredBrokers = brokers.filter(broker => {
    // Region filter (client-side backup - now using region IDs)
    if (brokerFilters.region.length > 0) {
      console.log('Client-side region filtering with names:', brokerFilters.region);
      console.log('Broker locations:', broker.locations);
      
      const hasMatchingRegion = brokerFilters.region.some(selectedRegion => 
        broker.locations.some(brokerLocation => {
          const brokerLoc = brokerLocation.toLowerCase().trim();
          const selectedLoc = selectedRegion.toLowerCase().trim();
          
          console.log(`Comparing broker location "${brokerLoc}" with selected region "${selectedLoc}"`);
          
          // Exact match
          if (brokerLoc === selectedLoc) {
            console.log('✅ Exact match found');
            return true;
          }
          
          // Check if broker location contains the selected region as a complete word
          const brokerWords = brokerLoc.split(/\s+/);
          const selectedWords = selectedLoc.split(/\s+/);
          
          // If selected region has multiple words, check if all words are in broker location
          if (selectedWords.length > 1) {
            const allWordsMatch = selectedWords.every(word => brokerWords.includes(word));
            console.log(`Multi-word check: ${allWordsMatch ? '✅' : '❌'}`);
            return allWordsMatch;
          }
          
          // If selected region is a single word, check if it's a complete word in broker location
          if (selectedWords.length === 1) {
            const singleWordMatch = brokerWords.includes(selectedWords[0]);
            console.log(`Single word check: ${singleWordMatch ? '✅' : '❌'}`);
            return singleWordMatch;
          }
          
          return false;
        })
      );
      
      console.log(`Region filter result for ${broker.name}: ${hasMatchingRegion ? '✅ PASS' : '❌ FAIL'}`);
      if (!hasMatchingRegion) return false;
    }

    // Experience filter
    if (broker.experience < brokerFilters.experienceRange[0] || 
        broker.experience > brokerFilters.experienceRange[1]) {
      console.log(`Broker ${broker.name} filtered out by experience: ${broker.experience} not in range [${brokerFilters.experienceRange[0]}, ${brokerFilters.experienceRange[1]}]`);
      return false;
    }


    // Broker type filter
    if (brokerFilters.brokerType.length > 0) {
      const hasMatchingBrokerType = brokerFilters.brokerType.some(selectedType => 
        broker.brokerTypes && broker.brokerTypes.includes(selectedType)
      );
      if (!hasMatchingBrokerType) return false;
    }

    // Rating filter
    if (broker.rating < brokerFilters.ratingRange[0] || 
        broker.rating > brokerFilters.ratingRange[1]) {
      return false;
    }

    // Verified only filter
    if (brokerFilters.showVerifiedOnly && broker.status !== 'Verified') {
      return false;
    }

    return true;
  });

  // Sort brokers based on selected sort option
  const sortedBrokers = [...filteredBrokers].sort((a, b) => {
    switch (sortBy) {
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      case 'experience-high':
        return b.experience - a.experience;
      case 'experience-low':
        return a.experience - b.experience;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return b.rating - a.rating;
    }
  });

  // Pagination calculations
  const totalItems = sortedBrokers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBrokers = sortedBrokers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [brokerFilters, sortBy]);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  console.log('Total brokers:', brokers.length);
  console.log('Filtered brokers:', filteredBrokers.length);
  console.log('Sorted brokers:', sortedBrokers.length);
  console.log('Current filters:', brokerFilters);
  console.log('Experience range filter:', brokerFilters.experienceRange);
  console.log('Pagination - Current page:', currentPage, 'Total pages:', totalPages, 'Items per page:', itemsPerPage);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
      {/* Filter Sidebar */}
      <div className="w-full lg:w-96 flex-shrink-0 order-2 lg:order-1">
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
            {regionsLoading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : regions.length === 0 ? (
              <div className="text-sm text-gray-500">
                No regions available
              </div>
            ) : (
              <Select
                instanceId="brokers-region-select"
                styles={reactSelectStyles}
                className="cursor-pointer"
                options={regions.map(r => ({ value: r, label: r }))}
                value={regions
                  .map(r => ({ value: r, label: r }))
                  .filter(o => brokerFilters.region.includes(o.value))}
                onChange={(opts) => setBrokerFilters(prev => ({ 
                  ...prev, 
                  region: (opts || []).map(o => o.value) 
                }))}
                isSearchable
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={{
                  Option: (props) => (
                    <components.Option {...props}>
                      <input type="checkbox" checked={props.isSelected} readOnly className="mr-2" />
                      <span>{props.label}</span>
                    </components.Option>
                  )
                }}
                placeholder="Select Regions"
              />
            )}
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
              
              {/* Experience range values */}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{brokerFilters.experienceRange[0]} years</span>
                <span>{brokerFilters.experienceRange[1]} years</span>
              </div>
            </div>
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
      <div className="flex-1 order-1 lg:order-2">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                {totalItems === 0 
                  ? 'No results found' 
                  : `Showing ${startIndex + 1} to ${Math.min(endIndex, totalItems)} of ${totalItems} results`
                }
              </span>
            </div>
            {sortedBrokers.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-gray-600 text-sm">Sort by:</span>
                  <div className="w-full sm:min-w-[220px]">
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
            )}
          </div>
        </div>

        {/* Brokers Grid */}
        {isLoading || brokersLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
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
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-6">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Brokers Found</h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                We couldn't find any brokers matching your current filters. Try adjusting your search criteria.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0A421E] hover:bg-[#0b4f24] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A421E] transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {paginatedBrokers.map((broker) => (
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

        {/* Pagination */}
        {totalItems > 0 && totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A421E] focus:border-transparent"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={15}>15</option>
                <option value={18}>18</option>
              </select>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <div className="flex items-center gap-1 overflow-x-auto">
                {/* Always show first page */}
                <button
                  onClick={() => handlePageChange(1)}
                  className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-[#0A421E] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  1
                </button>

                {/* Show ellipsis if current page is far from start */}
                {currentPage > 4 && (
                  <span className="px-2 py-2 text-sm text-gray-500">...</span>
                )}

                {/* Show pages around current page */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show pages 2-3 if current page is 1-3
                    if (currentPage <= 3) {
                      return page >= 2 && page <= 4;
                    }
                    // Show pages around current page
                    if (currentPage > 3 && currentPage < totalPages - 2) {
                      return page >= currentPage - 1 && page <= currentPage + 1;
                    }
                    // Show last few pages if current page is near end
                    if (currentPage >= totalPages - 2) {
                      return page >= totalPages - 3 && page < totalPages;
                    }
                    return false;
                  })
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-[#0A421E] text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                {/* Show ellipsis if current page is far from end */}
                {currentPage < totalPages - 3 && (
                  <span className="px-2 py-2 text-sm text-gray-500">...</span>
                )}

                {/* Always show last page if there's more than 1 page */}
                {totalPages > 1 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-[#0A421E] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
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
