"use client";
import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { toast, Toaster } from "react-hot-toast";
import ProtectedRoute from "../../components/ProtectedRoute";
import HeaderFile from "../../components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NewPropertyPage = () => {
  const router = useRouter();
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
  // New property meta fields
  const amenityPresetOptions = [
    "Parking","Power Backup","Lift","Garden","Security","Gym","Water Supply","Swimming Pool"
  ];
  const [facingDirection, setFacingDirection] = useState("");
  const [possessionStatus, setPossessionStatus] = useState("");
  const [propertyAge, setPropertyAge] = useState("");
  const [propertyAgeYears, setPropertyAgeYears] = useState("");
  const addressInputRef = useRef(null);
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const regionInputRef = useRef(null);
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnishing, setFurnishing] = useState("Furnished");
  const [status, setStatus] = useState("Pending Approval");
  const [isFeatured, setIsFeatured] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Wizard steps (match profile page flow style)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Load Google Places API script
  useEffect(() => {
    const loadGooglePlaces = () => {
      try {
        if (window.google && window.google.maps && window.google.maps.places) {
          setGoogleLoaded(true);
          return;
        }
      } catch {}

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.onload = () => setGoogleLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleLoaded(true);
      script.onerror = () => {
        console.error("Google Places API failed to load");
      };
      document.head.appendChild(script);
    };

    loadGooglePlaces();
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleAddressInputChange = (inputValue) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!googleLoaded || !window.google || !inputValue || inputValue.length < 1) {
      setAddressOptions([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      setIsLoadingAddresses(true);
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: inputValue,
          types: ["establishment", "geocode"],
          componentRestrictions: { country: "in" },
        },
        (predictions, status) => {
          setIsLoadingAddresses(false);
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            const options = predictions.map((p) => ({
              value: p.place_id,
              label: p.description,
              placeId: p.place_id,
              description: p.description,
            }));
            setAddressOptions(options);
          } else {
            setAddressOptions([]);
          }
        }
      );
    }, 300);
  };

  const handleAddressChange = (selectedOption) => {
    setSelectedAddress(selectedOption);
    setForm((prev) => ({ ...prev, address: selectedOption ? selectedOption.description : "" }));
    // Try to resolve coordinates for later use
    try {
      if (window.google && window.google.maps && selectedOption?.placeId) {
        const service = new window.google.maps.places.PlacesService(document.createElement("div"));
        service.getDetails({ placeId: selectedOption.placeId }, (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place && place.geometry && place.geometry.location
          ) {
            setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          }
        });
      }
    } catch {}
  };

  // Google Places Autocomplete for Address (reuse profile pattern)
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const searchTimeoutRef = useRef(null);
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  // Regions API state
  const [regions, setRegions] = useState([]);
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [regionSearchQuery, setRegionSearchQuery] = useState("");
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionsError, setRegionsError] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const PRICE_MIN = 0;
  const PRICE_MAX = 100000000; // 10 cr cap, adjust as needed
  const PRICE_STEP = 10000;

  const formatCurrencyINR = (v) => {
    if (v === undefined || v === null || v === "") return "₹0";
    const num = Number(v);
    if (Number.isNaN(num)) return "₹0";
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
  };

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

  // Load Google Places script if not present
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.google && window.google.maps && window.google.maps.places) return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    const existing = document.getElementById('google-places-script');
    if (existing) return; 
    const script = document.createElement('script');
    script.id = 'google-places-script';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    document.head.appendChild(script);
  }, []);

  // Initialize Google Places Autocomplete for address if available
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places && addressInputRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, { types: ['geocode'] });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const formattedAddress = place?.formatted_address || addressInputRef.current.value || '';
          // Parse city and state from address components
          let detectedCity = '';
          let detectedState = '';
          const comps = place?.address_components || [];
          comps.forEach((c) => {
            if ((c.types || []).includes('locality')) detectedCity = c.long_name || c.short_name || detectedCity;
            if ((c.types || []).includes('administrative_area_level_1')) detectedState = c.long_name || c.short_name || detectedState;
          });

          setForm((prev) => ({ ...prev, address: formattedAddress, city: detectedCity || prev.city }));

          // Filter regions based on detected city
          if (detectedCity) {
            const matches = regions.filter((r) => (r.city || '').toLowerCase() === detectedCity.toLowerCase());
            setFilteredRegions(matches.length ? matches : regions);
          }
        });
      }
    } catch (err) {
      // Fail silently if Google is not available
      console.warn('Address autocomplete init failed:', err);
    }
  }, [regions]);

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
    return (
      isNonEmpty(form.title) &&
      isNonEmpty(form.region) &&
      isNonEmpty(form.address) &&
      isPositiveNumber(form.price) &&
      isNonEmpty(form.city) &&
      isPositiveNumber(form.propertySize) &&
      isPositiveNumber(bedrooms) &&
      isPositiveNumber(bathrooms) &&
      isNonEmpty(form.propertyType) &&
      isNonEmpty(form.subType)
    );
  };

  const isStep2Valid = () => {
    return true; // amenities optional
  };

  const isStep3Valid = () => {
    return (images.length + imageFiles.length) >= 3; // require at least 3 images
  };

  const isCurrentStepValid = () => {
    if (currentStep === 1) return isStep1Valid();
    if (currentStep === 2) return isStep2Valid();
    if (currentStep === 3) return isStep3Valid();
    return false;
  };

  const goToStep = (step) => {
    if (step < 1 || step > totalSteps) return;
    setCurrentStep(step);
  };
  const nextStep = (e) => { 
    e.preventDefault();
    e.stopPropagation();
    console.log('Continue button clicked, current step:', currentStep, 'isValid:', isCurrentStepValid());
    console.log('Continue button clicked - submitting state:', submitting);
    if (currentStep < totalSteps && isCurrentStepValid()) {
      console.log('Moving to next step...');
      setCurrentStep(currentStep + 1);
      console.log('Moved to step:', currentStep + 1);
    } else {
      console.log('Cannot proceed - either at last step or validation failed');
    }
  };
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
    // Clear previously selected region id when user types manually
    setSelectedRegionId("");
  };

  const handleRegionSelect = (region) => {
    const regionValue = formatRegionValue(region);
    setForm(prev => ({ ...prev, region: regionValue }));
    // Clear search query so dropdown shows all regions when reopened
    setRegionSearchQuery("");
    setIsRegionDropdownOpen(false);
    // Track region id to submit to API
    setSelectedRegionId(region?._id || "");
    // Auto-fill city from selected region
    if (region && region.city) {
      setForm(prev => ({ ...prev, city: region.city }));
    }
    // Blur input to prevent dropdown reopening and ensure value visible
    try { regionInputRef.current && regionInputRef.current.blur(); } catch {}
  };

  const handleRegionInputFocus = () => {
    // Clear search query to show all regions when opening dropdown
    setRegionSearchQuery("");
    // Ensure all regions are shown immediately
    if (regions.length > 0) {
      setFilteredRegions(regions);
    }
    setIsRegionDropdownOpen(true);
  };

  const handleRegionInputKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsRegionDropdownOpen(false);
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Form submitted - current step:', currentStep);
    console.log('Form submitted - submitting state:', submitting);
    
    // Only proceed if we're on the last step (Step 3)
    if (currentStep !== 3) {
      console.log('Form submitted but not on Step 4, current step:', currentStep);
      console.log('Preventing form submission - not on step 4');
      toast.error(`Please complete all steps. Currently on step ${currentStep} of 3.`);
      return;
    }
    
    console.log('Create Property button clicked - starting property creation');
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to create a property");
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
        toast.error("Failed to extract user ID from token. Please re-login.");
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
        toast.error("Broker not found for this account.");
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
      // Resolve region to a valid ObjectId for API
      let regionIdToSend = selectedRegionId;
      if (!regionIdToSend && form.region) {
        const match = regions.find((r) => formatRegionValue(r) === form.region);
        if (match && match._id) {
          regionIdToSend = match._id;
          setSelectedRegionId(match._id);
        }
      }
      if (!regionIdToSend) {
        toast.error("Please select a valid region from the list.");
        setSubmitting(false);
        return;
      }
      formData.append("region", regionIdToSend);

      // Coordinates - removed as not allowed by API validation

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
      if (facingDirection) formData.append("facingDirection", facingDirection);
      if (possessionStatus) formData.append("possessionStatus", possessionStatus);
      // Map UI selection to numeric years for backend
      let ageYearsToSend = propertyAgeYears;
      if (!ageYearsToSend && propertyAge) {
        if (propertyAge === "New") ageYearsToSend = "0";
        else if (propertyAge === "<5 Years") ageYearsToSend = "3";
        else if (propertyAge === "<10 Years") ageYearsToSend = "8";
        else if (propertyAge === ">10 Years") ageYearsToSend = "11";
      }
      if (ageYearsToSend !== undefined && ageYearsToSend !== null && `${ageYearsToSend}` !== "") {
        formData.append("propertyAgeYears", `${ageYearsToSend}`);
      }
      // optionally send postedBy and verificationStatus defaults
      formData.append("postedBy", "Broker");
      formData.append("verificationStatus", "Unverified");

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
      toast.success("Property created successfully!", {
        duration: 3000,
        icon: '✅',
      });

      // ✅ Navigate to properties management page after success
      setTimeout(() => {
        router.push("/properties-management");
      }, 2000); // Navigate after 2 seconds to show success message
    } catch (err) {
      toast.error(err.message || "Failed to create property. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      {/* Google Places dropdown styles */}
      <link rel="stylesheet" href="/google-places.css" />
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
      <HeaderFile
        data={{
          title: "Add New Property",
          breadcrumb: [
            { label: "Home", href: "/" },
            { label: "Properties", href: "/properties-management" },
            { label: "Add New", href: "/properties-management/new" },
          ],
        }}
      />
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
          </div>

          {/* Layout: form + right sidebar like profile page */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left header progress bar (profile-style card) */}
          <div className="col-span-12 lg:col-span-8 ">
          <div className="">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, idx) => {
                    const isActive = step === currentStep;
                    const isCompleted = step < currentStep;
                    const circleClass = isCompleted
                      ? "bg-green-900 text-white"
                      : isActive
                      ? "bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500";
                    return (
                      <React.Fragment key={step}>
                        <button
                          type="button"
                          onClick={() => goToStep(step)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${circleClass} transition-all ${isActive || isCompleted ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        >
                          {step}
                        </button>
                        {idx < totalSteps - 1 && (
                          <div className={`${step < currentStep ? 'bg-green-900' : 'bg-gray-200'} flex-1 h-1 mx-1`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-gray-600">{progressPercent}% Completed</span>
                </div>
                <div className="w-full h-7 relative">
                  <div className="absolute top-2.5 left-0 w-full h-2 bg-[#9AEFBD] rounded-md overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-[#0D542B] transition-all duration-300 ease-in-out" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
            {/* Form (left) */}
          <form onSubmit={(e) => {
            console.log('Form onSubmit triggered - current step:', currentStep);
            if (currentStep !== 3) {
              console.log('Form submission prevented - not on step 4');
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
            return handleSubmit(e);
          }} className="  ">
            
            {/* Stepper moved to right sidebar */}

            <div className=" space-y-8">
              {/* Basic Information Section */}
              {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
      <div className="w-5 h-5 flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>
                </div>
                
    {/* Title and Address (Address above Region) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Title *</label>
                    <input 
                      name="title" 
                      value={form.title} 
                      onChange={handleChange} 
                      onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }}
          className={`w-full rounded-xl text-[13px] px-3 py-2 focus:outline-none transition-all duration-200 ${
            isNonEmpty(form.title)
              ? 'border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-transparent'
              : 'border border-red-300 focus:ring-2 focus:ring-red-400'
          }`}
                      placeholder="Enter property title" 
                      required
                    />
                    {!isNonEmpty(form.title) && (<p className="text-xs text-red-600">Title is required.</p>)}
                  </div>
                  
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Address *</label>
        <Select
          value={selectedAddress || (form.address ? { value: form.address, label: form.address, description: form.address } : null)}
          onChange={handleAddressChange}
          onInputChange={handleAddressInputChange}
          options={addressOptions}
          placeholder={googleLoaded ? "Search address..." : "Loading address search..."}
          isClearable
          isSearchable
          isLoading={isLoadingAddresses}
          noOptionsMessage={() => "No addresses found"}
          loadingMessage={() => "Searching addresses..."}
          classNamePrefix="react-select"
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: 42,
              borderRadius: 12,
              borderColor: isNonEmpty(form.address) ? '#D1D5DB' : '#FCA5A5',
              boxShadow: state.isFocused ? (isNonEmpty(form.address) ? '0 0 0 2px #9CA3AF' : '0 0 0 2px #FCA5A5') : 'none',
              '&:hover': { borderColor: isNonEmpty(form.address) ? '#9CA3AF' : '#FCA5A5' },
              fontSize: 13,
            }),
            menu: (base) => ({ ...base, zIndex: 50 }),
            option: (base, state) => ({
              ...base,
              fontSize: '12px',
              padding: '8px 12px',
              color: state.isSelected || state.isFocused ? '#065f46' : '#374151',
              backgroundColor: state.isSelected 
                ? '#d1fae5' 
                : state.isFocused 
                ? '#f0fdf4' 
                : '#ffffff',
              '&:active': {
                backgroundColor: '#d1fae5',
              },
            }),
            singleValue: (base) => ({
              ...base,
              fontSize: '13px',
            }),
            input: (base) => ({
              ...base,
              fontSize: '13px',
            }),
          }}
        />
        {!isNonEmpty(form.address) && (<p className="text-xs text-red-600">Address is required.</p>)}
      </div>
    </div>

    {/* Region and City in one row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Region *</label>
                    <div className="relative region-dropdown">
                      <input
                        type="text"
                        name="region"
                        value={regionSearchQuery !== "" ? regionSearchQuery : form.region}
                        ref={regionInputRef}
                        onChange={handleRegionInputChange}
                        onFocus={handleRegionInputFocus}
                        onKeyDown={handleRegionInputKeyDown}
                        onClick={handleRegionInputFocus}
            className={`w-full rounded-xl text-[13px] px-3 py-2 focus:outline-none transition-all duration-200 ${
                          !isNonEmpty(form.region) 
                            ? 'border border-red-300 focus:ring-2 focus:ring-red-400' 
                : 'border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-transparent'
                        }`}
                        placeholder="Select a region..."
                        required
                        autoComplete="off"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isRegionDropdownOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {isRegionDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {regionsLoading ? (
                            <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                              Loading regions...
                            </div>
                          ) : regionsError ? (
                <div className="px-4 py-3 text-sm text-red-600">{regionsError}</div>
                          ) : filteredRegions.length === 0 && regions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No regions available
                            </div>
                          ) : filteredRegions.length === 0 && regionSearchQuery ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No regions found
                            </div>
                          ) : filteredRegions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              Loading regions...
                            </div>
                          ) : (
                            <ul className="py-1">
                              {filteredRegions.map((region) => (
                                <li key={region._id}>
                                  <button
                                    type="button"
                                    onClick={() => handleRegionSelect(region)}
                                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none cursor-pointer"
                                  >
                        <div className="font-medium text-gray-900">{region.name}</div>
                        <div className="text-xs text-gray-500">{region.city}, {region.state}</div>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
        {!isNonEmpty(form.region) && (<p className="text-xs text-red-600">Region is required.</p>)}
                </div>
                
                <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">City (auto)</label>
        <input
          name="city"
          value={form.city}
          readOnly
          className="w-full rounded-xl text-[13px] px-3 py-2 border border-gray-200 bg-gray-50 text-gray-700"
          placeholder="Auto-filled from address/region"
        />
      </div>
                </div>
                
    {/* Property meta quick picks */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Facing Direction</label>
        <div className="flex flex-wrap gap-2">
          {["North","East","South","West"].map(opt => (
            <button
              key={opt}
              type="button"
              onClick={()=>setFacingDirection(opt)}
              className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${
                facingDirection===opt
                  ? 'bg-gray-200 text-gray-900 border-gray-300'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {opt}
            </button>
          ))}
                </div>
              </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Possession Status</label>
        <div className="flex flex-wrap gap-2">
          {["Ready to Move","Under Construction","Upcoming"].map(opt => (
            <button
              key={opt}
              type="button"
              onClick={()=>setPossessionStatus(opt)}
              className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${
                possessionStatus===opt
                  ? 'bg-gray-200 text-gray-900 border-gray-300'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {opt}
            </button>
          ))}
                  </div>
                </div>
                
       
          </div>
                
    {/* Property Details & Pricing Section (Step 1) */}
    <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Price *</label>
          <div className="flex items-center justify-between">
                    
            <div className="w-full">
              <div className="relative">
                <span className="absolute inset-y-0 left-2 flex items-center text-gray-500">₹</span>
                    <input 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                      value={form.price} 
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "" || /^[0-9]+$/.test(raw)) {
                      setForm((prev) => ({ ...prev, price: raw }));
                    }
                  }}
                  className={`pl-6 pr-3 py-2 text-[13px] rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${!isPositiveNumber(form.price) ? 'border border-red-300 bg-white' : 'border border-gray-300 bg-white'}`}
                  aria-label="Price"
                      name="price" 
                      required
                    />
              </div>
              <input 
                type="range" 
                min={PRICE_MIN} 
                max={PRICE_MAX} 
                step={PRICE_STEP}
                value={Number(form.price || 0)}
                onChange={(e)=> setForm(prev=> ({...prev, price: String(Number(e.target.value)) }))}
                className="w-full mt-2 accent-green-900"
              />
            </div>
                  </div>
                    {!isPositiveNumber(form.price) && (<p className="text-xs text-red-600">Enter a valid price.</p>)}
                  </div>
                  
         {/* Property Age on the right of Price */}
                  <div className="space-y-2">
           <label className="block text-sm font-medium text-gray-700">Property Age</label>
           <div className="flex flex-wrap gap-2">
             {["New","<5 Years","<10 Years",">10 Years"].map(opt => (
               <button
                 key={opt}
                 type="button"
                 onClick={()=>setPropertyAge(opt)}
                 className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${
                   propertyAge===opt
                     ? 'bg-gray-200 text-gray-900 border-gray-300'
                     : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                 }`}
               >
                 {opt}
               </button>
             ))}
                  </div>
          </div>
                </div>
                
       {/* Property detail fields */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Size (sqft)</label>
                    <input 
                      type="number" 
                      name="propertySize" 
                      value={form.propertySize} 
                      onChange={handleChange} 
                      onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }}
            className="w-full border border-gray-300 rounded-xl text-[13px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                      placeholder="e.g. 1200"
                    />
            </div>
                  
                  <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Bedrooms (BHK)</label>
          <div className="flex flex-wrap gap-2">
            {["1","2","3","4","5+"].map(opt => {
              const on = (bedrooms === opt) || (opt==='5+' && Number(bedrooms) >= 5);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={()=>setBedrooms(opt === '5+' ? '5' : opt)}
                  className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${
                    on ? 'bg-gray-200 text-gray-900 border-gray-300' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
            </div>
                  
       </div>

       {/* Bathrooms + Property Type */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
           <div className="flex flex-wrap gap-2">
             {["1","2","3","4","5+"].map(opt => {
               const on = (bathrooms === opt) || (opt==='5+' && Number(bathrooms) >= 5);
               return (
                 <button
                   key={opt}
                   type="button"
                   onClick={()=>setBathrooms(opt === '5+' ? '5' : opt)}
                   className={`px-2.5 py-1 rounded-md text-[12px] border transition-colors ${
                     on ? 'bg-gray-200 text-gray-900 border-gray-300' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                   }`}
                 >
                   {opt}
                 </button>
               );
             })}
            </div>
          </div>
                
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Type *</label>
                    <select 
                      name="propertyType" 
                      value={form.propertyType} 
                      onChange={handleChange} 
            className="w-full border border-gray-300 rounded-xl text-[13px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                      required
                    >
                <option>Residential</option>
                <option>Commercial</option>
                <option>Plot</option>
                <option>Other</option>
              </select>
            </div>
                  
       </div>

       {/* Sub Type + Furnishing */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sub Type</label>
                    <select 
                      name="subType" 
                      value={form.subType} 
                      onChange={handleChange} 
             className="w-full border border-gray-300 rounded-xl text-[13px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
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
             className="w-full border border-gray-300 rounded-xl text-[13px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                    >
                <option>Furnished</option>
                <option>Semi-Furnished</option>
                <option>Unfurnished</option>
              </select>
            </div>
          </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Short Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-xl text-[13px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 resize-none"
          placeholder="Brief description of the property"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
        <textarea
          name="propertyDescription"
          value={form.propertyDescription}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-xl text-[13px] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 resize-none"
          placeholder="Comprehensive description with all details"
        />
      </div>
    </div>
            </div>
              )}

              {/* Amenities Section (Step 2) */}
              {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
            </div>
                  <h3 className="text-base font-semibold text-gray-900">Amenities & Features</h3>
          </div>
                
                {/* Property Amenities with preset chips */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-900">Property Amenities</label>
                  
                  {/* Preset amenities as clickable chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {amenityPresetOptions.map((preset) => {
                      const isSelected = amenities.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              removeFrom(preset, setAmenities);
                            } else {
                              if (!amenities.includes(preset)) {
                                setAmenities(prev => [...prev, preset]);
                              }
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                            isSelected
                              ? 'bg-green-900 text-white border-green-900'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {preset}
                          {isSelected && <span className="ml-1">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Custom input field - type and press Enter to add */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAmenity();
                        }
                      }}
                      className="flex-1 border border-gray-300 rounded-xl text-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Type amenity and press Enter to add"
                      />
                    </div>
                  
                  {/* Selected amenities as chips */}
                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {amenities.map(a => (
                        <span key={a} className="inline-flex items-center gap-1 text-[12px] bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
                          {a}
                      <button 
                        type="button" 
                            onClick={() => removeFrom(a, setAmenities)} 
                            className="text-green-900 hover:text-green-800 cursor-pointer"
                      >
                            ×
                      </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

        
                
              
                {/* Step navigation removed; use global bottom controls */}
            </div>
              )}
              {/* Images (Step 3) - 3-Step Media Upload */}
              {currentStep === 3 && (
              <div className=" gap-6">
                {/* Left Side - 3 Steps Interface */}
                <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0122 9.528v4.944a2 2 0 01-2.447 1.804L15 14m0-4v4m0-4L9 6m6 8l-6 4m0-12v8m0 0L3.447 9.528A2 2 0 013 7.724V2.78A2 2 0 015.447.976L9 2.5" />
                              </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Media & Publishing</h3>
                </div>


                  {/* Step 1: Add Images */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-900">Step 1: Add Images (min 3)</label>
                      <span className="text-xs text-gray-500">{images.length + imageFiles.length} / 3 minimum</span>
                    </div>
                    {/* Clickable upload area */}
                    <div 
                      onClick={()=>{ fileInputRef.current && fileInputRef.current.click(); }}
                      className="border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-green-500 hover:bg-green-50 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center py-12 px-4"
                    >
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600">Add Images</span>
                      <span className="text-xs text-gray-400 mt-1">Click to upload or drag and drop</span>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={(e)=>{ const files = Array.from(e.target.files || []); if(files.length){ setImageFiles((prev)=>[...prev, ...files]); } }} 
                      className="hidden" 
                    />
            </div>
                    
                    {/* Image Gallery Grid */}
                    {(images.length > 0 || imageFiles.length > 0) && (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {/* URL Images */}
                        {images.map((url, idx) => (
                          <div key={`url-${idx}`} className="relative group aspect-square">
                            <img 
                              src={url} 
                              alt={`Image ${idx + 1}`} 
                              className="w-full h-full object-cover rounded-lg border border-gray-200"
                              onError={(e) => { e.target.src = '/images/placeholder-image.png'; }}
                            />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeFrom(url, setImages); }}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-lg"
                            >
                              ×
                            </button>
                </div>
                        ))}
                        {/* File Images */}
                        {imageFiles.map((file, idx) => {
                          const url = URL.createObjectURL(file);
                          return (
                            <div key={`file-${idx}`} className="relative group aspect-square">
                              <img 
                                src={url} 
                                alt={file.name} 
                                className="w-full h-full object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setImageFiles((prev) => prev.filter((_, i) => i !== idx)); }}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-lg"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step 2: Add Videos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-900">Step 2: Add Videos (optional)</label>
                      <span className="text-xs text-gray-500">{videos.length + videoFiles.length} added</span>
                    </div>
                    {/* Clickable upload area for videos */}
                    <div 
                      onClick={()=>{ videoFileInputRef.current && videoFileInputRef.current.click(); }}
                      className="border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-green-500 hover:bg-green-50 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center py-12 px-4"
                    >
                      <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0122 9.528v4.944a2 2 0 01-2.447 1.804L15 14m0-4v4m0-4L9 6m6 8l-6 4m0-12v8m0 0L3.447 9.528A2 2 0 013 7.724V2.78A2 2 0 015.447.976L9 2.5" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600">Add Videos</span>
                      <span className="text-xs text-gray-400 mt-1">Click to upload video files</span>
                      <input 
                        ref={videoFileInputRef}
                        type="file" 
                        multiple 
                        accept="video/*" 
                        onChange={(e)=>{ const files = Array.from(e.target.files || []); if(files.length){ setVideoFiles((prev)=>[...prev, ...files]); } }} 
                        className="hidden" 
                      />
                    </div>
                    
                    {/* Video Preview List */}
                    {(videos.length > 0 || videoFiles.length > 0) && (
                      <div className="grid grid-cols-1 gap-2 mt-4">
                        {/* URL Videos */}
                        {videos.map((url, idx) => (
                          <div key={`video-url-${idx}`} className="relative group bg-gray-100 rounded-lg p-3 flex items-center gap-3">
                            <svg className="w-8 h-8 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-gray-600 truncate flex-1">{url}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeFrom(url, setVideos); }}
                              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {/* File Videos */}
                        {videoFiles.map((file, idx) => (
                          <div key={`video-file-${idx}`} className="relative group bg-gray-100 rounded-lg p-3 flex items-center gap-3">
                            <svg className="w-8 h-8 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-gray-600 truncate flex-1">{file.name}</span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setVideoFiles((prev) => prev.filter((_, i) => i !== idx)); }}
                              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                ))}
              </div>
            )}
          </div>

                  {/* Step 3: Notes */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea 
                      value={notes} 
                      onChange={(e)=>setNotes(e.target.value)} 
                      rows={2} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" 
                      placeholder="Internal notes (optional)" 
                    />
                  </div>
                </div>

               
              </div>
              )}
          {currentStep === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Amenities</label>
            <div className="flex gap-2">
              <input value={nearbyAmenityInput} onChange={(e)=>setNearbyAmenityInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput); } }} className="flex-1 border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Type nearby amenity and press Enter to add" />
            </div>
            {nearbyAmenities.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {nearbyAmenities.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700  px-2 py-1 rounded-full border border-green-200">{a}<button type="button" onClick={()=>removeFrom(a, setNearbyAmenities)} className="text-green-900 hover:text-green-800 cursor-pointer">×</button></span>
                ))}
              </div>
            )}
          </div>
          )}
          {currentStep === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
            <div className="flex gap-2">
              <input value={featureInput} onChange={(e)=>setFeatureInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(featureInput, setFeatures, features, setFeatureInput); } }} className="flex-1 border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Type feature and press Enter to add" />
            </div>
            {features.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {features.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">{a}<button type="button" onClick={()=>removeFrom(a, setFeatures)} className="text-green-900 hover:text-green-800 cursor-pointer">×</button></span>
                ))}
              </div>
            )}
          </div>
          )}
          {currentStep === 2 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Benefits</label>
            <div className="flex gap-2">
              <input value={locationBenefitInput} onChange={(e)=>setLocationBenefitInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput); } }} className="flex-1 border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Type location benefit and press Enter to add" />
            </div>
            {locationBenefits.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {locationBenefits.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">{a}<button type="button" onClick={()=>removeFrom(a, setLocationBenefits)} className="cursor-pointer text-green-900 hover:text-green-800">×</button></span>
                ))}
              </div>
            )}
          </div>
          )}
              {/* Submit Section */}
              <div className="pt-8 border-t border-gray-100">
                {currentStep < 3 ? (
                  <div className="max-w-3xl mx-auto">
                    <button 
                      type="button" 
                      onClick={nextStep} 
                      disabled={!isCurrentStepValid() || submitting} 
                      className={`w-full py-3 rounded-xl font-semibold focus:outline-none focus:ring-4 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${isCurrentStepValid() && !submitting ? 'bg-green-900 text-white hover:bg-green-700 focus:ring-green-100 hover:shadow-xl' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                      Continue
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full py-3 bg-green-900 text-white rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Create Property
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>

          </div>

          {/* Right Sidebar - Tips and Support (match profile style) */}
          <div className="col-span-12 lg:col-span-4 space-y-4 order-1 lg:sticky lg:top-4 self-start">
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 sticky top-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Tips for Property Creation</h4>
              <ul className="text-[13px] text-gray-700 list-disc pl-5 space-y-2">
                <li>Fill basic info first, then add region details.</li>
                <li>Use address autocomplete to quickly pick exact locations.</li>
                <li>Add at least 3 clear images and one video link.</li>
                <li>Use nearest regions for faster setup.</li>
              </ul>
                </div>

         <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 sticky top-[260px]">
  <h4 className="text-sm font-semibold text-gray-900 mb-3">Support & Documentation</h4>

  <div className="space-y-3 text-[13px]">
    {/* Support Center */}
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-green-50 border border-green-200 text-green-700 flex items-center justify-center">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.09 9a3 3 0 015.82 0c0 1.657-1.5 2.34-1.5 3.5m.01 3h-.01"
          />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>
                <div>
        <p className="font-medium text-gray-900">Visit Support Center</p>
        <p className="text-gray-600">Answers to frequently asked questions.</p>
                </div>
            </div>

    {/* Documentation */}
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-green-50 border border-green-200 text-green-700 flex items-center justify-center">
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      </span>
      <div>
        <p className="font-medium text-gray-900">Read Documentation</p>
        <p className="text-gray-600">Explore guides and platform tutorials.</p>
              </div>
            </div>

    {/* Email Support */}
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-green-50 border border-green-200 text-green-700 flex items-center justify-center">
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 4h16v16H4z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </span>
      <div>
        <p className="font-medium text-gray-900">Email Support</p>
        <p className="text-gray-600">support@brokeradda.com</p>
            </div>
            </div>
            </div>
          </div>

          </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NewPropertyPage;

