"use client";

import React, { useEffect, useState } from "react";
import HeaderFile from "../../components/Header";
import { useParams } from "next/navigation";
import axios from "axios";

const headerData = {
  title: "Lead Details",
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Lead Details", href: "/lead-details" },
  ],
};

export default function LeadDetails() {
  const params = useParams();
  const id = params.id;
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sameLeads, setSameLeads] = useState([]);
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
      let items: any[] = [];
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

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        loading...
      </div>
    );
  }

function getDaysAgo(dateString: string): string {
  const createdDate = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - createdDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}


  return (
    <div className="min-h-screen">
      <HeaderFile data={headerData} />
      <div className="py-10 flex justify-center">
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={lead?.brokerImage || "/images/user-2.jpeg"} // bind API image
                    alt="Lead"
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
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
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                      {lead.customerName}
                    </h1>
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                      {lead?.status || "Hot Lead"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {lead?.qualification || "-"} · Added{" "}
                    {lead?.addedAgo || "3 days ago"}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">
                      Priority: {lead?.priority || "High"}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      Last Contact: {lead?.lastContact || "2 hours ago"}
                    </span>
                  </div>
                </div>
              </div>
              {/* <div className="flex gap-2">
                ...buttons here...
              </div> */}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left */}
            <section className="md:col-span-8 space-y-6">
              {/* Lead Overview (all details combined) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-0.5 w-8 rounded bg-yellow-400"></span>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Lead Overview
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      {lead?.status || "Active"}
                    </span>
                    {/* <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
                      Follow-up Due
                    </span> */}
                  </div>
                </div>

                {/* Summary chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-800 text-xs font-medium flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {lead?.customerName}
                  </span>
                  <span className="px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                    {lead.requirement || "Buy"}
                  </span>
                  <span className="px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-800 text-xs font-medium flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  {lead?.createdAt ? getDaysAgo(lead.createdAt) : "N/A"}
                  </span>
                </div>

                {/* Contact grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 8l7.89 4.26a2 2 0 0 0 2.22 0L21 8" />
                        <path d="M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                      </svg>
                    </span>
                    <div>
                      <div className="text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">
                        {lead?.customerEmail}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M22 16.92V21a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 12 19.79 19.79 0 0 1 0 3.18 2 2 0 0 1 2 1h4.09a2 2 0 0 1 2 1.72c.12.9.3 1.78.54 2.63a2 2 0 0 1-.45 2.11L7 8a16 16 0 0 0 6 6l.54-.62a2 2 0 0 1 2.11-.45c.85.24 1.73.42 2.63.54A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <div>
                      <div className="text-gray-500">Phone</div>
                      <div className="font-medium text-gray-900">
                        {lead.customerPhone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z" />
                        <path d="M4 22a8 8 0 1 1 16 0" />
                      </svg>
                    </span>
                    <div>
                      <div className="text-gray-500">WhatsApp Number</div>
                      <div className="font-medium text-gray-900">
                        {lead?.customerPhone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10 2l2 4 4 .5-3 3 .7 4.5L10 12l-3.7 2 0-4.5-3-3L7.9 6.5 10 2z" />
                      </svg>
                    </span>
                    <div>
                      <div className="text-gray-500">Lead Source</div>
                      <div className="font-medium text-gray-900">
                        {lead?.source || "Google Ads"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Requirements Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                    <h3 className="text-base font-semibold text-gray-900">
                      Requirements
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    {/* Property Type */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline points="9,22 9,12 15,12 15,22" />
                          </svg>
                        </span>
                        <div className="flex-1">
                          <div className="text-gray-500 mb-1">
                            Property Type
                          </div>
                          <div className="font-medium text-gray-900">
                            {lead?.propertyType}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {lead?.propertyCategory}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                          </svg>
                        </span>
                        <div className="flex-1">
                          <div className="text-gray-500 mb-1">Budget Range</div>
                          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1.5 text-sm font-semibold">
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="12" y1="1" x2="12" y2="23" />
                              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </svg>
                            {lead?.budget}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {lead?.budgetNegotiable ? "Negotiable" : ""}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferred Locations */}
                    <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="10" r="3" />
                            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
                          </svg>
                        </span>

                        <div className="flex-1">
                          <div className="text-gray-500 mb-2">
                            Preferred Locations
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              lead.primaryRegion?.name,
                              lead.secondaryRegion?.name,
                            ].map((region, index) => (
                              <span
                                key={index}
                                className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1 shadow-sm"
                              >
                                {region && region !== "-" && (
                                  <svg
                                    className="w-3 h-3"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <circle cx="12" cy="10" r="3" />
                                    <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z" />
                                  </svg>
                                )}
                                {region || "-"}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                    <h3 className="text-base font-semibold text-gray-900">
                      Notes
                    </h3>
                    <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                      Important
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-amber-100">
                    <p className="text-sm text-gray-700 leading-6">
                      {lead?.notes ||
                        "Looking for a modern apartment with good connectivity and schools nearby. Prefers higher floors and east-facing."}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {lead?.noteAddedAgo || "2 hours ago"}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        {lead?.noteAddedBy || "Sarah Johnson"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Right */}
            <aside className="md:col-span-4 space-y-6">
              {/* Similar Leads */}
              <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Similar Leads
                  </h3>
                </div>
                <div className="divide-y divide-gray-100 text-sm">
                  {sameLeads.length === 0 ? (
                    <p className="text-gray-500 py-3">
                      No similar leads found.
                    </p>
                  ) : (
                    sameLeads
                      // ✅ exclude the current lead from similar list
                      .filter((s) => s._id !== lead._id)
                      .slice(0, 5) // show only the first 5 leads
                      .map((s) => (
                        <a
                          key={s._id}
                          href={`/lead-details/${s._id}`} // dynamic link
                          className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 transition"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {s.customerName}
                            </div>
                            <div className="text-gray-500">
                              {s.region
                                ? `${s.primaryRegion?.name}, ${s.primaryRegion?.state}`
                                : s.customerEmail}
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-1">
                            {s.budget}
                          </span>
                        </a>
                      ))
                  )}
                </div>
              </div>

              {/* Helpful Info */}
              <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Helpful Info
                  </h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li>Response quickly to increase conversion chances.</li>
                  <li>Verify budget and timeline on first call.</li>
                  <li>Share 3–5 best‑fit properties based on regions.</li>
                  <li>Schedule site visit within 48 hours where possible.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}