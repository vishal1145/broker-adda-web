"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import furnitureData from '../data/furnitureData.json';
import trackData from '../data/trackorder.json';
import HeaderFile from '../components/Header';
import Features from "../components/Features";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Tracking:", { orderId, email });
    
    // Navigate to track order results page
    router.push('/track-results');
  };

  return (
    <>
      <HeaderFile data={trackData.header} />

      <section className="py-16">
        <div className=" mx-auto">
          {/* Instructional Text */}
          <p className=" mb-8 text-left font-[Inter] text-[14px] leading-[26px] font-normal text-[#565D6D]">
            To track your order please enter your Order ID in the box below and press the "Track Order" button. This was given to you on your receipt and in the confirmation email you should have received.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-900 mb-2 text-left text-[14px] font-medium">
                Order ID *
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Your Order ID"
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 bg-white text-[12px]"
              />
            </div>

            <div>
              <label className="block text-gray-900 mb-2 text-left text-[14px] font-medium">
                Billing Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address"
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 bg-white text-[12px]"
              />
            </div>

            <button
              type="submit"
              className="bg-green-800 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors duration-200 font-medium text-[14px]"
            >
              Track Order
            </button>
          </form>
        </div>
      </section>

      <Features data={furnitureData.features} />
    </>
  );
};

export default TrackOrder;


