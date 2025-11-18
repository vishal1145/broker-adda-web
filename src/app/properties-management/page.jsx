"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import ContentLoader from "react-content-loader";
import ProtectedRoute from "../components/ProtectedRoute";
import Link from "next/link";
import HeaderFile from "../components/Header";

const DEFAULT_IMAGE = "/images/pexels-binyaminmellish-106399.jpg";

const initialProperties = [
  {
    id: "demo-1",
    title: "4BHK Premium Villa",
    description: "Luxurious residential retreat in prime location.",
    region: "Noida, Uttar Pradesh",
    amenities: ["Swimming Pool", "Club House"],
    propertyType: "Residential",
    rating: "4.7",
    currentPrice: "₹4,20,00,000",
    images: [DEFAULT_IMAGE],
    bedrooms: 4,
    bathrooms: 3
  },
  {
    id: "demo-2",
    title: "3BHK City Apartment",
    description: "Modern apartment with skyline views and great connectivity.",
    region: "Gurugram, Haryana",
    amenities: ["Gym", "24x7 Security", "Parking"],
    propertyType: "Residential",
    rating: "4.5",
    currentPrice: "₹1,20,00,000",
    images: [DEFAULT_IMAGE],
    bedrooms: 3,
    bathrooms: 2
  },
  {
    id: "demo-3",
    title: "Premium Office Space",
    description: "Grade-A office floor in prime business district.",
    region: "BKC, Mumbai",
    amenities: ["Power Backup", "Valet", "Conference Rooms"],
    propertyType: "Commercial",
    rating: "4.6",
    currentPrice: "₹9,50,00,000",
    images: [DEFAULT_IMAGE]
  },
  {
    id: "demo-4",
    title: "2BHK Cozy Home",
    description: "Comfortable home near metro and parks.",
    region: "Pune, Maharashtra",
    amenities: ["Club House", "Kids Play Area"],
    propertyType: "Residential",
    rating: "4.3",
    currentPrice: "₹85,00,000",
    images: [DEFAULT_IMAGE],
    bedrooms: 2,
    bathrooms: 2
  },
  {
    id: "demo-5",
    title: "Industrial Warehouse",
    description: "High-clearance warehouse with loading bays.",
    region: "Sriperumbudur, Tamil Nadu",
    amenities: ["24x7 Security", "Dock Levelers"],
    propertyType: "Industrial",
    rating: "4.2",
    currentPrice: "₹5,10,00,000",
    images: [DEFAULT_IMAGE]
  },
  {
    id: "demo-6",
    title: "Lakeview Plot",
    description: "Scenic residential plot with clear title.",
    region: "Udaipur, Rajasthan",
    amenities: ["Gated Community"],
    propertyType: "Land",
    rating: "4.4",
    currentPrice: "₹60,00,000",
    images: [DEFAULT_IMAGE]
  }
];

const PropertiesManagement = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
    subType: "Apartment"
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
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [furnishing, setFurnishing] = useState("Furnished");
  const [status, setStatus] = useState("Pending Approval");
  const [isFeatured, setIsFeatured] = useState(false);
  const [notes, setNotes] = useState("");
  const [allProperties, setAllProperties] = useState([]); // Store all properties for pagination
  const [propertyRatings, setPropertyRatings] = useState({}); // Store ratings for each property: { propertyId: averageRating }
  const [sharedWithMe, setSharedWithMe] = useState(false); // Toggle for shared properties

  // Debug flag - set to true to temporarily disable broker filtering
  const DEBUG_DISABLE_BROKER_FILTER = false;

  // Get token and API URL
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') || localStorage.getItem('authToken')
    : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Get current user ID from token
  const getCurrentUserIdFromToken = (jwtToken) => {
    try {
      if (!jwtToken || typeof window === "undefined") return "";
      const base64Url = jwtToken.split(".")[1];
      if (!base64Url) return "";
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      // Use brokerId if available, otherwise fall back to userId
      return (
        payload.brokerId || payload.userId || payload.id || payload.sub || ""
      );
    } catch {
      return "";
    }
  };

  const currentUserId = useMemo(
    () => getCurrentUserIdFromToken(token),
    [token]
  );

  // State to store the actual broker ID (might be different from token userId)
  const [brokerId, setBrokerId] = useState("");
  const [brokerIdLoading, setBrokerIdLoading] = useState(false);

  // Function to get broker details and extract the correct broker ID
  const getBrokerId = useCallback(async () => {
    if (!currentUserId || !token) {
      // missing auth
      return;
    }

    // No hardcoded mapping. Always resolve via API only.
    try {
      setBrokerIdLoading(true);
      // fetch broker details for user

      // Try the most likely endpoint first
      const res = await fetch(`${apiUrl}/brokers/${currentUserId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // status read
      if (res.ok) {
        const data = await res.json();
        // raw data

        // Try different possible data structures
        const brokerData =
          data?.data?.broker || data?.broker || data?.data || data;
        // processed data

        // Use the broker's _id for filtering properties
        if (brokerData && brokerData._id) {
          setBrokerId(brokerData._id);
          // set broker id
        } else {
          // no id in response
          // Fallback: do not guess. Keep brokerId empty and log for visibility
          // leave brokerId empty
        }
      } else {
        // failed to fetch broker details
        const errorText = await res.text();
        // Do not fallback to userId; keep brokerId empty so queries won't filter wrongly
      }
    } catch (error) {
      // error fetching broker details
      // Do not fallback to userId; keep brokerId empty so queries won't filter wrongly
    } finally {
      setBrokerIdLoading(false);
    }
  }, [currentUserId, token, apiUrl]);

  // Get broker ID when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      getBrokerId();
    }
  }, [currentUserId, getBrokerId]);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch properties from API
  const fetchProperties = useCallback(async (page = 1, limit = 9) => {
    // Don't load properties if we don't have brokerId yet
    if (!brokerId && !brokerIdLoading) return;

    try {
      setLoading(true);
      setError('');

      if (!token) {
        setError('Please login to view properties');
        setLoading(false);
        return;
      }

      if (!brokerId) {
        // Wait for broker ID to be loaded
        setLoading(false);
        return;
      }

      const brokerIdToUse = brokerId;
      console.log('Using broker ID:', brokerIdToUse);

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // Fetch properties via properties endpoint filtered by broker for consistent shape
      const apiUrlWithParams = `${apiUrl}/properties?broker=${encodeURIComponent(String(brokerIdToUse))}&page=${page}&limit=${limit}&sharedWithme=${sharedWithMe}`; console.log('API URL with broker filter:', apiUrlWithParams);
      console.log('Debug mode (no broker filter):', DEBUG_DISABLE_BROKER_FILTER);

      const response = await fetch(apiUrlWithParams, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);

        // Handle broker endpoint response structure
        let properties = [];
        let paginationData = {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        };

        // Handle properties endpoint response
        if (data.pagination) {
          paginationData = {
            total: data.pagination.total || 0,
            page: data.pagination.page || 1,
            limit: data.pagination.limit || 10,
            totalPages: data.pagination.totalPages || 0,
            hasNextPage: data.pagination.hasNextPage || false,
            hasPrevPage: data.pagination.hasPrevPage || false
          };
        }
        // Accept common shapes
        if (Array.isArray(data?.data?.items)) {
          properties = data.data.items;
        } else if (Array.isArray(data?.data?.properties)) {
          properties = data.data.properties;
        } else if (Array.isArray(data?.data)) {
          properties = data.data;
        } else if (Array.isArray(data?.properties)) {
          properties = data.properties;
        } else if (Array.isArray(data)) {
          properties = data;
        }

        setPagination(paginationData);

        // Map API response to expected format
        const mappedProperties = properties.map((property) => {
          // Safely convert region to string - handle all cases
          let regionDisplay = '';
          try {
            if (property && property.region) {
              if (typeof property.region === 'object' && property.region !== null && !Array.isArray(property.region)) {
                // Region is an object, extract name, city, state
                const parts = [
                  property.region.name,
                  property.region.city,
                  property.region.state
                ].filter(Boolean).filter(part => typeof part === 'string');
                regionDisplay = parts.length > 0 ? parts.join(', ') : '';
              } else if (typeof property.region === 'string') {
                regionDisplay = property.region;
              } else {
                // Fallback: convert to string if it's something else
                regionDisplay = String(property.region || '');
              }
            }
          } catch (e) {
            console.warn('Error processing region:', e, property?.region);
            regionDisplay = '';
          }

          // Fallback to city if region is empty
          if (!regionDisplay || regionDisplay.trim() === '') {
            regionDisplay = property.city || '';
          }

          // Final safety check - ensure it's always a string
          regionDisplay = String(regionDisplay || '');

          const imagesArray = Array.isArray(property.images) ? property.images : [];
          const firstNonEmptyImage = imagesArray.find((u) => typeof u === 'string' && u.trim().length > 0);
          return ({
            id: property._id || property.id || `api-${Date.now()}-${Math.random()}`,
            title: property.title || property.name || 'Untitled Property',
            description: property.description || property.propertyDescription || '',
            propertyDescription: property.propertyDescription || property.description || '',
            region: regionDisplay,
            address: property.address || '',
            city: property.city || '',
            price: property.price || 0,
            priceUnit: property.priceUnit || 'INR',
            propertySize: property.propertySize || property.areaSqft || property.area || undefined,
            coordinates: property.coordinates || { lat: '', lng: '' },
            bedrooms: property.bedrooms || undefined,
            bathrooms: property.bathrooms || undefined,
            furnishing: property.furnishing || 'Furnished',
            amenities: Array.isArray(property.amenities) ? property.amenities : [],
            nearbyAmenities: Array.isArray(property.nearbyAmenities) ? property.nearbyAmenities : [],
            features: Array.isArray(property.features) ? property.features : [],
            locationBenefits: Array.isArray(property.locationBenefits) ? property.locationBenefits : [],
            images: imagesArray.length > 0 ? imagesArray : [DEFAULT_IMAGE],
            coverImage: firstNonEmptyImage || DEFAULT_IMAGE,
            videos: Array.isArray(property.videos) ? property.videos : [],
            propertyType: property.propertyType || property.type || 'Residential',
            subType: property.subType || 'Apartment',
            status: property.status || 'Active',
            isFeatured: property.isFeatured || false,
            notes: property.notes || '',
            broker: brokerIdToUse, // Use the current broker ID
            rating: property.rating || '4.7',
            currentPrice: property.price ? new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0
            }).format(property.price) : '-'
          });
        });

        // Since we're using the broker endpoint, all properties should belong to the current broker
        let finalProperties = mappedProperties;

        // Final validation: ensure all regions are strings (safety check)
        finalProperties = finalProperties.map(p => ({
          ...p,
          region: typeof p.region === 'string' ? p.region : String(p.region || p.city || 'Location')
        }));

        if (DEBUG_DISABLE_BROKER_FILTER) {
          console.log('Debug mode: Showing all properties without broker filtering');
        } else {
          console.log('Using broker endpoint - all properties belong to current broker');
        }

        setItems(finalProperties);
        console.log(`Found ${finalProperties.length} properties for broker ID: ${brokerIdToUse}`);
        console.log('Properties data:', finalProperties);

        // Fetch ratings for all properties
        fetchPropertyRatings(finalProperties);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch properties');
        // Don't show demo data - only show broker-specific properties
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Error loading properties');
      // Don't show demo data - only show broker-specific properties
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [brokerId, brokerIdLoading, token, apiUrl, sharedWithMe]);

  // Fetch ratings for properties
  const fetchPropertyRatings = async (properties) => {
    if (!properties || properties.length === 0) return;

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('authToken')
      : null;
    const base = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';

    const ratingsMap = {};

    // Fetch ratings for each property in parallel
    const ratingPromises = properties.map(async (property) => {
      const propertyId = property.id || property._id;
      if (!propertyId) return;

      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const ratingsEndpoint = `/property-ratings/property/${encodeURIComponent(String(propertyId))}`;
        const res = await fetch(`${base}${ratingsEndpoint}`, { headers });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.stats && data.data.stats.averageRating) {
            ratingsMap[propertyId] = data.data.stats.averageRating;
          }
        }
      } catch (error) {
        console.error(`Error fetching rating for property ${propertyId}:`, error);
      }
    });

    // Wait for all rating fetches to complete
    await Promise.all(ratingPromises);

    // Update state with all ratings
    setPropertyRatings(prev => ({ ...prev, ...ratingsMap }));
  };

  // Delete property via API
  const deleteProperty = async (propertyId) => {
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const response = await fetch(`${apiUrl}/properties/${propertyId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        // Refresh the properties list
        await fetchProperties(pagination.page, pagination.limit);
        setSuccessMessage('Property deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete property');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
      setError(err.message || 'Failed to delete property');
      throw err;
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      await deleteProperty(propertyId);
    } catch (err) {
      console.error('Error deleting property:', err);
    }
  };

  // Create new property via API
  const createProperty = async (propertyData) => {
    try {
      setSubmitting(true);

      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const response = await fetch(`${apiUrl}/properties`, {
        method: 'POST',
        headers,
        body: JSON.stringify(propertyData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Property created successfully:', data);
        // Refresh the properties list
        await fetchProperties(pagination.page, pagination.limit);
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create property');
      }
    } catch (err) {
      console.error('Error creating property:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination functions
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && brokerId) {
      // For broker endpoint, use client-side pagination
      if (!DEBUG_DISABLE_BROKER_FILTER && allProperties.length > 0) {
        const startIndex = (newPage - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const pageProperties = allProperties.slice(startIndex, endIndex);

        // Map properties for display
        const mappedProperties = pageProperties.map((property) => {
          // Safely convert region to string - handle all cases
          let regionDisplay = '';
          try {
            if (property && property.region) {
              if (typeof property.region === 'object' && property.region !== null && !Array.isArray(property.region)) {
                // Region is an object, extract name, city, state
                const parts = [
                  property.region.name,
                  property.region.city,
                  property.region.state
                ].filter(Boolean).filter(part => typeof part === 'string');
                regionDisplay = parts.length > 0 ? parts.join(', ') : '';
              } else if (typeof property.region === 'string') {
                regionDisplay = property.region;
              } else {
                // Fallback: convert to string if it's something else
                regionDisplay = String(property.region || '');
              }
            }
          } catch (e) {
            console.warn('Error processing region:', e, property?.region);
            regionDisplay = '';
          }

          // Fallback to city if region is empty
          if (!regionDisplay || regionDisplay.trim() === '') {
            regionDisplay = property.city || '';
          }

          // Final safety check - ensure it's always a string
          regionDisplay = String(regionDisplay || '');

          const imagesArray = Array.isArray(property.images) ? property.images : [];
          const firstNonEmptyImage = imagesArray.find((u) => typeof u === 'string' && u.trim().length > 0);
          return ({
            id: property._id || property.id || `api-${Date.now()}-${Math.random()}`,
            title: property.title || property.name || 'Untitled Property',
            description: property.description || property.propertyDescription || '',
            propertyDescription: property.propertyDescription || property.description || '',
            region: regionDisplay,
            address: property.address || '',
            city: property.city || '',
            price: property.price || 0,
            priceUnit: property.priceUnit || 'INR',
            propertySize: property.propertySize || property.areaSqft || property.area || undefined,
            coordinates: property.coordinates || { lat: '', lng: '' },
            bedrooms: property.bedrooms || undefined,
            bathrooms: property.bathrooms || undefined,
            furnishing: property.furnishing || 'Furnished',
            amenities: Array.isArray(property.amenities) ? property.amenities : [],
            nearbyAmenities: Array.isArray(property.nearbyAmenities) ? property.nearbyAmenities : [],
            features: Array.isArray(property.features) ? property.features : [],
            locationBenefits: Array.isArray(property.locationBenefits) ? property.locationBenefits : [],
            images: imagesArray.length > 0 ? imagesArray : [DEFAULT_IMAGE],
            coverImage: firstNonEmptyImage || DEFAULT_IMAGE,
            videos: Array.isArray(property.videos) ? property.videos : [],
            propertyType: property.propertyType || property.type || 'Residential',
            subType: property.subType || 'Apartment',
            status: property.status || 'Active',
            isFeatured: property.isFeatured || false,
            notes: property.notes || '',
            broker: brokerId,
            rating: property.rating || '4.7',
            currentPrice: property.price ? new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0
            }).format(property.price) : '-'
          });
        });

        // Final validation: ensure all regions are strings (safety check)
        const validatedProperties = mappedProperties.map(p => ({
          ...p,
          region: typeof p.region === 'string' ? p.region : String(p.region || p.city || 'Location')
        }));

        setItems(validatedProperties);

        // Update pagination state
        setPagination(prev => ({
          ...prev,
          page: newPage,
          hasNextPage: newPage < prev.totalPages,
          hasPrevPage: newPage > 1
        }));
      } else {
        fetchProperties(newPage, pagination.limit);
      }
    }
  };

  const handleLimitChange = (newLimit) => {
    if (brokerId) {
      fetchProperties(1, newLimit);
    }
  };

  // Load properties when brokerId is available
  useEffect(() => {
    if (brokerId && !brokerIdLoading) {
      fetchProperties(pagination.page, pagination.limit);
    }
  }, [brokerId, brokerIdLoading, fetchProperties, pagination.page, pagination.limit, sharedWithMe]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      const propertyData = {
        title: form.title || "Untitled Property",
        description: form.description,
        propertyDescription: form.propertyDescription,
        region: form.region,
        address: form.address,
        city: form.city,
        price: form.price ? Number(form.price) : undefined,
        priceUnit: form.priceUnit,
        propertySize: form.propertySize ? Number(form.propertySize) : undefined,
        coordinates: {
          lat: coordinates.lat ? Number(coordinates.lat) : undefined,
          lng: coordinates.lng ? Number(coordinates.lng) : undefined
        },
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        furnishing,
        amenities,
        nearbyAmenities,
        features,
        locationBenefits,
        images: images.length ? images : [DEFAULT_IMAGE],
        videos,
        propertyType: form.propertyType || "Residential",
        subType: form.subType,
        status,
        isFeatured,
        notes,
        broker: brokerId || undefined
      };

      await createProperty(propertyData);

      // Show success message
      setSuccessMessage('Property created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Reset form after successful creation
      setForm({ title: "", description: "", propertyDescription: "", region: "", address: "", city: "Agra", price: "", priceUnit: "INR", propertySize: "", propertyType: "Residential", subType: "Apartment" });
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
      setVideos([]);
      setVideoInput("");
      setCoordinates({ lat: "", lng: "" });
      setBedrooms("");
      setBathrooms("");
      setFurnishing("Furnished");
      setStatus("Pending Approval");
      setIsFeatured(false);
      setNotes("");
      setIsModalOpen(false);

    } catch (err) {
      console.error('Error creating property:', err);
      setError(err.message || 'Failed to create property');
    }
  };

  const addAmenity = () => {
    const value = amenityInput.trim();
    if (!value) return;
    if (amenities.includes(value)) {
      setAmenityInput("");
      return;
    }
    setAmenities(prev => [...prev, value]);
    setAmenityInput("");
  };

  const removeAmenity = (value) => {
    setAmenities(prev => prev.filter(a => a !== value));
  };

  const addTag = (value, listSetter, list, clear) => {
    const v = value.trim();
    if (!v) return;
    if (list.includes(v)) { clear(""); return; }
    listSetter([...list, v]);
    clear("");
  };

  return (
    <ProtectedRoute>
      <HeaderFile data={{ title: 'My Properties', breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Property', href: '/properties-management' }] }} />

      <div className=" mx-auto px-4 md:px-0 py-8">
        <div className="flex items-center justify-between mb-6">

          <div>


          </div>
        </div>

        {(() => {
          console.log('Render state - loading:', loading, 'brokerId:', brokerId, 'items.length:', items.length, 'pagination.total:', pagination.total);
          return null;
        })()}

        {loading || brokerIdLoading ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column - 8/12 width for property cards */}
            <div className="w-full lg:w-8/12">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row">
                      {/* Image Section - Left */}
                      <div className="relative w-full md:w-[400px] flex-shrink-0 self-stretch">
                        <ContentLoader
                          speed={2}
                          width={400}
                          height={200}
                          viewBox="0 0 400 200"
                          backgroundColor="#f3f3f3"
                          foregroundColor="#ecebeb"
                          style={{ width: '100%', height: '100%' }}
                        >
                          {/* Main image */}
                          <rect x="0" y="0" rx="12" ry="12" width="400" height="200" />
                          {/* Tag overlay - top-left */}
                          <rect x="16" y="16" rx="12" ry="12" width="100" height="24" />
                          {/* Rating - top-right */}
                          <circle cx="368" cy="24" r="16" />
                          {/* Price pill - bottom-left */}
                          <rect x="16" y="160" rx="16" ry="16" width="150" height="28" />
                          {/* Share button - bottom-right */}
                          <circle cx="368" cy="176" r="20" />
                        </ContentLoader>
                      </div>

                      {/* Details Section - Right */}
                      <div className="flex-1 px-6 py-4 flex flex-col">
                        <ContentLoader
                          speed={2}
                          width={600}
                          height={300}
                          viewBox="0 0 600 300"
                          backgroundColor="#f3f3f3"
                          foregroundColor="#ecebeb"
                          style={{ width: '100%', height: '100%' }}
                        >
                          {/* Title with verified icon */}
                          <rect x="0" y="0" rx="4" ry="4" width="250" height="20" />
                          <circle cx="265" cy="10" r="7" />

                          {/* Description */}
                          <rect x="0" y="32" rx="4" ry="4" width="418" height="12" />
                          <rect x="0" y="50" rx="4" ry="4" width="400" height="12" />
                          <rect x="0" y="68" rx="4" ry="4" width="380" height="12" />

                          {/* Location Details */}
                          <circle cx="8" cy="105" r="6" />
                          <rect x="20" y="100" rx="4" ry="4" width="80" height="12" />
                          <circle cx="8" cy="130" r="6" />
                          <rect x="20" y="125" rx="4" ry="4" width="200" height="12" />

                          {/* Features label */}
                          <rect x="0" y="155" rx="4" ry="4" width="60" height="14" />
                          {/* Features chips */}
                          <rect x="0" y="177" rx="16" ry="16" width="70" height="24" />
                          <rect x="80" y="177" rx="16" ry="16" width="70" height="24" />
                          <rect x="160" y="177" rx="16" ry="16" width="80" height="24" />

                          {/* Amenities label */}
                          <rect x="0" y="220" rx="4" ry="4" width="70" height="14" />
                          {/* Amenities chips */}
                          <rect x="0" y="242" rx="12" ry="12" width="60" height="20" />
                          <rect x="70" y="242" rx="12" ry="12" width="70" height="20" />
                          <rect x="150" y="242" rx="12" ry="12" width="80" height="20" />
                        </ContentLoader>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - 4/12 width */}
            <div className="w-full lg:w-4/12">
              {/* Tips Section Skeleton */}
              <div className="bg-green-50 rounded-[10px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] border border-gray-200 p-5">
                <ContentLoader
                  speed={2}
                  width={300}
                  height={280}
                  viewBox="0 0 300 280"
                  backgroundColor="#e0f2e9"
                  foregroundColor="#c8e6d5"
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* Title */}
                  <rect x="0" y="0" rx="4" ry="4" width="200" height="20" />

                  {/* 3 tip items */}
                  {[0, 1, 2].map((i) => (
                    <React.Fragment key={i}>
                      <circle cx="14" cy={45 + i * 75} r="14" />
                      <rect x="40" y={38 + i * 75} rx="4" ry="4" width="140" height="16" />
                      <rect x="40" y={58 + i * 75} rx="4" ry="4" width="220" height="12" />
                    </React.Fragment>
                  ))}
                </ContentLoader>
              </div>
            </div>
          </div>
        ) : !brokerId ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-500 text-lg mb-2">No broker ID found</div>
              <div className="text-gray-400 text-sm">Please login again to view your properties</div>
            </div>
          </div>
        ) : items.length === 0 && pagination.total === 0 ? (
          <div>
            <div>
              <div className="flex items-center justify-end">
                <div className="bg-white w-full lg:w-4/12 rounded-[10px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] border border-gray-200 p-5 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[14px] font-semibold text-gray-900 mb-1">Shared Properties</h3>
                      <p className="text-[12px] text-gray-600">Show properties shared with me</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sharedWithMe}
                        onChange={(e) => setSharedWithMe(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-900"></div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center py-16">
                <div className="w-full mx-auto px-6 py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex flex-col items-center justify-center text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No properties found
                    </h3>
                    {/* Secondary Message */}
                    <p className="text-sm text-gray-500 mb-6 max-w-sm">
                      We couldn't find any properties matching your criteria.
                    </p>
                    {/* Add New Property Button */}
                    <Link
                      href="/properties-management/new"
                      className="inline-block px-6 py-2.5 bg-green-900 text-white text-sm font-semibold rounded-lg hover:bg-green-950 transition-colors"
                    >
                      Add New Property
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : items.length === 0 && pagination.total > 0 ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column - 8/12 width for property cards */}
            <div className="w-full lg:w-8/12">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row">
                      {/* Image Section - Left */}
                      <div className="relative w-full md:w-[400px] flex-shrink-0 self-stretch">
                        <ContentLoader
                          speed={2}
                          width={400}
                          height={200}
                          viewBox="0 0 400 200"
                          backgroundColor="#f3f3f3"
                          foregroundColor="#ecebeb"
                          style={{ width: '100%', height: '100%' }}
                        >
                          {/* Main image */}
                          <rect x="0" y="0" rx="12" ry="12" width="400" height="200" />
                          {/* Tag overlay - top-left */}
                          <rect x="16" y="16" rx="12" ry="12" width="100" height="24" />
                          {/* Rating - top-right */}
                          <circle cx="368" cy="24" r="16" />
                          {/* Price pill - bottom-left */}
                          <rect x="16" y="160" rx="16" ry="16" width="150" height="28" />
                          {/* Share button - bottom-right */}
                          <circle cx="368" cy="176" r="20" />
                        </ContentLoader>
                      </div>

                      {/* Details Section - Right */}
                      <div className="flex-1 px-6 py-4 flex flex-col">
                        <ContentLoader
                          speed={2}
                          width={600}
                          height={300}
                          viewBox="0 0 600 300"
                          backgroundColor="#f3f3f3"
                          foregroundColor="#ecebeb"
                          style={{ width: '100%', height: '100%' }}
                        >
                          {/* Title with verified icon */}
                          <rect x="0" y="0" rx="4" ry="4" width="250" height="20" />
                          <circle cx="265" cy="10" r="7" />

                          {/* Description */}
                          <rect x="0" y="32" rx="4" ry="4" width="418" height="12" />
                          <rect x="0" y="50" rx="4" ry="4" width="400" height="12" />
                          <rect x="0" y="68" rx="4" ry="4" width="380" height="12" />

                          {/* Location Details */}
                          <circle cx="8" cy="105" r="6" />
                          <rect x="20" y="100" rx="4" ry="4" width="80" height="12" />
                          <circle cx="8" cy="130" r="6" />
                          <rect x="20" y="125" rx="4" ry="4" width="200" height="12" />

                          {/* Features label */}
                          <rect x="0" y="155" rx="4" ry="4" width="60" height="14" />
                          {/* Features chips */}
                          <rect x="0" y="177" rx="16" ry="16" width="70" height="24" />
                          <rect x="80" y="177" rx="16" ry="16" width="70" height="24" />
                          <rect x="160" y="177" rx="16" ry="16" width="80" height="24" />

                          {/* Amenities label */}
                          <rect x="0" y="220" rx="4" ry="4" width="70" height="14" />
                          {/* Amenities chips */}
                          <rect x="0" y="242" rx="12" ry="12" width="60" height="20" />
                          <rect x="70" y="242" rx="12" ry="12" width="70" height="20" />
                          <rect x="150" y="242" rx="12" ry="12" width="80" height="20" />
                        </ContentLoader>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - 4/12 width */}
            <div className="w-full lg:w-4/12">
              {/* Tips Section Skeleton */}
              <div className="bg-green-50 rounded-[10px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] border border-gray-200 p-5">
                <ContentLoader
                  speed={2}
                  width={300}
                  height={280}
                  viewBox="0 0 300 280"
                  backgroundColor="#e0f2e9"
                  foregroundColor="#c8e6d5"
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* Title */}
                  <rect x="0" y="0" rx="4" ry="4" width="200" height="20" />

                  {/* 3 tip items */}
                  {[0, 1, 2].map((i) => (
                    <React.Fragment key={i}>
                      <circle cx="14" cy={45 + i * 75} r="14" />
                      <rect x="40" y={38 + i * 75} rx="4" ry="4" width="140" height="16" />
                      <rect x="40" y={58 + i * 75} rx="4" ry="4" width="220" height="12" />
                    </React.Fragment>
                  ))}
                </ContentLoader>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column - 8/12 width for property cards */}
            <div className="w-full lg:w-8/12">

              <div className="space-y-6">
                {/* Add Property Card */}
                <Link href="/properties-management/new" className="block">
                  <div className="bg-green-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-900 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center justify-center py-6 px-4" style={{ minHeight: '120px' }}>
                      <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600">Add Property</span>
                    </div>
                  </div>
                </Link>
                {items.map((property) => (
                  <Link key={property.id} href={`/property-details/${property.id}`} className="block">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      <div className="flex flex-col md:flex-row min-w-0">
                        {/* Image Section - Left */}
                        <div className="relative w-full md:w-[400px] h-[200px] md:h-[235px] flex-shrink-0 self-stretch">
                          {/* Image carousel */}
                          <div className="relative w-full h-full overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-t-none">
                            <img src={property.coverImage || DEFAULT_IMAGE} alt={property.title} className="block w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-t-none" style={{ minHeight: '100%' }} />
                          </div>
                          {/* Tag overlay - top-left */}
                          <div className="absolute top-4 left-4">
                            <span className="bg-[#0A421E] text-white px-3 py-1 rounded-full text-xs font-medium">
                              {property.propertyType}
                            </span>
                          </div>
                          {/* Rating - top-right - only show if rating exists */}
                          {(() => {
                            const propertyId = property.id || property._id;
                            const averageRating = propertyRatings[propertyId];

                            // Only show rating chip if rating exists
                            if (!averageRating) return null;

                            return (
                              <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur rounded-full px-2 py-1 shadow-sm">
                                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-xs font-medium text-gray-700">{averageRating.toFixed(1)}</span>
                              </div>
                            );
                          })()}
                          {/* Price pill bottom-left */}
                          <div className="absolute bottom-4 left-4 z-10">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold"
                              style={{
                                backgroundColor: '#FDC700'
                              }}
                            >
                              {property.currentPrice !== '-' ? property.currentPrice : 'Price on Request'}
                            </span>
                          </div>
                          {/* Share icon bottom-right */}
                          <button
                            aria-label="Share on Facebook"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const propertyId = property.id || property._id;
                              const propertyUrl = propertyId
                                ? `${typeof window !== 'undefined' ? window.location.origin : ''}/property-details/${propertyId}`
                                : typeof window !== 'undefined' ? window.location.href : '';
                              const propertyTitle = property.title || 'Property';
                              const propertyDescription = property.description || '';
                              const shareText = `${propertyTitle}${propertyDescription ? ` - ${propertyDescription}` : ''}`;
                              const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}&quote=${encodeURIComponent(shareText)}`;
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
                        <div className="flex-1 px-4 md:px-6 py-3 flex flex-col min-w-0 relative">
                          {/* Title */}
                          <h3 className="mb-2 flex items-center gap-2" style={{ fontSize: '14px', lineHeight: '20px', fontWeight: '600', color: '#171A1FFF' }}>
                            <span className="truncate md:whitespace-nowrap">{property.title}</span>
                            <svg className="w-3.5 h-3.5 text-[#0A421E] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M7 17l10-10M7 7h10v10" />
                            </svg>
                          </h3>

                          {/* Description */}
                          <p className="mb-4 max-w-full" style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px', fontWeight: '400', color: '#565D6DFF' }}>
                            <span className="block md:whitespace-nowrap md:overflow-hidden md:text-ellipsis">{property.description || `A spacious and well-lit property in a prime location, perfect for families. Enjoy modern amenities and easy access to city facilities.`}</span>
                          </p>

                          {/* Location Details */}
                          <div className="flex flex-col gap-2 mb-4">
                            <div className="flex items-center text-xs text-gray-600">
                              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s-7-4.5-7-12a7 7 0 1114 0c0 7.5-7 12-7 12z" />
                                <circle cx="12" cy="10" r="3" strokeWidth="2" />
                              </svg>
                              {(() => {
                                // Region should always be a string after mapping, but add defensive check
                                if (typeof property.region === 'string') {
                                  return property.region;
                                }
                                // Fallback for edge cases
                                if (typeof property.region === 'object' && property.region !== null && !Array.isArray(property.region)) {
                                  const parts = [property.region.name, property.region.city, property.region.state]
                                    .filter(Boolean)
                                    .filter(part => typeof part === 'string');
                                  return parts.length > 0 ? parts.join(', ') : (property.city || 'Location');
                                }
                                // Final fallback - convert to string
                                return String(property.region || property.city || 'Location');
                              })()}
                            </div>
                          </div>

                          {/* Features */}
                          <div className="mb-2 w-full">
                            <div className="text-xs font-semibold text-gray-900 mb-2">Features</div>
                            <div className="flex flex-wrap gap-2 w-full">
                              {property.bedrooms && property.bedrooms > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1" style={{ background: '#EDFDF4FF', borderRadius: '9999px', borderWidth: '1px', borderColor: '#00000000', borderStyle: 'solid' }}>
                                  <svg className="w-4 h-4" style={{ color: '#19191FFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 12l-1 8a2 2 0 002 2h16a2 2 0 002-2l-1-8M3 12V9a2 2 0 012-2h5m0 0h6a2 2 0 012 2v3m0 0v3a2 2 0 01-2 2h-6v0M9 21h6" />
                                  </svg>
                                  <span style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px', fontWeight: '600', color: '#19191FFF' }}>{property.bedrooms} bd</span>
                                </span>
                              )}
                              {property.bathrooms && property.bathrooms > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1" style={{ background: '#EDFDF4FF', borderRadius: '9999px', borderWidth: '1px', borderColor: '#00000000', borderStyle: 'solid' }}>
                                  <svg className="w-4 h-4" style={{ color: '#19191FFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0h4a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h8zm0 0v4" />
                                  </svg>
                                  <span style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px', fontWeight: '600', color: '#19191FFF' }}>{property.bathrooms} bt</span>
                                </span>
                              )}
                              {property.propertySize && property.propertySize > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1" style={{ background: '#EDFDF4FF', borderRadius: '9999px', borderWidth: '1px', borderColor: '#00000000', borderStyle: 'solid' }}>
                                  <svg className="w-4 h-4" style={{ color: '#19191FFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                  </svg>
                                  <span style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px', fontWeight: '600', color: '#19191FFF' }}>{property.propertySize} sqft</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Horizontal Separator */}
                          <hr className="my-3 border-gray-200" />

                          {/* Edit and Delete Buttons */}
                          <div className="flex items-center justify-between gap-3 mt-4">
                            <Link
                              href={`/properties-management/edit/${property.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1  text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm font-medium relative group underline"
                              title="Edit Property"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                              {/* Tooltip */}
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Edit Property
                              </span>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteProperty(property.id);
                              }}
                              className="inline-flex items-center gap-1 underline text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm font-medium relative group"
                              title="Delete Property"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                              {/* Tooltip */}
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Delete Property
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}


              </div>

              {/* Pagination Component */}
              {/* {!loading && pagination.total > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} properties
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Previous page"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>

                    <div className="flex items-center">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-[8px] mx-1 text-[12px] ${
                              pagination.page === pageNum
                                ? 'bg-green-900 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Next page"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
              )} */}
            </div>

            <div className="w-full lg:w-4/12">

            {/* Right column - 4/12 width - match lead details right cards style */}
            <div className="">
              {/* Shared Properties Toggle */}
              <div className="bg-white rounded-[10px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] border border-gray-200 p-5 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-gray-900 mb-1">Shared Properties</h3>
                    <p className="text-[12px] text-gray-600">Show properties shared with me</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sharedWithMe}
                      onChange={(e) => setSharedWithMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-900"></div>
                  </label>
                </div>
              </div>

            </div>


              {/* Tips - now below quick actions */}
              <div className="bg-green-50 rounded-[10px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] border border-gray-200 p-5">
                <h3 className="text-[14px] font-semibold text-gray-900 mb-3">Property Management Tips</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-medium text-gray-800">Add high-quality images</h4>
                      <p className="text-[12px] text-gray-600 mt-1">Properties with 5+ images get 70% more inquiries</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-medium text-gray-800">Complete all details</h4>
                      <p className="text-[12px] text-gray-600 mt-1">Properties with complete information get 40% more views</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-medium text-gray-800">Respond quickly</h4>
                      <p className="text-[12px] text-gray-600 mt-1">Responding within 24 hours increases conversion by 50%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            
          </div>
        )}


        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative border border-gray-100">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Add Property</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Property title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Short description" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input name="region" value={form.region} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="City, State" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                  <textarea name="propertyDescription" value={form.propertyDescription} onChange={handleChange} rows={4} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Long description" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input name="address" value={form.address} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Street address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input name="city" value={form.city} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="City" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="e.g. 42000000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Unit</label>
                    <select name="priceUnit" value={form.priceUnit} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600">
                      <option>INR</option>
                      <option>USD</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Size (sqft)</label>
                    <input type="number" name="propertySize" value={form.propertySize} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select name="propertyType" value={form.propertyType} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600">
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Industrial</option>
                      <option>Land</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub Type</label>
                    <select name="subType" value={form.subType} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600">
                      <option>Apartment</option>
                      <option>Villa</option>
                      <option>Office</option>
                      <option>Shop</option>
                      <option>Land</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                    <select value={furnishing} onChange={(e) => setFurnishing(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600">
                      <option>Furnished</option>
                      <option>Semi-Furnished</option>
                      <option>Unfurnished</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input type="number" step="any" value={coordinates.lat} onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input type="number" step="any" value={coordinates.lng} onChange={(e) => setCoordinates({ ...coordinates, lng: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                  <div className="flex gap-2">
                    <input
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }}
                      className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="Type amenity and press Add or Enter"
                    />
                    <button type="button" onClick={addAmenity} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {amenities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {amenities.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {a}
                          <button type="button" onClick={() => removeAmenity(a)} className="text-gray-500 hover:text-gray-700">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Amenities</label>
                  <div className="flex gap-2">
                    <input value={nearbyAmenityInput} onChange={(e) => setNearbyAmenityInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Add nearby amenity" />
                    <button type="button" onClick={() => addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {nearbyAmenities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {nearbyAmenities.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={() => setNearbyAmenities(nearbyAmenities.filter(x => x !== a))} className="text-gray-500 hover:text-gray-700">×</button></span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  <div className="flex gap-2">
                    <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(featureInput, setFeatures, features, setFeatureInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Add feature" />
                    <button type="button" onClick={() => addTag(featureInput, setFeatures, features, setFeatureInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {features.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {features.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={() => setFeatures(features.filter(x => x !== a))} className="text-gray-500 hover:text-gray-700">×</button></span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Benefits</label>
                  <div className="flex gap-2">
                    <input value={locationBenefitInput} onChange={(e) => setLocationBenefitInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Add location benefit" />
                    <button type="button" onClick={() => addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {locationBenefits.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {locationBenefits.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={() => setLocationBenefits(locationBenefits.filter(x => x !== a))} className="text-gray-500 hover:text-gray-700">×</button></span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images (URLs)</label>
                  <div className="flex gap-2">
                    <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(imageInput, setImages, images, setImageInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="https://..." />
                    <button type="button" onClick={() => addTag(imageInput, setImages, images, setImageInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {images.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={() => setImages(images.filter(x => x !== a))} className="text-gray-500 hover:text-gray-700">×</button></span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Videos (URLs)</label>
                  <div className="flex gap-2">
                    <input value={videoInput} onChange={(e) => setVideoInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(videoInput, setVideos, videos, setVideoInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="https://..." />
                    <button type="button" onClick={() => addTag(videoInput, setVideos, videos, setVideoInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {videos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {videos.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={() => setVideos(videos.filter(x => x !== a))} className="text-gray-500 hover:text-gray-700">×</button></span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600">
                      <option>Active</option>
                      <option>Sold</option>
                      <option>Expired</option>
                      <option>Pending Approval</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                      Featured
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Broker Id (required)</label>
                    <input value={brokerId} onChange={(e) => setBrokerId(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Mongo ObjectId" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Internal notes" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select name="propertyType" value={form.propertyType} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600">
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                    <option>Land</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border text-gray-700" disabled={submitting}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" disabled={submitting}>
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Adding...
                      </>
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default PropertiesManagement;

