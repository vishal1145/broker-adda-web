"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import HeaderFile from "../components/Header";
import Select, { components as RSComponents } from "react-select";
import ProtectedRoute from "../components/ProtectedRoute";
import siteConfig, { SUPPORT_EMAIL, SUPPORT_PHONE } from "../config/siteConfig";

/* ───────────── Small stat card ───────────── */
const StatCard = ({ label, value, deltaText, trend = "up", color = "sky" }) => {
  const colorStrip = {
    sky: "from-sky-500 to-sky-400",
    amber: "from-amber-500 to-amber-400",
    emerald: "from-emerald-500 to-emerald-400",
    violet: "from-violet-500 to-violet-400",
    indigo: "from-indigo-500 to-indigo-400",
  }[color];

  const trendDown = trend === "down";
  const deltaClass = trendDown ? "text-rose-600" : "text-emerald-600";

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(2,6,23,0.06)] hover:shadow-[0_6px_18px_rgba(2,6,23,0.08)] transition-shadow">
      {/* Left color strip */}
      <div
        className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${colorStrip}`}
      />
      <div className="px-5 py-6">
        <p className="text-xs font-body text-gray-600 font-medium">{label}</p>
        <p className="mt-5 text-3xl leading-none  text-gray-800">{value}</p>
        {/* <p className={`mt-5 flex items-center gap-1.5 text-[12px] font-medium ${deltaClass}`}>
          {trendDown ? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l7-7 7 7" />
            </svg>
          )}
          <span>{deltaText}</span>
        </p> */}
      </div>
    </div>
  );
};

export default function BrokerLeadsPage() {
  /* ───────────── Filters & UI state ───────────── */
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [leadViewMode, setLeadViewMode] = useState("my-leads"); // 'my-leads' or 'transferred'
  const [filters, setFilters] = useState({
    query: "",
    status: { value: "all", label: "All Status" },
    broker: { value: "all", label: "All Brokers" },
    region: { value: "all", label: "All Regions" },
    propertyType: { value: "all", label: "All Property Types" },
    requirement: { value: "all", label: "All Requirements" },
    startDate: "",
    endDate: "",
    budgetMax: 500000,
  });

  /* ───────────── Regions API ───────────── */
  const [regionsList, setRegionsList] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [regionsError, setRegionsError] = useState("");
  // Nearest regions for Add Lead modal (based on logged-in broker)
  const [nearestRegionsList, setNearestRegionsList] = useState([]);
  const [nearestRegionsLoading, setNearestRegionsLoading] = useState(false);
  const [nearestRegionsError, setNearestRegionsError] = useState("");
  const [applyingFilters, setApplyingFilters] = useState(false);
  const isAdvancedFiltersApplied = useMemo(() => {
    return (
      (filters.status?.value && filters.status.value !== "all") ||
      (filters.broker?.value && filters.broker.value !== "all") ||
      (filters.region?.value && filters.region.value !== "all") ||
      (filters.propertyType?.value && filters.propertyType.value !== "all") ||
      (filters.requirement?.value && filters.requirement.value !== "all") ||
      !!filters.startDate ||
      !!filters.endDate ||
      (typeof filters.budgetMax === "number" && filters.budgetMax !== 500000)
    );
  }, [filters]);

  // clearAdvancedFilters is defined later, after pagination and loadLeads are created
  let clearAdvancedFilters = () => {};

  // Auth and API base
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("authToken")
      : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // Get current user ID from token
  const getCurrentUserIdFromToken = (jwtToken) => {
    try {
      if (!jwtToken || typeof window === "undefined") return "";
      const base64Url = jwtToken.split(".")[1];
      if (!base64Url) return "";
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      // no-op
      // Use brokerId if available, otherwise fall back to userId
      return (
        payload.brokerId || payload.userId || payload.id || payload.sub || ""
      );
    } catch {
      return "";
    }
  };
  const currentUserId = useMemo(
    () => getCurrentUserIdFromToken(token),
    [token]
  );

  // State to store the actual broker ID (might be different from token userId)
  const [brokerId, setBrokerId] = useState("");
  const [brokerIdLoading, setBrokerIdLoading] = useState(false);

  // Function to get broker details and extract the correct broker ID
  const getBrokerId = useCallback(async () => {
    if (!currentUserId || !token) {
      // missing auth
      return;
    }

    // No hardcoded mapping. Always resolve via API only.

    try {
      setBrokerIdLoading(true);
      // fetch broker details for user

      // Try the most likely endpoint first
      const res = await fetch(`${apiUrl}/brokers/${currentUserId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // status read

      if (res.ok) {
        const data = await res.json();
        // raw data

        // Try different possible data structures
        const brokerData =
          data?.data?.broker || data?.broker || data?.data || data;
        // processed data

        // Use the broker's _id for filtering leads
        if (brokerData && brokerData._id) {
          setBrokerId(brokerData._id);
          // set broker id
        } else {
          // no id in response
          // Fallback: do not guess. Keep brokerId empty and log for visibility
          // leave brokerId empty
        }
      } else {
        // failed to fetch broker details
        const errorText = await res.text();
        // Do not fallback to userId; keep brokerId empty so queries won't filter wrongly
      }
    } catch (error) {
      // error fetching broker details
      // Do not fallback to userId; keep brokerId empty so queries won't filter wrongly
    } finally {
      setBrokerIdLoading(false);
    }
  }, [currentUserId, token, apiUrl]);

  // Get broker ID when currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      getBrokerId();
    }
  }, [currentUserId, getBrokerId]);

  /* ───────────── Metrics API ───────────── */
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    newLeadsToday: 0,
    convertedLeads: 0,
    avgDealSize: 0,
    transferredToMe: 0,
    transferredByMe: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState("");

  const loadMetrics = useCallback(async () => {
    // Only fetch metrics when brokerId is available to ensure broker-scoped numbers
    if (!brokerId) return;
    try {
      setMetricsLoading(true);
      setMetricsError("");
      const metricsUrl = `${apiUrl}/leads/metrics?createdBy=${brokerId}`;
      const res = await fetch(metricsUrl, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          setMetricsError(
            err?.message || err?.error || "Failed to load metrics"
          );
        } catch {
          setMetricsError("Failed to load metrics");
        }
        return;
      }
      const data = await res.json();
      const payload = data?.data || data || {};
      setMetrics({
        totalLeads: Number(payload.totalLeads || payload.total || 0),
        newLeadsToday: Number(payload.newLeadsToday || payload.today || 0),
        convertedLeads: Number(
          payload.convertedLeads || payload.converted || 0
        ),
        avgDealSize: Number(
          payload.avgDealSize || payload.averageDealSize || 0
        ),
        transferredToMe: Number(
          payload.transferredToMe || payload.transfersToMe || 0
        ),
        transferredByMe: Number(
          payload.transferredByMe || payload.transfersByMe || 0
        ),
      });
    } catch {
      setMetricsError("Error loading metrics");
    } finally {
      setMetricsLoading(false);
    }
  }, [apiUrl, token, brokerId]);
  // Load metrics once brokerId is available
  useEffect(() => {
    if (brokerId) loadMetrics();
  }, [brokerId, loadMetrics]);

  /* ───────────── Leads API ───────────── */
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / (limit || 10)));
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const DEBOUNCE_DELAY = 500; // Configurable debounce delay
  const [viewTab, setViewTab] = useState("overview");
  const [noteText, setNoteText] = useState("");
  useEffect(() => {
    // Show searching indicator when user types (with small delay to avoid flickering)
    const showSearchingTimer = setTimeout(() => {
      if (filters.query !== debouncedQuery) {
        setIsSearching(true);
      }
    }, 100);

    const debounceTimer = setTimeout(() => {
      setDebouncedQuery(filters.query || "");
      setIsSearching(false);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(showSearchingTimer);
      clearTimeout(debounceTimer);
    };
  }, [filters.query, debouncedQuery]);

  const buildRequestUrl = useCallback(
    (
      effectiveFilters,
      p = page,
      l = limit,
      q = debouncedQuery,
      viewMode = leadViewMode
    ) => {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(l));

      // Use different endpoint and parameters for transferred leads
      if (viewMode === "transferred") {
        if (brokerId) {
          params.set("toBroker", brokerId);
        }
        if (q) params.set("search", q);
        if (
          effectiveFilters.status?.value &&
          effectiveFilters.status.value !== "all"
        )
          params.set("status", effectiveFilters.status.value);
        if (
          effectiveFilters.region?.value &&
          effectiveFilters.region.value !== "all"
        )
          params.set("region", effectiveFilters.region.value);
        if (
          effectiveFilters.propertyType?.value &&
          effectiveFilters.propertyType.value !== "all"
        )
          params.set("propertyType", effectiveFilters.propertyType.value);
        if (
          effectiveFilters.requirement?.value &&
          effectiveFilters.requirement.value !== "all"
        )
          params.set("requirement", effectiveFilters.requirement.value);
        if (effectiveFilters.startDate)
          params.set("startDate", effectiveFilters.startDate);
        if (effectiveFilters.endDate)
          params.set("endDate", effectiveFilters.endDate);
        if (
          typeof effectiveFilters.budgetMax === "number" &&
          effectiveFilters.budgetMax !== 500000
        )
          params.set("budgetMax", String(effectiveFilters.budgetMax));
        return `${apiUrl}/leads/transferred?${params.toString()}`;
      }

      // Default behavior for my leads
      if (brokerId) {
        params.set("createdBy", brokerId);
      }
      if (q) params.set("search", q);
      if (
        effectiveFilters.status?.value &&
        effectiveFilters.status.value !== "all"
      )
        params.set("status", effectiveFilters.status.value);
      // Only add broker filter if specifically selected (not 'all')
      if (
        effectiveFilters.broker?.value &&
        effectiveFilters.broker.value !== "all"
      ) {
        params.set("broker", effectiveFilters.broker.value);
      }
      if (
        effectiveFilters.region?.value &&
        effectiveFilters.region.value !== "all"
      )
        params.set("regionId", effectiveFilters.region.value);
      if (
        effectiveFilters.propertyType?.value &&
        effectiveFilters.propertyType.value !== "all"
      )
        params.set("propertyType", effectiveFilters.propertyType.value);
      if (
        effectiveFilters.requirement?.value &&
        effectiveFilters.requirement.value !== "all"
      )
        params.set("requirement", effectiveFilters.requirement.value);
      if (effectiveFilters.startDate)
        params.set("startDate", effectiveFilters.startDate);
      if (effectiveFilters.endDate)
        params.set("endDate", effectiveFilters.endDate);
      if (
        typeof effectiveFilters.budgetMax === "number" &&
        effectiveFilters.budgetMax !== 500000
      )
        params.set("budgetMax", String(effectiveFilters.budgetMax));
      return `${apiUrl}/leads?${params.toString()}`;
    },
    [apiUrl, page, limit, debouncedQuery, brokerId, leadViewMode]
  );

  const loadLeads = useCallback(
    async (
      overrideFilters = null,
      overridePage = null,
      overrideLimit = null,
      overrideQuery = null,
      overrideViewMode = null
    ) => {
      // Don't load leads if we don't have brokerId yet
      if (!brokerId && !brokerIdLoading) return;

      try {
        setLeadsLoading(true);
        setLeadsError("");
        const f = overrideFilters ?? filters;
        const p = overridePage ?? page;
        const l = overrideLimit ?? limit;
        const q = overrideQuery ?? debouncedQuery;
        const v = overrideViewMode ?? leadViewMode;

        const response = await fetch(buildRequestUrl(f, p, l, q, v), {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.ok) {
          const data = await response.json();
          let items = [],
            totalCount = 0;
          if (Array.isArray(data?.data?.items)) {
            items = data.data.items;
            totalCount = data.data.total ?? data.total ?? items.length;
          } else if (Array.isArray(data?.data?.leads)) {
            items = data.data.leads;
            totalCount = data.data.total ?? data.total ?? items.length;
          } else if (Array.isArray(data?.data)) {
            items = data.data;
            totalCount = data.total ?? items.length;
          } else if (Array.isArray(data?.leads)) {
            items = data.leads;
            totalCount = data.total ?? items.length;
          } else if (Array.isArray(data)) {
            items = data;
            totalCount = items.length;
          }
          
          // Filter "Transferred to Me" view: exclude leads created by current broker
          // Include leads with "all", "region", or "individual" transfers (API handles region matching)
          if (v === "transferred") {
            items = items.filter((lead) => {
              // Exclude leads created by the current logged-in broker
              // They should not appear in "Transferred to Me" even if shared with all/region
              const leadCreatorId = 
                (lead?.createdBy?._id || lead?.createdBy?.id || lead?.createdBy)?.toString();
              if (brokerId && leadCreatorId === brokerId.toString()) {
                return false;
              }
              
              // Include leads that have any transfers (all, region, or individual)
              // The API endpoint already filters by toBroker, so region matching is handled there
              const transfers = Array.isArray(lead?.transfers) ? lead.transfers : [];
              return transfers.length > 0;
            });
            // Update total count after filtering
            totalCount = items.length;
          }
          
          setLeads(items);
          setTotal(totalCount);
        } else {
          setLeadsError("Failed to load leads");
          setLeads([]);
          setTotal(0);
        }
      } catch {
        setLeadsError("Error loading leads");
        setLeads([]);
        setTotal(0);
      } finally {
        setLeadsLoading(false);
      }
    },
    [
      filters,
      page,
      limit,
      debouncedQuery,
      token,
      buildRequestUrl,
      brokerId,
      brokerIdLoading,
      leadViewMode,
    ]
  );

  // Now that page/limit/loadLeads exist, define clearAdvancedFilters
  clearAdvancedFilters = () => {
    const reset = {
      ...filters,
      status: { value: "all", label: "All Status" },
      broker: { value: "all", label: "All Brokers" },
      region: { value: "all", label: "All Regions" },
      propertyType: { value: "all", label: "All Property Types" },
      requirement: { value: "all", label: "All Requirements" },
      startDate: "",
      endDate: "",
      budgetMax: 500000,
    };
    setFilters(reset);
    setPage(1);
    loadLeads(reset, 1, limit, debouncedQuery);
  };

  useEffect(() => {
    loadLeads();
  }, [page, limit]); // eslint-disable-line
  useEffect(() => {
    page !== 1 ? setPage(1) : loadLeads();
  }, [debouncedQuery]); // eslint-disable-line
  useEffect(() => {
    if (brokerId) loadLeads();
  }, [brokerId]); // Load leads when brokerId is available
  useEffect(() => {
    loadLeads();
  }, [leadViewMode]); // Load leads when view mode changes

  /* ───────────── Status styles to match screenshot ───────────── */
  const getStatusBadgeClasses = (status) => {
    const s = (status || "").toString().toLowerCase();
    if (s === "new") return "bg-green-50 text-green-900";
    if (s === "contacted" || s === "in progress")
      return "bg-amber-100 text-amber-700";
    if (s === "qualified" || s === "closed")
      return "bg-emerald-100 text-emerald-700";
    if (s === "rejected") return "bg-rose-100 text-rose-700";
    return "bg-gray-100 text-gray-700";
  };
  const getStatusAvatarClasses = (status) => "bg-green-50 text-green-900";

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "?";
    const [a = "", b = ""] = name.trim().split(/\s+/);
    return (a[0] || "" + b[0] || "").toUpperCase();
  };

  /* ───────────── Regions fetch ───────────── */
  const loadRegions = async () => {
    try {
      setRegionsLoading(true);
      setRegionsError("");
      const res = await fetch(`${apiUrl}/regions`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("bad");
      const data = await res.json();
      let regions = [];
      if (data?.success && Array.isArray(data?.data?.regions))
        regions = data.data.regions;
      else if (Array.isArray(data)) regions = data;
      else if (Array.isArray(data?.data)) regions = data.data;
      else if (Array.isArray(data?.regions)) regions = data.regions;
      else if (data?._id && data?.name) regions = [data];
      setRegionsList(regions);
    } catch {
      setRegionsError("Error loading regions");
      setRegionsList([]);
    } finally {
      setRegionsLoading(false);
    }
  };
  useEffect(() => {
    loadRegions();
  }, []); // eslint-disable-line

  // Fetch nearest regions for the logged-in broker to suggest in Add Lead modal
  const loadNearestRegions = useCallback(async () => {
    if (!brokerId) return;
    try {
      setNearestRegionsLoading(true);
      setNearestRegionsError("");
      const url = `${apiUrl}/regions/nearest?brokerId=${encodeURIComponent(
        brokerId
      )}&limit=5`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("bad");
      const data = await res.json();
      let regions = [];
      if (data?.success && Array.isArray(data?.data?.regions))
        regions = data.data.regions;
      else if (Array.isArray(data)) regions = data;
      else if (Array.isArray(data?.data)) regions = data.data;
      else if (Array.isArray(data?.regions)) regions = data.regions;
      else if (data?._id && data?.name) regions = [data];
      setNearestRegionsList(regions);
    } catch {
      setNearestRegionsError("Error loading nearest regions");
      setNearestRegionsList([]);
    } finally {
      setNearestRegionsLoading(false);
    }
  }, [apiUrl, token, brokerId]);

  // (moved) Refresh nearest regions when Add Lead opens; placed after showAddLead is defined

  /* ───────────── Options & Select styles (light blue per mock) ───────────── */
  const statusOptions = [
    { value: "all", label: "All Status", isAll: true },
    { value: "New", label: "New" },
    { value: "Assigned", label: "Assigned" },
    { value: "In Progress", label: "In Progress" },
    { value: "Closed", label: "Closed" },
    { value: "Rejected", label: "Rejected" },
  ];
  const propertyTypeOptions = [
    { value: "all", label: "All Property Types" },
    { value: "Residential", label: "Residential" },
    { value: "Commercial", label: "Commercial" },
    { value: "Plot", label: "Plot" },
    { value: "Other", label: "Other" },
  ];

  const requirementOptions = [
    { value: "all", label: "All Requirements" },
    { value: "buy", label: "Buy" },
    { value: "rent", label: "Rent" },
    { value: "sell", label: "Sell" },
  ];
  const regionOptions = useMemo(
    () => [
      { value: "all", label: "All Regions" },
      ...(Array.isArray(regionsList)
        ? regionsList.map((r) => ({
            value: r._id || r.id || r,
            label: r.name || r.region || r,
          }))
        : []),
    ],
    [regionsList]
  );

  const nearestRegionOptions = useMemo(
    () =>
      Array.isArray(nearestRegionsList)
        ? nearestRegionsList.map((r) => ({
            value: r._id || r.id || r,
            label: r.name || r.region || r,
          }))
        : [],
    [nearestRegionsList]
  );

  const customSelectStyles = {
    control: (p, s) => ({
      ...p,
      minHeight: "40px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      fontFamily: "var(--font-body, inherit)",
      fontSize: 12,
      boxShadow: s.isFocused ? "0 0 0 4px rgba(13,84,43,0.12)" : "0 0 1px #171a1f12, 0 0 2px #171a1f1F",
      borderColor: s.isFocused ? "#0D542B" : "#e5e7eb",
      background: "white",
      ":hover": { borderColor: s.isFocused ? "#0D542B" : "#0D542B" },
    }),
    valueContainer: (p) => ({
      ...p,
      padding: "2px 10px",
      fontFamily: "var(--font-body, inherit)",
      fontSize: 12,
    }),
    indicatorSeparator: () => ({ display: "none" }),
    menuPortal: (p) => ({ ...p, zIndex: 99999 }),
    option: (p, s) => ({
      ...p,
      backgroundColor: s.isSelected
        ? "#0D542B"
        : s.isFocused
        ? "#E8F8F0"
        : "transparent",
      color: s.isSelected ? "#ffffff" : s.isFocused ? "#0D542B" : "#4b5563",
      fontSize: 12,
      fontFamily: "var(--font-body, inherit)",
      borderRadius: 6,
      margin: "2px 6px",
      padding: "8px 12px",
      ":active": {
        backgroundColor: s.isSelected ? "#0D542B" : "#C8F1DC",
        color: s.isSelected ? "#ffffff" : "#0D542B",
      },
    }),
    singleValue: (p) => ({
      ...p,
      color: "#6b7280",
      fontWeight: 400,
      fontFamily: "var(--font-body, inherit)",
      fontSize: 12,
    }),
    input: (p) => ({
      ...p,
      color: "#6b7280",
      fontWeight: 400,
      fontFamily: "var(--font-body, inherit)",
      fontSize: 12,
    }),
    placeholder: (p) => ({
      ...p,
      color: "#6b7280",
      fontWeight: 400,
      fontFamily: "var(--font-body, inherit)",
      fontSize: 12,
    }),
    multiValueLabel: (p) => ({
      ...p,
      color: "#6b7280",
      fontWeight: 400,
      fontFamily: "var(--font-body, inherit)",
      fontSize: 12,
    }),
    menu: (p) => ({
      ...p,
      zIndex: 9999,
      overflow: "hidden",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      fontFamily: "var(--font-body, inherit)",
      fontSize: 12,
    }),
    menuList: (p) => ({
      ...p,
      maxHeight: 320,
      overflowY: "auto",
      overflowX: "hidden",
      paddingRight: 0,
      fontFamily: "var(--font-body, inherit)",
      fontSize: 12,
    }),
  };

  // Light avatar color helper
  const getAvatarColor = (seed) => {
    // Solid light colors with dark text for high readability
    const palette = [
      { bg: "bg-sky-100", text: "text-sky-800" },
      { bg: "bg-emerald-100", text: "text-emerald-800" },
      { bg: "bg-violet-100", text: "text-violet-800" },
    ];
    const s = String(seed || "");
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
    }
    return palette[hash % palette.length];
  };

  // No gradient needed now; avatars use solid light backgrounds

  // Region helpers (support new and old API shapes)
  const regionIdToName = useMemo(() => {
    const map = new Map();
    (Array.isArray(regionsList) ? regionsList : []).forEach((reg) => {
      const id = reg?._id || reg?.id;
      const name = reg?.name || reg?.region || reg?.city || "";
      if (id && name) map.set(String(id), String(name));
    });
    return map;
  }, [regionsList]);

  const getRegionName = (r) => {
    if (!r) return "";
    if (typeof r === "string") return regionIdToName.get(r) || r;
    if (typeof r === "object") return r.name || r.region || r.city || "";
    return "";
  };
  const getPrimarySecondaryRegionText = (row) => {
    const primary = row?.primaryRegion || row?.region;
    const secondary = row?.secondaryRegion;
    const p = getRegionName(primary);
    const s = getRegionName(secondary);
    return s ? `${p} • ${s}` : p || "—";
  };

  const getRegionNames = (row) => {
    const primary = getRegionName(row?.primaryRegion || row?.region);
    const secondary = getRegionName(row?.secondaryRegion);
    return { primary, secondary };
  };

  /* ───────────── Add Lead modal ───────────── */
  const [showAddLead, setShowAddLead] = useState(false);
  const [addLeadLoading, setAddLeadLoading] = useState(false);
  const [newLead, setNewLead] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    requirement: { value: "all", label: "All Requirements" },
    propertyType: { value: "all", label: "All propertyType" },
    budget: "",
    primaryRegion: null,
    secondaryRegion: null,
    notes: "",
    files: null,
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Refresh nearest regions when Add Lead opens; ensure this is declared after showAddLead
  useEffect(() => {
    if (showAddLead && brokerId) {
      loadNearestRegions();
    }
  }, [showAddLead, brokerId, loadNearestRegions]);

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = {};

    if (!newLead.customerName.trim()) {
      errors.customerName = "Customer name is required";
    }

    if (!newLead.customerPhone.trim()) {
      errors.customerPhone = "Phone number is required";
    } else if (!validatePhone(newLead.customerPhone)) {
      errors.customerPhone = "Phone number must be exactly 10 digits";
    }

    if (!newLead.customerEmail.trim()) {
      errors.customerEmail = "Email is required";
    } else if (!validateEmail(newLead.customerEmail)) {
      errors.customerEmail = "Please enter a valid email address";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewLeadChange = (e) => {
    const { name, value, files } = e.target;

    // Special handling for phone number - only allow digits and limit to 10
    if (name === "customerPhone") {
      const digitsOnly = value.replace(/\D/g, "");
      const limitedValue = digitsOnly.slice(0, 10);
      setNewLead((p) => ({ ...p, [name]: limitedValue }));

      // Real-time validation for phone - only show error if user tries to submit without 10 digits
      const errors = { ...validationErrors };
      if (limitedValue.length > 0 && limitedValue.length < 10) {
        errors.customerPhone = `Phone number must be 10 digits`;
      } else {
        delete errors.customerPhone;
      }
      setValidationErrors(errors);
      return;
    }

    // Special handling for email - real-time validation
    if (name === "customerEmail") {
      setNewLead((p) => ({ ...p, [name]: value }));

      // Real-time validation for email - only show error if user tries to submit with invalid email
      const errors = { ...validationErrors };
      if (value.length > 0 && !validateEmail(value)) {
        errors.customerEmail = "Please enter a valid email address";
      } else {
        delete errors.customerEmail;
      }
      setValidationErrors(errors);
      return;
    }

    // For other fields
    setNewLead((p) => ({ ...p, [name]: files ? files : value }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const modalSelectStyles = {
    ...customSelectStyles,
    menuPortal: (base) => ({ ...base, zIndex: 999999 }), // above modal/overlay
  };
  const handleAddLeadSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      setAddLeadLoading(true);
      const req =
        typeof newLead.requirement === "object"
          ? newLead.requirement.label || newLead.requirement.value
          : newLead.requirement;
      const ptype =
        typeof newLead.propertyType === "object"
          ? newLead.propertyType.label || newLead.propertyType.value
          : newLead.propertyType;
      const primaryRegionId =
        newLead.primaryRegion && typeof newLead.primaryRegion === "object"
          ? newLead.primaryRegion.value || newLead.primaryRegion._id
          : newLead.primaryRegion;
      const secondaryRegionId =
        newLead.secondaryRegion && typeof newLead.secondaryRegion === "object"
          ? newLead.secondaryRegion.value || newLead.secondaryRegion._id
          : newLead.secondaryRegion;
      const payload = {
        customerName: newLead.customerName || "",
        customerPhone: newLead.customerPhone || "",
        customerEmail: newLead.customerEmail || "",
        requirement: req || "",
        propertyType: ptype || "",
        budget:
          newLead.budget !== "" && newLead.budget !== null
            ? parseFloat(newLead.budget)
            : 0,
        // API requires primaryRegionId (required) and secondaryRegionId (optional)
        primaryRegionId:
          primaryRegionId && primaryRegionId !== "select region"
            ? primaryRegionId
            : "",
        createdBy: brokerId, // Explicitly set the createdBy field
      };
      if (secondaryRegionId && secondaryRegionId !== "select region") {
        payload.secondaryRegionId = secondaryRegionId;
      }

      // creating lead payload

      const res = await fetch(`${apiUrl}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          const msg = err?.message || err?.error || "Failed to create lead";
          toast.error(msg);
        } catch {
          toast.error("Failed to create lead");
        }
        return;
      }
      // Read created lead from API to use its id for transfer
      let createdLeadResp = null;
      try {
        createdLeadResp = await res.json();
      } catch {}
      const createdLead =
        (createdLeadResp &&
          (createdLeadResp.lead ||
            createdLeadResp.data ||
            createdLeadResp.newLead)) ||
        createdLeadResp ||
        null;

      toast.success("Lead created successfully");
      await loadLeads();
      // Prefill selectedLead with the newly created lead if available; else fetch latest
      let leadForTransfer =
        createdLead && (createdLead._id || createdLead.id)
          ? createdLead
          : await fetchLatestLead();
      if (leadForTransfer) setSelectedLead(leadForTransfer);
      // Open transfer modal immediately for the newly created lead
      setShowTransfer(true);
      setTransferForm({ brokerIds: [], notes: "", selectAllFiltered: false });
      if (!brokersList || brokersList.length === 0) {
        loadBrokers();
      }
      setShowAddLead(false);
      setNewLead({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        requirement: "select requirement",
        propertyType: "select propertyType",
        budget: "",
        region: "select region",
        notes: "",
        files: null,
      });
      setValidationErrors({});
    } catch {
      toast.error("Error creating lead");
    } finally {
      setAddLeadLoading(false);
    }
  };

  /* ───────────── Transfer modal ───────────── */
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({
    brokerIds: [],
    notes: "",
    selectAllFiltered: false,
  });
  const [transferFilter, setTransferFilter] = useState("");
  const transferSelectRef = useRef(null);
  const [transferMode, setTransferMode] = useState("all"); // 'all' | 'region' | 'select'
  const [transferRegion, setTransferRegion] = useState(null);

  // Custom react-select MenuList with a Select All checkbox
  const BrokerMenuList = (props) => {
    const { children } = props;
    const selectAllChecked = !!transferForm.selectAllFiltered;
    // Compute visible options from current props (supports single child and groups)
    const rawChildren = props?.children;
    const toArray = (c) => (Array.isArray(c) ? c : c ? [c] : []);
    const options = toArray(rawChildren)
      .flatMap((child) => {
        const direct = child?.props?.data?.value;
        if (direct) return [direct];
        const grouped = toArray(child?.props?.children)
          .map((gc) => gc?.props?.data?.value)
          .filter(Boolean);
        return grouped;
      })
      .filter(Boolean);
    return (
      <div>
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
          <span className="text-xs text-slate-600">Filtered brokers</span>
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              checked={selectAllChecked}
              onChange={(e) => {
                const checked = e.target.checked;
                setTransferForm((prev) => ({
                  ...prev,
                  selectAllFiltered: checked,
                  brokerIds: checked
                    ? Array.from(
                        new Set([...(prev.brokerIds || []), ...options])
                      )
                    : (prev.brokerIds || []).filter(
                        (id) => !options.includes(id)
                      ),
                }));
                // keep the menu open and focus the input again
                try {
                  const input = document.querySelector(
                    '[id^="react-select"][id$="-input"]'
                  );
                  input?.focus();
                } catch {}
                // Auto-uncheck after applying so user can use it again easily
                if (checked) {
                  setTimeout(
                    () =>
                      setTransferForm((prev) => ({
                        ...prev,
                        selectAllFiltered: false,
                      })),
                    0
                  );
                }
              }}
            />
            Select all
          </label>
        </div>
        <RSComponents.MenuList {...props}>{children}</RSComponents.MenuList>
      </div>
    );
  };
  const [transferLoading, setTransferLoading] = useState(false);
  const [brokersList, setBrokersList] = useState([]);
  const [brokersLoading, setBrokersLoading] = useState(false);
  const [brokersError, setBrokersError] = useState("");
  // Helper: fetch the most recent lead for this broker
  const fetchLatestLead = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (brokerId) params.set("createdBy", brokerId);
      // Fetch a few and sort client-side (API does not allow "sort")
      params.set("limit", "5");
      const url = `${apiUrl}/leads?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      const items = Array.isArray(data?.data?.items)
        ? data.data.items
        : Array.isArray(data?.data?.leads)
        ? data.data.leads
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.leads)
        ? data.leads
        : Array.isArray(data)
        ? data
        : [];
      if (!items || items.length === 0) return null;
      const withDate = items
        .map((it) => ({
          item: it,
          ts: it?.createdAt
            ? Date.parse(it.createdAt)
            : it?._id
            ? Date.parse(it._id?.toString().substring(0, 8))
            : 0,
        }))
        .sort((a, b) => (b.ts || 0) - (a.ts || 0));
      return withDate[0]?.item || items[0] || null;
    } catch {
      return null;
    }
  }, [apiUrl, token, brokerId]);

  const loadBrokers = async () => {
    try {
      setBrokersLoading(true);
      setBrokersError("");
      const base = apiUrl;
      const res = await fetch(`${base}/brokers`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("bad");
      const data = await res.json();
      let items = [];
      if (Array.isArray(data?.data?.brokers)) items = data.data.brokers;
      else if (Array.isArray(data?.data)) items = data.data;
      else if (Array.isArray(data?.brokers)) items = data.brokers;
      else if (Array.isArray(data)) items = data;
      setBrokersList(items);
    } catch {
      setBrokersError("Failed to load brokers");
      setBrokersList([]);
    } finally {
      setBrokersLoading(false);
    }
  };

  // Delete lead
  const handleDeleteLead = async (lead) => {
    // Check if lead has been transferred
    const transferredTo =
      lead?.transferredTo || lead?.transferredBrokers || lead?.transfers || [];
    if (Array.isArray(transferredTo) && transferredTo.length > 0) {
      toast.error(
        "Cannot delete lead that has been transferred to other brokers"
      );
      return;
    }

    try {
      const leadId = lead?._id || lead?.id;
      if (!leadId) {
        toast.error("Invalid lead id");
        return;
      }
      const res = await fetch(`${apiUrl}/leads/${leadId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          const msg = err?.message || err?.error || "Failed to delete lead";
          toast.error(msg);
        } catch {
          toast.error("Failed to delete lead");
        }
        return;
      }
      toast.success("Lead deleted");
      await loadLeads();
    } catch (e) {
      toast.error("Error deleting lead");
    }
  };

  const openTransferForLead = (lead) => {
    setSelectedLead(lead);
    setTransferForm({ brokerIds: [], notes: "" });
    setTransferMode("all");
    setTransferRegion(null);
    setShowTransfer(true);
    if (!brokersList || brokersList.length === 0) {
      loadBrokers();
    }
  };

  const brokerMatchesRegion = (b, regionId) => {
    if (!b || !regionId) return false;
    // b.region can be array of objects, single object, or string id
    if (Array.isArray(b.region)) {
      return b.region.some(
        (r) =>
          r &&
          (r._id || r.id || r) &&
          String(r._id || r.id || r) === String(regionId)
      );
    }
    if (b.region && typeof b.region === "object") {
      const id = b.region._id || b.region.id;
      return id ? String(id) === String(regionId) : false;
    }
    if (typeof b.region === "string") {
      return String(b.region) === String(regionId);
    }
    // some backends use primaryRegion
    if (b.primaryRegion) {
      const id =
        typeof b.primaryRegion === "object"
          ? b.primaryRegion._id || b.primaryRegion.id
          : b.primaryRegion;
      return id ? String(id) === String(regionId) : false;
    }
    return false;
  };

  const submitTransfer = async () => {
    if (!selectedLead) {
      toast.error("No lead selected");
      return;
    }
    let leadId = selectedLead._id || selectedLead.id;
    if (!leadId) {
      const latest = await fetchLatestLead();
      if (latest && (latest._id || latest.id)) {
        leadId = latest._id || latest.id;
        setSelectedLead((prev) => ({ ...(latest || prev) }));
      }
    }
    if (!leadId) {
      toast.error("Invalid lead id");
      return;
    }

    // Get fromBroker ID (current broker)
    if (!brokerId) {
      toast.error("Broker ID not found");
      return;
    }

    // Build transfers array based on shareType
    // Matches curl examples: all, region, or individual shareType
    let transfers = [];

    if (transferMode === "all") {
      // Case 1: Share with all brokers
      // curl: { "transfers": [{ "shareType": "all" }], "fromBroker": "...", "notes": "..." }
      transfers.push({
        shareType: "all"
      });
    } else if (transferMode === "region") {
      // Case 2: Share with brokers in a specific region
      // curl: { "transfers": [{ "shareType": "region", "region": "{REGION_ID}" }], "fromBroker": "..." }
      if (!(transferRegion && transferRegion.value)) {
        toast.error("Select a region to share with");
        return;
      }
      const regionId = String(transferRegion.value);
      transfers.push({
        shareType: "region",
        region: regionId
      });
    } else if (transferMode === "select") {
      // Case 3: Share with individual broker(s)
      // curl: { "transfers": [{ "shareType": "individual", "toBroker": "{TO_BROKER_ID}" }], "fromBroker": "...", "notes": "..." }
      // For multiple brokers, creates one transfer per broker
      let toBrokers = (transferForm.brokerIds || []).filter((id) => id !== "all");
      if (!toBrokers.length) {
        toast.error("Select at least one broker");
        return;
      }
      toBrokers.forEach(toBrokerId => {
        transfers.push({
          shareType: "individual",
          toBroker: String(toBrokerId)
        });
      });
    } else {
      toast.error("Invalid share mode");
      return;
    }

    // Build request body matching API structure
    // Matches curl examples exactly
    const requestBody = {
      transfers: transfers,
      fromBroker: String(brokerId)
    };

    // Only add notes if provided (optional field)
    if (transferForm.notes && transferForm.notes.trim()) {
      requestBody.notes = transferForm.notes.trim();
    }

    console.log('Transfer request body:', JSON.stringify(requestBody, null, 2));
    console.log('Transfer URL:', `${apiUrl}/leads/${leadId}/transfer-and-notes`);

    try {
      setTransferLoading(true);
      // POST /leads/{leadId}/transfer-and-notes
      // Headers: Content-Type: application/json, Authorization: Bearer {token}
      const res = await fetch(`${apiUrl}/leads/${leadId}/transfer-and-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        let errorMessage = "Failed to share lead";
        try {
          const errorData = await res.json();
          console.error('Transfer API error response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await res.text().catch(() => '');
          console.error('Transfer API error (text):', errorText);
          errorMessage = errorText || errorMessage;
        }
        toast.error(errorMessage);
        return;
      }
      toast.success("Share request sent");
      setShowTransfer(false);
      setTransferForm({ brokerIds: [], notes: "" });
      setTransferRegion(null);
      setTransferMode("all");
    } catch (error) {
      console.error("Error sending transfer request:", error);
      toast.error("Error sending transfer request");
    } finally {
      setTransferLoading(false);
    }
  };

  /* ───────────── View Drawer ───────────── */
  const [showView, setShowView] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewEditMode, setViewEditMode] = useState(false);
  const [viewClosing, setViewClosing] = useState(false);
  const [statusEditMode, setStatusEditMode] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [viewForm, setViewForm] = useState({
    name: "",
    contact: "",
    email: "",
    budget: "",
    requirement: "",
    propertyType: "",
    primaryRegion: null,
    secondaryRegion: null,
    status: "",
  });
  const [viewSaving, setViewSaving] = useState(false);
  const [pendingDeleteTransferId, setPendingDeleteTransferId] = useState(null);

  // Ensure nearest regions are loaded when the View Drawer opens as well
  useEffect(() => {
    if (showView && brokerId) {
      loadNearestRegions();
    }
  }, [showView, brokerId, loadNearestRegions]);

  // Delete a specific transfer (to-broker) for the selected lead
  const deleteTransfer = async (toBrokerId) => {
    try {
      if (!selectedLead || !toBrokerId) return;
      const leadId = selectedLead._id || selectedLead.id;
      const res = await fetch(
        `${apiUrl}/leads/${encodeURIComponent(
          leadId
        )}/transfers/${encodeURIComponent(toBrokerId)}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) {
        try {
          const err = await res.json();
          toast.error(
            err?.message || err?.error || "Failed to delete transfer"
          );
        } catch {
          toast.error("Failed to delete transfer");
        }
        return;
      }
      toast.success("Transfer removed");
      // Refresh selectedLead transfers: reload lead or mutate locally
      // Simple approach: reload the leads list and re-open view drawer
      await loadLeads();
      // Also optimistically remove from selectedLead in memory
      setSelectedLead((prev) => {
        if (!prev) return prev;
        const toId = toBrokerId;
        const filtered = Array.isArray(prev.transfers)
          ? prev.transfers.filter((tr) => {
              const id =
                tr && typeof tr.toBroker === "object"
                  ? tr.toBroker?._id || tr.toBroker?.id
                  : tr?.toBroker;
              return String(id) !== String(toId);
            })
          : [];
        return { ...prev, transfers: filtered };
      });
      setPendingDeleteTransferId(null);
    } catch {
      toast.error("Error deleting transfer");
    }
  };
  const saveViewEdits = async () => {
    if (!selectedLead) return;
    try {
      setViewSaving(true);
      const leadId = selectedLead._id || selectedLead.id;
      const payload = {
        customerName:
          viewForm.name !== undefined
            ? viewForm.name
            : selectedLead.customerName || selectedLead.name || "",
        customerPhone:
          viewForm.contact !== undefined
            ? viewForm.contact
            : selectedLead.customerPhone || "",
        customerEmail:
          viewForm.email !== undefined
            ? viewForm.email
            : selectedLead.customerEmail || "",
        requirement:
          viewForm.requirement !== undefined
            ? viewForm.requirement
            : selectedLead.requirement || "",
        propertyType:
          viewForm.propertyType !== undefined
            ? viewForm.propertyType
            : selectedLead.propertyType || "",
        budget:
          viewForm.budget !== "" && viewForm.budget !== null
            ? Number(viewForm.budget)
            : typeof selectedLead.budget === "number"
            ? selectedLead.budget
            : 0,
        status: viewForm.status
          ? viewForm.status
          : selectedLead.status || "New",
      };
      if (
        viewForm.primaryRegion &&
        viewForm.primaryRegion.value &&
        viewForm.primaryRegion.value !== "all"
      ) {
        payload.primaryRegionId = viewForm.primaryRegion.value;
      }
      if (
        viewForm.secondaryRegion &&
        viewForm.secondaryRegion.value &&
        viewForm.secondaryRegion.value !== "all"
      ) {
        payload.secondaryRegionId = viewForm.secondaryRegion.value;
      }

      const res = await fetch(`${apiUrl}/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          const msg = err?.message || err?.error || "Failed to update lead";
          toast.error(msg);
        } catch {
          toast.error("Failed to update lead");
        }
        return;
      }
      const data = await res.json();
      const updated = data?.data || data;

      setSelectedLead((prev) => ({
        ...prev,
        ...updated,
        name:
          updated.name || updated.customerName || viewForm.name || prev?.name,
        customerName:
          updated.customerName || viewForm.name || prev?.customerName,
        contact:
          updated.contact ||
          updated.customerPhone ||
          viewForm.contact ||
          prev?.contact,
        customerPhone:
          updated.customerPhone || viewForm.contact || prev?.customerPhone,
        customerEmail:
          updated.customerEmail || viewForm.email || prev?.customerEmail,
        requirement:
          updated.requirement || viewForm.requirement || prev?.requirement,
        propertyType:
          updated.propertyType || viewForm.propertyType || prev?.propertyType,
        budget:
          typeof updated.budget === "number"
            ? updated.budget
            : viewForm.budget !== ""
            ? Number(viewForm.budget)
            : prev?.budget,
        primaryRegion:
          updated.primaryRegion ||
          (viewForm.primaryRegion
            ? {
                name: viewForm.primaryRegion.label,
                _id: viewForm.primaryRegion.value,
              }
            : prev?.primaryRegion || prev?.region),
        secondaryRegion:
          updated.secondaryRegion ||
          (viewForm.secondaryRegion
            ? {
                name: viewForm.secondaryRegion.label,
                _id: viewForm.secondaryRegion.value,
              }
            : prev?.secondaryRegion),
      }));

      toast.success("Lead updated");
      setViewEditMode(false);
      await loadLeads();
    } catch (e) {
      toast.error("Error updating lead");
    } finally {
      setViewSaving(false);
    }
  };

  const saveStatusUpdate = async (newStatus) => {
    if (!selectedLead) return;
    try {
      setStatusSaving(true);
      const leadId = selectedLead._id || selectedLead.id;
      const payload = {
        status: newStatus,
      };

      const res = await fetch(`${apiUrl}/leads/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          const msg = err?.message || err?.error || "Failed to update status";
          toast.error(msg);
        } catch {
          toast.error("Failed to update status");
        }
        return;
      }
      const data = await res.json();
      const updated = data?.data || data;

      setSelectedLead((prev) => ({
        ...prev,
        status: updated.status || newStatus,
      }));

      toast.success("Status updated successfully");
      setStatusEditMode(false);
      await loadLeads();
    } catch (e) {
      toast.error("Error updating status");
    } finally {
      setStatusSaving(false);
    }
  };

  const handleViewFieldChange = (e) =>
    setViewForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const clearFilters = () => {
    const reset = {
      query: "",
      status: { value: "all", label: "All Statuses" },
      broker: { value: "all", label: "All Brokers" },
      region: { value: "all", label: "All Regions" },
      propertyType: { value: "all", label: "All Property Types" },
      requirement: { value: "all", label: "All Requirements" },
      startDate: "",
      endDate: "",
      budgetMax: 500000,
    };
    setFilters(reset);
    setPage(1);
    loadLeads(reset, 1, limit, "");
  };

  /* ───────────── Content Loader Components ───────────── */
  const ContentLoader = ({ className = "" }) => (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const TableRowLoader = () => (
    <div className="grid grid-cols-12 items-center px-6 py-4 animate-pulse">
      <div className="col-span-2 flex items-center gap-3">
        <div className="h-4 w-28 rounded bg-gray-200" />
      </div>
      <div className="col-span-2 h-4 w-40 rounded bg-gray-200" />
      <div className="col-span-2 h-4 w-28 rounded bg-gray-200" />
      <div className="col-span-1 h-4 w-14 rounded bg-gray-200" />
      <div className="col-span-2 h-4 w-20 rounded bg-gray-200" />
      <div className="col-span-1 flex justify-center">
        <div className="h-6 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="col-span-2 flex justify-end gap-2">
        <div className="w-7 h-7 rounded-lg bg-gray-200" />
        <div className="w-7 h-7 rounded-lg bg-gray-200" />
        <div className="w-7 h-7 rounded-lg bg-gray-200" />
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No leads found
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm">
        {filters.query ||
        filters.status?.value !== "all" ||
        filters.region?.value !== "all" ||
        filters.propertyType?.value !== "all" ||
        filters.requirement?.value !== "all" ||
        filters.budgetMax !== 500000
          ? "No leads match your current filters. Try adjusting your search criteria."
          : "You don't have any leads yet. Click 'Add New Lead' to get started."}
      </p>
      {!filters.query &&
        filters.status?.value === "all" &&
        filters.region?.value === "all" &&
        filters.propertyType?.value === "all" &&
        filters.requirement?.value === "all" &&
        filters.budgetMax === 500000 && (
          <button
            onClick={() => setShowAddLead(true)}
            className="mt-4 px-4 py-2 bg-green-900 text-white text-sm font-semibold rounded-lg hover:bg-green-950 transition-colors"
          >
            Add Your First Lead
          </button>
        )}
    </div>
  );

  const headerData = {
    title: "My Leads",
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Leads", href: "/leads" },
    ],
  };

  return (
    <ProtectedRoute requiredRole="broker">
      <HeaderFile data={headerData} />
      <div className="min-h-screen bg-white py-16">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="w-full mx-auto  ">
          {/* 9 / 3 layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Header */}
            {/* Left 9 */}
            <div className="md:col-span-9">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className=" font-archivo text-[18px] leading-[36px] font-bold text-[#171A1FFF]">
                      Lead Management
                    </h1>
                    <p className="text-[12px] leading-[20px] font-normal text-[#565D6DFF]">
                      Capture leads, share with brokers, and track progress —
                      all in one place.
                    </p>
                  </div>

                  {/* View Mode Toggle (single switch with label) */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={leadViewMode === "transferred"}
                      onClick={() => {
                        const next =
                          leadViewMode === "my-leads"
                            ? "transferred"
                            : "my-leads";
                        setLeadViewMode(next);
                        setPage(1);
                        loadLeads(filters, 1, limit, debouncedQuery, next);
                      }}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 border ${
                        leadViewMode === "transferred"
                          ? "bg-green-900 border-green-900"
                          : "bg-gray-200 border-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                          leadViewMode === "transferred"
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-[12px] leading-5 font-normal text-[#565D6D]">
                      {leadViewMode === "transferred"
                        ? "Transferred to Me"
                        : "My Leads"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Total Leads (Active Card with Purple Border) */}
                <div className="border border-gray-200 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] bg-white rounded-lg p-4">
                  <p className="text-[12px] text-[#565D6DFF] font-medium">
                    Total Leads
                  </p>
                  <p className="text-[18px] font-semibold text-gray-900 mt-1">
                    {metricsLoading ? "—" : metrics.totalLeads.toLocaleString()}
                  </p>
                </div>

                {/* Shared With Me */}
                <div className="border border-gray-200 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] bg-white rounded-lg p-4">
                  <p className="text-[12px] text-[#565D6DFF] font-medium">
                    Shared With Me
                  </p>
                  <p className="text-[18px] font-semibold text-gray-900 mt-1">
                    {metricsLoading
                      ? "—"
                      : Number(
                          metrics.transferredToMe || metrics.transfersToMe || 0
                        ).toLocaleString()}
                  </p>
                </div>

                {/* Shared By Me */}
                <div className="border shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] border-gray-200 bg-white rounded-lg p-4">
                  <p className="text-[12px] text-[#565D6DFF] font-medium">
                    Shared By Me
                  </p>
                  <p className="text-[18px] font-semibold text-gray-900 mt-1">
                    {metricsLoading
                      ? "—"
                      : Number(
                          metrics.transferredByMe || metrics.transfersByMe || 0
                        ).toLocaleString()}
                  </p>
                </div>
                {/* <StatCard
    color="violet"
    label="Avg. Deal Size"
    value={metricsLoading ? '—' : `$${Number(metrics.avgDealSize || 0).toLocaleString()}`}
    deltaText={metricsError ? 'Unable to load' : '↑ 5.1% vs last month'}
    trend="up"
  /> */}
              </div>

              {/* subtle divider before lead cards */}
              <div className="pt-4">
                <div className="h-px bg-gray-100" />
              </div>
              {/* Search + status + buttons - Flexible layout */}
              <div className="mt-6 flex items-center gap-3">
                {/* Search - Fixed width to match status dropdown */}
                <div className="w-80 relative">
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={filters.query}
                    onChange={(e) =>
                      setFilters({ ...filters, query: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-2 border border-gray-200 rounded-xl shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] bg-white text-[12px] font-body placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-600"
                    style={{ minHeight: "40px", fontSize: "12px" }}
                  />
                  <svg
                    className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                  {/* Search indicator */}
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Status Filter - Same width as search */}
                <div className="w-52">
                  <Select
                    value={filters.status}
                    onChange={(opt) => {
                      const next = { ...filters, status: opt };
                      setFilters(next);
                      setPage(1);
                      loadLeads(next, 1, limit, debouncedQuery);
                    }}
                    options={statusOptions}
                    styles={customSelectStyles}
                    isSearchable
                    menuPlacement="bottom"
                  />
                </div>

                {/* Advanced Filters - Gray color with icon */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(true)}
                    className="px-3 py-2.5 rounded-xl text-[12px] font-body border border-gray-200 bg-white text-gray-500 hover:text-gray-600 hover:bg-white hover:border-gray-300 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] cursor-pointer whitespace-nowrap flex items-center gap-2"
                    style={{ minHeight: "40px", fontSize: "12px" }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                      />
                    </svg>
                    Advanced Filters
                  </button>
                </div>

                {/* Add New Lead - Outline style */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAddLead(true)}
                    className="px-3 py-2.5 rounded-xl text-[12px] border border-green-600 text-white bg-[#0D542B]  hover:bg-[#0B4624]  hover:border-green-700 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] cursor-pointer whitespace-nowrap flex items-center gap-2"
                    style={{ minHeight: "40px", fontSize: "12px" }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add New Lead
                  </button>
                </div>

                {/* Clear Filters - Fixed width, only when needed */}
                {isAdvancedFiltersApplied && (
                  <div>
                    <button
                      type="button"
                      onClick={clearAdvancedFilters}
                      className="px-3 py-2.5 rounded-xl text-[12px] font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer whitespace-nowrap"
                      title="Clear advanced filters"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="mt-6">
                {/* Loading */}
                {leadsLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 animate-pulse"
                      >
                        <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
                        <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
                        <div className="h-28 w-full bg-gray-100 rounded mb-4" />
                        <div className="flex items-center justify-between">
                          <div className="h-7 w-28 bg-gray-200 rounded" />
                          <div className="flex gap-2">
                            <div className="h-7 w-7 bg-gray-200 rounded-lg" />
                            <div className="h-7 w-7 bg-gray-200 rounded-lg" />
                            <div className="h-7 w-7 bg-gray-200 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!leadsLoading &&
                  Array.isArray(leads) &&
                  leads.length === 0 && <EmptyState />}

                {/* Cards */}
                {!leadsLoading && Array.isArray(leads) && leads.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {leads.map((row, idx) => {
                      // ----- Shared With (avatars from transfers) -----
                      const transfers = Array.isArray(row?.transfers)
                        ? row.transfers
                        : [];
                      const toBrokers = transfers
                        .map((t) =>
                          typeof t?.toBroker === "object"
                            ? t.toBroker
                            : { _id: t?.toBroker }
                        )
                        .filter((b) => b && (b._id || b.name || b.email));
                      const uniqueToBrokers = Array.from(
                        new Map(
                          toBrokers.map((b) => [b._id || b.email || b.name, b])
                        ).values()
                      );
                      const idToBroker = new Map(
                        (brokersList || []).map((b) => [b._id || b.id, b])
                      );
                      const avatars = uniqueToBrokers.map((b) => {
                        const merged = b._id
                          ? { ...(idToBroker.get(b._id) || {}), ...b }
                          : b;
                        return {
                          id:
                            merged._id ||
                            merged.id ||
                            merged.email ||
                            merged.name,
                          name:
                            merged.name ||
                            merged.fullName ||
                            merged.email ||
                            "Broker",
                          image:
                            merged.brokerImage ||
                            merged.avatarUrl ||
                            merged.imageUrl ||
                            "",
                        };
                      });

                      const isTransferred = (() => {
                        const transferredTo =
                          row?.transferredTo ||
                          row?.transferredBrokers ||
                          row?.transfers ||
                          [];
                        return (
                          Array.isArray(transferredTo) &&
                          transferredTo.length > 0
                        );
                      })();

                      return (
                        <div
                          key={row._id || row.id || idx}
                          className="group relative border shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] border-gray-200 bg-white rounded-lg"
                        >
                          {/* Status Badge - Horizontal Ribbon with Folded Corner */}
                          <div className="absolute top-0 right-0 z-10">
                            <div
                              className="text-black text-[10px] leading-[20px] font-semibold px-[8px] py-[1px] rounded-full text-center shadow-md relative"
                              style={{
                                background:
                                  row.status?.toLowerCase() === "new"
                                    ? "#FDC700"
                                    : row.status?.toLowerCase() === "assigned"
                                    ? "linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)"
                                    : row.status?.toLowerCase() ===
                                      "in progress"
                                    ? "linear-gradient(90deg, #f59e0b 0%, #dc2626 100%)"
                                    : row.status?.toLowerCase() === "closed"
                                    ? "linear-gradient(90deg, #10b981 0%, #047857 100%)"
                                    : row.status?.toLowerCase() === "rejected"
                                    ? "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)"
                                    : row.status?.toLowerCase() ===
                                      "transferred"
                                    ? "linear-gradient(90deg, #f97316 0%, #ea580c 100%)"
                                    : row.status?.toLowerCase() === "active"
                                    ? "linear-gradient(90deg, #10b981 0%, #047857 100%)"
                                    : "#FDC700", // default yellow
                                // clipPath:
                                //   "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)",
                                minWidth: "40px",
                              }}
                            >
                              {row.status ? row.status.toUpperCase() : "NEW"}
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-6 pt-8">
                            {/* Header Section */}
                            <div className="flex items-start justify-between mb-4">
                              {/* Left Side - Avatar and Name */}
                              <div className="flex items-start gap-4">
                                {(() => {
                                  const seed = row.customerName || row.name;
                                  const c = getAvatarColor(seed);
                                  return (
                                    <div
                                      className={`w-12 h-12 rounded-full flex items-center justify-center text-[12px] font-semibold ${c.bg} ${c.text}`}
                                    >
                                      {(row.customerName || row.name || "-")
                                        .split(" ")
                                        .map((s) => s[0])
                                        .filter(Boolean)
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </div>
                                  );
                                })()}
                                <div className="flex-1 pr-4">
                                  <h3 className="break-words text-[14px] leading-[24px] font-semibold text-[#171A1F]">
                                    {row.customerName || row.name || "-"}
                                  </h3>
                                  <p className="text-[12px] font-normal text-[#565D6D] break-words leading-tight">
                                    {row.customerEmail ||
                                      row.customerPhone ||
                                      row.contact ||
                                      "-"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Lead Details Section - Two Rows */}
                            <div className="space-y-3">
                              {/* First Row */}
                              <div className="flex justify-between items-center  border-gray-100">
                                <div className="flex-1">
                                  <div className="text-[12px] font-normal text-[#565D6D] break-words uppercase tracking-wide mb-1">
                                    REQUIREMENT
                                  </div>
                                  <div className="break-words text-[12px] leading-[16px]  font-medium text-[#171A1F]">
                                    {row.requirement || row.req || "—"}
                                  </div>
                                </div>
                                <div className="flex-1 pl-4">
                                  <div className="text-[12px] font-normal text-[#565D6D] break-words uppercase tracking-wide mb-1">
                                    PROPERTY TYPE
                                  </div>
                                  <div className="break-words text-[12px] leading-[16px]  font-medium text-[#171A1F]">
                                    {row.propertyType || "—"}
                                  </div>
                                </div>
                              </div>

                              {/* Second Row */}
                              <div className="flex justify-between items-top">
                                <div className="flex-1">
                                  <div className="text-[12px] font-normal text-[#565D6D] break-words uppercase tracking-wide mb-1">
                                    BUDGET
                                  </div>
                                  <div className="break-words text-[12px] leading-[16px]  font-medium  text-[#171A1F]">
                                    {typeof row.budget === "number"
                                      ? `$${row.budget.toLocaleString()}`
                                      : row.budget || "—"}
                                  </div>
                                </div>
                                <div className="flex-1 pl-4">
                                  <div className="text-[12px] font-normal text-[#565D6D] break-words uppercase tracking-wide mb-1">
                                    REGION(S)
                                  </div>
                                  {(() => {
                                    const { primary, secondary } =
                                      getRegionNames(row);
                                    return (
                                      <div className="break-words text-[12px] leading-[16px] flex flex-col gap-2 font-medium text-[#171A1F]">
                                        <div>{primary || "—"}</div>
                                        {secondary && (
                                          <div className="break-words text-[12px] leading-[16px]  font-medium text-[#171A1F]">
                                            {secondary}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>

                            {/* Bottom Section - Shared With and Actions */}
                            <div className="flex items-end justify-between  pt-4 ">
                              {/* Shared With */}
                              <div>
                                <div className="uppercase tracking-wide mb-2 text-[12px] leading-[12px] font-normal text-[#565D6D]">
                                  SHARED WITH
                                </div>
                                {(() => {
                                  const transfers = Array.isArray(
                                    row?.transfers
                                  )
                                    ? row.transfers
                                    : [];
                                  
                                  if (transfers.length === 0) {
                                    return (
                                      <span className="text-[10px] font-normal text-[#565D6D]">
                                        Not shared
                                      </span>
                                    );
                                  }

                                  // Group transfers by shareType
                                  const allTransfers = transfers.filter(t => 
                                    t.shareType === "all" || (!t.shareType && !t.toBroker && !t.region)
                                  );
                                  const regionTransfers = transfers.filter(t => 
                                    t.shareType === "region" || (!t.shareType && t.region && !t.toBroker)
                                  );
                                  const individualTransfers = transfers.filter(t => 
                                    t.shareType === "individual" || (!t.shareType && t.toBroker && !t.region)
                                  );

                                  // If shared with all brokers
                                  if (allTransfers.length > 0) {
                                    return (
                                      <span className="text-[10px] font-normal text-[#565D6D] flex items-center gap-1">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-100 text-blue-800">
                                          All
                                        </span>
                                        <span>All brokers</span>
                                      </span>
                                    );
                                  }

                                  // If shared with region(s) only
                                  if (regionTransfers.length > 0 && individualTransfers.length === 0) {
                                    const regions = regionTransfers
                                      .map(t => {
                                        const regionId = t?.region;
                                        return getRegionName(regionId) || regionId || "Unknown Region";
                                      })
                                      .filter((r, i, arr) => arr.indexOf(r) === i); // unique
                                    
                                    return (
                                      <span className="text-[10px] font-normal text-[#565D6D] flex items-center gap-1 flex-wrap">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-green-100 text-green-800">
                                          Region
                                        </span>
                                        <span>{regions.slice(0, 2).join(", ")}{regions.length > 2 ? ` +${regions.length - 2}` : ""}</span>
                                      </span>
                                    );
                                  }

                                  // Extract toBroker objects/ids for individual transfers
                                  const toBrokers = individualTransfers
                                    .map((t) =>
                                      typeof t?.toBroker === "object"
                                        ? t.toBroker
                                        : { _id: t?.toBroker }
                                    )
                                    .filter(
                                      (b) => b && (b._id || b.name || b.email)
                                    );
                                  const uniqueToBrokers = Array.from(
                                    new Map(
                                      toBrokers.map((b) => [
                                        b._id || b.email || b.name,
                                        b,
                                      ])
                                    ).values()
                                  );

                                  // Map to avatar data: prefer brokerImage from embedded object; fallback to brokersList by id
                                  const idToBroker = new Map(
                                    (brokersList || []).map((b) => [
                                      b._id || b.id,
                                      b,
                                    ])
                                  );
                                  const avatars = uniqueToBrokers.map((b) => {
                                    const merged = b._id
                                      ? {
                                          ...(idToBroker.get(b._id) || {}),
                                          ...b,
                                        }
                                      : b;
                                    return {
                                      id:
                                        merged._id ||
                                        merged.id ||
                                        merged.email ||
                                        merged.name,
                                      name:
                                        merged.name ||
                                        merged.fullName ||
                                        merged.email ||
                                        "Broker",
                                      image:
                                        merged.brokerImage ||
                                        merged.avatarUrl ||
                                        merged.imageUrl ||
                                        "",
                                    };
                                  });

                                  // If mixed (region + individual), show both
                                  if (regionTransfers.length > 0 && individualTransfers.length > 0) {
                                    const regions = regionTransfers
                                      .map(t => {
                                        const regionId = t?.region;
                                        return getRegionName(regionId) || regionId || "Unknown";
                                      })
                                      .filter((r, i, arr) => arr.indexOf(r) === i);
                                    
                                    const visible = avatars.slice(0, 2);
                                    const remaining = Math.max(0, avatars.length - visible.length);
                                    
                                    return (
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-green-100 text-green-800">
                                            Region
                                          </span>
                                          <span className="text-[10px] text-[#565D6D]">{regions.slice(0, 1).join(", ")}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <div className="flex -space-x-2">
                                            {visible.map((a, i) => (
                                              <div
                                                key={`${a.id || "broker"}-${i}`}
                                                className="w-7 h-7 rounded-full ring-2 ring-white bg-gray-200 overflow-hidden flex items-center justify-center text-[10px] text-gray-600"
                                                title={a.name}
                                              >
                                                <img
                                                  src={
                                                    a.image ||
                                                    "https://www.w3schools.com/howto/img_avatar.png"
                                                  }
                                                  alt={a.name}
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                            ))}
                                            {remaining > 0 && (
                                              <div
                                                className="w-7 h-7 rounded-full ring-2 ring-white bg-yellow-400 text-black flex items-center justify-center text-[11px] font-semibold"
                                                title={`+${remaining} more`}
                                              >
                                                +{remaining}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // Individual transfers only - show avatars
                                  if (avatars.length === 0) {
                                    return (
                                      <span className="text-[10px] font-normal text-[#565D6D]">
                                        Not shared
                                      </span>
                                    );
                                  }

                                  const visible = avatars.slice(0, 2);
                                  const remaining = Math.max(
                                    0,
                                    avatars.length - visible.length
                                  );

                                  return (
                                    <div className="flex items-center">
                                      <div className="flex -space-x-2">
                                        {visible.map((a, i) => (
                                          <div
                                            key={`${a.id || "broker"}-${i}`}
                                            className="w-7 h-7 rounded-full ring-2 ring-white bg-gray-200 overflow-hidden flex items-center justify-center text-[10px] text-gray-600"
                                            title={a.name}
                                          >
                                            <img
                                              src={
                                                a.image ||
                                                "https://www.w3schools.com/howto/img_avatar.png"
                                              }
                                              alt={a.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        ))}
                                        {remaining > 0 && (
                                          <div
                                            className="w-7 h-7 rounded-full ring-2 ring-white bg-yellow-400 text-black flex items-center justify-center text-[11px] font-semibold"
                                            title={`+${remaining} more`}
                                          >
                                            +{remaining}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Action Icons */}
                              <div className="flex items-center gap-4">
                                {/* View Button */}
                                <button
                                  title="View Details"
                                  className="flex items-center gap-1 text-[12px] font-medium text-[#565D6D] hover:text-green-900 transition-colors cursor-pointer"
                                  onClick={() => {
                                    setSelectedLead(row);
                                    setViewEditMode(false);
                                    setViewClosing(false);
                                    setViewForm({
                                      name: row.customerName || row.name || "",
                                      contact:
                                        row.customerPhone || row.contact || "",
                                      email: row.customerEmail || "",
                                      budget: String(row.budget ?? ""),
                                      requirement:
                                        row.requirement || row.req || "",
                                      propertyType: row.propertyType || "",
                                      primaryRegion: row.primaryRegion
                                        ? {
                                            value:
                                              row.primaryRegion._id ||
                                              row.primaryRegion.id ||
                                              row.primaryRegion,
                                            label:
                                              row.primaryRegion.name ||
                                              row.primaryRegion,
                                          }
                                        : row.region
                                        ? typeof row.region === "object"
                                          ? {
                                              value:
                                                row.region._id ||
                                                row.region.id ||
                                                row.region,
                                              label:
                                                row.region.name || row.region,
                                            }
                                          : {
                                              value: row.region,
                                              label:
                                                getRegionName(row.region) ||
                                                row.region,
                                            }
                                        : null,
                                      secondaryRegion: row.secondaryRegion
                                        ? {
                                            value:
                                              row.secondaryRegion._id ||
                                              row.secondaryRegion.id ||
                                              row.secondaryRegion,
                                            label:
                                              row.secondaryRegion.name ||
                                              row.secondaryRegion,
                                          }
                                        : null,
                                      status: row.status || "active",
                                    });
                                    setShowView(true);
                                  }}
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                  <span className="text-[12px] font-medium text-[#565D6D]">
                                    View
                                  </span>
                                </button>

                                {/* Transfer Button */}
                                <button
                                  title="Transfer Lead"
                                  className="flex items-center gap-1 text-[12px] font-medium text-[#565D6D] hover:text-blue-800 transition-colors cursor-pointer"
                                  onClick={() => openTransferForLead(row)}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                  </svg>
                                  <span className="text-[12px] font-medium text-[#565D6D]">
                                    Share
                                  </span>
                                </button>

                                {/* Delete Button */}
                                <button
                                  title="Delete Lead"
                                  className={`flex items-center gap-1 text-[12px] font-medium transition-colors ${
                                    isTransferred
                                      ? "text-gray-300 cursor-not-allowed"
                                      : "text-[#565D6D] hover:text-[#565D6D] cursor-pointer"
                                  }`}
                                  onClick={() =>
                                    !isTransferred && handleDeleteLead(row)
                                  }
                                  disabled={isTransferred}
                                >
                                  <svg
                                    className={`w-4 h-4 ${
                                      isTransferred ? "text-gray-300" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  <span
                                    className={`text-[12px] font-medium ${
                                      isTransferred
                                        ? "text-gray-300"
                                        : "text-[#565D6D]"
                                    }`}
                                  >
                                    Delete
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 bg-white cursor-pointer"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50 bg-white cursor-pointer"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Right 3 (sticky) */}
            <aside className="md:col-span-3 space-y-6 md:sticky md:top-6 self-start">
              {/* Recent Activity */}
              <div className="bg-white  p-4 rounded-[10px] border border-[#DEE1E6] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
                <h4 className=" mb-3 flex items-center gap-2 text-[14px] leading-6 font-semibold text-[#171A1F]">
                  {/* clock-in-circle */}
                  <svg
                    className="w-4 h-4 text-gray-600 shrink-0 overflow-visible"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                  Recent Activity
                </h4>

                <ul className="text-sm text-slate-900 space-y-3">
                  {/* New lead created */}
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 ring-1 ring-gray-200">
                      {/* user-plus */}
                      <svg
                        className="w-=4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="10" cy="7" r="4" />
                        <path d="M19 8v6M22 11h-6" />
                      </svg>
                    </span>
                    <div className="flex-1">
                      <div className="text-[12px] leading-5 font-normal text-[#171A1F]">
                        New lead created
                      </div>
                      <div className="text-[10px] leading-5 font-normal text-[#565D6D]">
                        Today, 10:45 AM
                      </div>
                    </div>
                  </li>

                  {/* Follow-up email */}
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 ring-1 ring-gray-200">
                      {/* mail */}
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M22 7 12 13 2 7" />
                      </svg>
                    </span>
                    <div className="flex-1">
                      <div className="text-[12px] leading-5 font-normal text-[#171A1F]">
                        Follow-up email sent to Michael Chen
                      </div>
                      <div className="text-[10px] leading-5 font-normal text-[#565D6D]">
                        Yesterday, 3:20 PM
                      </div>
                    </div>
                  </li>

                  {/* Qualified */}
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 ring-1 ring-gray-200">
                      {/* check */}
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <div className="flex-1">
                      <div className="text-[12px] leading-5 font-normal text-[#171A1F]">
                        Lead status changed to Qualified
                      </div>
                      <div className="text-[10px] leading-5 font-normal text-[#565D6D]">
                        Yesterday, 11:15 AM
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Lead Help & Resources */}
              <div className="bg-white  p-4 rounded-[10px] border border-[#DEE1E6] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="flex items-center gap-2 text-[14px] leading-6 font-semibold text-[#171A1F]">
                    {/* chat/faq icon */}
                    <svg
                      className="w-4 h-4 text-gray-600 shrink-0 overflow-visible"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {/* message square */}
                      <rect x="3" y="4" width="18" height="14" rx="3" />
                      {/* tail */}
                      <path d="M8 18v3l3-3" />
                    </svg>
                    FAQ
                  </h4>
                  <a
                    href="/faq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className=" text-green-950 hover:underline hover:text-green-950 transition-colors text-[12px] leading-5 font-medium "
                  >
                    View all
                  </a>
                </div>

                <div className="space-y-2 text-[12px">
                  {/* FAQ 1 - tailored to leads */}
                  <details
                    className="group relative rounded-xl border border-slate-100 p-4 pr-5 transition-colors"
                    open
                  >
                    <summary className="list-none cursor-pointer flex items-center justify-between">
                      <span className="text-[12px] leading-5 font-normal text-[#171A1F]">
                        How do I add a new lead quickly?
                      </span>
                      <svg
                        className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 group-open:text-gray-600 shrink-0 overflow-visible"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <p className="mt-2 pl-3 md:pl-4 text-[10px] leading-4 text-gray-600 border-l-2 border-gray-300">
                      Use the Add Lead button, fill name, phone, requirement and
                      region. You can edit details later in Lead Details.
                    </p>
                  </details>

                  {/* FAQ 2 */}
                  <details className="group relative rounded-xl border border-slate-100 p-4 pr-5 transition-colors">
                    <summary className="list-none cursor-pointer flex items-center justify-between">
                      <span className="text-[12px] leading-5 font-normal text-[#171A1F]">
                        How do I change a lead status?
                      </span>
                      <svg
                        className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 group-open:text-gray-600 shrink-0 overflow-visible"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <p className="mt-2 pl-3 md:pl-4 text-[10px] leading-4 text-slate-600 border-l-2 border-gray-300">
                      Open a lead, click Edit Status in the drawer header, pick
                      the status and save.
                    </p>
                  </details>

                  {/* FAQ 3 */}
                  <details className="group relative rounded-xl border border-slate-100 p-4 pr-5 transition-colors">
                    <summary className="list-none cursor-pointer flex items-center justify-between">
                      <span className="text-[12px] leading-5 font-normal text-[#171A1F]">
                        How do I share a lead with another broker?
                      </span>
                      <svg
                        className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 group-open:text-gray-600 shrink-0 overflow-visible"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <p className="mt-2 pl-3 md:pl-4 text-[10px] leading-4 text-slate-600 border-l-2 border-gray-300">
                      Use Share/Transfer, choose brokers, add notes and confirm.
                      The transfer history appears in Lead Details.
                    </p>
                  </details>
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-white rounded-[10px] border border-[#DEE1E6] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] p-4">
                {/* Title */}
                <h4 className="mb-3 text-[12px] leading-6 font-semibold text-[#171A1F]">
                  Help & Support
                </h4>

                {/* Introductory Text */}
                <p className="text-[10px] font-normal text-[#565D6D] mb-6 leading-relaxed">
                  Need help or looking for more details? Our comprehensive resources and support team are here for you.
                </p>

                {/* Support Options List */}
                <div className="space-y-3">
                  {/* Visit Support Center */}
                  <Link href="/contact" className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="mt-0.5 inline-flex items-center justify-center w-7 h-7  text-[#0D542B] shrink-0">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-[12px] leading-5 font-medium text-[#171A1F] hover:text-[#0D542B] transition-colors">
                        Visit Support Center
                      </h5>
                      <p className="text-[10px] leading-4 font-normal text-[#565D6D] hover:text-[#0D542B] transition-colors">
                        Get answers to frequently asked questions.
                      </p>
                    </div>
                  </Link>

                  {/* Read Documentation */}
                  <Link href="/help/documentation" className="flex items-start gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="mt-0.5 inline-flex items-center justify-center w-7 h-7 text-[#0D542B] shrink-0">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-[12px] leading-5 font-medium text-[#171A1F]">
                        Read Documentation
                      </h5>
                      <p className="text-[10px] leading-4 font-normal text-[#565D6D]">
                        Explore our guides and platform tutorials.
                      </p>
                    </div>
                  </Link>

                  {/* Email Support */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex items-center justify-center w-7 h-7  text-[#0D542B] shrink-0">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-[12px] leading-5 font-medium text-[#171A1F]">
                        Email Support
                      </h5>
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="text-[10px] leading-4 font-normal text-[#565D6D] hover:text-green-900 transition-colors"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    </div>
                  </div>

                  {/* Phone Support */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex items-center justify-center w-7 h-7  text-[#0D542B] shrink-0">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-[12px] leading-5 font-medium text-[#171A1F]">
                        Phone Support
                      </h5>
                      <a
                        href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
                        className="text-[10px] leading-4 font-normal text-[#565D6D] hover:text-green-900 transition-colors"
                      >
                        {SUPPORT_PHONE}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Advanced Filters Modal */}
        {showAdvanced && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowAdvanced(false)}
            />
            <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-slate-900">
                  Advanced Filters
                </h4>
                <button
                  onClick={() => setShowAdvanced(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-auto">
                {/* Region */}
                <div>
                  <label className="block text-xs font-label text-gray-700 mb-2">
                    Region
                  </label>
                  {regionsLoading ? (
                    <div className="flex items-center justify-center py-3 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 animate-spin text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-sm text-gray-500">
                          Loading regions...
                        </span>
                      </div>
                    </div>
                  ) : regionsError ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">
                      {regionsError}
                    </div>
                  ) : (
                    <Select
                      value={filters.region}
                      onChange={(opt) =>
                        setFilters({ ...filters, region: opt })
                      }
                      options={regionOptions}
                      styles={{
                        ...customSelectStyles,
                        menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                        menu: (base) => ({ ...base, zIndex: 99999 }),
                      }}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      isSearchable
                    />
                  )}
                </div>
                {/* Requirement */}
                <div>
                  <label className="block text-xs font-label text-gray-700 mb-2">
                    Requirement
                  </label>
                  <Select
                    value={filters.requirement}
                    onChange={(opt) =>
                      setFilters({ ...filters, requirement: opt })
                    }
                    options={requirementOptions}
                    styles={{
                      ...customSelectStyles,
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                      menu: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                    isSearchable
                  />{" "}
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-xs font-label text-gray-700 mb-2">
                    Property Type
                  </label>
                  <Select
                    value={filters.propertyType}
                    onChange={(opt) =>
                      setFilters({ ...filters, propertyType: opt })
                    }
                    options={propertyTypeOptions}
                    styles={{
                      ...customSelectStyles,
                      menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                      menu: (base) => ({ ...base, zIndex: 99999 }),
                    }}
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : null
                    }
                    menuPosition="fixed"
                    isSearchable
                  />{" "}
                </div>

                {/* Max Budget */}
                <div>
                  <label className="block text-xs font-label text-gray-700 mb-4">
                    Max Budget:{" "}
                    <span className="text-green-900 font-semibold">
                      ${filters.budgetMax.toLocaleString()}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={filters.budgetMax}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        budgetMax: Number(e.target.value),
                      })
                    }
                    className="w-full accent-green-900"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                {isAdvancedFiltersApplied && (
                  <button
                    onClick={clearAdvancedFilters}
                    disabled={applyingFilters}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={async () => {
                    setApplyingFilters(true);
                    setPage(1);
                    await loadLeads(filters, 1, limit, debouncedQuery);
                    setApplyingFilters(false);
                    setShowAdvanced(false);
                  }}
                  disabled={applyingFilters}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-green-900 hover:bg-green-950 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {applyingFilters && (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {applyingFilters ? "Applying..." : "Apply Filters"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Lead Modal */}
        {showAddLead && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => {
                setShowAddLead(false);
                setValidationErrors({});
              }}
            />
            <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-slate-900">
                  Add New Lead
                </h4>
                <button
                  onClick={() => {
                    setShowAddLead(false);
                    setValidationErrors({});
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-auto">
                <div>
                  <label className="block text-xs font-label text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    name="customerName"
                    value={newLead.customerName}
                    onChange={handleNewLeadChange}
                    type="text"
                    placeholder="Enter customer's full name"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-4 focus:bg-green-50 selection:bg-green-100 selection:text-green-900 caret-green-900 text-sm bg-white ${
                      validationErrors.customerName
                        ? "border-red-300 focus:ring-red-100 focus:border-red-500"
                        : "border-gray-200 focus:ring-green-100 focus:border-green-600"
                    }`}
                  />
                  {validationErrors.customerName && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.customerName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      name="customerPhone"
                      value={newLead.customerPhone}
                      onChange={handleNewLeadChange}
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-4 focus:bg-green-50 selection:bg-green-100 selection:text-green-900 caret-green-900 text-sm bg-white ${
                        validationErrors.customerPhone
                          ? "border-red-300 focus:ring-red-100 focus:border-red-500"
                          : "border-gray-200 focus:ring-green-100 focus:border-green-600"
                      }`}
                    />
                    {validationErrors.customerPhone && (
                      <p className="mt-1 text-xs text-red-600">
                        {validationErrors.customerPhone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      name="customerEmail"
                      value={newLead.customerEmail}
                      onChange={handleNewLeadChange}
                      type="email"
                      placeholder="e.g., john.doe@example.com"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-4 focus:bg-green-50 selection:bg-green-100 selection:text-green-900 caret-green-900 text-sm bg-white ${
                        validationErrors.customerEmail
                          ? "border-red-300 focus:ring-red-100 focus:border-red-500"
                          : "border-gray-200 focus:ring-green-100 focus:border-green-600"
                      }`}
                    />
                    {validationErrors.customerEmail && (
                      <div className="mt-1">
                        <p className="text-xs text-red-600">
                          {validationErrors.customerEmail}
                        </p>
                        <p className="text-xs text-gray-500">
                          eg. john@example.com
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">
                      Requirement
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {requirementOptions
                        .filter((o) => o.value !== "all")
                        .map((opt) => {
                          const isSelected =
                            (newLead.requirement &&
                              (newLead.requirement.value ||
                                newLead.requirement)) === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() =>
                                setNewLead({ ...newLead, requirement: opt })
                              }
                              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors transition-shadow duration-150 ${
                                isSelected
                                  ? "bg-green-50 text-green-900 border-green-200 ring-1 ring-green-100 shadow-sm"
                                  : "bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-slate-50"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">
                      Property Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {propertyTypeOptions
                        .filter((o) => o.value !== "all")
                        .map((opt) => {
                          const isSelected =
                            (newLead.propertyType &&
                              (newLead.propertyType.value ||
                                newLead.propertyType)) === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() =>
                                setNewLead({ ...newLead, propertyType: opt })
                              }
                              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors transition-shadow duration-150 ${
                                isSelected
                                  ? "bg-green-50 text-green-900 border-green-200 ring-1 ring-green-100 shadow-sm"
                                  : "bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-slate-50"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-label text-gray-700 mb-1">
                    Budget
                  </label>
                  {(() => {
                    const pTypeRaw =
                      typeof newLead.propertyType === "object"
                        ? newLead.propertyType.value ||
                          newLead.propertyType.label ||
                          ""
                        : newLead.propertyType || "";
                    const pType = String(pTypeRaw).toLowerCase();
                    const presets = {
                      residential: { min: 5000, max: 100000000, step: 5000 }, // 10 Cr
                      commercial: { min: 10000, max: 500000000, step: 10000 }, // 50 Cr
                      plot: { min: 50000, max: 250000000, step: 50000 }, // 25 Cr
                      other: { min: 1000, max: 50000000, step: 1000 }, // 5 Cr
                    };
                    const preset = presets[pType] || {
                      min: 0,
                      max: 10000000,
                      step: 5000,
                    };
                    const budgetMin = preset.min;
                    const budgetMax = preset.max;
                    const budgetStep = preset.step;
                    const raw = Number(newLead.budget || 0);
                    const value = isNaN(raw)
                      ? budgetMin
                      : Math.min(budgetMax, Math.max(budgetMin, raw));
                    const pct =
                      ((value - budgetMin) / (budgetMax - budgetMin)) * 100;
                    const fillPct = value > budgetMin ? Math.max(2, pct) : 0;
                    return (
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="range"
                            min={budgetMin}
                            max={budgetMax}
                            step={budgetStep}
                            value={value}
                            onChange={(e) =>
                              setNewLead({
                                ...newLead,
                                budget: Number(e.target.value),
                              })
                            }
                            className="w-full h-2 rounded-full appearance-none focus:outline-none accent-green-900"
                            style={{
                              background: `linear-gradient(to right, #14532d 0%, #14532d ${fillPct}%, #e5e7eb ${fillPct}%, #e5e7eb 100%)`,
                            }}
                          />
                          <div className="absolute -top-6 right-0 flex items-center border border-green-200 rounded-full bg-green-50 px-2 py-0.5">
                            <span className="text-[11px] font-semibold text-green-900 mr-1">
                              ₹
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={String(value)}
                              onChange={(e) => {
                                const n = Number(
                                  (e.target.value || "").replace(/[^0-9]/g, "")
                                );
                                const clamped = isNaN(n)
                                  ? 0
                                  : Math.min(budgetMax, Math.max(budgetMin, n));
                                setNewLead({ ...newLead, budget: clamped });
                              }}
                              className="w-[2ch] text-[11px] font-semibold text-green-900 bg-transparent text-right focus:outline-none font-mono tabular-nums"
                              style={{
                                width: `calc(${Math.max(
                                  3,
                                  String(value).length
                                )}ch + 0.15rem)`, // dynamic width
                              }}
                            />
                          </div>
                        </div>
                        {/* removed below-slider controls per request */}
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">
                      Primary Region *
                    </label>
                    <Select
                      value={newLead.primaryRegion}
                      onChange={(opt) =>
                        setNewLead({ ...newLead, primaryRegion: opt })
                      }
                      options={regionOptions}
                      styles={modalSelectStyles}
                      isSearchable
                      isLoading={nearestRegionsLoading}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      menuPlacement="auto"
                    />{" "}
                  </div>
                  <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">
                      Optional Region
                    </label>
                    <Select
                      value={newLead.secondaryRegion}
                      onChange={(opt) =>
                        setNewLead({ ...newLead, secondaryRegion: opt })
                      }
                      options={regionOptions}
                      styles={modalSelectStyles}
                      isSearchable
                      isLoading={nearestRegionsLoading}
                      menuPortalTarget={
                        typeof window !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      menuPlacement="auto"
                    />{" "}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddLead(false);
                    setValidationErrors({});
                  }}
                  disabled={addLeadLoading}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLeadSubmit}
                  disabled={addLeadLoading}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {addLeadLoading && (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {addLeadLoading ? "Adding Lead..." : "Add Lead"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowTransfer(false)}
            />
            <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h4 className="text-lg font-semibold text-slate-900">
                  Share Lead
                </h4>
                <button
                  onClick={() => setShowTransfer(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="w-5 h-5 text-gray-500 cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-5 space-y-5">
                {/* Share mode toggles (radio) */}
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                      type="radio"
                      name="transferMode"
                        className="h-4 w-4 accent-green-900 cursor-pointer"
                      checked={transferMode === "all"}
                      onChange={() => setTransferMode("all")}
                    />
                    <span className="text-sm  text-slate-800">
                      Share with all brokers
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="transferMode"
                        className="h-4 w-4 accent-green-900 cursor-pointer"
                        checked={transferMode === "region"}
                        onChange={() => setTransferMode("region")}
                      />
                      <span className="text-sm  text-slate-800">
                        Share with brokers of a region
                      </span>
                    </label>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="transferMode"
                      className="h-4 w-4 accent-green-900 cursor-pointer"
                      checked={transferMode === "select"}
                      onChange={() => setTransferMode("select")}
                    />
                    <span className="text-sm  text-slate-800">
                      Share with selected brokers
                    </span>
                  </label>
                </div>

                {transferMode === "region" && (
                  <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">
                      Select Region
                    </label>
                    <Select
                      value={transferRegion}
                      onChange={(opt) => setTransferRegion(opt)}
                      options={regionOptions.filter((o) => o.value !== "all")}
                      styles={customSelectStyles}
                      isSearchable
                      placeholder="Select region"
                    />
                  </div>
                )}

                {transferMode === "select" && (
                  <div>
                    <label className="block text-xs font-label text-gray-700 mb-1">
                      Select Broker(s)
                    </label>
                    <Select
                      value={transferForm.brokerIds
                        .filter((id) =>
                          (brokersList || []).some(
                            (x) =>
                              (x._id || x.id) === id &&
                              (x._id || x.id) !== currentUserId
                          )
                        )
                        .map((id) => {
                          const b = (brokersList || []).find(
                            (x) => (x._id || x.id) === id
                          );
                          let regionName = "";
                          if (
                            b?.region &&
                            Array.isArray(b.region) &&
                            b.region.length > 0
                          ) {
                            regionName = b.region[0].name || "Unknown";
                          } else if (
                            b?.region &&
                            typeof b.region === "object" &&
                            !Array.isArray(b.region)
                          ) {
                            regionName =
                              b.region.name || b.region.region || "Unknown";
                          } else if (typeof b?.region === "string") {
                            regionName = b.region;
                          }
                          return {
                            value: id,
                            label: `${
                              b?.name || b?.fullName || b?.email || id
                            }${regionName ? ` (${regionName})` : ""}`,
                          };
                        })}
                      onChange={(opts, meta) => {
                        const selectedValues = (opts || []).map((o) => o.value);
                        setTransferForm((prev) => ({
                          ...prev,
                          brokerIds: selectedValues,
                        }));
                      }}
                      options={(brokersList || [])
                        .filter(
                          (b) =>
                            (b._id || b.id) && (b._id || b.id) !== currentUserId
                        )
                        .map((b) => {
                          let regionName = "";
                          if (
                            b.region &&
                            Array.isArray(b.region) &&
                            b.region.length > 0
                          ) {
                            regionName = b.region[0].name || "Unknown";
                          } else if (
                            b.region &&
                            typeof b.region === "object" &&
                            !Array.isArray(b.region)
                          ) {
                            regionName =
                              b.region.name || b.region.region || "Unknown";
                          } else if (typeof b.region === "string") {
                            regionName = b.region;
                          }
                          return {
                            value: b._id || b.id,
                            label: `${
                              b.name || b.fullName || b.email || "Unnamed"
                            }${regionName ? ` (${regionName})` : ""}`,
                          };
                        })}
                      styles={customSelectStyles}
                      components={{ MenuList: BrokerMenuList }}
                      onInputChange={(inputValue, { action }) => {
                        if (
                          action === "input-change" &&
                          transferForm.selectAllFiltered
                        ) {
                          // Defer actual selection to MenuList header using props.children
                        }
                        setTransferFilter(inputValue || "");
                        return inputValue;
                      }}
                      isMulti
                      isSearchable
                      closeMenuOnSelect={false}
                      hideSelectedOptions
                      placeholder={
                        brokersLoading
                          ? "Loading brokers..."
                          : brokersError
                          ? brokersError
                          : "Choose brokers..."
                      }
                      isLoading={brokersLoading}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-label text-gray-700 mb-1">
                    Share Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={transferForm.notes}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Add any specific instructions or context..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-600 text-sm bg-white"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowTransfer(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                  disabled={transferLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={submitTransfer}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-900 hover:bg-green-950 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  disabled={transferLoading}
                >
                  {transferLoading && (
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {transferLoading ? "Sending..." : "Share with broker"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Drawer */}
        {showView && selectedLead && (
          <div
            className={`fixed inset-0 z-50 ${
              viewClosing ? "pointer-events-none" : ""
            }`}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                setViewClosing(true);
                setTimeout(() => setShowView(false), 200);
              }}
            />
            {/* Panel */}
            <div
              className={`absolute right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl ${
                viewClosing ? "animate-slide-out" : "animate-slide-in"
              }`}
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white">
                <h4 className="text-[18px] font-semibold text-slate-900 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Lead Details
                </h4>
                <button
                  onClick={() => {
                    setViewClosing(true);
                    setTimeout(() => setShowView(false), 200);
                  }}
                  className="p-2 rounded hover:bg-gray-100"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Scroll Area */}
              <div className="h-[calc(100%-56px)] overflow-y-auto no-scrollbar p-5">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white bg-green-50 text-green-900 flex items-center justify-center text-sm font-semibold">
                      {getInitials(
                        selectedLead.name || selectedLead.customerName || "?"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[16px] font-semibold text-slate-900 truncate">
                        {selectedLead.name || selectedLead.customerName || "—"}
                      </div>
                      <div className="text-[12px] text-slate-500 mt-0.5">
                        {selectedLead.contact ||
                          selectedLead.customerPhone ||
                          "—"}
                      </div>
                    </div>
                    <span
                      className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClasses(
                        selectedLead.status || "Closed"
                      )}`}
                    >
                      {selectedLead.status || "Closed"}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-1 px-3 pt-3">
                    {(() => {
                      const TabButton = ({ active, children, onClick }) => (
                        <button
                          onClick={onClick}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                            active
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {children}
                        </button>
                      );
                      return (
                        <div className="flex gap-2">
                          <TabButton
                            active={viewTab === "overview"}
                            onClick={() => setViewTab("overview")}
                          >
                            Overview
                          </TabButton>
                          <TabButton
                            active={viewTab === "share"}
                            onClick={() => setViewTab("share")}
                          >
                            Share
                          </TabButton>
                          {/* Removed Notes tab as requested */}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tab Panels */}
                  <div className="p-4">
                    {/* OVERVIEW */}
                    {(!viewTab || viewTab === "overview") && (
                      <div className="space-y-4">
                        {/* Contact Details */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-green-900"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              Contact Details
                            </h5>
                          </div>
                          <div className="space-y-3 text-[12px]">
                            {(() => {
                              const isOwner = !!(
                                (selectedLead?.createdBy &&
                                  (selectedLead.createdBy._id ||
                                    selectedLead.createdBy.id) ===
                                    currentUserId) ||
                                (selectedLead?.brokerId &&
                                  String(selectedLead.brokerId) ===
                                    String(currentUserId))
                              );
                              return null;
                            })()}
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="w-5 h-5 inline-flex items-center justify-center rounded bg-sky-50">
                                <svg
                                  className="w-3.5 h-3.5 text-gray-500"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 5h6l2 5-2 1a10 10 0 005 5l1-2 5 2v6a2 2 0 01-2 2A16 16 0 013 7z"
                                  />
                                </svg>
                              </span>
                              {viewEditMode &&
                              ((selectedLead?.createdBy &&
                                (selectedLead.createdBy._id ||
                                  selectedLead.createdBy.id) === brokerId) ||
                                (selectedLead?.brokerId &&
                                  String(selectedLead.brokerId) ===
                                    String(brokerId))) ? (
                                <input
                                  type="tel"
                                  name="contact"
                                  value={
                                    viewForm.contact ??
                                    (selectedLead.contact ||
                                      selectedLead.customerPhone ||
                                      "")
                                  }
                                  onChange={handleViewFieldChange}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600 text-[12px]"
                                  placeholder="Phone number"
                                />
                              ) : (
                                selectedLead.contact ||
                                selectedLead.customerPhone ||
                                "—"
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="w-5 h-5 inline-flex items-center justify-center rounded bg-green-50">
                                <svg
                                  className="w-3.5 h-3.5 text-gray-500"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                              </span>
                              {viewEditMode &&
                              ((selectedLead?.createdBy &&
                                (selectedLead.createdBy._id ||
                                  selectedLead.createdBy.id) === brokerId) ||
                                (selectedLead?.brokerId &&
                                  String(selectedLead.brokerId) ===
                                    String(brokerId))) ? (
                                <input
                                  type="email"
                                  name="email"
                                  value={
                                    viewForm.email ??
                                    (selectedLead.customerEmail || "")
                                  }
                                  onChange={handleViewFieldChange}
                                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600 text-[12px]"
                                  placeholder="Email address"
                                />
                              ) : (
                                selectedLead.customerEmail || "—"
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Property Preferences */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-green-900"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M7 8h10M7 12h7M5 20l2.5-2.5M19 20l-2.5-2.5"
                                />
                              </svg>
                              Property Preferences
                            </h5>
                          </div>
                          <div className="space-y-3 text-[12px]">
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="w-5 h-5 inline-flex items-center justify-center rounded bg-green-50">
                                <svg
                                  className="w-3 h-3 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
                                  />
                                </svg>
                              </span>
                              <span className="text-slate-500 mr-1">
                                Property Type:
                              </span>
                              {viewEditMode &&
                              ((selectedLead?.createdBy &&
                                (selectedLead.createdBy._id ||
                                  selectedLead.createdBy.id) === brokerId) ||
                                (selectedLead?.brokerId &&
                                  String(selectedLead.brokerId) ===
                                    String(brokerId))) ? (
                                <Select
                                  name="propertyType"
                                  options={(() => {
                                    const base = propertyTypeOptions.filter(
                                      (o) => o.value !== "all"
                                    );
                                    const v =
                                      viewForm.propertyType ??
                                      selectedLead.propertyType ??
                                      "";
                                    return base.some((o) => o.value === v)
                                      ? base
                                      : [...base, { value: v, label: v }];
                                  })()}
                                  value={(() => {
                                    const v =
                                      viewForm.propertyType ??
                                      selectedLead.propertyType ??
                                      "";
                                    const opts = (() => {
                                      const base = propertyTypeOptions.filter(
                                        (o) => o.value !== "all"
                                      );
                                      return base.some((o) => o.value === v)
                                        ? base
                                        : [...base, { value: v, label: v }];
                                    })();
                                    return (
                                      opts.find((o) => o.value === v) || null
                                    );
                                  })()}
                                  onChange={(opt) =>
                                    setViewForm((prev) => ({
                                      ...prev,
                                      propertyType: opt?.value || "",
                                    }))
                                  }
                                  classNamePrefix="react-select"
                                  styles={customSelectStyles}
                                />
                              ) : (
                                <span className="text-slate-900">
                                  {selectedLead.propertyType || "—"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="w-5 h-5 inline-flex items-center justify-center rounded bg-green-50">
                                <svg
                                  className="w-3 h-3 text-slate-400"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                                </svg>
                              </span>
                              <span className="text-slate-500 mr-1">
                                Budget:
                              </span>
                              {viewEditMode &&
                              ((selectedLead?.createdBy &&
                                (selectedLead.createdBy._id ||
                                  selectedLead.createdBy.id) === brokerId) ||
                                (selectedLead?.brokerId &&
                                  String(selectedLead.brokerId) ===
                                    String(brokerId))) ? (
                                <input
                                  type="number"
                                  name="budget"
                                  value={
                                    viewForm.budget ?? selectedLead.budget ?? ""
                                  }
                                  onChange={handleViewFieldChange}
                                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-600 text-[12px]"
                                  placeholder="Budget"
                                />
                              ) : (
                                <span className="text-slate-900">
                                  {typeof selectedLead.budget === "number"
                                    ? `$${selectedLead.budget.toLocaleString()}`
                                    : selectedLead.budget || "—"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="w-5 h-5 inline-flex items-center justify-center rounded bg-green-50">
                                <svg
                                  className="w-3 h-3 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                              </span>
                              <span className="text-slate-500 mr-1">
                                Requirement:
                              </span>
                              {viewEditMode &&
                              ((selectedLead?.createdBy &&
                                (selectedLead.createdBy._id ||
                                  selectedLead.createdBy.id) ===
                                  currentUserId) ||
                                (selectedLead?.brokerId &&
                                  String(selectedLead.brokerId) ===
                                    String(currentUserId))) ? (
                                <Select
                                  name="requirement"
                                  options={(() => {
                                    const base = requirementOptions.filter(
                                      (o) => o.value !== "all"
                                    );
                                    const v =
                                      viewForm.requirement ??
                                      selectedLead.requirement ??
                                      selectedLead.req ??
                                      "";
                                    return base.some((o) => o.value === v)
                                      ? base
                                      : [...base, { value: v, label: v }];
                                  })()}
                                  value={(() => {
                                    const v =
                                      viewForm.requirement ??
                                      selectedLead.requirement ??
                                      selectedLead.req ??
                                      "";
                                    const opts = (() => {
                                      const base = requirementOptions.filter(
                                        (o) => o.value !== "all"
                                      );
                                      return base.some((o) => o.value === v)
                                        ? base
                                        : [...base, { value: v, label: v }];
                                    })();
                                    return (
                                      opts.find((o) => o.value === v) || null
                                    );
                                  })()}
                                  onChange={(opt) =>
                                    setViewForm((prev) => ({
                                      ...prev,
                                      requirement: opt?.value || "",
                                    }))
                                  }
                                  classNamePrefix="react-select"
                                  styles={customSelectStyles}
                                />
                              ) : (
                                <span className="text-slate-900">
                                  {selectedLead.requirement ||
                                    selectedLead.req ||
                                    "—"}
                                </span>
                              )}
                            </div>
                            {/* Regions */}
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="w-5 h-5 inline-flex items-center justify-center rounded bg-green-50">
                                <svg
                                  className="w-3 h-3 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </span>
                              <span className="text-slate-500 mr-1">
                                Primary Region:
                              </span>
                              {viewEditMode &&
                              ((selectedLead?.createdBy &&
                                (selectedLead.createdBy._id ||
                                  selectedLead.createdBy.id) === brokerId) ||
                                (selectedLead?.brokerId &&
                                  String(selectedLead.brokerId) ===
                                    String(brokerId))) ? (
                                <Select
                                  name="primaryRegion"
                                  options={regionOptions}
                                  value={viewForm.primaryRegion || null}
                                  onChange={(opt) =>
                                    setViewForm((prev) => ({
                                      ...prev,
                                      primaryRegion: opt,
                                    }))
                                  }
                                  classNamePrefix="react-select"
                                styles={customSelectStyles}
                                menuPlacement="top"
                                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                menuPosition="fixed"
                                />
                              ) : (
                                <span className="text-slate-900">
                                  {getRegionName(
                                    selectedLead?.primaryRegion ||
                                      selectedLead?.region
                                  ) || "—"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                              <span className="w-5 h-5 inline-flex items-center justify-center rounded bg-green-50">
                                <svg
                                  className="w-3 h-3 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </span>
                              <span className="text-slate-500 mr-1">
                                Secondary Region:
                              </span>
                              {viewEditMode &&
                              ((selectedLead?.createdBy &&
                                (selectedLead.createdBy._id ||
                                  selectedLead.createdBy.id) === brokerId) ||
                                (selectedLead?.brokerId &&
                                  String(selectedLead.brokerId) ===
                                    String(brokerId))) ? (
                                <Select
                                  name="secondaryRegion"
                                  options={regionOptions}
                                  value={viewForm.secondaryRegion || null}
                                  onChange={(opt) =>
                                    setViewForm((prev) => ({
                                      ...prev,
                                      secondaryRegion: opt,
                                    }))
                                  }
                                  classNamePrefix="react-select"
                                styles={customSelectStyles}
                                menuPlacement="top"
                                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                menuPosition="fixed"
                                />
                              ) : (
                                <span className="text-slate-900">
                                  {getRegionName(
                                    selectedLead?.secondaryRegion
                                  ) || "—"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lead Status + Actions */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[13px] text-slate-500">
                                Status
                              </div>
                              <div className="mt-0.5">
                                {viewEditMode ? (
                                  <Select
                                    name="status"
                                    options={statusOptions.filter(
                                      (o) => o.value !== "all"
                                    )}
                                    value={(() => {
                                      const v =
                                        viewForm.status ??
                                        selectedLead.status ??
                                        "New";
                                      return (
                                        statusOptions.find(
                                          (o) => o.value === v
                                        ) || null
                                      );
                                    })()}
                                    onChange={(opt) =>
                                      setViewForm((prev) => ({
                                        ...prev,
                                        status: opt?.value || "New",
                                      }))
                                    }
                                    classNamePrefix="react-select"
                                    styles={customSelectStyles}
                                  menuPlacement="top"
                                  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                  menuPosition="fixed"
                                  />
                                ) : (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadgeClasses(
                                      selectedLead.status || "Closed"
                                    )}`}
                                  >
                                    {selectedLead.status || "Closed"}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!viewEditMode ? (
                                <button
                                  onClick={() => {
                                    // prefill edit form from selectedLead
                                    const primaryId =
                                      (selectedLead?.primaryRegion &&
                                        (selectedLead.primaryRegion._id ||
                                          selectedLead.primaryRegion.id ||
                                          selectedLead.primaryRegion.value)) ||
                                      selectedLead?.region ||
                                      null;
                                    const primaryLabel =
                                      (selectedLead?.primaryRegion &&
                                        (selectedLead.primaryRegion.name ||
                                          selectedLead.primaryRegion.label)) ||
                                      getRegionName(
                                        selectedLead?.primaryRegion ||
                                          selectedLead?.region
                                      ) ||
                                      "";
                                    const secondaryId =
                                      selectedLead?.secondaryRegion &&
                                      (selectedLead.secondaryRegion._id ||
                                        selectedLead.secondaryRegion.id ||
                                        selectedLead.secondaryRegion.value);
                                    const secondaryLabel =
                                      selectedLead?.secondaryRegion &&
                                      (selectedLead.secondaryRegion.name ||
                                        selectedLead.secondaryRegion.label);
                                    setViewForm({
                                      name:
                                        selectedLead.name ||
                                        selectedLead.customerName ||
                                        "",
                                      contact:
                                        selectedLead.contact ||
                                        selectedLead.customerPhone ||
                                        "",
                                      email: selectedLead.customerEmail || "",
                                      requirement:
                                        selectedLead.requirement ||
                                        selectedLead.req ||
                                        "",
                                      propertyType:
                                        selectedLead.propertyType || "",
                                      budget:
                                        typeof selectedLead.budget === "number"
                                          ? selectedLead.budget
                                          : selectedLead.budget || "",
                                      status: selectedLead.status || "Closed",
                                      primaryRegion: primaryId
                                        ? {
                                            value: primaryId,
                                            label: primaryLabel,
                                          }
                                        : null,
                                      secondaryRegion: secondaryId
                                        ? {
                                            value: secondaryId,
                                            label: secondaryLabel || "",
                                          }
                                        : null,
                                    });
                                    setViewEditMode(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-green-900 hover:bg-green-950"
                                >
                                  {(selectedLead?.createdBy &&
                                    (selectedLead.createdBy._id ||
                                      selectedLead.createdBy.id) ===
                                      brokerId) ||
                                  (selectedLead?.brokerId &&
                                    String(selectedLead.brokerId) ===
                                      String(brokerId))
                                    ? "Edit"
                                    : "Edit Status"}
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={saveViewEdits}
                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-green-900 hover:bg-green-950"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setViewEditMode(false)}
                                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 border border-gray-200"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {/* <button
                        onClick={() => setViewTab("share")}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 border border-gray-200"
                      >
                        Share
                      </button> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SHARE DETAILS */}
                    {viewTab === "share" && (
                      <div className="space-y-3 text-[14px]">
                        <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                          <h5 className="text-[16px] font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-green-900"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 8h10M7 12h7M5 20l2.5-2.5M19 20l-2.5-2.5"
                              />
                            </svg>
                            Share History
                          </h5>
                          {(() => {
                            const transfers = Array.isArray(
                              selectedLead?.transfers
                            )
                              ? selectedLead.transfers
                              : [];
                            if (!transfers.length) {
                              return (
                                <div className="text-[14px] text-slate-500">
                                  Not shared yet.
                                </div>
                              );
                            }
                            const idToBroker = new Map(
                              (brokersList || []).map((b) => [b._id || b.id, b])
                            );
                            
                            // Group transfers by shareType
                            const allTransfers = transfers.filter(t => 
                              t.shareType === "all" || (!t.shareType && !t.toBroker && !t.region)
                            );
                            const regionTransfers = transfers.filter(t => 
                              t.shareType === "region" || (!t.shareType && t.region && !t.toBroker)
                            );
                            const individualTransfers = transfers.filter(t => 
                              t.shareType === "individual" || (!t.shareType && t.toBroker && !t.region)
                            );

                            return (
                              <ul className="text-[14px] text-slate-700 space-y-3">
                                {/* Display All transfers */}
                                {allTransfers.map((t, i) => {
                                  const fromB =
                                    t && typeof t.fromBroker === "object"
                                      ? t.fromBroker
                                      : idToBroker.get(t?.fromBroker) || {};
                                  const fromName =
                                    fromB.name ||
                                    fromB.fullName ||
                                    fromB.email ||
                                    fromB._id ||
                                    t?.fromBroker ||
                                    "Unknown broker";
                                  const fromAvatar =
                                    fromB.brokerImage ||
                                    fromB.avatarUrl ||
                                    fromB.imageUrl ||
                                    "";
                                  const when = t?.createdAt
                                    ? new Date(t.createdAt).toLocaleString()
                                    : "";
                                  const keyFrom =
                                    (typeof t?.fromBroker === "object"
                                      ? t?.fromBroker?._id
                                      : t?.fromBroker) || `all-from-${i}`;
                                  
                                  return (
                                    <li
                                      key={`all-${keyFrom}-${t?._id || i}`}
                                      className="flex items-center gap-3"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-blue-100 overflow-hidden ring-2 ring-white flex items-center justify-center text-[10px] text-blue-800 font-semibold">
                                          All
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 truncate">
                                          {fromName} → All Brokers
                                        </div>
                                        {when && (
                                          <div className="text-[11px] text-slate-400">
                                            Shared on {when}
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  );
                                })}

                                {/* Display Region transfers */}
                                {regionTransfers.map((t, i) => {
                                  const fromB =
                                    t && typeof t.fromBroker === "object"
                                      ? t.fromBroker
                                      : idToBroker.get(t?.fromBroker) || {};
                                  const fromName =
                                    fromB.name ||
                                    fromB.fullName ||
                                    fromB.email ||
                                    fromB._id ||
                                    t?.fromBroker ||
                                    "Unknown broker";
                                  const fromAvatar =
                                    fromB.brokerImage ||
                                    fromB.avatarUrl ||
                                    fromB.imageUrl ||
                                    "";
                                  const regionId = t?.region;
                                  const regionName = getRegionName(regionId) || regionId || "Unknown Region";
                                  const when = t?.createdAt
                                    ? new Date(t.createdAt).toLocaleString()
                                    : "";
                                  const keyFrom =
                                    (typeof t?.fromBroker === "object"
                                      ? t?.fromBroker?._id
                                      : t?.fromBroker) || `region-from-${i}`;
                                  
                                  return (
                                    <li
                                      key={`region-${keyFrom}-${t?._id || i}`}
                                      className="flex items-center gap-3"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-green-100 overflow-hidden ring-2 ring-white flex items-center justify-center text-[10px] text-green-800 font-semibold">
                                          R
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 truncate">
                                          {fromName} → {regionName}
                                        </div>
                                        {when && (
                                          <div className="text-[11px] text-slate-400">
                                            Shared on {when}
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  );
                                })}

                                {/* Display Individual transfers */}
                                {individualTransfers.map((t, i) => {
                                  const toB =
                                    t && typeof t.toBroker === "object"
                                      ? t.toBroker
                                      : idToBroker.get(t?.toBroker) || {};
                                  const fromB =
                                    t && typeof t.fromBroker === "object"
                                      ? t.fromBroker
                                      : idToBroker.get(t?.fromBroker) || {};
                                  const toName =
                                    toB.name ||
                                    toB.fullName ||
                                    toB.email ||
                                    toB._id ||
                                    t?.toBroker ||
                                    "Unknown broker";
                                  const fromName =
                                    fromB.name ||
                                    fromB.fullName ||
                                    fromB.email ||
                                    fromB._id ||
                                    t?.fromBroker ||
                                    "Unknown broker";
                                  const toAvatar =
                                    toB.brokerImage ||
                                    toB.avatarUrl ||
                                    toB.imageUrl ||
                                    "";
                                  const fromAvatar =
                                    fromB.brokerImage ||
                                    fromB.avatarUrl ||
                                    fromB.imageUrl ||
                                    "";
                                  const when = t?.createdAt
                                    ? new Date(t.createdAt).toLocaleString()
                                    : "";
                                  const keyFrom =
                                    (typeof t?.fromBroker === "object"
                                      ? t?.fromBroker?._id
                                      : t?.fromBroker) || "from";
                                  const keyTo =
                                    (typeof t?.toBroker === "object"
                                      ? t?.toBroker?._id
                                      : t?.toBroker) || "to";
                                  const fromRegion =
                                    getRegionName(fromB?.region) ||
                                    getRegionName(fromB?.primaryRegion) ||
                                    "";
                                  const toRegion =
                                    getRegionName(toB?.region) ||
                                    getRegionName(toB?.primaryRegion) ||
                                    "";
                                  const toId =
                                    t && typeof t.toBroker === "object"
                                      ? t.toBroker?._id || t.toBroker?.id
                                      : t?.toBroker;
                                  const isPending =
                                    pendingDeleteTransferId === String(toId);
                                  return (
                                    <li
                                      key={`${keyFrom}-${keyTo}-${t?._id || i}`}
                                      className="flex items-center gap-3"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white flex items-center justify-center text-[12px] text-gray-700"
                                          title={
                                            typeof toName === "string"
                                              ? toName
                                              : String(toName)
                                          }
                                        >
                                          <img
                                            src={
                                              toAvatar ||
                                              "https://www.w3schools.com/howto/img_avatar.png"
                                            }
                                            alt={
                                              typeof toName === "string"
                                                ? toName
                                                : "Broker"
                                            }
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 truncate">
                                          {typeof fromName === "string"
                                            ? fromName
                                            : String(fromName)}
                                          <span className="mx-1 text-slate-400">
                                            →
                                          </span>
                                          {typeof toName === "string"
                                            ? toName
                                            : String(toName)}
                                        </div>
                                        <div className="text-[12px] text-slate-500 truncate">
                                          {fromRegion || "—"}{" "}
                                          <span className="mx-1 text-slate-400">
                                            →
                                          </span>{" "}
                                          {toRegion || "—"}
                                        </div>
                                        {when && (
                                          <div className="text-[11px] text-slate-400">
                                            Shared on {when}
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={async () => {
                                          if (!toId) return;
                                          setPendingDeleteTransferId(
                                            String(toId)
                                          );
                                          await deleteTransfer(toId);
                                        }}
                                        className={`ml-2 inline-flex items-center px-2 py-1 text-[12px] rounded border ${
                                          isPending
                                            ? "border-gray-200 text-gray-400"
                                            : "border-rose-200 text-rose-700 hover:bg-rose-50"
                                        }`}
                                        title="Delete transfer"
                                      >
                                        {isPending ? "Removing…" : "Delete"}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* (Optional) Share history card – keep your existing logic if you want it below */}
                {/* <YourShareHistoryCard /> */}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0.6;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideInFromRight 0.25s ease-out both;
        }
        @keyframes slideOutToRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0.4;
          }
        }
        .animate-slide-out {
          animation: slideOutToRight 0.2s ease-in both;
        }
      `}</style>
    </ProtectedRoute>
  );
}
