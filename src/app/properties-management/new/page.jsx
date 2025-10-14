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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: You can wire this to your real API later
    alert("Property form submitted (demo page). Use dashboard list to view.");
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Property</h1>
          <Link href="/properties-management" className="text-sm text-green-700 hover:underline">Back to list</Link>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
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
              <input value={amenityInput} onChange={(e)=>setAmenityInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addAmenity(); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Type amenity and press Add or Enter" />
              <button type="button" onClick={addAmenity} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
            </div>
            {amenities.length>0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {amenities.map((a)=> (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{a}<button type="button" onClick={()=>removeFrom(a, setAmenities)} className="text-gray-500 hover:text-gray-700">×</button></span>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Amenities</label>
            <div className="flex gap-2">
              <input value={nearbyAmenityInput} onChange={(e)=>setNearbyAmenityInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Add nearby amenity" />
              <button type="button" onClick={()=>addTag(nearbyAmenityInput, setNearbyAmenities, nearbyAmenities, setNearbyAmenityInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
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
              <input value={featureInput} onChange={(e)=>setFeatureInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(featureInput, setFeatures, features, setFeatureInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Add feature" />
              <button type="button" onClick={()=>addTag(featureInput, setFeatures, features, setFeatureInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
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
              <input value={locationBenefitInput} onChange={(e)=>setLocationBenefitInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Add location benefit" />
              <button type="button" onClick={()=>addTag(locationBenefitInput, setLocationBenefits, locationBenefits, setLocationBenefitInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
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
              <input value={imageInput} onChange={(e)=>setImageInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(imageInput, setImages, images, setImageInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="https://..." />
              <button type="button" onClick={()=>addTag(imageInput, setImages, images, setImageInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
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
              <input value={videoInput} onChange={(e)=>setVideoInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(videoInput, setVideos, videos, setVideoInput); } }} className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="https://..." />
              <button type="button" onClick={()=>addTag(videoInput, setVideos, videos, setVideoInput)} className="px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Add</button>
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" placeholder="Internal notes" />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Link href="/properties-management" className="px-4 py-2 rounded-lg border text-gray-700">Cancel</Link>
            <button type="submit" className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Save</button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default NewPropertyPage;
