import React from 'react';
import privacyData from '../data/privacy.json';
import furnitureData from '../data/furnitureData.json';

import HeaderFile from '../components/Header';

import Features from '../components/Features';

const Privacy = () => {
  // Remove unused destructured variables
  const {  sections } = privacyData;
 // ✅ Replace with your real store name

  // Helper to render section content
  const renderContent = (section) => {


    return <p className="font-[Inter] text-[16px] leading-[26px] font-normal text-[#565D6D]">{section.content}</p>;
  };

  return (
    <>
     
      <HeaderFile data={privacyData} />
       <div className="px-2 py-12">

      <div className=" mx-auto ">
      
        <div className="space-y-10">
          {sections.map((section, index) => (
            <div key={index}>
              <h2 className=" text-2xl leading-9 font-bold text-green-900 mb-2">
                {section.title}
              </h2>
              {Array.isArray(section.content) ? (
                <ul className="font-[Inter] text-[16px] leading-[26px] font-normal text-[#565D6D]">
                  {section.content.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                renderContent(section)
              )}
            </div>
          ))}
        </div>
      </div>
</div>
      <Features data={furnitureData.features} />
     
    </>
  );
};

export default Privacy;
