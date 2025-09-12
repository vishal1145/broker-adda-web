"use client";
import React, { useState } from "react";
import data from "../data/myaccount.json";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from '../components/Header';
import Features from "../components/Features";

const MyAccount = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    firmName: "",
    regions: [],
    aadharFile: null,
    panFile: null,
    gstFile: null
  });
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [submitting, setSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [regionsList, setRegionsList] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionsError, setRegionsError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  React.useEffect(() => {
    const fetchRegions = async () => {
      setRegionsLoading(true);
      setRegionsError("");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/regions`, {
          headers: { 'Accept': 'application/json' }
        });
        const contentType = res.headers.get('content-type') || '';
        const raw = await res.text();
        if (!res.ok) {
          throw new Error(raw || `Failed to load regions (${res.status})`);
        }
        let parsed;
        if (contentType.includes('application/json')) {
          try { parsed = JSON.parse(raw); } catch { /* fallthrough */ }
        }
        if (!parsed) {
          throw new Error('Regions API returned non-JSON. Check NEXT_PUBLIC_API_URL value.');
        }
        const list = Array.isArray(parsed?.data?.regions) ? parsed.data.regions : (Array.isArray(parsed) ? parsed : []);
        setRegionsList(list);
      } catch (err) {
        setRegionsError(err?.message || 'Failed to load regions');
      } finally {
        setRegionsLoading(false);
      }
    };
    fetchRegions();
  }, []);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleRegionChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return { ...prev, regions: [...prev.regions, value] };
      } else {
        return { ...prev, regions: prev.regions.filter(region => region !== value) };
      }
    });
  };

  const handleRegionsSelectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, regions: selected }));
  };


  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="w-full lg:w-3/4 bg-white p-6 rounded-lg ">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Leads</h3>
                <p className="text-3xl font-bold text-green-600">24</p>
                <p className="text-sm text-gray-600">+12% from last month</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Properties Listed</h3>
                <p className="text-3xl font-bold text-blue-600">8</p>
                <p className="text-sm text-gray-600">3 new this week</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Visitors</h3>
                <p className="text-3xl font-bold text-yellow-600">156</p>
                <p className="text-sm text-gray-600">+8% from last week</p>
              </div>
            </div>
          </div>
        );

      case "Profile":
        return (
          <div className="w-full lg:w-3/4 bg-white rounded-lg ">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
            
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              setApiMessage("");
              setApiError("");
              if (!Array.isArray(formData.regions) || formData.regions.length === 0) {
                setApiError('Please select at least one region.');
                setSubmitting(false);
                return;
              }
              try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const payload = {
                  phone: formData.phone,
                  name: formData.name,
                  email: formData.email,
                  brokerDetails: {
                    firmName: formData.firmName || "",
                    region: formData.regions || [],
                    kycDocs: {
                      aadhar: "",
                      pan: "",
                      gst: ""
                    }
                  }
                };

              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/complete-profile`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify(payload)
                });
                if (!res.ok) {
                  const errText = await res.text();
                  throw new Error(errText || `Request failed with ${res.status}`);
                }
                await res.json().catch(() => null);
                setApiMessage('Profile updated successfully.');
              } catch (err) {
                setApiError(err?.message || 'Failed to update profile');
              } finally {
                setSubmitting(false);
              }
            }}>
              {/* Name & Email - two fields per row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Phone & Firm Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Firm Name
                  </label>
                  <input
                    type="text"
                    name="firmName"
                    value={formData.firmName}
                    onChange={handleChange}
                    placeholder="Enter your firm name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Region Multi-Select (dropdown) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Region <span className="text-green-500">*</span>
                </label>
                {regionsLoading ? (
                  <p className="text-sm text-gray-500">Loading regions...</p>
                ) : regionsError ? (
                  <p className="text-sm text-red-600">{regionsError}</p>
                ) : (
                  <select
                    multiple
                    value={formData.regions}
                    onChange={handleRegionsSelectChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[120px]"
                  >
                    {regionsList.map((region) => (
                      <option key={region._id} value={region._id}>{region.name}</option>
                    ))}
                  </select>
                )}
                {formData.regions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected regions:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.regions.map((id) => {
                        const r = regionsList.find(rr => rr._id === id);
                        return (
                          <span key={id} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {r ? r.name : id}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* File Uploads - All in one row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Aadhar File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Aadhar Card <span className="text-green-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      name="aadharFile"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="aadhar-upload"
                    />
                    <label htmlFor="aadhar-upload" className="cursor-pointer">
                      <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {formData.aadharFile ? formData.aadharFile.name : "Click to upload Aadhar Card"}
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* PAN File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    PAN Card <span className="text-green-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      name="panFile"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="pan-upload"
                    />
                    <label htmlFor="pan-upload" className="cursor-pointer">
                      <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {formData.panFile ? formData.panFile.name : "Click to upload PAN Card"}
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* GST File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    GST Certificate <span className="text-green-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      name="gstFile"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="gst-upload"
                    />
                    <label htmlFor="gst-upload" className="cursor-pointer">
                      <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {formData.gstFile ? formData.gstFile.name : "Click to upload GST Certificate"}
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Profile'}
                </button>
                {apiMessage && (
                  <p className="mt-3 text-sm text-green-700">{apiMessage}</p>
                )}
                {apiError && (
                  <p className="mt-3 text-sm text-red-600">{apiError}</p>
                )}
              </div>
            </form>
          </div>
        );

      case "Leads / Visitors":
        return (
          <div className="w-full lg:w-3/4 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Leads / Visitors</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">John Smith</h4>
                    <p className="text-gray-600 text-sm">Interested in 2BHK Apartment</p>
                    <p className="text-gray-500 text-xs">2 hours ago</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">New Lead</span>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Sarah Johnson</h4>
                    <p className="text-gray-600 text-sm">Viewed Villa Property</p>
                    <p className="text-gray-500 text-xs">1 day ago</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Contacted</span>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">Mike Wilson</h4>
                    <p className="text-gray-600 text-sm">Interested in Commercial Space</p>
                    <p className="text-gray-500 text-xs">3 days ago</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Follow Up</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "Properties / Sites":
        return (
          <div className="w-full lg:w-3/4 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Properties / Sites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg overflow-hidden">
                <img src="/images/pexels-binyaminmellish-106399.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Luxury Villa</h3>
                  <p className="text-gray-600 text-sm">3BHK, 2000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹2.5 Cr</p>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <img src="/images/istockphoto-1165384568-612x612.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Modern Apartment</h3>
                  <p className="text-gray-600 text-sm">2BHK, 1200 sq ft</p>
                  <p className="text-green-600 font-semibold">₹85 L</p>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <img src="/images/realestate2.jpg" alt="Property" className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Commercial Space</h3>
                  <p className="text-gray-600 text-sm">Office, 5000 sq ft</p>
                  <p className="text-green-600 font-semibold">₹1.2 Cr</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "Logout":
        return (
          <div className="w-full lg:w-3/4 bg-white p-6 rounded-lg shadow-sm">
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
          <div className="w-full lg:w-3/4 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col items-left gap-4 mb-6">
              <div className="relative w-24 h-24">
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-24 h-24 object-cover rounded-full border"
                />
                <button className="absolute bottom-0 right-0 bg-green-800 w-7 h-7 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Basic Details - replace fields per reference image */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Company Name <span className="text-green-500">*</span></label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleChange}
                  placeholder="Enter Company Name"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Company Type <span className="text-green-500">*</span></label>
                <div className="relative">
                  <select
                    name="companyType"
                    value={formData.companyType || ""}
                    onChange={handleChange}
                    className="appearance-none mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Type</option>
                    <option value="LLC">LLC</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Proprietorship">Proprietorship</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 top-2 right-3 flex items-center">
                    <svg
                      className="w-6 h-6 text-gray-900"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12a.75.75 0 01-.53-.22l-4-4a.75.75 0 011.06-1.06L10 10.19l3.47-3.47a.75.75 0 111.06 1.06l-4 4A.75.75 0 0110 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Owner/Director Name <span className="text-green-500">*</span></label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName || ""}
                  onChange={handleChange}
                  placeholder="Enter Contact Person Name"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Mobile Number <span className="text-green-500">*</span></label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile || ""}
                  onChange={handleChange}
                  placeholder="Enter Mobile Number"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Email Address <span className="text-green-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email Address"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">RERA Registration Number <span className="text-green-500">*</span></label>
                <input
                  type="text"
                  name="rera"
                  value={formData.rera || ""}
                  onChange={handleChange}
                  placeholder="Enter RERA Number"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900">Office Address <span className="text-green-500">*</span></label>
                <input
                  type="text"
                  name="officeAddress"
                  value={formData.officeAddress || ""}
                  onChange={handleChange}
                  placeholder="Enter Address"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <button className="mt-6 px-6 py-2 bg-green-800 text-white rounded-full hover:bg-green-700 transition-colors">
              Save Broker
            </button>
          </div>
        );
    }
  };

  return (
    <>
      <HeaderFile data={data} />
<div className="px-6 sm:px-12 lg:px-32 py-12">
    <div className="max-w-7xl mx-auto  ">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 space-y-3">
          {[
            "Dashboard",
            "Profile",
            "Leads / Visitors",
            "Properties / Sites",
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

export default MyAccount;
