"use client";
import React, { useRef } from 'react';

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

  const scroll = (direction: 'next' | 'prev') => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.querySelector('.testimonial-card') as HTMLElement;
    if (!card) return;
    const scrollAmount = card.offsetWidth + 32; // 32px = gap-8
    container.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  // Add more dummy testimonials for better carousel effect
  const sourceItems = Array.isArray(data.items) ? data.items : [];
  const dummyTestimonials = [
    ...sourceItems,
    ...sourceItems, // duplicate for infinite scroll
    // {
    //   name: "John Doe",
    //   role: "Product Designer",
    //   image: "/images/user-1.webp",
    //   text: "Amazing quality and fast delivery. Will definitely shop again!",
    //   rating: 5.0,
    // },
    // {
    //   name: "Jane Smith",
    //   role: "Homeowner",
    //   image: "/images/user-2.jpeg",
    //   text: "The furniture fits perfectly in my living room. Highly recommended.",
    //   rating: 4.8,
    // },
    // {
    //   name: "Michael Brown",
    //   role: "Architect",
    //   image: "/images/user-3.jpeg",
    //   text: "Great customer service and beautiful designs.",
    //   rating: 4.9,
    // },
    // {
    //   name: "Emily White",
    //   role: "Interior Decorator",
    //   image: "/images/user-4.jpeg",
    //   text: "Stylish and comfortable. My clients love it!",
    //   rating: 5.0,
    // },
  ];

  const testimonials = dummyTestimonials;

  return (
    <section className="bg-gray-50 py-16 px-6 sm:px-12 lg:px-32">
      <div className="max-w-7xl mx-auto text-center ">
        <div className="flex flex-col items-center justify-center mb-2">
          <p className="text-xl text-gray-900 text-left">
            <span className="text-yellow-500">—</span> {data.subtitle}
          </p>
        </div>
        <h2 className="text-4xl font-medium text-gray-900 mt-2 ">
          What <span className="text-green-900 ">Our Clients Say</span>
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-7xl mx-auto mt-8">
        {/* Cards Container - Limited to show only 2 cards */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="testimonials-container flex gap-8 overflow-x-auto pb-20"
            style={{ 
              scrollBehavior: 'smooth',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {(testimonials || []).map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-card flex bg-white rounded-2xl shadow-md p-6 items-center gap-4 relative min-w-[400px] max-w-[500px] flex-shrink-0"
              >
                {/* Avatar */}
                <div className="absolute top-0 left-0">
                  <div className="bg-green-900 w-24 h-24 rounded-tr-full rounded-br-full flex items-center justify-center">
                    <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name || 'User'}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center mb-1">
                    <div className="flex flex-col items-start justify-between ml-24">
                      <h3 className="font-bold text-lg text-gray-900">{testimonial.name}</h3>
                      <div className="text-gray-400 font-medium text-sm">{testimonial.role}</div>
                    </div>
                    <span className="ml-auto flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                      <i className="fas fa-quote-left text-green-900 text-lg"></i>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3 ml-24">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-400"></i>
                    ))}
                    <span className="text-gray-900 font-semibold ml-2 ">{testimonial.rating}</span>
                  </div>
                  <div className="text-left mt-2">
                    <p className="text-gray-500 text-sm">{testimonial.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons - Positioned at bottom center with better visibility */}
       <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
  {/* Previous Button (Left Arrow) */}
  <button
    onClick={() => scroll('prev')}
    className="bg-green-900 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg hover:bg-green-800 transition-colors duration-200"
    aria-label="Previous"
  >
    <svg
      className="w-5 h-5 rotate-180 transition-colors hover:text-gray-900"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </button>
  {/* Next Button (Right Arrow) */}
  <button
    onClick={() => scroll('next')}
    className="bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg hover:bg-yellow-500 transition-colors duration-200"
    aria-label="Next"
  >
    <svg
      className="w-5 h-5 transition-colors hover:text-gray-900"
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
    </section>
  );
};

export default Testimonials;
