"use client";
import React, { useRef, useEffect } from 'react';
import Image from 'next/image';

interface InstagramData {
  subtitle: string;
  title: string;
  images: string[];
}

const Instagram = ({ data = { subtitle: '', title: '', images: [] } }: { data: InstagramData }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('Instagram component data:', data);
  console.log('Images array:', data.images);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollStep = 1; // pixels per tick
    const scrollDelay = 20; // ms per tick

    const interval = setInterval(() => {
      if (container.scrollLeft >= container.scrollWidth / 2) {
        // Instantly reset to the start of the first set
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += scrollStep;
      }
    }, scrollDelay);

    return () => clearInterval(interval);
  }, []);

  // Double the images for seamless infinite scroll
  const baseImages = Array.isArray(data.images) ? data.images : [];
  const images = [...baseImages, ...baseImages];

  return (
    <section className=" py-16">
      <div className="w-full mx-auto">
      <div className=" mx-auto text-center mb-12">
        <p className="text-xl text-gray-900 mb-1">
          <span className="text-yellow-500">—</span> {data.subtitle}
        </p>
        <h2 className="text-4xl font-medium text-gray-900">
          {data.title.split(' ').slice(0, 3).join(' ')}{' '}
          <span className="text-green-900 font-medium ">
            {data.title.split(' ').slice(3).join(' ')}
          </span>
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4  mx-auto overflow-x-auto scrollbar-hide"
        style={{ 
          scrollBehavior: 'smooth', 
          whiteSpace: 'nowrap'
        }}
      >
        {(images || []).map((image, index) => (
          <div
            key={index}
            className="relative rounded-2xl overflow-hidden flex-shrink-0"
            style={{ width: 220, height: 220 }}
          >
            {image ? (
              <Image
                src={image}
                alt={`Instagram Post ${index + 1}`}
                width={220}
                height={220}
                className="object-cover w-full h-full"
                onError={(e) => {
                  console.log('Image failed to load:', image);
                  console.log('Error:', e);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', image);
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">No Image</span>
              </div>
            )}
            {/* Instagram Icon Overlay for second image */}
            {baseImages.length > 0 && index % baseImages.length === 1 && (
              <div className="absolute inset-0 flex justify-center items-center  bg-opacity-20 hover:bg-opacity-30 transition">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.75a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </section>
  );
};

export default Instagram; 