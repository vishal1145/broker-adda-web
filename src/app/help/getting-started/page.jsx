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
                <div className="mb-3 flex items-center">
                  <div className="text-[14px] font-semibold text-[#171A1FFF]">Quick Tips</div>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Watch the intro video and follow the highlights.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Complete profile basics before exploring features.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Use nearest regions for faster onboarding.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Keep documents under 10MB for quick uploads.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Enable notifications to stay updated.</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="mb-3 flex items-center">
                  <div className="text-[14px] font-semibold text-[#171A1FFF]">Popular Topics</div>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Verification steps and KYC overview.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Creating and managing leads effectively.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Optimizing regions and search filters.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Sharing leads securely with your network.</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="mb-3 flex items-center">
                  <div className="text-[14px] font-semibold text-[#171A1FFF]">Need Help?</div>
                </div>
                <ul className="list-disc list-inside space-y-2">
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Intro video and quick highlights.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Feature overview to speed up setup.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Reach support if you get stuck.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">FAQs for common questions.</li>
                  <li className="text-[12px] leading-[20px] text-[#565D6D]">Onboarding best practices.</li>
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
          <div className="rounded-xl bg-yellow-50  p-6 md:p-8 shadow-sm">
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