"use client";
import React, { useState } from "react";
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
  const [items, setItems] = useState(initialProperties);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newItem = {
      id: `local-${Date.now()}`,
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
      broker: brokerId || undefined,
      rating: "4.7",
      currentPrice: "-",
      // keep for card display
      images: images.length ? images : [DEFAULT_IMAGE]
    };
    setItems(prev => [newItem, ...prev]);
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
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((property) => (
            <div key={property.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <div className="relative p-3">
                <div className="relative h-56 overflow-hidden rounded-xl">
                  <img src={(property.images && property.images[0]) || DEFAULT_IMAGE} alt={property.title} className="block w-full h-full object-cover" />
                </div>

                <div className="absolute top-6 left-6">
                  <span className="bg-[#0A421E] text-white px-3 py-1 rounded-full text-xs font-medium">
                    {property.propertyType}
                  </span>
                </div>
                <div className="absolute top-6 right-6 flex items-center bg-white/90 backdrop-blur rounded-full px-2 py-1 shadow-sm">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">{property.rating}</span>
                </div>

                <div className="mt-4 px-1 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{property.title}</h3>
                    <Link href={`/property-details/${property.id}`} className="text-gray-400 hover:text-gray-600" aria-label="Open details">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h4m0 0v4m0-4L10 14" />
                      </svg>
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{property.region}</span>
                    </div>
                  </div>

                  {Array.isArray(property.amenities) && property.amenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {property.amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}</span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="text-xs text-gray-500">+{property.amenities.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

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
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border text-gray-700">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
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
