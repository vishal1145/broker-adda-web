'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Select, { components as RSComponents } from 'react-select';
import ProtectedRoute from '../components/ProtectedRoute';

/* ───────────── Small stat card ───────────── */
const StatCard = ({ label, value, deltaText, trend = 'up', color = 'sky' }) => {
  const colorStrip = {
    sky: 'from-sky-500 to-sky-400',
    amber: 'from-amber-500 to-amber-400',
    emerald: 'from-emerald-500 to-emerald-400',
    violet: 'from-violet-500 to-violet-400',
    indigo: 'from-indigo-500 to-indigo-400',
  }[color];

  const trendDown = trend === 'down';
  const deltaClass = trendDown ? 'text-rose-600' : 'text-emerald-600';

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(2,6,23,0.06)] hover:shadow-[0_6px_18px_rgba(2,6,23,0.08)] transition-shadow">
      {/* Left color strip */}
<div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${colorStrip}`} />
      <div className="px-5 py-6">
        <p className="text-xs font-body text-gray-600 font-medium">{label}</p>
        <p className="mt-5 text-3xl leading-none  text-gray-800">{value}</p>
        {/* <p className={`mt-5 flex items-center gap-1.5 text-[12px] font-medium ${deltaClass}`}>
          {trendDown ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l7-7 7 7" />
            </svg>
          )}
          <span>{deltaText}</span>
        </p> */}
      </div>
  </div>
);
};

export default function BrokerLeadsPage() {
  /* ───────────── Filters & UI state ───────────── */
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [leadViewMode, setLeadViewMode] = useState('my-leads'); // 'my-leads' or 'transferred'
  const [filters, setFilters] = useState({
    query: '',
    status: { value: 'all', label: 'All Status' },
    broker: { value: 'all', label: 'All Brokers' },
    region: { value: 'all', label: 'All Regions' },
    propertyType: { value: 'all', label: 'All Property Types' },
    requirement: { value: 'all', label: 'All Requirements' },
    startDate: '',
    endDate: '',
    budgetMax: 500000
  });

  /* ───────────── Regions API ───────────── */
  const [regionsList, setRegionsList] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionsError, setRegionsError] = useState('');
  // Nearest regions for Add Lead modal (based on logged-in broker)
  const [nearestRegionsList, setNearestRegionsList] = useState([]);
  const [nearestRegionsLoading, setNearestRegionsLoading] = useState(false);
  const [nearestRegionsError, setNearestRegionsError] = useState('');
  const [applyingFilters, setApplyingFilters] = useState(false);
  const isAdvancedFiltersApplied = useMemo(() => {
    return (
      (filters.status?.value && filters.status.value !== 'all') ||
      (filters.broker?.value && filters.broker.value !== 'all') ||
      (filters.region?.value && filters.region.value !== 'all') ||
      (filters.propertyType?.value && filters.propertyType.value !== 'all') ||
      (filters.requirement?.value && filters.requirement.value !== 'all') ||
      !!filters.startDate || !!filters.endDate ||
      (typeof filters.budgetMax === 'number' && filters.budgetMax !== 500000)
    );
  }, [filters]);

  // clearAdvancedFilters is defined later, after pagination and loadLeads are created
  let clearAdvancedFilters = () => {};

  // Auth and API base
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('token') || localStorage.getItem('authToken'))
    : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Get current user ID from token
  const getCurrentUserIdFromToken = (jwtToken) => {
    try {
      if (!jwtToken || typeof window === 'undefined') return '';
      const base64Url = jwtToken.split('.')[1];
      if (!base64Url) return '';
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);
      // no-op
      // Use brokerId if available, otherwise fall back to userId
      return payload.brokerId || payload.userId || payload.id || payload.sub || '';
    } catch {
      return '';
    }
  };
  const currentUserId = useMemo(() => getCurrentUserIdFromToken(token), [token]);

  // State to store the actual broker ID (might be different from token userId)
  const [brokerId, setBrokerId] = useState('');
  const [brokerIdLoading, setBrokerIdLoading] = useState(false);

  // Function to get broker details and extract the correct broker ID
  const getBrokerId = useCallback(async () => {
    if (!currentUserId || !token) {
      // missing auth
      return;
    }
    
    // No hardcoded mapping. Always resolve via API only.
    
    try {
      setBrokerIdLoading(true);
      // fetch broker details for user
      
      // Try the most likely endpoint first
      const res = await fetch(`${apiUrl}/brokers/${currentUserId}`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      
      // status read
      
      if (res.ok) {
        const data = await res.json();
        // raw data
        
        // Try different possible data structures
        const brokerData = data?.data?.broker || data?.broker || data?.data || data;
        // processed data
        
        // Use the broker's _id for filtering leads
        if (brokerData && brokerData._id) {
          setBrokerId(brokerData._id);
          // set broker id
        } else {
          // no id in response
          
          // Fallback: do not guess. Keep brokerId empty and log for visibility
          // leave brokerId empty
        }
      } else {
        // failed to fetch broker details
        const errorText = await res.text();
        // Do not fallback to userId; keep brokerId empty so queries won't filter wrongly
      }
    } catch (error) {
      // error fetching broker details
      // Do not fallback to userId; keep brokerId empty so queries won't filter wrongly
    } finally {
      setBrokerIdLoading(false);
    }
  }, [currentUserId, token, apiUrl]);

  // Get broker ID when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      getBrokerId();
    }
  }, [currentUserId, getBrokerId]);

  /* ───────────── Metrics API ───────────── */
  const [metrics, setMetrics] = useState({ totalLeads: 0, newLeadsToday: 0, convertedLeads: 0, avgDealSize: 0, transferredToMe: 0, transferredByMe: 0 });
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState('');

  const loadMetrics = useCallback(async () => {
    // Only fetch metrics when brokerId is available to ensure broker-scoped numbers
    if (!brokerId) return;
    try {
      setMetricsLoading(true); setMetricsError('');
      const metricsUrl = `${apiUrl}/leads/metrics?createdBy=${brokerId}`;
      const res = await fetch(metricsUrl, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          setMetricsError(err?.message || err?.error || 'Failed to load metrics');
        } catch {
          setMetricsError('Failed to load metrics');
        }
        return;
      }
      const data = await res.json();
      const payload = data?.data || data || {};
      setMetrics({
        totalLeads: Number(payload.totalLeads || payload.total || 0),
        newLeadsToday: Number(payload.newLeadsToday || payload.today || 0),
        convertedLeads: Number(payload.convertedLeads || payload.converted || 0),
        avgDealSize: Number(payload.avgDealSize || payload.averageDealSize || 0),
        transferredToMe: Number(payload.transferredToMe || payload.transfersToMe || 0),
        transferredByMe: Number(payload.transferredByMe || payload.transfersByMe || 0),
      });
    } catch {
      setMetricsError('Error loading metrics');
    } finally {
      setMetricsLoading(false);
    }
  }, [apiUrl, token, brokerId]);
  // Load metrics once brokerId is available
  useEffect(() => { if (brokerId) loadMetrics(); }, [brokerId, loadMetrics]);

  /* ───────────── Leads API ───────────── */
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / (limit || 10)));
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const DEBOUNCE_DELAY = 500; // Configurable debounce delay

  useEffect(() => {
    // Show searching indicator when user types (with small delay to avoid flickering)
    const showSearchingTimer = setTimeout(() => {
      if (filters.query !== debouncedQuery) {
        setIsSearching(true);
      }
    }, 100);
    
    const debounceTimer = setTimeout(() => {
      setDebouncedQuery(filters.query || '');
      setIsSearching(false);
    }, DEBOUNCE_DELAY);
    
    return () => {
      clearTimeout(showSearchingTimer);
      clearTimeout(debounceTimer);
    };
  }, [filters.query, debouncedQuery]);

  const buildRequestUrl = useCallback(
    (effectiveFilters, p = page, l = limit, q = debouncedQuery, viewMode = leadViewMode) => {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', String(l));
      
      // Use different endpoint and parameters for transferred leads
      if (viewMode === 'transferred') {
        if (brokerId) {
          params.set('toBroker', brokerId);
        }
        if (q) params.set('search', q);
        if (effectiveFilters.status?.value && effectiveFilters.status.value !== 'all') params.set('status', effectiveFilters.status.value);
        if (effectiveFilters.region?.value && effectiveFilters.region.value !== 'all') params.set('region', effectiveFilters.region.value);
        if (effectiveFilters.propertyType?.value && effectiveFilters.propertyType.value !== 'all') params.set('propertyType', effectiveFilters.propertyType.value);
        if (effectiveFilters.requirement?.value && effectiveFilters.requirement.value !== 'all') params.set('requirement', effectiveFilters.requirement.value);
        if (effectiveFilters.startDate) params.set('startDate', effectiveFilters.startDate);
        if (effectiveFilters.endDate) params.set('endDate', effectiveFilters.endDate);
        if (typeof effectiveFilters.budgetMax === 'number' && effectiveFilters.budgetMax !== 500000) params.set('budgetMax', String(effectiveFilters.budgetMax));
        return `${apiUrl}/leads/transferred?${params.toString()}`;
      }
      
      // Default behavior for my leads
      if (brokerId) {
        params.set('createdBy', brokerId);
      }
      if (q) params.set('search', q);
      if (effectiveFilters.status?.value && effectiveFilters.status.value !== 'all') params.set('status', effectiveFilters.status.value);
      // Only add broker filter if specifically selected (not 'all')
      if (effectiveFilters.broker?.value && effectiveFilters.broker.value !== 'all') {
        params.set('broker', effectiveFilters.broker.value);
      }
      if (effectiveFilters.region?.value && effectiveFilters.region.value !== 'all') params.set('regionId', effectiveFilters.region.value);
      if (effectiveFilters.propertyType?.value && effectiveFilters.propertyType.value !== 'all') params.set('propertyType', effectiveFilters.propertyType.value);
      if (effectiveFilters.requirement?.value && effectiveFilters.requirement.value !== 'all') params.set('requirement', effectiveFilters.requirement.value);
      if (effectiveFilters.startDate) params.set('startDate', effectiveFilters.startDate);
      if (effectiveFilters.endDate) params.set('endDate', effectiveFilters.endDate);
      if (typeof effectiveFilters.budgetMax === 'number' && effectiveFilters.budgetMax !== 500000) params.set('budgetMax', String(effectiveFilters.budgetMax));
      return `${apiUrl}/leads?${params.toString()}`;
    },
    [apiUrl, page, limit, debouncedQuery, brokerId, leadViewMode]
  );

  const loadLeads = useCallback(
    async (overrideFilters = null, overridePage = null, overrideLimit = null, overrideQuery = null, overrideViewMode = null) => {
      // Don't load leads if we don't have brokerId yet
      if (!brokerId && !brokerIdLoading) return;
      
      try {
        setLeadsLoading(true);
        setLeadsError('');
        const f = overrideFilters ?? filters;
        const p = overridePage ?? page;
        const l = overrideLimit ?? limit;
        const q = overrideQuery ?? debouncedQuery;
        const v = overrideViewMode ?? leadViewMode;

        const response = await fetch(buildRequestUrl(f, p, l, q, v), {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });

        if (response.ok) {
          const data = await response.json();
          let items = [], totalCount = 0;
          if (Array.isArray(data?.data?.items)) { items = data.data.items; totalCount = data.data.total ?? data.total ?? items.length; }
          else if (Array.isArray(data?.data?.leads)) { items = data.data.leads; totalCount = data.data.total ?? data.total ?? items.length; }
          else if (Array.isArray(data?.data)) { items = data.data; totalCount = data.total ?? items.length; }
          else if (Array.isArray(data?.leads)) { items = data.leads; totalCount = data.total ?? items.length; }
          else if (Array.isArray(data)) { items = data; totalCount = items.length; }
          setLeads(items);
          setTotal(totalCount);
        } else {
          setLeadsError('Failed to load leads');
          setLeads([]); setTotal(0);
        }
      } catch {
        setLeadsError('Error loading leads');
        setLeads([]); setTotal(0);
      } finally {
        setLeadsLoading(false);
      }
    },
    [filters, page, limit, debouncedQuery, token, buildRequestUrl, brokerId, brokerIdLoading, leadViewMode]
  );

  // Now that page/limit/loadLeads exist, define clearAdvancedFilters
  clearAdvancedFilters = () => {
    const reset = {
      ...filters,
      status: { value: 'all', label: 'All Status' },
      broker: { value: 'all', label: 'All Brokers' },
      region: { value: 'all', label: 'All Regions' },
      propertyType: { value: 'all', label: 'All Property Types' },
      requirement: { value: 'all', label: 'All Requirements' },
      startDate: '',
      endDate: '',
      budgetMax: 500000,
    };
    setFilters(reset);
    setPage(1);
    loadLeads(reset, 1, limit, debouncedQuery);
  };

  useEffect(() => { loadLeads(); }, [page, limit]); // eslint-disable-line
  useEffect(() => { page !== 1 ? setPage(1) : loadLeads(); }, [debouncedQuery]); // eslint-disable-line
  useEffect(() => { if (brokerId) loadLeads(); }, [brokerId]); // Load leads when brokerId is available
  useEffect(() => { loadLeads(); }, [leadViewMode]); // Load leads when view mode changes

  /* ───────────── Status styles to match screenshot ───────────── */
  const getStatusBadgeClasses = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'new') return 'bg-sky-100 text-sky-700';
    if (s === 'contacted' || s === 'in progress') return 'bg-amber-100 text-amber-700';
    if (s === 'qualified' || s === 'closed') return 'bg-emerald-100 text-emerald-700';
    if (s === 'rejected') return 'bg-rose-100 text-rose-700';
    return 'bg-gray-100 text-gray-700';
  };
  const getStatusAvatarClasses = (status) => 'bg-sky-50 text-sky-700';

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    const [a = '', b = ''] = name.trim().split(/\s+/);
    return (a[0] || '' + b[0] || '').toUpperCase();
  };

  /* ───────────── Regions fetch ───────────── */
  const loadRegions = async () => {
    try {
      setRegionsLoading(true); setRegionsError('');
      const res = await fetch(`${apiUrl}/regions`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('bad');
      const data = await res.json();
      let regions = [];
      if (data?.success && Array.isArray(data?.data?.regions)) regions = data.data.regions;
      else if (Array.isArray(data)) regions = data;
      else if (Array.isArray(data?.data)) regions = data.data;
      else if (Array.isArray(data?.regions)) regions = data.regions;
      else if (data?._id && data?.name) regions = [data];
      setRegionsList(regions);
    } catch {
      setRegionsError('Error loading regions');
      setRegionsList([]);
    } finally {
      setRegionsLoading(false);
    }
  };
  useEffect(() => { loadRegions(); }, []); // eslint-disable-line

  // Fetch nearest regions for the logged-in broker to suggest in Add Lead modal
  const loadNearestRegions = useCallback(async () => {
    if (!brokerId) return;
    try {
      setNearestRegionsLoading(true); setNearestRegionsError('');
      const url = `${apiUrl}/regions/nearest?brokerId=${encodeURIComponent(brokerId)}&limit=5`;
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('bad');
      const data = await res.json();
      let regions = [];
      if (data?.success && Array.isArray(data?.data?.regions)) regions = data.data.regions;
      else if (Array.isArray(data)) regions = data;
      else if (Array.isArray(data?.data)) regions = data.data;
      else if (Array.isArray(data?.regions)) regions = data.regions;
      else if (data?._id && data?.name) regions = [data];
      setNearestRegionsList(regions);
    } catch {
      setNearestRegionsError('Error loading nearest regions');
      setNearestRegionsList([]);
    } finally {
      setNearestRegionsLoading(false);
    }
  }, [apiUrl, token, brokerId]);

  // (moved) Refresh nearest regions when Add Lead opens; placed after showAddLead is defined

  /* ───────────── Options & Select styles (light blue per mock) ───────────── */
  const statusOptions = [
    { value: 'all', label: 'All Status', isAll: true },
    { value: 'New', label: 'New' },
    { value: 'Assigned', label: 'Assigned' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Rejected', label: 'Rejected' },
  ];
 const propertyTypeOptions = [
  { value: 'all', label: 'All Property Types' },
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Plot', label: 'Plot' },
  { value: 'Other', label: 'Other' }
];

  const requirementOptions = [  
    { value: 'all', label: 'All Requirements' }, 
    { value: 'buy', label: 'Buy' }, 
    { value: 'rent', label: 'Rent' },
    { value: 'sell', label: 'Sell' }
  ];
  const regionOptions = useMemo(() => ([
    { value: 'all', label: 'All Regions' },
    ...(Array.isArray(regionsList) ? regionsList.map(r => ({ value: r._id || r.id || r, label: r.name || r.region || r })) : [])
  ]), [regionsList]);

  const nearestRegionOptions = useMemo(() => (
    Array.isArray(nearestRegionsList)
      ? nearestRegionsList.map(r => ({ value: r._id || r.id || r, label: r.name || r.region || r }))
      : []
  ), [nearestRegionsList]);

  const customSelectStyles = {
    control: (p, s) => ({
      ...p,
      minHeight: '38px',
      borderRadius: 10,
      border: '1px solid #e5e7eb',
      fontFamily: 'var(--font-body, inherit)',
      fontSize: 14,
      boxShadow: s.isFocused ? '0 0 0 4px rgba(59,130,246,.1)' : 'none',
      borderColor: s.isFocused ? '#3b82f6' : '#e5e7eb', background: 'white',
      ':hover': { borderColor: s.isFocused ? '#3b82f6' : '#d1d5db' }
    }),
    valueContainer: (p) => ({ ...p, padding: '2px 10px', fontFamily: 'var(--font-body, inherit)', fontSize: 14 }),
    indicatorSeparator: () => ({ display: 'none' }),
    menuPortal: (p) => ({ ...p, zIndex: 99999 }),
    option: (p, s) => ({
      ...p,
      backgroundColor: s.isSelected ? '#3b82f6' : s.isFocused ? '#f1f5f9' : 'transparent',
      color: s.isSelected ? 'white' : s.isFocused ? '#111827' : '#4b5563',
      fontSize: 14,
      fontFamily: 'var(--font-body, inherit)',
      borderRadius: 6,
      margin: '2px 6px',
      padding: '8px 12px'
    }),
    singleValue: (p) => ({ ...p, color: '#6b7280', fontWeight: 400, fontFamily: 'var(--font-body, inherit)', fontSize: 14 }),
    input: (p) => ({ ...p, color: '#6b7280', fontWeight: 400, fontFamily: 'var(--font-body, inherit)', fontSize: 14 }),
    placeholder: (p) => ({ ...p, color: '#6b7280', fontWeight: 400, fontFamily: 'var(--font-body, inherit)', fontSize: 14 }),
    multiValueLabel: (p) => ({ ...p, color: '#6b7280', fontWeight: 400, fontFamily: 'var(--font-body, inherit)', fontSize: 14 }),
    menu: (p) => ({ ...p, zIndex: 9999, overflow: 'hidden', border: '1px solid #e5e7eb', borderRadius: 10, fontFamily: 'var(--font-body, inherit)', fontSize: 14 }),
    menuList: (p) => ({
      ...p,
      maxHeight: 240,
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingRight: 0,
      fontFamily: 'var(--font-body, inherit)',
      fontSize: 14
    }),
  };

  // Light avatar color helper
  const getAvatarColor = (seed) => {
    // Solid light colors with dark text for high readability
    const palette = [
      { bg: 'bg-sky-100', text: 'text-sky-800' },
      { bg: 'bg-emerald-100', text: 'text-emerald-800' },
      { bg: 'bg-violet-100', text: 'text-violet-800' },
    ];
    const s = String(seed || '');
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
    }
    return palette[hash % palette.length];
  };

  // No gradient needed now; avatars use solid light backgrounds

  // Region helpers (support new and old API shapes)
  const regionIdToName = useMemo(() => {
    const map = new Map();
    (Array.isArray(regionsList) ? regionsList : []).forEach((reg) => {
      const id = reg?._id || reg?.id;
      const name = reg?.name || reg?.region || reg?.city || '';
      if (id && name) map.set(String(id), String(name));
    });
    return map;
  }, [regionsList]);

  const getRegionName = (r) => {
    if (!r) return '';
    if (typeof r === 'string') return regionIdToName.get(r) || r;
    if (typeof r === 'object') return r.name || r.region || r.city || '';
    return '';
  };
  const getPrimarySecondaryRegionText = (row) => {
    const primary = row?.primaryRegion || row?.region;
    const secondary = row?.secondaryRegion;
    const p = getRegionName(primary);
    const s = getRegionName(secondary);
    return s ? `${p} • ${s}` : (p || '—');
  };

  const getRegionNames = (row) => {
    const primary = getRegionName(row?.primaryRegion || row?.region);
    const secondary = getRegionName(row?.secondaryRegion);
    return { primary, secondary };
  };

  /* ───────────── Add Lead modal ───────────── */
  const [showAddLead, setShowAddLead] = useState(false);
  const [addLeadLoading, setAddLeadLoading] = useState(false);
  const [newLead, setNewLead] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    requirement: { value: 'all', label: 'All Requirements' }, propertyType: { value: 'all', label: 'All propertyType' },
    budget: '', primaryRegion: null, secondaryRegion: null, notes: '', files: null
  });
  const [validationErrors, setValidationErrors] = useState({});
  
  // Refresh nearest regions when Add Lead opens; ensure this is declared after showAddLead
  useEffect(() => {
    if (showAddLead && brokerId) {
      loadNearestRegions();
    }
  }, [showAddLead, brokerId, loadNearestRegions]);
  
  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!newLead.customerName.trim()) {
      errors.customerName = 'Customer name is required';
    }
    
    if (!newLead.customerPhone.trim()) {
      errors.customerPhone = 'Phone number is required';
    } else if (!validatePhone(newLead.customerPhone)) {
      errors.customerPhone = 'Phone number must be exactly 10 digits';
    }
    
    if (!newLead.customerEmail.trim()) {
      errors.customerEmail = 'Email is required';
    } else if (!validateEmail(newLead.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNewLeadChange = (e) => {
    const { name, value, files } = e.target;
    
    // Special handling for phone number - only allow digits and limit to 10
    if (name === 'customerPhone') {
      const digitsOnly = value.replace(/\D/g, '');
      const limitedValue = digitsOnly.slice(0, 10);
      setNewLead((p) => ({ ...p, [name]: limitedValue }));
      
      // Real-time validation for phone - only show error if user tries to submit without 10 digits
      const errors = { ...validationErrors };
      if (limitedValue.length > 0 && limitedValue.length < 10) {
        errors.customerPhone = `Phone number must be 10 digits`;
      } else {
        delete errors.customerPhone;
      }
      setValidationErrors(errors);
      return;
    }
    
    // Special handling for email - real-time validation
    if (name === 'customerEmail') {
      setNewLead((p) => ({ ...p, [name]: value }));
      
      // Real-time validation for email - only show error if user tries to submit with invalid email
      const errors = { ...validationErrors };
      if (value.length > 0 && !validateEmail(value)) {
        errors.customerEmail = 'Please enter a valid email address';
      } else {
        delete errors.customerEmail;
      }
      setValidationErrors(errors);
      return;
    }
    
    // For other fields
    setNewLead((p) => ({ ...p, [name]: files ? files : value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const modalSelectStyles = {
  ...customSelectStyles,
  menuPortal: (base) => ({ ...base, zIndex: 999999 }), // above modal/overlay
};
  const handleAddLeadSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }
    
    try {
      setAddLeadLoading(true);
      const req = typeof newLead.requirement === 'object' ? (newLead.requirement.label || newLead.requirement.value) : newLead.requirement;
      const ptype = typeof newLead.propertyType === 'object' ? (newLead.propertyType.label || newLead.propertyType.value) : newLead.propertyType;
      const primaryRegionId = (newLead.primaryRegion && typeof newLead.primaryRegion === 'object')
        ? (newLead.primaryRegion.value || newLead.primaryRegion._id)
        : newLead.primaryRegion;
      const secondaryRegionId = (newLead.secondaryRegion && typeof newLead.secondaryRegion === 'object')
        ? (newLead.secondaryRegion.value || newLead.secondaryRegion._id)
        : newLead.secondaryRegion;
      const payload = {
        customerName: newLead.customerName || '',
        customerPhone: newLead.customerPhone || '',
        customerEmail: newLead.customerEmail || '',
        requirement: req || '',
        propertyType: ptype || '',
        budget: newLead.budget !== '' && newLead.budget !== null ? parseFloat(newLead.budget) : 0,
        // API requires primaryRegionId (required) and secondaryRegionId (optional)
        primaryRegionId: primaryRegionId && primaryRegionId !== 'select region' ? primaryRegionId : '',
        createdBy: brokerId, // Explicitly set the createdBy field
      };
      if (secondaryRegionId && secondaryRegionId !== 'select region') {
        payload.secondaryRegionId = secondaryRegionId;
      }
      
      // creating lead payload
      
      const res = await fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          const msg = err?.message || err?.error || 'Failed to create lead';
          toast.error(msg);
        } catch {
          toast.error('Failed to create lead');
        }
        return;
      }
      toast.success('Lead created successfully');
      await loadLeads(); 
      setShowAddLead(false);
      setNewLead({ customerName:'', customerPhone:'', customerEmail:'', requirement:'select requirement', propertyType:'select propertyType', budget:'', region:'select region', notes:'', files:null });
      setValidationErrors({});
    } catch { toast.error('Error creating lead'); }
    finally {
      setAddLeadLoading(false);
    }
  };

  /* ───────────── Transfer modal ───────────── */
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({ brokerIds:[], notes: '', selectAllFiltered: false });
  const [transferFilter, setTransferFilter] = useState('');
  const transferSelectRef = useRef(null);
  
  // Custom react-select MenuList with a Select All checkbox
  const BrokerMenuList = (props) => {
    const { children } = props;
    const selectAllChecked = !!transferForm.selectAllFiltered;
    // Compute visible options from current props (supports single child and groups)
    const rawChildren = props?.children;
    const toArray = (c) => (Array.isArray(c) ? c : (c ? [c] : []));
    const options = toArray(rawChildren)
      .flatMap((child) => {
        const direct = child?.props?.data?.value;
        if (direct) return [direct];
        const grouped = toArray(child?.props?.children).map((gc) => gc?.props?.data?.value).filter(Boolean);
        return grouped;
      })
      .filter(Boolean);
    return (
      <div>
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
          <span className="text-xs text-slate-600">Filtered brokers</span>
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              checked={selectAllChecked}
              onChange={(e) => {
                const checked = e.target.checked;
                setTransferForm((prev) => ({
                  ...prev,
                  selectAllFiltered: checked,
                  brokerIds: checked
                    ? Array.from(new Set([...(prev.brokerIds || []), ...options]))
                    : (prev.brokerIds || []).filter((id) => !options.includes(id))
                }));
                // keep the menu open and focus the input again
                try {
                  const input = document.querySelector('[id^="react-select"][id$="-input"]');
                  input?.focus();
                } catch {}
                // Auto-uncheck after applying so user can use it again easily
                if (checked) {
                  setTimeout(() => setTransferForm((prev) => ({ ...prev, selectAllFiltered: false })), 0);
                }
              }}
            />
            Select all
          </label>
        </div>
        <RSComponents.MenuList {...props}>{children}</RSComponents.MenuList>
      </div>
    );
  };
  const [transferLoading, setTransferLoading] = useState(false);
  const [brokersList, setBrokersList] = useState([]);
  const [brokersLoading, setBrokersLoading] = useState(false);
  const [brokersError, setBrokersError] = useState('');

  const loadBrokers = async () => {
    try {
      setBrokersLoading(true); setBrokersError('');
      const base = apiUrl ;
      const res = await fetch(`${base}/brokers`, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('bad');
      const data = await res.json();
      let items = [];
      if (Array.isArray(data?.data?.brokers)) items = data.data.brokers;
      else if (Array.isArray(data?.data)) items = data.data;
      else if (Array.isArray(data?.brokers)) items = data.brokers;
      else if (Array.isArray(data)) items = data;
      setBrokersList(items);
    } catch {
      setBrokersError('Failed to load brokers');
      setBrokersList([]);
    } finally {
      setBrokersLoading(false);
    }
  };

  // Delete lead
  const handleDeleteLead = async (lead) => {
    // Check if lead has been transferred
    const transferredTo = lead?.transferredTo || lead?.transferredBrokers || lead?.transfers || [];
    if (Array.isArray(transferredTo) && transferredTo.length > 0) {
      toast.error('Cannot delete lead that has been transferred to other brokers');
      return;
    }
    
    try {
      const leadId = lead?._id || lead?.id;
      if (!leadId) { toast.error('Invalid lead id'); return; }
      const res = await fetch(`${apiUrl}/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          const msg = err?.message || err?.error || 'Failed to delete lead';
          toast.error(msg);
        } catch {
          toast.error('Failed to delete lead');
        }
        return;
      }
      toast.success('Lead deleted');
      await loadLeads();
    } catch (e) {
      toast.error('Error deleting lead');
    }
  };

  const openTransferForLead = (lead) => {
    setSelectedLead(lead);
    setTransferForm({ brokerIds: [], notes: '' });
    setShowTransfer(true);
    if (!brokersList || brokersList.length === 0) {
      loadBrokers();
    }
  };

  const submitTransfer = async () => {
    if (!selectedLead) { toast.error('No lead selected'); return; }
    const leadId = selectedLead._id || selectedLead.id;
    const toBrokers = (transferForm.brokerIds || []).filter((id) => id !== 'all');
    if (!leadId) { toast.error('Invalid lead id'); return; }
    if (!toBrokers.length) { toast.error('Select at least one broker'); return; }

    try {
      setTransferLoading(true);
      const res = await fetch(`${apiUrl}/leads/${leadId}/transfer-and-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ toBrokers, notes: transferForm.notes || '' })
      });
      if (!res.ok) { toast.error('Failed to transfer lead'); return; }
      toast.success('Transfer request sent');
      setShowTransfer(false);
      setTransferForm({ brokerIds: [], notes: '' });
    } catch {
      toast.error('Error sending transfer request');
    } finally {
      setTransferLoading(false);
    }
  };

  /* ───────────── View Drawer ───────────── */
  const [showView, setShowView] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewEditMode, setViewEditMode] = useState(false);
  const [viewClosing, setViewClosing] = useState(false);
  const [statusEditMode, setStatusEditMode] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [viewForm, setViewForm] = useState({
    name: '',
    contact: '',
    email: '',
    budget: '',
    requirement: '',
    propertyType: '',
    primaryRegion: null,
    secondaryRegion: null,
    status: '',
  });
  const [viewSaving, setViewSaving] = useState(false);
  const [pendingDeleteTransferId, setPendingDeleteTransferId] = useState(null);

  // Delete a specific transfer (to-broker) for the selected lead
  const deleteTransfer = async (toBrokerId) => {
    try {
      if (!selectedLead || !toBrokerId) return;
      const leadId = selectedLead._id || selectedLead.id;
      const res = await fetch(`${apiUrl}/leads/${encodeURIComponent(leadId)}/transfers/${encodeURIComponent(toBrokerId)}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          toast.error(err?.message || err?.error || 'Failed to delete transfer');
        } catch {
          toast.error('Failed to delete transfer');
        }
        return;
      }
      toast.success('Transfer removed');
      // Refresh selectedLead transfers: reload lead or mutate locally
      // Simple approach: reload the leads list and re-open view drawer
      await loadLeads();
      // Also optimistically remove from selectedLead in memory
      setSelectedLead((prev) => {
        if (!prev) return prev;
        const toId = toBrokerId;
        const filtered = Array.isArray(prev.transfers)
          ? prev.transfers.filter(tr => {
              const id = (tr && typeof tr.toBroker === 'object') ? (tr.toBroker?._id || tr.toBroker?.id) : tr?.toBroker;
              return String(id) !== String(toId);
            })
          : [];
        return { ...prev, transfers: filtered };
      });
      setPendingDeleteTransferId(null);
    } catch {
      toast.error('Error deleting transfer');
    }
  };
  const saveViewEdits = async () => {
    if (!selectedLead) return;
    try {
      setViewSaving(true);
      const leadId = selectedLead._id || selectedLead.id;
      const payload = {
        customerName: viewForm.name !== undefined ? viewForm.name : (selectedLead.customerName || selectedLead.name || ''),
        customerPhone: viewForm.contact !== undefined ? viewForm.contact : (selectedLead.customerPhone || ''),
        customerEmail: viewForm.email !== undefined ? viewForm.email : (selectedLead.customerEmail || ''),
        requirement: viewForm.requirement !== undefined ? viewForm.requirement : (selectedLead.requirement || ''),
        propertyType: viewForm.propertyType !== undefined ? viewForm.propertyType : (selectedLead.propertyType || ''),
        budget: viewForm.budget !== '' && viewForm.budget !== null ? Number(viewForm.budget) : (typeof selectedLead.budget === 'number' ? selectedLead.budget : 0),
        status: viewForm.status ? viewForm.status : (selectedLead.status || 'New'),
      };
      if (viewForm.primaryRegion && viewForm.primaryRegion.value && viewForm.primaryRegion.value !== 'all') {
        payload.primaryRegionId = viewForm.primaryRegion.value;
      }
      if (viewForm.secondaryRegion && viewForm.secondaryRegion.value && viewForm.secondaryRegion.value !== 'all') {
        payload.secondaryRegionId = viewForm.secondaryRegion.value;
      }

      const res = await fetch(`${apiUrl}/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          const msg = err?.message || err?.error || 'Failed to update lead';
          toast.error(msg);
        } catch {
          toast.error('Failed to update lead');
        }
        return;
      }
      const data = await res.json();
      const updated = data?.data || data;

      setSelectedLead((prev) => ({
        ...prev,
        ...updated,
        name: updated.name || updated.customerName || viewForm.name || prev?.name,
        customerName: updated.customerName || viewForm.name || prev?.customerName,
        contact: updated.contact || updated.customerPhone || viewForm.contact || prev?.contact,
        customerPhone: updated.customerPhone || viewForm.contact || prev?.customerPhone,
        customerEmail: updated.customerEmail || viewForm.email || prev?.customerEmail,
        requirement: updated.requirement || viewForm.requirement || prev?.requirement,
        propertyType: updated.propertyType || viewForm.propertyType || prev?.propertyType,
        budget: typeof updated.budget === 'number' ? updated.budget : (viewForm.budget !== '' ? Number(viewForm.budget) : prev?.budget),
        primaryRegion: updated.primaryRegion || (viewForm.primaryRegion ? { name: viewForm.primaryRegion.label, _id: viewForm.primaryRegion.value } : prev?.primaryRegion || prev?.region),
        secondaryRegion: updated.secondaryRegion || (viewForm.secondaryRegion ? { name: viewForm.secondaryRegion.label, _id: viewForm.secondaryRegion.value } : prev?.secondaryRegion),
      }));

      toast.success('Lead updated');
      setViewEditMode(false);
      await loadLeads();
    } catch (e) {
      toast.error('Error updating lead');
    } finally {
      setViewSaving(false);
    }
  };

  const saveStatusUpdate = async (newStatus) => {
    if (!selectedLead) return;
    try {
      setStatusSaving(true);
      const leadId = selectedLead._id || selectedLead.id;
      const payload = {
        status: newStatus,
      };

      const res = await fetch(`${apiUrl}/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          const msg = err?.message || err?.error || 'Failed to update status';
          toast.error(msg);
        } catch {
          toast.error('Failed to update status');
        }
        return;
      }
      const data = await res.json();
      const updated = data?.data || data;

      setSelectedLead((prev) => ({
        ...prev,
        status: updated.status || newStatus,
      }));

      toast.success('Status updated successfully');
      setStatusEditMode(false);
      await loadLeads();
    } catch (e) {
      toast.error('Error updating status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleViewFieldChange = (e) => setViewForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const clearFilters = () => {
    const reset = { query:'', status:{ value:'all', label:'All Statuses' }, broker:{ value:'all', label:'All Brokers' }, region:{ value:'all', label:'All Regions' }, propertyType:{ value:'all', label:'All Property Types' }, requirement:{ value:'all', label:'All Requirements' }, startDate:'', endDate:'', budgetMax:500000 };
    setFilters(reset); setPage(1); loadLeads(reset, 1, limit, '');
  };

  /* ───────────── Content Loader Components ───────────── */
  const ContentLoader = ({ className = "" }) => (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const TableRowLoader = () => (
    <div className="grid grid-cols-12 items-center px-6 py-4 animate-pulse">
      <div className="col-span-2 flex items-center gap-3">
        <div className="h-4 w-28 rounded bg-gray-200" />
      </div>
      <div className="col-span-2 h-4 w-40 rounded bg-gray-200" />
      <div className="col-span-2 h-4 w-28 rounded bg-gray-200" />
      <div className="col-span-1 h-4 w-14 rounded bg-gray-200" />
      <div className="col-span-2 h-4 w-20 rounded bg-gray-200" />
      <div className="col-span-1 flex justify-center">
        <div className="h-6 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="col-span-2 flex justify-end gap-2">
        <div className="w-7 h-7 rounded-lg bg-gray-200" />
        <div className="w-7 h-7 rounded-lg bg-gray-200" />
        <div className="w-7 h-7 rounded-lg bg-gray-200" />
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">
        {filters.query || filters.status?.value !== 'all' || filters.region?.value !== 'all' || filters.propertyType?.value !== 'all' || filters.requirement?.value !== 'all' || filters.budgetMax !== 500000
          ? "No leads match your current filters. Try adjusting your search criteria."
          : "You don't have any leads yet. Click 'Add New Lead' to get started."
        }
      </p>
      {(!filters.query && filters.status?.value === 'all' && filters.region?.value === 'all' && filters.propertyType?.value === 'all' && filters.requirement?.value === 'all' && filters.budgetMax === 500000) && (
        <button
          onClick={() => setShowAddLead(true)}
          className="mt-4 px-4 py-2 bg-green-900 text-white text-sm font-semibold rounded-lg hover:bg-green-950 transition-colors"
        >
          Add Your First Lead
        </button>
      )}
    </div>
  );

  return (
    <ProtectedRoute requiredRole="broker">
      
      <div className="min-h-screen bg-white py-16">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="w-full mx-auto px-6 ">
          {/* 9 / 3 layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Header */}
 {/* Left 9 */}
            <div className="md:col-span-9">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
            <h1 className="text-4xl font-display text-gray-700">Leads & Visitors</h1>
            <p className="text-sm font-body text-gray-600 mt-2">Track and manage your sales pipeline effectively</p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    setLeadViewMode('my-leads');
                    setPage(1);
                    loadLeads(filters, 1, limit, debouncedQuery, 'my-leads');
                  }}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm  transition-all duration-200 ${
                    leadViewMode === 'my-leads'
                      ? 'bg-green-900 text-white shadow-lg shadow-green-200'
                      : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Leads
                </button>
                <button
                  onClick={() => {
                    setLeadViewMode('transferred');
                    setPage(1);
                    loadLeads(filters, 1, limit, debouncedQuery, 'transferred');
                  }}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm  transition-all duration-200 ${
                    leadViewMode === 'transferred'
                      ? 'bg-green-900 text-white shadow-lg shadow-green-200'
                      : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Transferred to Me
                </button>
              </div>
            </div>
          </div>

          
           
              {/* Stat row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
  <StatCard
    color="sky"
    label="Total Leads"
    value={metricsLoading ? '—' : metrics.totalLeads.toLocaleString()}
    // deltaText={metricsError ? 'Unable to load' : '↑ 12.5% vs last month'}
    trend="up"
  />
  <StatCard
    color="amber"
    label="Shared With Me"
    value={metricsLoading ? '—' : Number(metrics.transferredToMe || metrics.transfersToMe || 0).toLocaleString()}
    deltaText=""
    trend="up"
  />
  <StatCard
    color="emerald"
    label="Shared By Me"
    value={metricsLoading ? '—' : Number(metrics.transferredByMe || metrics.transfersByMe || 0).toLocaleString()}
    deltaText=""
    trend="up"
  />
  {/* <StatCard
    color="violet"
    label="Avg. Deal Size"
    value={metricsLoading ? '—' : `$${Number(metrics.avgDealSize || 0).toLocaleString()}`}
    deltaText={metricsError ? 'Unable to load' : '↑ 5.1% vs last month'}
    trend="up"
  /> */}
          </div>

              {/* Search + status + buttons - Flexible layout */}
              <div className="mt-6 flex items-center gap-3">
                {/* Search - Flexible width */}
                <div className={`relative ${isAdvancedFiltersApplied ? 'flex-1' : 'flex-1'}`}>
              <input
                type="text"
                    placeholder="Search leads..."
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl shadow-sm bg-white text-sm focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500"
              />
                  <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              {/* Search indicator */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

                {/* Status Filter - Fixed width */}
                <div className="w-48">
              <Select
                value={filters.status}
                    onChange={(opt) => { const next = { ...filters, status: opt }; setFilters(next); setPage(1); loadLeads(next, 1, limit, debouncedQuery); }}
                options={statusOptions}
                styles={customSelectStyles}
                    isSearchable
                    menuPlacement="bottom"
              />
            </div>

                {/* Advanced Filters - Fixed width */}
                <div>
            <button
              type="button"
                  onClick={() => setShowAdvanced(true)}
                    className="px-3 py-2.5 rounded-xl text-sm  border border-green-300 bg-white text-green-700 hover:bg-green-50 hover:border-green-500 shadow-sm cursor-pointer whitespace-nowrap"
            >
              Advanced Filters
            </button>
                </div>
                
                {/* Add New Lead - Fixed width */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAddLead(true)}
                    className="px-3 py-2.5 rounded-xl text-sm  text-white bg-green-900 hover:bg-emerald-700 shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    Add New Lead
                  </button>
                </div>
                
                {/* Clear Filters - Fixed width, only when needed */}
            {isAdvancedFiltersApplied && (
                  <div>
              <button
                type="button"
                onClick={clearAdvancedFilters}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer whitespace-nowrap"
                title="Clear advanced filters"
              >
                Clear Filters
              </button>
                  </div>
                )}
                </div>

            {/* Table */}
<div className="mt-6">
  {/* Loading */}
  {leadsLoading && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 animate-pulse">
          <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
          <div className="h-28 w-full bg-gray-100 rounded mb-4" />
          <div className="flex items-center justify-between">
            <div className="h-7 w-28 bg-gray-200 rounded" />
            <div className="flex gap-2">
              <div className="h-7 w-7 bg-gray-200 rounded-lg" />
              <div className="h-7 w-7 bg-gray-200 rounded-lg" />
              <div className="h-7 w-7 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )}

  {/* Empty State */}
  {!leadsLoading && Array.isArray(leads) && leads.length === 0 && <EmptyState />}

   {/* Cards */}
   {!leadsLoading && Array.isArray(leads) && leads.length > 0 && (
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
       {leads.map((row, idx) => {
         // ----- Shared With (avatars from transfers) -----
         const transfers = Array.isArray(row?.transfers) ? row.transfers : [];
         const toBrokers = transfers
           .map(t => (typeof t?.toBroker === "object" ? t.toBroker : { _id: t?.toBroker }))
           .filter(b => b && (b._id || b.name || b.email));
         const uniqueToBrokers = Array.from(
           new Map(toBrokers.map(b => [b._id || b.email || b.name, b])).values()
         );
         const idToBroker = new Map((brokersList || []).map(b => [b._id || b.id, b]));
         const avatars = uniqueToBrokers.map(b => {
           const merged = b._id ? { ...(idToBroker.get(b._id) || {}), ...b } : b;
           return {
             id: merged._id || merged.id || merged.email || merged.name,
             name: merged.name || merged.fullName || merged.email || "Broker",
             image: merged.brokerImage || merged.avatarUrl || merged.imageUrl || "",
           };
         });

         const isTransferred = (() => {
           const transferredTo = row?.transferredTo || row?.transferredBrokers || row?.transfers || [];
           return Array.isArray(transferredTo) && transferredTo.length > 0;
         })();

         return (
           <div
             key={row._id || row.id || idx}
            className="group relative bg-white rounded-2xl shadow-2xl"
           >
             {/* Status Badge - Horizontal Ribbon with Folded Corner */}
             <div className="absolute top-0 right-0 z-10">
               <div
                 className="text-white text-xs font-bold px-4 py-2 relative"
                 style={{
                   background: row.status?.toLowerCase() === "new"
                     ? "linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)"
                     : row.status?.toLowerCase() === "assigned"
                     ? "linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)"
                     : row.status?.toLowerCase() === "in progress"
                     ? "linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)"
                     : row.status?.toLowerCase() === "closed"
                     ? "linear-gradient(90deg, #10b981 0%, #047857 100%)"
                     : row.status?.toLowerCase() === "rejected"
                     ? "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)"
                     : row.status?.toLowerCase() === "transferred"
                     ? "linear-gradient(90deg, #f97316 0%, #ea580c 100%)"
                     : row.status?.toLowerCase() === "active"
                     ? "linear-gradient(90deg, #10b981 0%, #047857 100%)"
                     : "linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)",
                   minWidth: "60px",
                   textAlign: "center",
                   boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                   clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)"
                 }}
               >
                 {row.status ? row.status.toUpperCase() : "NEW"}
               </div>
             </div>
             {/* Card Content */}
             <div className="p-6 pt-8">
               {/* Header Section */}
               <div className="flex items-start justify-between mb-6">
                 {/* Left Side - Avatar and Name */}
                 <div className="flex items-start gap-4">
                  {(() => { 
                    const seed = row.customerName || row.name; 
                    const c = getAvatarColor(seed);
                    return (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${c.bg} ${c.text}`}>
                     {(row.customerName || row.name || "-")
                       .split(" ")
                       .map(s => s[0])
                       .filter(Boolean)
                       .join("")
                       .slice(0, 2)
                       .toUpperCase()}
                  </div>
                  ); })()}
                   <div className="flex-1 pr-4">
                     <h3 className="text-lg font-bold text-gray-900 mb-1 break-words leading-tight">
                       {row.customerName || row.name || "-"}
                     </h3>
                     <p className="text-sm text-gray-500 break-words leading-tight">
                       {row.customerEmail || row.customerPhone || row.contact || "-"}
                     </p>
                   </div>
                 </div>
               </div>

               {/* Lead Details Section - Two Rows */}
               <div className="space-y-4">
                 {/* First Row */}
                 <div className="flex justify-between items-center py-3 border-b border-gray-100">
                   <div className="flex-1">
                     <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">REQUIREMENT</div>
                     <div className="text-sm font-medium text-gray-700 break-words leading-tight">
                       {row.requirement || row.req || "—"}
                     </div>
                   </div>
                   <div className="flex-1 pl-4">
                     <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">PROPERTY TYPE</div>
                     <div className="text-sm font-medium text-gray-700 break-words leading-tight">
                       {row.propertyType || "—"}
                     </div>
                   </div>
                 </div>

                 {/* Second Row */}
                 <div className="flex justify-between items-center py-3">
                   <div className="flex-1">
                     <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">BUDGET</div>
                     <div className="text-sm font-medium text-gray-700 break-words leading-tight">
                       {typeof row.budget === "number"
                         ? `$${row.budget.toLocaleString()}`
                         : row.budget || "—"}
                     </div>
                   </div>
                   <div className="flex-1 pl-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">REGION(S)</div>
                    {(() => { const { primary, secondary } = getRegionNames(row); return (
                      <div className="text-sm font-medium text-gray-700 break-words leading-tight">
                        <div>{primary || '—'}</div>
                        {secondary && <div className="text-sm font-medium text-gray-700">{secondary}</div>}
                      </div>
                    ); })()}
                   </div>
                 </div>
               </div>

               {/* Bottom Section - Shared With and Actions */}
               <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                 {/* Shared With */}
                 <div>
                   <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">SHARED WITH</div>
                   {(() => {
                     const transfers = Array.isArray(row?.transfers) ? row.transfers : [];
                     // Extract toBroker objects/ids and normalize
                     const toBrokers = transfers
                       .map(t => (typeof t?.toBroker === 'object' ? t.toBroker : { _id: t?.toBroker }))
                       .filter(b => b && (b._id || b.name || b.email));
                     const uniqueToBrokers = Array.from(new Map(toBrokers.map(b => [b._id || b.email || b.name, b])).values());

                     if (uniqueToBrokers.length === 0) {
                       return <span className="text-[12px] text-gray-400">Not shared</span>;
                     }

                     // Map to avatar data: prefer brokerImage from embedded object; fallback to brokersList by id
                     const idToBroker = new Map((brokersList || []).map(b => [b._id || b.id, b]));
                     const avatars = uniqueToBrokers.map(b => {
                       const merged = b._id ? { ...(idToBroker.get(b._id) || {}), ...b } : b;
                       return {
                         id: merged._id || merged.id || merged.email || merged.name,
                         name: merged.name || merged.fullName || merged.email || 'Broker',
                         image: merged.brokerImage || merged.avatarUrl || merged.imageUrl || ''
                       };
                     });

                     const visible = avatars.slice(0, 2);
                     const remaining = Math.max(0, avatars.length - visible.length);

                     return (
                       <div className="flex items-center">
                         <div className="flex -space-x-2">
                           {visible.map((a, i) => (
                             <div key={`${a.id || 'broker'}-${i}`} className="w-7 h-7 rounded-full ring-2 ring-white bg-gray-200 overflow-hidden flex items-center justify-center text-[10px] text-gray-600" title={a.name}>
                               <img src={a.image || 'https://www.w3schools.com/howto/img_avatar.png'} alt={a.name} className="w-full h-full object-cover" />
                             </div>
                           ))}
                           {remaining > 0 && (
                             <div className="w-7 h-7 rounded-full ring-2 ring-white bg-yellow-400 text-black flex items-center justify-center text-[11px] font-semibold" title={`+${remaining} more`}>
                               +{remaining}
                             </div>
                           )}
                         </div>
                       </div>
                     );
                   })()}
                 </div>

                 {/* Action Icons */}
                 <div className="flex items-center gap-4">
                   {/* View Button */}
                   <button
                     title="View Details"
                     className="flex flex-col items-center gap-1 text-green-900 hover:text-green-900 transition-colors cursor-pointer"
                     onClick={() => {
                       setSelectedLead(row);
                       setViewEditMode(false);
                       setViewClosing(false);
                       setViewForm({
                         name: row.customerName || row.name || "",
                         contact: row.customerPhone || row.contact || "",
                         email: row.customerEmail || "",
                         budget: String(row.budget ?? ""),
                         requirement: row.requirement || row.req || "",
                         propertyType: row.propertyType || "",
                          primaryRegion: row.primaryRegion
                            ? { value: row.primaryRegion._id || row.primaryRegion.id || row.primaryRegion, label: row.primaryRegion.name || row.primaryRegion }
                            : (row.region ? (typeof row.region === 'object' ? { value: row.region._id || row.region.id || row.region, label: row.region.name || row.region } : { value: row.region, label: getRegionName(row.region) || row.region }) : null),
                          secondaryRegion: row.secondaryRegion
                            ? { value: row.secondaryRegion._id || row.secondaryRegion.id || row.secondaryRegion, label: row.secondaryRegion.name || row.secondaryRegion }
                            : null,
                         status: row.status || "active",
                       });
                       setShowView(true);
                     }}
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                     <span className="text-xs">View</span>
                   </button>

                   {/* Transfer Button */}
                   <button
                     title="Transfer Lead"
                     className="flex flex-col items-center gap-1 text-blue-700 hover:text-blue-800 transition-colors cursor-pointer"
                     onClick={() => openTransferForLead(row)}
                   >
                     <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
                     <span className="text-xs">Transfer</span>
                   </button>

                   {/* Delete Button */}
                   <button
                     title="Delete Lead"
                     className={`flex flex-col items-center gap-1 transition-colors ${
                       isTransferred 
                         ? 'text-gray-300 cursor-not-allowed' 
                         : 'text-red-700 hover:text-red-700 cursor-pointer'
                     }`}
                     onClick={() => !isTransferred && handleDeleteLead(row)}
                     disabled={isTransferred}
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                     <span className="text-xs">Delete</span>
                   </button>
                 </div>
               </div>
             </div>
           </div>
         );
       })}
     </div>
   )}
</div>





              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 bg-white cursor-pointer" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
                  <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 bg-white cursor-pointer" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
            </div>
              </div>
                    </div>

            {/* Right 3 (sticky) */}
           <aside className="md:col-span-3 space-y-6 md:sticky md:top-6 self-start">

  {/* Recent Activity */}
<div className="bg-white rounded-2xl shadow-2xl p-4">
  <h4 className="text-[15px] font-bold text-slate-900 mb-3 flex items-center gap-2">
    {/* clock-in-circle */}
    <svg
      className="w-4 h-4 text-sky-600 shrink-0 overflow-visible"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7v5l4 2" />
    </svg>
    Recent Activity
  </h4>

  <ul className="text-sm text-slate-900 space-y-3">
    {/* New lead created */}
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-50 text-sky-600 ring-1 ring-sky-100">
        {/* user-plus */}
        <svg className="w-=4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M19 8v6M22 11h-6" />
        </svg>
      </span>
      <div className="flex-1">
        <div className="text-gray-700 leading-5 mb-1">New lead created</div>
        <div className="text-xs text-slate-500 leading-5">Today, 10:45 AM</div>
      </div>
    </li>

    {/* Follow-up email */}
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-50 text-sky-600 ring-1 ring-indigo-100">
        {/* mail */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M22 7 12 13 2 7" />
        </svg>
      </span>
      <div className="flex-1">
        <div className="text-gray-700 leading-5 mb-1">Follow-up email sent to Michael Chen</div>
        <div className="text-xs text-slate-500 leading-5">Yesterday, 3:20 PM</div>
      </div>
    </li>

    {/* Qualified */}
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-50 text-sky-600 ring-1 ring-emerald-100">
        {/* check */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <div className="flex-1">
        <div className="text-gray-700 leading-5 mb-1">Lead status changed to Qualified</div>
        <div className="text-xs text-slate-500 leading-5">Yesterday, 11:15 AM</div>
      </div>
    </li>
  </ul>
</div>


  {/* FAQ */}
<div className="bg-white rounded-2xl shadow-2xl p-4">
  <div className="flex items-center justify-between mb-2">
  <h4 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
    {/* chat/faq icon */}
    <svg
      className="w-4 h-4 text-sky-600 shrink-0 overflow-visible"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* message square */}
      <rect x="3" y="4" width="18" height="14" rx="3" />
      {/* tail */}
      <path d="M8 18v3l3-3" />
    </svg>
    FAQ
  </h4>
    <a href="/faq" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-sky-700 hover:underline hover:text-sky-800 transition-colors">View all</a>
  </div>

  <div className="space-y-2 text-sm">
    {/* Item 1 */}
    <details className="group relative rounded-xl border border-slate-100 p-4 pr-5 transition-colors" open>
      <summary className="list-none cursor-pointer flex items-center justify-between">
        <span className="text-[15px]  text-gray-700">
          How do I import leads from CSV?
        </span>
        <svg
          className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 group-open:text-gray-600 shrink-0 overflow-visible"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
<p className="mt-2 pl-3 md:pl-4 text-[13px] leading-6 text-gray-600 border-l-2 border-gray-300">
        Go to Settings → Import Data → Select CSV format and follow the template
        instructions to map your fields correctly.
      </p>
      
    </details>

    {/* Item 2 */}
    <details className="group relative rounded-xl border border-slate-100 p-4 pr-5 transition-colors">
      <summary className="list-none cursor-pointer flex items-center justify-between">
        <span className="text-[15px]  text-gray-700">
          Can I customize lead statuses?
        </span>
        <svg
          className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 group-open:text-gray-600 shrink-0 overflow-visible"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
<p className="mt-2 pl-3 md:pl-4 text-[13px] leading-6 text-slate-600 border-l-2 border-gray-300">
        Yes, you can add, edit, or remove lead statuses from Settings → Lead
        Management → Status Configuration.
      </p>
    </details>

    {/* Item 3 */}
    <details className="group relative rounded-xl border border-slate-100 p-4 pr-5 transition-colors">
      <summary className="list-none cursor-pointer flex items-center justify-between">
        <span className="text-[15px]  text-gray-700">
          How to set up email notifications?
        </span>
        <svg
          className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 group-open:text-gray-600 shrink-0 overflow-visible"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
<p className="mt-2 pl-3 md:pl-4 text-[13px] leading-6 text-slate-600 border-l-2 border-gray-300">
        Navigate to Profile → Notifications and select which lead activities you
        want to receive alerts for.
      </p>
    </details>
  </div>
</div>


  {/* Help & Support */}
 <div className="bg-white rounded-2xl shadow-2xl">
  <div className="p-4">
    <h4 className="text-md font-bold text-slate-900 mb-3 flex items-center gap-2 pl-0.5">
      {/* Headset */}
      <svg
        className="w-4 h-4 text-sky-600 shrink-0 overflow-visible"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 11a8 8 0 0 1 16 0" />
        <rect x="2.6" y="11" width="4.8" height="6" rx="2.2" />
        <path d="M20 16.5a4 4 0 0 1-4 4H12" />
      </svg>
      Help & Support
    </h4>

    {/* Links */}
    <ul className="text-sm text-sky-700 space-y-2">
      <li>
        <a href="/help/getting-started" target="_blank" rel="noopener noreferrer" className="py-2 flex items-center gap-3 pl-0.5 hover:text-sky-800 transition-colors">
          {/* Doc */}
          <svg className="w-4 h-4 text-sky-600 shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6"/>
          </svg>
          Getting Started Guide
        </a>
      </li>
      <li>
        <a href="/help/documentation" target="_blank" rel="noopener noreferrer" className="py-2 flex items-center gap-3 pl-0.5 hover:text-sky-800 transition-colors">
          {/* Docs list */}
          <svg className="w-4 h-4 text-sky-600 shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>
        </svg>
          Documentation
        </a>
    </li>
       <li>
        <a href="/help/legal-compliance" target="_blank" rel="noopener noreferrer" className="py-2 flex items-center gap-3 pl-0.5 hover:text-sky-800 transition-colors">
          {/* Docs list */}
          <svg className="w-4 h-4 text-sky-600 shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>
        </svg>
          Legal & Compliance Guide
        </a>
    </li>

     
  </ul>
</div>

  {/* Divider like screenshot */}
  <div className="h-px bg-slate-100 mx-4" />

  {/* Contact */}
  <div className="px-4 py-3 text-sm text-slate-600 space-y-2">
    <div className="flex items-center gap-3 pl-0.5">
      {/* Mail */}
      <svg className="w-4 h-4 text-sky-600 shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M22 7 12 13 2 7"/>
      </svg>
      support@company.com
    </div>
    <div className="flex items-center gap-3 pl-0.5">
      {/* Phone (handset) */}
      <svg className="w-4 h-4 text-sky-600 shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 6.18 2 2 0 0 1 5 4h3.3a1 1 0 0 1 .95.68l1.2 3.6a1 1 0 0 1-.27 1.06l-1.8 1.8a12 12 0 0 0 6.8 6.8l1.8-1.8a1 1 0 0 1 1.06-.27l3.6 1.2A1 1 0 0 1 22 16.92z"/>
      </svg>
      +1 (800) 123–4567
    </div>
  </div>
</div>






  {/* Resources */}
  <div className="bg-white rounded-2xl shadow-2xl p-4">
    <h4 className="text-md font-bold text-slate-900 mb-3">Resources</h4>
    <ul className="text-sm text-slate-700 space-y-2">
      <li className='py-2'>
        <a href="#"  rel="noopener noreferrer" className="group flex items-center gap-2 px-2  rounded-lg hover:bg-slate-50 text-sky-700 hover:text-sky-800 transition-colors">
          <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          Lead Generation Playbook
        </a>
      </li>
      <li className='py-2'>
        <a href="#"  rel="noopener noreferrer" className="group flex items-center gap-2 px-2  rounded-lg hover:bg-slate-50 text-sky-700 hover:text-sky-800 transition-colors">
          <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
          Email Templates
        </a>
      </li>
      <li className='py-2'>
        <a href="#"  rel="noopener noreferrer" className="group flex items-center gap-2 px-2 rounded-lg hover:bg-slate-50 text-sky-700 hover:text-sky-800 transition-colors">
          <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>
          Agreement Templates
        </a>
      </li>
      <li className='py-2'>
        <a href="#" rel="noopener noreferrer" className="group flex items-center gap-2 px-2 rounded-lg hover:bg-slate-50 text-sky-700 hover:text-sky-800 transition-colors">
          <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Customer Guides
        </a>
      </li>
    </ul>
  </div>
</aside>

          </div>
        </div>

        {/* Advanced Filters Modal */}
        {showAdvanced && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowAdvanced(false)} />
            <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-slate-900">Advanced Filters</h4>
                <button onClick={() => setShowAdvanced(false)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                       </button>
              </div>

              <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-auto">
                {/* Region */}
                <div>
                  <label className="block text-xs font-label text-gray-700 mb-2">Region</label>
                  {regionsLoading ? (
                    <div className="flex items-center justify-center py-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-gray-500">Loading regions...</span>
                      </div>
                    </div>
                  ) : regionsError ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">{regionsError}</div>
                  ) : (
                   <Select
  value={filters.region}
  onChange={(opt) => setFilters({ ...filters, region: opt })}
  options={regionOptions}
  styles={{
    ...customSelectStyles,
    menuPortal: (base) => ({ ...base, zIndex: 99999 }),
    menu: (base) => ({ ...base, zIndex: 99999 }),
  }}
  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
  menuPosition="fixed"
  isSearchable
/>

                  )}
                </div>
                        {/* Requirement */}
                <div>
                  <label className="block text-xs font-label text-gray-700 mb-2">Requirement</label>
<Select
  value={filters.requirement}
  onChange={(opt) => setFilters({ ...filters, requirement: opt })}
  options={requirementOptions}
  styles={{
    ...customSelectStyles,
    menuPortal: (base) => ({ ...base, zIndex: 99999 }),
    menu: (base) => ({ ...base, zIndex: 99999 }),
  }}
  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
  menuPosition="fixed"
  isSearchable
/>                    </div>

                {/* Property Type */}
                <div>
                  <label className="block text-xs font-label text-gray-700 mb-2">Property Type</label>
<Select
  value={filters.propertyType}
  onChange={(opt) => setFilters({ ...filters, propertyType: opt })}
  options={propertyTypeOptions}
  styles={{
    ...customSelectStyles,
    menuPortal: (base) => ({ ...base, zIndex: 99999 }),
    menu: (base) => ({ ...base, zIndex: 99999 }),
  }}
  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
  menuPosition="fixed"
  isSearchable
/>                      </div>

        

                {/* Max Budget */}
                <div>
                  <label className="block text-xs font-label text-gray-700 mb-4">
                    Max Budget: <span className="text-sky-700 font-semibold">${filters.budgetMax.toLocaleString()}</span>
                  </label>
                  <input type="range" min="0" max="1000000" step="10000" value={filters.budgetMax} onChange={(e) => setFilters({ ...filters, budgetMax: Number(e.target.value) })} className="w-full accent-sky-600" />
                  </div>
                </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                {isAdvancedFiltersApplied && (
                <button 
                    onClick={clearAdvancedFilters} 
                  disabled={applyingFilters}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Filters
                </button>
                )}
                <button 
                  onClick={async () => { 
                    setApplyingFilters(true); 
                    setPage(1); 
                    await loadLeads(filters, 1, limit, debouncedQuery); 
                    setApplyingFilters(false);
                    setShowAdvanced(false); 
                  }} 
                  disabled={applyingFilters}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-900 hover:bg-green-950 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {applyingFilters && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {applyingFilters ? 'Applying...' : 'Apply Filters'}
                </button>
            </div>
          </div>
          </div>
        )}

          {/* Add Lead Modal */}
          {showAddLead && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
              <div className="absolute inset-0 bg-black/60" onClick={() => { setShowAddLead(false); setValidationErrors({}); }} />
              <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-slate-900">Add New Lead</h4>
        <button onClick={() => { setShowAddLead(false); setValidationErrors({}); }} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-auto">
                  <div>
                  <label className="block text-xs font-label text-gray-700 mb-1">Customer Name</label>
                  <input 
                    name="customerName" 
                    value={newLead.customerName} 
                    onChange={handleNewLeadChange} 
                    type="text" 
                    placeholder="Enter customer's full name" 
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-4 text-sm bg-white ${
                      validationErrors.customerName 
                        ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-sky-100 focus:border-sky-600'
                    }`} 
                  />
                  {validationErrors.customerName && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.customerName}</p>
                  )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">Contact Phone</label>
                    <input 
                      name="customerPhone" 
                      value={newLead.customerPhone} 
                      onChange={handleNewLeadChange} 
                      type="tel" 
                      placeholder="Enter 10-digit phone number" 
                      maxLength="10"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-4 text-sm bg-white ${
                        validationErrors.customerPhone 
                          ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-sky-100 focus:border-sky-600'
                      }`} 
                    />
                    {validationErrors.customerPhone && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.customerPhone}</p>
                    )}
                    </div>
                    <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">Contact Email</label>
                    <input 
                      name="customerEmail" 
                      value={newLead.customerEmail} 
                      onChange={handleNewLeadChange} 
                      type="email" 
                      placeholder="e.g., john.doe@example.com" 
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-4 text-sm bg-white ${
                        validationErrors.customerEmail 
                          ? 'border-red-300 focus:ring-red-100 focus:border-red-500' 
                          : 'border-gray-200 focus:ring-sky-100 focus:border-sky-600'
                      }`} 
                    />
                    {validationErrors.customerEmail && (
                      <div className="mt-1">
                        <p className="text-xs text-red-600">{validationErrors.customerEmail}</p>
                        <p className="text-xs text-gray-500">eg. john@example.com</p>
                      </div>
                    )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">Requirement</label>
            <Select
              value={newLead.requirement}
  onChange={(opt) => setNewLead({ ...newLead, requirement: opt })}
              options={requirementOptions}
  styles={modalSelectStyles}
  isSearchable
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              menuPlacement="auto"
/>                  </div>
                    <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">Property Type</label>
            <Select
              value={newLead.propertyType}
  onChange={(opt) => setNewLead({ ...newLead, propertyType: opt })}
              options={propertyTypeOptions}
  styles={modalSelectStyles}
  isSearchable
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              menuPlacement="auto"
/>                  </div>
                   
                  </div>

                  <div>
                  <label className="block text-xs font-label text-gray-700 mb-1">Budget</label>
                  <input name="budget" value={newLead.budget} onChange={handleNewLeadChange} type="number" step="1" min="0" inputMode="numeric" onWheel={(e) => (e.target instanceof HTMLElement ? e.target.blur() : null)} onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }} placeholder="e.g., 500000" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-600 text-sm bg-white" />
                  </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <label className="block text-xs font-label text-gray-700 mb-1">Primary Region *</label>
          <Select
               value={newLead.primaryRegion}
   onChange={(opt) => setNewLead({ ...newLead, primaryRegion: opt })}
               options={nearestRegionOptions && nearestRegionOptions.length > 0 ? nearestRegionOptions : regionOptions}
  styles={modalSelectStyles}
  isSearchable
            isLoading={nearestRegionsLoading}
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            menuPosition="fixed"
            menuPlacement="auto"
/>                  </div>
                     <div>
                     <label className="block text-xs font-label text-gray-700 mb-1">Optional Region</label>
             <Select
               value={newLead.secondaryRegion}
   onChange={(opt) => setNewLead({ ...newLead, secondaryRegion: opt })}
               options={nearestRegionOptions && nearestRegionOptions.length > 0 ? nearestRegionOptions : regionOptions}
   styles={modalSelectStyles}
   isSearchable
               isLoading={nearestRegionsLoading}
               menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
               menuPosition="fixed"
               menuPlacement="auto"
/>                  </div>
        </div>

                  </div>
                  
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button 
                  onClick={() => { setShowAddLead(false); setValidationErrors({}); }} 
                  disabled={addLeadLoading}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddLeadSubmit} 
                  disabled={addLeadLoading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {addLeadLoading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {addLeadLoading ? 'Adding Lead...' : 'Add Lead'}
                </button>
                </div>
              </div>
            </div>
          )}

        {/* Transfer Modal */}
          {showTransfer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowTransfer(false)} />
              <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-slate-900">Transfer Lead</h4>
                  <button onClick={() => setShowTransfer(false)} className="p-2 rounded-lg hover:bg-gray-100">
                    <svg className="w-5 h-5 text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="px-6 py-5 space-y-5">
                  <div>
                  <label className="block text-xs font-label text-gray-700 mb-1">Select Broker(s)</label>
                      <Select
                    value={transferForm.brokerIds
                      .filter(id => (brokersList || []).some(x => (x._id || x.id) === id && (x._id || x.id) !== currentUserId))
                      .map(id => {
                        const b = (brokersList || []).find(x => (x._id || x.id) === id);
                        let regionName = '';
                        if (b?.region && Array.isArray(b.region) && b.region.length > 0) {
                          regionName = b.region[0].name || 'Unknown';
                        } else if (b?.region && typeof b.region === 'object' && !Array.isArray(b.region)) {
                          regionName = b.region.name || b.region.region || 'Unknown';
                        } else if (typeof b?.region === 'string') {
                          regionName = b.region;
                        }
                        return { 
                          value: id, 
                          label: `${b?.name || b?.fullName || b?.email || id}${regionName ? ` (${regionName})` : ''}` 
                        };
                      })
                    }
                    onChange={(opts, meta) => {
                      const selectedValues = (opts || []).map(o => o.value);
                      setTransferForm(prev => ({ ...prev, brokerIds: selectedValues }));
                    }}
                    options={(brokersList || [])
                      .filter(b => (b._id || b.id) && (b._id || b.id) !== currentUserId)
                      .map(b => {
                        let regionName = '';
                        if (b.region && Array.isArray(b.region) && b.region.length > 0) {
                          regionName = b.region[0].name || 'Unknown';
                        } else if (b.region && typeof b.region === 'object' && !Array.isArray(b.region)) {
                          regionName = b.region.name || b.region.region || 'Unknown';
                        } else if (typeof b.region === 'string') {
                          regionName = b.region;
                        }
                        return { 
                          value: b._id || b.id, 
                          label: `${b.name || b.fullName || b.email || 'Unnamed'}${regionName ? ` (${regionName})` : ''}` 
                        };
                      })
                    }
                      styles={customSelectStyles}
                      components={{ MenuList: BrokerMenuList }}
                      onInputChange={(inputValue, { action }) => {
                        if (action === 'input-change' && transferForm.selectAllFiltered) {
                          // Defer actual selection to MenuList header using props.children
                        }
                        setTransferFilter(inputValue || '');
                        return inputValue;
                      }}
                    isMulti isSearchable closeMenuOnSelect={false} hideSelectedOptions
                      placeholder={brokersLoading ? 'Loading brokers...' : (brokersError ? brokersError : 'Choose brokers...')}
                    isLoading={brokersLoading}
                    />
                  </div>
                  <div>
                  <label className="block text-xs font-label text-gray-700 mb-1">Transfer Notes (Optional)</label>
                  <textarea rows={3} value={transferForm.notes} onChange={(e)=>setTransferForm({ ...transferForm, notes: e.target.value })} placeholder="Add any specific instructions or context..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-600 text-sm bg-white" />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button onClick={() => setShowTransfer(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer" disabled={transferLoading}>Cancel</button>
                <button onClick={submitTransfer} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer disabled:opacity-60 flex items-center gap-2" disabled={transferLoading}>
                  {transferLoading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {transferLoading ? 'Sending...' : 'Share with broker'}
                </button>
                </div>
              </div>
            </div>
          )}

        {/* View Drawer */}
          {showView && selectedLead && (
            <div className={`fixed inset-0 z-50 ${viewClosing ? 'pointer-events-none' : ''}`}>
              <div className="absolute inset-0 bg-black/50" onClick={() => { setViewClosing(true); setTimeout(() => setShowView(false), 200); }} />
              <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl ${viewClosing ? 'animate-slide-out' : 'animate-slide-in'}`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h4 className="text-[18px] font-semibold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Lead Details
                </h4>
                  <button onClick={() => { setViewClosing(true); setTimeout(() => setShowView(false), 200); }} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
                    <svg className="w-5 h-5 text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              <div className="p-5 space-y-4 overflow-y-auto no-scrollbar h-[calc(100%-56px)] bg-slate-50">
                  <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center text-sm font-semibold">
                      {getInitials(selectedLead.name || selectedLead.customerName || '?')}
                      </div>
                      <div>
                      <div className="text-[14px] font-semibold text-slate-900">{selectedLead.name || selectedLead.customerName || '—'}</div>
                  {(() => { const { primary, secondary } = getRegionNames(selectedLead); return (
                    <div className="text-[13px] text-slate-500">
                     
                      <div className="text-[12px] text-slate-500 mt-0.5">{selectedLead.contact || selectedLead.customerPhone || '—'}</div>
                    </div>
                  ); })()}
                      </div>
                    </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClasses(selectedLead.status)}`}>{selectedLead.status || 'Active'}</span>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-3">
                    <h5 className="text-[16px] font-semibold text-slate-900 flex items-center gap-2">
                      <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer Information
                    </h5>
                      {!viewEditMode ? (
                        ((selectedLead?.createdBy?._id || selectedLead?.createdBy) === brokerId) ? (
                           <button onClick={() => setViewEditMode(true)} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer">Edit</button>
                        ) : (
                          <button onClick={() => setStatusEditMode(true)} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer">Edit Status</button>
                        )
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={saveViewEdits} disabled={viewSaving} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
                            {viewSaving && (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            {viewSaving ? 'Saving...' : 'Save'}
                          </button>
                        <button onClick={() => setViewEditMode(false)} disabled={viewSaving} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">Cancel</button>
                        </div>
                      )}
                    </div>

                  <div className="text-[14px] text-slate-700">
                    {/* Status field (editable only if created by current broker) */}
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                      <span className="col-span-1 text-slate-500 flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2z" />
                        </svg>
                        Status:
                      </span>
                      <span className="col-span-2 text-slate-900">
                        {viewEditMode ? (
                          <select name="status" value={viewForm.status || selectedLead.status || 'New'} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-600">
                            <option value="New">New</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        ) : statusEditMode ? (
                          <div className="flex items-center gap-2">
                            <select 
                              value={viewForm.status || selectedLead.status || 'New'} 
                              onChange={(e) => setViewForm(prev => ({ ...prev, status: e.target.value }))}
                              className="px-2 py-1 border border-gray-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                              disabled={statusSaving}
                            >
                              <option value="New">New</option>
                              <option value="Assigned">Assigned</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Closed">Closed</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                            <button
                              onClick={() => saveStatusUpdate(viewForm.status || selectedLead.status)}
                              disabled={statusSaving}
                              className="px-3 py-1 text-xs font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {statusSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => {
                                setStatusEditMode(false);
                                setViewForm(prev => ({ ...prev, status: selectedLead.status }));
                              }}
                              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
                              disabled={statusSaving}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClasses(selectedLead.status)}`}>{selectedLead.status || 'New'}</span>
                        )}
                      </span>
                    </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                      <span className="col-span-1 text-slate-500 flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Name:
                      </span>
                      <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                          <input name="name" value={viewForm.name} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-600" />
                        ) : (selectedLead.name || selectedLead.customerName || '—')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                      <span className="col-span-1 text-slate-500 flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Phone:
                      </span>
                      <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                          <input name="contact" value={viewForm.contact} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-600" />
                        ) : (selectedLead.contact || selectedLead.customerPhone || '—')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                      <span className="col-span-1 text-slate-500 flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email:
                      </span>
                      <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                          <input name="email" value={viewForm.email} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-600" />
                        ) : (selectedLead.customerEmail || '—')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                      <span className="col-span-1 text-slate-500 flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Requirement:
                      </span>
                      <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                            <Select
                              value={viewForm.requirement ? { value: viewForm.requirement, label: viewForm.requirement } : null}
                              onChange={(opt) => setViewForm((p) => ({ ...p, requirement: opt?.value || '' }))}
                              options={requirementOptions.filter(o => o.value !== 'all')}
                              styles={modalSelectStyles}
                              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                              menuPosition="fixed"
                              menuPlacement="auto"
                            />
                          ) : (selectedLead.requirement || selectedLead.req || '—')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                      <span className="col-span-1 text-slate-500 flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                        Property Type:
                      </span>
                      <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                            <Select
                              value={viewForm.propertyType ? { value: viewForm.propertyType, label: viewForm.propertyType } : null}
                              onChange={(opt) => setViewForm((p) => ({ ...p, propertyType: opt?.value || '' }))}
                              options={propertyTypeOptions.filter(o => o.value !== 'all')}
                              styles={modalSelectStyles}
                              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                              menuPosition="fixed"
                              menuPlacement="auto"
                            />
                          ) : (selectedLead.propertyType || '—')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                        <span className="col-span-1 text-slate-500 flex items-center gap-2">
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Primary Region:
                        </span>
                        <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                            regionsLoading ? (
                              <div className="text-[13px] text-slate-500">Loading regions...</div>
                            ) : regionsError ? (
                              <div className="text-[13px] text-rose-600">{regionsError}</div>
                            ) : (
                              <Select
                                value={viewForm.primaryRegion}
                                onChange={(opt) => setViewForm((p) => ({ ...p, primaryRegion: opt }))}
                                options={nearestRegionOptions && nearestRegionOptions.length > 0 ? nearestRegionOptions : regionOptions.filter(o => o.value !== 'all')}
                                styles={modalSelectStyles}
                                isLoading={nearestRegionsLoading}
                                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                                menuPosition="fixed"
                                menuPlacement="auto"
                              />
                            )
                          ) : (getRegionName(selectedLead?.primaryRegion || selectedLead?.region) || '—')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                        <span className="col-span-1 text-slate-500 flex items-center gap-2">
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Secondary Region:
                        </span>
                        <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                            regionsLoading ? (
                              <div className="text-[13px] text-slate-500">Loading regions...</div>
                            ) : regionsError ? (
                              <div className="text-[13px] text-rose-600">{regionsError}</div>
                            ) : (
                              <Select
                                value={viewForm.secondaryRegion}
                                onChange={(opt) => setViewForm((p) => ({ ...p, secondaryRegion: opt }))}
                                options={nearestRegionOptions && nearestRegionOptions.length > 0 ? nearestRegionOptions : regionOptions.filter(o => o.value !== 'all')}
                                styles={modalSelectStyles}
                                isLoading={nearestRegionsLoading}
                                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                                menuPosition="fixed"
                                menuPlacement="auto"
                              />
                            )
                          ) : (getRegionName(selectedLead?.secondaryRegion) || '—')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2">
                      <span className="col-span-1 text-slate-500 flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                        </svg>
                        Budget:
                      </span>
                      <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                          <input name="budget" value={viewForm.budget} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-600" />
                        ) : (typeof selectedLead.budget === 'number' ? `$${selectedLead.budget.toLocaleString()}` : (selectedLead.budget || '—'))}
                        </span>
                      </div>
                    </div>
                  </div>

                   <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                  <h5 className="text-[16px] font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h7M5 20l2.5-2.5M19 20l-2.5-2.5" />
                    </svg>
                    Share History
                  </h5>
                  {(() => {
                    const transfers = Array.isArray(selectedLead?.transfers) ? selectedLead.transfers : [];
                    if (!transfers.length) {
                      return <div className="text-[14px] text-slate-500">Not shared yet.</div>;
                    }
                    const idToBroker = new Map((brokersList || []).map(b => [b._id || b.id, b]));
                    return (
                  <ul className="text-[14px] text-slate-700 space-y-3">
                        {transfers.map((t, i) => {
                          const toB = (t && typeof t.toBroker === 'object') ? t.toBroker : (idToBroker.get(t?.toBroker) || {});
                          const fromB = (t && typeof t.fromBroker === 'object') ? t.fromBroker : (idToBroker.get(t?.fromBroker) || {});
                          const toName = toB.name || toB.fullName || toB.email || toB._id || t?.toBroker || 'Unknown broker';
                          const fromName = fromB.name || fromB.fullName || fromB.email || fromB._id || t?.fromBroker || 'Unknown broker';
                          const toAvatar = toB.brokerImage || toB.avatarUrl || toB.imageUrl || '';
                          const fromAvatar = fromB.brokerImage || fromB.avatarUrl || fromB.imageUrl || '';
                          const when = t?.createdAt ? new Date(t.createdAt).toLocaleString() : '';
                          const keyFrom = (typeof t?.fromBroker === 'object' ? t?.fromBroker?._id : t?.fromBroker) || 'from';
                          const keyTo = (typeof t?.toBroker === 'object' ? t?.toBroker?._id : t?.toBroker) || 'to';
                          const fromRegion = getRegionName(fromB?.region) || getRegionName(fromB?.primaryRegion) || '';
                          const toRegion = getRegionName(toB?.region) || getRegionName(toB?.primaryRegion) || '';
                          return (
                            <li key={`${keyFrom}-${keyTo}-${t?._id || i}`} className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {/* <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white flex items-center justify-center text-[11px] text-gray-700" title={typeof fromName === 'string' ? fromName : String(fromName)}>
                                  <img src={fromAvatar || 'https://www.w3schools.com/howto/img_avatar.png'} alt={typeof fromName === 'string' ? fromName : 'Broker'} className="w-full h-full object-cover" />
                                </div>
                                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg> */}
                                <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white flex items-center justify-center text-[11px] text-gray-700" title={typeof toName === 'string' ? toName : String(toName)}>
                                  <img src={toAvatar || 'https://www.w3schools.com/howto/img_avatar.png'} alt={typeof toName === 'string' ? toName : 'Broker'} className="w-full h-full object-cover" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 truncate">
                                  {typeof fromName === 'string' ? fromName : String(fromName)}
                                  <span className="mx-1 text-slate-400">→</span>
                                  {typeof toName === 'string' ? toName : String(toName)}
                                </div>
                                <div className="text-[12px] text-slate-500 truncate">
                                  {(fromRegion || '—')} <span className="mx-1 text-slate-400">→</span> {(toRegion || '—')}
                                </div>
                                {when && <div className="text-[11px] text-slate-400">Shared on {when}</div>}
                              </div>
                              {(() => {
                                const toId = (t && typeof t.toBroker === 'object') ? (t.toBroker?._id || t.toBroker?.id) : t?.toBroker;
                                const isPending = pendingDeleteTransferId === String(toId);
                                return (
                                  <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={async () => {
                                      if (!toId) return;
                                      setPendingDeleteTransferId(String(toId));
                                      await deleteTransfer(toId);
                                    }}
                                    className={`ml-2 inline-flex items-center px-2 py-1 text-[12px] rounded border ${isPending ? 'border-gray-200 text-gray-400' : 'border-rose-200 text-rose-700 hover:bg-rose-50'}`}
                                    title="Delete transfer"
                                  >
                                    {isPending ? 'Removing…' : 'Delete'}
                                  </button>
                                );
                              })()}
                            </li>
                          );
                        })}
                     </ul>
                    );
                  })()}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideInFromRight { from { transform: translateX(100%); opacity: .6; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slideInFromRight .25s ease-out both; }
        @keyframes slideOutToRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: .4; } }
        .animate-slide-out { animation: slideOutToRight .2s ease-in both; }
      `}</style>
    </ProtectedRoute>
  );
}
