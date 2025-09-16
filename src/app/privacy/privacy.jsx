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


    return <p className="text-gray-700 leading-relaxed text-[14px]">{section.content}</p>;
  };

  return (
    <>
     
      <HeaderFile data={privacyData} />
       <div className="px-6 sm:px-12 lg:px-32 py-12">

      <div className="max-w-7xl mx-auto ">
      
        <div className="space-y-10">
          {sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-2xl font-semibold text-green-900 mb-2">
                {section.title}
              </h2>
              {Array.isArray(section.content) ? (
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-[14px]">
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
