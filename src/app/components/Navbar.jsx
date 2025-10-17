'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { FaSearch, FaTimes, FaBell } from 'react-icons/fa';

import shopData from '../data/shop.json';
import relatedProducts from '../data/relatedProduct.json';
import furnitureData from '../data/furnitureData.json';

// TODO: put your WhatsApp number
const CHAT_URL =
  'https://wa.me/919999999999?text=Hi%2C%20I%20need%20help%20on%20Broker%20Adda';

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

  const notifications = [
    { id: 1, title: 'New Lead Received', message: 'You have received a new lead for a 3BHK apartment in Mumbai', time: '2 minutes ago', unread: true },
    { id: 2, title: 'Property Inquiry', message: 'Customer interested in your commercial property listing', time: '1 hour ago', unread: true },
    { id: 3, title: 'Lead Transfer', message: 'A lead has been shared with you by another broker', time: '3 hours ago', unread: false },
    { id: 4, title: 'Profile Update Required', message: 'Please complete your broker profile to get more visibility', time: '1 day ago', unread: false },
  ];

  useEffect(() => setIsMounted(true), []);

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

  const goPropertiesWithQuery = (q) => {
    const params = new URLSearchParams({ search: q, openSearch: '1' });
    router.push(`/properties?${params.toString()}`);
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
            aria-label="Broker Adda Home"
          >
            <span className="rounded-full overflow-hidden">
              <img
                src="/images/House and Handshake Logo (1).png"
                alt="Broker Adda"
                className="w-9 h-9 object-contain transition-transform group-hover:scale-[1.03]"
              />
            </span>
            <span className="text-xl font-semibold text-gray-800 cursor-pointer">
              {data?.logo?.text || 'Broker Adda'}
            </span>
          </button>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-lg mx-4 search-container relative">
            <form onSubmit={(e) => e.preventDefault()} className="relative" role="search">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1 rounded-full border border-gray-300 hover:border-gray-400 transition"
                onClick={() => searchQuery && goPropertiesWithQuery(searchQuery)}
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
            {/* List Property — NEW */}
            <Link
              href="/list-property"
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

            {/* Chat - keep button, change icon to property */}
            <a
              href={CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:border-[#0d542b] hover:text-[#0d542b] hover:shadow-sm transition"
              aria-label="Chat with support"
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
    <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4A8.5 8.5 0 0 1 12 20a8.38 8.38 0 0 1-3.1-.6L3 21l1.6-4.5A8.5 8.5 0 0 1 3 11.5a8.5 8.5 0 0 1 8.5-8.5h1A8.5 8.5 0 0 1 21 11.5z" />
    <circle cx="8" cy="11" r="1" />
    <circle cx="12" cy="11" r="1" />
    <circle cx="16" cy="11" r="1" />
  </svg>
              <span>Chat</span>
            </a>

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
                              <p className="text-sm text-gray-600 mt-1">{n.message}</p>
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
                              <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Dashboard
                              </Link>
                              <Link href="/profile?mode=view" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Profile
                              </Link>
                        {user.role === 'broker' ? (
                          <>
                              <Link href="/leads" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Leads
                              </Link>
                              <Link href="/properties-management" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Properties
                              </Link>
                            </>
                          ) : (
                              <Link href="/saved-properties" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                Saved Properties
                              </Link>
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

          {/* Mobile CTAs */}
          <li>
            <Link
              href="/list-property"
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
          </li>
          <li>
            <a
              href={CHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center px-4 py-2 rounded-full border border-gray-300 hover:border-[#0d542b] hover:text-[#0d542b]"
            >
              💬&nbsp;Chat
            </a>
          </li>

          {isMounted && (
            <>
              {user ? (
                <>
                  <li>
                    <Link href="/dashboard" className="block px-1 py-1 rounded hover:bg-gray-50">
                      Dashboard
                    </Link>
                  </li>
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
