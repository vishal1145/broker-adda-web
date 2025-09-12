"use client";
import React, { useState, useEffect } from "react";
import data from "../data/myaccount.json";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from '../components/Header';
import Features from "../components/Features";
import toast, { Toaster } from "react-hot-toast";

const MyAccountCustomer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    regions: [],
    address: "",
    city: "",
    state: "",
    pincode: "",
    budgetMin: "",
    budgetMax: "",
    propertyType: [],
    savedSearches: [],
    inquiryCount: 0
  });
  const [activeTab, setActiveTab] = useState("Profile");
  const [newSavedSearch, setNewSavedSearch] = useState({ type: "", budgetMax: "" });
  const [regionOptions, setRegionOptions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regionIdMap, setRegionIdMap] = useState({}); // Map region names to IDs
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const propertyTypeOptions = ["apartment", "commercial", "plot", "villa", "house"];

  // Debug: Monitor formData changes
  useEffect(() => {
    console.log('Customer - FormData updated:', formData);
  }, [formData]);

  // Load phone from token immediately on component mount
  useEffect(() => {
    const loadPhoneFromToken = () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (token) {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          if (tokenPayload.phone && !formData.phone) {
            console.log('Customer - Setting phone from token:', tokenPayload.phone);
            setFormData(prev => ({ ...prev, phone: tokenPayload.phone }));
          }
        }
      } catch (error) {
        console.error('Customer - Error loading phone from token:', error);
      }
    };
    
    loadPhoneFromToken();
  }, []); // Only run once on mount

  // Load existing customer data after regions are loaded
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        console.log('Customer - Token from localStorage:', token);
        if (!token) {
          console.log('Customer - No token found in localStorage');
          return;
        }

        // Validate token
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('Customer - Decoded token payload:', tokenPayload);
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenPayload.exp < currentTime) {
          console.log('Customer - Token expired, clearing localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          return;
        }

        // Use fallback URL if environment variable is not set
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
        const response = await fetch(`${apiUrl}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const profileData = await response.json();
          console.log('Loaded customer data:', profileData);
          console.log('Full API response structure:', JSON.stringify(profileData, null, 2));
          console.log('Inquiry count from API:', profileData.data?.customerDetails?.inquiryCount);
          console.log('Customer details:', profileData.data?.customerDetails);
          
          // Update form data with existing customer information
          if (profileData.data) {
            console.log('API Response structure:', profileData.data);
            console.log('User data:', profileData.data.user);
            console.log('Additional details:', profileData.data.additionalDetails);
            
            // Convert region IDs to names for display
            const regionIds = profileData.data.additionalDetails?.preferences?.region || [];
            const regionNames = regionIds.map(regionId => {
              // Find the region name from the ID
              const regionName = Object.keys(regionIdMap).find(name => regionIdMap[name] === regionId);
              return regionName || (typeof regionId === 'string' ? regionId : ''); // fallback to ID if name not found
            }).filter(name => name !== '');

            // Convert "residential" to "house" for API compatibility
            const propertyTypes = (profileData.data.additionalDetails?.preferences?.propertyType || [])
              .map(type => type === "residential" ? "house" : type)
              .filter(type => propertyTypeOptions.includes(type));

            // Try different possible locations for inquiry count
            const inquiryCount = profileData.data.additionalDetails?.inquiryCount || 
                                profileData.data.inquiryCount || 
                                profileData.inquiryCount || 
                                0;
            console.log('Setting inquiry count to:', inquiryCount);
            console.log('Tried locations:', {
              'additionalDetails.inquiryCount': profileData.data.additionalDetails?.inquiryCount,
              'data.inquiryCount': profileData.data.inquiryCount,
              'root.inquiryCount': profileData.inquiryCount
            });
            
            setFormData(prev => {
              console.log('Customer - Before API update - Current phone:', prev.phone);
              console.log('Customer - API user data:', profileData.data.user);
              
              const newPhone = prev.phone || profileData.data.user?.phone || "";
              console.log('Customer - Setting phone to:', newPhone);
              
              return {
                ...prev,
                name: profileData.data.user?.name || "",
                email: profileData.data.user?.email || "",
                phone: newPhone, // Keep existing phone from token
                address: profileData.data.user?.address || "",
                city: profileData.data.user?.city || "",
                state: profileData.data.user?.state || "",
                pincode: profileData.data.user?.pincode || "",
                budgetMin: profileData.data.additionalDetails?.preferences?.budgetMin || "",
                budgetMax: profileData.data.additionalDetails?.preferences?.budgetMax || "",
                propertyType: propertyTypes,
                savedSearches: profileData.data.additionalDetails?.savedSearches || [],
                inquiryCount: inquiryCount,
                regions: regionNames
              };
            });
          }
        }
      } catch (error) {
        console.error('Error loading customer data:', error);
      }
    };

    // Only load customer data if regions are loaded
    if (Object.keys(regionIdMap).length > 0) {
      loadCustomerData();
    }
  }, [regionIdMap]);

  // Fetch regions from API
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoadingRegions(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/regions`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const responseData = await response.json();
          // Extract regions from the nested data structure
          const regions = responseData?.data?.regions || [];
          const regionNames = regions.map(region => {
            if (typeof region === 'string') {
              return region;
            } else if (typeof region === 'object' && region !== null) {
              return region.name || region.region || '';
            }
            return '';
          }).filter(name => name !== '');
          
          // Create mapping of region names to IDs
          const idMap = {};
          regions.forEach(region => {
            if (typeof region === 'object' && region !== null && region._id && region.name) {
              idMap[region.name] = region._id;
            }
          });
          setRegionIdMap(idMap);
          setRegionOptions(regionNames);
        } else {
          console.error('Failed to fetch regions:', response.statusText);
          // Fallback to hardcoded regions if API fails
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
        // Fallback to hardcoded regions if API fails
      } finally {
        setLoadingRegions(false);
      }
    };

    fetchRegions();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isRegionDropdownOpen && !event.target.closest('.region-dropdown')) {
        setIsRegionDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRegionDropdownOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionToggle = (region) => {
    setFormData(prev => {
      const isSelected = prev.regions.includes(region);
      return {
        ...prev,
        regions: isSelected
          ? prev.regions.filter(r => r !== region)
          : [...prev.regions, region]
      };
    });
  };

  const handlePreferenceChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: checked
        ? [...prev.preferences, value]
        : prev.preferences.filter(v => v !== value)
    }));
  };

  const handlePropertyTypeToggle = (type) => {
    setFormData(prev => {
      const exists = prev.propertyType.includes(type);
      return {
        ...prev,
        propertyType: exists
          ? prev.propertyType.filter(t => t !== type)
          : [...prev.propertyType, type]
      };
    });
  };

  const handleSavedSearchField = (e) => {
    const { name, value } = e.target;
    setNewSavedSearch(prev => ({ ...prev, [name]: value }));
  };

  const addSavedSearch = (e) => {
    e.preventDefault();
    if (!newSavedSearch.type || !newSavedSearch.budgetMax) return;
    setFormData(prev => ({
      ...prev,
      savedSearches: [...prev.savedSearches, {
        type: newSavedSearch.type,
        budgetMax: Number(newSavedSearch.budgetMax)
      }]
    }));
    setNewSavedSearch({ type: "", budgetMax: "" });
  };

  const removeSavedSearch = (index) => {
    setFormData(prev => ({
      ...prev,
      savedSearches: prev.savedSearches.filter((_, i) => i !== index)
    }));
  };

  // Function to fetch customer data by ID
  const fetchCustomerById = async (customerId) => {
    if (!customerId) return;
    
    setCustomerLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
      const response = await fetch(`${apiUrl}/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomerData(data);
        console.log('Customer data fetched:', data);
        toast.success('Customer data loaded successfully!');
        
        // Populate form with fetched data
        if (data.data) {
          console.log('Customer by ID response:', data.data);
          setFormData(prev => ({
            ...prev,
            name: data.data.user?.name || data.data.name || prev.name,
            email: data.data.user?.email || data.data.email || prev.email,
            phone: data.data.user?.phone || data.data.phone || prev.phone,
            address: data.data.user?.address || data.data.address || prev.address,
            city: data.data.user?.city || data.data.city || prev.city,
            state: data.data.user?.state || data.data.state || prev.state,
            pincode: data.data.user?.pincode || data.data.pincode || prev.pincode,
            budgetMin: data.data.additionalDetails?.preferences?.budgetMin || data.data.customerDetails?.preferences?.budgetMin || prev.budgetMin,
            budgetMax: data.data.additionalDetails?.preferences?.budgetMax || data.data.customerDetails?.preferences?.budgetMax || prev.budgetMax,
            propertyType: data.data.additionalDetails?.preferences?.propertyType || data.data.customerDetails?.preferences?.propertyType || prev.propertyType,
            savedSearches: data.data.additionalDetails?.savedSearches || data.data.customerDetails?.savedSearches || prev.savedSearches,
            inquiryCount: data.data.additionalDetails?.inquiryCount || data.data.customerDetails?.inquiryCount || prev.inquiryCount
          }));
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        toast.error(errorData.message || `Failed to fetch customer data (${response.status})`);
        console.error('Failed to fetch customer data:', errorData);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setCustomerLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get authentication token from localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        toast.error("No authentication token found. Please login again.");
        setIsSubmitting(false);
        return;
      }

      // Validate token
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenPayload.exp < currentTime) {
          toast.error("Your session has expired. Please login again.");
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        toast.error("Invalid authentication token. Please login again.");
        setIsSubmitting(false);
        return;
      }

      // Convert region names to IDs - handle both names and IDs
      const regionIds = formData.regions.map(region => {
        // If it's already an ID (starts with ObjectId pattern), return as is
        if (typeof region === 'string' && region.length === 24 && /^[0-9a-fA-F]{24}$/.test(region)) {
          return region;
        }
        // Otherwise, look up the ID from the mapping
        return regionIdMap[region];
      }).filter(Boolean);
      
      console.log('Form data regions:', formData.regions);
      console.log('Region ID map:', regionIdMap);
      console.log('Converted region IDs:', regionIds);

      // Filter property types to only include valid ones
      const validPropertyTypes = formData.propertyType.filter(type => 
        propertyTypeOptions.includes(type)
      );

      // Prepare the data according to API structure
      const submitData = {
        phone: formData.phone,
        name: formData.name,
        email: formData.email,
        customerDetails: {
          preferences: {
            budgetMin: formData.budgetMin ? Number(formData.budgetMin) : undefined,
            budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
            propertyType: validPropertyTypes,
            region: regionIds
          },
          savedSearches: formData.savedSearches,
          inquiryCount: formData.inquiryCount || 0
        }
      };

      console.log('Form data saved searches:', formData.savedSearches);
      console.log('Complete submit data:', submitData);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      // Use fallback URL if environment variable is not set
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'i';
      const fullUrl = `${apiUrl}/auth/complete-profile`;
      console.log('Full URL:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Profile updated successfully!");
        console.log('Profile updated:', result);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        toast.error(errorData.message || 'Failed to update profile');
        console.error('Profile update failed:', errorData);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
      }
    } catch (error) {
      console.error('Network error details:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Network connection failed. Please check your internet connection and try again.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="w-full lg:w-3/4 bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
            
            {/* Customer Data Fetch Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fetch Customer Data</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter Customer ID (e.g., 68c3eb8e9d5b38d2effea8d9)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      fetchCustomerById(e.target.value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder*="Customer ID"]');
                    fetchCustomerById(input.value);
                  }}
                  disabled={customerLoading}
                  className="px-6 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {customerLoading ? 'Loading...' : 'Fetch Customer'}
                </button>
              </div>
              
              {/* Display fetched customer data */}
              {customerData && (
                <div className="mt-4 p-4 bg-white border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Data:</h4>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                    {JSON.stringify(customerData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Inquiries</h3>
                <p className="text-3xl font-bold text-green-600">{formData.inquiryCount || 0}</p>
                <p className="text-sm text-gray-600">Active inquiries</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Properties</h3>
                <p className="text-3xl font-bold text-blue-600">3</p>
                <p className="text-sm text-gray-600">Properties saved</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Searches</h3>
                <p className="text-3xl font-bold text-yellow-600">{formData.savedSearches.length}</p>
                <p className="text-sm text-gray-600">Search criteria saved</p>
              </div>
            </div>
          </div>
        );

      case "Profile":
        return (
          <div className="w-full lg:w-3/4 bg-white rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
            
            <form className="space-y-6 " onSubmit={handleSubmit}>
              {/* Name & Email (two columns) */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Name <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone <span className="text-green-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Region Custom Dropdown */}
              <div className="relative region-dropdown">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Region <span className="text-green-500">*</span>
                </label>
                {loadingRegions ? (
                  <p className="text-sm text-gray-500">Loading regions...</p>
                ) : (
                  <>
                    {/* Dropdown Button */}
                    <button
                      type="button"
                      onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-left flex items-center justify-between"
                    >
                      <span className="text-gray-700">
                        {formData.regions.length === 0 
                          ? "Select regions..." 
                          : `${formData.regions.length} region(s) selected`
                        }
                      </span>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isRegionDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Card */}
                    {isRegionDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-4">
                          <div className="space-y-3">
                            {regionOptions.length > 0 ? (
                              regionOptions.map((region) => (
                                <label key={region} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                  <input
                                    type="checkbox"
                                    checked={formData.regions.includes(region)}
                                    onChange={() => handleRegionToggle(region)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                  />
                                  <span className="text-sm text-gray-700">{region}</span>
                                </label>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                No regions available
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {/* Selected Regions Display */}
                {formData.regions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Selected regions ({formData.regions.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.regions.map((region) => (
                        <span key={region} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
                          {region}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                regions: prev.regions.filter(r => r !== region)
                              }));
                            }}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Budget Min/Max */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Budget Min (₹ Lakhs) <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="budgetMin"
                    value={formData.budgetMin}
                    onChange={handleChange}
                    placeholder="e.g. 25"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Budget Max (₹ Lakhs) <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="budgetMax"
                    value={formData.budgetMax}
                    onChange={handleChange}
                    placeholder="e.g. 60"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Property Type (multi-select) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Property Type <span className="text-green-500">*</span>
                </label>
                <div className="w-full border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-3">
                  <div className="space-y-2">
                    {propertyTypeOptions.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          checked={formData.propertyType.includes(type)}
                          onChange={() => handlePropertyTypeToggle(type)}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.propertyType.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.propertyType.map(t => (
                      <span key={t} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">{t}</span>
                    ))}
                  </div>
                )}
              </div>


              {/* Saved Searches */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Saved Searche  <span className="text-green-500">*</span>
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="type"
                    value={newSavedSearch.type}
                    onChange={handleSavedSearchField}
                    placeholder="Type e.g. 2BHK"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="number"
                    name="budgetMax"
                    value={newSavedSearch.budgetMax}
                    onChange={handleSavedSearchField}
                    placeholder="Budget Max (₹)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <button onClick={addSavedSearch} className="mt-3 bg-green-800 text-white py-2 px-4 rounded-lg hover:bg-green-700">Add Saved Search</button>
                {formData.savedSearches.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.savedSearches.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between border p-3 rounded-lg">
                        <div className="text-sm text-gray-800">{s.type} · ₹{s.budgetMax}</div>
                        <button type="button" onClick={() => removeSavedSearch(idx)} className="text-red-600 text-sm hover:underline">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inquiry Count (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Inquiry Count <span className="text-green-500">*</span></label>
                <input
                  type="number"
                  name="inquiryCount"
                  value={formData.inquiryCount}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>


              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-800 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating Profile...
                    </div>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case "Saved Properties":
        return (
          <div className="w-full lg:w-3/4 bg-white  rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg overflow-hidden">
                <img src="/images/pexels-binyaminmellish-106399.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Luxury Villa</h3>
                  <p className="text-gray-600 text-sm">3BHK, 2000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹2.5 Cr</p>
                  <button className="mt-2 w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors">
                    Remove from Saved
                  </button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <img src="/images/istockphoto-1165384568-612x612.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Modern Apartment</h3>
                  <p className="text-gray-600 text-sm">2BHK, 1200 sq ft</p>
                  <p className="text-green-600 font-semibold">₹85 L</p>
                  <button className="mt-2 w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors">
                    Remove from Saved
                  </button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <img src="/images/realestate2.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Commercial Space</h3>
                  <p className="text-gray-600 text-sm">Office, 5000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹1.2 Cr</p>
                  <button className="mt-2 w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors">
                    Remove from Saved
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "Logout":
        return (
          <div className="w-full lg:w-3/4 bg-white  rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Logout</h2>
            <div className="text-center">
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Confirm Logout
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full lg:w-3/4 bg-white rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
            
            <form className="space-y-6 p-6" onSubmit={handleSubmit}>
              {/* Name & Email (two columns) */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Name <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone <span className="text-green-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Address Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Address <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    City <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    State <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter your state"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Pincode <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Budget Min/Max */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Budget Min (₹ Lakhs)</label>
                  <input
                    type="number"
                    name="budgetMin"
                    value={formData.budgetMin}
                    onChange={handleChange}
                    placeholder="e.g. 25"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Budget Max (₹ Lakhs)</label>
                  <input
                    type="number"
                    name="budgetMax"
                    value={formData.budgetMax}
                    onChange={handleChange}
                    placeholder="e.g. 60"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Property Type (multi-select) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Property Type</label>
                <div className="w-full border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-3">
                  <div className="space-y-2">
                    {propertyTypeOptions.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          checked={formData.propertyType.includes(type)}
                          onChange={() => handlePropertyTypeToggle(type)}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.propertyType.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.propertyType.map(t => (
                      <span key={t} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Property Preferences
                </label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[120px] max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {[
                      "2BHK", "3BHK", "4BHK", "Villa", "Apartment", "Independent House",
                      "Penthouse", "Studio", "Duplex", "Farmhouse", "Plot", "Commercial"
                    ].map((pref) => (
                      <label key={pref} className="flex items-center">
                        <input
                          type="checkbox"
                          value={pref}
                          checked={formData.preferences.includes(pref)}
                          onChange={handlePreferenceChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.preferences.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected preferences:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.preferences.map((pref) => (
                        <span key={pref} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Saved Searches */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Saved Searches</label>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="type"
                    value={newSavedSearch.type}
                    onChange={handleSavedSearchField}
                    placeholder="Type e.g. 2BHK"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="number"
                    name="budgetMax"
                    value={newSavedSearch.budgetMax}
                    onChange={handleSavedSearchField}
                    placeholder="Budget Max (₹)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <button onClick={addSavedSearch} className="mt-3 bg-green-800 text-white py-2 px-4 rounded-lg hover:bg-green-700">Add Saved Search</button>
                {formData.savedSearches.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.savedSearches.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between border p-3 rounded-lg">
                        <div className="text-sm text-gray-800">{s.type} · ₹{s.budgetMax}</div>
                        <button type="button" onClick={() => removeSavedSearch(idx)} className="text-red-600 text-sm hover:underline">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inquiry Count (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Inquiry Count</label>
                <input
                  type="number"
                  name="inquiryCount"
                  value={formData.inquiryCount}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>


              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-800 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating Profile...
                    </div>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <HeaderFile data={data} />
      <div className="px-6 sm:px-12 lg:px-32 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-1/4 space-y-3">
              {[
                "Dashboard",
                "Profile",
                "Saved Properties",
                "Logout"
              ].map((item, idx) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`w-full text-left px-5 py-3 rounded-lg border ${
                    activeTab === item
                      ? "bg-yellow-400 text-black font-medium"
                      : "bg-white hover:bg-gray-50 text-black"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Content Area */}
            {renderContent()}
          </div>
        </div>
      </div>
      
    </>
  );
};

export default MyAccountCustomer;