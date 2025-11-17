"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FAQItem {
  question: string;
  answer: string;
  open?: boolean;
}

interface FAQData {
  title: string;
  subtitle: string;
  items: FAQItem[];
}

const FAQ = ({ data = { subtitle: '', title: '', items: [] } }: { data: FAQData }) => {
  const router = useRouter();
  // Set only the 2nd FAQ (index 1) to be open by default
  const [faqs, setFaqs] = useState((data.items || []).map((faq, index) => ({ ...faq, open: index === 1 })));

  const toggleFAQ = (index: number) => {
    setFaqs(faqs.map((faq, i) =>
      i === index ? { ...faq, open: !faq.open } : faq
    ));
  };

  const handleViewAllClick = () => {
    router.push('/faq');
  };

  return (
    <section className="bg-white py-8 md:py-16 px-4 md:px-[6rem]">
      <div className="max-w-7xl mx-auto text-center mb-8 md:mb-12">
        <p className="text-base md:text-xl text-gray-900 mb-1"><span className="text-yellow-500">—</span>{data.subtitle}</p>
        <h2 className="text-2xl md:text-4xl font-medium text-gray-900">
          {(data.title || '').split('?')[0]}?<span className="text-green-900">{(data.title || '').split('?')[1] || ''}</span>
        </h2>
      </div>

      <div className="max-w-7xl mx-auto space-y-3 md:space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`rounded-lg p-3 md:p-4 flex justify-between items-center transition cursor-pointer border ${faq.open ? 'bg-green-900 text-white border-green-700' : 'bg-white border-gray-200 hover:shadow'}`}
            onClick={() => toggleFAQ(index)}  // Toggle open/close when clicked
          >
            <div className="w-full text-left pr-2 md:pr-0">
              <p className={`font-medium text-sm md:text-base ${faq.open ? '' : 'text-gray-800 text-left'}`}>{faq.question}</p>
              {faq.open && faq.answer && (
                <p className="text-xs md:text-sm leading-relaxed mt-2 text-left">{faq.answer}</p>
              )}
            </div>
            <span className="text-xl md:text-2xl flex-shrink-0 ml-2">{faq.open ? '–' : '+'}</span>
          </div>
        ))}
      </div>

      {/* Add a "View All" button */}
      <div className="max-w-7xl mx-auto text-center mt-6 md:mt-8">
        <button
          onClick={handleViewAllClick}
          className="bg-green-900 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg hover:bg-green-800 transition-colors duration-200 font-medium text-sm md:text-base"
        >
          View All FAQs
        </button>
      </div>
    </section>
  );
};

export default FAQ;
