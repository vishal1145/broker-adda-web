'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import HeaderFile from '../../components/Header';

const headerData = {
  title: 'Broker Details',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Broker Details', href: '/broker-details' }
  ]
};

export default function BrokerDetailsPage() {
  const params = useParams();
  const brokerId = params?.id;
  const [broker, setBroker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  useEffect(() => {
    const fetchBroker = async () => {
      setLoading(true);
      setError('');
      if (!brokerId) { setLoading(false); return; }
      try {
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        // Canonical: fetch by path id only
        const res = await fetch(`${base}/brokers/${encodeURIComponent(String(brokerId))}`, { headers });
        if (!res.ok) throw new Error('Failed details fetch');
        const data = await res.json();
        const b = data?.data?.broker || data?.broker || data?.data;
        if (b) setBroker(b);
      } catch (e) {
        setError('Failed to load broker details');
      } finally {
        setLoading(false);
      }
    };

    fetchBroker();
  }, [brokerId]);

  const nonEmpty = (v) => typeof v === 'string' && v.trim().length > 0 && v !== 'null' && v !== 'undefined';
  const pickImage = (...cands) => (cands.find(nonEmpty) || '');
  const displayName = nonEmpty(broker?.name) ? broker.name : nonEmpty(broker?.fullName) ? broker.fullName : 'Unknown Broker';
  const profileImage = pickImage(broker?.brokerImage, broker?.profileImage, broker?.image);
  const firmName = nonEmpty(broker?.firmName) ? broker.firmName : '';
  const firmDisplay = nonEmpty(firmName) ? firmName : '-';
  const website = nonEmpty(broker?.website) ? broker.website : '';
  const websiteDisplay = nonEmpty(website) ? website : '-';
  const licenseNumber = nonEmpty(broker?.licenseNumber) ? broker.licenseNumber : '';
  const licenseDisplay = nonEmpty(licenseNumber) ? licenseNumber : '-';
  const city = nonEmpty(broker?.city) ? broker.city : '';
  const regionsArr = Array.isArray(broker?.region) ? broker.region : [];
  const regionsText = regionsArr.length > 0
    ? regionsArr.map(r => (typeof r === 'string' ? r : (r?.name || ''))).filter(nonEmpty).join(', ')
    : '';
  const regionsDisplay = nonEmpty(regionsText) ? regionsText : '-';
  const specializations = Array.isArray(broker?.specializations) && broker.specializations.length > 0
    ? broker.specializations
    : [];
  const years = (typeof broker?.experience === 'object' ? broker?.experience?.years : broker?.experience) || '';
  const leads = broker?.leadsCreated?.count ?? broker?.closedDeals ?? 0;
  const status = nonEmpty(broker?.status) ? broker.status : '';
  const about = nonEmpty(broker?.content) ? broker.content : (nonEmpty(broker?.about) ? broker.about : (nonEmpty(broker?.bio) ? broker.bio : (broker?.experience?.description || '')));

  // Fetch similar brokers once main broker is loaded
  useEffect(() => {
    const fetchSimilar = async () => {
      if (!broker) return;
      try {
        setSimilarLoading(true);
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const res = await fetch(`${base}/brokers`, { headers });
        if (!res.ok) { setSimilar([]); return; }
        const data = await res.json();
        let list = [];
        if (Array.isArray(data?.data?.brokers)) list = data.data.brokers;
        else if (Array.isArray(data?.data)) list = data.data;
        else if (Array.isArray(data?.brokers)) list = data.brokers;
        else if (Array.isArray(data)) list = data;

        // Exclude current broker, pick first 3 similar by region or specialization when possible
        const currentId = broker?.userId?._id || broker?.userId || broker?._id || broker?.id;
        const currentRegions = Array.isArray(broker?.region) ? broker.region.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean) : [];
        const currentSpecs = Array.isArray(broker?.specializations) ? broker.specializations : [];

        const scored = list
          .filter(b => {
            const id = b?.userId?._id || b?.userId || b?._id || b?.id;
            return id && id !== currentId;
          })
          .map(b => {
            const regions = Array.isArray(b?.region) ? b.region.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean) : [];
            const specs = Array.isArray(b?.specializations) ? b.specializations : [];
            const regionScore = regions.some(r => currentRegions.includes(r)) ? 1 : 0;
            const specScore = specs.some(s => currentSpecs.includes(s)) ? 1 : 0;
            return { broker: b, score: regionScore + specScore };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(x => x.broker);

        setSimilar(scored);
      } catch (e) {
        setSimilar([]);
      } finally {
        setSimilarLoading(false);
      }
    };

    fetchSimilar();
  }, [broker]);
  if (loading) {
    return (
      <div className="min-h-screen">
        <HeaderFile data={headerData} />
        <div className="py-10">
          <div className="w-full mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-28" />
                  <div className="h-6 bg-gray-200 rounded w-64" />
                  <div className="h-3 bg-gray-200 rounded w-40" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-9 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-36 mb-4" />
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-10/12" />
                    <div className="h-3 bg-gray-200 rounded w-8/12" />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-28 mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                    <div className="h-3 bg-gray-200 rounded w-4/6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="min-h-screen">
        <HeaderFile data={headerData} />
        <div className="py-10">
          <div className="w-full mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 p-6">
              <p className="text-sm text-gray-600">{error || 'No broker details found.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <HeaderFile data={headerData} />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section - Broker Header */}
          <div className="bg-white  mb-8 overflow-hidden">
            <div className="p-8">
              <div className="grid grid-cols-[5rem_1fr] items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <img src={profileImage} alt="Broker" className="w-20 h-20 rounded-full object-cover" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>

                {/* Broker Info */}
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-green-900 text-sm font-medium inline-flex items-center gap-1">
                      Top Rated Broker
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </span>
                  </div>
                  <p className="text-gray-600 mb-0">{firmDisplay} - {city}</p>
                </div>

                {/* Chips row - spans full width starting from avatar's left edge */}
                <div className="col-span-2 mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center h-8 px-3 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                    <span className="w-2 h-2 mr-2 rounded-full bg-green-500"></span>
                    {years !== '' ? `${years}+ Years Experience` : '15+ Years Experience'}
                  </span>
                  <span className="inline-flex items-center h-8 px-3 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                    {leads} Properties Sold
                  </span>
                  <span className="inline-flex items-center h-8 px-3 rounded-full bg-gray-50 border border-gray-200 text-gray-700">
                    <span className="w-2 h-2 mr-2 rounded-full bg-green-600"></span>
                    active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Content - 9 columns */}
            <div className="lg:col-span-8 space-y-8">
              {/* About Section */}
              <section className="bg-white  ">
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h2 className="text-xl font-semibold text-gray-900">About {displayName}</h2>
                </div>
                {nonEmpty(about) ? (
                  <p className="text-gray-700 leading-relaxed">
                    {about}
                  </p>
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    Welcome! I'm {displayName} at {firmDisplay}, a dedicated real estate professional specializing in Luxury Homes. With years of experience in the real estate market, I'm committed to helping you find the perfect property or sell your current one. My expertise covers residential and commercial properties, ensuring you get the best deals and guidance throughout your real estate journey. I believe in transparency, integrity, and providing personalized service to meet your unique needs.
                  </p>
                )}
              </section>

              {/* Professional Details */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-xl font-semibold text-gray-900">Professional Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Firm Name</div>
                      <div className="font-medium text-gray-900">{firmDisplay}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l4 4-4 4-4-4 4-4z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">License Number</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{licenseDisplay}</span>
                        {nonEmpty(licenseNumber) && (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>




              {/* Social Media & Online Presence */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-xl font-semibold text-gray-900">Social Media & Online Presence</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">LinkedIn</div>
                      <div className="text-xs text-gray-500">
                        {nonEmpty(broker?.socialMedia?.linkedin) ? (
                          <a href={broker.socialMedia.linkedin} target="_blank" rel="noreferrer" className="text-green-700 underline break-all">{broker.socialMedia.linkedin}</a>
                        ) : 'http://localhost:9090/profile'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Twitter</div>
                      <div className="text-xs text-gray-500">
                        {nonEmpty(broker?.socialMedia?.twitter) ? (
                          <a href={broker.socialMedia.twitter} target="_blank" rel="noreferrer" className="text-green-700 underline break-all">{broker.socialMedia.twitter}</a>
                        ) : 'http://localhost:9090/profile'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Instagram</div>
                      <div className="text-xs text-gray-500">
                        {nonEmpty(broker?.socialMedia?.instagram) ? (
                          <a href={broker.socialMedia.instagram} target="_blank" rel="noreferrer" className="text-green-700 underline break-all">{broker.socialMedia.instagram}</a>
                        ) : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Similar Brokers */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hidden">
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-lg font-semibold text-gray-900">Similar Brokers</h3>
                </div>
                <div className="space-y-4">
                  {similarLoading ? (
                    [...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32" />
                          <div className="h-3 bg-gray-200 rounded w-40" />
                        </div>
                        <div className="h-8 w-28 bg-gray-200 rounded" />
                      </div>
                    ))
                  ) : (
                    similar.map((b, index) => {
                      const img = b?.brokerImage || b?.profileImage || b?.image || '/images/user-2.jpeg';
                      const name = nonEmpty(b?.name) ? b.name : nonEmpty(b?.fullName) ? b.fullName : 'Unknown Broker';
                      const firm = nonEmpty(b?.firmName) ? b.firmName : '';
                      const expYears = typeof b?.experience === 'object' ? b?.experience?.years : b?.experience;
                      const rating = b?.rating || '4.7';
                      const specs = Array.isArray(b?.specializations) && b.specializations.length > 0 ? b.specializations : specializations;
                      const id = b?.userId?._id || b?.userId || b?._id || b?.id;
                      return (
                        <div key={id || index} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                          <div className="relative">
                            <img src={img} alt={name} className="w-12 h-12 rounded-full object-cover" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{name}</h4>
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">{rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{firm}{firm && expYears ? ' • ' : ''}{expYears ? `${expYears}+ Years` : ''}</p>
                            <div className="flex flex-wrap gap-1">
                              {specs.slice(0, 3).map((spec, specIndex) => (
                                <span key={specIndex} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs border border-gray-200">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                          {id && (
                            <Link href={`/broker-details/${id}`} className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium border border-green-500 hover:bg-green-200 transition-colors">
                              View Profile
                            </Link>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Brokers in this Region - Carousel (hidden here; shown full-width below) */}
              <section className="mt-6 hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                    <h3 className="text-lg font-semibold text-gray-900">Brokers in this Region</h3>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => {
                      const el = document.getElementById('region-carousel');
                      if (el) el.scrollBy({ left: -500, behavior: 'smooth' });
                    }} className="h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50">{'<'}</button>
                    <button type="button" onClick={() => {
                      const el = document.getElementById('region-carousel');
                      if (el) el.scrollBy({ left: 500, behavior: 'smooth' });
                    }} className="h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50">{'>'}</button>
                  </div>
                </div>
                <div id="region-carousel" className="overflow-x-auto scroll-smooth">
                  <div className="flex gap-5 min-w-0 pr-2">
                    {similar
                      .filter((b) => {
                        const currentRegions = Array.isArray(broker?.region) ? broker.region.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean) : [];
                        const regions = Array.isArray(b?.region) ? b.region.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean) : [];
                        return regions.some(r => currentRegions.includes(r));
                      })
                      .slice(0, 20)
                      .map((b, index) => {
                        const img = b?.brokerImage || b?.profileImage || b?.image || '/images/user-2.jpeg';
                        const name = (typeof b?.name === 'string' && b.name) || (typeof b?.fullName === 'string' && b.fullName) || 'Unknown Broker';
                        const firm = (typeof b?.firmName === 'string' && b.firmName) || '';
                        const id = b?.userId?._id || b?.userId || b?._id || b?.id;
                        return (
                          <div key={id || index} className="flex-shrink-0 w-72 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-3">
                              <img src={img} alt={name} className="w-12 h-12 rounded-full object-cover" />
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 truncate">{name}</div>
                                <div className="text-xs text-gray-600 truncate">{firm || '-'}</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">Trusted regional broker with strong local expertise.</p>
                            <div className="flex gap-2">
                              {id && (
                                <a href={`/broker-details/${id}`} className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-lg border border-green-500 text-green-700 bg-green-50 hover:bg-green-100">View Profile</a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </section>

          </div>

            {/* Right Sidebar - 4 columns */}
            <div className="lg:col-span-4 space-y-6">
              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700">{leads}</div>
                  <div className="text-xs text-green-700 mt-1">Properties Sold</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">4.8</div>
                  <div className="text-xs text-blue-700 mt-1">Client Rating</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700">{years === '' ? '15+' : (typeof years === 'number' ? `${years}+` : years)}</div>
                  <div className="text-xs text-purple-700 mt-1">Years Experience</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-700">98%</div>
                  <div className="text-xs text-orange-700 mt-1">Satisfaction</div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Contact</h3>
                <button type="button" onClick={() => {
                  const el = document.getElementById('send-message-prompt');
                  if (el) el.focus();
                }} className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-full text-sm font-medium">
                  Send Message
                </button>
                <a href="#join-network" className="mt-3 w-full inline-flex items-center justify-center px-6 py-3 border border-green-600 text-green-700 hover:bg-green-50 rounded-full text-sm font-medium">
                  Join Our Network
                </a>
              </div>

              
              {/* Leads Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-2">Leads posted by this broker</div>
                  <div className="text-sm text-gray-600">and show broker lead</div>
                  <div className="text-sm text-gray-600">here</div>
                </div>
              </div>

              {/* Lead Generation Support */}
              <div className="bg-green-900 rounded-lg border border-gray-200 p-6 shadow-sm text-white">
                <h3 className="text-lg font-semibold mb-3">Lead Generation Support</h3>
                <p className="text-green-100 mb-4 text-sm">
                  Join our exclusive broker network and get access to premium lead generation tools and support.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">Verified Leads</div>
                      <div className="text-xs text-green-100">Pre-qualified properties ready to buy</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">Exclusive Training</div>
                      <div className="text-xs text-green-100">Advanced sales techniques & higher commissions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-green-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white">Higher Commissions</div>
                      <div className="text-xs text-green-100">Up to 10% more than standard rates</div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-6 px-4 py-3 bg-white text-green-700 rounded-full font-semibold hover:bg-gray-100 transition-colors border border-green-700" id="join-network">
                  Join Our Network
                </button>
              </div>
            </div>

          {/* Brokers in this Region - Full Width Carousel (12 columns) */}
          <div className="lg:col-span-12">
            <section className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-lg font-semibold text-gray-900">Brokers in this Region</h3>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => {
                    const el = document.getElementById('region-carousel-fw');
                    if (el) el.scrollBy({ left: -500, behavior: 'smooth' });
                  }} className="h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50">{'<'}</button>
                  <button type="button" onClick={() => {
                    const el = document.getElementById('region-carousel-fw');
                    if (el) el.scrollBy({ left: 500, behavior: 'smooth' });
                  }} className="h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50">{'>'}</button>
                </div>
              </div>
              <div id="region-carousel-fw" className="overflow-x-auto scroll-smooth">
                <div className="flex gap-5 min-w-0 pr-2">
                  {similar
                    .filter((b) => {
                      const currentRegions = Array.isArray(broker?.region) ? broker.region.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean) : [];
                      const regions = Array.isArray(b?.region) ? b.region.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean) : [];
                      return regions.some(r => currentRegions.includes(r));
                    })
                    .slice(0, 20)
                    .map((b, index) => {
                      const img = b?.brokerImage || b?.profileImage || b?.image || '/images/user-2.jpeg';
                      const name = (typeof b?.name === 'string' && b.name) || (typeof b?.fullName === 'string' && b.fullName) || 'Unknown Broker';
                      const firm = (typeof b?.firmName === 'string' && b.firmName) || '';
                      const id = b?.userId?._id || b?.userId || b?._id || b?.id;
                      return (
                        <div key={id || index} className="flex-shrink-0 w-72 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <img src={img} alt={name} className="w-12 h-12 rounded-full object-cover" />
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate">{name}</div>
                              <div className="text-xs text-gray-600 truncate">{firm || '-'}</div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-3 mb-4">Trusted regional broker with strong local expertise.</p>
                          <div className="flex gap-2">
                            {id && (
                              <a href={`/broker-details/${id}`} className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-lg border border-green-500 text-green-700 bg-green-50 hover:bg-green-100">View Profile</a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

