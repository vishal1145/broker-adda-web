"use client";
import React, { useState } from "react";
import data from "../data/myaccount.json";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from '../components/Header';
import Features from "../components/Features";

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
    preferences: [],
    budgetMin: "",
    budgetMax: "",
    propertyType: [],
    savedSearches: [],
    inquiryCount: 0
  });
  const [activeTab, setActiveTab] = useState("Profile");
  const [newSavedSearch, setNewSavedSearch] = useState({ type: "", budgetMax: "" });
  const regionOptions = [
    "North India",
    "South India",
    "East India",
    "West India",
    "Central India",
    "Northeast India",
    "Delhi-NCR",
    "Mumbai Metropolitan Region",
    "Bengaluru",
    "Hyderabad",
    "Pune",
    "Kolkata",
    "Chennai",
    "Ahmedabad"
  ];
  const propertyTypeOptions = ["apartment", "commercial", "plot", "villa", "residential"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionToggle = (region) => {
    setFormData(prev => {
      const isSelected = prev.regions.includes(region);
      return {
        ...prev,
        regions: isSelected
          ? prev.regions.filter(r => r !== region)
          : [...prev.regions, region]
      };
    });
  };

  const handlePreferenceChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: checked
        ? [...prev.preferences, value]
        : prev.preferences.filter(v => v !== value)
    }));
  };

  const handlePropertyTypeToggle = (type) => {
    setFormData(prev => {
      const exists = prev.propertyType.includes(type);
      return {
        ...prev,
        propertyType: exists
          ? prev.propertyType.filter(t => t !== type)
          : [...prev.propertyType, type]
      };
    });
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

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return (
          <div className="w-full lg:w-3/4 bg-white rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
            
            <form className="space-y-6 p-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              {/* Regions (multi-select with checkboxes) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Region
                </label>
                <div className="w-full border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-3">
                  <div className="space-y-2">
                    {regionOptions.map((r) => (
                      <label key={r} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          checked={formData.regions.includes(r)}
                          onChange={() => handleRegionToggle(r)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.regions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.regions.map(r => (
                      <span key={r} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{r}</span>
                    ))}
                  </div>
                )}
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

              {/* Property Type (multi-select) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Property Type</label>
                <div className="w-full border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-3">
                  <div className="space-y-2">
                    {propertyTypeOptions.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          checked={formData.propertyType.includes(type)}
                          onChange={() => handlePropertyTypeToggle(type)}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.propertyType.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.propertyType.map(t => (
                      <span key={t} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Preferences */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Property Preferences
                </label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[120px] max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {[
                      "2BHK", "3BHK", "4BHK", "Villa", "Apartment", "Independent House",
                      "Penthouse", "Studio", "Duplex", "Farmhouse", "Plot", "Commercial"
                    ].map((pref) => (
                      <label key={pref} className="flex items-center">
                        <input
                          type="checkbox"
                          value={pref}
                          checked={formData.preferences.includes(pref)}
                          onChange={handlePreferenceChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.preferences.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected preferences:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.preferences.map((pref) => (
                        <span key={pref} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div> */}

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
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-green-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        );

      case "Saved Properties":
        return (
          <div className="w-full lg:w-3/4 bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg overflow-hidden">
                <img src="/images/pexels-binyaminmellish-106399.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Luxury Villa</h3>
                  <p className="text-gray-600 text-sm">3BHK, 2000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹2.5 Cr</p>
                  <button className="mt-2 w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors">
                    Remove from Saved
                  </button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <img src="/images/istockphoto-1165384568-612x612.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Modern Apartment</h3>
                  <p className="text-gray-600 text-sm">2BHK, 1200 sq ft</p>
                  <p className="text-green-600 font-semibold">₹85 L</p>
                  <button className="mt-2 w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors">
                    Remove from Saved
                  </button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <img src="/images/realestate2.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Commercial Space</h3>
                  <p className="text-gray-600 text-sm">Office, 5000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹1.2 Cr</p>
                  <button className="mt-2 w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors">
                    Remove from Saved
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "Logout":
        return (
          <div className="w-full lg:w-3/4 bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Logout</h2>
            <div className="text-center">
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Confirm Logout
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full lg:w-3/4 bg-white rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
            
            <form className="space-y-6 p-6">
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

              {/* Property Type (multi-select) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Property Type</label>
                <div className="w-full border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-3">
                  <div className="space-y-2">
                    {propertyTypeOptions.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          checked={formData.propertyType.includes(type)}
                          onChange={() => handlePropertyTypeToggle(type)}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.propertyType.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.propertyType.map(t => (
                      <span key={t} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Property Preferences
                </label>
                <div className="border border-gray-300 rounded-lg p-3 min-h-[120px] max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {[
                      "2BHK", "3BHK", "4BHK", "Villa", "Apartment", "Independent House",
                      "Penthouse", "Studio", "Duplex", "Farmhouse", "Plot", "Commercial"
                    ].map((pref) => (
                      <label key={pref} className="flex items-center">
                        <input
                          type="checkbox"
                          value={pref}
                          checked={formData.preferences.includes(pref)}
                          onChange={handlePreferenceChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {formData.preferences.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected preferences:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.preferences.map((pref) => (
                        <span key={pref} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-green-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <>
      <HeaderFile data={data} />
      <div className="px-6 sm:px-12 lg:px-32 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-1/4 space-y-3">
              {[
                "Profile",
                "Saved Properties",
                "Logout"
              ].map((item, idx) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`w-full text-left px-5 py-3 rounded-lg border ${
                    activeTab === item
                      ? "bg-yellow-400 text-black font-medium"
                      : "bg-white hover:bg-gray-50 text-black"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Content Area */}
            {renderContent()}
          </div>
        </div>
      </div>
      <Features data={furnitureData.features}/>
    </>
  );
};

export default MyAccountCustomer;