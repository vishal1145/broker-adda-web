"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import checkoutData from "../data/checkout.json";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from "../components/Header";
import Features from "../components/Features";

const Checkout = () => {
  const router = useRouter();
   const [useBillingAsShipping, setUseBillingAsShipping] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    country: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const {
    summary: { items, subtotal, shipping, tax, coupon, total },
  } = checkoutData;

  return (
    <>
      <HeaderFile data={checkoutData}/>
<div className="px-6 sm:px-12 lg:px-32 py-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Billing Form */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Billing Details</h2>
            <form className="space-y-6">
              {/* First + Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Ex. John"
                    className="w-full border rounded-full px-4 py-2 hover:border-green-900 focus:border-green-900 transition"
                    value={form.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Ex. Doe"
                    className="w-full border rounded-full px-4 py-2 hover:border-green-900 focus:border-green-900 transition"
                    value={form.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block font-medium mb-1">Company Name (Optional)</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Enter Company Name"
                  className="w-full border rounded-full px-4 py-2 hover:border-green-900 focus:border-green-900 transition"
                  value={form.company}
                  onChange={handleChange}
                />
              </div>

              {/* Country */}
              <div>
                <label className="block font-medium mb-1">Country *</label>
             <div className="relative w-full">
  <select
    name="country"
    className="w-full appearance-none border rounded-full px-4 py-2 pr-10 hover:border-green-900 focus:border-green-900 transition"
    value={form.country}
    onChange={handleChange}
  >
    <option value="">Select Country</option>
    <option value="India">India</option>
    <option value="USA">USA</option>
  </select>

  {/* Dropdown Icon */}
  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
    <svg
      className="w-4 h-4 text-gray-900"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>

              </div>

              {/* Street */}
              <div>
                <label className="block font-medium mb-1">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  placeholder="Enter Street Address"
                  className="w-full border rounded-full px-4 py-2 hover:border-green-900 focus:border-green-900 transition"
                  value={form.street}
                  onChange={handleChange}
                />
              </div>

              {/* City */}
              <div>
                <label className="block font-medium mb-1">City *</label>
            <div className="relative w-full">
  <select
    name="city"
    className="w-full appearance-none border rounded-full px-4 py-2 pr-10 hover:border-green-900 focus:border-green-900 transition"
    value={form.city}
    onChange={handleChange}
  >
    <option value="">Select City</option>
    <option value="Udaipur">Udaipur</option>
    <option value="Mumbai">Mumbai</option>
  </select>

  {/* Dropdown Icon */}
  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
    <svg
      className="w-4 h-4 text-gray-900"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>

              </div>

              {/* State */}
              <div>
                <label className="block font-medium mb-1">State *</label>
            <div className="relative w-full">
  <select
    name="state"
    className="w-full appearance-none border rounded-full px-4 py-2 pr-10 hover:border-green-900 focus:border-green-900 transition"
    value={form.state}
    onChange={handleChange}
  >
    <option value="">Select State</option>
    <option value="Rajasthan">Rajasthan</option>
    <option value="Maharashtra">Maharashtra</option>
  </select>

  {/* Dropdown Icon */}
  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
    <svg
      className="w-4 h-4 text-gray-900"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>

              </div>

              {/* Zip Code */}
              <div>
                <label className="block font-medium mb-1">Zip Code *</label>
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Enter Zip Code"
                  className="w-full border rounded-full px-4 py-2 hover:border-green-900 focus:border-green-900 transition"
                  value={form.postalCode}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-medium mb-1">Phone *</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter Phone Number"
                  className="w-full border rounded-full px-4 py-2 hover:border-green-900 focus:border-green-900 transition"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email Address"
                  className="w-full border rounded-full px-4 py-2 hover:border-green-900 focus:border-green-900 transition"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              {/* Delivery Address Toggle */}
<div className="pt-4">
  <label className="block font-semibold text-gray-800 mb-2">Delivery Address *</label>
  <div className="flex gap-4">
    <label className={`flex items-center gap-2 border rounded-full px-4 py-2 cursor-pointer transition ${
      useBillingAsShipping ? 'border-green-900 bg-white' : 'border-gray-300'
    }`}>
      <input
        type="radio"
        name="deliveryAddress"
        value="billing"
        checked={useBillingAsShipping}
        onChange={() => setUseBillingAsShipping(true)}
        className="accent-green-900"
      />
      Same as shipping address
    </label>

    <label className={`flex items-center gap-2 border rounded-full px-4 py-2 cursor-pointer transition ${
      !useBillingAsShipping ? 'border-green-900 bg-white' : 'border-gray-300'
    }`}>
      <input
        type="radio"
        name="deliveryAddress"
        value="different"
        checked={!useBillingAsShipping}
        onChange={() => setUseBillingAsShipping(false)}
        className="accent-green-900"
      />
      Use a different billing address
    </label>
  </div>
</div>

            </form>
          </div>

          {/* Order Summary */}
          <div className="border rounded-xl p-3 shadow-sm bg-white h-fit">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
             <hr className="my-4" />
            <div className="flex justify-between text-base mb-3">
              <span className="text-gray-400">Items</span>
              <span>{items}</span>
            </div>
            <div className="flex justify-between text-base mb-3">
              <span className="text-gray-400">Sub Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base mb-3">
              <span className="text-gray-400">Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base mb-3">
              <span className="text-gray-400">Taxes</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base mb-3">
              <span className="text-gray-400">Coupon Discount</span>
              <span className="text-gray-900">- ${coupon.toFixed(2)}</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between  text-lg mb-6">
              <span className="text-gray-400">Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => router.push("/payment")}
              className="w-full bg-green-900 text-white py-3 rounded-full text-sm  hover:bg-green-800 transition"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
      </div>
     <Features data={furnitureData.features}/>
    </>
  );
};

export default Checkout;
