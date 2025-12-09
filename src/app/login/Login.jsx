"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import OTPModal from '../components/OTPModal';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const router = useRouter();
  const auth = useAuth();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showNumberForm, setShowNumberForm] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'phoneNumber') {
      // Only allow digits and limit to 10 characters
      const digitsOnly = value.replace(/\D/g, '');
      const limitedValue = digitsOnly.slice(0, 10);
      
      setFormData(prev => ({
        ...prev,
        [name]: limitedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
        toast.success('OTP sent successfully! Please verify your phone number.');
        setPhoneNumber(formData.phoneNumber);
        setShowOTPModal(true);
      } else {
        let errorMessage = 'Login failed';
        
        try {
          const errorData = await response.json();
          // Prioritize the API's actual error message
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error && typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error && errorData.error.includes('E11000')) {
            errorMessage = 'This phone number is already registered. Please use a different number.';
          } else if (errorData.error && errorData.error.includes('validation')) {
            errorMessage = 'Please check your phone number and try again.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid phone number. Please check and try again.';
          } else if (response.status === 401) {
            errorMessage = 'Authentication failed. Please try again.';
          } else if (response.status === 404) {
            errorMessage = 'Phone number not found. Please sign up first or check your number.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = `Login failed (${response.status})`;
          }
        } catch (parseError) {
          if (response.status === 400) {
            errorMessage = 'Invalid phone number. Please check and try again.';
          } else if (response.status === 401) {
            errorMessage = 'Authentication failed. Please try again.';
          } else if (response.status === 404) {
            errorMessage = 'Phone number not found. Please sign up first or check your number.';
          } else if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else {
            errorMessage = `Login failed (${response.status})`;
          }
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Number') {
      setShowNumberForm(true);
    } else {
    }
  };

  const handleBackToSocial = () => {
    setShowNumberForm(false);
  };

  const handleOTPVerify = async (otpCode) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otpCode
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Extract user data from response
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
            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (tokenPayload.exp && tokenPayload.exp < currentTime) {
              throw new Error('Token has expired');
            }
            
          } catch (tokenError) {
            throw new Error('Invalid authentication token received');
          }

          // Save to localStorage and login user
          // Save userId to localStorage if available
          if (userId) {
            localStorage.setItem('userId', userId);
          }
          
          auth.login({ token, phone: phoneFromApi, role, userId });
          
          // Verify token was saved successfully
          const savedToken = localStorage.getItem('token');
          if (!savedToken) {
            throw new Error('Failed to save authentication token');
          }
          toast.success(data.message || 'Phone number verified successfully!');
          setShowOTPModal(false);
          
          // Small delay to ensure auth context is updated
          setTimeout(() => {
            // Check if there's a return URL to redirect back to (for wishlist saving)
            const returnUrl = typeof window !== 'undefined' ? localStorage.getItem('returnUrl') : null;
            if (returnUrl) {
              localStorage.removeItem('returnUrl');
              router.push(returnUrl);
            } else {
              // Redirect based on user role - prioritize explicit role check
              const finalRole = role || (typeof window !== 'undefined' ? localStorage.getItem('role') : null);
              if (finalRole === 'broker') {
                router.push(redirect || '/dashboard');
              } else if (finalRole === 'customer') {
                router.push('/customer-profile?mode=view');
              } else {
                // Default: try to get role from token if available
                try {
                  const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                  const tokenRole = tokenPayload.role;
                  if (tokenRole === 'customer') {
                    router.push('/customer-profile?mode=view');
                  } else if (tokenRole === 'broker') {
                    router.push(redirect || '/dashboard');
                  } else {
                    // Last resort: default to customer profile
                    router.push('/customer-profile?mode=view');
                  }
                } catch {
                  // If can't parse token, default to customer profile
                  router.push('/customer-profile?mode=view');
                }
              }
            }
          }, 300);
        } else {
          throw new Error(data.message || 'Invalid OTP');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid OTP');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber
        }),
      });

      if (response.ok) {
        toast.success('OTP resent successfully!');
      } else {
        toast.error('Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
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
    
      <div className="min-h-screen flex">
        {/* Left Section - Image Background */}
        <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-8">
          <div className="relative w-full max-w-2xl">
            <img
              src="/images/signup.png"
              alt="Login Illustration"
              className="w-full h-auto object-contain"
              onError={(e) => {
                // Fallback to a placeholder if image doesn't exist
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            {/* Fallback placeholder */}
            <div className="hidden w-full h-96 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <p className="text-gray-500" style={{ fontFamily: 'Open Sans, sans-serif' }}>Login Illustration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-4 md:p-6 lg:p-8 bg-white">
          <div className="w-full max-w-xl">
            {/* Card Container */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 lg:p-12">
              {!showNumberForm ? (
                <>
                  {/* Header */}
                  <div className="text-left mb-8 md:mb-10 lg:mb-14">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3 flex items-left justify-left gap-2 md:gap-3 font-[Inter]" >
                      Welcome back
                      <span className="text-xl md:text-2xl lg:text-3xl">👋</span>
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 font-[Inter]" >Log in your account</p>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    {/* Number Login Button */}
                    <button
                      onClick={() => handleSocialLogin('Number')}
                      className="w-full flex items-center justify-center px-4 py-2.5 md:py-3 bg-green-900 text-white rounded-lg font-medium text-sm md:text-base hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md cursor-pointer"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                      Log in with Number
                    </button>

                    {/* Google Login Button */}
                    <button
                      onClick={() => handleSocialLogin('Google')}
                      className="w-full flex items-center justify-center px-4 py-2.5 md:py-3 border rounded-lg font-medium text-sm md:text-base hover:bg-gray-50 focus:outline-none transition-all duration-200 cursor-pointer"
                      style={{ 
                       
                        borderColor: '#ea4335',
                        color: '#ea4335'
                      }}
                    >
                      <div className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex items-center justify-center text-lg md:text-xl font-bold" style={{ color: '#ea4335' }}>G</div>
                      Log in with Google
                    </button>

                    {/* Facebook Login Button */}
                    <button
                      onClick={() => handleSocialLogin('Facebook')}
                      className="w-full flex items-center justify-center px-4 py-2.5 md:py-3 border rounded-lg font-medium text-sm md:text-base hover:bg-gray-50 focus:outline-none transition-all duration-200 cursor-pointer"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        borderColor: '#1877f2',
                        color: '#1877f2'
                      }}
                    >
                      <div className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 flex items-center justify-center text-lg md:text-xl font-bold" style={{ color: '#1877f2' }}>f</div>
                      Log in with Facebook
                    </button>

                  </div>

                  {/* Sign Up Link */}
                  <div className="mt-6 md:mt-8 lg:mt-12 text-center">
                    <p className="text-sm md:text-base text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      Don't have an account?{" "}
                      <Link href="/signup" className="text-green-700 hover:text-green-900 font-bold" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        Sign up
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Number Form Header */}
                  <div className="text-left mb-8 md:mb-10 lg:mb-14">
                    <button
                      onClick={handleBackToSocial}
                      className="mb-2 text-sm md:text-base text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      ← Back
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-left justify-left gap-2 font-[Inter]">
                      Welcome back
                      <span className="text-xl md:text-2xl">👋</span>
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 font-[Inter]" >Log in your account</p>
            </div>

                  {/* Number Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {/* Phone Field */}
              <div>
                      <label htmlFor="phoneNumber" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        What is your phone number?
                </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength={10}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                          className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50"
                          placeholder="Enter your 10-digit phone number"
                />
                      </div>
              </div>



              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                      className="w-full bg-green-900 text-white py-2.5 md:py-3 px-4 rounded-lg text-sm md:text-base font-medium hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                      {isLoading ? "Signing in..." : "Sign In"}
              </button>
                  </form>

              {/* Sign Up Link */}
                  <div className="mt-4 md:mt-6 text-center">
                <p className="text-sm md:text-base text-gray-600">
                  Don't have an account?{" "}
                      <Link href="/signup" className="text-green-900 hover:text-green-800 font-medium">
                        Sign up
                  </Link>
                </p>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        phoneNumber={phoneNumber}
        isLoading={isLoading}
      />
    </>
  );
};

export default Login;
