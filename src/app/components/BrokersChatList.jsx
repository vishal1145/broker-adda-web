'use client';

import React, { useState, useRef } from 'react';
import io from 'socket.io-client';
import { useEffect } from 'react';
import moment from 'moment';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const BrokersChatList = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [chatId, setChatId] = useState(null);
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { user } = useAuth();
  const [brokers, setBrokers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLeadShareModalOpen, setIsLeadShareModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const messageDate = moment(dateString);
    const now = moment();
    const diffInMinutes = now.diff(messageDate, 'minutes');
    const diffInHours = now.diff(messageDate, 'hours');
    if (diffInMinutes < 1) {
      return 'Just now';
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    if (messageDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
      return 'yesterday';
    }
    if (messageDate.isSame(now, 'day')) {
      return 'today';
    }
    return messageDate.format('DD/MM/YYYY');
  };

  const maskEmail = (text) => {
    if (!text) return text;
    // Regex to match email addresses
    // Pattern: username@domain.com
    return text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, (match) => {
      const [username, domain] = match.split('@');
      // Keep first 2 characters of username, mask the rest
      const maskedUsername = username.length > 2 
        ? username.substring(0, 2) + 'X'.repeat(Math.max(0, username.length - 2))
        : 'XX';
      // Keep first 2 characters of domain, mask the rest
      const domainParts = domain.split('.');
      const domainName = domainParts[0];
      const domainExtension = domainParts.slice(1).join('.');
      const maskedDomain = domainName.length > 2
        ? domainName.substring(0, 2) + 'X'.repeat(Math.max(0, domainName.length - 2))
        : 'XX';
      return `${maskedUsername}@${maskedDomain}.${domainExtension}`;
    });
  };

  const maskPhoneNumber = (text) => {
    if (!text) return text;
    // Regex to match exactly 10 consecutive digits (phone number)
    // Using word boundaries to ensure it's a standalone 10-digit number
    return text.replace(/\b\d{10}\b/g, (match) => {
      // Keep first 4 digits, mask the rest with X
      return match.substring(0, 4) + 'XXXXXX';
    });
  };

  const maskSensitiveData = (text) => {
    // If user has active subscription, don't mask anything
    if (hasActiveSubscription) {
      return text;
    }
    // Otherwise, mask both phone numbers and emails
    if (!text) return text;
    let maskedText = maskPhoneNumber(text);
    maskedText = maskEmail(maskedText);
    return maskedText;
  };

  useEffect(() => {
    const currentUserId = localStorage.getItem('brokerId');
    setCurrentUserId(currentUserId);

    try {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ;

      socketRef.current = io(socketUrl, {
        auth: { token: localStorage.getItem('token'), userId: currentUserId },
      });

      socketRef.current.on('message', (msg) => {
        setMessages(prev => {
          const tempIndex = prev.findIndex(m =>
            m._id?.startsWith('temp-') &&
            m.text === msg.text &&
            m.from === msg.from &&
            Date.now() - new Date(m.createdAt).getTime() < 5000 
          );

          if (tempIndex !== -1) {
            const updated = [...prev];
            updated[tempIndex] = msg;
            return updated;
          }

          const exists = prev.some(m => m._id === msg._id);
          if (exists) {
            return prev;
          }

          return [...prev, msg];
        });
      });

      socketRef.current.on('typing', ({ userId, isTyping }) => {
        setTyping(isTyping ? userId : false);
        setTimeout(() => {
          setTyping(false);
        }, 5000);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && chatId) {
      socketRef.current.emit('open_chat', { chatId });
    }
    fetchChats();
    fetchCurrentUser();
  }, [chatId, user]);

  if (typeof window !== 'undefined') {
    window.openChatWithBroker = (brokerData) => {
      setSelectedBroker(brokerData.broker);
      createChatId(brokerData.broker._id);
    };
  }

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });

    const json = await res.json();
    setCurrentUser(json.data);    
    // Check subscription status with error handling
    try {
      const subscription = json.data?.additionalDetails?.subscription;
      const isActive = subscription && subscription.status === 'active';
      setHasActiveSubscription(isActive);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    }

    const leadsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/all/${json.data.additionalDetails._id
      }`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });

    const leadsJson = await leadsRes.json();
    setAllLeads(leadsJson.data.leads);
  }

  const initiateChat = (broker) => {
    setSelectedBroker(broker);
    createChatId(broker._id);
  };

  const createChatId = async (brokerId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ participants: [currentUserId, brokerId] })
      });
      if (!response.ok) {
        throw new Error('Failed to create chat ID');
      }
      const data = await response.json();
      setChatId(data.chatId);

      const msgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats/${data.chatId}/messages`, {
        headers,
      });

      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setMessages(msgData.messages || []);
      } else {
        console.warn('Failed to fetch old messages');
      }

    } catch (error) {
      console.error('Error creating chat ID:', error);
    }
  }

  const fetchChats = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });
    const json = await res.json();
    if (json.success) {
      setBrokers(json.data);
    }
  };

  const sendMessage = () => {
    if (!currentUserId) {
      console.error('Current user ID is not available');
      return;
    }

    if (!selectedBroker) {
      console.error('No broker selected');
      return;
    }

    if (!chatId) {
      console.error('No chatId available');
      return;
    }

    let messageText = text.trim();
    
    // If user doesn't have active subscription, mask sensitive data before sending
    // if (!hasActiveSubscription) {
    //   messageText = maskSensitiveData(messageText);
    // }
    
    setText('');

    const localMessage = {
      _id: `temp-${Date.now()}`,
      chatId,
      from: currentUserId,
      to: selectedBroker._id || selectedBroker.id,
      text: messageText,
      attachments: [] || null,
      leadCard: selectedLeads.length > 0 ? selectedLeads : null,
      status: 'sending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, localMessage]);

    if (!socketRef.current || !socketRef.current.connected) {
      console.error('Socket is not connected! Message saved locally only.');
      return;
    }

    const messageData = {
      chatId,
      to: selectedBroker._id,
      text: messageText,
      attachments: [] || null,
      leadCard: selectedLeads.length > 0 ? selectedLeads : null
    };


    socketRef.current.emit('send_message', messageData);

    setSelectedLeads([]);
  };

  useEffect(() => {
    if (selectedBroker) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedBroker]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  const handleLeadShare = () => {
    setIsLeadShareModalOpen(true);
  };

  const handleLeadSelect = (lead) => {
    setSelectedLeads(prev => {
      const isSelected = prev.some(l => l._id === lead._id);
      if (isSelected) {
        return prev.filter(l => l._id !== lead._id);
      } else {
        return [...prev, lead];
      }
    });
  };

  const handleConfirmLeadShare = () => {
    sendMessage()
    setIsLeadShareModalOpen(false);
  };

  const handleCancelLeadShare = () => {
    setIsLeadShareModalOpen(false);
    setSelectedLeads([]);
  };

  // const handleAttachFile = () => {
  // }

  const openLeadPage = () => {
    setSelectedBroker(null);
    toggleExpand();
  }

  const LeadCard = ({ lead }) => {
    
    return (
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="inline-block bg-amber-100 rounded px-4 py-2 border border-gray-200 max-w-md">
            <p className="text-xs text-gray-900">Name: {lead.customerName}</p>
            <p className="text-xs text-gray-900">Budget: {lead.budget}</p>
            <p className="text-xs text-gray-900">Phone: {maskSensitiveData(lead.customerPhone || '')}</p>
            {lead.customerEmail && (
              <p className="text-xs text-gray-900">Email: {maskSensitiveData(lead.customerEmail)}</p>
            )}
            <Link href={`/lead-details/${lead._id}`} onClick={() => openLeadPage()} className="text-xs text-sky-900">View Details</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {isExpanded && user && (
        <div
          className="fixed inset-0 bg-opacity-30 z-40"
          onClick={toggleExpand}
        />
      )}

      {user && (
        <div
          className="fixed bottom-3 right-3 md:bottom-0 md:right-0 w-12 h-12 md:w-48 md:h-auto z-50 bg-white shadow-lg  border border-gray-200 flex items-center justify-center md:justify-between gap-0 md:gap-2 lg:gap-2.5 p-0 md:px-2.5 md:py-1.5 lg:px-3 lg:py-2 cursor-pointer hover:shadow-xl transition-all duration-200"
          onClick={toggleExpand}
        >
          <div className="flex items-center gap-2 md:gap-2 lg:gap-2.5">
            {/* Mobile: Show Logo */}
            <div className="w-12 h-12 md:hidden rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-gray-200 p-1.5">
              <img 
                className='rounded-full object-contain h-full w-full' 
                src="/BROKER_GULLY_FINAL_LOGO_ICON_JPG__1_-removebg-preview.png" 
                alt="Broker Gully Logo" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            {/* Desktop: Show Broker Image */}
            <div className="hidden md:flex w-5 h-5 lg:w-5 lg:h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex-shrink-0 items-center justify-center">
              {currentUser?.additionalDetails?.brokerImage ? (
                <img className='rounded-full object-cover h-full w-full' src={currentUser?.additionalDetails?.brokerImage} alt="Broker" />
              ) : (
                <img className='rounded-full object-cover h-full w-full' src="https://www.vhv.rs/dpng/d/312-3120300_default-profile-hd-png-download.png" alt="Broker" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-900 hidden md:inline">Messaging</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform duration-200 hidden md:block ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>

        </div>
      )}

      {isExpanded && user && (
        <div className="fixed bottom-0 justify-between right-0 w-[calc(100vw-2rem)]  md:w-80 h-[calc(100vh-6rem)] max-h-[600px] bg-white shadow-2xl rounded-lg border border-gray-200 z-50 flex flex-col overflow-hidden animate-slide-left">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {/* Mobile: Show Logo */}
              <div className="w-10 h-10 md:hidden rounded-full bg-white flex-shrink-0 flex items-center justify-center border border-gray-200 p-1.5">
                <img 
                  className='rounded-full object-contain h-full w-full' 
                  src="/BROKER_GULLY_FINAL_LOGO_ICON_JPG__1_-removebg-preview.png" 
                  alt="Broker Gully Logo" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              {/* Desktop: Show Broker Image */}
              <div className="hidden md:flex w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex-shrink-0 items-center justify-center">
                {currentUser?.additionalDetails?.brokerImage ? (
                  <img className='rounded-full object-cover h-full w-full' src={currentUser?.additionalDetails?.brokerImage} alt="Broker" />
                ) : (
                  <img className='rounded-full object-cover h-full w-full' src="https://www.vhv.rs/dpng/d/312-3120300_default-profile-hd-png-download.png" alt="Broker" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Messaging</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleExpand}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search brokers"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {(() => {
              const filteredBrokers = brokers.filter((broker) => {
                if (!search.trim()) return true;
                const brokerName = broker.participants[0]?.name?.toLowerCase() || '';
                const searchTerm = search.toLowerCase().trim();
                return brokerName.includes(searchTerm);
              });

              if (filteredBrokers.length === 0 && search.trim()) {
                return (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">No brokers found matching &quot;{search}&quot;</p>
                  </div>
                );
              }

              if (filteredBrokers.length === 0) {
                return (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">No brokers yet</p>
                  </div>
                );
              }

              return filteredBrokers.map((broker) => (
                <button
                  key={broker.chatId}
                  onClick={() => initiateChat(broker?.participants[0])}
                  className={`w-full flex justify-between items-end gap-3 p-4 transition-colors border-b border-gray-100 last:border-b-0 ${selectedBroker?._id === broker.participants[0]?._id ? 'bg-green-50' : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="relative flex-shrink-0 flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 overflow-hidden">
                      {broker.participants[0]?.brokerImage ? (
                        <img
                          src={broker.participants[0]?.brokerImage}
                          alt={broker.participants[0]?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement;
                            if (fallback) {
                              fallback.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white font-semibold text-sm">${broker.name.charAt(0)}</div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                          {broker.participants[0]?.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm mt-1 truncate">{broker.participants[0]?.name}</h4>
                      </div>
                      {broker?.lastMessage?.text && (
                        <p className="text-xs text-gray-400 truncate">{maskSensitiveData(broker.lastMessage?.text)}</p>
                      )}
                      {broker?.lastMessage?.leadCards?.length > 0 && (
                        <p className="text-xs text-gray-400 truncate">Lead Shared</p>
                      )}
                      {broker?.lastMessage?.attachments?.length > 0 && (
                        <p className="text-xs text-gray-400 truncate">Attachments</p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 flex-shrink-0">
                    {formatMessageTime(broker.lastMessage?.createdAt)}
                  </div>
                </button>
              ));
            })()}
          </div>
        </div>
      )}

      {selectedBroker && user && (
        <div className="fixed bottom-0 mr-2 right-0 md:right-80 w-[calc(100vw-340px)] sm:w-[calc(100vw-320px)] md:w-[450px] h-[calc(100vh-6rem)] max-h-[600px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col overflow-hidden animate-slide-left">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 overflow-hidden">
                  {selectedBroker.brokerImage ? (
                    <img
                      src={selectedBroker.brokerImage}
                      alt={selectedBroker?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-900 font-semibold text-sm">
                      {selectedBroker?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${selectedBroker.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">{selectedBroker.name}</h3>
                <p className="text-sm text-gray-500">{typing ? 'Typing...' : 'Active Now'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSelectedBroker(null)}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isMyMessage = message.from === currentUserId;
                const messageDate = new Date(message.createdAt);
                const prevMessageDate = index > 0 ? new Date(messages[index - 1].createdAt) : null;
                const showDateSeparator = !prevMessageDate ||
                  messageDate.toDateString() !== prevMessageDate.toDateString();

                return (
                  <React.Fragment key={message._id || index}>
                    {showDateSeparator && (
                      <div className="relative flex items-center py-2">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-xs font-medium text-gray-500 uppercase">
                          {messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>
                    )}

                    {isMyMessage ? (
                      <div>
                        {message.text && (
                          <div className="flex gap-2 flex-row-reverse">
                            <div className="flex-1 flex justify-end">
                              <div className="flex items-end gap-2 rounded-2xl px-4 py-2 bg-green-500 text-white max-w-md">
                                <p className="text-sm">{maskSensitiveData(message.text)}</p>
                                <span className="text-[10px]">
                                  {moment(message.createdAt).format('HH:mm')}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {message.leadCards && message.leadCards.map((lead) => (
                          <div className="flex gap-2 flex-row-reverse">
                            <div className="flex-1 flex justify-end">
                              <LeadCard lead={lead} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        {message.text && (
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <div className="inline-block rounded-2xl px-4 py-2 bg-white border border-gray-200 max-w-md">
                                <p className="text-sm text-gray-900">{maskSensitiveData(message.text)}</p>
                              </div>
                            </div>

                          </div>
                        )}
                        <div>
                          {message.leadCards && message.leadCards.map((lead) => (
                            <LeadCard lead={lead} />
                          ))}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-200 p-4 bg-white relative">
            <div className="flex items-center gap-2">
              <div onClick={() => handleLeadShare()}  className="flex items-center gap-2 relative cursor-pointer">
                <div className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500"></div>
                {/* <button onClick={() => handleAttachFile()} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button> */}
                <button className="text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 bg-gray-100 rounded-xl">
                <input
                  onChange={(e) => { setText(e.target.value); socketRef.current.emit('typing', { chatId, isTyping: true }); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && text.trim().length > 0) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Write a message..."
                  className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0"
                  value={text}
                />
              </div>

              <button 
                onClick={sendMessage} 
                disabled={text.trim().length === 0}
                className={`p-2 rounded-lg transition-colors ${
                  text.trim().length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                } text-white`}
              >
                <svg className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {isLeadShareModalOpen && (
              <>
                <div
                  className="bg-white rounded-lg shadow-xl w-[calc(100%-2.5rem)] sm:w-[300px] max-h-[50vh] sm:max-h-[400px] h-auto min-h-[200px] flex flex-col absolute bottom-full left-[20px] mb-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-sm font-semibold text-gray-900">Share Lead</h2>
                    <button
                      onClick={handleCancelLeadShare}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4 text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {allLeads.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No leads available</p>
                    ) : (
                      <div className="space-y-3">
                        {allLeads.map((lead) => {
                          const isSelected = selectedLeads.some(l => l._id === lead._id);
                          return (
                            <div
                              key={lead._id}
                              onClick={() => handleLeadSelect(lead)}
                              className={`p-2 border-2 rounded-lg cursor-pointer transition-all ${isSelected
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300'
                                  }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-xs leading-none">
                                    {lead.customerName}
                                  </h3>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleConfirmLeadShare}
                        className="px-3 text-sm py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={selectedLeads.length === 0}
                      >
                        Send Leads
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}


    </>
  );
};

export default BrokersChatList;

