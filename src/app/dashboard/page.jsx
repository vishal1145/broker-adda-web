'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import DashboardCharts from '../components/Charts';
import axios from 'axios';

import HeaderFile from '../components/Header';
import PropertyEnquiryModal from '../components/PropertyEnquiryModal';
import AddLeadModal from '../components/AddLeadModal';

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [currentBrokerId, setCurrentBrokerId] = useState('');
  const [metrics, setMetrics] = useState({
    totalLeads: null,
    propertiesListed: null,
    inquiriesReceived: 743,
    connections: 45,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [leadRows, setLeadRows] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [propertyCards, setPropertyCards] = useState([]);
  const [originalPropertyCards, setOriginalPropertyCards] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([
    { icon: '↑', text: "Updated lead status for Alice Johnson to 'Confirmed'", time: '2 hours ago' },
    { icon: '↓', text: 'Successfully closed deal for Casey Guzman. Left', time: '4 hours ago' },
    { icon: '📄', text: 'Submitted new property listing: Oasis Lotus Townhouse', time: '1 day ago' },
    { icon: '🔍', text: 'Received new inquiry from Diana Trevor', time: '3 days ago' },
    { icon: '👤', text: 'Added new broker connection: Justin Cox', time: '4 days ago' },
    { icon: '🏠', text: 'Scheduled showing for Suburban Retreat', time: '4 days ago' },
  ]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    return `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'week' : 'weeks'} ago`;
  };

  useEffect(() => {
    const getBrokerIdFromToken = () => {
      try {
        if (typeof window === 'undefined') return '';
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) return '';
        const payload = JSON.parse(atob(token.split('.')[1]));
        return (
          payload.brokerId ||
          payload.brokerDetailId ||
          payload.brokerDetailsId ||
          payload.brokerDetails?.id ||
          payload.brokerDetails?._id ||
          payload.userId ||
          payload.id ||
          ''
        );
      } catch {
        return '';
      }
    };

    const resolveBrokerId = async () => {
      const baseApi = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : '';
      const getCurrentUserIdFromToken = () => {
        try {
          if (!token) return '';
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.brokerId || payload.userId || payload.id || payload.sub || '';
        } catch { return ''; }
      };
      const currentUserId = getCurrentUserIdFromToken();
      let brokerId = '';
      if (currentUserId) {
        const res = await fetch(`${baseApi}/brokers/${currentUserId}`, {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) {
          const bj = await res.json().catch(() => ({}));
          const b = bj?.data?.broker || bj?.broker || bj?.data || bj;
          brokerId = b?._id || '';
        }
      }
      if (typeof window !== 'undefined' && brokerId) {
        localStorage.setItem('brokerId', brokerId);
        setCurrentBrokerId(brokerId);
      }
      return { brokerId, baseApi, token };
    };

    const fetchMetrics = async () => {
      try {
        setMetricsLoading(true);
        const { brokerId, baseApi, token } = await resolveBrokerId();
        const metricsUrl = `${baseApi}/leads/metrics?createdBy=${encodeURIComponent(brokerId)}`;
        const { data } = await axios.get(metricsUrl, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        const payload = data?.data ?? data;
        setMetrics({
          totalLeads: payload?.totalLeads ?? 0,
          propertiesListed: payload?.totalProperties ?? 0,
          inquiriesReceived: payload?.inquiriesReceived ?? 743,
          connections: payload?.connections ?? 45,
        });
      } catch (e) {
        setMetrics(prev => ({ 
          ...prev, 
          totalLeads: prev.totalLeads ?? 0, 
          propertiesListed: prev.propertiesListed ?? 0 
        }));
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchMetrics();

    const fetchOverviewLists = async () => {
      try {
        setLeadsLoading(true);
        setPropertiesLoading(true);
        const { brokerId, baseApi, token } = await resolveBrokerId();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const leadsRes = await fetch(`${baseApi}/leads?createdBy=${encodeURIComponent(brokerId)}&limit=4&page=1`, { headers });
        if (leadsRes.ok) {
          const lj = await leadsRes.json().catch(() => ({}));
          let list = [];
          if (Array.isArray(lj?.data?.items)) list = lj.data.items;
          else if (Array.isArray(lj?.data?.leads)) list = lj.data.leads;
          else if (Array.isArray(lj?.data)) list = lj.data;
          else if (Array.isArray(lj?.leads)) list = lj.leads;
          else if (Array.isArray(lj)) list = lj;
          setLeadRows(list.slice(0, 4));
        } else setLeadRows([]);
        setLeadsLoading(false);

        const propsRes = await fetch(`${baseApi}/properties?limit=9&page=1&brokerId=${encodeURIComponent(brokerId)}`, { headers });
        if (propsRes.ok) {
          const pj = await propsRes.json().catch(() => ({}));
          let list = [];
          if (Array.isArray(pj?.data?.items)) list = pj.data.items;
          else if (Array.isArray(pj?.data?.properties)) list = pj.data.properties;
          else if (Array.isArray(pj?.data)) list = pj.data;
          else if (Array.isArray(pj?.properties)) list = pj.properties;
          else if (Array.isArray(pj)) list = pj;
          // Normalize region to a string to avoid rendering object-as-child errors
          const mapped = list.map((property) => {
            let regionDisplay = '';
            try {
              const r = property?.region;
              if (r) {
                if (typeof r === 'object' && r !== null && !Array.isArray(r)) {
                  const parts = [r.name, r.city, r.state]
                    .filter(Boolean)
                    .filter((p) => typeof p === 'string');
                  regionDisplay = parts.length > 0 ? parts.join(', ') : '';
                } else if (typeof r === 'string') {
                  regionDisplay = r;
                } else {
                  regionDisplay = String(r || '');
                }
              }
            } catch {
              regionDisplay = '';
            }
            if (!regionDisplay || regionDisplay.trim() === '') {
              regionDisplay = property?.city || '';
            }
            return { ...property, region: String(regionDisplay || '') };
          });
          setPropertyCards(mapped.slice(0, 9));
          setOriginalPropertyCards(list.slice(0, 9));
        } else {
          setPropertyCards([]);
          setOriginalPropertyCards([]);
        }
        setPropertiesLoading(false);
      } catch {
        setLeadRows([]);
        setPropertyCards([]);
        setOriginalPropertyCards([]);
        setLeadsLoading(false);
        setPropertiesLoading(false);
      }
    };
    fetchOverviewLists();

    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const { brokerId, baseApi, token } = await resolveBrokerId();
        const res = await fetch(`${baseApi}/brokers/${encodeURIComponent(brokerId)}`, {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) {
          const pj = await res.json().catch(() => ({}));
          const profile = pj?.data?.broker || pj?.broker || pj?.data || pj;
          setProfileData(profile);
        }
      } catch (e) {
        console.error('Error fetching profile:', e);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();

    const fetchRecentActivity = async () => {
      try {
        setActivityLoading(true);
        setShowAllActivities(false); // Reset to show only first 6 when fetching new data
        const { brokerId, baseApi, token } = await resolveBrokerId();
        
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

        // Build query parameters with brokerId and userId
        const queryParams = new URLSearchParams({
          days: '7',
          ...(brokerId ? { brokerId: brokerId, userId: brokerId } : {})
        });

        const apiEndpoint = `${baseApi}/notifications/recent?${queryParams.toString()}`;
        console.log('Fetching recent activity from:', apiEndpoint, 'with brokerId:', brokerId);

        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recent activity');
        }

        const data = await response.json();
        console.log('Recent activity data:', data);
        
        // Handle different response structures
        let notificationsList = [];
        if (Array.isArray(data?.data)) {
          notificationsList = data.data;
        } else if (Array.isArray(data?.notifications)) {
          notificationsList = data.notifications;
        } else if (Array.isArray(data?.activities)) {
          notificationsList = data.activities;
        } else if (Array.isArray(data)) {
          notificationsList = data;
        } else if (data?.data?.notifications && Array.isArray(data.data.notifications)) {
          notificationsList = data.data.notifications;
        } else if (data?.data?.activities && Array.isArray(data.data.activities)) {
          notificationsList = data.data.activities;
        }

        // Transform API data to match expected format
        const activities = notificationsList.map((notif) => {
          const createdAt = notif?.createdAt ? new Date(notif.createdAt) : null;
          const timeAgo = createdAt ? getTimeAgo(createdAt) : 'Recently';
          
          // Use same icon for all notifications
          const icon = '🔔';

          return {
            icon: icon,
            text: notif?.title || notif?.type || 'Activity',
            time: timeAgo,
            timestamp: createdAt?.getTime() || 0,
          };
        });

        // Sort by timestamp (most recent first)
        activities.sort((a, b) => b.timestamp - a.timestamp);
        
        console.log('Transformed activities:', activities);
        // Use API data if available, even if empty (don't use fallback for empty API response)
        setRecentActivity(activities);
      } catch (e) {
        console.error('Error fetching recent activity:', e);
        // Keep hardcoded fallback on error (already set in initial state, don't clear it)
      } finally {
        setActivityLoading(false);
      }
    };

    fetchRecentActivity();
  }, [user]);

  const fmt = (n) => {
    if (n === null || n === undefined) return '—';
    try { return Number(n).toLocaleString('en-IN'); } catch { return String(n); }
  };

  const renderActivityIcon = (symbol) => {
    const common = 'w-3.5 h-3.5 text-gray-500';
    // Always return the same bell notification icon for all activities
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  };

  return (
    <ProtectedRoute requiredRole="broker">
      
      <HeaderFile data={{ title: 'Dashboard', breadcrumb: [{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }] }} />
      
      <div className="min-h-screen bg-white py-8">
        <div className="w-full mx-auto ">
          

          {/* Overview Section */}
          <div className="mb-8 pb-16">
            <h2 className="text-[18px] font-bold text-gray-900 mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Leads */}
            <div 
              onClick={() => router.push('/leads')}
              className="bg-white rounded-[10px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] cursor-pointer hover:shadow-md transition-shadow" 
              style={{ width: '100%', maxWidth: '258px', height: '144px' }}
            >
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[14px] leading-[20px] font-medium" style={{ fontFamily: 'Inter', color: '#565D6DFF' }}>Total Leads</div>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#565D6DFF' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                {metricsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-[20px] font-semibold text-black leading-[24px] mb-0">
                      {fmt(metrics.totalLeads)}
                    </div>
                    <div className="text-[12px] text-green-600 flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      12.5%
                    </div>
                  </>
                )}
              </div>
          </div>

            {/* Properties Listed */}
            <div 
              onClick={() => router.push('/properties-management')}
              className="bg-white rounded-[10px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] cursor-pointer hover:shadow-md transition-shadow" 
              style={{ width: '100%', maxWidth: '258px', height: '144px' }}
            >
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[14px] leading-[20px] font-medium" style={{ fontFamily: 'Inter', color: '#565D6DFF' }}>Properties Listed</div>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#565D6DFF' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>
                {metricsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-[20px] font-semibold text-black leading-[24px] mb-0">
                      {fmt(metrics.propertiesListed)}
                    </div>
                    <div className="text-[12px] text-green-600 flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      8.2%
                    </div>
                  </>
                )}
              </div>
          </div>

            {/* Inquiries Received */}
            <div className="bg-white rounded-[10px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]" style={{ width: '100%', maxWidth: '258px', height: '144px' }}>
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[14px] leading-[20px] font-medium" style={{ fontFamily: 'Inter', color: '#565D6DFF' }}>Inquiries Received</div>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#565D6DFF' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-[20px] font-semibold text-black leading-[24px] mb-0">{fmt(metrics.inquiriesReceived)}</div>
                <div className="text-[12px] text-red-600 flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  3.1%
                </div>
              </div>
            </div>

            {/* Connections */}
            <div 
              onClick={() => router.push('/create-connection')}
              className="bg-white rounded-[10px] shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] cursor-pointer hover:shadow-md transition-shadow" 
              style={{ width: '100%', maxWidth: '258px', height: '144px' }}
            >
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[14px] leading-[20px] font-medium" style={{ fontFamily: 'Inter', color: '#565D6DFF' }}>Connections</div>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#565D6DFF' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                <div className="text-[20px] font-semibold text-black leading-[24px] mb-0">{fmt(metrics.connections)}</div>
                <div className="text-[12px] text-green-600 flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  20%
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Lead Performance Overview Section */}
          <div className="mb-8 pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-bold text-gray-900">Lead Performance Overview</h2>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 text-black rounded-full text-xs font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +15% Monthly Growth
              </span>
            </div>
            <DashboardCharts />
          </div>

          {/* Recent Leads Section */}
          <div className="mb-8 pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-bold text-gray-900">Recent Leads</h2>
              <button
                onClick={() => router.push('/leads')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium text-sm rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Manage All
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              {/* left: Add Lead */}
              <button
                type="button"
                onClick={() => setIsAddLeadModalOpen(true)}
                className="flex-none w-full md:w-[220px] h-[260px] border-2 border-dashed border-gray-300 rounded-xl
                           flex flex-col items-center justify-center text-center hover:border-yellow-500 hover:bg-yellow-50 transition-colors cursor-pointer"
              >
                <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-gray-600 font-medium text-sm">Add Lead</span>
              </button>
              
              {/* right: Lead cards grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leadsLoading ? (
                // Skeleton Loader for Leads
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="group h-full relative rounded-2xl border border-gray-200 bg-white shadow-sm animate-pulse">
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 my-4"></div>
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-28"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="flex items-center gap-3">
                              <div className="h-3 bg-gray-200 rounded w-12"></div>
                              <div className="h-3 bg-gray-200 rounded w-10"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : leadRows.length > 0 ? leadRows.map((lead) => (
                <div 
                  key={lead._id} 
                  onClick={() => router.push(`/lead-details/${lead._id}`)}
                  className="group h-full relative rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                >
                  <div className="p-6">
                    {/* Top Section - Main Title */}
                    <div className="mb-4">
                      <h3 className="text-[14px] font-semibold mb-2" style={{ color: '#323743' }}>
                        {lead.propertyType || "Property"} for {lead.requirement || "inquiry"}
                      </h3>
                      
                      {/* Tags and Time */}
                      <div className="flex items-center justify-between gap-2 flex-nowrap">
                        <div className="flex items-center gap-2 flex-nowrap">
                          <span className="inline-flex items-center justify-center rounded-full h-[22px] p-[10px] whitespace-nowrap" style={{ fontFamily: 'Inter', fontSize: '11px', lineHeight: '20px', fontWeight: '600', background: '#0D542B', color: '#FFFFFF' }}>
                            {lead.requirement || ""}
                          </span>
                          <span className="inline-flex items-center justify-center rounded-full h-[22px] p-[10px] whitespace-nowrap" style={{ fontFamily: 'Inter', fontSize: '11px', lineHeight: '20px', fontWeight: '600', background: '#FDC700', color: '#1b1d20ff' }}>
                            {lead.propertyType || ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] leading-5 font-normal whitespace-nowrap flex-shrink-0" style={{ color: '#565D6D' }}>
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          {lead.addedAgo || "2h ago"}
                        </div>
                      </div>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* Middle Section - Property Details */}
                    <div className="space-y-3 mb-4">
                      {/* Preferred Location */}
                      {lead.primaryRegion?.name && (
                        <div className="flex items-center gap-2">
                          <svg className="h-3 w-3 flex-shrink-0 text-[#565D6D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <div className="flex items-center flex-wrap gap-1">
                            <span className="font-inter text-[11px] leading-5 font-medium text-[#171A1FFF]">
                              Preferred:
                            </span>
                            <span className="font-inter text-[11px] leading-5 font-normal capitalize text-[#565D6DFF]">
                              {lead.primaryRegion.name || "—"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Secondary Location */}
                      {lead.secondaryRegion?.name && (
                        <div className="flex items-center gap-2">
                          <svg className="h-3 w-3 flex-shrink-0 text-[#565D6D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <div className="flex items-center flex-wrap gap-1">
                            <span className="font-inter text-[11px] leading-5 font-medium text-[#171A1FFF]">Secondary:</span>{" "}
                            <span className="font-inter text-[11px] leading-5 font-normal capitalize text-[#565D6DFF]">
                              {lead.secondaryRegion.name}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Budget */}
                      <div className="flex items-start gap-2">
                        <svg className="h-3 w-3 flex-shrink-0 text-[#565D6D]" style={{ color: '#565D6D' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="8" width="18" height="12" rx="2" />
                          <path d="M3 12h18M9 8v8" />
                        </svg>
                        <div className="flex items-center flex-wrap gap-1">
                          <span className="font-inter text-[11px] leading-5 font-medium text-[#171A1FFF]">Budget:</span>{" "}
                          <span className="text-[11px] leading-5 font-normal" style={{ color: '#565D6D' }}>
                            {typeof lead.budget === "number"
                              ? "₹" + lead.budget.toLocaleString('en-IN')
                              : lead.budget || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section - Broker Profile and Actions */}
                    {/* {lead.createdBy && (
                      <div className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {lead.createdBy.brokerImage ? (
                              <div className="w-12 h-12 rounded-full bg-[#E5FCE4FF] overflow-hidden relative">
                                <img src={lead.createdBy.brokerImage} alt={lead.createdBy.name} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/4 translate-y-1/8"></div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-[#E5FCE4FF] flex items-center justify-center relative">
                                <span className="text-sm font-semibold" style={{ color: '#323743' }}>
                                  {((lead.createdBy.name || "").split(' ').map((n) => n[0]).slice(0, 2).join('') || "—").toUpperCase()}
                                </span>
                                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1DD75BFF] border-[1.5px] border-white translate-x-1/2 translate-y-1/2"></div>
                              </div>
                            )}

                            <div>
                              <p className="font-inter text-[11px] leading-5 font-medium text-[#171A1FFF]">
                                {lead.createdBy.name || "Unknown"}
                              </p>

                              <div className="flex items-center gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
                                <span className="flex items-center gap-1.5">
                                  <svg className="w-3 h-3 fill-none stroke-[#171A1FFF]" viewBox="0 0 24 24" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                  </svg>
                                  <span className="font-inter text-[10px] leading-5 font-normal text-[#565D6DFF]">
                                    Connect
                                  </span>
                                </span>

                                <span className="flex items-center gap-1.5">
                                  <svg className="w-3 h-3 fill-none stroke-[#171A1FFF]" viewBox="0 0 24 24" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                  </svg>
                                  <span className="font-inter text-[10px] leading-5 font-normal text-[#565D6DFF]">
                                    Chat
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              )) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
                  <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">No recent leads found</h3>
                  <p className="text-sm text-gray-600 text-center">We couldn't find any recent leads in your account.</p>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Properties Section */}
     <div className="mb-8 pb-16">
  {/* header */}
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-[18px] font-bold text-gray-900">Properties</h2>
    <button
      onClick={() => router.push('/properties-management')}
      className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium text-sm rounded-lg transition-colors cursor-pointer"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Manage All
    </button>
  </div>

  {/* ONE ROW: left add card + right wide property card */}
  <div className="flex flex-col md:flex-row gap-4">
    {/* left: Add Property */}
    <button
      type="button"
      onClick={() => router.push('/properties-management/new')}
      className="flex-none w-full md:w-[220px] h-[260px] border-2 border-dashed border-gray-300 rounded-xl
                 flex flex-col items-center justify-center text-center hover:border-yellow-500 hover:bg-yellow-50 transition-colors cursor-pointer"
    >
      <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-gray-600 font-medium text-sm">Add Property</span>
    </button>

    {/* right: ONE wide property card */}
    {propertiesLoading ? (
      // Skeleton Loader for Property
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden h-[260px] animate-pulse">
        <div className="flex flex-col sm:flex-row h-full">
          {/* Image Section - Left */}
          <div className="relative w-full sm:w-[260px] h-[260px] flex-shrink-0 bg-gray-200">
          </div>
          {/* Details Section - Right */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="mb-3">
              <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="flex flex-wrap gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
            </div>
            <div className="mt-auto">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="flex flex-wrap gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-18"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : propertyCards.length > 0 ? (
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow h-[260px]">
        <div className="flex flex-col sm:flex-row h-full">
          {/* Image Section - Left */}
          <div className="relative w-full sm:w-[260px] h-[260px] flex-shrink-0">
            <img
              src={propertyCards[0].images?.[0] || propertyCards[0].image || '/images/house.jpg'}
              alt={propertyCards[0].title || 'Property'}
              className="w-full h-full object-cover"
            />
            {/* Tag overlay - top-left */}
            <div className="absolute top-4 left-4">
              <span className="bg-[#0A421E] text-white px-3 py-1 rounded-full text-xs font-medium">
                {propertyCards[0].propertyType || 'Residential'}
              </span>
            </div>
            {/* Rating - top-right */}
            <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur rounded-full px-2 py-1 shadow-sm">
              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-medium text-gray-700">{propertyCards[0].rating || '4.7'}</span>
            </div>
            {/* Price pill bottom-left */}
            <div className="absolute bottom-4 left-4 z-10">
              <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#FDC700' }}>
                {propertyCards[0].price ? `₹${Number(propertyCards[0].price).toLocaleString('en-IN')}` : '₹45,45,454'}
              </span>
            </div>
            {/* Share icon bottom-right */}
            <button
              aria-label="Share"
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-gray-700 z-10 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>

          {/* Details Section - Right */}
          <div className="flex-1 p-6 flex flex-col">
            {/* Title */}
            <h3 className="mb-2 flex items-center gap-2" style={{ fontSize: '14px', lineHeight: '20px', fontWeight: '600', color: '#171A1FFF' }}>
              {propertyCards[0].title || 'Modern Family Home'}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (propertyCards[0]?._id || propertyCards[0]?.id) {
                    router.push(`/property-details/${propertyCards[0]._id || propertyCards[0].id}`);
                  }
                }}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="View property details"
              >
                <svg className="w-3.5 h-3.5 text-[#0A421E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M7 17l10-10M7 7h10v10" />
                </svg>
              </button>
            </h3>

            {/* Description */}
            <p className="mb-4" style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px', fontWeight: '400', color: '#565D6DFF' }}>
              {propertyCards[0].description || 'A spacious and well-lit property in a prime location, perfect for families. Enjoy modern amenities and easy access to city facilities.'}
            </p>

            {/* Location Details */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center text-xs text-gray-600">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {propertyCards[0].city || 'Agra'}
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s-7-4.5-7-12a7 7 0 1114 0c0 7.5-7 12-7 12z" />
                  <circle cx="12" cy="10" r="3" strokeWidth="2" />
                </svg>
                {(() => {
                  const region = propertyCards[0]?.region;
                  if (typeof region === 'string') return region;
                  if (typeof region === 'object' && region !== null && !Array.isArray(region)) {
                    const parts = [region.name, region.city, region.state]
                      .filter(Boolean)
                      .filter((p) => typeof p === 'string');
                    return parts.length > 0 ? parts.join(', ') : (propertyCards[0]?.city || 'Electronic City, Noida, Uttar Pradesh, India');
                  }
                  return String(region || propertyCards[0]?.city || 'Electronic City, Noida, Uttar Pradesh, India');
                })()}
              </div>
            </div>

            {/* Features */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-900 mb-2">Features</div>
              <div className="flex flex-wrap gap-2">
                {propertyCards[0].bedrooms && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1" style={{ background: '#EDFDF4FF', borderRadius: '9999px', borderWidth: '1px', borderColor: '#00000000', borderStyle: 'solid' }}>
                    <svg className="w-4 h-4" style={{ color: '#19191FFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 12l-1 8a2 2 0 002 2h16a2 2 0 002-2l-1-8M3 12V9a2 2 0 012-2h5m0 0h6a2 2 0 012 2v3m0 0v3a2 2 0 01-2 2h-6v0M9 21h6" />
                    </svg>
                    <span style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px', fontWeight: '600', color: '#19191FFF' }}>{propertyCards[0].bedrooms} bd</span>
                  </span>
                )}
                {propertyCards[0].bathrooms && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1" style={{ background: '#EDFDF4FF', borderRadius: '9999px', borderWidth: '1px', borderColor: '#00000000', borderStyle: 'solid' }}>
                    <svg className="w-4 h-4" style={{ color: '#19191FFF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0h4a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h8zm0 0v4" />
                    </svg>
                    <span style={{ fontFamily: 'Inter', fontSize: '12px', lineHeight: '16px', fontWeight: '600', color: '#19191FFF' }}>{propertyCards[0].bathrooms} bt</span>
                  </span>
                )}
                </div>
                      </div>

            {/* Amenities */}
            <div className="mt-auto">
              <div className="text-xs font-semibold text-gray-900 mb-2">Amenities</div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {(propertyCards[0].amenities && propertyCards[0].amenities.length > 0 ? propertyCards[0].amenities : ['Gym', 'Parking', 'Security', 'Swimming Pool', 'Clubhouse']).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center py-16 px-4">
          <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No properties found</h3>
          <p className="text-sm text-gray-600 text-center">We couldn't find any properties in your account.</p>
        </div>
      )}
    </div>

  {/* bottom CTA */}
<div className="flex justify-center mt-7 text-[14px]">
  <button 
    onClick={() => {
      // Extract region ID from the original property data (before normalization)
      const originalProperty = originalPropertyCards[0] || propertyCards[0];
      const region = originalProperty?.region;
      let regionId = '';
      
      // Handle different region data formats
      if (region) {
        if (typeof region === 'object' && region !== null && !Array.isArray(region)) {
          // If region is an object, try to get _id or id
          regionId = region._id || region.id || '';
        } else if (typeof region === 'string') {
          // Check if string looks like a MongoDB ObjectId (24 hex characters)
          if (/^[0-9a-fA-F]{24}$/.test(region)) {
            regionId = region;
          }
        }
      }
      
      // Navigate to search page with brokers tab and regionId filter
      if (regionId) {
        router.push(`/search?tab=brokers&regionId=${encodeURIComponent(regionId)}`);
      } else {
        // Otherwise, just navigate to search page with brokers tab
        router.push('/search?tab=brokers');
      }
    }}
    className="px-6 py-3 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
    Find Broker in your regions
  </button>
</div>

                </div>

          {/* Recent Activity and Performance Summary Section */}
          <div className="grid grid-cols-1  gap-6 pb-16">
           {/* Recent Activity */}
           <div className="bg-white rounded-[10px] p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[18px] font-semibold text-gray-900">Recent Activity</h2>
                {!showAllActivities && recentActivity.length > 6 && (
                  <button
                    onClick={() => setShowAllActivities(true)}
                    className="text-sm text-[#0d542b] hover:opacity-80 font-medium cursor-pointer"
                  >
                    View All
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-100">
                {(showAllActivities ? recentActivity : recentActivity.slice(0, 6)).map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 py-2.5">
                    <div className="w-6 h-6 rounded-full border border-gray-200 bg-white flex items-center justify-center">
                      {renderActivityIcon(activity.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-800 truncate">{activity.text}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

           
            
          </div>
{/* === Performance Summary (static, no functions) === */}
<section className="mt-6">
  <h3 className="mb-4 text-[18px] font-semibold text-gray-900">Performance Summary</h3>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {/* Card 1 */}
    <div className="rounded-[10px] border border-gray-200 bg-white p-6 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
      <div className="mb-4 text-center">
        <div className="text-xs font-medium text-gray-700">Lead Conversion Rate</div>
        <div className="text-[11px] text-gray-500">Target: 80%</div>
      </div>
      <div className="flex items-center justify-center">
        {/* ring */}
        <div
          className="relative h-28 w-28 rounded-full"
          style={{
            background: "conic-gradient(#0B5C2A 0deg 270deg, #F1F2F4 270deg 360deg)", // ~75% fill with a small gap
          }}
        >
          {/* inner cutout */}
          <div className="absolute inset-[10px] rounded-full bg-white" />
          {/* center text */}
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-base font-semibold text-gray-900">75%</span>
          </div>
        </div>
      </div>
    </div>

    {/* Card 2 */}
    <div className="rounded-[10px] border border-gray-200 bg-white p-6 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
      <div className="mb-4 text-center">
        <div className="text-xs font-medium text-gray-700">Average Response Time</div>
        <div className="text-[11px] text-gray-500">Target: 4 hours</div>
      </div>
      <div className="flex items-center justify-center">
        <div
          className="relative h-28 w-28 rounded-full"
          style={{
            background: "conic-gradient(#111111 0deg 300deg, #F1F2F4 300deg 360deg)", // ~83% fill
          }}
        >
          <div className="absolute inset-[10px] rounded-full bg-white" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-base font-semibold text-gray-900">90 mins</span>
          </div>
        </div>
      </div>
    </div>

    {/* Card 3 */}
    <div className="rounded-[10px] border border-gray-200 bg-white p-6 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
      <div className="mb-4 text-center">
        <div className="text-xs font-medium text-gray-700">Property Approval Ratio</div>
        <div className="text-[11px] text-gray-500">Target: 90%</div>
      </div>
      <div className="flex items-center justify-center">
        <div
          className="relative h-28 w-28 rounded-full"
          style={{
            background: "conic-gradient(#111111 0deg 290deg, #F1F2F4 290deg 360deg)", // ~80-85% fill
          }}
        >
          <div className="absolute inset-[10px] rounded-full bg-white" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-base font-semibold text-gray-900">85%</span>
          </div>
        </div>
      </div>
    </div>
                </div>
              </section>

          {/* Profile Section */}
          <section className="mt-8 pb-16 hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-semibold text-gray-900">Profile Information</h3>
              <a
                href="/profile"
                className="inline-flex items-center gap-2 text-sm text-green-900 hover:text-green-800 font-medium"
              >
                Edit Profile
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </a>
            </div>

            {profileLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="bg-white rounded-[10px] border border-gray-200 p-6 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : profileData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal Information Card */}
                <div className="bg-white rounded-[10px] border border-gray-200 p-6 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-[16px] font-semibold text-gray-900">Personal Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Full Name</p>
                      <p className="text-[14px] font-medium text-gray-900 break-words">{profileData?.name || profileData?.fullName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Email</p>
                      <p className="text-[14px] font-medium text-gray-900 break-words">{profileData?.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Phone</p>
                      <p className="text-[14px] font-medium text-gray-900 break-words">{profileData?.phone || profileData?.whatsappNumber || '—'}</p>
                    </div>
                    {profileData?.city && (
                      <div>
                        <p className="text-[12px] text-gray-500 mb-1">Location</p>
                        <p className="text-[14px] font-medium text-gray-900 break-words">{profileData.city}{profileData?.state ? `, ${profileData.state}` : ''}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Details Card */}
                <div className="bg-white rounded-[10px] border border-gray-200 p-6 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-[16px] font-semibold text-gray-900">Professional Details</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Firm Name</p>
                      <p className="text-[14px] font-medium text-gray-900 break-words">{profileData?.firmName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">License Number</p>
                      <p className="text-[14px] font-medium text-gray-900 break-words">{profileData?.licenseNumber || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Experience</p>
                      <p className="text-[14px] font-medium text-gray-900 break-words">
                        {typeof profileData?.experience === 'object' 
                          ? `${profileData.experience?.years || 0}+ Years`
                          : profileData?.experience 
                          ? `${profileData.experience} Years`
                          : '—'}
                      </p>
                    </div>
                    {Array.isArray(profileData?.specializations) && profileData.specializations.length > 0 && (
                      <div>
                        <p className="text-[12px] text-gray-500 mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {profileData.specializations.map((spec, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* About & Regions Card */}
                <div className="bg-white rounded-[10px] border border-gray-200 p-6 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h4 className="text-[16px] font-semibold text-gray-900">About & Regions</h4>
                  </div>
                  <div className="space-y-3">
                    {profileData?.content || profileData?.about || profileData?.bio ? (
                      <div>
                        <p className="text-[12px] text-gray-500 mb-1">About</p>
                        <p className="text-[14px] text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                          {profileData?.content || profileData?.about || profileData?.bio || '—'}
                        </p>
                      </div>
                    ) : null}
                    {Array.isArray(profileData?.region) && profileData.region.length > 0 && (
                      <div>
                        <p className="text-[12px] text-gray-500 mb-2">Service Regions</p>
                        <div className="flex flex-wrap gap-2">
                          {profileData.region.map((reg, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                              {typeof reg === 'string' ? reg : reg?.name || '—'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profileData?.website && (
                      <div>
                        <p className="text-[12px] text-gray-500 mb-1">Website</p>
                        <a 
                          href={profileData.website} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[14px] text-green-700 hover:text-green-800 break-all"
                        >
                          {profileData.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-[10px] border border-gray-200">
                <p className="text-gray-500">No profile information available</p>
              </div>
            )}
          </section>

          {/* Bottom CTA Buttons */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-[14px]">
            {/* <button 
              onClick={() => router.push('/leads')}
              className="px-5 py-3 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add New Lead
            </button>
            <button 
              onClick={() => router.push('/properties-management/new')}
              className="px-5 py-3 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Post New Property
            </button> */}
            {/* <button 
              className="px-5 py-3 bg-green-900 text-white rounded-lg font-medium hover:bg-green-800 transition-colors inline-flex items-center justify-center gap-2"
              onClick={() => setIsEnquiryModalOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0h4a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h8zm0 0v4" />
              </svg>
              Add Property Enquiry
            </button> */}
          </div>
        </div>
      </div>
      <PropertyEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        propertyId={selectedPropertyId}
      />
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onSuccess={async () => {
          // Refresh metrics and leads after successful lead creation
          const baseApi = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
          const tok = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : '';
          const bid = currentBrokerId || (typeof window !== 'undefined' ? localStorage.getItem('brokerId') : '');
          
          if (!bid) return;
          
          try {
            // Refresh metrics
            const metricsUrl = `${baseApi}/leads/metrics?createdBy=${encodeURIComponent(bid)}`;
            const { data } = await axios.get(metricsUrl, { headers: tok ? { Authorization: `Bearer ${tok}` } : {} });
            const payload = data?.data ?? data;
            setMetrics({
              totalLeads: payload?.totalLeads ?? 0,
              propertiesListed: payload?.totalProperties ?? 0,
              inquiriesReceived: payload?.inquiriesReceived ?? 743,
              connections: payload?.connections ?? 45,
            });
          } catch (e) {
            console.error('Error refreshing metrics:', e);
          }
          // Refresh leads list
          try {
            setLeadsLoading(true);
            const headers = tok ? { Authorization: `Bearer ${tok}` } : {};
            const leadsRes = await fetch(`${baseApi}/leads?createdBy=${encodeURIComponent(bid)}&limit=4&page=1`, { headers });
            if (leadsRes.ok) {
              const lj = await leadsRes.json().catch(() => ({}));
              let list = [];
              if (Array.isArray(lj?.data?.items)) list = lj.data.items;
              else if (Array.isArray(lj?.data?.leads)) list = lj.data.leads;
              else if (Array.isArray(lj?.data)) list = lj.data;
              else if (Array.isArray(lj?.leads)) list = lj.leads;
              else if (Array.isArray(lj)) list = lj;
              setLeadRows(list.slice(0, 4));
            }
          } catch (e) {
            console.error('Error refreshing leads:', e);
          } finally {
            setLeadsLoading(false);
          }
        }}
        brokerId={currentBrokerId}
      />
    </ProtectedRoute>
  );
};

export default Dashboard;