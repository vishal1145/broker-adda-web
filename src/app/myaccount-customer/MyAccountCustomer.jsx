"use client";
import React, { useState, useEffect } from "react";
import data from "../data/myaccount.json";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from '../components/Header';
import Features from "../components/Features";
import Select from 'react-select';
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

  // Check for tab parameter in URL
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab && tab !== 'Dashboard') {
        setActiveTab(tab);
      }
    }
  }, []);
  const [newSavedSearch, setNewSavedSearch] = useState({ type: "", budgetMax: "" });
  const [regionOptions, setRegionOptions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regionIdMap, setRegionIdMap] = useState({}); // Map region names to IDs
  const [customerData, setCustomerData] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerImage, setCustomerImage] = useState(null);
  const [favoriteProperties, setFavoriteProperties] = useState(new Set());
  const [isLoadingProfileData, setIsLoadingProfileData] = useState(false);
  const propertyTypeOptions = ["apartment", "commercial", "plot", "villa", "house"];

  // Logout function
  const handleLogout = () => {
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
    }
    // Redirect to homepage
    window.location.href = '/';
  };

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
        setIsLoadingProfileData(true);
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        console.log('Customer - Token from localStorage:', token);
        if (!token) {
          console.log('Customer - No token found in localStorage');
          setIsLoadingProfileData(false);
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
          setIsLoadingProfileData(false);
          return;
        }

        // Use fallback URL if environment variable is not set
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        
        // Try to get customer ID from token payload
        const customerId = tokenPayload.customerId || tokenPayload.id;
        
        let response;
        if (customerId) {
          // Try to fetch by customer ID first
          response = await fetch(`${apiUrl}/customers/${customerId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
        } else {
          // Fallback to general profile endpoint
          response = await fetch(`${apiUrl}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
        }

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

            // Load customer profile image if available
            console.log('Full API response for debugging:', JSON.stringify(profileData, null, 2));
            
            // Check all possible locations for the image
            let customerImageUrl = profileData.data.images?.customerImage ||
                                 profileData.data.user?.profileImage || 
                                 profileData.data.customerDetails?.profileImage ||
                                 profileData.data.profileImage ||
                                 profileData.data.additionalDetails?.profileImage;

            console.log('Found customerImageUrl:', customerImageUrl);
            
            // Convert local server path to public URL if needed
            if (customerImageUrl && customerImageUrl.startsWith('/opt/lampp/htdocs/')) {
              // Extract the filename from the local path
              const filename = customerImageUrl.split('/').pop();
              // Convert to public URL
              customerImageUrl = `https://broker-adda-be.algofolks.com/uploads/${filename}`;
              console.log('Converted from local path to:', customerImageUrl);
            } else if (customerImageUrl && customerImageUrl.startsWith('/uploads/')) {
              // If it's already a relative path, make it absolute
              customerImageUrl = `https://broker-adda-be.algofolks.com${customerImageUrl}`;
              console.log('Converted from relative path to:', customerImageUrl);
            } else if (customerImageUrl) {
              console.log('Using original URL:', customerImageUrl);
            } else {
              console.log('No customer image found in API response');
            }
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

            // Set customer image if available
            if (customerImageUrl) {
              console.log('Original image path:', profileData.data.images?.customerImage);
              console.log('Converted customer image URL:', customerImageUrl);
              setCustomerImage(customerImageUrl);
            } else {
              console.log('No customer image found in any location');
              // Let's also check if there's any image field we missed
              console.log('All available fields in data:', Object.keys(profileData.data || {}));
              if (profileData.data.images) {
                console.log('All fields in images:', Object.keys(profileData.data.images));
              }
            }
          }
        } else {
          // Handle API error response
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Failed to load customer data:', errorData);
          console.error('Response status:', response.status);
          console.error('Response statusText:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading customer data:', error);
      } finally {
        setIsLoadingProfileData(false);
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


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'customerImage') {
      setCustomerImage(files[0]);
    }
  };

  const handleRegionChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData((prev) => ({ ...prev, regions: selectedValues }));
  };

  const handlePreferenceChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData((prev) => ({ ...prev, preferences: selectedValues }));
  };

  const handlePropertyTypeChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData((prev) => ({ ...prev, propertyType: selectedValues }));
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

  // Toggle favorite property
  const toggleFavorite = (propertyId) => {
    setFavoriteProperties(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  // Function to fetch customer data by ID
  const fetchCustomerById = async (customerId) => {
    if (!customerId) return;
    
    setCustomerLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
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
      const submitData = new FormData();
      submitData.append('phone', formData.phone);
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      
      // Add customer details
      submitData.append('customerDetails[preferences][budgetMin]', formData.budgetMin ? Number(formData.budgetMin) : '');
      submitData.append('customerDetails[preferences][budgetMax]', formData.budgetMax ? Number(formData.budgetMax) : '');
      
      // Add property types
      validPropertyTypes.forEach((type, index) => {
        submitData.append(`customerDetails[preferences][propertyType][${index}]`, type);
      });
      
      // Add regions
      regionIds.forEach((regionId, index) => {
        submitData.append(`customerDetails[preferences][region][${index}]`, regionId);
      });
      
      // Add saved searches
      formData.savedSearches.forEach((search, index) => {
        submitData.append(`customerDetails[savedSearches][${index}][type]`, search.type);
        submitData.append(`customerDetails[savedSearches][${index}][budgetMax]`, search.budgetMax);
      });
      
      submitData.append('customerDetails[inquiryCount]', formData.inquiryCount || 0);
      
      // Add customer image if selected
      if (customerImage && typeof customerImage !== 'string') {
        submitData.append('customerImage', customerImage);
      }

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
          'Authorization': `Bearer ${token}`
        },
        body: submitData
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
      case "Profile":
        return (
          <div className="w-full lg:w-3/4 bg-white rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
            
            {/* Loading State */}
            {isLoadingProfileData && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  <p className="text-gray-600">Loading profile data...</p>
                </div>
              </div>
            )}
            
            {/* Profile Content - Only show when not loading */}
            {!isLoadingProfileData && (
              <>
                {/* Customer Profile Image Upload */}
                <div className="mb-8">
                 
                  <div className="flex items-center gap-6">
                {/* Current Profile Image Display */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {customerImage ? (
                      <img
                        src={typeof customerImage === 'string' ? customerImage : URL.createObjectURL(customerImage)}
                        alt="Customer Profile"
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('Image loaded successfully:', customerImage)}
                        onError={(e) => console.log('Image failed to load:', customerImage, e)}
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 bg-green-600 w-7 h-7 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                    onClick={() => document.getElementById('customer-image-upload').click()}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <input
                    type="file"
                    name="customerImage"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    id="customer-image-upload"
                  />
                </div>
              </div>
            </div>
            
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm  focus:outline-none  focus:ring-green-500 focus:border-green-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm  focus:outline-none  focus:ring-green-500 focus:border-green-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm  focus:outline-none  focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Region React-Select Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Region <span className="text-green-500">*</span>
                </label>
                {loadingRegions ? (
                  <p className="text-sm text-gray-500">Loading regions...</p>
                ) : (
                  <Select
                    isMulti
                    name="regions"
                    options={regionOptions.map(region => ({
                      value: region,
                      label: region
                    }))}
                    value={formData.regions.map(region => ({
                      value: region,
                      label: region
                    }))}
                    onChange={handleRegionChange}
                    placeholder="Select regions..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: '48px',
                        border: state.isFocused ? '2px solid #10b981' : '1px solid #d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
                        '&:hover': {
                          border: '1px solid #10b981'
                        }
                      }),
                      multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#dcfce7',
                        color: '#166534'
                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: '#166534'
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        color: '#166534',
                        '&:hover': {
                          backgroundColor: '#bbf7d0',
                          color: '#14532d'
                        }
                      })
                    }}
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none  focus:ring-green-500 focus:border-green-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm  focus:outline-none  focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Property Type React-Select Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Property Type <span className="text-green-500">*</span></label>
                <Select
                  isMulti
                  name="propertyType"
                  options={propertyTypeOptions.map(type => ({
                    value: type,
                    label: type.charAt(0).toUpperCase() + type.slice(1)
                  }))}
                  value={formData.propertyType.map(type => ({
                    value: type,
                    label: type.charAt(0).toUpperCase() + type.slice(1)
                  }))}
                  onChange={handlePropertyTypeChange}
                  placeholder="Select property types..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '48px',
                      border: state.isFocused ? '2px solid #10b981' : '1px solid #d1d5db',
                      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
                      '&:hover': {
                        border: '1px solid #10b981'
                      }
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      color: '#166534'
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      color: '#166534',
                      '&:hover': {
                        backgroundColor: '#bbf7d0',
                        color: '#14532d'
                      }
                    })
                  }}
                />
              </div>


              {/* Saved Searches */}
              {/* <div>
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
              </div> */}

              {/* Inquiry Count (read-only) */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Inquiry Count <span className="text-green-500">*</span></label>
                <input
                  type="number"
                  name="inquiryCount"
                  value={formData.inquiryCount}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div> */}


              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`py-2 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors cursor-pointer ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-800 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </form>
              </>
            )}
          </div>
        );

      case "Saved Properties":
        return (
          <div className="w-full lg:w-3/4 bg-white  rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src="/images/pexels-binyaminmellish-106399.jpg" alt="Property" className="w-full h-48 object-cover" />
                  <button 
                    onClick={() => toggleFavorite('property-1')}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <svg className={`w-5 h-5 transition-colors ${favoriteProperties.has('property-1') ? 'text-red-500' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Luxury Villa</h3>
                  <p className="text-gray-600 text-sm">3BHK, 2000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹2.5 Cr</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src="/images/istockphoto-1165384568-612x612.jpg" alt="Property" className="w-full h-48 object-cover" />
                  <button 
                    onClick={() => toggleFavorite('property-2')}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <svg className={`w-5 h-5 transition-colors ${favoriteProperties.has('property-2') ? 'text-red-500' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Modern Apartment</h3>
                  <p className="text-gray-600 text-sm">2BHK, 1200 sq ft</p>
                  <p className="text-green-600 font-semibold">₹85 L</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img src="/images/realestate2.jpg" alt="Property" className="w-full h-48 object-cover" />
                  <button 
                    onClick={() => toggleFavorite('property-3')}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                  >
                    <svg className={`w-5 h-5 transition-colors ${favoriteProperties.has('property-3') ? 'text-red-500' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Commercial Space</h3>
                  <p className="text-gray-600 text-sm">Office, 5000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹1.2 Cr</p>
                </div>
              </div>
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

              {/* Property Type React-Select Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Property Type</label>
                <Select
                  isMulti
                  name="propertyType"
                  options={propertyTypeOptions.map(type => ({
                    value: type,
                    label: type.charAt(0).toUpperCase() + type.slice(1)
                  }))}
                  value={formData.propertyType.map(type => ({
                    value: type,
                    label: type.charAt(0).toUpperCase() + type.slice(1)
                  }))}
                  onChange={handlePropertyTypeChange}
                  placeholder="Select property types..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '48px',
                      border: state.isFocused ? '2px solid #10b981' : '1px solid #d1d5db',
                      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
                      '&:hover': {
                        border: '1px solid #10b981'
                      }
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      color: '#166534'
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      color: '#166534',
                      '&:hover': {
                        backgroundColor: '#bbf7d0',
                        color: '#14532d'
                      }
                    })
                  }}
                />
              </div>

              {/* Property Preferences React-Select Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Property Preferences
                </label>
                <Select
                  isMulti
                  name="preferences"
                  options={[
                    "2BHK", "3BHK", "4BHK", "Villa", "Apartment", "Independent House",
                    "Penthouse", "Studio", "Duplex", "Farmhouse", "Plot", "Commercial"
                  ].map(pref => ({
                    value: pref,
                    label: pref
                  }))}
                  value={formData.preferences.map(pref => ({
                    value: pref,
                    label: pref
                  }))}
                  onChange={handlePreferenceChange}
                  placeholder="Select property preferences..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: '48px',
                      border: state.isFocused ? '2px solid #10b981' : '1px solid #d1d5db',
                      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
                      '&:hover': {
                        border: '1px solid #10b981'
                      }
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      backgroundColor: '#dcfce7',
                      color: '#166534'
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      color: '#166534'
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      color: '#166534',
                      '&:hover': {
                        backgroundColor: '#bbf7d0',
                        color: '#14532d'
                      }
                    })
                  }}
                />
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
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`py-2 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors cursor-pointer ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-800 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
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
                "Profile",
                "Saved Properties"
              ].map((item, idx) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`w-full text-left px-5 py-3 rounded-lg border cursor-pointer ${
                    activeTab === item
                      ? "bg-yellow-400 text-black font-medium"
                      : "bg-white hover:bg-gray-50 text-black"
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-5 py-3 rounded-lg border bg-white cursor-pointer"
              >
                Logout
              </button>
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