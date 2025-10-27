"use client";
import React from "react";
import HeaderFile from '../components/Header';
import furnitureData from "../data/furnitureData.json";
import Features from "../components/Features";
import refundData from "../data/refund.json";

export default function ReturnPolicy() {
  return (
    <div>
      <HeaderFile data={refundData.header} />
      <div className=" py-12">
        <div className=" mx-auto">
          <div className="flex flex-col gap-10">
            {refundData.sections.map((section, index) => (
              <div key={index} className="flex flex-col gap-5">
                <h2 className=" text-[24px] leading-[36px] font-bold text-green-900">{section.title}</h2>
                {section.content.map((paragraph, idx) => (
                  <p key={idx} className="font-[Inter] text-[16px] leading-[26px] font-normal text-[#565D6D]">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Features data={furnitureData.features} />
    </div>
  );
}
