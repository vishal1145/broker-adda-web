"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";


const SignUp = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // fullName: "",
    phone: "",
    role: "" // customer | broker
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    
    if (!formData.role) {
      toast.error("Please select account type");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    phone: formData.phone,
    role: formData.role, // "broker" ya "customer"
  }),
});

        const data = await response.json();

        if (data.success) {
          console.log('Registration successful:', data);
          toast.success('Registration successful! Redirecting...');
          // Redirect to verify code page with phone number
          router.push(`/verify-code?phone=${encodeURIComponent(formData.phone)}`);
        } else {
          toast.error(data.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        toast.error('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
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
    
    <div className="min-h-screen py-16 flex">
      {/* Left Column - Image */}

      {/* Middle Column - User Account Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">

      

          {/* Sign Up Form */}
          <div className="w-full max-w-md">
          

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>
            <p className="text-gray-600">Please fill your detail to create your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">

            {/* Full Name Field */}
            {/* <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter Full Name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div> */}

            {/* Account Type */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-900 mb-2">
                Account Type *
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full appearance-none pr-12 pl-4 py-3 border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="">Select type</option>
                  <option value="customer">Customer</option>
                  <option value="broker">Broker</option>
                </select>
                {/* Dropdown chevron icon */}
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                placeholder="Enter Phone Number"
              />
            </div>


            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-900 text-white py-3 px-4 rounded-full font-medium hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign Up"}
            </button>

            {/* Divider */}
            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or Sign Up with</span>
              </div>
            </div> */}

            {/* Google Sign Up Button */}
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
              Sign Up with Google
            </button> */}

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-green-900 hover:text-green-900 font-medium">
               Login
                </Link>
              </p>
            </div>
          </form>
          </div>
        </div>
      </div>

      {/* Right Column - Kitchen Image */}
      <div className="hidden lg:flex lg:flex-1 justify-center items-center">
        <div className="w-[650px] h-[800px] rounded-2xl overflow-hidden relative flex-shrink-0">
          <img
            src="/images/re.png"
            alt="Modern Kitchen"
            className="w-[650px] h-[800px] object-cover"
            onError={(e) => {
              // Fallback to a placeholder if image doesn't exist
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          {/* Fallback placeholder */}
  
          {/* Testimonial Card - keep anchored over image */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-12 flex items-center justify-center">
            <div className=" bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-6 w-[600px] shadow-2xl">
              <p className="text-white text-base leading-relaxed mb-4">
                "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore."
              </p>
              <div className="space-y-1">
                <h4 className="text-white font-semibold text-base">Annette Black</h4>
                <p className="text-white text-sm">Architecture</p>
              </div>
            </div>
          </div>

          {/* Progress Indicator - keep anchored over image */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            <div className="w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full flex-shrink-0"></div>
            <div className="w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full flex-shrink-0"></div>
            <div className="w-32 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
            <div className="w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full flex-shrink-0"></div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SignUp;
