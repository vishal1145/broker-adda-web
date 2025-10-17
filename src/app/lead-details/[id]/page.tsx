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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white p-6 mb-8">
            <div className="flex items-center gap-4">
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
            
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Content - 8 columns */}
            <section className="lg:col-span-8 space-y-6">
              {/* Requirements Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
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
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
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
            <aside className="lg:col-span-4 space-y-6">
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

          {/* Similar Leads - Full Width */}
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
              <h3 className="text-lg font-semibold text-gray-900">Similar Leads</h3>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              {sameLeads && sameLeads.filter((s) => s._id !== lead._id).length === 0 ? (
                <p className="text-gray-500 text-sm p-6">No similar leads found.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sameLeads
                    .filter((s) => s._id !== lead._id)
                    .map((s) => (
                      <a
                        key={s._id}
                        href={`/lead-details/${s._id}`}
                        className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50 transition"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {s.customerName}
                          </div>
                          <div className="text-gray-500 text-sm truncate">
                            {s.primaryRegion?.name || "Noida sector 61"}, {s.primaryRegion?.state || "Uttar Pradesh"}
                          </div>
                        </div>
                        <span className="ml-4 inline-flex items-center rounded-full border border-green-200 bg-green-50 text-green-700 px-3 py-1 text-sm font-medium whitespace-nowrap">
                          {s.budget ?? "129998"}
                        </span>
                      </a>
                    ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
