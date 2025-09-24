'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Select from 'react-select';
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
        <p className="text-[13px] text-slate-500 font-medium">{label}</p>
        <p className="mt-5 text-[30px] leading-none font-extrabold text-slate-900">{value}</p>
        <p className={`mt-5 flex items-center gap-1.5 text-[12px] font-medium ${deltaClass}`}>
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
        </p>
      </div>
  </div>
);
};

export default function BrokerLeadsPage() {
  /* ───────────── Filters & UI state ───────────── */
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  /* ───────────── Leads API ───────────── */
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / (limit || 10)));
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(filters.query || ''), 300);
    return () => clearTimeout(t);
  }, [filters.query]);

  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('token') || localStorage.getItem('authToken'))
    : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const buildRequestUrl = useCallback(
    (effectiveFilters, p = page, l = limit, q = debouncedQuery) => {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('limit', String(l));
      if (q) params.set('search', q);
      if (effectiveFilters.status?.value && effectiveFilters.status.value !== 'all') params.set('status', effectiveFilters.status.value);
      if (effectiveFilters.broker?.value && effectiveFilters.broker.value !== 'all') params.set('broker', effectiveFilters.broker.value);
      if (effectiveFilters.region?.value && effectiveFilters.region.value !== 'all') params.set('region', effectiveFilters.region.value);
      if (effectiveFilters.propertyType?.value && effectiveFilters.propertyType.value !== 'all') params.set('propertyType', effectiveFilters.propertyType.value);
      if (effectiveFilters.requirement?.value && effectiveFilters.requirement.value !== 'all') params.set('requirement', effectiveFilters.requirement.value);
      if (effectiveFilters.startDate) params.set('startDate', effectiveFilters.startDate);
      if (effectiveFilters.endDate) params.set('endDate', effectiveFilters.endDate);
      if (typeof effectiveFilters.budgetMax === 'number' && effectiveFilters.budgetMax !== 500000) params.set('budgetMax', String(effectiveFilters.budgetMax));
      return `${apiUrl}/leads?${params.toString()}`;
    },
    [apiUrl, page, limit, debouncedQuery]
  );

  const loadLeads = useCallback(
    async (overrideFilters = null, overridePage = null, overrideLimit = null, overrideQuery = null) => {
      try {
        setLeadsLoading(true);
        setLeadsError('');
        const f = overrideFilters ?? filters;
        const p = overridePage ?? page;
        const l = overrideLimit ?? limit;
        const q = overrideQuery ?? debouncedQuery;

        const response = await fetch(buildRequestUrl(f, p, l, q), {
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
    [filters, page, limit, debouncedQuery, token, buildRequestUrl]
  );

  useEffect(() => { loadLeads(); }, [page, limit]); // eslint-disable-line
  useEffect(() => { page !== 1 ? setPage(1) : loadLeads(); }, [debouncedQuery]); // eslint-disable-line

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
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'plot', label: 'Plot' },
    { value: 'other', label: 'Other' }
  ];
  const requirementOptions = [  { value: 'all', label: 'All Requirements' }, { value: 'buy', label: 'Buy' }, { value: 'rent', label: 'Rent' } ];
  const regionOptions = useMemo(() => ([
    { value: 'all', label: 'All Regions' },
    ...(Array.isArray(regionsList) ? regionsList.map(r => ({ value: r._id || r.id || r, label: r.name || r.region || r })) : [])
  ]), [regionsList]);

  const customSelectStyles = {
    control: (p, s) => ({
      ...p, minHeight: '38px', borderRadius: 10, border: '1px solid #e5e7eb',
      boxShadow: s.isFocused ? '0 0 0 4px rgba(59,130,246,.1)' : 'none',
      borderColor: s.isFocused ? '#3b82f6' : '#e5e7eb', background: 'white',
      ':hover': { borderColor: s.isFocused ? '#3b82f6' : '#d1d5db' }
    }),
    valueContainer: (p) => ({ ...p, padding: '2px 10px' }),
    indicatorSeparator: () => ({ display: 'none' }),
    menuPortal: (p) => ({ ...p, zIndex: 99999 }),
    option: (p, s) => ({
      ...p,
      backgroundColor: s.isSelected ? '#3b82f6' : s.isFocused ? '#f1f5f9' : 'transparent',
      color: s.isSelected ? 'white' : s.isFocused ? '#111827' : '#4b5563',
      fontSize: 14, borderRadius: 6, margin: '2px 6px', padding: '8px 12px'
    }),
    singleValue: (p) => ({ ...p, color: '#111827', fontWeight: 500 }),
    menu: (p) => ({ ...p, zIndex: 9999, overflow: 'hidden', border: '1px solid #e5e7eb', borderRadius: 10 }),
    menuList: (p) => ({
      ...p,
      maxHeight: 240,
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingRight: 0
    }),
  };

  /* ───────────── Add Lead modal ───────────── */
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({
    customerName: '', customerPhone: '', customerEmail: '',
    requirement: { value: 'all', label: 'All Requirements' }, propertyType: { value: 'all', label: 'All propertyType' },
    budget: '', region: { value: 'all', label: 'All Region' }, notes: '', files: null
  });
  const handleNewLeadChange = (e) => {
    const { name, value, files } = e.target;
    setNewLead((p) => ({ ...p, [name]: files ? files : value }));
  };

  const modalSelectStyles = {
  ...customSelectStyles,
  menuPortal: (base) => ({ ...base, zIndex: 999999 }), // above modal/overlay
};
  const handleAddLeadSubmit = async () => {
    try {
      const req = typeof newLead.requirement === 'object' ? (newLead.requirement.label || newLead.requirement.value) : newLead.requirement;
      const ptype = typeof newLead.propertyType === 'object' ? (newLead.propertyType.label || newLead.propertyType.value) : newLead.propertyType;
      const regionId = typeof newLead.region === 'object' ? (newLead.region.value || newLead.region._id) : newLead.region;
      const payload = {
        customerName: newLead.customerName || '',
        customerPhone: newLead.customerPhone || '',
        customerEmail: newLead.customerEmail || '',
        requirement: req || '',
        propertyType: ptype || '',
        budget: newLead.budget !== '' && newLead.budget !== null ? parseFloat(newLead.budget) : 0,
        regionId: regionId && regionId !== 'select region' ? regionId : '',
      };
      const res = await fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { toast.error('Failed to create lead'); return; }
      toast.success('Lead created successfully');
      await loadLeads(); setShowAddLead(false);
      setNewLead({ customerName:'', customerPhone:'', customerEmail:'', requirement:'select requirement', propertyType:'select propertyType', budget:'', region:'select region', notes:'', files:null });
    } catch { toast.error('Error creating lead'); }
  };

  /* ───────────── Transfer modal ───────────── */
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({ brokerIds:[], notes: '' });
  const brokers = [{ id: 'all', name: 'All Broker' }, { id: 'b1', name: 'Alice Smith' }, { id: 'b2', name: 'Bob Johnson' }, { id: 'b3', name: 'Charlie Brown' } ];

  /* ───────────── View Drawer ───────────── */
  const [showView, setShowView] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewEditMode, setViewEditMode] = useState(false);
  const [viewClosing, setViewClosing] = useState(false);
  const [viewForm, setViewForm] = useState({ name:'', contact:'', email:'', budget:'', requirement:'' });
  const saveViewEdits = () => {
    setSelectedLead((prev) => prev ? {
        ...prev,
        name: viewForm.name || prev.name,
        contact: viewForm.contact || prev.contact,
        customerName: viewForm.name || prev.customerName,
        customerPhone: viewForm.contact || prev.customerPhone,
        customerEmail: viewForm.email || prev.customerEmail,
        budget: viewForm.budget !== '' ? viewForm.budget : prev.budget,
      requirement: viewForm.requirement || prev.requirement
    } : prev);
    setViewEditMode(false);
  };
  const handleViewFieldChange = (e) => setViewForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const clearFilters = () => {
    const reset = { query:'', status:{ value:'all', label:'All Statuses' }, broker:{ value:'all', label:'All Brokers' }, region:{ value:'all', label:'All Regions' }, propertyType:{ value:'all', label:'All Property Types' }, requirement:{ value:'all', label:'All Requirements' }, startDate:'', endDate:'', budgetMax:500000 };
    setFilters(reset); setPage(1); loadLeads(reset, 1, limit, '');
  };

  /* ───────────── Skeleton row ───────────── */
  const SkeletonRow = () => (
    <div className="grid grid-cols-12 items-center px-6 py-4 animate-pulse">
      <div className="col-span-3 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-100" /><div className="h-3 w-28 rounded bg-gray-100" /></div>
      <div className="col-span-3 h-3 w-40 rounded bg-gray-100" />
      <div className="col-span-2 h-3 w-28 rounded bg-gray-100" />
      <div className="col-span-1 h-3 w-14 rounded bg-gray-100" />
      <div className="col-span-1 h-3 w-20 rounded bg-gray-100" />
      <div className="col-span-1 h-5 w-16 rounded-full bg-gray-100" />
      <div className="col-span-1 flex justify-end gap-2">
        <div className="w-7 h-7 rounded-lg bg-gray-100" /><div className="w-7 h-7 rounded-lg bg-gray-100" /><div className="w-7 h-7 rounded-lg bg-gray-100" />
      </div>
    </div>
  );

  return (
    <ProtectedRoute requiredRole="broker">
      
      <div className="min-h-screen bg-slate-50 py-8">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="w-full mx-auto px-6 lg:px-10">
          {/* 9 / 3 layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Header */}
 {/* Left 9 */}
            <div className="md:col-span-9">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Leads & Visitors</h1>
            <p className="text-[13px] text-slate-500 mt-2">Track and manage your sales pipeline effectively</p>
          </div>

          
           
              {/* Stat row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
  <StatCard
    color="sky"
    label="Total Leads"
    value="1,248"
    deltaText="↑ 12.5% vs last month"
    trend="up"
  />
  <StatCard
    color="amber"
    label="New Leads Today"
    value="36"
    deltaText="↑ 8.2% vs yesterday"
    trend="up"
  />
  <StatCard
    color="emerald"
    label="Converted Leads"
    value="287"
    deltaText="↓ 3.7% vs last month"
    trend="down"
  />
  <StatCard
    color="violet"
    label="Avg. Deal Size"
    value="$8,540"
    deltaText="↑ 5.1% vs last month"
    trend="up"
  />
          </div>

              {/* Search + status + buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
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
            </div>

            <div className="w-full sm:w-48 ">
              <Select
                value={filters.status}
                    onChange={(opt) => { const next = { ...filters, status: opt }; setFilters(next); setPage(1); loadLeads(next, 1, limit, debouncedQuery); }}
                options={statusOptions}
                styles={customSelectStyles}
                    isSearchable
                    menuPlacement="bottom"
              />
            </div>

            <button
              type="button"
                  onClick={() => setShowAdvanced(true)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold border border-green-300 bg-white text-green-700 hover:bg-green-50 hover:border border-green-500 shadow-sm cursor-pointer"
            >
              Advanced Filters
            </button>
        <button
                  type="button"
                  onClick={() => setShowAddLead(true)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-900 hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  Add New Lead
        </button>
                </div>

            {/* Table */}
<div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
  {/* Table Header */}
  <div className="grid grid-cols-12 px-6 py-3 text-[14px] font-medium text-gray-600 bg-gray-50">
    <div className="col-span-2">Customer Name</div>
    <div className="col-span-2">Contact</div>
    <div className="col-span-2">Requirement</div>
    <div className="col-span-1">Budget</div>
    <div className="col-span-2">Region</div>
    <div className="col-span-1">Status</div>
    <div className="col-span-2 text-center">Actions</div>
                </div>

  {/* Loading */}
  {leadsLoading && (
    <div className="divide-y divide-gray-100">
      {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
  )}

  {/* Empty */}
  {!leadsLoading && Array.isArray(leads) && leads.length === 0 && (
    <div className="px-6 py-6 text-sm text-gray-600">No leads found.</div>
  )}

  {/* Rows */}
  <div className="divide-y divide-gray-100">
    {(leadsLoading ? [] : leads).map((row, idx) => (
      <div
        key={row._id || row.id || idx}
        className="grid grid-cols-12 items-start px-6 py-4 bg-white gap-y-1 gap-x-4"
      >
        {/* Customer Name */}
        <div className="col-span-2 flex items-start ">
         
          <div className="text-sm font-medium text-gray-900 whitespace-normal break-words leading-5">
            {row.customerName || row.name || "-"}
          </div>
                </div>

        {/* Contact (emails can be very long → break-all) */}
        <div className="col-span-2 text-[13px] text-gray-700 whitespace-normal break-all leading-5">
          {row.customerEmail || row.customerPhone || row.contact || "-"}
                </div>

        {/* Requirement */}
        <div className="col-span-2 text-[13px] text-gray-700 whitespace-normal break-words leading-5">
          {row.requirement || row.req || "-"}
              </div>

        {/* Budget */}
        <div className="col-span-1 text-[13px] text-gray-700 whitespace-normal break-words leading-5">
          {typeof row.budget === "number" ? `$${row.budget.toLocaleString()}` : (row.budget || "—")}
        </div>

        {/* Region */}
        <div className="col-span-2 text-[13px] text-gray-700 whitespace-normal break-words leading-5">
          {row.region?.name || row.region || "—"}
        </div>

        {/* Status */}
        <div className="col-span-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClasses(row.status)}`}>
            {row.status || "—"}
          </span>
        </div>

        {/* Actions */}
        <div className="col-span-2 text-right">
          <div className="inline-flex items-center gap-2 pl-6">
            {/* View */}
                <button
              title="View"
              className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
              aria-label="view"
              onClick={() => {
                setSelectedLead(row);
                setViewEditMode(false);
                setViewClosing(false);
                setViewForm({
                  name: row.customerName || row.name || "",
                  contact: row.customerPhone || row.contact || "",
                  email: row.customerEmail || "-",
                  budget: String(row.budget ?? ""),
                  requirement: row.requirement || row.req || "",
                });
                setShowView(true);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
                </button>

            {/* Transfer */}
                <button
              title="Transfer"
              className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
              aria-label="transfer"
              onClick={() => setShowTransfer(true)}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>

          

            {/* Delete (restored) */}
            <button
              title="Delete"
              className="w-7 h-7 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 cursor-pointer"
              aria-label="delete"
              onClick={() => handleDeleteLead(row)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
                </button>
      </div>
              </div>
            </div>
    ))}
  </div>
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

  {/* Help & Support */}
 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
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
        <a href="#" className="flex items-center gap-3 pl-0.5">
          {/* Doc */}
          <svg className="w-4 h-4 text-sky-600 shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6"/>
          </svg>
          Getting Started Guide
        </a>
      </li>
      <li>
        <a href="#" className="flex items-center gap-3 pl-0.5">
          {/* Video */}
          <svg className="w-4 h-4 text-sky-600 shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="14" height="12" rx="2"/><path d="M22 7l-6 4 6 4z"/>
          </svg>
          Video Tutorials
        </a>
      </li>
      <li>
        <a href="#" className="flex items-center gap-3 pl-0.5">
          {/* Docs list */}
          <svg className="w-4 h-4 text-sky-600 shrink-0 overflow-visible" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/>
          </svg>
          Documentation
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


  {/* FAQ */}
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
  <h4 className="text-[15px] font-bold text-slate-900 mb-2 flex items-center gap-2">
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

  <div className="space-y-2 text-sm">
    {/* Item 1 */}
    <details className="group relative rounded-xl border border-slate-100 p-4 pr-5 transition-colors">
      <summary className="list-none cursor-pointer flex items-center justify-between">
        <span className="text-[15px] font-semibold text-slate-900">
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
<p className="mt-2 pl-3 md:pl-4 text-[13px] leading-6 text-slate-600 border-l-2 border-gray-300">
        Go to Settings → Import Data → Select CSV format and follow the template
        instructions to map your fields correctly.
      </p>
      
    </details>

    {/* Item 2 */}
    <details className="group relative rounded-xl border border-slate-100 p-4 pr-5 transition-colors">
      <summary className="list-none cursor-pointer flex items-center justify-between">
        <span className="text-[15px] font-semibold text-slate-900">
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
        <span className="text-[15px] font-semibold text-slate-900">
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


  {/* Recent Activity */}
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
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
        <div className="font-medium leading-5 mb-1">New lead created</div>
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
        <div className="font-medium leading-5 mb-1">Follow-up email sent to Michael Chen</div>
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
        <div className="font-medium leading-5 mb-1">Lead status changed to Qualified</div>
        <div className="text-xs text-slate-500 leading-5">Yesterday, 11:15 AM</div>
      </div>
    </li>
  </ul>
</div>


  {/* Resources */}
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
    <h4 className="text-md font-bold text-slate-900 mb-3">Resources</h4>
    <ul className="text-sm text-slate-700 space-y-2">
      <li>
        <a href="#" className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 text-sky-700">
          <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          Lead Generation Playbook
        </a>
      </li>
      <li>
        <a href="#" className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 text-sky-700">
          <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
          Email Templates
        </a>
      </li>
      <li>
        <a href="#" className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 text-sky-700">
          <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>
          Sales Calendar
        </a>
      </li>
      <li>
        <a href="#" className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 text-sky-700">
          <svg className="w-4 h-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Team Directory
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Region</label>
                  {regionsLoading ? (
                    <div className="flex items-center justify-center py-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="text-sm text-gray-500">Loading regions...</div>
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

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
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

                {/* Requirement */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Requirement</label>
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

                {/* Max Budget */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">
                    Max Budget: <span className="text-sky-700 font-semibold">${filters.budgetMax.toLocaleString()}</span>
                  </label>
                  <input type="range" min="0" max="1000000" step="10000" value={filters.budgetMax} onChange={(e) => setFilters({ ...filters, budgetMax: Number(e.target.value) })} className="w-full accent-sky-600" />
                  </div>
                </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button onClick={clearFilters} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">Clear Filters</button>
                <button onClick={() => { setPage(1); setShowAdvanced(false); loadLeads(filters, 1, limit, debouncedQuery); }} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-900 hover:bg-green-950 shadow-sm cursor-pointer">Apply Filters</button>
            </div>
          </div>
          </div>
        )}

          {/* Add Lead Modal */}
          {showAddLead && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddLead(false)} />
              <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-slate-900">Add New Lead</h4>
        <button onClick={() => setShowAddLead(false)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-auto">
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                  <input name="customerName" value={newLead.customerName} onChange={handleNewLeadChange} type="text" placeholder="Enter customer's full name" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-600 text-sm bg-white" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                    <input name="customerPhone" value={newLead.customerPhone} onChange={handleNewLeadChange} type="tel" placeholder="e.g., +1 (555) 123-4567" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-600 text-sm bg-white" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                    <input name="customerEmail" value={newLead.customerEmail} onChange={handleNewLeadChange} type="email" placeholder="e.g., john.doe@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-600 text-sm bg-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
            <Select
              value={newLead.propertyType}
  onChange={(opt) => setNewLead({ ...newLead, propertyType: opt })}
              options={propertyTypeOptions}
  styles={modalSelectStyles}
  isSearchable
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition="fixed"
/>                  </div>
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Requirement</label>
            <Select
              value={newLead.requirement}
  onChange={(opt) => setNewLead({ ...newLead, requirement: opt })}
              options={requirementOptions}
  styles={modalSelectStyles}
  isSearchable
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition="fixed"
/>                  </div>
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Budget</label>
                  <input name="budget" value={newLead.budget} onChange={handleNewLeadChange} type="number" step="1" min="0" inputMode="numeric" onWheel={(e) => (e.target instanceof HTMLElement ? e.target.blur() : null)} onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }} placeholder="e.g., 500000" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-600 text-sm bg-white" />
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                  {regionsLoading ? (
                    <div className="flex items-center justify-center py-3 border border-gray-200 rounded-lg bg-gray-50"><div className="text-sm text-gray-500">Loading regions...</div></div>
                  ) : regionsError ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">{regionsError}</div>
                  ) : (
          <Select
            value={newLead.region}
  onChange={(opt) => setNewLead({ ...newLead, region: opt })}
  options={regionOptions.filter(o => o.value !== 'all')}
  styles={modalSelectStyles}
  isSearchable
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            menuPosition="fixed"
/>                  )}
        </div>
                  </div>
                  
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button onClick={() => setShowAddLead(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button onClick={handleAddLeadSubmit} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer">Add Lead</button>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Broker(s)</label>
                      <Select
                    value={transferForm.brokerIds.map(id => ({ value: id, label: (['b1','b2','b3'].includes(id) ? ['Alice Smith','Bob Johnson','Charlie Brown'][['b1','b2','b3'].indexOf(id)] : id) }))}
                    onChange={(opts) => setTransferForm(prev => ({ ...prev, brokerIds: (opts || []).map(o => o.value) }))}
                    options={[{ value:'all', label:'All Broker' },{ value:'b1', label:'Alice Smith' }, { value:'b2', label:'Bob Johnson' }, { value:'b3', label:'Charlie Brown' }]}
                      styles={customSelectStyles}
                    isMulti isSearchable closeMenuOnSelect={false} hideSelectedOptions
                      placeholder="Choose brokers..."
                    />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Notes (Optional)</label>
                  <textarea rows={3} value={transferForm.notes} onChange={(e)=>setTransferForm({ ...transferForm, notes: e.target.value })} placeholder="Add any specific instructions or context..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-600 text-sm bg-white" />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button onClick={() => setShowTransfer(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button onClick={() => setShowTransfer(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer">Send Transfer Request</button>
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
                <h4 className="text-[18px] font-semibold text-slate-900">Lead Details</h4>
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
                      <div className="text-[13px] text-slate-500">{(selectedLead.region?.name || selectedLead.region || '—')} • {(selectedLead.contact || selectedLead.customerPhone || '—')}</div>
                      </div>
                    </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClasses(selectedLead.status)}`}>{selectedLead.status || 'Active'}</span>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-3">
                    <h5 className="text-[16px] font-semibold text-slate-900">Customer Information</h5>
                      {!viewEditMode ? (
                      <button onClick={() => setViewEditMode(true)} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer">Edit</button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={saveViewEdits} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer">Save</button>
                        <button onClick={() => setViewEditMode(false)} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 cursor-pointer">Cancel</button>
                        </div>
                      )}
                    </div>

                  <div className="text-[14px] text-slate-700">
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                      <span className="col-span-1 text-slate-500">Name:</span>
                      <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                          <input name="name" value={viewForm.name} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-600" />
                        ) : (selectedLead.name || selectedLead.customerName || '—')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                      <span className="col-span-1 text-slate-500">Phone:</span>
                      <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                          <input name="contact" value={viewForm.contact} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-600" />
                        ) : (selectedLead.contact || selectedLead.customerPhone || '—')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                      <span className="col-span-1 text-slate-500">Email:</span>
                      <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                          <input name="email" value={viewForm.email} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-600" />
                        ) : (selectedLead.customerEmail || '—')}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2">
                      <span className="col-span-1 text-slate-500">Budget:</span>
                      <span className="col-span-2 text-slate-900">
                          {viewEditMode ? (
                          <input name="budget" value={viewForm.budget} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-600" />
                        ) : (typeof selectedLead.budget === 'number' ? `$${selectedLead.budget.toLocaleString()}` : (selectedLead.budget || '—'))}
                        </span>
                      </div>
                    </div>
                  </div>

                   <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                  <h5 className="text-[16px] font-semibold text-slate-900 mb-3">Lead Lifecycle</h5>
                  <ul className="text-[14px] text-slate-700 space-y-3">
                    <li className="flex items-start gap-2"><span className="mt-2 w-2 h-2 rounded-full bg-gray-400"></span><div><div className="font-medium">Created At</div><div className="text-slate-500">{selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleString() : '—'}</div></div></li>
                    <li className="flex items-start gap-2"><span className="mt-2 w-2 h-2 rounded-full bg-indigo-500"></span><div><div className="font-medium">Created By</div><div className="text-slate-500">{selectedLead.createdBy?.name || '—'}</div></div></li>
                    <li className="flex items-start gap-2"><span className="mt-2 w-2 h-2 rounded-full bg-emerald-500"></span><div><div className="font-medium">Updated At</div><div className="text-slate-500">{selectedLead.updatedAt ? new Date(selectedLead.updatedAt).toLocaleString() : '—'}</div></div></li>
                     </ul>
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
