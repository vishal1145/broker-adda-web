"use client";
import React, { useState, useRef, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Link from "next/link";

const NewPropertyPage = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    propertyDescription: "",
    region: "",
    address: "",
    city: "Agra",
    price: "",
    priceUnit: "INR",
    propertySize: "",
    propertyType: "Residential",
    subType: "Apartment",
  });
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [nearbyAmenityInput, setNearbyAmenityInput] = useState("");
  const [nearbyAmenities, setNearbyAmenities] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState([]);
  const [locationBenefitInput, setLocationBenefitInput] = useState("");
  const [locationBenefits, setLocationBenefits] = useState([]);
  const [imageInput, setImageInput] = useState("");
  const [images, setImages] = useState([]);
  const [videoInput, setVideoInput] = useState("");
  const [videos, setVideos] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [videoFiles, setVideoFiles] = useState([]);
  const videoFileInputRef = useRef(null);
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnishing, setFurnishing] = useState("Furnished");
  const [status, setStatus] = useState("Pending Approval");
  const [isFeatured, setIsFeatured] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  // Wizard steps (match profile page flow style)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Regions API state
  const [regions, setRegions] = useState([]);
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [regionSearchQuery, setRegionSearchQuery] = useState("");
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionsError, setRegionsError] = useState("");

  // Regions API functions
  const fetchRegions = async () => {
    try {
      setRegionsLoading(true);
      setRegionsError("");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api'}/regions`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch regions: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.regions) {
        setRegions(data.data.regions);
        setFilteredRegions(data.data.regions);
      } else {
        throw new Error('Invalid response format from regions API');
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      setRegionsError('Failed to load regions');
    } finally {
      setRegionsLoading(false);
    }
  };

  const searchRegions = (query) => {
    if (!query) {
      setFilteredRegions(regions);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = regions.filter(region => 
      region.name.toLowerCase().includes(lowercaseQuery) ||
      region.city.toLowerCase().includes(lowercaseQuery) ||
      region.state.toLowerCase().includes(lowercaseQuery) ||
      region.description.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredRegions(filtered);
  };

  const formatRegionDisplay = (region) => {
    if (!region) return '';
    return `${region.name}, ${region.city}, ${region.state}`;
  };

  const formatRegionValue = (region) => {
    if (!region) return '';
    return `${region.name}, ${region.city}, ${region.state}`;
  };

  // Load regions on component mount
  useEffect(() => {
    fetchRegions();
  }, []);

  // Filter regions based on search query
  useEffect(() => {
    searchRegions(regionSearchQuery);
  }, [regionSearchQuery, regions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isRegionDropdownOpen && !event.target.closest('.region-dropdown')) {
        setIsRegionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRegionDropdownOpen]);

  // Step validations
  const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
  const isPositiveNumber = (v) => v !== '' && !Number.isNaN(Number(v)) && Number(v) > 0;

  const isStep1Valid = () => {
    return isNonEmpty(form.title) && isNonEmpty(form.region);
  };

  const isStep2Valid = () => {
    return isPositiveNumber(form.price) && isNonEmpty(form.priceUnit) && isNonEmpty(form.city);
  };

  const isStep3Valid = () => {
    return isPositiveNumber(form.propertySize) && isPositiveNumber(bedrooms) && isPositiveNumber(bathrooms) && isNonEmpty(form.propertyType) && isNonEmpty(form.subType);
  };

  const isStep4Valid = () => {
    return (images.length + imageFiles.length) > 0; // require at least one image
  };

  const isCurrentStepValid = () => {
    if (currentStep === 1) return isStep1Valid();
    if (currentStep === 2) return isStep2Valid();
    if (currentStep === 3) return isStep3Valid();
    if (currentStep === 4) return isStep4Valid();
    return false;
  };

  const goToStep = (step) => {
    if (step < 1 || step > totalSteps) return;
    setCurrentStep(step);
  };
  const nextStep = () => { if (currentStep < totalSteps && isCurrentStepValid()) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = (value, setter, list, clear) => {
    const v = value.trim();
    if (!v) return;
    if (list.includes(v)) {
      clear("");
      return;
    }
    setter([...list, v]);
    clear("");
  };

  const addAmenity = () => {
    const v = amenityInput.trim();
    if (!v) return;
    if (amenities.includes(v)) {
      setAmenityInput("");
      return;
    }
    setAmenities([...amenities, v]);
    setAmenityInput("");
  };

  const removeFrom = (value, setter) => setter((prev) => prev.filter((x) => x !== value));

  // Region dropdown handlers
  const handleRegionInputChange = (e) => {
    const query = e.target.value;
    setRegionSearchQuery(query);
    setIsRegionDropdownOpen(true);
    
    // Update form region value as user types
    setForm(prev => ({ ...prev, region: query }));
  };

  const handleRegionSelect = (region) => {
    const regionValue = formatRegionValue(region);
    setForm(prev => ({ ...prev, region: regionValue }));
    setRegionSearchQuery(regionValue);
    setIsRegionDropdownOpen(false);
  };

  const handleRegionInputFocus = () => {
    setIsRegionDropdownOpen(true);
  };

  const handleRegionInputKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsRegionDropdownOpen(false);
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to create a property");
        setSubmitting(false);
        return;
      }

      // ✅ Decode JWT token to extract user ID
      let userId = null;
      try {
        const tokenParts = token.split(".");
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          userId =
            payload?.userId ||
            payload?.user?._id ||
            payload?.user?.id ||
            payload?._id ||
            payload?.id ||
            payload?.sub ||
            null;
        }
      } catch (err) {
        console.warn("Token decoding failed:", err);
      }

      if (!userId) {
        setError("Failed to extract user ID from token. Please re-login.");
        setSubmitting(false);
        return;
      }

      // ✅ Fetch broker details using userId
      let brokerId = null;
      try {
        const brokerRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://broker-adda-be.algofolks.com/api"}/brokers/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (brokerRes.ok) {
          const brokerData = await brokerRes.json();
          brokerId =
            brokerData?._id ||
            brokerData?.broker?._id ||
            brokerData?.data?._id ||
            brokerData?.data?.broker?._id ||
            null;
        }
      } catch (err) {
        console.warn("Broker fetch failed:", err);
      }

      if (!brokerId) {
        setError("Broker not found for this account.");
        setSubmitting(false);
        return;
      }

      // ✅ Prepare form data for API
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description || "");
      formData.append("propertyDescription", form.propertyDescription || "");
      formData.append("propertySize", form.propertySize || "");
      formData.append("propertyType", form.propertyType);
      formData.append("subType", form.subType);
      formData.append("price", form.price);
      formData.append("priceUnit", form.priceUnit);
      formData.append("address", form.address || "");
      formData.append("city", form.city);
      formData.append("region", form.region);

      // Coordinates
      if (coordinates.lat) formData.append("coordinates[lat]", coordinates.lat);
      if (coordinates.lng) formData.append("coordinates[lng]", coordinates.lng);

      // Property details
      formData.append("bedrooms", bedrooms || "0");
      formData.append("bathrooms", bathrooms || "0");
      formData.append("furnishing", furnishing);

      // Arrays
      amenities.forEach((a) => formData.append("amenities[]", a));
      nearbyAmenities.forEach((a) => formData.append("nearbyAmenities[]", a));
      features.forEach((f) => formData.append("features[]", f));
      locationBenefits.forEach((b) => formData.append("locationBenefits[]", b));
      videos.forEach((v) => formData.append("videos[]", v));
      videoFiles.forEach((f) => formData.append("videos", f));
      images.forEach((url) => formData.append("images[]", url));
      imageFiles.forEach((f) => formData.append("images", f));

      // Other fields
      formData.append("status", status);
      formData.append("isFeatured", isFeatured.toString());
      formData.append("notes", notes || "");

      // ✅ Append valid broker ID
      formData.append("broker", brokerId);

      // ✅ API call to create property
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://broker-adda-be.algofolks.com/api"}/properties`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create property");
      }

      const result = await response.json();
      setSuccessMessage("Property created successfully!");

      // ✅ Reset form after success
      setTimeout(() => {
        setSuccessMessage("");
        setForm({
          title: "",
          description: "",
          propertyDescription: "",
          region: "",
          address: "",
          city: "Agra",
          price: "",
          priceUnit: "INR",
          propertySize: "",
          propertyType: "Residential",
          subType: "Apartment",
        });
        setAmenities([]);
        setAmenityInput("");
        setNearbyAmenities([]);
        setNearbyAmenityInput("");
        setFeatures([]);
        setFeatureInput("");
        setLocationBenefits([]);
        setLocationBenefitInput("");
        setImages([]);
        setImageInput("");
        setImageFiles([]);
        setVideos([]);
        setVideoFiles([]);
        setVideoInput("");
        setCoordinates({ lat: "", lng: "" });
        setBedrooms("");
        setBathrooms("");
        setFurnishing("Furnished");
        setStatus("Pending Approval");
        setIsFeatured(false);
        setNotes("");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to create property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="w-full px-0 sm:px-0 lg:px-0 py-8 max-w-none">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Property</h1>
                <p className="text-gray-600">Create a new property listing with all the details</p>
              </div>
              <Link 
                href="/properties-management" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Properties
              </Link>
            </div>
            
            {/* Status Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                  <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
        </div>
          </div>
            )}
            
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-green-700">{successMessage}</p>
          </div>
          </div>
            )}
          </div>

          {/* Layout: form + right sidebar like profile page */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-9 bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            
            {/* Stepper moved to right sidebar */}

            <div className="p-8 space-y-8">
              {/* Basic Information Section */}
              {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Title *</label>
                    <input 
                      name="title" 
                      value={form.title} 
                      onChange={handleChange} 
                      className={`w-full rounded-xl text-sm px-4 py-3 focus:outline-none transition-all duration-200 ${isNonEmpty(form.title) ? 'border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' : 'border border-red-300 focus:ring-2 focus:ring-red-400'}`} 
                      placeholder="Enter property title" 
                      required
                    />
                    {!isNonEmpty(form.title) && (<p className="text-xs text-red-600">Title is required.</p>)}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Region *</label>
                    <div className="relative region-dropdown">
                      <input
                        type="text"
                        name="region"
                        value={regionSearchQuery || form.region}
                        onChange={handleRegionInputChange}
                        onFocus={handleRegionInputFocus}
                        onKeyDown={handleRegionInputKeyDown}
                        className={`w-full rounded-xl text-sm px-4 py-3 focus:outline-none transition-all duration-200 ${
                          !isNonEmpty(form.region) 
                            ? 'border border-red-300 focus:ring-2 focus:ring-red-400' 
                            : 'border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent'
                        }`}
                        placeholder="Select a region..."
                        required
                        autoComplete="off"
                      />
                      
                      {/* Dropdown arrow */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            isRegionDropdownOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>

                      {/* Dropdown menu */}
                      {isRegionDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {regionsLoading ? (
                            <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              Loading regions...
                            </div>
                          ) : regionsError ? (
                            <div className="px-4 py-3 text-sm text-red-600">
                              {regionsError}
                            </div>
                          ) : filteredRegions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              {regionSearchQuery ? "No regions found" : "No regions available"}
                            </div>
                          ) : (
                            <ul className="py-1">
                              {filteredRegions.map((region) => (
                                <li key={region._id}>
                                  <button
                                    type="button"
                                    onClick={() => handleRegionSelect(region)}
                                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                  >
                                    <div className="font-medium text-gray-900">
                                      {region.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {region.city}, {region.state}
                                    </div>
                                    {/* {region.description && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        {region.description}
                                      </div>
                                    )} */}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                    {!isNonEmpty(form.region) && (
                      <p className="text-xs text-red-600">Region is required.</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Short Description</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    rows={3} 
                    className="w-full border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none" 
                    placeholder="Brief description of the property"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                  <textarea 
                    name="propertyDescription" 
                    value={form.propertyDescription} 
                    onChange={handleChange} 
                    rows={4} 
                    className="w-full border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none" 
                    placeholder="Comprehensive description with all details"
                  />
                </div>
                {/* Step navigation removed; use global bottom controls */}
              </div>
              )}
              {/* Location & Pricing Section */}
              {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Location & Pricing</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input 
                      name="address" 
                      value={form.address} 
                      onChange={handleChange} 
                      className={`w-full rounded-xl text-sm px-4 py-3 focus:outline-none transition-all duration-200 ${isNonEmpty(form.address) || form.address === '' ? 'border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' : 'border border-red-300 focus:ring-2 focus:ring-red-400'}`} 
                      placeholder="Street address" 
                    />
            </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input 
                      name="city" 
                      value={form.city} 
                      onChange={handleChange} 
                      className={`w-full rounded-xl text-sm px-4 py-3 focus:outline-none transition-all duration-200 ${isNonEmpty(form.city) ? 'border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' : 'border border-red-300 focus:ring-2 focus:ring-red-400'}`} 
                      placeholder="City" 
                    />
                    {!isNonEmpty(form.city) && (<p className="text-xs text-red-600">City is required.</p>)}
            </div>
          </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Price *</label>
                    <input 
                      type="number" 
                      name="price" 
                      value={form.price} 
                      onChange={handleChange} 
                      className={`w-full rounded-xl text-sm px-4 py-3 focus:outline-none transition-all duration-200 ${isPositiveNumber(form.price) ? 'border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' : 'border border-red-300 focus:ring-2 focus:ring-red-400'}`} 
                      placeholder="e.g. 42000000" 
                      required
                    />
                    {!isPositiveNumber(form.price) && (<p className="text-xs text-red-600">Enter a valid price.</p>)}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select 
                      name="priceUnit" 
                      value={form.priceUnit} 
                      onChange={handleChange} 
                      className={`w-full rounded-xl text-sm px-4 py-3 focus:outline-none transition-all duration-200 ${isNonEmpty(form.priceUnit) ? 'border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent' : 'border border-red-300 focus:ring-2 focus:ring-red-400'}`}
                    >
                      <option>INR</option>
                      <option>USD</option>
                    </select>
                  </div>
          </div>
                {/* Coordinates removed per request */}
                {/* Step navigation removed; use global bottom controls */}
              </div>
              )}
              {/* Property Details Section */}
              {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Property Details</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Size (sqft)</label>
                    <input 
                      type="number" 
                      name="propertySize" 
                      value={form.propertySize} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      placeholder="e.g. 1200"
                    />
            </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                    <input 
                      type="number" 
                      value={bedrooms} 
                      onChange={(e)=>setBedrooms(e.target.value)} 
                      className="w-full border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      placeholder="e.g. 3"
                    />
            </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                    <input 
                      type="number" 
                      value={bathrooms} 
                      onChange={(e)=>setBathrooms(e.target.value)} 
                      className="w-full border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      placeholder="e.g. 2"
                    />
            </div>
          </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Type *</label>
                    <select 
                      name="propertyType" 
                      value={form.propertyType} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
                <option>Land</option>
              </select>
            </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sub Type</label>
                    <select 
                      name="subType" 
                      value={form.subType} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                <option>Apartment</option>
                <option>Villa</option>
                <option>Office</option>
                <option>Shop</option>
                <option>Land</option>
                <option>Other</option>
              </select>
            </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Furnishing</label>
                    <select 
                      value={furnishing} 
                      onChange={(e)=>setFurnishing(e.target.value)} 
                      className="w-full border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                <option>Furnished</option>
                <option>Semi-Furnished</option>
                <option>Unfurnished</option>
              </select>
            </div>
          </div>
                {/* Step navigation removed; use global bottom controls */}
            </div>
              )}
              {/* Amenities Section */}
              {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
            </div>
                  <h3 className="text-base font-semibold text-gray-900">Amenities & Features</h3>
          </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Amenities</label>
                    <div className="flex gap-3">
                      <input 
                        value={amenityInput} 
                        onChange={(e)=>setAmenityInput(e.target.value)} 
                        onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addAmenity(); } }} 
                        className="flex-1 border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                        placeholder="Type amenity and press Add or Enter" 
                      />
                      <button 
                        type="button" 
                        onClick={addAmenity} 
                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium"
                      >
                        Add
                      </button>
            </div>
            {amenities.length>0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a)=> (
                          <span key={a} className="inline-flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-2 rounded-full border border-green-200">
                            {a}
                            <button 
                              type="button" 
                              onClick={()=>removeFrom(a, setAmenities)} 
                              className="text-green-500 hover:text-green-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                ))}
              </div>
            )}
          </div>
                </div>
              </div>
              )}
          {currentStep === 3 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Amenities</label>
            <div className="flex gap-2">
              <input value={nearbyAmenityInput} onChange={(e)=>setNearbyAmenityInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput); } }} className="flex-1 border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Add nearby amenity" />
              <button type="button" onClick={()=>addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput)} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium">Add</button>
            </div>
            {nearbyAmenities.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {nearbyAmenities.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">{a}<button type="button" onClick={()=>removeFrom(a, setNearbyAmenities)} className="text-green-600 hover:text-green-800">×</button></span>
                ))}
              </div>
            )}
          </div>
          )}
          {currentStep === 3 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
            <div className="flex gap-2">
              <input value={featureInput} onChange={(e)=>setFeatureInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(featureInput, setFeatures, features, setFeatureInput); } }} className="flex-1 border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Add feature" />
              <button type="button" onClick={()=>addTag(featureInput, setFeatures, features, setFeatureInput)} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium">Add</button>
            </div>
            {features.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {features.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">{a}<button type="button" onClick={()=>removeFrom(a, setFeatures)} className="text-green-600 hover:text-green-800">×</button></span>
                ))}
              </div>
            )}
          </div>
          )}
          {currentStep === 3 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Benefits</label>
            <div className="flex gap-2">
              <input value={locationBenefitInput} onChange={(e)=>setLocationBenefitInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput); } }} className="flex-1 border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Add location benefit" />
              <button type="button" onClick={()=>addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput)} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium">Add</button>
            </div>
            {locationBenefits.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {locationBenefits.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">{a}<button type="button" onClick={()=>removeFrom(a, setLocationBenefits)} className="text-green-600 hover:text-green-800">×</button></span>
                ))}
              </div>
            )}
          </div>
          )}
          {currentStep === 4 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
            <div className="flex items-center gap-2">
              <div className="border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all duration-200 flex items-center overflow-hidden flex-1">
                <input 
                  value={imageInput} 
                  onChange={(e)=>setImageInput(e.target.value)} 
                  onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(imageInput, setImages, images, setImageInput); } }} 
                  onClick={()=>{ fileInputRef.current && fileInputRef.current.click(); }}
                  className="flex-1 px-4 py-3 outline-none text-sm" 
                  placeholder="Paste image URL or click to choose files" 
                />
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e)=>{ const files = Array.from(e.target.files || []); if(files.length){ setImageFiles((prev)=>[...prev, ...files]); } }} 
                  className="hidden" 
                />
              </div>
              <button type="button" onClick={()=>addTag(imageInput, setImages, images, setImageInput)} className="px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors duration-200">Add</button>
            </div>
            {(images.length>0 || imageFiles.length>0) && (
              <div className="mt-3 space-y-2">
            {images.length>0 && (
                  <div className="flex flex-wrap gap-2">
                {images.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">{a}<button type="button" onClick={()=>removeFrom(a, setImages)} className="text-green-600 hover:text-green-800">×</button></span>
                ))}
                  </div>
                )}
                {imageFiles.length>0 && (
                  <div className="flex flex-wrap gap-2">
                    {imageFiles.map((f, idx)=> (
                      <span key={`${f.name}-${idx}`} className="inline-flex items-center gap-2 text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                        {f.name}
                        <button type="button" onClick={()=> setImageFiles((prev)=> prev.filter((_, i)=> i!==idx))} className="text-green-600 hover:text-green-800">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          )}
          {currentStep === 4 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Videos</label>
            <div className="flex items-center gap-2">
              <div className="border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all duration-200 flex items-center overflow-hidden flex-1">
                <input 
                  value={videoInput} 
                  onChange={(e)=>setVideoInput(e.target.value)} 
                  onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(videoInput, setVideos, videos, setVideoInput); } }} 
                  onClick={()=>{ videoFileInputRef.current && videoFileInputRef.current.click(); }}
                  className="flex-1 px-4 py-3 outline-none text-sm" 
                  placeholder="Paste video URL or click to choose files" 
                />
                <input 
                  ref={videoFileInputRef}
                  type="file" 
                  multiple 
                  accept="video/*" 
                  onChange={(e)=>{ const files = Array.from(e.target.files || []); if(files.length){ setVideoFiles((prev)=>[...prev, ...files]); } }} 
                  className="hidden" 
                />
              </div>
              <button type="button" onClick={()=>addTag(videoInput, setVideos, videos, setVideoInput)} className="px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors duration-200">Add</button>
            </div>
            {(videos.length>0 || videoFiles.length>0) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {videos.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>removeFrom(a, setVideos)} className="text-gray-500 hover:text-gray-700">×</button></span>
                ))}
                {videoFiles.map((f, idx)=> (
                  <span key={`${f.name}-${idx}`} className="inline-flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                    {f.name}
                    <button type="button" onClick={()=> setVideoFiles((prev)=> prev.filter((_, i)=> i!==idx))} className="text-blue-600 hover:text-blue-800">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          )}
          {currentStep === 4 && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200">
                <option>Active</option>
                <option>Sold</option>
                <option>Expired</option>
                <option>Pending Approval</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none" placeholder="Internal notes" />
          </div>
          </>
          )}
              {/* Submit Section */}
              <div className="pt-8 border-t border-gray-100">
                {currentStep < 4 ? (
                  <div className="max-w-3xl mx-auto">
                    <button type="button" onClick={nextStep} disabled={!isCurrentStepValid()} className={`w-full py-4 rounded-xl font-semibold focus:outline-none focus:ring-4 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${isCurrentStepValid() ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-100 hover:shadow-xl' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                      Continue
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        'Create Property'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Right Sidebar - Stepper */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 sticky top-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Create property</h4>
                  <p className="text-xs text-gray-600">Finish basic details and choose your nearest region to get started.</p>
                </div>
              </div>
              {/* Horizontal stepper like profile sidebar */}
              <div className="flex items-center gap-2">
                {(() => {
                  const steps = [1,2,3,4];
                  return (
                    <>
                      {steps.map((n, idx) => {
                        const isActive = n === currentStep;
                        const isCompleted = n < currentStep;
                        const circle = isActive
                          ? "bg-blue-600 text-white"
                          : isCompleted
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200";
                        return (
                          <React.Fragment key={n}>
                            <button type="button" onClick={() => goToStep(n)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${circle}`}>{n}</button>
                            {idx < steps.length - 1 && (
                              <span className={`w-6 h-[2px] ${n < currentStep ? 'bg-green-200' : 'bg-gray-200'}`}></span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
              {/* Sidebar controls removed to avoid duplicate nav; use bottom controls only */}
            </div>

            {/* Property summary */}
            <div className="mt-4 bg-white rounded-2xl shadow border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Property summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="font-medium">{status}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Title</span><span className="font-medium truncate max-w-[160px]" title={form.title || "Untitled"}>{form.title || "Untitled"}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">City</span><span className="font-medium">{form.city || "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Region</span><span className="font-medium truncate max-w-[160px]" title={form.region || "-"}>{form.region || "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Price</span><span className="font-medium">{form.price ? `${form.priceUnit} ${form.price}` : '-'}</span></div>
              </div>
            </div>

          {/* Nearest regions (static preview like profile) */}
          <div className="mt-4 bg-white rounded-2xl shadow border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Nearest regions</h4>
              <button type="button" className="text-xs text-blue-600 hover:underline">Use nearest</button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-700">{form.city || 'Your city'}</span><span className="text-gray-500">0 km</span></div>
              <div className="flex justify-between"><span className="text-gray-700">Agra</span><span className="text-gray-500">316 km</span></div>
              <div className="flex justify-between"><span className="text-gray-700">Delhi</span><span className="text-gray-500">350 km</span></div>
            </div>
          </div>

            {/* Tips */}
            <div className="mt-4 bg-white rounded-2xl shadow border border-gray-100 p-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Tips</h4>
              <ul className="text-[13px] text-gray-700 list-disc pl-5 space-y-2">
                <li>Fill basic info first, then details.</li>
                <li>Use realistic price and clear title.</li>
                <li>Add at least 3 good images and one video link.</li>
              </ul>
            </div>
          </div>

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NewPropertyPage;
