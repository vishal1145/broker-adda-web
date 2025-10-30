"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const OTPModal = ({ isOpen, onClose, onVerify, phoneNumber, onResend, isLoading = false }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute timer
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setTimeLeft(60); // 1 minute
      setIsVerifying(false);
      setIsSuccess(false);
      // Focus first input when modal opens
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && isOpen) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isOpen]);

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode = null) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      setError('Please enter a valid code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Call the parent's verification function
      const result = await onVerify(code);
      
      // If verification is successful, show success state briefly
      setIsSuccess(true);
      console.log('OTP verification successful, token should be saved locally');
      
      // The parent component should handle token saving and redirect
      // The modal will be closed by the parent component after a short delay
      
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setTimeLeft(60); // 1 minute
    setError('');
    onResend();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
<div className="fixed inset-0 z-50 bg-black/50  flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2 font-[Inter]" >
            Almost done
          </h2>

          {/* Instruction */}
          <p className="text-gray-600 text-center mb-8 font-[Inter]" >
            Please type the code we sent you in your email
          </p>

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  error ? 'border-red-500' : 'border-gray-300 focus:border-green-500'
                }`}
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              />
            ))}
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 text-sm font-medium" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Verification successful! Redirecting...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {error}
            </p>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || isLoading || otp.some(digit => !digit) || isSuccess}
            className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              isSuccess 
                ? 'bg-green-600 text-white cursor-default' 
                : 'bg-green-900 text-white hover:bg-green-800 focus:ring-green-500'
            }`}
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            {isSuccess ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Success! Redirecting...
              </>
            ) : (isVerifying || isLoading) ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>

          {/* Timer */}
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {formatTime(timeLeft)}
            </p>
          </div>

          {/* Resend OTP */}
          <div className="text-center mt-4">
            {timeLeft === 0 ? (
              <button
                onClick={handleResend}
                className="text-green-600 hover:text-green-700 font-medium text-sm underline transition-colors"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-gray-400 text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                Resend OTP in {formatTime(timeLeft)}
              </p>
            )}
          </div>


          {/* Support Link */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Can't access to your email?{' '}
              <Link 
                href="/contact"
                target="_blank"  
                className="text-green-600 hover:text-green-700 font-medium" 
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
