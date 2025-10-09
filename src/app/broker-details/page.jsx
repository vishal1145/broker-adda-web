'use client';

import React from 'react';
import Link from 'next/link';

const BrokerDetailsPage = () => {
  // Hardcoded broker data
  const brokerData = {
    id: 'broker-1',
    name: 'Ravi Kumar',
    image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=1200&auto=format&fit=crop',
    rating: 4.8,
    specialization: 'Residential Specialist',
    experience: '8 years',
    location: 'Delhi NCR',
    deals: '120+ deals',
    phone: '+91 98765 43210',
    email: 'ravi.kumar@brokeradda.com',
    whatsapp: '+91 98765 43210',
    website: 'https://www.ravikumarproperties.com',
    licenseNumber: 'BRE #12345678',
    firmName: 'Ravi Kumar Properties',
    description: 'With over 8 years of experience in residential real estate, Ravi Kumar has helped hundreds of families find their dream homes in Delhi NCR. Specializing in luxury apartments, villas, and plotted developments.',
    achievements: [
      'Top 10 Broker Delhi NCR 2023',
      'Customer Satisfaction Award 2022',
      'Best Residential Dealer Award 2021'
    ],
    specializations: [
      'Luxury Apartments',
      'Independent Houses',
      'Plotted Developments',
      'Builder Projects'
    ],
    areas: [
      'Gurgaon',
      'Noida',
      'Greater Noida',
      'Faridabad',
      'Delhi'
    ],
    recentDeals: [
      {
        id: 1,
        property: '3BHK Apartment in DLF Phase 2',
        price: '₹1.2 Cr',
        date: '2 weeks ago'
      },
      {
        id: 2,
        property: '4BHK Villa in Sohna Road',
        price: '₹2.5 Cr',
        date: '1 month ago'
      },
      {
        id: 3,
        property: '2BHK Flat in Sector 62',
        price: '₹85 L',
        date: '1 month ago'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-green-700 hover:text-green-800 font-semibold">
              ← Back to Home
            </Link>
            <div className="text-sm text-gray-500">
              Broker Profile
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Broker Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              {/* Profile Image */}
              <div className="text-center mb-6">
                <img
                  src={brokerData.image}
                  alt={brokerData.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
                <h1 className="mt-4 text-2xl font-bold text-gray-900">{brokerData.name}</h1>
                <p className="text-gray-600">{brokerData.specialization}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  <svg className="h-5 w-5 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.5 13.348a1 1 0 00-1.175 0L6.685 16.283c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.05 8.72c-.783-.57-.38-1.81.588-1.81h3.463a1 1 0 00.95-.69l1-3.294z"/>
                  </svg>
                  <span className="text-lg font-semibold text-gray-800">{brokerData.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({brokerData.experience} experience)</span>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-sm text-gray-600">{brokerData.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10.5 12 3l9 7.5"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10v10h14V10"/>
                  </svg>
                  <span className="text-sm text-gray-600">{brokerData.deals}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span className="text-sm text-gray-600">{brokerData.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span className="text-sm text-gray-600">{brokerData.email}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-green-700 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-800 transition-colors">
                  Contact Now
                </button>
                <button className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-xl font-semibold hover:bg-green-200 transition-colors">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{brokerData.description}</p>
            </div>

            {/* Specializations */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {brokerData.specializations.map((spec, index) => (
                  <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Areas Covered */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Areas Covered</h2>
              <div className="flex flex-wrap gap-2">
                {brokerData.areas.map((area, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
              <ul className="space-y-2">
                {brokerData.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="text-gray-600">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Deals */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Deals</h2>
              <div className="space-y-4">
                {brokerData.recentDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">{deal.property}</h3>
                      <p className="text-sm text-gray-500">{deal.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700">{deal.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* License Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">License Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">License Number</p>
                  <p className="font-semibold text-gray-900">{brokerData.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Firm Name</p>
                  <p className="font-semibold text-gray-900">{brokerData.firmName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerDetailsPage;