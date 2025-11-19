'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';

const propertyTypeOptions = [
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Plot', label: 'Plot' },
  { value: 'Other', label: 'Other' },
];

const requirementOptions = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'sell', label: 'Sell' },
];

const customSelectStyles = {
  control: (p, s) => ({
    ...p,
    minHeight: '40px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    fontFamily: 'var(--font-body, inherit)',
    fontSize: 12,
    boxShadow: s.isFocused ? '0 0 0 4px rgba(13,84,43,0.12)' : '0 0 1px #171a1f12, 0 0 2px #171a1f1F',
    borderColor: s.isFocused ? '#0D542B' : '#e5e7eb',
    background: 'white',
    ':hover': { borderColor: s.isFocused ? '#0D542B' : '#0D542B' },
  }),
  valueContainer: (p) => ({
    ...p,
    padding: '2px 10px',
    fontFamily: 'var(--font-body, inherit)',
    fontSize: 12,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  menuPortal: (p) => ({ ...p, zIndex: 999999 }),
  option: (p, s) => ({
    ...p,
    backgroundColor: s.isSelected
      ? '#0D542B'
      : s.isFocused
      ? '#E8F8F0'
      : 'transparent',
    color: s.isSelected ? '#ffffff' : s.isFocused ? '#0D542B' : '#4b5563',
    fontSize: 12,
    fontFamily: 'var(--font-body, inherit)',
    borderRadius: 6,
    margin: '2px 6px',
    padding: '8px 12px',
    ':active': {
      backgroundColor: s.isSelected ? '#0D542B' : '#C8F1DC',
      color: s.isSelected ? '#ffffff' : '#0D542B',
    },
  }),
  singleValue: (p) => ({
    ...p,
    color: '#6b7280',
    fontWeight: 400,
    fontFamily: 'var(--font-body, inherit)',
    fontSize: 12,
  }),
  input: (p) => ({
    ...p,
    color: '#6b7280',
    fontWeight: 400,
    fontFamily: 'var(--font-body, inherit)',
    fontSize: 12,
  }),
  placeholder: (p) => ({
    ...p,
    color: '#6b7280',
    fontWeight: 400,
    fontFamily: 'var(--font-body, inherit)',
    fontSize: 12,
  }),
  menu: (p) => ({
    ...p,
    zIndex: 9999,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    fontFamily: 'var(--font-body, inherit)',
    fontSize: 12,
  }),
  menuList: (p) => ({
    ...p,
    maxHeight: 320,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: 0,
    fontFamily: 'var(--font-body, inherit)',
    fontSize: 12,
  }),
};

const modalSelectStyles = {
  ...customSelectStyles,
  menuPortal: (base) => ({ ...base, zIndex: 999999 }),
};

const AddLeadModal = ({ isOpen, onClose, onSuccess, brokerId }) => {
  const [addLeadLoading, setAddLeadLoading] = useState(false);
  const [newLead, setNewLead] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    requirement: null,
    propertyType: null,
    budget: '',
    primaryRegion: null,
    secondaryRegion: null,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [regionsList, setRegionsList] = useState([]);
  const [nearestRegionsList, setNearestRegionsList] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [nearestRegionsLoading, setNearestRegionsLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const token = typeof window !== 'undefined' 
    ? (localStorage.getItem('token') || localStorage.getItem('authToken'))
    : null;

  // Get broker ID from props or localStorage
  const effectiveBrokerId = brokerId || (typeof window !== 'undefined' ? localStorage.getItem('brokerId') : null);

  // Load all regions
  const loadRegions = useCallback(async () => {
    try {
      setRegionsLoading(true);
      const res = await fetch(`${apiUrl}/regions`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to load regions');
      const data = await res.json();
      let regions = [];
      if (data?.success && Array.isArray(data?.data?.regions))
        regions = data.data.regions;
      else if (Array.isArray(data)) regions = data;
      else if (Array.isArray(data?.data)) regions = data.data;
      else if (Array.isArray(data?.regions)) regions = data.regions;
      else if (data?._id && data?.name) regions = [data];
      setRegionsList(regions);
    } catch {
      setRegionsList([]);
    } finally {
      setRegionsLoading(false);
    }
  }, [apiUrl]);

  // Load nearest regions for the broker
  const loadNearestRegions = useCallback(async () => {
    if (!effectiveBrokerId) return;
    try {
      setNearestRegionsLoading(true);
      const url = `${apiUrl}/regions/nearest?brokerId=${encodeURIComponent(effectiveBrokerId)}&limit=5`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('Failed to load nearest regions');
      const data = await res.json();
      let regions = [];
      if (data?.success && Array.isArray(data?.data?.regions))
        regions = data.data.regions;
      else if (Array.isArray(data)) regions = data;
      else if (Array.isArray(data?.data)) regions = data.data;
      else if (Array.isArray(data?.regions)) regions = data.regions;
      else if (data?._id && data?.name) regions = [data];
      setNearestRegionsList(regions);
    } catch {
      setNearestRegionsList([]);
    } finally {
      setNearestRegionsLoading(false);
    }
  }, [apiUrl, token, effectiveBrokerId]);

  // Load regions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRegions();
      if (effectiveBrokerId) {
        loadNearestRegions();
      }
    }
  }, [isOpen, effectiveBrokerId, loadRegions, loadNearestRegions]);

  // Region options - prefer nearest regions, fallback to all regions
  const regionOptions = useMemo(() => {
    const regions = nearestRegionsList.length > 0 ? nearestRegionsList : regionsList;
    return regions.map((r) => ({
      value: r._id || r.id || r,
      label: r.name || r.region || r,
    }));
  }, [regionsList, nearestRegionsList]);

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

    if (!newLead.requirement) {
      errors.requirement = 'Requirement is required';
    }

    if (!newLead.propertyType) {
      errors.propertyType = 'Property type is required';
    }

    if (!newLead.primaryRegion) {
      errors.primaryRegion = 'Primary region is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewLeadChange = (e) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddLeadSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    try {
      setAddLeadLoading(true);
      const req = newLead.requirement?.label || newLead.requirement?.value || newLead.requirement;
      const ptype = newLead.propertyType?.label || newLead.propertyType?.value || newLead.propertyType;
      const primaryRegionId = newLead.primaryRegion?.value || newLead.primaryRegion?._id || newLead.primaryRegion;
      const secondaryRegionId = newLead.secondaryRegion?.value || newLead.secondaryRegion?._id || newLead.secondaryRegion;

      const payload = {
        customerName: newLead.customerName || '',
        customerPhone: newLead.customerPhone || '',
        customerEmail: newLead.customerEmail || '',
        requirement: req || '',
        propertyType: ptype || '',
        budget: newLead.budget !== '' && newLead.budget !== null ? parseFloat(newLead.budget) : 0,
        primaryRegionId: primaryRegionId && primaryRegionId !== 'select region' ? primaryRegionId : '',
        createdBy: effectiveBrokerId || '',
      };

      if (secondaryRegionId && secondaryRegionId !== 'select region') {
        payload.secondaryRegionId = secondaryRegionId;
      }

      const res = await fetch(`${apiUrl}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || errorData?.error || 'Failed to create lead');
      }

      const createdLeadResp = await res.json();
      const createdLead = createdLeadResp?.data?.lead || createdLeadResp?.data?.newLead || createdLeadResp?.lead || createdLeadResp?.newLead || createdLeadResp?.data || createdLeadResp;

      toast.success('Lead created successfully');
      
      // Reset form
      setNewLead({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        requirement: null,
        propertyType: null,
        budget: '',
        primaryRegion: null,
        secondaryRegion: null,
      });
      setValidationErrors({});
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(createdLead);
      }
      
      onClose();
    } catch (error) {
      toast.error(error?.message || 'Error creating lead');
    } finally {
      setAddLeadLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => {
          onClose();
          setValidationErrors({});
        }}
      />
      <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-slate-900">Add New Query</h4>
          <button
            onClick={() => {
              onClose();
              setValidationErrors({});
            }}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-auto">
          <div>
            <label className="block text-xs font-label text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              name="customerName"
              value={newLead.customerName}
              onChange={handleNewLeadChange}
              type="text"
              placeholder="Enter customer's full name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-4 focus:bg-green-50 selection:bg-green-100 selection:text-green-900 caret-green-900 text-sm bg-white ${
                validationErrors.customerName
                  ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                  : 'border-gray-200 focus:ring-green-100 focus:border-green-600'
              }`}
            />
            {validationErrors.customerName && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.customerName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                name="customerPhone"
                value={newLead.customerPhone}
                onChange={handleNewLeadChange}
                type="tel"
                placeholder="Enter 10-digit phone number"
                maxLength="10"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-4 focus:bg-green-50 selection:bg-green-100 selection:text-green-900 caret-green-900 text-sm bg-white ${
                  validationErrors.customerPhone
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                    : 'border-gray-200 focus:ring-green-100 focus:border-green-600'
                }`}
              />
              {validationErrors.customerPhone && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.customerPhone}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-label text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                name="customerEmail"
                value={newLead.customerEmail}
                onChange={handleNewLeadChange}
                type="email"
                placeholder="e.g., john.doe@example.com"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-4 focus:bg-green-50 selection:bg-green-100 selection:text-green-900 caret-green-900 text-sm bg-white ${
                  validationErrors.customerEmail
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                    : 'border-gray-200 focus:ring-green-100 focus:border-green-600'
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
              <div className="flex flex-wrap gap-2">
                {requirementOptions.map((opt) => {
                  const isSelected =
                    (newLead.requirement && (newLead.requirement.value || newLead.requirement)) === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setNewLead({ ...newLead, requirement: opt })}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors transition-shadow duration-150 ${
                        isSelected
                          ? 'bg-green-50 text-green-900 border-green-200 ring-1 ring-green-100 shadow-sm'
                          : 'bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {validationErrors.requirement && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.requirement}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-label text-gray-700 mb-1">Property Type</label>
              <div className="flex flex-wrap gap-2">
                {propertyTypeOptions.map((opt) => {
                  const isSelected =
                    (newLead.propertyType && (newLead.propertyType.value || newLead.propertyType)) === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setNewLead({ ...newLead, propertyType: opt })}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors transition-shadow duration-150 ${
                        isSelected
                          ? 'bg-green-50 text-green-900 border-green-200 ring-1 ring-green-100 shadow-sm'
                          : 'bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {validationErrors.propertyType && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.propertyType}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-label text-gray-700 mb-1">Budget</label>
            {(() => {
              const pTypeRaw =
                newLead.propertyType && typeof newLead.propertyType === 'object'
                  ? newLead.propertyType.value || newLead.propertyType.label || ''
                  : newLead.propertyType || '';
              const pType = String(pTypeRaw).toLowerCase();
              const presets = {
                residential: { min: 5000, max: 100000000, step: 5000 },
                commercial: { min: 10000, max: 500000000, step: 10000 },
                plot: { min: 50000, max: 250000000, step: 50000 },
                other: { min: 1000, max: 50000000, step: 1000 },
              };
              const preset = presets[pType] || { min: 0, max: 10000000, step: 5000 };
              const budgetMin = preset.min;
              const budgetMax = preset.max;
              const budgetStep = preset.step;
              const raw = Number(newLead.budget || 0);
              const value = isNaN(raw) ? budgetMin : Math.min(budgetMax, Math.max(budgetMin, raw));
              const pct = ((value - budgetMin) / (budgetMax - budgetMin)) * 100;
              const fillPct = value > budgetMin ? Math.max(2, pct) : 0;
              return (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="range"
                      min={budgetMin}
                      max={budgetMax}
                      step={budgetStep}
                      value={value}
                      onChange={(e) =>
                        setNewLead({
                          ...newLead,
                          budget: Number(e.target.value),
                        })
                      }
                      className="w-full h-2 rounded-full appearance-none focus:outline-none accent-green-900"
                      style={{
                        background: `linear-gradient(to right, #14532d 0%, #14532d ${fillPct}%, #e5e7eb ${fillPct}%, #e5e7eb 100%)`,
                      }}
                    />
                    <div className="absolute -top-6 right-0 flex items-center border border-green-200 rounded-full bg-green-50 px-2 py-0.5">
                      <span className="text-[11px] font-semibold text-green-900 mr-1">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={String(value)}
                        onChange={(e) => {
                          const n = Number((e.target.value || '').replace(/[^0-9]/g, ''));
                          const clamped = isNaN(n) ? 0 : Math.min(budgetMax, Math.max(budgetMin, n));
                          setNewLead({ ...newLead, budget: clamped });
                        }}
                        className="w-[2ch] text-[11px] font-semibold text-green-900 bg-transparent text-right focus:outline-none font-mono tabular-nums"
                        style={{
                          width: `calc(${Math.max(3, String(value).length)}ch + 0.15rem)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-label text-gray-700 mb-1">
                Primary Region *
              </label>
              <Select
                value={newLead.primaryRegion}
                onChange={(opt) => setNewLead({ ...newLead, primaryRegion: opt })}
                options={regionOptions}
                styles={modalSelectStyles}
                isSearchable
                isLoading={regionsLoading || nearestRegionsLoading}
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                menuPosition="fixed"
                menuPlacement="auto"
                placeholder="Select..."
              />
              {validationErrors.primaryRegion && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.primaryRegion}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-label text-gray-700 mb-1">
                Optional Region
              </label>
              <Select
                value={newLead.secondaryRegion}
                onChange={(opt) => setNewLead({ ...newLead, secondaryRegion: opt })}
                options={regionOptions}
                styles={modalSelectStyles}
                isSearchable
                isLoading={regionsLoading || nearestRegionsLoading}
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                menuPosition="fixed"
                menuPlacement="auto"
                placeholder="Select..."
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              setValidationErrors({});
            }}
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
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {addLeadLoading ? 'Adding Lead...' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;

