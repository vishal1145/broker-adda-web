'use client';

import { useState } from 'react';
import Select from 'react-select';
import ProtectedRoute from '../components/ProtectedRoute';

const StatCard = ({ label, value, delta, deltaPositive, bg = 'bg-gray-50' }) => (
  <div className={`${bg} border border-gray-200 rounded-2xl p-6 shadow-sm`}>
    <p className="text-[12px] text-gray-500 mb-2 font-medium">{label}</p>
    <p className="text-[28px] leading-tight font-extrabold text-gray-900 mb-3">{value}</p>
    <span
      className={`inline-block text-[11px] font-semibold px-3 py-1 rounded-full border ${
        deltaPositive
          ? 'bg-green-100 text-green-700 border-green-200'
          : 'bg-red-100 text-red-700 border-red-200'
      }`}
    >
        {delta}
      </span>
  </div>
);

export default function BrokerLeadsPage() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    status: { value: 'all', label: 'All Statuses' },
    broker: { value: 'all', label: 'All Brokers' },
    region: { value: 'all', label: 'All Regions' },
    propertyType: { value: 'all', label: 'All Property Types' },
    requirement: { value: 'all', label: 'All Requirements' },
    startDate: '',
    endDate: '',
    maxBudget: 500000
  });

  // Options for React Select
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'converted', label: 'Converted' }
  ];

  const brokerOptions = [
    { value: 'all', label: 'All Brokers' },
    { value: 'b1', label: 'Alice Smith' },
    { value: 'b2', label: 'Bob Johnson' },
    { value: 'b3', label: 'Charlie Brown' },
    { value: 'b4', label: 'David Wilson' },
    { value: 'b5', label: 'Emma Davis' },
    { value: 'b6', label: 'Frank Miller' },
    { value: 'b7', label: 'Grace Taylor' },
    { value: 'b8', label: 'Henry Anderson' },
    { value: 'b9', label: 'Ivy Thompson' },
    { value: 'b10', label: 'Jack White' },
    { value: 'b11', label: 'Kate Martinez' },
    { value: 'b12', label: 'Liam Garcia' },
    { value: 'b13', label: 'Maya Rodriguez' },
    { value: 'b14', label: 'Noah Lee' }
  ];

  const regionOptions = [
    { value: 'all', label: 'All Regions' },
    { value: 'north', label: 'North' },
    { value: 'south', label: 'South' },
    { value: 'east', label: 'East' },
    { value: 'west', label: 'West' },
    { value: 'central', label: 'Central' },
    { value: 'northeast', label: 'Northeast' },
    { value: 'northwest', label: 'Northwest' },
    { value: 'southeast', label: 'Southeast' },
    { value: 'southwest', label: 'Southwest' },
    { value: 'downtown', label: 'Downtown' },
    { value: 'suburbs', label: 'Suburbs' },
    { value: 'coastal', label: 'Coastal' },
    { value: 'mountain', label: 'Mountain' },
    { value: 'rural', label: 'Rural' }
  ];

  const propertyTypeOptions = [
    { value: 'all', label: 'All Property Types' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'plot', label: 'Plot' },
    { value: 'other', label: 'Other' }
  ];

  const requirementOptions = [
    { value: 'all', label: 'All Requirements' },
    { value: 'buy', label: 'Buy' },
    { value: 'rent', label: 'Rent' }
  ];

  // Custom styles for React Select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '38px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      backgroundColor: 'white',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '2px 8px'
    }),
    input: (provided) => ({
      ...provided,
      margin: '0px',
      padding: '0px'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      paddingRight: '8px'
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 99999,
      marginTop: '4px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      overflowX: 'hidden'
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '200px',
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '4px 0',
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-track': {
        background: '#f8fafc',
        borderRadius: '4px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#cbd5e1',
        borderRadius: '4px',
        border: '2px solid #f8fafc',
        '&:hover': {
          background: '#94a3b8'
        }
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : 'transparent',
      color: state.isSelected ? 'white' : state.isFocused ? '#1f2937' : '#6b7280',
      fontSize: '14px',
      padding: '8px 12px',
      cursor: 'pointer',
      borderRadius: '4px',
      margin: '2px 4px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#f1f5f9',
        color: state.isSelected ? 'white' : '#1f2937'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1f2937',
      fontSize: '14px',
      fontWeight: '500'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: '14px'
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      '&:hover': {
        color: '#374151'
      }
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      '&:hover': {
        color: '#374151'
      }
    })
  };

  // Add Lead modal state
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    requirement: { value: 'buy', label: 'Buy' },
    propertyType: { value: 'residential', label: 'Residential' },
    budget: '',
    region: { value: 'north', label: 'North' },
    notes: '',
    files: null,
  });

  const handleNewLeadChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setNewLead((p) => ({ ...p, [name]: files }));
    } else {
      setNewLead((p) => ({ ...p, [name]: value }));
    }
  };

  // Transfer modal
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({ brokerIds: [], notes: '' });
  const brokers = [
    { id: 'b1', name: 'Alice Smith' },
    { id: 'b2', name: 'Bob Johnson' },
    { id: 'b3', name: 'Charlie Brown' }
  ];


  // View Lead modal
  const [showView, setShowView] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  // View drawer UX state
  const [viewEditMode, setViewEditMode] = useState(false);
  const [viewClosing, setViewClosing] = useState(false);
  const [viewForm, setViewForm] = useState({ name: '', contact: '', email: '', budget: '', requirement: '' });
  const saveViewEdits = () => {
    setSelectedLead((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        name: viewForm.name || prev.name,
        contact: viewForm.contact || prev.contact,
        customerName: viewForm.name || prev.customerName,
        customerPhone: viewForm.contact || prev.customerPhone,
        customerEmail: viewForm.email || prev.customerEmail,
        budget: viewForm.budget !== '' ? viewForm.budget : prev.budget,
        requirement: viewForm.requirement || prev.requirement,
      };
    });
    setViewEditMode(false);
  };

  const handleViewFieldChange = (e) => {
    const { name, value } = e.target;
    setViewForm((p) => ({ ...p, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      status: { value: 'all', label: 'All Statuses' },
      broker: { value: 'all', label: 'All Brokers' },
      region: { value: 'all', label: 'All Regions' },
      propertyType: { value: 'all', label: 'All Property Types' },
      requirement: { value: 'all', label: 'All Requirements' },
      startDate: '',
      endDate: '',
      maxBudget: 500000
    });
  };

  return (
    <ProtectedRoute requiredRole="broker">
      <div className="min-h-screen bg-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-black">Leads & Visitors</h1>
            <p className="text-sm text-gray-600 mt-3">Streamline your lead generation and client engagement with comprehensive management tools.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard bg="bg-blue-50" label="Total Leads" value="1,245" delta="+12% last month" deltaPositive />
            <StatCard bg="bg-amber-50" label="New Leads Today" value="35" delta="-5% from yesterday" />
            <StatCard bg="bg-green-50" label="Converted Leads" value="187" delta="+8% last month" deltaPositive />
            <StatCard bg="bg-purple-50" label="Avg. Deal Size" value="$12,500" delta="+3% last quarter" deltaPositive />
          </div>

          {/* Search and Advanced Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by Name, Phone Number, Email or Tag ID"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-sm"
              />
              <svg className="w-5 h-5 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </div>
            {/* Quick Status Filter */}
            <div className="w-full sm:w-48">
              <label className="sr-only">Status</label>
              <Select
                value={filters.status}
                onChange={(opt) => setFilters({ ...filters, status: opt })}
                options={statusOptions}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-100 shadow-sm flex items-center justify-center ${showAdvanced ? 'ring-4 ring-green-100' : ''}`}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1.447.894l-2-1A1 1 0 0111 18v-4.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Advanced Filters
            </button>
          </div>

          {/* Advanced Filters Modal */}
          {showAdvanced && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
    <div className="absolute inset-0 bg-black/60" onClick={() => setShowAdvanced(false)} />
    <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900">Advanced Filters</h4>
        <button
          onClick={() => setShowAdvanced(false)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
        </button>
                </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-auto">
        {/* Row 1: Region */}
                <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Region</label>
          <Select
            value={filters.region}
            onChange={(opt) => setFilters({ ...filters, region: opt })}
            options={regionOptions}
            styles={{
              ...customSelectStyles,
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999, overflow: "hidden" }),
              menuList: (base) => ({
                ...base,
                maxHeight: 240,
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 0,
              }),
            }}
            menuPortalTarget={typeof window !== "undefined" ? document.body : null}
            menuPosition="fixed"
            isSearchable={false}
          />
                </div>

        {/* Row 2: Property Type */}
                <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Property Type</label>
          <Select
            value={filters.propertyType}
            onChange={(opt) => setFilters({ ...filters, propertyType: opt })}
            options={propertyTypeOptions}
            styles={{
              ...customSelectStyles,
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999, overflow: "hidden" }),
              menuList: (base) => ({
                ...base,
                maxHeight: 240,
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 0,
              }),
            }}
            menuPortalTarget={typeof window !== "undefined" ? document.body : null}
            menuPosition="fixed"
            isSearchable={false}
                  />
                </div>

        {/* Row 3: Requirement */}
                <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Requirement</label>
          <Select
            value={filters.requirement}
            onChange={(opt) => setFilters({ ...filters, requirement: opt })}
            options={requirementOptions}
            styles={{
              ...customSelectStyles,
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999, overflow: "hidden" }),
              menuList: (base) => ({
                ...base,
                maxHeight: 240,
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: 0,
              }),
            }}
            menuPortalTarget={typeof window !== "undefined" ? document.body : null}
            menuPosition="fixed"
            isSearchable={false}
                  />
                </div>

        {/* Row 4: Max Budget */}
                <div>
          <label className="block text-xs font-medium text-gray-700 mb-4">
            Max Budget:{" "}
            <span className="text-blue-700 font-semibold">
              ${filters.maxBudget.toLocaleString()}
            </span>
          </label>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={filters.maxBudget}
                    onChange={(e) => setFilters({ ...filters, maxBudget: Number(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Clear Filters
                </button>
                <button
          onClick={() => setShowAdvanced(false)}
          className="px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-100 shadow-sm"
                >
                  Apply Filters
                </button>
      </div>
              </div>
            </div>
          )}


          {/* Lead List - full table columns with action buttons */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Leads List</h3>
              <button type="button" onClick={() => setShowAddLead(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-green-800 hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Add New Lead
              </button>
            </div>
            <div className="">
              <div className="grid grid-cols-12  px-6 py-3 text-[11px] font-medium text-gray-600 bg-gray-100 rounded-xl mb-3">
                <div className="col-span-2 text-left whitespace-nowrap">Customer Name</div>
                <div className="col-span-2 text-left whitespace-nowrap">Contact</div>
                <div className="col-span-2 text-left whitespace-nowrap">Requirement</div>
                <div className="col-span-2 text-left whitespace-nowrap">Budget</div>
                <div className="col-span-1 text-left whitespace-nowrap">Region</div>
                <div className="col-span-1 text-left whitespace-nowrap">Status</div>
                <div className="col-span-2 text-center ">Actions</div>
              </div>
              {[
                { id: 1, name: 'John Doe', contact: '+1-XXX-XXX-1234', req: '2BHK apartment in city center', budget: '$250,000.00', region: 'North', status: 'New', statusColor: 'bg-blue-100 text-blue-700', broker: 'Alice Smith' },
                { id: 2, name: 'Jane Miller', contact: 'jane.mXXX@email.com', req: 'Commercial office space', budget: '$750,000.00', region: 'South', status: 'Contacted', statusColor: 'bg-green-100 text-green-700', broker: 'Bob Johnson' },
                { id: 3, name: 'David Lee', contact: '+1-XXX-XXX-5678', req: 'Vacation home near beach', budget: '$400,000.00', region: 'East', status: 'Qualified', statusColor: 'bg-green-100 text-green-700', broker: 'Charlie Brown' }
              ].map((row) => (
                <div key={row.id} className="">
                  <div className="grid grid-cols-12 items-center bg-white rounded-xl border border-gray-200 px-6 py-4 mb-3 shadow-sm">
                    <div className="col-span-2 flex items-center gap-3 min-h-[44px]">
                      <span className="text-sm font-medium text-gray-900 whitespace-normal break-words">{row.name}</span>
                    </div>
                    <div className="col-span-2 text-[12px] text-gray-700 whitespace-normal break-words text-left">{row.contact}</div>
                    <div className="col-span-2 text-[12px] text-gray-700 whitespace-normal break-words text-left">{row.req}</div>
                    <div className="col-span-2 text-[12px] text-gray-700 whitespace-normal break-words text-left">{row.budget}</div>
                    <div className="col-span-1 text-[12px] text-gray-700 whitespace-normal break-words text-left">{row.region}</div>
                    <div className="col-span-1 text-left">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold min-w-[64px] justify-center ${row.statusColor}`}>{row.status}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="flex items-center justify-end  text-gray-500 whitespace-nowrap gap-2">
                       {/* View */}
                      <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" aria-label="view" onClick={() => { setSelectedLead(row); setViewEditMode(false); setViewClosing(false); setViewForm({ name: row.name || '', contact: row.contact || '', email: '-', budget: row.budget || '', requirement: row.req || '' }); setShowView(true); }}>
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                       </button>
                      {/* Edit (disabled as edit happens inside drawer) */}
                      {false && (
                        <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" aria-label="edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M4 16.5V20h3.5l9.793-9.793a1 1 0 000-1.414L16.207 5.5a1 1 0 00-1.414 0L4 16.5z" /></svg>
                       </button>
                      )}
                        {/* Transfer */}
                        <button className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50" aria-label="transfer" onClick={() => setShowTransfer(true)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m0 0l-3-3m3 3l-3 3M16 17H8m0 0l3 3m-3-3l3-3"/></svg>
                        </button>
                       
                        {/* Delete */}
                       <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700" aria-label="delete">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                       </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Add Lead Modal */}
          {showAddLead && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddLead(false)} />
              <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900">Add New Lead</h4>
        <button onClick={() => setShowAddLead(false)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Close">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-auto">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name</label>
          <input
            name="customerName"
            value={newLead.customerName}
            onChange={handleNewLeadChange}
            type="text"
            placeholder="Enter customer's full name"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-sm"
          />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Contact Phone</label>
            <input
              name="customerPhone"
              value={newLead.customerPhone}
              onChange={handleNewLeadChange}
              type="tel"
              placeholder="e.g., +1 (555) 123-4567"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-sm"
            />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Contact Email</label>
            <input
              name="customerEmail"
              value={newLead.customerEmail}
              onChange={handleNewLeadChange}
              type="email"
              placeholder="e.g., john.doe@example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-sm"
            />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Property Type</label>
            <Select
              value={newLead.propertyType}
              onChange={(selectedOption) => setNewLead({ ...newLead, propertyType: selectedOption })}
              options={propertyTypeOptions}
              styles={{
                ...customSelectStyles,
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 9999, overflow: 'hidden' }),
                menuList: (base) => ({ ...base, maxHeight: 240, overflowY: 'auto', overflowX: 'hidden', paddingRight: 0 }),
              }}
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              isSearchable={false}
            />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Requirement</label>
            <Select
              value={newLead.requirement}
              onChange={(selectedOption) => setNewLead({ ...newLead, requirement: selectedOption })}
              options={requirementOptions}
              styles={{
                ...customSelectStyles,
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 9999, overflow: 'hidden' }),
                menuList: (base) => ({ ...base, maxHeight: 240, overflowY: 'auto', overflowX: 'hidden', paddingRight: 0 }),
              }}
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              isSearchable={false}
            />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Budget</label>
          <input
            name="budget"
            value={newLead.budget}
            onChange={handleNewLeadChange}
            type="number"
            placeholder="e.g., 500000"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-sm"
          />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Region</label>
          <Select
            value={newLead.region}
            onChange={(selectedOption) => setNewLead({ ...newLead, region: selectedOption })}
            options={regionOptions.filter(option => option.value !== 'all')}
            styles={{
              ...customSelectStyles,
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999, overflow: 'hidden' }),
              menuList: (base) => ({ ...base, maxHeight: 240, overflowY: 'auto', overflowX: 'hidden', paddingRight: 0 }),
            }}
            menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
            menuPosition="fixed"
            isSearchable={false}
          />
        </div>
                  </div>
                  
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
        <button onClick={() => setShowAddLead(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={() => setShowAddLead(false)} className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-green-800 hover:bg-green-900">
          Add Lead
        </button>
                </div>
              </div>
            </div>
          )}


          {/* Transfer Lead Modal */}
          {showTransfer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowTransfer(false)} />
              <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900">Transfer Lead</h4>
                  <button onClick={() => setShowTransfer(false)} className="p-2 rounded-lg hover:bg-gray-100">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="px-6 py-5 space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Select Broker(s)</label>
                      <Select
                      value={transferForm.brokerIds.map(id => {
                        const broker = brokers.find(b => b.id === id);
                        return broker ? { value: broker.id, label: broker.name } : null;
                      }).filter(Boolean)}
                      onChange={(selectedOptions) => {
                        const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                        setTransferForm(prev => ({ ...prev, brokerIds: selectedIds }));
                      }}
                      options={brokers.map(b => ({ value: b.id, label: b.name }))}
                      styles={customSelectStyles}
                        isMulti
                        isSearchable
                        closeMenuOnSelect={false}
                        hideSelectedOptions
                      placeholder="Choose brokers..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Transfer Notes (Optional)</label>
                    <textarea rows={3} value={transferForm.notes} onChange={(e)=>setTransferForm({...transferForm, notes: e.target.value})} placeholder="Add any specific instructions or context for the new broker..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 text-sm" />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button onClick={() => setShowTransfer(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button onClick={() => setShowTransfer(false)} className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-green-800 hover:bg-green-900">Send Transfer Request</button>
                </div>
              </div>
            </div>
          )}

          {/* View Lead Drawer (right side) */}
          {showView && selectedLead && (
            <div className={`fixed inset-0 z-50 ${viewClosing ? 'pointer-events-none' : ''}`}>
              <div className="absolute inset-0 bg-black/50" onClick={() => { setViewClosing(true); setTimeout(() => setShowView(false), 200); }} />
              <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl ${viewClosing ? 'animate-slide-out' : 'animate-slide-in'}`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    {/* <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6zm8-4a4 4 0 100 8 4 4 0 000-8z"/></svg> */}
                    <h4 className="text-[18px] font-semibold text-black">Lead Details</h4>
                  </div>
                  <button onClick={() => { setViewClosing(true); setTimeout(() => setShowView(false), 200); }} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="p-5 space-y-4 overflow-y-auto no-scrollbar h-[calc(100%-56px)] bg-gray-50">
                  {/* Lead summary */}
                  <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                        {(selectedLead.name || '?').split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-gray-900">{selectedLead.name}</div>
                        <div className="text-[12px] text-gray-500">{selectedLead.region} • {selectedLead.contact}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${selectedLead.statusColor || 'bg-gray-100 text-gray-700'}`}>{selectedLead.status || 'Active'}</span>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-[16px] font-semibold text-black">Customer Information</h5>
                      {!viewEditMode ? (
                        <button onClick={() => setViewEditMode(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-700 hover:bg-green-800">Edit</button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={saveViewEdits} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-700 hover:bg-green-800">Save</button>
                          <button onClick={() => setViewEditMode(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200">Cancel</button>
                        </div>
                      )}
                    </div>
                    <div className="text-[13px] text-gray-700">
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                        <span className="col-span-1 text-gray-500 inline-flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A4 4 0 018 17h8a4 4 0 012.879 1.196M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          Name:
                        </span>
                        <span className="col-span-2 text-gray-900">
                          {viewEditMode ? (
                            <input name="name" value={viewForm.name} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600" />
                          ) : (
                            selectedLead.name
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                        <span className="col-span-1 text-gray-500 inline-flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.518 4.553a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.553 1.518A1 1 0 0121 19.72V23a2 2 0 01-2 2h-1C9.163 25 1 16.837 1 7V6a2 2 0 012-2z"/></svg>
                          Phone:
                        </span>
                        <span className="col-span-2 text-gray-900">
                          {viewEditMode ? (
                            <input name="contact" value={viewForm.contact} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600" />
                          ) : (
                            selectedLead.contact
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                        <span className="col-span-1 text-gray-500 inline-flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
                          Email:
                        </span>
                        <span className="col-span-2 text-gray-900">
                          {viewEditMode ? (
                            <input name="email" value={viewForm.email} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600" />
                          ) : (
                            '-'
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2 border-b border-gray-100">
                        <span className="col-span-1 text-gray-500">Requirement:</span>
                        <span className="col-span-2">
                          <span className="inline-flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">Buy</span>
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]">Apartment</span>
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]">3 BHK</span>
                          </span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 items-center py-2">
                        <span className="col-span-1 text-gray-500 inline-flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10v10m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          Budget:
                        </span>
                        <span className="col-span-2 text-gray-900">
                          {viewEditMode ? (
                            <input name="budget" value={viewForm.budget} onChange={handleViewFieldChange} className="w-full px-2 py-1 border border-gray-200 rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600" />
                          ) : (
                            selectedLead.budget
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                   <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                     <h5 className="text-[16px] font-semibold text-black mb-3">Lead Lifecycle</h5>
                     <ul className="text-[13px] text-gray-700 space-y-3">
                       <li className="flex items-start gap-2">
                         <span className="mt-2 w-2 h-2 rounded-full bg-gray-400"></span>
                         <div>
                           <div className="font-medium">Created At</div>
                           <div className="text-gray-500">{selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleString() : '—'}</div>
                         </div>
                       </li>
                       <li className="flex items-start gap-2">
                         <span className="mt-2 w-2 h-2 rounded-full bg-blue-500"></span>
                         <div>
                           <div className="font-medium">Created By</div>
                           <div className="text-gray-500">{selectedLead.createdBy?.name || '—'}</div>
                         </div>
                       </li>
                       <li className="flex items-start gap-2">
                         <span className="mt-2 w-2 h-2 rounded-full bg-emerald-500"></span>
                         <div>
                           <div className="font-medium">Updated At</div>
                           <div className="text-gray-500">{selectedLead.updatedAt ? new Date(selectedLead.updatedAt).toLocaleString() : '—'}</div>
                         </div>
                       </li>
                     </ul>
                   </div>

               

                </div>
              </div>
            </div>
          )}
        </div>
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


