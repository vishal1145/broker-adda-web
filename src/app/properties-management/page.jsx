"use client";
import React, { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Link from "next/link";

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
    images: [DEFAULT_IMAGE]
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
    images: [DEFAULT_IMAGE]
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
    images: [DEFAULT_IMAGE]
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
  const [brokerId, setBrokerId] = useState("");
  const [allProperties, setAllProperties] = useState([]); // Store all properties for pagination
  
  // Debug flag - set to true to temporarily disable broker filtering
  const DEBUG_DISABLE_BROKER_FILTER = false;
  
  // Function to extract broker ID from JWT token
  const getCurrentUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Try different possible field names for broker ID
      return payload.brokerId || payload.userId || payload.id || payload.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  
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
    try {
      setLoading(true);
      setError('');
      
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      if (!token) {
        setError('Please login to view properties');
        setLoading(false);
        return;
      }
      
      // Extract broker ID from token
      const currentBrokerId = getCurrentUserIdFromToken(token);
      console.log('Extracted broker ID from token:', currentBrokerId);
      if (!currentBrokerId) {
        console.error('Failed to extract broker ID from token');
        setError('Failed to extract broker ID from token. Please re-login.');
        setLoading(false);
        return;
      }
      
      // Use the broker ID from state if available, otherwise use the extracted one
      const brokerIdToUse = brokerId || currentBrokerId;
      console.log('Using broker ID:', brokerIdToUse);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // Use broker endpoint to get broker's properties
      const apiUrlWithParams = DEBUG_DISABLE_BROKER_FILTER 
        ? `${apiUrl}/properties?page=${page}&limit=${limit}`
        : `${apiUrl}/brokers/${brokerIdToUse}`;
      console.log('API URL with broker filter:', apiUrlWithParams);
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

        if (DEBUG_DISABLE_BROKER_FILTER) {
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
          
          // Handle different response structures for properties endpoint
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
        } else {
          // Handle broker endpoint response
          if (data?.data?.broker) {
            const broker = data.data.broker;
            const brokerProperties = broker.properties || broker.propertiesListed?.items || [];
            
            // Store all properties for pagination
            setAllProperties(brokerProperties);
            
            // Implement client-side pagination
            const totalProperties = broker.propertyCount || brokerProperties.length;
            const totalPages = Math.ceil(totalProperties / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            
            // Get properties for current page
            properties = brokerProperties.slice(startIndex, endIndex);
            
            // Set pagination data
            paginationData = {
              total: totalProperties,
              page: page,
              limit: limit,
              totalPages: totalPages,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1
            };
          }
        }

        setPagination(paginationData);

        // Map API response to expected format
        const mappedProperties = properties.map((property) => ({
          id: property._id || property.id || `api-${Date.now()}-${Math.random()}`,
          title: property.title || property.name || 'Untitled Property',
          description: property.description || property.propertyDescription || '',
          propertyDescription: property.propertyDescription || property.description || '',
          region: property.region || property.city || '',
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
          images: Array.isArray(property.images) && property.images.length > 0 ? property.images : [DEFAULT_IMAGE],
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
        }));

        // Since we're using the broker endpoint, all properties should belong to the current broker
        let finalProperties = mappedProperties;
        
        if (DEBUG_DISABLE_BROKER_FILTER) {
          console.log('Debug mode: Showing all properties without broker filtering');
        } else {
          console.log('Using broker endpoint - all properties belong to current broker');
        }

        setItems(finalProperties);
        console.log(`Found ${finalProperties.length} properties for broker ID: ${brokerIdToUse}`);
        console.log('Properties data:', finalProperties);
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
  }, []);

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
        const mappedProperties = pageProperties.map((property) => ({
          id: property._id || property.id || `api-${Date.now()}-${Math.random()}`,
          title: property.title || property.name || 'Untitled Property',
          description: property.description || property.propertyDescription || '',
          propertyDescription: property.propertyDescription || property.description || '',
          region: property.region || property.city || '',
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
          images: Array.isArray(property.images) && property.images.length > 0 ? property.images : [DEFAULT_IMAGE],
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
        }));
        
        setItems(mappedProperties);
        
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

  // Set broker ID from token on component mount
  useEffect(() => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') || localStorage.getItem('authToken')
      : null;
    
    console.log('Token found:', !!token);
    if (token) {
      console.log('Token:', token.substring(0, 50) + '...');
      const currentBrokerId = getCurrentUserIdFromToken(token);
      console.log('Extracted broker ID in useEffect:', currentBrokerId);
      if (currentBrokerId) {
        setBrokerId(currentBrokerId);
        console.log('Set broker ID state to:', currentBrokerId);
      } else {
        console.error('Failed to extract broker ID from token');
      }
    } else {
      console.error('No token found in localStorage');
    }
  }, []);

  // Load properties on component mount
  useEffect(() => {
    console.log('useEffect triggered - brokerId:', brokerId);
    // Only fetch properties if we have a broker ID
    if (brokerId) {
      console.log('Fetching properties for broker ID:', brokerId);
      fetchProperties(pagination.page, pagination.limit);
    } else {
      console.log('No broker ID, not fetching properties');
    }
  }, [fetchProperties, brokerId]);

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
      setBrokerId("");
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
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Properties Management</h1>
            <p className="text-gray-600 text-sm">Manage your properties and add new ones.</p>
            {/* {brokerId ? (
              <div className="mt-2 text-sm text-blue-600 font-medium">
                Showing properties for Broker ID: {brokerId}
              </div>
            ) : (
              <div className="mt-2 text-sm text-red-600 font-medium">
                No broker ID found. Please login again.
              </div>
            )} */}
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
                <button 
                  onClick={() => setError('')} 
                  className="mt-1 text-xs text-red-500 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            )}
            {successMessage && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{successMessage}</p>
                <button 
                  onClick={() => setSuccessMessage('')} 
                  className="mt-1 text-xs text-green-500 hover:text-green-700"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => brokerId && fetchProperties(pagination.page, pagination.limit)}
              disabled={loading || !brokerId}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <Link
              href="/properties-management/new"
              className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Property
            </Link>
          </div>
        </div>

        {(() => {
          console.log('Render state - loading:', loading, 'brokerId:', brokerId, 'items.length:', items.length, 'pagination.total:', pagination.total);
          return null;
        })()}
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="text-gray-600">Loading properties...</span>
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
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-500 text-lg mb-2">No properties found</div>
              <div className="text-gray-400 text-sm">You haven't created any properties yet</div>
              <Link
                href="/properties-management/new"
                className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Your First Property
              </Link>
            </div>
          </div>
        ) : items.length === 0 && pagination.total > 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-500 text-lg mb-2">Loading properties...</div>
              <div className="text-gray-400 text-sm">Please wait while we load your properties</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((property) => (
            <div key={property.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <div className="relative">
                <div className="relative h-56 overflow-visible rounded-xl">
                  <img src={(property.images && property.images[0]) || DEFAULT_IMAGE} alt={property.title} className="block w-full h-full object-cover rounded-xl" />
                  {/* Price chip + share button protruding slightly below image */}
                  <div className="absolute inset-x-0 -bottom-4 z-10 px-4 flex items-center justify-between">
                    <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {property.currentPrice !== '-' ? property.currentPrice : 'Price on Request'}
                    </div>
                    <button className="p-2 bg-white rounded-full border border-gray-200 shadow-lg hover:shadow transition">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="absolute top-6 left-6">
                  <span className="bg-[#0A421E] text-white  px-6 py-1 rounded-full text-xs font-medium">
                    {property.propertyType}
                  </span>
                </div>
                <div className="absolute top-6 right-6 flex items-center bg-white/90 backdrop-blur rounded-full px-2 py-1 shadow-sm">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">{property.rating}</span>
                </div>

                <div className="mt-8 px-4 pb-4">

                  {/* Title with inline arrow */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-gray-900">{property.title}</h3>
                    <Link href={`/property-details/${property.id}`} className="text-green-600 hover:text-green-700" aria-label="Open details">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h4m0 0v4m0-4L10 14" />
                      </svg>
                    </Link>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{property.description}</p>

                  {/* Location - City and Region with separate icons */}
                  <div className="mb-3">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {/* City with building icon */}
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>{property.city || 'City'}</span>
                      </div>
                      
                      {/* Region with location pin icon */}
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{property.region || 'Location'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features - Only show if values exist and are greater than 0 */}
                  {((property.bedrooms && property.bedrooms > 0) || (property.bathrooms && property.bathrooms > 0) || (property.propertySize && property.propertySize > 0)) && (
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {property.bedrooms && property.bedrooms > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                            </svg>
                            {property.bedrooms} bd
                          </span>
                        )}
                        {property.bathrooms && property.bathrooms > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                            {property.bathrooms} bt
                          </span>
                        )}
                        {property.propertySize && property.propertySize > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            {property.propertySize} sqft
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {Array.isArray(property.amenities) && property.amenities.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.slice(0, 3).map((amenity, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{amenity}</span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">+{property.amenities.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Pagination Component */}
        {!loading && pagination.total > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Pagination Info */}
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} properties
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Show first page, last page, current page, and pages around current page
                  const shouldShow = 
                    pageNum === 1 || 
                    pageNum === pagination.totalPages || 
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1);
                  
                  if (!shouldShow) {
                    // Show ellipsis for gaps
                    if (pageNum === 2 && pagination.page > 3) {
                      return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                    }
                    if (pageNum === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2) {
                      return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        pageNum === pagination.page
                          ? 'bg-green-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            {/* Items per page selector */}
            {/* <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value={5}>5</option>
                <option value={9}>9</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div> */}
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
                    <input type="number" value={bedrooms} onChange={(e)=>setBedrooms(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input type="number" value={bathrooms} onChange={(e)=>setBathrooms(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
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
                    <select value={furnishing} onChange={(e)=>setFurnishing(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600">
                      <option>Furnished</option>
                      <option>Semi-Furnished</option>
                      <option>Unfurnished</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input type="number" step="any" value={coordinates.lat} onChange={(e)=>setCoordinates({ ...coordinates, lat: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input type="number" step="any" value={coordinates.lng} onChange={(e)=>setCoordinates({ ...coordinates, lng: e.target.value })} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
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
                    <input value={nearbyAmenityInput} onChange={(e)=>setNearbyAmenityInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Add nearby amenity" />
                    <button type="button" onClick={()=>addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {nearbyAmenities.length>0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {nearbyAmenities.map((a)=> (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>setNearbyAmenities(nearbyAmenities.filter(x=>x!==a))} className="text-gray-500 hover:text-gray-700">×</button></span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  <div className="flex gap-2">
                    <input value={featureInput} onChange={(e)=>setFeatureInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); addTag(featureInput, setFeatures, features, setFeatureInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Add feature" />
                    <button type="button" onClick={()=>addTag(featureInput, setFeatures, features, setFeatureInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {features.length>0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {features.map((a)=> (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>setFeatures(features.filter(x=>x!==a))} className="text-gray-500 hover:text-gray-700">×</button></span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Benefits</label>
                  <div className="flex gap-2">
                    <input value={locationBenefitInput} onChange={(e)=>setLocationBenefitInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Add location benefit" />
                    <button type="button" onClick={()=>addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {locationBenefits.length>0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {locationBenefits.map((a)=> (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>setLocationBenefits(locationBenefits.filter(x=>x!==a))} className="text-gray-500 hover:text-gray-700">×</button></span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images (URLs)</label>
                  <div className="flex gap-2">
                    <input value={imageInput} onChange={(e)=>setImageInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); addTag(imageInput, setImages, images, setImageInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="https://..." />
                    <button type="button" onClick={()=>addTag(imageInput, setImages, images, setImageInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {images.length>0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {images.map((a)=> (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>setImages(images.filter(x=>x!==a))} className="text-gray-500 hover:text-gray-700">×</button></span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Videos (URLs)</label>
                  <div className="flex gap-2">
                    <input value={videoInput} onChange={(e)=>setVideoInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); addTag(videoInput, setVideos, videos, setVideoInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="https://..." />
                    <button type="button" onClick={()=>addTag(videoInput, setVideos, videos, setVideoInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
                  </div>
                  {videos.length>0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {videos.map((a)=> (
                        <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>setVideos(videos.filter(x=>x!==a))} className="text-gray-500 hover:text-gray-700">×</button></span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600">
                      <option>Active</option>
                      <option>Sold</option>
                      <option>Expired</option>
                      <option>Pending Approval</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={isFeatured} onChange={(e)=>setIsFeatured(e.target.checked)} />
                      Featured
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Broker Id (required)</label>
                    <input value={brokerId} onChange={(e)=>setBrokerId(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Mongo ObjectId" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Internal notes" />
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
