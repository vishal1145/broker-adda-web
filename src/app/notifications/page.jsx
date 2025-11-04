'use client';

import React, { useState, useEffect } from 'react';
import HeaderFile from '../components/Header';
import ProtectedRoute from '../components/ProtectedRoute';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

 

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

  // Fetch notifications from API
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
      setError('Failed to load notifications. Please try again.');
      // Use fallback notifications on error
      setNotifications(fallbackNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

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
      
      <div className="min-h-screen bg-white py-16">
        <div className=" mx-auto px-2">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-archivo text-[24px] leading-[36px] font-bold text-[#171A1FFF]">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white text-[12px] font-semibold rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-[14px] leading-[20px] font-normal text-[#565D6DFF]">
              View and manage all your notifications
            </p>
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
            <div className="bg-white border border-gray-200 rounded-xl shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] overflow-hidden">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-300 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-semibold text-gray-900 mb-2">No notifications</h3>
                  <p className="text-[14px] text-gray-600">
                    You don't have any notifications yet.
                  </p>
                </div>
              ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors border-l-4 ${
                      notification.unread 
                        ? 'border-green-500 bg-green-50/30' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-[16px] font-semibold ${
                            notification.unread ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {notification.unread && (
                            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-400 mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {/* Footer Actions */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <button className="w-full text-center text-sm text-[#0d542b] hover:opacity-80 font-semibold py-2">
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NotificationsPage;

