"use client";
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface DotsProps {
  className?: string;
  style?: React.CSSProperties;
}

const Dots = ({ className, style }: DotsProps) => (
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
    <circle cx="10" cy="20" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="25" cy="10" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="40" cy="25" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="60" cy="15" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="80" cy="30" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="100" cy="20" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="20" cy="40" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="35" cy="50" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="55" cy="40" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="75" cy="50" r="4" fill="#E5E7EB" opacity="2" />
    {/* More dots for a denser scatter */}
    <circle cx="15" cy="30" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="30" cy="20" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="50" cy="10" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="65" cy="35" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="90" cy="40" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="110" cy="30" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="5" cy="50" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="45" cy="55" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="70" cy="45" r="4" fill="#E5E7EB" opacity="2" />
    <circle cx="100" cy="55" r="4" fill="#E5E7EB" opacity="2" />
  </svg>
);
interface NewsletterData {
  title: string;
  subtitle: string;
  description: string;
}

const Newsletter = ({ data = { title: '', subtitle: '', description: '' } }: { data: NewsletterData }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation function - requires proper domain format with dot
  const isValidEmail = (emailValue: string): boolean => {
    const trimmedEmail = emailValue?.trim() || '';
    if (!trimmedEmail) return false;
    // Requires: local@domain.tld format (must have dot in domain)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Trim and validate email
    const trimmedEmail = email?.trim() || '';
    
    if (!trimmedEmail) {
      toast.error('Please enter your email address');
      return;
    }

    // Email validation - requires proper domain format with dot
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!apiUrl) {
        console.error('NEXT_PUBLIC_API_URL is not defined');
        toast.error('API configuration error. Please contact support.');
        setIsSubmitting(false);
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
      };


      const response = await fetch(`${apiUrl}/email-subscription`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: trimmedEmail,
        }),
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        const errorMessage = errorData.message || errorData.error || 'Failed to subscribe to newsletter';
        throw new Error(errorMessage);
      }

      await response.json();
      
      toast.success('Successfully subscribed to newsletter!');
      setEmail(''); // Reset form
    } catch (error: unknown) {
      console.error('Subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    <section className="py-8 md:py-16 relative">
      <div className="w-full mx-auto px-4 md:px-[6rem]">
        <div className="hidden md:block absolute left-72 bottom-0">
          <Dots />
        </div>
        
        {/* Dots - top right - hidden on mobile */}
        <div className="hidden md:block absolute right-72 top-0">
          <Dots />
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-base md:text-xl text-gray-900 mb-1">
            <span className="text-yellow-500">—</span> Our Newsletter
          </p>
          <h2 className="text-2xl md:text-5xl font-medium text-gray-900 md:whitespace-nowrap">
            {data.title}
            <br />
            <span className="text-green-900 text-2xl md:text-5xl font-medium mt-2 leading-tight">{data.subtitle}</span>
          </h2>

          <p className="text-gray-600 text-base md:text-xl mt-3 md:mt-4">
            {data.description}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mt-4">
            <div className="flex items-center bg-white rounded-full shadow-sm px-2 md:px-3 py-1.5 md:py-2 w-full sm:w-auto">
              {/* Icon */}
              <div className="bg-green-900 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v.511l-10 6.25-10-6.25V6zm0 2.236v9.764a2 2 0 002 2h16a2 2 0 002-2V8.236l-9.555 5.963a1 1 0 01-1.11 0L2 8.236z"/>
                </svg>
              </div>

              {/* Input */}
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="ml-2 md:ml-3 outline-none w-full sm:w-64 text-xs md:text-sm text-gray-600 bg-transparent placeholder-gray-500 disabled:opacity-50"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !isValidEmail(email)}
              className="bg-yellow-500 text-gray-900 px-4 md:px-6 py-2 md:py-3 rounded-full transition text-xs md:text-sm font-medium w-full sm:w-auto cursor-pointer disabled:bg-yellow-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:pointer-events-none enabled:hover:bg-yellow-600"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
        {/* Optional dot background (mocked) */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-[url('https://www.svgrepo.com/show/513156/dots-grid.svg')] opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-[url('https://www.svgrepo.com/show/513156/dots-grid.svg')] opacity-10"></div>
      </div>
    </section>
    </>
  );
};

export default Newsletter; 