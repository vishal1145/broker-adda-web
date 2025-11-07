'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ContentLoader from 'react-content-loader';
import HeaderFile from '../../components/Header';
import toast, { Toaster } from 'react-hot-toast';

const headerData = {
  title: 'Broker Details',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Broker Details', href: '/broker-details' }
  ]
};

export default function BrokerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const brokerId = params?.id;
  const [broker, setBroker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [brokerLeads, setBrokerLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [brokerRatingsStats, setBrokerRatingsStats] = useState(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);

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
  const propertiesCount = broker?.propertiesListed?.count ?? broker?.propertyCount ?? 0;
  // Use averageRating from API if available, otherwise fallback to broker.rating or default
  const rating = brokerRatingsStats?.averageRating ?? broker?.rating ?? 4.8;
  const status = nonEmpty(broker?.status) ? broker.status : '';
  const about = nonEmpty(broker?.content) ? broker.content : (nonEmpty(broker?.about) ? broker.about : (nonEmpty(broker?.bio) ? broker.bio : (broker?.experience?.description || '')));
  const phone = nonEmpty(broker?.phone) ? broker.phone : (nonEmpty(broker?.whatsappNumber) ? broker.whatsappNumber : '');

  // Helpers for Leads UI (match LatestLeads design)
  const ago = (d) => {
    if (!d) return '';
    const t = new Date(d).getTime();
    if (!t) return '';
    const s = Math.floor((Date.now() - t) / 1000);
    const units = [
      [31536000, 'y'],
      [2592000, 'mo'],
      [604800, 'w'],
      [86400, 'd'],
      [3600, 'h'],
      [60, 'm']
    ];
    for (const [sec, label] of units) {
      if (s >= sec) return Math.floor(s / sec) + label + ' ago';
    }
    return s + 's ago';
  };
  const regionName = (region) => {
    if (!region) return '';
    const str = typeof region === 'string' ? region : (region?.name || region?.city || region?.state || '');
    return str.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()).replace(/Ncr\b/i, 'NCR');
  };

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

  // Fetch broker leads using broker's _id from broker details
  useEffect(() => {
    const fetchBrokerLeads = async () => {
      if (!broker || !broker._id) return;
      try {
        setLeadsLoading(true);
        setLeadsError('');
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        // Use broker's _id from the broker details API response
        const brokerMongoId = broker._id;
        const leadsEndpoint = `/leads?createdBy=${encodeURIComponent(String(brokerMongoId))}`;
        
        console.log('Fetching leads for broker _id:', brokerMongoId);
        
        const res = await fetch(`${base}${leadsEndpoint}`, { headers });
        if (!res.ok) {
          throw new Error(`Failed to fetch leads: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('API Response:', data);
        
        // Handle the response structure - leads are in data.items array
        let leadsData = [];
        if (Array.isArray(data?.data?.items)) {
          leadsData = data.data.items;
        } else if (Array.isArray(data?.data?.leads)) {
          leadsData = data.data.leads;
        } else if (Array.isArray(data?.leads)) {
          leadsData = data.leads;
        } else if (Array.isArray(data?.data)) {
          leadsData = data.data;
        } else if (Array.isArray(data)) {
          leadsData = data;
        }

        setBrokerLeads(leadsData);
        console.log('Broker leads fetched successfully:', leadsData.length, 'leads found for broker _id:', brokerMongoId);
      } catch (e) {
        console.error('Error fetching broker leads:', e);
        setLeadsError(`Failed to load broker leads: ${e.message}`);
        setBrokerLeads([]);
      } finally {
        setLeadsLoading(false);
      }
    };

    fetchBrokerLeads();
  }, [broker]); // Changed dependency from brokerId to broker

  // Fetch broker ratings
  useEffect(() => {
    const fetchBrokerRatings = async () => {
      // Use broker._id if available (from API), otherwise fallback to brokerId from URL
      const brokerMongoId = broker?._id || brokerId;
      if (!brokerMongoId) return;
      
      setRatingsLoading(true);
      try {
        const token = typeof window !== 'undefined'
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;
        const base = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const ratingsEndpoint = `/broker-ratings/broker/${encodeURIComponent(String(brokerMongoId))}`;
        
        console.log('Fetching broker ratings from:', `${base}${ratingsEndpoint}`);
        
        const res = await fetch(`${base}${ratingsEndpoint}`, { headers });
        
        const data = await res.json();
        
        if (!res.ok) {
          // Check if it's a "Broker not found" error
          if (data.message && data.message.includes('not found')) {
            console.warn('Broker not found in ratings API, brokerId:', brokerMongoId);
            setBrokerRatingsStats(null);
            return;
          }
          throw new Error(data.message || `Failed to fetch ratings: ${res.status}`);
        }
        
        if (data.success && data.data && data.data.stats) {
          setBrokerRatingsStats(data.data.stats);
          console.log('Broker ratings stats:', data.data.stats);
        } else {
          console.warn('No stats in ratings response:', data);
          setBrokerRatingsStats(null);
        }
      } catch (e) {
        console.error('Error fetching broker ratings:', e);
        setBrokerRatingsStats(null);
      } finally {
        setRatingsLoading(false);
      }
    };

    // Only fetch ratings after broker data is loaded
    if (broker) {
      fetchBrokerRatings();
    }
  }, [broker, brokerId]);
  if (loading) {
    return (
      <div className="min-h-screen">
        <HeaderFile data={headerData} />
        <div className="py-8">
          <div className="w-full mx-auto">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Content - 8 columns */}
              <div className="lg:col-span-8 space-y-12">
                {/* Hero Section Skeleton */}
                <div className="bg-white overflow-hidden border border-gray-200 rounded-[10px] mb-8" style={{ boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)' }}>
                  <div className="p-8">
                    <ContentLoader
                      speed={2}
                      width={800}
                      height={180}
                      viewBox="0 0 800 180"
                      backgroundColor="#f3f3f3"
                      foregroundColor="#ecebeb"
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* Avatar */}
                      <circle cx="48" cy="48" r="48" />
                      {/* Name */}
                      <rect x="120" y="20" rx="4" ry="4" width="200" height="24" />
                      {/* Badge */}
                      <rect x="120" y="52" rx="12" ry="12" width="140" height="24" />
                      {/* Firm and city */}
                      <rect x="120" y="88" rx="4" ry="4" width="300" height="16" />
                      {/* Chips row */}
                      <rect x="0" y="120" rx="13" ry="13" width="150" height="26" />
                      <rect x="160" y="120" rx="13" ry="13" width="150" height="26" />
                      <rect x="320" y="120" rx="13" ry="13" width="80" height="26" />
                    </ContentLoader>
                  </div>
                </div>

                {/* About Section Skeleton */}
                <section className="bg-white">
                  <ContentLoader
                    speed={2}
                    width={600}
                    height={150}
                    viewBox="0 0 600 150"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Title */}
                    <rect x="0" y="0" rx="4" ry="4" width="180" height="24" />
                    {/* Paragraph lines */}
                    <rect x="0" y="40" rx="4" ry="4" width="600" height="12" />
                    <rect x="0" y="60" rx="4" ry="4" width="580" height="12" />
                    <rect x="0" y="80" rx="4" ry="4" width="550" height="12" />
                    <rect x="0" y="100" rx="4" ry="4" width="520" height="12" />
                  </ContentLoader>
                </section>

                {/* Professional Details Skeleton */}
                <section className="">
                  <ContentLoader
                    speed={2}
                    width={600}
                    height={120}
                    viewBox="0 0 600 120"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Title */}
                    <rect x="0" y="0" rx="4" ry="4" width="200" height="24" />
                    
                    {/* Two cards side by side */}
                    {/* Card 1 - Firm Name */}
                    <rect x="0" y="40" rx="10" ry="10" width="372" height="76" />
                    <circle cx="30" cy="78" r="20" />
                    <rect x="60" y="65" rx="4" ry="4" width="80" height="12" />
                    <rect x="60" y="85" rx="4" ry="4" width="150" height="16" />
                    
                    {/* Card 2 - License Number */}
                    <rect x="400" y="40" rx="10" ry="10" width="372" height="76" />
                    <circle cx="430" cy="78" r="20" />
                    <rect x="460" y="65" rx="4" ry="4" width="100" height="12" />
                    <rect x="460" y="85" rx="4" ry="4" width="180" height="16" />
                    <rect x="650" y="85" rx="12" ry="12" width="70" height="20" />
                  </ContentLoader>
                </section>

                {/* Leads Section Skeleton */}
                <div className="">
                  <ContentLoader
                    speed={2}
                    width={600}
                    height={40}
                    viewBox="0 0 600 40"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={{ width: '100%', height: '100%', marginBottom: '24px' }}
                  >
                    <rect x="0" y="0" rx="4" ry="4" width="250" height="28" />
                  </ContentLoader>
                  
                  <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="border border-gray-200 rounded-2xl p-6">
                        <ContentLoader
                          speed={2}
                          width={350}
                          height={280}
                          viewBox="0 0 350 280"
                          backgroundColor="#f3f3f3"
                          foregroundColor="#ecebeb"
                          style={{ width: '100%', height: '100%' }}
                        >
                          {/* Title */}
                          <rect x="0" y="0" rx="4" ry="4" width="250" height="20" />
                          {/* Tags and time */}
                          <rect x="0" y="32" rx="11" ry="11" width="80" height="22" />
                          <rect x="90" y="32" rx="11" ry="11" width="100" height="22" />
                          <rect x="250" y="36" rx="4" ry="4" width="80" height="14" />
                          {/* Divider */}
                          <rect x="0" y="70" rx="1" ry="1" width="350" height="1" />
                          {/* Location items */}
                          <circle cx="8" cy="95" r="4" />
                          <rect x="20" y="88" rx="4" ry="4" width="150" height="12" />
                          <circle cx="8" cy="120" r="4" />
                          <rect x="20" y="113" rx="4" ry="4" width="180" height="12" />
                          {/* Budget */}
                          <rect x="0" y="145" rx="4" ry="4" width="80" height="12" />
                          <rect x="90" y="145" rx="4" ry="4" width="120" height="12" />
                          {/* Broker profile */}
                          <circle cx="24" cy="200" r="24" />
                          <rect x="60" y="190" rx="4" ry="4" width="100" height="14" />
                          <rect x="60" y="210" rx="4" ry="4" width="150" height="12" />
                        </ContentLoader>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar - 4 columns */}
              <div className="lg:col-span-4 space-y-8">
                {/* Quick Contact Skeleton */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <ContentLoader
                    speed={2}
                    width={400}
                    height={160}
                    viewBox="0 0 400 160"
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Title */}
                    <rect x="0" y="0" rx="4" ry="4" width="120" height="20" />
                    {/* Buttons */}
                    <rect x="0" y="40" rx="6" ry="6" width="100%" height="40" />
                    <rect x="0" y="95" rx="6" ry="6" width="100%" height="40" />
                  </ContentLoader>
                </div>

                {/* Performance Metrics Grid Skeleton */}
                <div className="grid grid-cols-2 gap-4">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-[10px] p-4 text-center">
                      <ContentLoader
                        speed={2}
                        width={200}
                        height={100}
                        viewBox="0 0 200 100"
                        backgroundColor="#e5e5e5"
                        foregroundColor="#d4d4d4"
                        style={{ width: '100%', height: '100%' }}
                      >
                        {/* Number */}
                        <rect x="70" y="10" rx="4" ry="4" width="60" height="36" />
                        {/* Label */}
                        <rect x="20" y="55" rx="4" ry="4" width="160" height="20" />
                      </ContentLoader>
                    </div>
                  ))}
                </div>

                {/* Lead Generation Support Skeleton */}
                <div className="bg-[#EDFDF4] rounded-[10px] p-6 shadow-sm">
                  <ContentLoader
                    speed={2}
                    width={400}
                    height={350}
                    viewBox="0 0 400 350"
                    backgroundColor="#e0f2e9"
                    foregroundColor="#c8e6d5"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Title */}
                    <rect x="0" y="0" rx="4" ry="4" width="220" height="28" />
                    {/* Description */}
                    <rect x="0" y="40" rx="4" ry="4" width="400" height="12" />
                    <rect x="0" y="58" rx="4" ry="4" width="380" height="12" />
                    <rect x="0" y="76" rx="4" ry="4" width="350" height="12" />
                    
                    {/* 3 feature items */}
                    {[0, 1, 2].map((i) => (
                      <React.Fragment key={i}>
                        <circle cx="18" cy={110 + i * 60} r="18" />
                        <rect x="50" y={102 + i * 60} rx="4" ry="4" width="120" height="16" />
                        <rect x="50" y={122 + i * 60} rx="4" ry="4" width="280" height="12" />
                      </React.Fragment>
                    ))}
                    
                    {/* Button */}
                    <rect x="0" y="300" rx="6" ry="6" width="100%" height="40" />
                  </ContentLoader>
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
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <HeaderFile data={headerData} />
      <div className="py-8">
        <div className="w-full mx-auto">
      

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Content - 9 columns */}
            <div className="lg:col-span-8 space-y-12">

          {/* Hero Section - Broker Header */}
          <div className="bg-white overflow-hidden border border-gray-200 rounded-[10px] mb-8" style={{ boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)' }}>
            <div className="p-8">
              <div className="grid grid-cols-[5rem_1fr] items-center gap-6">
                {/* Avatar */}
                <div className="relative  w-[96px] h-[96px] bg-[#E5F0FA] opacity-100 overflow-hidden rounded-[48px]">
                  <img src={profileImage} alt="Broker" className="w-[96px] h-[96px] object-cover" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>

                {/* Broker Info */}
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap ">
                    <h1 className="text-[20px]  font-extrabold text-[#171A1F] px-4">{displayName}</h1>
                    <span className=" px-6 rounded-full bg-[#FDC700] flex items-center justify-center font-[Inter] text-[12px] leading-[22px] font-medium opacity-100">
                      Top Rated Broker
                      {/* <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg> */}
                    </span>
                  </div>
                  <p className="font-[Inter] text-[14px]  font-normal text-[#565D6D] mb-2 px-4 ">{firmDisplay} - {city}</p>
                  
              {/* Social Media Icons - Only for platforms in the section */}
              {/* {(() => {
                const socialLinks = [];
                
                if (nonEmpty(broker?.socialMedia?.linkedin)) {
                  socialLinks.push({
                    name: 'LinkedIn',
                    url: broker.socialMedia.linkedin,
                    icon: (
                      <svg className="w-3 h-3 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    ),
                    bgColor: 'bg-blue-600 hover:bg-blue-700'
                  });
                }
                
                if (nonEmpty(broker?.socialMedia?.twitter)) {
                  socialLinks.push({
                    name: 'Twitter',
                    url: broker.socialMedia.twitter,
                    icon: (
                      <svg className="w-3 h-3 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    ),
                    bgColor: 'bg-blue-400 hover:bg-blue-500'
                  });
                }
                
                if (nonEmpty(broker?.socialMedia?.instagram)) {
                  socialLinks.push({
                    name: 'Instagram',
                    url: broker.socialMedia.instagram,
                    icon: (
                      <svg className="w-3 h-3 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/>
                      </svg>
                    ),
                    bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  });
                }
                
                if (nonEmpty(broker?.socialMedia?.facebook)) {
                  socialLinks.push({
                    name: 'Facebook',
                    url: broker.socialMedia.facebook,
                    icon: (
                      <svg className="w-3 h-3 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12a10 10 0 10-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.57 1.53-3.99 3.87-3.99 1.12 0 2.29.2 2.29.2v2.52h-1.29c-1.27 0-1.66.79-1.66 1.6V12h2.83l-.45 2.91h-2.38v7.04C19.55 21.47 22 17.1 22 12z"/>
                      </svg>
                    ),
                    bgColor: 'bg-blue-800 hover:bg-blue-900'
                  });
                }
                
                if (nonEmpty(broker?.website)) {
                  socialLinks.push({
                    name: 'Website',
                    url: broker.website,
                    icon: (
                      <svg className="w-3 h-3 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
                      </svg>
                    ),
                    bgColor: 'bg-green-600 hover:bg-green-700'
                  });
                }
                
                // Only render if there are social links
                if (socialLinks.length === 0) return null;
                
                return (
                  <div className="flex items-center gap-2 mb-4">
                    {socialLinks.map((link, index) => (
                      <a 
                        key={index}
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`w-6 h-6 ${link.bgColor} rounded-lg flex items-center justify-center transition-colors group`}
                        title={link.name}
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                );
              })()} */}
                </div>
                

                 {/* Chips row - spans full width starting from avatar's left edge */}
                 <div className="col-span-2  flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center  px-2.5 rounded-full  h-[26px] bg-[#F3F4F6] border border-transparent">
                     <img
  src="/images/lucide-Circle-Outlined (2).svg"
  alt="status"
  className="w-2 h-2 mr-1.5 inline-block fill-[#565D6D]"
/>

                      {years !== '' ? `${years}+ Years Experience` : '0 Years Experience'}
                    </span>
                   <span className="inline-flex items-center  px-2.5  rounded-full  h-[26px] bg-[#F3F4F6] border border-transparent">
                                                       <img
  src="/images/lucide-Building2-Outlined (2).svg"
  alt="status"
  className="w-3 h-3 mr-1.5 inline-block  fill-[#565D6D]"
/>

                     {propertiesCount} Properties
                   </span>
                   <span className="inline-flex items-center px-2.5 h-[26px] bg-[#0D542B] rounded-full border border-transparent font-[Inter] text-[12px] leading-[16px] font-medium text-white">
                                    <img
  src="/images/lucide-Circle-Outlined (2).svg"
  alt="status"
  className="w-2 h-2 mr-1.5 inline-block"
  style={{ filter: 'brightness(0) invert(1)' }}
/>

                     active
                   </span>
                 </div>
              </div>
            </div>
          </div>
               {/* About Section */}
               <section className="bg-white">
                 <div className="flex items-center gap-2 mb-6">
                   {/* <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span> */}
                   <h2 className="text-[18px] leading-[36px] font-bold text-[#171A1F]">About {displayName}</h2>
                 </div>
                {nonEmpty(about) ? (
                  <p className="text-gray-700 leading-relaxed">
                    {about}
                  </p>
                ) : (
                  <p className="text-gray-700 leading-relaxed text-[12px]">
                    Welcome! I'm {displayName} at {firmDisplay}, a dedicated real estate professional specializing in Luxury Homes. With years of experience in the real estate market, I'm committed to helping you find the perfect property or sell your current one. My expertise covers residential and commercial properties, ensuring you get the best deals and guidance throughout your real estate journey. I believe in transparency, integrity, and providing personalized service to meet your unique needs.
                  </p>
                )}
              </section>

               {/* Professional Details */}
               <section className="">
                 <div className="flex items-center gap-2 mb-6">
                   {/* <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span> */}
                   <h3 className="text-[18px] leading-[36px] font-bold text-[#171A1F]">Professional Details</h3>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 w-[372px] h-[76px] bg-[#FAFAFB] rounded-[10px]">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <img src="/images/lucide-Briefcase-Outlined (1).svg" alt="Firm" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(700%) hue-rotate(115deg) brightness(95%) contrast(90%)' }} />
                    </div>
                    <div>
                      <div className="text-[14px] text-gray-500">Firm Name</div>
                      <div className="font-medium text-[12px] text-gray-900">{firmDisplay}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 w-[372px] h-[76px] bg-[#FAFAFB] rounded-[10px]">
                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                      <img src="/images/lucide-Award-Outlined.svg" alt="License" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(700%) hue-rotate(115deg) brightness(95%) contrast(90%)' }} />
                     </div>
                    <div>
                      <div className="text-[14px] text-gray-500">License Number</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium   text-[12px] text-gray-900">{licenseDisplay}</span>
                        {nonEmpty(licenseNumber) && (
                          <span className="px-2 py-1 rounded-full  text-[12px] bg-green-100 text-green-800 font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
   {/* Leads Section */}
              <div className="">
                <div className="flex items-center justify-between mb-6">
                  {/* <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span> */}
                  <h3 className="text-[18px] leading-[36px] font-bold text-[#171A1F]">Leads posted by this broker</h3>
                  {broker?._id && (
                    <p 
                      onClick={() => {
                        router.push(`/leads?createdBy=${encodeURIComponent(String(broker._id))}`);
                      }}
                      className=" text-gray-600 rounded-lg text-sm font-medium  cursor-pointer hover:text-[#0D542B] transition-colors"
                    >
                      View All
                    </p>
                  )}
                 </div>
                
                {leadsLoading ? (
                  <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="border border-gray-200 rounded-2xl p-6">
                        <ContentLoader
                          speed={2}
                          width={350}
                          height={280}
                          viewBox="0 0 350 280"
                          backgroundColor="#f3f3f3"
                          foregroundColor="#ecebeb"
                          style={{ width: '100%', height: '100%' }}
                        >
                          {/* Title */}
                          <rect x="0" y="0" rx="4" ry="4" width="250" height="20" />
                          {/* Tags and time */}
                          <rect x="0" y="32" rx="11" ry="11" width="80" height="22" />
                          <rect x="90" y="32" rx="11" ry="11" width="100" height="22" />
                          <rect x="250" y="36" rx="4" ry="4" width="80" height="14" />
                          {/* Divider */}
                          <rect x="0" y="70" rx="1" ry="1" width="350" height="1" />
                          {/* Location items */}
                          <circle cx="8" cy="95" r="4" />
                          <rect x="20" y="88" rx="4" ry="4" width="150" height="12" />
                          <circle cx="8" cy="120" r="4" />
                          <rect x="20" y="113" rx="4" ry="4" width="180" height="12" />
                          {/* Budget */}
                          <rect x="0" y="145" rx="4" ry="4" width="80" height="12" />
                          <rect x="90" y="145" rx="4" ry="4" width="120" height="12" />
                          {/* Broker profile */}
                          <circle cx="24" cy="200" r="24" />
                          <rect x="60" y="190" rx="4" ry="4" width="100" height="14" />
                          <rect x="60" y="210" rx="4" ry="4" width="150" height="12" />
                        </ContentLoader>
                      </div>
                    ))}
                  </div>
                ) : leadsError ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-2">
                      <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">{leadsError}</p>
                  </div>
                ) : brokerLeads.length > 0 ? (
                  <div className="space-y-4  grid  md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {brokerLeads.slice(0, 3).map((lead, index) => {
                      const leadId = lead?._id || lead?.id || index;
                      const title = `${lead?.customerName || 'Customer'} - ${lead?.requirement || 'Property'} Lead`;
                      const description = `${lead?.propertyType || 'Property'} in ${lead?.primaryRegion?.name || lead?.region?.name || 'Location'}`;
                      const price = lead?.budget || '';
                      const location = lead?.primaryRegion?.name || lead?.region?.name || lead?.primaryRegion?.city || lead?.region?.city || '';
                      const image = lead?.createdBy?.brokerImage || '/images/property-placeholder.jpg';
                      const type = lead?.propertyType || 'Property';
                      const status = lead?.status || 'New';
                      const customerPhone = lead?.customerPhone || '';
                      const customerEmail = lead?.customerEmail || '';
                      
                      // Extract broker ID and broker object from lead.createdBy
                      let viewBrokerId = null;
                      let viewBroker = null;
                      const createdBy = lead?.createdBy;
                      
                      if (createdBy) {
                        if (typeof createdBy === 'string') {
                          viewBrokerId = createdBy;
                          viewBroker = { _id: createdBy, id: createdBy };
                        } else if (typeof createdBy === 'object' && createdBy !== null) {
                          viewBroker = createdBy;
                          viewBrokerId = createdBy?.userId?._id || 
                                        createdBy?.userId?.id ||
                                        createdBy?.userId ||
                                        createdBy?._id || 
                                        createdBy?.id || 
                                        createdBy?.brokerId ||
                                        createdBy?.brokerDetailId ||
                                        createdBy?.brokerDetailsId ||
                                        null;
                          viewBrokerId = viewBrokerId ? String(viewBrokerId) : null;
                        }
                      }
                      
                      return (
                        <Link
                          key={leadId}
                          href={`/lead-details/${leadId}`}
                          className="block h-full"
                        >
                        <article className="group h-full relative rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                          <div className="p-4">
                            {/* Top Section - Main Title */}
                            <div className="mb-3">
                              <h3 className="text-[18px] leading-[20px] font-semibold mb-2" style={{ color: '#323743' }}>
                                {lead?.propertyType || 'Property'} for {lead?.requirement || 'inquiry'}
                              </h3>
                              {/* Tags and Time */}
                              <div className="flex items-center justify-between gap-2 flex-nowrap">
                                <div className="flex items-center gap-2 flex-nowrap">
                                  {lead?.requirement && (
                                    <span className="inline-flex items-center justify-center rounded-full h-[22px] px-3 whitespace-nowrap" style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '20px', fontWeight: '600', background: '#0D542B', color: '#FFFFFF' }}>
                                      {lead.requirement}
                                    </span>
                                  )}
                                  {lead?.propertyType && (
                                    <span className="inline-flex items-center justify-center rounded-full h-[22px] px-3 whitespace-nowrap" style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '20px', fontWeight: '600', background: '#FDC700', color: '#1b1d20ff' }}>
                                      {lead.propertyType}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[12px] leading-5 font-normal whitespace-nowrap flex-shrink-0" style={{ color: '#565D6D' }}>
                                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                  </svg>
                                  {ago(lead?.createdAt)}
                                </div>
                              </div>
                            </div>

                            {/* Middle Section - Property Details */}
                            <div className="space-y-2">
                              {/* Preferred Location */}
                              <div className="flex items-center gap-2">
                                <svg className="h-3 w-3 flex-shrink-0 text-[#565D6D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                                  <circle cx="12" cy="10" r="3" />
                                </svg>
                                <div className="flex items-center flex-wrap gap-1">
                                  <span className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">Preferred:</span>
                                  <span className="font-inter text-[12px] leading-5 font-normal capitalize text-[#565D6DFF]">{regionName(lead?.primaryRegion || lead?.region)}</span>
                                </div>
                              </div>
                              {/* Secondary Location */}
                              {lead?.secondaryRegion && (
                                <div className="flex items-center gap-2">
                                  <svg className="h-3 w-3 flex-shrink-0 text-[#565D6D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                  </svg>
                                  <div className="flex items-center flex-wrap gap-1">
                                    <span className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">Secondary:</span>
                                    <span className="font-inter text-[12px] leading-5 font-normal capitalize text-[#565D6DFF]">{regionName(lead?.secondaryRegion)}</span>
                                  </div>
                                </div>
                              )}
                              {/* Budget */}
                              <div className="flex items-center gap-2">
                                <svg className="h-3 w-3 flex-shrink-0 text-[#565D6D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="7" width="18" height="11" rx="2" />
                                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                <div className="flex items-center flex-wrap gap-1">
                                  <span className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">Budget:</span>
                                  <span className="text-[12px] leading-5 font-normal" style={{ color: '#565D6D' }}>
                                    {typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : (price || '—')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Bottom Section - Broker Profile and Actions - Commented out */}
                            {false && (
                            <div className="pt-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 text-sm font-semibold" style={{ color: '#323743' }}>
                                    {(() => {
                                      const createdBy = lead?.createdBy;
                                      let nameTxt = '—';
                                      let brokerImageUrl;
                                      if (!createdBy) {
                                        nameTxt = '—';
                                      } else if (typeof createdBy === 'string') {
                                        nameTxt = createdBy;
                                      } else {
                                        nameTxt = createdBy?.name || createdBy?.fullName || createdBy?.email || '—';
                                        brokerImageUrl = createdBy?.brokerImage || createdBy?.profileImage || createdBy?.image;
                                      }
                                      if (brokerImageUrl) {
                                        return (
                                          <>
                                            <div className="w-12 h-12 rounded-full bg-[#E5FCE4FF] overflow-hidden">
                                              <img src={brokerImageUrl} alt={nameTxt} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/4 translate-y-1/8"></div>
                                          </>
                                        );
                                      }
                                      return (
                                        <>
                                          <div className="w-12 h-12 rounded-full bg-[#E5FCE4FF] flex items-center justify-center">
                                            {nameTxt.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                                          </div>
                                          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/2 translate-y-1/2"></div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-6">
                                      <p className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">
                                        {(() => {
                                          const createdBy = lead?.createdBy;
                                          if (!createdBy) return 'Unknown';
                                          if (typeof createdBy === 'string') return createdBy;
                                          return createdBy?.name || createdBy?.fullName || createdBy?.email || 'Unknown';
                                        })()}
                                      </p>
                                      {viewBrokerId ? (
                                        <span
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            router.push(`/broker-details/${viewBrokerId}`);
                                          }}
                                          className="text-[12px] font-normal text-[#565D6DFF] hover:text-gray-900 transition-colors cursor-pointer"
                                        >
                                          View
                                        </span>
                                      ) : (
                                        <p className="text-[12px] font-normal text-[#565D6DFF]">View</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          if (window.openChatWithBroker && viewBroker) {
                                            window.openChatWithBroker({ broker: viewBroker });
                                          }
                                        }}
                                        className="flex items-center gap-2 cursor-pointer"
                                      >
                                        <svg className="w-3 h-3 fill-none stroke-[#171A1FFF]" viewBox="0 0 24 24" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                        <span className="font-inter text-[12px] leading-5 font-normal text-[#565D6DFF] hover:text-gray-900 transition-colors">Chat</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            )}
                          </div>
                        </article>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-2">No leads posted yet</p>
                    <p className="text-sm text-gray-500">This broker hasn't posted any property leads yet.</p>
                  </div>
                )}
              </div>




            

              {/* Similar Brokers */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 hidden">
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-[18px] font-semibold text-gray-900">Similar Brokers</h3>
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
            <div className="lg:col-span-4 space-y-8">



              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#EDFDF4] rounded-[10px] p-4 text-center" style={{ boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)' }}>
                  <div className=" text-[20px] leading-[36px] font-bold text-[#19191F]">{propertiesCount}</div>
                  <div className="font-[Inter] text-[12px] leading-[24px] font-normal text-[#19191F] mt-1">Properties</div>
                </div>
                <div className="bg-[#FFF9E6] rounded-[10px] p-4 text-center" style={{ boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)' }}>
                  <div className=" text-[20px] leading-[36px] font-bold text-[#19191F]">
                    {typeof rating === 'number' ? rating.toFixed(1) : rating}
                  </div>
                  <div className="font-[Inter] text-[12px] leading-[24px] font-normal text-[#19191F] mt-1">Client Rating</div>
                </div>
                 <div className="bg-[#FAFAFB] rounded-[10px] p-4 text-center" style={{ boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)' }}>
                   <div className=" text-[20px] leading-[36px] font-bold text-[#19191F]">{years === '' ? '0' : (typeof years === 'number' ? `${years}+` : years)}</div>
                   <div className="font-[Inter] text-[12px] leading-[24px] font-normal text-[#19191F] mt-1">Years Experience</div>
                 </div>
                <div className="bg-[#F3F4F6] rounded-[10px] p-4 text-center" style={{ boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)' }}>
                  <div className="text-[20px] leading-[36px] font-bold text-[#19191F]">98%</div>
                  <div className="font-[Inter] text-[12px] leading-[24px] font-normal text-[#19191F] mt-1">Satisfaction</div>
                </div>
              </div>

              
{/* Quick Contact */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className=" text-[18px] leading-[30px] font-semibold text-[#565D6D] mb-4">Quick Contact</h3>
                <button type="button" 
                onClick={() => {
                  if (window.openChatWithBroker) {
                    window.openChatWithBroker({broker});
                  }
                }}
                className="w-full px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-full text-sm font-medium">
                  Send Message
                </button>
               <a
  href="/signup"
  className="mt-3 w-full h-[40px] px-3 flex items-center justify-center 
             font-[Inter] text-[12px] leading-[22px] font-medium text-[#0D542B]
             bg-transparent border border-[#D0D5DD] rounded-lg
             hover:bg-gray-50 active:bg-gray-100
             transition-colors duration-200"
>
  Join Our Network
</a>
              </div>
              
             
              {/* Lead Generation Support */}
              <div className="bg-[#EDFDF4] rounded-[10px] p-6 shadow-sm" style={{ boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)' }}>
                <h3 className=" text-[18px] leading-[36px] font-bold text-[#19191F] mb-3">Lead Generation Support</h3>
                <p className="font-[Inter] text-[12px] leading-[26px] font-normal text-[#19191F] mb-4">
                  Join our exclusive broker network and get access to premium lead generation tools and support.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <img src="/images/lucide-CircleCheckBig-Outlined.svg" alt="Verified" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(700%) hue-rotate(115deg) brightness(95%) contrast(90%)' }} />
                    </div>
                    <div>
                      <div className="font-[Inter] text-[14px] leading-[24px] font-medium text-[#19191F]">Verified Leads</div>
                      <div className="font-[Inter] text-[12px] leading-[19px] font-normal text-[#19191FCC]">Pre-qualified properties ready to buy</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <img src="/images/lucide-GraduationCap-Outlined.svg" alt="Training" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(700%) hue-rotate(115deg) brightness(95%) contrast(90%)' }} />
                    </div>
                    <div>
                      <div className="font-[Inter] text-[14px] leading-[24px] font-medium text-[#19191F]">Exclusive Training</div>
                      <div className="font-[Inter] text-[12px] leading-[19px] font-normal text-[#19191FCC]">Advanced sales techniques & higher commissions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <img src="/images/lucide-DollarSign-Outlined.svg" alt="Commissions" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(700%) hue-rotate(115deg) brightness(95%) contrast(90%)' }} />
                    </div>
                    <div>
                      <div className="font-[Inter] text-[14px] leading-[24px] font-medium text-[#19191F]">Higher Commissions</div>
                      <div className="font-[Inter] text-[12px] leading-[19px] font-normal text-[#19191FCC]">Up to 10% more than standard rates</div>
                    </div>
                  </div>
                </div>
                
                <Link href="/signup" className="w-full h-[40px] px-3 mt-4 flex items-center justify-center font-[Inter] text-[12px] leading-[22px] font-medium text-white bg-[#0D542B] hover:bg-[#0B4624] hover:active:bg-[#08321A] disabled:opacity-40 border-none opacity-100 rounded-md transition-colors">
                  Join Our Network
                </Link>
                
                {/* Rating Button */}
                <button
                  onClick={() => {
                    // Check if user is logged in
                    const token = typeof window !== 'undefined'
                      ? localStorage.getItem('token') || localStorage.getItem('authToken')
                      : null;
                    
                    if (!token) {
                      router.push('/login');
                      return;
                    }
                    setShowRatingModal(true);
                  }}
                  className="w-full h-[40px] px-3 mt-3 flex items-center justify-center gap-2 font-[Inter] text-[12px] leading-[22px] font-medium text-[#0D542B] bg-white border border-[#0D542B] hover:bg-[#EDFDF4] hover:active:bg-[#D9F5E8] disabled:opacity-40 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Rate This Broker
                </button>
              </div>
            </div>

          {/* Brokers in this Region - Full Width Carousel (12 columns) */}
          <div className="lg:col-span-12">
            <section className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {/* <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span> */}
                  <h3 className="text-[18px] leading-[36px] font-bold text-[#171A1F]">Similar Brokers</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/search?type=brokers" className="px-4 py-2 text-gray-600 rounded-lg text-sm font-medium transition-colors">
                    View All
                  </Link>
                  
                </div>
              </div>
              
              {/* Carousel with scrollable cards */}
              <div id="similar-brokers-carousel" className="overflow-x-auto scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex gap-6 min-w-0 pb-2">
                {similarLoading ? (
                  // Loading state
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex-shrink-0 w-80 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      <ContentLoader
                        speed={2}
                        width={320}
                        height={400}
                        viewBox="0 0 320 400"
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                        style={{ width: '100%', height: '100%' }}
                      >
                        {/* Image */}
                        <rect x="0" y="0" rx="0" ry="0" width="320" height="240" />
                        {/* Name */}
                        <rect x="24" y="260" rx="4" ry="4" width="180" height="20" />
                        {/* Title */}
                        <rect x="24" y="290" rx="4" ry="4" width="150" height="14" />
                        {/* Location */}
                        <circle cx="28" cy="320" r="6" />
                        <rect x="40" y="315" rx="4" ry="4" width="120" height="12" />
                        {/* Leads */}
                        <circle cx="28" cy="345" r="6" />
                        <rect x="40" y="340" rx="4" ry="4" width="140" height="12" />
                      </ContentLoader>
                    </div>
                  ))
                ) : similar.length > 0 ? (
                  // Sort brokers: region matches first, then by other criteria
                  (() => {
                      const currentRegions = Array.isArray(broker?.region) ? broker.region.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean) : [];
                    
                    const sortedBrokers = similar
                      .map(b => {
                      const regions = Array.isArray(b?.region) ? b.region.map(r => (typeof r === 'string' ? r : r?.name)).filter(Boolean) : [];
                        const hasRegionMatch = regions.some(r => currentRegions.includes(r));
                        const specs = Array.isArray(b?.specializations) ? b.specializations : [];
                        const currentSpecs = Array.isArray(broker?.specializations) ? broker.specializations : [];
                        const hasSpecMatch = specs.some(s => currentSpecs.includes(s));
                        
                        return {
                          broker: b,
                          score: (hasRegionMatch ? 2 : 0) + (hasSpecMatch ? 1 : 0) + Math.random() * 0.5 // Add randomness for variety
                        };
                      })
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 4)
                      .map(item => item.broker);
                    
                    return sortedBrokers.map((b, index) => {
                      const pickValidImage = (...cands) => {
                        const valid = cands.find((s) => typeof s === 'string' && s.trim() && s !== 'null' && s !== 'undefined');
                        return valid || '';
                      };
                      const fallbackImages = [
                        '/images/broker2.webp',
                        '/images/broker7.webp',
                        '/images/broker8.jpg',
                        '/images/broker5.webp'
                      ];
                      const imageUrl = pickValidImage(
                        b?.brokerImage,
                        b?.image,
                        b?.profileImage,
                        b?.avatar,
                        b?.photo,
                        b?.picture,
                        b?.profilePicture,
                        b?.defaultImage,
                        fallbackImages[index % fallbackImages.length]
                      );
                      const id = b?.userId?._id || b?.userId || b?._id || b?.id;
                      const name = (typeof b?.name === 'string' && b.name) || (typeof b?.fullName === 'string' && b.fullName) || b?.name?.name || b?.fullName?.name || 'Unknown Broker';
                      const title = Array.isArray(b?.specializations) && b.specializations.length > 0
                        ? b.specializations[0]
                        : (typeof b?.specialization === 'string' ? b.specialization
                          : (typeof b?.expertise === 'string' ? b.expertise
                            : (typeof b?.role === 'string' ? b.role : (b?.firmName || 'Real Estate Specialist'))));
                      const regionText = (() => {
                        const r = b?.region;
                        if (Array.isArray(r) && r.length > 0) {
                          const first = r[0];
                          return typeof first === 'string' ? first : (first?.name || first?.city || first?.state || 'Location');
                        }
                        if (typeof r === 'string') return r;
                        if (r && typeof r === 'object') return r?.name || r?.city || r?.state || 'Location';
                        return b?.state || b?.city || 'Location';
                      })();
                      const leadsCompleted = b?.leadsCreated?.count || b?.leadCount || b?.totalLeads || b?.leads || 0;

                      return (
                        <article key={id || index} className="group relative flex-shrink-0 w-80 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition duration-300 overflow-hidden hover:bg-yellow-400 hover:ring-1 hover:ring-yellow-500/60 hover:-translate-y-0.5">
                          <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`Broker portrait - ${name}`}
                              className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                              onError={(e) => { e.currentTarget.src = fallbackImages[index % fallbackImages.length]; }}
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              {id ? (
                                <Link href={`/broker-details/${id}`} className="flex items-center gap-1 group/name" title="View details">
                                  <h3 className="text-[18px] leading-7 font-semibold text-gray-900">{name}</h3>
                                  <svg className="h-5 w-5 text-emerald-600 transition-transform group-hover/name:translate-x-1 group-hover/name:-translate-y-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 17L17 7" />
                                    <path d="M7 7h10v10" />
                                  </svg>
                                </Link>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <h3 className="text-[18px] leading-7 font-semibold text-gray-900">{name}</h3>
                                </div>
                              )}
                            </div>

                            <div className="mb-3">
                              <p className="text-[12px] leading-5 font-normal text-gray-600">{title}</p>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <svg className="h-3 w-3 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                              <p className="text-[12px] leading-5 font-normal text-gray-600">{regionText}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <svg className="h-3 w-3 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                              <p className="text-[12px] leading-5 font-normal text-gray-600">{leadsCompleted} Leads Completed</p>
                            </div>
                          </div>
                        </article>
                      );
                    });
                  })()
                ) : (
                  // No brokers found
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      <p className="text-lg font-medium text-gray-900 mb-2">No similar brokers found</p>
                      <p className="text-sm text-gray-500">We couldn't find any brokers with similar specializations or regions.</p>
                    </div>
                </div>
                )}
                </div>
                <div className="flex gap-2 mt-7 justify-center">
                    <button 
                      type="button" 
                      onClick={() => {
                        const carousel = document.getElementById('similar-brokers-carousel');
                        if (carousel) carousel.scrollBy({ left: -300, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center hover:bg-yellow-600 transition-colors shadow-md cursor-pointer"
                      title="Previous"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        const carousel = document.getElementById('similar-brokers-carousel');
                        if (carousel) carousel.scrollBy({ left: 300, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors shadow-md cursor-pointer"
                      title="Next"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
              </div>
            </section>
          </div>
        </div>
      </div>

       {/* CTA Section */}
       <div className="bg-[#EDFDF4] rounded-[16px] mx-4 sm:mx-6 lg:mx-8 mb-8 shadow-xl mt-12">
         <div className="px-6 py-8 text-center relative overflow-hidden">
           {/* Decorative elements */}
           <div className="absolute top-0 left-0 w-full h-1 "></div>
          <div className="absolute top-3 right-3 w-12 h-12 bg-yellow-100 rounded-full opacity-20"></div>
          <div className="absolute bottom-3 left-3 w-10 h-10 bg-yellow-200 rounded-full opacity-30"></div>
          
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 h-[26px] px-3 bg-[#FDC700] border border-transparent rounded-full mb-4">
              <img src="/images/lucide-CircleCheckBig-Outlined.svg" alt="Verified" className="w-3 h-3" style={{ filter: 'brightness(0)' }} />
              <span className="font-[Inter] text-[12px] leading-[16px] font-medium text-[#19191F]">Trusted Real Estate Expert</span>
            </div>
            
            <h2 className=" text-[18px] leading-[30px] font-bold text-[#19191F] mb-1">
              Ready to Find Your Perfect Property?
            </h2>
            <p className=" text-[12px] leading-[30px] font-normal text-[#19191F] mb-3 max-w-xl mx-auto">
              Connect with <span className="font-semibold text-[#19191F]">{displayName}</span> and discover the best real estate opportunities in your area. 
              Get personalized assistance and expert guidance throughout your property journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button 
                onClick={() => {
                  // Check if user is logged in
                  const token = typeof window !== 'undefined'
                    ? localStorage.getItem('token') || localStorage.getItem('authToken')
                    : null;
                  
                  if (!token) {
                    // User not logged in, redirect to login page
                    router.push('/login');
                    return;
                  }
                  
                  // User is logged in, open chat
                  if (window.openChatWithBroker) {
                    window.openChatWithBroker({broker});
                  }
                }}
                className="h-[40px] px-3 flex items-center justify-center font-[Inter] text-[12px] leading-[22px] font-medium text-[#584500] bg-[#FDC700] hover:bg-[#E3B200] hover:active:bg-[#C79C00] disabled:opacity-40 border-none opacity-100 rounded-md"
              >
                Send Message
              </button>
              {/* <button 
                disabled={!phone}
                onClick={() => {
                  if (phone) {
                    window.location.href = `tel:${phone}`;
                  }
                }}
                  className="w-[92px] h-[40px] px-3 flex items-center justify-center
             font-[Inter] text-[12px] leading-[22px] font-medium
             text-[#FDC700] hover:text-[#FDC700] active:text-[#FDC700]
             bg-transparent border border-[#E5E7EB] rounded-[6px]
             hover:border-[#D1D5DB] active:border-[#C0C4CC]
              transition-colors duration-200
             appearance-none"

              >
                Call Now
              </button> */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center justify-center gap-2 p-6 h-[172px] bg-white rounded-[10px]" style={{ boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <img src="/images/lucide-UserCheck-Outlined.svg" alt="Verified" className="w-6 h-6" style={{ filter: 'brightness(0)' }} />
                </div>
                <span className="font-[Inter] text-[14px] leading-[24px] font-medium text-[#171A1F]">Verified Broker</span>
                <span className="font-[Inter] text-[12px] leading-[20px] font-normal text-[#565D6D]">Licensed & Certified</span>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-2 p-6 h-[172px] bg-white rounded-[10px]" style={{ boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <img src="/images/lucide-MessageCircle-Outlined.svg" alt="Consultation" className="w-6 h-6" style={{ filter: 'brightness(0)' }} />
                </div>
                <span className="font-[Inter] text-[14px] leading-[24px] font-medium text-[#171A1F]">Free Consultation</span>
                <span className="font-[Inter] text-[12px] leading-[20px] font-normal text-[#565D6D]">No Obligation</span>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-2 p-6 h-[172px] bg-white rounded-[10px]" style={{ boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.07), 0px 0px 2px rgba(23, 26, 31, 0.12)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <img src="/images/lucide-MapPin-Outlined.svg" alt="Guidance" className="w-6 h-6" style={{ filter: 'brightness(0)' }} />
                </div>
                <span className="font-[Inter] text-[14px] leading-[24px] font-medium text-[#171A1F]">Expert Guidance</span>
                <span className="font-[Inter] text-[12px] leading-[20px] font-normal text-[#565D6D]">Personalized Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowRatingModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-bold text-gray-900">
                  Rate This Broker
                </h3>
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setUserRating(0);
                    setRatingReview('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Broker Info */}
              {broker && (
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-[#E5F0FA] overflow-hidden">
                    <img
                      src={pickImage(broker?.brokerImage, broker?.profileImage, broker?.image) || '/images/user-2.jpeg'}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-gray-900">{displayName}</h4>
                    <p className="text-[12px] text-gray-500">{firmDisplay}</p>
                  </div>
                </div>
              )}

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-[14px] font-medium text-gray-700 mb-3">
                  Your Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          star <= userRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 fill-gray-300'
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <p className="text-[12px] text-gray-600 mt-2">
                  {userRating === 1 && 'Poor'}
                  {userRating === 2 && 'Fair'}
                  {userRating === 3 && 'Good'}
                  {userRating === 4 && 'Very Good'}
                  {userRating === 5 && 'Excellent'}
                </p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-[14px] font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={ratingReview}
                  onChange={(e) => setRatingReview(e.target.value)}
                  placeholder="Share your experience with this broker..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0D542B] focus:border-[#0D542B] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setUserRating(0);
                    setRatingReview('');
                  }}
                  className="flex-1 h-[40px] px-4 flex items-center justify-center font-[Inter] text-[13px] leading-[22px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (userRating === 0) {
                      toast.error('Please select a rating');
                      return;
                    }

                    setRatingLoading(true);
                    try {
                      const token = typeof window !== 'undefined'
                        ? localStorage.getItem('token') || localStorage.getItem('authToken')
                        : null;

                      if (!token) {
                        toast.error('Please login to submit a rating');
                        setShowRatingModal(false);
                        router.push('/login');
                        return;
                      }

                      const base = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
                      const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      };

                      const brokerMongoId = broker?._id || brokerId;
                      
                      // API expects: brokerId, rating, and review (optional)
                      const ratingData = {
                        brokerId: brokerMongoId,
                        rating: userRating,
                        review: ratingReview || ''
                      };

                      console.log('Submitting rating to:', `${base}/broker-ratings`);
                      console.log('Rating data:', ratingData);

                      const res = await fetch(`${base}/broker-ratings`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(ratingData)
                      });

                      const responseData = await res.json().catch(() => ({}));
                      
                      if (!res.ok) {
                        throw new Error(responseData.message || 'Failed to submit rating');
                      }

                      // Handle success response
                      if (responseData.success && responseData.data) {
                        toast.success(responseData.message || 'Thank you for your rating!');
                        console.log('Rating submitted successfully:', responseData.data);
                      } else {
                        toast.success('Thank you for your rating!');
                      }

                      setShowRatingModal(false);
                      setUserRating(0);
                      setRatingReview('');
                      
                      // Refresh ratings after submitting
                      const refreshRatings = async () => {
                        try {
                          const refreshToken = typeof window !== 'undefined'
                            ? localStorage.getItem('token') || localStorage.getItem('authToken')
                            : null;
                          const refreshBase = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
                          const refreshHeaders = {
                            'Content-Type': 'application/json',
                            ...(refreshToken ? { 'Authorization': `Bearer ${refreshToken}` } : {})
                          };

                          const brokerMongoId = broker?._id || brokerId;
                          const ratingsEndpoint = `/broker-ratings/broker/${encodeURIComponent(String(brokerMongoId))}`;
                          
                          const refreshRes = await fetch(`${refreshBase}${ratingsEndpoint}`, { headers: refreshHeaders });
                          if (refreshRes.ok) {
                            const refreshData = await refreshRes.json();
                            if (refreshData.success && refreshData.data && refreshData.data.stats) {
                              setBrokerRatingsStats(refreshData.data.stats);
                            }
                          }
                        } catch (e) {
                          console.error('Error refreshing ratings:', e);
                        }
                      };
                      
                      refreshRatings();
                    } catch (error) {
                      console.error('Error submitting rating:', error);
                      toast.error(error.message || 'Failed to submit rating. Please try again.');
                    } finally {
                      setRatingLoading(false);
                    }
                  }}
                  disabled={userRating === 0 || ratingLoading}
                  className="flex-1 h-[40px] px-4 flex items-center justify-center font-[Inter] text-[13px] leading-[22px] font-medium text-white bg-[#0D542B] hover:bg-[#0B4624] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {ratingLoading ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


