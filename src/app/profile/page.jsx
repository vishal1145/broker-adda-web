"use client";
import React, { useState, useEffect } from "react";
import Select from 'react-select';
import toast, { Toaster } from "react-hot-toast";
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'broker';
  
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
    brokerImage: null
  });

  // Customer form data
  const [customerFormData, setCustomerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    budgetMin: "",
    budgetMax: "",
    propertyType: [],
    regions: [],
    inquiryCount: 0,
    customerImage: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [regionsList, setRegionsList] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionsError, setRegionsError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [propertyTypeOptions] = useState(["apartment", "commercial", "plot", "villa", "house"]);
  

  // Pre-fill phone number from user data
  useEffect(() => {
    if (user?.phone) {
      if (user.role === 'customer') {
        setCustomerFormData(prev => ({ ...prev, phone: user.phone }));
            } else {
        setBrokerFormData(prev => ({ ...prev, phone: user.phone }));
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

        const currentUserRole = user.role || 'broker';

        let response;
        if (currentUserRole === 'customer') {
          // Get customer ID from user context
          const customerId = user.userId;

          if (customerId) {
            response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${customerId}`, {
              headers: {
                'Authorization': `Bearer ${user.token}`,
                'Accept': 'application/json'
              }
            });
          } else {
            toast.error('Customer ID not found in token');
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
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
          } else {
            toast.error('Broker ID not found in token');
            setProfileLoading(false);
            return;
          }
        }

        
        if (response.ok) {
          let data = await response.json();
          
          if (currentUserRole === 'customer') {
            // Update customer form data from customer by ID API response
            const customerData = data.data?.customer || data.data || data;
            console.log('📊 Customer API response data:', customerData);
            
            // Extract customer image from the actual API response structure
            const customerImage = customerData.images?.customerImage || 
                                customerData.files?.customerImage || 
                                customerData.customerImage || 
                                null;
            console.log('🖼️ Customer image from API:', customerImage);
            
            // Extract preferences from the actual API response structure
            const preferences = customerData.preferences || {};
            const budgetMin = preferences.budgetMin || '';
            const budgetMax = preferences.budgetMax || '';
            const propertyType = preferences.propertyType || [];
            const regions = preferences.region || [];
            
            console.log('💰 Budget preferences:', { budgetMin, budgetMax });
            console.log('🏠 Property types:', propertyType);
            console.log('📍 Regions:', regions);
            
            setCustomerFormData(prev => ({
              ...prev,
              name: customerData.name || prev.name,
              email: customerData.email || prev.email,
              phone: customerData.phone || prev.phone,
              budgetMin: budgetMin,
              budgetMax: budgetMax,
              propertyType: propertyType,
              regions: regions,
              inquiryCount: customerData.inquiryCount || prev.inquiryCount,
              customerImage: customerImage
            }));
            
            console.log('✅ Customer form data updated successfully');
          } else {
            // Broker data binding - improved handling
            console.log('Processing broker data...');
            
            // Handle different API response structures for broker data
            let brokerData;
            if (data.data) {
              // If response has nested data structure
              brokerData = data.data.broker || data.data;
                } else {
              // If response is direct broker data
              brokerData = data;
            }
            
            console.log('Broker data structure:', brokerData);
            console.log('Full broker response:', data);
            
            // Extract broker information with better error handling
            const extractBrokerField = (fieldName, fallbackValue = '') => {
              const possiblePaths = [
                brokerData[fieldName],
                brokerData.user?.[fieldName],
                brokerData.brokerDetails?.[fieldName],
                brokerData.brokerDetail?.[fieldName],
                brokerData.personalInfo?.[fieldName],
                brokerData.businessInfo?.[fieldName]
              ];
              
              const value = possiblePaths.find(val => val !== undefined && val !== null && val !== '');
              return value || fallbackValue;
            };
            
            // Handle regions based on actual API response structure
            let regions = [];
            if (brokerData.region && Array.isArray(brokerData.region)) {
              regions = brokerData.region;
              console.log('Found regions from brokerData.region:', regions);
            } else if (brokerData.regions && Array.isArray(brokerData.regions)) {
              regions = brokerData.regions;
              console.log('Found regions from brokerData.regions:', regions);
            }
            
            console.log('Final regions array:', regions);
            
            // Extract broker fields based on actual API response structure
            const name = brokerData.name || brokerData.userId?.name || brokerFormData.name;
            const email = brokerData.email || brokerData.userId?.email || brokerFormData.email;
            const phone = brokerData.phone || brokerData.userId?.phone || brokerFormData.phone;
            const firmName = brokerData.firmName || brokerFormData.firmName;
            
            // Handle KYC documents from the actual API response structure
            const kycDocs = brokerData.kycDocs || {};
            const aadharFile = kycDocs.aadhar || null;
            const panFile = kycDocs.pan || null;
            const gstFile = kycDocs.gst || null;
            const brokerImage = brokerData.brokerImage || null;
            
            console.log('📄 KYC documents:', { aadharFile, panFile, gstFile, brokerImage });
            console.log('👤 Parsed broker data:', { name, email, phone, firmName, regions });
            console.log('🏢 Firm name from API:', brokerData.firmName);
            console.log('📱 Phone from API:', brokerData.phone);
            console.log('📧 Email from API:', brokerData.email);
            console.log('👨‍💼 Name from API:', brokerData.name);
            
            // Update broker form data with extracted values
            setBrokerFormData(prev => ({
              ...prev,
              name: name,
              email: email,
              phone: phone,
              firmName: firmName,
              regions: regions,
              aadharFile: aadharFile,
              panFile: panFile,
              gstFile: gstFile,
              brokerImage: brokerImage
            }));
            
            console.log('Successfully bound broker data to form');
          }
          
          toast.success(`${currentUserRole === 'customer' ? 'Customer' : 'Broker'} profile data loaded successfully!`);
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Failed to load profile data:', errorData);
          
          if (response.status === 401) {
            toast.error('Authentication failed. Please login again.');
          } else if (response.status === 404) {
            toast.error(`${currentUserRole === 'customer' ? 'Customer' : 'Broker'} profile not found.`);
          } else if (response.status >= 500) {
            toast.error('Server error. Please try again later.');
          } else {
            toast.error(errorData.message || `Failed to load ${currentUserRole} profile data`);
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error(`Error loading ${currentUserRole} profile data: ${error.message}`);
        }
      } finally {
        setProfileLoading(false);
      }
    };

    if (userRole && user?.token) {
      loadProfileData();
    }
  }, [userRole, user]);

  // Load regions on component mount
  useEffect(() => {
    const loadRegions = async () => {
      setRegionsLoading(true);
      setRegionsError("");
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/regions`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Regions API response:', data);
          
          // Handle different response structures
          let regions = [];
          if (Array.isArray(data)) {
            regions = data;
          } else if (data.data && data.data.regions && Array.isArray(data.data.regions)) {
            regions = data.data.regions;
          } else if (data.data && Array.isArray(data.data)) {
            regions = data.data;
          } else if (data.regions && Array.isArray(data.regions)) {
            regions = data.regions;
          }
          
          setRegionsList(regions);
          console.log('Regions loaded:', regions);
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Failed to load regions:', errorData);
          setRegionsError(errorData.message || 'Failed to load regions');
          
          // Set fallback regions if API fails
          const fallbackRegions = [
            { _id: '1', name: 'Bangalore' },
            { _id: '2', name: 'Mumbai' },
            { _id: '3', name: 'Delhi' },
            { _id: '4', name: 'Chennai' },
            { _id: '5', name: 'Hyderabad' },
            { _id: '6', name: 'Pune' },
            { _id: '7', name: 'Kolkata' },
            { _id: '8', name: 'Ahmedabad' }
          ];
          setRegionsList(fallbackRegions);
          console.log('Using fallback regions:', fallbackRegions);
          toast.error('Using fallback regions due to API error');
        }
      } catch (error) {
        console.error('Error loading regions:', error);
        setRegionsError('Error loading regions');
        
        // Set fallback regions if network error
        const fallbackRegions = [
          { _id: '1', name: 'Bangalore' },
          { _id: '2', name: 'Mumbai' },
          { _id: '3', name: 'Delhi' },
          { _id: '4', name: 'Chennai' },
          { _id: '5', name: 'Hyderabad' },
          { _id: '6', name: 'Pune' },
          { _id: '7', name: 'Kolkata' },
          { _id: '8', name: 'Ahmedabad' }
        ];
        setRegionsList(fallbackRegions);
        console.log('Using fallback regions due to network error:', fallbackRegions);
        toast.error('Using fallback regions due to network error');
      } finally {
        setRegionsLoading(false);
      }
    };

    loadRegions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (userRole === 'customer') {
      setCustomerFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setBrokerFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (userRole === 'customer') {
      setCustomerFormData((prev) => ({ ...prev, [name]: files[0] || null }));
    } else {
      setBrokerFormData((prev) => ({ ...prev, [name]: files[0] || null }));
    }
  };

  const handleRegionChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    if (userRole === 'customer') {
      setCustomerFormData((prev) => ({ ...prev, regions: selectedValues }));
    } else {
      setBrokerFormData((prev) => ({ ...prev, regions: selectedValues }));
    }
  };

  const handlePropertyTypeChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setCustomerFormData((prev) => ({ ...prev, propertyType: selectedValues }));
  };


  // Function to manually refresh broker data
  const refreshBrokerData = async () => {
    if (userRole !== 'broker') return;
    
    setProfileLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const brokerId = tokenPayload.brokerId || 
                      tokenPayload.brokerDetailId ||
                      tokenPayload.brokerDetailsId || 
                      tokenPayload.brokerDetails?.id ||
                      tokenPayload.brokerDetails?._id ||
                      tokenPayload.id;

      if (!brokerId) {
        toast.error('Broker ID not found in token');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brokers/${brokerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Refreshed broker data:', data);
        
        // Process and bind the refreshed data
        let brokerData = data.data?.broker || data.data || data;
        
        const extractBrokerField = (fieldName, fallbackValue = '') => {
          const possiblePaths = [
            brokerData[fieldName],
            brokerData.user?.[fieldName],
            brokerData.brokerDetails?.[fieldName],
            brokerData.brokerDetail?.[fieldName],
            brokerData.personalInfo?.[fieldName],
            brokerData.businessInfo?.[fieldName]
          ];
          
          const value = possiblePaths.find(val => val !== undefined && val !== null && val !== '');
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
        const name = brokerData.name || brokerData.userId?.name || brokerFormData.name;
        const email = brokerData.email || brokerData.userId?.email || brokerFormData.email;
        const phone = brokerData.phone || brokerData.userId?.phone || brokerFormData.phone;
        const firmName = brokerData.firmName || brokerFormData.firmName;

        // Handle KYC documents from the actual API response structure
        const kycDocs = brokerData.kycDocs || {};
        const aadharFile = kycDocs.aadhar || null;
        const panFile = kycDocs.pan || null;
        const gstFile = kycDocs.gst || null;
        const brokerImage = brokerData.brokerImage || null;

        // Update form data
        setBrokerFormData(prev => ({
      ...prev,
          name: name,
          email: email,
          phone: phone,
          firmName: firmName,
          regions: regions,
          aadharFile: aadharFile,
          panFile: panFile,
          gstFile: gstFile,
          brokerImage: brokerImage
        }));

        toast.success('Broker data refreshed successfully!');
      } else {
        toast.error('Failed to refresh broker data');
      }
    } catch (error) {
      console.error('Error refreshing broker data:', error);
      toast.error('Error refreshing broker data');
    } finally {
      setProfileLoading(false);
    }
  };


  return (
    <ProtectedRoute>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="px-6 sm:px-12 lg:px-32 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="w-full bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {userRole === 'customer' ? 'Customer Profile' : 'Broker Profile'}
            </h2>
            
            {/* Profile Image Upload */}
            <div className="mb-8">
              <div className="flex items-center gap-6">
                {/* Current Profile Image Display */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {(userRole === 'customer' ? customerFormData.customerImage : brokerFormData.brokerImage) ? (
                      <img
                        src={
                          typeof (userRole === 'customer' ? customerFormData.customerImage : brokerFormData.brokerImage) === 'string' 
                            ? (userRole === 'customer' ? customerFormData.customerImage : brokerFormData.brokerImage)
                            : URL.createObjectURL(userRole === 'customer' ? customerFormData.customerImage : brokerFormData.brokerImage)
                        }
                        alt={`${userRole} Profile`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/user-1.webp';
                        }}
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="file"
                    name={userRole === 'customer' ? 'customerImage' : 'brokerImage'}
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 bg-green-600 w-7 h-7 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                    onClick={() => document.getElementById('profile-image-upload').click()}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {profileLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading profile data...</p>
                </div>
              </div>
            ) : (
            
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              
              const currentFormData = userRole === 'customer' ? customerFormData : brokerFormData;
              
              // Debug: Log current form data before submission
              console.log('🔍 Current form data before submission:', {
                userRole,
                formData: currentFormData
              });
              
              if (!Array.isArray(currentFormData.regions) || currentFormData.regions.length === 0) {
                toast.error('Please select at least one region.');
                setSubmitting(false);
                return;
              }
              
              try {
                if (!user?.token) {
                  toast.error('No authentication token found. Please login again.');
                  setSubmitting(false);
                  return;
                }
                
                // Create FormData for multipart/form-data submission
                const formDataToSend = new FormData();
                formDataToSend.append('phone', currentFormData.phone);
                formDataToSend.append('name', currentFormData.name);
                formDataToSend.append('email', currentFormData.email);
                
                if (userRole === 'customer') {
                  // Customer-specific fields - matching the API structure
                  formDataToSend.append('customerDetails[preferences][budgetMin]', currentFormData.budgetMin ? Number(currentFormData.budgetMin) : '');
                  formDataToSend.append('customerDetails[preferences][budgetMax]', currentFormData.budgetMax ? Number(currentFormData.budgetMax) : '');
                  
                  // Add property types
                  currentFormData.propertyType.forEach((type, index) => {
                    formDataToSend.append(`customerDetails[preferences][propertyType][${index}]`, type);
                  });
                  
                  // Add regions
                  currentFormData.regions.forEach((region, index) => {
                    const regionId = typeof region === 'object' ? region._id : region;
                    formDataToSend.append(`customerDetails[preferences][region][${index}]`, regionId);
                  });
                  
                  
                  formDataToSend.append('customerDetails[inquiryCount]', currentFormData.inquiryCount || 0);
                  
                  // Add customer image
                  if (currentFormData.customerImage) {
                    // Check if it's a File object or a string URL
                    if (currentFormData.customerImage instanceof File) {
                    formDataToSend.append('customerImage', currentFormData.customerImage);
                      console.log('📷 Customer image file being sent:', currentFormData.customerImage.name);
                    } else if (typeof currentFormData.customerImage === 'string') {
                      // If it's a URL string, we might need to fetch it as a file
                      console.log('📷 Customer image URL found:', currentFormData.customerImage);
                      // For now, we'll skip URL strings as they're already uploaded
                    }
                  } else {
                    console.log('📷 No customer image to send');
                  }
                } else {
                  // Broker-specific fields
                  formDataToSend.append('brokerDetails[firmName]', currentFormData.firmName || "");
                  
                  // Add regions
                  currentFormData.regions.forEach((region, index) => {
                    const regionId = typeof region === 'object' ? region._id : region;
                    formDataToSend.append(`brokerDetails[region][${index}]`, regionId);
                  });
                  
                  // Add file uploads
                  if (currentFormData.aadharFile) {
                    formDataToSend.append('aadhar', currentFormData.aadharFile);
                  }
                  if (currentFormData.panFile) {
                    formDataToSend.append('pan', currentFormData.panFile);
                  }
                  if (currentFormData.gstFile) {
                    formDataToSend.append('gst', currentFormData.gstFile);
                  }
                  if (currentFormData.brokerImage) {
                    formDataToSend.append('brokerImage', currentFormData.brokerImage);
                  }
                }

                // Debug: Log all FormData entries
                console.log('📤 FormData entries being sent:');
                for (let [key, value] of formDataToSend.entries()) {
                  console.log(`${key}:`, value);
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/complete-profile`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${user.token}`
                  },
                  body: formDataToSend
                });
                
                if (!res.ok) {
                  const errText = await res.text();
                  throw new Error(errText || `Request failed with ${res.status}`);
                }
                
                const result = await res.json();
                toast.success('Profile updated successfully!');
                console.log('Profile updated:', result);
              } catch (err) {
                toast.error(err?.message || 'Failed to update profile');
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
                    value={userRole === 'customer' ? customerFormData.name : brokerFormData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm  focus:outline-none  focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userRole === 'customer' ? customerFormData.email : brokerFormData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm  focus:outline-none  focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Phone & Property Type Preferences for customers, Phone & Firm Name for brokers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Phone <span className="text-green-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={userRole === 'customer' ? customerFormData.phone : brokerFormData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm  focus:outline-none  focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                {userRole === 'broker' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Firm Name
                    </label>
                    <input
                      type="text"
                      name="firmName"
                      value={brokerFormData.firmName}
                      onChange={handleChange}
                      placeholder="Enter your firm name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm  focus:outline-none  focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Property Type Preferences
                    </label>
                    <Select
                      isMulti
                      name="propertyType"
                      options={propertyTypeOptions.map(type => ({
                        value: type,
                        label: type.charAt(0).toUpperCase() + type.slice(1)
                      }))}
                      value={Array.isArray(customerFormData.propertyType) ? customerFormData.propertyType.map(type => ({
                        value: type,
                        label: type.charAt(0).toUpperCase() + type.slice(1)
                      })) : []}
                      onChange={handlePropertyTypeChange}
                      placeholder="Select property types..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          minHeight: '48px',
                          border: state.isFocused ? '2px solid #10b981' : '1px solid #d1d5db',
                          boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
                          '&:hover': {
                            border: '1px solid #10b981'
                          }
                        }),
                        multiValue: (provided) => ({
                          ...provided,
                          backgroundColor: '#dcfce7',
                          color: '#166534'
                        }),
                        multiValueLabel: (provided) => ({
                          ...provided,
                          color: '#166534'
                        }),
                        multiValueRemove: (provided) => ({
                          ...provided,
                          color: '#166534',
                          '&:hover': {
                            backgroundColor: '#bbf7d0',
                            color: '#14532d'
                          }
                        })
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Customer-specific fields */}
              {userRole === 'customer' && (
                <>
                  {/* Budget Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Budget Min (₹)
                      </label>
                      <input
                        type="number"
                        name="budgetMin"
                        value={customerFormData.budgetMin}
                        onChange={handleChange}
                        placeholder="Enter minimum budget"
                        className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Budget Max (₹)
                      </label>
                      <input
                        type="number"
                        name="budgetMax"
                        value={customerFormData.budgetMax}
                        onChange={handleChange}
                        placeholder="Enter maximum budget"
                        className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Region React-Select Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Region <span className="text-green-500">*</span>
                </label>
                {regionsLoading ? (
                  <p className="text-sm text-gray-500">Loading regions...</p>
                ) : regionsError ? (
                  <p className="text-sm text-red-600">{regionsError}</p>
                ) : (
                  <Select
                    isMulti
                    name="regions"
                    options={Array.isArray(regionsList) ? regionsList.map(region => ({
                      value: region._id,
                      label: region.name
                    })) : []}
                    value={Array.isArray(userRole === 'customer' ? customerFormData.regions : brokerFormData.regions) && Array.isArray(regionsList) ? (userRole === 'customer' ? customerFormData.regions : brokerFormData.regions).map(region => {
                      // Handle both object and string formats
                      if (typeof region === 'object' && region._id) {
                        return { value: region._id, label: region.name };
                      } else if (typeof region === 'string') {
                        const regionObj = regionsList.find(r => r._id === region);
                        return regionObj ? { value: regionObj._id, label: regionObj.name } : null;
                      }
                      return null;
                    }).filter(Boolean) : []}
                    onChange={handleRegionChange}
                    placeholder="Select regions..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: '48px',
                        border: state.isFocused ? '2px solid #10b981' : '1px solid #d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
                        '&:hover': {
                          border: '1px solid #10b981'
                        }
                      }),
                      multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#dcfce7',
                        color: '#166534'
                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: '#166534'
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        color: '#166534',
                        '&:hover': {
                          backgroundColor: '#bbf7d0',
                          color: '#14532d'
                        }
                      })
                    }}
                  />
                )}
              </div>


              {/* File Uploads - Only for Brokers */}
              {userRole === 'broker' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  {/* Aadhar File Upload */}
                  <div className="flex flex-col h-full">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Aadhar Card <span className="text-green-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors flex-1 flex flex-col justify-center">
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
                            {brokerFormData.aadharFile ? 
                              (typeof brokerFormData.aadharFile === 'string' ? 
                                'Aadhar Card uploaded' : 
                                brokerFormData.aadharFile.name) : 
                              "Click to upload Aadhar Card"}
                          </p>
                          <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                          {brokerFormData.aadharFile && typeof brokerFormData.aadharFile === 'string' && (
                            <a 
                              href={brokerFormData.aadharFile} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View uploaded file
                            </a>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* PAN File Upload */}
                  <div className="flex flex-col h-full">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      PAN Card <span className="text-green-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors flex-1 flex flex-col justify-center">
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
                            {brokerFormData.panFile ? 
                              (typeof brokerFormData.panFile === 'string' ? 
                                'PAN Card uploaded' : 
                                brokerFormData.panFile.name) : 
                              "Click to upload PAN Card"}
                          </p>
                          <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                          {brokerFormData.panFile && typeof brokerFormData.panFile === 'string' && (
                            <a 
                              href={brokerFormData.panFile} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View uploaded file
                            </a>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* GST File Upload */}
                  <div className="flex flex-col h-full">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      GST Certificate <span className="text-green-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors flex-1 flex flex-col justify-center">
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
                            {brokerFormData.gstFile ? 
                              (typeof brokerFormData.gstFile === 'string' ? 
                                'GST Certificate uploaded' : 
                                brokerFormData.gstFile.name) : 
                              "Click to upload GST Certificate"}
                          </p>
                          <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                          {brokerFormData.gstFile && typeof brokerFormData.gstFile === 'string' && (
                            <a 
                              href={brokerFormData.gstFile} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              View uploaded file
                            </a>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2 px-6 bg-green-800 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      </div>

    </ProtectedRoute>
  );
};

export default Profile;
