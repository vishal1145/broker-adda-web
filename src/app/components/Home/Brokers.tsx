"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

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
  const { brokerDetails } = useAuth() as {
    user?: { userId?: string; token?: string; role?: string } | null;
    brokerDetails?: unknown;
  };

  // Ref to prevent duplicate API calls
  const hasFetchedRef = useRef(false);

  // Fetch brokers from API
  const fetchBrokers = useCallback(async () => {
    // Prevent duplicate API calls
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

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

      // Prefer shared broker details from AuthContext to avoid duplicate API calls
      const sharedBroker = brokerDetails as
        | {
            _id?: string;
            id?: string;
            location?: { coordinates?: number[] };
          }
        | undefined;

      if (sharedBroker) {
        currentBrokerId = sharedBroker._id || sharedBroker.id || '';
        if (
          sharedBroker.location?.coordinates &&
          Array.isArray(sharedBroker.location.coordinates) &&
          sharedBroker.location.coordinates.length >= 2
        ) {
          latitude = sharedBroker.location.coordinates[0] as number;
          longitude = sharedBroker.location.coordinates[1] as number;
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
          } catch {
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
        //  ('📍 Brokers: Fetching brokers with location filter:', apiUrlWithParams);
      } else {
        //  ('📍 Brokers: Fetching all verified brokers (no location filter)');
      }

      const response = await fetch(apiUrlWithParams, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        const data = await response.json();
      
        // Handle different possible response structures
        let brokersData = [];
        
        // Try multiple possible structures
        if (Array.isArray(data?.data?.brokers)) {
          brokersData = data.data.brokers;
        } else if (Array.isArray(data?.data)) {
          brokersData = data.data;
        } else if (Array.isArray(data?.brokers)) {
          brokersData = data.brokers;
        } else if (Array.isArray(data?.result)) {
          brokersData = data.result;
        } else if (Array.isArray(data?.items)) {
          brokersData = data.items;
        } else if (Array.isArray(data)) {
          brokersData = data;
        } else {
          
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
              }
              
              // Only show brokers that don't match the logged-in broker
              return !shouldFilter;
            })
          : sortedBrokers;
        
        
        setBrokers(filteredBrokers);
      } else {
        await response.text();
        // console.error('Failed to fetch brokers:', response.status, await response.text());
        setError('Failed to load brokers');
      }
    } catch {
      // console.error('Error fetching brokers:', err);
      setError('Error loading brokers');
    } finally {
      setLoading(false);
    }
  }, [brokerDetails]);

  // Fetch brokers on component mount
  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  // Monitor brokers state changes
  useEffect(() => {
 
  }, [brokers]);

  // Use API data - limit to 4 brokers
  const displayBrokers = brokers.slice(0, 4);

  // Normalize image URLs coming from API (prefix base URL when missing protocol)
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const normalizeImageUrl = (raw?: string) => {
    const url = raw?.trim();
    if (!url || url === 'null' || url === 'undefined') return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (apiBaseUrl) return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    return url;
  };


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
      displayBrokers.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No verified brokers available right now.
        </div>
      ) : (
        <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 md:px-6 lg:px-0">
          {displayBrokers.map((broker, index) => {
        

          // Pick the first valid, non-empty image string from API
          const pickValidImage = (...cands: (string | undefined)[]) => {
            const valid = cands
              .filter((s) => typeof s === 'string' && s.trim() && s !== 'null' && s !== 'undefined')
              .map((s) => normalizeImageUrl(s))
              .find(Boolean);
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
            broker.defaultImage
          );
          
          const brokerId = (
            typeof broker.userId === 'object' && broker.userId ? broker.userId._id :
            typeof broker.userId === 'string' ? broker.userId :
            broker._id || broker.id
          );
          return (
        <Link key={brokerId || index} href={`/broker-details/${brokerId}`} className="block">
  <article
    className="group relative cursor-pointer rounded-2xl border border-gray-100 bg-white shadow-sm 
               hover:shadow-xl transition duration-300 overflow-hidden 
               hover:bg-yellow-400 hover:ring-1 hover:ring-yellow-500/60 hover:-translate-y-0.5"
  >
    <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
      <img
        src={imageUrl || normalizeImageUrl(broker.defaultImage) || ""}
        alt={`Broker portrait - ${
          typeof broker.name === "string"
            ? broker.name
            : typeof broker.fullName === "string"
            ? broker.fullName
            : "Broker"
        }`}
        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        onError={(e) => {
          const fallback = pickValidImage(broker.defaultImage);
          if (fallback && e.currentTarget.src !== fallback) {
            e.currentTarget.src = fallback;
          }
        }}
      />
    </div>

    <div className="p-6">
      {/* Name */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1">
          <h3 className="text-[18px] leading-7 font-semibold text-gray-900 capitalize">
            {typeof broker.name === "string"
              ? broker.name
              : typeof broker.fullName === "string"
              ? broker.fullName
              : broker.name?.name || broker.fullName?.name || "Unknown Broker"}
          </h3>

          <svg
            className="h-5 w-5 text-emerald-600 transition-transform 
                       group-hover:translate-x-1 group-hover:-translate-y-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </div>
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

      {/* Location */}
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

      {/* Leads */}
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
                  {(() => {
                    const count = broker.leadsCreated?.count || broker.leadCount || broker.totalLeads || broker.leads || 0;
                    return count === 0 ? 'New Broker' : `${count} ${count === 1 ? 'Enquiry' : 'Enquiries'} Completed`;
                  })()}
                </p>
              </div>
            </div>
   
  </article>
</Link>

          );
        })}
      </div>
      )
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
