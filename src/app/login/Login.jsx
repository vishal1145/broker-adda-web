"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
 

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        // Redirect to verify code page with phone number
        router.push(`/verify-code?phone=${encodeURIComponent(formData.phoneNumber)}`);
      } else {
        console.error('Login failed:', { url: requestUrl, status: response.status, data });
        setErrors({ general: data.message || `Login failed (${response.status})` });
      }
    } catch (error) {
      console.error('Login network error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex">
      {/* Left Column - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-600">Please fill your detail to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

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
                className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter Phone Number"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
              )}
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
              {isLoading ? "Signing In..." : "Login"}
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
      <div className="hidden lg:flex lg:flex-1 relative">
        <div className="w-[650px] h-[800px] rounded-2xl overflow-hidden relative bg-gradient-to-br from-green-400 to-green-600">
          <img
            src="/images/realestate.png"
            alt="Modern Kitchen"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide the image if it fails to load
              e.target.style.display = 'none';
            }}
          />
          
          {/* Testimonial Card - Frosted Glass Effect */}
          <div className="absolute bottom-20 left-6 right-4 z-10">
            <div className=" bg-opacity-30 backdrop-blur-lg border border-white border-opacity-50 rounded-2xl p-6 w-[600px] shadow-2xl">
              <p className="text-white text-base leading-relaxed mb-4 font-medium">
                "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore."
              </p>
              <div className="space-y-1">
                <h4 className="text-white font-semibold text-base">Annette Black</h4>
                <p className="text-white text-sm opacity-90">Architecture</p>
              </div>
            </div>
          </div>
          
          {/* Progress Indicator - 4 Segments */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            <div className="w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full"></div>
            <div className="w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full"></div>
            <div className="w-32 h-2 bg-orange-400 rounded-full"></div>
            <div className="w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
