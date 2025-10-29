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

                  {/* Video outside the card with reduced height */}
                  {section.video?.embedUrl && (
                    <div className="mt-4 w-full md:w-3/4 lg:w-2/3 h-[350px] mx-auto">
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

          {/* Contact Section */}
          <div className="bg-yellow-500 rounded-lg shadow-lg p-8 text-center text-white">
            <h2 className=" text-[16px] leading-[24px] font-bold  mb-4">{data.contact.title}</h2>
            <p className="text-white mb-6 max-w-2xl mx-auto font-[Inter] text-[12px] leading-[26px] font-normal ">
              {data.contact.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {data.contact.buttons.map((button, index) => (
                <Link 
                  key={index}
                  href={button.href} 
                  className={`px-6 py-3 rounded-lg text-[16px] font-medium transition-colors shadow-md ${
                    button.type === 'primary' 
                      ? 'border-2 border-white text-white hover:bg-white hover:text-green-900'
                      : 'border-2 border-white text-white hover:bg-white hover:text-green-900'
                  }`}
                >
                  {button.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Features data={furnitureData.features} />
    </div>
  );
};

export default GettingStartedPage;