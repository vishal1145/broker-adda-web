"use client";
import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import HeaderFile from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import ViewModeProfile from "./components/ViewMode";

// Normalize backend file paths to public URLs for images
const toPublicUrl = (raw) => {
  if (!raw || typeof raw !== "string") return raw;
  if (raw.startsWith('/opt/lampp/htdocs/')) {
    const filename = raw.split('/').pop();
    return `https://broker-adda-be.algofolks.com/uploads/${filename}`;
  }
  if (raw.startsWith('/uploads/')) {
    return `https://broker-adda-be.algofolks.com${raw}`;
  }
  return raw;
};

// Helpers to detect and preview images (for document uploads)
const isImageFile = (val) => {
  if (!val) return false;
  if (typeof val === 'string') return /\.(png|jpe?g|webp)$/i.test(val);
  if (val.type) return val.type.startsWith('image/');
  const name = val.name || '';
  return /\.(png|jpe?g|webp)$/i.test(name);
};

const isPdfFile = (val) => {
  if (!val) return false;
  if (typeof val === 'string') return /\.pdf$/i.test(val);
  if (val.type) return val.type === 'application/pdf';
  const name = val.name || '';
  return /\.pdf$/i.test(name);
};

const getImageSrc = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return toPublicUrl(val);
  try {
    return URL.createObjectURL(val);
  } catch {
    return null;
  }
};

const getPdfSrc = (val) => {
  if (!val) return null;
  if (typeof val === 'string') return toPublicUrl(val);
  try {
    return URL.createObjectURL(val);
  } catch {
    return null;
  }
};

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const userRole = user?.role || "broker";

  // Get mode from URL parameters (reactive to query changes)
  const searchParams = useSearchParams();
  const [mode, setMode] = useState('create');

  useEffect(() => {
    const urlMode = searchParams?.get('mode');
    setMode(urlMode || 'create');
  }, [searchParams]);

  // Derived view flag
  const isViewMode = mode === 'view';

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
    experience: "",
    about: "",
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
    // Location coordinates
    location: null,
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

  // Auto-load nearest regions from broker's stored coordinates when profile loads
  useEffect(() => {
    const loadNearestFromBrokerCoords = async () => {
      if (!nearestMode) return;
      
      // Check if we already have coordinates
      if (geoCoords.latitude && geoCoords.longitude) return;
      
      // Use the already loaded broker data instead of making API call
      if (brokerFormData && brokerFormData.location && 
          brokerFormData.location.coordinates && 
          Array.isArray(brokerFormData.location.coordinates) && 
          brokerFormData.location.coordinates.length >= 2) {
        
        const [latitude, longitude] = brokerFormData.location.coordinates;
        
        if (latitude && longitude) {
          // Set coordinates and load nearest regions (latitude, longitude order)
          setGeoCoords({ latitude, longitude });
          await loadNearestRegionsByCoords(latitude, longitude, 5);
        }
      }
    };

    // Only run if we don't have coordinates yet and nearest mode is enabled
    if (!geoCoords.latitude && !geoCoords.longitude && nearestMode) {
      loadNearestFromBrokerCoords();
    }
  }, [nearestMode, geoCoords.latitude, geoCoords.longitude, brokerFormData]);

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
            // Extract and normalize customer image URL
            const customerImage = toPublicUrl(
              customerData.images?.customerImage ||
              customerData.files?.customerImage ||
              customerData.customerImage ||
              null
            );

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
           
            const experience = (
              typeof brokerData.experience === "object" && brokerData.experience !== null
                ? (brokerData.experience.years ?? "")
                : (brokerData.experience ?? "")
            ) || brokerFormData.experience || "";
           
            const about =
              brokerData.content || brokerData.about || brokerFormData.about || "";
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
            const brokerImage = toPublicUrl(
              brokerData.brokerImage ||
              brokerData.userId?.profileImage ||
              brokerData.personalInfo?.profileImage ||
              null
            );

            // Extract location coordinates
            const location = brokerData.location || null;

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
              experience: experience,
              about: about,
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
              location: location,
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
        
        const experience = (
          typeof brokerData.experience === "object" && brokerData.experience !== null
            ? (brokerData.experience.years ?? "")
            : (brokerData.experience ?? "")
        ) || brokerFormData.experience || "";
        
        const about = brokerData.content || brokerData.about || brokerFormData.about || "";
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
        const brokerImage = toPublicUrl(
          brokerData.brokerImage ||
          brokerData.userId?.profileImage ||
          brokerData.personalInfo?.profileImage ||
          null
        );

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
          experience: experience,
          about: about,
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

  // Render dedicated view-mode UI inside this page
  if (isViewMode) {
    return (
      <ProtectedRoute>
        <link rel="stylesheet" href="/google-places.css" />
        <Toaster position="top-right" />
        <HeaderFile
          data={{
            title: userRole === "customer" ? "Customer Profile" : "Broker Profile",
            breadcrumb: [
              { label: "Home", href: "/" },
              { label: "Profile", href: "/profile" },
            ],
          }}
        />
        <div className="min-h-screen bg-white py-12">
          <ViewModeProfile />
        </div>
      </ProtectedRoute>
    );
  }

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
       {/* Shared hero header */}
          <HeaderFile
            data={{
              title: userRole === "customer" ? "Customer Profile" : "Broker Profile",
              breadcrumb: [
                { label: "Home", href: "/" },
                { label: "Profile", href: "/profile" },
              ],
            }}
          />
      <div className="min-h-screen bg-white py-12">
        <div className="w-full">
         
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-[30px] leading-[36px] font-bold text-[#171A1F] mb-2">
                  {isViewMode
                    ? (userRole === "customer" ? "Customer Profile" : "Broker Profile")
                    : mode === 'create'
                    ? (userRole === "customer" ? "Create Customer Profile" : "Create Broker Profile")
                    : (userRole === "customer" ? "Edit Customer Profile" : "Edit Broker Profile")}
                </h1>
                <p className=" font-inter text-[16px] leading-[24px] font-normal text-[#565D6D]">
                  {isViewMode
                    ? `View your profile information`
                    : mode === 'create'
                    ? `Complete your profile to get started with ${userRole === "customer" ? "finding your dream property" : "connecting with potential clients"}`
                    : `Update your profile information and preferences`}
                </p>
              </div>
              {isViewMode && (
                <div className="flex-shrink-0 ml-4">
                  <button
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('mode', 'edit');
                      window.history.pushState({}, '', url.toString());
                      setMode('edit');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress moved to right sidebar */}

          {/* Layout: 9 / 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
           
          {/* Form Card - 9 columns */}
          <div className="lg:col-span-9 bg-white rounded-2xl shadow-xs overflow-hidden order-1 lg:order-1">
            {/* Step Content */}
            {profileLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-6"></div>
                  <p className="text-lg text-gray-600 font-medium">
                    Loading profile data...
                  </p>
                </div>
              </div>
            ) : (
              <div className="">
                {/* Progress Bar - Common for all steps */}
                <div className=" bg-white   mb-6">
                        <div className="flex items-start gap-3 mb-4">
                          {/* <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M3 20.9996C3.00003 21.5518 2.55228 21.9995 2 21.9996C1.4479 21.9996 1.00029 21.5526 1 21.0005L3 20.9996ZM6.29688 12.7964C7.87562 12.0838 9.62701 11.8423 11.3398 12.1001C13.0526 12.358 14.6542 13.1048 15.9531 14.2505C16.3673 14.6159 16.4073 15.2475 16.042 15.6617C15.6766 16.0758 15.045 16.1149 14.6309 15.7496C13.6205 14.8584 12.3742 14.2782 11.042 14.0777C9.70979 13.8772 8.34803 14.0654 7.12012 14.6197C5.89221 15.1739 4.84995 16.0709 4.11914 17.2027C3.38856 18.3343 3 19.6526 3 20.9996L1 21.0005C0.999905 19.2684 1.49989 17.5728 2.43945 16.1177C3.37903 14.6626 4.71822 13.5091 6.29688 12.7964Z" fill="#0D542B"/>
                              <path d="M14 8C14 5.79086 12.2091 4 10 4C7.79086 4 6 5.79086 6 8C6 10.2091 7.79086 12 10 12C12.2091 12 14 10.2091 14 8ZM16 8C16 11.3137 13.3137 14 10 14C6.68629 14 4 11.3137 4 8C4 4.68629 6.68629 2 10 2C13.3137 2 16 4.68629 16 8Z" fill="#0D542B"/>
                              <path d="M18 22V16C18 15.4477 18.4477 15 19 15C19.5523 15 20 15.4477 20 16V22C20 22.5523 19.5523 23 19 23C18.4477 23 18 22.5523 18 22Z" fill="#0D542B"/>
                              <path d="M22 18C22.5523 18 23 18.4477 23 19C23 19.5523 22.5523 20 22 20H16C15.4477 20 15 19.5523 15 19C15 18.4477 15.4477 18 16 18H22Z" fill="#0D542B"/>
                            </svg>
                          </div> */}
                          {/* <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">Create broker profile</h3>
                            <p className="text-xs text-gray-600">Finish basic details and choose your nearest region to get started.</p>
                          </div> */}
                        </div>
                      {/* Progress Bar */}
                      <div className="space-y-3">
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
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${circleClass} transition-all ${
                                    isActive || isCompleted ? 'cursor-pointer' : 'cursor-not-allowed'
                                  }`}
                                >
                                  {step}
                                </button>
                                {idx < totalSteps - 1 && (
                                  <div className={`flex-1 h-1 mx-1 ${
                                    step < currentStep ? 'bg-green-900' : 'bg-gray-200'
                                  }`} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{Math.round((currentStep / totalSteps) * 100)}% Completed</span>
                          </div>
                          {/* Visual Progress Bar */}
                          <div className="w-full h-7 relative">
                            {/* Track Background */}
                            <div className="absolute top-2.5 left-0 w-full h-2 bg-[#9AEFBD] rounded-md overflow-hidden">
                              {/* Active Track */}
                              <div 
                                className="absolute left-0 top-0 h-full bg-[#0D542B] transition-all duration-300 ease-in-out"
                                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                </div>

                {/* Step 1: Personal Details */}
                {currentStep === 1 && (
                  <div className="w-full mx-auto">
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
                        {!isViewMode && (
                        <button
                          type="button"
                          className="absolute -bottom-1 -right-1 bg-[#0D542B] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#0B4624] transition-all duration-200 shadow-lg hover:shadow-xl"
                          onClick={() =>
                            document
                              .getElementById("profile-image-upload")
                              .click()
                          }
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M21 9C21 8.73478 20.8946 8.48051 20.707 8.29297C20.5429 8.12883 20.3276 8.02757 20.0986 8.00488L20 8H17C16.7033 8 16.4214 7.86856 16.2314 7.64062L14.0312 5H9.96875L7.76855 7.64062C7.57856 7.86856 7.29674 8 7 8H4C3.73478 8 3.48051 8.10543 3.29297 8.29297C3.10543 8.48051 3 8.73478 3 9V18C3 18.2652 3.10543 18.5195 3.29297 18.707C3.48051 18.8946 3.73478 19 4 19H20C20.2652 19 20.5195 18.8946 20.707 18.707C20.8946 18.5195 21 18.2652 21 18V9ZM23 18C23 18.7957 22.6837 19.5585 22.1211 20.1211C21.5585 20.6837 20.7957 21 20 21H4C3.20435 21 2.44152 20.6837 1.87891 20.1211C1.3163 19.5585 1 18.7956 1 18V9C1 8.20435 1.3163 7.44152 1.87891 6.87891C2.44152 6.3163 3.20435 6 4 6H6.53125L8.73145 3.35938L8.80762 3.2793C8.99282 3.10135 9.24033 3 9.5 3H14.5L14.6104 3.00586C14.8656 3.03418 15.1023 3.15991 15.2686 3.35938L17.4688 6H20L20.2969 6.01465C20.9835 6.08291 21.6289 6.38671 22.1211 6.87891C22.6837 7.44152 23 8.20435 23 9V18Z" fill="white"/>
                              <path d="M14 13C14 11.8954 13.1046 11 12 11C10.8954 11 10 11.8954 10 13C10 14.1046 10.8954 15 12 15C13.1046 15 14 14.1046 14 13ZM16 13C16 15.2091 14.2091 17 12 17C9.79086 17 8 15.2091 8 13C8 10.7909 9.79086 9 12 9C14.2091 9 16 10.7909 16 13Z" fill="white"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[14px] font-label text-gray-900 mb-2">
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
                            disabled={isViewMode}
                            className={`w-full px-3 py-2 border rounded-lg  text-[12px] focus:outline-none focus:ring-2 transition-all duration-200 text-sm font-body ${
                              isViewMode ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed' : 'bg-gray-50 border-gray-200 focus:ring-green-100 focus:border-green-600'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[14px] font-label text-gray-900 mb-2">
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
                            disabled={isViewMode}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-[12px] font-body ${
                              isViewMode
                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                : emailError
                                  ? 'bg-gray-50 border-red-300 focus:ring-red-100 focus:border-red-500'
                                  : 'bg-gray-50 border-gray-200 focus:ring-green-100 focus:border-green-600'
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
                          <label className="block text-[14px] font-label text-gray-900 mb-2">
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
                            className="w-full px-3 py-2 bg-gray-100 border text-[12px] border-gray-200 rounded-lg text-gray-500 cursor-not-allowed text-sm font-body"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[14px] font-label text-gray-900 mb-2">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          {/* Icon buttons for gender selection */}
                          {(() => {
                            const selected =
                              (userRole === "customer"
                                  ? customerFormData.gender
                                : brokerFormData.gender) || "";
                            const isMale = selected === "male";
                            const isFemale = selected === "female";
                            const setGender = (value) => {
                              if (userRole === "customer") {
                                setCustomerFormData((prev) => ({ ...prev, gender: value }));
                              } else {
                                setBrokerFormData((prev) => ({ ...prev, gender: value }));
                              }
                            };
                            return (
                              <div className="flex gap-6 w-full">
                                {/* Male */}
                                <div className="flex flex-col items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setGender("male")}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                      isMale
                                        ? "bg-[#0D542B] text-white"
                                        : "bg-white text-gray-600 border border-gray-300"
                                    }`}
                                  >
                                     <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="5" r="2" />
                                        <path d="M9 9h6" />
                                        <path d="M9 9l-3 6h12l-3-6z" />
                                        <path d="M8 22v-6M16 22v-6" />
                                      </svg>
                                  </button>
                                  <span className="text-[12px] font-medium text-gray-900">Male</span>
                                </div>

                                {/* Female */}
                                <div className="flex flex-col items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setGender("female")}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                      isFemale
                                        ? "bg-[#0D542B] text-white"
                                        : "bg-white text-gray-500 border border-gray-300"
                                    }`}
                                  >
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="5" r="2" />
                                        <path d="M9 9h6" />
                                        <path d="M7 22V12a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v10" />
                                        <path d="M10 22v-7M14 22v-7" />
                                      </svg>
                                  </button>
                                  <span className="text-[12px] font-medium text-gray-900">Female</span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {userRole === "broker" && (
                          <div>
                            <label className="block text-[14px] font-label text-gray-900 mb-2">
                              Firm Name
                            </label>
                            <input
                              type="text"
                              name="firmName"
                              value={brokerFormData.firmName}
                              onChange={handleChange}
                              placeholder="Enter your firm name"
                              className="w-full px-3 py-2 bg-gray-50 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600 transition-all duration-200 text-sm font-body"
                            />
                          </div>
                        )}

                        {userRole === "broker" && (
                          <div>
                            <label className="block text-[14px] font-label text-gray-900 mb-2 flex items-center">
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
                              className="w-full px-3 py-2 border border-gray-200 text-[12px] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600 text-sm font-body"
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
                          <h3 className="font-inter text-[18px] leading-[28px] font-semibold text-[#171A1F] mb-6 flex items-center">
                            <svg
                              className="w-5 h-5 text-[#171A1F] mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path d="M18 21V19C18 18.2044 17.6837 17.4415 17.1211 16.8789C16.6289 16.3867 15.9835 16.0829 15.2969 16.0146L15 16H9C8.20435 16 7.44152 16.3163 6.87891 16.8789C6.3163 17.4415 6 18.2044 6 19V21C6 21.5523 5.55228 22 5 22C4.44772 22 4 21.5523 4 21V19C4 17.6739 4.52716 16.4025 5.46484 15.4648C6.40253 14.5272 7.67392 14 9 14H15L15.248 14.0059C16.4838 14.0672 17.6561 14.5858 18.5352 15.4648C19.4728 16.4025 20 17.6739 20 19V21C20 21.5523 19.5523 22 19 22C18.4477 22 18 21.5523 18 21Z" fill="#171A1F"/>
                              <path d="M15 7C15 5.34315 13.6569 4 12 4C10.3431 4 9 5.34315 9 7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7ZM17 7C17 9.76142 14.7614 12 12 12C9.23858 12 7 9.76142 7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7Z" fill="#171A1F"/>
                            </svg>
                            Professional Information
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block mb-1 font-medium text-[14px] leading-[22px] font-[Inter] text-gray-900">
                                License Number{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <svg
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M14 2V8H20"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                                <input
                                  type="text"
                                  name="licenseNumber"
                                  value={brokerFormData.licenseNumber}
                                  onChange={handleChange}
                                  placeholder="e.g., BRE #01234567"
                                  className="w-full pl-10 pr-4 py-2   text-[12px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block mb-1 font-medium text-[14px] leading-[22px] font-[Inter] text-gray-900">Experience (years)
                                   <span className="text-red-500"> * </span>
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={brokerFormData.experience || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  // Only allow positive integers, no conversion to 0
                                  const numeric = val === "" ? "" : (val >= 0 ? parseInt(val, 10) : "");
                                  setBrokerFormData((prev) => ({ ...prev, experience: numeric }));
                                }}
                                placeholder="e.g., 15"
                                className="w-full pl-10 pr-4 py-2 border  text-[12px] border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block mb-1 font-medium text-[14px] leading-[22px] font-[Inter] text-gray-900">
                                Address{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-2">
                                <div className="relative w-[750px]  px-3  font-[Inter]  text-[12px] leading-[22px] font-normal bg-white border border-[#DEE1E6] rounded-md outline-none hover:text-[#171A1F] hover:border-[#DEE1E6] focus:text-[#171A1F] focus:border-[#DEE1E6] disabled:text-[#171A1F] disabled:bg-white disabled:border-[#DEE1E6]">
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
                                      // minHeight: "40px",
                                      // height: "40px",
                                      paddingLeft: "40px",
                                      border: "0",
                                      boxShadow: "none",
                                      backgroundColor: "transparent",
                                    }),
                                    placeholder: (provided) => ({
                                      ...provided,
                                      color: "#9ca3af",
                                      fontSize: "12px",
                                    }),
                                    input: (provided) => ({
                                      ...provided,
                                      color: "#374151",
                                      fontSize: "12px",
                                    }),
                                    singleValue: (provided) => ({
                                      ...provided,
                                      color: "#374151",
                                      fontSize: "12px",
                                    }),
                                    option: (provided, state) => ({
                                      ...provided,
                                      backgroundColor: state.isFocused ? "#f3f4f6" : "white",
                                      color: state.isSelected
                                        ? "white"
                                        : "#374151",
                                      fontSize: "12px",
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
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                  </div>
                                )}
                                </div>
                                <button
                                  type="button"
                                  onClick={handleUseCurrentLocation}
                                  className="flex items-center gap-2 px-3 py-3  text-[12px] font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors duration-200 whitespace-nowrap"
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
                            </div>

                            {/* About (hardcoded, read-only) */}
                            <div className="md:col-span-2">
                              <label className="block mb-1 font-medium text-[14px] leading-[22px] font-[Inter] text-gray-900">About  <span className="text-red-500">*</span></label>
                              <textarea
                                rows={4}
                                value={brokerFormData.about || ""}
                                onChange={(e) => setBrokerFormData((prev) => ({ ...prev, about: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300  text-[12px] rounded-lg bg-gray-50 text-gray-700"
                              />
                             
                            </div>
                          </div>
                        </div>

                        {/* Specializations Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <h3 className="font-[Inter] text-[18px] leading-[28px] font-semibold text-[#171A1F] mb-6 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9 3V5H15V3H9ZM17 5C17 6.10457 16.1046 7 15 7H9C7.89543 7 7 6.10457 7 5V3C7 1.89543 7.89543 1 9 1H15C16.1046 1 17 1.89543 17 3V5Z" fill="#171A1F"/>
                              <path d="M3 20V6C3 5.20435 3.3163 4.44152 3.87891 3.87891C4.44152 3.3163 5.20435 3 6 3H8C8.55228 3 9 3.44772 9 4C9 4.55228 8.55228 5 8 5H6C5.73478 5 5.48051 5.10543 5.29297 5.29297C5.10543 5.48051 5 5.73478 5 6V20L5.00488 20.0986C5.02757 20.3276 5.12883 20.5429 5.29297 20.707C5.48051 20.8946 5.73478 21 6 21H18C18.2652 21 18.5195 20.8946 18.707 20.707C18.8946 20.5195 19 20.2652 19 20V6C19 5.73478 18.8946 5.48051 18.707 5.29297C18.5429 5.12883 18.3276 5.02757 18.0986 5.00488L18 5H16C15.4477 5 15 4.55228 15 4C15 3.44772 15.4477 3 16 3H18L18.2969 3.01465C18.9835 3.08291 19.6289 3.38671 20.1211 3.87891C20.6837 4.44152 21 5.20435 21 6V20C21 20.7957 20.6837 21.5585 20.1211 22.1211C19.5585 22.6837 18.7957 23 18 23H6C5.20435 23 4.44152 22.6837 3.87891 22.1211C3.38671 21.6289 3.08291 20.9835 3.01465 20.2969L3 20Z" fill="#171A1F"/>
                            </svg>
                            Specializations
                          </h3>

                          <div>
                            <label className="font-[Inter] text-[14px] leading-[20px] font-medium text-[#171A1F] mb-2 block">
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
                                  width: "full",
                                  height: "full",
                                 
                                  backgroundColor: "white",
                                  borderRadius: "0.375rem",
                                  border: state.isFocused
                                    ? "1px solid #0D542B"
                                    : "1px solid #DEE1E6",
                                  boxShadow: state.isFocused
                                    ? "0 0 0 3px rgba(13, 84, 43, 0.1)"
                                    : "none",
                                  "&:hover": {
                                    border: "1px solid #0D542B",
                                  },
                                }),
                                valueContainer: (provided) => ({
                                  ...provided,
                                  padding: "6px 12px",
                                }),
                                placeholder: (provided) => ({
                                  ...provided,
                                  fontSize: "12px",
                                }),
                                input: (provided) => ({
                                  ...provided,
                                  fontSize: "12px",
                                }),
                                singleValue: (provided) => ({
                                  ...provided,
                                  fontSize: "12px",
                                }),
                                option: (provided, state) => ({
                                  ...provided,
                                  fontSize: "12px",
                                  backgroundColor: state.isSelected
                                    ? "#0D542B"
                                    : state.isFocused
                                    ? "#E8F8F0"
                                    : "white",
                                  color: state.isSelected ? "#ffffff" : "#171A1F",
                                }),
                                multiValue: (provided) => ({
                                  ...provided,
                                  backgroundColor: "#DCFCE7",
                                  color: "#171A1F",
                                  borderRadius: "9999px",
                                }),
                                multiValueLabel: (provided) => ({
                                  ...provided,
                                  color: "#171A1F",
                                  paddingLeft: "8px",
                                  paddingRight: "6px",
                                }),
                                multiValueRemove: (provided) => ({
                                  ...provided,
                                  color: "#171A1F",
                                  marginLeft: "-4px",
                                  paddingLeft: "4px",
                                  paddingRight: "6px",
                                  "&:hover": {
                                    backgroundColor: "#DCFCE7",
                                    color: "#1e3a8a",
                                  },
                                }),
                              }}
                            />
                          </div>
                        </div>

                        {/* Social Media Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                          <h3 className="font-[Inter] text-[18px] leading-[28px] font-semibold text-[#171A1F] mb-6 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12ZM23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12Z" fill="#171A1F"/>
                              <path d="M14.9961 11.6758C14.9245 8.69287 13.8664 5.82525 12 3.51562C10.0661 5.90881 9 8.90114 9 12L9.00391 12.3242C9.07549 15.3069 10.1339 18.1739 12 20.4834C13.9336 18.0903 15 15.0986 15 12L14.9961 11.6758ZM16.9951 12.373C16.9026 16.2184 15.3834 19.8976 12.7246 22.6895C12.5359 22.8876 12.2737 23 12 23C11.7263 23 11.4641 22.8876 11.2754 22.6895C8.61661 19.8976 7.09737 16.2184 7.00488 12.373L7 12C7 8.02012 8.53074 4.1926 11.2754 1.31055L11.3496 1.24023C11.5299 1.08586 11.7604 1 12 1C12.2737 1 12.5359 1.11237 12.7246 1.31055C15.4693 4.1926 17 8.02012 17 12L16.9951 12.373Z" fill="#171A1F"/>
                              <path d="M22 11C22.5523 11 23 11.4477 23 12C23 12.5523 22.5523 13 22 13H2C1.44772 13 1 12.5523 1 12C1 11.4477 1.44772 11 2 11H22Z" fill="#171A1F"/>
                            </svg>
                            Social Media & Online Presence
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block font-[Inter] text-[14px] leading-[20px] font-medium text-[#171A1F] mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M21 14C21 12.6739 20.4728 11.4025 19.5352 10.4648C18.5975 9.52716 17.3261 9 16 9C14.6739 9 13.4025 9.52716 12.4648 10.4648C11.5272 11.4025 11 12.6739 11 14V20H13V14C13 13.2043 13.3163 12.4415 13.8789 11.8789C14.4415 11.3163 15.2043 11 16 11C16.7957 11 17.5585 11.3163 18.1211 11.8789C18.6837 12.4415 19 13.2043 19 14V20H21V14ZM23 21C23 21.5523 22.5523 22 22 22H18C17.4477 22 17 21.5523 17 21V14C17 13.7348 16.8946 13.4805 16.707 13.293C16.5195 13.1054 16.2652 13 16 13C15.7348 13 15.4805 13.1054 15.293 13.293C15.1054 13.4805 15 13.7348 15 14V21C15 21.5523 14.5523 22 14 22H10C9.44772 22 9 21.5523 9 21V14C9 12.1435 9.73705 10.3626 11.0498 9.0498C12.3626 7.73705 14.1435 7 16 7C17.8565 7 19.6374 7.73705 20.9502 9.0498C22.263 10.3626 23 12.1435 23 14V21Z" fill="#171A1F"/>
                                  <path d="M6 8L6.10254 8.00488C6.60667 8.05621 7 8.48232 7 9V21C7 21.5523 6.55228 22 6 22H2C1.44772 22 1 21.5523 1 21V9L1.00488 8.89746C1.05621 8.39333 1.48232 8 2 8H6ZM3 20H5V10H3V20Z" fill="#171A1F"/>
                                  <path d="M5 4C5 3.44772 4.55228 3 4 3C3.44772 3 3 3.44772 3 4C3 4.55228 3.44772 5 4 5C4.55228 5 5 4.55228 5 4ZM7 4C7 5.65685 5.65685 7 4 7C2.34315 7 1 5.65685 1 4C1 2.34315 2.34315 1 4 1C5.65685 1 7 2.34315 7 4Z" fill="#171A1F"/>
                                </svg>
                                LinkedIn
                              </label>
                              <input
                                type="url"
                                name="linkedin"
                                value={brokerFormData.linkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/yourprofile"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600"
                              />
                            </div>

                            <div>
                              <label className="block font-[Inter] text-[14px] leading-[20px] font-medium text-[#171A1F] mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M13.5752 3.58785C15.2923 2.69324 17.5324 2.74899 19.3115 4.15133C19.3985 4.13033 19.4992 4.10363 19.6123 4.06539C19.8904 3.9714 20.1894 3.84084 20.4727 3.70211C20.7535 3.56459 21.0049 3.42587 21.1865 3.32125C21.2769 3.26919 21.349 3.22562 21.3975 3.19625C21.4217 3.18158 21.4405 3.17025 21.4522 3.16305C21.4577 3.15961 21.4615 3.15671 21.4639 3.15524H21.4658L21.4668 3.15426H21.4658C21.8232 2.92856 22.2845 2.95217 22.6172 3.21285C22.908 3.4409 23.0457 3.8075 22.9863 4.16403L22.9483 4.31637V4.31832L22.9473 4.32028C22.9466 4.32223 22.9454 4.32513 22.9443 4.32809C22.9423 4.33397 22.9399 4.34187 22.9365 4.35153C22.9297 4.37112 22.9205 4.39847 22.9082 4.43258C22.8835 4.50106 22.8468 4.59812 22.7998 4.71676C22.7062 4.95344 22.5673 5.28148 22.3848 5.65328C22.0839 6.26615 21.6401 7.04085 21.0547 7.72555C22.3445 18.1499 11.0183 25.6897 1.88771 20.1132L1.44728 19.8339C1.07254 19.5856 0.910374 19.1168 1.04982 18.6894C1.18937 18.2624 1.59619 17.9808 2.04494 18.0009C3.40575 18.0628 4.75243 17.7802 5.91212 17.2002C1.55099 14.7939 -0.367632 9.10181 2.12111 4.52242L2.18654 4.41793C2.35225 4.18629 2.61124 4.03431 2.89845 4.00485C3.22665 3.97135 3.55058 4.1026 3.76369 4.35446C5.53242 6.44456 8.16475 7.75816 10.8916 7.97262C10.9026 5.97977 12.0241 4.39605 13.5752 3.58785ZM18.3174 5.93063C17.1474 4.83889 15.6363 4.77035 14.5 5.36227C13.3853 5.94302 12.6281 7.15838 12.9776 8.79C13.0397 9.0802 12.9702 9.38361 12.7871 9.61715C12.6039 9.85072 12.326 9.99124 12.0293 9.99996C8.85378 10.0933 5.68513 8.90712 3.334 6.77828C2.17413 10.5587 4.34448 14.859 8.28712 16.042C8.63564 16.1465 8.90039 16.4325 8.97755 16.788C9.04502 17.0992 8.95977 17.4211 8.75392 17.6572L8.65822 17.7529C7.727 18.5676 6.62472 19.1646 5.44435 19.54C12.655 21.7442 20.3027 15.6202 19.0127 7.55758C18.9622 7.24115 19.0665 6.91997 19.293 6.69332C19.4748 6.51154 19.6439 6.30513 19.8027 6.08883C19.5438 6.15261 19.2703 6.20016 19 6.20016C18.7467 6.20016 18.5026 6.10345 18.3174 5.93063Z" fill="#171A1F"/>
                                </svg>
                                Twitter
                              </label>
                              <input
                                type="url"
                                name="twitter"
                                value={brokerFormData.twitter}
                                onChange={handleChange}
                                placeholder="https://twitter.com/yourprofile"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600"
                              />
                            </div>

                            <div>
                              <label className="block font-[Inter] text-[14px] leading-[20px] font-medium text-[#171A1F] mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M21 7C21 4.79086 19.2091 3 17 3H7C4.79086 3 3 4.79086 3 7V17C3 19.2091 4.79086 21 7 21H17C19.2091 21 21 19.2091 21 17V7ZM23 17C23 20.3137 20.3137 23 17 23H7C3.68629 23 1 20.3137 1 17V7C1 3.68629 3.68629 1 7 1H17C20.3137 1 23 3.68629 23 7V17Z" fill="#171A1F"/>
                                  <path d="M9.74052 7.51826C10.6739 7.03399 11.7365 6.85622 12.7766 7.01045L12.9749 7.04463C13.9599 7.23142 14.8673 7.71051 15.5784 8.42158C16.337 9.18014 16.8322 10.1622 16.9895 11.2233L17.014 11.4187C17.1198 12.3959 16.9357 13.3844 16.4817 14.2595C15.9974 15.1929 15.2306 15.9497 14.2913 16.4226C13.352 16.8953 12.2875 17.0602 11.2493 16.8933C10.211 16.7262 9.25175 16.2355 8.50809 15.4919C7.76444 14.7482 7.27381 13.789 7.10673 12.7507C6.93975 11.7125 7.10467 10.648 7.57743 9.70869C8.05026 8.76939 8.80709 8.0026 9.74052 7.51826ZM12.4837 8.98897C11.8595 8.89641 11.2215 9.00303 10.6614 9.29365C10.1013 9.58428 9.64726 10.0445 9.36356 10.6081C9.07991 11.1717 8.98111 11.8104 9.08134 12.4333C9.18158 13.0563 9.47597 13.6316 9.92216 14.0778C10.3683 14.524 10.9437 14.8184 11.5667 14.9187C12.1896 15.0189 12.8283 14.9201 13.3919 14.6364C13.9555 14.3527 14.4157 13.8987 14.7063 13.3386C14.9606 12.8486 15.0739 12.2993 15.0364 11.7517L15.011 11.5163C14.9166 10.8797 14.6194 10.2907 14.1643 9.83564C13.7662 9.43748 13.2655 9.16018 12.72 9.03389L12.4837 8.98897Z" fill="#171A1F"/>
                                  <path d="M17.5098 5.5L17.6123 5.50488C18.1165 5.55611 18.5098 5.98224 18.5098 6.5C18.5098 7.01776 18.1165 7.44389 17.6123 7.49512L17.5098 7.5H17.5C16.9477 7.5 16.5 7.05228 16.5 6.5C16.5 5.94772 16.9477 5.5 17.5 5.5H17.5098Z" fill="#171A1F"/>
                                </svg>
                                Instagram
                              </label>
                              <input
                                type="url"
                                name="instagram"
                                value={brokerFormData.instagram}
                                onChange={handleChange}
                                placeholder="https://instagram.com/yourprofile"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600"
                              />
                            </div>

                            <div>
                              <label className="block tfont-[Inter] text-[14px] leading-[20px] font-medium text-[#171A1F] mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M13 7C13 6.46957 13.2109 5.96101 13.5859 5.58594C13.961 5.21087 14.4696 5 15 5H17V3H15C13.9391 3 12.922 3.42173 12.1719 4.17188C11.4217 4.92202 11 5.93913 11 7V10C11 10.5523 10.5523 11 10 11H8V13H10C10.5523 13 11 13.4477 11 14V21H13V14C13 13.4477 13.4477 13 14 13H16.2197L16.7197 11H14C13.4477 11 13 10.5523 13 10V7ZM15 9H18C18.3079 9 18.5986 9.14205 18.7881 9.38477C18.9775 9.62741 19.0443 9.94354 18.9697 10.2422L17.9697 14.2422C17.8584 14.6874 17.4589 15 17 15H15V22C15 22.5523 14.5523 23 14 23H10C9.44772 23 9 22.5523 9 22V15H7C6.44772 15 6 14.5523 6 14V10L6.00488 9.89746C6.05621 9.39333 6.48232 9 7 9H9V7C9 5.4087 9.63259 3.88303 10.7578 2.75781C11.883 1.63259 13.4087 1 15 1H18L18.1025 1.00488C18.6067 1.05621 19 1.48232 19 2V6C19 6.55228 18.5523 7 18 7H15V9Z" fill="#171A1F"/>
                                </svg>
                                Facebook
                              </label>
                              <input
                                type="url"
                                name="facebook"
                                value={brokerFormData.facebook}
                                onChange={handleChange}
                                placeholder="https://facebook.com/yourprofile"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600"
                              />
                            </div>

                            <div>
                              <label className="block font-[Inter] text-[14px] leading-[20px] font-medium text-[#171A1F] mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12ZM23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12Z" fill="#171A1F"/>
                                  <path d="M14.9961 11.6758C14.9245 8.69287 13.8664 5.82525 12 3.51562C10.0661 5.90881 9 8.90114 9 12L9.00391 12.3242C9.07549 15.3069 10.1339 18.1739 12 20.4834C13.9336 18.0903 15 15.0986 15 12L14.9961 11.6758ZM16.9951 12.373C16.9026 16.2184 15.3834 19.8976 12.7246 22.6895C12.5359 22.8876 12.2737 23 12 23C11.7263 23 11.4641 22.8876 11.2754 22.6895C8.61661 19.8976 7.09737 16.2184 7.00488 12.373L7 12C7 8.02012 8.53074 4.1926 11.2754 1.31055L11.3496 1.24023C11.5299 1.08586 11.7604 1 12 1C12.2737 1 12.5359 1.11237 12.7246 1.31055C15.4693 4.1926 17 8.02012 17 12L16.9951 12.373Z" fill="#171A1F"/>
                                  <path d="M22 11C22.5523 11 23 11.4477 23 12C23 12.5523 22.5523 13 22 13H2C1.44772 13 1 12.5523 1 12C1 11.4477 1.44772 11 2 11H22Z" fill="#171A1F"/>
                                </svg>
                                Website
                              </label>
                              <input
                                type="url"
                                name="website"
                                value={brokerFormData.website}
                                onChange={handleChange}
                                placeholder="https://yourwebsite.com"
                                className="w-full px-4 py-2 border border-gray-300 text-[12px] rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600"
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
                                    borderRadius: "9999px",
                                  }),
                                  multiValueLabel: (provided) => ({
                                    ...provided,
                                    color: "#1e40af",
                                    paddingLeft: "10px",
                                    paddingRight: "8px",
                                  }),
                                  multiValueRemove: (provided) => ({
                                    ...provided,
                                    color: "#1e40af",
                                    marginLeft: "-4px",
                                    paddingLeft: "4px",
                                    paddingRight: "6px",
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
                                      : "border-gray-300 focus:ring-green-500 focus:border-green-600"
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
                                      : "border-gray-300 focus:ring-green-500 focus:border-green-600"
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
                      <div className="mb-6 flex items-center justify-between">
                        <h3 className="text-[20px] leading-[28px] font-semibold text-[#171A1F] flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M18.9912 9.65332C18.9055 7.92303 18.181 6.28061 16.9502 5.0498C15.7194 3.819 14.077 3.09452 12.3467 3.00879L12 3C10.1435 3 8.36256 3.73705 7.0498 5.0498C5.73705 6.36256 5 8.14348 5 10C5 12.1593 6.21679 14.4871 7.79785 16.5645C9.32566 18.5717 11.0795 20.1963 12 20.9951C12.9205 20.1963 14.6743 18.5717 16.2021 16.5645C17.7832 14.4871 19 12.1593 19 10L18.9912 9.65332ZM21 10C21 12.8337 19.4474 15.603 17.7939 17.7754C16.327 19.7028 14.6832 21.2859 13.6553 22.2041L13.2549 22.5557C13.2379 22.5704 13.2201 22.5851 13.2021 22.5986C12.899 22.8266 12.538 22.9626 12.1621 22.9932L12 23C11.6207 23 11.2504 22.8919 10.9316 22.6904L10.7979 22.5986L10.7451 22.5557C9.78983 21.7308 7.88248 19.978 6.20605 17.7754C4.55262 15.603 3 12.8337 3 10C3 7.61305 3.94791 5.32357 5.63574 3.63574C7.32357 1.94791 9.61305 1 12 1C14.3869 1 16.6764 1.94791 18.3643 3.63574C20.0521 5.32357 21 7.61305 21 10Z" fill="#171A1F"/>
                            <path d="M14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12C13.1046 12 14 11.1046 14 10ZM16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10Z" fill="#171A1F"/>
                          </svg>
                          Preferred Regions{" "}
                           <span className= "text-red-500"> * </span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setNearestMode((v) => !v)}
                          className="w-[149.48px] h-[40px] px-3 
         flex items-center justify-center font-[Inter] text-[14px] leading-[22px] font-medium
         text-[#0D542B] bg-white border border-[#DEE1E6] rounded-md opacity-100
         hover:text-[#0D542B] hover:bg-white
         active:text-[#0D542B] active:bg-white
         disabled:opacity-40"
                        >
                          {nearestMode ? "Choose manually" : "Use nearest"}
                        </button>
                      </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    

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
                            <label className="block mb-1 font-medium text-[14px] leading-[22px] font-[Inter] text-gray-900">
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
                                control: (provided, state) => ({
                                  ...provided,
                                  border: state.isFocused
                                    ? "1px solid #0D542B"
                                    : "1px solid #d1d5db",
                                  borderRadius: "0.5rem",
                                  // minHeight: "48px",
                                  fontSize: "12px",
                                  boxShadow: state.isFocused
                                    ? "0 0 0 3px rgba(13, 84, 43, 0.1)"
                                    : "none",
                                  "&:hover": {
                                    border: "1px solid #0D542B",
                                  },
                                }),
                                placeholder: (provided) => ({
                                  ...provided,
                                  fontSize: "12px",
                                }),
                                input: (provided) => ({
                                  ...provided,
                                  fontSize: "12px",
                                }),
                                singleValue: (provided) => ({
                                  ...provided,
                                  fontSize: "12px",
                                }),
                                option: (provided, state) => ({
                                  ...provided,
                                  fontSize: "12px",
                                  backgroundColor: state.isSelected
                                    ? "#0D542B"
                                    : state.isFocused
                                    ? "#E8F8F0"
                                    : "white",
                                  color: state.isSelected
                                    ? "#ffffff"
                                    : state.isFocused
                                    ? "#0D542B"
                                    : "#171A1F",
                                }),
                              }}
                              theme={(t) => ({
                                ...t,
                                colors: {
                                  ...t.colors,
                                  primary: "#0D542B",
                                  primary25: "#E8F8F0",
                                  primary50: "#C8F1DC",
                                },
                              })}
                            />
                          </div>

                          {/* City Selection */}
                          <div className="mb-4">
                            <label className="block mb-1 font-medium text-[14px] leading-[22px] font-[Inter] text-gray-900">
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
                                control: (provided, state) => ({
                                  ...provided,
                                  border: state.isFocused
                                    ? "1px solid #0D542B"
                                    : "1px solid #d1d5db",
                                  borderRadius: "0.5rem",
                                  // minHeight: "48px",
                                  fontSize: "12px",
                                  boxShadow: state.isFocused
                                    ? "0 0 0 3px rgba(13, 84, 43, 0.1)"
                                    : "none",
                                  "&:hover": {
                                    border: "1px solid #0D542B",
                                  },
                                }),
                                placeholder: (provided) => ({
                                  ...provided,
                                  fontSize: "12px",
                                }),
                                input: (provided) => ({
                                  ...provided,
                                  fontSize: "12px",
                                }),
                                singleValue: (provided) => ({
                                  ...provided,
                                  fontSize: "12px",
                                }),
                                option: (provided, state) => ({
                                  ...provided,
                                  fontSize: "12px",
                                  backgroundColor: state.isSelected
                                    ? "#0D542B"
                                    : state.isFocused
                                    ? "#E8F8F0"
                                    : "white",
                                  color: state.isSelected
                                    ? "#ffffff"
                                    : state.isFocused
                                    ? "#0D542B"
                                    : "#171A1F",
                                }),
                              }}
                              theme={(t) => ({
                                ...t,
                                colors: {
                                  ...t.colors,
                                  primary: "#0D542B",
                                  primary25: "#E8F8F0",
                                  primary50: "#C8F1DC",
                                },
                              })}
                            />
                          </div>
                        </div>
                      )}

                      {/* Toggle moved to header above */}

                      {/* Region Selection - Below */}
                      <div className="mb-4">
                        {!nearestMode && (
                          <label className="block mb-1 font-medium text-[14px] leading-[22px] font-[Inter] text-gray-900">
                            Regions <span className="text-red-500">*</span>
                          </label>
                        )}
                        {regionsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
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
                            <div className="mb-2 text-[14px] text-[#565D6D] flex items-center gap-2  font-normal    ">
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
                                      className={`relative text-left p-5 rounded-[10px] border transition-all ${
                                        isSelected
                                          ? "border-[#9AEFBD] bg-[#E8F8F0]"
                                          : "border-[#DEE1E6] bg-white hover:border-[#9AEFBD]"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="font-[Inter] text-[14px] leading-[24px] font-medium text-[#171A1F] mb-2">
                                            {label}
                                          </div>
                                          <div className="mb-3 min-h-[40px]">
                                            {place ? (
                                              <div className="font-[Inter] text-[12px] leading-[20px] font-normal text-[#565D6D]">
                                                {place}
                                              </div>
                                            ) : null}
                                          </div>
                                          {(distanceText || brokersText) && (
                                            <div className="font-[Inter] text-[10px] leading-[16px] font-normal text-[#565D6D]">
                                              {[distanceText, brokersText]
                                                .filter(Boolean)
                                                .join(" / ")}
                                            </div>
                                          )}
                                        </div>
                                        {isSelected && (
                                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#0D542B] text-white flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
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
                              control: (provided, state) => ({
                                ...provided,
                                border: state.isFocused
                                  ? "1px solid #0D542B"
                                  : "1px solid #d1d5db",
                                borderRadius: "0.5rem",
                                minHeight: "48px",
                                fontSize: "12px",
                                boxShadow: state.isFocused
                                  ? "0 0 0 3px rgba(13, 84, 43, 0.1)"
                                  : "none",
                                "&:hover": {
                                  border: "1px solid #0D542B",
                                },
                              }),
                              placeholder: (provided) => ({
                                ...provided,
                                fontSize: "12px",
                              }),
                              input: (provided) => ({
                                ...provided,
                                fontSize: "12px",
                              }),
                              singleValue: (provided) => ({
                                ...provided,
                                fontSize: "12px",
                              }),
                              option: (provided, state) => ({
                                ...provided,
                                fontSize: "12px",
                                backgroundColor: state.isSelected
                                  ? "#0D542B"
                                  : state.isFocused
                                  ? "#E8F8F0"
                                  : "white",
                                color: state.isSelected
                                  ? "#ffffff"
                                  : state.isFocused
                                  ? "#0D542B"
                                  : "#171A1F",
                              }),
                            }}
                            theme={(t) => ({
                              ...t,
                              colors: {
                                ...t.colors,
                                primary: "#0D542B",
                                primary25: "#E8F8F0",
                                primary50: "#C8F1DC",
                              },
                            })}
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
                        className="w-6 h-6 text-gray-900 mr-3"
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
                      <h3 className="text-[16px] font-semibold text-gray-900">
                        Documents{" "}
                        <span className="text-[12px] font-normal text-gray-500">
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
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex-1 flex flex-col justify-center ${canUploadDocs ? "border-gray-300 hover:border-green-400" : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"}`}>
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
                            <div className="relative mx-auto w-full max-w-[380px] rounded-md bg-white" style={{ aspectRatio: '85/54' }}>
                              {isImageFile(brokerFormData.aadharFile) && getImageSrc(brokerFormData.aadharFile) ? (
                                <div className="absolute inset-0">
                                  <img src={getImageSrc(brokerFormData.aadharFile)} alt="Aadhar Preview" className="w-full h-full object-contain" />
                                  <a
                                    href={getImageSrc(brokerFormData.aadharFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-2 right-2 px-2 py-1 bg-green-900 text-white text-xs rounded hover:bg-green-900 transition-colors shadow-lg"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View
                                  </a>
                                </div>
                              ) : isPdfFile(brokerFormData.aadharFile) && getPdfSrc(brokerFormData.aadharFile) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 border-2 border-red-200 rounded-md p-2">
                                  <svg className="h-10 w-10 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs font-medium text-red-700 text-center">PDF Document</span>
                                  <div className="text-xs text-red-600 mt-1 text-center truncate w-full px-1" title={brokerFormData.aadharFile?.name || 'PDF File'}>
                                    {brokerFormData.aadharFile?.name || 'PDF File'}
                                  </div>
                                  <a
                                    href={getPdfSrc(brokerFormData.aadharFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View PDF
                                  </a>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    className="h-10 w-10 text-gray-400"
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
                                </div>
                                )}
                            </div>
                            <div className="mt-2"></div>
                          </label>
                        </div>
                      </div>

                      {/* PAN File Upload */}
                      <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          PAN Card
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex-1 flex flex-col justify-center ${canUploadDocs ? "border-gray-300 hover:border-green-400" : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"}`}>
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
                            <div className="relative mx-auto w-full max-w-[380px] rounded-md bg-white" style={{ aspectRatio: '85/54' }}>
                              {isImageFile(brokerFormData.panFile) && getImageSrc(brokerFormData.panFile) ? (
                                <div className="absolute inset-0">
                                  <img src={getImageSrc(brokerFormData.panFile)} alt="PAN Preview" className="w-full h-full object-contain" />
                                  <a
                                    href={getImageSrc(brokerFormData.panFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-2 right-2 px-2 py-1 bg-green-900 text-white text-xs rounded hover:bg-green-900 transition-colors shadow-lg"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View
                                  </a>
                                </div>
                              ) : isPdfFile(brokerFormData.panFile) && getPdfSrc(brokerFormData.panFile) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 border-2 border-red-200 rounded-md p-2">
                                  <svg className="h-10 w-10 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs font-medium text-red-700 text-center">PDF Document</span>
                                  <div className="text-xs text-red-600 mt-1 text-center truncate w-full px-1" title={brokerFormData.panFile?.name || 'PDF File'}>
                                    {brokerFormData.panFile?.name || 'PDF File'}
                                  </div>
                                  <a
                                    href={getPdfSrc(brokerFormData.panFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View PDF
                                  </a>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    className="h-10 w-10 text-gray-400"
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
                                </div>
                                )}
                            </div>
                            <div className="mt-2"></div>
                          </label>
                        </div>
                      </div>

                      {/* GST File Upload */}
                      <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          GST Certificate
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex-1 flex flex-col justify-center ${canUploadDocs ? "border-gray-300 hover:border-green-400" : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"}`}>
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
                            <div className="relative mx-auto w-full max-w-[380px] rounded-md bg-white" style={{ aspectRatio: '85/54' }}>
                              {isImageFile(brokerFormData.gstFile) && getImageSrc(brokerFormData.gstFile) ? (
                                <div className="absolute inset-0">
                                  <img src={getImageSrc(brokerFormData.gstFile)} alt="GST Preview" className="w-full h-full object-contain" />
                                  <a
                                    href={getImageSrc(brokerFormData.gstFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-2 right-2 px-2 py-1 bg-green-900 text-white text-xs rounded hover:green-900 transition-colors shadow-lg"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View
                                  </a>
                                </div>
                              ) : isPdfFile(brokerFormData.gstFile) && getPdfSrc(brokerFormData.gstFile) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 border-2 border-red-200 rounded-md p-2">
                                  <svg className="h-10 w-10 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs font-medium text-red-700 text-center">PDF Document</span>
                                  <div className="text-xs text-red-600 mt-1 text-center truncate w-full px-1" title={brokerFormData.gstFile?.name || 'PDF File'}>
                                    {brokerFormData.gstFile?.name || 'PDF File'}
                                  </div>
                                  <a
                                    href={getPdfSrc(brokerFormData.gstFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View PDF
                                  </a>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    className="h-10 w-10 text-gray-400"
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
                                </div>
                                )}
                            </div>
                            <div className="mt-2"></div>
                          </label>
                        </div>
                      </div>

                      {/* Broker License File Upload */}
                      <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Broker License
                        </label>
                        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex-1 flex flex-col justify-center ${canUploadDocs ? "border-gray-300 hover:border-green-400" : "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"}`}>
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
                            <div className="relative mx-auto w-full max-w-[380px] rounded-md bg-white" style={{ aspectRatio: '85/54' }}>
                              {isImageFile(brokerFormData.brokerLicenseFile) && getImageSrc(brokerFormData.brokerLicenseFile) ? (
                                <div className="absolute inset-0">
                                  <img src={getImageSrc(brokerFormData.brokerLicenseFile)} alt="License Preview" className="w-full h-full object-contain" />
                                  <a
                                    href={getImageSrc(brokerFormData.brokerLicenseFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-2 right-2 px-2 py-1 bg-green-900 text-white text-xs rounded hover:bg-green-900 transition-colors shadow-lg"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View
                                  </a>
                                </div>
                              ) : isPdfFile(brokerFormData.brokerLicenseFile) && getPdfSrc(brokerFormData.brokerLicenseFile) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 border-2 border-red-200 rounded-md p-2">
                                  <svg className="h-10 w-10 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs font-medium text-red-700 text-center">PDF Document</span>
                                  <div className="text-xs text-red-600 mt-1 text-center truncate w-full px-1" title={brokerFormData.brokerLicenseFile?.name || 'PDF File'}>
                                    {brokerFormData.brokerLicenseFile?.name || 'PDF File'}
                                  </div>
                                  <a
                                    href={getPdfSrc(brokerFormData.brokerLicenseFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View PDF
                                  </a>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    className="h-10 w-10 text-gray-400"
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
                                </div>
                                )}
                            </div>
                            <div className="mt-2"></div>
                          </label>
                        </div>
                      </div>

                      {/* Company Identification Details File Upload */}
                      <div className="flex flex-col h-full">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Company Identification Details
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors flex-1 flex flex-col justify-center">
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
                            <div className="relative mx-auto w-full max-w-[380px] rounded-md bg-white" style={{ aspectRatio: '85/54' }}>
                              {isImageFile(brokerFormData.companyIdFile) && getImageSrc(brokerFormData.companyIdFile) ? (
                                <img src={getImageSrc(brokerFormData.companyIdFile)} alt="Company ID Preview" className="absolute inset-0 w-full h-full object-contain" />
                              ) : isPdfFile(brokerFormData.companyIdFile) && getPdfSrc(brokerFormData.companyIdFile) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 border-2 border-red-200 rounded-md p-2">
                                  <svg className="h-10 w-10 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs font-medium text-red-700 text-center">PDF Document</span>
                                  <div className="text-xs text-red-600 mt-1 text-center truncate w-full px-1" title={brokerFormData.companyIdFile?.name || 'PDF File'}>
                                    {brokerFormData.companyIdFile?.name || 'PDF File'}
                                  </div>
                                  <a
                                    href={getPdfSrc(brokerFormData.companyIdFile)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View PDF
                                  </a>
                                </div>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    className="h-10 w-10 text-gray-400"
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
                                </div>
                                )}
                            </div>
                            <div className="mt-2"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Button - hidden in view mode */}
                {!isViewMode && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className=" mx-auto">
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={isCheckingEmail || !validateStep(currentStep)}
                        className="w-full h-11  mb-8 px-3  bg-[#0D542B] hover:bg-[#0B4624] active:bg-[#08321A] text-white rounded-md font-medium text-sm leading-[22px] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-200"
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
                            {mode === 'create' ? `Continue to ${getStepTitle(currentStep + 1)}` : 'Update'}
                            <svg
                              className="w-4 h-4 inline"
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

                              // Include About and Experience years at top-level as requested
                              if (typeof currentFormData.about === "string") {
                                formDataToSend.append(
                                  "content",
                                  currentFormData.about
                                );
                              }
                              if (
                                currentFormData.experience !== undefined &&
                                currentFormData.experience !== null &&
                                String(currentFormData.experience) !== ""
                              ) {
                                // Ensure we send the exact value entered by user
                                formDataToSend.append(
                                  "experienceYears",
                                  String(currentFormData.experience)
                                );
                              }

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
                              "Profile updated successfully!",
                            
                            );

                            // Redirect to dashboard after successful profile update
                            setTimeout(() => {
                              const returnUrl = 
                                (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('returnTo'))
                                  || '/profile?mode=view';
                              router.push(returnUrl);
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
                        className="w-full h-11 px-3 bg-[#0D542B] hover:bg-[#0B4624] active:bg-[#08321A] text-white rounded-md font-medium text-sm leading-[22px] disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-200 flex items-center justify-center gap-4"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline"></div>
                            Saving Profile...
                          </>
                        ) : (
                          <>
                            {mode === 'create' ? 'Complete Profile' : 'Update Profile'}
                            <svg
                              className="w-4 h-4 inline"
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
                )}
              </div>
            )}
          </div>
          {/* Sidebar: Resources / Help - 3 columns */}
          <aside className="lg:col-span-3 space-y-5 lg:sticky lg:top-20 self-start order-2 lg:order-2">
            {/* Create Broker Profile Progress Card */}
        

            {/* Combined Tips & Support Card */}
              {/* Tips for Profile Completion */}
              <div className="  rounded-[10px] F] border border-gray-200 bg-white p-4 shadow-xs">
                <h3 className="font-inter text-[14px] leading-[28px] font-semibold text-[#171A1F] mb-3">Tips for Profile Completion</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span className="font-inter text-[12px] leading-[20px] font-normal text-[#565D6D]">Fill personal Info first, then add region details.</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-gray-600 mr-2">•</span>
                    <span className="font-inter text-[12px] leading-[20px] font-normal text-[#565D6D]">Ensure all mandatory fields are completed for verification.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span className="font-inter text-[12px] leading-[20px] font-normal text-[#565D6D]">Keep KYC documents under 10MB per file for quick upload.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 mr-2">•</span>
                    <span className="font-inter text-[12px] leading-[20px] font-normal text-[#565D6D]">Use nearest regions for a faster setup process.</span>
                  </li>
                  <li className="flex items-start">
                     <span className="text-gray-600 mr-2">•</span>
                    <span className="font-inter text-[12px] leading-[20px] font-normal text-[#565D6D]">Regularly update your profile to stay current with features.</span>
                  </li>
                </ul>
              </div>

              {/* Support & Documentation */}
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="font-inter text-[14px] leading-[28px] font-semibold text-[#171A1F] mb-3"> Documentation</h3>
              <p className="font-inter text-[12px] leading-[20px] font-normal text-[#565D6D] mb-4">Need help or looking for more details? Our comprehensive resources and support team are here for you.</p>
              
              <div className="space-y-3">
                {/* Visit Support Center */}
                <Link href="/contact" className="flex items-start gap-3 group cursor-pointer hover:text-[#0D542B] transition-opacity">
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12ZM23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12Z" fill="#0D542B"/>
                      <path d="M9.89371 6.54728C10.708 6.0688 11.665 5.89357 12.5959 6.05314C13.5268 6.21282 14.3713 6.69686 14.9797 7.41936C15.5878 8.14175 15.9212 9.05616 15.9201 10.0004L15.9074 10.2807C15.7799 11.6553 14.7346 12.5759 13.9748 13.0824C13.5393 13.3727 13.1107 13.5857 12.7951 13.726C12.6358 13.7968 12.5011 13.8503 12.4045 13.8871C12.3562 13.9055 12.3168 13.92 12.2882 13.9301C12.2741 13.9351 12.2628 13.9398 12.2541 13.9428C12.2498 13.9443 12.2462 13.9457 12.2433 13.9467C12.242 13.9471 12.2404 13.9473 12.2394 13.9477L12.2375 13.9487H12.2365L12.1379 13.976C11.6432 14.087 11.1346 13.8071 10.9709 13.3158C10.7968 12.7926 11.0791 12.2265 11.6017 12.0512V12.0522L11.6037 12.0512C11.6063 12.0503 11.6113 12.0488 11.6183 12.0463C11.6336 12.0409 11.6591 12.0317 11.6925 12.019C11.76 11.9933 11.8606 11.953 11.9826 11.8988C12.2294 11.7892 12.5511 11.6279 12.8654 11.4184C13.5548 10.9588 13.9199 10.4694 13.9201 10.0004V9.99846L13.9123 9.82268C13.8768 9.41368 13.7165 9.0237 13.4504 8.70744C13.1462 8.34611 12.7235 8.1037 12.258 8.02385C11.7925 7.94406 11.3135 8.03164 10.9064 8.27092C10.4993 8.51017 10.1901 8.88607 10.0334 9.33146L9.9943 9.42619C9.77873 9.88503 9.24648 10.1156 8.75797 9.94377C8.23707 9.76051 7.96352 9.1893 8.14664 8.66838L8.20914 8.50236C8.53842 7.68397 9.13033 6.99593 9.89371 6.54728Z" fill="#0D542B"/>
                      <path d="M12.0098 16L12.1123 16.0049C12.6165 16.0561 13.0098 16.4822 13.0098 17C13.0098 17.5178 12.6165 17.9439 12.1123 17.9951L12.0098 18H12C11.4477 18 11 17.5523 11 17C11 16.4477 11.4477 16 12 16H12.0098Z" fill="#0D542B"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className=" font-inter text-[14px] leading-[20px] font-medium text-[#171A1F]">Visit Support Center</div>
                    <div className="font-inter text-[12px] leading-[16px] font-normal text-[#565D6D]">Get answers to frequently asked questions.</div>
                  </div>
                </Link>

                {/* Read Documentation */}
                <div className="flex items-start gap-3 group cursor-pointer">
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 21V7C11 6.44772 11.4477 6 12 6C12.5523 6 13 6.44772 13 7V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21Z" fill="#0D542B"/>
                      <path d="M16 4C15.2044 4 14.4415 4.3163 13.8789 4.87891C13.3163 5.44152 13 6.20435 13 7L12.9951 7.10254C12.9438 7.60667 12.5177 8 12 8C11.4477 8 11 7.55228 11 7C11 6.20435 10.6837 5.44152 10.1211 4.87891C9.55848 4.3163 8.79565 4 8 4H3V17H9L9.19824 17.0049C10.1869 17.0539 11.1248 17.4686 11.8281 18.1719C11.8876 18.2314 11.9447 18.2927 12 18.3555C12.0553 18.2927 12.1124 18.2314 12.1719 18.1719C12.922 17.4217 13.9391 17 15 17H21V4H16ZM23 17C23 17.5304 22.7891 18.039 22.4141 18.4141C22.039 18.7891 21.5304 19 21 19H15C14.4696 19 13.961 19.2109 13.5859 19.5859C13.2109 19.961 13 20.4696 13 21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21C11 20.4696 10.7891 19.961 10.4141 19.5859C10.0858 19.2577 9.65526 19.0551 9.19727 19.0098L9 19H3C2.46957 19 1.96101 18.7891 1.58594 18.4141C1.25765 18.0858 1.05515 17.6553 1.00977 17.1973L1 17V4C1 3.46957 1.21086 2.96101 1.58594 2.58594C1.96101 2.21086 2.46957 2 3 2H8C9.32608 2 10.5975 2.52716 11.5352 3.46484C11.7036 3.63332 11.8587 3.81256 12 4.00098C12.1413 3.81256 12.2964 3.63332 12.4648 3.46484C13.4025 2.52716 14.6739 2 16 2H21C21.5304 2 22.039 2.21086 22.4141 2.58594C22.7891 2.96101 23 3.46957 23 4V17Z" fill="#0D542B"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                     <Link
    href="/help/documentation"
    className="block font-inter text-[14px] leading-[20px] font-medium text-[#171A1F] hover:text-[#0D542B] transition"
  >
    Read Documentation
  </Link>
                    <div className="font-inter text-[12px] leading-[16px] font-normal text-[#565D6D]">Explore our guides and platform tutorials.</div>
                  </div>
                </div>

                {/* Email Support */}
                <div className="flex items-start cursor-pointer gap-3">
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21.4629 6.15624C21.9287 5.85973 22.5471 5.99715 22.8437 6.46288C23.1402 6.92867 23.0028 7.54708 22.5371 7.84374L13.5459 13.5703C13.5345 13.5775 13.5233 13.585 13.5117 13.5918C13.1112 13.8244 12.6626 13.9608 12.2021 13.9912L12.0049 13.9971C11.4757 13.9971 10.9556 13.8575 10.498 13.5918C10.4864 13.585 10.4743 13.5776 10.4629 13.5703L1.46288 7.84374L1.37987 7.78417C0.981919 7.47025 0.878267 6.89971 1.15624 6.46288C1.43428 6.0261 1.99533 5.87783 2.44823 6.10546L2.5371 6.15624L11.5078 11.8652C11.659 11.9518 11.8306 11.9971 12.0049 11.9971L12.1357 11.9892C12.2637 11.9723 12.3872 11.9296 12.5 11.8652L21.4629 6.15624Z" fill="#0D542B"/>
                      <path d="M21 6C21 5.44772 20.5523 5 20 5H4C3.44772 5 3 5.44772 3 6V18C3 18.5523 3.44772 19 4 19H20C20.5523 19 21 18.5523 21 18V6ZM23 18C23 19.6569 21.6569 21 20 21H4C2.34315 21 1 19.6569 1 18V6C1 4.34315 2.34315 3 4 3H20C21.6569 3 23 4.34315 23 6V18Z" fill="#0D542B"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                   <div className="font-inter text-[14px] leading-[9px] font-medium text-[#171A1F]">
  Email Support
</div>

<a
  href="mailto:support@brokeradda.com"
  className="font-inter text-[12px] leading-[5px] font-normal text-[#565D6D] hover:text-[#0D542B]  transition"
>
  support@brokeradda.com
</a>
                  </div>
                </div>

                {/* Phone Support */}
                <div className="flex items-start cursor-pointer gap-3">
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M7.10991 0.999897C7.83437 0.995123 8.53603 1.25298 9.0855 1.72548C9.56837 2.14075 9.90549 2.69697 10.0503 3.3124L10.1001 3.57998L10.1011 3.58876L10.15 3.9208C10.2738 4.69087 10.4729 5.4473 10.7457 6.17861L10.814 6.38173C10.9559 6.86068 10.9763 7.36852 10.8716 7.85927C10.752 8.42016 10.4741 8.93486 10.0708 9.34267L10.0669 9.34755L9.35112 10.0624C10.527 11.9073 12.0923 13.4714 13.9371 14.6474L14.6568 13.9286L14.815 13.7841C15.1944 13.4591 15.6494 13.2325 16.1402 13.1278C16.7001 13.0084 17.2828 13.052 17.8189 13.2528C18.5509 13.526 19.3087 13.7266 20.0796 13.8505L20.4107 13.8983L20.4195 13.8993C21.148 14.0021 21.8139 14.3692 22.2896 14.9306C22.7599 15.4856 23.0106 16.1929 22.9986 16.9198L22.9996 19.9159L22.9966 20.0722C22.9791 20.4364 22.895 20.7948 22.7486 21.1298C22.5812 21.5125 22.3357 21.8562 22.0279 22.1386C21.7201 22.4209 21.3571 22.6366 20.9615 22.7704C20.6153 22.8875 20.2506 22.9395 19.8863 22.9257L19.73 22.9159C19.724 22.9154 19.7175 22.9146 19.7115 22.914C16.4791 22.5627 13.3741 21.4584 10.646 19.6894C8.10955 18.0759 5.9586 15.9239 4.34624 13.3866C2.57382 10.648 1.47009 7.53002 1.12554 4.28603L1.12358 4.27041C1.08611 3.85571 1.13623 3.43748 1.26909 3.04287C1.40202 2.6482 1.61529 2.28502 1.89604 1.97744C2.17684 1.66983 2.51897 1.42404 2.89995 1.25576C3.28084 1.08755 3.69255 1.0003 4.10894 0.999897H7.10991ZM4.00737 3.00576C3.9042 3.0166 3.80285 3.04277 3.70757 3.08486C3.5806 3.14095 3.46717 3.22355 3.37358 3.32607C3.28007 3.42851 3.20892 3.54913 3.1646 3.68056C3.12198 3.8071 3.1049 3.94107 3.11479 4.07412L3.1812 4.62294C3.52874 7.17771 4.39833 9.63358 5.73589 11.8378L6.02886 12.3065L6.03374 12.3134L6.31304 12.7392C7.64032 14.7062 9.33326 16.4001 11.3003 17.7274L11.7261 18.0058L11.7339 18.0106L12.2007 18.3036C14.547 19.7293 17.1792 20.6244 19.9126 20.9237C20.0505 20.9358 20.1898 20.9202 20.3208 20.8759C20.4526 20.8313 20.5738 20.759 20.6763 20.6649C20.7788 20.5709 20.8608 20.4565 20.9166 20.329C20.9723 20.2014 21.0001 20.063 20.9996 19.9237V16.9198L21.0005 16.8954C21.0066 16.6502 20.9218 16.4107 20.7632 16.2235C20.6066 16.0388 20.3883 15.9166 20.149 15.8808C19.1143 15.7443 18.0985 15.4917 17.1207 15.1269L17.1177 15.1259C16.939 15.0588 16.7448 15.0442 16.5582 15.0839C16.3712 15.1238 16.199 15.217 16.063 15.3515L14.7974 16.6171C14.4791 16.9354 13.9866 17.0017 13.5953 16.7792C10.9354 15.2667 8.73272 13.0641 7.22026 10.4042C6.99792 10.0129 7.0651 9.52127 7.38335 9.20302L8.648 7.93642C8.78242 7.80049 8.87569 7.62924 8.91558 7.44228C8.95545 7.2553 8.94085 7.0607 8.87358 6.88173L8.87261 6.87978C8.5088 5.90483 8.25646 4.89181 8.11968 3.86025L8.10308 3.77041C8.05477 3.5655 7.94253 3.38041 7.78179 3.24208C7.62082 3.10365 7.42057 3.01985 7.2105 3.00283L7.11968 2.9999H4.11089L4.00737 3.00576Z" fill="#0D542B"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                  <div className="font-inter text-[14px] leading-[9px] font-medium text-[#171A1F]">
  Phone Support
</div>

<a
  href="tel:+918012345678"
  className="font-inter text-[12px] leading-[5px] font-normal text-[#565D6D] hover:text-[#0D542B] transition"
>
  +91 80 1234 5678
</a>
                  </div>
                </div>
              </div>
              </div>
         

         
          </aside>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Profile />
    </Suspense>
  );
}
