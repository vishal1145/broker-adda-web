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
          <ul className="list-disc list-inside  space-y-1 font-[Inter] text-[12px] leading-[26px] font-normal text-[#565D6D]">
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
          <p className="font-[Inter] text-[14px] leading-[24px] font-medium text-[#565D6D] mb-2">{section.content}</p>
        )}
        {Array.isArray(section.bullets) && section.bullets.length > 0 && (
          <ul className="list-disc list-inside  space-y-1 font-[Inter] text-[12px] leading-[26px] font-normal text-[#565D6D]">
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
            <h4 className=" text-[16px] leading-[24px] font-bold text-[#171A1FFF] mb-3">{subsection.title}</h4>
            <p className=" mb-3 font-[Inter] text-[14px] leading-[24px] font-medium text-[#565D6D]">{subsection.content}</p>
            {Array.isArray(subsection.items) && (
              <ul className="list-disc list-inside  space-y-1 font-[Inter] text-[12px] leading-[26px] font-normal text-[#565D6D]">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: 9 columns content */}
            <div className="lg:col-span-9">
              <div className="space-y-10">
                {sortedSections.map((section, index) => (
                  <div key={index} className="">
                    <h2 className="text-[16px] font-bold  text-[#171A1FFF] leading-[24px] mb-4">{section.title}</h2>
                    {renderContent(section)}
                    {renderSubsections(section.subsections)}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 3 columns sidebar with tooltips (like profile page, using title=) */}
            <aside className="lg:col-span-3 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-[11px]">i</span>
                    <div className="text-[14px] font-semibold text-[#171A1FFF]">Quick Tips</div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {sortedSections.map((section, idx) => {
                    // Derive a short hint for tooltip
                    const hint = Array.isArray(section.content)
                      ? section.content[0]
                      : (section.content || (Array.isArray(section.bullets) && section.bullets[0]) || 'View details');
                    return (
                      <li key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-gray-50 px-3 py-2">
                        <span className="text-[12px] leading-[20px] text-[#565D6D]">{section.title}</span>
                        <span
                          className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-[11px] cursor-help"
                          title={typeof hint === 'string' ? hint : ''}
                          aria-label="info"
                        >i</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-[11px]">★</span>
                    <div className="text-[14px] font-semibold text-[#171A1FFF]">Popular Topics</div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {sortedSections.slice(0, 3).map((section, idx) => {
                    const hint = Array.isArray(section.bullets) && section.bullets.length > 0
                      ? section.bullets[0]
                      : (Array.isArray(section.content) ? section.content[0] : section.content) || 'View details';
                    return (
                      <li key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-gray-50 px-3 py-2">
                        <span className="text-[12px] leading-[20px] text-[#565D6D]">{section.title}</span>
                        <span
                          className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-[11px] cursor-help"
                          title={typeof hint === 'string' ? hint : ''}
                          aria-label="info"
                        >i</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-[11px]">?</span>
                    <div className="text-[14px] font-semibold text-[#171A1FFF]">Need Help?</div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {[
                    { label: 'Account Issues', tip: 'Reset password, update profile, verification' },
                    { label: 'Managing Leads', tip: 'Import, assign, and track lead status' },
                    { label: 'Privacy & Security', tip: 'Two-factor auth and data protection' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-gray-50 px-3 py-2">
                      <span className="text-[12px] leading-[20px] text-[#565D6D]">{item.label}</span>
                      <span
                        className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-[11px] cursor-help"
                        title={item.tip}
                        aria-label="info"
                      >i</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default DocumentationPage;



