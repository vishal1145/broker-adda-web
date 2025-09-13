"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Array of real estate images with corresponding testimonials
  const images = [
    "/images/pexels-binyaminmellish-106399.jpg",
    "/images/istockphoto-1165384568-612x612.jpg", 
    "/images/istockphoto-1465618017-612x612.jpg",
    "/images/realestate2.jpg"
  ];

  const testimonials = [
    {
      text: "Finding the perfect property has never been easier. This platform connects us with verified brokers and premium properties, making our dream home search seamless and successful.",
      author: "Sarah Johnson",
      role: "Property Owner"
    },
    {
      text: "As a real estate broker, this platform has transformed how I connect with clients and showcase properties. The streamlined process and professional tools have significantly boosted my business success.",
      author: "Michael Chen",
      role: "Real Estate Broker"
    },
    {
      text: "The property search experience is exceptional. From luxury villas to commercial spaces, we found exactly what we were looking for with the help of verified brokers on this platform.",
      author: "Priya Sharma",
      role: "Business Owner"
    },
    {
      text: "This platform made our investment journey smooth and transparent. The verified brokers and detailed property information helped us make informed decisions for our real estate portfolio.",
      author: "David Wilson",
      role: "Real Estate Investor"
    }
  ];

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);
  
 

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.phoneNumber) {
      toast.error("Phone number is required");
      return false;
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const requestUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phoneNumber,
        })
      });

      const data = await response.json();

      if (response.ok && (data.success === undefined || data.success === true)) {
        toast.success('Login successful! Redirecting...');
        // Redirect to verify code page with phone number
        router.push(`/verify-code?phone=${encodeURIComponent(formData.phoneNumber)}`);
      } else {
        console.error('Login failed:', { url: requestUrl, status: response.status, data });
        toast.error(data.message || `Login failed (${response.status})`);
      }
    } catch (error) {
      console.error('Login network error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen p-6  flex">
      {/* Left Column - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-6  bg-white">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-600">Please fill your detail to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Enter Phone Number"
              />
            </div>

            {/* Remember Me and Forgot Password */}
            {/* <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-900 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-green-900 hover:text-green-500">
                Forgot Password?
              </Link>
            </div> */}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-900 text-white py-3 px-4 rounded-full font-medium hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging In..." : "Login"}
            </button>

            {/* Divider */}
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or Sign In with</span>
              </div>
            </div> */}

            {/* Google Sign In Button */}
            {/* <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign In with Google
            </button> */}

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-green-900 hover:text-green-900 font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column - Kitchen Image */}
      <div className="hidden lg:flex lg:flex-1 justify-center items-center">
        <div className="w-[650px] h-[800px] rounded-2xl overflow-hidden relative bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0">
          <img
            src={images[currentImageIndex]}
            alt="Real Estate Property"
            className="w-[650px] h-[800px] object-cover transition-all duration-500 ease-in-out"
            onError={(e) => {
              // Hide the image if it fails to load
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          {/* Fallback placeholder */}
         
          
          {/* Testimonial Card - Frosted Glass Effect */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
            <div className=" bg-opacity-30 backdrop-blur-lg border border-white border-opacity-50 rounded-2xl p-6 w-[600px] shadow-2xl">
              <p className="text-white text-base leading-relaxed mb-4 font-medium">
                "{testimonials[currentImageIndex].text}"
              </p>
              <div className="space-y-1">
                <h4 className="text-white font-semibold text-base">{testimonials[currentImageIndex].author}</h4>
                <p className="text-white text-sm opacity-90">{testimonials[currentImageIndex].role}</p>
              </div>
            </div>
          </div>
          
          {/* Progress Indicator - 4 Segments */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {images.map((_, index) => (
              <div 
                key={index}
                className={`w-32 h-2 rounded-full flex-shrink-0 cursor-pointer transition-all duration-300 ${
                  currentImageIndex === index ? 'bg-orange-400' : 'bg-white bg-opacity-20 backdrop-blur-md'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
