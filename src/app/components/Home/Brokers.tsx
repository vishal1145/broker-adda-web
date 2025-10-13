'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface RegionObject { name?: string; city?: string; state?: string }

interface Broker {
  _id?: string;
  id?: string;
  userId?: string | { _id?: string };
  name?: string | { name?: string };
  fullName?: string | { name?: string };
  specialization?: string | { name?: string };
  specializations?: string[];
  expertise?: string | { name?: string };
  role?: string | { name?: string };
  region?: string[] | { name?: string } | RegionObject[];
  location?: { type: string };
  city?: string;
  state?: string;
  leadCount?: number;
  totalLeads?: number;
  leads?: number;
  leadsCreated?: { count: number; items: unknown[] };
  image?: string;
  profileImage?: string;
  brokerImage?: string;
  defaultImage?: string;
  avatar?: string;
  photo?: string;
  picture?: string;
  profilePicture?: string;
  gender?: string;
  firmName?: string;
  licenseNumber?: string;
  address?: string;
  website?: string;
  whatsappNumber?: string;
  status?: string;
  approvedByAdmin?: string;
}

const Brokers = () => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch brokers from API
  const fetchBrokers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get token from localStorage following app pattern
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      // Use environment variable for API URL following app pattern
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      // Proceed even without token; add Authorization only if available
      console.log('Fetching brokers from:', `${apiUrl}/brokers`, 'with token:', !!token);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const response = await fetch(`${apiUrl}/brokers`, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Brokers API response:', data);
        console.log('Response data type:', typeof data);
        console.log('Is data an array?', Array.isArray(data));
        console.log('Data keys:', Object.keys(data));
        
        // Handle different possible response structures
        let brokersData = [];
        
        // Try multiple possible structures
        if (Array.isArray(data?.data?.brokers)) {
          brokersData = data.data.brokers;
          console.log('Using data.data.brokers, found', brokersData.length, 'brokers');
        } else if (Array.isArray(data?.data)) {
          brokersData = data.data;
          console.log('Using data.data, found', brokersData.length, 'brokers');
        } else if (Array.isArray(data?.brokers)) {
          brokersData = data.brokers;
          console.log('Using data.brokers, found', brokersData.length, 'brokers');
        } else if (Array.isArray(data?.result)) {
          brokersData = data.result;
          console.log('Using data.result, found', brokersData.length, 'brokers');
        } else if (Array.isArray(data?.items)) {
          brokersData = data.items;
          console.log('Using data.items, found', brokersData.length, 'brokers');
        } else if (Array.isArray(data)) {
          brokersData = data;
          console.log('Using direct data array, found', brokersData.length, 'brokers');
        } else {
          console.log('No valid broker data found in response');
          console.log('Available keys in response:', Object.keys(data || {}));
        }
        
        console.log('Final brokers data:', brokersData);
        console.log('Setting brokers state with', brokersData.length, 'items');
        setBrokers(brokersData);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch brokers:', response.status, errorText);
        setError('Failed to load brokers');
      }
    } catch (err) {
      console.error('Error fetching brokers:', err);
      setError('Error loading brokers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch brokers on component mount
  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  // Monitor brokers state changes
  useEffect(() => {
    console.log('Brokers state changed:', brokers);
    console.log('Brokers length:', brokers.length);
  }, [brokers]);

  // Fallback broker data if API fails
  const fallbackBrokers: Broker[] = [
    {
      _id: '1',
      name: 'Ravi Kumar',
      specializations: ['Residential Specialist'],
      region: ['Delhi NCR'],
      leadsCreated: { count: 120, items: [] },
      brokerImage: '/images/broker2.webp'
    },
    {
      _id: '2',
      name: 'Priya Shah',
      specializations: ['Luxury Homes Advisor'],
      region: ['Mumbai'],
      leadsCreated: { count: 95, items: [] },
      brokerImage: '/images/broker7.webp'
    },
    {
      _id: '3',
      name: 'Aditi Verma',
      specializations: ['Commercial Specialist'],
      region: ['Bengaluru'],
      leadsCreated: { count: 110, items: [] },
      brokerImage: '/images/broker8.jpg'
    },
    {
      _id: '4',
      name: 'Sandeep Mehra',
      specializations: ['Land & Plots Consultant'],
      region: ['Pune'],
      leadsCreated: { count: 70, items: [] },
      brokerImage: '/images/broker5.webp'
    }
  ];

  // Use API data if available, otherwise fallback - limit to 4 brokers
  const displayBrokers = brokers.length > 0 ? brokers.slice(0, 4) : fallbackBrokers;
  
  console.log('Current brokers state:', brokers);
  console.log('Brokers length:', brokers.length);
  console.log('Display brokers:', displayBrokers);
  console.log('Display brokers length:', displayBrokers.length);

  return (
    <>
  

<section id="popular-brokers" className="relative py-16   ">
  <div className="w-full mx-auto ">
    <div className="mb-10 text-center">
      <div className="flex items-center justify-center gap-2 text-sm ">
        <p className="text-xl text-gray-900">
            <span className="text-yellow-500">—</span> Our Brokers
          </p>
        </div>
      <h2 className="mt-2 text-4xl font-medium text-gray-900">
        Our <span className="text-green-900">Popular Brokers</span>
        </h2>
      {/* CTA: View All Brokers under header */}
      {/* <div className="mt-6">
        <Link href="/search" className="inline-flex items-center gap-3 rounded-full bg-green-900 px-6 py-3 text-white text-sm font-semibold shadow-sm hover:bg-green-800">
        View All Brokers
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </Link>
      </div> */}
    </div>

    {loading ? (
      <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden animate-pulse">
            <div className="aspect-[4/3] w-full bg-gray-200"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : error ? (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchBrokers}
          className="inline-flex items-center gap-2 rounded-full bg-green-900 px-6 py-2 text-white text-sm font-semibold shadow-sm hover:bg-green-800"
        >
          Retry
        </button>
      </div>
    ) : (
      <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayBrokers.map((broker, index) => {
          console.log('Rendering broker:', broker);
          console.log('Broker image fields:', {
            brokerImage: broker.brokerImage,
            image: broker.image,
            profileImage: broker.profileImage,
            avatar: broker.avatar,
            photo: broker.photo,
            picture: broker.picture,
            profilePicture: broker.profilePicture,
            defaultImage: broker.defaultImage
          });
          console.log('All broker fields:', Object.keys(broker));
          
          // Different fallback images for each position
          const fallbackImages = [
            '/images/broker2.webp',
            '/images/broker7.webp', 
            '/images/broker8.jpg',
            '/images/broker5.webp'
          ];
          
          // Pick the first valid, non-empty image string from API
          const pickValidImage = (...cands: (string | undefined)[]) => {
            const valid = cands.find((s) => typeof s === 'string' && s.trim() && s !== 'null' && s !== 'undefined');
            return valid || '';
          };

          const imageUrl = pickValidImage(
            broker.brokerImage,
            broker.image,
            broker.profileImage,
            broker.avatar,
            broker.photo,
            broker.picture,
            broker.profilePicture,
            broker.defaultImage,
            fallbackImages[index]
          );
          console.log('Final image URL being used:', imageUrl);
          
          const brokerId = (
            typeof broker.userId === 'object' && broker.userId ? broker.userId._id :
            typeof broker.userId === 'string' ? broker.userId :
            broker._id || broker.id
          );
          return (
          <article key={brokerId} className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition duration-300 overflow-hidden hover:bg-yellow-400 hover:ring-1 hover:ring-yellow-500/60 hover:-translate-y-0.5">
            <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
              <img 
                src={imageUrl} 
                alt={`Broker portrait - ${typeof broker.name === 'string' ? broker.name : typeof broker.fullName === 'string' ? broker.fullName : 'Broker'}`} 
                className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" 
                onError={(e) => {
                  // Fallback to default image if API image fails to load
                  e.currentTarget.src = pickValidImage(broker.defaultImage, fallbackImages[index]);
                }}
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <Link href={`/broker-details/${brokerId}`} className="flex items-center gap-1 group/name" title="View details">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover/name:text-gray-900" style={{display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                    {typeof broker.name === 'string' ? broker.name : 
                     typeof broker.fullName === 'string' ? broker.fullName : 
                     broker.name?.name || broker.fullName?.name || 'Unknown Broker'}
                  </h3>
                  <svg className="h-7 w-7 -rotate-45 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
                <button className="inline-flex h-7 w-7 items-center justify-center text-emerald-700" title="Chat">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
                </button>
              </div>

              <p className="text-[13px] leading-5 text-gray-600 group-hover:text-gray-900">
                {Array.isArray(broker.specializations) && broker.specializations.length > 0 ? broker.specializations[0] :
                 typeof broker.specialization === 'string' ? broker.specialization : 
                 typeof broker.expertise === 'string' ? broker.expertise : 
                 typeof broker.role === 'string' ? broker.role : 
                 broker.firmName || 'Real Estate Specialist'}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-medium">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 group-hover:bg-white group-hover:text-gray-900">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>
                  {(() => {
                    // Normalise region to a displayable string without using any
                    const r = broker.region;
                    if (Array.isArray(r) && r.length > 0) {
                      const first = r[0] as string | RegionObject;
                      return typeof first === 'string' ? first : (first.name || first.city || first.state || '-');
                    }
                    if (typeof r === 'string') return r;
                    if (r && typeof r === 'object') {
                      const ro = r as RegionObject;
                      return ro.name || ro.city || ro.state || '-';
                    }
                    if (typeof broker.location === 'string') return broker.location;
                    if (typeof broker.city === 'string') return broker.city;
                    return broker.state || broker.city || 'Location';
                  })()}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 text-gray-700 px-3 py-1 group-hover:bg-white group-hover:text-gray-900">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
                  {broker.leadsCreated?.count || broker.leadCount || broker.totalLeads || broker.leads || 0}+ leads
                </span>
              </div>
            </div>
          </article>
          );
        })}
      </div>
    )}
   
  </div>

  <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(300px_200px_at_20%_20%,black,transparent)]">
    <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-emerald-100/50 blur-2xl"></div>
  </div>
</section>

{/* Advisory CTA */}
<section className="pb-12">
  <div className="max-w-5xl mx-auto text-center  p-8 ">
    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 ">Join India&apos;s Premier Broker Network</h3>
    <div className="my-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm text-gray-700">
      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-14 w-14">
          <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10l9-6 9 6-9 6-9-6z"/>
            <path d="M3 14l9 6 9-6"/>
          </svg>
        </span>
        <span>Lead generation support</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-14 w-14">
          <svg className="h-8 w-8 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </span>
        <span>Verified leads</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-14 w-14">
          <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path d="M12 14v7"/>
            <path d="M5 10.5v7"/>
            <path d="M19 10.5v7"/>
          </svg>
        </span>
        <span>Exclusive training</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-14 w-14">
          <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 17l6-6 4 4 7-7"/>
            <path d="M14 7h7v7"/>
          </svg>
        </span>
        <span>Higher commissions</span>
      </div>
    </div>
    <div className=" flex items-center justify-center gap-3">
      <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-green-900 px-6 py-2 text-white text-sm font-semibold shadow-sm">Become a Broker
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </Link>
      <Link href="/search" className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">View All Brokers
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </Link>
    </div>
  </div>
</section>
    </>
  );
};

export default Brokers;
