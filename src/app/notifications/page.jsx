'use client';

import React, { useState, useEffect } from 'react';
import HeaderFile from '../components/Header';
import ProtectedRoute from '../components/ProtectedRoute';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // SVG Icon Components
  const FilterIcons = {
    all: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    lead: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    property: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    broker: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    unread: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )
  };

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All', iconKey: 'all' },
    { id: 'lead', label: 'New Leads', iconKey: 'lead' },
    { id: 'property', label: 'Properties', iconKey: 'property' },
    { id: 'broker', label: 'Broker', iconKey: 'broker' },
    // { id: 'unread', label: 'Unread', iconKey: 'unread' }
  ];

  // Filter notifications based on active filter
  const getFilteredNotifications = () => {
    if (activeFilter === 'all') {
      return allNotifications;
    }
    
    return allNotifications.filter(notif => {
      const title = (notif.title || '').toLowerCase();
      const message = (notif.message || '').toLowerCase();
      
      switch (activeFilter) {
        case 'lead':
          return title.includes('lead') || message.includes('lead') || title.includes('new lead');
        case 'property':
          return title.includes('property') || message.includes('property') || 
                 title.includes('sold') || title.includes('listing') ||
                 message.includes('apartment') || message.includes('house') ||
                 message.includes('commercial') || message.includes('residential');
        case 'broker':
          return title.includes('broker') || message.includes('broker') ||
                 title.includes('connection') || title.includes('transfer') ||
                 message.includes('connect');
        case 'unread':
          return notif.unread === true;
        default:
          return true;
      }
    });
  };

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

  // Fetch notifications from API with pagination support
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const brokerId = getBrokerIdFromToken();
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      // Fetch all notifications by using a high limit or fetching all pages
      let allNotificationsList = [];
      let currentPage = 1;
      let hasMorePages = true;
      const limit = 100; // Fetch 100 per page

      while (hasMorePages) {
        // Add brokerId and pagination to query params
        let queryParams = `?page=${currentPage}&limit=${limit}`;
        if (brokerId) {
          queryParams += `&brokerId=${encodeURIComponent(brokerId)}&userId=${encodeURIComponent(brokerId)}`;
        }
        
        const apiEndpoint = `${apiUrl}/notifications${queryParams}`;
        console.log(`Fetching notifications page ${currentPage} from:`, apiEndpoint);
        
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        console.log(`Page ${currentPage} notifications data:`, data);
        
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
        } else if (data?.data?.items && Array.isArray(data.data.items)) {
          notificationsList = data.data.items;
        }

        // Add notifications from this page
        allNotificationsList = [...allNotificationsList, ...notificationsList];

        // Check if there are more pages
        const pagination = data?.pagination || data?.data?.pagination;
        if (pagination) {
          hasMorePages = pagination.hasNextPage === true || (pagination.page < pagination.pages);
          currentPage++;
          console.log(`Pagination info: page ${pagination.page} of ${pagination.pages}, hasNextPage: ${pagination.hasNextPage}`);
        } else {
          // If no pagination info, check if we got fewer notifications than the limit
          hasMorePages = notificationsList.length === limit;
          currentPage++;
          console.log(`No pagination info, got ${notificationsList.length} notifications, hasMorePages: ${hasMorePages}`);
        }

        // Safety limit to prevent infinite loops
        if (currentPage > 100) {
          console.warn('Reached safety limit of 100 pages, stopping pagination');
          hasMorePages = false;
        }
      }

      console.log(`Total notifications fetched: ${allNotificationsList.length}`);

      // Transform API data to match expected format
      const transformedNotifications = allNotificationsList.map((notif, index) => ({
        id: notif?._id || notif?.id || index + 1,
        title: notif?.title || notif?.type || 'Notification',
        message: notif?.message || notif?.body || notif?.description || '',
        time: notif?.createdAt ? formatTimeAgo(notif.createdAt) : notif?.time || 'Recently',
        unread: notif?.isRead === false || notif?.read === false || notif?.unread === true || false
      }));

      console.log('Total transformed notifications:', transformedNotifications.length);
      // Use API data if available, even if empty (don't use fallback for empty API response)
      setAllNotifications(transformedNotifications);
      // Filter will be applied via useEffect
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
      setAllNotifications([]);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      if (!token) {
        console.warn('No token found, cannot mark notifications as read');
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const apiEndpoint = `${apiUrl}/notifications/read-all`;
      console.log('Calling mark all as read API:', apiEndpoint);
      console.log('Method: PATCH');
      console.log('Headers:', headers);

      const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers
      });

      console.log('Mark all as read response status:', response.status);
      console.log('Mark all as read response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        console.log('All notifications marked as read successfully:', responseData);
        
        // Update local state to mark all as read
        setAllNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        
        // Trigger a custom event to refresh notifications in Navbar
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('notificationsUpdated'));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to mark all notifications as read:', response.status, errorData);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  useEffect(() => {
    const loadAndMarkRead = async () => {
      console.log('Notifications page loaded, fetching notifications and marking as read...');
      await fetchNotifications();
      // Mark all as read after fetching notifications
      console.log('Calling markAllAsRead after notifications fetched...');
      await markAllAsRead();
    };
    
    // Only run if we're in the browser
    if (typeof window !== 'undefined') {
      loadAndMarkRead();
    }
  }, []);

  // Update filtered notifications when filter changes
  useEffect(() => {
    if (allNotifications.length === 0) {
      setNotifications([]);
      return;
    }
    
    const filtered = getFilteredNotifications();
    setNotifications(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, allNotifications]);

  const headerData = {
    title: 'Notifications',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Notifications', href: '/notifications' }
    ]
  };

  return (
    <ProtectedRoute>
      <HeaderFile data={headerData} />
      
      <div className="min-h-screen bg-gray-50 py-8 w-screen relative left-1/2 -translate-x-1/2 overflow-x-hidden">
        <div className="w-full mx-auto px-[6rem] pt-4 ">
          {/* Header Section */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-[24px] font-bold text-gray-900 mb-2">
                Notifications
              </h1>
              <p className="text-[14px] font-normal text-gray-600">
                View and manage all your notifications
              </p>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors min-w-[150px] justify-between"
              >
                <div className="flex items-center gap-2">
                  {FilterIcons[filterOptions.find(f => f.id === activeFilter)?.iconKey || 'all']}
                  <span>{filterOptions.find(f => f.id === activeFilter)?.label || 'All'}</span>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  ></div>
                  <div className="absolute top-full right-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 overflow-hidden">
                    {filterOptions.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setActiveFilter(filter.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                          activeFilter === filter.id
                            ? 'bg-green-50 text-[#0D542B] font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {FilterIcons[filter.iconKey]}
                        <span>{filter.label}</span>
                        {activeFilter === filter.id && (
                          <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d542b]"></div>
              </div>
              <p className="text-center text-gray-600 mt-4">Loading notifications...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="bg-white border border-red-200 rounded-xl p-8 text-center shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-[16px] font-semibold text-gray-900 mb-1">{error}</p>
                <p className="text-[14px] text-gray-600">Please check your connection and try again.</p>
              </div>
              <button
                onClick={fetchNotifications}
                className="px-6 py-2.5 bg-[#0D542B] text-white rounded-xl hover:bg-[#0B4624] transition-colors text-[14px] font-semibold shadow-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Notifications List */}
          {!isLoading && !error && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-300 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-semibold text-gray-900 mb-2">
                    {activeFilter === 'all' ? 'No notifications' : `No ${filterOptions.find(f => f.id === activeFilter)?.label.toLowerCase()} notifications`}
                  </h3>
                  <p className="text-[14px] text-gray-600">
                    {activeFilter === 'all' 
                      ? "You don't have any notifications yet."
                      : `Try selecting a different filter or check back later.`
                    }
                  </p>
                </div>
              ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  // Determine notification type for icon
                  const getNotificationIcon = () => {
                    const title = (notification.title || '').toLowerCase();
                    const message = (notification.message || '').toLowerCase();
                    
                    if (title.includes('lead') || message.includes('lead')) {
                      return (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      );
                    }
                    if (title.includes('property') || message.includes('property') || title.includes('sold') || title.includes('listing')) {
                      return (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                      );
                    }
                    if (title.includes('broker') || title.includes('connection') || title.includes('transfer')) {
                      return (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      );
                    }
                    return (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                    );
                  };

                  return (
                    <div
                      key={notification.id}
                      className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                        notification.unread ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        {getNotificationIcon()}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`text-[14px] font-semibold ${
                                  notification.unread ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h3>
                                {notification.unread && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 animate-pulse"></span>
                                )}
                              </div>
                              {notification.message && (
                                <p className="text-[13px] text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                              )}
                            </div>
                            {/* Time - Right Side */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-[12px] text-gray-500 whitespace-nowrap">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              {/* Footer Actions
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <button 
                    onClick={async () => {
                      await markAllAsRead();
                    }}
                    className="w-full text-center text-[13px] text-[#0d542b] font-medium py-2 hover:text-[#0B4624] transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              )} */}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NotificationsPage;

