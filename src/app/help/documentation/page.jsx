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
        <div className="w-full mx-auto px-4 md:px-0">
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
                    {/* <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-[11px]">i</span> */}
                    <div className="text-[14px] font-semibold text-[#171A1FFF]">Quick Tips</div>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Start with account basics, then review security preferences.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Keep documents clear and under 10MB for smooth uploads.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Use nearest regions for quick setup; refine later if needed.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Check notifications to stay updated on lead activity.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Visit Help → Documentation for step‑by‑step guides.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-[11px]">★</span> */}
                    <div className="text-[14px] font-semibold text-[#171A1FFF]">Popular Topics</div>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Profile verification and KYC overview.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">How to create and manage leads effectively.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Assign regions and optimize search results.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Sharing leads securely with other brokers.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Privacy settings and two‑factor authentication.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-[11px]">?</span> */}
                    <div className="text-[14px] font-semibold text-[#171A1FFF]">Need Help?</div>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Reset password, update profile, and verification steps.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Import, assign, and track lead status efficiently.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Enable 2FA and review privacy controls.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Contact support for billing or access issues.</li>
                </ul>
              </div>
              {/* Support & Documentation (like profile page) */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-[14px] font-semibold text-[#171A1FFF]">Support & Documentation</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 group cursor-pointer">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12ZM23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12Z" fill="#0D542B"/>
                        <path d="M9.9 6.55C10.71 6.07 11.67 5.9 12.6 6.06C13.53 6.22 14.37 6.7 14.98 7.42C15.59 8.14 15.92 9.06 15.92 10L15.91 10.28C15.78 11.66 14.73 12.58 13.97 13.08C13.54 13.37 13.11 13.59 12.8 13.73C12.23 13.96 11.57 13.69 11.38 13.1C11.2 12.52 11.47 11.85 12.05 11.66C12.55 11.48 13 11.22 13.37 10.98C13.92 10.61 14.17 10.26 14.2 10C14.16 9.41 13.77 8.82 13.15 8.7C12.53 8.58 11.96 8.83 11.67 9.33C11.43 9.73 10.9 9.86 10.49 9.62C10.08 9.38 9.95 8.85 10.19 8.44C10.41 8.06 10.65 7.78 10.9 7.57C10.61 7.62 10.26 7.68 9.9 7.8C9.33 7.99 8.67 7.72 8.49 7.13C8.31 6.55 8.58 5.88 9.16 5.7C9.39 5.63 9.64 5.58 9.9 5.55V5.55Z" fill="#0D542B"/>
                        <circle cx="12" cy="17" r="1" fill="#0D542B"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] leading-[20px] font-medium text-[#171A1F]">Visit Support Center</div>
                      <div className="text-[12px] leading-[16px] text-[#565D6D]">Browse FAQs and troubleshooting</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group cursor-pointer">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#0D542B" strokeWidth="2"/>
                        <path d="M7 8h10M7 12h10M7 16h6" stroke="#0D542B" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] leading-[20px] font-medium text-[#171A1F]">Read Documentation</div>
                      <div className="text-[12px] leading-[16px] text-[#565D6D]">Guides and tutorials</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#0D542B" strokeWidth="2"/>
                        <path d="M22 7 12 13 2 7" stroke="#0D542B" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] leading-[20px] font-medium text-[#171A1F]">Email Support</div>
                      <div className="text-[12px] leading-[16px] text-[#565D6D]">support@brokeradda.com</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3 6.18 2 2 0 0 1 5 4h3.3a1 1 0 0 1 .95.68l1.2 3.6a1 1 0 0 1-.27 1.06l-1.8 1.8a12 12 0 0 0 6.8 6.8l1.8-1.8a1 1 0 0 1 1.06-.27l3.6 1.2A1 1 0 0 1 22 16.92Z" stroke="#0D542B" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] leading-[20px] font-medium text-[#171A1F]">Phone Support</div>
                      <div className="text-[12px] leading-[16px] text-[#565D6D]">+91 80 1234 5678</div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default DocumentationPage;



