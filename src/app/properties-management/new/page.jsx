"use client";
import React, { useState } from "react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to create a property");
        return;
      }

      // Prepare form data for API
      const formData = new FormData();
      
      // Basic information
      formData.append('title', form.title);
      formData.append('description', form.description || '');
      formData.append('propertyDescription', form.propertyDescription || '');
      formData.append('propertySize', form.propertySize || '');
      formData.append('propertyType', form.propertyType);
      formData.append('subType', form.subType);
      formData.append('price', form.price);
      formData.append('priceUnit', form.priceUnit);
      formData.append('address', form.address || '');
      formData.append('city', form.city);
      formData.append('region', form.region);
      
      // Coordinates
      if (coordinates.lat) formData.append('coordinates[lat]', coordinates.lat);
      if (coordinates.lng) formData.append('coordinates[lng]', coordinates.lng);
      
      // Property details
      formData.append('bedrooms', bedrooms || '0');
      formData.append('bathrooms', bathrooms || '0');
      formData.append('furnishing', furnishing);
      
      // Arrays
      amenities.forEach(amenity => formData.append('amenities[]', amenity));
      nearbyAmenities.forEach(amenity => formData.append('nearbyAmenities[]', amenity));
      features.forEach(feature => formData.append('features[]', feature));
      locationBenefits.forEach(benefit => formData.append('locationBenefits[]', benefit));
      videos.forEach(video => formData.append('videos[]', video));
      
      // Other fields
      formData.append('status', status);
      formData.append('isFeatured', isFeatured.toString());
      formData.append('notes', notes || '');
      
      // Get broker ID from token or use default
      const brokerId = '68c7aa725eb872ca1499e8cc'; // You might want to get this from user context
      formData.append('broker', brokerId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api'}/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create property');
      }

      const result = await response.json();
      setSuccessMessage("Property created successfully!");
      
      setTimeout(() => {
        setSuccessMessage("");
        // Reset form
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
        setVideos([]);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-yellow-500 px-8 py-6">
              <h2 className="text-xl font-semibold text-green-900">Property Information</h2>
              <p className="text-green-900 text-sm mt-1">Fill in the basic details of your property</p>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Title *</label>
                    <input 
                      name="title" 
                      value={form.title} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      placeholder="Enter property title" 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Region *</label>
                    <input 
                      name="region" 
                      value={form.region} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      placeholder="City, State" 
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Short Description</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    rows={3} 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none" 
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
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none" 
                    placeholder="Comprehensive description with all details"
                  />
                </div>
              </div>
              {/* Location & Pricing Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Location & Pricing</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input 
                      name="address" 
                      value={form.address} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      placeholder="Street address" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input 
                      name="city" 
                      value={form.city} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      placeholder="City" 
                    />
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
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      placeholder="e.g. 42000000" 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select 
                      name="priceUnit" 
                      value={form.priceUnit} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option>INR</option>
                      <option>USD</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Property Details Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Size (sqft)</label>
                    <input 
                      type="number" 
                      name="propertySize" 
                      value={form.propertySize} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      placeholder="e.g. 1200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                    <input 
                      type="number" 
                      value={bedrooms} 
                      onChange={(e)=>setBedrooms(e.target.value)} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      placeholder="e.g. 3"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                    <input 
                      type="number" 
                      value={bathrooms} 
                      onChange={(e)=>setBathrooms(e.target.value)} 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
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
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option>Furnished</option>
                      <option>Semi-Furnished</option>
                      <option>Unfurnished</option>
                    </select>
                  </div>
                </div>
              </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="number" step="any" value={coordinates.lat} onChange={(e)=>setCoordinates({ ...coordinates, lat: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="number" step="any" value={coordinates.lng} onChange={(e)=>setCoordinates({ ...coordinates, lng: e.target.value })} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" />
            </div>
          </div>
              {/* Amenities Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Amenities & Features</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Property Amenities</label>
                    <div className="flex gap-3">
                      <input 
                        value={amenityInput} 
                        onChange={(e)=>setAmenityInput(e.target.value)} 
                        onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addAmenity(); } }} 
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Amenities</label>
            <div className="flex gap-2">
              <input value={nearbyAmenityInput} onChange={(e)=>setNearbyAmenityInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput); } }} className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Add nearby amenity" />
              <button type="button" onClick={()=>addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput)} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium">Add</button>
            </div>
            {nearbyAmenities.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {nearbyAmenities.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>removeFrom(a, setNearbyAmenities)} className="text-gray-500 hover:text-gray-700">×</button></span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
            <div className="flex gap-2">
              <input value={featureInput} onChange={(e)=>setFeatureInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(featureInput, setFeatures, features, setFeatureInput); } }} className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Add feature" />
              <button type="button" onClick={()=>addTag(featureInput, setFeatures, features, setFeatureInput)} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium">Add</button>
            </div>
            {features.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {features.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>removeFrom(a, setFeatures)} className="text-gray-500 hover:text-gray-700">×</button></span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Benefits</label>
            <div className="flex gap-2">
              <input value={locationBenefitInput} onChange={(e)=>setLocationBenefitInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput); } }} className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="Add location benefit" />
              <button type="button" onClick={()=>addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput)} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium">Add</button>
            </div>
            {locationBenefits.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {locationBenefits.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>removeFrom(a, setLocationBenefits)} className="text-gray-500 hover:text-gray-700">×</button></span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Images (URLs)</label>
            <div className="flex gap-2">
              <input value={imageInput} onChange={(e)=>setImageInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(imageInput, setImages, images, setImageInput); } }} className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="https://..." />
              <button type="button" onClick={()=>addTag(imageInput, setImages, images, setImageInput)} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium">Add</button>
            </div>
            {images.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>removeFrom(a, setImages)} className="text-gray-500 hover:text-gray-700">×</button></span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Videos (URLs)</label>
            <div className="flex gap-2">
              <input value={videoInput} onChange={(e)=>setVideoInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(videoInput, setVideos, videos, setVideoInput); } }} className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" placeholder="https://..." />
              <button type="button" onClick={()=>addTag(videoInput, setVideos, videos, setVideoInput)} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium">Add</button>
            </div>
            {videos.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {videos.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>removeFrom(a, setVideos)} className="text-gray-500 hover:text-gray-700">×</button></span>
                ))}
              </div>
            )}
          </div>
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
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={isFeatured} onChange={(e)=>setIsFeatured(e.target.checked)} />
                Featured
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none" placeholder="Internal notes" />
          </div>
              {/* Submit Section */}
              <div className="pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Link 
                    href="/properties-management" 
                    className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 text-center"
                  >
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-8 py-3 rounded-xl bg-green-900 text-white font-medium hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating Property...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Property
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NewPropertyPage;
