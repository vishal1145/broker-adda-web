import React from 'react';

const Dots = ({ className, style }) => (
  <svg
    width="120"
    height="60"
    viewBox="0 0 120 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    {/* Manually placed circles for a scattered look */}
    <circle cx="10" cy="20" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="25" cy="10" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="40" cy="25" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="60" cy="15" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="80" cy="30" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="100" cy="20" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="20" cy="40" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="35" cy="50" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="55" cy="40" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="75" cy="50" r="5" fill="#E5E7EB" opacity="0.5" />
    {/* More dots for a denser scatter */}
    <circle cx="15" cy="30" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="30" cy="20" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="50" cy="10" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="65" cy="35" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="90" cy="40" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="110" cy="30" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="5" cy="50" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="45" cy="55" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="70" cy="45" r="5" fill="#E5E7EB" opacity="0.5" />
    <circle cx="100" cy="55" r="5" fill="#E5E7EB" opacity="0.5" />
  </svg>
);

const HeaderFile = ({ data }) => (
  <div className="bg-gray-50 py-10 overflow-hidden">
    <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
      {/* Dots - top left */}
      <div className="absolute left-20 top-12  ">
        <Dots />
      </div>
      {/* Dots - top right */}
      <div className="absolute right-10 bottom-12">
        <Dots />
      </div>
      <h1 className="text-3xl font-medium text-gray-900 mb-2">{data.title}</h1>
      {data.breadcrumb && data.breadcrumb.length > 0 && (
        <div className="flex justify-center items-center gap-2 text-gray-500 text-base">
          {data.breadcrumb.map((item, idx) => (
            <React.Fragment key={item.label}>
              <a href={item.href} className="hover:underline">{item.label}</a>
              {idx < data.breadcrumb.length - 1 && <span className="mx-1">/</span>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default HeaderFile;