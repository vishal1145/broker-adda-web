"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const userRole = user?.role || "broker";

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = userRole === "broker" ? 4 : 2; // Brokers have 4 steps, customers have 2

  // Broker form data
  const [brokerFormData, setBrokerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    firmName: "",
    regions: [],
    aadharFile: null,
    panFile: null,
    gstFile: null,
    brokerLicenseFile: null,
    companyIdFile: null,
    brokerImage: null,
    // Additional professional fields
    licenseNumber: "",
    officeAddress: "",
    address: "",
    city: "",
    state: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    facebook: "",
    whatsapp: "",
    website: "",
    specializations: [],
    // Personal details
    gender: "",
    dateOfBirth: "",
  });

  // Customer form data
  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    budgetMin: "",
    budgetMax: "",
    propertyType: [],
    inquiryCount: 0,
    customerImage: null,
    // Personal details
    gender: "",
    dateOfBirth: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [regionsList, setRegionsList] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionsError, setRegionsError] = useState("");
  // Nearest by coordinates mode and data
  const [nearestMode, setNearestMode] = useState(true);
  const [geoCoords, setGeoCoords] = useState({
    latitude: null,
    longitude: null,
  });
  const [nearestRegions, setNearestRegions] = useState([]);
  const [nearestRegionsLoading, setNearestRegionsLoading] = useState(false);
  const [nearestRegionsError, setNearestRegionsError] = useState("");
  const [statesList, setStatesList] = useState([
    { value: "uttar-pradesh", label: "Uttar Pradesh" },
  ]);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [selectedOfficeAddress, setSelectedOfficeAddress] = useState(null);
  const [officeAddressOptions, setOfficeAddressOptions] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [budgetError, setBudgetError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [propertyTypeOptions] = useState([
    "apartment",
    "commercial",
    "plot",
    "villa",
    "house",
  ]);
  const [specializationOptions] = useState([
    "Residential Sales",
    "Commercial Leasing",
    "Luxury Homes",
    "Investment Properties",
    "Rental Properties",
    "Land Development",
    "Property Management",
    "Real Estate Consulting",
  ]);

  // Load Google Places API
  useEffect(() => {
    const loadGooglePlaces = () => {
      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setGoogleLoaded(true);
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        existingScript.onload = () => setGoogleLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setGoogleLoaded(true);
      };

      script.onerror = (error) => {
        toast.error(
          "Failed to load address autocomplete. Please check your API key."
        );
      };

      document.head.appendChild(script);
    };

    loadGooglePlaces();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Validate budget when customer form data changes
  useEffect(() => {
    if (
      userRole === "customer" &&
      customerFormData.budgetMin &&
      customerFormData.budgetMax
    ) {
      const min = parseFloat(customerFormData.budgetMin);
      const max = parseFloat(customerFormData.budgetMax);

      if (min > max) {
        setBudgetError("Minimum budget cannot be greater than maximum budget");
      } else {
        setBudgetError("");
      }
    } else if (userRole === "customer") {
      setBudgetError("");
    }
  }, [customerFormData.budgetMin, customerFormData.budgetMax, userRole]);

  // Handle input change for office address search with debouncing
  const handleOfficeAddressInputChange = (inputValue) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (
      !googleLoaded ||
      !window.google ||
      !inputValue ||
      inputValue.length < 1
    ) {
      setOfficeAddressOptions([]);
      return;
    }

    // Debounce the search by 300ms
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
            const options = predictions.map((prediction) => ({
              value: prediction.place_id,
              label: prediction.description,
              placeId: prediction.place_id,
              description: prediction.description,
            }));
            setOfficeAddressOptions(options);
          } else {
            setOfficeAddressOptions([]);
          }
        }
      );
    }, 300);
  };

  // Auto-fetch nearest only when coordinates are available (not just toggling)
  useEffect(() => {
    const tryFetch = async () => {
      if (!nearestMode) return;
      let { latitude, longitude } = geoCoords || {};
      if (latitude && longitude)
        await loadNearestRegionsByCoords(latitude, longitude, 5);
    };
    tryFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearestMode]);

  // If coords become available while in nearest mode, fetch automatically
  useEffect(() => {
    if (nearestMode && geoCoords?.latitude && geoCoords?.longitude) {
      loadNearestRegionsByCoords(geoCoords.latitude, geoCoords.longitude, 5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoCoords?.latitude, geoCoords?.longitude]);

  // When navigating to Preferred Regions step, auto-resolve coords and call nearest API
  useEffect(() => {
    const enterStepFetch = async () => {
      const isPreferredRegionsStep = currentStep === 2 && userRole === "broker";
      if (!isPreferredRegionsStep || !nearestMode) return;
      let { latitude, longitude } = geoCoords || {};
      try {
        if (
          (!latitude || !longitude) &&
          selectedOfficeAddress &&
          selectedOfficeAddress.placeId &&
          window.google &&
          window.google.maps
        ) {
          const service = new window.google.maps.places.PlacesService(
            document.createElement("div")
          );
          await new Promise((resolve) => {
            service.getDetails(
              { placeId: selectedOfficeAddress.placeId },
              (place, status) => {
                if (
                  status === window.google.maps.places.PlacesServiceStatus.OK &&
                  place &&
                  place.geometry &&
                  place.geometry.location
                ) {
                  latitude = place.geometry.location.lat();
                  longitude = place.geometry.location.lng();
                  setGeoCoords({ latitude, longitude });
                }
                resolve();
              }
            );
          });
        }
        if ((!latitude || !longitude) && window.google && window.google.maps) {
          const stateText = selectedState
            ? selectedState.label || selectedState.value
            : "";
          const cityText = selectedCity
            ? selectedCity.label || selectedCity.value
            : "";
          const query = [cityText, stateText].filter(Boolean).join(", ");
          if (query) {
            const geocoder = new window.google.maps.Geocoder();
            await new Promise((resolve) => {
              geocoder.geocode({ address: query }, (results, status) => {
                if (
                  status === "OK" &&
                  results &&
                  results[0] &&
                  results[0].geometry &&
                  results[0].geometry.location
                ) {
                  latitude = results[0].geometry.location.lat();
                  longitude = results[0].geometry.location.lng();
                  setGeoCoords({ latitude, longitude });
                }
                resolve();
              });
            });
          }
        }
        if (latitude && longitude) {
          await loadNearestRegionsByCoords(latitude, longitude, 5);
        }
      } catch {
        // silent
      }
    };
    enterStepFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, nearestMode]);

  // Handle office address selection
  const handleOfficeAddressChange = (selectedOption) => {
    setSelectedOfficeAddress(selectedOption);
    if (selectedOption) {
      setBrokerFormData((prev) => ({
        ...prev,
        officeAddress: selectedOption.description,
      }));
      // toast.success('Address selected successfully');
      // Try to resolve coordinates from Google Place details if available
      try {
        if (window.google && window.google.maps && selectedOption.placeId) {
          const service = new window.google.maps.places.PlacesService(
            document.createElement("div")
          );
          service.getDetails(
            { placeId: selectedOption.placeId },
            (place, status) => {
              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                place &&
                place.geometry &&
                place.geometry.location
              ) {
                const latitude = place.geometry.location.lat();
                const longitude = place.geometry.location.lng();
                setGeoCoords({ latitude, longitude });
              }
            }
          );
        }
      } catch {}
    }
  };

  // Fetch nearest regions using stored coordinates
  const loadNearestRegionsByCoords = async (latitude, longitude, limit = 5) => {
    if (!latitude || !longitude) return;
    try {
      setNearestRegionsLoading(true);
      setNearestRegionsError("");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const url = `${baseUrl}/regions/nearest?latitude=${encodeURIComponent(
        latitude
      )}&longitude=${encodeURIComponent(longitude)}&limit=${encodeURIComponent(
        limit
      )}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      let list = [];
      if (data?.success && Array.isArray(data?.data?.regions))
        list = data.data.regions;
      else if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.regions)) list = data.regions;
      else if (data?._id && data?.name) list = [data];
      setNearestRegions(Array.isArray(list) ? list : []);
    } catch {
      setNearestRegionsError("Error loading nearest regions");
      setNearestRegions([]);
    } finally {
      setNearestRegionsLoading(false);
    }
  };

  // Handle current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    toast.loading("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Use Google Geocoding API to get address from coordinates
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = new window.google.maps.LatLng(latitude, longitude);

          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === "OK" && results[0]) {
              const address = results[0].formatted_address;
              const addressOption = {
                value: address,
                label: address,
                description: address,
              };

              // Add to options if not already there
              setOfficeAddressOptions((prev) => {
                const exists = prev.some((option) => option.value === address);
                if (!exists) {
                  return [...prev, addressOption];
                }
                return prev;
              });

              // Set the selected address
              setSelectedOfficeAddress(addressOption);
              setBrokerFormData((prev) => ({
                ...prev,
                officeAddress: address,
              }));

              // Set coordinates to trigger nearest regions API call
              setGeoCoords({ latitude, longitude });

              toast.dismiss();
              // toast.success('Current location set successfully!');
            } else {
              toast.dismiss();
              toast.error("Could not get address from location");
            }
          });
        } else {
          // Even if Google Maps API is not loaded, we can still set coordinates
          // and let the user manually enter address
          setGeoCoords({ latitude, longitude });
          toast.dismiss();
          toast.error("Google Maps API not loaded, but coordinates are set");
        }
      },
      (error) => {
        toast.dismiss();
        let errorMessage = "Error getting location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Position unavailable";
            break;
          case error.TIMEOUT:
            errorMessage += "Request timeout";
            break;
          default:
            errorMessage += "Unknown error";
            break;
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Pre-fill phone number from user data
  useEffect(() => {
    if (user?.phone) {
      if (user.role === "customer") {
        setCustomerFormData((prev) => ({ ...prev, phone: user.phone }));
      } else {
        setBrokerFormData((prev) => ({ ...prev, phone: user.phone }));
      }
    }
  }, [user]);

  // Load profile data based on user role
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        if (!user?.token) {
          setProfileLoading(false);
          return;
        }

        const currentUserRole = user.role || "broker";

        let response;
        if (currentUserRole === "customer") {
          // Get customer ID from user context
          const customerId = user.userId;

          if (customerId) {
            response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/customers/${customerId}`,
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                  Accept: "application/json",
                },
              }
            );
          } else {
            toast.error("Customer ID not found in token");
            setProfileLoading(false);
            return;
          }
        } else {
          // For broker, get broker ID from user context
          const brokerId = user.userId;

          if (brokerId) {
            // Call get broker by ID API
            const brokerUrl = `${process.env.NEXT_PUBLIC_API_URL}/brokers/${brokerId}`;

            response = await fetch(brokerUrl, {
              headers: {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            });
          } else {
            toast.error("Broker ID not found in token");
            setProfileLoading(false);
            return;
          }
        }

        if (response.ok) {
          let data = await response.json();

          if (currentUserRole === "customer") {
            // Update customer form data from customer by ID API response
            const customerData = data.data?.customer || data.data || data;
            // Extract customer image from the actual API response structure
            const customerImage =
              customerData.images?.customerImage ||
              customerData.files?.customerImage ||
              customerData.customerImage ||
              null;

            // Extract preferences from the actual API response structure
            const preferences = customerData.preferences || {};
            const budgetMin = preferences.budgetMin || "";
            const budgetMax = preferences.budgetMax || "";
            const propertyType = preferences.propertyType || [];
            const regions = preferences.region || [];

            // Extract customer gender field
            const gender = customerData.gender || customerFormData.gender || "";

            setCustomerFormData((prev) => ({
              ...prev,
              name: customerData.name || prev.name,
              email: customerData.email || prev.email,
              phone: customerData.phone || prev.phone,
              budgetMin: budgetMin,
              budgetMax: budgetMax,
              propertyType: propertyType,
              regions: regions,
              inquiryCount: customerData.inquiryCount || prev.inquiryCount,
              customerImage: customerImage,
              gender: gender,
            }));
          } else {
            // Broker data binding - improved handling
            // Handle different API response structures for broker data
            let brokerData;
            if (data.data) {
              // If response has nested data structure
              brokerData = data.data.broker || data.data;
            } else {
              // If response is direct broker data
              brokerData = data;
            }

            // Extract broker information with better error handling
            const extractBrokerField = (fieldName, fallbackValue = "") => {
              const possiblePaths = [
                brokerData[fieldName],
                brokerData.user?.[fieldName],
                brokerData.brokerDetails?.[fieldName],
                brokerData.brokerDetail?.[fieldName],
                brokerData.personalInfo?.[fieldName],
                brokerData.businessInfo?.[fieldName],
              ];

              const value = possiblePaths.find(
                (val) => val !== undefined && val !== null && val !== ""
              );
              return value || fallbackValue;
            };

            // Handle regions based on actual API response structure
            let regions = [];
            if (brokerData.region && Array.isArray(brokerData.region)) {
              regions = brokerData.region;
            } else if (
              brokerData.regions &&
              Array.isArray(brokerData.regions)
            ) {
              regions = brokerData.regions;
            }

            // Extract broker fields based on actual API response structure
            const name =
              brokerData.name || brokerData.userId?.name || brokerFormData.name;
            const email =
              brokerData.email ||
              brokerData.userId?.email ||
              brokerFormData.email;
            const phone =
              brokerData.phone ||
              brokerData.userId?.phone ||
              brokerFormData.phone;
            const firmName = brokerData.firmName || brokerFormData.firmName;

            // Extract additional fields from API response
            const address = brokerData.address || brokerFormData.address || "";
            const gender = brokerData.gender || brokerFormData.gender || "";
            const city = brokerData.city || brokerFormData.city || "";
            const licenseNumber =
              brokerData.licenseNumber || brokerFormData.licenseNumber || "";
            const officeAddress =
              brokerData.address ||
              brokerData.officeAddress ||
              brokerFormData.officeAddress ||
              "";

            const specializations =
              brokerData.specializations ||
              brokerFormData.specializations ||
              [];
            const state = brokerData.state || brokerFormData.state || "";

            // Extract social media fields
            const socialMedia = brokerData.socialMedia || {};
            const linkedin =
              socialMedia.linkedin || brokerFormData.linkedin || "";
            const twitter = socialMedia.twitter || brokerFormData.twitter || "";
            const instagram =
              socialMedia.instagram || brokerFormData.instagram || "";
            const facebook =
              socialMedia.facebook || brokerFormData.facebook || "";
            const whatsapp =
              brokerData.whatsappNumber || brokerFormData.whatsapp || "";
            const website = brokerData.website || brokerFormData.website || "";

            // Handle KYC documents from the actual API response structure
            const kycDocs = brokerData.kycDocs || {};
            const aadharFile = kycDocs.aadhar || null;
            const panFile = kycDocs.pan || null;
            const gstFile = kycDocs.gst || null;
            const brokerLicenseFile = kycDocs.brokerLicense || null;
            const companyIdFile = kycDocs.companyId || null;
            const brokerImage = brokerData.brokerImage || null;

            // Update broker form data with extracted values
            setBrokerFormData((prev) => ({
              ...prev,
              name: name,
              email: email,
              phone: phone,
              firmName: firmName,
              address: address,
              gender: gender,
              city: city,
              licenseNumber: licenseNumber,
              officeAddress: officeAddress,
              specializations: specializations,
              state: state,
              linkedin: linkedin,
              twitter: twitter,
              instagram: instagram,
              facebook: facebook,
              whatsapp: whatsapp,
              website: website,
              regions: regions,
              aadharFile: aadharFile,
              panFile: panFile,
              gstFile: gstFile,
              brokerLicenseFile: brokerLicenseFile,
              companyIdFile: companyIdFile,
              brokerImage: brokerImage,
            }));

            // Set office address for the Select component
            if (officeAddress) {
              const addressOption = {
                value: officeAddress,
                label: officeAddress,
              };

              // Add the address to options if it's not already there
              setOfficeAddressOptions((prev) => {
                const exists = prev.some(
                  (option) => option.value === officeAddress
                );
                if (!exists) {
                  return [...prev, addressOption];
                }
                return prev;
              });

              setSelectedOfficeAddress(addressOption);
            } else {
              setSelectedOfficeAddress(null);
            }

            // Set state and city for the Select components
            if (state) {
              const stateOption = statesList.find(
                (s) => s.value === state.toLowerCase().replace(/\s+/g, "-")
              );
              if (stateOption) {
                setSelectedState(stateOption);
                // Load cities for the selected state
                loadHardcodedCities(stateOption.value);
              }
            }

            if (city) {
              // Wait a bit for cities to load, then set the city
              setTimeout(() => {
                const cityOption = citiesList.find(
                  (c) => c.value === city.toLowerCase().replace(/\s+/g, "-")
                );
                if (cityOption) {
                  setSelectedCity(cityOption);
                  // Load regions for this city
                  loadRegions(cityOption.value);
                } else {
                  // If city not found in current list, create it
                  const newCityOption = {
                    value: city.toLowerCase().replace(/\s+/g, "-"),
                    label: city,
                  };
                  setSelectedCity(newCityOption);
                  // Load regions for this city
                  loadRegions(newCityOption.value);
                }
              }, 100);
            }
          }

          // Profile data loaded successfully
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ message: "Unknown error" }));

          if (response.status === 401) {
            toast.error("Authentication failed. Please login again.");
          } else if (response.status === 404) {
            toast.error(
              `${
                currentUserRole === "customer" ? "Customer" : "Broker"
              } profile not found.`
            );
          } else if (response.status >= 500) {
            toast.error("Server error. Please try again later.");
          } else {
            toast.error(
              errorData.message ||
                `Failed to load ${currentUserRole} profile data`
            );
          }
        }
      } catch (error) {
        if (error.name === "TypeError" && error.message.includes("fetch")) {
          toast.error(
            "Network error. Please check your connection and try again."
          );
        } else {
          toast.error(
            `Error loading ${currentUserRole} profile data: ${error.message}`
          );
        }
      } finally {
        setProfileLoading(false);
      }
    };

    if (userRole && user?.token) {
      loadProfileData();
    }
  }, [userRole, user]);

  // Load regions only when a city is selected (not on component mount)
  // Regions will be loaded when user selects a city in handleCityChange

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear email error when user changes email
    if (name === "email") {
      setEmailError("");
    }

    if (userRole === "customer") {
      setCustomerFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setBrokerFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (userRole === "customer") {
      setCustomerFormData((prev) => ({ ...prev, [name]: files[0] || null }));
    } else {
      setBrokerFormData((prev) => ({ ...prev, [name]: files[0] || null }));
    }
  };

  // Gate to enable documents after preferred region selection
  const [canUploadDocs, setCanUploadDocs] = useState(false);
  useEffect(() => {
    const hasRegion = Array.isArray(brokerFormData?.regions) && brokerFormData.regions.length > 0;
    if (hasRegion) setCanUploadDocs(true);
  }, [brokerFormData?.regions]);

  const handleRegionChange = (selectedOption) => {
    const selectedValue = selectedOption ? selectedOption.value : null;
    // Only update regions for brokers
    if (userRole === "broker") {
      setBrokerFormData((prev) => ({
        ...prev,
        regions: selectedValue ? [selectedValue] : [],
      }));
      // Enable document uploads when a preferred region is selected
      setCanUploadDocs(!!selectedValue);
    }
  };

  const handleStateChange = (selectedOption) => {
    setSelectedState(selectedOption);
    setSelectedCity(null);
    setBrokerFormData((prev) => ({
      ...prev,
      state: selectedOption?.value || "",
      city: "",
      regions: [],
    }));

    if (selectedOption) {
      // Load hardcoded cities based on selected state
      loadHardcodedCities(selectedOption.value);
    } else {
      setCitiesList([]);
    }
  };

  const loadHardcodedCities = (stateValue) => {
    let cities = [];

    if (stateValue === "uttar-pradesh") {
      cities = [
        { value: "noida", label: "Noida" },
        { value: "agra", label: "Agra" },
      ];
    }

    setCitiesList(cities);
  };

  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
    setBrokerFormData((prev) => ({
      ...prev,
      city: selectedOption?.value || "",
      regions: [],
    }));

    // Load regions based on selected city
    if (selectedOption) {
      loadRegions(selectedOption.value);
    } else {
      setRegionsList([]);
    }
  };

  // Removed loadCities function - using hardcoded cities instead

  const loadRegions = async (cityId = null) => {
    try {
      setRegionsLoading(true);
      setRegionsError("");

      // Build API URL with city filter if city is selected
      let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/regions`;
      if (cityId) {
        apiUrl += `?city=${cityId}`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Handle the API response structure: { success: true, message: "...", data: { regions: [...] } }
        let regions = [];
        if (data.success && data.data && Array.isArray(data.data.regions)) {
          regions = data.data.regions;
        } else if (Array.isArray(data)) {
          regions = data;
        } else if (data.data && Array.isArray(data.data)) {
          regions = data.data;
        } else if (data.regions && Array.isArray(data.regions)) {
          regions = data.regions;
        } else if (data._id && data.name) {
          // Handle single object response
          regions = [data];
        }
        setRegionsList(regions);
      } else {
        setRegionsError("Failed to load regions");
        setRegionsList([]);
      }
    } catch (error) {
      setRegionsError("Error loading regions");
      setRegionsList([]);
    } finally {
      setRegionsLoading(false);
    }
  };

  const handlePropertyTypeChange = (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setCustomerFormData((prev) => ({ ...prev, propertyType: selectedValues }));
  };

  const handleSpecializationChange = (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setBrokerFormData((prev) => ({ ...prev, specializations: selectedValues }));
  };

  // Check if email exists in database
  const checkEmailExists = async (email) => {
    try {
      const userId = user?.userId || user?._id || "";
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/auth/check-email?email=${encodeURIComponent(
          email
        )}&userId=${encodeURIComponent(userId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      // API response structure: { success: true, data: { exists: true/false, message: "..." } }
      if (data.success && data.data && data.data.exists === true) {
        return {
          exists: true,
          message: data.data.message || "Email is already in use",
        };
      }
      return { exists: false, message: "" };
    } catch (error) {
      return {
        exists: false,
        message: "Error checking email. Please try again.",
      };
    }
  };

  // Step navigation functions
  const nextStep = async () => {
    // If moving from step 1 (Personal Details) to step 2, check email
    if (currentStep === 1) {
      const currentFormData =
        userRole === "customer" ? customerFormData : brokerFormData;

      if (currentFormData.email) {
        setIsCheckingEmail(true);
        setEmailError("");

        try {
          const emailCheckResult = await checkEmailExists(
            currentFormData.email
          );

          if (emailCheckResult.exists) {
            setEmailError(emailCheckResult.message);
            setIsCheckingEmail(false);
            return; // Don't proceed to next step
          }
        } catch (error) {
          setEmailError("Error checking email. Please try again.");
          setIsCheckingEmail(false);
          return;
        }

        setIsCheckingEmail(false);
      }
    }

    if (currentStep < totalSteps) {
      // Ensure uploads are enabled when moving to Documents if a region is selected
      if (
        userRole === "broker" &&
        currentStep === 3 &&
        Array.isArray(brokerFormData?.regions) &&
        brokerFormData.regions.length > 0
      ) {
        setCanUploadDocs(true);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    // Allow moving back freely
    if (step <= currentStep) {
      setCurrentStep(step);
      return;
    }
    // Prevent moving forward if current step is invalid
    if (validateStep(currentStep)) {
      setCurrentStep(step);
    } else {
      toast.error("Please complete the required fields before continuing.");
    }
  };

  // Step validation
  const validateStep = (step) => {
    const currentFormData =
      userRole === "customer" ? customerFormData : brokerFormData;

    switch (step) {
      case 1: // Personal Details
        return (
          currentFormData.name &&
          currentFormData.email &&
          currentFormData.phone &&
          currentFormData.gender &&
          // Require firm name for brokers
          (userRole !== "broker" || Boolean(currentFormData.firmName)) &&
          !emailError
        );
      case 2: // Professional/Preferences
        if (userRole === "broker") {
          // Require license number and address for brokers
          return (
            Boolean(currentFormData.licenseNumber) &&
            Boolean(currentFormData.officeAddress)
          );
        } else {
          // For customers, validate budget if both fields are filled
          if (currentFormData.budgetMin && currentFormData.budgetMax) {
            const min = parseFloat(currentFormData.budgetMin);
            const max = parseFloat(currentFormData.budgetMax);
            return min <= max;
          }
          return true; // Customer preferences are optional
        }
      case 3: // Regions (only for brokers)
        if (userRole === "broker") {
          const hasSelectedRegion =
            Array.isArray(currentFormData.regions) &&
            currentFormData.regions.length > 0;
          // In nearest mode, only a region selection is required
          if (nearestMode) {
            return hasSelectedRegion;
          }
          // In manual mode, require state + city + region
          return (
            Boolean(currentFormData.state) &&
            Boolean(currentFormData.city) &&
            hasSelectedRegion
          );
        }
        return true; // Skip for customers
      case 4: // Documents (only for brokers) - OPTIONAL
        if (userRole === "broker") {
          return true; // Documents are now optional
        }
        return true;
      default:
        return true;
    }
  };

  // Get step title
  const getStepTitle = (step) => {
    switch (step) {
      case 1:
        return "Personal Info";
      case 2:
        return userRole === "customer" ? "Preferences" : "Professional";
      case 3:
        return userRole === "broker" ? "Regions" : "Documents";
      case 4:
        return "Documents";
      default:
        return "";
    }
  };

  // Function to manually refresh broker data
  const refreshBrokerData = async () => {
    if (userRole !== "broker") return;

    setProfileLoading(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const brokerId =
        tokenPayload.brokerId ||
        tokenPayload.brokerDetailId ||
        tokenPayload.brokerDetailsId ||
        tokenPayload.brokerDetails?.id ||
        tokenPayload.brokerDetails?._id ||
        tokenPayload.id;

      if (!brokerId) {
        toast.error("Broker ID not found in token");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brokers/${brokerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Process and bind the refreshed data
        let brokerData = data.data?.broker || data.data || data;

        const extractBrokerField = (fieldName, fallbackValue = "") => {
          const possiblePaths = [
            brokerData[fieldName],
            brokerData.user?.[fieldName],
            brokerData.brokerDetails?.[fieldName],
            brokerData.brokerDetail?.[fieldName],
            brokerData.personalInfo?.[fieldName],
            brokerData.businessInfo?.[fieldName],
          ];

          const value = possiblePaths.find(
            (val) => val !== undefined && val !== null && val !== ""
          );
          return value || fallbackValue;
        };

        // Extract regions based on actual API response structure
        let regions = [];
        if (brokerData.region && Array.isArray(brokerData.region)) {
          regions = brokerData.region;
        } else if (brokerData.regions && Array.isArray(brokerData.regions)) {
          regions = brokerData.regions;
        }

        // Extract other fields based on actual API response structure
        const name =
          brokerData.name || brokerData.userId?.name || brokerFormData.name;
        const email =
          brokerData.email || brokerData.userId?.email || brokerFormData.email;
        const phone =
          brokerData.phone || brokerData.userId?.phone || brokerFormData.phone;
        const firmName = brokerData.firmName || brokerFormData.firmName;

        // Extract additional fields from API response
        const address = brokerData.address || brokerFormData.address || "";
        const gender = brokerData.gender || brokerFormData.gender || "";
        const city = brokerData.city || brokerFormData.city || "";
        const licenseNumber =
          brokerData.licenseNumber || brokerFormData.licenseNumber || "";
        const officeAddress =
          brokerData.address ||
          brokerData.officeAddress ||
          brokerFormData.officeAddress ||
          "";
        const specializations =
          brokerData.specializations || brokerFormData.specializations || [];
        const state = brokerData.state || brokerFormData.state || "";

        // Extract social media fields
        const socialMedia = brokerData.socialMedia || {};
        const linkedin = socialMedia.linkedin || brokerFormData.linkedin || "";
        const twitter = socialMedia.twitter || brokerFormData.twitter || "";
        const instagram =
          socialMedia.instagram || brokerFormData.instagram || "";
        const facebook = socialMedia.facebook || brokerFormData.facebook || "";
        const whatsapp =
          brokerData.whatsappNumber || brokerFormData.whatsapp || "";
        const website = brokerData.website || brokerFormData.website || "";

        // Handle KYC documents from the actual API response structure
        const kycDocs = brokerData.kycDocs || {};
        const aadharFile = kycDocs.aadhar || null;
        const panFile = kycDocs.pan || null;
        const gstFile = kycDocs.gst || null;
        const brokerImage = brokerData.brokerImage || null;

        // Update form data
        setBrokerFormData((prev) => ({
          ...prev,
          name: name,
          email: email,
          phone: phone,
          firmName: firmName,
          address: address,
          gender: gender,
          city: city,
          licenseNumber: licenseNumber,
          officeAddress: officeAddress,
          specializations: specializations,
          state: state,
          linkedin: linkedin,
          twitter: twitter,
          instagram: instagram,
          facebook: facebook,
          whatsapp: whatsapp,
          website: website,
          regions: regions,
          aadharFile: aadharFile,
          panFile: panFile,
          gstFile: gstFile,
          brokerLicenseFile: brokerLicenseFile,
          companyIdFile: companyIdFile,
          brokerImage: brokerImage,
        }));

        // Set office address for the Select component
        if (officeAddress) {
          const addressOption = {
            value: officeAddress,
            label: officeAddress,
          };

          // Add the address to options if it's not already there
          setOfficeAddressOptions((prev) => {
            const exists = prev.some(
              (option) => option.value === officeAddress
            );
            if (!exists) {
              return [...prev, addressOption];
            }
            return prev;
          });

          setSelectedOfficeAddress(addressOption);
        } else {
          setSelectedOfficeAddress(null);
        }

        // Set state and city for the Select components
        if (state) {
          const stateOption = statesList.find(
            (s) => s.value === state.toLowerCase().replace(/\s+/g, "-")
          );
          if (stateOption) {
            setSelectedState(stateOption);
            // Load cities for the selected state
            loadHardcodedCities(stateOption.value);
          }
        }

        if (city) {
          // Wait a bit for cities to load, then set the city
          setTimeout(() => {
            const cityOption = citiesList.find(
              (c) => c.value === city.toLowerCase().replace(/\s+/g, "-")
            );
            if (cityOption) {
              setSelectedCity(cityOption);
            } else {
              // If city not found in current list, create it
              const newCityOption = {
                value: city.toLowerCase().replace(/\s+/g, "-"),
                label: city,
              };
              setSelectedCity(newCityOption);
            }
          }, 100);
        }

        toast.success("Broker data refreshed successfully!");
      } else {
        toast.error("Failed to refresh broker data");
      }
    } catch (error) {
      toast.error("Error refreshing broker data");
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      {/* Load Google Places CSS */}
      <link rel="stylesheet" href="/google-places.css" />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <div className="min-h-screen bg-white py-16">
        <div className="w-full">
          {/* Header Section */}
          <div className="text-left mb-12">
            <h1 className="text-4xl font-display text-gray-900 mb-4">
              {userRole === "customer"
                ? "Create Customer Profile"
                : "Create Broker Profile"}
            </h1>
            <p className="text-sm font-body text-gray-600 text-left">
              Complete your profile to get started with{" "}
              {userRole === "customer"
                ? "finding your dream property"
                : "connecting with potential clients"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-left ">
              <div className="flex items-center p-1 ">
                {Array.from({ length: totalSteps }, (_, index) => {
                  const step = index + 1;
                  const isActive = step === currentStep;
                  const isCompleted = step < currentStep;

                  return (
                    <div key={step} className="flex items-center">
                      {/* Step Circle and Label */}
                      <div
                        className="flex flex-col items-center px-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => goToStep(step)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isActive
                              ? "bg-blue-600 text-white scale-110"
                              : isCompleted
                              ? "bg-green-900 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {isCompleted ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            step
                          )}
                        </div>
                        <span
                          className={`text-xs mt-1 text-center font-label ${
                            isActive
                              ? "text-blue-600"
                              : isCompleted
                              ? "text-green-900"
                              : "text-gray-500"
                          }`}
                        >
                          {getStepTitle(step)}
                        </span>
                      </div>

                      {/* Connecting Line */}
                      {step < totalSteps && (
                        <div
                          className={`w-12 h-0.5 mx-1 rounded-full ${
                            isCompleted
                              ? "bg-green-900"
                              : isActive
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Layout: 9 / 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
          {/* Form Card */}
          <div className="lg:col-span-9 bg-white rounded-2xl shadow-2xl border-0 overflow-hidden">
            {/* Step Content */}
            {profileLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
                  <p className="text-lg text-gray-600 font-medium">
                    Loading profile data...
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-10">
                {/* Step 1: Personal Details */}
                {currentStep === 1 && (
                  <div className="max-w-3xl mx-auto">
                    {/* Profile Image Section - Top */}
                    <div className="flex justify-left mb-8">
                      <div className="relative inline-block">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                          {(
                            userRole === "customer"
                              ? customerFormData.customerImage
                              : brokerFormData.brokerImage
                          ) ? (
                            <img
                              src={
                                typeof (userRole === "customer"
                                  ? customerFormData.customerImage
                                  : brokerFormData.brokerImage) === "string"
                                  ? userRole === "customer"
                                    ? customerFormData.customerImage
                                    : brokerFormData.brokerImage
                                  : URL.createObjectURL(
                                      userRole === "customer"
                                        ? customerFormData.customerImage
                                        : brokerFormData.brokerImage
                                    )
                              }
                              alt={`${userRole} Profile`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/images/user-1.webp";
                              }}
                            />
                          ) : (
                            <svg
                              className="w-8 h-8 text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          )}
                        </div>
                        <input
                          type="file"
                          name={
                            userRole === "customer"
                              ? "customerImage"
                              : "brokerImage"
                          }
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png"
                          className="hidden"
                          id="profile-image-upload"
                        />
                        <button
                          type="button"
                          className="absolute -bottom-1 -right-1 bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          onClick={() =>
                            document
                              .getElementById("profile-image-upload")
                              .click()
                          }
                        >
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-label text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={
                              userRole === "customer"
                                ? customerFormData.name
                                : brokerFormData.name
                            }
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm font-body"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-label text-gray-700 mb-2">
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={
                              userRole === "customer"
                                ? customerFormData.email
                                : brokerFormData.email
                            }
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm font-body ${
                              emailError
                                ? "border-red-300 focus:ring-red-100 focus:border-red-500"
                                : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                            }`}
                          />
                          {emailError && (
                            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {emailError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-label text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={
                              userRole === "customer"
                                ? customerFormData.phone
                                : brokerFormData.phone
                            }
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            disabled
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed text-sm font-body"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-label text-gray-700 mb-2">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <Select
                            name="gender"
                            options={[
                              { value: "", label: "Select gender" },
                              { value: "male", label: "Male" },
                              { value: "female", label: "Female" },
                              { value: "other", label: "Other" },
                            ]}
                            value={(() => {
                              const v =
                                userRole === "customer"
                                  ? customerFormData.gender
                                  : brokerFormData.gender;
                              const opts = [
                                { value: "", label: "Select gender" },
                                { value: "male", label: "Male" },
                                { value: "female", label: "Female" },
                                { value: "other", label: "Other" },
                              ];
                              return (
                                opts.find((o) => o.value === (v || "")) ||
                                opts[0]
                              );
                            })()}
                            onChange={(opt) => {
                              const value = opt?.value || "";
                              if (userRole === "customer") {
                                setCustomerFormData((prev) => ({
                                  ...prev,
                                  gender: value,
                                }));
                              } else {
                                setBrokerFormData((prev) => ({
                                  ...prev,
                                  gender: value,
                                }));
                              }
                            }}
                            classNamePrefix="react-select"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                border: "1px solid #d1d5db",
                                borderRadius: "0.5rem",
                                minHeight: "48px",
                                fontSize: "14px",
                              }),
                            }}
                          />
                        </div>

                        {userRole === "broker" && (
                          <div>
                            <label className="block text-xs font-label text-gray-700 mb-2">
                              Firm Name
                            </label>
                            <input
                              type="text"
                              name="firmName"
                              value={brokerFormData.firmName}
                              onChange={handleChange}
                              placeholder="Enter your firm name"
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm font-body"
                            />
                          </div>
                        )}

                        {userRole === "broker" && (
                          <div>
                            <label className="block text-xs font-label text-gray-700 mb-2 flex items-center">
                              <svg
                                className="w-4 h-4 text-green-600 mr-2"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                              </svg>
                              WhatsApp Number
                            </label>
                            <input
                              type="tel"
                              name="whatsapp"
                              value={brokerFormData.whatsapp}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                                if (value.length <= 10) {
                                  setBrokerFormData((prev) => ({
                                    ...prev,
                                    whatsapp: value,
                                  }));
                                }
                              }}
                              placeholder="Enter your WhatsApp number"
                              maxLength="10"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-body"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Professional Information / Preferences */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    {userRole === "broker" ? (
                      <>
                        {/* Professional Information Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <svg
                              className="w-5 h-5 text-blue-600 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                              />
                            </svg>
                            Professional Information
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                License Number{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <svg
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                </div>
                                <input
                                  type="text"
                                  name="licenseNumber"
                                  value={brokerFormData.licenseNumber}
                                  onChange={handleChange}
                                  placeholder="e.g., BRE #01234567"
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Address{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={handleUseCurrentLocation}
                                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  Use Current Location
                                </button>
                              </div>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                  <svg
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                </div>
                                <Select
                                  value={selectedOfficeAddress}
                                  onChange={handleOfficeAddressChange}
                                  onInputChange={handleOfficeAddressInputChange}
                                  options={officeAddressOptions}
                                  placeholder={
                                    googleLoaded
                                      ? "Search for your address..."
                                      : "Loading address search..."
                                  }
                                  isClearable
                                  isSearchable
                                  isLoading={isLoadingAddresses}
                                  noOptionsMessage={() => "No addresses found"}
                                  loadingMessage={() =>
                                    "Searching addresses..."
                                  }
                                  classNamePrefix="react-select"
                                  styles={{
                                    control: (provided, state) => ({
                                      ...provided,
                                      minHeight: "48px",
                                      paddingLeft: "40px",
                                      border: state.isFocused
                                        ? "2px solid #3b82f6"
                                        : "1px solid #d1d5db",
                                      boxShadow: state.isFocused
                                        ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                        : "none",
                                      "&:hover": {
                                        border: "1px solid #9ca3af",
                                      },
                                    }),
                                    placeholder: (provided) => ({
                                      ...provided,
                                      color: "#9ca3af",
                                      fontSize: "0.875rem",
                                    }),
                                    input: (provided) => ({
                                      ...provided,
                                      color: "#374151",
                                      fontSize: "0.875rem",
                                    }),
                                    singleValue: (provided) => ({
                                      ...provided,
                                      color: "#374151",
                                      fontSize: "0.875rem",
                                    }),
                                    option: (provided, state) => ({
                                      ...provided,
                                      backgroundColor: state.isFocused
                                        ? "#f3f4f6"
                                        : "white",
                                      color: state.isSelected
                                        ? "white"
                                        : "#374151",
                                      fontSize: "0.875rem",
                                      padding: "0.75rem 1rem",
                                    }),
                                    menu: (provided) => ({
                                      ...provided,
                                      zIndex: 9999,
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "0.5rem",
                                      boxShadow:
                                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                                    }),
                                  }}
                                />
                                {!googleLoaded && (
                                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Specializations Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <svg
                              className="w-5 h-5 text-blue-600 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            Specializations
                          </h3>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Select your specializations
                            </label>
                            <Select
                              isMulti
                              name="specializations"
                              options={specializationOptions.map((spec) => ({
                                value: spec,
                                label: spec,
                              }))}
                              value={
                                Array.isArray(brokerFormData.specializations)
                                  ? brokerFormData.specializations.map(
                                      (spec) => ({
                                        value: spec,
                                        label: spec,
                                      })
                                    )
                                  : []
                              }
                              onChange={handleSpecializationChange}
                              placeholder="Select specializations..."
                              className="react-select-container"
                              classNamePrefix="react-select"
                              styles={{
                                control: (provided, state) => ({
                                  ...provided,
                                  minHeight: "48px",
                                  border: state.isFocused
                                    ? "2px solid #3b82f6"
                                    : "1px solid #d1d5db",
                                  boxShadow: state.isFocused
                                    ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                    : "none",
                                  "&:hover": {
                                    border: "1px solid #3b82f6",
                                  },
                                }),
                                multiValue: (provided) => ({
                                  ...provided,
                                  backgroundColor: "#dbeafe",
                                  color: "#1e40af",
                                }),
                                multiValueLabel: (provided) => ({
                                  ...provided,
                                  color: "#1e40af",
                                }),
                                multiValueRemove: (provided) => ({
                                  ...provided,
                                  color: "#1e40af",
                                  "&:hover": {
                                    backgroundColor: "#bfdbfe",
                                    color: "#1e3a8a",
                                  },
                                }),
                              }}
                            />
                          </div>
                        </div>

                        {/* Social Media Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <svg
                              className="w-5 h-5 text-blue-600 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2M9 4h6"
                              />
                            </svg>
                            Social Media & Online Presence
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 text-blue-600 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                              </label>
                              <input
                                type="url"
                                name="linkedin"
                                value={brokerFormData.linkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/yourprofile"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 text-blue-400 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                                Twitter
                              </label>
                              <input
                                type="url"
                                name="twitter"
                                value={brokerFormData.twitter}
                                onChange={handleChange}
                                placeholder="https://twitter.com/yourprofile"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 text-pink-500 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                                </svg>
                                Instagram
                              </label>
                              <input
                                type="url"
                                name="instagram"
                                value={brokerFormData.instagram}
                                onChange={handleChange}
                                placeholder="https://instagram.com/yourprofile"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 text-blue-600 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                              </label>
                              <input
                                type="url"
                                name="facebook"
                                value={brokerFormData.facebook}
                                onChange={handleChange}
                                placeholder="https://facebook.com/yourprofile"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 text-blue-600 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                                  />
                                </svg>
                                Website
                              </label>
                              <input
                                type="url"
                                name="website"
                                value={brokerFormData.website}
                                onChange={handleChange}
                                placeholder="https://yourwebsite.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Customer Preferences */
                      <>
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <svg
                              className="w-5 h-5 text-blue-600 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            Property Preferences
                          </h3>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Property Type Preferences
                              </label>
                              <Select
                                isMulti
                                name="propertyType"
                                options={propertyTypeOptions.map((type) => ({
                                  value: type,
                                  label:
                                    type.charAt(0).toUpperCase() +
                                    type.slice(1),
                                }))}
                                value={
                                  Array.isArray(customerFormData.propertyType)
                                    ? customerFormData.propertyType.map(
                                        (type) => ({
                                          value: type,
                                          label:
                                            type.charAt(0).toUpperCase() +
                                            type.slice(1),
                                        })
                                      )
                                    : []
                                }
                                onChange={handlePropertyTypeChange}
                                placeholder="Select property types..."
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    minHeight: "48px",
                                    border: state.isFocused
                                      ? "2px solid #3b82f6"
                                      : "1px solid #d1d5db",
                                    boxShadow: state.isFocused
                                      ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                                      : "none",
                                    "&:hover": {
                                      border: "1px solid #3b82f6",
                                    },
                                  }),
                                  multiValue: (provided) => ({
                                    ...provided,
                                    backgroundColor: "#dbeafe",
                                    color: "#1e40af",
                                  }),
                                  multiValueLabel: (provided) => ({
                                    ...provided,
                                    color: "#1e40af",
                                  }),
                                  multiValueRemove: (provided) => ({
                                    ...provided,
                                    color: "#1e40af",
                                    "&:hover": {
                                      backgroundColor: "#bfdbfe",
                                      color: "#1e3a8a",
                                    },
                                  }),
                                }}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Budget Min (₹)
                                </label>
                                <input
                                  type="number"
                                  name="budgetMin"
                                  value={customerFormData.budgetMin}
                                  onChange={handleChange}
                                  placeholder="Enter minimum budget"
                                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                                    budgetError
                                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Budget Max (₹)
                                </label>
                                <input
                                  type="number"
                                  name="budgetMax"
                                  value={customerFormData.budgetMax}
                                  onChange={handleChange}
                                  placeholder="Enter maximum budget"
                                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                                    budgetError
                                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                  }`}
                                />
                              </div>
                            </div>

                            {/* Budget Error Message */}
                            {budgetError && (
                              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                  <svg
                                    className="w-5 h-5 text-red-500 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="text-red-700 text-sm font-medium">
                                    {budgetError}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 3: Regions (Only for Brokers) */}
                {currentStep === 3 && userRole === "broker" && (
                  <div className="space-y-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Preferred Regions{" "}
                          <span className="text-red-500">*</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setNearestMode((v) => !v)}
                          className="inline-flex items-center px-3 py-1.5 text-xs rounded border border-gray-200 bg-white hover:bg-gray-50"
                        >
                          {nearestMode ? "Choose manually" : "Use nearest"}
                        </button>
                      </div>

                      {!nearestMode && (
                        <div className="mb-6">
                          <p className="text-sm text-gray-600">
                            {userRole === "broker"
                              ? "Select the regions where you provide real estate services"
                              : "Select the regions where you are looking for properties"}
                          </p>
                        </div>
                      )}

                      {/* State and City Selection - Above (hidden in nearest mode) */}
                      {!nearestMode && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                          {/* State Selection */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State <span className="text-red-500">*</span>
                            </label>
                            <Select
                              name="state"
                              options={statesList}
                              value={selectedState}
                              onChange={handleStateChange}
                              placeholder="Select state..."
                              className="react-select-container"
                              classNamePrefix="react-select"
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  border: "1px solid #d1d5db",
                                  borderRadius: "0.5rem",
                                  minHeight: "48px",
                                  fontSize: "14px",
                                }),
                              }}
                            />
                          </div>

                          {/* City Selection */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City <span className="text-red-500">*</span>
                            </label>
                            <Select
                              name="city"
                              options={citiesList}
                              value={selectedCity}
                              onChange={handleCityChange}
                              placeholder="Select city..."
                              className="react-select-container"
                              classNamePrefix="react-select"
                              styles={{
                                control: (provided) => ({
                                  ...provided,
                                  border: "1px solid #d1d5db",
                                  borderRadius: "0.5rem",
                                  minHeight: "48px",
                                  fontSize: "14px",
                                }),
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Toggle moved to header above */}

                      {/* Region Selection - Below */}
                      <div className="mb-4">
                        {!nearestMode && (
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Regions <span className="text-red-500">*</span>
                          </label>
                        )}
                        {regionsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">
                              Loading regions...
                            </span>
                          </div>
                        ) : regionsError ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-600">
                              {regionsError}
                            </p>
                          </div>
                        ) : nearestMode ? (
                          <div>
                            <div className="mb-2 text-[13px] text-slate-600 flex items-center gap-2">
                              Showing nearest regions based on your location.
                              Choose one.
                            </div>

                            {nearestRegionsError && (
                              <div className="text-[13px] text-rose-600 mb-2">
                                {nearestRegionsError}
                              </div>
                            )}

                            {nearestRegionsLoading ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div
                                    key={i}
                                    className="relative p-4 rounded-xl border border-gray-200 bg-white animate-pulse"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                                {(Array.isArray(nearestRegions)
                                  ? nearestRegions.slice(0, 5)
                                  : []
                                ).map((r) => {
                                  const id = r._id || r.id;
                                  const label = r.name || r.region;
                                  const place =
                                    r.centerLocation ||
                                    [r.city, r.state]
                                      .filter(Boolean)
                                      .join(", ");
                                  const dist =
                                    typeof r.distanceKm === "number"
                                      ? r.distanceKm
                                      : null;
                                  const distanceText =
                                    dist !== null
                                      ? `${
                                          dist >= 10
                                            ? Math.round(dist)
                                            : Math.round(dist * 10) / 10
                                        } km away`
                                      : "";
                                  const brokersText =
                                    typeof r.brokerCount === "number"
                                      ? `${r.brokerCount} Broker${
                                          r.brokerCount === 1 ? "" : "s"
                                        }`
                                      : "";
                                  const isSelected =
                                    Array.isArray(brokerFormData.regions) &&
                                    brokerFormData.regions.some((region) => {
                                      if (
                                        typeof region === "object" &&
                                        region._id
                                      ) {
                                        return region._id === id;
                                      } else if (typeof region === "string") {
                                        return region === id;
                                      }
                                      return false;
                                    });
                                  return (
                                    <button
                                      key={id || label}
                                      type="button"
                                      onClick={() => {
                                        setBrokerFormData((prev) => ({
                                          ...prev,
                                          regions: isSelected ? [] : [id],
                                          state: isSelected ? "" : (r.state || prev.state || ""),
                                          city: isSelected ? "" : (r.city || prev.city || ""),
                                        }));
                                        setCanUploadDocs(!isSelected);
                                      }}
                                      className={`relative text-left p-4 rounded-xl border transition-all ${
                                        isSelected
                                          ? "border-sky-500 ring-2 ring-sky-100 shadow"
                                          : "border-gray-200 hover:border-sky-400 hover:shadow-sm"
                                      } bg-white`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <div className="text-[14px] font-semibold text-slate-900">
                                            {label}
                                          </div>
                                          {place ? (
                                            <div className="text-[12px] text-slate-500">
                                              {place}
                                            </div>
                                          ) : null}
                                          {(distanceText || brokersText) && (
                                            <div className="text-[12px] text-slate-600 mt-1">
                                              {[distanceText, brokersText]
                                                .filter(Boolean)
                                                .join(" / ")}
                                            </div>
                                          )}
                                          {/* nearest badge removed per request */}
                                        </div>
                                        {isSelected && (
                                          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center">
                                            ✓
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Select
                            name="regions"
                            options={(() => {
                              const options = Array.isArray(regionsList)
                                ? regionsList.map((region) => ({
                                    value: region._id,
                                    label: region.name,
                                  }))
                                : [];
                              return options;
                            })()}
                            value={
                              Array.isArray(brokerFormData.regions) &&
                              brokerFormData.regions.length > 0 &&
                              Array.isArray(regionsList)
                                ? (() => {
                                    const region = brokerFormData.regions[0];
                                    if (
                                      typeof region === "object" &&
                                      region._id
                                    ) {
                                      return {
                                        value: region._id,
                                        label: region.name,
                                      };
                                    } else if (typeof region === "string") {
                                      const regionObj = regionsList.find(
                                        (r) => r._id === region
                                      );
                                      return regionObj
                                        ? {
                                            value: regionObj._id,
                                            label: regionObj.name,
                                          }
                                        : null;
                                    }
                                    return null;
                                  })()
                                : null
                            }
                            onChange={handleRegionChange}
                            placeholder="Select a region..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                border: "1px solid #d1d5db",
                                borderRadius: "0.5rem",
                                minHeight: "48px",
                                fontSize: "14px",
                              }),
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Documents (Only for Customers) */}
                {currentStep === 3 && userRole === "customer" && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-6">
                      <svg
                        className="w-6 h-6 text-gray-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Documents
                      </h3>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <p className="text-gray-600 text-center py-8">
                        No documents required for customer accounts.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 4: Documents (Only for Brokers) - OPTIONAL */}
                {currentStep === 4 && userRole === "broker" && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-6">
                      <svg
                        className="w-6 h-6 text-gray-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Documents{" "}
                        <span className="text-sm font-normal text-gray-500">
                          (Optional)
                        </span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Aadhar File Upload */}
                      <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Aadhar Card
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex-1 flex flex-col justify-center ${canUploadDocs ? "border-gray-300 hover:border-blue-400" : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"}`}>
                          <input
                            type="file"
                            name="aadharFile"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            id="aadhar-upload"
                            disabled={!canUploadDocs}
                          />
                          <label
                            htmlFor="aadhar-upload"
                            className={`cursor-pointer ${!canUploadDocs ? "pointer-events-none" : ""}`}
                          >
                            <svg
                              className="mx-auto h-8 w-8 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                {brokerFormData.aadharFile
                                  ? typeof brokerFormData.aadharFile ===
                                    "string"
                                    ? "Aadhar Card uploaded"
                                    : brokerFormData.aadharFile.name
                                  : "Click to upload Aadhar Card"}
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, JPG, PNG up to 10MB
                              </p>
                              {brokerFormData.aadharFile &&
                                typeof brokerFormData.aadharFile ===
                                  "string" && (
                                  <a
                                    href={brokerFormData.aadharFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    View uploaded file
                                  </a>
                                )}
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* PAN File Upload */}
                      <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          PAN Card
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex-1 flex flex-col justify-center ${canUploadDocs ? "border-gray-300 hover:border-blue-400" : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"}`}>
                          <input
                            type="file"
                            name="panFile"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            id="pan-upload"
                            disabled={!canUploadDocs}
                          />
                          <label
                            htmlFor="pan-upload"
                            className={`cursor-pointer ${!canUploadDocs ? "pointer-events-none" : ""}`}
                          >
                            <svg
                              className="mx-auto h-8 w-8 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                {brokerFormData.panFile
                                  ? typeof brokerFormData.panFile === "string"
                                    ? "PAN Card uploaded"
                                    : brokerFormData.panFile.name
                                  : "Click to upload PAN Card"}
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, JPG, PNG up to 10MB
                              </p>
                              {brokerFormData.panFile &&
                                typeof brokerFormData.panFile === "string" && (
                                  <a
                                    href={brokerFormData.panFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    View uploaded file
                                  </a>
                                )}
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* GST File Upload */}
                      <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          GST Certificate
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex-1 flex flex-col justify-center ${canUploadDocs ? "border-gray-300 hover:border-blue-400" : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"}`}>
                          <input
                            type="file"
                            name="gstFile"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            id="gst-upload"
                            disabled={!canUploadDocs}
                          />
                          <label
                            htmlFor="gst-upload"
                            className={`cursor-pointer ${!canUploadDocs ? "pointer-events-none" : ""}`}
                          >
                            <svg
                              className="mx-auto h-8 w-8 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                {brokerFormData.gstFile
                                  ? typeof brokerFormData.gstFile === "string"
                                    ? "GST Certificate uploaded"
                                    : brokerFormData.gstFile.name
                                  : "Click to upload GST Certificate"}
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, JPG, PNG up to 10MB
                              </p>
                              {brokerFormData.gstFile &&
                                typeof brokerFormData.gstFile === "string" && (
                                  <a
                                    href={brokerFormData.gstFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    View uploaded file
                                  </a>
                                )}
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Broker License File Upload */}
                      <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Broker License
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex-1 flex flex-col justify-center ${canUploadDocs ? "border-gray-300 hover:border-blue-400" : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"}`}>
                          <input
                            type="file"
                            name="brokerLicenseFile"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            id="broker-license-upload"
                            disabled={!canUploadDocs}
                          />
                          <label
                            htmlFor="broker-license-upload"
                            className={`cursor-pointer ${!canUploadDocs ? "pointer-events-none" : ""}`}
                          >
                            <svg
                              className="mx-auto h-8 w-8 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                {brokerFormData.brokerLicenseFile
                                  ? typeof brokerFormData.brokerLicenseFile ===
                                    "string"
                                    ? "Broker License uploaded"
                                    : brokerFormData.brokerLicenseFile.name
                                  : "Click to upload Broker License"}
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, JPG, PNG up to 10MB
                              </p>
                              {brokerFormData.brokerLicenseFile &&
                                typeof brokerFormData.brokerLicenseFile ===
                                  "string" && (
                                  <a
                                    href={brokerFormData.brokerLicenseFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    View uploaded file
                                  </a>
                                )}
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Company Identification Details File Upload */}
                      <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Company Identification Details
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors flex-1 flex flex-col justify-center">
                          <input
                            type="file"
                            name="companyIdFile"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            id="company-id-upload"
                          />
                          <label
                            htmlFor="company-id-upload"
                            className="cursor-pointer"
                          >
                            <svg
                              className="mx-auto h-8 w-8 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                {brokerFormData.companyIdFile
                                  ? typeof brokerFormData.companyIdFile ===
                                    "string"
                                    ? "Company ID uploaded"
                                    : brokerFormData.companyIdFile.name
                                  : "Click to upload Company ID"}
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, JPG, PNG up to 10MB
                              </p>
                              {brokerFormData.companyIdFile &&
                                typeof brokerFormData.companyIdFile ===
                                  "string" && (
                                  <a
                                    href={brokerFormData.companyIdFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    View uploaded file
                                  </a>
                                )}
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Button */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="max-w-3xl mx-auto">
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={isCheckingEmail || !validateStep(currentStep)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-heading text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {isCheckingEmail ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Checking email...
                          </>
                        ) : (
                          <>
                            Continue to {getStepTitle(currentStep + 1)}
                            <svg
                              className="w-5 h-5 ml-2 inline"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          setSubmitting(true);

                          const currentFormData =
                            userRole === "customer"
                              ? customerFormData
                              : brokerFormData;

                          // Only validate regions for brokers
                          if (
                            userRole === "broker" &&
                            (!Array.isArray(currentFormData.regions) ||
                              currentFormData.regions.length === 0)
                          ) {
                            toast.error("Please select at least one region.");
                            setSubmitting(false);
                            return;
                          }

                          try {
                            if (!user?.token) {
                              toast.error(
                                "No authentication token found. Please login again."
                              );
                              setSubmitting(false);
                              return;
                            }

                            // Create FormData for multipart/form-data submission
                            const formDataToSend = new FormData();
                            formDataToSend.append(
                              "phone",
                              currentFormData.phone
                            );
                            formDataToSend.append("name", currentFormData.name);
                            formDataToSend.append(
                              "email",
                              currentFormData.email
                            );

                            if (userRole === "customer") {
                              // Customer-specific fields - matching the API structure
                              formDataToSend.append(
                                "customerDetails[preferences][budgetMin]",
                                currentFormData.budgetMin
                                  ? Number(currentFormData.budgetMin)
                                  : ""
                              );
                              formDataToSend.append(
                                "customerDetails[preferences][budgetMax]",
                                currentFormData.budgetMax
                                  ? Number(currentFormData.budgetMax)
                                  : ""
                              );

                              // Add property types
                              currentFormData.propertyType.forEach(
                                (type, index) => {
                                  formDataToSend.append(
                                    `customerDetails[preferences][propertyType][${index}]`,
                                    type
                                  );
                                }
                              );

                              // Add customer gender
                              formDataToSend.append(
                                "customerDetails[gender]",
                                currentFormData.gender || ""
                              );

                              formDataToSend.append(
                                "customerDetails[inquiryCount]",
                                currentFormData.inquiryCount || 0
                              );

                              // Add customer image
                              if (currentFormData.customerImage) {
                                // Check if it's a File object or a string URL
                                if (
                                  currentFormData.customerImage instanceof File
                                ) {
                                  formDataToSend.append(
                                    "customerImage",
                                    currentFormData.customerImage
                                  );
                                } else if (
                                  typeof currentFormData.customerImage ===
                                  "string"
                                ) {
                                  // If it's a URL string, we might need to fetch it as a file
                                  // For now, we'll skip URL strings as they're already uploaded
                                }
                              }
                            } else {
                              // Broker-specific fields
                              formDataToSend.append(
                                "brokerDetails[firmName]",
                                currentFormData.firmName || ""
                              );
                              formDataToSend.append(
                                "brokerDetails[licenseNumber]",
                                currentFormData.licenseNumber || ""
                              );
                              formDataToSend.append(
                                "brokerDetails[address]",
                                currentFormData.officeAddress ||
                                  currentFormData.address ||
                                  ""
                              );
                              formDataToSend.append(
                                "brokerDetails[state]",
                                currentFormData.state || (Array.isArray(currentFormData.regions) && currentFormData.regions[0]?.state) || ""
                              );
                              formDataToSend.append(
                                "brokerDetails[city]",
                                currentFormData.city || (Array.isArray(currentFormData.regions) && currentFormData.regions[0]?.city) || ""
                              );
                              formDataToSend.append(
                                "brokerDetails[gender]",
                                currentFormData.gender || ""
                              );

                              // Add specializations
                              if (
                                currentFormData.specializations &&
                                currentFormData.specializations.length > 0
                              ) {
                                currentFormData.specializations.forEach(
                                  (spec, index) => {
                                    formDataToSend.append(
                                      `brokerDetails[specializations][${index}]`,
                                      spec
                                    );
                                  }
                                );
                              }

                              // Add social media
                              if (currentFormData.linkedin) {
                                formDataToSend.append(
                                  "brokerDetails[socialMedia][linkedin]",
                                  currentFormData.linkedin
                                );
                              }
                              if (currentFormData.twitter) {
                                formDataToSend.append(
                                  "brokerDetails[socialMedia][twitter]",
                                  currentFormData.twitter
                                );
                              }
                              if (currentFormData.instagram) {
                                formDataToSend.append(
                                  "brokerDetails[socialMedia][instagram]",
                                  currentFormData.instagram
                                );
                              }
                              if (currentFormData.facebook) {
                                formDataToSend.append(
                                  "brokerDetails[socialMedia][facebook]",
                                  currentFormData.facebook
                                );
                              }
                              if (currentFormData.whatsapp) {
                                formDataToSend.append(
                                  "brokerDetails[whatsappNumber]",
                                  currentFormData.whatsapp
                                );
                              }
                              if (currentFormData.website) {
                                formDataToSend.append(
                                  "brokerDetails[website]",
                                  currentFormData.website
                                );
                              }

                              // Add regions
                              currentFormData.regions.forEach(
                                (region, index) => {
                                  const regionId =
                                    typeof region === "object"
                                      ? region._id
                                      : region;
                                  formDataToSend.append(
                                    `brokerDetails[region][${index}]`,
                                    regionId
                                  );
                                }
                              );

                              // Add file uploads - only append if they are File objects
                              if (
                                currentFormData.aadharFile &&
                                currentFormData.aadharFile instanceof File
                              ) {
                                formDataToSend.append(
                                  "aadhar",
                                  currentFormData.aadharFile
                                );
                              }
                              if (
                                currentFormData.panFile &&
                                currentFormData.panFile instanceof File
                              ) {
                                formDataToSend.append(
                                  "pan",
                                  currentFormData.panFile
                                );
                              }
                              if (
                                currentFormData.gstFile &&
                                currentFormData.gstFile instanceof File
                              ) {
                                formDataToSend.append(
                                  "gst",
                                  currentFormData.gstFile
                                );
                              }
                              if (
                                currentFormData.brokerLicenseFile &&
                                currentFormData.brokerLicenseFile instanceof
                                  File
                              ) {
                                formDataToSend.append(
                                  "brokerLicense",
                                  currentFormData.brokerLicenseFile
                                );
                              }
                              if (
                                currentFormData.companyIdFile &&
                                currentFormData.companyIdFile instanceof File
                              ) {
                                formDataToSend.append(
                                  "companyId",
                                  currentFormData.companyIdFile
                                );
                              }
                              if (
                                currentFormData.brokerImage &&
                                currentFormData.brokerImage instanceof File
                              ) {
                                formDataToSend.append(
                                  "brokerImage",
                                  currentFormData.brokerImage
                                );
                              }
                            }

                            const res = await fetch(
                              `${process.env.NEXT_PUBLIC_API_URL}/auth/complete-profile`,
                              {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${user.token}`,
                                },
                                body: formDataToSend,
                              }
                            );

                            if (!res.ok) {
                              let errorMessage = "Failed to update profile";

                              try {
                                const errorData = await res.json();

                                // Handle specific error types
                                if (
                                  errorData.error &&
                                  errorData.error.includes("E11000")
                                ) {
                                  // Duplicate key error (email already exists)
                                  errorMessage =
                                    "This email address is already registered. Please use a different email.";
                                } else if (
                                  errorData.error &&
                                  errorData.error.includes("validation")
                                ) {
                                  // Validation error
                                  errorMessage =
                                    "Please check your information and try again.";
                                } else if (res.status === 400) {
                                  errorMessage =
                                    "Invalid information provided. Please check your details.";
                                } else if (res.status === 401) {
                                  errorMessage =
                                    "Session expired. Please login again.";
                                } else if (res.status === 403) {
                                  errorMessage =
                                    "You do not have permission to perform this action.";
                                } else if (res.status === 409) {
                                  errorMessage =
                                    "This information is already in use. Please use different details.";
                                } else if (res.status >= 500) {
                                  errorMessage =
                                    "Server error. Please try again later.";
                                } else {
                                  errorMessage =
                                    errorData.message ||
                                    "Failed to update profile. Please try again.";
                                }
                              } catch (parseError) {
                                errorMessage = `Request failed with status ${res.status}. Please try again.`;
                              }

                              throw new Error(errorMessage);
                            }

                            const result = await res.json();
                            toast.success(
                              "Profile updated successfully! Redirecting to dashboard...",
                              {
                                style: { fontWeight: "700" },
                              }
                            );

                            // Redirect to dashboard after successful profile update
                            setTimeout(() => {
                              router.push("/dashboard");
                            }, 1500);
                          } catch (err) {
                            toast.error(
                              err?.message ||
                                "Failed to update profile. Please try again."
                            );
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        disabled={submitting || !validateStep(currentStep)}
                        className="w-full py-4 bg-gradient-to-r from-green-800 to-green-900 text-white rounded-xl font-heading text-lg hover:from-green-700 hover:to-green-900 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline"></div>
                            Saving Profile...
                          </>
                        ) : (
                          <>
                            Complete Profile
                            <svg
                              className="w-5 h-5 ml-2 inline"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Sidebar: Resources / Help */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Need help?</h3>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-2">
                <li>Complete required fields marked with *</li>
                <li>Use "Use nearest" to auto-pick regions</li>
                <li>Documents enable after choosing a region</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Resources</h3>
              <div className="space-y-2 text-sm">
                <a className="text-blue-700 hover:underline" href="#">Profile guidelines</a>
                <div className="text-gray-600">KYC: PDF/JPG/PNG up to 10MB</div>
              </div>
            </div>
          </aside>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
