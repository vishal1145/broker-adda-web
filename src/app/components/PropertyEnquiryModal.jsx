"use client";
import React, { useState } from "react";

const PropertyEnquiryModal = ({ isOpen, onClose, propertyId }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
    propertyType: "buy",
    location: "",
    minBudget: "",
    maxBudget: "",
    specificRequirements: "",
    propertyId: propertyId || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value) => {
    setFormData((prev) => ({ ...prev, propertyType: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enquiry submitted:", formData);
    alert("Enquiry submitted successfully!");
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      email: "",
      phoneNumber: "",
      propertyType: "buy",
      location: "",
      minBudget: "",
      maxBudget: "",
      specificRequirements: "",
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative border border-gray-100">
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
                <label className="block text-[11px] font-medium text-gray-700">
                  Preferred Property Type
                </label>
                <div className="mt-2 flex items-center space-x-6">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={formData.propertyType === "buy"}
                      onChange={() => handleRadioChange("buy")}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-[12px] text-gray-700">Buy</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={formData.propertyType === "rent"}
                      onChange={() => handleRadioChange("rent")}
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-[12px] text-gray-700">Rent</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="New York, NY"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700">
                  Budget Range
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    name="minBudget"
                    value={formData.minBudget}
                    onChange={handleChange}
                    placeholder="Min Budget (e.g., $100,000)"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="text"
                    name="maxBudget"
                    value={formData.maxBudget}
                    onChange={handleChange}
                    placeholder="Max Budget (e.g., $500,000)"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-700">
                  Specific Requirements
                </label>
                <textarea
                  name="specificRequirements"
                  rows="3"
                  value={formData.specificRequirements}
                  onChange={handleChange}
                  placeholder="Describe your ideal property, number of bedrooms, desired features, etc."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500"
                ></textarea>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-green-900 text-[13px] font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit Enquiry
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
