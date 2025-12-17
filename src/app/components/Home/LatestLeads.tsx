"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios"; // ✅ Added axios import
import { useAuth } from "../../contexts/AuthContext";

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
    {/* Manually placed circles for a scattered look */}
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
    {/* More dots for a denser scatter */}
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

type LeadStatus = "New" | "In Progress" | "On Hold" | "Closed" | string;

interface Transfer {
  toBroker?: string | { _id: string; name?: string; email?: string };
}

interface ApiLead {
  _id: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  requirement?: string;
  propertyType?: string;
  budget?: number | string;
  primaryRegion?: string;
  secondaryRegion?: string;
  status?: LeadStatus;
  transfers?: Transfer[];
  createdAt?: string;
}

// Hardcoded demo leads (moved outside component to prevent re-creation)
// Removed sampleLeads fetching, now using API

const LatestLeads: React.FC = () => {
  const router = useRouter();
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [path, setPath] = useState('');
  const { brokerDetails } = useAuth() as {
    user?: { userId?: string; token?: string; role?: string } | null;
    brokerDetails?: unknown;
  };
  useEffect(() => {
    setPath(window.location.pathname);
    // Fetch data from API
    const fetchLeads = async () => {
      setLoading(true);
      try {
        // Get token from local storage
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || localStorage.getItem("authToken")
            : null;
        // Use environment variable for API URL (same pattern as other components)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        
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

        // If no broker coordinates, try to get current location (only if broker is NOT logged in)
        if ((!latitude || !longitude) && !currentBrokerId) {
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
        
        // Prepare headers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        // Only add Authorization header if token exists
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Build API URL with location filter if coordinates are available
        let apiUrlWithParams = `${apiUrl}/leads?verificationStatus=Verified`;
        if (latitude && longitude) {
          apiUrlWithParams += `&latitude=${latitude}&longitude=${longitude}`;
        } else {
        }
        
        // Add limit to fetch more leads (increase from default 9)
        apiUrlWithParams += `&limit=100`;

        const res = await axios.get(apiUrlWithParams, { headers });
        // Handle different response structures
        let items = [];
        if (Array.isArray(res.data?.data?.items)) {
          items = res.data.data.items;
        } else if (Array.isArray(res.data?.data?.leads)) {
          items = res.data.data.leads;
        } else if (Array.isArray(res.data?.data)) {
          items = res.data.data;
        } else if (Array.isArray(res.data?.leads)) {
          items = res.data.leads;
        } else if (Array.isArray(res.data)) {
          items = res.data;
        }

        // Debug: Log all leads and current broker/user IDs
       

        // Filter out leads belonging to the logged-in broker
        const filteredItems = (currentBrokerId || currentUserId)
          ? items.filter((lead: ApiLead & { createdBy?: unknown }) => {
              // Extract broker ID from createdBy field
              let leadBrokerId = '';
              let leadUserId = '';
              const createdBy = lead.createdBy;
              
              if (createdBy) {
                if (typeof createdBy === 'string') {
                  leadBrokerId = createdBy;
                  leadUserId = createdBy;
                } else if (typeof createdBy === 'object' && createdBy !== null) {
                  const obj = createdBy as { [key: string]: unknown };
                  const userId = obj['userId'];
                  
                  if (userId && typeof userId === 'object' && userId !== null) {
                    const userIdObj = userId as { [key: string]: unknown };
                    const uid = userIdObj['_id'] || userIdObj['id'];
                    if (uid) {
                      leadBrokerId = String(uid);
                      leadUserId = String(uid);
                    }
                  }
                  if (!leadBrokerId && userId && typeof userId === 'string') {
                    leadBrokerId = userId;
                    leadUserId = userId;
                  }
                  if (!leadBrokerId) {
                    const candidates = [
                      obj['_id'],
                      obj['id'],
                      obj['brokerId'],
                      obj['brokerDetailId'],
                      obj['brokerDetailsId']
                    ];
                    for (const candidate of candidates) {
                      if (candidate) {
                        leadBrokerId = String(candidate);
                        leadUserId = String(candidate);
                        break;
                      }
                    }
                  }
                }
              }
              
              // Convert all to strings for comparison
              const brokerIdStr = String(currentBrokerId || '').trim();
              const userIdStr = String(currentUserId || '').trim();
              const leadBrokerIdStr = String(leadBrokerId).trim();
              const leadUserIdStr = String(leadUserId).trim();
              
              // Check if lead belongs to logged-in broker (match either brokerId or userId)
              const matchesBrokerId = brokerIdStr !== '' && leadBrokerIdStr === brokerIdStr;
              const matchesUserId = userIdStr !== '' && (leadBrokerIdStr === userIdStr || leadUserIdStr === userIdStr);
              const shouldFilter = matchesBrokerId || matchesUserId;
              
              // Only show leads that don't belong to the logged-in broker
              // Also show if leadBrokerId is empty (might be admin-created)
              const shouldShow = !shouldFilter;
              
            
              
              return shouldShow;
            })
          : items;

                  
        // Helper function to extract distance (in km)
        const getDistance = (lead: ApiLead & { distanceKm?: number; distance?: number }): number => {
          const distance = lead.distanceKm ?? lead.distance;
          return Number.isFinite(Number(distance)) ? Number(distance) : Infinity; // Use Infinity if no distance (will sort last)
        };

        // Sort leads by distance only (ascending - closest first)
        const sorted = [...filteredItems].sort((a, b) => {
          const distanceA = getDistance(a);
          const distanceB = getDistance(b);
          return distanceA - distanceB; // Ascending order (closest first)
        });
        setLeads(sorted);
      } catch {
        setLeads([]); // fallback to empty
      }
      setLoading(false);
    };

    fetchLeads();
  }, [brokerDetails]);
  // Keep for potential future UI use; disable lint for now as it's not used
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const statusClass = (s?: LeadStatus) =>
    ((
      {
        New: "bg-emerald-50 text-emerald-700",
        "In Progress": "bg-amber-50 text-amber-700",
        "On Hold": "bg-gray-100 text-gray-700",
        Closed: "bg-rose-50 text-rose-700",
      } as Record<string, string>
    )[s || ""] || "bg-gray-100 text-gray-700");
  // reqClass removed - not used
  const regionName = (region: { name?: string } | string | undefined) => {
    if (!region) return "";
    const str = typeof region === "string" ? region : region.name || "";
    return str
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase())
      .replace(/Ncr\b/i, "NCR");
  };
  const ago = (d?: string) => {
    const t = d ? new Date(d).getTime() : NaN;
    if (!t) return "";
    const s = Math.floor((Date.now() - t) / 1000);
    const units: [number, string][] = [
      [31536000, "y"],
      [2592000, "mo"],
      [604800, "w"],
      [86400, "d"],
      [3600, "h"],
      [60, "m"],
    ];
    for (const [sec, label] of units) {
      if (s >= sec) return Math.floor(s / sec) + label + " ago";
    }
    return s + "s ago";
  };

  /* ───────────── Budget formatting helper ───────────── */
  const formatBudget = (budget: number | string | undefined): string => {
    if (!budget && budget !== 0) return "—";
    
    const num = typeof budget === "number" ? budget : Number(String(budget).replace(/[^0-9.]/g, ""));
    if (isNaN(num) || num === 0) return "—";
    
    // 1 Crore = 1,00,00,000
    if (num >= 10000000) {
      const crores = num / 10000000;
      return `₹${crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2)} Cr`;
    }
    // 1 Lakh = 1,00,000
    else if (num >= 100000) {
      const lakhs = num / 100000;
      return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2)} Lakh`;
    }
    // 1 Thousand = 1,000
    else if (num >= 1000) {
      const thousands = num / 1000;
      return `₹${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(2)}K`;
    }
    // Less than 1000
    else {
      return `₹${num.toLocaleString('en-IN')}`;
    }
  };

  return (
    <section id="latest-leads" className="relative py-4 md:py-16 ">
      <div className="w-full mx-auto px-4 ">
        {/* Header removed; moved into left column */}

        {/* Left intro + Right cards (follow reference design) */}
        {loading ? (
          <div id="latest-leads-skeleton" className="grid gap-8 md:grid-cols-3">
            <div className="space-y-4">
              <div className="h-6 w-40 bg-gray-200 rounded"></div>
              <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
              <div className="h-9 w-40 bg-gray-200 rounded-full"></div>
            </div>
            <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="mt-4 h-5 w-2/3 bg-gray-200 rounded"></div>
              <div className="mt-2 h-4 w-1/2 bg-gray-200 rounded"></div>
              <div className="mt-4 h-8 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5"></div>
          </div>
        ) : leads.length === 0 ? (
          <div id="latest-leads-empty" className="mt-12 text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-700">
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path name="M3 7h18M3 12h18M3 17h18" />
              </svg>
            </div>
            <h3 className="mt-3 text-base font-semibold text-gray-900">
              No recent enquiries
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              New enquiries will appear here as they arrive.
            </p>
          </div>
        ) : (
          <div
            id="latest-leads-grid"
            className="grid gap-4 md:gap-6 md:grid-cols-12 items-start"
          >
            {/* Left 6-col content */}
            <div className="md:col-span-6 space-y-4 md:space-y-6 bg-gray-50 p-4 md:p-8 rounded-2xl relative overflow-hidden w-full">
              {/* Dots - top right - hidden on mobile */}
              <div className="hidden md:block absolute right-20 top-0">
                <Dots />
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-gray-700">
                <span className="inline-block h-0.5 w-4 md:w-6 rounded bg-yellow-400"></span>
                <span>Recent</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-gray-900">
                <span className="">Latest</span>
                <span className="pl-2 text-green-900">Enquiries</span>
              </h2>
              <p className="text-xs md:text-sm lg:text-base text-gray-600">
                Explore the latest property requirements posted by verified
                brokers to stay ahead, connect instantly, and turn new
                opportunities into closed deals.
              </p>
              <Link
                href="/search?tab=leads"
                className="inline-flex items-center gap-2 rounded-full bg-green-900 px-4 md:px-5 py-1.5 md:py-2 text-white text-xs md:text-sm font-semibold shadow-sm w-max"
              >
                View All Enquiries
                <svg
                  className="h-3 w-3 md:h-4 md:w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="md:col-span-6 grid gap-4 md:gap-6 h-full md:grid-cols-2 self-start cursor-pointer w-full">
              {leads.slice(0, 2).map((lead) => {
                // Extract broker ID and broker object from lead.createdBy
                let brokerId: string | null = null;
                let broker: { _id?: string; id?: string; [key: string]: unknown } | null = null;
                const createdBy = (lead as unknown as { createdBy?: unknown })?.createdBy;
                
                // Check if createdBy is admin
                let isAdmin = false;
                if (createdBy) {
                  if (typeof createdBy === 'object' && createdBy !== null) {
                    const obj = createdBy as { [key: string]: unknown };
                    const userId = obj['userId'];
                    let role = '';
                    
                    if (userId && typeof userId === 'object' && userId !== null) {
                      const userIdObj = userId as { [key: string]: unknown };
                      role = (userIdObj['role'] as string) || '';
                    }
                    role = role || (obj['role'] as string) || '';
                    const roleLower = role ? role.toLowerCase() : '';
                    const name = (obj['name'] as string) || (obj['fullName'] as string) || (obj['email'] as string) || "";
                    
                    isAdmin = 
                      roleLower === 'admin' || 
                      obj['isAdmin'] === true ||
                      obj['isAdmin'] === 'true' ||
                      ((obj['userType'] as string) || '').toLowerCase() === 'admin' ||
                      ((obj['type'] as string) || '').toLowerCase() === 'admin' ||
                      (name.toLowerCase().includes('admin') && !obj['brokerImage'] && !obj['profileImage']) ||
                      (((obj['email'] as string) || '').toLowerCase().includes('admin'));
                  }
                }
                
                // Also check if lead itself indicates admin creation
                if (!isAdmin) {
                  const leadObj = lead as unknown as { [key: string]: unknown };
                  const verificationStatus = leadObj['verificationStatus'] as string;
                  if (verificationStatus === 'Verified' || verificationStatus === 'verified') {
                    isAdmin = 
                      leadObj['adminCreatedBy'] !== undefined ||
                      leadObj['createdByAdmin'] === true ||
                      leadObj['verifiedByAdmin'] === true ||
                      (!createdBy && verificationStatus === 'Verified'); // If verified but no createdBy, likely admin-created
                  }
                }
                
                if (createdBy && !isAdmin) {
                  if (typeof createdBy === 'string') {
                    brokerId = createdBy;
                    broker = { _id: createdBy, id: createdBy };
                  } else if (typeof createdBy === 'object' && createdBy !== null) {
                    const obj = createdBy as { [key: string]: unknown };
                    broker = obj as { _id?: string; id?: string; [key: string]: unknown };
                    const userId = obj['userId'];
                    if (userId && typeof userId === 'object' && userId !== null) {
                      const userIdObj = userId as { [key: string]: unknown };
                      const uid = userIdObj['_id'] || userIdObj['id'];
                      if (uid) brokerId = String(uid);
                    }
                    if (!brokerId && userId && typeof userId === 'string') {
                      brokerId = userId;
                    }
                    if (!brokerId) {
                      const candidates = [
                        obj['_id'],
                        obj['id'],
                        obj['brokerId'],
                        obj['brokerDetailId'],
                        obj['brokerDetailsId']
                      ];
                      for (const candidate of candidates) {
                        if (candidate) {
                          brokerId = String(candidate);
                          break;
                        }
                      }
                    }
                  }
                }

                return (
                <Link
                  key={lead._id}
                  href={`/lead-details/${lead._id}`}
                  className="cursor-pointer align-middle w-full"
                  aria-label="Open lead details"
                >

                  <article
                    className="group h-full relative rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-lg w-full"
                  >
                    <div className="p-4 md:p-6">
                      {/* Top Section - Main Title */}
                      <div className="mb-3 md:mb-4">
                        <h3 className="text-base md:text-[18px] leading-[20px] font-semibold mb-2" style={{ color: '#323743' }}>
                          {lead.propertyType || "Property"} for {lead.requirement || "inquiry"}
                        </h3>
                        
                        {/* Tags and Time */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                            <span className="inline-flex items-center justify-center rounded-full h-[20px] md:h-[22px] px-2 md:p-[10px] whitespace-nowrap" style={{ fontFamily: 'Inter', fontSize: '11px', lineHeight: '20px', fontWeight: '600', background: '#0D542B', color: '#FFFFFF' }}>
                              {lead.requirement || ""}
                            </span>
                            <span className="inline-flex items-center justify-center rounded-full h-[20px] md:h-[22px] px-2 md:p-[10px] whitespace-nowrap" style={{ fontFamily: 'Inter', fontSize: '11px', lineHeight: '20px', fontWeight: '600', background: '#FDC700', color: '#1b1d20ff' }}>
                              {lead.propertyType || ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] leading-5 font-normal whitespace-nowrap flex-shrink-0" style={{ color: '#565D6D' }}>
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 6v6l4 2" />
                            </svg>
                            {lead.createdAt ? ago(lead.createdAt) : ""}
                          </div>
                        </div>
                      </div>

                      {/* Horizontal Divider */}
                      <div className="border-t border-gray-200 my-3 md:my-4"></div>

                      {/* Middle Section - Property Details */}
                      <div className="space-y-2 md:space-y-3 mb-3 md:mb-4">
                        {/* Primary Location */}
                        <div className="flex items-center gap-2">
  <svg
    className="h-3 w-3 flex-shrink-0 text-[#565D6D]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>

  <div className="flex items-center flex-wrap gap-1">
    <span className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">
      Primary:
    </span>
    <span className="font-inter text-[12px] leading-5 font-normal capitalize text-[#565D6DFF]">
      {regionName(lead.primaryRegion) || "—"}
    </span>
  </div>
</div>


                        {/* Secondary Location */}
                        {lead.secondaryRegion && (
                           <div className="flex items-center gap-2">
  <svg
    className="h-3 w-3 flex-shrink-0 text-[#565D6D]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>

  <div className="flex items-center flex-wrap gap-1">
    <span className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">Secondary:</span>{" "}
    <span className="font-inter text-[12px] leading-5 font-normal capitalize text-[#565D6DFF]">
                                {regionName(lead.secondaryRegion)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Budget */}
                        <div className="flex items-start gap-2">
                          <svg
 className="h-4 w-4 flex-shrink-0 text-[#565D6D]"                            style={{ color: '#565D6D' }}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="8" width="18" height="12" rx="2" />
                            <path d="M3 12h18M9 8v8" />
                          </svg>
                            <div className="flex items-center flex-wrap gap-1">
    <span className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">Budget:</span>{" "}
                            <span className="text-[12px] leading-5 font-normal" style={{ color: '#565D6D' }}>
                              {formatBudget(lead.budget)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section - Broker Profile and Actions */}
                  <div className="pt-3 md:pt-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* Avatar - Show logo if admin, otherwise show broker image */}
       <div
         className="relative w-10 h-10 text-sm font-semibold"
         style={{ color: '#323743' }}
       >
        {isAdmin ? (
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200 relative p-1.5">
            <img
              src="/BROKER_GULLY_FINAL_LOGO_ICON_JPG__1_-removebg-preview.png"
              alt="Broker Gully"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/4 translate-y-1/8"></div>
          </div>
        ) : (() => {
          const createdBy = (lead as unknown as { createdBy?: unknown })?.createdBy as unknown;
          let name = "—";
          let brokerImage: string | undefined;

          if (!createdBy) {
            name = "—";
          } else if (typeof createdBy === "string") {
            name = createdBy;
          } else {
            const obj = createdBy as { [key: string]: unknown };
            name =
              (obj["name"] as string) ||
              (obj["fullName"] as string) ||
              (obj["email"] as string) ||
              "—";
            brokerImage =
              (obj["brokerImage"] as string) ||
              (obj["profileImage"] as string) ||
              (obj["image"] as string);
          }

          if (brokerImage) {
            return (
              <>
                <div className="w-10 h-10 rounded-full bg-[#E5FCE4FF] overflow-hidden">
                  <img
                    src={brokerImage}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                 {/* Green active badge */}
                 <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/4 translate-y-1/8"></div>
              </>
            );
          }

          return (
            <>
              <div className="w-10 h-10 rounded-full bg-[#E5FCE4FF] flex items-center justify-center">
                {name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
               <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/2 translate-y-1/2"></div>
            </>
          );
        })()}
      </div>

      {/* Name and icons */}
      <div className="flex-1 min-w-0">
        {/* If admin, only show chip, no name or chat */}
        {isAdmin ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200">
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-inter text-[10px] leading-4 font-medium text-green-700">Verified by Broker Gully</span>
          </span>
        ) : (
          <>
            <p className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF] truncate">
              {(() => {
                const createdBy = (lead as unknown as { createdBy?: unknown })?.createdBy as unknown;
                if (!createdBy) return "Unknown";
                if (typeof createdBy === "string") return createdBy;
                const obj = createdBy as { [key: string]: unknown };
                return (
                  (obj["name"] as string) ||
                  (obj["fullName"] as string) ||
                  (obj["email"] as string) ||
                  "Unknown"
                );
              })()}
            </p>

            {/* Connect / Chat */}
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  // Check if user is logged in
                  const token = typeof window !== 'undefined' 
                    ? localStorage.getItem("token") || localStorage.getItem("authToken")
                    : null;
                  
                  if (!token) {
                    // Redirect to login if not authenticated
                    router.push(`/login?redirect=${path}`);
                    return;
                  }
                  
                  if (typeof window !== 'undefined') {
                    const win = window as Window & { openChatWithBroker?: (params: { broker: unknown }) => void };
                    if (win.openChatWithBroker && broker) {
                      // Ensure broker has correct status format for chat component
                      const chatBroker = {
                        ...broker,
                        status: 'active', // Lowercase 'active' for chat component to show "Active Now"
                        brokerImage: (broker as { brokerImage?: string; profileImage?: string; image?: string })?.brokerImage || 
                                   (broker as { brokerImage?: string; profileImage?: string; image?: string })?.profileImage || 
                                   (broker as { brokerImage?: string; profileImage?: string; image?: string })?.image,
                        name: (broker as { name?: string; fullName?: string; email?: string })?.name || 
                              (broker as { name?: string; fullName?: string; email?: string })?.fullName || 
                              (broker as { name?: string; fullName?: string; email?: string })?.email || 
                              'Unknown'
                      };
                      win.openChatWithBroker({ broker: chatBroker });
                    }
                  }
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <svg
                  className="w-3 h-3 fill-none stroke-[#3B82F6]"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="font-inter text-[12px] leading-5 font-normal  text-[#3B82F6] hover:text-blue-700 transition-colors">
                  Chat
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>

    {/* View button - Right side (only show if not admin) */}
    {!isAdmin && (
      <div className="flex-shrink-0">
        {brokerId ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              router.push(`/broker-details/${brokerId}`);
            }}
            className="text-[12px] font-normal  text-[#3B82F6] hover:text-blue-700 transition-colors cursor-pointer"
          >
            View
          </span>
        ) : (
          <p className="text-[12px] font-normal text-[#565D6DFF]">View</p>
        )}
      </div>
    )}
  </div>
</div>


                    </div>
                  </article>
                </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestLeads;
