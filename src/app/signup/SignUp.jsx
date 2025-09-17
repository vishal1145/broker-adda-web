"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OTPModal from '../components/OTPModal';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from "react-hot-toast";

const SignUp = () => {
  const router = useRouter();
  const auth = useAuth();
  const [formData, setFormData] = useState({
    phone: "",
    role: "broker" // default to broker, customer if checkbox is unchecked
  });
  const [isCustomer, setIsCustomer] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showNumberForm, setShowNumberForm] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setIsCustomer(checked);
    const newRole = checked ? "broker" : "customer";
    
    setFormData(prev => ({
      ...prev,
      role: newRole
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
            role: formData.role,
  }),
});

        const data = await response.json();

        if (data.success) {
          toast.success('Registration successful! Please verify your phone number.');
          setPhoneNumber(formData.phone);
          setShowOTPModal(true);
        } else {
          toast.error(data.message || 'Registration failed');
        }
      } catch (error) {
        toast.error('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Number') {
      setShowNumberForm(true);
    } else {
      toast.info(`${provider} login coming soon!`);
    }
  };

  const handleBackToSocial = () => {
    setShowNumberForm(false);
  };

  const handleOTPVerify = async (otpCode) => {
    try {
      console.log('Starting OTP verification for phone:', phoneNumber);
      
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
        console.log('OTP verification response:', data);
        
        if (data.success) {
          // Extract user data from response
          const role = data?.role || data?.user?.role || data?.data?.role || formData.role;
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

          // Save to localStorage and login user
          console.log('Saving user data to localStorage:', { token: !!token, phone: phoneFromApi, role, userId });
          auth.login({ token, phone: phoneFromApi, role, userId });
          
          // Verify token was saved successfully
          const savedToken = localStorage.getItem('token');
          if (!savedToken) {
            throw new Error('Failed to save authentication token');
          }
          
          console.log('Token saved successfully, redirecting to profile');
          toast.success(data.message || 'Phone number verified successfully!');
          setShowOTPModal(false);
          router.push('/profile');
        } else {
          throw new Error(data.message || 'Invalid OTP');
        }
      } else {
        const errorData = await response.json();
        console.error('OTP verification failed:', errorData);
        throw new Error(errorData.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
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
              alt="Sign Up Illustration"
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
                <p className="text-gray-500" style={{ fontFamily: 'Open Sans, sans-serif' }}>Sign Up Illustration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Sign Up Form */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-xl">
            {/* Card Container */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
              {!showNumberForm ? (
                <>
                  {/* Header */}
                  <div className="text-left mb-14">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-left justify-left gap-3" style={{ fontFamily: 'Inria Serif, serif' }}>
                      Let's Get Started
                      <span className="text-3xl">🚀</span>
                    </h1>
                    <p className="text-lg text-gray-600" style={{ fontFamily: 'Inria Serif, serif' }}>Sign up your account</p>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="space-y-4 mb-6">
                    {/* Number Sign Up Button */}
                    <button
                      onClick={() => handleSocialLogin('Number')}
                      className="w-full flex items-center justify-center px-4 py-3 bg-green-900 text-white rounded-lg font-medium text-base hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                      Sign up with Number
                    </button>

                    {/* Google Sign Up Button */}
                    <button
                      onClick={() => handleSocialLogin('Google')}
                      className="w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        borderColor: '#ea4335',
                        color: '#ea4335'
                      }}
                    >
                      <div className="w-5 h-5 mr-3 flex items-center justify-center text-xl font-bold" style={{ color: '#ea4335' }}>G</div>
                      Sign up with Google
                    </button>

                    {/* Facebook Sign Up Button */}
                    <button
                      onClick={() => handleSocialLogin('Facebook')}
                      className="w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
                      style={{ 
                        fontFamily: 'Open Sans, sans-serif',
                        borderColor: '#1877f2',
                        color: '#1877f2'
                      }}
                    >
                      <div className="w-5 h-5 mr-3 flex items-center justify-center text-xl font-bold" style={{ color: '#1877f2' }}>f</div>
                      Sign up with Facebook
                    </button>
                  </div>

                  {/* Terms and Privacy */}
                  <div className="mt-6 mb-16 text-center text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    <span className="text-gray-500">By continuing you agree to our</span>
                    <br />
                    <span className="text-gray-900 font-bold">
                      <Link href="/terms" className="hover:text-green-800 " style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        Terms & Conditions
                      </Link>{" "}
                      <span className="text-gray-500"> and{" "}</span>
                      <Link href="/privacy" className="hover:text-green-800 " style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        Privacy Policy
                      </Link>
                    </span>
                  </div>

                  {/* Login Link */}
                  <div className="mt-6 text-center">
                    <p className="text-base text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      Already have an account?{" "}
                      <Link href="/login" className="text-green-700 hover:text-green-900 font-bold" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        Log in
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Number Form Header */}
                  <div className="text-left mb-14">
                    <button
                      onClick={handleBackToSocial}
                      className="mb-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      ← Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-left justify-left gap-2" style={{ fontFamily: 'Inria Serif, serif' }}>
                      Let's Get Started
                      <span className="text-2xl">🚀</span>
                    </h1>
                    <p className="text-gray-600"  style={{ fontFamily: 'Inria Serif, serif' }}>Sign up your account</p>
                  </div>

                  {/* Number Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Field */}
            <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        What is your phone number?
              </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50"
                          placeholder="Enter your phone number"
              />
                      </div>
            </div>

                    {/* Broker Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCustomer"
                name="isCustomer"
                checked={isCustomer}
                onChange={handleCheckboxChange}
                        className="h-4 w-4 text-green-900 focus:ring-green-500 border-gray-300 rounded"
              />
                      <label htmlFor="isCustomer" className="ml-2 block text-sm text-gray-700">
                        I am a broker
              </label>
            </div>

                    {/* Continue Button */}
            <button
              type="submit"
              disabled={isLoading}
                      className="w-full bg-green-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                      {isLoading ? "Signing up..." : "Continue"}
            </button>
                  </form>

                  {/* Terms and Privacy */}
                  <div className="mt-6 mb-16 text-center text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    <span className="text-gray-500">By continuing you agree to our</span>
                    <br />
                    <span className="text-gray-900 font-bold">
                      <Link href="/terms" className="hover:text-green-800 " style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        Terms & Conditions
                      </Link>{" "}
                      <span className="text-gray-500"> and{" "}</span>
                      <Link href="/privacy" className="hover:text-green-800 " style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        Privacy Policy
                      </Link>
                    </span>
              </div>

            {/* Login Link */}
                  <div className="mt-6 text-center">
                    <p className="text-base text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Already have an account?{" "}
                      <Link href="/login" className="text-green-700 hover:text-green-900 font-bold" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        Log in
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

export default SignUp;
