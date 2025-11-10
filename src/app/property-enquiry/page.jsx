'use client';

export const metadata = {
  title: 'Property Enquiry | Submit Your Property Requirements | Broker Gully',
  description: 'Submit your property enquiry with detailed requirements. Get matched with verified brokers and find your perfect property on Broker Gully.',
};

import React, { useState, useEffect } from 'react';
import HeaderFile from '../components/Header';
import toast, { Toaster } from 'react-hot-toast';

const PropertyEnquiryPage = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phoneNumber: '',
    requirement: 'buy',
    propertyType: 'residential',
    primaryRegion: '',
    optionalRegion: '',
    minBudget: '',
    maxBudget: '',
    specificRequirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequirementChange = (value) => {
    setFormData((prev) => ({ ...prev, requirement: value }));
  };

  const handlePropertyTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, propertyType: value }));
  };

  // Get current user ID from token
  const getCurrentUserIdFromToken = (token) => {
    try {
      if (!token || typeof window === 'undefined') return '';
      const base64Url = token.split('.')[1];
      if (!base64Url) return '';
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.userId || payload.id || payload.sub || '';
    } catch {
      return '';
    }
  };

  // Get broker ID from user ID
  const getBrokerIdFromUserId = async (userId, token, apiUrl) => {
    try {
      // First check localStorage for brokerId
      if (typeof window !== 'undefined') {
        const storedBrokerId = localStorage.getItem('brokerId');
        if (storedBrokerId) return storedBrokerId;
      }

      // If userId exists, fetch broker details
      if (userId) {
        const res = await fetch(`${apiUrl}/brokers/${userId}`, {
          headers: { 
            'Content-Type': 'application/json', 
            ...(token ? { Authorization: `Bearer ${token}` } : {}) 
          },
        });
        if (res.ok) {
          const bj = await res.json().catch(() => ({}));
          const b = bj?.data?.broker || bj?.broker || bj?.data || bj;
          const brokerId = b?._id || '';
          // Store in localStorage for future use
          if (typeof window !== 'undefined' && brokerId) {
            localStorage.setItem('brokerId', brokerId);
          }
          return brokerId;
        }
      }
      return '';
    } catch {
      return '';
    }
  };

  // Get admin ID from API
  const getAdminIdFromAPI = async (apiUrl) => {
    try {
      // First check localStorage for adminId
      if (typeof window !== 'undefined') {
        const storedAdminId = localStorage.getItem('adminId');
        if (storedAdminId) return storedAdminId;
      }

      // Login as admin to get admin ID
      const loginResponse = await fetch(`${apiUrl}/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@brokeradda.com',
          password: 'admin123',
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Failed to login as admin');
      }

      const loginData = await loginResponse.json().catch(() => ({}));
      
      // Extract admin ID from response
      // Try different possible response structures
      let adminId = 
        loginData?.data?.admin?._id ||
        loginData?.data?.user?._id ||
        loginData?.data?._id ||
        loginData?.admin?._id ||
        loginData?.user?._id ||
        loginData?._id ||
        '';

      // If not found in response, try to extract from token
      if (!adminId && loginData?.token) {
        try {
          const base64Url = loginData.token.split('.')[1];
          if (base64Url) {
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonPayload);
            adminId = payload.userId || payload.id || payload.adminId || payload.sub || '';
          }
        } catch (error) {
          console.error('Error parsing token for admin ID:', error);
        }
      }

      // Store in localStorage for future use
      if (typeof window !== 'undefined' && adminId) {
        localStorage.setItem('adminId', adminId);
      }

      return adminId;
    } catch (error) {
      console.error('Error getting admin ID from API:', error);
      return '';
    }
  };

  // Fetch regions from API
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setRegionsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
        const response = await fetch(`${apiUrl}/regions`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch regions: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract regions data following app pattern
        let regionsData = [];
        if (data?.success && Array.isArray(data?.data?.regions)) {
          regionsData = data.data.regions;
        } else if (Array.isArray(data?.data)) {
          regionsData = data.data;
        } else if (Array.isArray(data?.regions)) {
          regionsData = data.regions;
        } else if (Array.isArray(data)) {
          regionsData = data;
        }

        setRegions(regionsData);
      } catch (error) {
        console.error('Error fetching regions:', error);
        toast.error('Failed to load regions. Please refresh the page.');
      } finally {
        setRegionsLoading(false);
      }
    };

    fetchRegions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
      
      // Get admin ID from API
      const adminId = await getAdminIdFromAPI(apiUrl);
      
      if (!adminId) {
        throw new Error('Failed to get admin ID. Please try again.');
      }
      
      // Capitalize requirement and propertyType
      const capitalizeFirst = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      // Calculate budget - use maxBudget or 0
      const calculateBudget = () => {
        const max = parseFloat(formData.maxBudget?.replace(/[^0-9.]/g, '')) || 0;
        return max;
      };

      // Prepare API payload
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.phoneNumber,
        customerEmail: formData.email,
        requirement: capitalizeFirst(formData.requirement),
        propertyType: capitalizeFirst(formData.propertyType),
        budget: calculateBudget(),
        primaryRegionId: formData.primaryRegion || undefined,
        ...(formData.optionalRegion ? { secondaryRegion: formData.optionalRegion } : {}),
        createdBy: adminId,
      };

      // Remove undefined fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const response = await fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to submit enquiry');
      }

      const data = await response.json();
      
      // Show success message - matching website pattern
      toast.success('Lead created successfully');
      
      // Reset form
      setFormData({
        customerName: '',
        email: '',
        phoneNumber: '',
        requirement: 'buy',
        propertyType: 'residential',
        primaryRegion: '',
        optionalRegion: '',
        maxBudget: '',
        specificRequirements: '',
      });
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      toast.error(error.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerData = {
    title: 'Property Enquiry',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Property Enquiry', href: '/property-enquiry' }
    ]
  };

  return (
    <>
      <HeaderFile data={headerData} />
      <div className="min-h-screen bg-white py-16">
        <div className="mx-auto  px-4 ">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Side - Property Enquiry Form (8 columns) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Property Enquiry
                </h2>
                <p className="text-sm text-gray-600">
                  Please fill out the form below with your property requirements.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D542B] focus:border-[#0D542B] transition-colors"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D542B] focus:border-[#0D542B] transition-colors"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D542B] focus:border-[#0D542B] transition-colors"
                    required
                  />
                </div>

                {/* Requirement and Property Type Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Requirement Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Requirement
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleRequirementChange('buy')}
                        className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                          formData.requirement === 'buy'
                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequirementChange('rent')}
                        className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                          formData.requirement === 'rent'
                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Rent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequirementChange('sell')}
                        className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                          formData.requirement === 'sell'
                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Sell
                      </button>
                    </div>
                  </div>

                  {/* Property Type Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Property Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handlePropertyTypeChange('residential')}
                        className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                          formData.propertyType === 'residential'
                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Residential
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePropertyTypeChange('commercial')}
                        className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                          formData.propertyType === 'commercial'
                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Commercial
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePropertyTypeChange('plot')}
                        className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                          formData.propertyType === 'plot'
                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Plot
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePropertyTypeChange('other')}
                        className={`px-3 py-2 rounded-full text-xs font-medium border transition-all ${
                          formData.propertyType === 'other'
                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Other
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Region and Optional Region Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Region */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="primaryRegion"
                      value={formData.primaryRegion}
                      onChange={handleChange}
                      disabled={regionsLoading}
                      className="w-full px-4 py-3 pr-10 border border-[#0D542B] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D542B] focus:border-[#0D542B] transition-colors appearance-none bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">{regionsLoading ? 'Loading regions...' : 'Select...'}</option>
                      {regions.map((region) => (
                        <option key={region._id || region.id} value={region._id || region.id}>
                          {region.name || region._id || region.id}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-[38px] flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Optional Region */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Optional Region
                    </label>
                    <select
                      name="optionalRegion"
                      value={formData.optionalRegion}
                      onChange={handleChange}
                      disabled={regionsLoading}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D542B] focus:border-[#0D542B] transition-colors appearance-none bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{regionsLoading ? 'Loading regions...' : 'Select...'}</option>
                      {regions.map((region) => (
                        <option key={region._id || region.id} value={region._id || region.id}>
                          {region.name || region._id || region.id}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-[38px] flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Budget
                  </label>
                  <input
                    type="text"
                    name="maxBudget"
                    value={formData.maxBudget}
                    onChange={handleChange}
                    placeholder="Max Budget (e.g., $500,000)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D542B] focus:border-[#0D542B] transition-colors"
                  />
                </div>

                {/* Specific Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Requirements
                  </label>
                  <textarea
                    name="specificRequirements"
                    rows="4"
                    value={formData.specificRequirements}
                    onChange={handleChange}
                    placeholder="Describe your ideal property, number of bedrooms, desired features, etc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D542B] focus:border-[#0D542B] transition-colors resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0D542B] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#0B4624] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Enquiry'
                  )}
                </button>
              </form>
            </div>

            {/* Right Sidebar - Benefits & Information (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Why Choose Us Card - Sticky Card */}
              <div className="sticky top-6 bg-yellow-50 rounded-2xl p-6 shadow-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-yellow-400 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-900">Why Choose Broker Gully?</h3>
                </div>
                <p className="text-xs text-gray-700 mb-5 leading-relaxed">
                  We connect you with verified real estate brokers. Get personalized recommendations and expert guidance tailored to your needs.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2 bg-white rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-[#0D542B]/10 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#0D542B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs mb-0.5 text-gray-900">Verified Brokers</h4>
                      <p className="text-[10px] text-gray-600 leading-relaxed">All brokers are verified and certified professionals</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2 bg-white rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-[#0D542B]/10 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#0D542B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs mb-0.5 text-gray-900">Best Matches</h4>
                      <p className="text-[10px] text-gray-600 leading-relaxed">AI-powered matching for your exact requirements</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2 bg-white rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-[#0D542B]/10 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#0D542B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs mb-0.5 text-gray-900">Quick Response</h4>
                      <p className="text-[10px] text-gray-600 leading-relaxed">Get responses from brokers within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2 bg-white rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 bg-[#0D542B]/10 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-[#0D542B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs mb-0.5 text-gray-900">No Hidden Fees</h4>
                      <p className="text-[10px] text-gray-600 leading-relaxed">Transparent pricing with no surprises</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works Card - Unique Design */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-50"></span>
                  <h3 className="text-lg font-bold text-gray-900">How It Works</h3>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-yellow-50 text-gray-900 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                        1
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h4 className="font-semibold text-xs text-gray-900 mb-1">Submit Your Enquiry</h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed">Fill out the form with your property requirements</p>
                      </div>
                    </div>
                    <div className="absolute left-[13px] top-7 w-0.5 h-4 bg-gray-200"></div>
                  </div>

                  <div className="relative">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-yellow-50 text-gray-900 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                        2
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h4 className="font-semibold text-xs text-gray-900 mb-1">Get Matched</h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed">We match you with verified brokers in your area</p>
                      </div>
                    </div>
                    <div className="absolute left-[13px] top-7 w-0.5 h-4 bg-gray-200"></div>
                  </div>

                  <div className="relative">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-yellow-50 text-gray-900 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                        3
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h4 className="font-semibold text-xs text-gray-900 mb-1">Connect & View</h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed">Connect with brokers and view matching properties</p>
                      </div>
                    </div>
                    <div className="absolute left-[13px] top-7 w-0.5 h-4 bg-gray-200"></div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 bg-yellow-50 text-gray-900 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                      4
                    </div>
                    <div className="flex-1 pt-0.5">
                      <h4 className="font-semibold text-xs text-gray-900 mb-1">Make a Decision</h4>
                      <p className="text-[11px] text-gray-600 leading-relaxed">Choose the best property and broker for your needs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Card - Compact Design */}
              <div className=" rounded-2xl border border-[#0D542B]/10 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-[#0D542B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="text-base font-semibold text-gray-900">Need Help?</h3>
                </div>
                <div className="space-y-2.5">
                  <a href="tel:+919876543210" className="flex items-center gap-2.5 p-2 bg-white rounded-lg hover:bg-[#EDFDF4] transition-colors group">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#0D542B]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0D542B] transition-colors">
                      <svg className="w-4 h-4 text-[#0D542B] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">Call Us</p>
                      <p className="text-[10px] text-gray-600">+91 98765 43210</p>
                    </div>
                  </a>

                  <a href="mailto:support@brokeradda.com" className="flex items-center gap-2.5 p-2 bg-white rounded-lg hover:bg-[#EDFDF4] transition-colors group">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#0D542B]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0D542B] transition-colors">
                      <svg className="w-4 h-4 text-[#0D542B] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">Email Us</p>
                      <p className="text-[10px] text-gray-600">support@brokeradda.com</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
};

export default PropertyEnquiryPage;
