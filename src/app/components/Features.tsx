import React from 'react';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesData {
  items: FeatureItem[];
}

const Features = ({ data }: { data: FeaturesData }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return (
         <svg
  className="w-14 h-14"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <circle cx="18" cy="18" r="6" fill="#FACC15" opacity="0.8" />


  <rect
    x="3"
    y="7"
    width="18"
    height="13"
    rx="2"
    stroke="#14532d"
    strokeWidth="2"
  />
  <path d="M16 3v4M8 3v4" stroke="#14532d" strokeWidth="2" />
</svg>

        );
      case 'credit-card':
        return (
          <svg
  className="w-14 h-14"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  {/* Background yellow circle */}
  <circle cx="16" cy="16" r="6" fill="#FACC15" opacity="0.8" />

  {/* Wallet shape (dark green outline) */}
  <path
    d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a1 1 0 0 1-1 1H7a3 3 0 0 1-3-3V7Z"
    stroke="#14532d"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M17 11h1a1 1 0 1 1 0 2h-1v-2Z"
    stroke="#14532d"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>

        );
      case 'sun':
        return (
          <svg
  className="w-14 h-14"
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  {/* Background yellow circle */}
  <circle cx="16" cy="16" r="6" fill="#FACC15" opacity="0.8" />

  {/* Headphone shape */}
  <path
    d="M5 16V12a7 7 0 0 1 14 0v4"
    stroke="#14532d"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
  <path
    d="M5 16a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2Z"
    stroke="#14532d"
    strokeWidth="2"
  />
  <path
    d="M17 16a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2Z"
    stroke="#14532d"
    strokeWidth="2"
  />
</svg>

        );
      default:
        return null;
    }
  };

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(data.items || []).map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              {getIcon(feature.icon)}
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">{feature.title}</h4>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 