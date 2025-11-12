'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

        // Fetch broker details to get the actual broker _id
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
              console.log('Current broker ID for hero filter:', currentBrokerId);
            }
          } catch (err) {
            console.error('Error fetching broker details:', err);
          }
        }

        // We always prefer API; token only affects headers
        setIntendApi(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const response = await fetch(`${apiUrl}/brokers?verificationStatus=Verified`, {
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

        // Filter out the logged-in broker
        const filteredBrokers = (currentBrokerId || currentUserId)
          ? brokers.filter((b) => {
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
                console.log('Filtering out broker from hero:', brokerIdStr, 'Current Broker ID:', currentBrokerIdStr, 'Current User ID:', currentUserIdStr);
              }
              
              // Only show brokers that don't match the logged-in broker
              return !shouldFilter;
            })
          : brokers;

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
          const leadsText = hasLeads ? `${leadsNum} leads` : `0 leads`;

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
    <section className=" py-24">
      <div className="w-full mx-auto relative">
        <div className="absolute left-72 top-96 z-10">
          <Dots />
        </div>

        <div className="absolute right-[550px] bottom-96 z-10">
          <Dots />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center justify-between relative z-10">
          {/* Text Content */}
          <div className="space-y-4 text-left">
            <div className="inline-flex bg-white text-black px-4 py-2 rounded-full text-sm items-center gap-2">
              <img src="/images/start.png" className="w-6 h-6" alt="star" />
              {badge.text}
            </div>

            <h1 className="text-5xl font-medium text-gray-900 leading-tight">
              {title.main}{' '}
              <span className="text-green-900">{title.accent}</span>
              <br />
              <span className="text-green-900">{title.subtitle}</span>
            </h1>

            <p className="text-gray-500 text-sm max-w-md">{description}</p>

            <div className="flex gap-6 flex-wrap items-center">
              <button
onClick={() => {
    window.location.href = '/signup';
  }}                className="bg-green-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                {(buttons as { primary?: string; secondary?: string })?.primary || 'Brokers'}
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l5.3 5.3a1 1 0 010 1.414l-5.3 5.3a1 1 0 01-1.414-1.414L13.586 11H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Use Next Link instead of <a href> for client navigation */}
              <Link
                href="/search?tab=brokers"
                className="text-green-900 text-sm mt-2 font-semibold hover:opacity-80"
              >
                {(buttons as { primary?: string; secondary?: string })?.secondary ?? 'Explore'}
              </Link>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mt-6">
              <div className="flex -space-x-2 overflow-hidden">
                {(rating.users || []).map((user, index) => (
                  <img
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-white"
                    src={user}
                    alt={`User ${index + 1}`}
                  />
                ))}
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-300 border-2 border-white text-black text-lg font-bold">
                  +
                </div>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-gray-700">
                  {rating.score} {rating.text}
                </p>
                <p className="text-gray-500 text-xs">{rating.subtext}</p>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="flex flex-col items-center w-full">
            <div className="relative w-full flex flex-col md:flex-row justify-center items-center gap-4 py-2">
              {intendApi && isLoading && (
                <>
                  <div className="bg-white p-3 rounded-xl shadow-sm w-full max-w-xs md:min-w-[260px] h-60 animate-pulse" />
                  <div className="bg-white p-3 rounded-xl shadow-sm w-full max-w-xs md:min-w-[260px] h-60 animate-pulse" />
                </>
              )}
              {!isLoading && displayCards.slice(startIdx, startIdx + CARDS_VISIBLE).map((card, index) => (
                <div
                  key={index}
                  onClick={() => openProductDetails(card.id)}
                  className="hero-card bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition relative group w-full max-w-xs md:min-w-[260px] mx-auto md:mx-2 cursor-pointer min-h-[260px]"
                >
                  {card.image && card.image.trim().length > 0 ? (
                    <img
                      src={card.image}
                      className="rounded-lg object-cover h-48 w-full"
                      alt={card.title}
                    />
                  ) : (
                    <div className="rounded-lg h-48 w-full bg-gray-200 animate-pulse" />
                  )}

                  <div className="absolute" style={{ top: '18px', left: '60px' }}>
                    <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-transparent shadow-lg">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  </div>
{/* 
                  <div className="absolute top-32 right-3 bg-transparent text-white text-sm px-4 py-1 rounded-full font-semibold shadow border border-white">
                    {card.price}
                  </div> */}

                  <h3 className="font-semibold text-gray-800 mt-3 text-left">
                    {card.title}
                  </h3>
                  <p className="text-gray-500 text-xs text-left">{card.items}</p>

                  <div
                    className={`absolute bottom-3 right-3 bg-green-900 hover:bg-green-800  text-white p-2 rounded-full shadow-lg pointer-events-none`}
                  >
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

                  {index === 0 && (
                    <div className="absolute left-8 -bottom-16 flex gap-3">
                      <button
                        onClick={(e)=>{ e.stopPropagation(); handlePrev(); }}
                        disabled={!canPrev}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-green-900 hover:bg-green-800 transition ${
                          !canPrev ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <svg
                          className="w-5 h-5 rotate-180 transition-colors hover:text-gray-900"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e)=>{ e.stopPropagation(); handleNext(); }}
                        disabled={!canNext}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white bg-yellow-500 hover:bg-yellow-600 transition ${
                          !canNext ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <svg
                          className="w-5 h-5 transition-colors hover:text-gray-900"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
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
