
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Select from 'react-select';
import ContentLoader from 'react-content-loader';
import TabsBar from './TabsBar';

const PropertiesComponent = ({ activeTab, setActiveTab }) => {
  const [filters, setFilters] = useState({
    search: "",
    categories: [],
    priceRange: [0, 0],
    bedrooms: null, // Changed to single select
    amenities: []
  });

  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [imageIndexById, setImageIndexById] = useState({});
  const [propertyItems, setPropertyItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);
  const [secondaryFilters, setSecondaryFilters] = useState({
    bathrooms: null,
    furnishingType: null,
    facingDirection: null,
    possessionStatus: null,
    postedBy: null,
    verificationStatus: null
  });
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [propertyRatings, setPropertyRatings] = useState({}); // Map of propertyId -> average rating
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const timersRef = useRef({});

  // Trigger skeleton loader when switching between tabs from header
  useEffect(() => {
    if (hasLoaded) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(t);
    }
  }, [activeTab, hasLoaded]);

  // Fetch regions from API
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setRegionsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/regions`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          let regionsList = [];
          if (Array.isArray(data?.data?.items)) regionsList = data.data.items;
          else if (Array.isArray(data?.data?.regions)) regionsList = data.data.regions;
          else if (Array.isArray(data?.data)) regionsList = data.data;
          else if (Array.isArray(data?.regions)) regionsList = data.regions;
          else if (Array.isArray(data)) regionsList = data;
          
          const regionOptions = regionsList.map(region => ({
            value: region._id || region.id,
            label: `${region.name || ''}, ${region.city || ''}, ${region.state || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ','),
            regionId: region._id || region.id
          }));
          setRegions(regionOptions);
        }
      } catch (err) {
        console.error('Error fetching regions:', err);
        setRegions([]);
      } finally {
        setRegionsLoading(false);
      }
    };
    fetchRegions();
  }, []);

  // Fetch property ratings from API
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setRatingsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/property-ratings/all`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          let ratingsList = [];
          if (Array.isArray(data?.data?.items)) ratingsList = data.data.items;
          else if (Array.isArray(data?.data?.ratings)) ratingsList = data.data.ratings;
          else if (Array.isArray(data?.data)) ratingsList = data.data;
          else if (Array.isArray(data?.ratings)) ratingsList = data.ratings;
          else if (Array.isArray(data)) ratingsList = data;
          
          // Group ratings by propertyId and calculate average
          const ratingsMap = {};
          ratingsList.forEach(rating => {
            const propertyId = rating.propertyId || rating.property?._id || rating.property?.id;
            if (propertyId) {
              if (!ratingsMap[propertyId]) {
                ratingsMap[propertyId] = {
                  total: 0,
                  count: 0,
                  average: 0
                };
              }
              const ratingValue = typeof rating.rating === 'number' ? rating.rating : parseFloat(rating.rating) || 0;
              if (ratingValue > 0) {
                ratingsMap[propertyId].total += ratingValue;
                ratingsMap[propertyId].count += 1;
              }
            }
          });
          
          // Calculate averages
          const averagesMap = {};
          Object.keys(ratingsMap).forEach(propertyId => {
            const { total, count } = ratingsMap[propertyId];
            if (count > 0) {
              averagesMap[propertyId] = (total / count).toFixed(1);
            }
          });
          
          setPropertyRatings(averagesMap);
        }
      } catch (err) {
        console.error('Error fetching property ratings:', err);
        setPropertyRatings({});
      } finally {
        setRatingsLoading(false);
      }
    };
    fetchRatings();
  }, []);

  // Fetch properties from API with all filters
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        
        // Build query parameters with all filters
        const queryParams = new URLSearchParams();
        
        // Text search
        if (filters.search) {
          queryParams.append('search', filters.search);
        }
        
        // City filter
        if (filters.city) {
          queryParams.append('city', filters.city);
        }
        
        // Region filter
        if (selectedRegion?.regionId) {
          queryParams.append('regionId', selectedRegion.regionId);
        }
        
        // Property type filters
        if (filters.categories.length > 0) {
          const category = filters.categories[0];
          queryParams.append('propertyType', category);
        }
        
        // Bedrooms filter (single select - convert "5+" to "5")
        if (filters.bedrooms) {
          const bedroomsValue = filters.bedrooms.replace('+', '');
          queryParams.append('bedrooms', bedroomsValue);
        }
        
        // Bathrooms filter
        if (secondaryFilters.bathrooms) {
          const bathroomsValue = secondaryFilters.bathrooms.replace('+', '');
          queryParams.append('bathrooms', bathroomsValue);
        }
        
        // Price range (only add if > 0)
        if (filters.priceRange[0] && filters.priceRange[0] > 0) {
          queryParams.append('minPrice', String(filters.priceRange[0]));
        }
        if (filters.priceRange[1] && filters.priceRange[1] > 0) {
          queryParams.append('maxPrice', String(filters.priceRange[1]));
        }
        
        // Furnishing filter
        if (secondaryFilters.furnishingType) {
          queryParams.append('furnishing', secondaryFilters.furnishingType);
        }
        
        // Facing direction
        if (secondaryFilters.facingDirection) {
          queryParams.append('facingDirection', secondaryFilters.facingDirection);
        }
        
        // Possession status
        if (secondaryFilters.possessionStatus) {
          queryParams.append('possessionStatus', secondaryFilters.possessionStatus);
        }
        
        // Posted by
        if (secondaryFilters.postedBy) {
          queryParams.append('postedBy', secondaryFilters.postedBy);
        }
        
        // Verification status
        if (secondaryFilters.verificationStatus) {
          queryParams.append('verificationStatus', secondaryFilters.verificationStatus);
        }
        
        // Sorting (set default if not selected)
        if (sortBy && sortBy !== 'default') {
          queryParams.append('sortBy', sortBy);
          if (sortOrder) {
            queryParams.append('sortOrder', sortOrder);
          } else {
            queryParams.append('sortOrder', 'desc'); // default order
          }
        } else {
          // Default sort for properties (newest first)
          queryParams.append('sortBy', 'createdAt');
          queryParams.append('sortOrder', 'desc');
        }
        
        // Pagination (always include)
        queryParams.append('page', String(currentPage));
        queryParams.append('limit', String(itemsPerPage));
        
        const url = `${apiUrl}/properties?${queryParams.toString()}`;
        console.log('Fetching properties with filters:', url);
        console.log('Query params:', Object.fromEntries(queryParams));
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch properties');
        const data = await res.json().catch(() => ({}));

        let list = [];
        if (Array.isArray(data?.data?.items)) list = data.data.items;
        else if (Array.isArray(data?.data?.properties)) list = data.data.properties;
        else if (Array.isArray(data?.data)) list = data.data;
        else if (Array.isArray(data?.properties)) list = data.properties;
        else if (Array.isArray(data)) list = data;

        // Handle pagination from API response
        if (data.pagination) {
          const paginationData = {
            total: data.pagination.total || 0,
            page: data.pagination.page || currentPage,
            limit: data.pagination.limit || itemsPerPage,
            totalPages: data.pagination.totalPages || 0,
            hasNextPage: data.pagination.hasNextPage || false,
            hasPrevPage: data.pagination.hasPrevPage || false
          };
          setPagination(paginationData);
          // Don't update currentPage here as it's controlled by user pagination
        }

        const mapped = list.map((p, idx) => {
          const id = p._id || p.id || `${idx}`;
          const title = p.title || p.name || 'Property';
          const propertyType = p.propertyType || p.type || '';
          const subType = p.subType || '';
          const city = p.city || '';
          const regionRaw = p.region;
          const region = Array.isArray(regionRaw)
            ? regionRaw.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
            : (typeof regionRaw === 'string' ? regionRaw : regionRaw?.name);
          const bedrooms = typeof p.bedrooms === 'number' ? p.bedrooms : undefined;
          const bathrooms = typeof p.bathrooms === 'number' ? p.bathrooms : undefined;
          const areaSqft = p.propertySize || p.areaSqft || p.area || undefined;
          const amenities = Array.isArray(p.amenities) ? p.amenities : [];
          const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : [];
          const image = images[0] || '/images/pexels-binyaminmellish-106399.jpg';
          // Use rating from API if available, otherwise fall back to property rating or default
          const rating = propertyRatings[id] || p.rating || '4.7';
          const price = typeof p.price === 'number' ? p.price : undefined;
          const currentPrice = price ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price) : '-';
          const status = p.status || '';
          const address = p.address || '';

          const description = p.description || p.propertyDescription || '';

          return {
            id,
            name: title,
            type: propertyType || subType || 'Property',
            details: subType || propertyType || '',
            description,
            bedrooms,
            bathrooms,
            areaSqft,
            city,
            region,
            currentPrice,
            originalPrice: undefined,
            rating,
            image,
            images,
            amenities,
            status,
            address,
          };
        });

        setPropertyItems(mapped);
        setHasLoaded(true);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setPropertyItems([]);
        setHasLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [currentPage, itemsPerPage, filters, secondaryFilters, selectedRegion, sortBy, sortOrder]);

  // Update property ratings when ratings data is loaded (without re-fetching properties)
  useEffect(() => {
    if (Object.keys(propertyRatings).length > 0 && propertyItems.length > 0) {
      setPropertyItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          rating: propertyRatings[item.id] || item.rating || '4.7'
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyRatings]);

  // Handle sort change from TabsBar
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change (but not on initial load)
  useEffect(() => {
    if (hasLoaded) {
      setCurrentPage(1);
    }
  }, [filters, secondaryFilters, selectedRegion, sortBy, sortOrder]);

  // Auto-rotate property images per card (independent timers per card)
  useEffect(() => {
    // clear old timers
    Object.values(timersRef.current).forEach((t) => clearInterval(t));
    timersRef.current = {};
    // create timers per property with random stagger to avoid sync
    (propertyItems || []).forEach((p, idx) => {
      const imgs = Array.isArray(p.images) ? p.images : [p.image];
      if (!imgs || imgs.length <= 1) return;
      const delay = 2800 + Math.floor(Math.random() * 1700); // 2.8s - 4.5s
      timersRef.current[p.id] = setInterval(() => {
        setImageIndexById((prev) => ({
          ...prev,
          [p.id]: ((prev[p.id] ?? 0) + 1) % imgs.length,
        }));
      }, delay);
    });
    return () => {
      Object.values(timersRef.current).forEach((t) => clearInterval(t));
      timersRef.current = {};
    };
  }, [propertyItems]);

  const reactSelectStyles = {
    control: (base) => ({
      ...base,
      fontSize: 12,
      borderColor: '#d1d5db',
      boxShadow: 'none',
      minHeight: 38,
      ':hover': { borderColor: '#0A421E' }
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 12,
      backgroundColor: state.isSelected ? '#0A421E' : state.isFocused ? '#ECFDF5' : 'white',
      color: state.isSelected ? 'white' : '#111827'
    }),
    singleValue: (base) => ({ ...base, color: '#111827', fontSize: 12 }),
    placeholder: (base) => ({ ...base, color: '#6b7280', fontSize: 12 }),
    input: (base) => ({ ...base, fontSize: 12 }),
    indicatorSeparator: () => ({ display: 'none' })
  };

  const categories = ['Residential', 'Commercial', 'Plot', 'Other'];
  const bedroomOptions = ['1', '2', '3', '4', '5+'];
  const amenitiesOptions = ['Gym', 'Swimming Pool', 'Parking', 'Security', 'Balcony'];

  // Using API-backed propertyItems state instead of hardcoded list

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories[0] === category ? [] : [category]
    }));
  };

  const handleBedroomChange = (bedroom) => {
    setFilters(prev => ({
      ...prev,
      bedrooms: prev.bedrooms === bedroom ? null : bedroom // Single select - toggle off if same, select if different
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      categories: [],
      priceRange: [0, 0],
      bedrooms: null, // Changed to null for single select
      amenities: [],
      city: '' // Reset city filter if it exists
    });
    // Reset secondary filters
    setSecondaryFilters({
      bathrooms: null,
      furnishingType: null,
      facingDirection: null,
      possessionStatus: null,
      postedBy: null,
      verificationStatus: null
    });
    // Reset region selection
    setSelectedRegion(null);
    // Reset sorting
    setSortBy(null);
    setSortOrder(null);
    // Reset pagination
    setCurrentPage(1);
    // Reset secondary filters visibility
    setShowSecondaryFilters(false);
  };

  const handlePriceChange = (index, value) => {
    const newRange = [...filters.priceRange];
    newRange[index] = parseInt(value);
    setFilters(prev => ({
      ...prev,
      priceRange: newRange
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
    <div className="grid grid-cols-12 gap-8">
      {/* Filter Sidebar - 3 columns */}
      <div className="col-span-3">
        {isLoading ? (
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-6">
              {/* Filter Header Skeleton */}
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              
              {/* Category Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="space-y-3">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="ml-3 h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-12 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
              
              {/* Bedrooms Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                <div className="space-y-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="ml-3 h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Amenities Filter Skeleton */}
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                <div className="space-y-3">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="ml-3 h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
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
            <h2 style={{ fontSize: '20px', lineHeight: '28px', fontWeight: '600', color: '#171A1FFF' }}>Filter Results</h2>
          </div>


          {/* Property Type Filter */}
          <div className="mb-5">
            <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Property Type</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const selected = filters.categories[0] === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '11px',
                      lineHeight: '20px',
                      fontWeight: '500',
                      color: '#171A1FFF',
                      background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                      borderRadius: '6px',
                      transition: 'all 0.2s',
                    }}
                    className={`p-[10px] transition-colors ${
                      selected 
                        ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                        : 'hover:bg-[#B8BECAFF]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region/Location Filter */}
          <div className="mb-5">
            <h3 className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Region/Location</h3>
            <Select
              instanceId="property-region-select"
              styles={reactSelectStyles}
              className="cursor-pointer"
              options={regions}
              value={selectedRegion}
              onChange={(option) => setSelectedRegion(option)}
              placeholder={regionsLoading ? "Loading regions..." : "Select Region"}
              isSearchable
              isClearable
              isLoading={regionsLoading}
            />
          </div>

          {/* Price/Budget Range (INR) Filter */}
          <div className="mb-5">
            <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Price/Budget Range (INR)</h3>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange(0, parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-900 focus:outline-none text-xs"
              />
                  <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-900 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Bedrooms (BHK) Filter */}
          <div className="mb-5">
            <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Bedrooms (BHK)</h3>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map((bedroom) => {
                const selected = filters.bedrooms === bedroom; // Single select - check equality
                return (
                  <button
                    key={bedroom}
                    type="button"
                    onClick={() => handleBedroomChange(bedroom)}
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '11px',
                      lineHeight: '20px',
                      fontWeight: '500',
                      color: '#171A1FFF',
                      background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                      borderRadius: '6px',
                      transition: 'all 0.2s',
                    }}
                    className={`p-[10px] transition-colors ${
                      selected 
                        ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                        : 'hover:bg-[#B8BECAFF]'
                    }`}
                  >
                    {bedroom}
                  </button>
                );
              })}
              </div>
            </div>

          {/* More Filters Toggle */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowSecondaryFilters(!showSecondaryFilters)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
              style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '20px', fontWeight: '500', color: '#171A1FFF' }}
            >
              <span>More Filters</span>
              <svg className="w-4 h-4 transition-transform" style={{ transform: showSecondaryFilters ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Secondary Filters Content */}
          {showSecondaryFilters && (
            <div className="space-y-5 pt-4">
              {/* Property Size/Area (Sq. Ft.) */}
              <div>
                <h3 className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Property Size/Area (Sq. Ft.)</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="1000"
                    className="w-full p-[10px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-900 focus:outline-none text-xs"
                  />
                <input
                    type="number"
                    placeholder="2500"
                    className="w-full p-[10px] border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-900 focus:outline-none text-xs"
                />
              </div>
              </div>

              {/* Bathrooms */}
              <div>
                <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Bathrooms</h3>
                <div className="flex flex-wrap gap-2">
                  {['1', '2', '3', '4+'].map((bath) => {
                    const selected = secondaryFilters.bathrooms === bath;
                    return (
                      <button
                        key={bath}
                        type="button"
                        onClick={() => setSecondaryFilters(prev => ({ ...prev, bathrooms: prev.bathrooms === bath ? null : bath }))}
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '11px',
                          lineHeight: '20px',
                          fontWeight: '500',
                          color: '#171A1FFF',
                          background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                          borderRadius: '6px',
                          transition: 'all 0.2s',
                        }}
                        className={`p-[10px] transition-colors ${
                          selected 
                            ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                            : 'hover:bg-[#B8BECAFF]'
                        }`}
                      >
                        {bath}
                      </button>
                    );
                  })}
            </div>
          </div>

              {/* Furnishing Type */}
              <div>
                <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Furnishing Type</h3>
                <div className="flex flex-wrap gap-2">
                  {['Furnished', 'Semi-Furnished', 'Unfurnished'].map((type) => {
                    const selected = secondaryFilters.furnishingType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSecondaryFilters(prev => ({ ...prev, furnishingType: prev.furnishingType === type ? null : type }))}
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '11px',
                          lineHeight: '20px',
                          fontWeight: '500',
                          color: '#171A1FFF',
                          background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                          borderRadius: '6px',
                          transition: 'all 0.2s',
                        }}
                        className={`p-[10px] transition-colors ${
                          selected 
                            ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                            : 'hover:bg-[#B8BECAFF]'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
            </div>
          </div>

              {/* Amenities (Checkboxes) */}
          <div>
                <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Parking', 'Security', 'Power Backup', 'Gym', 'Lift', 'Water Supply', 'Garden', 'Swimming Pool'].map((amenity) => (
                <label key={amenity} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                      <span className="ml-2" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '400', color: '#171A1FFF' }}>{amenity}</span>
                </label>
              ))}
                </div>
              </div>

              {/* Facing Direction */}
              <div>
                <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Facing Direction</h3>
                <div className="flex flex-wrap gap-2">
                  {['North', 'East', 'South', 'West'].map((direction) => {
                    const selected = secondaryFilters.facingDirection === direction;
                    return (
                      <button
                        key={direction}
                        type="button"
                        onClick={() => setSecondaryFilters(prev => ({ ...prev, facingDirection: prev.facingDirection === direction ? null : direction }))}
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '11px',
                          lineHeight: '20px',
                          fontWeight: '500',
                          color: '#171A1FFF',
                          background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                          borderRadius: '6px',
                          transition: 'all 0.2s',
                        }}
                        className={`p-[10px] transition-colors ${
                          selected 
                            ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                            : 'hover:bg-[#B8BECAFF]'
                        }`}
                      >
                        {direction}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Possession Status */}
              <div>
                <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Possession Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['Ready to Move', 'Under Construction', 'Upcoming'].map((status) => {
                    const selected = secondaryFilters.possessionStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSecondaryFilters(prev => ({ ...prev, possessionStatus: prev.possessionStatus === status ? null : status }))}
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '11px',
                          lineHeight: '20px',
                          fontWeight: '500',
                          color: '#171A1FFF',
                          background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                          borderRadius: '6px',
                          transition: 'all 0.2s',
                        }}
                        className={`p-[10px] transition-colors ${
                          selected 
                            ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                            : 'hover:bg-[#B8BECAFF]'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Posted By */}
              <div>
                <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Posted By</h3>
                <div className="flex flex-wrap gap-2">
                  {['Broker', 'Admin'].map((postedBy) => {
                    const selected = secondaryFilters.postedBy === postedBy;
                    return (
                      <button
                        key={postedBy}
                        type="button"
                        onClick={() => setSecondaryFilters(prev => ({ ...prev, postedBy: prev.postedBy === postedBy ? null : postedBy }))}
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '11px',
                          lineHeight: '20px',
                          fontWeight: '500',
                          color: '#171A1FFF',
                          background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                          borderRadius: '6px',
                          transition: 'all 0.2s',
                        }}
                        className={`p-[10px] transition-colors ${
                          selected 
                            ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                            : 'hover:bg-[#B8BECAFF]'
                        }`}
                      >
                        {postedBy}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Posted */}
              <div>
                <h3 className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Date Posted</h3>
                <div className="relative">
                  <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    placeholder="Pick a date"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-green-900 text-sm"
                  />
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Verification Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['Verified', 'Unverified'].map((status) => {
                    const selected = secondaryFilters.verificationStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSecondaryFilters(prev => ({ ...prev, verificationStatus: prev.verificationStatus === status ? null : status }))}
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '11px',
                          lineHeight: '20px',
                          fontWeight: '500',
                          color: '#171A1FFF',
                          background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                          borderRadius: '6px',
                          transition: 'all 0.2s',
                        }}
                        className={`p-[10px] transition-colors ${
                          selected 
                            ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                            : 'hover:bg-[#B8BECAFF]'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* Action Buttons - Always Visible */}
          <div className="pt-4 border-t border-gray-200 mt-5">
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                style={{
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  lineHeight: '22px',
                  fontWeight: '500',
                  color: '#171A1FFF'
                }}
                className="flex-1  py-1 border border-gray-300 text-[12px] font-medium rounded-lg bg-white hover:bg-white hover:border-gray-300 active:bg-white transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setShowSecondaryFilters(false);
                  setCurrentPage(1); // Reset to page 1 and trigger refetch
                }}
                className="flex-1 py-1 bg-green-900 rounded-lg text-[12px] font-medium text-white hover:bg-green-800 transition-colors"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '12px',
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

      {/* Properties Grid - 9 columns */}
      <div className="col-span-9">
        {/* Tabs Bar */}
        <TabsBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        {/* Properties Grid */}
        {isLoading ? (
          <div className="space-y-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex">
                  {/* Image Section Skeleton - Left */}
                  <div className="relative w-[400px] h-[260px] flex-shrink-0">
                    <ContentLoader
                      speed={2}
                      width={400}
                      height={260}
                      viewBox="0 0 400 260"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                      className="rounded-l-xl"
                    >
                      {/* Main image */}
                      <rect x="0" y="0" rx="0" ry="0" width="400" height="260" />
                      {/* Tag overlay top-left */}
                      <rect x="16" y="16" rx="12" ry="12" width="60" height="24" />
                      {/* Rating badge top-right */}
                      <circle cx="370" cy="24" r="16" />
                      <rect x="340" y="20" rx="4" ry="4" width="24" height="8" />
                      {/* Price pill bottom-left */}
                      <rect x="16" y="228" rx="12" ry="12" width="90" height="24" />
                      {/* Share button bottom-right */}
                      <circle cx="370" cy="232" r="20" />
                    </ContentLoader>
                  </div>
                  
                  {/* Details Section Skeleton - Right */}
                  <div className="flex-1 p-5 h-[260px] flex flex-col">
                    <ContentLoader
                      speed={2}
                      width={500}
                      height={260}
                      viewBox="0 0 500 260"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                    >
                      {/* Title */}
                      <rect x="0" y="0" rx="4" ry="4" width="200" height="20" />
                      {/* Verified badge */}
                      <rect x="210" y="2" rx="4" ry="4" width="16" height="16" />
                      
                      {/* Description */}
                      <rect x="0" y="32" rx="4" ry="4" width="418" height="12" />
                      <rect x="0" y="50" rx="4" ry="4" width="350" height="12" />
                      <rect x="0" y="68" rx="4" ry="4" width="300" height="12" />
                      
                      {/* Location icon and text */}
                      <circle cx="6" cy="100" r="6" />
                      <rect x="18" y="96" rx="4" ry="4" width="100" height="14" />
                      
                      <circle cx="6" cy="120" r="6" />
                      <rect x="18" y="116" rx="4" ry="4" width="250" height="14" />
                      
                      {/* Features label */}
                      <rect x="0" y="150" rx="4" ry="4" width="60" height="14" />
                      {/* Bedroom badge */}
                      <rect x="0" y="172" rx="12" ry="12" width="70" height="28" />
                      {/* Bathroom badge */}
                      <rect x="78" y="172" rx="12" ry="12" width="70" height="28" />
                      
                      {/* Amenities label */}
                      <rect x="0" y="220" rx="4" ry="4" width="70" height="14" />
                      {/* Amenity pills */}
                      <rect x="0" y="242" rx="12" ry="12" width="60" height="20" />
                      <rect x="68" y="242" rx="12" ry="12" width="60" height="20" />
                      <rect x="136" y="242" rx="12" ry="12" width="70" height="20" />
                      <rect x="214" y="242" rx="12" ry="12" width="80" height="20" />
                    </ContentLoader>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
          {/* Results Heading */}
          <div className="mb-6">
            <h2 className="text-[18px] font-semibold text-gray-900">
              Property Search Results ({propertyItems.length} Found)
            </h2>
          </div>

          {!isLoading && hasLoaded && propertyItems.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-full mx-auto px-6 py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <div className="flex flex-col items-center justify-center text-center">
                  {/* Image/Icon */}
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  </div>
                  {/* Primary Message */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No properties found
                  </h3>
                  {/* Secondary Message */}
                  <p className="text-sm text-gray-500 mb-6 max-w-md">
                    {                    filters.categories.length > 0 || 
                    filters.bedrooms !== null || 
                    filters.amenities.length > 0 ||
                    filters.priceRange[0] > 0 || 
                    filters.priceRange[1] > 0 ||
                    filters.search ||
                    selectedRegion ||
                    Object.values(secondaryFilters).some(v => v !== null)
                      ? "We couldn't find any properties matching your current filters. Try adjusting your search criteria."
                      : "No properties are available at the moment. Please check back later or contact us for assistance."}
                  </p>
                  {/* Action Buttons */}
                  {(filters.categories.length > 0 || 
                    filters.bedrooms !== null || 
                    filters.amenities.length > 0 ||
                    filters.priceRange[0] > 0 || 
                    filters.priceRange[1] > 0 ||
                    filters.search ||
                    selectedRegion ||
                    Object.values(secondaryFilters).some(v => v !== null)) && (
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center px-6 py-2.5 bg-green-900 text-white text-sm font-semibold rounded-lg hover:bg-green-950 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
          <>
          <div className="space-y-6">
            {/* Property cards - horizontal layout */}
            {propertyItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((property) => (
            <Link key={property.id} href={`/property-details/${property.id}`} className="block">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex">
                  {/* Image Section - Left */}
                  <div className="relative w-[400px] h-[260px] flex-shrink-0">
                {/* Image carousel */}
                    <div className="relative w-full h-full overflow-hidden rounded-l-xl">
                  {(() => {
                    const imgs = Array.isArray(property.images) ? property.images : [property.image];
                    const idx = imageIndexById[property.id] ?? 0;
                    return (
                      <>
                        {imgs.map((src, i) => (
                          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === i ? 'opacity-100' : 'opacity-0'}`}>
                            <img src={src} alt={`${property.name}-${i}`} className="block w-full h-full object-cover" />
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
                    {/* Tag overlay - top-left */}
                    <div className="absolute top-4 left-4">
                  <span 
                    className="inline-flex items-center justify-center rounded-full h-[22px] p-[10px] whitespace-nowrap"
                    style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '20px', fontWeight: '600', background: '#FDC700', color: '#1b1d20ff' }}
                  >
                    {property.type}
                  </span>
                </div>
                    {/* Rating - top-right */}
                    <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur rounded-full px-2 py-1 shadow-sm">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">{property.rating}</span>
                </div>
                {/* Price pill bottom-left */}
                    <div className="absolute bottom-4 left-4 z-10">
                      <span className="inline-flex items-center justify-center rounded-full h-[22px] p-[10px] whitespace-nowrap"
                    style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '20px', fontWeight: '600', background: '#FDC700', color: '#1b1d20ff' }}
                  >
                    {property.currentPrice}
                  </span>
                </div>
                {/* Share icon bottom-right */}
                    <button 
                      aria-label="Share" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const propertyUrl = `${window.location.origin}/property-details/${property.id}`;
                        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`;
                        window.open(facebookShareUrl, '_blank', 'width=600,height=400');
                      }}
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-gray-700 z-10 cursor-pointer"
                    >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
              
                  {/* Details Section - Right */}
                  <div className="flex-1 p-5 h-[260px] flex flex-col">
                    {/* Title */}
                    <h3 className="mb-2 flex items-center gap-2" style={{  fontSize: '16px', lineHeight: '22px', fontWeight: '600', color: '#171A1FFF' }}>
                      {property.name}
                      <svg className="w-3.5 h-3.5 text-[#0A421E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M7 17l10-10M7 7h10v10" />
                      </svg>
                    </h3>
                    
                    {/* Description */}
                    <p className="mb-3" style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px', fontWeight: '400', color: '#565D6DFF', width: '418px' }}>
                      {property.description || `A spacious and well-lit property in a prime location, perfect for families. Enjoy modern amenities and easy access to city facilities.`}
                    </p>
                    
                    {/* Location Details */}
                    <div className="flex flex-col gap-2 mb-3">
                      {/* <div className="flex items-center text-[12px] text-gray-600">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {property.city || 'Agra'}
                </div> */}
                      <div className="flex items-center text-[12px] text-gray-600">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s-7-4.5-7-12a7 7 0 1114 0c0 7.5-7 12-7 12z" />
                    <circle cx="12" cy="10" r="3" strokeWidth="2" />
                  </svg>
                  {Array.isArray(property.region)
                    ? property.region.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean).join(', ')
                          : (typeof property.region === 'string' ? property.region : property.region?.name) || 'Electronic City, Noida, Uttar Pradesh, India'}
                </div>
                </div>

                    {/* Features */}
                    <div className="mb-2">
                      <div className="text-[12px] font-semibold text-gray-900 mb-2">Features</div>
                      <div className="flex flex-wrap gap-2">
                        {property.bedrooms && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1" style={{ background: '#EDFDF4FF', borderRadius: '9999px', borderWidth: '1px', borderColor: '#00000000', borderStyle: 'solid' }}>
                            <svg className="w-4 h-4" style={{ color: '#19191FFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 12l-1 8a2 2 0 002 2h16a2 2 0 002-2l-1-8M3 12V9a2 2 0 012-2h5m0 0h6a2 2 0 012 2v3m0 0v3a2 2 0 01-2 2h-6v0M9 21h6" />
                    </svg>
                            <span style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px', fontWeight: '600', color: '#19191FFF' }}>{property.bedrooms} bd</span>
                  </span>
                        )}
                        {property.bathrooms && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1" style={{ background: '#EDFDF4FF', borderRadius: '9999px', borderWidth: '1px', borderColor: '#00000000', borderStyle: 'solid' }}>
                            <svg className="w-4 h-4" style={{ color: '#19191FFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0h4a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h8zm0 0v4" />
                    </svg>
                            <span style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px', fontWeight: '600', color: '#19191FFF' }}>{property.bathrooms} bt</span>
                    </span>
                  )}
                      </div>
                </div>

                    {/* Amenities */}
                    <div className="mt-auto">
                      <div className="text-[12px] font-semibold text-gray-900 mb-2">Amenities</div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                        {(() => {
                          const amenitiesList = Array.isArray(property.amenities) && property.amenities.length > 0 ? property.amenities : ['Gym', 'Parking', 'Security', 'Swimming Pool', 'Clubhouse'];
                          const displayCount = amenitiesList.length > 2 ? 2 : amenitiesList.length;
                          const remainingCount = amenitiesList.length - displayCount;
                          
                          return (
                            <>
                              {amenitiesList.slice(0, displayCount).map((amenity, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {remainingCount > 0 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                  +{remainingCount}
                                </span>
                              )}
                            </>
                          );
                        })()}
                  </div>
                </div>
                  </div>
              </div>
              </div>
            </Link>
          ))}
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </p>
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrevPage}
                    className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                      !pagination.hasPrevPage
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let page;
                    if (pagination.totalPages <= 5) {
                      page = i + 1;
                    } else if (pagination.page <= 3) {
                      page = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      page = pagination.totalPages - 4 + i;
                    } else {
                      page = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                          pagination.page === page
                            ? 'bg-green-900 text-white border-green-900'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={!pagination.hasNextPage}
                    className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                      !pagination.hasNextPage
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
          </>
          )}
          </>
        )}
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
    </>
  );
};

export default PropertiesComponent;

