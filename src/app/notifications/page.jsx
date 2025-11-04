'use client';

import React, { useState } from 'react';
import HeaderFile from '../components/Header';
import ProtectedRoute from '../components/ProtectedRoute';

const NotificationsPage = () => {
  // Hardcoded notifications
  const notifications = [
    { id: 1, title: 'New Lead Received', message: 'You have received a new lead for a 3BHK apartment in Mumbai', time: '2 minutes ago', unread: true },
    { id: 2, title: 'Property Inquiry', message: 'Customer interested in your commercial property listing', time: '1 hour ago', unread: true },
    { id: 3, title: 'Lead Transfer', message: 'A lead has been shared with you by another broker', time: '3 hours ago', unread: true },
    { id: 4, title: 'Profile Update Required', message: 'Please complete your broker profile to get more visibility', time: '1 day ago', unread: false },
    { id: 5, title: 'New Connection Request', message: 'Rajesh Kumar wants to connect with you', time: '2 days ago', unread: false },
    { id: 6, title: 'Property Sold', message: 'Congratulations! Your property listing has been sold', time: '3 days ago', unread: false },
    { id: 7, title: 'Payment Received', message: 'Payment of ₹50,000 has been received for property commission', time: '4 days ago', unread: false },
  ];

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Notifications List */}
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
                        <p className="text-[14px] text-gray-600 mt-1">
                          {notification.message}
                        </p>
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
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default NotificationsPage;

