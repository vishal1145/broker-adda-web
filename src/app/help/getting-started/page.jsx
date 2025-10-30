"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gettingStartedData from '../../data/gettingStarted.json';
import HeaderFile from '../../components/Header';
import Features from '../../components/Features';
import furnitureData from '../../data/furnitureData.json';

const GettingStartedPage = () => {
  const router = useRouter();
  const data = gettingStartedData;

  return (
    <div className="min-h-screen ">
      <HeaderFile data={data} />

      {/* Main Content */}
      <div className="py-14">
        <div className="w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: 9 columns content including video aligned left */}
            <div className="lg:col-span-9">
              {/* Custom Sections with Video */}
              {Array.isArray(data.customSections) && data.customSections.length > 0 && (
                <div className="space-y-10 mb-10">
                  {data.customSections.map((section, idx) => (
                    <div key={idx}>
                      {/* Text section without card styling */}
                      <div className="p-0">
                        <h2 className=" text-[16px] leading-[24px] font-bold text-[#171A1FFF] mb-3">{section.title}</h2>
                        <p className="mb-4 font-[Inter] text-[12px] leading-[26px] font-normal text-[#565D6D]">{section.description}</p>
                        {section.highlightsTitle && (
                          <h3 className="text-gray-900 font-[Inter] text-[16px] leading-[24px] font-medium  mt-2">{section.highlightsTitle}</h3>
                        )}
                        {Array.isArray(section.highlights) && section.highlights.length > 0 && (
                          <ul className="list-disc list-inside  mb-4 space-y-1 font-[Inter] text-[12px] leading-[26px] font-normal text-[#565D6D]">
                            {section.highlights.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        )}
                        {Array.isArray(section.details) && section.details.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {section.details.map((para, i) => (
                              <p key={i} className="text-gray-600">{para}</p>
                            ))}
                          </div>
                        )}
                        {section.link && (
                          <Link href={section.link.href} className="text-gray-900 hover:text-gray-900 font-medium inline-block">
                            {section.link.text}
                          </Link>
                        )}
                      </div>

                      {/* Video left-aligned and full width within the left column */}
                      {section.video?.embedUrl && (
                        <div className="mt-4 w-full h-[350px]">
                          <iframe
                            src={`${section.video.embedUrl}?autoplay=0`}
                            title={section.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: 3 columns sidebar tips with title-based tooltips */}
            <aside className="lg:col-span-3 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-gray-600 text-[11px]">i</span>
                    <div className="text-[14px] font-semibold text-[#171A1FFF]">Quick Tips</div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {(data.customSections || []).slice(0, 5).map((section, idx) => {
                    const hint = section.description || (Array.isArray(section.highlights) && section.highlights[0]) || 'View details';
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
                  {(data.customSections || []).slice(0, 3).map((section, idx) => {
                    const hint = (Array.isArray(section.highlights) && section.highlights[0]) || section.description || 'View details';
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
                    { label: 'Getting Started', tip: 'Watch the intro video and follow highlights' },
                    { label: 'Explore Features', tip: 'Use the key features to speed setup' },
                    { label: 'Contact Support', tip: 'Reach us if you get stuck' },
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

          {/* Quick Start Guide removed as requested */}

          {/* Features Section */}
          {/* <div className="grid md:grid-cols-3 gap-6 mb-8">
            {data.features.items.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon === 'search' && (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  {feature.icon === 'verified' && (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {feature.icon === 'support' && (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div> */}

          {/* FAQ Section */}
          <div className="mb-8">
            <h2 className=" text-[16px] leading-[24px] font-bold text-[#171A1FFF] mb-6">{data.faq.title}</h2>
            
            <div className="space-y-6">
              {data.faq.questions.map((faq, index) => (
                <div key={index}>
                  <h3 className="font-[Inter] text-[14px] leading-[24px] font-medium text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="font-[Inter] text-[12px] leading-[26px] font-normal text-[#565D6D]">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section (restyled only; content unchanged) */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="max-w-3xl">
                <div className="text-[12px] leading-[18px] text-amber-800/80 mb-1">&nbsp;</div>
                <h2 className="text-[16px] leading-[24px] font-bold text-[#19191F] mb-2">{data.contact.title}</h2>
                <p className="font-[Inter] text-[12px] leading-[26px] font-normal text-[#19191F]">
                  {data.contact.description}
                </p>
              </div>
              <div className="flex flex-row gap-3 md:gap-4 md:justify-end">
                {data.contact.buttons.map((button, index) => (
                  <Link
                    key={index}
                    href={button.href}
                    className={`px-4 md:px-5 py-2.5  rounded-md text-[12px]  font-medium transition-colors border ${
                      button.type === 'primary'
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-[#19191F] border-yellow-500'
                        : 'bg-white text-yellow-600 hover:bg-yellow-100 border-yellow-300'
                    }`}
                  >
                    {button.text}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Features data={furnitureData.features} />
        </div>
      </div>
    </div>
  );
};

export default GettingStartedPage;