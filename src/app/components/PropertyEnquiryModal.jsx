"use client";
import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

const PropertyEnquiryModal = ({ isOpen, onClose, propertyId, propertyBrokerId }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
    requirement: null,
    propertyType: null,
    primaryRegion: null,
    secondaryRegion: null,
    budget: "",
    propertyId: propertyId || "",
  });
  const [loading, setLoading] = useState(false);
  const [regionsList, setRegionsList] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);

  // Requirement and Property Type options
  const requirementOptions = [
    { value: "Buy", label: "Buy" },
    { value: "Rent", label: "Rent" },
    { value: "Sell", label: "Sell" },
  ];

  const propertyTypeOptions = [
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
    { value: "Plot", label: "Plot" },
    { value: "Other", label: "Other" },
  ];

  // Load regions
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setRegionsLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://broker-adda-be.algofolks.com/api";
        const res = await fetch(`${apiUrl}/regions`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to load regions");
        const data = await res.json();
        let regions = [];
        if (data?.success && Array.isArray(data?.data?.regions))
          regions = data.data.regions;
        else if (Array.isArray(data)) regions = data;
        else if (Array.isArray(data?.data)) regions = data.data;
        else if (Array.isArray(data?.regions)) regions = data.regions;
        else if (data?._id && data?.name) regions = [data];
        setRegionsList(regions);
      } catch (error) {

        setRegionsList([]);
      } finally {
        setRegionsLoading(false);
      }
    };
    if (isOpen) {
      loadRegions();
    }
  }, [isOpen]);

  const regionOptions = useMemo(
    () =>
      Array.isArray(regionsList)
        ? regionsList.map((r) => ({
            value: r._id || r.id || r,
            label: r.name || r.region || r,
          }))
        : [],
    [regionsList]
  );

  const modalSelectStyles = {
    control: (p, s) => ({
      ...p,
      minHeight: "40px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      fontSize: 12,
      boxShadow: s.isFocused ? "0 0 0 4px rgba(13,84,43,0.12)" : "0 0 1px #171a1f12, 0 0 2px #171a1f1F",
      borderColor: s.isFocused ? "#0D542B" : "#e5e7eb",
      background: "white",
      ":hover": { borderColor: s.isFocused ? "#0D542B" : "#0D542B" },
    }),
    valueContainer: (p) => ({
      ...p,
      padding: "2px 10px",
      fontSize: 12,
    }),
    indicatorSeparator: () => ({ display: "none" }),
    menuPortal: (p) => ({ ...p, zIndex: 999999 }),
    option: (p, s) => ({
      ...p,
      backgroundColor: s.isSelected
        ? "#0D542B"
        : s.isFocused
        ? "#E8F8F0"
        : "transparent",
      color: s.isSelected ? "#ffffff" : s.isFocused ? "#0D542B" : "#4b5563",
      fontSize: 12,
      borderRadius: 6,
      margin: "2px 6px",
      padding: "8px 12px",
      ":active": {
        backgroundColor: s.isSelected ? "#0D542B" : "#C8F1DC",
        color: s.isSelected ? "#ffffff" : "#0D542B",
      },
    }),
    singleValue: (p) => ({
      ...p,
      color: "#6b7280",
      fontWeight: 400,
      fontSize: 12,
    }),
    input: (p) => ({
      ...p,
      color: "#6b7280",
      fontWeight: 400,
    }),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For budget field, only allow numbers
    if (name === "budget") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!propertyBrokerId) {
      toast.error("Property broker information not available");
      return;
    }

    try {
      setLoading(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://broker-adda-be.algofolks.com/api";
      const token = typeof window !== "undefined" 
        ? localStorage.getItem("token") || localStorage.getItem("authToken")
        : null;

      // Validate required fields
      if (!formData.requirement) {
        toast.error("Please select a requirement");
        return;
      }
      if (!formData.propertyType) {
        toast.error("Please select a property type");
        return;
      }
      if (!formData.primaryRegion) {
        toast.error("Please select a primary region");
        return;
      }

      // Parse budget
      const budgetValue = formData.budget 
        ? parseFloat(String(formData.budget).replace(/[^0-9.]/g, "")) 
        : 0;

      // Extract values from select objects
      const requirement = typeof formData.requirement === "object" 
        ? formData.requirement.value || formData.requirement.label 
        : formData.requirement;
      const propertyType = typeof formData.propertyType === "object" 
        ? formData.propertyType.value || formData.propertyType.label 
        : formData.propertyType;
      const primaryRegionId = formData.primaryRegion && typeof formData.primaryRegion === "object"
        ? formData.primaryRegion.value || formData.primaryRegion._id
        : formData.primaryRegion;
      const secondaryRegionId = formData.secondaryRegion && typeof formData.secondaryRegion === "object"
        ? formData.secondaryRegion.value || formData.secondaryRegion._id
        : formData.secondaryRegion;

      // Map form data to API payload
      const payload = {
        customerName: formData.customerName || "",
        customerPhone: formData.phoneNumber || "",
        customerEmail: formData.email || "",
        requirement: requirement || "",
        propertyType: propertyType || "",
        budget: budgetValue || 0,
        primaryRegionId: primaryRegionId || "",
        createdBy: propertyBrokerId, // Set to property's broker ID
      };

      if (secondaryRegionId) {
        payload.secondaryRegionId = secondaryRegionId;
      }

      const res = await fetch(`${apiUrl}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData?.message || errorData?.error || "Failed to create lead";
        toast.error(errorMsg);
        return;
      }

      toast.success("Lead created successfully!");
    onClose();
    resetForm();
    } catch (error) {

      toast.error("Error creating lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      email: "",
      phoneNumber: "",
      requirement: null,
      propertyType: null,
      primaryRegion: null,
      secondaryRegion: null,
      budget: "",
      propertyId: propertyId || "",
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 mt-8"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose} 
    >
      {/* Modal panel */}
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable area (scroll hidden visually but works) */}
        <div className="max-h-[80vh] overflow-y-auto scrollbar-hide px-6 pt-6 pb-6">
          <div className="w-full text-[12px]">
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">
              Property Enquiry
            </h3>
            <p className="text-[11px] text-gray-500 mb-6">
              Please fill out the form below with your property requirements.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input fields */}
              <div>
                <label className="block text-[11px] font-medium text-gray-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-2">
                  Requirement
                </label>
                <div className="flex flex-wrap gap-2">
                  {requirementOptions.map((opt) => {
                    const isSelected =
                      formData.requirement &&
                      (formData.requirement.value || formData.requirement) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, requirement: opt })
                        }
                        className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors transition-shadow duration-150 ${
                          isSelected
                            ? "bg-green-50 text-green-900 border-green-200 ring-1 ring-green-100 shadow-sm"
                            : "bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypeOptions.map((opt) => {
                    const isSelected =
                      formData.propertyType &&
                      (formData.propertyType.value || formData.propertyType) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, propertyType: opt })
                        }
                        className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors transition-shadow duration-150 ${
                          isSelected
                            ? "bg-green-50 text-green-900 border-green-200 ring-1 ring-green-100 shadow-sm"
                            : "bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700 mb-1">
                  Budget
                </label>
                <input
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Enter budget amount"
                  inputMode="numeric"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Primary Region *
                </label>
                  <Select
                    value={formData.primaryRegion}
                    onChange={(opt) =>
                      setFormData({ ...formData, primaryRegion: opt })
                    }
                    options={regionOptions}
                    styles={modalSelectStyles}
                    isSearchable
                    isLoading={regionsLoading}
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                    menuPlacement="auto"
                    placeholder="Select region"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    Optional Region
                  </label>
                  <Select
                    value={formData.secondaryRegion}
                    onChange={(opt) =>
                      setFormData({ ...formData, secondaryRegion: opt })
                    }
                    options={regionOptions}
                    styles={modalSelectStyles}
                    isSearchable
                    isLoading={regionsLoading}
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                    menuPlacement="auto"
                    placeholder="Select region (optional)"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-green-900 text-[13px] font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Lead..." : "Submit Enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyEnquiryModal;
