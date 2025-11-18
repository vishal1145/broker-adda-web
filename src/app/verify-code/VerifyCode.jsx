"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from '../contexts/AuthContext';

const VerifyCode = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

 
  // const joinUrl = (base, path) => {
  //   const trimmedBase = base?.replace(/\/$/, "") || "";
  //   const trimmedPath = (path || "").replace(/^\//, "");
  //   return `${trimmedBase}/${trimmedPath}`;
  // };

  // Get phone number from URL params
  const phoneNumber = searchParams.get('phone') ;

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newCode.findIndex((digit, index) => !digit && index < 6);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const validateCode = () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return false;
    }
    if (!/^\d{6}$/.test(codeString)) {
      toast.error("Code must contain only numbers");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCode()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const codeString = code.join('');
      const phoneNumber = searchParams.get('phone');
      console.log('Starting OTP verification for phone:', phoneNumber);
      
      const requestUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`;
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: codeString,
        }),
      });

      const data = await response.json().catch(() => ({}));
      console.log('OTP verification response:', data);

      if (response.ok && (data.success === undefined || data.success === true)) {
        const role = data?.role || data?.user?.role || data?.data?.role || '';
        const token = data?.token || data?.data?.token;
        const phoneFromApi = data?.phone || data?.data?.phone || phoneNumber;
        const userId = data?.userId || data?.data?.userId;

        // Validate token before saving
        if (!token) {
          throw new Error('No authentication token received from server');
        }

        // Validate token format (basic JWT validation)
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Invalid token format');
          }
          
          // Decode token payload to validate structure
          const tokenPayload = JSON.parse(atob(tokenParts[1]));
          console.log('Token payload:', tokenPayload);
          
          // Check if token is expired
          const currentTime = Math.floor(Date.now() / 1000);
          if (tokenPayload.exp && tokenPayload.exp < currentTime) {
            throw new Error('Token has expired');
          }
          
        } catch (tokenError) {
          console.error('Token validation failed:', tokenError);
          throw new Error('Invalid authentication token received');
        }

        // Use auth context to handle login
        console.log('Saving user data to localStorage:', { token: !!token, phone: phoneFromApi, role, userId });
        login({
          token: token,
          phone: phoneFromApi,
          role: role,
          userId: userId
        });

        // Verify token was saved successfully
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
          throw new Error('Failed to save authentication token');
        }

        console.log('Token saved successfully, redirecting based on role');
        toast.success('Verification successful! Redirecting...');
        
        // Check if there's a return URL to redirect back to (for wishlist saving)
        const returnUrl = typeof window !== 'undefined' ? localStorage.getItem('returnUrl') : null;
        if (returnUrl) {
          localStorage.removeItem('returnUrl');
          router.push(returnUrl);
        } else {
          // Redirect based on user role
          if (role === 'broker') {
            router.push('/myaccount');
          } else if (role === 'customer') {
            router.push('/customer-profile?mode=view');
          } else {
            // Fallback: if role not provided, default to customer profile
            router.push('/customer-profile?mode=view');
          }
        }
      } else {
        console.error('Verify OTP failed:', { url: requestUrl, status: response.status, data });
        toast.error(data.message || `Verification failed (${response.status})`);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendTimer(60); // 60 seconds cooldown
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: searchParams.get('phone')
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Verification code sent successfully!");
        console.log('Resend OTP successful:', data);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        toast.error(errorData.message || `Failed to resend code (${response.status})`);
        console.error('Resend OTP failed:', errorData);
      }
    } catch (error) {
      console.error('Resend OTP network error:', error);
      toast.error("Network error. Please try again.");
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
    <div className="min-h-screen py-6 md:py-8 lg:py-12 flex">
      {/* Left Column - Verify Code Form */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-6 md:py-8 lg:py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          {/* <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Furniture.</span>
            <div className="w-2 h-2 bg-orange-400 rounded-full ml-2"></div>
          </div> */}

          {/* Title */}
    <div className="mb-6 md:mb-8">
  <div className="text-left mb-3 md:mb-4">
    <Link 
      href="/login" 
      className="flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-green-900 font-medium"
    >
      <svg
        width="20"
        height="20"
        className="md:w-6 md:h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18L9 12l6-6" />
      </svg>
      Back to Login
    </Link>
  </div>

  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Verify Code</h1>
  <p className="text-sm md:text-base text-gray-600">
    Please enter the code we just sent to your phone number
  </p>
  <p className="text-sm md:text-base text-green-900 font-medium mt-2">{phoneNumber}</p>
</div>


          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">

            {/* Code Input Fields */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-900 mb-3 md:mb-4">
                Code *
              </label>
              <div className="flex space-x-2 md:space-x-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-10 h-10 md:w-12 md:h-12 text-center text-lg md:text-xl font-bold border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-900 text-white py-2.5 md:py-3 px-4 rounded-full text-sm md:text-base font-medium hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm md:text-base text-gray-600">
                Didn't receive code?{" "}
                {resendTimer > 0 ? (
                  <span className="text-gray-400">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-green-900 hover:text-green-800 font-medium underline"
                  >
                   Resend OTP
                  </button>
                )}
              </p>
            </div>

            {/* Back to Login */}
      
          </form>
        </div>
      </div>

      {/* Right Column - Background Image */}
      <div className="hidden lg:flex lg:flex-1 relative">
        <div className="w-[650px] h-[800px] rounded-2xl overflow-hidden relative">
          <img
            src="/images/realestate.png"
            alt="Modern Interior"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          
          {/* Testimonial Card - Frosted Glass Effect */}
          <div className="absolute bottom-20 left-6 right-4">
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
          
          {/* Progress Indicator - 4 Segments */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div className="w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full"></div>
            <div className="w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full"></div>
            <div className="w-32 h-2 bg-orange-400 rounded-full"></div>
            <div className="w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default VerifyCode;
