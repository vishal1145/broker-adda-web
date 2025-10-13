
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';

const PropertiesComponent = ({ activeTab, setActiveTab }) => {
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [5000000, 20000000],
    bedrooms: [],
    amenities: []
  });

  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [imageIndexById, setImageIndexById] = useState({});
  const timersRef = useRef({});

  // Trigger skeleton loader when switching between tabs from header
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Auto-rotate property images per card (effect moved below properties definition)

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

  const categories = ['Apartment', 'Villa', 'Plot/Land', 'Studio', 'Penthouse'];
  const bedroomOptions = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
  const amenitiesOptions = ['Gym', 'Swimming Pool', 'Parking', 'Security', 'Balcony'];

  const properties = [
    {
      id: 1,
      name: 'Skyline Heights',
      type: 'Apartment',
      details: '2 BHK',
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1250,
      city: 'Mumbai',
      region: 'Bandra West',
      currentPrice: '₹8,50,00,000',
      originalPrice: '₹9,00,00,000',
      rating: '4.8',
      image: '/images/pexels-binyaminmellish-106399.jpg',
      images: [
        '/images/pexels-binyaminmellish-106399.jpg',
        '/images/istockphoto-1165384568-612x612.jpg',
        '/images/livingroom.jpg'
      ]
    },
    {
      id: 2,
      name: 'Green Meadows',
      type: 'Apartment',
      details: '3 BHK',
      bedrooms: 3,
      bathrooms: 3,
      areaSqft: 1650,
      city: 'Delhi',
      region: 'South Extension',
      currentPrice: '₹12,50,00,000',
      originalPrice: '₹13,50,00,000',
      rating: '4.9',
      image: '/images/pexels-davidmcbee-1546168.jpg',
      images: [
        '/images/pexels-davidmcbee-1546168.jpg',
        '/images/pexels-binyaminmellish-106399.jpg',
        '/images/livingroom.jpg'
      ]
    },
    {
      id: 3,
      name: 'Lakeview Residences',
      type: 'Apartment',
      details: '1 BHK',
      bedrooms: 1,
      bathrooms: 1,
      areaSqft: 780,
      city: 'Pune',
      region: 'Kharadi',
      currentPrice: '₹5,20,00,000',
      originalPrice: '₹5,60,00,000',
      rating: '4.6',
      image: '/images/istockphoto-1165384568-612x612.jpg',
      images: [
        '/images/istockphoto-1165384568-612x612.jpg',
        '/images/pexels-binyaminmellish-106399.jpg',
        '/images/pexels-davidmcbee-1546168.jpg'
      ]
    },
    {
      id: 4,
      name: 'Palm Grove Villas',
      type: 'Villa',
      details: '4 BHK',
      bedrooms: 4,
      bathrooms: 4,
      areaSqft: 2850,
      city: 'Bengaluru',
      region: 'Whitefield',
      currentPrice: '₹12,00,00,000',
      originalPrice: '₹14,00,00,000',
      rating: '4.7',
      image: '/images/istockphoto-1465618017-612x612.jpg',
      images: [
        '/images/istockphoto-1465618017-612x612.jpg',
        '/images/livingroom.jpg',
        '/images/pexels-binyaminmellish-106399.jpg'
      ]
    },
    {
      id: 5,
      name: 'Cityscape Studios',
      type: 'Studio',
      details: 'Studio',
      bedrooms: 1,
      bathrooms: 1,
      areaSqft: 520,
      city: 'Chennai',
      region: 'Adyar',
      currentPrice: '₹3,50,00,000',
      originalPrice: '₹3,80,00,000',
      rating: '4.4',
      image: '/images/cocolapinescandinavianlivingroom-c602a303414341fb932f2d31e8769699.jpeg',
      images: [
        '/images/cocolapinescandinavianlivingroom-c602a303414341fb932f2d31e8769699.jpeg',
        '/images/livingroom.jpg',
        '/images/istockphoto-1165384568-612x612.jpg'
      ]
    },
    {
      id: 6,
      name: 'Oakwood Enclave',
      type: 'Apartment',
      details: '2 BHK',
      bedrooms: 2,
      bathrooms: 2,
      areaSqft: 1350,
      city: 'Hyderabad',
      region: 'Gachibowli',
      currentPrice: '₹7,80,00,000',
      originalPrice: '₹8,20,00,000',
      rating: '4.5',
      image: '/images/livingroom.jpg',
      images: [
        '/images/livingroom.jpg',
        '/images/pexels-davidmcbee-1546168.jpg',
        '/images/istockphoto-1465618017-612x612.jpg'
      ]
    }
  ];

  // Auto-rotate property images per card (independent timers per card)
  useEffect(() => {
    // clear old timers
    Object.values(timersRef.current).forEach((t) => clearInterval(t));
    timersRef.current = {};
    // create timers per property with random stagger to avoid sync
    properties.forEach((p, idx) => {
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
  }, [properties]);

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleBedroomChange = (bedroom) => {
    setFilters(prev => ({
      ...prev,
      bedrooms: prev.bedrooms.includes(bedroom)
        ? prev.bedrooms.filter(b => b !== bedroom)
        : [...prev.bedrooms, bedroom]
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
      categories: [],
      priceRange: [5000000, 20000000],
      bedrooms: [],
      amenities: []
    });
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

          {/* Category Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Category</h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <label key={category} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="ml-3 text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Price</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-600">
                {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-2 bg-gray-200 rounded-lg relative">
                <div
                  className="h-2 bg-[#0A421E] rounded-lg absolute top-0"
                  style={{
                    left: '0%',
                    width: `${((filters.priceRange[1] - 1000000) / (20000000 - 1000000)) * 100}%`
                  }}
                ></div>
                <input
                  type="range"
                  min="1000000"
                  max="20000000"
                  step="500000"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(1, e.target.value)}
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-single"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Bedrooms</h3>
            <div className="space-y-3">
              {bedroomOptions.map((bedroom) => (
                <label key={bedroom} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.bedrooms.includes(bedroom)}
                    onChange={() => handleBedroomChange(bedroom)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="ml-3 text-sm text-gray-700">{bedroom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Amenities</h3>
            <div className="space-y-3">
              {amenitiesOptions.map((amenity) => (
                <label key={amenity} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 rounded focus:ring-green-900"
                  />
                  <span className="ml-3 text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Properties Grid - 9 columns */}
      <div className="col-span-9">
        

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Image Skeleton */}
                <div className="w-full h-48 bg-gray-200"></div>
                
                {/* Content Skeleton */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
            <div key={property.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow transition-transform duration-200 hover:-translate-y-1">
              <div className="relative p-3">
                {/* Image carousel */}
                <div className="relative h-56 overflow-hidden rounded-xl">
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
               
                {/* Slider controls removed as requested */}
                <div className="absolute top-6 left-6">
                  <span className="bg-[#0A421E] text-white px-3 py-1 rounded-full text-xs font-medium">
                    {property.type}
                  </span>
                </div>
                <div className="absolute top-6 right-6 flex items-center bg-white/90 backdrop-blur rounded-full px-2 py-1 shadow-sm">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">{property.rating}</span>
                </div>
                {/* Price pill bottom-left */}
                <div className="absolute bottom-[-0px] left-6 z-10">
                  <span className="px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)'
                    }}
                  >
                    {property.currentPrice}
                  </span>
                </div>
                {/* Share icon bottom-right */}
                <button aria-label="Share" className="absolute bottom-[-8px] right-6 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-gray-700 z-10 cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
              
              <div className="p-5">
                
                <div className="mt-2 flex items-center gap-1">
                  <h3 className="text-base font-semibold text-gray-900">{property.name}</h3>
                  <i className="fa-solid fa-arrow-right text-[12px] text-[#0A421E] px-2 mt-1 cursor-pointer" style={{ transform: 'rotate(320deg)' }} />
                </div>
                <p className="text-xs text-gray-900">Luxurious {property.type.toLowerCase()} retreat in prime location.</p>
<div className='flex gap-7'>
                {/* City */}
                <div className="mt-2 flex items-center text-xs text-gray-600">
                  <i className="fa-regular fa-building mr-1 text-[12px]" aria-hidden="true"></i>
                  {property.city}
                </div>
                {/* Region (Location icon) */}
                <div className="mt-2 flex items-center text-xs text-gray-600">
                  <svg className="w-4 h-4 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s-7-4.5-7-12a7 7 0 1114 0c0 7.5-7 12-7 12z" />
                    <circle cx="12" cy="10" r="3" strokeWidth="2" />
                  </svg>
                  {Array.isArray(property.region)
                    ? property.region.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean).join(', ')
                    : (typeof property.region === 'string' ? property.region : property.region?.name) || '-'}
                </div>
                </div>

                <div className="mt-3 text-xs font-medium text-gray-900">Features</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {/* Bed icon */}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12V9a2 2 0 012-2h7a3 3 0 013 3v2m0 0h4a2 2 0 012 2v3M4 12h14M4 19v-4m16 4v-4" />
                    </svg>
                    {property.bedrooms} bd
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {/* Bath icon */}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V7a3 3 0 016 0v3m-8 0h12a2 2 0 012 2v2a5 5 0 01-5 5H8a5 5 0 01-5-5v-2a2 2 0 012-2z" />
                    </svg>
                    {property.bathrooms} bt
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 ">
                    {/* Area icon (square with diagonal) */}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" strokeWidth="2" />
                      <path d="M6 18L18 6" strokeWidth="2" />
                    </svg>
                    {property.areaSqft.toLocaleString()} sq ft
                  </span>
                </div>

                {/* Amenities under features */}
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-900 mb-2">Amenities</div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {['Gym', 'Parking', 'Security'].map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center px-2 py-1 rounded-full border bg-gray-100 text-gray-700 border-gray-200"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* View All button removed as requested */}
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

export default PropertiesComponent;

