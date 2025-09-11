"use client";
import React from 'react';
import furnitureData from "../data/furnitureData.json";
import trackData from "../data/trackorder.json";
import HeaderFile from '../components/Header';
import Features from "../components/Features";

// SVG ICONS for each step
const getStepIcon = (step, active) => {
  switch (step) {
    case "Order Placed":
 return (
   <svg width="50" height="50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  {/* Yellow circle inside clipboard with no stroke */}
    <circle cx="28" cy="28" r="8" fill="#FFB300" opacity="0.5" />

  {/* Clipboard Icon */}
  <g stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="10" width="16" height="20" rx="4" fill="white" />
    <path d="M16 10V8h8v2" />
    <line x1="16" y1="16" x2="24" y2="16" />
    <line x1="16" y1="20" x2="24" y2="20" />
  </g>
</svg>


      );

    case "Accepted":
      return (
       <svg width="50" height="50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  {/* Yellow blob */}
  <circle cx="28" cy="28" r="8" fill="#FFB300" opacity="0.5" />

  {/* Clipboard outline */}
  <g stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="12" y="10" width="16" height="20" rx="4" fill="white" />
    <path d="M16 10V8h8v2" />
    
    {/* Checkmark inside clipboard */}
    <path d="M16 22l3 3 5-5" stroke="#111827" strokeWidth="2" fill="none" />
  </g>
</svg>

      );
    case "In Progress":
      return (
     <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
  <polygon points="12 2 2 7 12 12 22 7 12 2" />
  <polyline points="2 17 12 22 22 17" />
  <polyline points="2 7 2 17" />
  <polyline points="22 7 22 17" />
  <line x1="12" y1="12" x2="12" y2="22" />
</svg>

      );
    case "On the Way":
      return (
       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 6h13v8H3z" />
  <path d="M16 8h3l3 4v2h-6V8z" />
  <circle cx="5.5" cy="18.5" r="1.5" />
  <circle cx="18.5" cy="18.5" r="1.5" />
  <path d="M5.5 18.5H4a1 1 0 01-1-1V14h17v3.5h-1.5" />
  <line x1="6" y1="10" x2="10" y2="10" />
  <line x1="6" y1="12" x2="9" y2="12" />
</svg>

      );
    case "Delivered":
      return (
       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">

  <path d="M3 11V17a1 1 0 001 1h1a2 2 0 004 0h6a2 2 0 004 0h1a1 1 0 001-1v-4h-4v-3H3z" />
  

  <path d="M17 10V7h3l2 3v0" />
  

  <circle cx="8" cy="18" r="1.5" />
  <circle cx="17" cy="18" r="1.5" />
  

  <circle cx="7" cy="6" r="3" />
  <path d="M6.5 6.5l0.75 0.75L8.5 5.5" />
</svg>

      );
    default:
      return null;
  }
};

const steps = [
  {
    label: "Order Placed",
    status: "completed",
    date: "20 Apr 2024",
    time: "11:00 AM"
  },
  {
    label: "Accepted",
    status: "completed",
    date: "20 Apr 2024",
    time: "11:15 AM"
  },
  {
    label: "In Progress",
    status: "pending",
    expectedDate: "21 Apr 2024"
  },
  {
    label: "On the Way",
    status: "pending",
    expectedDate: "22,23 Apr 2024"
  },
  {
    label: "Delivered",
    status: "pending",
    expectedDate: "24 Apr 2024"
  }
];

const TrackTimeline = () => {
  // Find last completed index
  const lastCompleted = steps.map(s => s.status).lastIndexOf('completed');

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex flex-col gap-2">
        {/* Timeline */}
        <div className="flex justify-between mt-6">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center w-1/5">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8">{getStepIcon(step.label, step.status === 'completed')}</div>
                <span className={`text-sm mt-4 ${step.status === 'completed' ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="relative flex items-center justify-between" style={{ minHeight: 80 }}>
          {/* Progress line */}
          <div className="absolute left-28 right-28 top-1/2 transform -translate-y-1/2 h-4 z-0 flex">
            {steps.slice(0, -1).map((step, idx) => (
              <div
                key={idx}
                className={`flex-1 h-1.5 ${idx < lastCompleted ? 'bg-green-900' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          
          {/* Step nodes (icon and checkmark together, on the line) */}
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center w-1/5">
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 flex items-center justify-center rounded-md
                    ${step.status === 'completed' ? 'bg-green-900' : 'bg-gray-100 border border-gray-300'}`}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M5 10.5l3.5 3.5 6-6"
                        stroke={step.status === 'completed' ? "#fff" : "#D1D5DB"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Step dates - Updated to match image layout */}
        <div className="flex justify-between ">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center w-1/5">
              <span className={`text-base ${
                step.status === 'completed' ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.status === 'completed' ? step.date : 'Expected'}
              </span>
              <span className={`text-base  ${
                step.status === 'completed' ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.status === 'completed' ? step.time : step.expectedDate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TrackResults = () => {
  return (
    <>
      <HeaderFile data={{
        title: "Track Your Order",
        subtitle: "Your order tracking information",
        breadcrumb: [
          { label: "Home", href: "/" },
          { label: "Track Your Order", href: "/trackorder" },
        ]
      }} />

      <section className="py-16 px-6 sm:px-12 lg:px-32">
        <div className="max-w-7xl mx-auto ">
          {/* Order Status Section */}
          <div className="bg-white rounded-lg shadow-sm ">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Order Status</h2>
            <p className="text-gray-600 mb-8 text-base ">Order ID : {trackData.orderStatus.orderId}</p>

            {/* Progress Timeline */}
            <TrackTimeline />
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mt-6">
            <div className="border-b border-gray-100 mb-2 pb-2">
              <h2 className="text-lg  text-gray-900">Products</h2>
            </div>
            <div>
              {trackData.products.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex items-center py-4 ${index !== trackData.products.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  {/* Product Details */}
                  <div className="ml-4 flex-1">
                    <h3 className=" text-gray-900 text-base">{product.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Color : {product.color} | {product.quantity} Qty.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Features data={furnitureData.features} />
    </>
  );
};

export default TrackResults;


