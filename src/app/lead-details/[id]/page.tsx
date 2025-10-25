"use client";

import React, { useEffect, useState } from "react";
import HeaderFile from "../../components/Header";
import { useParams } from "next/navigation";
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
  primaryRegion?: { name?: string; state?: string };
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
  const id = params.id;
  const [lead, setLead] = useState<LeadItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [sameLeads, setSameLeads] = useState<LeadItem[]>([]);
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
        <div className="w-full mx-auto ">
         

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Content - 8 columns */}
            <section className="lg:col-span-8 space-y-12">
              {/* Lead Header Section */}
              <div className="flex items-center gap-4 ">
              <div className="relative">
                <img
                  src={lead?.brokerImage || "/images/user-2.jpeg"}
                  alt="Lead"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {lead.customerName}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>Active {lead?.addedAgo || "5 days ago"}</span>
                  <span>•</span>
                  <span>Last contact {lead?.lastContact || "2 hours ago"}</span>
                </div>
              </div>
            </div>
            
              {/* Requirements Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property Type */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Property Type</div>
                        <div className="font-medium text-gray-900">{lead?.propertyType || "Residential"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Budget Range</div>
                        <div className="font-medium text-green-700 text-lg">₹{lead?.budget || "1700000"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Locations */}
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="10" r="3" />
                          <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-2">Preferred Locations</div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-medium">
                            Noida sector 61
                          </span>
                          <span className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-medium">
                            Noida Sector 62
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                  <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                    Important
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 leading-6 mb-3">
                    {lead?.notes || "Looking for a modern apartment with good connectivity and schools nearby. Prefers Higher floors and east facing."}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {lead?.noteAddedAgo || "2 hours ago"}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {lead?.noteAddedBy || "Sarah Johnson"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Sidebar - 4 columns */}
              <aside className="lg:col-span-4 space-y-8">
                {/* Broker Details Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Broker Details</h3>
                  </div>
                  
                  {lead?.createdBy ? (
                    <div className="">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={lead.createdBy.brokerImage || "/images/user-2.jpeg"}
                          alt="Broker"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {lead.createdBy.name || "Broker"}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {lead.createdBy.firmName || "Real Estate Broker"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        {lead.createdBy.experience && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-600">
                              {typeof lead.createdBy.experience === 'number' ? `${lead.createdBy.experience}+` : lead.createdBy.experience} Years Experience
                            </span>
                          </div>
                        )}
                        {lead.createdBy.phone && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="text-gray-600">{lead.createdBy.phone}</span>
                          </div>
                        )}
                        {lead.createdBy.email && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-600 truncate">{lead.createdBy.email}</span>
                          </div>
                        )}
                        {(lead.createdBy.city || lead.createdBy.state) && (
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-600">
                              {[lead.createdBy.city, lead.createdBy.state].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Broker Information</h4>
                        <p className="text-xs text-gray-600">Not available</p>
                      </div>
                    </div>
                  )}
                </div>
              {/* Quick Contact */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Contact</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium">
                    Send Message
                  </button>
                  <a href="#join-network" className="w-full inline-flex items-center justify-center px-4 py-2 border border-green-600 text-green-700 hover:bg-green-50 rounded-lg text-sm font-medium">
                    Join Our Network
                  </a>
                  {/* <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium line-through opacity-50" disabled>
                    Schedule Call
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium">
                    Share Profile
                  </button> */}
                </div>
              </div>

              {/* Lead Generation Support */}
              <div className="bg-green-900 rounded-2xl border border-gray-200 shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Lead Generation Support</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-sm">Verified Leads</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-sm">Dedicated Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-sm">Exclusive Training</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-sm">Timely Insights</span>
                  </div>
                </div>
                <button className="w-full mt-6 px-4 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Join Our Network
                </button>
              </div>

              {/* Similar Leads (sidebar) - hidden, replaced by full-width below */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hidden">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-lg font-semibold text-gray-900">Similar Leads</h3>
                </div>
                <div className="space-y-3">
                  {sameLeads.length === 0 ? (
                    <p className="text-gray-500 text-sm">No similar leads found.</p>
                  ) : (
                    sameLeads
                      .filter((s) => s._id !== lead._id)
                      .map((s) => (
                        <a
                          key={s._id}
                          href={`/lead-details/${s._id}`}
                          className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition"
                        >
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {s.customerName}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {s.primaryRegion?.name || "Noida sector 61"}, {s.primaryRegion?.state || "Uttar Pradesh"}
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 text-green-700 px-2 py-1 text-xs font-medium">
                            {s.budget || "129998"}
                          </span>
                        </a>
                      ))
                  )}
                </div>
              </div>
            </aside>
          </div>

        </div>

        {/* Similar Leads - Full Width Carousel */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
              <h3 className="text-lg font-semibold text-gray-900">Similar Leads</h3>
            </div>
            <div className="flex items-center gap-2">
              <a href="/search?type=leads" className="px-3 py-1.5 text-green-900 rounded-lg text-xs font-medium transition-colors">
                View All
              </a>
            </div>
          </div>
          
          {/* Carousel with scrollable cards */}
          <div id="similar-leads-carousel" className="overflow-x-auto scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex gap-6 min-w-0 pb-2">
              {sameLeads && sameLeads.filter((s) => s._id !== lead._id).length === 0 ? (
                // No leads found
                <div className="w-full flex items-center justify-center py-16">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p className="text-xl font-semibold text-gray-900 mb-3">No similar leads found</p>
                    <p className="text-base text-gray-500">We couldn&apos;t find any leads with similar requirements.</p>
                  </div>
                </div>
              ) : (
                sameLeads
                    .filter((s) => s._id !== lead._id)
                  .slice(0, 6)
                    .map((s) => (
                    <div key={s._id} className="flex-shrink-0 w-80 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <img 
                          src={s.brokerImage || "/images/user-2.jpeg"} 
                          alt="Lead" 
                          className="w-12 h-12 rounded-full object-cover" 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 truncate">{s.customerName}</div>
                          <div className="text-sm text-gray-600 truncate">
                            {s.primaryRegion?.name || "Location"}, {s.primaryRegion?.state || "State"}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm font-medium text-green-700">
                              ₹{typeof s.budget === 'number' ? s.budget.toLocaleString() : s.budget || '0'}
                            </span>
                            <span className="text-xs text-gray-500">• {s.propertyType || 'Property'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs border border-blue-200">
                            {s.propertyType || 'Residential'}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs border border-green-200">
                            {s.requirement || 'Buy'}
                        </span>
                        </div>
                      </div>
                </div>
                  ))
              )}
            </div>
            <div className="flex gap-2 mt-7 justify-center">
              <button 
                type="button" 
                onClick={() => {
                  const carousel = document.getElementById('similar-leads-carousel');
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
                  const carousel = document.getElementById('similar-leads-carousel');
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

        {/* CTA Section */}
        <div className="bg-white rounded-2xl mx-4 sm:mx-6 lg:mx-8 mb-8 shadow-xl mt-12 border-t-4 border-yellow-500">
          <div className="px-6 py-6 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 "></div>
            <div className="absolute top-3 right-3 w-12 h-12 bg-yellow-100 rounded-full opacity-20"></div>
            <div className="absolute bottom-3 left-3 w-10 h-10 bg-yellow-200 rounded-full opacity-30"></div>
            
            <div className="max-w-2xl mx-auto relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium mb-4">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Trusted by 1000+ Brokers
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Find Your Perfect Property?
              </h2>
              <p className="text-gray-600 text-base mb-6 max-w-xl mx-auto leading-relaxed">
                Join thousands of satisfied customers who found their dream homes through our platform. 
                Get started today and let our expert brokers help you every step of the way.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/search?type=leads" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 text-white font-semibold text-base rounded-lg hover:bg-yellow-600 transition-colors shadow-lg hover:shadow-xl"
                >
                  Browse All Leads
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
                <a 
                  href="/search?type=brokers" 
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-yellow-500 text-yellow-600 font-semibold text-base rounded-lg hover:bg-yellow-50 transition-colors"
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
