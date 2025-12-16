'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface DotsProps {
  className?: string;
  style?: React.CSSProperties;
}

const Dots = ({ className, style }: DotsProps) => (
  <svg
    width="120"
    height="60"
    viewBox="0 0 120 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <circle cx="10" cy="20" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="25" cy="10" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="10" cy="20" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="25" cy="10" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="40" cy="25" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="60" cy="15" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="80" cy="30" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="100" cy="20" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="20" cy="40" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="35" cy="50" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="55" cy="40" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="75" cy="50" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="15" cy="30" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="30" cy="20" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="50" cy="10" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="65" cy="35" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="90" cy="40" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="110" cy="30" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="5" cy="50" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="45" cy="55" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="70" cy="45" r="4" fill="#E5E7EB" opacity="1.5" />
    <circle cx="100" cy="55" r="4" fill="#E5E7EB" opacity="1.5" />
  </svg>
);

const CARDS_VISIBLE = 2;

interface HeroCard {
  id?: string;
  type: string;
  title: string;
  image: string;
  price: string;
  items: string;
  color: string;
}

interface BrokerApiItem {
  brokerImage?: string;
  image?: string;
  profileImage?: string;
  avatar?: string;
  region?: Array<string | { name?: string; city?: string; state?: string }>;
  city?: string;
  state?: string;
  specializations?: string[];
  specialization?: string;
  leadsCreated?: { count?: number };
  leadCount?: number;
  totalLeads?: number;
  leads?: number;
}

interface HeroData {
  badge: {
    text: string;
    icon?: string;
  };
  title: {
    main: string;
    accent: string;
    subtitle: string;
  };
  description: string;
  buttons: {
    primary: string;
    secondary: string;
  };
  rating: {
    score: string;
    text: string;
    subtext: string;
    users: string[];
  };
  cards: HeroCard[];
}

const Hero = ({ data = {
  badge: { text: '', icon: '' },
  title: { main: '', accent: '', subtitle: '' },
  description: '',
  buttons: { primary: '', secondary: '' },
  rating: { score: '', text: '', subtext: '', users: [] },
  cards: []
} }: { data: HeroData }) => {
  const router = useRouter(); // ✅ Next.js router
  const { isAuthenticated, user, brokerDetails } = useAuth() as {
    isAuthenticated: () => boolean;
    user?: { userId?: string; token?: string; role?: string } | null;
    brokerDetails?: unknown;
  }; // Access shared auth + broker info
  const [startIdx, setStartIdx] = useState(0);
  // Read token synchronously to avoid a first paint with hardcoded cards
  // removed unused initialToken
  const [apiCards, setApiCards] = useState<HeroCard[]>([]);
  // Always intend to use API; we will gracefully fallback if it fails
  const [intendApi, setIntendApi] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const {
    badge = { text: '' },
    title = { main: '', accent: '', subtitle: '' },
    description = '',
    buttons = { secondary: 'Explore' },
    rating = { users: [], score: '', text: '', subtext: '' },
    cards = [],
  } = data || {};

  // During SSR (not hydrated) or when intending API, don't use hardcoded cards
  const displayCards: HeroCard[] = (intendApi || !hydrated) ? apiCards : cards;

  const canPrev = startIdx > 0;
  const canNext = startIdx + CARDS_VISIBLE < displayCards.length;

  const handlePrev = () => canPrev && setStartIdx(startIdx - 1);
  const handleNext = () => canNext && setStartIdx(startIdx + 1);

  // No-op placeholder removed (was unused)

  const openProductDetails = (id?: string) => {
    if (id) {
      router.push(`/broker-details/${id}`);
      return;
    }
    router.push('/broker-details');
  };

  // Fetch brokers for hero cards (follow existing app pattern)
  useEffect(() => {
    // mark hydration so SSR doesn't flash hardcoded content
    setHydrated(true);

    const fetchBrokersForHero = async () => {
      try {
        setIsLoading(true);
        const token =
          typeof window !== 'undefined'
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

        // Prefer shared brokerDetails from AuthContext (avoids duplicate API calls)
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
             // console.log('📍 Hero: Using current location coordinates:', latitude, longitude);
            } catch (err) {
             // console.log('📍 Hero: Could not get current location, will fetch all verified brokers');
            }
          }
        }

        // We always prefer API; token only affects headers
        setIntendApi(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        // Build API URL with location filter if coordinates are available
        let apiUrlWithParams = `${apiUrl}/brokers?verificationStatus=Verified`;
        if (latitude && longitude) {
          apiUrlWithParams += `&latitude=${latitude}&longitude=${longitude}`;
         // console.log('📍 Hero: Fetching brokers with location filter:', apiUrlWithParams);
        } else {
         // console.log('📍 Hero: Fetching all verified brokers (no location filter)');
        }

        const response = await fetch(apiUrlWithParams, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          // Keep intending API (no hardcoded fallback); show empty state/skeletons
          setApiCards([]);
          return;
        }

         const data: unknown = await response.json();

        // Normalize brokers array (match other components' pattern)
         type APIData = { data?: { brokers?: BrokerApiItem[] } | BrokerApiItem[]; brokers?: BrokerApiItem[]; result?: BrokerApiItem[]; items?: BrokerApiItem[] } | BrokerApiItem[];
         const d = data as APIData;
         let brokers: BrokerApiItem[] = [];
         if (Array.isArray((d as { data?: { brokers?: BrokerApiItem[] } })?.data?.brokers)) brokers = (d as { data?: { brokers?: BrokerApiItem[] } }).data!.brokers!;
         else if (Array.isArray((d as { data?: BrokerApiItem[] })?.data)) brokers = (d as { data?: BrokerApiItem[] }).data!;
         else if (Array.isArray((d as { brokers?: BrokerApiItem[] })?.brokers)) brokers = (d as { brokers?: BrokerApiItem[] }).brokers!;
         else if (Array.isArray((d as { result?: BrokerApiItem[] })?.result)) brokers = (d as { result?: BrokerApiItem[] }).result!;
         else if (Array.isArray((d as { items?: BrokerApiItem[] })?.items)) brokers = (d as { items?: BrokerApiItem[] }).items!;
         else if (Array.isArray(d)) brokers = d as BrokerApiItem[];

        if (!Array.isArray(brokers) || brokers.length === 0) {
          // No brokers returned; avoid default cards
          setApiCards([]);
          return;
        }

        // Keep all brokers (including logged-in broker if they appear in filtered results)
        // The API already filters by location, so we just need to ensure verified brokers are shown
        
        // Helper function to extract distance (in km)
        const getDistance = (b: BrokerApiItem): number => {
          const distance = (b as unknown as { distanceKm?: number })?.distanceKm 
            ?? (b as unknown as { distance?: number })?.distance;
          return Number.isFinite(Number(distance)) ? Number(distance) : Infinity; // Use Infinity if no distance (will sort last)
        };

        // Helper function to extract lead count
        const getLeadCount = (b: BrokerApiItem): number => {
          const rawLeads = (typeof b?.leadsCreated?.count === 'number' ? b.leadsCreated.count : undefined)
            ?? (typeof b?.leadCount === 'number' ? b.leadCount : undefined)
            ?? (typeof b?.totalLeads === 'number' ? b.totalLeads : undefined)
            ?? (typeof b?.leads === 'number' ? b.leads : undefined);
          return Number.isFinite(Number(rawLeads)) ? Number(rawLeads) : 0;
        };

        // Sort brokers: first by distance (ascending - closest first), then by lead count (descending - highest first)
        const sortedBrokers = [...brokers].sort((a, b) => {
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
          ? sortedBrokers.filter((b) => {
              // Extract broker ID from various possible fields
              let brokerId = '';
              const userId = (b as unknown as { userId?: unknown }).userId;
              
              if (userId && typeof userId === 'object' && userId !== null) {
                const userIdObj = userId as { _id?: string; id?: string };
                brokerId = userIdObj._id || userIdObj.id || '';
              } else if (userId && typeof userId === 'string') {
                brokerId = userId;
              }
              
              if (!brokerId) {
                brokerId = (b as unknown as { _id?: string })._id || (b as unknown as { id?: string }).id || '';
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
               // console.log('Filtering out broker from hero:', brokerIdStr, 'Current Broker ID:', currentBrokerIdStr, 'Current User ID:', currentUserIdStr);
              }
              
              // Only show brokers that don't match the logged-in broker
              return !shouldFilter;
            })
          : sortedBrokers;

         const mapped: HeroCard[] = filteredBrokers.slice(0, 6).map((b) => {
           const img: string = b?.brokerImage || b?.image || b?.profileImage || b?.avatar || '';
          // Resolve region/city text
          let regionName = '';
           if (Array.isArray(b?.region) && b.region.length > 0) {
             const firstRegion = b.region[0];
             regionName = typeof firstRegion === 'string' ? firstRegion : (firstRegion?.name || firstRegion?.city || firstRegion?.state || '');
          }
          if (!regionName) {
             regionName = (b?.city as string) || (b?.state as string) || '';
          }
          const spec = Array.isArray(b?.specializations) && b.specializations.length > 0
            ? b.specializations[0]
            : (typeof b?.specialization === 'string' && b.specialization.trim() ? b.specialization : '');

          const rawLeads = (typeof b?.leadsCreated?.count === 'number' ? b.leadsCreated.count : undefined)
            ?? (typeof b?.leadCount === 'number' ? b.leadCount : undefined)
            ?? (typeof b?.totalLeads === 'number' ? b.totalLeads : undefined)
            ?? (typeof b?.leads === 'number' ? b.leads : undefined);
          const leadsNum = Number(rawLeads);
          const hasLeads = Number.isFinite(leadsNum);
          const leadsText = hasLeads ? `${leadsNum} enquires` : `0 enquires`;

          // Match Brokers.tsx logic: prefer userId (object/string), then _id, then id
          const id = (
            (typeof (b as unknown as { userId?: unknown }).userId === 'object' && (b as unknown as { userId?: { _id?: string } }).userId
              ? (b as unknown as { userId?: { _id?: string } }).userId?._id
              : undefined) ||
            (typeof (b as unknown as { userId?: unknown }).userId === 'string'
              ? (b as unknown as { userId?: string }).userId
              : undefined) ||
            (b as unknown as { _id?: string })._id ||
            (b as unknown as { id?: string }).id
          );
          return {
            id,
            type: '',
            title: spec,
            image: img,
            price: '',
            items: regionName && regionName.trim().length > 0 ? `${regionName} • ${leadsText}` : `- • ${leadsText}`,
            color: '#0A421E'
          };
        });

        setApiCards(mapped);
      } catch {
        // On error, avoid default cards; keep intending API
        setApiCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrokersForHero();
  }, []);

  return (
    <section className="py-12 md:py-24 px-4 md:px-8 lg:px-4">
      <div className="w-full mx-auto relative ">
        <div className="absolute left-72 top-96 z-10 hidden lg:block">
          <Dots />
        </div>

        <div className="absolute right-[550px] bottom-96 z-10 hidden lg:block">
          <Dots />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-8 lg:gap-24 items-center justify-between relative z-10">
          {/* Text Content */}
          <div className="space-y-3 md:space-y-3 lg:space-y-4 text-left md:min-w-0">
            <div className="inline-flex bg-white text-black px-3 md:px-3.5 lg:px-4 py-1.5 md:py-1.5 lg:py-2 rounded-full text-xs md:text-xs lg:text-sm items-center gap-1.5 md:gap-1.5 lg:gap-2">
              <img src="/images/start.png" className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" alt="star" />
              {badge.text}
            </div>

            <h1 className="text-5xl  font-medium text-gray-900 leading-tight">
              {title.main}{' '}
              <span className="text-green-900">{title.accent}</span>
              <br />
              <span className="text-green-900">{title.subtitle}</span>
            </h1>

            <p className="text-gray-500 text-xs md:text-xs lg:text-sm max-w-md">{description}</p>

            <div className="flex gap-4 md:gap-4 lg:gap-6 flex-wrap items-center">
              {/* Only show Join button if user is not logged in */}
              {!isAuthenticated() && (
                <button
                  onClick={() => {
                    window.location.href = '/signup';
                  }}
                  className="bg-green-900 text-white px-5 md:px-5 lg:px-6 py-2 md:py-2 lg:py-2.5 rounded-full text-xs md:text-xs lg:text-sm font-semibold flex items-center gap-2 cursor-pointer"
                >
                  {(buttons as { primary?: string; secondary?: string })?.primary || 'Join'}
                  <svg className="w-3 h-3 md:w-[14px] md:h-[14px] lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l5.3 5.3a1 1 0 010 1.414l-5.3 5.3a1 1 0 01-1.414-1.414L13.586 11H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              {/* Use Next Link instead of <a href> for client navigation */}
              <Link
                href="/search?tab=brokers"
                className="text-green-900 text-xs md:text-xs lg:text-sm mt-2 font-semibold hover:opacity-80"
              >
                {(buttons as { primary?: string; secondary?: string })?.secondary ?? 'Explore'}
              </Link>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 md:gap-3 lg:gap-4 mt-4 md:mt-5 lg:mt-6">
              <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
                {(rating.users || []).map((user, index) => (
                  <img
                    key={index}
                    className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full border-2 border-white"
                    src={user}
                    alt={`User ${index + 1}`}
                  />
                ))}
           
              </div>
              <div className="text-xs md:text-xs lg:text-sm ml-2 md:ml-0">
                <p className="font-semibold text-gray-700">
                  {rating.score} {rating.text}
                </p>
                <p className="text-gray-500 text-[10px] md:text-[10px] lg:text-xs">{rating.subtext}</p>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="flex flex-col items-center w-full mt-8 md:mt-0 md:min-w-0">
  <div className="relative w-full flex flex-col md:flex-row justify-center items-center gap-4 md:gap-2 lg:gap-4 py-2">

    {/* LEFT / RIGHT buttons aligned to the card container left */}
    <div className="absolute left-0 -bottom-12 md:-bottom-14 lg:-bottom-16 flex gap-2 md:gap-2 lg:gap-3 z-20">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrev(); }}
        disabled={!canPrev}
        className={`w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white transition 
          ${canPrev ? 'bg-green-900 hover:bg-green-800' : 'bg-green-900 opacity-50 cursor-not-allowed pointer-events-none'}
        `}
      >
        <svg
          className="w-4 h-4 md:w-[18px] md:h-[18px] lg:w-5 lg:h-5 rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNext(); }}
        disabled={!canNext}
        className={`w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white transition 
          ${canNext ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-yellow-500 opacity-50 cursor-not-allowed pointer-events-none'}
        `}
      >
        <svg
          className="w-4 h-4 md:w-[18px] md:h-[18px] lg:w-5 lg:h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    {/* LOADING */}
    {intendApi && isLoading && (
      <>
        <div className="bg-white p-3 rounded-xl shadow-sm w-full max-w-xs md:w-[calc(50%-0.25rem)] md:max-w-none lg:min-w-[260px] h-[260px] animate-pulse flex-shrink-0" />
        <div className="bg-white p-3 rounded-xl shadow-sm w-full max-w-xs md:w-[calc(50%-0.25rem)] md:max-w-none lg:min-w-[260px] h-[260px] animate-pulse hidden md:block flex-shrink-0" />
      </>
    )}

    {/* CARDS */}
    {!isLoading && displayCards.slice(startIdx, startIdx + CARDS_VISIBLE).map((card, index) => (
      <div
        key={index}
        onClick={() => openProductDetails(card.id)}
        className="
          hero-card group relative cursor-pointer bg-white p-3 rounded-xl shadow-sm
          transition w-full max-w-xs md:w-[calc(50%-0.25rem)] md:max-w-none lg:min-w-[260px]
          mx-auto md:mx-0 lg:mx-2 flex-shrink-0
          h-[260px]   /* ✅ fixed height = same size */
          hover:shadow-md
        "
      >
        {/* image always same height */}
        {card.image && card.image.trim().length > 0 ? (
          <img
            src={card.image}
            className="rounded-lg object-cover h-48 w-full"  /* ✅ fixed */
            alt={card.title}
          />
        ) : (
          <div className="rounded-lg h-48 w-full bg-gray-200 animate-pulse" />
        )}

        <div className="absolute" style={{ top: '14px', left: '50px' }}>
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white flex items-center justify-center bg-transparent shadow-lg">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white"></div>
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 mt-2 text-left text-sm md:text-sm lg:text-base line-clamp-2">
          {card.title}
        </h3>
        <p className="text-gray-500 text-[10px] md:text-[10px] lg:text-xs text-left line-clamp-1">
          {card.items}
        </p>

        {/* arrow icon - keep pointer-events-none */}
        <div className="absolute bottom-3 right-3 bg-green-900 text-white p-2 rounded-full shadow-lg pointer-events-none">
          <svg
            className="w-4 h-4 -rotate-45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    ))}
  </div>
</div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
