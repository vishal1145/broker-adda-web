"use client";
import React from 'react';
import documentationData from '../../data/documentation.json';
import HeaderFile from '../../components/Header';
 

const DocumentationPage = () => {
  const { sections } = documentationData;

  // Enforce desired section order
  const desiredOrder = [
    'Account Setup',
    'Leads Management',
    'Privacy & Security',
    'Contact & Support',
  ];
  const orderIndex = new Map(desiredOrder.map((title, idx) => [title, idx]));
  const sortedSections = Array.isArray(sections)
    ? [...sections].sort((a, b) => {
        const ai = orderIndex.has(a.title) ? orderIndex.get(a.title) : Number.MAX_SAFE_INTEGER;
        const bi = orderIndex.has(b.title) ? orderIndex.get(b.title) : Number.MAX_SAFE_INTEGER;
        return ai - bi;
      })
    : [];

  const renderContent = (section) => {
    // If content is an array, treat it as a bullet list
    if (Array.isArray(section.content)) {
      return (
        <ul className="list-disc list-inside text-gray-700 space-y-1 text-[14px]">
          {section.content.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }

    // If content is a string, show paragraph then optional bullets
    return (
      <div>
        {section.content && (
          <p className="text-gray-700 leading-relaxed text-[14px] mb-2">{section.content}</p>
        )}
        {Array.isArray(section.bullets) && section.bullets.length > 0 && (
          <ul className="list-disc list-inside text-gray-700 space-y-1 text-[14px]">
            {section.bullets.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderSubsections = (subsections) => {
    if (!Array.isArray(subsections)) return null;
    
    return (
      <div className="mt-6 space-y-6">
        {subsections.map((subsection, idx) => (
          <div key={idx} className="">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">{subsection.title}</h4>
            <p className="text-gray-700 mb-3 text-[14px]">{subsection.content}</p>
            {Array.isArray(subsection.items) && (
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-[14px]">
                {subsection.items.map((item, itemIdx) => (
                  <li key={itemIdx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <HeaderFile data={documentationData} />
      <div className="py-14">
        <div className="w-full mx-auto ">
          <div className="space-y-10">
            {sortedSections.map((section, index) => (
              <div key={index} className="">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                {renderContent(section)}
                {renderSubsections(section.subsections)}
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </>
  );
};

export default DocumentationPage;



