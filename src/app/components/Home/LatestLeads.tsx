'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

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

type LeadStatus = 'New' | 'In Progress' | 'On Hold' | 'Closed' | string;

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
const sampleLeads: ApiLead[] = [
    {
      _id: 'ld_001',
      customerName: 'Neha Kapoor',
      customerPhone: '+91 98765 11001',
      customerEmail: 'neha.kapoor@email.com',
      requirement: 'Buy',
      propertyType: 'Residential',
      budget: 9500000,
      primaryRegion: 'delhi-ncr',
      secondaryRegion:'noida',
      status: 'New',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'ld_002',
      customerName: 'Rohan Desai',
      customerPhone: '+91 98765 11002',
      customerEmail: 'rohan.desai@email.com',
      requirement: 'Rent',
      propertyType: 'Commercial',
      budget: '₹1,20,000 / month',
      primaryRegion: 'bengaluru',
      secondaryRegion:'delhi',
      status: 'In Progress',
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'ld_003',
      customerName: 'Aarav Mehta',
      customerPhone: '+91 98765 11003',
      customerEmail: 'aarav.mehta@email.com',
      requirement: 'Buy',
      propertyType: 'Plot',
      budget: 7500000,
      primaryRegion: 'mumbai',
      secondaryRegion: 'navi-mumbai',
      status: 'New',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'ld_004',
      customerName: 'Isha Verma',
      customerPhone: '+91 98765 11004',
      customerEmail: 'isha.verma@email.com',
      requirement: 'Buy',
      propertyType: 'Residential',
      budget: 6200000,
      primaryRegion: 'pune',
      status: 'On Hold',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'ld_005',
      customerName: 'Sneha Nair',
      customerPhone: '+91 98765 11005',
      requirement: 'Sell',
      propertyType: 'Residential',
      budget: 15000000,
      primaryRegion: 'kochi',
      status: 'Closed',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: 'ld_006',
      customerName: 'Vikram Singh',
      customerPhone: '+91 98765 11006',
      requirement: 'Buy',
      propertyType: 'Industrial',
      budget: '₹85,000 / month',
      primaryRegion: 'chennai',
      status: 'New',
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

const LatestLeads: React.FC = () => {
  const [leads, setLeads] = useState<ApiLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Hardcoded data mode
    setLoading(true);
    const sorted = [...sampleLeads].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    setLeads(sorted);
    setLoading(false);
  }, []);

  const INR = useMemo(() => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }), []);
  const statusClass = (s?: LeadStatus) => ({
    New: 'bg-emerald-50 text-emerald-700',
    'In Progress': 'bg-amber-50 text-amber-700',
    'On Hold': 'bg-gray-100 text-gray-700',
    Closed: 'bg-rose-50 text-rose-700',
  } as Record<string, string>)[s || ''] || 'bg-gray-100 text-gray-700';
  const reqClass = (r?: string) => ({
    Buy: 'bg-emerald-50 text-emerald-700',
    Sell: 'bg-sky-50 text-sky-700',
    Rent: 'bg-violet-50 text-violet-700',
  } as Record<string, string>)[r || ''] || 'bg-gray-50 text-gray-700';
  const regionName = (id?: string) => {
    if (!id) return '—';
    // Prefer a global mapping if provided at runtime
    const globalMap = (typeof window !== 'undefined'
      ? (window as unknown as { RegionMap?: Record<string, string> }).RegionMap
      : undefined) || {};
    if (globalMap[id]) return globalMap[id];

    // Fallback: prettify the slug e.g. "delhi-ncr" -> "Delhi NCR"
    const pretty = id
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase())
      .replace(/Ncr\b/i, 'NCR');
    return pretty;
  };
  const ago = (d?: string) => {
    const t = d ? new Date(d).getTime() : NaN;
    if (!t) return '';
    const s = Math.floor((Date.now() - t) / 1000);
    const units: [number, string][] = [[31536000,'y'],[2592000,'mo'],[604800,'w'],[86400,'d'],[3600,'h'],[60,'m']];
    for (const [sec, label] of units) { if (s >= sec) return Math.floor(s/sec) + label + ' ago'; }
    return s + 's ago';
  };

  return (
    <section id="latest-leads" className="relative py-16 ">
      <div className="w-full mx-auto ">
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
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path name="M3 7h18M3 12h18M3 17h18"/></svg>
            </div>
            <h3 className="mt-3 text-base font-semibold text-gray-900">No recent leads</h3>
            <p className="mt-1 text-sm text-gray-600">New enquiries will appear here as they arrive.</p>
          </div>
        ) : (
          <div id="latest-leads-grid" className="grid gap-6 md:grid-cols-12 items-center">
            {/* Left 6-col content */}
            <div className="md:col-span-6 space-y-4 bg-gray-50 p-8 rounded-2xl relative overflow-hidden">
             
              {/* Dots - top right */}
              <div className="absolute right-20 top-0">
                <Dots />
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                <span>Recent</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-gray-900">
                <span className="">Latest</span>
                <span className="pl-2 text-green-900">Leads</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600">Explore the latest property requirements posted by verified brokers to stay ahead, connect instantly, and turn new opportunities into closed deals.</p>
              <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-green-900 px-5 py-2 text-white text-sm font-semibold shadow-sm w-max">
                View All Leads
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="md:col-span-6 grid gap-6 md:grid-cols-2 self-center">
            {leads.slice(0,2).map((lead) => (
              <article key={lead._id} className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-lg">
                <div className="p-5">
                  {/* Top Section - Tags and Icon */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full ${reqClass(lead.requirement)} px-3 py-1.5 text-xs font-medium`}>
                        {lead.requirement || ''}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1.5 text-xs font-medium">
                        {lead.propertyType || ''}
                      </span>
                    </div>
                    <div className="w-5 h-5 text-gray-600">
                      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Middle Section - Location */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 capitalize mb-1">
                      {regionName(lead.primaryRegion)}
                    </h3>
                    {lead.secondaryRegion && (
                      <p className="text-sm text-gray-600 capitalize">
                        {regionName(lead.secondaryRegion)}
                      </p>
                    )}
                  </div>

                  {/* Price Section with Background */}
                  <div className=" rounded-xl py-2 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full bg-green-900 text-white px-3 py-2 font-semibold text-sm">
                        ₹{typeof lead.budget === 'number' ? INR.format(lead.budget).replace('₹', '') : (lead.budget || '—')}
                      </div>
                      {lead.createdAt && (
                        <span className="text-xs text-gray-500">{ago(lead.createdAt)}</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Section - Broker and View Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      posted by <span className="font-medium text-gray-900">Broker Name</span>
                    </div>
                    <Link href="/lead-details" className="inline-flex items-center rounded-full bg-green-900 px-4 py-2 text-white text-sm font-semibold hover:bg-green-800 transition-colors duration-200">
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestLeads;


