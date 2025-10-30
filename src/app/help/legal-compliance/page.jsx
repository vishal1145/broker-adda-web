"use client";
import React from 'react';
import Link from 'next/link';
import legalComplianceData from '../../data/legalCompliance.json';
import HeaderFile from '../../components/Header';
import Features from '../../components/Features';
import furnitureData from '../../data/furnitureData.json';

const LegalCompliancePage = () => {
  const { sections, complianceChecklist, regulatoryBodies, frequentlyAskedQuestions, contact } = legalComplianceData;

  const renderContent = (section) => {
    // If content is an array, treat it as a bullet list
    if (Array.isArray(section.content)) {
      return (
        <ul className="list-disc list-inside font-[Inter] text-[14px] leading-[22px] font-normal text-[#565D6D]">
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
          <p className="font-[Inter] text-[12px] leading-[22px] font-medium text-[#565D6D] mb-2">{section.content}</p>
        )}
        {Array.isArray(section.bullets) && section.bullets.length > 0 && (
          <ul className="list-disc list-inside  space-y-1 font-[Inter] text-[12px] leading-[22px] font-normal text-[#565D6D]">
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
            <h2 className=" text-[16px] leading-[32px] font-bold text-[#171A1FFF] mb-3">{subsection.title}</h2>
            <p className=" font-[Inter] text-[12px] leading-[22px] font-medium text-[#565D6D]">{subsection.content}</p>
            {Array.isArray(subsection.items) && (
              <ul className="list-disc list-inside  space-y-1 font-[Inter] text-[12px] leading-[22px] font-normal text-[#565D6D]">
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
      <HeaderFile data={legalComplianceData} />
      <div className="py-14">
        <div className="w-full mx-auto">
          <div className="space-y-10">
            {/* Main Sections */}
            {sections.map((section, index) => (
              <div key={index} className="">
                <h2 className=" text-[16px] leading-[32px] font-bold text-[#171A1FFF] mb-4">{section.title}</h2>
                {renderContent(section)}
                {renderSubsections(section.subsections)}
              </div>
            ))}

            {/* Compliance Checklist */}
            <div className="">
              <h2 className=" text-[16px] leading-[32px] font-bold text-[#171A1FFF] mb-4">{complianceChecklist.title}</h2>
              <p className=" mb-6 font-[Inter] text-[12px] leading-[22px] font-medium text-[#565D6D]">{complianceChecklist.description}</p>
              
              <div className="grid md:grid-cols-3 gap-6">
                {complianceChecklist.categories.map((category, idx) => (
                  <div key={idx} className="">
                    <h3 className=" text-[16px] leading-[32px] font-bold text-[#171A1FFF] mb-3">{category.title}</h3>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start space-x-2 font-[Inter] text-[12px] leading-[22px] font-normal text-[#565D6D]">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulatory Bodies */}
            <div className="">
              <h2 className=" text-[16px] leading-[32px] font-bold text-[#171A1FFF] mb-4">{regulatoryBodies.title}</h2>
              <p className="font-[Inter] text-[12px] leading-[22px] font-medium mb-4 text-[#565D6D]">{regulatoryBodies.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {regulatoryBodies.bodies.map((body, idx) => (
                  <div key={idx} className="">
                    <h2 className=" text-[16px] leading-[32px] font-bold text-[#171A1FFF] mb-2">{body.name}</h2>
                    <p className=" mb-2 font-[Inter] text-[12px] leading-[22px] font-medium text-[#565D6D]">{body.role}</p>
                    <div className="space-y-1 font-[Inter] text-[12px] leading-[22px] font-normal text-[#565D6D]">
                      <p><strong>Website:</strong> <a href={body.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{body.website}</a></p>
                      <p><strong>Contact:</strong> <span className="font-[Inter] text-[12px] leading-[22px] font-normal text-[#565D6D]">{body.contact}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="">
              <h2 className=" text-[16px] leading-[32px] font-bold text-[#171A1FFF] mb-6">{frequentlyAskedQuestions.title}</h2>
              
              <div className="space-y-6">
                {frequentlyAskedQuestions.questions.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <h3 className="font-[Inter] text-[12px] leading-[22px] font-medium text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="font-[Inter] text-[12px] leading-[22px] font-normal text-[#565D6D]">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section - soft amber banner with right-aligned CTAs */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                <div className="max-w-3xl">
                  <h2 className=" text-[16px] leading-[32px] font-bold text-[#171A1FFF] mb-1">{contact.title}</h2>
                  <p className="font-[Inter] text-[12px] leading-[22px] font-normal text-[#565D6D]">
                    {contact.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 md:gap-4 self-stretch md:self-auto md:justify-end">
                  {contact.buttons.map((button, index) => (
                    <Link
                      key={index}
                      href={button.href}
                      className={`px-5 py-2.5 rounded-lg text-[12px] font-semibold transition-colors border ${
                        button.type === 'primary'
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-[#19191F] border-yellow-500'
                          : 'bg-white text-[#19191F] hover:bg-amber-100 border-yellow-300'
                      }`}
                    >
                      {button.text}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Features data={furnitureData.features} />
    </>
  );
};

export default LegalCompliancePage;

