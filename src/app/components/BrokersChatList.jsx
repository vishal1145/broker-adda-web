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
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { user } = useAuth();
  const [brokers, setBrokers] = useState([]);
  const [isLeadShareModalOpen, setIsLeadShareModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const messageDate = moment(dateString);
    const now = moment();
    const diffInMinutes = now.diff(messageDate, 'minutes');
    const diffInHours = now.diff(messageDate, 'hours');
    const diffInDays = now.diff(messageDate, 'days');
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

  useEffect(() => {
    const currentUserId = localStorage.getItem('brokerId');
    setCurrentUserId(currentUserId);

    try {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://broker-adda-be.algofolks.com';

      socketRef.current = io(socketUrl, {
        auth: { token: localStorage.getItem('token'), userId: currentUserId },
      });

      socketRef.current.on('message', (msg) => {
        setMessages(prev => {
          // Check if this is an update to a temporary message (same text, same from, recent)
          const tempIndex = prev.findIndex(m =>
            m._id?.startsWith('temp-') &&
            m.text === msg.text &&
            m.from === msg.from &&
            Date.now() - new Date(m.createdAt).getTime() < 5000 // Within 5 seconds
          );

          if (tempIndex !== -1) {
            // Replace temporary message with real one
            const updated = [...prev];
            updated[tempIndex] = msg;
            return updated;
          }

          // Check for duplicates by _id
          const exists = prev.some(m => m._id === msg._id);
          if (exists) {
            return prev;
          }

          // Add new message
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
    console.log('Current user:', json.data);
    setCurrentUser(json.data);

    const leadsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/all/${json.data.additionalDetails._id
      }`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    });

    const leadsJson = await leadsRes.json();
    console.log('Leads:', leadsJson.data);
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
      console.log('Chat ID:', data);
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
    console.log('Chats brokers:', json);
    if (json.success) {
      setBrokers(json.data);
    }
  };

  const sendMessage = () => {
    // if (!text.trim()) {
    //   return;
    // }
    console.log("sending")

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

    const messageText = text.trim();
    setText('');

    // Create local message immediately for instant feedback
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

    console.log('Message data:', messageData);

    socketRef.current.emit('send_message', messageData);

    // Clear selected leads after sending
    setSelectedLeads([]);
  };

  useEffect(() => {
  }, [selectedBroker]);

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
    // Selected leads will be added to attachments when sending message
  };

  const handleCancelLeadShare = () => {
    setIsLeadShareModalOpen(false);
    setSelectedLeads([]);
  };

  const handleAttachFile = () => {
    console.log('Attach file');
  }

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
            <p className="text-xs text-gray-900">Phone: {lead.customerPhone}</p>
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
          className="fixed justify-between bottom-0 w-60 right-0 z-50 bg-white shadow-lg rounded-lg border border-gray-200 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 cursor-pointer hover:shadow-xl transition-all duration-200"
          onClick={toggleExpand}
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex-shrink-0 flex items-center justify-center">
              {currentUser?.additionalDetails?.brokerImage ? (
                <img className='rounded-full object-cover h-full w-full' src={currentUser?.additionalDetails?.brokerImage} alt="Logo" />
              ) : (
                <img className='rounded-full object-cover h-full w-full' src="https://www.vhv.rs/dpng/d/312-3120300_default-profile-hd-png-download.png" alt="Logo" />
              )}

            </div>
            <span className="text-sm font-medium text-gray-900 hidden sm:inline">Messaging</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>

        </div>
      )}

      {isExpanded && user && (
        <div className="fixed bottom-0 justify-between right-0 w-[calc(100vw-2rem)] md:w-80 h-[500px] md:h-[600px] bg-white shadow-2xl rounded-lg border border-gray-200 z-50 flex flex-col overflow-hidden animate-slide-left">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex-shrink-0 flex items-center justify-center">
                {currentUser?.additionalDetails?.brokerImage ? (
                  <img className='rounded-full object-cover h-full w-full' src={currentUser?.additionalDetails?.brokerImage} alt="Logo" />
                ) : (
                  <img className='rounded-full object-cover h-full w-full' src="https://www.vhv.rs/dpng/d/312-3120300_default-profile-hd-png-download.png" alt="Logo" />
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
                placeholder="Search messages"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {brokers.map((broker) => (
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
                        {broker.participants[0]?.name?.charAt(0)} df
                      </div>
                    )}
                  </div>
                   <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm mt-1 truncate">{broker.participants[0]?.name}</h4>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{broker.lastMessage?.text}</p>
                </div>
                </div>

               

                <div className="text-xs text-gray-500 flex-shrink-0">
                  {formatMessageTime(broker.lastMessage?.createdAt)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedBroker && user && (
        <div className="fixed bottom-0 mr-2 right-0 md:right-80 w-[calc(100vw-320px)] md:w-[450px] h-[500px] md:h-[600px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col overflow-hidden animate-slide-left">
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                              <div className="inline-block rounded-2xl px-4 py-2 bg-green-500 text-white max-w-md">
                                <p className="text-sm">{message.text}</p>
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
                                <p className="text-sm text-gray-900">{message.text}</p>
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
              <div className="flex items-center gap-2 relative">
                <div className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500"></div>
                <button onClick={() => handleAttachFile()} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button onClick={() => handleLeadShare()} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 bg-gray-100 rounded-xl">
                <textarea
                  onChange={(e) => { setText(e.target.value); socketRef.current.emit('typing', { chatId, isTyping: true }); }}
                  placeholder="Write a message..."
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0"
                  rows="1"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  value={text}
                />
              </div>

              <button onClick={sendMessage} className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors">
                <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Lead Share Modal */}

            {isLeadShareModalOpen && (
              <>
                {/* Modal */}
                <div
                  className="bg-white rounded-lg shadow-xl w-[300px] h-[400px] flex flex-col absolute top-[-400px] left-[20px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
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

                  {/* Lead List */}
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
                              <div className="flex items-start gap-3">
                                {/* Checkbox */}
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
                                  <h3 className="font-semibold text-gray-900 text-xs">{lead.customerName}</h3>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleConfirmLeadShare}
                        className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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

