"use client";
import React, { useState } from 'react';
import faqData from "../data/faq.json";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from '../components/Header';
import Features from "../components/Features";

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);

  const categories = [
    "General Information",
    "Property Search & Viewing", 
    "Investment & Financing",
    "Legal & Documentation",
    "Account & Profile"
  ];

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <HeaderFile data={faqData} />
      <div className="py-16    ">
        <div className=' mx-auto'>
        {/* Breadcrumb Section */}
        {/* <div className="text-sm text-gray-500 mb-4">
          {faqData.breadcrumb.map((crumb, index) => (
            <span key={index}>
              <a href={crumb.href} className="text-blue-500 hover:underline">
                {crumb.label}
              </a>
              {index < faqData.breadcrumb.length - 1 && ' > '}
            </span>
          ))}
        </div> */}

        {/* Title Section */}
        {/* <div className="text-2xl font-semibold text-orange-500 mb-8">{faqData.title}</div> */}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Categories */}
          <div className="lg:col-span-1">
            <div className="space-y-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setActiveCategory(index)}
                  className={`w-full p-4 rounded-lg text-center font-medium transition-colors duration-200 ${
                    activeCategory === index 
                      ? 'bg-yellow-400 text-black' 
                      : 'bg-gray-50 text-black border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - FAQ Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {faqData.faqItems.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    activeIndex === index 
                      ? 'bg-green-800 text-white border-green-700' 
                      : 'bg-white text-black border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className={`font-medium ${activeIndex === index ? 'text-white' : 'text-black'}`}>
                      {item.question}
                    </div>
                    <div className={`text-xl ${activeIndex === index ? 'text-white' : 'text-black'}`}>
                      {activeIndex === index ? '−' : '+'}
                    </div>
                  </div>
                  {activeIndex === index && (
                    <div className={`mt-4 text-sm leading-relaxed ${activeIndex === index ? 'text-white' : 'text-gray-600'}`}>
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
      <Features data={furnitureData.features}/>
    </>
  );
};

export default Faq;
