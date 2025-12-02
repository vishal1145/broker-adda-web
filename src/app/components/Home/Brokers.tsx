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
      
      // Get current user ID from token
      const getCurrentUserId = () => {
        try {
          if (!token) return '';
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.brokerId || payload.userId || payload.id || payload.sub || '';
        } catch {
          return '';
        }
      };

      const currentUserId = getCurrentUserId();
      let currentBrokerId = '';
      let latitude: number | null = null;
      let longitude: number | null = null;

      // Fetch broker details to get the actual broker _id and location coordinates
      if (currentUserId && token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
          const brokerRes = await fetch(`${apiUrl}/brokers/${currentUserId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (brokerRes.ok) {
            const brokerData = await brokerRes.json();
            const broker = brokerData?.data?.broker || brokerData?.broker || brokerData?.data || brokerData;
            currentBrokerId = broker?._id || broker?.id || '';
            
            // Get broker's location coordinates if available
            if (broker?.location?.coordinates && Array.isArray(broker.location.coordinates) && broker.location.coordinates.length >= 2) {
              latitude = broker.location.coordinates[0];
              longitude = broker.location.coordinates[1];
              console.log('📍 Brokers: Using broker location coordinates:', latitude, longitude);
            }
            
            console.log('Current broker ID for brokers filter:', currentBrokerId);
          }
        } catch (err) {
          console.error('Error fetching broker details:', err);
        }
      }

      // If no broker coordinates, try to get current location
      if (!latitude || !longitude) {
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 60000
              });
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            console.log('📍 Brokers: Using current location coordinates:', latitude, longitude);
          } catch (err) {
            console.log('📍 Brokers: Could not get current location, will fetch all verified brokers');
          }
        }
      }
      
      // Use environment variable for API URL following app pattern
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // Build API URL with location filter if coordinates are available
      let apiUrlWithParams = `${apiUrl}/brokers?verificationStatus=Verified`;
      if (latitude && longitude) {
        apiUrlWithParams += `&latitude=${latitude}&longitude=${longitude}`;
        console.log('📍 Brokers: Fetching brokers with location filter:', apiUrlWithParams);
      } else {
        console.log('📍 Brokers: Fetching all verified brokers (no location filter)');
      }

      const response = await fetch(apiUrlWithParams, {
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

        // Keep all brokers (including logged-in broker if they appear in filtered results)
        // The API already filters by location, so we just need to ensure verified brokers are shown
        
        // Helper function to extract distance (in km)
        const getDistance = (b: Broker): number => {
          const distance = (b as unknown as { distanceKm?: number })?.distanceKm 
            ?? (b as unknown as { distance?: number })?.distance;
          return Number.isFinite(Number(distance)) ? Number(distance) : Infinity; // Use Infinity if no distance (will sort last)
        };

        // Helper function to extract lead count
        const getLeadCount = (b: Broker): number => {
          const rawLeads = (typeof b?.leadsCreated?.count === 'number' ? b.leadsCreated.count : undefined)
            ?? (typeof b?.leadCount === 'number' ? b.leadCount : undefined)
            ?? (typeof b?.totalLeads === 'number' ? b.totalLeads : undefined)
            ?? (typeof b?.leads === 'number' ? b.leads : undefined);
          return Number.isFinite(Number(rawLeads)) ? Number(rawLeads) : 0;
        };

        // Sort brokers: first by distance (ascending - closest first), then by lead count (descending - highest first)
        const sortedBrokers = [...brokersData].sort((a, b) => {
          const distanceA = getDistance(a);
          const distanceB = getDistance(b);
          const leadCountA = getLeadCount(a);
          const leadCountB = getLeadCount(b);
          
          // First priority: sort by distance (closest first)
          if (distanceA !== distanceB) {
            return distanceA - distanceB; // Ascending order (closest first)
          }
          
          // Second priority: if distance is same, sort by lead count (highest first)
          return leadCountB - leadCountA; // Descending order (highest first)
        });

        // Filter out the logged-in broker
        const filteredBrokers = (currentBrokerId || currentUserId)
          ? sortedBrokers.filter((b: Broker) => {
              // Extract broker ID from various possible fields
              let brokerId = '';
              const userId = b.userId;
              
              if (userId && typeof userId === 'object' && userId !== null) {
                const userIdObj = userId as { _id?: string; id?: string };
                brokerId = userIdObj._id || userIdObj.id || '';
              } else if (userId && typeof userId === 'string') {
                brokerId = userId;
              }
              
              if (!brokerId) {
                brokerId = b._id || b.id || '';
              }
              
              // Convert both to strings for comparison
              const brokerIdStr = String(brokerId).trim();
              const currentBrokerIdStr = String(currentBrokerId || '').trim();
              const currentUserIdStr = String(currentUserId || '').trim();
              
              // Check if broker matches logged-in broker (by brokerId or userId)
              const matchesBrokerId = currentBrokerIdStr !== '' && brokerIdStr === currentBrokerIdStr;
              const matchesUserId = currentUserIdStr !== '' && brokerIdStr === currentUserIdStr;
              const shouldFilter = matchesBrokerId || matchesUserId;
              
              if (shouldFilter) {
                console.log('Filtering out broker from brokers list:', brokerIdStr, 'Current Broker ID:', currentBrokerIdStr, 'Current User ID:', currentUserIdStr);
              }
              
              // Only show brokers that don't match the logged-in broker
              return !shouldFilter;
            })
          : sortedBrokers;
        
        console.log('Final brokers data (after filter and sort):', filteredBrokers);
        console.log('Setting brokers state with', filteredBrokers.length, 'items');
        setBrokers(filteredBrokers);
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
  

<section id="popular-brokers" className="relative py-4 md:py-8 ">
  <div className="w-full mx-auto ">
    <div className="mb-8 md:mb-10 text-center">
      <div className="flex items-center justify-center gap-2 text-sm ">
        <p className="text-base md:text-xl text-gray-900">
            <span className="text-yellow-500">—</span> Our Brokers
          </p>
        </div>
      <h2 className="mt-2 text-2xl md:text-4xl font-medium text-gray-900">
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
      <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 md:px-6 lg:px-0">
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
      <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 md:px-6 lg:px-0">
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
              {/* Name with Green Arrow Icon */}
              <div className="flex items-start justify-between mb-3">
                <Link href={`/broker-details/${brokerId}`} className="flex items-center gap-1 group/name" title="View details">
                  <h3 className="text-[18px] leading-7 font-semibold text-gray-900 group-hover/name:text-gray-900">
                    {typeof broker.name === 'string' ? broker.name : 
                     typeof broker.fullName === 'string' ? broker.fullName : 
                     broker.name?.name || broker.fullName?.name || 'Unknown Broker'}
                  </h3>
                  <svg
      className="h-5 w-5 text-emerald-600 transition-transform group-hover/name:translate-x-1 group-hover/name:-translate-y-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
                </Link>
              </div>

              {/* Title */}
              <div className="mb-3">
                <p className="text-[12px] leading-5 font-normal text-gray-600">
                  {Array.isArray(broker.specializations) && broker.specializations.length > 0 ? broker.specializations[0] :
                   typeof broker.specialization === 'string' ? broker.specialization : 
                   typeof broker.expertise === 'string' ? broker.expertise : 
                   typeof broker.role === 'string' ? broker.role : 
                   broker.firmName || 'Real Estate Specialist'}
                </p>
              </div>

              {/* Location with Map Pin Icon */}
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="h-3 w-3 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <p className="text-[12px] leading-5 font-normal text-gray-600">
                  {(() => {
                    const r = broker.region;
                    if (Array.isArray(r) && r.length > 0) {
                      const first = r[0] as string | RegionObject;
                      return typeof first === 'string' ? first : (first.name || first.city || first.state || 'Location');
                    }
                    if (typeof r === 'string') return r;
                    if (r && typeof r === 'object') {
                      const ro = r as RegionObject;
                      return ro.name || ro.city || ro.state || 'Location';
                    }
                    if (typeof broker.location === 'string') return broker.location;
                    if (typeof broker.city === 'string') return broker.city;
                    return broker.state || broker.city || 'Location';
                  })()}
                </p>
              </div>

              {/* Leads Completed with User Group Icon */}
              <div className="flex items-center gap-2">
                <svg
                  className="h-3 w-3 text-gray-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <p className="text-[12px] leading-5 font-normal text-gray-600">
                  {broker.leadsCreated?.count || broker.leadCount || broker.totalLeads || broker.leads || 0} Enquiries Completed
                </p>
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
<section className="pb-4 md:pb-8 lg:pb-12">
  <div className="max-w-5xl mx-auto text-center p-4 md:p-8">
    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">Join India&apos;s Premier Broker Network</h3>
    <div className="my-6 md:my-10 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 text-xs md:text-sm text-gray-700">
      <div className="flex flex-col items-center gap-2 md:gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-10 w-10 md:h-14 md:w-14">
          <svg className="h-6 w-6 md:h-10 md:w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10l9-6 9 6-9 6-9-6z"/>
            <path d="M3 14l9 6 9-6"/>
          </svg>
        </span>
        <span>Enquiry generation support</span>
      </div>
      <div className="flex flex-col items-center gap-2 md:gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-10 w-10 md:h-14 md:w-14">
          <svg className="h-5 w-5 md:h-8 md:w-8 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </span>
        <span>Verified Enquiries</span>
      </div>
      <div className="flex flex-col items-center gap-2 md:gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-10 w-10 md:h-14 md:w-14">
          <svg className="h-6 w-6 md:h-10 md:w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path d="M12 14v7"/>
            <path d="M5 10.5v7"/>
            <path d="M19 10.5v7"/>
          </svg>
        </span>
        <span>Exclusive training</span>
      </div>
      <div className="flex flex-col items-center gap-2 md:gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-yellow-50 h-10 w-10 md:h-14 md:w-14">
          <svg className="h-6 w-6 md:h-10 md:w-10 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 17l6-6 4 4 7-7"/>
            <path d="M14 7h7v7"/>
          </svg>
        </span>
        <span>Higher commissions</span>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-green-900 px-4 md:px-6 py-1.5 md:py-2 text-white text-xs md:text-sm font-semibold shadow-sm w-full sm:w-auto justify-center">Become a Broker
        <svg className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </Link>
      <Link href="/search?tab=brokers" className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 md:px-6 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-gray-800 hover:bg-gray-50 w-full sm:w-auto justify-center">View All Brokers
        <svg className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </Link>
    </div>
  </div>
</section>
    </>
  );
};

export default Brokers;
