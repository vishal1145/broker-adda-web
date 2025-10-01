"use client";
import React from 'react';
import Link from 'next/link';
import legalComplianceData from '../data/legalCompliance.json';
import HeaderFile from '../components/Header';
import Features from '../components/Features';
import furnitureData from '../data/furnitureData.json';

const LegalCompliancePage = () => {
  const { sections, complianceChecklist, regulatoryBodies, frequentlyAskedQuestions, contact } = legalComplianceData;

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
            <h4 className="text-lg font-semibold text-gray-900 mb-3">{subsection.title}</h4>
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
      <HeaderFile data={legalComplianceData} />
      <div className="px-6 sm:px-12 lg:px-32 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-10">
            {/* Main Sections */}
            {sections.map((section, index) => (
              <div key={index} className="">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                {renderContent(section)}
                {renderSubsections(section.subsections)}
              </div>
            ))}

            {/* Compliance Checklist */}
            <div className="">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{complianceChecklist.title}</h2>
              <p className="text-gray-700 mb-6 text-[14px]">{complianceChecklist.description}</p>
              
              <div className="grid md:grid-cols-3 gap-6">
                {complianceChecklist.categories.map((category, idx) => (
                  <div key={idx} className="">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.title}</h3>
                    <ul className="space-y-2">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start space-x-2 text-[14px]">
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{regulatoryBodies.title}</h2>
              <p className="text-gray-700 mb-6 text-[14px]">{regulatoryBodies.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {regulatoryBodies.bodies.map((body, idx) => (
                  <div key={idx} className="">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{body.name}</h3>
                    <p className="text-gray-700 mb-2 text-[14px]">{body.role}</p>
                    <div className="space-y-1 text-[14px]">
                      <p><strong>Website:</strong> <a href={body.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{body.website}</a></p>
                      <p><strong>Contact:</strong> <span className="text-gray-700">{body.contact}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{frequentlyAskedQuestions.title}</h2>
              
              <div className="space-y-6">
                {frequentlyAskedQuestions.questions.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4">
                    <h3 className="text-[16px] font-medium text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 text-[14px]">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-yellow-500 rounded-lg shadow-lg p-8 text-white text-center">
              <h2 className="text-xl font-semibold mb-4">{contact.title}</h2>
              <p className="text-white mb-6 max-w-2xl mx-auto text-[14px]">
                {contact.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {contact.buttons.map((button, index) => (
                  <Link 
                    key={index}
                    href={button.href} 
                    className={`px-6 py-3 rounded-xl font-medium transition-colors shadow-md ${
                      button.type === 'primary' 
                        ? 'bg-white text-green-900 hover:bg-green-100'
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
      </div>
      <Features data={furnitureData.features} />
    </>
  );
};

export default LegalCompliancePage;

