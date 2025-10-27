'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Select, { components } from 'react-select';
import TabsBar from './TabsBar';

const BrokersComponent = ({ activeTab, setActiveTab }) => {
  const router = useRouter();
  const [brokerFilters, setBrokerFilters] = useState({
    region: [],
    experienceRange: [0, 20],
    brokerType: [],
    ratingRange: [0, 5],
    languages: [],
    showVerifiedOnly: false,
    city: ''
  });

  const [sortBy, setSortBy] = useState('rating-high');
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([
    { value: 'Agra', label: 'Agra' },
    { value: 'Noida', label: 'Noida' }
  ]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  
  // New search states
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  const [regionSearchTerm, setRegionSearchTerm] = useState('');
  
  // Store full region objects for ID mapping
  const [regionsData, setRegionsData] = useState([]);
  
  // Brokers API state
  const [brokers, setBrokers] = useState([]);
  const [brokersLoading, setBrokersLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  
  // Secondary filters state
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);
  const [secondaryFilters, setSecondaryFilters] = useState({
    companyName: '',
    language: '',
    brokerStatus: [],
    responseRate: [],
    joinedDate: '',
    sortBy: 'rating-high'
  });

  // Enable skeleton loader on Brokers page when switching tabs
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Fetch regions from API (refetch when city changes)
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setRegionsLoading(true);
        
        // Use environment variable for API URL following app pattern
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        let url = `${apiUrl}/regions`;
        if (brokerFilters.city) {
          url += `?city=${encodeURIComponent(brokerFilters.city)}`;
        }
        const response = await fetch(url, { method: 'GET' });
        
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
  }, [brokerFilters.city]);

  // Fetch brokers from API with region and city filtering
  const fetchBrokers = async (regionIds = null) => {
    try {
      setBrokersLoading(true);
      
      // Use environment variable for API URL following app pattern
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
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
      
      // Make multiple API calls to get all brokers
      let currentPage = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
      const queryParams = new URLSearchParams(baseQueryParams);
        queryParams.append('page', currentPage);
      queryParams.append('limit', limit);
      
      const queryString = queryParams.toString();
      const apiUrlWithParams = queryString ? `${apiUrl}/brokers?${queryString}` : `${apiUrl}/brokers`;
      
        console.log(`Fetching brokers page ${currentPage}, URL:`, apiUrlWithParams);
      
      const response = await fetch(apiUrlWithParams, { method: 'GET' });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch brokers: ${response.status}`);
      }
      
      const data = await response.json();
        console.log(`Brokers response for page ${currentPage}:`, data);
        
        // Extract brokers data following app pattern
        let brokersData = [];
        
        console.log('API Response structure:', {
        hasData: !!data?.data,
        dataIsArray: Array.isArray(data?.data),
        hasBrokers: !!data?.brokers,
        brokersIsArray: Array.isArray(data?.brokers),
        isArray: Array.isArray(data),
        hasDataBrokers: !!data?.data?.brokers,
          dataBrokersIsArray: Array.isArray(data?.data?.brokers),
          dataKeys: data ? Object.keys(data) : [],
          dataDataKeys: data?.data ? Object.keys(data.data) : []
        });
        
        // Check if the response has the expected structure from your JSON
        if (data?.data?.brokers) {
          console.log('Found data.data.brokers, sample broker:', data.data.brokers[0]);
          console.log('Sample broker keys:', data.data.brokers[0] ? Object.keys(data.data.brokers[0]) : 'No brokers');
          console.log('Sample broker specializations:', data.data.brokers[0]?.specializations);
          console.log('Sample broker firmName:', data.data.brokers[0]?.firmName);
          console.log('Sample broker leadsCreated:', data.data.brokers[0]?.leadsCreated);
        }
        
        // Try different data structures based on your JSON format
        if (data?.data?.brokers && Array.isArray(data.data.brokers)) {
          brokersData = data.data.brokers;
          console.log(`Using data.data.brokers, found ${brokersData.length} brokers on page ${currentPage}`);
      } else if (Array.isArray(data?.brokers)) {
        brokersData = data.brokers;
          console.log(`Using data.brokers, found ${brokersData.length} brokers on page ${currentPage}`);
        } else if (Array.isArray(data?.data)) {
          brokersData = data.data;
          console.log(`Using data.data, found ${brokersData.length} brokers on page ${currentPage}`);
      } else if (Array.isArray(data)) {
        brokersData = data;
          console.log(`Using data directly, found ${brokersData.length} brokers on page ${currentPage}`);
        } else {
          console.log('No valid brokers data found in response');
          console.log('Full response:', data);
          console.log('Response keys:', Object.keys(data || {}));
      }
      
      if (brokersData.length > 0) {
          allBrokers = allBrokers.concat(brokersData);
          console.log(`Total brokers collected so far: ${allBrokers.length}`);
          
          // Check if we got fewer brokers than the limit (indicating last page)
          if (brokersData.length < limit) {
            hasMorePages = false;
            console.log('Reached last page - fewer brokers than limit');
          } else {
            currentPage++;
          }
        } else {
          hasMorePages = false;
          console.log('No brokers found on page, stopping');
        }
      }
      
      console.log(`Fetched total of ${allBrokers.length} brokers across ${currentPage} pages`);
      
      if (allBrokers.length > 0) {
        console.log('Raw broker data sample:', allBrokers[0]);
        console.log('Available fields in broker:', Object.keys(allBrokers[0]));
        
        // Helper to compute a stable rating based on available broker data
        const computeRating = (raw) => {
          const leadsCount = raw?.leadsCreated?.count || 0;
          const hasSpecializations = Array.isArray(raw?.specializations) && raw.specializations.length > 0;
          const hasFirmName = typeof raw?.firmName === 'string' && raw.firmName.trim() !== '';
          const isVerified = raw?.approvedByAdmin === 'unblocked';
          let rating = 3.0;
          if (leadsCount > 0) rating += 0.5;
          if (hasSpecializations) rating += 0.3;
          if (hasFirmName) rating += 0.2;
          if (isVerified) rating += 0.5;
          return Math.min(rating, 5.0);
        };
        
        // Transform API data to match our component structure
        const transformedBrokers = allBrokers.map((broker, index) => {
          console.log(`Raw broker data for ${index}:`, broker);
          console.log(`Available fields in broker:`, Object.keys(broker));
          console.log(`Broker specializations:`, broker.specializations);
          console.log(`Broker firmName:`, broker.firmName);
          console.log(`Broker leadsCreated:`, broker.leadsCreated);
          
          const computedRating = computeRating(broker);
          return {
            _id: broker._id || undefined,
            userIdRaw: (broker?.userId && typeof broker.userId === 'object') ? broker.userId._id : broker.userId,
            id: broker._id || broker.id,
            name: broker.name || 'Unknown Broker',
            profileImage: broker.brokerImage || '/images/user-1.webp',
            rating: computedRating,
            email: broker.email || '',
            phone: broker.phone || broker.whatsappNumber || '',
            status: broker.approvedByAdmin === 'unblocked' ? 'Verified' : 'Active',
            locations: broker.region ? broker.region.map(r => r.name) : [broker.city || 'Unknown'],
            agency: broker.firmName || 'Unknown Agency',
            experience: (() => {
              if (typeof broker?.experience === 'number') return Math.max(0, Math.floor(broker.experience));
              if (broker?.experience && typeof broker.experience === 'object' && typeof broker.experience.years === 'number') {
                return Math.max(0, Math.floor(broker.experience.years));
              }
              if (!broker.createdAt) return 0;
              const createdDate = new Date(broker.createdAt);
              const currentDate = new Date();
              const diffMs = currentDate - createdDate;
              if (isNaN(diffMs) || diffMs <= 0) return 0;
              const years = diffMs / (1000 * 60 * 60 * 24 * 365);
              return Math.max(0, Math.floor(years));
            })(),
            languages: ['English', 'Hindi'], // Default languages
            address: broker.address || broker.centerLocation || 'Unknown Address',
            brokerTypes: broker.specializations || ['Real Estate Consulting'], // Map specializations to broker types
            // Add the missing fields for proper data binding - use the raw broker data directly
            specializations: broker.specializations || [],
            firmName: broker.firmName || '',
            leadsCreated: broker.leadsCreated || { count: 0, items: [] },
            approvedByAdmin: broker.approvedByAdmin || '',
            createdAt: broker.createdAt || ''
          };
        });
        
        console.log(`Fetched ${transformedBrokers.length} total brokers across ${currentPage - 1} pages`);
        console.log('All brokers data:', transformedBrokers);
        console.log('Sample transformed broker:', transformedBrokers[0]);
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
  }, [brokerFilters.region, brokerFilters.city, regionsData.length]); // also update when city changes

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
    // Reset all filters to defaults (align with Leads reset behavior)
    setNameSearchTerm('');
    setRegionSearchTerm('');
    setSortBy('rating-high');
    setCurrentPage(1);
    setItemsPerPage(9);

    setBrokerFilters({
      region: [],
      experienceRange: [0, 20],
      brokerType: [],
      ratingRange: [0, 5],
      languages: [],
      showVerifiedOnly: false,
      city: ''
    });

    // Trigger fresh fetch without any region filter
    if (regionsData.length > 0) {
      fetchBrokers([]);
    }
  };

  const reactSelectStyles = {
    control: (base, state) => ({
      ...base,
      fontSize: 14,
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db', // blue-500 focus
      boxShadow: 'none',
      minHeight: 38,
      cursor: 'pointer',
      ':hover': { borderColor: '#60a5fa' } // blue-400 hover
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 14,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white', // blue-50 focus
      color: state.isSelected ? 'white' : '#111827',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({ ...base, color: '#111827', fontSize: 14 }),
    placeholder: (base) => ({ ...base, color: '#6b7280', fontSize: 14 }),
    input: (base) => ({ ...base, fontSize: 14 }),
    indicatorSeparator: () => ({ display: 'none' }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#dbeafe', // blue-100
      borderRadius: 9999
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: 14,
      color: '#1e3a8a', // blue-900
      fontWeight: 600
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#3b82f6',
      ':hover': { backgroundColor: '#bfdbfe', color: '#1d4ed8' }
    })
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
    // Always use gray color for rating chips as requested
    return 'bg-gray-200 text-gray-700 border-gray-300';
  };

  // Compute region options based on selected city (mirror Leads behavior)
  const regionOptionsForUI = useMemo(() => {
    if (!brokerFilters.city) return regions;
    const cityLower = brokerFilters.city.toLowerCase();
    const collected = new Set();
    try {
      // Prefer extracting from current brokers data
      (brokers || []).forEach(b => {
        const locations = Array.isArray(b.locations) ? b.locations : [];
        const address = (b.address || '').toLowerCase();
        const cityMatch = address.includes(cityLower) || locations.some(l => (l || '').toLowerCase().includes(cityLower));
        if (cityMatch) {
          locations.forEach(l => { if (l) collected.add(l); });
        }
      });
    } catch {}
    if (collected.size > 0) return Array.from(collected);
    // Fallback: filter master regions list by city token inclusion
    return regions.filter(r => (r || '').toLowerCase().includes(cityLower));
  }, [brokerFilters.city, brokers, regions]);

  // Filter brokers based on selected filters (client-side filtering)
  const filteredBrokers = brokers.filter(broker => {
    // City filter: backend already applies regionCity when city is selected.
    // To avoid over-filtering due to string mismatches, skip client-side city filtering.
    // Name search filter
    if (nameSearchTerm.trim()) {
      const nameMatch = broker.name.toLowerCase().includes(nameSearchTerm.toLowerCase().trim());
      if (!nameMatch) return false;
    }

    // Region search filter
    if (regionSearchTerm.trim()) {
      const regionMatch = broker.locations.some(location => 
        location.toLowerCase().includes(regionSearchTerm.toLowerCase().trim())
      );
      if (!regionMatch) return false;
    }

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
    <div className="grid grid-cols-12 gap-8">
      {/* Filter Sidebar - 3 columns */}
      <div className="col-span-3">
        {isLoading ? (
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-6">
              {/* Filter Header Skeleton */}
              <div className="flex items-center mb-6 pb-4 border-b border-orange-200">
                <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              
              {/* Location/Region Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-orange-200">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
              
              {/* Experience Years Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-orange-200">
                <div className="h-4 bg-gray-200 rounded w-28 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
              
              
              {/* Broker Type Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-orange-200">
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
              <div className="mb-6 pb-6 border-b border-orange-200">
                <div className="h-4 bg-gray-200 rounded w-12 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
              
              
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-5">
          
          {/* Filter Results Heading */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 style={{ fontSize: '20px', lineHeight: '28px', fontWeight: '600', color: '#171A1FFF' }}>Filter Results</h3>
          </div>

          {/* Region/Area */}
          <div>
            <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Region/Area</label>
            {regionsLoading ? (
              <div className="h-9 bg-gray-100 rounded border border-gray-200 animate-pulse"></div>
            ) : regions.length === 0 ? (
              <div className="text-sm text-gray-500">No regions available</div>
            ) : (
              <Select
                instanceId="brokers-region-select"
                styles={reactSelectStyles}
                className="cursor-pointer"
                options={regions.map(r => ({ value: r, label: r }))}
                value={brokerFilters.region && brokerFilters.region.length > 0 ? { value: brokerFilters.region[0], label: brokerFilters.region[0] } : null}
                onChange={(opt) => setBrokerFilters(prev => ({
                  ...prev, 
                  region: opt ? [opt.value] : []
                }))}
                isSearchable
                isClearable
                placeholder="Select Region"
              />
            )}
          </div>

          {/* Specialization/Property Type */}
          <div>
            <label className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Specialization/Property Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['Residential', 'Commercial', 'Plot', 'Rental', 'Industrial'].map((type) => {
                const selected = brokerFilters.brokerType.includes(type);
                return (
                  <label key={type} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleBrokerTypeChange(type)}
                      className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                    />
                    <span className="ml-3" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '400', color: '#171A1FFF' }}>{type}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Rating</label>
            <Select
              instanceId="rating-select"
              styles={reactSelectStyles}
              className="cursor-pointer"
              options={[
                { value: '4', label: '4★ and above' },
                { value: '3', label: '3★ and above' },
                { value: '2', label: '2★ and above' },
                { value: '1', label: '1★ and above' }
              ]}
              value={brokerFilters.ratingRange[0] >= 4 ? { value: '4', label: '4★ and above' } : 
                     brokerFilters.ratingRange[0] >= 3 ? { value: '3', label: '3★ and above' } :
                     brokerFilters.ratingRange[0] >= 2 ? { value: '2', label: '2★ and above' } :
                     { value: '1', label: '1★ and above' }}
              onChange={(opt) => setBrokerFilters(prev => ({ ...prev, ratingRange: [parseFloat(opt?.value || 0), 5] }))}
              placeholder="Select Rating"
            />
          </div>

          {/* Show Verified Brokers Only */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={brokerFilters.showVerifiedOnly}
                onChange={(e) => setBrokerFilters(prev => ({ ...prev, showVerifiedOnly: e.target.checked }))}
                className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
              />
              <span className="ml-3" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '400', color: '#171A1FFF' }}>Show Verified Brokers Only</span>
            </label>
          </div>

          {/* Experience/Activity Level */}
          <div>
            <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Experience/Activity Level</label>
            <Select
              instanceId="experience-select"
              styles={reactSelectStyles}
              className="cursor-pointer"
              options={[
                { value: '5', label: '5+ Years' },
                { value: '10', label: '10+ Years' },
                { value: '15', label: '15+ Years' },
                { value: '20', label: '20+ Years' }
              ]}
              value={brokerFilters.experienceRange[0] >= 20 ? { value: '20', label: '20+ Years' } :
                     brokerFilters.experienceRange[0] >= 15 ? { value: '15', label: '15+ Years' } :
                     brokerFilters.experienceRange[0] >= 10 ? { value: '10', label: '10+ Years' } :
                     brokerFilters.experienceRange[0] >= 5 ? { value: '5', label: '5+ Years' } : null}
              onChange={(opt) => setBrokerFilters(prev => ({ ...prev, experienceRange: [parseInt(opt?.value || 0), 20] }))}
              placeholder="Select Experience"
            />
          </div>

          {/* Leads Closed/Deals Completed */}
          <div>
            <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Leads Closed/Deals Completed</label>
            <Select
              instanceId="deals-select"
              styles={reactSelectStyles}
              className="cursor-pointer"
              options={[
                { value: '50', label: '50+' },
                { value: '100', label: '100+' },
                { value: '200', label: '200+' },
                { value: '500', label: '500+' }
              ]}
              placeholder="Select Deals"
            />
          </div>

          {/* Badges */}
          <div>
            <label className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Badges</label>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                />
                <span className="ml-3" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '400', color: '#171A1FFF' }}>Verified</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                />
                <span className="ml-3" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '400', color: '#171A1FFF' }}>Top Badge</span>
              </label>
            </div>
          </div>

          {/* Secondary Filters Toggle */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowSecondaryFilters(!showSecondaryFilters)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <span>More Filters</span>
              <svg className="w-4 h-4 transition-transform" style={{ transform: showSecondaryFilters ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Secondary Filters */}
          {showSecondaryFilters && (
            <div className="space-y-5 pt-4">
              {/* Firm/Company Name */}
              <div>
                <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Firm/Company Name</label>
                <input
                  type="text"
                  placeholder="e.g., ABC Realty"
                  value={secondaryFilters.companyName}
                  onChange={(e) => setSecondaryFilters(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-green-900 text-sm"
                />
              </div>

              {/* Language Preference */}
              <div>
                <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Language Preference</label>
                <Select
                  instanceId="language-select"
                  styles={reactSelectStyles}
                  className="cursor-pointer"
                  options={[
                    { value: 'english', label: 'English' },
                    { value: 'hindi', label: 'Hindi' },
                    { value: 'other', label: 'Other' }
                  ]}
                  value={secondaryFilters.language ? { value: secondaryFilters.language, label: secondaryFilters.language } : null}
                  onChange={(opt) => setSecondaryFilters(prev => ({ ...prev, language: opt?.value || '' }))}
                  placeholder="Select Language"
                />
              </div>

              {/* Broker Status */}
              <div>
                <label className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Broker Status</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Online', 'Busy', 'Active', 'Offline'].map((status) => (
                    <label key={status} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={secondaryFilters.brokerStatus.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSecondaryFilters(prev => ({ ...prev, brokerStatus: [...prev.brokerStatus, status] }));
                          } else {
                            setSecondaryFilters(prev => ({ ...prev, brokerStatus: prev.brokerStatus.filter(s => s !== status) }));
                          }
                        }}
                        className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                      />
                      <span className="ml-3" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '400', color: '#171A1FFF' }}>{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Response Rate */}
              <div>
                <label className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Response Rate</label>
                <div className="space-y-2">
                  {['Fast Responders', 'Highly Active'].map((rate) => (
                    <label key={rate} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={secondaryFilters.responseRate.includes(rate)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSecondaryFilters(prev => ({ ...prev, responseRate: [...prev.responseRate, rate] }));
                          } else {
                            setSecondaryFilters(prev => ({ ...prev, responseRate: prev.responseRate.filter(r => r !== rate) }));
                          }
                        }}
                        className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                      />
                      <span className="ml-3" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '400', color: '#171A1FFF' }}>{rate}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Joined Date */}
              <div>
                <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Joined Date</label>
                <Select
                  instanceId="joined-date-select"
                  styles={reactSelectStyles}
                  className="cursor-pointer"
                  options={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'recent', label: 'Recently Joined' }
                  ]}
                  value={secondaryFilters.joinedDate ? { value: secondaryFilters.joinedDate, label: secondaryFilters.joinedDate } : null}
                  onChange={(opt) => setSecondaryFilters(prev => ({ ...prev, joinedDate: opt?.value || '' }))}
                  placeholder="Select Date"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}>Sort By</label>
                <Select
                  instanceId="sort-select"
                  styles={reactSelectStyles}
                  className="cursor-pointer"
                  options={[
                    { value: 'rating-high', label: 'Top Rated' },
                    { value: 'rating-low', label: 'Lowest Rated' },
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' }
                  ]}
                  value={secondaryFilters.sortBy ? { value: secondaryFilters.sortBy, label: secondaryFilters.sortBy } : { value: 'rating-high', label: 'Top Rated' }}
                  onChange={(opt) => setSecondaryFilters(prev => ({ ...prev, sortBy: opt?.value || 'rating-high' }))}
                />
              </div>
            </div>
          )}

          {/* Action Buttons - Always Visible */}
          <div className="pt-4">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSecondaryFilters({
                    companyName: '',
                    language: '',
                    brokerStatus: [],
                    responseRate: [],
                    joinedDate: '',
                    sortBy: 'rating-high'
                  });
                  // Reset primary filters as well
                  setBrokerFilters({
                    region: [],
                    brokerType: [],
                    ratingRange: [0, 5],
                    experienceRange: [0, 999],
                    showVerifiedOnly: false
                  });
                }}
                style={{
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontWeight: '500',
                  color: '#171A1FFF'
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-white hover:border-gray-300 active:bg-white transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  // Apply filters logic here
                  setShowSecondaryFilters(false);
                }}
                className="flex-1 px-3 py-2 bg-green-900 rounded-lg text-sm font-medium text-white hover:bg-green-800 transition-colors"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontWeight: '500'
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Brokers Grid - 9 columns */}
      <div className="col-span-9">
        {/* Tabs Bar */}
        <TabsBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Header with heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Broker Search Results ({totalItems} Found)
          </h2>
        </div>
        
        {/* Brokers Grid */}
        {isLoading || brokersLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:gap-6">
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
          <div className="grid grid-cols-1 gap-4 lg:gap-6">
            {paginatedBrokers.map((broker) => {
              console.log('Rendering broker card for:', broker.name, {
                specializations: broker.specializations,
                firmName: broker.firmName,
                leadsCreated: broker.leadsCreated,
                locations: broker.locations
              });
              
              // Use raw broker data if transformed data is missing
              const actualSpecializations = broker.specializations || [];
              const actualFirmName = broker.firmName || '';
              const actualLeadsCreated = broker.leadsCreated || { count: 0, items: [] };
              const actualLocations = broker.locations || [];
              
              console.log('Actual data for', broker.name, {
                actualSpecializations,
                actualFirmName,
                actualLeadsCreated,
                actualLocations
              });
              
              return (
           <div
  key={broker.id}
  className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer"
  onClick={() => {
    const brokerId = broker.userIdRaw || broker.userId || broker._id || broker.id;
    router.push(`/broker-details/${brokerId}`);
  }}
  role="button"
  aria-label={`Open details for ${broker.name || 'broker'}`}
>
  {/* Header */}
  <div className="flex items-start gap-4 mb-5">
    {/* Avatar + Rating */}
    <div className="flex flex-col items-center">
      <img
        src={broker.profileImage}
        alt={broker.name}
        className="w-18 h-18 rounded-full object-cover"
      />

      {/* Rating chip */}
      <span
        className={`mt-[-5] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200`}
      >
        <svg
          className="w-3 h-3 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-xs font-semibold text-gray-800">
          {(() => {
            let rating = 3.0;
            const leadsCount = broker.leadsCreated?.count || 0;
            if (leadsCount > 0) rating += 0.5;
            if ((broker.specializations || []).length > 0) rating += 0.3;
            if (broker.firmName) rating += 0.2;
            if (broker.approvedByAdmin === 'unblocked') rating += 0.5;
            return Math.min(rating, 5.0).toFixed(1);
          })()}
        </span>
      </span>
    </div>

    {/* Name + Details */}
    <div className="flex-1">
      {/* Name + verified */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-inter text-sm leading-[14px] font-semibold text-[#171A1FFF]">
          {broker.name}
        </h3>
         {broker.approvedByAdmin === 'unblocked' && (
           <span
  className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#12B76A] text-[#12B76A] bg-white"
  title="Verified"
  aria-label="Verified"
>
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
</span>
         )}
      </div>

      {/* Specialization */}
      <div className="font-inter text-[12px] leading-[12px] font-normal text-[#565D6DFF] mb-1">
        {actualSpecializations.length > 0 ? (
          <>
            {actualSpecializations.slice(0, 1).map((type, i) => (
              <span key={i}>{type}</span>
            ))}
            {actualSpecializations.length > 1 && (
              <span> +{actualSpecializations.length - 1} more</span>
            )}
          </>
        ) : (
          <span>General Broker</span>
        )}
      </div>

      {/* Firm name */}
      {/* Firm name + Experience (same row) */}
<div className="flex items-center gap-4 mb-3">
  {/* Firm */}
  <span className="inline-flex items-center gap-1.5">
    <svg className="w-4 h-4 text-[#565D6DFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
    <span className="font-inter text-[12px] leading-[12px] font-normal text-[#565D6DFF]">
      {actualFirmName || 'Independent Broker'}
    </span>
  </span>

  {/* Experience */}
  <span className="inline-flex items-center gap-1.5">
   
    <span className="font-inter text-[12px] leading-[12px] font-normal text-[#565D6DFF]">
      {`${Math.max(0, parseInt(broker.experience ?? 0))} years experience`}
    </span>
  </span>
</div>


      
    </div>
  </div>

  {/* Address Chip */}
  {broker.address && (
    <div className="mb-3 px-4 py-2 rounded-md border border-yellow-300 bg-yellow-50">
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-[#171A1FFF]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"
          />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <div className="font-inter text-[12px] leading-[15px] font-normal text-[#19191FFF]">
          {broker.address}
        </div>
      </div>
    </div>
  )}

  {/* Location + Leads */}
  <div className="flex flex-wrap gap-2 mb-4">
    {actualLocations.slice(0, 1).map((location, i) => (
      <span
        key={i}
        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md flex items-center gap-2 border border-gray-200"
      >
        <svg
          className="w-4 h-4 text-gray-800"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>{location}</span>
      </span>
    ))}

    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md flex items-center gap-2 border border-gray-200">
      <svg
        className="w-4 h-4 text-gray-800"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3v-5a1 1 0 011-1h2a1 1 0 011 1v5h3a1 1 0 001-1V10"
        />
      </svg>
      <span>{actualLeadsCreated.count || 0} leads</span>
    </span>
  </div>

  {/* Top-right Actions */}
  <div className="absolute top-6 right-6 flex items-center gap-2">
    <button
      onClick={(e) => {
        e.stopPropagation();
        const brokerId = broker.userIdRaw || broker.userId || broker._id || broker.id;
        router.push(`/broker-details/${brokerId}`);
      }}
      className="p-2"
      title="View Details"
      aria-label="View Details"
    >
      <svg
        className="w-5 h-5 text-green-900"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        const brokerId = broker.userIdRaw || broker.userId || broker._id || broker.id;
        router.push(`/broker-details/${brokerId}?chat=1`);
      }}
      className="p-2"
      title="Chat"
      aria-label="Chat"
    >
      <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    </button>
  </div>
</div>

            );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4">
            {/* Left: Results info */}
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} results
            </div>

            {/* Right: Pagination buttons */}
            {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-1 overflow-x-auto">
                {/* Always show first page */}
                <button
                  onClick={() => handlePageChange(1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md font-medium ${
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
                    // Don't show page 1 (already shown above)
                    if (page === 1) return false;
                    // Don't show last page (shown below)
                    if (page === totalPages) return false;
                    
                    // Show pages 2-4 if current page is 1-3
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
                      className={`w-8 h-8 flex items-center justify-center rounded-md font-medium ${
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
                    className={`w-8 h-8 flex items-center justify-center rounded-md font-medium ${
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
                className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            )}
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
