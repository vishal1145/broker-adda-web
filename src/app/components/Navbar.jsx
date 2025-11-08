'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaTimes, FaBell } from 'react-icons/fa';

import shopData from '../data/shop.json';
import relatedProducts from '../data/relatedProduct.json';
import furnitureData from '../data/furnitureData.json';

const Navbar = ({ data }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageLoading, setProfileImageLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Fallback hardcoded notifications
  const fallbackNotifications = [
    { id: 1, title: 'New Lead Received', message: 'You have received a new lead for a 3BHK apartment in Mumbai', time: '2 minutes ago', unread: true },
    { id: 2, title: 'Property Inquiry', message: 'Customer interested in your commercial property listing', time: '1 hour ago', unread: true },
    { id: 3, title: 'Lead Transfer', message: 'A lead has been shared with you by another broker', time: '3 hours ago', unread: true },
    { id: 4, title: 'Profile Update Required', message: 'Please complete your broker profile to get more visibility', time: '1 day ago', unread: false },
    { id: 5, title: 'New Connection Request', message: 'Rajesh Kumar wants to connect with you', time: '2 days ago', unread: false },
    { id: 6, title: 'Property Sold', message: 'Congratulations! Your property listing has been sold', time: '3 days ago', unread: false },
    { id: 7, title: 'Payment Received', message: 'Payment of ₹50,000 has been received for property commission', time: '4 days ago', unread: false },
  ];

  useEffect(() => setIsMounted(true), []);

  // Get broker ID from token
  const getBrokerIdFromToken = () => {
    try {
      if (typeof window === 'undefined') return '';
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) return '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // userId can be string ID or object with _id
      let brokerId = '';
      if (payload.userId) {
        if (typeof payload.userId === 'string') {
          brokerId = payload.userId;
        } else if (payload.userId._id) {
          brokerId = payload.userId._id;
        }
      }
      
      // Fallback to other possible fields
      if (!brokerId) {
        brokerId = (
          payload.brokerId ||
          payload.brokerDetailId ||
          payload.brokerDetailsId ||
          payload.brokerDetails?.id ||
          payload.brokerDetails?._id ||
          payload.id ||
          ''
        );
      }
      
      console.log('Broker ID from token:', brokerId, 'Full payload:', payload);
      return brokerId;
    } catch (e) {
      console.error('Error extracting broker ID from token:', e);
      return '';
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
      const brokerId = getBrokerIdFromToken();
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      // Add brokerId to query params if available (try both brokerId and userId)
      let queryParams = '';
      if (brokerId) {
        queryParams = `?brokerId=${encodeURIComponent(brokerId)}&userId=${encodeURIComponent(brokerId)}`;
      }
      const apiEndpoint = `${apiUrl}/notifications${queryParams}`;
      console.log('Fetching notifications from:', apiEndpoint, 'with brokerId:', brokerId);
      
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      console.log('Notifications data:', data);
      
      // Handle different response structures
      let notificationsList = [];
      if (Array.isArray(data?.data)) {
        notificationsList = data.data;
      } else if (Array.isArray(data?.notifications)) {
        notificationsList = data.notifications;
      } else if (Array.isArray(data)) {
        notificationsList = data;
      } else if (data?.data?.notifications && Array.isArray(data.data.notifications)) {
        notificationsList = data.data.notifications;
      }

      // Transform API data to match expected format
      const transformedNotifications = notificationsList.map((notif, index) => ({
        id: notif?._id || notif?.id || index + 1,
        title: notif?.title || notif?.type || 'Notification',
        message: notif?.message || notif?.body || notif?.description || '',
        time: notif?.createdAt ? formatTimeAgo(notif.createdAt) : notif?.time || 'Recently',
        unread: notif?.isRead === false || notif?.read === false || notif?.unread === true || false
      }));

      console.log('Transformed notifications:', transformedNotifications);
      // Use API data if available, even if empty (don't use fallback for empty API response)
      setNotifications(transformedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      // Clear notifications on error (don't show fallback)
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Format time ago helper
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Recently';
    }
  };

  // Fetch notifications on mount and when user is available
  useEffect(() => {
    if (isMounted) {
      if (user) {
        fetchNotifications();
      } else {
        // Clear notifications when user is not logged in
        setNotifications([]);
      }
    }
  }, [isMounted, user]);

  // Listen for notifications update event (from notifications page)
  useEffect(() => {
    const handleNotificationsUpdate = () => {
      if (user && isMounted) {
        fetchNotifications();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('notificationsUpdated', handleNotificationsUpdate);
      return () => {
        window.removeEventListener('notificationsUpdated', handleNotificationsUpdate);
      };
    }
  }, [user, isMounted]);

  const router = useRouter();
  const pathname = usePathname();
  const isCartPage = pathname === '/cart';

  // Load profile image from API (JS only)
  useEffect(() => {
    const loadProfileImage = async () => {
      if (!user?.token || !user?.userId) {
        setProfileImage(null);
        setProfileImageLoading(false);
        return;
      }

      setProfileImageLoading(true);
      try {
        const currentUserRole = user.role || 'broker';
        const apiUrl =
          currentUserRole === 'customer'
          ? `${process.env.NEXT_PUBLIC_API_URL}/customers/${user.userId}`
          : `${process.env.NEXT_PUBLIC_API_URL}/brokers/${user.userId}`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const payload = await response.json();
          
          if (currentUserRole === 'customer') {
            const c = payload.data?.customer || payload.data || payload;
            const img =
              (c.images && c.images.customerImage) ||
              (c.files && c.files.customerImage) ||
              c.customerImage ||
              c.profileImage ||
                                null;
            setProfileImage(img);
          } else {
            const b = payload.data?.broker || payload.data || payload;
            setProfileImage(b.brokerImage || b.profileImage || null);
          }
        }
      } catch (err) {
        setProfileImage(null);
      } finally {
        setProfileImageLoading(false);
      }
    };

    if (user?.token && user?.userId) loadProfileImage();
  }, [user?.token, user?.userId, user?.role]);

  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);

  // Aggregate products for search suggestions
  const allProducts = useMemo(
    () => [
      ...(shopData?.products || []),
      ...(relatedProducts || []),
      ...(furnitureData?.products?.items || []),
    ],
    []
  );

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const filtered = allProducts.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q)
      );
      setSuggestions(filtered.slice(0, 5));
  }, [searchQuery, allProducts]);

  const goPropertiesWithQuery = async (q) => {
    // Try to match query with region names from API
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/regions`);
      if (response.ok) {
        const data = await response.json();
        let regionsData = [];
        
        if (Array.isArray(data?.data)) {
          regionsData = data.data;
        } else if (Array.isArray(data?.regions)) {
          regionsData = data.regions;
        } else if (Array.isArray(data)) {
          regionsData = data;
        } else if (data?.data?.regions && Array.isArray(data.data.regions)) {
          regionsData = data.data.regions;
        }
        
        // Check if query matches any region name (case-insensitive, exact or partial match)
        const queryLower = q.toLowerCase().trim();
        const matchedRegion = regionsData.find(region => {
          const regionName = typeof region === 'string' 
            ? region 
            : (region.name || region.city || region.state || '');
          const regionNameLower = regionName.toLowerCase().trim();
          // Exact match or if query is contained in region name or vice versa
          return regionNameLower === queryLower || 
                 regionNameLower.includes(queryLower) || 
                 queryLower.includes(regionNameLower);
        });
        
        if (matchedRegion) {
          // If it's a region match, pass regionId
          const regionId = typeof matchedRegion === 'object' ? (matchedRegion._id || matchedRegion.id) : null;
          if (regionId) {
            const params = new URLSearchParams({ tab: 'brokers', regionId: regionId });
            router.push(`/search?${params.toString()}`);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error checking region match:', error);
    }
    
    // Default: pass as query parameter for company name search
    const params = new URLSearchParams({ tab: 'brokers', q: q });
    router.push(`/search?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Close suggestions & notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) setShowSuggestions(false);
      if (!e.target.closest('.notification-container')) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Counts from localStorage
  useEffect(() => {
    const updateCounts = () => {
        try {
        const wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistCount(Array.isArray(wl) ? wl.length : 0);

        const ct = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(Array.isArray(ct) ? ct.length : 0);
        } catch {
          setWishlistCount(0);
          setCartCount(0);
      }
    };

    updateCounts();

    const onStorage = (e) => {
      if (e.key === 'wishlist' || e.key === 'cart') updateCounts();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('wishlistUpdated', updateCounts);
    window.addEventListener('cartUpdated', updateCounts);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('wishlistUpdated', updateCounts);
      window.removeEventListener('cartUpdated', updateCounts);
    };
  }, []);

const enableSuggestions = false; 

  return (
    <nav className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-100 shadow-sm fixed top-0 left-0 right-0 z-80">
      <div className=" mx-auto px-[6rem] ">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 group"
            aria-label="Broker Gully Home"
          >
            <span className="rounded-full overflow-hidden">
              <img
                src="/BROKER_GULLY_FINAL_LOGO_ICON_JPG__1_-removebg-preview.png"
                alt="Broker Gully"
                className="w-10 h-10 object-contain transition-transform group-hover:scale-[1.03]"
              />
            </span>
            <span className="text-xl font-semibold text-gray-800 cursor-pointer">
              {data?.logo?.text || 'Broker Gully'}
            </span>
          </button>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-lg mx-4 search-container relative">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery && searchQuery.trim()) {
                goPropertiesWithQuery(searchQuery.trim());
              }
            }} className="relative" role="search">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (searchQuery && searchQuery.trim()) {
                goPropertiesWithQuery(searchQuery.trim());
              }
            }
          }}
                placeholder="Search properties, brokers, locations…"
                className="w-full pl-10 pr-24 py-2.5 text-sm border border-gray-300/70 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0d542b] focus:border-transparent"
          onFocus={() =>
            enableSuggestions ? setShowSuggestions(true) : setShowSuggestions(false)
          }
        />
        <FaSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
                aria-hidden
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
          >
            <FaTimes size={14} />
          </button>
        )}
        <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1 rounded-full border border-gray-300 hover:border-gray-400 transition"
                onClick={(e) => {
                  e.preventDefault();
                  if (searchQuery && searchQuery.trim()) {
                    goPropertiesWithQuery(searchQuery.trim());
                  }
                }}
        >
          Search
        </button>
      </form>

            {/* Suggestions (disabled by flag) */}
      {enableSuggestions && showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id ?? `${s.name}-${s.type}`}
                    onClick={() => {
                      const name = s?.name || '';
                      if (!name) return;
                      setSearchQuery(name);
                      goPropertiesWithQuery(name);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left p-3 transition-colors border-b last:border-b-0 hover:bg-gray-50 flex items-center gap-3"
            >
              <img
                      src={s.image || '/images/chair2.png'}
                alt={s.name}
                className="w-10 h-10 object-contain rounded"
                onError={(e) => {
                        e.currentTarget.src = '/images/chair2.png';
 }}
              />
              <div>
                <div className="font-medium text-gray-900">{s.name}</div>
                <div className="text-sm text-gray-500">
                  {s.type} • ${s.price}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
           </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Conditional CTA based on user role - only show when logged in */}
            {isMounted && user && (
              <>
                {user.role === 'broker' ? (
                  <Link
                    href="/properties-management/new"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:border-[#0d542b] hover:text-[#0d542b] hover:shadow-sm transition"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M3 10.5 12 3l9 7.5" />
                      <path d="M5 10v9h14v-9" />
                      <path d="M9 19v-6h6v6" />
                    </svg>
                    <span>List Property</span>
                  </Link>
                ) : (
                  <Link
                    href="/property-enquiry"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:border-[#0d542b] hover:text-[#0d542b] hover:shadow-sm transition"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="9" y1="10" x2="15" y2="10" />
                      <line x1="9" y1="14" x2="13" y2="14" />
                    </svg>
                    <span>Post Enquiry</span>
                  </Link>
                )}
              </>
            )}


            {/* Notification Icon - Only show when logged in */}
            {isMounted && user && (
              <div className="relative notification-container">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowAllNotifications(false);
                  }}
                  className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-700 hover:border-[#0d542b] hover:text-[#0d542b] hover:shadow-sm transition"
                  aria-label="Notifications"
                >
                  <FaBell className="w-4 h-4" />
                  {/* Notification badge */}
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                        {!showAllNotifications && notifications.length > 3 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowNotifications(false);
                              router.push('/notifications');
                            }}
                            className="text-sm text-[#0d542b] hover:opacity-80 font-medium cursor-pointer"
                          >
                            View All
                          </button>
                        )}
                      </div>
                      {/* <p className="text-xs text-gray-500">{notifications.length} total</p> */}
                    </div>
                    <div className="py-2">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-gray-500">No notifications</p>
                        </div>
                      ) : (
                        (showAllNotifications ? notifications : notifications.slice(0, 3)).map((n) => (
                          <div
                            key={n.id}
                            className={
                              'px-4 py-3 hover:bg-gray-50 ' +
                              (n.unread)
                            }
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={'text-[12px] font-medium ' + (n.unread ? 'text-gray-900' : 'text-gray-700')}>
                                  {n.title}
                                </h4>
                                <p className="text-xs text-gray-400  mt-1">{n.time}</p>
                              </div>
                              {n.unread}
                               {/* && <span className="w-2 h-2 bg-green-500 rounded-full mt-1 ml-2" /> */}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {/* <div className="p-3 border-t border-gray-200">
                      <button className="w-full text-center text-sm text-[#0d542b] hover:opacity-80 font-medium">
                        Mark all as read
                      </button>
                    </div> */}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            {/* <Link
              href="/wishlist"
              className="relative inline-flex items-center justify-center rounded-full border border-gray-300 w-9 h-9 hover:border-[#0d542b] hover:text-[#0d542b] transition"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L4.22 13 12 20.77 19.78 13l1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link> */}

            {/* Notifications (when logged in) */}
            {/* {user && (
              <div className="relative notification-container">
                <button
                  onClick={() => setShowNotifications((s) => !s)}
                  className="relative inline-flex items-center justify-center rounded-full border border-gray-300 w-9 h-9 hover:border-[#0d542b] hover:text-[#0d542b] transition"
                  aria-label="Notifications"
                >
                  <FaBell size={16} />
                  {notifications.filter((n) => n.unread).length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {notifications.filter((n) => n.unread).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-500">{notifications.length} total</p>
                    </div>
                    <div className="py-2">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={
                            'px-4 py-3 hover:bg-gray-50 border-l-4 ' +
                            (n.unread ? 'border-green-500 bg-green-50' : 'border-transparent')
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={'text-sm font-medium ' + (n.unread ? 'text-gray-900' : 'text-gray-700')}>
                                {n.title}
                              </h4>
                              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                            </div>
                            {n.unread && <span className="w-2 h-2 bg-green-500 rounded-full mt-1 ml-2" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button className="w-full text-center text-sm text-[#0d542b] hover:opacity-80 font-medium">
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )} */}

            {/* Auth (Login → Join) */}
            {isMounted && (
              <>
                {user ? (
                    <div className="relative group">
                    <button className="flex items-center gap-2 text-gray-700 hover:text-[#0d542b] transition">
                      <span className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#0d542b]/80 group-hover:border-[#0d542b] transition">
                          {profileImageLoading ? (
                          <span className="w-full h-full bg-gray-200 animate-pulse block" />
                          ) : (
                            <img
                              src={profileImage || '/images/user-1.webp'}
                              alt="Profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/images/user-1.webp';
                              }}
                            />
                          )}
                      </span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                        {user.role === 'broker' ? (
                          <>
                              <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Dashboard
                              </Link>
                              <Link href="/profile?mode=view" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Profile
                              </Link>
                              <Link href="/leads" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Leads
                              </Link>
                              <Link href="/properties-management" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Properties
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href="/customer-profile?mode=view" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Profile
                              </Link>
                              <Link href="/saved-properties" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Saved Properties
                              </Link>
                            </>
                          )}
                        <div className="border-t border-gray-200 my-1" />
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Logout
                          </button>
                      </div>
                    </div>
                  </div>
                ) : (
                    <Link
                      href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#0d542b] text-white text-sm font-medium hover:shadow-md hover:brightness-110 active:brightness-95 transition"
                  >
                  
                    <span>Join</span>
                    </Link>
                )}
              </>
            )}

            {/* Mobile menu */}
              <button
                onClick={toggleMobileMenu}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 hover:border-[#0d542b] hover:text-[#0d542b] transition"
              aria-label="Open menu"
              >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <ul className={`md:hidden ${mobileMenuOpen ? 'flex' : 'hidden'} flex-col gap-4 pb-4 text-sm font-medium text-gray-700`}>
          {(data?.menuItems || []).map((item, i) => (
            <li key={i}>
              <Link href={item.href} className="block px-1 py-1 rounded hover:bg-gray-50">
                {item.name}
              </Link>
            </li>
          ))}

          {/* Mobile CTAs - only show when logged in */}
          {isMounted && user && (
            <li>
              {user.role === 'broker' ? (
                <Link
                  href="/properties-management/new"
                  className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#0d542b] text-white"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5 10v9h14v-9" />
                    <path d="M9 19v-6h6v6" />
                  </svg>
                  <span>List Property</span>
                </Link>
              ) : (
                <Link
                  href="/property-enquiry"
                  className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#0d542b] text-white"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <line x1="9" y1="10" x2="15" y2="10" />
                    <line x1="9" y1="14" x2="13" y2="14" />
                  </svg>
                  <span>Post Enquiry</span>
                </Link>
              )}
            </li>
          )}

          {isMounted && (
            <>
              {user ? (
                <>
                  {user.role === 'broker' && (
                    <li>
                      <Link href="/dashboard" className="block px-1 py-1 rounded hover:bg-gray-50">
                        Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href={user.role === 'customer' ? "/customer-profile?mode=view" : "/profile?mode=view"} className="block px-1 py-1 rounded hover:bg-gray-50">
                      Profile
                    </Link>
                  </li>
                  {user.role === 'customer' && (
                    <li>
                      <Link href="/saved-properties" className="block px-1 py-1 rounded hover:bg-gray-50">
                        Saved Properties
                      </Link>
                    </li>
                  )}
                  <li>
                    <button onClick={handleLogout} className="text-left px-1 py-1 text-red-600">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href="/signup"
                    className="inline-flex w-full items-center justify-center px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold hover:text-[#0d542b] hover:border-[#0d542b] hover:shadow-sm transition-all duration-200"
                  >
                    Join
                    </Link>
                  </li>
              )}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
