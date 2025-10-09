'use client';

import React, { useState } from 'react';

const PropertiesComponent = () => {
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [5000000, 20000000],
    bedrooms: [],
    amenities: []
  });

  const [sortBy, setSortBy] = useState('default');

  const categories = ['Apartment', 'Villa', 'Plot/Land', 'Studio', 'Penthouse'];
  const bedroomOptions = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
  const amenitiesOptions = ['Gym', 'Swimming Pool', 'Parking', 'Security', 'Balcony'];

  const properties = [
    {
      id: 1,
      name: 'Skyline Heights',
      type: 'Apartment',
      details: '2 BHK',
      currentPrice: '$8,500,000.00',
      originalPrice: '$9,000,000.0',
      rating: '4.8',
      image: '/images/pexels-binyaminmellish-106399.jpg'
    },
    {
      id: 2,
      name: 'Green Meadows',
      type: 'Apartment',
      details: '3 BHK',
      currentPrice: '$12,500,000.00',
      originalPrice: '$13,500,000',
      rating: '4.9',
      image: '/images/pexels-davidmcbee-1546168.jpg'
    },
    {
      id: 3,
      name: 'Lakeview Residences',
      type: 'Apartment',
      details: '1 BHK',
      currentPrice: '$5,200,000.00',
      originalPrice: '$5,600,000.0',
      rating: '4.6',
      image: '/images/istockphoto-1165384568-612x612.jpg'
    },
    {
      id: 4,
      name: 'Palm Grove Villas',
      type: 'Villa',
      details: '4 BHK',
      currentPrice: '$12,000,000.00',
      originalPrice: '$14,000,000',
      rating: '4.7',
      image: '/images/istockphoto-1465618017-612x612.jpg'
    },
    {
      id: 5,
      name: 'Cityscape Studios',
      type: 'Studio',
      details: 'Studio',
      currentPrice: '$3,500,000.00',
      originalPrice: '$3,800,000.0',
      rating: '4.4',
      image: '/images/cocolapinescandinavianlivingroom-c602a303414341fb932f2d31e8769699.jpeg'
    },
    {
      id: 6,
      name: 'Oakwood Enclave',
      type: 'Apartment',
      details: '2 BHK',
      currentPrice: '$7,800,000.00',
      originalPrice: '$8,200,000.00',
      rating: '4.5',
      image: '/images/livingroom.jpg'
    }
  ];

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

  const handlePriceChange = (index, value) => {
    const newRange = [...filters.priceRange];
    newRange[index] = parseInt(value);
    setFilters(prev => ({
      ...prev,
      priceRange: newRange
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="flex gap-8">
      {/* Filter Sidebar */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          {/* Category Filter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-600">
                {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-2 bg-gray-200 rounded-lg relative">
                <div 
                  className="h-2 bg-blue-600 rounded-lg absolute top-0"
                  style={{
                    left: `${((filters.priceRange[0] - 1000000) / (20000000 - 1000000)) * 100}%`,
                    width: `${100 - ((filters.priceRange[0] - 1000000) / (20000000 - 1000000)) * 100}%`
                  }}
                ></div>
                <input
                  type="range"
                  min="1000000"
                  max="20000000"
                  step="500000"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(0, e.target.value)}
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-single"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms Filter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bedrooms</h3>
            <div className="space-y-3">
              {bedroomOptions.map((bedroom) => (
                <label key={bedroom} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.bedrooms.includes(bedroom)}
                    onChange={() => handleBedroomChange(bedroom)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{bedroom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities Filter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
            <div className="space-y-3">
              {amenitiesOptions.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="flex-1">
        {/* Header with sorting */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Showing {properties.length} of {properties.length} results</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default Sorting</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {property.type}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{property.rating}</span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.name}</h3>
                <p className="text-gray-600 mb-3">{property.details}</p>
                
                <div className="mb-4">
                  <div className="text-xl font-bold text-gray-900">{property.currentPrice}</div>
                  <div className="text-sm text-gray-500 line-through">{property.originalPrice}</div>
                </div>
                
                <button className="w-full bg-white border-2 border-blue-600 text-blue-600 py-2 px-4 rounded-md font-medium hover:bg-blue-50 transition-colors">
                  View Details
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

export default PropertiesComponent;
