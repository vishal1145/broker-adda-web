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
  const id = params?.id as string | undefined;
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sameLeads, setSameLeads] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchLeadById = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("authToken")
          : null;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axios.get(`${apiUrl}/leads/${id}`, { headers });

        const leadData = res.data?.data?.lead || res.data?.lead || res.data?.data || res.data || null;
        setLead(leadData);
      } catch (error) {
        console.error("Error fetching lead:", error);
        setLead(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadById();
  }, [id]);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const token = typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("authToken")
          : null;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await axios.get(`${apiUrl}/leads?limit=10&page=1`, { headers });

        let items: any[] = [];
        if (Array.isArray(res.data?.data?.items)) items = res.data.data.items;
        else if (Array.isArray(res.data?.data?.leads)) items = res.data.data.leads;
        else if (Array.isArray(res.data?.data)) items = res.data.data;
        else if (Array.isArray(res.data?.leads)) items = res.data.leads;
        else if (Array.isArray(res.data)) items = res.data;

        setSameLeads(items);
      } catch (e) {
        console.error("Error fetching similar leads:", e);
        setSameLeads([]);
      }
    };
    fetchSimilar();
  }, []);

  if (!lead || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {loading ? "loading..." : "Lead not found"}
      </div>
    );
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
                    src={lead?.brokerImage || "/images/user-2.jpeg"}
                    alt="Lead"
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{lead?.customerName || "-"}</h1>
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">{lead?.status || "Hot Lead"}</span>
                  </div>
                  <p className="text-sm text-gray-500">{lead?.qualification || "-"} · Added {lead?.addedAgo || "—"}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">Priority: {lead?.priority || "—"}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">Last Contact: {lead?.lastContact || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left */}
            <section className="md:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                    <h3 className="text-base font-semibold text-gray-900">Lead Overview</h3>
                  </div>
                </div>

                {/* Summary chips */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-800 text-xs font-medium flex items-center gap-1">
                    {lead?.customerName}
                  </span>
                  <span className="px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-1">
                    {lead?.requirement || "Buy"}
                  </span>
                  <span className="px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-800 text-xs font-medium flex items-center gap-1">
                    {lead?.addedAgo || "—"}
                  </span>
                </div>

                {/* Contact grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">{lead?.customerEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="text-gray-500">Phone</div>
                      <div className="font-medium text-gray-900">{lead?.customerPhone}</div>
                    </div>
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-gray-500 mb-1">Property Type</div>
                    <div className="font-medium text-gray-900">{lead?.propertyType}</div>
                    <div className="text-xs text-gray-500 mt-1">{lead?.propertyCategory}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-gray-500 mb-1">Budget</div>
                    <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1.5 text-sm font-semibold">
                      {lead?.budget}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{lead?.budgetNegotiable ? "Negotiable" : ""}</div>
                  </div>
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-gray-500 mb-2">Preferred Locations</div>
                    <div className="flex flex-wrap gap-2">
                      {[lead?.primaryRegion?.name, lead?.secondaryRegion?.name].filter(Boolean).map((r: string) => (
                        <span key={r} className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 text-xs font-medium shadow-sm">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Right */}
            <aside className="md:col-span-4 space-y-6">
              <div className="rounded-2xl border border-gray-200 p-5 shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block h-0.5 w-6 rounded bg-yellow-400"></span>
                  <h3 className="text-sm font-semibold text-gray-900">Similar Leads</h3>
                </div>
                <div className="divide-y divide-gray-100 text-sm">
                  {sameLeads.length === 0 ? (
                    <p className="text-gray-500 py-3">No similar leads found.</p>
                  ) : (
                    sameLeads.slice(0, 5).map((s) => (
                      <a key={s._id || s.id} href={`/lead-details/${s._id || s.id}`} className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 transition">
                        <div>
                          <div className="font-medium text-gray-900">{s.customerName || s.requirement || "Lead"}</div>
                          <div className="text-gray-500">{s?.region ? `${s.region.city || ""}` : s.customerEmail}</div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-1">{s.budget || "-"}</span>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
