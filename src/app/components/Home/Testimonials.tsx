"use client";
import React, { useRef, useEffect, useState } from 'react';

interface TestimonialItem {
  name: string;
  role: string;
  rating: number;
  image: string;
  text: string;
}

interface TestimonialsData {
  subtitle: string;
  items: TestimonialItem[];
}

const Testimonials = ({ data = { subtitle: '', items: [] } }: { data: TestimonialsData }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // Create infinite loop testimonials (triple the items for seamless loop)
  const sourceItems = Array.isArray(data.items) && data.items.length > 0 ? data.items : [];
  const testimonials = [
    ...sourceItems,
    ...sourceItems,
    ...sourceItems, // Triple for seamless infinite loop
  ];

  // Check scroll position to enable/disable buttons
  const checkScrollPosition = () => {
    const container = scrollRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const threshold = 10; // Small threshold for edge detection
    
    setIsAtStart(scrollLeft <= threshold);
    setIsAtEnd(scrollLeft >= scrollWidth - clientWidth - threshold);
  };

  // Handle infinite scroll loop
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || sourceItems.length === 0) return;

    const handleScroll = () => {
      checkScrollPosition();
      
      // If scrolled to the end (third set), jump to the start of second set
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 50) {
        container.scrollLeft = container.scrollWidth / 3;
      }
      // If scrolled to the start, jump to the start of second set
      else if (container.scrollLeft <= 50) {
        container.scrollLeft = container.scrollWidth / 3;
      }
    };

    container.addEventListener('scroll', handleScroll);
    
    // Initialize scroll position to middle set (second set) after a small delay to ensure cards are rendered
    const initializeScroll = () => {
      if (container.scrollLeft === 0) {
        const card = container.querySelector('.testimonial-card') as HTMLElement;
        if (card && card.offsetWidth > 0) {
          const gap = typeof window !== 'undefined' && window.innerWidth >= 768 ? 32 : 16;
          const cardWidth = card.offsetWidth;
          container.scrollLeft = (cardWidth + gap) * sourceItems.length;
        } else {
          // Retry if cards aren't ready yet
          setTimeout(initializeScroll, 100);
        }
      }
    };
    
    // Initialize after a brief delay to ensure DOM is ready
    setTimeout(initializeScroll, 50);

    return () => container.removeEventListener('scroll', handleScroll);
  }, [sourceItems.length]);

  const scroll = (direction: 'next' | 'prev') => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.querySelector('.testimonial-card') as HTMLElement;
    if (!card) return;
    // Get gap size based on screen width (16px on mobile, 32px on desktop)
    const gap = typeof window !== 'undefined' && window.innerWidth >= 768 ? 32 : 16;
    const scrollAmount = card.offsetWidth + gap;
    container.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-8 md:py-16">
      <div className="w-full mx-auto px-4 ">
        <div className="text-center">
        <div className="flex flex-col items-center justify-center mb-2">
          <p className="text-base md:text-xl text-gray-900 text-left">
            <span className="text-yellow-500">—</span> {data.subtitle}
          </p>
        </div>
        <h2 className="text-2xl md:text-4xl font-medium text-gray-900 mt-2">
          What <span className="text-green-900">Our Clients Say</span>
        </h2>
      </div>
      

      {/* Carousel Container */}
      <div className="relative mx-auto mt-6 md:mt-8">
        {/* Cards Container - Limited to show only 2 cards */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="testimonials-container flex gap-4 md:gap-8 overflow-x-auto pb-16 md:pb-20"
            style={{ 
              scrollBehavior: 'smooth',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {(testimonials || []).map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="testimonial-card flex bg-white rounded-2xl shadow-md p-4 md:p-6 items-center gap-3 md:gap-4 relative min-w-[280px] md:min-w-[400px] max-w-[90vw] md:max-w-[500px] flex-shrink-0"
              >
                {/* Avatar */}
                <div className="absolute top-0 left-0">
                  <div className="bg-green-900 w-16 h-16 md:w-24 md:h-24 rounded-tr-full rounded-br-full flex items-center justify-center">
                    <div className="bg-white w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name || 'User'}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center mb-1">
                    <div className="flex flex-col items-start justify-between ml-16 md:ml-24">
                      <h3 className="font-bold text-base md:text-lg text-gray-900">{testimonial.name}</h3>
                      <div className="text-gray-400 font-medium text-xs md:text-sm">{testimonial.role}</div>
                    </div>
                    <span className="ml-auto flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100">
                      <i className="fas fa-quote-left text-green-900 text-sm md:text-lg"></i>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 ml-16 md:ml-24">
  {(() => {
    const rating = Number(testimonial.rating || 0);

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3; // show half for .3, .4, .5+

    return (
      <>
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <i
            key={`full-${i}`}
            className="fas fa-star text-yellow-400 text-xs md:text-base"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <i className="fas fa-star-half-alt text-yellow-400 text-xs md:text-base" />
        )}
      </>
    );
  })()}

  <span className="text-gray-900 font-semibold ml-1 md:ml-2 text-xs md:text-sm">
    {testimonial.rating}
  </span>
</div>

                  <div className="text-left mt-1 md:mt-2">
                    <p className="text-gray-500 text-xs md:text-sm">{testimonial.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons - Positioned at bottom center with better visibility */}
    <div className="absolute -bottom-2 md:-bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-3 z-10">
  {/* Previous Button */}
  <button
    onClick={() => scroll('prev')}
    disabled={sourceItems.length === 0}
    className="bg-green-900 text-white w-8 h-8 md:w-10 md:h-10 rounded-full 
               flex items-center justify-center shadow-lg 
               transition-colors duration-200 hover:bg-green-800
               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-900"
    aria-label="Previous"
  >
    <svg
      className="w-4 h-4 md:w-5 md:h-5 rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </button>

  {/* Next Button */}
  <button
    onClick={() => scroll('next')}
    disabled={sourceItems.length === 0}
    className="bg-green-900 text-white w-8 h-8 md:w-10 md:h-10 rounded-full 
               flex items-center justify-center shadow-lg 
               transition-colors duration-200 hover:bg-green-800
               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-900"
    aria-label="Next"
  >
    <svg
      className="w-4 h-4 md:w-5 md:h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </button>
</div>


        </div>
      </div>

      {/* Dots (optional, static) */}
      {/* <div className="flex justify-center mt-8 gap-2">
        <span className="h-2 w-6 rounded-full bg-green-900"></span>
        <span className="h-2 w-2 rounded-full bg-gray-300"></span>
        <span className="h-2 w-2 rounded-full bg-gray-300"></span>
        <span className="h-2 w-2 rounded-full bg-gray-300"></span>
      </div> */}
      </div>
    </section>
  );
};

export default Testimonials;
