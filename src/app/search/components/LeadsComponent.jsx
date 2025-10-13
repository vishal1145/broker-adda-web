'use client';

import React, { useState, useEffect } from 'react';
import Select, { components } from 'react-select';

const LeadsComponent = ({ activeTab, setActiveTab }) => {
  const [leadFilters, setLeadFilters] = useState({
    leadStatus: [],
    leadType: [],
    requirement: [],
    budgetRange: [5000000, 15000000],
    location: '',
    dateAdded: {
      start: '2024-06-01',
      end: ''
    },
    brokerAgent: [],
    priority: []
  });

  const [sortBy, setSortBy] = useState('date-added-newest');
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [leadsError, setLeadsError] = useState('');
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(9);
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);

  // Trigger skeleton loader when switching between tabs from header
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setLeadsError('');
      
      // Get token from localStorage following app pattern
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      // Use environment variable for API URL following app pattern
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      if (!token) {
        console.log('No token found, using fallback leads');
        setLeadsError('No authentication token found');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      params.set('limit', leadsPerPage);
      params.set('page', currentPage);
      
      // Add status filters to API call
      if (leadFilters.leadStatus.length > 0) {
        leadFilters.leadStatus.forEach(status => {
          // API expects exact UI status names (case-sensitive)
          params.append('status', status);
        });
      }

      // Add property type filters to API call
      if (leadFilters.leadType.length > 0) {
        leadFilters.leadType.forEach(type => {
          // API expects exact UI type names (case-sensitive)
          params.append('propertyType', type);
        });
      }

      console.log('API URL:', `${apiUrl}/leads?${params.toString()}`);
      console.log('Status filters:', leadFilters.leadStatus);
      console.log('Property Type filters:', leadFilters.leadType);

      const response = await fetch(`${apiUrl}/leads?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        let items = [];
        let totalCount = 0;
        
        // Handle different response structures
        console.log('Raw API response:', data);
        
        if (Array.isArray(data?.data?.items)) {
          items = data.data.items;
          totalCount = data.data.total ?? data.total ?? items.length;
          console.log('Using data.data.items structure');
        } else if (Array.isArray(data?.data?.leads)) {
          items = data.data.leads;
          totalCount = data.data.total ?? data.total ?? items.length;
          console.log('Using data.data.leads structure');
        } else if (Array.isArray(data?.data)) {
          items = data.data;
          totalCount = data.total ?? items.length;
          console.log('Using data.data structure');
        } else if (Array.isArray(data?.leads)) {
          items = data.leads;
          totalCount = data.total ?? items.length;
          console.log('Using data.leads structure');
        } else if (Array.isArray(data)) {
          items = data;
          totalCount = items.length;
          console.log('Using direct data array structure');
        } else {
          console.log('No valid data structure found, checking for other possibilities...');
          // Check for other possible structures
          if (data?.data && typeof data.data === 'object') {
            console.log('data.data is object:', data.data);
            // Try to find array in the object
            const possibleArrays = Object.values(data.data).filter(Array.isArray);
            if (possibleArrays.length > 0) {
              items = possibleArrays[0];
              totalCount = items.length;
              console.log('Found array in data.data object:', items);
            }
          }
        }

        // Final fallback - if no items found, try to extract from any array in the response
        if (items.length === 0) {
          console.log('No items found, trying final fallback...');
          const findArraysInObject = (obj) => {
            const arrays = [];
            for (const key in obj) {
              if (Array.isArray(obj[key])) {
                arrays.push(obj[key]);
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                arrays.push(...findArraysInObject(obj[key]));
              }
            }
            return arrays;
          };
          
          const allArrays = findArraysInObject(data);
          if (allArrays.length > 0) {
            // Use the largest array found
            const largestArray = allArrays.reduce((a, b) => a.length > b.length ? a : b);
            items = largestArray;
            totalCount = items.length;
            console.log('Found array in fallback:', items);
          }
        }

        console.log('Final leads data:', items);
        console.log('Total leads from API:', items.length);
        console.log('Total count from API:', totalCount);
        console.log('Sample lead statuses:', items.map(lead => ({ id: lead._id || lead.id, status: lead.status })));
        console.log('Sample lead types:', items.map(lead => ({ id: lead._id || lead.id, propertyType: lead.propertyType, requirement: lead.requirement, req: lead.req })));
        console.log('Active filters:', leadFilters);
        console.log('API Response structure:', data);
        
        // Apply client-side filtering
        let filteredItems = items;
        
        // Filter by Lead Status (client-side fallback if API filtering doesn't work properly)
        if (leadFilters.leadStatus.length > 0) {
          filteredItems = filteredItems.filter(lead => {
            const leadStatus = lead.status || '';
            return leadFilters.leadStatus.some(filterStatus => {
              // Match exact status names (case-insensitive)
              return leadStatus.toLowerCase() === filterStatus.toLowerCase();
            });
          });
        }
        
        // Note: Lead Type filtering is now handled by API-side filtering
        // No client-side filtering needed for leadType
        
        // Filter by Priority
        if (leadFilters.priority.length > 0) {
          filteredItems = filteredItems.filter(lead => {
            const leadPriority = lead.priority || lead.priorityLevel || '';
            const priorityLower = leadPriority.toLowerCase();
            return leadFilters.priority.some(filterPriority => {
              const filterPriorityLower = filterPriority.toLowerCase();
              return priorityLower.includes(filterPriorityLower);
            });
          });
        }
        
        // Filter by Location
        if (leadFilters.location) {
          const locationLower = leadFilters.location.toLowerCase();
          filteredItems = filteredItems.filter(lead => {
            const primaryRegion = lead.primaryRegion || '';
            const secondaryRegion = lead.secondaryRegion || '';
            const regions = lead.regions || [];
            const location = lead.location || '';
            
            return (primaryRegion.toLowerCase().includes(locationLower)) ||
                   (secondaryRegion.toLowerCase().includes(locationLower)) ||
                   (location.toLowerCase().includes(locationLower)) ||
                   (Array.isArray(regions) && regions.some(region => 
                     region.toLowerCase().includes(locationLower)
                   ));
          });
        }
        
        console.log('Filtered leads:', filteredItems);
        console.log('Filter results - Status filter:', leadFilters.leadStatus.length > 0 ? 'Applied (API-side)' : 'Not applied');
        console.log('Filter results - Property Type filter:', leadFilters.leadType.length > 0 ? 'Applied (API-side)' : 'Not applied');
        console.log('Filter results - Priority filter:', leadFilters.priority.length > 0 ? 'Applied (Client-side)' : 'Not applied');
        console.log('Filter results - Location filter:', leadFilters.location ? 'Applied (Client-side)' : 'Not applied');
        
        // For pagination, use totalCount from API if available, otherwise use filtered items length
        const finalTotalCount = totalCount > 0 ? totalCount : filteredItems.length;
        console.log('Final total count for pagination:', finalTotalCount);
        
        setLeads(filteredItems);
        setTotalLeads(finalTotalCount);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API Error:', response.status, errorData);
        setLeadsError(`Failed to load leads: ${errorData.message || 'Server error'}`);
        setLeads([]);
        setTotalLeads(0);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeadsError('Error loading leads');
      setLeads([]);
      setTotalLeads(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch leads when component mounts or filters change
  useEffect(() => {
    fetchLeads();
  }, [leadFilters, sortBy, currentPage]);

  // Fetch regions for dropdown (API-sourced)
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setRegionsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/regions`);
        const data = await res.json().catch(() => ({}));
        let list = [];
        if (Array.isArray(data?.data?.regions)) list = data.data.regions;
        else if (Array.isArray(data?.regions)) list = data.regions;
        else if (Array.isArray(data?.data)) list = data.data;
        else if (Array.isArray(data)) list = data;
        const mapped = list
          .map(r => ({
            id: r._id || r.id || r.value || r.name || String(r),
            name: r.name || r.label || String(r)
          }))
          .filter(r => r.name && r.name !== '');
        setRegions(mapped);
      } catch {
        setRegions([]);
      } finally {
        setRegionsLoading(false);
      }
    };
    fetchRegions();
  }, []);

  const leadStatusOptions = [
    'New', 
    'Assigned', 
    'In Progress', 
    'Closed', 
    'Rejected'
  ];
  const leadTypeOptions = ['Residential', 'Commercial', 'Plot', 'Other'];
  const requirementOptions = ['Buy', 'Rent', 'Sell'];
  const priorityOptions = ['High', 'Medium', 'Low'];

  const resetFilters = () => {
    setLeadFilters({
      leadStatus: [],
      leadType: [],
      requirement: [],
      budgetRange: [5000000, 15000000],
      location: '',
      dateAdded: { start: '', end: '' },
      brokerAgent: [],
      priority: []
    });
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalLeads / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = Math.min(startIndex + leadsPerPage, totalLeads);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const reactSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 38,
      fontSize: 14,
      borderColor: state.isFocused ? '#eab308' : '#d1d5db', // yellow-500 focus
      boxShadow: 'none',
      cursor: 'pointer',
      ':hover': { borderColor: state.isFocused ? '#eab308' : '#cbd5e1' }
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 14,
      backgroundColor: state.isSelected
        ? '#14532d' // green-900
        : state.isFocused
          ? '#fffbeb' // yellow-50
          : 'white',
      color: state.isSelected ? 'white' : '#111827',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({ ...base, color: '#111827', fontSize: 14 }),
    placeholder: (base) => ({ ...base, color: '#6b7280', fontSize: 14 }),
    input: (base) => ({ ...base, fontSize: 14 }),
    indicatorSeparator: () => ({ display: 'none' })
  };

  // Helper function to get region names from lead data
  const getRegionNames = (lead) => {
    let primary = '';
    let secondary = '';
    
    // Handle different possible region field structures
    if (lead.primaryRegion) {
      primary = typeof lead.primaryRegion === 'string' ? lead.primaryRegion : lead.primaryRegion.name;
    } else if (lead.region) {
      primary = typeof lead.region === 'string' ? lead.region : lead.region.name;
    } else if (lead.regions && Array.isArray(lead.regions) && lead.regions.length > 0) {
      primary = lead.regions[0];
    }
    
    if (lead.secondaryRegion) {
      secondary = typeof lead.secondaryRegion === 'string' ? lead.secondaryRegion : lead.secondaryRegion.name;
    } else if (lead.regions && Array.isArray(lead.regions) && lead.regions.length > 1) {
      secondary = lead.regions[1];
    }
    
    return { primary, secondary };
  };

  // Helper function to get avatar color
  const getAvatarColor = (seed) => {
    if (!seed) return { bg: 'bg-gray-200', text: 'text-gray-600' };
    
    const colors = [
      { bg: 'bg-red-100', text: 'text-red-600' },
      { bg: 'bg-blue-100', text: 'text-blue-600' },
      { bg: 'bg-green-100', text: 'text-green-600' },
      { bg: 'bg-yellow-100', text: 'text-yellow-600' },
      { bg: 'bg-purple-100', text: 'text-purple-600' },
      { bg: 'bg-pink-100', text: 'text-pink-600' },
      { bg: 'bg-indigo-100', text: 'text-indigo-600' },
      { bg: 'bg-orange-100', text: 'text-orange-600' }
    ];
    
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };


  const handleLeadStatusChange = (status) => {
    // Single-select behavior: either the clicked status or none
    setLeadFilters(prev => ({
      ...prev,
      leadStatus: (prev.leadStatus[0] === status) ? [] : [status]
    }));
  };

  const handleLeadTypeChange = (type) => {
    setLeadFilters(prev => ({
      ...prev,
      leadType: prev.leadType.includes(type)
        ? prev.leadType.filter(t => t !== type)
        : [...prev.leadType, type]
    }));
  };

  const handleRequirementChange = (req) => {
    setLeadFilters(prev => ({
      ...prev,
      requirement: prev.requirement.includes(req)
        ? prev.requirement.filter(r => r !== req)
        : [...prev.requirement, req]
    }));
  };

  const handlePriorityChange = (priority) => {
    setLeadFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  const handleLeadBudgetChange = (value) => {
    setLeadFilters(prev => ({
      ...prev,
      budgetRange: [parseInt(value), 20000000]
    }));
  };

  const handleBudgetMinInput = (value) => {
    const min = Math.max(1000000, Math.min(parseInt(value || 0), leadFilters.budgetRange[1]));
    setLeadFilters(prev => ({ ...prev, budgetRange: [min, prev.budgetRange[1]] }));
  };

  const handleBudgetMaxInput = (value) => {
    const max = Math.min(20000000, Math.max(parseInt(value || 0), leadFilters.budgetRange[0]));
    setLeadFilters(prev => ({ ...prev, budgetRange: [prev.budgetRange[0], max] }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-emerald-50 text-[#0A421E]';
      case 'In Progress':
        return 'bg-[#ECFDF5] text-[#0A421E]';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Gradient ribbon styles for status to match provided images
  const getStatusRibbonStyle = (status) => {
    if (!status) {
      return { background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)' };
    }
    
    const statusLower = status.toLowerCase().trim();
    
    switch (statusLower) {
      case 'open':
      case 'new':
        return {
          background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)',
        };
      case 'assigned':
        return {
          background: 'linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%)',
        };
      case 'in progress':
      case 'inprogress':
        return {
          background: 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)',
        };
      case 'closed':
      case 'completed':
        return {
          background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
        };
      case 'rejected':
      case 'cancelled':
        return {
          background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)',
        };
      case 'transferred':
        return {
          background: 'linear-gradient(90deg, #F97316 0%, #EA580C 100%)',
        };
      case 'active':
        return {
          background: 'linear-gradient(90deg, #10B981 0%, #047857 100%)',
        };
      default:
        console.log('Unknown status:', status);
        return { background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)' };
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Filter Sidebar - 3 columns */}
      <div className="col-span-3">
        {isLoading ? (
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-6">
              {/* Filter Header Skeleton */}
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              
              {/* Lead Status Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="ml-3 h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Lead Type Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="space-y-3">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="ml-3 h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Budget Range Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
              
              {/* Location Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
              
              {/* Date Added Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
              
              {/* Broker/Agent Filter Skeleton */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
              
              {/* Priority Filter Skeleton */}
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="ml-3 h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-5">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full text-white bg-green-900 cursor-pointer flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 shadow"
                aria-label="Reset filters"
              >
                <i className="fa-solid fa-arrows-rotate text-sm mr-2 text-white" aria-hidden="true"></i>
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
           <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
          </div>

          {/* Lead Status Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Lead Status</h3>
            <div className="space-y-2">
              {leadStatusOptions.map((status, index) => (
                <label key={`${status}-${index}`} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="lead-status"
                    checked={leadFilters.leadStatus[0] === status}
                    onChange={() => handleLeadStatusChange(status)}
                    className="w-4 h-4 text-green-900 accent-green-900 border-gray-300 focus:ring-green-900"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Lead Type Filter (chips) */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Property Type</h3>
            <div className="flex flex-wrap gap-2">
              {leadTypeOptions.map((type) => {
                const selected = (leadFilters.leadType || []).includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleLeadTypeChange(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors shadow-sm ${selected ? 'bg-green-900 text-white border-green-900' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Requirement Filter (chips) */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Requirement</h3>
            <div className="flex flex-wrap gap-2">
              {requirementOptions.map((req) => {
                const selected = (leadFilters.requirement || []).includes(req);
                return (
                  <button
                    key={req}
                    type="button"
                    onClick={() => handleRequirementChange(req)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors shadow-sm ${selected ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'}`}
                  >
                    {req}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Range Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Budget Range</h3>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-gray-500">Min</span>
                <input
                  type="number"
                  value={leadFilters.budgetRange[0]}
                  onChange={(e) => handleBudgetMinInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-gray-500">Max</span>
                <input
                  type="number"
                  value={leadFilters.budgetRange[1]}
                  onChange={(e) => handleBudgetMaxInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-2 bg-gray-200 rounded-lg relative">
                <div 
                  className="h-2 bg-green-900 rounded-lg absolute top-0"
                  style={{
                    left: '0%',
                    width: `${((leadFilters.budgetRange[0] - 1000000) / (20000000 - 1000000)) * 100}%`
                  }}
                ></div>
                <input
                  type="range"
                  min="1000000"
                  max="20000000"
                  step="500000"
                  value={leadFilters.budgetRange[0]}
                  onChange={(e) => handleLeadBudgetChange(e.target.value)}
                  className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-0 slider-single"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-700 mt-1">
                <span>$1M</span>
                <span>$20M</span>
              </div>
            </div>
          </div>

          {/* Region Filter (from API) */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Region</h3>
            {regionsLoading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            ) : (
              <Select
                instanceId="leads-region-select"
                styles={reactSelectStyles}
                className="cursor-pointer"
                options={regions.map(r => ({ value: r.name, label: r.name }))}
                value={leadFilters.location ? { value: leadFilters.location, label: leadFilters.location } : null}
                onChange={(opt) => setLeadFilters(prev => ({ ...prev, location: opt?.value || '' }))}
                isSearchable
                isClearable
                placeholder="Select Region"
              />
            )}
          </div>

          {/* Date filter removed as requested */}

          {/* Broker/Agent Filter (multi-select with checkboxes) */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Broker/Agent</h3>
            {(() => {
              const agentOptions = [
                { value: 'agent1', label: 'Agent 1' },
                { value: 'agent2', label: 'Agent 2' },
                { value: 'agent3', label: 'Agent 3' }
              ];
              const CheckboxOption = (props) => (
                <components.Option {...props}>
                  <input type="checkbox" checked={props.isSelected} readOnly className="mr-2" />
                  <span>{props.label}</span>
                </components.Option>
              );
              return (
                <Select
                  instanceId="leads-agent-select"
                  styles={reactSelectStyles}
                  className="cursor-pointer"
                  options={agentOptions}
                  value={agentOptions.filter(o => (leadFilters.brokerAgent || []).includes(o.value))}
                  onChange={(opts) => setLeadFilters(prev => ({ ...prev, brokerAgent: (opts || []).map(o => o.value) }))}
                  isSearchable
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ Option: CheckboxOption }}
                  placeholder="Select Agents"
                />
              );
            })()}
          </div>

          <div className="pt-5">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full text-white bg-green-900 cursor-pointer flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 shadow"
                aria-label="Reset filters"
              >
                <i className="fa-solid fa-arrows-rotate text-sm mr-2 text-white" aria-hidden="true"></i>
                Reset Filters
              </button>
            </div>
          </div>

          
        )}
      </div>

      {/* Leads Grid - 9 columns */}
      <div className="col-span-9">
        {/* Header */}
      

        {/* Leads Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6,7,8,9].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                {/* Profile and Status Skeleton */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-18 h-18 bg-gray-200 rounded-full"></div>
                    <div className="ml-3">
                      <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>

                {/* Lead Details Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-10"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-14"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>

                {/* Interested Regions Skeleton */}
                <div className="mb-4">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="flex flex-wrap gap-1">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-18"></div>
                  </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                  <div className="flex justify-end gap-4">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : leadsError ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-lg font-medium">{leadsError}</p>
              <button 
                onClick={fetchLeads}
                className="mt-4 bg-[#0A421E] text-white px-4 py-2 rounded-md hover:bg-[#0b4f24] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No leads found</p>
              <p className="text-sm text-gray-400">
                {leadFilters.leadStatus.length > 0 
                  ? `No leads found with status: ${leadFilters.leadStatus.join(', ')}`
                  : 'Try adjusting your filters or search criteria'
                }
              </p>
              {leadFilters.leadStatus.length > 0 && (
                <button 
                  onClick={resetFilters}
                  className="mt-4 bg-[#0A421E] text-white px-4 py-2 rounded-md hover:bg-[#0b4f24] transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead, index) => {
              const { primary, secondary } = getRegionNames(lead);
              const seed = lead.customerName || lead.name || lead.customerEmail || lead.customerPhone || '';
              const avatarColor = getAvatarColor(seed);
              
              return (
                <div key={lead._id || lead.id || index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-sm">
              {/* Profile and Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className={`w-18 h-18 rounded-full flex items-center justify-center text-xs font-semibold ${avatarColor.bg} ${avatarColor.text}`}>
                        {(lead.customerName || lead.name || '-')
                          .split(' ')
                          .map(s => s[0])
                          .filter(Boolean)
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                  <div className="ml-3">
                        <h3 className="text-base font-semibold text-gray-900">{lead.customerName || lead.name || '-'}</h3>
                  </div>
                </div>
                <div className="relative">
                  <span
                    className="text-[11px] font-semibold text-white px-3 py-1 rounded-tr-md rounded-bl-md inline-block"
                    style={getStatusRibbonStyle(lead.status)}
                  >
                        {(() => {
                          if (!lead.status) return 'NEW';
                          const statusLower = lead.status.toLowerCase().trim();
                          switch (statusLower) {
                            case 'open':
                            case 'new':
                              return 'NEW';
                            case 'assigned':
                              return 'ASSIGNED';
                            case 'in progress':
                            case 'inprogress':
                              return 'IN PROGRESS';
                            case 'closed':
                            case 'completed':
                              return 'CLOSED';
                            case 'rejected':
                            case 'cancelled':
                              return 'REJECTED';
                            case 'transferred':
                              return 'TRANSFERRED';
                            case 'active':
                              return 'ACTIVE';
                            default:
                              console.log('Unknown status text:', lead.status);
                              return lead.status.toUpperCase();
                          }
                        })()}
                  </span>
                </div>
              </div>

              {/* Lead Details */}
              <div className="space-y-0 mb-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm font-medium text-gray-900">{lead.propertyType || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Budget/Price:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {typeof lead.budget === 'number' 
                          ? `$${lead.budget.toLocaleString()}` 
                          : lead.budget || '-'}
                      </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-medium text-gray-900">{lead.customerPhone || lead.contact || '-'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium text-gray-900">{lead.customerEmail || '-'}</span>
                </div>
              </div>

              {/* Interested Regions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Interested Regions:</h4>
                <div className="flex flex-wrap gap-1">
                      {primary && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {primary}
                    </span>
                      )}
                      {secondary && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {secondary}
                        </span>
                      )}
                      {!primary && !secondary && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                          Not specified
                        </span>
                      )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-[#0A421E] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[#0b4f24] transition-colors cursor-pointer">
                  View Details
                </button>
              </div>
            </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !leadsError && leads.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  // Adjust start page if we're near the end
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }

                  // Add first page and ellipsis if needed
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                  }

                  // Add visible page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          i === currentPage
                            ? 'bg-[#0A421E] text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Add last page and ellipsis if needed
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider-single {
          background: transparent;
        }
        .slider-single::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #0A421E;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider-single::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #0A421E;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider-single::-webkit-slider-track {
          background: transparent;
        }
        .slider-single::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default LeadsComponent;
