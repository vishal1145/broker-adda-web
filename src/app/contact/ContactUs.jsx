"use client";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import contactData from "../data/contact.json";
import furnitureData from "../data/furnitureData.json";
import HeaderFile from '../components/Header';
import Features from "../components/Features";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Trim and validate form fields
    const trimmedName = form.name?.trim() || '';
    const trimmedEmail = form.email?.trim() || '';
    const trimmedMessage = form.message?.trim() || '';

    // Client-side validation
    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      toast.error('Full name, email, and message are required');
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: trimmedName,
          fullName: trimmedName,
          email: trimmedEmail,
          subject: form.subject?.trim() || 'Get Quotes Inquiry',
          message: trimmedMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || errorData.data?.message || 'Failed to send message';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast.success(data.message || data.data?.message || 'Contact form submitted successfully');
      
      // Reset form
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <HeaderFile data={contactData} />
<div className="py-14">
      <div className=" mx-auto ">
        {/* Contact Section with Map Background */}
        <div className="mb-16 relative">
          {/* World Map Background */}
          <div className="relative bg-white rounded-2xl overflow-hidden" style={{ minHeight: '500px' }}>
            {/* Map Image */}
            <img 
              src="/images/Layer_1.png" 
              alt="World Map" 
              className="w-full h-full object-contain opacity-90"
              style={{ minHeight: '500px' }}
            />
            
            {/* Green Location Marker Dot - Positioned on India */}
            <div className="absolute top-[45%] right-[15%] w-4 h-4 bg-[#0D542B] rounded-full shadow-lg z-20 border-2 border-white"></div>
            
            {/* Green Information Box - Positioned relative to marker */}
            <div className="absolute top-[45%] right-[10%] bg-[#0D542B] text-white p-4 rounded-lg shadow-xl z-10 max-w-xs ml-8 mt-6">
          <div>
                <p className="font-semibold text-sm mb-1">Broker Adda</p>
                <p className="text-xs mb-1">{contactData.address}</p>
                <p className="text-xs">Ph: {contactData.contact.phone}</p>
              </div>
            </div>
          </div>

          {/* Four Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
            {/* Chat For Sales */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:bg-[#0D542B] hover:border-[#0D542B] transition-all duration-300 cursor-pointer group">
              <div className="mb-4">
                <svg className="w-8 h-8 text-[#0D542B] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">Chat For Sales</h3>
              <p className="text-[14px] text-gray-600 group-hover:text-white/90 mb-4 transition-colors duration-300">Get expert guidance on our real estate solutions and services.</p>
              <a
                href={`mailto:${contactData.contact.email}`}
                className="inline-flex items-center gap-2 bg-[#0D542B] group-hover:bg-white group-hover:text-[#0D542B] text-white px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-300"
              >
                <span className="text-[12px]">{contactData.contact.email}</span>
                <svg className="w-4 h-4 group-hover:text-[#0D542B] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Chat For Support */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:bg-[#0D542B] hover:border-[#0D542B] transition-all duration-300 cursor-pointer group">
              <div className="mb-4">
                <svg className="w-8 h-8 text-[#0D542B] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">Chat For Support</h3>
              <p className="text-[14px] text-gray-600 group-hover:text-white/90 mb-4 transition-colors duration-300">Need help? Our support team is ready to assist you.</p>
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 bg-[#0D542B] group-hover:bg-white group-hover:text-[#0D542B] text-white px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-300"
              >
                <span className="text-[12px]">Get In Touch</span>
                <svg className="w-4 h-4 group-hover:text-[#0D542B] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Visit Our Site */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:bg-[#0D542B] hover:border-[#0D542B] transition-all duration-300 cursor-pointer group">
              <div className="mb-4">
                <svg className="w-8 h-8 text-[#0D542B] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">Visit Our Site</h3>
              <p className="text-[14px] text-gray-600 group-hover:text-white/90 mb-4 transition-colors duration-300">Explore our latest real estate solutions and innovations.</p>
              <a
                href="https://www.brokeradda.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0D542B] group-hover:bg-white group-hover:text-[#0D542B] text-white px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-300"
              >
                <span className="text-[12px]">www.brokeradda.com</span>
                <svg className="w-4 h-4 group-hover:text-[#0D542B] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Contact Us */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:bg-[#0D542B] hover:border-[#0D542B] transition-all duration-300 cursor-pointer group">
              <div className="mb-4">
                <svg className="w-8 h-8 text-[#0D542B] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">Contact Us</h3>
              <p className="text-[14px] text-gray-600 group-hover:text-white/90 mb-4 transition-colors duration-300">Reach out to us for business inquiries or collaborations.</p>
              <a
                href={`tel:${contactData.contact.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 bg-[#0D542B] group-hover:bg-white group-hover:text-[#0D542B] text-white px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-300"
              >
                <span className="text-[12px]">{contactData.contact.phone}</span>
                <svg className="w-4 h-4 group-hover:text-[#0D542B] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
   </div>
   <section className="bg-green-50 py-12" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
        <div className=" mx-auto px-4 md:px-8 lg:px-28 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className=" rounded-2xl " id="contact-form">
           
            <div className="inline-block px-4 py-2 bg-gray-200 border border-gray-300 rounded-full mb-6">
              <span className="text-xs font-medium text-gray-700">Contact Address</span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl  font-bold text-gray-900 mb-4 leading-tight">
              Let's Build the Future of{' '}
              <span className="text-[#0D542B]">Real Estate</span> Together, Let's{' '}
              <span className="text-[#0D542B]">Connect</span>
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-700 mb-8 leading-relaxed">
              Have questions or need a custom solution? Reach out to us, and our team of experts will guide you every step of the way. Let's collaborate to create exceptional real estate solutions that drive your success.
            </p>

            {/* Contact Details Grid - 2x2 Layout */}
            <div className="grid grid-cols-2 gap-0 border-t border-gray-300 pt-6">
              {/* Top-Left: Address */}
              <div className="flex items-start gap-4 p-4 border-b border-r border-gray-200">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Address</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{contactData.address}</p>
                </div>
              </div>

              {/* Top-Right: Phone Number */}
              <div className="flex items-start gap-4 p-4 border-b border-gray-200">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Phone Number</p>
                  <a 
                    href={`tel:${contactData.contact.phone.replace(/\s/g, '')}`}
                    className="text-sm text-gray-700 hover:text-[#0D542B] cursor-pointer transition-colors"
                  >
                    {contactData.contact.phone}
                  </a>
                </div>
              </div>

              {/* Bottom-Left: Email Id */}
              <div className="flex items-start gap-4 p-4 border-r border-gray-200">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Email Id</p>
                  <a 
                    href={`mailto:${contactData.contact.email}`}
                    className="text-sm text-gray-700 hover:text-[#0D542B] cursor-pointer transition-colors"
                  >
                    {contactData.contact.email}
                  </a>
                </div>
              </div>

              {/* Bottom-Right: Opening Hours */}
              <div className="flex items-start gap-4 p-4">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Opening Hours</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Mon - Sat<br />
                    9 AM to 6 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Get Quotes Form */}
          <div className="bg-[#0D542B] rounded-2xl p-8 text-white">
            {/* Heading */}
            <h2 className="text-3xl font-bold mb-3">Get Quotes</h2>
            
            {/* Description */}
            <p className="text-sm text-white/90 mb-8">
              The Point Of Using Lorem Ipsum Is That It Has More-Or-Less Normal
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  required
                  className="w-full bg-transparent border-b text-sm border-white/30 text-white placeholder-white/70 pb-2 focus:outline-none focus:border-white transition-colors"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full bg-transparent border-b border-white/30 text-sm text-white placeholder-white/70 pb-2 focus:outline-none focus:border-white transition-colors"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              {/* Message */}
              <div>
                <textarea
                  name="message"
                  placeholder="Message"
                  rows="4"
                  required
                  className="w-full bg-transparent border-b border-white/30 text-white text-sm placeholder-white/70 pb-2 focus:outline-none focus:border-white transition-colors resize-none"
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-[#0D542B] px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Now'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>
     </section>
      {/* Map Section */}
      {/* <div className="max-w-7xl mx-auto px-4 pb-12"> */}
        {/* <div className="w-full rounded-2xl overflow-hidden mt-16" style={{ minHeight: 250, maxHeight: 350 }}>
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.858234857964!2d-74.0086806845932!3d40.7130549793316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a19f8b1e7b1%3A0x8d8e8e8e8e8e8e8e!2sPark%20Row%2C%20New%20York%2C%20NY%2010007%2C%20USA!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div> */}
      <Features data={furnitureData.features}/>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
};

export default ContactUs;
