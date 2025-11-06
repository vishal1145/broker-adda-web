'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Select, { components } from 'react-select';
import Link from 'next/link';
import TabsBar from './TabsBar';

const LeadsComponent = ({ activeTab, setActiveTab }) => {
  const [leadFilters, setLeadFilters] = useState({
    leadStatus: [],
    leadType: [],
    requirement: [],
    budgetRange: [5000, 100000000],
    city: '',
    location: '',
    preferredLocationPrimary: '', // Added for Primary Preferred Location dropdown
    preferredLocationSecondary: '', // Added for Secondary Preferred Location dropdown
    dateAdded: {
      start: '2024-06-01',
      end: ''
    },
    datePosted: '',
    brokerAgent: [],
    priority: []
  });

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [uiLoading, setUiLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [leadsError, setLeadsError] = useState('');
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(9);
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [allRegions, setAllRegions] = useState([]); // All regions for Preferred Location dropdowns
  const [allRegionsLoading, setAllRegionsLoading] = useState(false);
  const [cities, setCities] = useState([
    { value: 'Agra', label: 'Agra' },
    { value: 'Noida', label: 'Noida' }
  ]);
  const [brokersOptions, setBrokersOptions] = useState([]);
  const [brokersLoading, setBrokersLoading] = useState(false);
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [budgetMinInputValue, setBudgetMinInputValue] = useState('');
  const [budgetMaxInputValue, setBudgetMaxInputValue] = useState('');
  const [isEditingMin, setIsEditingMin] = useState(false);
  const [isEditingMax, setIsEditingMax] = useState(false);

  const searchParams = useSearchParams();

  // Trigger skeleton loader when switching between tabs from header
  useEffect(() => {
    setUiLoading(true);
    const t = setTimeout(() => setUiLoading(false), 500);
    return () => clearTimeout(t);
  }, [activeTab]);

  // Initialize city from URL param ?regionCity=...
  useEffect(() => {
    try {
      const regionCity = searchParams?.get('regionCity');
      if (regionCity) {
        setLeadFilters(prev => ({ ...prev, city: regionCity, location: '' }));
        setCurrentPage(1);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setLeadsError('');
      
      // Use environment variable for API URL following app pattern
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

      // Build base query parameters; fetch large pages to aggregate client-side
      const params = new URLSearchParams();
      const aggLimit = 100;
      params.set('limit', String(aggLimit));
      params.set('page', '1');
      
      // Add sorting parameters to API call (default: createdAt desc)
      params.set('sortBy', sortBy || 'createdAt');
      params.set('sortOrder', sortOrder || 'desc');
      
      // Add status filters to API call
      if (leadFilters.leadStatus.length > 0) {
        leadFilters.leadStatus.forEach(status => {
          // API expects exact UI status names (case-sensitive)
          params.append('status', status);
        });
      }

      // Add property type (single-select) to API call
      if (leadFilters.leadType.length === 1) {
        params.set('propertyType', leadFilters.leadType[0]);
      }

      // Requirement (single-select) - ask backend to filter
      if (leadFilters.requirement.length === 1) {
        params.set('requirement', leadFilters.requirement[0]);
      }

      // Region/location - send region ID to API
      if (leadFilters.location) params.set('regionId', leadFilters.location);

      // Preferred Location Primary - send primary region ID to API
      if (leadFilters.preferredLocationPrimary) {
        params.set('primaryRegionId', leadFilters.preferredLocationPrimary);
      }

      // Preferred Location Secondary - send secondary region ID to API
      if (leadFilters.preferredLocationSecondary) {
        params.set('secondaryRegionId', leadFilters.preferredLocationSecondary);
      }

      // Budget Range Filter - send budgetMin and budgetMax to API
      // Only send if user has changed from default values
      if (leadFilters.budgetRange[0] > 5000) {
        params.set('budgetMin', String(leadFilters.budgetRange[0]));
      }
      if (leadFilters.budgetRange[1] < 100000000) {
        params.set('budgetMax', String(leadFilters.budgetRange[1]));
      }

      // Date Range Filter - API uses dateRange for presets, fromDate/toDate for custom ranges
      if (leadFilters.datePosted) {
        if (leadFilters.datePosted === 'Today') {
          params.set('dateRange', 'today');
        } else if (leadFilters.datePosted === 'Last 7 Days') {
          params.set('dateRange', 'last7days');
        } else if (leadFilters.datePosted === 'Last 30 Days') {
          // API might not have last30days, so use fromDate/toDate
          const today = new Date();
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          params.set('fromDate', thirtyDaysAgo.toISOString().split('T')[0]);
          params.set('toDate', today.toISOString().split('T')[0]);
        } else if (leadFilters.datePosted === 'Custom Range') {
          // Use fromDate and toDate for custom range
          if (leadFilters.dateAdded.start) {
            params.set('fromDate', leadFilters.dateAdded.start);
          }
          if (leadFilters.dateAdded.end) {
            params.set('toDate', leadFilters.dateAdded.end);
          }
        }
      } else if (leadFilters.dateAdded.start || leadFilters.dateAdded.end) {
        // Also handle dateAdded directly if set (custom range without preset)
        if (leadFilters.dateAdded.start) {
          params.set('fromDate', leadFilters.dateAdded.start);
        }
        if (leadFilters.dateAdded.end) {
          params.set('toDate', leadFilters.dateAdded.end);
        }
      }

      console.log('API URL:', `${apiUrl}/leads?${params.toString()}`);
      console.log('Status filters:', leadFilters.leadStatus);
      console.log('Property Type filters:', leadFilters.leadType);
      console.log('Primary Region ID:', leadFilters.preferredLocationPrimary);
      console.log('Secondary Region ID:', leadFilters.preferredLocationSecondary);
      console.log('Date Posted:', leadFilters.datePosted);
      console.log('Date Range:', { start: leadFilters.dateAdded.start, end: leadFilters.dateAdded.end });

      // Add createdBy if a broker is selected (single-select)
      if ((leadFilters.brokerAgent || []).length > 0) {
        params.set('createdBy', String((leadFilters.brokerAgent || [])[0]));
      }
      // Prepare headers with Authorization if token exists
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken') || '') : '';
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const response = await fetch(`${apiUrl}/leads?${params.toString()}`, { headers });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        let items = [];
        let totalCount = 0;
        
        // Handle different response structures
        console.log('Raw API response:', data);
        
        const paginationTotal = data?.data?.pagination?.totalItems || data?.pagination?.totalItems || 0;

        if (Array.isArray(data?.data?.items)) {
          items = data.data.items;
          totalCount = paginationTotal || data.data.total || data.total || items.length;
          console.log('Using data.data.items structure');
        } else if (Array.isArray(data?.data?.leads)) {
          items = data.data.leads;
          totalCount = paginationTotal || data.data.total || data.total || items.length;
          console.log('Using data.data.leads structure');
        } else if (Array.isArray(data?.data)) {
          items = data.data;
          totalCount = paginationTotal || data.total || items.length;
          console.log('Using data.data structure');
        } else if (Array.isArray(data?.leads)) {
          items = data.leads;
          totalCount = paginationTotal || data.total || items.length;
          console.log('Using data.leads structure');
        } else if (Array.isArray(data)) {
          items = data;
          totalCount = paginationTotal || items.length;
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

        // If API has more pages, aggregate them all so we can filter across the full dataset
        try {
          const grandTotal = totalCount || items.length;
          const currentCount = items.length;
          const totalPages = Math.max(1, Math.ceil(grandTotal / aggLimit));
          const aggregated = [...items];
          for (let p = 2; p <= totalPages; p++) {
            const moreParams = new URLSearchParams(params);
            moreParams.set('page', String(p));
            const moreRes = await fetch(`${apiUrl}/leads?${moreParams.toString()}`, { headers });
            if (!moreRes.ok) break;
            const moreData = await moreRes.json();
            let pageItems = [];
            if (Array.isArray(moreData?.data?.items)) pageItems = moreData.data.items;
            else if (Array.isArray(moreData?.data?.leads)) pageItems = moreData.data.leads;
            else if (Array.isArray(moreData?.data)) pageItems = moreData.data;
            else if (Array.isArray(moreData?.leads)) pageItems = moreData.leads;
            else if (Array.isArray(moreData)) pageItems = moreData;
            else if (moreData?.data && typeof moreData.data === 'object') {
              const poss = Object.values(moreData.data).filter(Array.isArray);
              if (poss.length > 0) pageItems = poss[0];
            }
            if (Array.isArray(pageItems) && pageItems.length > 0) aggregated.push(...pageItems);
          }
          items = aggregated;
          totalCount = Math.max(grandTotal, items.length);
        } catch {}

        console.log('Final leads data (aggregated):', items.length);
        console.log('Total count from API (reported):', totalCount);
        console.log('Sample lead statuses:', items.map(lead => ({ id: lead._id || lead.id, status: lead.status })));
        console.log('Sample lead types:', items.map(lead => ({ id: lead._id || lead.id, propertyType: lead.propertyType, requirement: lead.requirement, req: lead.req })));
        console.log('Active filters:', leadFilters);
        console.log('API Response structure:', data);
        // Store full dataset for dependent dropdowns (city -> region)
        setAllLeads(items);
        
        
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
        
        // Client-side backup: filter by property type (single-select)
        if (leadFilters.leadType.length === 1) {
          const selectedType = leadFilters.leadType[0].toLowerCase();
          filteredItems = filteredItems.filter(lead => (lead.propertyType || '').toLowerCase() === selectedType);
        }

        // Client-side backup if backend didn't apply requirement
        if (leadFilters.requirement.length === 1) {
          const selectedReq = leadFilters.requirement[0].toLowerCase();
          const beforeCount = filteredItems.length;
          const filtered = filteredItems.filter(lead => (lead.requirement || lead.req || '').toLowerCase() === selectedReq);
          // Only override if backend didn't filter (sizes equal)
          if (beforeCount === filteredItems.length) {
            filteredItems = filtered;
          }
        }
        
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
        
        // Skip client-side broker filtering if backend is already filtering via createdBy
        
        // Filter by City (robust matching across fields)
        if (leadFilters.city) {
          const cityLower = leadFilters.city.toLowerCase();
          filteredItems = filteredItems.filter(lead => {
            const city = (lead.city || '').toString().toLowerCase();
            const location = (lead.location || '').toString().toLowerCase();
            const primaryRegion = (typeof lead.primaryRegion === 'string' ? lead.primaryRegion : lead.primaryRegion?.name || '').toString().toLowerCase();
            const secondaryRegion = (typeof lead.secondaryRegion === 'string' ? lead.secondaryRegion : lead.secondaryRegion?.name || '').toString().toLowerCase();
            const regionsArr = Array.isArray(lead.regions) ? lead.regions : [];

            const match = (val) => !!val && (val === cityLower || val.includes(cityLower));
            const regionsMatch = regionsArr.some(r => {
              const name = (typeof r === 'string' ? r : r?.name || '').toString().toLowerCase();
              return match(name);
            });
            return match(city) || match(location) || match(primaryRegion) || match(secondaryRegion) || regionsMatch;
          });
        }

        // Filter by Region (robust matching by ID or name)
        if (leadFilters.location) {
          const regionFilterValue = leadFilters.location;
          const isRegionID = typeof regionFilterValue === 'string' || typeof regionFilterValue === 'number';
          
          filteredItems = filteredItems.filter(lead => {
            // Check if lead has matching region ID
            const primaryRegionID = lead.primaryRegion?._id || lead.primaryRegion?.id || lead.primaryRegion;
            const secondaryRegionID = lead.secondaryRegion?._id || lead.secondaryRegion?.id || lead.secondaryRegion;
            
            // Check if IDs match
            if (isRegionID && String(regionFilterValue) === String(primaryRegionID) || String(regionFilterValue) === String(secondaryRegionID)) {
              return true;
            }
            
            // Fallback: check names (case-insensitive)
            const regionLower = String(regionFilterValue).toLowerCase();
            const primaryRegion = (typeof lead.primaryRegion === 'string' ? lead.primaryRegion : lead.primaryRegion?.name || '').toString().toLowerCase();
            const secondaryRegion = (typeof lead.secondaryRegion === 'string' ? lead.secondaryRegion : lead.secondaryRegion?.name || '').toString().toLowerCase();
            const location = (lead.location || '').toString().toLowerCase();

            return primaryRegion.includes(regionLower) || secondaryRegion.includes(regionLower) || location.includes(regionLower);
          });
        }

        // Filter by Preferred Location Primary (client-side backup)
        if (leadFilters.preferredLocationPrimary) {
          filteredItems = filteredItems.filter(lead => {
            const primaryRegionID = lead.primaryRegion?._id || lead.primaryRegion?.id || lead.primaryRegion;
            return String(primaryRegionID) === String(leadFilters.preferredLocationPrimary);
          });
        }

        // Filter by Preferred Location Secondary (client-side backup)
        if (leadFilters.preferredLocationSecondary) {
          filteredItems = filteredItems.filter(lead => {
            const secondaryRegionID = lead.secondaryRegion?._id || lead.secondaryRegion?.id || lead.secondaryRegion;
            return String(secondaryRegionID) === String(leadFilters.preferredLocationSecondary);
          });
        }
        
        console.log('=== LEAD FILTERING DEBUG ===');
        console.log('Total items from API:', items.length);
        console.log('Current filters:', leadFilters);
        console.log('Filtered items count:', filteredItems.length);
        console.log('Filter results - Status filter:', leadFilters.leadStatus.length > 0 ? `Applied (${leadFilters.leadStatus.join(', ')})` : 'Not applied');
        console.log('Filter results - Property Type filter:', leadFilters.leadType.length > 0 ? `Applied (${leadFilters.leadType.join(', ')})` : 'Not applied');
        console.log('Filter results - Requirement filter:', leadFilters.requirement.length > 0 ? `Applied (${leadFilters.requirement.join(', ')})` : 'Not applied');
        console.log('Filter results - Priority filter:', leadFilters.priority.length > 0 ? 'Applied (Client-side)' : 'Not applied');
        console.log('Filter results - Location filter:', leadFilters.location ? `Applied (Region ID: ${leadFilters.location})` : 'Not applied');
        if (items.length > 0 && filteredItems.length === 0) {
          console.log('WARNING: Items from API but filtered out. Sample item:', items[0]);
        }
        
        // Client-side sorting (fallback if API doesn't sort)
        let sortedItems = [...filteredItems];
        const currentSortBy = sortBy || 'createdAt';
        const currentSortOrder = sortOrder || 'desc';
        if (currentSortBy && currentSortOrder) {
          sortedItems.sort((a, b) => {
            let aValue, bValue;
            
            if (currentSortBy === 'createdAt') {
              aValue = new Date(a.createdAt || a.created_at || 0);
              bValue = new Date(b.createdAt || b.created_at || 0);
            } else if (currentSortBy === 'name') {
              aValue = (a.name || a.leadName || a.clientName || '').toLowerCase();
              bValue = (b.name || b.leadName || b.clientName || '').toLowerCase();
            } else {
              aValue = a[currentSortBy] || '';
              bValue = b[currentSortBy] || '';
            }
            
            if (currentSortBy === 'createdAt') {
              return currentSortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            } else if (currentSortBy === 'name') {
              if (currentSortOrder === 'asc') {
                return aValue.localeCompare(bValue);
              } else {
                return bValue.localeCompare(aValue);
              }
            } else {
              // Numeric or other comparison
              if (typeof aValue === 'number' && typeof bValue === 'number') {
                return currentSortOrder === 'asc' ? aValue - bValue : bValue - aValue;
              } else {
                const aStr = String(aValue).toLowerCase();
                const bStr = String(bValue).toLowerCase();
                if (currentSortOrder === 'asc') {
                  return aStr.localeCompare(bStr);
                } else {
                  return bStr.localeCompare(aStr);
                }
              }
            }
          });
        }
        
        // Client-side pagination after filtering and sorting
        const start = (currentPage - 1) * leadsPerPage;
        const pagedItems = sortedItems.slice(start, start + leadsPerPage);
        setLeads(pagedItems);
        setTotalLeads(sortedItems.length);
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

  // Reset UI loading when filters change (but don't show loading for filter changes)
  useEffect(() => {
    setUiLoading(false);
  }, [leadFilters]);

  // Fetch all brokers to populate Broker/Agent filter dropdown
  useEffect(() => {
    const fetchAllBrokers = async () => {
      try {
        setBrokersLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const limit = 100;
        let page = 1;
        let aggregated = [];
        let total = 0;
        for (let i = 0; i < 5; i++) {
          const params = new URLSearchParams();
          params.set('limit', String(limit));
          params.set('page', String(page));
          const res = await fetch(`${apiUrl}/brokers?${params.toString()}`);
          if (!res.ok) break;
          const data = await res.json().catch(() => ({}));
          let items = [];
          if (Array.isArray(data?.data?.items)) items = data.data.items;
          else if (Array.isArray(data?.data?.brokers)) items = data.data.brokers;
          else if (Array.isArray(data?.data)) items = data.data;
          else if (Array.isArray(data?.brokers)) items = data.brokers;
          else if (Array.isArray(data)) items = data;
          if (!Array.isArray(items) || items.length === 0) break;
          aggregated = aggregated.concat(items);
          total = data?.data?.pagination?.totalItems || data?.pagination?.totalItems || aggregated.length;
          if (aggregated.length >= total) break;
          page += 1;
        }
        const opts = aggregated
          .map(b => ({
            value: b._id || b.id || b.userId || b.brokerId || '',
            label: b.name || b.fullName || b.firmName || b.email || 'Unknown'
          }))
          .filter(o => o.value);
        setBrokersOptions(opts);
      } catch {
        setBrokersOptions([]);
      } finally {
        setBrokersLoading(false);
      }
    };
    fetchAllBrokers();
  }, []);

  // Fetch regions for dropdown (API-sourced)
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setRegionsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        
        // If city is selected, fetch regions for that city
        let url = `${apiUrl}/regions`;
        if (leadFilters.city) {
          url += `?city=${encodeURIComponent(leadFilters.city)}`;
        }
        
        const res = await fetch(url);
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
  }, [leadFilters.city]); // Re-fetch when city changes

  // Fetch ALL regions for Preferred Location dropdowns (not filtered by city)
  useEffect(() => {
    const fetchAllRegions = async () => {
      try {
        setAllRegionsLoading(true);
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
            value: r._id || r.id || r.value || r.name || String(r),
            label: r.name || r.label || String(r)
          }))
          .filter(r => r.label && r.label !== '');
        setAllRegions(mapped);
      } catch {
        setAllRegions([]);
      } finally {
        setAllRegionsLoading(false);
      }
    };
    fetchAllRegions();
  }, []); // Fetch once on mount

  const leadStatusOptions = [
    'New', 
    'Assigned', 
    'In Progress', 
    'Closed', 
    'Rejected'
  ];
  const leadTypeOptions = ['Residential', 'Commercial', 'Plot', 'Other'];
  const requirementOptions = ['Buy', 'Rent', 'Sell', 'Other'];
  const priorityOptions = ['High', 'Medium', 'Low'];

  const resetFilters = () => {
    setLeadFilters({
      leadStatus: [],
      leadType: [],
      requirement: [],
      budgetRange: [5000, 100000000],
      city: '',
      location: '',
      preferredLocationPrimary: '',
      preferredLocationSecondary: '',
      dateAdded: { start: '2024-06-01', end: '' }, // Reset to original default
      datePosted: '', // Reset date posted filter
      brokerAgent: [],
      priority: []
    });
    setSortBy('createdAt'); // Reset sorting to default
    setSortOrder('desc'); // Reset sorting to default
    setCurrentPage(1);
    setShowDateRangePicker(false); // Reset date range picker visibility
    setBudgetMinInputValue(''); // Reset budget input values
    setBudgetMaxInputValue('');
    setIsEditingMin(false);
    setIsEditingMax(false);
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
      fontSize: 12,
      borderColor: state.isFocused ? '#eab308' : '#d1d5db', // yellow-500 focus
      boxShadow: 'none',
      cursor: 'pointer',
      ':hover': { borderColor: state.isFocused ? '#eab308' : '#cbd5e1' }
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 12,
      backgroundColor: state.isSelected
        ? '#14532d' // green-900
        : state.isFocused
          ? '#fffbeb' // yellow-50
          : 'white',
      color: state.isSelected ? 'white' : '#111827',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({ ...base, color: '#111827', fontSize: 12 }),
    placeholder: (base) => ({ ...base, color: '#6b7280', fontSize: 12 }),
    input: (base) => ({ ...base, fontSize: 12 }),
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
    // Single-select behavior
    setLeadFilters(prev => ({
      ...prev,
      leadType: (prev.leadType[0] === type) ? [] : [type]
    }));
    setCurrentPage(1);
  };

  const handleRequirementChange = (req) => {
    // Single-select behavior
    setLeadFilters(prev => ({
      ...prev,
      requirement: (prev.requirement[0] === req) ? [] : [req]
    }));
    setCurrentPage(1);
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
    const numValue = parseInt(value?.toString().replace(/[^0-9]/g, '') || '0');
    const min = Math.max(5000, Math.min(numValue, leadFilters.budgetRange[1], 100000000));
    setLeadFilters(prev => ({ 
      ...prev, 
      budgetRange: [min, prev.budgetRange[1]]
    }));
    setCurrentPage(1);
  };

  const handleBudgetMaxInput = (value) => {
    const numValue = parseInt(value?.toString().replace(/[^0-9]/g, '') || '0');
    const max = Math.min(100000000, Math.max(numValue, leadFilters.budgetRange[0], 5000));
    setLeadFilters(prev => ({ 
      ...prev, 
      budgetRange: [prev.budgetRange[0], max]
    }));
    setCurrentPage(1);
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
        {false ? (
          <div className="bg-white rounded-lg p-6">
            <div className="space-y-6">
              {/* Filter Header Skeleton */}
              <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
                <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
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
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-5">

          {/* Filter Results Heading */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            <h2 style={{ fontSize: '20px', lineHeight: '28px', fontWeight: '600', color: '#171A1FFF' }}>Filter Results</h2>
          </div>

          {/* Requirement Filter */}
          <div>
            <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Requirement</h3>
            <div className="flex flex-wrap gap-2">
              {requirementOptions.map((req) => {
                const selected = leadFilters.requirement?.includes(req);
                return (
                  <button
                    key={req}
                    type="button"
                    onClick={() => handleRequirementChange(req)}
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      lineHeight: '16px',
                      fontWeight: '500',
                      color: '#171A1FFF',
                      background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                      borderRadius: '6px',
                      transition: 'all 0.2s',

                    }}
                    className={`p-[10px] inline-block transition-colors ${
                      selected 
                        ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                        : 'hover:bg-[#B8BECAFF]'
                    }`}
                  >
                    {req}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Property Type Filter */}
              <div>
            <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Property Type</h3>
            <div className="flex flex-wrap gap-2">
              {leadTypeOptions.map((type) => {
                const selected = leadFilters.leadType?.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleLeadTypeChange(type)}
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      lineHeight: '16px',
                      fontWeight: '500',
                      color: '#171A1FFF',
                      background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                      borderRadius: '6px',
                      transition: 'all 0.2s',
                    }}
                    className={`p-[10px] inline-block transition-colors ${
                      selected 
                        ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                        : 'hover:bg-[#B8BECAFF]'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
              </div>
          </div>

          {/* Region/Area Filter */}
              <div>
            <h3 className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Region/Area</h3>
                  <Select
                    instanceId="leads-region-select"
                    styles={reactSelectStyles}
                    className="cursor-pointer"
              options={regions.map(r => ({ value: r.id, label: r.name }))}
              value={(() => {
                if (!leadFilters.location) return null;
                const region = regions.find(r => r.id === leadFilters.location || r.name === leadFilters.location);
                return region ? { value: region.id, label: region.name } : { value: leadFilters.location, label: leadFilters.location };
              })()}
                    onChange={(opt) => {
                      setLeadFilters(prev => ({ ...prev, location: opt?.value || '' }));
                      setCurrentPage(1);
                    }}
                    isSearchable
                    isClearable
                    placeholder="Select Region"
                  />
          </div>

       

          {/* Budget Range Filter */}
          <div>
            <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Budget Range</h3>
            <div className="relative">
              {/* Min and Max Value Display - Editable Inputs */}
              <div className="flex justify-between gap-4 mb-3">
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={{ fontFamily: 'Inter', fontSize: '11px', lineHeight: '14px', fontWeight: '400', color: '#565D6DFF' }}>Min</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#171A1FFF' }}>$</span>
                    <input
                      type="text"
                      value={isEditingMin ? budgetMinInputValue : leadFilters.budgetRange[0].toLocaleString()}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        setBudgetMinInputValue(rawValue);
                        if (rawValue !== '') {
                          const numValue = parseInt(rawValue);
                          if (!isNaN(numValue)) {
                            const min = Math.max(5000, Math.min(numValue, leadFilters.budgetRange[1], 100000000));
                            setLeadFilters(prev => ({ 
                              ...prev, 
                              budgetRange: [min, prev.budgetRange[1]]
                            }));
                            setCurrentPage(1);
                          }
                        }
                      }}
                      onFocus={(e) => {
                        setIsEditingMin(true);
                        setBudgetMinInputValue(leadFilters.budgetRange[0].toString());
                        e.target.select();
                      }}
                      onBlur={(e) => {
                        setIsEditingMin(false);
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        const numValue = rawValue === '' ? 5000 : parseInt(rawValue);
                        handleBudgetMinInput(numValue);
                        setBudgetMinInputValue('');
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur();
                        }
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-green-900 text-sm"
                      style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#171A1FFF' }}
                      placeholder="5,000"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={{ fontFamily: 'Inter', fontSize: '11px', lineHeight: '14px', fontWeight: '400', color: '#565D6DFF' }}>Max</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#171A1FFF' }}>$</span>
                    <input
                      type="text"
                      value={isEditingMax ? budgetMaxInputValue : leadFilters.budgetRange[1].toLocaleString()}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        setBudgetMaxInputValue(rawValue);
                        if (rawValue !== '') {
                          const numValue = parseInt(rawValue);
                          if (!isNaN(numValue)) {
                            const max = Math.min(100000000, Math.max(numValue, leadFilters.budgetRange[0], 5000));
                            setLeadFilters(prev => ({ 
                              ...prev, 
                              budgetRange: [prev.budgetRange[0], max]
                            }));
                            setCurrentPage(1);
                          }
                        }
                      }}
                      onFocus={(e) => {
                        setIsEditingMax(true);
                        setBudgetMaxInputValue(leadFilters.budgetRange[1].toString());
                        e.target.select();
                      }}
                      onBlur={(e) => {
                        setIsEditingMax(false);
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        const numValue = rawValue === '' ? 100000000 : parseInt(rawValue);
                        handleBudgetMaxInput(numValue);
                        setBudgetMaxInputValue('');
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur();
                        }
                      }}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-green-900 text-sm"
                      style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#171A1FFF' }}
                      placeholder="100,000,000"
                    />
                  </div>
                </div>
              </div>
              
              {/* Slider Container */}
              <div className="relative h-2 rounded-lg overflow-visible" style={{ backgroundColor: '#B2F0C8' }}>
                {/* Active Range Indicator (dark green) with soft glow */}
                <div 
                  className="h-2 absolute rounded-lg pointer-events-none"
                  style={{
                    backgroundColor: '#1C5032',
                    left: `${((leadFilters.budgetRange[0] - 5000) / (100000000 - 5000)) * 100}%`,
                    width: `${((leadFilters.budgetRange[1] - leadFilters.budgetRange[0]) / (100000000 - 5000)) * 100}%`,
                    transition: 'all 0.1s ease',
                    zIndex: 1,
                    boxShadow: '0 0 6px rgba(28, 80, 50, 0.4), 0 0 2px rgba(28, 80, 50, 0.2)',
                    filter: 'blur(0.3px)'
                  }}
                ></div>
                
                {/* Min Range Input - Left slider (full width for interaction) */}
                <input
                  type="range"
                  min="5000"
                  max="100000000"
                  step="5000"
                  value={leadFilters.budgetRange[0]}
                  onChange={(e) => {
                    const val = Math.min(parseInt(e.target.value), leadFilters.budgetRange[1]);
                    setLeadFilters(prev => ({ 
                      ...prev, 
                      budgetRange: [val, prev.budgetRange[1]]
                    }));
                    // Update input value if not editing
                    if (!isEditingMin) {
                      setBudgetMinInputValue('');
                    }
                    setCurrentPage(1);
                  }}
                  className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-min"
                  style={{ 
                    zIndex: 2,
                    pointerEvents: 'auto'
                  }}
                />
                
                {/* Max Range Input - Right slider (full width for interaction) */}
                <input
                  type="range"
                  min="5000"
                  max="100000000"
                  step="5000"
                  value={leadFilters.budgetRange[1]}
                  onChange={(e) => {
                    const val = Math.max(parseInt(e.target.value), leadFilters.budgetRange[0]);
                    setLeadFilters(prev => ({ 
                      ...prev, 
                      budgetRange: [prev.budgetRange[0], val]
                    }));
                    // Update input value if not editing
                    if (!isEditingMax) {
                      setBudgetMaxInputValue('');
                    }
                    setCurrentPage(1);
                  }}
                  className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-max"
                  style={{ 
                    zIndex: 3,
                    pointerEvents: 'auto'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Date Posted Filter */}
          <div>
            <h3 className="block mb-3" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Date Posted</h3>
            <div className="flex flex-wrap gap-2">
              {['Today', 'Last 7 Days', 'Last 30 Days', 'Custom Range'].map((dateOption) => {
                const selected = leadFilters.datePosted === dateOption;
                return (
                  <button
                    key={dateOption}
                    type="button"
                    onClick={() => {
                      if (dateOption === 'Custom Range') {
                        setShowDateRangePicker(!showDateRangePicker);
                        if (leadFilters.datePosted !== 'Custom Range') {
                          setLeadFilters(prev => ({
                            ...prev,
                            datePosted: 'Custom Range'
                          }));
                        }
                      } else {
                        setShowDateRangePicker(false);
                        setLeadFilters(prev => ({
                          ...prev,
                          datePosted: prev.datePosted === dateOption ? '' : dateOption,
                          dateAdded: { start: '', end: '' } // Clear custom dates when selecting preset
                        }));
                      }
                      setCurrentPage(1);
                    }}
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      lineHeight: '16px',
                      fontWeight: '500',
                      color: '#171A1FFF',
                      background: selected ? '#B8BECAFF' : '#F3F4F6FF',
                      borderRadius: '6px',
                      transition: 'all 0.2s',
                    }}
                    className={`p-[10px] inline-flex whitespace-nowrap transition-colors items-center justify-center gap-2 focus:outline-none focus:ring-0 ${
                      selected 
                        ? 'hover:bg-[#8791A5FF] hover:active:bg-[#8791A5FF]' 
                        : 'hover:bg-[#B8BECAFF]'
                    }`}
                  >
                    {dateOption}
                    {dateOption === 'Custom Range' && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Custom Date Range Picker */}
            {showDateRangePicker && leadFilters.datePosted === 'Custom Range' && (
              <div className="mt-3 p-4 border border-gray-300 rounded-lg bg-white shadow-lg z-10">
                <div className="space-y-3">
                  <div>
                    <label className="block mb-2 text-xs font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={leadFilters.dateAdded.start || ''}
                      onChange={(e) => {
                        setLeadFilters(prev => ({
                          ...prev,
                          dateAdded: {
                            ...prev.dateAdded,
                            start: e.target.value
                          }
                        }));
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-green-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-xs font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={leadFilters.dateAdded.end || ''}
                      min={leadFilters.dateAdded.start || ''}
                      onChange={(e) => {
                        setLeadFilters(prev => ({
                          ...prev,
                          dateAdded: {
                            ...prev.dateAdded,
                            end: e.target.value
                          }
                        }));
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-green-900 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setShowDateRangePicker(false);
                    }}
                    className="w-full mt-2 px-4 py-2 bg-green-900 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
                  >
                    Apply Date Range
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Filters Toggle */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowSecondaryFilters(!showSecondaryFilters)}
              className="flex items-center justify-between w-full text-[12px] font-medium text-gray-700 hover:text-gray-900"
            >
              <span>Secondary Filters</span>
              <svg className="w-4 h-4 transition-transform" style={{ transform: showSecondaryFilters ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Secondary Filters Content */}
          {showSecondaryFilters && (
            <div className="space-y-5 pt-4">
              {/* Preferred Location (Primary) */}
              <div>
                <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Preferred Location (Primary)</label>
                {allRegionsLoading ? (
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                ) : (
                  <Select
                    instanceId="preferred-location-primary-select"
                    styles={reactSelectStyles}
                    className="cursor-pointer"
                    options={allRegions}
                    value={leadFilters.preferredLocationPrimary ? 
                      allRegions.find(r => r.value === leadFilters.preferredLocationPrimary) || null 
                      : null}
                    onChange={(opt) => {
                      setLeadFilters(prev => ({ 
                        ...prev, 
                        preferredLocationPrimary: opt?.value || '' 
                      }));
                      setCurrentPage(1);
                    }}
                    isSearchable
                    isClearable
                    placeholder="Select Preferred Location"
                  />
                )}
              </div>

              {/* Preferred Location (Secondary) (Optional) */}
              <div>
                <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Preferred Location (Secondary) (Optional)</label>
                {allRegionsLoading ? (
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                ) : (
                  <Select
                    instanceId="preferred-location-secondary-select"
                    styles={reactSelectStyles}
                    className="cursor-pointer"
                    options={allRegions}
                    value={leadFilters.preferredLocationSecondary ? 
                      allRegions.find(r => r.value === leadFilters.preferredLocationSecondary) || null 
                      : null}
                    onChange={(opt) => {
                      setLeadFilters(prev => ({ 
                        ...prev, 
                        preferredLocationSecondary: opt?.value || '' 
                      }));
                      setCurrentPage(1);
                    }}
                    isSearchable
                    isClearable
                    placeholder="Select Preferred Location (Optional)"
                  />
                )}
              </div>

              {/* Broker Assigned */}
              <div>
                <label className="block mb-2" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Broker Assigned</label>
            {(() => {
              if (brokersLoading) return <div className="h-8 bg-gray-200 rounded animate-pulse" />;
              return (
                <Select
                      instanceId="broker-assigned-select"
                  styles={reactSelectStyles}
                  className="cursor-pointer"
                  options={brokersOptions}
                  value={(() => {
                    const sel = (leadFilters.brokerAgent || [])[0];
                    return brokersOptions.find(o => o.value === sel) || null;
                  })()}
                      onChange={(opt) => {
                        setLeadFilters(prev => ({ ...prev, brokerAgent: opt?.value ? [opt.value] : [] }));
                        setCurrentPage(1);
                      }}
                  isSearchable
                      placeholder="Select Broker"
                />
              );
            })()}
          </div>

            

             

              {/* Verification Status */}
              <div className="flex items-center justify-between">
                <label className="block" style={{ fontFamily: 'Inter', fontSize: '13px', lineHeight: '16px', fontWeight: '500', color: '#565D6DFF' }}>Verification Status: Verified</label>
                <div className="relative inline-block w-[44px] h-6">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    defaultChecked
                  />
                  <div className="absolute inset-0 bg-gray-200 rounded-full cursor-pointer transition-colors duration-200 ease-in-out peer-checked:bg-[#0D542B]">
                    <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 peer-checked:translate-x-[20px]"></div>
                  </div>
                </div>
              </div>
          
        
            </div>
          )}

          {/* Action Buttons - Always Visible */}
          <div className="pt-4">
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                style={{
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  lineHeight: '22px',
                  fontWeight: '500',
                  color: '#171A1FFF'
                }}
                className="flex-1 py-1 border border-gray-300 text-[12px] font-medium rounded-lg bg-white hover:bg-white hover:border-gray-300 active:bg-white transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  // Apply filters logic here
                  setShowSecondaryFilters(false);
                }}
                className="flex-1  py-1 bg-green-900 rounded-lg text-[12px] font-medium text-white hover:bg-green-800 transition-colors"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  lineHeight: '22px',
                  fontWeight: '500'
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Leads Grid - 9 columns */}
      <div className="col-span-9">
        {/* Tabs Bar */}
        <TabsBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy || 'createdAt');
            setSortOrder(newSortOrder || 'desc');
            setCurrentPage(1);
          }}
        />

        {/* Header with heading */}
        <div className="mb-6">
            <h2 className="text-[18px] font-semibold text-gray-900">
            Lead Search Results ({totalLeads} Found)
          </h2>
        </div>

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
        ) : (leads.length === 0 && !isLoading) ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-full mx-auto px-6 py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div className="flex flex-col items-center justify-center text-center">
                {/* Image/Icon */}
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                {/* Primary Message */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No leads found
                </h3>
                {/* Secondary Message */}
                <p className="text-sm text-gray-500 mb-6 max-w-md">
                  {leadFilters.leadStatus.length > 0 || 
                   leadFilters.leadType.length > 0 || 
                   leadFilters.requirement.length > 0 || 
                   leadFilters.priority.length > 0 ||
                   leadFilters.city ||
                   leadFilters.location ||
                   leadFilters.brokerAgent.length > 0 ||
                   leadFilters.budgetRange[0] !== 5000 || 
                   leadFilters.budgetRange[1] !== 100000000 ||
                   leadFilters.datePosted ||
                   (leadFilters.dateAdded.start && leadFilters.dateAdded.start !== '2024-06-01') ||
                   (leadFilters.dateAdded.end)
                    ? "We couldn't find any leads matching your current filters. Try adjusting your search criteria."
                    : "No leads are available at the moment. Please check back later or contact us for assistance."}
                </p>
                {/* Action Buttons */}
                {(leadFilters.leadStatus.length > 0 || 
                  leadFilters.leadType.length > 0 || 
                  leadFilters.requirement.length > 0 || 
                  leadFilters.priority.length > 0 ||
                  leadFilters.city ||
                  leadFilters.location ||
                  leadFilters.brokerAgent.length > 0 ||
                  leadFilters.budgetRange[0] !== 5000 || 
                  leadFilters.budgetRange[1] !== 100000000 ||
                  leadFilters.datePosted ||
                  (leadFilters.dateAdded.start && leadFilters.dateAdded.start !== '2024-06-01') ||
                  (leadFilters.dateAdded.end)) && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-6 py-2.5 bg-green-900 text-white text-sm font-semibold rounded-lg hover:bg-green-950 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead, index) => {
              const { primary, secondary } = getRegionNames(lead);
              const brokerImage = lead.createdBy?.brokerImage || lead.createdBy?.profileImage || lead.createdBy?.image;
              const brokerName = lead.createdBy?.name || lead.createdBy?.fullName || lead.createdBy?.email || 'Unknown';
              
              // Helper function to format region names
              const regionName = (region) => {
                if (!region) return null;
                if (typeof region === 'string') return region;
                if (typeof region === 'object') {
                  return region.name || region.city || region.state || null;
                }
                return null;
              };

              // Helper function for ago
              const ago = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const now = new Date();
                const diffMs = now.getTime() - date.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHours / 24);
                if (diffMins < 1) return 'Just now';
                if (diffMins < 60) return `${diffMins}m ago`;
                if (diffHours < 24) return `${diffHours}h ago`;
                if (diffDays < 7) return `${diffDays}d ago`;
                return date.toLocaleDateString();
              };

              // Helper function for INR formatting
              const INR = new Intl.NumberFormat('en-IN', {
                maximumFractionDigits: 0,
              });
              
              return (
                <Link
                  key={lead._id || lead.id || index}
                  href={`/lead-details/${lead._id || lead.id || index}`}
                  className="block h-full"
                >
                  <article
                    className="group h-full relative rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  >
                    <div className="p-6">
                    {/* Top Section - Main Title */}
                    <div className="mb-4">
                      <h3 className="text-[16px] leading-[22px] font-bold mb-2" style={{  color: '#323743' }}>
                        {lead.propertyType || "Property"} for {lead.requirement || lead.req || "inquiry"}
                      </h3>
                      
                      {/* Tags and Time */}
                      <div className="flex items-center justify-between gap-2 flex-nowrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center justify-center rounded-full h-[18px] p-[10px] whitespace-nowrap" style={{ fontFamily: 'Inter', fontSize: '11px', lineHeight: '16px', fontWeight: '600', background: '#0D542B', color: '#FFFFFF' }}>
                            {lead.requirement || lead.req || ""}
                          </span>
                          <span className="inline-flex items-center justify-center rounded-full h-[18px] p-[10px] whitespace-nowrap" style={{ fontFamily: 'Inter', fontSize: '11px', lineHeight: '16px', fontWeight: '600', background: '#FDC700', color: '#1b1d20ff' }}>
                            {lead.propertyType || ""}
                          </span>
                      </div>
                        {lead.createdAt && (
                          <div className="flex items-center gap-1.5 text-[12px] leading-5 font-normal whitespace-nowrap flex-shrink-0" style={{ color: '#565D6D' }}>
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            {ago(lead.createdAt)}
                  </div>
                        )}
                </div>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Middle Section - Property Details */}
                    <div className="space-y-3 mb-4">
                      {/* Preferred Location */}
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-3 w-3 flex-shrink-0 text-[#565D6D]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <div className="flex items-center flex-wrap gap-1">
                          <span className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">Preferred:</span>
                          <span className="font-inter text-[12px] leading-5 font-normal capitalize text-[#565D6DFF]">
                            {regionName(lead.primaryRegion) || primary || "—"}
                  </span>
                </div>
              </div>

                      {/* Secondary Location */}
                      {(lead.secondaryRegion || secondary) && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-3 w-3 flex-shrink-0 text-[#565D6D]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <div className="flex items-center flex-wrap gap-1">
                            <span className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">Secondary:</span>
                            <span className="font-inter text-[12px] leading-5 font-normal capitalize text-[#565D6DFF]">
                              {regionName(lead.secondaryRegion) || secondary || "—"}
                            </span>
                </div>
                        </div>
                      )}

                      {/* Budget */}
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-3 w-3 flex-shrink-0 text-[#565D6D]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="8" width="18" height="12" rx="2" />
                          <path d="M3 12h18M9 8v8" />
                        </svg>
                        <div className="flex items-center flex-wrap gap-1">
                          <span className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">Budget:</span>
                          <span className="text-[12px] leading-5 font-normal" style={{ color: '#565D6D' }}>
                            {typeof lead.budget === "number"
                              ? "₹" + INR.format(lead.budget).replace("₹", "")
                              : lead.budget || "—"}
                      </span>
                </div>
                </div>
                </div>

                    {/* Bottom Section - Broker Profile and Actions */}
                    <div className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative w-12 h-12 text-sm font-semibold" style={{ color: '#323743' }}>
                            {brokerImage ? (
                              <>
                                <div className="w-12 h-12 rounded-full bg-[#E5FCE4FF] overflow-hidden">
                                  <img
                                    src={brokerImage}
                                    alt={brokerName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/4 translate-y-1/8"></div>
                              </>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-full bg-[#E5FCE4FF] flex items-center justify-center">
                                  {brokerName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/2 translate-y-1/2"></div>
                              </>
                            )}
              </div>

                          {/* Name and icons */}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">
                                {brokerName}
                              </p>
                            </div>

                            {/* Connect / Chat */}
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-2">
                                <svg className="w-3 h-3 fill-none stroke-[#171A1FFF]" viewBox="0 0 24 24" strokeWidth="2">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span className="font-inter text-xs leading-5 font-normal text-[#565D6DFF]">Connect</span>
                    </span>

                              <span className="flex items-center gap-2">
                                <svg className="w-3 h-3 fill-none stroke-[#171A1FFF]" viewBox="0 0 24 24" strokeWidth="2">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <span className="font-inter text-xs leading-5 font-normal text-[#565D6DFF]">Chat</span>
                        </span>
                </div>
              </div>
              </div>
            </div>
                    </div>
                  </div>
                </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !leadsError && totalLeads > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4">
            {/* Left: Results info */}
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, totalLeads)} of {totalLeads} results
            </div>

            {/* Right: Pagination buttons */}
            {totalPages > 1 ? (
              <div className="flex items-center gap-1">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                  className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                  currentPage === 1
                      ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
              </button>

                <div className="flex items-center gap-1 overflow-x-auto">
                  {/* Always show first page */}
                      <button
                        onClick={() => handlePageChange(1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md font-medium ${
                      currentPage === 1
                        ? 'bg-[#0A421E] text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                      >
                        1
                      </button>

                  {/* Show ellipsis if current page is far from start */}
                  {currentPage > 4 && (
                    <span className="px-2 py-2 text-sm text-gray-500">...</span>
                  )}

                  {/* Show pages around current page */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Don't show page 1 (already shown above)
                      if (page === 1) return false;
                      // Don't show last page (shown below)
                      if (page === totalPages) return false;
                      
                      // Show pages 2-4 if current page is 1-3
                      if (currentPage <= 3) {
                        return page >= 2 && page <= 4;
                      }
                      // Show pages around current page
                      if (currentPage > 3 && currentPage < totalPages - 2) {
                        return page >= currentPage - 1 && page <= currentPage + 1;
                      }
                      // Show last few pages if current page is near end
                      if (currentPage >= totalPages - 2) {
                        return page >= totalPages - 3 && page < totalPages;
                      }
                      return false;
                    })
                    .map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md font-medium ${
                          currentPage === page
                            ? 'bg-[#0A421E] text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                  {/* Show ellipsis if current page is far from end */}
                  {currentPage < totalPages - 3 && (
                    <span className="px-2 py-2 text-sm text-gray-500">...</span>
                  )}

                  {/* Always show last page if there's more than 1 page */}
                  {totalPages > 1 && (
                      <button
                        onClick={() => handlePageChange(totalPages)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md font-medium ${
                        currentPage === totalPages
                          ? 'bg-[#0A421E] text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                      >
                        {totalPages}
                      </button>
                  )}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                  className={`w-8 h-8 flex items-center justify-center rounded-md border ${
                  currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
              </button>
            </div>
            ) : null}
          </div>
        )}
      </div>

      <style jsx>{`
        .slider-min,
        .slider-max {
          background: transparent;
          cursor: pointer;
          pointer-events: auto;
        }
        .slider-min::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: grab;
          border: 2px solid #1C5032;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          position: relative;
          z-index: 30;
          margin-top: -9px;
        }
        .slider-min::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.05);
        }
        .slider-max::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: grab;
          border: 2px solid #1C5032;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          position: relative;
          z-index: 31;
          margin-top: -9px;
        }
        .slider-max::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.05);
        }
        .slider-min::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: grab;
          border: 2px solid #1C5032;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          position: relative;
          z-index: 30;
        }
        .slider-max::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: grab;
          border: 2px solid #1C5032;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          position: relative;
          z-index: 31;
        }
        .slider-min::-webkit-slider-thumb:hover,
        .slider-max::-webkit-slider-thumb:hover {
          transform: scale(1.08);
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        }
        .slider-min::-moz-range-thumb:hover,
        .slider-max::-moz-range-thumb:hover {
          transform: scale(1.08);
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
        }
        .slider-min::-webkit-slider-track,
        .slider-max::-webkit-slider-track {
          background: transparent;
          height: 2px;
        }
        .slider-min::-moz-range-track,
        .slider-max::-moz-range-track {
          background: transparent;
          height: 2px;
        }
      `}</style>
    </div>
  );
};

export default LeadsComponent;
