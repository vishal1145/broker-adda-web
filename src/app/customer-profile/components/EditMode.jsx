'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import toast from 'react-hot-toast';

const toPublicUrl = (raw) => {
  if (!raw || typeof raw !== 'string') return raw;
  if (raw.startsWith('/opt/lampp/htdocs/')) {
    const filename = raw.split('/').pop();
    return `https://broker-adda-be.algofolks.com/uploads/${filename}`;
  }
  if (raw.startsWith('/uploads/')) {
    return `https://broker-adda-be.algofolks.com${raw}`;
  }
  return raw;
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

export default function EditModeCustomerProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    budgetMin: "",
    budgetMax: "",
    propertyType: [],
    customerImage: null,
    gender: "",
    dateOfBirth: "",
  });
  const [emailError, setEmailError] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  const propertyTypeOptions = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "plot", label: "Plot" },
    { value: "other", label: "Other " },
  ];

  // Load existing customer data - same as profile page
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        if (!user?.token) {
          setLoading(false);
          return;
        }

        const customerId = user.userId;
        if (!customerId) {
          toast.error('Customer ID not found in token');
          setLoading(false);
          return;
        }

        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${base}/customers/${customerId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            Accept: 'application/json',
          }
        });

        if (res.ok) {
          const body = await res.json();
          const customerData = body?.data?.customer || body?.data || body;
          
          // Extract and normalize customer image URL - same as profile page
          const customerImage = toPublicUrl(
            customerData.images?.customerImage ||
            customerData.files?.customerImage ||
            customerData.customerImage ||
            null
          );

          // Extract preferences from the actual API response structure - same as profile page
          const preferences = customerData.preferences || {};
          const budgetMin = preferences.budgetMin || "";
          const budgetMax = preferences.budgetMax || "";
          const propertyType = preferences.propertyType || [];

          // Extract customer gender field - same as profile page
          const gender = customerData.gender || formData.gender || "";
          const dateOfBirth = customerData.dateOfBirth || customerData.dob || formData.dateOfBirth || "";

          setFormData((prev) => ({
            ...prev,
            name: customerData.name || prev.name,
            email: customerData.email || prev.email,
            phone: customerData.phone || prev.phone,
            budgetMin: budgetMin,
            budgetMax: budgetMax,
            propertyType: propertyType,
            inquiryCount: customerData.inquiryCount || prev.inquiryCount,
            customerImage: customerImage,
            gender: gender,
            dateOfBirth: dateOfBirth,
          }));
        }
      } catch (error) {
        console.error('Error loading customer data:', error);
        toast.error('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      loadCustomerData();
    }
  }, [user?.userId, user?.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'email') {
      setEmailError("");
    }
    if (name === 'budgetMin' || name === 'budgetMax') {
      setBudgetError("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, customerImage: file }));
    }
  };

  const handlePropertyTypeChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setFormData(prev => ({ ...prev, propertyType: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (formData.budgetMin && formData.budgetMax) {
      const min = parseFloat(formData.budgetMin);
      const max = parseFloat(formData.budgetMax);
      if (min >= max) {
        setBudgetError('Maximum budget must be greater than minimum budget');
        toast.error('Maximum budget must be greater than minimum budget');
        return;
      }
    }

    try {
      if (!user?.token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      setSubmitting(true);
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Prepare form data - same structure as profile page
      const formDataToSend = new FormData();
      formDataToSend.append('phone', formData.phone || '');
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      
      // Customer details structure
      formDataToSend.append(
        'customerDetails[preferences][budgetMin]',
        formData.budgetMin ? Number(formData.budgetMin) : ''
      );
      formDataToSend.append(
        'customerDetails[preferences][budgetMax]',
        formData.budgetMax ? Number(formData.budgetMax) : ''
      );

      // Add property types
      formData.propertyType.forEach((type, index) => {
        formDataToSend.append(
          `customerDetails[preferences][propertyType][${index}]`,
          type
        );
      });

      // Add customer gender
      formDataToSend.append(
        'customerDetails[gender]',
        formData.gender || ''
      );

      // Add date of birth
      if (formData.dateOfBirth) {
        formDataToSend.append(
          'customerDetails[dateOfBirth]',
          formData.dateOfBirth
        );
      }

      formDataToSend.append(
        'customerDetails[inquiryCount]',
        formData.inquiryCount || 0
      );

      // Add customer image
      if (formData.customerImage) {
        // Check if it's a File object or a string URL
        if (formData.customerImage instanceof File) {
          formDataToSend.append('customerImage', formData.customerImage);
        } else if (typeof formData.customerImage === 'string') {
          // If it's a URL string, skip as it's already uploaded
        }
      }

      const res = await fetch(`${base}/auth/complete-profile`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: formDataToSend
      });

      if (!res.ok) {
        let errorMessage = 'Failed to update profile';
        try {
          const errorData = await res.json();
          // Handle specific error types - same as profile page
          if (errorData.error && errorData.error.includes('E11000')) {
            // Duplicate key error (email already exists)
            errorMessage = 'This email address is already registered. Please use a different email.';
          } else if (errorData.error && errorData.error.includes('validation')) {
            errorMessage = errorData.message || 'Validation error. Please check your input.';
          } else {
            errorMessage = errorData.message || errorData.error || 'Failed to update profile';
          }
        } catch {
          // If error response is not JSON, use default message
        }
        toast.error(errorMessage);
        return;
      }

      const result = await res.json();
      toast.success('Profile updated successfully!');
      
      // Redirect to view mode after successful update
      setTimeout(() => {
        router.push('/customer-profile?mode=view');
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const imageSrc = getImageSrc(formData.customerImage);
  const selectedPropertyTypes = propertyTypeOptions.filter(opt => 
    formData.propertyType.includes(opt.value)
  );

  return (
    <div className="w-full mx-auto ">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[18px] font-semibold text-gray-900 mb-4">Profile Picture</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                {imageSrc ? (
                  <img src={imageSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <input
                type="file"
                name="customerImage"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png"
                className="hidden"
                id="customer-image-upload"
              />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 bg-[#0D542B] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#0B4624] transition-all shadow-lg"
                onClick={() => document.getElementById('customer-image-upload').click()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 9C21 8.73478 20.8946 8.48051 20.707 8.29297C20.5429 8.12883 20.3276 8.02757 20.0986 8.00488L20 8H17C16.7033 8 16.4214 7.86856 16.2314 7.64062L14.0312 5H9.96875L7.76855 7.64062C7.57856 7.86856 7.29674 8 7 8H4C3.73478 8 3.48051 8.10543 3.29297 8.29297C3.10543 8.48051 3 8.73478 3 9V18C3 18.2652 3.10543 18.5195 3.29297 18.707C3.48051 18.8946 3.73478 19 4 19H20C20.2652 19 20.5195 18.8946 20.707 18.707C20.8946 18.5195 21 18.2652 21 18V9Z" fill="white"/>
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-gray-600">Upload a profile picture to personalize your account</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[18px] font-semibold text-gray-900 mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full px-3 py-2 border rounded-lg text-[12px] focus:outline-none focus:ring-2 ${
                  emailError
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-100 focus:border-green-600'
                }`}
                required
              />
              {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-[12px] text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Gender
              </label>
              <div className="flex gap-6">
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      formData.gender === 'male'
                        ? 'bg-[#0D542B] text-white'
                        : 'bg-white text-gray-600 border border-gray-300'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="2" />
                      <path d="M9 9h6" />
                      <path d="M9 9l-3 6h12l-3-6z" />
                      <path d="M8 22v-6M16 22v-6" />
                    </svg>
                  </button>
                  <span className="text-[12px] font-medium text-gray-900">Male</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      formData.gender === 'female'
                        ? 'bg-[#0D542B] text-white'
                        : 'bg-white text-gray-500 border border-gray-300'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="2" />
                      <path d="M9 9h6" />
                      <path d="M7 22V12a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v10" />
                      <path d="M10 22v-7M14 22v-7" />
                    </svg>
                  </button>
                  <span className="text-[12px] font-medium text-gray-900">Female</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[18px] font-semibold text-gray-900 mb-6">Property Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Minimum Budget (₹)
              </label>
              <input
                type="number"
                name="budgetMin"
                value={formData.budgetMin}
                onChange={handleChange}
                placeholder="Enter minimum budget"
                className={`w-full px-3 py-2 border rounded-lg text-[12px] focus:outline-none focus:ring-2 ${
                  budgetError
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-100 focus:border-green-600'
                }`}
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Maximum Budget (₹)
              </label>
              <input
                type="number"
                name="budgetMax"
                value={formData.budgetMax}
                onChange={handleChange}
                placeholder="Enter maximum budget"
                className={`w-full px-3 py-2 border rounded-lg text-[12px] focus:outline-none focus:ring-2 ${
                  budgetError
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-100 focus:border-green-600'
                }`}
              />
              {budgetError && <p className="mt-1 text-xs text-red-600">{budgetError}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Preferred Property Types
              </label>
              <Select
                isMulti
                options={propertyTypeOptions}
                value={selectedPropertyTypes}
                onChange={handlePropertyTypeChange}
                placeholder="Select property types..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    border: state.isFocused ? '1px solid #0D542B' : '1px solid #DEE1E6',
                    boxShadow: state.isFocused ? '0 0 0 3px rgba(13, 84, 43, 0.1)' : 'none',
                  }),
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/customer-profile?mode=view')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-[#0D542B] text-white rounded-lg text-[14px] font-medium hover:bg-[#0B4624] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

