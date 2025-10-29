"use client";

import React, { useEffect, useState } from "react";
import HeaderFile from "../../components/Header";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
// removed unused import

const headerData = {
  title: "Lead Details",
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Lead Details", href: "/lead-details" },
  ],
};

type LeadItem = {
  _id: string;
  customerName?: string;
  primaryRegion?: { _id?: string; name?: string; state?: string; city?: string; description?: string };
  secondaryRegion?: { _id?: string; name?: string; state?: string; city?: string; description?: string };
  budget?: number | string;
  brokerImage?: string;
  addedAgo?: string;
  lastContact?: string;
  notes?: string;
  noteAddedAgo?: string;
  noteAddedBy?: string;
  propertyType?: string;
  requirement?: string;
  createdBy?: {
    _id?: string;
    name?: string;
    firmName?: string;
    brokerImage?: string;
    email?: string;
    phone?: string;
    experience?: number | string;
    licenseNumber?: string;
    specialization?: string;
    city?: string;
    state?: string;
  };
};

export default function LeadDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [lead, setLead] = useState<LeadItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [sameLeads, setSameLeads] = useState<LeadItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  useEffect(() => {
    if (!id) return;

    const fetchLeadById = async () => {
      setLoading(true);
      try {
        // Get token safely
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || localStorage.getItem("authToken")
            : null;

        // Prepare headers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Use axios to fetch lead by id
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/leads/${id}`, { headers });

        // Safely get lead data
        const leadData = res.data?.data?.lead || null;
        setLead(leadData);
      } catch (error) {
        console.error("Error fetching lead:", error);
        setLead(null); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchLeadById();
  }, [id]);

  const similarLeads = async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("authToken")
          : null;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.get(`${apiUrl}/leads`, { headers });

      // Handle different response structures
      let items: LeadItem[] = [];
      if (Array.isArray(res.data?.data?.items)) {
        items = res.data.data.items as LeadItem[];
      } else if (Array.isArray(res.data?.data?.leads)) {
        items = res.data.data.leads as LeadItem[];
      } else if (Array.isArray(res.data?.data)) {
        items = res.data.data as LeadItem[];
      } else if (Array.isArray(res.data?.leads)) {
        items = res.data.leads as LeadItem[];
      } else if (Array.isArray(res.data)) {
        items = res.data as LeadItem[];
      }

      // Set state without sorting
      setSameLeads(items);
    } catch (error) {
      console.error("Error fetching similar leads:", error);
      setSameLeads([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    similarLeads();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sameLeads]);

  // Update scroll button states when same leads change
  useEffect(() => {
    const carousel = document.getElementById('similar-leads-horizontal');
    if (carousel) {
      const updateScrollState = () => {
        const { scrollLeft, scrollWidth, clientWidth } = carousel;
        const maxScroll = scrollWidth - clientWidth;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < maxScroll - 10);
      };
      
      // Small delay to ensure DOM is ready
      setTimeout(updateScrollState, 100);
      carousel.addEventListener('scroll', updateScrollState);
      return () => carousel.removeEventListener('scroll', updateScrollState);
    }
  }, [sameLeads]);

  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <CircularProgress />
    </div>
  );
}

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No lead data found.
      </div>
    );
  }


  return (
    <div className="min-h-screen ">
      <HeaderFile data={headerData} />
    
      <div className="py-8">
        <div className="w-full mx-auto">
         
       

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-16">
            {/* Left Content - 8 columns */}
            <section className="lg:col-span-8 space-y-6">
               {/* Top Header - Lead Title and Status */}
          <div className="mb-8">
            <h1 className="text-[20px] font-bold text-gray-900 mb-2">
              {lead.propertyType } 
            </h1>
            <div className="flex items-center gap-4 text-[12px] leading-[20px] font-[400]" style={{ color: '#565D6DFF', fontFamily: 'Inter, sans-serif' }}>
              <span>Active {lead?.addedAgo || "5 days ago"}</span>
              <span className="text-gray-300">|</span>
              <span>Last contact {lead?.lastContact || "2 hours ago"}</span>
            </div>
          </div>
              {/* Requirements Section */}
              <div className="">
                <h2 className="text-[18px] font-semibold text-gray-900 mb-6">Requirements</h2>
                
                <div className="space-y-4">
                  {/* Property Type Card */}
                  <div className="bg-white rounded-[10px] p-4 border border-[#DEE1E6]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-[12px] text-gray-500 mb-1">Property Type</div>
                        <div className="text-[12px] font-medium text-gray-900">{lead?.propertyType || "Residential"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Budget Range Card */}
                  <div className="bg-white rounded-[10px] p-4 border border-[#DEE1E6]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
</svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-[12px] text-gray-500 mb-1">Budget Range</div>
                        <div className="text-[12px] font-medium text-gray-900">
                          ₹{typeof lead?.budget === 'number' ? lead.budget.toLocaleString('en-IN') : lead?.budget || "1,20,15,000"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Locations Card */}
                  <div className="bg-white rounded-[10px] p-4 border border-[#DEE1E6]">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-gray-500 mb-2">Preferred Locations</div>
                        <div className="flex flex-wrap gap-2">
                          {lead?.primaryRegion?.name && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-[12px] font-medium">
                              {lead.primaryRegion.name}
                            </span>
                          )}
                          {lead?.secondaryRegion?.name && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-[12px] font-medium">
                              {lead.secondaryRegion.name}
                            </span>
                          )}
                          {(!lead?.primaryRegion?.name && !lead?.secondaryRegion?.name) && (
                            <>
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-[12px] font-medium">
                                Noida Sector #1
                              </span>
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-[12px] font-medium">
                                Noida Sector #2
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="pb-16">
                <div className="bg-white rounded-[10px] p-5 border border-[#DEE1E6]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[18px] font-semibold text-gray-900">Notes</h3>
                    <span className="px-2.5 py-1 rounded-full bg-yellow-500 text-black text-xs font-medium">
                    Important
                  </span>
                </div>
                  <p className="text-[12px] text-gray-700 leading-6 mb-4">
                    {lead?.notes || "Looking for a modern apartment with good connectivity and schools nearby. Prefers Higher floors and east facing."}
                  </p>
                  <div className="flex items-center gap-5 text-[12px] text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {lead?.noteAddedAgo || "2 hours ago"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {lead?.noteAddedBy || "Rashed Johnson"}
                    </span>
                  </div>
                </div>
              </div>

              
            </section>

            {/* Right Sidebar - 4 columns */}
              <aside className="lg:col-span-4 space-y-6">
                {/* Broker Details Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-[18px] font-semibold text-gray-900 mb-4">Broker Details</h3>
                  
                  {lead?.createdBy ? (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={lead.createdBy.brokerImage || "/images/user-2.jpeg"}
                          alt="Broker"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-[14px]">
                            {lead.createdBy.name || "Yash Gupta"}
                          </h4>
                          <p className="text-[12px] text-gray-500">
                            {lead.createdBy.firmName || "Gupta Properties"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-4 text-sm">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                        <span className="font-semibold text-gray-900 text-[12px]">4.0</span>
                        <span className="text-gray-500 text-[12px]">
                          {typeof lead.createdBy.experience === 'number' ? `${lead.createdBy.experience}+` : lead.createdBy.experience || '11+'} years
                            </span>
                          </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium">
                          Residential Sales
                        </span>
                        <span className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium">
                          Rental Properties
                            </span>
                      </div>
                      <button className="w-full px-4 py-2 border border-green-900 text-green-900 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors">
                        View Profile
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Broker Information</h4>
                      <p className="text-xs text-gray-500">Not available</p>
                    </div>
                  )}
              </div>

                {/* Lead Generation Support Section */}
                <div className="rounded-[12px] bg-green-50  p-6">
                  <h3 className="text-[18px] font-semibold text-gray-900 mb-3">Lead Generation Support</h3>
                  <p className="text-[12px] text-gray-700 mb-6 max-w-md">
                    Join our exclusive broker network and get access to premium lead generation tools
                    and support.
                  </p>

                  <div className="space-y-5 mb-6">
                    {/* Verified Leads */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <img src="/images/lucide-CircleCheckBig-Outlined.svg" alt="Verified" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(700%) hue-rotate(115deg) brightness(95%) contrast(90%)' }} />
                    </div>
                      <div>
                        <div className="text-[14px] font-semibold text-gray-900">Verified Leads</div>
                        <div className="text-[12px] text-gray-600">Pre-qualified properties ready to buy</div>
                      </div>
                    </div>

                    {/* Exclusive Training */}
                    <div className="flex items-start gap-3">
                     <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <img src="/images/lucide-GraduationCap-Outlined.svg" alt="Training" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(700%) hue-rotate(115deg) brightness(95%) contrast(90%)' }} />
                    </div>
                      <div>
                        <div className="text-[14px] font-semibold text-gray-900">Exclusive Training</div>
                        <div className="text-[12px] text-gray-600">Advanced sales techniques & higher commissions</div>
                      </div>
                    </div>

                    {/* Higher Commissions */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <img src="/images/lucide-DollarSign-Outlined.svg" alt="Commissions" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(700%) hue-rotate(115deg) brightness(95%) contrast(90%)' }} />
                    </div>
                      <div>
                        <div className="text-[14px] font-semibold text-gray-900">Higher Commissions</div>
                        <div className="text-[12px] text-gray-600">Up to 10% more than standard rates</div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full px-4 py-3 bg-green-900 hover:bg-green-900 text-white rounded-lg font-semibold text-sm transition-colors">
                    Join Our Network
                  </button>
                </div>
            </aside>
          </div>
{/* Similar Leads Section */}
              <div className="pb-16">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[18px] font-semibold text-gray-900">Similar Leads</h3>
                  <a 
                    href="/search?tab=leads" 
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/search?tab=leads');
                    }}
                    className="text-[12px] text-green-900 font-medium cursor-pointer hover:underline"
                  >
                    View All
                  </a>
                </div>
                {sameLeads && sameLeads.filter((s) => s._id !== lead._id).length > 0 ? (
                  <div className="relative">
                    <div 
                      id="similar-leads-horizontal" 
                      className="overflow-x-auto scroll-smooth" 
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      onScroll={(e) => {
                        const carousel = e.currentTarget;
                        const { scrollLeft, scrollWidth, clientWidth } = carousel;
                        const maxScroll = scrollWidth - clientWidth;
                        setCanScrollLeft(scrollLeft > 10);
                        setCanScrollRight(scrollLeft < maxScroll - 10);
                      }}
                    >
                      <div className="flex gap-4 min-w-0 pb-2">
                        {sameLeads
                          .filter((s) => s._id !== lead._id)
                          .map((s) => (
                            <a
                              key={s._id}
                              href={`/lead-details/${s._id}`}
                              className="flex-shrink-0 basis-full sm:basis-1/2 lg:basis-1/4 block group h-full relative rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                            >
                              <div className="p-6">
                                {/* Top Section - Main Title */}
                                <div className="mb-4">
                                  <h3 className="text-[14px] leading-[20px] font-bold mb-2" style={{ color: '#323743' }}>
                                    {s.propertyType || "Property"} for {s.requirement || "inquiry"}
                                  </h3>
                                  
                                  {/* Tags and Time */}
                                  <div className="flex items-center justify-between gap-2 flex-nowrap">
                                    <div className="flex items-center gap-2 flex-nowrap">
                                      <span className="inline-flex items-center justify-center rounded-full h-[18px] px-[4px] whitespace-nowrap" style={{ fontFamily: 'Inter', fontSize: '11px', lineHeight: '16px', fontWeight: '600', background: '#0D542B', color: '#FFFFFF' }}>
                                        {s.requirement || ""}
                                      </span>
                                      <span className="inline-flex items-center justify-center rounded-full h-[18px] px-[4px] whitespace-nowrap" style={{ fontFamily: 'Inter', fontSize: '11px', lineHeight: '16px', fontWeight: '600', background: '#FDC700', color: '#1b1d20ff' }}>
                                        {s.propertyType || ""}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[12px] leading-5 font-normal whitespace-nowrap flex-shrink-0" style={{ color: '#565D6D' }}>
                                      <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      >
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" />
                                      </svg>
                                      {s.addedAgo || "2h ago"}
                                    </div>
                                  </div>
                                </div>

                                {/* Horizontal Divider */}
                                <div className="border-t border-gray-200 my-4"></div>

                                {/* Middle Section - Property Details */}
                                <div className="space-y-3 mb-4">
                                  {/* Preferred Location */}
                                  {s.primaryRegion?.name && (
                                    <div className="flex items-center gap-2">
                                      <svg
                                        className="h-4 w-4 flex-shrink-0 text-[#565D6D]"
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
                                          Preferred:
                                        </span>
                                        <span className="font-inter text-[12px] leading-5 font-normal capitalize text-[#565D6DFF]">
                                          {s.primaryRegion.name || "—"}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Secondary Location */}
                                  {s.secondaryRegion?.name && (
                                    <div className="flex items-center gap-2">
                                      <svg
                                        className="h-4 w-4 flex-shrink-0 text-[#565D6D]"
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
                                          {s.secondaryRegion.name}
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Budget */}
                                  <div className="flex items-start gap-2">
                                    <svg
                                      className="h-4 w-4 flex-shrink-0 text-[#565D6D]"
                                      style={{ color: '#565D6D' }}
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
                                        {typeof s.budget === "number"
                                          ? "₹" + s.budget.toLocaleString('en-IN')
                                          : s.budget || "—"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Bottom Section - Broker Profile and Actions */}
                                {s.createdBy && (
                                  <div className="pt-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {s.createdBy.brokerImage ? (
                                          <div className="w-12 h-12 rounded-full bg-[#E5FCE4FF] overflow-hidden relative">
                                            <img
                                              src={s.createdBy.brokerImage}
                                              alt={s.createdBy.name || ""}
                                              className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/4 translate-y-1/8"></div>
                                          </div>
                                        ) : (
                                          <div className="w-12 h-12 rounded-full bg-[#E5FCE4FF] flex items-center justify-center relative">
                                            <span className="text-sm font-semibold" style={{ color: '#323743' }}>
                                              {((s.createdBy.name || "").split(' ').map((n) => n[0]).slice(0, 2).join('') || "—").toUpperCase()}
                                            </span>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/2 translate-y-1/2"></div>
                                          </div>
                                        )}

                                        <div>
                                          <p className="font-inter text-[12px] leading-5 font-medium text-[#171A1FFF]">
                                            {s.createdBy.name || "Unknown"}
                                          </p>

                                          {/* Connect / Chat */}
                                          <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-2">
                                              <svg
                                                className="w-5 h-5 fill-none stroke-[#171A1FFF]"
                                                viewBox="0 0 24 24"
                                                strokeWidth="2"
                                              >
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                              </svg>
                                              <span className="font-inter text-xs leading-5 font-normal text-[#565D6DFF]">
                                                Connect
                                              </span>
                                            </span>

                                            <span className="flex items-center gap-2">
                                              <svg
                                                className="w-5 h-5 fill-none stroke-[#171A1FFF]"
                                                viewBox="0 0 24 24"
                                                strokeWidth="2"
                                              >
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                              </svg>
                                              <span className="font-inter text-xs leading-5 font-normal text-[#565D6DFF]">
                                                Chat
                                              </span>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </a>
                          ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2 mt-4 justify-center">
                      <button 
                        type="button"
                        onClick={() => {
                          const c = document.getElementById('similar-leads-horizontal');
                          if (c && canScrollLeft) c.scrollBy({ left: -320, behavior: 'smooth' });
                        }}
                        disabled={!canScrollLeft}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          canScrollLeft 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Previous"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          const c = document.getElementById('similar-leads-horizontal');
                          if (c && canScrollRight) c.scrollBy({ left: 320, behavior: 'smooth' });
                        }}
                        disabled={!canScrollRight}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          canScrollRight 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        title="Next"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-[10px] p-12 border border-[#DEE1E6] text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p className="text-base font-semibold text-gray-900 mb-2">No similar leads found</p>
                    <p className="text-sm text-gray-600">We couldn &apos;t find any leads with similar requirements.</p>
                  </div>
                )}
              </div>
          {/* Footer Section */}
          <div className="rounded-xl p-6 sm:p-7 lg:p-8 bg-[#FFF8E6] border border-yellow-100 pb-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="text-[12px] text-gray-600 mb-2">Funded by 1000+ Brokers</div>
                <h2 className="text-[18px] font-bold text-gray-900 mb-3">Ready to Find Your Perfect Property?</h2>
                <p className="text-[12px] text-gray-700 leading-6">
                  Join thousands of satisfied customers who found their dream homes through our platform. Get started today and let our expert brokers help you every step of the way.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a 
                  href="/search?type=leads" 
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-yellow-500 text-gray-900 font-medium text-[12px] hover:bg-yellow-600 transition-colors"
                >
                  Discover All Leads
                </a>
                <a 
                  href="/search?type=brokers" 
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-yellow-500 text-yellow-600 font-medium text-[12px] hover:bg-yellow-50 transition-colors"
                >
                  Find Brokers
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
