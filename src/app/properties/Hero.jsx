"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pagination, Stack } from "@mui/material";
// Local currency formatter (inlined to avoid external dependency)
const formatCurrency = (amount, { currency = 'USD', locale = 'en-US', minimumFractionDigits = 2, maximumFractionDigits = 2 } = {}) => {
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (Number.isNaN(num)) return '';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(num);
  } catch (_e) {
    return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
};

const PRODUCTS_PER_PAGE = 12;

const ShopHero = ({ data = { filters: { price: { min: 0, max: 1000 } }, products: [], sortOptions: [] } }) => {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get search query from URL params
  const searchQuery = searchParams.get('q');
  
  // Filter states with localStorage persistence
  const [selectedCategories, setSelectedCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopFilters_categories');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [selectedColors, setSelectedColors] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopFilters_colors');
      return saved ? JSON.parse(saved) : '';
    }
    return '';
  });

  const [selectedMaterials, setSelectedMaterials] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopFilters_materials');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [selectedAvailability, setSelectedAvailability] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopFilters_availability');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [priceRange, setPriceRange] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopFilters_priceRange');
      return saved ? JSON.parse(saved) : data.filters.price.max;
    }
    return data.filters.price.max;
  });

  const [activeFilters, setActiveFilters] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopFilters_activeFilters');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopFilters_sortBy');
      return saved ? JSON.parse(saved) : 'Default';
    }
    return 'Default';
  });

  // Filter products based on selected filters and search query
  const getFilteredProducts = () => {
    let filtered = data.products.filter(product => {
      // Search filter - check if product name contains search query
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase().trim();
        const productName = (product.name || product.title || '').toLowerCase();
        
        // Check if product name contains the search term
        if (!productName.includes(searchTerm)) {
          return false;
        }
      }
      
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.type)) {
        return false;
      }
      
      // Color filter (assuming product has color property)
      if (selectedColors && product.color !== selectedColors) {
        return false;
      }
      
      // Material filter (assuming product has material property)
      if (selectedMaterials.length > 0 && !selectedMaterials.includes(product.material)) {
        return false;
      }
      
      // Availability filter
      if (selectedAvailability.length > 0) {
        const isInStock = selectedAvailability.includes('In Stock');
        const isOutOfStock = selectedAvailability.includes('Out of Stock');
        
        if (isInStock && !product.inStock) return false;
        if (isOutOfStock && product.inStock) return false;
      }
      
      // Price filter
      if (priceRange < data.filters.price.max && product.price > priceRange) {
        return false;
      }
      
      return true;
    });

    // Sort products based on selected sort option
    switch (sortBy) {
      case 'Price: Low to High':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'Name: A to Z':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Name: Z to A':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'Rating: High to Low':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'Rating: Low to High':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'Newest First':
        filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        break;
      case 'Oldest First':
        filtered.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        break;
      default:
        // Default sorting (keep original order)
        break;
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedFilteredProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Initialize wishlist from localStorage
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('wishlist');
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    }
    return [];
  });

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      // Dispatch custom event to notify navbar about wishlist update
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  }, [wishlist]);

  const toggleHeart = (product) => {
    setWishlist((prevWishlist) => {
      const isInWishlist = prevWishlist.some(item => item.id === product.id);
      if (isInWishlist) {
        return prevWishlist.filter(item => item.id !== product.id);
      } else {
        return [...prevWishlist, product];
      }
    });
  };

  const [addCart, setAddCart] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(addCart));
      // Dispatch custom event to notify navbar about cart update
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [addCart]);

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedColors, selectedMaterials, selectedAvailability, priceRange, sortBy, searchQuery]);

  const handleAddCart = (product) => {
    setAddCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // If item exists, increase quantity
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Sort handler
  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopFilters_sortBy', JSON.stringify(sortOption));
    }
  };

  // Filter handlers
  const handleCategoryChange = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(cat => cat !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopFilters_categories', JSON.stringify(newCategories));
    }
    updateActiveFilters();
  };

  const handleColorChange = (color) => {
    const newColor = selectedColors === color ? '' : color;
    setSelectedColors(newColor);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopFilters_colors', JSON.stringify(newColor));
    }
    updateActiveFilters();
  };

  const handleMaterialChange = (material) => {
    const newMaterials = selectedMaterials.includes(material)
      ? selectedMaterials.filter(mat => mat !== material)
      : [...selectedMaterials, material];
    
    setSelectedMaterials(newMaterials);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopFilters_materials', JSON.stringify(newMaterials));
    }
    updateActiveFilters();
  };

  const handleAvailabilityChange = (availability) => {
    const newAvailability = selectedAvailability.includes(availability)
      ? selectedAvailability.filter(avail => avail !== availability)
      : [...selectedAvailability, availability];
    
    setSelectedAvailability(newAvailability);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopFilters_availability', JSON.stringify(newAvailability));
    }
    updateActiveFilters();
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopFilters_priceRange', JSON.stringify(value));
    }
    updateActiveFilters();
  };

  const updateActiveFilters = () => {
    const newActiveFilters = [];
    
    if (selectedCategories.length > 0) {
      newActiveFilters.push({ 
        type: 'categories', 
        label: `Categories: ${selectedCategories.join(', ')}`,
        value: selectedCategories 
      });
    }
    
    if (selectedColors) {
      newActiveFilters.push({ 
        type: 'color', 
        label: `Color: ${selectedColors}`,
        value: selectedColors 
      });
    }
    
    if (selectedMaterials.length > 0) {
      newActiveFilters.push({ 
        type: 'materials', 
        label: `Materials: ${selectedMaterials.join(', ')}`,
        value: selectedMaterials 
      });
    }
    
    if (selectedAvailability.length > 0) {
      newActiveFilters.push({ 
        type: 'availability', 
        label: `Availability: ${selectedAvailability.join(', ')}`,
        value: selectedAvailability 
      });
    }
    
    if (priceRange < data.filters.price.max) {
      newActiveFilters.push({ 
        type: 'price', 
        label: `Price: ${formatCurrency(0)} - ${formatCurrency(priceRange)}`,
        value: priceRange 
      });
    }

    if (sortBy !== 'Default') {
      newActiveFilters.push({ 
        type: 'sort', 
        label: `Sort: ${sortBy}`,
        value: sortBy 
      });
    }
    
    setActiveFilters(newActiveFilters);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shopFilters_activeFilters', JSON.stringify(newActiveFilters));
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedColors('');
    setSelectedMaterials([]);
    setSelectedAvailability([]);
    setPriceRange(data.filters.price.max);
    setActiveFilters([]);
    setSortBy('Default');
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('shopFilters_categories');
      localStorage.removeItem('shopFilters_colors');
      localStorage.removeItem('shopFilters_materials');
      localStorage.removeItem('shopFilters_availability');
      localStorage.removeItem('shopFilters_priceRange');
      localStorage.removeItem('shopFilters_activeFilters');
      localStorage.removeItem('shopFilters_sortBy');
    }
  };

  const removeFilter = (filterType, filterValue) => {
    switch (filterType) {
      case 'category':
        setSelectedCategories(prev => prev.filter(cat => cat !== filterValue));
        break;
      case 'color':
        setSelectedColors('');
        break;
      case 'material':
        setSelectedMaterials(prev => prev.filter(mat => mat !== filterValue));
        break;
      case 'availability':
        setSelectedAvailability(prev => prev.filter(avail => avail !== filterValue));
        break;
      case 'price':
        setPriceRange(data.filters.price.max);
        break;
      default:
        // default logic or return original array
        return filteredProducts;
    }
  };

  return (
    <div className="bg-white py-8 ">
      <div className="max-w-7xl mx-auto ">
        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Search Results for "{searchQuery}"
            </h2>
            <p className="text-gray-600">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            {filteredProducts.length === 0 && (
              <div className="mt-4">
                <p className="text-gray-500">No products found for "{searchQuery}"</p>
                <Link 
                  href="/shop"
                  className="inline-block mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  View All Products
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-[30%] min-w-[220px] px-0 md:px-8 lg:px-8 mb-8 lg:mb-0">
          <h2 className="font-semibold text-lg mb-4">Filter Options</h2>
          {/* Category */}
          <div className="border-b pb-6 mb-6">
            <h3 className="font-medium mb-2">Category</h3>
            <ul
              className="space-y-1 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-gray-200"
              style={{ scrollbarColor: "#064e3b #e5e7eb" }}
            >
              {data.filters?.categories?.map((cat) => (
                <li key={cat}>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="accent-green-900"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                    />
                    <span>{cat}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          {/* Price */}
          <div className="border-b pb-6 mb-6">
            <h3 className="font-medium mb-2">Price</h3>
            <div className="mb-2 text-sm text-gray-700">
              {formatCurrency(data.filters?.price?.min || 0)} - {formatCurrency(priceRange)}
            </div>
            <input
              type="range"
              min={data.filters?.price?.min || 0}
              max={data.filters?.price?.max || 1000}
              value={priceRange}
              onChange={(e) => handlePriceChange(parseInt(e.target.value))}
              className="w-full accent-green-900"
            />
          </div>
          {/* Color */}
          <div className="border-b pb-6 mb-6">
            <h3 className="font-medium mb-2">Color</h3>
            <ul className="space-y-1">
              {data.filters?.colors?.map((color) => (
                <li key={color}>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="color"
                      className="accent-green-900"
                      checked={selectedColors === color}
                      onChange={() => handleColorChange(color)}
                    />
                    <span
                      className={`inline-block w-3 h-3 rounded-full border ${
                        color === "Brown"
                          ? "bg-yellow-900"
                          : color === "Grey"
                          ? "bg-gray-400"
                          : color === "Black"
                          ? "bg-black"
                          : color === "White"
                          ? "bg-white border-gray-400"
                          : color === "Blue"
                          ? "bg-blue-500"
                          : color === "Green"
                          ? "bg-green-900"
                          : ""
                      }`}
                    ></span>
                    <span>{color}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          {/* Materials */}
          <div className="border-b pb-6 mb-6">
            <h3 className="font-medium mb-2">Material</h3>
            <ul className="space-y-1">
              {data.filters?.materials?.map((material) => (
                <li key={material}>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="accent-green-900"
                      checked={selectedMaterials.includes(material)}
                      onChange={() => handleMaterialChange(material)}
                    />
                    <span>{material}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          {/* Availability */}
          <div>
            <h3 className="font-medium mb-2">Availability</h3>
            <ul className="space-y-1">
              {data.filters?.availablity?.map((option) => (
                <li key={option.label}>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="accent-green-900"
                      checked={selectedAvailability.includes(option.label)}
                      onChange={() => handleAvailabilityChange(option.label)}
                    />
                    <span>{option.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-[70%] flex-1">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="text-gray-700 text-sm">
              Showing {paginatedFilteredProducts.length} of {filteredProducts.length} results
            </div>
            <div className="flex items-center gap-2 px-0 md:px-16">
              <span className="text-gray-700 text-sm">Sort by :</span>
              <select 
                className="border bg-white rounded-full px-2 py-1 text-sm"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {data.sortOptions?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Active Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-gray-700 text-sm">Active Filter</span>
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className="bg-yellow-500 text-black rounded-full text-xs px-2 p-1 flex items-center gap-1"
              >
                {filter.label}{" "}
                <span 
                  className="ml-1 cursor-pointer"
                  onClick={() => removeFilter(filter.type, filter.value)}
                >
                  &times;
                </span>
              </span>
            ))}
            {activeFilters.length > 0 && (
              <button 
                className="text-green-900 text-sm underline ml-2"
                onClick={clearAllFilters}
              >
              Clear All
            </button>
            )}
          </div>
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ">
            {paginatedFilteredProducts.map((product, idx) => {
              const isFilled = wishlist.some(item => item.id === product.id);
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.type?.toLowerCase()}/product-details/${product.id}?productData=${encodeURIComponent(JSON.stringify(product))}`}
                  className="bg-white rounded-xl shadow-sm relative group transition-all duration-200 hover:shadow-md cursor-pointer"
                >
                  {/* Discount badge */}
                  <span className="absolute top-4 left-3 bg-green-900 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {product.discount}
                  </span>
                  {/* Wishlist/expand/bag icons - Show on ALL cards */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="bg-white p-1 rounded-full shadow-md hover:bg-gray-50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleHeart(product);
                      }}
                    >
                      <i
                        className={`${
                          isFilled ? "fas" : "far"
                        } fa-heart text-gray-600 text-sm transition-all duration-300`}
                      ></i>
                    </button>
                    <button
                      className="bg-white p-1 rounded-full shadow-md hover:bg-gray-50"
                      onClick={(e) => e.preventDefault()}
                    >
                      <i className="fas fa-expand text-gray-600 text-sm"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddCart(product);
                      }}
                      className="bg-white p-1 rounded-full shadow-md hover:bg-gray-50"
                    >
                      <i className="fas fa-shopping-cart text-gray-600 text-sm"></i>
                    </button>
                  </div>
                  {/* Product Image - Full Card Coverage */}
                  <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between px-2 text-xs text-gray-500">
                    <span className="text-gray-400 text-xs">
                      {product.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500 text-base">★</span>
                      <span className="text-gray-700 font-semibold">
                        {product.rating}
                      </span>
                    </span>
                  </div>
                  <div className="text-0B1B2B text-sm text-semibold px-2 ">
                    {product.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-0B1B2B text-sm font-medium px-2 mb-2 ">{formatCurrency(product.price)}</span>
                    <span className="text-gray-400 line-through text-sm">{formatCurrency(product.oldPrice)}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          <Stack spacing={2} className="mt-10">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              variant="outlined"
              className="flex justify-center"
            />
          </Stack>
        </main>
        </div>
      </div>
    </div>
  );
};

export default ShopHero;
