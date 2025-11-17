"use client";
import React, { useEffect, useState } from 'react';
import termsData from '../data/terms.json'; // Fixed path to go up two levels
import furnitureData from "../data/furnitureData.json";
import HeaderFile from '../components/Header';
import Features from "../components/Features";
const Terms = () => {
  const [terms, setTerms] = useState([]);

  useEffect(() => {
    setTerms(termsData.terms || []);
  }, []);

  return (
     <>
      <HeaderFile data={termsData} />
      <div className="py-12 px-4 md:px-0">
    <div className=" mx-auto ">
      {/* <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800">Terms & Conditions</h1> */}
      <div className="space-y-10">
        {terms.map((term, index) => (
          <div key={index}>
            <h2 className=" text-[16px] leading-[32px] font-bold text-gray-900 mb-2">{term.title}</h2>
            <p className="font-[Inter] text-[12px] leading-[22px] font-normal text-[#565D6D]">{term.description}</p>
          </div>
        ))}
      </div>
    </div>
    </div>
       <Features data={furnitureData.features}/>
    </>
  );
};

export default Terms;
