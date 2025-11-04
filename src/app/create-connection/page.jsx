'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HeaderFile from '../components/Header';
import ProtectedRoute from '../components/ProtectedRoute';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || localStorage.getItem('authToken')
        : null;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://broker-adda-be.algofolks.com/api';
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const response = await fetch(`${apiUrl}/chats`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }

      const data = await response.json();
      console.log('Connections data:', data);
      
      // Handle different response structures
      let connectionsList = [];
      if (Array.isArray(data?.data)) {
        connectionsList = data.data;
      } else if (Array.isArray(data?.connections)) {
        connectionsList = data.connections;
      } else if (Array.isArray(data?.chats)) {
        connectionsList = data.chats;
      } else if (data?.data?.chats && Array.isArray(data.data.chats)) {
        connectionsList = data.data.chats;
      } else if (data?.data?.connections && Array.isArray(data.data.connections)) {
        connectionsList = data.data.connections;
      }

      setConnections(connectionsList);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('Failed to load connections. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getBrokerData = (connection) => {
    // Handle different API response structures
    const participant = connection?.participants?.[0] || connection?.participant || connection?.broker || connection;
    
    return {
      name: participant?.name || participant?.fullName || participant?.email || 'Unknown',
      firmName: participant?.firmName || participant?.companyName || participant?.firm || '',
      status: participant?.status || connection?.status || 'Active',
      brokerImage: participant?.brokerImage || participant?.profileImage || participant?.image || null,
      email: participant?.email || '',
      brokerId: participant?._id || participant?.id || participant?.userId || ''
    };
  };

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'verified' || statusLower === 'active') {
      return 'bg-green-50 text-green-900 border-green-200';
    }
    if (statusLower === 'pending') {
      return 'bg-amber-50 text-amber-900 border-amber-200';
    }
    if (statusLower === 'inactive') {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    }
    return 'bg-blue-50 text-blue-900 border-blue-200';
  };

  const getInitials = (name) => {
    if (!name) return 'N';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (seed) => {
    const palette = [
      { bg: 'bg-sky-100', text: 'text-sky-800' },
      { bg: 'bg-emerald-100', text: 'text-emerald-800' },
      { bg: 'bg-violet-100', text: 'text-violet-800' },
    ];
    const s = String(seed || '');
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
    }
    return palette[hash % palette.length];
  };

  const headerData = {
    title: 'Connections',
    breadcrumb: [
      { label: 'Home', href: '/' },
      { label: 'Connections', href: '/create-connection' }
    ]
  };

  return (
    <ProtectedRoute>
      <HeaderFile data={headerData} />
      
      <div className="min-h-screen bg-white py-16">
        <div className=" mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="font-archivo text-[24px] leading-[36px] font-bold text-[#171A1FFF] mb-2">
              My Connections
            </h1>
            <p className="text-[14px] leading-[20px] font-normal text-[#565D6DFF]">
              Manage and view all your broker connections in one place.
            </p>
          </div>

          {/* Stats Bar */}
          {!isLoading && !error && connections.length > 0 && (
            <div className="mb-6 flex items-center gap-2">
              <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-[14px] font-semibold text-green-900">
                  {connections.length}
                </span>
                <span className="text-[12px] font-normal text-green-700 ml-1">
                  {connections.length === 1 ? 'Connection' : 'Connections'}
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
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
                onClick={fetchConnections}
                className="px-6 py-2.5 bg-[#0D542B] text-white rounded-xl hover:bg-[#0B4624] transition-colors text-[14px] font-semibold shadow-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && connections.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F]">
              <div className="text-gray-300 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-[18px] font-semibold text-gray-900 mb-2">No connections found</h3>
              <p className="text-[14px] text-gray-600 max-w-md mx-auto">
                You don't have any connections yet. Start building your network by connecting with other brokers.
              </p>
            </div>
          )}

          {/* Connections Grid */}
          {!isLoading && !error && connections.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((connection, index) => {
                const broker = getBrokerData(connection);
                const connectionId = connection?._id || connection?.id || connection?.chatId || index;
                const avatarColor = getAvatarColor(broker.name);
                
                return (
                  <div
                    key={connectionId}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_0_1px_#171a1f12,0_0_2px_#171a1f1F] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200"
                  >
                    {/* Full Image Section at Top */}
                    <div className="relative w-full h-64 bg-gray-100">
                      {broker.brokerImage ? (
                        <img
                          src={broker.brokerImage}
                          alt={broker.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full flex items-center justify-center text-4xl font-semibold ${avatarColor.bg} ${avatarColor.text} ${
                          broker.brokerImage ? 'hidden' : ''
                        }`}
                      >
                        {getInitials(broker.name)}
                      </div>
                      {/* Status indicator */}
                      {(broker.status === 'Verified' || broker.status === 'Active') && (
                        <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                      )}
                    </div>

                    {/* Bottom Section - All Content */}
                    <div className="p-5">
                      {/* Name */}
                      <div className="flex items-center gap-0 mb-2">
                        <h3 className="text-[16px] font-semibold text-[#171A1F]">{broker.name}</h3>
                        {broker.brokerId ? (
                          <Link href={`/broker-details/${broker.brokerId}`}>
                            <svg className="w-4 h-4 text-green-600 rotate-45 ml-2 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          </Link>
                        ) : (
                          <svg className="w-4 h-4 text-green-600 rotate-45 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        )}
                      </div>

                      {/* Specialization / Firm Name */}
                      {broker.firmName && (
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-[#565D6D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="text-[14px] font-normal text-[#171A1F]">{broker.firmName}</p>
                        </div>
                      )}

                      {/* Leads / Status */}
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#565D6D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-[13px] font-normal text-[#565D6D]">
                          {broker.status === 'Verified' ? 'Verified Broker' : broker.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Connections;
